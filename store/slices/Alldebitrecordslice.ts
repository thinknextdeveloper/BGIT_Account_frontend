// store/slices/Alldebitrecordslice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// ---------------------------------------------------------------------
// Point this at wherever allDebitRecordRoutes.js is mounted in Express,
// e.g. app.use("/api/all-debit-record", require("./routes/allDebitRecordRoutes"))
// Must be NEXT_PUBLIC_-prefixed since this slice runs in a "use client" page.
// ---------------------------------------------------------------------
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api/all-debit-record";

export interface DebitRecordRow {
  IDNo: string | number;
  [column: string]: string | number | null | undefined;
}

export interface DebitRecordsResult {
  columns: string[];
  rows: DebitRecordRow[];
  totalRecords: number;
}

interface AllDebitRecordState {
  colleges: string[];
  courses: string[];
  batches: (string | number)[];
  semesters: string[];
  records: DebitRecordsResult | null;
  loading: boolean;
  error: string | null;
}

const initialState: AllDebitRecordState = {
  colleges: [],
  courses: [],
  batches: [],
  semesters: [],
  records: null,
  loading: false,
  error: null,
};

// ---- shared fetch helper -------------------------------------------------

async function getJSON<T>(path: string, params: Record<string, string | undefined> = {}): Promise<T> {
  const query = new URLSearchParams(
    Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]))
  ).toString();

  const res = await fetch(`${API_BASE}${path}${query ? `?${query}` : ""}`);

  let body: { success: boolean; data?: T; message?: string };
  try {
    body = await res.json();
  } catch {
    throw new Error(`Server returned a non-JSON response (HTTP ${res.status}).`);
  }

  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Request failed (HTTP ${res.status})`);
  }
  return body.data as T;
}

// ---- thunks ----------------------------------------------------------
// Mirrors: frmdebit.FillCollege(cmbcollege)
export const fetchColleges = createAsyncThunk<string[], void, { rejectValue: string }>(
  "allDebitRecord/fetchColleges",
  async (_, { rejectWithValue }) => {
    try {
      return await getJSON<string[]>("/colleges");
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// Mirrors: ShowCourse()
export const fetchCourses = createAsyncThunk<string[], string, { rejectValue: string }>(
  "allDebitRecord/fetchCourses",
  async (collegeName, { rejectWithValue }) => {
    try {
      return await getJSON<string[]>("/courses", { collegeName });
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// Mirrors: ShowBatch()
export const fetchBatches = createAsyncThunk<(string | number)[], string, { rejectValue: string }>(
  "allDebitRecord/fetchBatches",
  async (collegeName, { rejectWithValue }) => {
    try {
      return await getJSON<(string | number)[]>("/batches", { collegeName });
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

interface SemesterParams {
  collegeName: string;
  course?: string;
  batch?: string;
}

// Mirrors: cmbsem fill, scoped by whichever of course/batch are picked so far.
export const fetchSemesters = createAsyncThunk<string[], SemesterParams, { rejectValue: string }>(
  "allDebitRecord/fetchSemesters",
  async ({ collegeName, course, batch }, { rejectWithValue }) => {
    try {
      return await getJSON<string[]>("/semesters", { collegeName, course, batch });
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

interface DisplayParams {
  collegeName: string;
  course: string;
  batch: string;
  semester: string;
}

// Mirrors: btnShow_Click -> Display4(). A 404 ("No record Found") is a normal,
// expected outcome here — not an error — so it resolves with empty rows
// instead of rejecting, same as the VB MsgBox("No record found!") path.
export const fetchAllDebitRecords = createAsyncThunk<
  DebitRecordsResult,
  DisplayParams,
  { rejectValue: string }
>("allDebitRecord/fetchAllDebitRecords", async ({ collegeName, course, batch, semester }, { rejectWithValue }) => {
  const query = new URLSearchParams({ collegeName, course, batch, semester }).toString();
  const res = await fetch(`${API_BASE}/display?${query}`);

  let body: { success: boolean; data?: DebitRecordsResult; message?: string };
  try {
    body = await res.json();
  } catch {
    return rejectWithValue(`Server returned a non-JSON response (HTTP ${res.status}).`);
  }

  if (res.status === 404) {
    return { columns: [], rows: [], totalRecords: 0 };
  }
  if (!res.ok || body.success === false) {
    return rejectWithValue(body.message || `Request failed (HTTP ${res.status})`);
  }
  return body.data as DebitRecordsResult;
});

// ---- slice -------------------------------------------------------------

const allDebitRecordSlice = createSlice({
  name: "allDebitRecord",
  initialState,
  reducers: {
    clearCourses(state) {
      state.courses = [];
    },
    clearBatches(state) {
      state.batches = [];
    },
    clearSemesters(state) {
      state.semesters = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Colleges
      .addCase(fetchColleges.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.colleges = action.payload;
      })
      .addCase(fetchColleges.rejected, (state, action) => {
        state.error = action.payload ?? "Could not load colleges";
      })

      // Courses
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.error = action.payload ?? "Could not load courses";
      })

      // Batches
      .addCase(fetchBatches.fulfilled, (state, action: PayloadAction<(string | number)[]>) => {
        state.batches = action.payload;
      })
      .addCase(fetchBatches.rejected, (state, action) => {
        state.error = action.payload ?? "Could not load batches";
      })

      // Semesters
      .addCase(fetchSemesters.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.semesters = action.payload;
      })
      .addCase(fetchSemesters.rejected, (state, action) => {
        state.error = action.payload ?? "Could not load semesters";
      })

      // Records (this is the one the "Show" button's loading state tracks)
      .addCase(fetchAllDebitRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDebitRecords.fulfilled, (state, action: PayloadAction<DebitRecordsResult>) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchAllDebitRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Could not load records";
      });
  },
});

export const { clearCourses, clearBatches, clearSemesters } = allDebitRecordSlice.actions;
export default allDebitRecordSlice.reducer;