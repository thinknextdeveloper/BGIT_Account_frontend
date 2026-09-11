import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface MenuItem {
  ID_ITEM: number;
  TEXT: string;
}

export interface StaffInfo {
  CollegeName: string;
  IDNo: string;
  Name: string;
  FatherName: string;
  Department: string;
  Designation: string;
  HasSnap: number;
}

interface AssignRightsState {
  loginTypes: string[];
  staff: StaffInfo | null;
  hasPassword: boolean;
  availableItems: MenuItem[];
  assignedItems: MenuItem[];
  selectedAvailableIds: number[];
  selectedAssignedIds: number[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  message: string | null;
}

const initialState: AssignRightsState = {
  loginTypes: [],
  staff: null,
  hasPassword: false,
  availableItems: [],
  assignedItems: [],
  selectedAvailableIds: [],
  selectedAssignedIds: [],
  loading: false,
  submitting: false,
  error: null,
  message: null,
};

export const fetchLoginTypes = createAsyncThunk(
  "assignRights/fetchLoginTypes",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("assign-rights/login-types");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data as string[];
  }
);

export const findStaff = createAsyncThunk(
  "assignRights/findStaff",
  async (params: { idNo: string; loginType: string }, { rejectWithValue }) => {
    const res = await reduxApiClient.get("assign-rights/find", params);
    if (!res.success) return rejectWithValue(res.error?.message || "Sorry no record found");
    return res.data.data;
  }
);

export const submitRights = createAsyncThunk(
  "assignRights/submitRights",
  async (
    params: { idNo: string; loginType: string; itemIds: number[] },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.post("assign-rights/submit", params);
    if (!res.success) return rejectWithValue(res.error?.message || "Submit failed");
    return res.data;
  }
);

const assignRightsSlice = createSlice({
  name: "assignRights",
  initialState,
  reducers: {
    // Mirrors: btnsingleforwardselect_Click — move selected available items right
    moveSelectedToAssigned(state) {
      const moving = state.availableItems.filter((i) =>
        state.selectedAvailableIds.includes(i.ID_ITEM)
      );
      const alreadyAssignedIds = new Set(state.assignedItems.map((i) => i.ID_ITEM));
      for (const item of moving) {
        if (!alreadyAssignedIds.has(item.ID_ITEM)) state.assignedItems.push(item);
      }
      state.selectedAvailableIds = [];
    },
    // Mirrors: btnMultipleforwardselect_Click — move everything right
    moveAllToAssigned(state) {
      state.assignedItems = [...state.availableItems];
      state.selectedAvailableIds = [];
    },
    // Mirrors: btnsinglebackwordselect_Click — remove selected from assigned
    removeSelectedFromAssigned(state) {
      state.assignedItems = state.assignedItems.filter(
        (i) => !state.selectedAssignedIds.includes(i.ID_ITEM)
      );
      state.selectedAssignedIds = [];
    },
    // Mirrors: btnMultipleBackwordSelect_Click — clear assigned
    clearAssigned(state) {
      state.assignedItems = [];
      state.selectedAssignedIds = [];
    },
    setSelectedAvailableIds(state, action: PayloadAction<number[]>) {
      state.selectedAvailableIds = action.payload;
    },
    setSelectedAssignedIds(state, action: PayloadAction<number[]>) {
      state.selectedAssignedIds = action.payload;
    },
    // Mirrors: btnNewENtry_Click
    resetForm(state) {
      Object.assign(state, {
        ...initialState,
        loginTypes: state.loginTypes, // keep the dropdown options loaded
      });
    },
    clearMessage(state) {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoginTypes.fulfilled, (state, action) => {
        state.loginTypes = action.payload;
      })
      .addCase(findStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(findStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload.staff;
        state.hasPassword = action.payload.hasPassword;
        state.availableItems = action.payload.availableItems;
        state.assignedItems = action.payload.assignedItems;
        if (action.payload.message) state.message = action.payload.message;
      })
      .addCase(findStaff.rejected, (state, action) => {
        state.loading = false;
        state.staff = null;
        state.hasPassword = false;
        state.availableItems = [];
        state.assignedItems = [];
        state.error = action.payload as string;
      })
      .addCase(submitRights.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitRights.fulfilled, (state, action) => {
        state.submitting = false;
        state.message = action.payload.message;
      })
      .addCase(submitRights.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  moveSelectedToAssigned,
  moveAllToAssigned,
  removeSelectedFromAssigned,
  clearAssigned,
  setSelectedAvailableIds,
  setSelectedAssignedIds,
  resetForm,
  clearMessage,
} = assignRightsSlice.actions;

export default assignRightsSlice.reducer;

// In store.ts: assignRights: assignRightsReducer