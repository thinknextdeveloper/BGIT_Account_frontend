import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface ReservedReceipt {
  session: string;
  collegeName: string;
  ledger: string;
  receiptNo: number;
  receiptDate: string;
}

export interface ReservedReceiptDraft {
  collegeName: string;
  session: string;
  ledgerName: string;
  receiptFrom: string;
  noOfReceipts: string;
  receiptDate: string;
}

export const emptyDraft: ReservedReceiptDraft = {
  collegeName: "",
  session: "",
  ledgerName: "",
  receiptFrom: "",
  noOfReceipts: "",
  receiptDate: new Date().toISOString().slice(0, 10),
};

interface ReservedReceiptsState {
  ledgers: string[];
  colleges: string[];
  rows: ReservedReceipt[];
  totalRecords: number;
  receiptFrom: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  message: string | null;
}

const initialState: ReservedReceiptsState = {
  ledgers: [],
  colleges: [],
  rows: [],
  totalRecords: 0,
  receiptFrom: 0,
  loading: false,
  submitting: false,
  error: null,
  message: null,
};

export const fetchLedgers = createAsyncThunk("reservedReceipts/fetchLedgers", async (_, { rejectWithValue }) => {
  const res = await reduxApiClient.get("reserved-receipts/ledgers");
  if (!res.success) return rejectWithValue(res.error?.message);
  return res.data.data as string[];
});

export const fetchColleges = createAsyncThunk("reservedReceipts/fetchColleges", async (_, { rejectWithValue }) => {
  const res = await reduxApiClient.get("reserved-receipts/colleges");
  if (!res.success) return rejectWithValue(res.error?.message);
  return res.data.data as string[];
});

// mirrors DisplayReservedReceiptNumbers()
export const fetchReservedReceipts = createAsyncThunk(
  "reservedReceipts/fetchReservedReceipts",
  async (params: { session: string; collegeName?: string }, { rejectWithValue }) => {
    const res = await reduxApiClient.get("reserved-receipts", params as Record<string, string>);
    if (!res.success) return rejectWithValue(res.error?.message || "Failed to load");
    return res.data as { data: ReservedReceipt[]; totalRecords: number };
  }
);

// mirrors cmbCollege_SelectedIndexChanged auto-calculated Receipt No. From
export const fetchNextReceiptFrom = createAsyncThunk(
  "reservedReceipts/fetchNextReceiptFrom",
  async (params: { collegeName: string; ledgerName: string; session: string }, { rejectWithValue }) => {
    const res = await reduxApiClient.get("reserved-receipts/next-from", params);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data.receiptFrom as number;
  }
);

// mirrors btnSave_Click
export const saveReservedReceipts = createAsyncThunk(
  "reservedReceipts/saveReservedReceipts",
  async (draft: ReservedReceiptDraft, { rejectWithValue }) => {
    const res = await reduxApiClient.post("reserved-receipts", draft);
    if (!res.success) return rejectWithValue(res.error?.message || "Save failed");
    return res.data;
  }
);

const reservedReceiptsSlice = createSlice({
  name: "reservedReceipts",
  initialState,
  reducers: {
    clearMessage(state) {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLedgers.fulfilled, (state, action) => { state.ledgers = action.payload; })
      .addCase(fetchColleges.fulfilled, (state, action) => { state.colleges = action.payload; })
      .addCase(fetchReservedReceipts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchReservedReceipts.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload.data;
        state.totalRecords = action.payload.data.length;
      })
      .addCase(fetchReservedReceipts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNextReceiptFrom.fulfilled, (state, action) => { state.receiptFrom = action.payload; })
      .addCase(saveReservedReceipts.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(saveReservedReceipts.fulfilled, (state, action) => {
        state.submitting = false;
        state.message = action.payload.message;
      })
      .addCase(saveReservedReceipts.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessage } = reservedReceiptsSlice.actions;
export default reservedReceiptsSlice.reducer;

// In store.ts: reservedReceipts: reservedReceiptsReducer