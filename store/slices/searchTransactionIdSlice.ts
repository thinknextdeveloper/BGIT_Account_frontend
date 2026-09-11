import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface TransactionRow {
  Session: string | null;
  CollegeName: string | null;
  TransactionID: number | string | null;
  DateEntry: string | null;
  IDNo: number | string | null;
  UniRollNo: string | null;
  StudentName: string | null;
  FatherName: string | null;
  MotherName: string | null;
  Course: string | null;
  Class: string | null;
  Batch: string | number | null;
  ClassRollNo: string | null;
  Semester: string | null;
  SemesterID: number | string | null;
  Scheme: string | null;
  FeeCategory: string | null;
  ModeOfAdmission: string | null;
  Sex: string | null;
  OnAccountOf: string | null;
  Particulars: string | null;
  ReceiptNo: number | string | null;
  Debit: number | null;
  Credit: number | null;
  Balance: number | null;
  LedgerName: string | null;
  TransactionType: string | null;
  ConcessionEntry: string | null;
  ConcessionAmount: number | null;
  ChequeDraftBank: string | null;
  ChequeDraftNo: string | null;
  ChequeDraftDate: string | null;
  ModeOfPayment: string | null;
  ReceiptType: string | null;
  RegistrationNo: string | null;
  UserID: string | null;
  DisplayDate: string | null;
  Security: number | string | null;
  CashAmount: number | null;
  OtherAmount: number | null;
  Remarks: string | null;
  BrotherSis: string | null;
  Category: string | null;
  IsLegacy: string | boolean | null;
  SystemIP: string | null;
}

interface SearchTransactionState {
  colleges: string[];
  results: TransactionRow[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchTransactionState = {
  colleges: [],
  results: [],
  loading: false,
  error: null,
};

// Uses the existing master-course/colleges API
export const fetchColleges = createAsyncThunk(
  "searchTransaction/fetchColleges",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("master-course/colleges");
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const searchTransaction = createAsyncThunk(
  "searchTransaction/find",
  async (
    params: { transactionId: string; college?: string; allColleges: boolean },
    { rejectWithValue }
  ) => {
    const queryParams: Record<string, string> = {
      transactionId: params.transactionId,
      allColleges: String(params.allColleges),
    };
    if (!params.allColleges && params.college) {
      queryParams.college = params.college;
    }

    const res = await reduxApiClient.get("search-transaction-id/find", queryParams);
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

const searchTransactionIdSlice = createSlice({
  name: "searchTransactionId",
  initialState,
  reducers: {
    clearResults(state) {
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColleges.fulfilled, (state, action: any) => {
        state.colleges = action.payload;
      })
      .addCase(searchTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTransaction.fulfilled, (state, action: any) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchTransaction.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.results = [];
      });
  },
});

export const { clearResults } = searchTransactionIdSlice.actions;
export default searchTransactionIdSlice.reducer;
