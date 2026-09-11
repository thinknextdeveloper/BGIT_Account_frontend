import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface LedgerStatusRow {
  IDNo: number;
  StudentName: string;
  FatherName: string;
  StudentMobileNo: string | null;
  FatherMobileNo: string | null;
  Category: string;
  Course: string;
  Credit: number;
  Debit: number;
  Balance: number;
}

export type ReportAction = "current" | "zero-balance" | "with-left" | "left-only" | "active" | "inactive";

interface ReportParams {
  collegeName: string;
  course?: string;
  batch?: string;
  ledgerName?: string;
  semester?: string;
  session?: string;
  idType: "idNo" | "registration";
  action: ReportAction;
  feeCategories: string[];
}

interface LedgerStatusState {
  semesters: string[];
  feeCategories: string[];
  rows: LedgerStatusRow[];
  totalCredit: number;
  totalDebit: number;
  balance: number;
  loading: boolean;
  error: string | null;
}

const initialState: LedgerStatusState = {
  semesters: [],
  feeCategories: [],
  rows: [],
  totalCredit: 0,
  totalDebit: 0,
  balance: 0,
  loading: false,
  error: null,
};

export const fetchSemesters = createAsyncThunk(
  "ledgerStatus/fetchSemesters",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("ledger-status/semesters");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchFeeCategories = createAsyncThunk(
  "ledgerStatus/fetchFeeCategories",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("ledger-status/fee-categories");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchLedgerStatusReport = createAsyncThunk(
  "ledgerStatus/fetchReport",
  async (params: ReportParams, { rejectWithValue }) => {
    const res = await reduxApiClient.post("ledger-status/report", params as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

const ledgerStatusSlice = createSlice({
  name: "ledgerStatus",
  initialState,
  reducers: {
    clearReport(state) {
      state.rows = [];
      state.totalCredit = 0;
      state.totalDebit = 0;
      state.balance = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSemesters.fulfilled, (state, action: any) => {
        state.semesters = action.payload;
      })
      .addCase(fetchFeeCategories.fulfilled, (state, action: any) => {
        state.feeCategories = action.payload;
      })
      .addCase(fetchLedgerStatusReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLedgerStatusReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.totalCredit = action.payload.totalCredit;
        state.totalDebit = action.payload.totalDebit;
        state.balance = action.payload.balance;
      })
      .addCase(fetchLedgerStatusReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.rows = [];
      });
  },
});

export const { clearReport } = ledgerStatusSlice.actions;
export default ledgerStatusSlice.reducer;