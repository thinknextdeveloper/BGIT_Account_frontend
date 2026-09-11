import { ApiResponse } from "./semester";

export interface StudentBasicDetailsRecord {
  CollegeName?: string;
  Course?: string;
  Batch?: string;
  Class?: string;
  LateralEntry?: string;
  AdmissionDate?: string;
  IDNo?: number | string;
  ClassRollNo?: string;
  StudentName?: string;
  FatherName?: string;
  MotherName?: string;
  Sex?: string;
  DOB?: string;
  FatherOccupation?: string;
  CorrespondanceAddress?: string;
  PermanentAddress?: string;
  EmailID?: string;
  PhoneNo?: string;
  StudentMobileNo?: string;
  FatherMobileNo?: string;
  Facility?: string;
  StudentType?: string;
  Category?: string;
  Scheme?: string;
  Snap?: string;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

export type { ApiResponse };
