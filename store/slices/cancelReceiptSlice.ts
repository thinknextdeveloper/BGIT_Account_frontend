// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { reduxApiClient } from "@/services/reduxservices";

// /* ------------------------------------------------------------------ */
// /*  Types                                                              */
// /* ------------------------------------------------------------------ */

// export interface SearchedReceipt {
//   TransactionID: number;
//   ReceiptNo: number;
//   DateEntry: string;
//   IDNo: string | number | null;
//   StudentName: string;
//   FatherName: string;
//   Course: string;
//   Batch: number | string;
//   Semester: string;
//   LedgerName: string;
//   Credit: number | null;
//   Debit: number | null;
//   ModeOfPayment: string;
//   CollegeName: string;
//   Session: string | null;
//   Particulars: string;
// }

// export interface CancelledReceiptRow {
//   CollegeName: string;
//   DateEntry: string;
//   DateDisplay: string;
//   IDNo: string | number | null;
//   StudentName: string | null;
//   FatherName: string | null;
//   ReceiptNo: number;
//   Particulars: string | null;
//   Debit: number | null;
//   Credit: number | null;
//   LedgerName: string | null;
//   ModeOfPayment: string | null;
//   ChequeDraftDate: string | null;
//   ChequeDraftNo: string | null;
//   ChequeDraftBank: string | null;
//   Session: string | null;
//   UserID: string | null;
//   Comments: string | null;
// }

// interface SearchArgs {
//   collegeName: string;
//   ledgerName: string;
//   session: string;
//   receiptNo: string;
// }

// interface AddToCancelledArgs {
//   collegeName: string;
//   ledgerName: string;
//   session: string;
//   receiptNo: string;
//   comments: string;
// }

// interface ListCancelledArgs {
//   collegeName?: string;
//   dateFrom: string;
//   dateTo: string;
// }

// interface CancelReceiptState {
//   colleges: string[];
//   collegesLoading: boolean;
//   collegesError: string | null;

//   ledgerNames: string[];
//   ledgerNamesLoading: boolean;
//   ledgerNamesError: string | null;

//   searchResults: SearchedReceipt[];
//   searchLoading: boolean;
//   searchError: string | null;

//   cancelling: boolean;
//   cancelError: string | null;
//   cancelMessage: string | null;

//   cancelledList: CancelledReceiptRow[];
//   cancelledListLoading: boolean;
//   cancelledListError: string | null;
// }

// const initialState: CancelReceiptState = {
//   colleges: [],
//   collegesLoading: false,
//   collegesError: null,

//   ledgerNames: [],
//   ledgerNamesLoading: false,
//   ledgerNamesError: null,

//   searchResults: [],
//   searchLoading: false,
//   searchError: null,

//   cancelling: false,
//   cancelError: null,
//   cancelMessage: null,

//   cancelledList: [],
//   cancelledListLoading: false,
//   cancelledListError: null,
// };

// /* ------------------------------------------------------------------ */
// /*  Thunks                                                              */
// /* ------------------------------------------------------------------ */

// export const getCancelReceiptColleges = createAsyncThunk(
//   "cancelReceipt/getColleges",
//   async (_: void, { rejectWithValue }) => {
//     try {
//       const response = await reduxApiClient.get(`cancel-receipt/colleges`);
//       if (!response.success) {
//         return rejectWithValue(response.error?.message || "Failed to load colleges");
//       }
//       return response.data ?? response;
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );

// export const getCancelReceiptLedgerNames = createAsyncThunk(
//   "cancelReceipt/getLedgerNames",
//   async (collegeName: string, { rejectWithValue }) => {
//     try {
//       const response = await reduxApiClient.get(`cancel-receipt/ledger-names`, { collegeName });
//       if (!response.success) {
//         return rejectWithValue(response.error?.message || "Failed to load ledger names");
//       }
//       return response.data ?? response;
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );

// export const searchCancelReceipt = createAsyncThunk(
//   "cancelReceipt/search",
//   async (params: SearchArgs, { rejectWithValue }) => {
//     try {
//       const response = await reduxApiClient.get(`cancel-receipt/search`, params);
//       if (!response.success) {
//         return rejectWithValue(response.error?.message || response.message || "Search failed");
//       }
//       return response.data ?? response;
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );

// export const addToCancelledReceipts = createAsyncThunk(
//   "cancelReceipt/addToCancelled",
//   async (params: AddToCancelledArgs, { rejectWithValue }) => {
//     try {
//       const response = await reduxApiClient.post(`cancel-receipt/cancel`, params);
//       if (!response.success) {
//         return rejectWithValue(response.error?.message || response.message || "Failed to cancel receipt");
//       }
//       return response.data ?? response;
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );

// export const getCancelledReceiptsList = createAsyncThunk(
//   "cancelReceipt/getCancelledList",
//   async (params: ListCancelledArgs, { rejectWithValue }) => {
//     try {
//       const query: Record<string, string> = { dateFrom: params.dateFrom, dateTo: params.dateTo };
//       if (params.collegeName) query.collegeName = params.collegeName;

//       const response = await reduxApiClient.get(`cancel-receipt/cancelled-list`, query);
//       if (!response.success) {
//         return rejectWithValue(response.error?.message || response.message || "Failed to load list");
//       }
//       return response.data ?? response;
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );

// /* ------------------------------------------------------------------ */
// /*  Slice                                                               */
// /* ------------------------------------------------------------------ */

// const cancelReceiptSlice = createSlice({
//   name: "cancelReceipt",
//   initialState,
//   reducers: {
//     clearSearchResults(state) {
//       state.searchResults = [];
//       state.searchError = null;
//     },
//     clearCancelStatus(state) {
//       state.cancelError = null;
//       state.cancelMessage = null;
//     },
//     clearLedgerNames(state) {
//       state.ledgerNames = [];
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(getCancelReceiptColleges.pending, (state) => {
//         state.collegesLoading = true;
//         state.collegesError = null;
//       })
//       .addCase(getCancelReceiptColleges.fulfilled, (state, action: any) => {
//         state.collegesLoading = false;
//         state.colleges = action.payload?.colleges ?? [];
//       })
//       .addCase(getCancelReceiptColleges.rejected, (state, action: any) => {
//         state.collegesLoading = false;
//         state.collegesError = action.payload || "Failed to load colleges";
//       })

//       .addCase(getCancelReceiptLedgerNames.pending, (state) => {
//         state.ledgerNamesLoading = true;
//         state.ledgerNamesError = null;
//       })
//       .addCase(getCancelReceiptLedgerNames.fulfilled, (state, action: any) => {
//         state.ledgerNamesLoading = false;
//         state.ledgerNames = action.payload?.ledgerNames ?? [];
//       })
//       .addCase(getCancelReceiptLedgerNames.rejected, (state, action: any) => {
//         state.ledgerNamesLoading = false;
//         state.ledgerNamesError = action.payload || "Failed to load ledger names";
//         state.ledgerNames = [];
//       })

//       .addCase(searchCancelReceipt.pending, (state) => {
//         state.searchLoading = true;
//         state.searchError = null;
//       })
//       .addCase(searchCancelReceipt.fulfilled, (state, action: any) => {
//         state.searchLoading = false;
//         state.searchResults = action.payload?.rows ?? [];
//       })
//       .addCase(searchCancelReceipt.rejected, (state, action: any) => {
//         state.searchLoading = false;
//         state.searchError = action.payload || "Search failed";
//         state.searchResults = [];
//       })

//       .addCase(addToCancelledReceipts.pending, (state) => {
//         state.cancelling = true;
//         state.cancelError = null;
//         state.cancelMessage = null;
//       })
//       .addCase(addToCancelledReceipts.fulfilled, (state, action: any) => {
//         state.cancelling = false;
//         state.cancelMessage = action.payload?.message || "Receipt has been cancelled successfully";
//       })
//       .addCase(addToCancelledReceipts.rejected, (state, action: any) => {
//         state.cancelling = false;
//         state.cancelError = action.payload || "Failed to cancel receipt";
//       })

//       .addCase(getCancelledReceiptsList.pending, (state) => {
//         state.cancelledListLoading = true;
//         state.cancelledListError = null;
//       })
//       .addCase(getCancelledReceiptsList.fulfilled, (state, action: any) => {
//         state.cancelledListLoading = false;
//         state.cancelledList = action.payload?.rows ?? [];
//       })
//       .addCase(getCancelledReceiptsList.rejected, (state, action: any) => {
//         state.cancelledListLoading = false;
//         state.cancelledListError = action.payload || "Failed to load list";
//         state.cancelledList = [];
//       });
//   },
// });

// export const { clearSearchResults, clearCancelStatus, clearLedgerNames } =
//   cancelReceiptSlice.actions;
// export default cancelReceiptSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SearchedReceipt {
  TransactionID: number;
  ReceiptNo: number;
  DateEntry: string;
  IDNo: string | number | null;
  StudentName: string;
  FatherName: string;
  Course: string;
  Batch: number | string;
  Semester: string;
  LedgerName: string;
  Credit: number | null;
  Debit: number | null;
  ModeOfPayment: string;
  CollegeName: string;
  Session: string | null;
  Particulars: string;
}

export interface CancelledReceiptRow {
  CollegeName: string;
  DateEntry: string;
  DateDisplay: string;
  IDNo: string | number | null;
  StudentName: string | null;
  FatherName: string | null;
  ReceiptNo: number;
  Particulars: string | null;
  Debit: number | null;
  Credit: number | null;
  LedgerName: string | null;
  ModeOfPayment: string | null;
  ChequeDraftDate: string | null;
  ChequeDraftNo: string | null;
  ChequeDraftBank: string | null;
  Session: string | null;
  UserID: string | null;
  Comments: string | null;
}

interface SearchArgs {
  collegeName: string;
  ledgerName: string;
  session: string;
  receiptNo: string;
}

interface AddToCancelledArgs {
  collegeName: string;
  ledgerName: string;
  session: string;
  receiptNo: string;
  comments: string;
}

interface ListCancelledArgs {
  collegeName?: string;
  dateFrom: string;
  dateTo: string;
}

interface CancelReceiptState {
  colleges: string[];
  collegesLoading: boolean;
  collegesError: string | null;

  ledgerNames: string[];
  ledgerNamesLoading: boolean;
  ledgerNamesError: string | null;

  searchResults: SearchedReceipt[];
  searchLoading: boolean;
  searchError: string | null;

  cancelling: boolean;
  cancelError: string | null;
  cancelMessage: string | null;

  cancelledList: CancelledReceiptRow[];
  cancelledListLoading: boolean;
  cancelledListError: string | null;
}

const initialState: CancelReceiptState = {
  colleges: [],
  collegesLoading: false,
  collegesError: null,

  ledgerNames: [],
  ledgerNamesLoading: false,
  ledgerNamesError: null,

  searchResults: [],
  searchLoading: false,
  searchError: null,

  cancelling: false,
  cancelError: null,
  cancelMessage: null,

  cancelledList: [],
  cancelledListLoading: false,
  cancelledListError: null,
};

/* ------------------------------------------------------------------ */
/*  Thunks                                                              */
/* ------------------------------------------------------------------ */

export const getCancelReceiptColleges = createAsyncThunk(
  "cancelReceipt/getColleges",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`cancel-receipt/colleges`);
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to load colleges");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getCancelReceiptLedgerNames = createAsyncThunk(
  "cancelReceipt/getLedgerNames",
  async (collegeName: string, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`cancel-receipt/ledger-names`, { collegeName });
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to load ledger names");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const searchCancelReceipt = createAsyncThunk(
  "cancelReceipt/search",
  async (params: SearchArgs, { rejectWithValue }) => {
    try {
      const query: Record<string, string> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query[key] = String(value);
        }
      });

      const response = await reduxApiClient.get(`cancel-receipt/search`, query);
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Search failed");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const addToCancelledReceipts = createAsyncThunk(
  "cancelReceipt/addToCancelled",
  async (params: AddToCancelledArgs, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.post(`cancel-receipt/cancel`, params);
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to cancel receipt");
      }
      return response.data ?? response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getCancelledReceiptsList = createAsyncThunk(
  "cancelReceipt/getCancelledList",
  async (params: ListCancelledArgs, { rejectWithValue }) => {
    try {
      const query: Record<string, string> = { dateFrom: params.dateFrom, dateTo: params.dateTo };
      if (params.collegeName) query.collegeName = params.collegeName;

      const response = await reduxApiClient.get(`cancel-receipt/cancelled-list`, query);
      if (!response.success) {
        return rejectWithValue(response.error?.message || "Failed to load list");
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

const cancelReceiptSlice = createSlice({
  name: "cancelReceipt",
  initialState,
  reducers: {
    clearSearchResults(state) {
      state.searchResults = [];
      state.searchError = null;
    },
    clearCancelStatus(state) {
      state.cancelError = null;
      state.cancelMessage = null;
    },
    clearLedgerNames(state) {
      state.ledgerNames = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCancelReceiptColleges.pending, (state) => {
        state.collegesLoading = true;
        state.collegesError = null;
      })
      .addCase(getCancelReceiptColleges.fulfilled, (state, action: any) => {
        state.collegesLoading = false;
        state.colleges = action.payload?.colleges ?? [];
      })
      .addCase(getCancelReceiptColleges.rejected, (state, action: any) => {
        state.collegesLoading = false;
        state.collegesError = action.payload || "Failed to load colleges";
      })

      .addCase(getCancelReceiptLedgerNames.pending, (state) => {
        state.ledgerNamesLoading = true;
        state.ledgerNamesError = null;
      })
      .addCase(getCancelReceiptLedgerNames.fulfilled, (state, action: any) => {
        state.ledgerNamesLoading = false;
        state.ledgerNames = action.payload?.ledgerNames ?? [];
      })
      .addCase(getCancelReceiptLedgerNames.rejected, (state, action: any) => {
        state.ledgerNamesLoading = false;
        state.ledgerNamesError = action.payload || "Failed to load ledger names";
        state.ledgerNames = [];
      })

      .addCase(searchCancelReceipt.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchCancelReceipt.fulfilled, (state, action: any) => {
        state.searchLoading = false;
        state.searchResults = action.payload?.rows ?? [];
      })
      .addCase(searchCancelReceipt.rejected, (state, action: any) => {
        state.searchLoading = false;
        state.searchError = action.payload || "Search failed";
        state.searchResults = [];
      })

      .addCase(addToCancelledReceipts.pending, (state) => {
        state.cancelling = true;
        state.cancelError = null;
        state.cancelMessage = null;
      })
      .addCase(addToCancelledReceipts.fulfilled, (state, action: any) => {
        state.cancelling = false;
        state.cancelMessage = action.payload?.message || "Receipt has been cancelled successfully";
      })
      .addCase(addToCancelledReceipts.rejected, (state, action: any) => {
        state.cancelling = false;
        state.cancelError = action.payload || "Failed to cancel receipt";
      })

      .addCase(getCancelledReceiptsList.pending, (state) => {
        state.cancelledListLoading = true;
        state.cancelledListError = null;
      })
      .addCase(getCancelledReceiptsList.fulfilled, (state, action: any) => {
        state.cancelledListLoading = false;
        state.cancelledList = action.payload?.rows ?? [];
      })
      .addCase(getCancelledReceiptsList.rejected, (state, action: any) => {
        state.cancelledListLoading = false;
        state.cancelledListError = action.payload || "Failed to load list";
        state.cancelledList = [];
      });
  },
});

export const { clearSearchResults, clearCancelStatus, clearLedgerNames } =
  cancelReceiptSlice.actions;
export default cancelReceiptSlice.reducer;