import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

interface ChangePasswordState {
  userId: string;
  contextLoaded: boolean;
  submitting: boolean;
  error: string | null;
  message: string | null;
}

const initialState: ChangePasswordState = {
  userId: "",
  contextLoaded: false,
  submitting: false,
  error: null,
  message: null,
};

export const fetchContext = createAsyncThunk(
  "changePassword/fetchContext",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("change-password/context");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const submitPasswordChange = createAsyncThunk(
  "changePassword/submit",
  async (
    params: { oldPassword: string; newPassword: string; confirmPassword: string },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.post("change-password/submit", params);
    if (!res.success) return rejectWithValue(res.error?.message || "Submit failed");
    return res.data;
  }
);

const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState,
  reducers: {
    clearMessage(state) {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContext.fulfilled, (state, action) => {
        state.userId = action.payload.userId || "";
        state.contextLoaded = true;
      })
      .addCase(submitPasswordChange.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitPasswordChange.fulfilled, (state, action) => {
        state.submitting = false;
        state.message = action.payload.message;
      })
      .addCase(submitPasswordChange.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessage } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;

// In store.ts: changePassword: changePasswordReducer