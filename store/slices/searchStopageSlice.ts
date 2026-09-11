import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface StopageRow {
  Stopage: string | null;
  Route: string | null;
  Fee: number | string | null;
}

interface SearchStopageState {
  results: StopageRow[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchStopageState = {
  results: [],
  loading: false,
  error: null,
};

export const searchStopage = createAsyncThunk(
  "searchStopage/find",
  async (stopage: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("search-stopage/find", { stopage });
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

const searchStopageSlice = createSlice({
  name: "searchStopage",
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchStopage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchStopage.fulfilled, (state, action: any) => {
        state.loading = false;
        state.results = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(searchStopage.rejected, (state, action: any) => {
        state.loading = false;
        state.results = [];
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearResults } = searchStopageSlice.actions;
export default searchStopageSlice.reducer;
