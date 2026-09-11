import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface HostelReportRow {
  IDNo: number;
  RegistrationNo: number | null;
  UniRollNo: string | null;
  StudentName: string;
  Class: string;
  CollegeName: string;
  HostelName: string;
  RoomType?: string | null;
  RoomNo?: string | null;
}

interface ReportParams {
  collegeName?: string;
  course?: string;
  batch?: string;
  session?: string;
  hostelName: string;
}

interface HostelReportState {
  hostelNames: string[];
  sessions: string[];
  courses: string[];
  batches: string[];
  rows: HostelReportRow[];
  totalCredit: number;
  totalDebit: number;
  balance: number;
  loading: boolean;
  error: string | null;
}

const initialState: HostelReportState = {
  hostelNames: [],
  sessions: [],
  courses: [],
  batches: [],
  rows: [],
  totalCredit: 0,
  totalDebit: 0,
  balance: 0,
  loading: false,
  error: null,
};

export const fetchHostelNames = createAsyncThunk(
  "hostelReport/fetchHostelNames",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("hostel-report/hostel-names");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchSessions = createAsyncThunk(
  "hostelReport/fetchSessions",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("hostel-report/sessions");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchCourses = createAsyncThunk(
  "hostelReport/fetchCourses",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("hostel-report/courses", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchBatches = createAsyncThunk(
  "hostelReport/fetchBatches",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("hostel-report/batches", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchHostelReport = createAsyncThunk(
  "hostelReport/fetchReport",
  async (params: ReportParams, { rejectWithValue }) => {
    const res = await reduxApiClient.get("hostel-report/report", params as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data; // { rows, totalCredit, totalDebit, balance, totalStudents }
  }
);

export const fetchHostelPendingReport = createAsyncThunk(
  "hostelReport/fetchPendingReport",
  async (params: ReportParams, { rejectWithValue }) => {
    const res = await reduxApiClient.get("hostel-report/pending-report", params as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

const hostelReportSlice = createSlice({
  name: "hostelReport",
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
      .addCase(fetchHostelNames.fulfilled, (state, action: any) => {
        state.hostelNames = action.payload;
      })
      .addCase(fetchSessions.fulfilled, (state, action: any) => {
        state.sessions = action.payload;
      })
      .addCase(fetchCourses.fulfilled, (state, action: any) => {
        state.courses = action.payload;
      })
      .addCase(fetchBatches.fulfilled, (state, action: any) => {
        state.batches = action.payload;
      })
      .addMatcher(
        (a) => a.type === fetchHostelReport.pending.type || a.type === fetchHostelPendingReport.pending.type,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (a) => a.type === fetchHostelReport.fulfilled.type || a.type === fetchHostelPendingReport.fulfilled.type,
        (state, action: any) => {
          state.loading = false;
          state.rows = action.payload.rows;
          state.totalCredit = action.payload.totalCredit ?? 0;
          state.totalDebit = action.payload.totalDebit ?? 0;
          state.balance = action.payload.balance ?? 0;
        }
      )
      .addMatcher(
        (a) => a.type === fetchHostelReport.rejected.type || a.type === fetchHostelPendingReport.rejected.type,
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload;
          state.rows = [];
        }
      );
  },
});

export const { clearReport } = hostelReportSlice.actions;
export default hostelReportSlice.reducer;