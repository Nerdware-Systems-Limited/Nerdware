import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/kyClient'


/* ─── helpers ────────────────────────────────────────────────────────────── */
const getToken = () => localStorage.getItem('token') || '';

const authApi = () =>
  api.extend({ headers: { Authorization: `Bearer ${getToken()}` } });

const extractError = async (err) => {
  try {
    const body = await err?.response?.json?.();
    return body?.message || err?.message || 'Something went wrong';
  } catch {
    return err?.message || 'Something went wrong';
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PUBLIC THUNKS                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

/** GET /api/blogs */
export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async ({ page = 1, limit = 9, category, search } = {}, { rejectWithValue }) => {
    try {
      const searchParams = { page, limit };
      if (category && category !== 'All') searchParams.category = category;
      if (search) searchParams.search = search;

      const res = await api.get('blogs', { searchParams }).json();
      const blogs = res.data?.blogs || res.blogs || (Array.isArray(res) ? res : null);
      if (!blogs) return rejectWithValue('Invalid data structure from API');

      const pagination = res.data?.pagination || res.pagination || { page, limit, total: blogs.length, pages: 1 };
      return { blogs, pagination };
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** GET /api/blogs/:slug */
export const fetchBlogBySlug = createAsyncThunk(
  'blogs/fetchBlogBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const res = await api.get(`blogs/${slug}`).json();
      return res.data?.blog || res.blog || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ADMIN THUNKS (require JWT)                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */

/** POST /api/blogs — ADMIN | EDITOR */
export const createBlog = createAsyncThunk(
  'blogs/createBlog',
  async (blogData, { rejectWithValue }) => {
    try {
      const res = await authApi().post('blogs', { json: blogData }).json();
      return res.data?.blog || res.blog || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** PUT /api/blogs/:id — ADMIN | EDITOR */
export const updateBlog = createAsyncThunk(
  'blogs/updateBlog',
  async ({ id, ...blogData }, { rejectWithValue }) => {
    try {
      const res = await authApi().put(`blogs/${id}`, { json: blogData }).json();
      return res.data?.blog || res.blog || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** DELETE /api/blogs/:id — ADMIN only */
export const deleteBlog = createAsyncThunk(
  'blogs/deleteBlog',
  async (id, { rejectWithValue }) => {
    try {
      await authApi().delete(`blogs/${id}`).json();
      return id;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SLICE                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
const blogSlice = createSlice({
  name: 'blogs',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 9, total: 0, pages: 1 },
    currentPost: null,
    status: 'idle',           // list:   idle | loading | succeeded | failed
    detailStatus: 'idle',     // detail: idle | loading | succeeded | failed
    mutationStatus: 'idle',   // CRUD:   idle | loading | succeeded | failed
    error: null,
    mutationError: null,
  },
  reducers: {
    clearCurrentPost(state) {
      state.currentPost  = null;
      state.detailStatus = 'idle';
    },
    clearMutationState(state) {
      state.mutationStatus = 'idle';
      state.mutationError  = null;
    },
  },
  extraReducers: (builder) => {
    /* fetchBlogs */
    builder
      .addCase(fetchBlogs.pending,   (state)          => { state.status = 'loading';   state.error = null; })
      .addCase(fetchBlogs.fulfilled, (state, action)  => {
        state.status = 'succeeded';
        state.items = action.payload.blogs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBlogs.rejected,  (state, action)  => { state.status = 'failed';    state.error = action.payload; });

    /* fetchBlogBySlug */
    builder
      .addCase(fetchBlogBySlug.pending,   (state)         => { state.detailStatus = 'loading';   state.error = null; })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => { state.detailStatus = 'succeeded'; state.currentPost = action.payload; })
      .addCase(fetchBlogBySlug.rejected,  (state, action) => { state.detailStatus = 'failed';    state.error = action.payload; });

    /* createBlog */
    builder
      .addCase(createBlog.pending,   (state)         => { state.mutationStatus = 'loading';   state.mutationError = null; })
      .addCase(createBlog.fulfilled, (state, action) => { state.mutationStatus = 'succeeded'; state.items.unshift(action.payload); })
      .addCase(createBlog.rejected,  (state, action) => { state.mutationStatus = 'failed';    state.mutationError = action.payload; });

    /* updateBlog */
    builder
      .addCase(updateBlog.pending,   (state)         => { state.mutationStatus = 'loading';   state.mutationError = null; })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentPost?.id === action.payload.id) state.currentPost = action.payload;
      })
      .addCase(updateBlog.rejected,  (state, action) => { state.mutationStatus = 'failed';    state.mutationError = action.payload; });

    /* deleteBlog */
    builder
      .addCase(deleteBlog.pending,   (state)         => { state.mutationStatus = 'loading';   state.mutationError = null; })
      .addCase(deleteBlog.fulfilled, (state, action) => { state.mutationStatus = 'succeeded'; state.items = state.items.filter((b) => b.id !== action.payload); })
      .addCase(deleteBlog.rejected,  (state, action) => { state.mutationStatus = 'failed';    state.mutationError = action.payload; });
  },
});

export const { clearCurrentPost, clearMutationState } = blogSlice.actions;

/* ─── Selectors ──────────────────────────────────────────────────────────── */
export const selectAllBlogs       = (state) => state.blogs.items;
export const selectBlogsPagination = (state) => state.blogs.pagination;
export const selectCurrentPost    = (state) => state.blogs.currentPost;
export const selectBlogsStatus    = (state) => state.blogs.status;
export const selectDetailStatus   = (state) => state.blogs.detailStatus;
export const selectMutationStatus = (state) => state.blogs.mutationStatus;
export const selectBlogsError     = (state) => state.blogs.error;
export const selectMutationError  = (state) => state.blogs.mutationError;

export default blogSlice.reducer;