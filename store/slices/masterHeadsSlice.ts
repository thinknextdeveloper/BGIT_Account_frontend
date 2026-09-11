import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";
export interface MasterHead {
  collegeName: string;
  head: string;
  srNo: number;
}

export interface MasterHeadDraft {
  collegeName: string;
  head: string;
  srNo: string;
}

export interface MasterHeadKey {
  collegeName: string;
  head: string;
  srNo: number;
}

interface MasterHeadsState {
  colleges: string[];
  rows: MasterHead[];
  totalRecords: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  message: string | null;
}

export const emptyDraft: MasterHeadDraft = {
  collegeName: "",
  head: "",
  srNo: "",
};

const initialState: MasterHeadsState = {
  colleges: [],
  rows: [],
  totalRecords: 0,
  loading: false,
  submitting: false,
  error: null,
  message: null,
};

const rowKey = (row: { collegeName: string; head: string; srNo: number }) =>
  `${row.collegeName}|${row.head}|${row.srNo}`;

// Defensive normalizer: accepts camelCase or raw SQL column casing, same reasoning
// as the hostelCharges slice.
function normalizeRow(raw: any): MasterHead {
  const pick = (camelKey: string, pascalKey: string) =>
    raw[camelKey] !== undefined ? raw[camelKey] : raw[pascalKey];

  const srNoRaw = pick("srNo", "ID");

  return {
    collegeName: pick("collegeName", "CollegeName") ?? "",
    head: pick("head", "Head") ?? "",
    srNo: srNoRaw !== undefined && srNoRaw !== null ? Number(srNoRaw) : 0,
  };
}

// dropdown: colleges (mirrors Display() combo box source)
export const fetchColleges = createAsyncThunk(
  "masterHeads/fetchColleges",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("master-heads/colleges");
    if (!res.success) return rejectWithValue(res.error?.message);
    return res.data.data as string[];
  }
);

// grid data (mirrors Display())
export const fetchMasterHeads = createAsyncThunk(
  "masterHeads/fetchMasterHeads",
  async (userId: string, { rejectWithValue }) => {
    if (!userId) {
      return rejectWithValue("User not found. Please log in again.");
    }

    const res = await reduxApiClient.get("master-heads", { userId });
    if (!res.success) return rejectWithValue(res.error?.message || "Failed to load");
    return res.data as { data: MasterHead[]; totalRecords: number; message?: string };
  }
);
// add new record (mirrors btnSave_Click)
export const createMasterHead = createAsyncThunk(
  "masterHeads/createMasterHead",
  async (draft: MasterHeadDraft, { rejectWithValue }) => {
    const res = await reduxApiClient.post("master-heads", draft);
    if (!res.success) return rejectWithValue(res.error?.message || "Save failed");
    return res.data;
  }
);

// inline edit save (mirrors dgvMasterCategory_CellEndEdit)
export const updateMasterHead = createAsyncThunk(
  "masterHeads/updateMasterHead",
  async (params: { original: MasterHeadKey; draft: MasterHeadDraft }, { rejectWithValue }) => {
    const res = await reduxApiClient.put("master-heads", {
      original: params.original,
      ...params.draft,
    });
    if (!res.success) return rejectWithValue(res.error?.message || "Update failed");
    return { ...res.data, original: params.original };
  }
);

// row delete (mirrors dgvMasterCategory_UserDeletingRow)
export const deleteMasterHead = createAsyncThunk(
  "masterHeads/deleteMasterHead",
  async (key: MasterHeadKey, { rejectWithValue }) => {
    const query = new URLSearchParams({
      collegeName: key.collegeName,
      head: key.head,
      srNo: String(key.srNo),
    });
    const res = await reduxApiClient.delete(`master-heads?${query.toString()}`);
    if (!res.success) return rejectWithValue(res.error?.message || "Delete failed");
    return { key, ...res.data };
  }
);
const masterHeadsSlice = createSlice({
  name: "masterHeads",
  initialState,
  reducers: {
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
      .addCase(fetchMasterHeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterHeads.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = (action.payload.data || []).map(normalizeRow);
        state.totalRecords = state.rows.length;
        state.message = action.payload.message || null;
      })
      .addCase(fetchMasterHeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createMasterHead.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createMasterHead.fulfilled, (state, action) => {
        state.submitting = false;
        state.message = action.payload.message;
      })
      .addCase(createMasterHead.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      .addCase(updateMasterHead.fulfilled, (state, action) => {
        state.message = action.payload.message;
        const updated = normalizeRow(action.payload.data);
        const idx = state.rows.findIndex((r) => rowKey(r) === rowKey(action.payload.original));
        if (idx !== -1) state.rows[idx] = updated;
      })
      .addCase(updateMasterHead.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteMasterHead.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.rows = state.rows.filter((r) => rowKey(r) !== rowKey(action.payload.key));
        state.totalRecords = state.rows.length;
      })
      .addCase(deleteMasterHead.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearMessage } = masterHeadsSlice.actions;
export default masterHeadsSlice.reducer;
export { rowKey };

// In store.ts: