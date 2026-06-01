import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/kyClient';

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
/*  THUNKS                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

/** GET /api/blogs/:blogId/comments */
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ blogId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`blogs/${blogId}/comments`, {
        searchParams: { page, limit },
      }).json();
      const comments = res.data?.comments || res.comments || [];
      const pagination = res.data?.pagination || res.pagination || null;
      return { blogId, comments, pagination, page };
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** GET /api/blogs/:blogId/comments/:commentId/replies */
export const fetchReplies = createAsyncThunk(
  'comments/fetchReplies',
  async ({ blogId, commentId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`blogs/${blogId}/comments/${commentId}/replies`, {
        searchParams: { page, limit },
      }).json();
      const replies = res.data?.replies || res.replies || [];
      const pagination = res.data?.pagination || res.pagination || null;
      return { blogId, commentId, replies, pagination, page };
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** POST /api/blogs/:blogId/comments */
export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ blogId, body, parentId = null }, { rejectWithValue }) => {
    try {
      const payload = parentId ? { body, parentId } : { body };
      const res = await authApi().post(`blogs/${blogId}/comments`, {
        json: payload,
      }).json();
      const comment = res.data?.comment || res.comment || res;
      return { blogId, comment, parentId };
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** PUT /api/blogs/:blogId/comments/:commentId */
export const editComment = createAsyncThunk(
  'comments/editComment',
  async ({ blogId, commentId, body }, { rejectWithValue }) => {
    try {
      const res = await authApi().put(`blogs/${blogId}/comments/${commentId}`, {
        json: { body },
      }).json();
      const comment = res.data?.comment || res.comment || res;
      return { blogId, commentId, comment };
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** DELETE /api/blogs/:blogId/comments/:commentId */
export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async ({ blogId, commentId, parentId = null }, { rejectWithValue }) => {
    try {
      await authApi().delete(`blogs/${blogId}/comments/${commentId}`).json();
      return { blogId, commentId, parentId };
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** POST /api/blogs/:blogId/comments/:commentId/like */
export const toggleCommentLike = createAsyncThunk(
  'comments/toggleLike',
  async ({ blogId, commentId }, { rejectWithValue }) => {
    try {
      const res = await authApi().post(`blogs/${blogId}/comments/${commentId}/like`).json();
      const data = res.data || res;
      return { blogId, commentId, liked: data.liked, likeCount: data.likeCount };
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SLICE                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    // keyed by blogId → array of top-level comments
    byBlog: {},
    // keyed by `${blogId}_${commentId}` → array of replies
    replies: {},
    // keyed by blogId → pagination object
    pagination: {},
    // keyed by `${blogId}_${commentId}` → pagination for replies
    repliesPagination: {},
    // keyed by blogId → status string
    status: {},
    // keyed by `${blogId}_${commentId}` → status for replies
    repliesStatus: {},
    // Add/edit/delete mutation statuses (single global-ish state)
    addStatus: 'idle',
    addError: null,
    editStatus: 'idle',
    editError: null,
    deleteStatus: 'idle',
    deleteError: null,
    likeStatus: {}, // keyed by commentId
  },
  reducers: {
    clearAddState(state) {
      state.addStatus = 'idle';
      state.addError = null;
    },
    clearEditState(state) {
      state.editStatus = 'idle';
      state.editError = null;
    },
    clearDeleteState(state) {
      state.deleteStatus = 'idle';
      state.deleteError = null;
    },
    clearCommentStatus(state, action) {
      const blogId = action.payload;
      if (state.status[blogId]) state.status[blogId] = 'idle';
    },
  },
  extraReducers: (builder) => {
    /* ── fetchComments ────────────────────────────────────────────────────── */
    builder
      .addCase(fetchComments.pending, (state, action) => {
        const blogId = action.meta.arg.blogId;
        state.status[blogId] = 'loading';
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { blogId, comments, pagination, page } = action.payload;
        state.status[blogId] = 'succeeded';
        if (page === 1) {
          state.byBlog[blogId] = comments;
        } else {
          const existing = state.byBlog[blogId] || [];
          state.byBlog[blogId] = [...existing, ...comments];
        }
        state.pagination[blogId] = pagination;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const blogId = action.meta.arg.blogId;
        state.status[blogId] = 'failed';
      });

    /* ── fetchReplies ─────────────────────────────────────────────────────── */
    builder
      .addCase(fetchReplies.pending, (state, action) => {
        const { commentId } = action.meta.arg;
        state.repliesStatus[commentId] = 'loading';
      })
      .addCase(fetchReplies.fulfilled, (state, action) => {
        const { commentId, replies, pagination, page } = action.payload;
        state.repliesStatus[commentId] = 'succeeded';
        const key = commentId;
        if (page === 1) {
          state.replies[key] = replies;
        } else {
          const existing = state.replies[key] || [];
          state.replies[key] = [...existing, ...replies];
        }
        state.repliesPagination[key] = pagination;
      })
      .addCase(fetchReplies.rejected, (state, action) => {
        const { commentId } = action.meta.arg;
        state.repliesStatus[commentId] = 'failed';
      });

    /* ── addComment ────────────────────────────────────────────────────────── */
    builder
      .addCase(addComment.pending, (state) => {
        state.addStatus = 'loading';
        state.addError = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { blogId, comment, parentId } = action.payload;
        state.addStatus = 'succeeded';
        if (parentId) {
          // It's a reply — add to replies array
          const key = parentId;
          if (!state.replies[key]) state.replies[key] = [];
          state.replies[key].unshift(comment);
          // Update reply count on parent comment
          const blogComments = state.byBlog[blogId] || [];
          const parentIdx = blogComments.findIndex((c) => c.id === parentId);
          if (parentIdx !== -1) {
            state.byBlog[blogId][parentIdx] = {
              ...state.byBlog[blogId][parentIdx],
              replyCount: (state.byBlog[blogId][parentIdx].replyCount || 0) + 1,
            };
          }
        } else {
          // Top-level comment
          if (!state.byBlog[blogId]) state.byBlog[blogId] = [];
          state.byBlog[blogId].unshift(comment);
          // Update pagination total
          if (state.pagination[blogId]) {
            state.pagination[blogId] = {
              ...state.pagination[blogId],
              total: state.pagination[blogId].total + 1,
            };
          }
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.addStatus = 'failed';
        state.addError = action.payload;
      });

    /* ── editComment ──────────────────────────────────────────────────────── */
    builder
      .addCase(editComment.pending, (state) => {
        state.editStatus = 'loading';
        state.editError = null;
      })
      .addCase(editComment.fulfilled, (state, action) => {
        const { blogId, commentId, comment } = action.payload;
        state.editStatus = 'succeeded';
        // Update in top-level comments
        const blogComments = state.byBlog[blogId] || [];
        const idx = blogComments.findIndex((c) => c.id === commentId);
        if (idx !== -1) state.byBlog[blogId][idx] = comment;
        // Update in replies
        for (const key in state.replies) {
          const replyIdx = (state.replies[key] || []).findIndex((c) => c.id === commentId);
          if (replyIdx !== -1) state.replies[key][replyIdx] = comment;
        }
      })
      .addCase(editComment.rejected, (state, action) => {
        state.editStatus = 'failed';
        state.editError = action.payload;
      });

    /* ── deleteComment ─────────────────────────────────────────────────────── */
    builder
      .addCase(deleteComment.pending, (state) => {
        state.deleteStatus = 'loading';
        state.deleteError = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { blogId, commentId, parentId } = action.payload;
        state.deleteStatus = 'succeeded';
        if (parentId) {
          // Deleting a reply
          const key = parentId;
          state.replies[key] = (state.replies[key] || []).filter((c) => c.id !== commentId);
          // Decrement reply count on parent
          const blogComments = state.byBlog[blogId] || [];
          const parentIdx = blogComments.findIndex((c) => c.id === parentId);
          if (parentIdx !== -1) {
            state.byBlog[blogId][parentIdx] = {
              ...state.byBlog[blogId][parentIdx],
              replyCount: Math.max(0, (state.byBlog[blogId][parentIdx].replyCount || 1) - 1),
            };
          }
        } else {
          // Deleting top-level comment — remove from byBlog and clear its replies
          state.byBlog[blogId] = (state.byBlog[blogId] || []).filter((c) => c.id !== commentId);
          // Decrement pagination total
          if (state.pagination[blogId]) {
            state.pagination[blogId] = {
              ...state.pagination[blogId],
              total: Math.max(0, state.pagination[blogId].total - 1),
            };
          }
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deleteError = action.payload;
      });

    /* ── toggleCommentLike ────────────────────────────────────────────────── */
    builder
      .addCase(toggleCommentLike.pending, (state, action) => {
        const { commentId } = action.meta.arg;
        state.likeStatus[commentId] = 'loading';
      })
      .addCase(toggleCommentLike.fulfilled, (state, action) => {
        const { blogId, commentId, liked, likeCount } = action.payload;
        state.likeStatus[commentId] = 'succeeded';
        // Update in top-level comments
        const blogComments = state.byBlog[blogId] || [];
        const idx = blogComments.findIndex((c) => c.id === commentId);
        if (idx !== -1) {
          state.byBlog[blogId][idx] = {
            ...state.byBlog[blogId][idx],
            likedByMe: liked,
            likeCount,
          };
        }
        // Update in replies
        for (const key in state.replies) {
          const replyIdx = (state.replies[key] || []).findIndex((c) => c.id === commentId);
          if (replyIdx !== -1) {
            state.replies[key][replyIdx] = {
              ...state.replies[key][replyIdx],
              likedByMe: liked,
              likeCount,
            };
          }
        }
      })
      .addCase(toggleCommentLike.rejected, (state, action) => {
        const { commentId } = action.meta.arg;
        state.likeStatus[commentId] = 'failed';
      });
  },
});

export const {
  clearAddState,
  clearEditState,
  clearDeleteState,
  clearCommentStatus,
} = commentSlice.actions;

/* ─── Selectors ──────────────────────────────────────────────────────────── */
export const selectCommentsByBlog = (blogId) => (state) =>
  state.comments.byBlog[blogId] || [];

export const selectCommentsPagination = (blogId) => (state) =>
  state.comments.pagination[blogId] || null;

export const selectCommentsStatus = (blogId) => (state) =>
  state.comments.status[blogId] || 'idle';

export const selectRepliesByComment = (commentId) => (state) =>
  state.comments.replies[commentId] || [];

export const selectRepliesPagination = (commentId) => (state) =>
  state.comments.repliesPagination[commentId] || null;

export const selectRepliesStatus = (commentId) => (state) =>
  state.comments.repliesStatus[commentId] || 'idle';

export const selectAddStatus = (state) => state.comments.addStatus;
export const selectAddError = (state) => state.comments.addError;

export const selectEditStatus = (state) => state.comments.editStatus;
export const selectEditError = (state) => state.comments.editError;

export const selectDeleteStatus = (state) => state.comments.deleteStatus;
export const selectDeleteError = (state) => state.comments.deleteError;

export const selectLikeStatus = (commentId) => (state) =>
  state.comments.likeStatus[commentId] || 'idle';

export default commentSlice.reducer;