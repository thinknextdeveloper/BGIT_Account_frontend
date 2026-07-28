import { ApiResponse, MasterLedgerRecord } from "@/types/ledger";
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

export async function createLedger(data: { collegeName: string; ledgerName: string }): Promise<ApiResponse<null>> {
  return fetchWithAuth<ApiResponse<null>>("/ledger/add", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function display(collegeName?: string): Promise<ApiResponse<MasterLedgerRecord[]>> {
  const params = collegeName ? `?collegeName=${encodeURIComponent(collegeName)}` : "";
  return fetchWithAuth<ApiResponse<MasterLedgerRecord[]>>(`/ledger/display${params}`);
}

export const ledgerApi = {
  getCollege: semesterApi.getCollege,
  display,
  createLedger,
};
