import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface FacultyRow {
  CollegeName: string | null;
  IDNo: number | string | null;
  CardID: string | null;
  Name: string | null;
  FatherName: string | null;
  MotherName: string | null;
  Designation: string | null;
  Department: string | null;
  Type: string | null;
  ShiftName: string | null;
  Gender: string | null;
  CorrespondanceAddress: string | null;
  PermanentAddress: string | null;
  ContactNo: string | null;
  MobileNo: string | null;
  EmailID: string | null;
  DateOfBirth: string | null;
  BloodGroup: string | null;
  DateOfJoining: string | null;
  SalaryAtJoining: number | null;
  SalaryAtPresent: number | null;
  Qualification: string | null;
  PreviousExperience: string | null;
  BankName: string | null;
  BankAccountNo: string | null;
  PANNo: string | null;
  Snap: string | null;
  Locked: boolean | string | null;
  DateOfLeaving: string | null;
  PF: number | null;
  Security: number | null;
  Advance: number | null;
  TDS: number | null;
  EmpCode: string | null;
  TotalLeaves: number | string | null;
  Level: string | null;
  DesignationLevel: string | null;
  AddressLine1: string | null;
  AddressLine2: string | null;
  AddressLine3: string | null;
  SmartCardAccess: string | null;
  DepartmentID: number | string | null;
  Pre_Year_Perforn: string | null;
  Pre_Year_Threats_Opp: string | null;
  OtherWork: string | null;
  OtherAchievement: string | null;
  Suggestion: string | null;
}

interface SearchFacultyState {
  colleges: string[];
  results: FacultyRow[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchFacultyState = {
  colleges: [],
  results: [],
  loading: false,
  error: null,
};

// Uses the existing master-course/colleges API
export const fetchColleges = createAsyncThunk(
  "searchFaculty/fetchColleges",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("master-course/colleges");
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const searchFaculty = createAsyncThunk(
  "searchFaculty/find",
  async (
    params: { facultyName: string; college?: string; allColleges: boolean },
    { rejectWithValue }
  ) => {
    const queryParams: Record<string, string> = {
      facultyName: params.facultyName,
      allColleges: String(params.allColleges),
    };
    if (!params.allColleges && params.college) {
      queryParams.college = params.college;
    }

    const res = await reduxApiClient.get("search-faculty-name/find", queryParams);
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

const searchFacultyNameSlice = createSlice({
  name: "searchFacultyName",
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
      .addCase(searchFaculty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchFaculty.fulfilled, (state, action: any) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchFaculty.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.results = [];
      });
  },
});

export const { clearResults } = searchFacultyNameSlice.actions;
export default searchFacultyNameSlice.reducer;
