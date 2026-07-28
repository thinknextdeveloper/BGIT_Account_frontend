import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ReportRow {
  DateEntry: string;
  ReceiptNo: number | string;
  IDNo: string | number | null;
  ClassRollNo: string | null;
  UniRollNo: string | null;
  StudentName: string;
  FatherName: string;
  heads: Record<string, number>;
  total: number;
}

interface GetReportArgs {
  collegeName: string;
  dateFrom?: string;
  dateTo?: string;
  course?: string;
  batch?: string | number;
  semester?: string;
  session?: string;
  heads: string[];
}

interface CustomSubLedgersState {
  colleges: string[];
  collegesLoading: boolean;
  collegesError: string | null;

  heads: string[];
  courses: string[];
  batches: (string | number)[];
  semesters: string[];
  optionsLoading: boolean;
  optionsError: string | null;

  rows: ReportRow[];
  headers: string[];
  totalRecords: number;
  columnTotals: Record<string, number>;
  grandTotal: number;
  loading: boolean;
  error: string | null;
}

const initialState: CustomSubLedgersState = {
  colleges: [],
  collegesLoading: false,
  collegesError: null,

  heads: [],
  courses: [],
  batches: [],
  semesters: [],
  optionsLoading: false,
  optionsError: null,

  rows: [],
  headers: [],
  totalRecords: 0,
  columnTotals: {},
  grandTotal: 0,
  loading: false,
  error: null,
};

/* ------------------------------------------------------------------ */
/*  Thunks                                                              */
/* ------------------------------------------------------------------ */

export const getCustomSubLedgersColleges = createAsyncThunk(
  "customSubLedgers/getColleges",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`custom-sub-ledgers/colleges`);
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to load colleges");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getCustomSubLedgersOptions = createAsyncThunk(
  "customSubLedgers/getOptions",
  async (collegeName: string, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`custom-sub-ledgers/options`, { collegeName });
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to load options");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getCustomSubLedgersReport = createAsyncThunk(
  "customSubLedgers/getReport",
  async (params: GetReportArgs, { rejectWithValue }) => {
    try {
      const query: Record<string, string> = {
        collegeName: params.collegeName,
        heads: params.heads.join(","),
      };
      if (params.dateFrom) query.dateFrom = params.dateFrom;
      if (params.dateTo) query.dateTo = params.dateTo;
      if (params.course) query.course = params.course;
      if (params.batch !== undefined && params.batch !== "") query.batch = String(params.batch);
      if (params.semester) query.semester = params.semester;
      if (params.session) query.session = params.session;

      const response = await reduxApiClient.get(`custom-sub-ledgers/report`, query);
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to load report");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

/* ------------------------------------------------------------------ */
/*  Slice                                                               */
/* ------------------------------------------------------------------ */

const customSubLedgersSlice = createSlice({
  name: "customSubLedgers",
  initialState,
  reducers: {
    clearReport(state) {
      state.rows = [];
      state.headers = [];
      state.totalRecords = 0;
      state.columnTotals = {};
      state.grandTotal = 0;
      state.error = null;
    },
    clearCollegeOptions(state) {
      state.heads = [];
      state.courses = [];
      state.batches = [];
      state.semesters = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // -------- getCustomSubLedgersColleges --------
      .addCase(getCustomSubLedgersColleges.pending, (state) => {
        state.collegesLoading = true;
        state.collegesError = null;
      })
      .addCase(getCustomSubLedgersColleges.fulfilled, (state, action: any) => {
        state.collegesLoading = false;
        state.colleges = action.payload?.colleges ?? [];
      })
      .addCase(getCustomSubLedgersColleges.rejected, (state, action: any) => {
        state.collegesLoading = false;
        state.collegesError = action.payload || "Failed to load colleges";
      })

      // -------- getCustomSubLedgersOptions --------
      .addCase(getCustomSubLedgersOptions.pending, (state) => {
        state.optionsLoading = true;
        state.optionsError = null;
      })
      .addCase(getCustomSubLedgersOptions.fulfilled, (state, action: any) => {
        state.optionsLoading = false;
        const payload = action.payload ?? {};
        state.heads = payload.heads ?? [];
        state.courses = payload.courses ?? [];
        state.batches = payload.batches ?? [];
        state.semesters = payload.semesters ?? [];
      })
      .addCase(getCustomSubLedgersOptions.rejected, (state, action: any) => {
        state.optionsLoading = false;
        state.optionsError = action.payload || "Failed to load options";
        state.heads = [];
        state.courses = [];
        state.batches = [];
        state.semesters = [];
      })

      // -------- getCustomSubLedgersReport --------
      .addCase(getCustomSubLedgersReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomSubLedgersReport.fulfilled, (state, action: any) => {
        state.loading = false;
        const payload = action.payload ?? {};
        state.rows = payload.rows ?? [];
        state.headers = payload.headers ?? [];
        state.totalRecords = payload.totalRecords ?? 0;
        state.columnTotals = payload.columnTotals ?? {};
        state.grandTotal = payload.grandTotal ?? 0;
      })
      .addCase(getCustomSubLedgersReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to load report";
        state.rows = [];
        state.headers = [];
        state.totalRecords = 0;
        state.columnTotals = {};
        state.grandTotal = 0;
      });
  },
});

export const { clearReport, clearCollegeOptions } = customSubLedgersSlice.actions;
export default customSubLedgersSlice.reducer;