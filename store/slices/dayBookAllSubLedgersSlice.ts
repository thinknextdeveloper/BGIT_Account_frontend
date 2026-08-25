import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export type DynamicRow = Record<string, any>;

interface DayBookAllSubLedgersState {
  rows: DynamicRow[];
  columns: string[];
  totalRecords: number;
  cash: number;
  other: number;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: DayBookAllSubLedgersState = {
  rows: [],
  columns: [],
  totalRecords: 0,
  cash: 0,
  other: 0,
  total: 0,
  loading: false,
  error: null,
};

function cleanParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
}

export const fetchDisplay = createAsyncThunk(
  "dayBookAllSubLedgers/fetchDisplay",
  async (params: { collegeName: string; dateFrom: string; dateTo: string }, { rejectWithValue }) => {
    const res = await reduxApiClient.get("daybook-all-sub-ledgers/display", cleanParams(params) as any);
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

export const fetchTotals = createAsyncThunk(
  "dayBookAllSubLedgers/fetchTotals",
  async (params: { collegeName: string; dateFrom: string; dateTo: string }, { rejectWithValue }) => {
    const res = await reduxApiClient.get("daybook-all-sub-ledgers/totals", cleanParams(params) as any);
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

const dayBookAllSubLedgersSlice = createSlice({
  name: "dayBookAllSubLedgers",
  initialState,
  reducers: {
    clearReport(state) {
      state.rows = [];
      state.columns = [];
      state.totalRecords = 0;
      state.cash = 0;
      state.other = 0;
      state.total = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDisplay.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDisplay.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.columns = action.payload.columns;
        state.totalRecords = action.payload.totalRecords;
      })
      .addCase(fetchDisplay.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.rows = [];
        state.columns = [];
        state.totalRecords = 0;
      })
      .addCase(fetchTotals.fulfilled, (state, action: any) => {
        state.cash = action.payload.cash;
        state.other = action.payload.other;
        state.total = action.payload.total;
      });
  },
});

export const { clearReport } = dayBookAllSubLedgersSlice.actions;
export default dayBookAllSubLedgersSlice.reducer;