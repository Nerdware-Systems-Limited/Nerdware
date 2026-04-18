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
/*  NEWSLETTER THUNKS                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

/** POST /api/newsletter/subscribe  (public) */
export const subscribeNewsletter = createAsyncThunk(
  'misc/subscribe',
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post('newsletter/subscribe', { json: { email } }).json();
      return res.data || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** POST /api/newsletter/unsubscribe  (public) */
export const unsubscribeNewsletter = createAsyncThunk(
  'misc/unsubscribe',
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post('newsletter/unsubscribe', { json: { email } }).json();
      return res.data || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** GET /api/newsletter/subscribers  (admin) */
export const fetchSubscribers = createAsyncThunk(
  'misc/fetchSubscribers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi().get('newsletter/subscribers').json();
      return res.data || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CONTACT THUNKS                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

/** POST /api/contact  (public) */
export const sendContactMessage = createAsyncThunk(
  'misc/sendContact',
  async (messageData, { rejectWithValue }) => {
    try {
      const res = await api.post('contact', { json: messageData }).json();
      return res.data || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** GET /api/contact  (admin) */
export const fetchMessages = createAsyncThunk(
  'misc/fetchMessages',
  async (params = {}, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams(params).toString();
      const url = searchParams ? `contact?${searchParams}` : 'contact';
      const res = await authApi().get(url).json();
      return res.data || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/** PATCH /api/contact/:id/status  (admin) */
export const updateMessageStatus = createAsyncThunk(
  'misc/updateMessageStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await authApi()
        .patch(`contact/${id}/status`, { json: { status } })
        .json();
      return res.data?.message || res.message || res;
    } catch (err) {
      return rejectWithValue(await extractError(err));
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SLICE                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
const miscSlice = createSlice({
  name: 'misc',
  initialState: {
    /* newsletter */
    subscribers: [],
    subscribersStatus: 'idle',
    subscribersError: null,
    newsletterStatus: 'idle',   // subscribe / unsubscribe
    newsletterError: null,

    /* contact */
    messages: [],
    messagesStatus: 'idle',
    messagesError: null,
    contactStatus: 'idle',      // public send
    contactError: null,
    messageActionStatus: 'idle', // update status
    messageActionError: null,
  },
  reducers: {
    clearNewsletterState(state) { state.newsletterStatus = 'idle'; state.newsletterError = null; },
    clearContactState(state)    { state.contactStatus    = 'idle'; state.contactError    = null; },
    clearMessageActionState(state) { state.messageActionStatus = 'idle'; state.messageActionError = null; },
  },
  extraReducers: (builder) => {
    /* ── subscribeNewsletter ──────────────────────────────────────────────── */
    builder
      .addCase(subscribeNewsletter.pending,   (state) => { state.newsletterStatus = 'loading';   state.newsletterError = null; })
      .addCase(subscribeNewsletter.fulfilled, (state) => { state.newsletterStatus = 'succeeded'; })
      .addCase(subscribeNewsletter.rejected,  (state, action) => { state.newsletterStatus = 'failed'; state.newsletterError = action.payload; });

    /* ── unsubscribeNewsletter ────────────────────────────────────────────── */
    builder
      .addCase(unsubscribeNewsletter.pending,   (state) => { state.newsletterStatus = 'loading';   state.newsletterError = null; })
      .addCase(unsubscribeNewsletter.fulfilled, (state) => { state.newsletterStatus = 'succeeded'; })
      .addCase(unsubscribeNewsletter.rejected,  (state, action) => { state.newsletterStatus = 'failed'; state.newsletterError = action.payload; });

    /* ── fetchSubscribers ─────────────────────────────────────────────────── */
    builder
      .addCase(fetchSubscribers.pending,   (state) => { state.subscribersStatus = 'loading';   state.subscribersError = null; })
      .addCase(fetchSubscribers.fulfilled, (state, action) => { state.subscribersStatus = 'succeeded'; state.subscribers = action.payload.subscribers || action.payload; })
      .addCase(fetchSubscribers.rejected,  (state, action) => { state.subscribersStatus = 'failed'; state.subscribersError = action.payload; });

    /* ── sendContactMessage ───────────────────────────────────────────────── */
    builder
      .addCase(sendContactMessage.pending,   (state) => { state.contactStatus = 'loading';   state.contactError = null; })
      .addCase(sendContactMessage.fulfilled, (state) => { state.contactStatus = 'succeeded'; })
      .addCase(sendContactMessage.rejected,  (state, action) => { state.contactStatus = 'failed'; state.contactError = action.payload; });

    /* ── fetchMessages ────────────────────────────────────────────────────── */
    builder
      .addCase(fetchMessages.pending,   (state) => { state.messagesStatus = 'loading';   state.messagesError = null; })
      .addCase(fetchMessages.fulfilled, (state, action) => { state.messagesStatus = 'succeeded'; state.messages = action.payload.messages || action.payload; })
      .addCase(fetchMessages.rejected,  (state, action) => { state.messagesStatus = 'failed'; state.messagesError = action.payload; });

    /* ── updateMessageStatus ──────────────────────────────────────────────── */
    builder
      .addCase(updateMessageStatus.pending,   (state) => { state.messageActionStatus = 'loading';   state.messageActionError = null; })
      .addCase(updateMessageStatus.fulfilled, (state, action) => {
        state.messageActionStatus = 'succeeded';
        const idx = state.messages.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.messages[idx] = action.payload;
      })
      .addCase(updateMessageStatus.rejected,  (state, action) => { state.messageActionStatus = 'failed'; state.messageActionError = action.payload; });
  },
});

export const { clearNewsletterState, clearContactState, clearMessageActionState } = miscSlice.actions;

/* ─── Selectors ──────────────────────────────────────────────────────────── */
export const selectSubscribers           = (state) => state.misc.subscribers;
export const selectSubscribersStatus     = (state) => state.misc.subscribersStatus;
export const selectNewsletterStatus      = (state) => state.misc.newsletterStatus;
export const selectNewsletterError       = (state) => state.misc.newsletterError;

export const selectMessages              = (state) => state.misc.messages;
export const selectMessagesStatus        = (state) => state.misc.messagesStatus;
export const selectContactStatus         = (state) => state.misc.contactStatus;
export const selectContactError          = (state) => state.misc.contactError;
export const selectMessageActionStatus   = (state) => state.misc.messageActionStatus;
export const selectMessageActionError    = (state) => state.misc.messageActionError;

export default miscSlice.reducer;