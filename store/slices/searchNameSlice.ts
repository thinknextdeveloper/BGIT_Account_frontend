import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface StudentNameSearchRow {
  CollegeName?: string;
  StudentName: string;
  IDNo: number | string;
  Class: string;
  FatherName: string;
  PhoneNo: string | null;
  StudentMobileNo: string | null;
  FatherMobileNo: string | null;
  MotherMobileNo: string | null;
  PermanentAddress: string;
}

interface SearchNameState {
  colleges: string[];
  results: StudentNameSearchRow[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchNameState = {
  colleges: [],
  results: [],
  loading: false,
  error: null,
};

export const fetchColleges = createAsyncThunk(
  "searchName/fetchColleges",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("master-course/colleges");
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const searchByName = createAsyncThunk(
  "searchName/find",
  async (
    params: {
      studentName: string;
      college?: string;
      allColleges: boolean;
      searchType: "part" | "exact";
    },
    { rejectWithValue }
  ) => {
    const queryParams: Record<string, string> = {
      studentName: params.studentName,
      allColleges: String(params.allColleges),
      searchType: params.searchType,
    };
    if (!params.allColleges && params.college) {
      queryParams.college = params.college;
    }
    const res = await reduxApiClient.get("search-name/students", queryParams);
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data?.data ?? [];
  }
);

const searchNameSlice = createSlice({
  name: "searchName",
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
        state.colleges = action.payload || [];
      })
      .addCase(searchByName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchByName.fulfilled, (state, action: any) => {
        state.loading = false;
        state.results = action.payload || [];
      })
      .addCase(searchByName.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.results = [];
      });
  },
});

export const { clearResults } = searchNameSlice.actions;
export default searchNameSlice.reducer;
