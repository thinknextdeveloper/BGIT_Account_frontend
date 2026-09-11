import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reduxApiClient } from "@/services/reduxservices";

export interface UniRollNoSearchRow {
  Session?: string | number | null;
  CollegeName?: string | null;
  Course?: string | null;
  Class?: string | null;
  Batch?: string | number | null;
  Section?: string | null;
  GroupName?: string | null;
  IDNo?: number | string | null;
  ClassRollNo?: string | number | null;
  UniRollNo?: string | number | null;
  LateralEntry?: string | boolean | null;
  AdmissionDate?: string | null;
  StudentName?: string | null;
  FatherName?: string | null;
  MotherName?: string | null;
  Sex?: string | null;
  DOB?: string | null;
  FatherOccupation?: string | null;
  MotherOccupation?: string | null;
  FatherDesignation?: string | null;
  CorrespondanceAddress?: string | null;
  PermanentAddress?: string | null;
  EmailID?: string | null;
  OfficialEmailID?: string | null;
  PhoneNo?: string | null;
  StudentMobileNo?: string | null;
  FatherEmailID?: string | null;
  FatherMobileNo?: string | null;
  MotherMobileNo?: string | null;
  Facility?: string | null;
  BusRoute?: string | null;
  RouteID?: string | number | null;
  Stopage?: string | null;
  StopageID?: string | number | null;
  HostelName?: string | null;
  RoomType?: string | null;
  HostelCharges?: number | string | null;
  BusFee?: number | string | null;
  StudentType?: string | null;
  Concession?: string | null;
  ConcessionDetails?: string | null;
  ConcessionPerc?: number | string | null;
  ConcessionTotalAmount?: number | string | null;
  BloodGroup?: string | null;
  Category?: string | null;
  Locality?: string | null;
  Medium?: string | null;
  CETRank?: string | number | null;
  AIEEERank?: string | number | null;
  METRank?: string | number | null;
  CETRollNo?: string | number | null;
  AIEEERollNo?: string | number | null;
  METRollNo?: string | number | null;
  Quota?: string | null;
  FeeWaiverScheme?: string | null;
  FirstPreference?: string | null;
  SecondPreference?: string | null;
  ThirdPreference?: string | null;
  FourthPreference?: string | null;
  Scheme?: string | null;
  InstitutionLastAttended?: string | null;
  University?: string | null;
  State?: string | null;
  Religion?: string | null;
  Caste?: string | null;
  SeatConfirmed?: string | null;
  City?: string | null;
  BoardRegistrationNo?: string | null;
  CET?: string | null;
  MET?: string | null;
  AIEEE?: string | null;
  ConcessionReferenceLetterNo?: string | null;
  Village?: string | null;
  VPO?: string | null;
  PO?: string | null;
  Tehsil?: string | null;
  District?: string | null;
  GuardianAddress?: string | null;
  GuardianContactNo?: string | null;
  Nationality?: string | null;
  PreviousMedicalIllness?: string | null;
  OtherEntranceTest?: string | null;
  NSS?: string | null;
  Sports?: string | null;
  OtherAchievements?: string | null;
  EnquiryNo?: string | number | null;
  EnquiryDate?: string | null;
  RegistrationNo?: string | null;
  RegistrationDate?: string | null;
  Snap?: string | null;
  CardIssued?: string | null;
  CardIssuedDate?: string | null;
  ValidUpTo?: string | null;
  JETRank?: string | number | null;
  JETRollNo?: string | number | null;
  JET?: string | null;
  Newspaper?: string | null;
  ThirdPerson?: string | null;
  CableTV?: string | null;
  Student?: string | null;
  StaffMember?: string | null;
  FlexBoard?: string | null;
  Pamphlet?: string | null;
  Comments?: string | null;
  ThirdPersonName?: string | null;
  ThirdPersonDesignation?: string | null;
  ThirdPersonAddress?: string | null;
  ThirdPersonContactNo?: string | null;
  CableTVChannel?: string | null;
  ReferenceStudentClass?: string | null;
  StaffMemberName?: string | null;
  StaffMemberDesignation?: string | null;
  NewspaperName?: string | null;
  CommentsDetail?: string | null;
  LastExam?: string | null;
  Board?: string | null;
  LastExamPerc?: string | number | null;
  UserID?: string | null;
  Locked?: string | boolean | null;
  SmartCardIssued?: string | null;
  SmartCardIssuedDate?: string | null;
  EntranceTest1?: string | null;
  EntranceTest1RollNo?: string | number | null;
  EntranceTest1Rank?: string | number | null;
  EntranceTest2?: string | null;
  EntranceTest2RollNo?: string | number | null;
  EntranceTest2Rank?: string | number | null;
  CardID?: string | number | null;
  Shift?: string | null;
  TotalConcession?: number | string | null;
  Internet?: string | null;
  SMS?: string | null;
  EducationFair?: string | null;
  Consultant?: string | null;
  CollegePresentation?: string | null;
  EnquiryMode?: string | null;
  AddressLine1?: string | null;
  AddressLine2?: string | null;
  AddressLine3?: string | null;
  CardLocked?: string | boolean | null;
  ValidFor?: string | null;
  CardPayment?: string | null;
  LastModifiedDate?: string | null;
  FeeCategory?: string | null;
  status?: string | null;
  Consaltant_Name?: string | null;
  Consaltant_ID?: string | number | null;
  Team_Name?: string | null;
  Team_Members?: string | null;
  Branch?: string | null;
  Staffid?: string | number | null;
  Categorys?: string | null;
  FollowupRemarks1?: string | null;
  [key: string]: any;
}

interface SearchUniRollNoState {
  colleges: string[];
  results: UniRollNoSearchRow[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchUniRollNoState = {
  colleges: [],
  results: [],
  loading: false,
  error: null,
};

export const fetchColleges = createAsyncThunk(
  "searchUniRollNo/fetchColleges",
  async (_, { rejectWithValue }) => {
    const res = await reduxApiClient.get("master-course/colleges");
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data.data;
  }
);

export const searchByUniRollNo = createAsyncThunk(
  "searchUniRollNo/find",
  async (
    params: {
      uniRollNo: string;
      college?: string;
      allColleges: boolean;
    },
    { rejectWithValue }
  ) => {
    const queryParams: Record<string, string> = {
      uniRollNo: params.uniRollNo,
      allColleges: String(params.allColleges),
    };
    if (!params.allColleges && params.college) {
      queryParams.college = params.college;
    }
    const res = await reduxApiClient.get("search-uni-roll-no/find", queryParams);
    if (!res.success) return rejectWithValue(res.error?.message ?? "Something went wrong");
    return res.data?.data ?? [];
  }
);

const searchUniRollNoSlice = createSlice({
  name: "searchUniRollNo",
  initialState,
  reducers: {
    clearResults(state) {
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColleges.fulfilled, (state, action: any) => {
        state.colleges = action.payload || [];
      })
      .addCase(searchByUniRollNo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchByUniRollNo.fulfilled, (state, action: any) => {
        state.loading = false;
        state.results = action.payload || [];
      })
      .addCase(searchByUniRollNo.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.results = [];
      });
  },
});

export const { clearResults } = searchUniRollNoSlice.actions;
export default searchUniRollNoSlice.reducer;
