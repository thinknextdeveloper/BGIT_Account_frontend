import { ApiResponse, MasterStudentActivityFundRecord, StudentActivityFundFilters } from "@/types/studentActivityFund";
import { semesterApi } from "@/services/semesterApi";

const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return envUrl.replace(/['"]+/g, "").trim().replace(/\/+$/, "");
};

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  }
  return null;
};

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
        `Received HTML instead of JSON (${response.status} ${response.statusText}). Please check backend API server running.`
      );
    }
    throw new Error(`Failed to parse response as JSON: ${responseText.slice(0, 100)}`);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || `HTTP ${response.status}: API request failed.`);
  }

  return data;
}

export async function createStudentActivityFund(data: any): Promise<ApiResponse<null>> {
  return fetchWithAuth<ApiResponse<null>>("/student-activity-fund/add", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export const studentActivityFundApi = {
  getCollege: semesterApi.getCollege,
  getCourse: semesterApi.getCourse,
  getBatch: semesterApi.getBatch,
  getSemester: semesterApi.getSemester,

  async getScheme(): Promise<ApiResponse<string[]>> {
    return fetchWithAuth<ApiResponse<string[]>>("/student-activity-fund/schemes");
  },

  async getCategory(): Promise<ApiResponse<string[]>> {
    return fetchWithAuth<ApiResponse<string[]>>("/student-activity-fund/categories");
  },

  async display(filters?: StudentActivityFundFilters): Promise<ApiResponse<MasterStudentActivityFundRecord[]>> {
    const params = new URLSearchParams();
    if (filters?.session) params.append("session", filters.session);
    if (filters?.collegeName) params.append("collegeName", filters.collegeName);
    if (filters?.course) params.append("course", filters.course);
    if (filters?.batch) params.append("batch", filters.batch);
    if (filters?.semester) params.append("semester", filters.semester);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return fetchWithAuth<ApiResponse<MasterStudentActivityFundRecord[]>>(`/student-activity-fund/display${queryString}`);
  },

  createStudentActivityFund,
};
