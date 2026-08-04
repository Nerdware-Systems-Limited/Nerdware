import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/kyClient';

const getToken = () => localStorage.getItem('token') || '';

const authApi = () =>
  api.extend({ headers: { Authorization: `Bearer ${getToken()}` } });

/** GET /api/portfolios
 *  Sent with the auth header (when a token exists) so ADMIN/EDITOR callers —
 *  the admin portfolio list — can filter by `status` and see DRAFT items;
 *  the backend's optionalAuth middleware ignores a missing/invalid token on
 *  this public route, so anonymous callers are unaffected.
 */
export const fetchAllPortfolios = createAsyncThunk(
  'portfolios/fetchAll',
  async ({ page = 1, limit = 9, category, featured, status } = {}, { rejectWithValue }) => {
    try {
      const searchParams = { page, limit };
      if (category) searchParams.category = category;
      if (featured !== undefined) searchParams.featured = featured;
      if (status && status !== 'ALL') searchParams.status = status;

      const res = await authApi().get('portfolios', { searchParams }).json();
      const portfolios = res.data?.portfolios || res.portfolios || (Array.isArray(res) ? res : null);
      if (!portfolios) return rejectWithValue('Invalid data structure from API');

      const pagination = res.data?.pagination || res.pagination || { page, limit, total: portfolios.length, pages: 1 };
      return { portfolios, pagination };
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch portfolios');
    }
  }
);

// Keep old name as alias so any other file using fetchPortfolios still works
export const fetchPortfolios = fetchAllPortfolios;

export const createPortfolio = createAsyncThunk(
  'portfolios/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi().post('portfolios', { json: payload }).json();
      return res.data?.portfolio ?? res.portfolio ?? res;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to create portfolio');
    }
  }
);

export const updatePortfolio = createAsyncThunk(
  'portfolios/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await authApi().put(`portfolios/${id}`, { json: payload }).json();
      return res.data?.portfolio ?? res.portfolio ?? res;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to update portfolio');
    }
  }
);

export const deletePortfolio = createAsyncThunk(
  'portfolios/delete',
  async (id, { rejectWithValue }) => {
    try {
      await authApi().delete(`portfolios/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to delete portfolio');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const portfolioSlice = createSlice({
  name: 'portfolios',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 9, total: 0, pages: 1 },
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetchAll
    builder
      .addCase(fetchAllPortfolios.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(fetchAllPortfolios.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items  = action.payload.portfolios;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllPortfolios.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload;
      });

    // create
    builder
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.pagination.total += 1;
      });

    // update
    builder
      .addCase(updatePortfolio.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });

    // delete
    builder
      .addCase(deletePortfolio.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      });
  },
});

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAllPortfolios       = (state) => state.portfolios.items;
export const selectPortfoliosPagination = (state) => state.portfolios.pagination;
export const selectPortfoliosStatus    = (state) => state.portfolios.status;
export const selectPortfoliosError     = (state) => state.portfolios.error;

export default portfolioSlice.reducer;