import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

// Matches the corrected backend query (mirrors VB frmChangeFacility.Display()
// exactly). Fields removed vs. the old interface, and why:
//  - RoomNo:  not a column on Admissions — VB never reads it; this was the
//             cause of the "Invalid column name 'RoomNo'" 500.
//  - Scheme, Quota: commented out in the VB source (tried and abandoned),
//             meaning these columns don't exist on Admissions either.
//  - Category -> FeeCategory: that's the real column name in VB.
// Fields added:
//  - BusFee, HostelCharges: VB selects both (used to populate
//    txtFacilityAmount) but the old Node query dropped them.
//  - Snap: the student's photo. Backend now sends this as a base64 data
//    URL string (e.g. "data:image/jpeg;base64,...") rather than a raw
//    Buffer, so it can be dropped straight into an <img src=>.
// Session is NOT part of this payload — VB fetches it separately via
// frmdebit.ShowSession(), not from the Admissions row. TODO: wire up a
// dedicated session endpoint/selector if the UI needs to display it.
export interface FacilityStudent {
  IDNo: number;
  StudentType: string;
  CollegeName: string;
  StudentName: string;
  FatherName: string;
  Course: string;
  Batch: number;
  Class: string;
  Sex: string;
  LateralEntry: string;
  FeeCategory: string;
  Facility: string;
  HostelName: string | null;
  RoomType: string | null;
  HostelCharges: number | null;
  BusRoute: string | null;
  BusFee: number | null;
  Stopage: string | null;
  PermanentAddress: string;
  RegistrationNo: string | null;
  Snap: string | null;
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