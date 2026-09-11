// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { reduxApiClient } from "@/services/reduxservices";

// interface StudentDetailsState {
//   rows: any[];
//   loading: boolean;
//   saving: boolean;
//   error: string | null;
// }

// const initialState: StudentDetailsState = {
//   rows: [],
//   loading: false,
//   saving: false,
//   error: null,
// };

// export const displayStudents = createAsyncThunk(
//   "studentDetails/display",
//   async (
//     params: { collegeName: string; course?: string; batch?: string },
//     { rejectWithValue }
//   ) => {
//     const response = await reduxApiClient.get("admissions/display", params as any);
//     if (!response.success) return rejectWithValue(response.error?.message);
//     return response.data.data;
//   }
// );

// export const updateStudentField = createAsyncThunk(
//   "studentDetails/updateField",
//   async (
//     data: { idNo: number; field: string; value: string },
//     { rejectWithValue }
//   ) => {
//     const response = await reduxApiClient.put("admissions/update-field", data);
//     if (!response.success) return rejectWithValue(response.error?.message);
//     return data;
//   }
// );

// export const createStudent = createAsyncThunk(
//   "studentDetails/create",
//   async (record: Record<string, any>, { rejectWithValue }) => {
//     const response = await reduxApiClient.post("admissions", record);
//     if (!response.success) return rejectWithValue(response.error?.message || response.data?.message);
//     return record;
//   }
// );

// const studentDetailsSlice = createSlice({
//   name: "studentDetails",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(displayStudents.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(displayStudents.fulfilled, (state, action: any) => {
//         state.loading = false;
//         state.rows = action.payload;
//       })
//       .addCase(displayStudents.rejected, (state, action: any) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(updateStudentField.fulfilled, (state, action) => {
//         const { idNo, field, value } = action.payload;
//         const row = state.rows.find((r) => r.IDNo === idNo);
//         if (row) row[field] = value;
//       })
//       .addCase(updateStudentField.rejected, (state, action: any) => {
//         state.error = action.payload;
//       })
//       .addCase(createStudent.pending, (state) => {
//         state.saving = true;
//         state.error = null;
//       })
//       .addCase(createStudent.fulfilled, (state, action: any) => {
//         state.saving = false;
//         state.rows = [...state.rows, action.payload];
//       })
//       .addCase(createStudent.rejected, (state, action: any) => {
//         state.saving = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default studentDetailsSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

interface StudentDetailsState {
  rows: any[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: StudentDetailsState = {
  rows: [],
  loading: false,
  saving: false,
  error: null,
};

export const displayStudents = createAsyncThunk(
  "studentDetails/display",
  async (
    params: { collegeName: string; course?: string; batch?: string },
    { rejectWithValue }
  ) => {
    const response = await reduxApiClient.get("admissions/display", params as any);
    if (!response.success) return rejectWithValue(response.error?.message);
    return response.data.data;
  }
);

export const updateStudentField = createAsyncThunk(
  "studentDetails/updateField",
  async (
    data: { idNo: number; field: string; value: string },
    { rejectWithValue }
  ) => {
    const response = await reduxApiClient.put("admissions/update-field", data);
    if (!response.success) return rejectWithValue(response.error?.message);
    return data;
  }
);

export const createStudent = createAsyncThunk(
  "studentDetails/create",
  async (record: Record<string, any>, { rejectWithValue }) => {
    const response = await reduxApiClient.put("admissions/update-field", record);
    if (!response.success) return rejectWithValue(response.error?.message || response.data?.message);
    return record;
  }
);

const studentDetailsSlice = createSlice({
  name: "studentDetails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(displayStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(displayStudents.fulfilled, (state, action: any) => {
        state.loading = false;
        state.rows = action.payload;
      })
      .addCase(displayStudents.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateStudentField.fulfilled, (state, action) => {
        const { idNo, field, value } = action.payload;
        const row = state.rows.find((r) => r.IDNo === idNo);
        if (row) row[field] = value;
      })
      .addCase(updateStudentField.rejected, (state, action: any) => {
        state.error = action.payload;
      })
      .addCase(createStudent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createStudent.fulfilled, (state, action: any) => {
        state.saving = false;
        state.rows = [...state.rows, action.payload];
      })
      .addCase(createStudent.rejected, (state, action: any) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export default studentDetailsSlice.reducer;