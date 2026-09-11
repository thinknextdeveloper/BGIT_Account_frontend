import { ApiResponse } from "./semester";

export interface MasterStudentActivityFundRecord {
  Session?: string;
  CollegeName?: string;
  Course?: string;
  Batch?: string;
  Semester?: string;
  SemesterID?: number;
  Scheme?: string;
  Category?: string;
  StudentFund?: number;
  AnnualCultureFund?: number;
  AudioVisual?: number;
  CommonRoom?: number;
  LibraryFund?: number;
  MagazineCharge?: number;
  NCCNSS?: number;
  CycleScooterCharge?: number;
  MedicalFund?: number;
  DrawingBoard?: number;
  GeneralMaintenance?: number;
  Recreation?: number;
  StudentChapter?: number;
  StationeryCharge?: number;
  ValedictoryFund?: number;
  IdentityCard?: number;
  RefundableSecurity?: number;
  Total?: number;
}

export interface StudentActivityFundFilters {
  session?: string;
  collegeName?: string;
  course?: string;
  batch?: string;
  semester?: string;
}

export type { ApiResponse };
