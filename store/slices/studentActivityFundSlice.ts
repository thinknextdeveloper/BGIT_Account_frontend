import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface FundRow {
  Session: string;
  ReceiptDate: string;
  ReceiptNo: string;
  IDNo: number;
  StudentName: string;
  Scheme: string;
  Category: string;
  StudentFund: number;
  AnnualCultureFund: number;
  AudioVisual: number;
  CommonRoom: number;
  LibraryFund: number;
  MagazineCharge: number;
  NCCNSS: number;
  CycleScooterCharge: number;
  MedicalFund: number;
  DrawingBoard: number;
  GeneralMaintenance: number;
  Recreation: number;
  StudentChapter: number;
  StationeryCharge: number;
  ValedictoryFund: number;
  IdentityCard: number;
  RefundableSecurity: number;
  Total: number;
}

interface ReportParams {
  collegeName: string;
  course?: string;
  batch?: string;
  semester?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface StudentActivityFundState {
  courses: string[];
  semesters: string[];
  batches: string[];
  session: string;
  rows: FundRow[];
  totals: Record<string, number>;
  totalRecords: number;
  loading: boolean;
  error: string | null;
}

const initialState: StudentActivityFundState = {
  courses: [],
  semesters: [],
  batches: [],
  session: "",
  rows: [],
  totals: {},
  totalRecords: 0,
  loading: false,
  error: null,
};

export const fetchCourses = createAsyncThunk(
  "studentActivityFund/fetchCourses",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("student-activity-fund/courses", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const fetchSemesters = createAsyncThunk(
  "studentActivityFund/fetchSemesters",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("student-activity-fund/semesters", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const fetchBatches = createAsyncThunk(
  "studentActivityFund/fetchBatches",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("student-activity-fund/batches", { collegeName });
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const fetchCurrentSession = createAsyncThunk(
  "studentActivityFund/fetchCurrentSession",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("student-activity-fund/current-session");
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const fetchReport = createAsyncThunk(
  "studentActivityFund/fetchReport",
  async (params: ReportParams, { rejectWithValue }) => {
    // Strip undefined/null/empty-string values so they're omitted from the query
    // string entirely, instead of serializing to the literal text "undefined"
    // (which was reaching the backend and breaking int-typed columns like Batch).
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== ""
      )
    );
    const res = await reduxApiClient.get("student-activity-fund/report", cleanParams as any);
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

const studentActivityFundSlice = createSlice({
  name: "studentActivityFund",
  initialState,
  reducers: {
    clearReport(state) {
      state.rows = [];
      state.totals = {};
      state.totalRecords = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.fulfilled, (state, action: any) => { state.courses = action.payload; })
      .addCase(fetchSemesters.fulfilled, (state, action: any) => { state.semesters = action.payload; })
      .addCase(fetchBatches.fulfilled, (state, action: any) => { state.batches = action.payload; })
      .addCase(fetchCurrentSession.fulfilled, (state, action: any) => { state.session = action.payload; })
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.totals = action.payload.totals;
        state.totalRecords = action.payload.totalRecords;
        state.session = action.payload.session;
      })
      .addCase(fetchReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.rows = [];
        state.totals = {};
        state.totalRecords = 0;
      });
  },
});

export const { clearReport } = studentActivityFundSlice.actions;
export default studentActivityFundSlice.reducer;