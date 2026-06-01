import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/kyClient';

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

/** GET /api/testimonials  (public) */
export const fetchTestimonials = createAsyncThunk(
  'testimonials/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('testimonials').json();
      if (res.data?.testimonials) return res.data.testimonials;
      if (res.testimonials)        return res.testimonials;
      if (Array.isArray(res))      return res;
      return rejectWithValue('Invalid data structure from API');
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** POST /api/testimonials  (admin) */
export const createTestimonial = createAsyncThunk(
  'testimonials/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi().post('testimonials', { json: payload }).json();
      return res.data?.testimonial ?? res.testimonial ?? res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** PUT /api/testimonials/:id  (admin) */
export const updateTestimonial = createAsyncThunk(
  'testimonials/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await authApi().put(`testimonials/${id}`, { json: payload }).json();
      return res.data?.testimonial ?? res.testimonial ?? res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** DELETE /api/testimonials/:id  (admin) */
export const deleteTestimonial = createAsyncThunk(
  'testimonials/delete',
  async (id, { rejectWithValue }) => {
    try {
      await authApi().delete(`testimonials/${id}`).json();
      return id;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SLICE                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
const testimonialSlice = createSlice({
  name: 'testimonials',
  initialState: {
    items: [],
    status: 'idle',         // fetch: idle | loading | succeeded | failed
    error: null,
    mutationStatus: 'idle', // create | update | delete
    mutationError: null,
  },
  reducers: {
    clearMutationState(state) {
      state.mutationStatus = 'idle';
      state.mutationError  = null;
    },
  },
  extraReducers: (builder) => {
    /* fetchTestimonials */
    builder
      .addCase(fetchTestimonials.pending,   (state)         => { state.status = 'loading';   state.error = null; })
      .addCase(fetchTestimonials.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
      .addCase(fetchTestimonials.rejected,  (state, action) => { state.status = 'failed';    state.error = action.payload; });

    /* createTestimonial */
    builder
      .addCase(createTestimonial.pending,   (state)         => { state.mutationStatus = 'loading';   state.mutationError = null; })
      .addCase(createTestimonial.fulfilled, (state, action) => { state.mutationStatus = 'succeeded'; state.items.unshift(action.payload); })
      .addCase(createTestimonial.rejected,  (state, action) => { state.mutationStatus = 'failed';    state.mutationError = action.payload; });

    /* updateTestimonial */
    builder
      .addCase(updateTestimonial.pending,   (state)         => { state.mutationStatus = 'loading';   state.mutationError = null; })
      .addCase(updateTestimonial.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateTestimonial.rejected,  (state, action) => { state.mutationStatus = 'failed';    state.mutationError = action.payload; });

    /* deleteTestimonial */
    builder
      .addCase(deleteTestimonial.pending,   (state)         => { state.mutationStatus = 'loading';   state.mutationError = null; })
      .addCase(deleteTestimonial.fulfilled, (state, action) => { state.mutationStatus = 'succeeded'; state.items = state.items.filter((t) => t.id !== action.payload); })
      .addCase(deleteTestimonial.rejected,  (state, action) => { state.mutationStatus = 'failed';    state.mutationError = action.payload; });
  },
});

export const { clearMutationState } = testimonialSlice.actions;

/* ─── Selectors ──────────────────────────────────────────────────────────── */
export const selectAllTestimonials    = (state) => state.testimonials.items;
export const selectTestimonialsStatus = (state) => state.testimonials.status;
export const selectTestimonialsError  = (state) => state.testimonials.error;
export const selectMutationStatus     = (state) => state.testimonials.mutationStatus;
export const selectMutationError      = (state) => state.testimonials.mutationError;

export default testimonialSlice.reducer;