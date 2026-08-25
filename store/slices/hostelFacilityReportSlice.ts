import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface HostelFacilityRow {
  IDNo: number;
  StudentName: string;
  FatherName: string;
  PhoneNo: string | null;
  StudentMobileNo: string | null;
  FatherMobileNo: string | null;
  PermanentAddress: string | null;
  HostelName: string;
  RoomType: string | null;
  HostelCharges: number;
}

interface HostelFacilityReportState {
  hostelNames: string[];
  rows: HostelFacilityRow[];
  totalStudents: number;
  loading: boolean;
  error: string | null;
}

const initialState: HostelFacilityReportState = {
  hostelNames: [],
  rows: [],
  totalStudents: 0,
  loading: false,
  error: null,
};

export const fetchHostelNames = createAsyncThunk(
  "hostelFacilityReport/fetchHostelNames",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("hostel-facility-report/hostel-names");
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

export const fetchReport = createAsyncThunk(
  "hostelFacilityReport/fetchReport",
  async (
    params: { collegeName?: string; allColleges: boolean; hostelName?: string },
    { rejectWithValue }
  ) => {
    const cleanParams = Object.fromEntries(
      Object.entries({
        collegeName: params.allColleges ? undefined : params.collegeName,
        allColleges: params.allColleges ? "true" : undefined,
        hostelName: params.hostelName || undefined,
      }).filter(([, v]) => v !== undefined && v !== "")
    );
    const res = await reduxApiClient.get("hostel-facility-report/report", cleanParams as any);
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

const hostelFacilityReportSlice = createSlice({
  name: "hostelFacilityReport",
  initialState,
  reducers: {
    clearReport(state) {
      state.rows = [];
      state.totalStudents = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostelNames.fulfilled, (state, action: any) => {
        state.hostelNames = action.payload;
      })
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.totalStudents = action.payload.totalStudents;
      })
      .addCase(fetchReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.rows = [];
        state.totalStudents = 0;
      });
  },
});

export const { clearReport } = hostelFacilityReportSlice.actions;
export default hostelFacilityReportSlice.reducer;