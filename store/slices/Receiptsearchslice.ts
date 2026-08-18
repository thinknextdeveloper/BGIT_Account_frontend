import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface ReceiptSubhead {
  subhead: string;
  credit: number;
}

export interface DuplicateReceipt {
  collegeName: string;
  idNo: string;
  course: string;
  batch: string;
  classRollNo: string;
  uniRollNo: string;
  dateEntry: string;
  studentDisplayName: string;
  semesterLabel: string;
  receiptNo: number;
  modeOfPayment: string;
  chequeDraftNo: string;
  chequeDraftBank: string;
  chequeDraftDate: string;
  cashAmount: number;
  otherAmount: number;
  totalCredit: number;
  remarks: string;
  subheads: ReceiptSubhead[];
}

interface ReceiptSearchState {
  colleges: string[];
  ledgers: string[];
  sessions: string[];
  receipt: DuplicateReceipt | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReceiptSearchState = {
  colleges: [],
  ledgers: [],
  sessions: [],
  receipt: null,
  loading: false,
  error: null,
};

export const fetchColleges = createAsyncThunk(
  "receiptSearch/fetchColleges",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("master-course/colleges");
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

// Mirrors ShowLedger(): re-fetched every time the college changes.
export const fetchLedgersByCollege = createAsyncThunk(
  "receiptSearch/fetchLedgers",
  async (college: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("receipt-search/ledgers", { college });
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

export const fetchSessions = createAsyncThunk(
  "receiptSearch/fetchSessions",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("receipt-search/sessions");
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

export const fetchDuplicateReceipt = createAsyncThunk(
  "receiptSearch/fetchReceipt",
  async (
    params: {
      college: string;
      ledger: string;
      session: string;
      receiptNo: string;
      searchType: "idNo" | "registrationNo";
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("receipt-search/receipt", params as any);
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

const receiptSearchSlice = createSlice({
  name: "receiptSearch",
  initialState,
  reducers: {
    clearReceipt(state) {
      state.receipt = null;
      state.error = null;
    },
    clearLedgers(state) {
      state.ledgers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColleges.fulfilled, (state, action: any) => {
        state.colleges = action.payload;
      })
      .addCase(fetchLedgersByCollege.fulfilled, (state, action: any) => {
        state.ledgers = action.payload;
      })
      .addCase(fetchSessions.fulfilled, (state, action: any) => {
        state.sessions = action.payload;
      })
      .addCase(fetchDuplicateReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDuplicateReceipt.fulfilled, (state, action: any) => {
        state.loading = false;
        state.receipt = action.payload;
      })
      .addCase(fetchDuplicateReceipt.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.receipt = null;
      });
  },
});

export const { clearReceipt, clearLedgers } = receiptSearchSlice.actions;
export default receiptSearchSlice.reducer;