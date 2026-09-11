import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface StaffInfo {
  CollegeName: string;
  IDNo: string;
  Name: string;
  FatherName: string;
  Department: string;
  Designation: string;
  HasSnap: number;
}

export interface UserRecord {
  UserName: string;
  Password: string;
  LoginType: string;
  ApplicationType: string;
  ApplicationName: string;
  CollegeName: string;
}

interface UserManagementState {
  loginTypes: string[];
  staff: StaffInfo | null;
  colleges: string[];
  selectedColleges: string[];
  selectAll: boolean;
  userRecords: UserRecord[];
  totalRecords: number;
  sectionsVisible: boolean; // mirrors GroupBox2.Visible / GroupBox3.Visible
  loading: boolean;
  generating: boolean;
  error: string | null;
  message: string | null;
}

const initialState: UserManagementState = {
  loginTypes: [],
  staff: null,
  colleges: [],
  selectedColleges: [],
  selectAll: false,
  userRecords: [],
  totalRecords: 0,
  sectionsVisible: false,
  loading: false,
  generating: false,
  error: null,
  message: null,
};

export const fetchLoginTypes = createAsyncThunk(
  "userManagement/fetchLoginTypes",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("user-management/login-types");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data as string[];
  }
);

export const findStaff = createAsyncThunk(
  "userManagement/findStaff",
  async (params: { idNo: string; loginType: string }, { rejectWithValue }) => {
    const res = await reduxApiClient.get("user-management/find", params);
    if (!res.success) return rejectWithValue(res.error?.message || "Sorry no record found");
    return res.data.data;
  }
);

export const generatePassword = createAsyncThunk(
  "userManagement/generatePassword",
  async (
    params: { idNo: string; loginType: string; colleges: string[] },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.post("user-management/generate-password", params);
    if (!res.success)
      return rejectWithValue({ message: res.error?.message, data: res.data?.data });
    return res.data;
  }
);

const userManagementSlice = createSlice({
  name: "userManagement",
  initialState,
  reducers: {
    // Mirrors: chkColleges_CheckedChanged
    toggleSelectAllColleges(state, action: PayloadAction<boolean>) {
      state.selectAll = action.payload;
      state.selectedColleges = action.payload ? [...state.colleges] : [];
    },
    toggleCollege(state, action: PayloadAction<string>) {
      const college = action.payload;
      if (state.selectedColleges.includes(college)) {
        state.selectedColleges = state.selectedColleges.filter((c) => c !== college);
        state.selectAll = false;
      } else {
        state.selectedColleges.push(college);
        if (state.selectedColleges.length === state.colleges.length) state.selectAll = true;
      }
    },
    // Mirrors: btnNewENtry_Click
    resetForm(state) {
      Object.assign(state, {
        ...initialState,
        loginTypes: state.loginTypes,
      });
    },
    clearMessage(state) {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoginTypes.fulfilled, (state, action) => {
        state.loginTypes = action.payload;
      })
      .addCase(findStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(findStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload.staff;
        state.userRecords = action.payload.userRecords;
        state.totalRecords = action.payload.totalRecords;
        state.colleges = action.payload.colleges;
        state.selectedColleges = [];
        state.selectAll = false;
        state.sectionsVisible = true;
      })
      .addCase(findStaff.rejected, (state, action) => {
        state.loading = false;
        state.staff = null;
        state.userRecords = [];
        state.totalRecords = 0;
        state.colleges = [];
        state.sectionsVisible = false;
        state.error = action.payload as string;
      })
      .addCase(generatePassword.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generatePassword.fulfilled, (state, action) => {
        state.generating = false;
        state.message = action.payload.message;
        state.userRecords = action.payload.data.userRecords;
        state.totalRecords = action.payload.data.totalRecords;
      })
      .addCase(generatePassword.rejected, (state, action: any) => {
        state.generating = false;
        state.error = action.payload?.message || "Generate password failed";
        if (action.payload?.data) {
          state.userRecords = action.payload.data.userRecords;
          state.totalRecords = action.payload.data.totalRecords;
        }
      });
  },
});

export const { toggleSelectAllColleges, toggleCollege, resetForm, clearMessage } =
  userManagementSlice.actions;

export default userManagementSlice.reducer;

// In store.ts: userManagement: userManagementReducer