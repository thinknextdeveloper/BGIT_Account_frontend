import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface FacilityStudent {
  IDNo: number;
  StudentType: string;
  CollegeName: string;
  StudentName: string;
  FatherName: string;
  Course: string;
  Batch: number;
  Class: string;
  Session: string;
  Sex: string;
  LateralEntry: string;
  Scheme: string;
  Category: string;
  Quota: string;
  Facility: string;
  HostelName: string | null;
  RoomType: string | null;
  RoomNo: string | null;
  BusRoute: string | null;
  Stopage: string | null;
  PermanentAddress: string;
  RegistrationNo: string | null;
}

interface FacilityState {
  student: FacilityStudent | null;
  hostelNames: string[];
  roomTypes: string[];
  roomNumbers: string[];
  busRoutes: string[];
  stopages: string[];
  loading: boolean;
  updating: boolean;
  error: string | null;
}

const initialState: FacilityState = {
  student: null,
  hostelNames: [],
  roomTypes: [],
  roomNumbers: [],
  busRoutes: [],
  stopages: [],
  loading: false,
  updating: false,
  error: null,
};

export const findStudent = createAsyncThunk(
  "facility/findStudent",
  async (
    params: { idNo?: string; registrationNo?: string },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("facility/student", params as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.student;
  }
);

export const fetchHostelNames = createAsyncThunk(
  "facility/fetchHostelNames",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("facility/hostel-names");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchRoomTypes = createAsyncThunk(
  "facility/fetchRoomTypes",
  async (hostelName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("facility/room-types", { hostelName });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchRoomNumbers = createAsyncThunk(
  "facility/fetchRoomNumbers",
  async (
    params: { hostelName: string; roomType: string },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("facility/room-numbers", params);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchBusRoutes = createAsyncThunk(
  "facility/fetchBusRoutes",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("facility/bus-routes");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const fetchStopages = createAsyncThunk(
  "facility/fetchStopages",
  async (route: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("facility/stopages", { route });
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

export const updateFacility = createAsyncThunk(
  "facility/update",
  async (
    payload: {
      idNo: number;
      facility: {
        type: "Hostel" | "Bus" | "None";
        hostelName?: string;
        roomType?: string;
        roomNo?: string;
        route?: string;
        stopage?: string;
      };
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.put("facility/update", payload);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data;
  }
);

const facilitySlice = createSlice({
  name: "facility",
  initialState,
  reducers: {
    clearStudent(state) {
      state.student = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(findStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(findStudent.fulfilled, (state, action: any) => {
        state.loading = false;
        state.student = action.payload;
      })
      .addCase(findStudent.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.student = null;
      })
      .addCase(fetchHostelNames.fulfilled, (state, action: any) => {
        state.hostelNames = action.payload;
      })
      .addCase(fetchRoomTypes.fulfilled, (state, action: any) => {
        state.roomTypes = action.payload;
      })
      .addCase(fetchRoomNumbers.fulfilled, (state, action: any) => {
        state.roomNumbers = action.payload;
      })
      .addCase(fetchBusRoutes.fulfilled, (state, action: any) => {
        state.busRoutes = action.payload;
      })
      .addCase(fetchStopages.fulfilled, (state, action: any) => {
        state.stopages = action.payload;
      })
      .addCase(updateFacility.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateFacility.fulfilled, (state, action: any) => {
        state.updating = false;
        if (state.student) {
          state.student.Facility = action.payload.type;
          state.student.HostelName = action.payload.hostelName ?? null;
          state.student.RoomType = action.payload.roomType ?? null;
          state.student.RoomNo = action.payload.roomNo ?? null;
          state.student.BusRoute = action.payload.route ?? null;
          state.student.Stopage = action.payload.stopage ?? null;
        }
      })
      .addCase(updateFacility.rejected, (state, action: any) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export const { clearStudent } = facilitySlice.actions;
export default facilitySlice.reducer;