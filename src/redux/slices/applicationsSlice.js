import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/kyClient';

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

/** POST /api/applications  (public) */
export const submitApplication = createAsyncThunk(
  'applications/submit',
  async (applicationData, { rejectWithValue }) => {
    try {
      const res = await api.post('applications', { json: applicationData }).json();
      return res.data || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** GET /api/applications  (admin) */
export const fetchAllApplications = createAsyncThunk(
  'applications/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams(params).toString();
      const url = searchParams ? `applications?${searchParams}` : 'applications';
      const res = await authApi().get(url).json();
      return res.data || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** GET /api/applications/:id  (admin) */
export const fetchApplicationById = createAsyncThunk(
  'applications/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await authApi().get(`applications/${id}`).json();
      return res.data?.application || res.application || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** PATCH /api/applications/:id/status  (admin) */
export const updateApplicationStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const res = await authApi()
        .patch(`applications/${id}/status`, { json: { status, notes } })
        .json();
      return res.data?.application || res.application || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** DELETE /api/applications/:id  (admin) */
export const deleteApplication = createAsyncThunk(
  'applications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await authApi().delete(`applications/${id}`).json();
      return id;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SLICE                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
const applicationsSlice = createSlice({
  name: 'applications',
  initialState: {
    applications: [],
    selectedApplication: null,
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },

    status: 'idle',
    error: null,

    submitStatus: 'idle',   // public submit
    submitError: null,

    actionStatus: 'idle',   // update status / delete
    actionError: null,
  },
  reducers: {
    clearApplicationsError(state) { state.error = null; },
    clearSubmitState(state) { state.submitStatus = 'idle'; state.submitError = null; },
    clearActionState(state) { state.actionStatus = 'idle'; state.actionError = null; },
    setSelectedApplication(state, action) { state.selectedApplication = action.payload; },
    clearSelectedApplication(state) { state.selectedApplication = null; },
  },
  extraReducers: (builder) => {
    /* ── submitApplication ────────────────────────────────────────────────── */
    builder
      .addCase(submitApplication.pending, (state) => { state.submitStatus = 'loading'; state.submitError = null; })
      .addCase(submitApplication.fulfilled, (state) => { state.submitStatus = 'succeeded'; })
      .addCase(submitApplication.rejected, (state, action) => { state.submitStatus = 'failed'; state.submitError = action.payload; });

    /* ── fetchAll ─────────────────────────────────────────────────────────── */
    builder
      .addCase(fetchAllApplications.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchAllApplications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.applications = action.payload.applications || action.payload;
        if (action.payload.pagination) state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllApplications.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });

    /* ── fetchById ────────────────────────────────────────────────────────── */
    builder
      .addCase(fetchApplicationById.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchApplicationById.fulfilled, (state, action) => { state.status = 'succeeded'; state.selectedApplication = action.payload; })
      .addCase(fetchApplicationById.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });

    /* ── updateApplicationStatus ──────────────────────────────────────────── */
    builder
      .addCase(updateApplicationStatus.pending, (state) => { state.actionStatus = 'loading'; state.actionError = null; })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const idx = state.applications.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.applications[idx] = action.payload;
        if (state.selectedApplication?.id === action.payload.id) state.selectedApplication = action.payload;
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => { state.actionStatus = 'failed'; state.actionError = action.payload; });

    /* ── deleteApplication ────────────────────────────────────────────────── */
    builder
      .addCase(deleteApplication.pending, (state) => { state.actionStatus = 'loading'; state.actionError = null; })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.applications = state.applications.filter((a) => a.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteApplication.rejected, (state, action) => { state.actionStatus = 'failed'; state.actionError = action.payload; });
  },
});

export const {
  clearApplicationsError, clearSubmitState, clearActionState,
  setSelectedApplication, clearSelectedApplication,
} = applicationsSlice.actions;

/* ─── Selectors ──────────────────────────────────────────────────────────── */
export const selectAllApplications       = (state) => state.applications.applications;
export const selectSelectedApplication   = (state) => state.applications.selectedApplication;
export const selectApplicationsPagination = (state) => state.applications.pagination;
export const selectApplicationsStatus    = (state) => state.applications.status;
export const selectApplicationsError     = (state) => state.applications.error;
export const selectSubmitStatus          = (state) => state.applications.submitStatus;
export const selectSubmitError           = (state) => state.applications.submitError;
export const selectAppActionStatus       = (state) => state.applications.actionStatus;
export const selectAppActionError        = (state) => state.applications.actionError;

export default applicationsSlice.reducer;