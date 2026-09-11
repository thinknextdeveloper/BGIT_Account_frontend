import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface HeadDebitRow {
  Head: string;
  Credit?: number | string | null;
  Debit?: number | string | null;
  ID?: number | string | null;
}

export interface EduQualificationRow {
  SerialNo?: number | string | null;
  ExamPassed?: string | null;
  Course?: string | null;
  SubjectsStudied?: string | null;
  BoardUniv?: string | null;
  YearOfPassing?: string | number | null;
  MarksObtained?: string | number | null;
  TotalMarks?: string | number | null;
  Percentage?: string | number | null;
  Remarks?: string | null;
}

export interface DocumentStatusRow {
  SerialNo?: number | string | null;
  DocumentsRequired?: string | null;
  Status?: string | null;
}

export interface StudentFullDetails {
  admission: Record<string, any> | null;
  semester?: string | null;
  heads: HeadDebitRow[];
  totalDebit?: number | string | null;
  concessionFeeAmount?: number | string | null;
  concessionFacilityAmount?: number | string | null;
  eduQualifications: EduQualificationRow[];
  documents: DocumentStatusRow[];
}

interface SearchByIdNoState {
  data: StudentFullDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: SearchByIdNoState = {
  data: null,
  loading: false,
  error: null,
};

export const searchByIdNo = createAsyncThunk(
  "searchByIdNo/find",
  async (idNo: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get("search-by-id-no/find", { idNo });
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data?.data ?? null;
  }
);

const searchByIdNoSlice = createSlice({
  name: "searchByIdNo",
  initialState,
  reducers: {
    clearDetails(state) {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchByIdNo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchByIdNo.fulfilled, (state, action: any) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(searchByIdNo.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.data = null;
      });
  },
});

export const { clearDetails } = searchByIdNoSlice.actions;
export default searchByIdNoSlice.reducer;
