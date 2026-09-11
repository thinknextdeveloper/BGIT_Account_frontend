// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { reduxApiClient } from "@/services/reduxservices";

// const emptySlot = () => ({
//     type: "IDNo",
//     idNo: "",
//     student: null,
//     semesters: [],
//     selectedSemester: "",
//     freePassAvailable: false,
//     canPrint: false,
//     feeRows: [],
//     blockedMessage: null,
//     srNo: null,

//     displayLoading: false,
//     displayError: null,

//     saving: false,
//     saveError: null,
//     saveMessage: null,
//     duplicateConfirmPending: false,

//     savingImage: false,
//     saveImageError: null,

//     issuingCard: false,
//     issueCardError: null,
//     issueCardMessage: null,
//     issueCardConfirmPending: false,
// });

// const initialState = {
//     colleges: [],
//     courses: [],
//     batches: [],
//     lookupsLoading: false,

//     slot1: emptySlot(),
//     slot2: emptySlot(),
// };

// export const fetchColleges = createAsyncThunk("hostelBusPass/fetchColleges", async (_, { rejectWithValue }) => {
//     const response = await reduxApiClient.get("hostel-bus-pass/colleges");
//     if (!response.success) return rejectWithValue(response.error?.message || response.message || "Failed to load colleges");
//     return response.data;
// });

// export const fetchCourses = createAsyncThunk(
//     "hostelBusPass/fetchCourses",
//     async (collegeName, { rejectWithValue }) => {
//         const response = await reduxApiClient.get("hostel-bus-pass/courses", { collegeName });
//         if (!response.success) return rejectWithValue(response.error?.message || response.message || "Failed to load courses");
//         return response.data;
//     }
// );

// export const fetchBatches = createAsyncThunk(
//     "hostelBusPass/fetchBatches",
//     async ({ collegeName, course }, { rejectWithValue }) => {
//         const response = await reduxApiClient.get("hostel-bus-pass/batches", { collegeName, course });
//         if (!response.success) return rejectWithValue(response.error?.message || response.message || "Failed to load batches");
//         return response.data;
//     }
// );

// export const fetchSemesters = createAsyncThunk(
//     "hostelBusPass/fetchSemesters",
//     async ({ collegeName, course, batch }, { rejectWithValue }) => {
//         const response = await reduxApiClient.get("hostel-bus-pass/semesters", { collegeName, course, batch });
//         if (!response.success) return rejectWithValue(response.error?.message || response.message || "Failed to load semesters");
//         return response.data;
//     }
// );

// export const displayStudent = createAsyncThunk(
//     "hostelBusPass/displayStudent",
//     async ({ slot, type, idNo }, { rejectWithValue }) => {
//         const response = await reduxApiClient.get("hostel-bus-pass/student", { type, idNo });
//         if (!response.success) {
//             return rejectWithValue(response.error?.message || response.message || "Failed to load record");
//         }
//         return response.data.data; // <-- was response.data
//     }
// );

// export const savePass = createAsyncThunk(
//     "hostelBusPass/savePass",
//     async ({ slot, ...payload }, { rejectWithValue }) => {
//         const response = await reduxApiClient.post("hostel-bus-pass/save", payload);
//         if (!response.success) {
//             if (response.data?.requiresConfirmation) {
//                 return rejectWithValue({ message: response.error?.message || response.message, requiresConfirmation: true, srNo: response.data.srNo });
//             }
//             return rejectWithValue({ message: response.error?.message || response.message || "Failed to save" });
//         }
//         return response;
//     }
// );

// export const issueCard = createAsyncThunk(
//     "hostelBusPass/issueCard",
//     async ({ slot, ...payload }, { rejectWithValue }) => {
//         const response = await reduxApiClient.post("hostel-bus-pass/issue-card", payload);
//         if (!response.success) {
//             if (response.data?.requiresConfirmation) {
//                 return rejectWithValue({ message: response.error?.message || response.message, requiresConfirmation: true });
//             }
//             return rejectWithValue({ message: response.error?.message || response.message || "Failed to issue card" });
//         }
//         return response;
//     }
// );

// const hostelBusPassSlice = createSlice({
//     name: "hostelBusPass",
//     initialState,
//     reducers: {
//         setSlotField(state, action) {
//             const { slot, field, value } = action.payload;
//             state[slot][field] = value;
//         },
//         resetSlot(state, action) {
//             state[action.payload.slot] = emptySlot();
//         },
//         clearSaveStatus(state, action) {
//             const s = state[action.payload.slot];
//             s.saveError = null;
//             s.saveMessage = null;
//             s.duplicateConfirmPending = false;
//         },
//         clearIssueCardStatus(state, action) {
//             const s = state[action.payload.slot];
//             s.issueCardError = null;
//             s.issueCardMessage = null;
//             s.issueCardConfirmPending = false;
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             // ---- Colleges ----
//             .addCase(fetchColleges.pending, (state) => {
//                 state.lookupsLoading = true;
//             })
//             .addCase(fetchColleges.fulfilled, (state, action) => {
//                 state.lookupsLoading = false;
//                 state.colleges = action.payload;
//             })
//             .addCase(fetchColleges.rejected, (state) => {
//                 state.lookupsLoading = false;
//             })

//             // ---- Courses ----
//             .addCase(fetchCourses.fulfilled, (state, action) => {
//                 state.courses = action.payload;
//             })

//             // ---- Batches ----
//             .addCase(fetchBatches.fulfilled, (state, action) => {
//                 state.batches = action.payload;
//             })

//             // ---- Display Student ----
//             .addCase(displayStudent.pending, (state, action) => {
//                 const s = state[action.meta.arg.slot];
//                 s.displayLoading = true;
//                 s.displayError = null;
//             })
//             .addCase(displayStudent.fulfilled, (state, action) => {
//                 const s = state[action.meta.arg.slot];
//                 s.displayLoading = false;
//                 Object.assign(s, action.payload.data); // <-- was action.payload
//             })
//             .addCase(displayStudent.rejected, (state, action) => {
//                 const s = state[action.meta.arg.slot];
//                 s.displayLoading = false;
//                 s.displayError = action.payload || "Failed to load record";
//                 s.student = null;
//             })

//             // ---- Save Pass ----
//             .addCase(savePass.pending, (state, action) => {
//                 const s = state[action.meta.arg.slot];
//                 s.saving = true;
//                 s.saveError = null;
//                 s.saveMessage = null;
//                 s.duplicateConfirmPending = false;
//             })
//             .addCase(savePass.fulfilled, (state, action) => {
//                 const s = state[action.meta.arg.slot];
//                 s.saving = false;
//                 s.saveMessage = action.payload.message;
//                 s.srNo = action.payload.data?.srNo ?? s.srNo;
//             })
//             .addCase(savePass.rejected, (state, action) => {
//                 const s = state[action.meta.arg.slot];
//                 s.saving = false;
//                 s.saveError = action.payload?.message || "Failed to save";
//                 s.duplicateConfirmPending = !!action.payload?.requiresConfirmation;
//                 if (action.payload?.srNo) s.srNo = action.payload.srNo;
//             })

//             // ---- Issue Card ----
//             .addCase(issueCard.pending, (state, action) => {
//                 const s = state[action.meta.arg.slot];
//                 s.issuingCard = true;
//                 s.issueCardError = null;
//                 s.issueCardMessage = null;
//                 s.issueCardConfirmPending = false;
//             })
//             .addCase(issueCard.fulfilled, (state, action) => {
//                 const s = state[action.meta.arg.slot];
//                 s.issuingCard = false;
//                 s.issueCardMessage = action.payload.message;
//                 if (s.student) s.student.CardIssued = "Yes";
//             })
//             .addCase(issueCard.rejected, (state, action) => {
//                 const s = state[action.meta.arg.slot];
//                 s.issuingCard = false;
//                 s.issueCardError = action.payload?.message || "Failed to issue card";
//                 s.issueCardConfirmPending = !!action.payload?.requiresConfirmation;
//             });
//     },
// });

// export const { setSlotField, resetSlot, clearSaveStatus, clearIssueCardStatus } = hostelBusPassSlice.actions;
// export default hostelBusPassSlice.reducer;
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export type SlotKey = "slot1" | "slot2";
export type LookupType = "IDNo" | "Registration";
export type Facility = "Bus" | "Hostel" | "None";

export interface StudentRecord {
    CollegeName: string;
    Course: string;
    Batch: number | string;
    StudentName: string;
    FatherName: string;
    Facility: Facility;
    CardIssued?: string;
    [key: string]: unknown;
}

export interface SemesterOption {
    Semester: string;
    SemesterID: number;
}

export interface FeeRow {
    DateEntry: string;
    Semester: string;
    Subhead: string;
    FeeReceived: number;
    [key: string]: unknown;
}

export interface SlotState {
    type: LookupType;
    idNo: string;
    student: StudentRecord | null;
    semesters: SemesterOption[];
    selectedSemester: string;
    freePassAvailable: boolean;
    canPrint: boolean;
    feeRows: FeeRow[];
    blockedMessage: string | null;
    srNo: string | number | null;

    displayLoading: boolean;
    displayError: string | null;

    saving: boolean;
    saveError: string | null;
    saveMessage: string | null;
    duplicateConfirmPending: boolean;

    savingImage: boolean;
    saveImageError: string | null;

    issuingCard: boolean;
    issueCardError: string | null;
    issueCardMessage: string | null;
    issueCardConfirmPending: boolean;
}

interface HostelBusPassState {
    colleges: string[];
    courses: string[];
    batches: string[];
    lookupsLoading: boolean;
    slot1: SlotState;
    slot2: SlotState;
}

const emptySlot = (): SlotState => ({
    type: "IDNo",
    idNo: "",
    student: null,
    semesters: [],
    selectedSemester: "",
    freePassAvailable: false,
    canPrint: false,
    feeRows: [],
    blockedMessage: null,
    srNo: null,

    displayLoading: false,
    displayError: null,

    saving: false,
    saveError: null,
    saveMessage: null,
    duplicateConfirmPending: false,

    savingImage: false,
    saveImageError: null,

    issuingCard: false,
    issueCardError: null,
    issueCardMessage: null,
    issueCardConfirmPending: false,
});

const initialState: HostelBusPassState = {
    colleges: [],
    courses: [],
    batches: [],
    lookupsLoading: false,
    slot1: emptySlot(),
    slot2: emptySlot(),
};

function getSlot(state: HostelBusPassState, slot: SlotKey): SlotState {
    return state[slot];
}

// ---------------- Thunk arg/return type aliases (keeps every generic call single-line) ----------------

type FetchBatchesArg = { collegeName: string; course: string };
type FetchSemestersArg = { collegeName: string; course: string; batch: string | number };

interface DisplayStudentArg { slot: SlotKey; type: LookupType; idNo: string }
interface DisplayStudentPayload {
    student: StudentRecord;
    semesters: SemesterOption[];
    selectedSemester: string;
    freePassAvailable: boolean;
    canPrint: boolean;
    feeRows: FeeRow[];
    blockedMessage: string | null;
    srNo: string | number | null;
}

interface SaveStudentImageArg { slot: SlotKey; type: LookupType; idNo: string; blob: Blob }
interface SaveStudentImagePayload { message: string }
interface SaveStudentImageRejection { message: string }

interface SavePassArg { slot: SlotKey; [key: string]: unknown }
interface SavePassPayload { message: string; data?: { srNo?: string | number } }
interface SavePassRejection { message: string; requiresConfirmation?: boolean; srNo?: string | number }

interface IssueCardArg { slot: SlotKey; [key: string]: unknown }
interface IssueCardPayload { message: string }
interface IssueCardRejection { message: string; requiresConfirmation?: boolean }

// ---------------- Thunks ----------------

export const fetchColleges = createAsyncThunk<string[]>("hostelBusPass/fetchColleges", async (_, { rejectWithValue }) => {
    const response = await reduxApiClient.get("hostel-bus-pass/colleges");
    if (!response.success) return rejectWithValue(response.error?.message || response.message || "Failed to load colleges");
    return response.data;
});

export const fetchCourses = createAsyncThunk<string[], string>("hostelBusPass/fetchCourses", async (collegeName, { rejectWithValue }) => {
    const response = await reduxApiClient.get("hostel-bus-pass/courses", { collegeName });
    if (!response.success) return rejectWithValue(response.error?.message || response.message || "Failed to load courses");
    return response.data;
});

export const fetchBatches = createAsyncThunk<string[], FetchBatchesArg>("hostelBusPass/fetchBatches", async ({ collegeName, course }, { rejectWithValue }) => {
    const response = await reduxApiClient.get("hostel-bus-pass/batches", { collegeName, course });
    if (!response.success) return rejectWithValue(response.error?.message || response.message || "Failed to load batches");
    return response.data;
});

export const fetchSemesters = createAsyncThunk<SemesterOption[], FetchSemestersArg>("hostelBusPass/fetchSemesters", async ({ collegeName, course, batch }, { rejectWithValue }) => {
    const response = await reduxApiClient.get("hostel-bus-pass/semesters", { collegeName, course, batch });
    if (!response.success) return rejectWithValue(response.error?.message || response.message || "Failed to load semesters");
    return response.data;
});

export const displayStudent = createAsyncThunk<DisplayStudentPayload, DisplayStudentArg>("hostelBusPass/displayStudent", async ({ type, idNo }, { rejectWithValue }) => {
    const response = await reduxApiClient.get("hostel-bus-pass/student", { type, idNo });
    if (!response.success) {
        return rejectWithValue(response.error?.message || response.message || "Failed to load record");
    }
    return response.data.data as DisplayStudentPayload;
});

export const saveStudentImage = createAsyncThunk<SaveStudentImagePayload, SaveStudentImageArg, { rejectValue: SaveStudentImageRejection }>("hostelBusPass/saveStudentImage", async ({ type, idNo, blob }, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append("type", type);
    formData.append("idNo", idNo);
    formData.append("image", blob, "snap.jpg");
    const response = await reduxApiClient.post("hostel-bus-pass/save-image", formData);
    if (!response.success) {
        return rejectWithValue({ message: response.error?.message || response.message || "Failed to save photo" });
    }
    return response;
});

export const savePass = createAsyncThunk<SavePassPayload, SavePassArg, { rejectValue: SavePassRejection }>("hostelBusPass/savePass", async ({ slot, ...payload }, { rejectWithValue }) => {
    const response = await reduxApiClient.post("hostel-bus-pass/save", payload);
    if (!response.success) {
        if (response.data?.requiresConfirmation) {
            return rejectWithValue({ message: response.error?.message || response.message, requiresConfirmation: true, srNo: response.data.srNo });
        }
        return rejectWithValue({ message: response.error?.message || response.message || "Failed to save" });
    }
    return response;
});

export const issueCard = createAsyncThunk<IssueCardPayload, IssueCardArg, { rejectValue: IssueCardRejection }>("hostelBusPass/issueCard", async ({ slot, ...payload }, { rejectWithValue }) => {
    const response = await reduxApiClient.post("hostel-bus-pass/issue-card", payload);
    if (!response.success) {
        if (response.data?.requiresConfirmation) {
            return rejectWithValue({ message: response.error?.message || response.message, requiresConfirmation: true });
        }
        return rejectWithValue({ message: response.error?.message || response.message || "Failed to issue card" });
    }
    return response;
});

// ---------------- Slice ----------------

const hostelBusPassSlice = createSlice({
    name: "hostelBusPass",
    initialState,
    reducers: {
        setSlotField(state, action: PayloadAction<{ slot: SlotKey; field: keyof SlotState; value: unknown }>) {
            const { slot, field, value } = action.payload;
            (state[slot] as any)[field] = value;
        },
        resetSlot(state, action: PayloadAction<{ slot: SlotKey }>) {
            state[action.payload.slot] = emptySlot();
        },
        clearSaveStatus(state, action: PayloadAction<{ slot: SlotKey }>) {
            const s = getSlot(state, action.payload.slot);
            s.saveError = null;
            s.saveMessage = null;
            s.duplicateConfirmPending = false;
        },
        clearIssueCardStatus(state, action: PayloadAction<{ slot: SlotKey }>) {
            const s = getSlot(state, action.payload.slot);
            s.issueCardError = null;
            s.issueCardMessage = null;
            s.issueCardConfirmPending = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchColleges.pending, (state) => {
                state.lookupsLoading = true;
            })
            .addCase(fetchColleges.fulfilled, (state, action) => {
                state.lookupsLoading = false;
                state.colleges = action.payload;
            })
            .addCase(fetchColleges.rejected, (state) => {
                state.lookupsLoading = false;
            })

            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.courses = action.payload;
            })

            .addCase(fetchBatches.fulfilled, (state, action) => {
                state.batches = action.payload;
            })

            .addCase(displayStudent.pending, (state, action) => {
                const s = getSlot(state, action.meta.arg.slot);
                s.displayLoading = true;
                s.displayError = null;
            })
            .addCase(displayStudent.fulfilled, (state, action) => {
                const s = getSlot(state, action.meta.arg.slot);
                s.displayLoading = false;
                Object.assign(s, action.payload);
            })
            .addCase(displayStudent.rejected, (state, action) => {
                const s = getSlot(state, action.meta.arg.slot);
                s.displayLoading = false;
                s.displayError = (action.payload as string) || "Failed to load record";
                s.student = null;
            })

            .addCase(saveStudentImage.pending, (state, action) => {
                const s = getSlot(state, action.meta.arg.slot);
                s.savingImage = true;
                s.saveImageError = null;
            })
            .addCase(saveStudentImage.fulfilled, (state, action) => {
                const s = getSlot(state, action.meta.arg.slot);
                s.savingImage = false;
            })
            .addCase(saveStudentImage.rejected, (state, action) => {
                const s = getSlot(state, action.meta.arg.slot);
                s.savingImage = false;
                s.saveImageError = action.payload?.message || "Failed to save photo";
            })

            .addCase(savePass.pending, (state, action) => {
                const s = getSlot(state, action.meta.arg.slot);
                s.saving = true;
                s.saveError = null;
                s.saveMessage = null;
                s.duplicateConfirmPending = false;
            })
            .addCase(savePass.fulfilled, (state, action) => {
                const s = getSlot(state, action.meta.arg.slot);
                s.saving = false;
                s.saveMessage = action.payload.message;
                s.srNo = action.payload.data?.srNo ?? s.srNo;
            })
            .addCase(savePass.rejected, (state, action) => {
                const s = getSlot(state, action.meta.arg.slot);
                s.saving = false;
                s.saveError = action.payload?.message || "Failed to save";
                s.duplicateConfirmPending = !!action.payload?.requiresConfirmation;
                if (action.payload?.srNo) s.srNo = action.payload.srNo;
            })

            .addCase(issueCard.pending, (state, action) => {
                const s = getSlot(state, action.meta.arg.slot);
                s.issuingCard = true;
                s.issueCardError = null;
                s.issueCardMessage = null;
                s.issueCardConfirmPending = false;
            })
            .addCase(issueCard.fulfilled, (state, action) => {
                const s = getSlot(state, action.meta.arg.slot);
                s.issuingCard = false;
                s.issueCardMessage = action.payload.message;
                if (s.student) s.student.CardIssued = "Yes";
            })
            .addCase(issueCard.rejected, (state, action) => {
                const s = getSlot(state, action.meta.arg.slot);
                s.issuingCard = false;
                s.issueCardError = action.payload?.message || "Failed to issue card";
                s.issueCardConfirmPending = !!action.payload?.requiresConfirmation;
            });
    },
});

export const { setSlotField, resetSlot, clearSaveStatus, clearIssueCardStatus } = hostelBusPassSlice.actions;
export default hostelBusPassSlice.reducer;