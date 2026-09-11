import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

interface LedgerRow {
  [key: string]: any;
}

interface LedgerwiseStatusState {
  colleges: string[];
  courses: string[];
  batches: string[];
  sessions: string[];
  rows: LedgerRow[];
  totalDebits: number;
  totalCredits: number;
  balance: number;
  loading: boolean;
  error: string | null;
}

const initialState: LedgerwiseStatusState = {
  colleges: [],
  courses: [],
  batches: [],
  sessions: [],
  rows: [],
  totalDebits: 0,
  totalCredits: 0,
  balance: 0,
  loading: false,
  error: null,
};

export const fetchCollegesForLedger = createAsyncThunk(
  "ledgerwiseStatus/fetchColleges",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("master-course/colleges");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchCourses = createAsyncThunk(
  "ledgerwiseStatus/fetchCourses",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("ledgerwise-status/courses", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchBatches = createAsyncThunk(
  "ledgerwiseStatus/fetchBatches",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("ledgerwise-status/batches", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchSessions = createAsyncThunk(
  "ledgerwiseStatus/fetchSessions",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("ledgerwise-status/sessions");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchDisplay = createAsyncThunk(
  "ledgerwiseStatus/fetchDisplay",
  async (
    params: {
      collegeName: string;
      course?: string;
      batch?: string;
      session?: string;
      dateFrom?: string;
      dateTo?: string;
      mode: string;
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("ledgerwise-status/display", params as any);
    if (!res.success) return rejectWithValue(res.error?.message || "Sorry No Record Found");
    return res.data.data;
  }
);

export const fetchPendingFeeOnly = createAsyncThunk(
  "ledgerwiseStatus/fetchPendingFeeOnly",
  async (
    params: {
      collegeName: string;
      course?: string;
      batch?: string;
      session?: string;
      dateFrom?: string;
      dateTo?: string;
      mode: string;
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("ledgerwise-status/pending-fee", params as any);
    if (!res.success) return rejectWithValue(res.error?.message || "Sorry No record found");
    return res.data.data;
  }
);

const ledgerwiseStatusSlice = createSlice({
  name: "ledgerwiseStatus",
  initialState,
  reducers: {
    clearResults(state) {
      state.rows = [];
      state.totalDebits = 0;
      state.totalCredits = 0;
      state.balance = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollegesForLedger.fulfilled, (state, action: any) => {
        state.colleges = action.payload;
      })
      .addCase(fetchCourses.fulfilled, (state, action: any) => {
        state.courses = action.payload;
      })
      .addCase(fetchBatches.fulfilled, (state, action: any) => {
        state.batches = action.payload;
      })
      .addCase(fetchSessions.fulfilled, (state, action: any) => {
        state.sessions = action.payload;
      })
      .addCase(fetchDisplay.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDisplay.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.totalDebits = action.payload.totalDebits;
        state.totalCredits = action.payload.totalCredits;
        state.balance = action.payload.balance;
      })
      .addCase(fetchDisplay.rejected, (state, action: any) => {
        state.loading = false;
        state.rows = [];
        state.totalDebits = 0;
        state.totalCredits = 0;
        state.balance = 0;
        state.error = action.payload;
      })
      .addCase(fetchPendingFeeOnly.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingFeeOnly.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.totalDebits = action.payload.totalDebits;
        state.totalCredits = action.payload.totalCredits;
        state.balance = action.payload.balance;
      })
      .addCase(fetchPendingFeeOnly.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearResults } = ledgerwiseStatusSlice.actions;
export default ledgerwiseStatusSlice.reducer;