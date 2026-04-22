import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/kyClient';

const getToken = () => localStorage.getItem('token') || '';

const authApi = () =>
  api.extend({ headers: { Authorization: `Bearer ${getToken()}` } });

export const fetchAllPortfolios = createAsyncThunk(
  'portfolios/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api().get('portfolios').json();
      if (res.data?.portfolios) return res.data.portfolios;
      if (res.portfolios)        return res.portfolios;
      if (Array.isArray(res))    return res;
      return rejectWithValue('Invalid data structure from API');
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
        state.items  = action.payload;
      })
      .addCase(fetchAllPortfolios.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload;
      });

    // create
    builder
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
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
      });
  },
});

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAllPortfolios    = (state) => state.portfolios.items;
export const selectPortfoliosStatus = (state) => state.portfolios.status;
export const selectPortfoliosError  = (state) => state.portfolios.error;

export default portfolioSlice.reducer;