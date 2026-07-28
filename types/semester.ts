/**
 * TypeScript Interfaces for Master Semester Domain
 */

export interface MasterSemesterRecord {
  CollegeName: string;
  Course: string;
  Batch: string;
  Semester: string;
}

export interface SemesterItem {
  semester: string;
  semesterId: number;
}

export interface FilterState {
  collegeName: string;
  course: string;
  batch: string;
  semester: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  totalRecords?: number;
}

export interface CheckCollegeResponse {
  collegeName: string;
  exists: boolean;
}
