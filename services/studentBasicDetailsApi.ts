import { PaginatedApiResponse, StudentBasicDetailsRecord } from "@/types/studentBasicDetails";
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

export async function display(
  collegeName?: string,
  page: number = 1,
  limit: number = 100,
  search: string = ""
): Promise<PaginatedApiResponse<StudentBasicDetailsRecord[]>> {
  const queryParams = new URLSearchParams();
  if (collegeName) queryParams.append("collegeName", collegeName);
  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));
  if (search && search.trim() !== "") queryParams.append("search", search.trim());

  return fetchWithAuth<PaginatedApiResponse<StudentBasicDetailsRecord[]>>(
    `/student-basic-details/display?${queryParams.toString()}`
  );
}

export const studentBasicDetailsApi = {
  getCollege: semesterApi.getCollege,
  display,
};
