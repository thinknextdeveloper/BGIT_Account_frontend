import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

interface ReportRow {
  [key: string]: any;
}

interface ReceiptUpdateState {
  colleges: string[];
  ledgers: string[];
  updating: boolean;
  updateMessage: string | null;
  multipleHeadRows: ReportRow[];
  singleHeadRows: ReportRow[];
  loading: boolean;
  error: string | null;
}

const initialState: ReceiptUpdateState = {
  colleges: [],
  ledgers: [],
  updating: false,
  updateMessage: null,
  multipleHeadRows: [],
  singleHeadRows: [],
  loading: false,
  error: null,
};

export const fetchCollegesForReceipt = createAsyncThunk(
  "receiptUpdate/fetchColleges",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("master-course/colleges");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchLedgerNames = createAsyncThunk(
  "receiptUpdate/fetchLedgers",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("receipt-update/ledgers");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const bulkUpdateReceipts = createAsyncThunk(
  "receiptUpdate/bulkUpdate",
  async (
    payload: {
      collegeName: string;
      session: string;
      ledgerName: string;
      displayDate: string;
      receiptFrom: string;
      receiptTo: string;
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.put("receipt-update/bulk-update", payload);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.message;
  }
);

export const fetchMultipleHeadReport = createAsyncThunk(
  "receiptUpdate/multipleHeadReport",
  async (
    params: {
      collegeName: string;
      session: string;
      receiptFrom: string;
      receiptTo: string;
      displayDate: string;
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("receipt-update/multiple-head-report", params as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchSingleHeadReport = createAsyncThunk(
  "receiptUpdate/singleHeadReport",
  async (
    params: {
      collegeName: string;
      session: string;
      ledgerName: string;
      receiptFrom: string;
      receiptTo: string;
      displayDate: string;
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("receipt-update/single-head-report", params as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

const receiptUpdateSlice = createSlice({
  name: "receiptUpdate",
  initialState,
  reducers: {
    clearReports(state) {
      state.multipleHeadRows = [];
      state.singleHeadRows = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollegesForReceipt.fulfilled, (state, action: any) => {
        state.colleges = action.payload;
      })
      .addCase(fetchLedgerNames.fulfilled, (state, action: any) => {
        state.ledgers = action.payload;
      })
      .addCase(bulkUpdateReceipts.pending, (state) => {
        state.updating = true;
        state.updateMessage = null;
        state.error = null;
      })
      .addCase(bulkUpdateReceipts.fulfilled, (state, action: any) => {
        state.updating = false;
        state.updateMessage = action.payload;
      })
      .addCase(bulkUpdateReceipts.rejected, (state, action: any) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(fetchMultipleHeadReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMultipleHeadReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.multipleHeadRows = action.payload;
      })
      .addCase(fetchMultipleHeadReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSingleHeadReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleHeadReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.singleHeadRows = action.payload;
      })
      .addCase(fetchSingleHeadReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReports } = receiptUpdateSlice.actions;
export default receiptUpdateSlice.reducer;