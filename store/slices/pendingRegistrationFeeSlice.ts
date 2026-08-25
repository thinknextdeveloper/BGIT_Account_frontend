import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface PendingRegRow {
  RegistrationNo: number;
  Course: string;
  Batch: number;
  StudentName: string;
  FatherName: string;
  Debit: number;
  Credit: number;
  Balance: number;
}

interface ReportParams {
  collegeName: string;
  course?: string;
  batch?: string;
}

interface PendingRegistrationFeeState {
  courses: string[];
  batches: string[];
  rows: PendingRegRow[];
  totalRecords: number;
  loading: boolean;
  error: string | null;
}

const initialState: PendingRegistrationFeeState = {
  courses: [],
  batches: [],
  rows: [],
  totalRecords: 0,
  loading: false,
  error: null,
};

export const fetchCourses = createAsyncThunk(
  "pendingRegistrationFee/fetchCourses",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("pending-registration-fee/courses", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const fetchBatches = createAsyncThunk(
  "pendingRegistrationFee/fetchBatches",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("pending-registration-fee/batches", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const fetchReport = createAsyncThunk(
  "pendingRegistrationFee/fetchReport",
  async (params: ReportParams, { rejectWithValue }) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    );
    const res = await reduxApiClient.get("pending-registration-fee/report", cleanParams as any);
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

const pendingRegistrationFeeSlice = createSlice({
  name: "pendingRegistrationFee",
  initialState,
  reducers: {
    clearReport(state) {
      state.rows = [];
      state.totalRecords = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.fulfilled, (state, action: any) => { state.courses = action.payload; })
      .addCase(fetchBatches.fulfilled, (state, action: any) => { state.batches = action.payload; })
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.totalRecords = action.payload.totalRecords;
      })
      .addCase(fetchReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.rows = [];
        state.totalRecords = 0;
      });
  },
});

export const { clearReport } = pendingRegistrationFeeSlice.actions;
export default pendingRegistrationFeeSlice.reducer;