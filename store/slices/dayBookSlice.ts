import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DayBookEntry {
  DayBookDateEntry: string;
  DateEntry: string;
  ReceiptNo: number | string;
  IDNo: string | number | null;
  UniRollNo: string | null;
  StudentName: string;
  FatherName: string;
  Credit: number | null;
  ChequeDraftNo: string | null;
  ChequeDraftDate: string | null;
  ChequeDraftBank: string | null;
  LedgerName: string;
  Course: string;
  ModeOfPayment: string;
  CollegeName: string;
  Session: string | null;
}

export interface LedgerWiseRow {
  LedgerName: string;
  Credit: number;
}

interface CashVsBank {
  cashTotal: number;
  bankTotal: number;
}

interface GetEntriesArgs {
  collegeName?: string;
  dateFrom: string; // ISO date
  dateTo: string; // ISO date
  session?: string;
  allSessions?: boolean;
  ledgerName?: string;
  modeOfPayment?: string;
}

interface GetLedgerWiseArgs {
  collegeName: string;
  dateFrom: string;
  dateTo: string;
}

interface DayBookState {
  colleges: string[];
  ledgerNames: string[];
  modesOfPayment: string[];
  optionsLoading: boolean;
  optionsError: string | null;

  entries: DayBookEntry[];
  totalAmount: number;
  count: number;
  cashVsBank: CashVsBank | null;
  loading: boolean;
  error: string | null;

  ledgerWiseSummary: LedgerWiseRow[];
  ledgerWiseTotal: number;
  ledgerWiseCashVsBank: CashVsBank | null;
  ledgerWiseLoading: boolean;
  ledgerWiseError: string | null;
}

const initialState: DayBookState = {
  colleges: [],
  ledgerNames: [],
  modesOfPayment: [],
  optionsLoading: false,
  optionsError: null,

  entries: [],
  totalAmount: 0,
  count: 0,
  cashVsBank: null,
  loading: false,
  error: null,

  ledgerWiseSummary: [],
  ledgerWiseTotal: 0,
  ledgerWiseCashVsBank: null,
  ledgerWiseLoading: false,
  ledgerWiseError: null,
};

/* ------------------------------------------------------------------ */
/*  Thunks                                                              */
/* ------------------------------------------------------------------ */

export const getDayBookOptions = createAsyncThunk(
  "dayBook/getDayBookOptions",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`day-book/options`);
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to load options");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getDayBookEntries = createAsyncThunk(
  "dayBook/getDayBookEntries",
  async (params: GetEntriesArgs, { rejectWithValue }) => {
    try {
      const query: Record<string, string> = {
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      };
      if (params.collegeName) query.collegeName = params.collegeName;
      if (params.session) query.session = params.session;
      if (params.allSessions) query.allSessions = "true";
      if (params.ledgerName) query.ledgerName = params.ledgerName;
      if (params.modeOfPayment) query.modeOfPayment = params.modeOfPayment;

      const response = await reduxApiClient.get(`day-book/entries`, query);
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to load entries");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getLedgerWiseSummary = createAsyncThunk(
  "dayBook/getLedgerWiseSummary",
  async (params: GetLedgerWiseArgs, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`day-book/ledger-wise-summary`, params);
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to load ledger-wise summary");
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

const dayBookSlice = createSlice({
  name: "dayBook",
  initialState,
  reducers: {
    clearEntries(state) {
      state.entries = [];
      state.totalAmount = 0;
      state.count = 0;
      state.cashVsBank = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------- getDayBookOptions --------
      .addCase(getDayBookOptions.pending, (state) => {
        state.optionsLoading = true;
        state.optionsError = null;
      })
      .addCase(getDayBookOptions.fulfilled, (state, action: any) => {
        state.optionsLoading = false;
        const payload = action.payload ?? {};
        state.colleges = payload.colleges ?? [];
        state.ledgerNames = payload.ledgerNames ?? [];
        state.modesOfPayment = payload.modesOfPayment ?? [];
      })
      .addCase(getDayBookOptions.rejected, (state, action: any) => {
        state.optionsLoading = false;
        state.optionsError = action.payload || "Failed to load options";
      })

      // -------- getDayBookEntries --------
      .addCase(getDayBookEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDayBookEntries.fulfilled, (state, action: any) => {
        state.loading = false;
        const payload = action.payload ?? {};
        state.entries = payload.rows ?? [];
        state.totalAmount = payload.totalAmount ?? 0;
        state.count = payload.count ?? 0;
        state.cashVsBank = payload.cashVsBank ?? null;
      })
      .addCase(getDayBookEntries.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to load entries";
        state.entries = [];
        state.totalAmount = 0;
        state.count = 0;
        state.cashVsBank = null;
      })

      // -------- getLedgerWiseSummary --------
      .addCase(getLedgerWiseSummary.pending, (state) => {
        state.ledgerWiseLoading = true;
        state.ledgerWiseError = null;
      })
      .addCase(getLedgerWiseSummary.fulfilled, (state, action: any) => {
        state.ledgerWiseLoading = false;
        const payload = action.payload ?? {};
        state.ledgerWiseSummary = payload.summary ?? [];
        state.ledgerWiseTotal = payload.total ?? 0;
        state.ledgerWiseCashVsBank = payload.cashVsBank ?? null;
      })
      .addCase(getLedgerWiseSummary.rejected, (state, action: any) => {
        state.ledgerWiseLoading = false;
        state.ledgerWiseError = action.payload || "Failed to load ledger-wise summary";
      });
  },
});

export const { clearEntries } = dayBookSlice.actions;
export default dayBookSlice.reducer;