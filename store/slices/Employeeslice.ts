import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface EmployeeRecord {
  IDNo?: string;
  CollegeName?: string;
  Name?: string;
  FatherName?: string;
  MotherName?: string;
  Gender?: "Male" | "Female" | "";
  DateOfBirth?: string;
  DateofJoining?: string;
  DateofLeaving?: string;
  Department?: string;
  Designation?: string;
  Qualification?: string;
  CorrespondanceAddress?: string;
  PermanentAddress?: string;
  ContactNo?: string;
  MobileNo?: string;
  EmailID?: string;
  SalaryAtJoining?: number | string;
  SalaryAtPresent?: number | string;
  PreviousExperience?: string;
  BankName?: string;
  BankAccountNo?: string;
  PANNo?: string;
  Photo?: string;
}

interface EmployeeState {
  record: EmployeeRecord | null;
  isNewEntry: boolean;
  banks: string[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  record: null,
  isNewEntry: false,
  banks: [],
  loading: false,
  saving: false,
  error: null,
};

/* ------------------------------------------------------------------ */
/*  Helper: same defensive unwrap used across the app's other slices    */
/* ------------------------------------------------------------------ */

function unwrap(response: any): any {
  let node = response;
  while (node && typeof node === "object" && !Array.isArray(node)) {
    if (node.success === false) {
      throw new Error(node.message || "Request failed");
    }
    if (Object.prototype.hasOwnProperty.call(node, "data")) {
      node = node.data;
      continue;
    }
    break;
  }
  return node;
}

/* ------------------------------------------------------------------ */
/*  Thunks — employee record (Find / Update)                            */
/* ------------------------------------------------------------------ */

export const fetchEmployee = createAsyncThunk(
  "employee/fetch",
  async (idNo: string, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get("employees", { idNo });
      return unwrap(response);
    } catch (err: any) {
      if (err?.status === 404 || err?.response?.status === 404) {
        return null; // "Sorry no record found"
      }
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employee/update",
  async (data: EmployeeRecord, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.put("employees", data);
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

/* ------------------------------------------------------------------ */
/*  Thunks — bank master list (the "..." add-bank dialog)                */
/* ------------------------------------------------------------------ */

export const getBanks = createAsyncThunk(
  "employee/getBanks",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get("employees/masters/banks");
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const addBank = createAsyncThunk(
  "employee/addBank",
  async (bankName: string, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.post("employees/masters/banks", { bankName });
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

/* ------------------------------------------------------------------ */
/*  Slice                                                               */
/* ------------------------------------------------------------------ */

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    startNewEntry(state) {
      state.record = { IDNo: "" };
      state.isNewEntry = true;
      state.error = null;
    },
    updateField(state, action: { payload: { field: keyof EmployeeRecord; value: any } }) {
      if (!state.record) state.record = { IDNo: "" };
      (state.record as any)[action.payload.field] = action.payload.value;
    },
    clearEmployeeError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------- fetchEmployee --------
      .addCase(fetchEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployee.fulfilled, (state, action: any) => {
        state.loading = false;
        if (action.payload) {
          state.record = action.payload;
          state.isNewEntry = false;
        } else {
          state.record = { IDNo: "" };
          state.isNewEntry = true;
          state.error = "Sorry no record found";
        }
      })
      .addCase(fetchEmployee.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to load record";
      })

      // -------- updateEmployee --------
      .addCase(updateEmployee.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action: any) => {
        state.saving = false;
        state.record = action.payload;
      })
      .addCase(updateEmployee.rejected, (state, action: any) => {
        state.saving = false;
        state.error = action.payload || "Failed to save record";
      })

      // -------- bank master list --------
      .addCase(getBanks.fulfilled, (state, action: any) => {
        state.banks = action.payload ?? [];
      })
      .addCase(addBank.fulfilled, (state, action: any) => {
        if (action.payload && !state.banks.includes(action.payload)) {
          state.banks = [...state.banks, action.payload].sort();
        }
      });
  },
});

export const { startNewEntry, updateField, clearEmployeeError } = employeeSlice.actions;
export default employeeSlice.reducer;