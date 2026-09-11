import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface DevFundRow {
  session: string;
  collegeName: string;
  course: string;
  batch: number;
  semester: string;
  semesterId?: number;
  scheme: string;
  category: string;
  laboratory: number;
  workshop: number;
  computerAndPeripherals: number;
  itConnectivity: number;
  civilWorks: number;
  facultyImprovementProgram: number;
  improvementLibraryFacilities: number;
  educationalTour: number;
  dailyConsumableGoodsForPracticals: number;
  contingency: number;
  total?: number;
}

interface MasterDevFundState {
  rows: DevFundRow[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: MasterDevFundState = {
  rows: [],
  loading: false,
  saving: false,
  error: null,
};

export const displayDevFund = createAsyncThunk(
  "masterDevFund/display",
  async (
    params: { collegeName: string; course?: string; batch?: string; semester?: string },
    { rejectWithValue }
  ) => {
    const response = await reduxApiClient.get("master-dev-fund/display", params as any);
    if (!response.success) return rejectWithValue(response.error?.message);
    return response.data.data;
  }
);

export const addDevFundRow = createAsyncThunk(
  "masterDevFund/add",
  async (row: DevFundRow, { rejectWithValue }) => {
    const response = await reduxApiClient.post("master-dev-fund/add", row);
    if (!response.success) return rejectWithValue(response.error?.message);
    return response.data.data;
  }
);

export const editDevFundRow = createAsyncThunk(
  "masterDevFund/edit",
  async (
    data: { originalKey: Partial<DevFundRow>; newValues: DevFundRow },
    { rejectWithValue }
  ) => {
    const response = await reduxApiClient.put("master-dev-fund/edit", data);
    if (!response.success) return rejectWithValue(response.error?.message);
    return response.data.data;
  }
);

const masterDevFundSlice = createSlice({
  name: "masterDevFund",
  initialState,
  reducers: {
    clearRows(state) {
      state.rows = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(displayDevFund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(displayDevFund.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload;
      })
      .addCase(displayDevFund.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addDevFundRow.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addDevFundRow.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(addDevFundRow.rejected, (state, action: any) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(editDevFundRow.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(editDevFundRow.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(editDevFundRow.rejected, (state, action: any) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearRows } = masterDevFundSlice.actions;
export default masterDevFundSlice.reducer;