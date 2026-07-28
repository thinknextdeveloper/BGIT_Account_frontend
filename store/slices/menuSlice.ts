import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

interface MenuItem {
  id: number;
  name: string;
  hierar: string;
  text: string;
  desc: string | null;
  func: string;
  children: MenuItem[];
}

interface MenuState {
  loading: boolean;
  items: MenuItem[];
  error: string | null;
}

const initialState: MenuState = {
  loading: false,
  items: [],
  error: null,
};

export const fetchMenu = createAsyncThunk(
  "menu/fetchMenu",
  async (_, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get("menu");

      if (!response.success) {
        return rejectWithValue(response.error?.message);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    clearMenu(state) {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMenu.fulfilled, (state, action: any) => {
        state.loading = false;
        state.items = action.payload.data;
      })

      .addCase(fetchMenu.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMenu } = menuSlice.actions;

export default menuSlice.reducer;