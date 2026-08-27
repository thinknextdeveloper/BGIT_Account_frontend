import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface RefundRow {
  DateEntry: string;
  ReceiptNo: string;
  IDNo: number;
  UniRollNo: string | null;
  StudentName: string;
  FatherName: string;
  LedgerName: string;
  Credit: number;
  ModeOfPayment: string | null;
  ChequeDraftBank: string | null;
  ChequeDraftNo: string | null;
  ChequeDraftDate: string | null;
  CashAmount: number | null;
  OtherAmount: number | null;
}

interface RefundReportState {
  ledgerNames: string[];
  sessions: string[];
  rows: RefundRow[];
  totalCredit: number;
  totalRecords: number;
  loading: boolean;
  error: string | null;
}

const initialState: RefundReportState = {
  ledgerNames: [],
  sessions: [],
  rows: [],
  totalCredit: 0,
  totalRecords: 0,
  loading: false,
  error: null,
};

function cleanParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
}

export const fetchLedgerNames = createAsyncThunk(
  "refundReport/fetchLedgerNames",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("refund-report/ledger-names", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchSessions = createAsyncThunk(
  "refundReport/fetchSessions",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("refund-report/sessions");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchDisplay = createAsyncThunk(
  "refundReport/fetchDisplay",
  async (params: { collegeName: string; ledgerName: string; session?: string }, { rejectWithValue }) => {
    const res = await reduxApiClient.get("refund-report/display", cleanParams(params) as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

const refundReportSlice = createSlice({
  name: "refundReport",
  initialState,
  reducers: {
    clearReport(state) {
      state.rows = [];
      state.totalCredit = 0;  
      state.totalRecords = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLedgerNames.fulfilled, (state, action: any) => { state.ledgerNames = action.payload; })
      .addCase(fetchSessions.fulfilled, (state, action: any) => { state.sessions = action.payload; })
      .addCase(fetchDisplay.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDisplay.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.totalCredit = action.payload.totalCredit;
        state.totalRecords = action.payload.totalRecords;
      })
      .addCase(fetchDisplay.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.rows = [];
        state.totalCredit = 0;
        state.totalRecords = 0;
      });
  },
});

export const { clearReport } = refundReportSlice.actions;
export default refundReportSlice.reducer;