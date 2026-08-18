import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface RouteWiseStudent {
  Session: string;
  IDNo: number;
  StudentName: string;
  FatherName: string;
  PhoneNo: string | null;
  StudentMobileNo: string | null;
  FatherMobileNo: string | null;
  PermanentAddress: string | null;
}

export interface RouteWiseGroup {
  stopageId: number;
  stopage: string;
  students: RouteWiseStudent[];
}

interface RouteOption {
  routeId: number;
  route: string;
}

interface RouteWiseReportState {
  routes: RouteOption[];
  groups: RouteWiseGroup[];
  totalStudents: number;
  totalStopages: number;
  loading: boolean;
  error: string | null;
}

const initialState: RouteWiseReportState = {
  routes: [],
  groups: [],
  totalStudents: 0,
  totalStopages: 0,
  loading: false,
  error: null,
};

export const fetchRoutes = createAsyncThunk(
  "routeWiseReport/fetchRoutes",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("route-wise-report/routes");
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

export const fetchRouteWiseReport = createAsyncThunk(
  "routeWiseReport/fetchReport",
  async (params: { route: string; session?: string }, { rejectWithValue }) => {
    const res = await reduxApiClient.get("route-wise-report/report", params as any);
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

const routeWiseReportSlice = createSlice({
  name: "routeWiseReport",
  initialState,
  reducers: {
    clearReport(state) {
      state.groups = [];
      state.totalStudents = 0;
      state.totalStopages = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutes.fulfilled, (state, action: any) => {
        state.routes = action.payload;
      })
      .addCase(fetchRouteWiseReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRouteWiseReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.groups = action.payload.groups;
        state.totalStudents = action.payload.totalStudents;
        state.totalStopages = action.payload.totalStopages;
      })
      .addCase(fetchRouteWiseReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.groups = [];
      });
  },
});

export const { clearReport } = routeWiseReportSlice.actions;
export default routeWiseReportSlice.reducer;