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

/** POST /api/auth/register */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('auth/register', { json: credentials }).json();
      const { user, token } = res.data || res;
      localStorage.setItem('token', token);
      return { user, token };
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** POST /api/auth/login */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('auth/login', { json: credentials }).json();
      const { user, token } = res.data || res;
      localStorage.setItem('token', token);
      return { user, token };
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/**
 * GET /api/auth/me
 * Fetch the currently authenticated user's profile.
 */
export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi().get('auth/me').json();
      return res.data?.user || res.user || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/**
 * PUT /api/auth/me
 * Update the currently authenticated user's profile (name, avatar).
 */
export const updateMe = createAsyncThunk(
  'auth/updateMe',
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await authApi().put('auth/me', { json: profileData }).json();
      return res.data?.user || res.user || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** PUT /api/auth/change-password */
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords, { rejectWithValue }) => {
    try {
      const res = await authApi().put('auth/change-password', { json: passwords }).json();
      return res.data || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SLICE                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    status: 'idle',         // login / register / fetchMe: idle | loading | succeeded | failed
    error: null,

    updateStatus: 'idle',   // updateMe (PUT /api/auth/me): idle | loading | succeeded | failed
    updateError: null,

    passwordStatus: 'idle', // changePassword: idle | loading | succeeded | failed
    passwordError: null,
  },
  reducers: {
    logout(state) {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.status          = 'idle';
      state.error           = null;
      localStorage.removeItem('token');
    },
    clearAuthError(state) {
      state.error = null;
    },
    clearUpdateState(state) {
      state.updateStatus = 'idle';
      state.updateError  = null;
    },
    clearPasswordState(state) {
      state.passwordStatus = 'idle';
      state.passwordError  = null;
    },
  },
  extraReducers: (builder) => {
    /* ── register ─────────────────────────────────────────────────────────── */
    builder
      .addCase(registerUser.pending,   (state)         => { state.status = 'loading'; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status          = 'succeeded';
        state.user            = action.payload.user;
        state.token           = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected,  (state, action) => { state.status = 'failed'; state.error = action.payload; });

    /* ── login ────────────────────────────────────────────────────────────── */
    builder
      .addCase(loginUser.pending,   (state)         => { state.status = 'loading'; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status          = 'succeeded';
        state.user            = action.payload.user;
        state.token           = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected,  (state, action) => { state.status = 'failed'; state.error = action.payload; });

    /* ── fetchMe  (GET /api/auth/me) ──────────────────────────────────────── */
    builder
      .addCase(fetchMe.pending,   (state)         => { state.status = 'loading'; state.error = null; })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status          = 'succeeded';
        state.user            = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected,  (state, action) => {
        state.status          = 'failed';
        state.error           = action.payload;
        state.isAuthenticated = false;
        state.token           = null;
        localStorage.removeItem('token');
      });

    /* ── updateMe  (PUT /api/auth/me) ─────────────────────────────────────── */
    builder
      .addCase(updateMe.pending,   (state)         => { state.updateStatus = 'loading';   state.updateError = null; })
      .addCase(updateMe.fulfilled, (state, action) => { state.updateStatus = 'succeeded'; state.user        = action.payload; })
      .addCase(updateMe.rejected,  (state, action) => { state.updateStatus = 'failed';    state.updateError = action.payload; });

    /* ── changePassword ───────────────────────────────────────────────────── */
    builder
      .addCase(changePassword.pending,   (state)         => { state.passwordStatus = 'loading';   state.passwordError = null; })
      .addCase(changePassword.fulfilled, (state)         => { state.passwordStatus = 'succeeded'; })
      .addCase(changePassword.rejected,  (state, action) => { state.passwordStatus = 'failed';    state.passwordError = action.payload; });
  },
});

export const { logout, clearAuthError, clearUpdateState, clearPasswordState } = authSlice.actions;

/* ─── Selectors ──────────────────────────────────────────────────────────── */
export const selectUser            = (state) => state.auth.user;
export const selectToken           = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export const selectAuthStatus      = (state) => state.auth.status;
export const selectAuthError       = (state) => state.auth.error;

export const selectUpdateStatus    = (state) => state.auth.updateStatus;
export const selectUpdateError     = (state) => state.auth.updateError;

export const selectPasswordStatus  = (state) => state.auth.passwordStatus;
export const selectPasswordError   = (state) => state.auth.passwordError;

export default authSlice.reducer;
