// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { reduxApiClient } from "@/services/reduxservices";

// /* ------------------------------------------------------------------ */
// /*  Types                                                              */
// /* ------------------------------------------------------------------ */

// export interface AllRecordRow {
//   CollegeName: string;
//   StudentName: string;
//   Course: string;
//   Batch: string | number;
//   Semester: string;
//   Session: string;
//   FeeCategory: string;
//   Debit: number | null;
//   Credit: number | null;
// }

// interface GetCoursesArgs {
//   collegeName?: string;
// }

// interface GetBatchesArgs {
//   collegeName?: string;
// }

// interface GetAllRecordsArgs {
//   collegeName?: string;
//   course?: string;
//   batch?: string;
//   semester?: string;
//   session?: string;
//   feeCategory?: string;
// }

// interface AllRecordState {
//   colleges: string[];
//   courses: string[];
//   batches: string[];
//   feeCategories: string[];
//   sessions: string[];

//   rows: AllRecordRow[];
//   columns: string[];
//   totalDebit: number | null;
//   totalCredit: number | null;
//   totalPending: number | null;
//   totalRecords: number | null;

//   metaLoading: boolean;
//   metaError: string | null;

//   loading: boolean;
//   error: string | null;
// }

// const initialState: AllRecordState = {
//   colleges: [],
//   courses: [],
//   batches: [],
//   feeCategories: [],
//   sessions: [],

//   rows: [],
//   columns: [],
//   totalDebit: null,
//   totalCredit: null,
//   totalPending: null,
//   totalRecords: null,

//   metaLoading: false,
//   metaError: null,

//   loading: false,
//   error: null,
// };

// /* ------------------------------------------------------------------ */
// /*  Helpers                                                             */
// /* ------------------------------------------------------------------ */

// // reduxApiClient's exact response shape can vary by endpoint/version —
// // some responses come back as { success, data, error }, others as a bare
// // { data } with no success flag, and some tools even hand back the raw
// // array/object directly. Rather than assuming one shape (and silently
// // treating a shape mismatch as a failure), unwrap defensively:
// //   - an explicit `success: false` is always a real failure
// //   - otherwise prefer `.data` if present, falling back to the response itself
// function unwrapListResponse(response: any, fallbackErrorMessage: string): any {
//   if (response && response.success === false) {
//     throw new Error(response.error?.message || response.message || fallbackErrorMessage);
//   }
//   if (response && Object.prototype.hasOwnProperty.call(response, "data")) {
//     return response.data;
//   }
//   return response;
// }

// /* ------------------------------------------------------------------ */
// /*  Thunks                                                              */
// /* ------------------------------------------------------------------ */
// export const getColleges = createAsyncThunk(
//   "allRecord/getColleges",
//   async (_: void, { rejectWithValue }) => {
//     try {
//       const response = await reduxApiClient.get(`all-record/colleges`);

//     //   console.log("College API Response:", response);
//     //   console.log("College API Data:", response.data);

//       return unwrapListResponse(response, "Failed to fetch colleges");
//     } catch (err: any) {
//       console.error("College API Error:", err);
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );

// export const getCourses = createAsyncThunk(
//   "allRecord/getCourses",
//   async ({ collegeName }: GetCoursesArgs, { rejectWithValue }) => {
//     try {
//       const params: Record<string, string> = {};
//       if (collegeName) params.collegeName = collegeName;
//       const response = await reduxApiClient.get(`all-record/courses`, params);
//       return unwrapListResponse(response, "Failed to fetch courses");
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );

// export const getBatches = createAsyncThunk(
//   "allRecord/getBatches",
//   async ({ collegeName }: GetBatchesArgs, { rejectWithValue }) => {
//     try {
//       const params: Record<string, string> = {};
//       if (collegeName) params.collegeName = collegeName;
//       const response = await reduxApiClient.get(`all-record/batches`, params);
//       return unwrapListResponse(response, "Failed to fetch batches");
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );

// export const getFeeCategories = createAsyncThunk(
//   "allRecord/getFeeCategories",
//   async (_: void, { rejectWithValue }) => {
//     try {
//       const response = await reduxApiClient.get(`all-record/fee-categories`);
//       return unwrapListResponse(response, "Failed to fetch fee categories");
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );

// export const getSessions = createAsyncThunk(
//   "allRecord/getSessions",
//   async (_: void, { rejectWithValue }) => {
//     try {
//       const response = await reduxApiClient.get(`all-record/sessions`);
//       return unwrapListResponse(response, "Failed to fetch sessions");
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );

// // Mirrors btnShow_Click -> Display4() + total()
// export const getAllRecords = createAsyncThunk(
//   "allRecord/getAllRecords",
//   async (args: GetAllRecordsArgs, { rejectWithValue }) => {
//     try {
//       const params: Record<string, string> = {};
//       Object.entries(args).forEach(([key, value]) => {
//         if (value) params[key] = value;
//       });

//       const response = await reduxApiClient.get(`all-record/display`, params);
//       return unwrapListResponse(response, "Failed to fetch records");
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );

// /* ------------------------------------------------------------------ */
// /*  Slice                                                               */
// /* ------------------------------------------------------------------ */

// const allRecordSlice = createSlice({
//   name: "allRecord",
//   initialState,
//   reducers: {
//     clearRecords(state) {
//       state.rows = [];
//       state.columns = [];
//       state.totalDebit = null;
//       state.totalCredit = null;
//       state.totalPending = null;
//       state.totalRecords = null;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // -------- getColleges --------
//       .addCase(getColleges.pending, (state) => {
//         state.metaLoading = true;
//         state.metaError = null;
//       })
//       .addCase(getColleges.fulfilled, (state, action: any) => {
//         state.metaLoading = false;
//         state.colleges = action.payload ?? [];
//       })
//       .addCase(getColleges.rejected, (state, action: any) => {
//         state.metaLoading = false;
//         state.metaError = action.payload || "Failed to fetch colleges";
//         state.colleges = [];
//       })

//       // -------- getCourses --------
//       .addCase(getCourses.fulfilled, (state, action: any) => {
//         state.courses = action.payload ?? [];
//       })
//       .addCase(getCourses.rejected, (state, action: any) => {
//         state.metaError = action.payload || "Failed to fetch courses";
//         state.courses = [];
//       })

//       // -------- getBatches --------
//       .addCase(getBatches.fulfilled, (state, action: any) => {
//         state.batches = action.payload ?? [];
//       })
//       .addCase(getBatches.rejected, (state, action: any) => {
//         state.metaError = action.payload || "Failed to fetch batches";
//         state.batches = [];
//       })

//       // -------- getFeeCategories --------
//       .addCase(getFeeCategories.fulfilled, (state, action: any) => {
//         state.feeCategories = action.payload ?? [];
//       })
//       .addCase(getFeeCategories.rejected, (state, action: any) => {
//         state.metaError = action.payload || "Failed to fetch fee categories";
//         state.feeCategories = [];
//       })

//       // -------- getSessions --------
//       .addCase(getSessions.fulfilled, (state, action: any) => {
//         state.sessions = action.payload ?? [];
//       })
//       .addCase(getSessions.rejected, (state, action: any) => {
//         state.metaError = action.payload || "Failed to fetch sessions";
//         state.sessions = [];
//       })

//       // -------- getAllRecords --------
//       .addCase(getAllRecords.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getAllRecords.fulfilled, (state, action: any) => {
//         state.loading = false;

//         const payload = action.payload ?? {};
//         state.rows = payload.rows ?? [];
//         state.columns = payload.columns ?? [];
//         state.totalDebit = payload.totalDebit ?? null;
//         state.totalCredit = payload.totalCredit ?? null;
//         state.totalPending = payload.totalPending ?? null;
//         state.totalRecords = payload.totalRecords ?? null;
//       })
//       .addCase(getAllRecords.rejected, (state, action: any) => {
//         state.loading = false;
//         state.error = action.payload || "Something went wrong";
//         state.rows = [];
//         state.columns = [];
//         state.totalDebit = null;
//         state.totalCredit = null;
//         state.totalPending = null;
//         state.totalRecords = null;
//       });
//   },
// });

// export const { clearRecords } = allRecordSlice.actions;
// export default allRecordSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AllRecordRow {
  CollegeName: string;
  StudentName: string;
  Course: string;
  Batch: string | number;
  Semester: string;
  Session: string;
  FeeCategory: string;
  Debit: number | null;
  Credit: number | null;
}

interface GetCoursesArgs {
  collegeName?: string;
}

interface GetBatchesArgs {
  collegeName?: string;
}

interface GetAllRecordsArgs {
  collegeName?: string;
  course?: string;
  batch?: string;
  semester?: string;
  session?: string;
  feeCategory?: string;
}

interface AllRecordState {
  colleges: string[];
  courses: string[];
  batches: string[];
  feeCategories: string[];
  sessions: string[];

  rows: AllRecordRow[];
  columns: string[];
  totalDebit: number | null;
  totalCredit: number | null;
  totalPending: number | null;
  totalRecords: number | null;

  metaLoading: boolean;
  metaError: string | null;

  loading: boolean;
  error: string | null;
}

const initialState: AllRecordState = {
  colleges: [],
  courses: [],
  batches: [],
  feeCategories: [],
  sessions: [],

  rows: [],
  columns: [],
  totalDebit: null,
  totalCredit: null,
  totalPending: null,
  totalRecords: null,

  metaLoading: false,
  metaError: null,

  loading: false,
  error: null,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

// reduxApiClient's exact response shape can vary by endpoint/version —
// some responses come back as { success, data, error }, others as a bare
// { data } with no success flag, some are wrapped an extra level (e.g.
// the client hands back { data: <parsed-body> } where <parsed-body> is
// itself { success, data } from our own API), and some tools even hand
// back the raw array/object directly.
//
// Rather than assuming a fixed number of wrapper layers, peel them off
// one at a time until we hit something that isn't itself a wrapper:
//   - an explicit `success: false` at ANY layer is always a real failure
//   - otherwise, keep descending into `.data` as long as it exists
//   - stop as soon as the current node has no `.data` property left,
//     or is an array (the actual payload), and return that
function unwrapListResponse(response: any, fallbackErrorMessage: string): any {
  let node = response;

  while (node && typeof node === "object" && !Array.isArray(node)) {
    if (node.success === false) {
      throw new Error(node.error?.message || node.message || fallbackErrorMessage);
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
/*  Thunks                                                              */
/* ------------------------------------------------------------------ */
export const getColleges = createAsyncThunk(
  "allRecord/getColleges",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`all-record/colleges`);
      return unwrapListResponse(response, "Failed to fetch colleges");
    } catch (err: any) {
      console.error("College API Error:", err);
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getCourses = createAsyncThunk(
  "allRecord/getCourses",
  async ({ collegeName }: GetCoursesArgs, { rejectWithValue }) => {
    try {
      const params: Record<string, string> = {};
      if (collegeName) params.collegeName = collegeName;
      const response = await reduxApiClient.get(`all-record/courses`, params);
      return unwrapListResponse(response, "Failed to fetch courses");
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getBatches = createAsyncThunk(
  "allRecord/getBatches",
  async ({ collegeName }: GetBatchesArgs, { rejectWithValue }) => {
    try {
      const params: Record<string, string> = {};
      if (collegeName) params.collegeName = collegeName;
      const response = await reduxApiClient.get(`all-record/batches`, params);
      return unwrapListResponse(response, "Failed to fetch batches");
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getFeeCategories = createAsyncThunk(
  "allRecord/getFeeCategories",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`all-record/fee-categories`);
      return unwrapListResponse(response, "Failed to fetch fee categories");
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

export const getSessions = createAsyncThunk(
  "allRecord/getSessions",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await reduxApiClient.get(`all-record/sessions`);
      return unwrapListResponse(response, "Failed to fetch sessions");
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

// Mirrors btnShow_Click -> Display4() + total()
export const getAllRecords = createAsyncThunk(
  "allRecord/getAllRecords",
  async (args: GetAllRecordsArgs, { rejectWithValue }) => {
    try {
      const params: Record<string, string> = {};
      Object.entries(args).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response = await reduxApiClient.get(`all-record/display`, params);
      return unwrapListResponse(response, "Failed to fetch records");
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

/* ------------------------------------------------------------------ */
/*  Slice                                                               */
/* ------------------------------------------------------------------ */

const allRecordSlice = createSlice({
  name: "allRecord",
  initialState,
  reducers: {
    clearRecords(state) {
      state.rows = [];
      state.columns = [];
      state.totalDebit = null;
      state.totalCredit = null;
      state.totalPending = null;
      state.totalRecords = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------- getColleges --------
      .addCase(getColleges.pending, (state) => {
        state.metaLoading = true;
        state.metaError = null;
      })
      .addCase(getColleges.fulfilled, (state, action: any) => {
        state.metaLoading = false;
        state.colleges = action.payload ?? [];
      })
      .addCase(getColleges.rejected, (state, action: any) => {
        state.metaLoading = false;
        state.metaError = action.payload || "Failed to fetch colleges";
        state.colleges = [];
      })

      // -------- getCourses --------
      .addCase(getCourses.fulfilled, (state, action: any) => {
        state.courses = action.payload ?? [];
      })
      .addCase(getCourses.rejected, (state, action: any) => {
        state.metaError = action.payload || "Failed to fetch courses";
        state.courses = [];
      })

      // -------- getBatches --------
      .addCase(getBatches.fulfilled, (state, action: any) => {
        state.batches = action.payload ?? [];
      })
      .addCase(getBatches.rejected, (state, action: any) => {
        state.metaError = action.payload || "Failed to fetch batches";
        state.batches = [];
      })

      // -------- getFeeCategories --------
      .addCase(getFeeCategories.fulfilled, (state, action: any) => {
        state.feeCategories = action.payload ?? [];
      })
      .addCase(getFeeCategories.rejected, (state, action: any) => {
        state.metaError = action.payload || "Failed to fetch fee categories";
        state.feeCategories = [];
      })

      // -------- getSessions --------
      .addCase(getSessions.fulfilled, (state, action: any) => {
        state.sessions = action.payload ?? [];
      })
      .addCase(getSessions.rejected, (state, action: any) => {
        state.metaError = action.payload || "Failed to fetch sessions";
        state.sessions = [];
      })

      // -------- getAllRecords --------
      .addCase(getAllRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRecords.fulfilled, (state, action: any) => {
        state.loading = false;

        const payload = action.payload ?? {};
        state.rows = payload.rows ?? [];
        state.columns = payload.columns ?? [];
        state.totalDebit = payload.totalDebit ?? null;
        state.totalCredit = payload.totalCredit ?? null;
        state.totalPending = payload.totalPending ?? null;
        state.totalRecords = payload.totalRecords ?? null;
      })
      .addCase(getAllRecords.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
        state.rows = [];
        state.columns = [];
        state.totalDebit = null;
        state.totalCredit = null;
        state.totalPending = null;
        state.totalRecords = null;
      });
  },
});

export const { clearRecords } = allRecordSlice.actions;
export default allRecordSlice.reducer;