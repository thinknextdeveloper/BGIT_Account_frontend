import {
  ApiResponse,
  MasterSemesterRecord,
  SemesterItem,
  FilterState,
  CheckCollegeResponse,
} from "@/types/semester";

/**
 * Sanitizes and extracts base API URL to prevent double slashes,
 * leading/trailing quotes, or trailing slashes.
 */
const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return envUrl.replace(/['"]+/g, "").trim().replace(/\/+$/, "");
};

/**
 * Retrieves the stored JWT authentication token.
 */
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  }
  return null;
};

/**
 * Robust fetch wrapper with automatic JWT token attachment
 * and safe HTML/JSON response validation.
 */
async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const baseUrl = getBaseUrl();
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${formattedEndpoint}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  const responseText = await response.text();
  let data: any;

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch (parseError) {
    if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
      throw new Error(
        `Received HTML instead of JSON (${response.status} ${response.statusText}). Please check backend API server running at ${fullUrl}`
      );
    }
    throw new Error(`Failed to parse response as JSON: ${responseText.slice(0, 100)}`);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || `HTTP ${response.status}: API request failed.`);
  }

  return data;
}

export async function displayAll(filters?: Partial<FilterState>): Promise<ApiResponse<MasterSemesterRecord[]>> {
  const params = new URLSearchParams();
  if (filters?.collegeName) params.append("collegeName", filters.collegeName);
  if (filters?.course) params.append("course", filters.course);
  if (filters?.batch) params.append("batch", filters.batch);
  if (filters?.semester) params.append("semester", filters.semester);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return fetchWithAuth<ApiResponse<MasterSemesterRecord[]>>(`/semester/display-all${queryString}`);
}

export async function getCollege(): Promise<ApiResponse<string[]>> {
  return fetchWithAuth<ApiResponse<string[]>>("/semester/colleges");
}

export async function getAssignedCollegeName(): Promise<ApiResponse<string[]>> {
  return fetchWithAuth<ApiResponse<string[]>>("/semester/assigned-colleges");
}

export async function entryAlreadyExist(collegeName: string): Promise<ApiResponse<CheckCollegeResponse>> {
  const params = new URLSearchParams({ collegeName });
  return fetchWithAuth<ApiResponse<CheckCollegeResponse>>(`/semester/check-college?${params.toString()}`);
}

export async function getCourse(collegeName?: string): Promise<ApiResponse<string[]>> {
  const params = collegeName ? `?collegeName=${encodeURIComponent(collegeName)}` : "";
  return fetchWithAuth<ApiResponse<string[]>>(`/semester/courses${params}`);
}

export async function getBatch(collegeName?: string, course?: string): Promise<ApiResponse<string[]>> {
  const params = new URLSearchParams();
  if (collegeName) params.append("collegeName", collegeName);
  if (course) params.append("course", course);
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return fetchWithAuth<ApiResponse<string[]>>(`/semester/batches${queryString}`);
}

export async function getSemester(collegeName?: string, course?: string, batch?: string): Promise<ApiResponse<SemesterItem[]>> {
  const params = new URLSearchParams();
  if (collegeName) params.append("collegeName", collegeName);
  if (course) params.append("course", course);
  if (batch) params.append("batch", batch);
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return fetchWithAuth<ApiResponse<SemesterItem[]>>(`/semester/semesters${queryString}`);
}

export async function createSemester(data: {
  collegeName: string;
  course: string;
  batch: string;
  semester: string;
}): Promise<ApiResponse<null>> {
  return fetchWithAuth<ApiResponse<null>>("/semester/add", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export const semesterApi = {
  displayAll,
  getCollege,
  getAssignedCollegeName,
  entryAlreadyExist,
  getCourse,
  getBatch,
  getSemester,
  createSemester,
};
