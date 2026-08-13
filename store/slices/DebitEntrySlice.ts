// store/slices/DebitEntrySlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

// Converts a Node-style Buffer JSON ({ type: "Buffer", data: number[] })
// into a data URL the <img> tag can actually render.
export function bufferToDataUrl(
  buf?: { type: string; data: number[] } | string | null,
  mime: string = "image/jpeg"
): string {
  if (!buf) return "";
  if (typeof buf === "string") {
    return buf.startsWith("data:") ? buf : `data:${mime};base64,${buf}`;
  }
  try {
    const bytes = new Uint8Array(buf.data);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return `data:${mime};base64,${btoa(binary)}`;
  } catch {
    return "";
  }
}

export interface StudentDetail {
  IDNo: number | string;
  Snap?: { type: string; data: number[] } | string | null;
  StudentType?: string | null;
  CollegeName: string;
  Course: string;
  Batch: number | string;
  Class: string | null;
  ClassRollNo: string | null;
  UniRollNo: string | null;
  StudentName: string;
  FatherName: string;
  MotherName: string | null;
  Scheme: string | null;
  DOB: string | null;
  Sex: string | null;
  PermanentAddress: string | null;
  PhoneNo: string | null;
  StudentMobileNo: string | null;
  FatherMobileNo: string | null;
  MotherMobileNo: string | null;
  LateralEntry: string | boolean | null;
  HostelName?: string | null;
  RoomType?: string | null;
  BusRoute?: string | null;
  Stopage?: string | null;
  Category?: string | null;
  Quota?: string | null;
  Session?: string | null;
  FeeCategory?: string | null;
  Facility?: string | null;
  HostelCharges?: number | string | null;
  BusFee?: number | string | null;
}

export interface MetaOptions {
  hostelNames: string[];
  roomTypes: string[];
  routes: string[];
  stopages: string[];
  categories: string[];
  modesOfAdmission: string[];
  currentSession: string;
  sessions?: string[];
  semesters?: string[];
}

export interface FeeHead {
  head: string;
  credit: number;
}

interface DebitEntryState {
  metaOptions: MetaOptions;
  metaLoading: boolean;

  student: StudentDetail | null;
  studentLoading: boolean;
  studentError: string | null;

  feeHeads: FeeHead[];
  feeHeadsLoading: boolean;
  feeHeadsError: string | null;

  saving: boolean;
  saveError: string | null;
  saveSuccess: string | null;
}

const initialState: DebitEntryState = {
  metaOptions: {
    hostelNames: [],
    roomTypes: [],
    routes: [],
    stopages: [],
    categories: [],
    modesOfAdmission: [],
    currentSession: "",
    sessions: [],
    semesters: [],
  },
  metaLoading: false,

  student: null,
  studentLoading: false,
  studentError: null,

  feeHeads: [],
  feeHeadsLoading: false,
  feeHeadsError: null,

  saving: false,
  saveError: null,
  saveSuccess: null,
};

export const fetchMetaOptions = createAsyncThunk(
  "debitEntry/fetchMetaOptions",
  async (
    params: { collegeName?: string; route?: string } | undefined,
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("debit/meta-options", params as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data as MetaOptions & { success: boolean };
  }
);

export const fetchStudentByIdNo = createAsyncThunk(
  "debitEntry/fetchStudentByIdNo",
  async (idNo: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get(`debit/${idNo}`);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.student as StudentDetail;
  }
);

// store/slices/DebitEntrySlice.ts
export const fetchFeeHeads = createAsyncThunk(
  "debitEntry/fetchFeeHeads",
  async (
    params: {
      idNo?: string;
      collegeName?: string;
      course?: string;
      batch?: string;
      semester?: string;
      feeCategory?: string;
      ledgerName?: string;
    },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.get("debit/fee-heads", params as any);
    if (!res.success) return rejectWithValue(res.error?.message);
    return {
      feeHeads: (res.data?.feeHeads ?? []) as FeeHead[],
      totalCredit: (res.data?.totalCredit ?? 0) as number,
    };
  }
);

export interface SaveDebitPayload {
  debitFrom?: "Individual" | "Course";
  courseStudentType?: "All" | "New" | "Old";
  collegeName?: string;
  course?: string;
  batch?: string | number;
  studentType: "New" | "Old";
  idNo?: string;
  studentDetail?: Partial<StudentDetail> & {
    collegeName: string;
    course: string;
    batch: number | string;
    studentClass: string;
    classRollNo?: string;
    uniRollNo?: string;
    studentName: string;
    fatherName: string;
    motherName?: string;
    scheme?: string;
    dob?: string;
    sex: string;
    permanentAddress?: string;
    phoneNo?: string;
    studentMobile?: string;
    fatherMobile?: string;
    motherMobile?: string;
    lateralEntry?: boolean;
  };
  session: string;
  semester?: string;
  semesterId?: number;
  category?: string;
  modeOfAdmission?: string;
  ledgerName: "Fee" | "Hostel" | "Bus" | "Fine" | "Others";
  othersLedgerName?: string;
  facility?: {
    hostelName?: string;
    roomType?: string;
    route?: string;
    stopage?: string;
    amount?: string;
  };
  refundEntry: "Yes" | "No";
  concessionEntry: "Yes" | "No";
  particulars: string;
  debit: string;
  remarks?: string;
  dateEntry?: string;
  userId?: string;
  feeHeads?: { head: string; credit?: number | string; debit?: number | string }[];
}

export const saveDebitEntry = createAsyncThunk(
  "debitEntry/saveDebitEntry",
  async (payload: SaveDebitPayload, { rejectWithValue }) => {
    const url = payload.idNo ? `debit/${payload.idNo}/save` : `debit/course/save`;
    const res = await reduxApiClient.post(url, payload);
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data as { message: string; receiptNo?: number; transactionId?: number; count?: number };
  }
);

const debitEntrySlice = createSlice({
  name: "debitEntry",
  initialState,
  reducers: {
    clearStudent(state) {
      state.student = null;
      state.studentError = null;
    },
    clearSaveStatus(state) {
      state.saveError = null;
      state.saveSuccess = null;
    },
    clearFeeHeads(state) {
      state.feeHeads = [];
      state.feeHeadsError = null;
    },
    resetDebitEntry() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetaOptions.pending, (state) => {
        state.metaLoading = true;
      })
      .addCase(fetchMetaOptions.fulfilled, (state, action: any) => {
        state.metaLoading = false;
        state.metaOptions = {
          hostelNames: action.payload.hostelNames || [],
          roomTypes: action.payload.roomTypes || [],
          routes: action.payload.routes || [],
          stopages: action.payload.stopages || [],
          categories: action.payload.categories || [],
          modesOfAdmission: action.payload.modesOfAdmission || [],
          currentSession: action.payload.currentSession || "",
        };
      })
      .addCase(fetchMetaOptions.rejected, (state) => {
        state.metaLoading = false;
      })

      .addCase(fetchStudentByIdNo.pending, (state) => {
        state.studentLoading = true;
        state.studentError = null;
      })
      .addCase(fetchStudentByIdNo.fulfilled, (state, action: any) => {
        state.studentLoading = false;
        state.student = action.payload;
      })
      .addCase(fetchStudentByIdNo.rejected, (state, action: any) => {
        state.studentLoading = false;
        state.student = null;
        state.studentError = action.payload || "Student not found";
      })

      .addCase(fetchFeeHeads.pending, (state) => {
        state.feeHeadsLoading = true;
        state.feeHeadsError = null;
      })
      .addCase(fetchFeeHeads.fulfilled, (state, action: any) => {
        state.feeHeadsLoading = false;
        state.feeHeads = Array.isArray(action.payload?.feeHeads) ? action.payload.feeHeads : [];
      })
      .addCase(fetchFeeHeads.rejected, (state, action: any) => {
        state.feeHeadsLoading = false;
        state.feeHeads = [];
        state.feeHeadsError = action.payload || "Failed to load fee heads";
      })

      .addCase(saveDebitEntry.pending, (state) => {
        state.saving = true;
        state.saveError = null;
        state.saveSuccess = null;
      })
      .addCase(saveDebitEntry.fulfilled, (state, action: any) => {
        state.saving = false;
        state.saveSuccess = action.payload.message;
      })
      .addCase(saveDebitEntry.rejected, (state, action: any) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to save entry";
      });
  },
});

export const { clearStudent, clearSaveStatus, clearFeeHeads, resetDebitEntry } =
  debitEntrySlice.actions;
export default debitEntrySlice.reducer;