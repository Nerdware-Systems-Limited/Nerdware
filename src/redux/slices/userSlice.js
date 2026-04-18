import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/kyClient';

/* ─── helpers ────────────────────────────────────────────────────────────── */
const extractError = async (err) => {
  try {
    const body = await err?.response?.json?.();
    return body?.message || err?.message || 'Something went wrong';
  } catch {
    return err?.message || 'Something went wrong';
  }
};

const getToken = () => localStorage.getItem('token') || '';
const authApi = () =>
  api.extend({ headers: { Authorization: `Bearer ${getToken()}` } });

/* ─────────────────────────────────────────────────────────────────────────── */
/*  THUNKS                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

/** GET /api/users */
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams(params).toString();
      const url = searchParams ? `users?${searchParams}` : 'users';
      const res = await authApi().get(url).json();
      return res.data || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** GET /api/users/:id */
export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await authApi().get(`users/${id}`).json();
      return res.data?.user || res.user || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** POST /api/users */
export const createUser = createAsyncThunk(
  'users/create',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await authApi().post('users', { json: userData }).json();
      return res.data?.user || res.user || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** PUT /api/users/:id */
export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, ...userData }, { rejectWithValue }) => {
    try {
      const res = await authApi().put(`users/${id}`, { json: userData }).json();
      return res.data?.user || res.user || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** DELETE /api/users/:id */
export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await authApi().delete(`users/${id}`).json();
      return id;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SLICE                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    selectedUser: null,
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },

    status: 'idle',       // fetchAll: idle | loading | succeeded | failed
    error: null,

    actionStatus: 'idle', // create | update | delete: idle | loading | succeeded | failed
    actionError: null,
  },
  reducers: {
    clearUsersError(state) {
      state.error = null;
    },
    clearActionState(state) {
      state.actionStatus = 'idle';
      state.actionError = null;
    },
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
    },
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    /* ── fetchAll ─────────────────────────────────────────────────────────── */
    builder
      .addCase(fetchAllUsers.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload.users || action.payload;
        if (action.payload.pagination) state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });

    /* ── fetchById ────────────────────────────────────────────────────────── */
    builder
      .addCase(fetchUserById.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchUserById.fulfilled, (state, action) => { state.status = 'succeeded'; state.selectedUser = action.payload; })
      .addCase(fetchUserById.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });

    /* ── createUser ───────────────────────────────────────────────────────── */
    builder
      .addCase(createUser.pending, (state) => { state.actionStatus = 'loading'; state.actionError = null; })
      .addCase(createUser.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.users.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createUser.rejected, (state, action) => { state.actionStatus = 'failed'; state.actionError = action.payload; });

    /* ── updateUser ───────────────────────────────────────────────────────── */
    builder
      .addCase(updateUser.pending, (state) => { state.actionStatus = 'loading'; state.actionError = null; })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
        if (state.selectedUser?.id === action.payload.id) state.selectedUser = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => { state.actionStatus = 'failed'; state.actionError = action.payload; });

    /* ── deleteUser ───────────────────────────────────────────────────────── */
    builder
      .addCase(deleteUser.pending, (state) => { state.actionStatus = 'loading'; state.actionError = null; })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.users = state.users.filter((u) => u.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteUser.rejected, (state, action) => { state.actionStatus = 'failed'; state.actionError = action.payload; });
  },
});

export const { clearUsersError, clearActionState, setSelectedUser, clearSelectedUser } = usersSlice.actions;

/* ─── Selectors ──────────────────────────────────────────────────────────── */
export const selectAllUsers      = (state) => state.users.users;
export const selectSelectedUser  = (state) => state.users.selectedUser;
export const selectUsersPagination = (state) => state.users.pagination;
export const selectUsersStatus   = (state) => state.users.status;
export const selectUsersError    = (state) => state.users.error;
export const selectActionStatus  = (state) => state.users.actionStatus;
export const selectActionError   = (state) => state.users.actionError;

export default usersSlice.reducer;