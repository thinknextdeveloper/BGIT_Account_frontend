import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface SubLedgerReportRow {
  DateEntry: string;
  ReceiptNo: number;
  IDNo: number;
  ClassRollNo: string | null;
  UniRollNo: string | null;
  StudentName: string;
  FatherName: string;
  amounts: Record<string, number>;
  total: number;
}

export interface SubLedgerReport {
  rows: SubLedgerReportRow[];
  columnTotals: Record<string, number>;
  grandTotal: number;
  subHeads: string[];
  totalRecords: number;
}

interface CustomSubLedgersState {
  colleges: string[];
  courses: string[];
  batches: string[];
  semesters: string[];
  subHeads: string[];
  sessions: string[];
  report: SubLedgerReport | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomSubLedgersState = {
  colleges: [],
  courses: [],
  batches: [],
  semesters: [],
  subHeads: [],
  sessions: [],
  report: null,
  loading: false,
  error: null,
};

export const fetchColleges = createAsyncThunk(
  "customSubLedgers/fetchColleges",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("master-course/colleges");
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const fetchCourses = createAsyncThunk(
  "customSubLedgers/fetchCourses",
  async (college: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("custom-sub-ledgers/courses", { college });
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const fetchBatches = createAsyncThunk(
  "customSubLedgers/fetchBatches",
  async (college: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("custom-sub-ledgers/batches", { college });
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const fetchSemesters = createAsyncThunk(
  "customSubLedgers/fetchSemesters",
  async (college: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("custom-sub-ledgers/semesters", { college });
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const fetchSubHeads = createAsyncThunk(
  "customSubLedgers/fetchSubHeads",
  async (college: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("custom-sub-ledgers/sub-heads", { college });
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const fetchSessions = createAsyncThunk(
  "customSubLedgers/fetchSessions",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("custom-sub-ledgers/sessions");
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const fetchReport = createAsyncThunk(
  "customSubLedgers/fetchReport",
  async (
    params: {
      college: string;
      course?: string;
      batch?: string;
      semester?: string;
      session?: string;
      dateFrom?: string;
      dateTo?: string;
      subHeads: string[];
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("custom-sub-ledgers/report", {
      ...params,
      subHeads: params.subHeads.join(","),
    } as any);
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

const customSubLedgersSlice = createSlice({
  name: "customSubLedgers",
  initialState,
  reducers: {
    clearReport(state) {
      state.report = null;
      state.error = null;
    },
    clearCourseBatchSemester(state) {
      state.courses = [];
      state.batches = [];
      state.semesters = [];
      state.subHeads = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColleges.fulfilled, (state, action: any) => {
        state.colleges = action.payload;
      })
      .addCase(fetchCourses.fulfilled, (state, action: any) => {
        state.courses = action.payload;
      })
      .addCase(fetchBatches.fulfilled, (state, action: any) => {
        state.batches = action.payload;
      })
      .addCase(fetchSemesters.fulfilled, (state, action: any) => {
        state.semesters = action.payload;
      })
      .addCase(fetchSubHeads.fulfilled, (state, action: any) => {
        state.subHeads = action.payload;
      })
      .addCase(fetchSessions.fulfilled, (state, action: any) => {
        state.sessions = action.payload;
      })
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.report = null;
      });
  },
});

export const { clearReport, clearCourseBatchSemester } = customSubLedgersSlice.actions;
export default customSubLedgersSlice.reducer;