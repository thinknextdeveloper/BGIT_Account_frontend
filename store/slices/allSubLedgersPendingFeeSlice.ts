import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export type DynamicRow = Record<string, any>;

interface AllSubLedgersPendingFeeState {
  courses: string[];
  batches: string[];
  subHeads: string[];
  rows: DynamicRow[];
  columns: string[];
  totalRecords: number;
  loading: boolean;
  error: string | null;
}

const initialState: AllSubLedgersPendingFeeState = {
  courses: [],
  batches: [],
  subHeads: [],
  rows: [],
  columns: [],
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
  "allSubLedgersPendingFee/fetchCourses",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("all-sub-ledgers-pending-fee/courses", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

export const fetchBatches = createAsyncThunk(
  "allSubLedgersPendingFee/fetchBatches",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("all-sub-ledgers-pending-fee/batches", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

export const fetchSubHeads = createAsyncThunk(
  "allSubLedgersPendingFee/fetchSubHeads",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("all-sub-ledgers-pending-fee/sub-heads", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

export const fetchDisplay = createAsyncThunk(
  "allSubLedgersPendingFee/fetchDisplay",
  async (params: { collegeName: string; course: string; batch: string }, { rejectWithValue }) => {
    const res = await reduxApiClient.get("all-sub-ledgers-pending-fee/display", cleanParams(params) as any);
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

export const fetchSingleSubHead = createAsyncThunk(
  "allSubLedgersPendingFee/fetchSingleSubHead",
  async (
    params: { collegeName: string; course?: string; batch?: string; subHead: string; session?: string },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("all-sub-ledgers-pending-fee/single-subhead", cleanParams(params) as any);
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

const allSubLedgersPendingFeeSlice = createSlice({
  name: "allSubLedgersPendingFee",
  initialState,
  reducers: {
    clearReport(state) {
      state.rows = [];
      state.columns = [];
      state.totalRecords = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.fulfilled, (state, action: any) => { state.courses = action.payload; })
      .addCase(fetchBatches.fulfilled, (state, action: any) => { state.batches = action.payload; })
      .addCase(fetchSubHeads.fulfilled, (state, action: any) => { state.subHeads = action.payload; })
      .addMatcher(
        (a) => a.type === fetchDisplay.pending.type || a.type === fetchSingleSubHead.pending.type,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (a) => a.type === fetchDisplay.fulfilled.type || a.type === fetchSingleSubHead.fulfilled.type,
        (state, action: any) => {
          state.loading = false;
          state.rows = action.payload.rows;
          state.columns = action.payload.columns;
          state.totalRecords = action.payload.totalRecords;
        }
      )
      .addMatcher(
        (a) => a.type === fetchDisplay.rejected.type || a.type === fetchSingleSubHead.rejected.type,
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload as string;
          state.rows = [];
          state.columns = [];
          state.totalRecords = 0;
        }
      );
  },
});

export const { clearReport } = allSubLedgersPendingFeeSlice.actions;
export default allSubLedgersPendingFeeSlice.reducer;