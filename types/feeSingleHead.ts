import { ApiResponse } from "./semester";

export interface StudentFeeDetails {
  IDNo?: number | string;
  StudentType?: string;
  CollegeName?: string;
  StudentName?: string;
  FatherName?: string;
  Course?: string;
  Batch?: string;
  Class?: string;
  ClassRollNo?: string;
  UniRollNo?: string;
  PermanentAddress?: string;
  Sex?: string;
  LateralEntry?: string;
  Facility?: string;
  Route?: string;
  Stopage?: string;
  Hostel?: string;
  RoomType?: string;
  FacilityAmount?: number;
  Scheme?: string;
  Category?: string;
  ModeAdmission?: string;
  Snap?: string | null;
  PhoneNo?: string;
  StudentMobileNo?: string;
  FatherMobileNo?: string;
}

export interface LedgerDetail {
  DateEntry?: string;
  Particulars?: string;
  LedgerName?: string;
  Debit?: number;
  Credit?: number;
}

export interface FeeSingleHeadData {
  studentDetails: StudentFeeDetails;
  session: string;
  ledgerDetails: LedgerDetail[];
  totalDebits: number;
  totalCredits: number;
  totalBalance: number;
}

export type PaymentMode = "Cash" | "Cheque" | "Draft" | "Others";

export interface SemesterOption {
  Semester: string;
  SemesterID?: number;
}

export interface SaveFeeEntryPayload {
  idNo: string;
  semester: string;
  session: string;
  ledgerType: "Hostel" | "Bus" | "Others";
  ledgerName?: string;
  onAccountOf: string;
  paymentMode: PaymentMode;
  amount: number;
  bankName?: string;
  chequeDraftNo?: string;
  chequeDraftDate?: string;
  dateEntry?: string;
  entryType?: "Debit" | "Credit";
}

export interface SaveFeeEntryResult {
  receiptNo: number;
  transactionId: number;
  savedEntry: any;
  updatedDetails: FeeSingleHeadData;
}

export type { ApiResponse };
