import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface StudentAdmission {
  collegeName: string;
  course: string;
  batch: string;
  studentName: string;
  fatherName: string;
  facility: "Bus" | "Hostel" | "None" | "";
  snapBase64: string | null;
}

export interface LedgerEntry {
  DateEntry: string;
  Semester: string;
  LedgerName: string;
  Particulars: string;
  Debit: number;
  Credit: number;
}

interface StudentPanelState {
  admission: StudentAdmission | null;
  semesters: string[];
  ledgerEntries: LedgerEntry[];
  loading: boolean;
  error: string | null;
}

interface DuplicateHostelBusPassState {
  student1: StudentPanelState;
  student2: StudentPanelState;
  printData: any[] | null;
  printTemplate: string | null;
  printLoading: boolean;
  printError: string | null;
}

const emptyPanel = (): StudentPanelState => ({
  admission: null,
  semesters: [],
  ledgerEntries: [],
  loading: false,
  error: null,
});

const initialState: DuplicateHostelBusPassState = {
  student1: emptyPanel(),
  student2: emptyPanel(),
  printData: null,
  printTemplate: null,
  printLoading: false,
  printError: null,
};

export const fetchStudent = createAsyncThunk(
  "duplicateHostelBusPass/fetchStudent",
  async ({ idNo, panel }: { idNo: string; panel: "student1" | "student2" }, { rejectWithValue }) => {
    const res = await reduxApiClient.get("duplicate-hostel-bus-pass/student", { idNo });
    if (!res.success) return rejectWithValue({ panel, message: res.error?.message ?? res.message });
    return { panel, ...res.data.data };
  }
);

export const fetchPrint = createAsyncThunk(
  "duplicateHostelBusPass/fetchPrint",
  async (
    params: { idNo1: string; idNo2?: string; srNo1: string; srNo2?: string; collegeName: string; facility: "Bus" | "Hostel" },
    { rejectWithValue }
  ) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    );
    const res = await reduxApiClient.get("duplicate-hostel-bus-pass/print", cleanParams as any);
    if (!res.success) return rejectWithValue(res.error?.message ?? res.message);
    return res.data.data;
  }
);

const duplicateHostelBusPassSlice = createSlice({
  name: "duplicateHostelBusPass",
  initialState,
  reducers: {
    clearPanel(state, action) {
      const panel = action.payload as "student1" | "student2";
      state[panel] = emptyPanel();
    },
    clearPrint(state) {
      state.printData = null;
      state.printTemplate = null;
      state.printError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudent.pending, (state, action) => {
        const panel = action.meta.arg.panel;
        state[panel].loading = true;
        state[panel].error = null;
      })
      .addCase(fetchStudent.fulfilled, (state, action: any) => {
        const { panel, admission, semesters, ledgerEntries } = action.payload;
        state[panel as "student1" | "student2"] = {
          admission, semesters, ledgerEntries, loading: false, error: null,
        };
      })
      .addCase(fetchStudent.rejected, (state, action: any) => {
        const panel = action.payload?.panel ?? action.meta.arg.panel;
        state[panel].loading = false;
        state[panel].error = action.payload?.message ?? "Something went wrong";
      })
      .addCase(fetchPrint.pending, (state) => {
        state.printLoading = true;
        state.printError = null;
      })
      .addCase(fetchPrint.fulfilled, (state, action: any) => {
        state.printLoading = false;
        state.printData = action.payload.rows;
        state.printTemplate = action.payload.template;
      })
      .addCase(fetchPrint.rejected, (state, action: any) => {
        state.printLoading = false;
        state.printError = action.payload as string;
        state.printData = null;
      });
  },
});

export const { clearPanel, clearPrint } = duplicateHostelBusPassSlice.actions;
export default duplicateHostelBusPassSlice.reducer;