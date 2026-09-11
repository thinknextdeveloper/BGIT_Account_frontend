import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface AllocationRow {
  DateEntry: string;
  ReceiptNo: string;
  IDNo: string;
  ClassRollNo: string | null;
  UniRollNo: string | null;
  StudentName: string;
  FatherName: string;
  ModeOfPayment: string | null;
  heads: Record<string, number>;
  Total: number; // snapshot total the edited heads must sum to
}

interface FeeSubLedgerAllocationState {
  columns: string[];
  row: AllocationRow | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
  saveMessage: string | null;
}

const initialState: FeeSubLedgerAllocationState = {
  columns: [],
  row: null,
  loading: false,
  error: null,
  saving: false,
  saveError: null,
  saveMessage: null,
};

function cleanParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
}

export const fetchAllocation = createAsyncThunk(
  "feeSubLedgerAllocation/fetch",
  async (
    params: {
      collegeName: string;
      course?: string;
      batch?: string;
      semester?: string;
      session: string;
      receiptNo: string;
      dateFrom?: string;
      dateTo?: string;
      allSubLedgers: boolean;
      subLedgerHead?: string;
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("fee-subledger-allocation/search", cleanParams(params) as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const saveAllocation = createAsyncThunk(
  "feeSubLedgerAllocation/save",
  async (
    params: {
      collegeName: string;
      session: string;
      receiptNo: string;
      idNo: string;
      heads: Record<string, number>;
      expectedTotal: number;
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.put("fee-subledger-allocation/update", params);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

const feeSubLedgerAllocationSlice = createSlice({
  name: "feeSubLedgerAllocation",
  initialState,
  reducers: {
    clearAllocation(state) {
      state.columns = [];
      state.row = null;
      state.error = null;
      state.saveError = null;
      state.saveMessage = null;
    },
    // Local edit of a single head cell before Save is clicked
    setHeadValue(state, action: { payload: { head: string; value: number } }) {
      if (state.row) {
        state.row.heads[action.payload.head] = action.payload.value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllocation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.saveMessage = null;
      })
      .addCase(fetchAllocation.fulfilled, (state, action: any) => {
        state.loading = false;
        state.columns = action.payload.columns;
        state.row = action.payload.row;
      })
      .addCase(fetchAllocation.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.columns = [];
        state.row = null;
      })
      .addCase(saveAllocation.pending, (state) => {
        state.saving = true;
        state.saveError = null;
        state.saveMessage = null;
      })
      .addCase(saveAllocation.fulfilled, (state, action: any) => {
        state.saving = false;
        state.saveMessage = action.payload.message || "Data Updated Successfully";
      })
      .addCase(saveAllocation.rejected, (state, action: any) => {
        state.saving = false;
        state.saveError = action.payload as string;
      });
  },
});

export const { clearAllocation, setHeadValue } = feeSubLedgerAllocationSlice.actions;
export default feeSubLedgerAllocationSlice.reducer;