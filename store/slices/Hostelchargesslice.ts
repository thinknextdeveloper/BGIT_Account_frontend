// import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { reduxApiClient } from "@/services/reduxservices";

// export interface HostelCharge {
//   collegeName: string;
//   batch: string;
//   hostelName: string;
//   roomType: string | null;
//   hostelFee: number;
//   totalSeats: number;
//   hostelSecurity: string | null;
// }

// export interface HostelChargeDraft {
//   collegeName: string;
//   batch: string;
//   hostelName: string;
//   roomType: string;
//   hostelFee: string;
//   totalSeats: string;
//   hostelSecurity: string;
// }

// export interface HostelChargeKey {
//   collegeName: string;
//   batch: string;
//   hostelName: string;
//   roomType: string | null;
// }

// interface HostelChargesState {
//   colleges: string[];
//   batches: string[];
//   selectedCollege: string;
//   selectedBatch: string;
//   rows: HostelCharge[];
//   totalRecords: number;
//   loading: boolean;
//   submitting: boolean;
//   error: string | null;
//   message: string | null;
// }

// export const emptyDraft: HostelChargeDraft = {
//   collegeName: "",
//   batch: "",
//   hostelName: "",
//   roomType: "",
//   hostelFee: "",
//   totalSeats: "",
//   hostelSecurity: "",
// };

// const initialState: HostelChargesState = {
//   colleges: [],
//   batches: [],
//   selectedCollege: "",
//   selectedBatch: "",
//   rows: [],
//   totalRecords: 0,
//   loading: false,
//   submitting: false,
//   error: null,
//   message: null,
// };

// const rowKey = (row: { collegeName: string; batch: string; hostelName: string; roomType: string | null }) =>
//   `${row.collegeName}|${row.batch}|${row.hostelName}|${row.roomType || ""}`;

// // dropdown: colleges (mirrors frmdebit.FillCollege)
// export const fetchColleges = createAsyncThunk(
//   "hostelCharges/fetchColleges",
//   async (_, { rejectWithValue }) => {
//     const res = await reduxApiClient.get("hostel-charges/colleges");
//     if (!res.success) return rejectWithValue(res.error?.message);
//     return res.data.data as string[];
//   }
// );

// // dropdown: batches, scoped to a college (mirrors frmdebit.FillBatch)
// export const fetchBatches = createAsyncThunk(
//   "hostelCharges/fetchBatches",
//   async (collegeName: string, { rejectWithValue }) => {
//     const res = await reduxApiClient.get(
//       `hostel-charges/batches?collegeName=${encodeURIComponent(collegeName)}`
//     );
//     if (!res.success) return rejectWithValue(res.error?.message);
//     return res.data.data as string[];
//   }
// );

// // grid data (mirrors Display())
// export const fetchHostelCharges = createAsyncThunk(
//   "hostelCharges/fetchHostelCharges",
//   async (
//     params: { collegeName: string; batch?: string },
//     { rejectWithValue }
//   ) => {
//     const query = new URLSearchParams();
//     if (params.collegeName) query.set("collegeName", params.collegeName);
//     if (params.batch) query.set("batch", params.batch);
//     const res = await reduxApiClient.get(`hostel-charges?${query.toString()}`);
//     if (!res.success) return rejectWithValue(res.error?.message || "Failed to load");
//     return res.data as { data: HostelCharge[]; totalRecords: number; message?: string };
//   }
// );

// // add new record (mirrors btnSave_Click)
// export const createHostelCharge = createAsyncThunk(
//   "hostelCharges/createHostelCharge",
//   async (draft: HostelChargeDraft, { rejectWithValue }) => {
//     const res = await reduxApiClient.post("hostel-charges", draft);
//     if (!res.success) return rejectWithValue(res.error?.message || "Save failed");
//     return res.data;
//   }
// );

// // inline edit save (mirrors DataGridView1_CellValueChanged)
// // `original` is the row's pre-edit natural key — the table has no surrogate id,
// // so the backend needs it to find the row to update.
// export const updateHostelCharge = createAsyncThunk(
//   "hostelCharges/updateHostelCharge",
//   async (
//     params: { original: HostelChargeKey; draft: HostelChargeDraft },
//     { rejectWithValue }
//   ) => {
//     const res = await reduxApiClient.put("hostel-charges", {
//       original: params.original,
//       ...params.draft,
//     });
//     if (!res.success) return rejectWithValue(res.error?.message || "Update failed");
//     return { ...res.data, original: params.original };
//   }
// );

// // row delete (mirrors DataGridView1_UserDeletingRow)
// export const deleteHostelCharge = createAsyncThunk(
//   "hostelCharges/deleteHostelCharge",
//   async (key: HostelChargeKey, { rejectWithValue }) => {
//     const res = await reduxApiClient.delete("hostel-charges", { data: key });
//     if (!res.success) return rejectWithValue(res.error?.message || "Delete failed");
//     return { key, ...res.data };
//   }
// );

// const hostelChargesSlice = createSlice({
//   name: "hostelCharges",
//   initialState,
//   reducers: {
//     setSelectedCollege(state, action: PayloadAction<string>) {
//       state.selectedCollege = action.payload;
//       state.selectedBatch = "";
//       state.batches = [];
//     },
//     setSelectedBatch(state, action: PayloadAction<string>) {
//       state.selectedBatch = action.payload;
//     },
//     clearMessage(state) {
//       state.error = null;
//       state.message = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchColleges.fulfilled, (state, action) => {
//         state.colleges = action.payload;
//       })
//       .addCase(fetchBatches.fulfilled, (state, action) => {
//         state.batches = action.payload;
//       })
//       .addCase(fetchHostelCharges.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchHostelCharges.fulfilled, (state, action) => {
//         state.loading = false;
//         state.rows = action.payload.data;
//         state.totalRecords = action.payload.data.length;
//         state.message = action.payload.message || null;
//       })
//       .addCase(fetchHostelCharges.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })
//       .addCase(createHostelCharge.pending, (state) => {
//         state.submitting = true;
//         state.error = null;
//       })
//       .addCase(createHostelCharge.fulfilled, (state, action) => {
//         state.submitting = false;
//         state.message = action.payload.message;
//       })
//       .addCase(createHostelCharge.rejected, (state, action) => {
//         state.submitting = false;
//         state.error = action.payload as string;
//       })
//       .addCase(updateHostelCharge.fulfilled, (state, action) => {
//         state.message = action.payload.message;
//         const updated = action.payload.data as HostelCharge;
//         const idx = state.rows.findIndex((r) => rowKey(r) === rowKey(action.payload.original));
//         if (idx !== -1) state.rows[idx] = updated;
//       })
//       .addCase(updateHostelCharge.rejected, (state, action) => {
//         state.error = action.payload as string;
//       })
//       .addCase(deleteHostelCharge.fulfilled, (state, action) => {
//         state.message = action.payload.message;
//         state.rows = state.rows.filter((r) => rowKey(r) !== rowKey(action.payload.key));
//         state.totalRecords = state.rows.length;
//       })
//       .addCase(deleteHostelCharge.rejected, (state, action) => {
//         state.error = action.payload as string;
//       });
//   },
// });

// export const { setSelectedCollege, setSelectedBatch, clearMessage } =
//   hostelChargesSlice.actions;
// export default hostelChargesSlice.reducer;
// export { rowKey };

// // In store.ts: 

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface HostelCharge {
  collegeName: string;
  batch: string;
  hostelName: string;
  roomType: string | null;
  hostelFee: number;
  totalSeats: number;
  hostelSecurity: string | null;
}

export interface HostelChargeDraft {
  collegeName: string;
  batch: string;
  hostelName: string;
  roomType: string;
  hostelFee: string;
  totalSeats: string;
  hostelSecurity: string;
}

export interface HostelChargeKey {
  collegeName: string;
  batch: string;
  hostelName: string;
  roomType: string | null;
}

interface HostelChargesState {
  colleges: string[];
  batches: string[];
  selectedCollege: string;
  selectedBatch: string;
  rows: HostelCharge[];
  totalRecords: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  message: string | null;
}

export const emptyDraft: HostelChargeDraft = {
  collegeName: "",
  batch: "",
  hostelName: "",
  roomType: "",
  hostelFee: "",
  totalSeats: "",
  hostelSecurity: "",
};

const initialState: HostelChargesState = {
  colleges: [],
  batches: [],
  selectedCollege: "",
  selectedBatch: "",
  rows: [],
  totalRecords: 0,
  loading: false,
  submitting: false,
  error: null,
  message: null,
};

const rowKey = (row: { collegeName: string; batch: string; hostelName: string; roomType: string | null }) =>
  `${row.collegeName}|${row.batch}|${row.hostelName}|${row.roomType || ""}`;

// Defensive normalizer: accepts either camelCase ("collegeName") or the raw SQL
// column casing ("CollegeName") so the UI still renders correctly even if the
// API hasn't picked up the column-alias fix yet.
function normalizeRow(raw: any): HostelCharge {
  const pick = (camelKey: string) => {
    if (raw[camelKey] !== undefined) return raw[camelKey];
    const pascalKey = camelKey.charAt(0).toUpperCase() + camelKey.slice(1);
    return raw[pascalKey];
  };

  const feeRaw = pick("hostelFee");
  const seatsRaw = pick("totalSeats");

  return {
    collegeName: pick("collegeName") ?? "",
    batch: pick("batch") != null ? String(pick("batch")) : "",
    hostelName: pick("hostelName") ?? "",
    roomType: pick("roomType") ?? null,
    hostelFee: feeRaw !== undefined && feeRaw !== null ? Number(feeRaw) : 0,
    totalSeats: seatsRaw !== undefined && seatsRaw !== null ? Number(seatsRaw) : 0,
    hostelSecurity: pick("hostelSecurity") ?? null,
  };
}

// dropdown: colleges (mirrors frmdebit.FillCollege)
export const fetchColleges = createAsyncThunk(
  "hostelCharges/fetchColleges",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("hostel-charges/colleges");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data as string[];
  }
);

// dropdown: batches, scoped to a college (mirrors frmdebit.FillBatch)
export const fetchBatches = createAsyncThunk(
  "hostelCharges/fetchBatches",
  async (collegeName: string, { rejectWithValue }) => {
    const res = await reduxApiClient.get(
      `hostel-charges/batches?collegeName=${encodeURIComponent(collegeName)}`
    );
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data as string[];
  }
);

// grid data (mirrors Display())
export const fetchHostelCharges = createAsyncThunk(
  "hostelCharges/fetchHostelCharges",
  async (
    params: { collegeName: string; batch?: string },
    { rejectWithValue }
  ) => {
    const query = new URLSearchParams();
    if (params.collegeName) query.set("collegeName", params.collegeName);
    if (params.batch) query.set("batch", params.batch);
    const res = await reduxApiClient.get(`hostel-charges?${query.toString()}`);
    if (!res.success) return rejectWithValue(res.error?.message || "Failed to load");
    return res.data as { data: HostelCharge[]; totalRecords: number; message?: string };
  }
);

// add new record (mirrors btnSave_Click)
export const createHostelCharge = createAsyncThunk(
  "hostelCharges/createHostelCharge",
  async (draft: HostelChargeDraft, { rejectWithValue }) => {
    const res = await reduxApiClient.post("hostel-charges", draft);
    if (!res.success) return rejectWithValue(res.error?.message || "Save failed");
    return res.data;
  }
);

// inline edit save (mirrors DataGridView1_CellValueChanged)
// `original` is the row's pre-edit natural key — the table has no surrogate id,
// so the backend needs it to find the row to update.
export const updateHostelCharge = createAsyncThunk(
  "hostelCharges/updateHostelCharge",
  async (
    params: { original: HostelChargeKey; draft: HostelChargeDraft },
    { rejectWithValue }
  ) => {
    const res = await reduxApiClient.put("hostel-charges", {
      original: params.original,
      ...params.draft,
    });
    if (!res.success) return rejectWithValue(res.error?.message || "Update failed");
    return { ...res.data, original: params.original };
  }
);

// row delete (mirrors DataGridView1_UserDeletingRow)
// export const deleteHostelCharge = createAsyncThunk(
//   "hostelCharges/deleteHostelCharge",
//   async (key: HostelChargeKey, { rejectWithValue }) => {
//     const res = await reduxApiClient.delete("hostel-charges", { data: key });
//     if (!res.success) return rejectWithValue(res.error?.message || "Delete failed");
//     return { key, ...res.data };
//   }
// );


export const deleteHostelCharge = createAsyncThunk(
  "hostelCharges/deleteHostelCharge",
  async (key: HostelChargeKey, { rejectWithValue }) => {
    const query = new URLSearchParams({
      collegeName: key.collegeName,
      batch: key.batch,
      hostelName: key.hostelName,
      roomType: key.roomType ?? "",
    });
    const res = await reduxApiClient.delete(`hostel-charges?${query.toString()}`);
    if (!res.success) return rejectWithValue(res.error?.message || "Delete failed");
    return { key, ...res.data };
  }
);


const hostelChargesSlice = createSlice({
  name: "hostelCharges",
  initialState,
  reducers: {
    setSelectedCollege(state, action: PayloadAction<string>) {
      state.selectedCollege = action.payload;
      state.selectedBatch = "";
      state.batches = [];
    },
    setSelectedBatch(state, action: PayloadAction<string>) {
      state.selectedBatch = action.payload;
    },
    clearMessage(state) {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColleges.fulfilled, (state, action) => {
        state.colleges = action.payload;
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.batches = action.payload;
      })
      .addCase(fetchHostelCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHostelCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = (action.payload.data || []).map(normalizeRow);
        state.totalRecords = state.rows.length;
        state.message = action.payload.message || null;
      })
      .addCase(fetchHostelCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createHostelCharge.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createHostelCharge.fulfilled, (state, action) => {
        state.submitting = false;
        state.message = action.payload.message;
      })
      .addCase(createHostelCharge.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      .addCase(updateHostelCharge.fulfilled, (state, action) => {
        state.message = action.payload.message;
        const updated = normalizeRow(action.payload.data);
        const idx = state.rows.findIndex((r) => rowKey(r) === rowKey(action.payload.original));
        if (idx !== -1) state.rows[idx] = updated;
      })
      .addCase(updateHostelCharge.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteHostelCharge.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.rows = state.rows.filter((r) => rowKey(r) !== rowKey(action.payload.key));
        state.totalRecords = state.rows.length;
      })
      .addCase(deleteHostelCharge.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCollege, setSelectedBatch, clearMessage } =
  hostelChargesSlice.actions;
export default hostelChargesSlice.reducer;
export { rowKey };

// In store.ts: hostelCharges: hostelChargesReducer