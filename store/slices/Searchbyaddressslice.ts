import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface AddressSearchRow {
  IDNo: number;
  StudentName: string;
  Class: string;
  FatherName: string;
  PhoneNo: string | null;
  StudentMobileNo: string | null;
  FatherMobileNo: string | null;
  MotherMobileNo: string | null;
  PermanentAddress: string;
}

interface SearchByAddressState {
  colleges: string[];
  results: AddressSearchRow[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchByAddressState = {
  colleges: [],
  results: [],
  loading: false,
  error: null,
};

export const fetchColleges = createAsyncThunk(
  "searchByAddress/fetchColleges",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("master-course/colleges");
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const searchByAddress = createAsyncThunk(
  "searchByAddress/find",
  async (
    params: { address: string; college?: string; allColleges: boolean },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("search-by-address/students", params as any);
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

const searchByAddressSlice = createSlice({
  name: "searchByAddress",
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
      .addCase(searchByAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchByAddress.fulfilled, (state, action: any) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchByAddress.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.results = [];
      });
  },
});

export const { clearResults } = searchByAddressSlice.actions;
export default searchByAddressSlice.reducer;