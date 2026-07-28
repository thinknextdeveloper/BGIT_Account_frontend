import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

interface HostelBusValidity {
  collegeName: string;
  batch: string;
  semester: string;
  facility: string;
  validUpTo: string;
}

interface HostelBusValidityState {
  loading: boolean;
  list: HostelBusValidity[];
  error: string | null;
}

const initialState: HostelBusValidityState = {
  loading: false,
  list: [],
  error: null,
};

// ====================== DISPLAY ALL ======================
export const displayAll = createAsyncThunk(
  "hostelBus/displayAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(
        "master-hostel-bus-validity/display-all"
      );

      if (!response.success) {
        return rejectWithValue(response.error?.message);
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

// ====================== DISPLAY FILTER ======================
export const display = createAsyncThunk(
  "hostelBus/display",
  async (
    params: {
      collegeName: string;
      batch?: string;
      semester?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await reduxApiClient.get(
        "master-hostel-bus-validity/display",
        params
      );

      if (!response.success) {
        return rejectWithValue(response.error?.message);
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

// ====================== ADD ======================
export const addRecord = createAsyncThunk(
  "hostelBus/add",
  async (
    data: {
      collegeName: string;
      batch: string;
      semester: string;
      facility: string;
      validUpTo: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await reduxApiClient.post(
        "master-hostel-bus-validity/add",
        data
      );

      if (!response.success) {
        return rejectWithValue(response.error?.message);
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

// ====================== UPDATE ======================
export const updateRecord = createAsyncThunk(
  "hostelBus/update",
  async (
    data: {
      originalKey: {
        collegeName: string;
        batch: string;
        semester: string;
        facility: string;
      };
      newValues: {
        collegeName: string;
        batch: string;
        semester: string;
        facility: string;
        validUpTo: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await reduxApiClient.put(
        "master-hostel-bus-validity/edit",
        data
      );

      if (!response.success) {
        return rejectWithValue(response.error?.message);
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

// ====================== SLICE ======================
const hostelBusValiditySlice = createSlice({
  name: "hostelBusValidity",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Display All
      .addCase(displayAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(displayAll.fulfilled, (state, action: any) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(displayAll.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Display Filter
      .addCase(display.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(display.fulfilled, (state, action: any) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(display.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRecord.fulfilled, (state, action: any) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(addRecord.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRecord.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateRecord.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = hostelBusValiditySlice.actions;

export default hostelBusValiditySlice.reducer;