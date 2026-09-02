import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AdmissionRecord {
  IDNo?: string;
  CollegeName?: string;
  Course?: string;
  Class?: string;
  Batch?: string;
  ClassRollNo?: string;
  UniRollNo?: string;
  FirstPreference?: string;
  SecondPreference?: string;
  ThirdPreference?: string;
  FourthPreference?: string;
  Semester?: string;
  Session?: string;
  Category?: string;
  Religion?: string;
  Quota?: string;
  Scheme?: string;
  LateralEntry?: boolean | string;
  StudentType?: "Old" | "New";
  Facility?: "Hostel" | "Bus" | "None";
  HostelName?: string;
  RoomType?: string;
  BusRoute?: string;
  Stopage?: string;
  HostelCharges?: number | string;
  BusFee?: number | string;
  Concession?: string;
  ConcessionDetails?: string;
  ConcessionPerc?: number | string;
  ConcessionTotalAmount?: number | string;
  ConcessionReferenceLetterNo?: string;
  AdmissionDate?: string;
  StudentName?: string;
  FatherName?: string;
  MotherName?: string;
  BloodGroup?: string;
  EmailID?: string;
  DOB?: string;
  Sex?: string;
  PhoneNo?: string;
  StudentMobileNo?: string;
  FatherMobileNo?: string;
  MotherMobileNo?: string;
  FatherDesignation?: string;
  FatherOccupation?: string;
  MotherOccupation?: string;
  PermanentAddress?: string;
  CorrespondanceAddress?: string;
  Village?: string;
  VPO?: string;
  PO?: string;
  Tehsil?: string;
  District?: string;
  City?: string;
  State?: string;
  Locality?: string;
  InstitutionLastAttended?: string;
  BoardRegistrationNo?: string;
  GroupName?: string;
  EntranceTest1?: string;
  EntranceTest2?: string;
  EntranceTest1Rank?: string;
  EntranceTest2Rank?: string;
  EntranceTest1RollNo?: string;
  EntranceTest2RollNo?: string;
}

export interface EduQualificationRow {
  SerialNo?: number;
  ExamPassed: string;
  Course?: string;
  SubjectsStudied?: string;
  BoardUniv?: string;
  YearOfPassing?: string;
  MarksObtained?: string;
  TotalMarks?: string;
  Percentage?: string;
  Remarks?: string;
}

export interface DocumentStatusRow {
  SerialNo: number;
  DocumentsRequired: string;
  Status: string;
}

interface AdmissionState {
  record: AdmissionRecord | null;
  isNewEntry: boolean;

  colleges: string[];
  categories: string[];
  villages: string[];
  districts: string[];
  tehsils: string[];
  groupNames: string[];
  concessionDetailsList: string[];
  hostelNames: string[];
  roomTypes: string[];
  busRoutes: string[];
  stopages: string[];

  eduQualifications: EduQualificationRow[];
  documentStatus: DocumentStatusRow[];
  previousCourses: string[];
  previousBoards: string[];
  institutions: string[];

  loading: boolean;
  saving: boolean;
  error: string | null;
}

const EMPTY_EDU_ROWS: EduQualificationRow[] = [
  { ExamPassed: "Matric" },
  { ExamPassed: "10+2/Diploma" },
  { ExamPassed: "Graduation" },
  { ExamPassed: "Other" },
];

const initialState: AdmissionState = {
  record: null,
  isNewEntry: false,

  colleges: [],
  categories: [],
  villages: [],
  districts: [],
  tehsils: [],
  groupNames: [],
  concessionDetailsList: [],
  hostelNames: [],
  roomTypes: [],
  busRoutes: [],
  stopages: [],

  eduQualifications: EMPTY_EDU_ROWS,
  documentStatus: [],
  previousCourses: [],
  previousBoards: [],
  institutions: [],

  loading: false,
  saving: false,
  error: null,
};

/* ------------------------------------------------------------------ */
/*  Helper: same defensive unwrap used across the app's other slices   */
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
/*  Thunks — admission record (Registration tab)                       */
/* ------------------------------------------------------------------ */

export const fetchAdmission = createAsyncThunk(
  "admission/fetch",
  async (idNo: string, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get("student-registration", { idNo });
      return unwrap(response);
    } catch (err: any) {
      if (err?.status === 404 || err?.response?.status === 404) {
        return null; // "no record" -> treated as new entry
      }
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const saveAdmission = createAsyncThunk(
  "admission/save",
  async (data: AdmissionRecord, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.put("student-registration", data);
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

/* ------------------------------------------------------------------ */
/*  Thunks — master/dropdown lists                                     */
/* ------------------------------------------------------------------ */

function makeListThunk(name: string, path: string) {
  return createAsyncThunk(`admission/${name}`, async (params: Record<string, string> | void, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`student-registration/${path}`, params ?? undefined);
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  });
}

export const getColleges = makeListThunk("getColleges", "masters/colleges");
export const getCategories = makeListThunk("getCategories", "masters/categories");
export const getVillages = makeListThunk("getVillages", "masters/villages");
export const getDistricts = makeListThunk("getDistricts", "masters/districts");
export const getTehsils = makeListThunk("getTehsils", "masters/tehsils");
export const getGroupNames = makeListThunk("getGroupNames", "masters/group-names");
export const getConcessionDetailsList = makeListThunk("getConcessionDetailsList", "masters/concession-details");
export const getHostelNames = makeListThunk("getHostelNames", "masters/hostel-names");
export const getRoomTypes = makeListThunk("getRoomTypes", "masters/room-types");
export const getBusRoutes = makeListThunk("getBusRoutes", "masters/bus-routes");
export const getStopages = makeListThunk("getStopages", "masters/stopages");

export const lookupConcession = createAsyncThunk(
  "admission/lookupConcession",
  async (params: { collegeName: string; concessionDetails: string }, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get("student-registration/masters/concession-lookup", params);
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const lookupHostelFee = createAsyncThunk(
  "admission/lookupHostelFee",
  async (params: { collegeName: string; batch?: string; hostelName: string; roomType: string }, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get("student-registration/masters/hostel-fee", params);
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const lookupBusFee = createAsyncThunk(
  "admission/lookupBusFee",
  async (params: { session: string; route: string; stopage: string }, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get("student-registration/masters/bus-fee", params);
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

/* ------------------------------------------------------------------ */
/*  Thunks — Academic tab                                               */
/* ------------------------------------------------------------------ */

export const fetchEduQualifications = createAsyncThunk(
  "admission/fetchEduQualifications",
  async (idNo: string, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get("student-registration/academic/edu-qualifications", { idNo });
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const saveEduQualifications = createAsyncThunk(
  "admission/saveEduQualifications",
  async ({ idNo, rows }: { idNo: string; rows: EduQualificationRow[] }, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.put("student-registration/academic/edu-qualifications", { idNo, rows });
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const fetchDocumentStatus = createAsyncThunk(
  "admission/fetchDocumentStatus",
  async (params: { idNo: string; collegeName?: string }, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get("student-registration/academic/document-status", params);
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const saveDocumentStatus = createAsyncThunk(
  "admission/saveDocumentStatus",
  async (
    { idNo, studentName, rows }: { idNo: string; studentName: string; rows: DocumentStatusRow[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await reduxApiClient.put("student-registration/academic/document-status", {
        idNo,
        studentName,
        rows,
      });
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const deleteDocumentStatus = createAsyncThunk(
  "admission/deleteDocumentStatus",
  async (idNo: string, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.delete("student-registration/academic/document-status", { idNo });
      return unwrap(response);
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getPreviousCourses = makeListThunk("getPreviousCourses", "academic/masters/previous-courses");
export const getPreviousBoards = makeListThunk("getPreviousBoards", "academic/masters/previous-boards");
export const getInstitutions = makeListThunk("getInstitutions", "academic/masters/institutions");

/* ------------------------------------------------------------------ */
/*  Slice                                                               */
/* ------------------------------------------------------------------ */

const admissionSlice = createSlice({
  name: "admission",
  initialState,
  reducers: {
    startNewEntry(state) {
      state.record = { IDNo: "" };
      state.isNewEntry = true;
      state.eduQualifications = EMPTY_EDU_ROWS;
      state.documentStatus = [];
      state.error = null;
    },
    updateField(state, action: { payload: { field: keyof AdmissionRecord; value: any } }) {
      if (!state.record) state.record = { IDNo: "" };
      (state.record as any)[action.payload.field] = action.payload.value;
    },
    updateEduRow(state, action: { payload: { index: number; field: keyof EduQualificationRow; value: any } }) {
      const { index, field, value } = action.payload;
      if (!state.eduQualifications[index]) return;
      (state.eduQualifications[index] as any)[field] = value;
    },
    updateDocRowStatus(state, action: { payload: { index: number; status: string } }) {
      const { index, status } = action.payload;
      if (!state.documentStatus[index]) return;
      state.documentStatus[index].Status = status;
    },
    clearAdmissionError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------- fetchAdmission --------
      .addCase(fetchAdmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmission.fulfilled, (state, action: any) => {
        state.loading = false;
        if (action.payload) {
          state.record = action.payload;
          state.isNewEntry = false;
        } else {
          state.record = { IDNo: "" };
          state.isNewEntry = true;
        }
      })
      .addCase(fetchAdmission.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to load record";
      })

      // -------- saveAdmission --------
      .addCase(saveAdmission.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveAdmission.fulfilled, (state, action: any) => {
        state.saving = false;
        state.record = action.payload;
        state.isNewEntry = false;
      })
      .addCase(saveAdmission.rejected, (state, action: any) => {
        state.saving = false;
        state.error = action.payload || "Failed to save record";
      })

      // -------- simple lists --------
      .addCase(getColleges.fulfilled, (state, action: any) => { state.colleges = action.payload ?? []; })
      .addCase(getCategories.fulfilled, (state, action: any) => { state.categories = action.payload ?? []; })
      .addCase(getVillages.fulfilled, (state, action: any) => { state.villages = action.payload ?? []; })
      .addCase(getDistricts.fulfilled, (state, action: any) => { state.districts = action.payload ?? []; })
      .addCase(getTehsils.fulfilled, (state, action: any) => { state.tehsils = action.payload ?? []; })
      .addCase(getGroupNames.fulfilled, (state, action: any) => { state.groupNames = action.payload ?? []; })
      .addCase(getConcessionDetailsList.fulfilled, (state, action: any) => { state.concessionDetailsList = action.payload ?? []; })
      .addCase(getHostelNames.fulfilled, (state, action: any) => { state.hostelNames = action.payload ?? []; })
      .addCase(getRoomTypes.fulfilled, (state, action: any) => { state.roomTypes = action.payload ?? []; })
      .addCase(getBusRoutes.fulfilled, (state, action: any) => { state.busRoutes = action.payload ?? []; })
      .addCase(getStopages.fulfilled, (state, action: any) => { state.stopages = action.payload ?? []; })
      .addCase(getPreviousCourses.fulfilled, (state, action: any) => { state.previousCourses = action.payload ?? []; })
      .addCase(getPreviousBoards.fulfilled, (state, action: any) => { state.previousBoards = action.payload ?? []; })
      .addCase(getInstitutions.fulfilled, (state, action: any) => { state.institutions = action.payload ?? []; })

      // -------- lookups: apply straight onto the record --------
      .addCase(lookupConcession.fulfilled, (state, action: any) => {
        if (!state.record) return;
        state.record.ConcessionPerc = action.payload?.ConcessionPerc ?? "";
        state.record.ConcessionTotalAmount = action.payload?.ConcessionAmount ?? "";
      })
      .addCase(lookupHostelFee.fulfilled, (state, action: any) => {
        if (!state.record) return;
        state.record.HostelCharges = action.payload?.HostelFee ?? "";
      })
      .addCase(lookupBusFee.fulfilled, (state, action: any) => {
        if (!state.record) return;
        state.record.BusFee = action.payload?.Fee ?? "";
      })

      // -------- Academic tab --------
      .addCase(fetchEduQualifications.fulfilled, (state, action: any) => {
        state.eduQualifications = action.payload?.length ? action.payload : EMPTY_EDU_ROWS;
      })
      .addCase(saveEduQualifications.fulfilled, (state, action: any) => {
        state.eduQualifications = action.payload?.length ? action.payload : EMPTY_EDU_ROWS;
      })
      .addCase(fetchDocumentStatus.fulfilled, (state, action: any) => {
        state.documentStatus = action.payload ?? [];
      })
      .addCase(saveDocumentStatus.fulfilled, (state, action: any) => {
        state.documentStatus = action.payload ?? [];
      })
      .addCase(deleteDocumentStatus.fulfilled, (state) => {
        state.documentStatus = [];
      });
  },
});

export const { startNewEntry, updateField, updateEduRow, updateDocRowStatus, clearAdmissionError } =
  admissionSlice.actions;
export default admissionSlice.reducer;