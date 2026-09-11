import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface LedgerRecord {
  CollegeName: string;
  StudentName: string;
  Course: string;
  Batch: string;
  Semester: string;
  Session: string;
  FeeCategory: string;
  Debit: number;
  Credit: number;
}

export interface LedgerTotals {
  totalDebit: number;
  totalCredit: number;
  totalPending: number;
  totalRecords: number;
}

interface AllRecordsState {
  colleges: string[];
  courses: string[];
  batches: string[];
  semesters: string[];
  sessions: string[];
  feeCategories: string[];
  records: LedgerRecord[];
  totals: LedgerTotals | null;
  loading: boolean;
  error: string | null;
}

const initialState: AllRecordsState = {
  colleges: [],
  courses: [],
  batches: [],
  semesters: [],
  sessions: [],
  feeCategories: [],
  records: [],
  totals: null,
  loading: false,
  error: null,
};

function cleanParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
}

export const fetchColleges = createAsyncThunk(
  "allRecords/fetchColleges",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("ledger/colleges");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchCourses = createAsyncThunk(
  "allRecords/fetchCourses",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("ledger/courses", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchBatches = createAsyncThunk(
  "allRecords/fetchBatches",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("ledger/batches", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchSemesters = createAsyncThunk(
  "allRecords/fetchSemesters",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("ledger/semesters", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchSessions = createAsyncThunk(
  "allRecords/fetchSessions",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("ledger/sessions");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchFeeCategories = createAsyncThunk(
  "allRecords/fetchFeeCategories",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("ledger/fee-categories");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchAllRecords = createAsyncThunk(
  "allRecords/fetchAllRecords",
  async (
    params: {
      collegeName?: string;
      course?: string;
      batch?: string;
      semester?: string;
      session?: string;
      feeCategory?: string;
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("ledger/all-records", cleanParams(params) as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data;
  }
);

const allRecordsSlice = createSlice({
  name: "allRecords",
  initialState,
  reducers: {
    clearReport(state) {
      state.records = [];
      state.totals = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColleges.fulfilled, (state, action: any) => { state.colleges = action.payload; })
      .addCase(fetchCourses.fulfilled, (state, action: any) => { state.courses = action.payload; })
      .addCase(fetchBatches.fulfilled, (state, action: any) => { state.batches = action.payload; })
      .addCase(fetchSemesters.fulfilled, (state, action: any) => { state.semesters = action.payload; })
      .addCase(fetchSessions.fulfilled, (state, action: any) => { state.sessions = action.payload; })
      .addCase(fetchFeeCategories.fulfilled, (state, action: any) => { state.feeCategories = action.payload; })
      .addCase(fetchAllRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRecords.fulfilled, (state, action: any) => {
        state.loading = false;
        state.records = action.payload.data || [];
        state.totals = action.payload.totals || null;
      })
      .addCase(fetchAllRecords.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.records = [];
        state.totals = null;
      });
  },
});

export const { clearReport } = allRecordsSlice.actions;
export default allRecordsSlice.reducer;