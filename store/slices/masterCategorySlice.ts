import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface CategoryRow {
  CollegeName: string;
  Category: string;
}

interface MasterCategoryState {
  rows: CategoryRow[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: MasterCategoryState = {
  rows: [],
  loading: false,
  saving: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "masterCategory/fetchCategories",
  async (_, { rejectWithValue }) => {
    const response = await reduxApiClient.get("master-category");
    if (!response.success) return rejectWithValue(response.error?.message);
    return response.data.data;
  }
);

export const addCategory = createAsyncThunk(
  "masterCategory/addCategory",
  async (
    { collegeName, category }: { collegeName: string; category: string },
    { rejectWithValue }
  ) => {
    const response = await reduxApiClient.post("master-category", { collegeName, category });
    if (!response.success) return rejectWithValue(response.error?.message);
    return response.data.data;
  }
);

const masterCategorySlice = createSlice({
  name: "masterCategory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addCategory.pending, (state) => {
        state.saving = true;
      })
      .addCase(addCategory.fulfilled, (state, action: any) => {
        state.saving = false;
        state.rows.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action: any) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export default masterCategorySlice.reducer;