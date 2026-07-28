import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface FeeRow {
  CollegeName: string;
  Course: string;
  Batch: number;
  Semester: string;
  Category: string;
  ModeOfAdmission: string;
  Scheme: string;
  Head: string;
  Amount: number;
  isNew?: boolean;
}

interface MasterAnnualFeeState {
  colleges: string[];
  courses: string[];
  batches: string[];
  semesters: { semester: string; semesterId: number }[];
  feeRows: FeeRow[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: MasterAnnualFeeState = {
  colleges: [],
  courses: [],
  batches: [],
  semesters: [],
  feeRows: [],
  loading: false,
  saving: false,
  error: null,
};

export const fetchColleges = createAsyncThunk(
  "masterAnnualFee/fetchColleges",
  async (_, { rejectWithValue }) => {
    const response = await reduxApiClient.get("master-course/colleges");
    if (!response.success) return rejectWithValue(response.error?.message);
    return response.data.data;
  }
);

export const fetchCourses = createAsyncThunk(
  "masterAnnualFee/fetchCourses",
  async (collegeName: string, { rejectWithValue }) => {
    const response = await reduxApiClient.get("master-course/courses", { collegeName });
    if (!response.success) return rejectWithValue(response.error?.message);
    return response.data.data;
  }
);

export const fetchBatches = createAsyncThunk(
  "masterAnnualFee/fetchBatches",
  async (
    { collegeName, course }: { collegeName: string; course: string },
    { rejectWithValue }
  ) => {
    const response = await reduxApiClient.get("master-course/batches", { collegeName, course });
    if (!response.success) return rejectWithValue(response.error?.message);
    return response.data.data;
  }
);

export const fetchSemesters = createAsyncThunk(
  "masterAnnualFee/fetchSemesters",
  async (
    { collegeName, course, batch }: { collegeName: string; course: string; batch: string },
    { rejectWithValue }
  ) => {
    const response = await reduxApiClient.get("master-course/semesters", {
      collegeName,
      course,
      batch,
    });
    if (!response.success) return rejectWithValue(response.error?.message);
    return response.data.data;
  }
);

export const fetchFeeStructure = createAsyncThunk(
  "masterAnnualFee/fetchFeeStructure",
  async (
    params: { collegeName: string; course: string; batch: string; semester: string },
    { rejectWithValue }
  ) => {
    const response = await reduxApiClient.get("master-annual-fee/display", params);
    if (!response.success) return rejectWithValue(response.error?.message);
    return response.data.data;
  }
);

export const saveFeeStructure = createAsyncThunk(
  "masterAnnualFee/saveFeeStructure",
  async (rows: FeeRow[], { rejectWithValue }) => {
    const response = await reduxApiClient.post("master-annual-fee/save", { rows });
    if (!response.success) return rejectWithValue(response.error?.message);
    return response.data.data;
  }
);

const masterAnnualFeeSlice = createSlice({
  name: "masterAnnualFee",
  initialState,
  reducers: {
    resetCourses(state) {
      state.courses = [];
      state.batches = [];
      state.semesters = [];
      state.feeRows = [];
    },
    resetBatches(state) {
      state.batches = [];
      state.semesters = [];
      state.feeRows = [];
    },
    resetSemesters(state) {
      state.semesters = [];
      state.feeRows = [];
    },
    updateFeeRow(state, action) {
      const { index, field, value } = action.payload;
      if (state.feeRows[index]) {
        (state.feeRows[index] as any)[field] = value;
      }
    },
    addEmptyRow(state, action) {
      state.feeRows.push(action.payload);
    },
    clearFeeStructure(state) {
      state.feeRows = [];
      state.error = null;
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
      .addCase(fetchFeeStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeeStructure.fulfilled, (state, action: any) => {
        state.loading = false;
        state.feeRows = action.payload;
      })
      .addCase(fetchFeeStructure.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveFeeStructure.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveFeeStructure.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveFeeStructure.rejected, (state, action: any) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  resetCourses,
  resetBatches,
  resetSemesters,
  updateFeeRow,
  addEmptyRow,
  clearFeeStructure,
} = masterAnnualFeeSlice.actions;

export default masterAnnualFeeSlice.reducer;