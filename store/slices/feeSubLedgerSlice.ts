import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface FeeSubLedgerRow {
  DateEntry: string;
  ReceiptNo: string;
  IDNo: string;
  ClassRollNo: string | null;
  UniRollNo: string | null;
  StudentName: string;
  FatherName: string;
  ModeOfPayment: string | null;
  heads: Record<string, number>;
  Total: number;
}

export interface FeeSubLedgerTotalsRow {
  heads: Record<string, number>;
  Total: number;
}

interface FeeSubLedgerState {
  courses: string[];
  batches: string[];
  semesters: string[];
  sessions: string[];
  subLedgerHeads: string[];
  columns: string[];
  rows: FeeSubLedgerRow[];
  totalsRow: FeeSubLedgerTotalsRow | null;
  totalRecords: number;
  loading: boolean;
  error: string | null;
}

const initialState: FeeSubLedgerState = {
  courses: [],
  batches: [],
  semesters: [],
  sessions: [],
  subLedgerHeads: [],
  columns: [],
  rows: [],
  totalsRow: null,
  totalRecords: 0,
  loading: false,
  error: null,
};

function cleanParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
}

export const fetchCourses = createAsyncThunk(
  "feeSubLedger/fetchCourses",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("fee-subledger/courses", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchBatches = createAsyncThunk(
  "feeSubLedger/fetchBatches",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("fee-subledger/batches", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchSemesters = createAsyncThunk(
  "feeSubLedger/fetchSemesters",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("fee-subledger/semesters", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchSessions = createAsyncThunk(
  "feeSubLedger/fetchSessions",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("fee-subledger/sessions");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchSubLedgerHeads = createAsyncThunk(
  "feeSubLedger/fetchSubLedgerHeads",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("fee-subledger/subledger-heads", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchDisplay = createAsyncThunk(
  "feeSubLedger/fetchDisplay",
  async (
    params: {
      collegeName: string;
      course?: string;
      batch?: string;
      semester?: string;
      session: string;
      receiptNo?: string;
      dateFrom?: string;
      dateTo?: string;
      allSubLedgers: boolean;
      subLedgerHead?: string;
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("fee-subledger/display", cleanParams(params) as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

const feeSubLedgerSlice = createSlice({
  name: "feeSubLedger",
  initialState,
  reducers: {
    clearReport(state) {
      state.columns = [];
      state.rows = [];
      state.totalsRow = null;
      state.totalRecords = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.fulfilled, (state, action: any) => { state.courses = action.payload; })
      .addCase(fetchBatches.fulfilled, (state, action: any) => { state.batches = action.payload; })
      .addCase(fetchSemesters.fulfilled, (state, action: any) => { state.semesters = action.payload; })
      .addCase(fetchSessions.fulfilled, (state, action: any) => { state.sessions = action.payload; })
      .addCase(fetchSubLedgerHeads.fulfilled, (state, action: any) => { state.subLedgerHeads = action.payload; })
      .addCase(fetchDisplay.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDisplay.fulfilled, (state, action: any) => {
        state.loading = false;
        state.columns = action.payload.columns;
        state.rows = action.payload.rows;
        state.totalsRow = action.payload.totalsRow;
        state.totalRecords = action.payload.totalRecords;
      })
      .addCase(fetchDisplay.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.columns = [];
        state.rows = [];
        state.totalsRow = null;
        state.totalRecords = 0;
      });
  },
});

export const { clearReport } = feeSubLedgerSlice.actions;
export default feeSubLedgerSlice.reducer;