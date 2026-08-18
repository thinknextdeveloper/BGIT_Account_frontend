import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface ConcessionRow {
  RegistrationNo: number | null;
  IDNo: number;
  UniRollNo: string | null;
  StudentName: string;
  Class: string;
  LedgerName: string;
  ConcessionGiven: number;
  Particulars: string;
}

interface ConcessionState {
  ledgerNames: string[];
  batches: string[];
  collegeAddress: { addressLine1: string; addressLine2: string };
  rows: ConcessionRow[];
  totalConcessionAmount: number;
  loading: boolean;
  error: string | null;
}

const initialState: ConcessionState = {
  ledgerNames: [],
  batches: [],
  collegeAddress: { addressLine1: "", addressLine2: "" },
  rows: [],
  totalConcessionAmount: 0,
  loading: false,
  error: null,
};

export const fetchLedgerNames = createAsyncThunk(
  "concession/fetchLedgerNames",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("concession/ledger-names", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchBatches = createAsyncThunk(
  "concession/fetchBatches",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("concession/batches", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchCollegeAddress = createAsyncThunk(
  "concession/fetchCollegeAddress",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("concession/college-address", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchConcessionReport = createAsyncThunk(
  "concession/fetchReport",
  async (
    params: { collegeName: string; ledgerName?: string; batch?: string; session?: string },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("concession/report", params as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data; // { rows, totalConcessionAmount, totalStudents }
  }
);

const concessionSlice = createSlice({
  name: "concession",
  initialState,
  reducers: {
    clearReport(state) {
      state.rows = [];
      state.totalConcessionAmount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLedgerNames.fulfilled, (state, action: any) => {
        state.ledgerNames = action.payload;
      })
      .addCase(fetchBatches.fulfilled, (state, action: any) => {
        state.batches = action.payload;
      })
      .addCase(fetchCollegeAddress.fulfilled, (state, action: any) => {
        state.collegeAddress = action.payload;
      })
      .addCase(fetchConcessionReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConcessionReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.totalConcessionAmount = action.payload.totalConcessionAmount;
      })
      .addCase(fetchConcessionReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.rows = [];
        state.totalConcessionAmount = 0;
      });
  },
});

export const { clearReport } = concessionSlice.actions;
export default concessionSlice.reducer;