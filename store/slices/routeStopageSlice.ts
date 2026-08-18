import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface RouteStopageRow {
  RouteID: number;
  BusRoute: string;
  StopageID: number;
  Stopage: string;
  StudentCount: number;
}

interface RouteStopageState {
  rows: RouteStopageRow[];
  collegeLabel: string;
  address: { addressLine1: string; addressLine2: string };
  loading: boolean;
  error: string | null;
}

const initialState: RouteStopageState = {
  rows: [],
  collegeLabel: "",
  address: { addressLine1: "", addressLine2: "" },
  loading: false,
  error: null,
};

export const fetchRouteStopageReport = createAsyncThunk(
  "routeStopage/fetchReport",
  async (collegeName: string | undefined, { rejectWithValue }) => {
    const res = await reduxApiClient.get("route-stopage/report", collegeName ? { collegeName } : {});
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

const routeStopageSlice = createSlice({
  name: "routeStopage",
  initialState,
  reducers: {
    clearReport(state) {
      state.rows = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRouteStopageReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRouteStopageReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.collegeLabel = action.payload.collegeLabel;
        state.address = action.payload.address;
      })
      .addCase(fetchRouteStopageReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.rows = [];
      });
  },
});

export const { clearReport } = routeStopageSlice.actions;
export default routeStopageSlice.reducer;