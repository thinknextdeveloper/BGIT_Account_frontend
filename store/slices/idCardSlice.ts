import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
function toQuery<T extends object>(params: T): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) out[key] = String(value);
  }
  return out;
}

export type LookupType = "IDNo" | "Registration";
export type Facility = "Bus" | "Hostel" | "None";

export interface IdCardStudent {
  KeyNo: string | number;
  CollegeName: string;
  Course: string;
  Batch: string | number;
  StudentName: string;
  FatherName: string;
  Facility: Facility;
  BusFee: number | null;
  HostelCharges: number | null;
  CardIssued: string | null;
  CardIssuedDate: string | null;
  ValidUpTo: string | null;
  ValidFor: string | null;
}

export interface SemesterOption {
  Semester: string;
  SemesterID: number;
}

export interface LedgerRow {
  DateEntry: string;
  Semester: string;
  LedgerName: string;
  Particulars: string;
  Debit: number | null;
  Credit: number | null;
}

interface DisplayArgs {
  type: LookupType;
  idNo: string;
}

interface ValidUpToArgs {
  college: string;
  batch: string;
  semester: string;
  facility: Facility;
}

interface UpdateCardArgs {
  type: LookupType;
  idNo: string;
  mode: "date" | "text";
  validUpTo?: string;
  validFor?: string;
  force?: boolean;
}

interface SaveImageArgs {
  type: LookupType;
  idNo: string;
  blob: Blob;
}

interface PrintArgs {
  type: LookupType;
  idNo: string;
  facility: Facility;
}

interface IdCardState {
  student: IdCardStudent | null;
  semesters: SemesterOption[];
  ledgerRows: LedgerRow[];
  displayLoading: boolean;
  displayError: string | null;

  validUpTo: string | null;
  validUpToLoading: boolean;

  updatingCard: boolean;
  updateCardError: string | null;
  updateCardConflict: boolean; // true when backend returned CARD_ALREADY_ISSUED
  updateCardMessage: string | null;

  savingImage: boolean;
  saveImageError: string | null;

  printPayload: any | null;
  printLoading: boolean;
  printError: string | null;
}

const initialState: IdCardState = {
  student: null,
  semesters: [],
  ledgerRows: [],
  displayLoading: false,
  displayError: null,

  validUpTo: null,
  validUpToLoading: false,

  updatingCard: false,
  updateCardError: null,
  updateCardConflict: false,
  updateCardMessage: null,

  savingImage: false,
  saveImageError: null,

  printPayload: null,
  printLoading: false,
  printError: null,
};

/* ------------------------------------------------------------------ */
/*  Thunks                                                              */
/* ------------------------------------------------------------------ */

// export const displayIdCard = createAsyncThunk(
//   "idCard/display",
//   async (params: DisplayArgs, { rejectWithValue }) => {
//     try {
//       const response = await reduxApiClient.get(`idcard/display`, params);
//       if (!response.success) {
//         return rejectWithValue(response.error?.message || "Failed to load record");
//       }
//       return response.data ?? response;
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );


export const displayIdCard = createAsyncThunk(
  "idCard/display",
  async (params: DisplayArgs, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`idcard/display`, toQuery(params));
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to load record");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getValidUpTo = createAsyncThunk(
  "idCard/getValidUpTo",
  async (params: ValidUpToArgs, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`idcard/valid-upto`, toQuery(params));
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to load validity");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);
export const updateCardIssued = createAsyncThunk(
  "idCard/updateCard",
  async (params: UpdateCardArgs, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.post(`idcard/update-card`, params);
      if (!response.success) {
        const error = response.error as { message?: string; code?: string } | undefined;
        return rejectWithValue({
          message: error?.message || "Failed to update card",
          code: error?.code,
        });
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue({ message: err.message || "Something went wrong" });
    }
  }
);
// export const updateCardIssued = createAsyncThunk(
//   "idCard/updateCard",
//   async (params: UpdateCardArgs, { rejectWithValue }) => {
//     try {
//       const response = await reduxApiClient.post(`idcard/update-card`, params);
//       if (!response.success) {
//         return rejectWithValue({
//           message: response.error?.message || "Failed to update card",
//           code: response.error?.code,
//         });
//       }
//       return response.data ?? response;
//     } catch (err: any) {
//       return rejectWithValue({ message: err.message || "Something went wrong" });
//     }
//   }
// );

export const saveIdCardImage = createAsyncThunk(
  "idCard/saveImage",
  async (params: SaveImageArgs, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("type", params.type);
      form.append("idNo", params.idNo);
      form.append("image", params.blob, `${params.idNo}.jpg`);

      const response = await reduxApiClient.post(`idcard/save-image`, form);
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to save image");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getPrintPayload = createAsyncThunk(
  "idCard/print",
  async (params: PrintArgs, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`idcard/print`, toQuery(params));
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to load print data");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

/* ------------------------------------------------------------------ */
/*  Slice                                                               */
/* ------------------------------------------------------------------ */

const idCardSlice = createSlice({
  name: "idCard",
  initialState,
  reducers: {
    resetIdCardForm(state) {
      Object.assign(state, initialState);
    },
    clearUpdateCardStatus(state) {
      state.updateCardError = null;
      state.updateCardConflict = false;
      state.updateCardMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(displayIdCard.pending, (state) => {
        state.displayLoading = true;
        state.displayError = null;
      })
      .addCase(displayIdCard.fulfilled, (state, action: any) => {
        state.displayLoading = false;
        state.student = action.payload?.student ?? null;
        state.semesters = action.payload?.semesters ?? [];
        state.ledgerRows = action.payload?.ledgerRows ?? [];
      })
      .addCase(displayIdCard.rejected, (state, action: any) => {
        state.displayLoading = false;
        state.displayError = action.payload || "Failed to load record";
        state.student = null;
        state.semesters = [];
        state.ledgerRows = [];
      })

      .addCase(getValidUpTo.pending, (state) => {
        state.validUpToLoading = true;
      })
      .addCase(getValidUpTo.fulfilled, (state, action: any) => {
        state.validUpToLoading = false;
        state.validUpTo = action.payload?.validUpTo ?? null;
      })
      .addCase(getValidUpTo.rejected, (state) => {
        state.validUpToLoading = false;
      })

      .addCase(updateCardIssued.pending, (state) => {
        state.updatingCard = true;
        state.updateCardError = null;
        state.updateCardConflict = false;
        state.updateCardMessage = null;
      })
      .addCase(updateCardIssued.fulfilled, (state, action: any) => {
        state.updatingCard = false;
        state.updateCardMessage = action.payload?.message || "Card has been issued successfully";
        if (state.student) state.student.CardIssued = "Yes";
      })
      .addCase(updateCardIssued.rejected, (state, action: any) => {
        state.updatingCard = false;
        state.updateCardError = action.payload?.message || "Failed to update card";
        state.updateCardConflict = action.payload?.code === "CARD_ALREADY_ISSUED";
      })

      .addCase(saveIdCardImage.pending, (state) => {
        state.savingImage = true;
        state.saveImageError = null;
      })
      .addCase(saveIdCardImage.fulfilled, (state) => {
        state.savingImage = false;
      })
      .addCase(saveIdCardImage.rejected, (state, action: any) => {
        state.savingImage = false;
        state.saveImageError = action.payload || "Failed to save image";
      })

      .addCase(getPrintPayload.pending, (state) => {
        state.printLoading = true;
        state.printError = null;
      })
      .addCase(getPrintPayload.fulfilled, (state, action: any) => {
        state.printLoading = false;
        state.printPayload = action.payload ?? null;
      })
      .addCase(getPrintPayload.rejected, (state, action: any) => {
        state.printLoading = false;
        state.printError = action.payload || "Failed to load print data";
        state.printPayload = null;
      });
  },
});

export const { resetIdCardForm, clearUpdateCardStatus } = idCardSlice.actions;
export default idCardSlice.reducer;