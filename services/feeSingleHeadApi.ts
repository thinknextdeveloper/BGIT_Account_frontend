import { ApiResponse, FeeSingleHeadData } from "@/types/feeSingleHead";

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

export async function getStudentFeeDetails(idNo: string): Promise<ApiResponse<FeeSingleHeadData>> {
  return fetchWithAuth<ApiResponse<FeeSingleHeadData>>(`/fee-single-head/display?idNo=${encodeURIComponent(idNo)}`);
}

export async function getBanks(): Promise<ApiResponse<string[]>> {
  return fetchWithAuth<ApiResponse<string[]>>("/fee-single-head/banks");
}

export async function getLedgers(collegeName: string): Promise<ApiResponse<string[]>> {
  return fetchWithAuth<ApiResponse<string[]>>(`/fee-single-head/ledgers?collegeName=${encodeURIComponent(collegeName)}`);
}

export async function calcReceiptNo(session: string): Promise<ApiResponse<number>> {
  return fetchWithAuth<ApiResponse<number>>(`/fee-single-head/receipt-no?session=${encodeURIComponent(session)}`);
}

export async function getSemesters(collegeName: string): Promise<ApiResponse<any[]>> {
  return fetchWithAuth<ApiResponse<any[]>>(`/fee-single-head/semesters?collegeName=${encodeURIComponent(collegeName)}`);
}

export async function saveFeeEntry(payload: any): Promise<ApiResponse<any>> {
  return fetchWithAuth<ApiResponse<any>>("/fee-single-head/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createBank(bankName: string): Promise<ApiResponse<any>> {
  return fetchWithAuth<ApiResponse<any>>("/fee-single-head/banks", {
    method: "POST",
    body: JSON.stringify({ bankName }),
  });
}

export async function searchReceipt(
  collegeName: string,
  ledgerName: string,
  receiptNo: string,
  session: string,
  searchType: string = "IDNo"
): Promise<ApiResponse<any>> {
  return fetchWithAuth<ApiResponse<any>>(
    `/fee-single-head/search-receipt?collegeName=${encodeURIComponent(collegeName)}&ledgerName=${encodeURIComponent(ledgerName)}&receiptNo=${encodeURIComponent(receiptNo)}&session=${encodeURIComponent(session)}&searchType=${encodeURIComponent(searchType)}`
  );
}

export const feeSingleHeadApi = {
  getStudentFeeDetails,
  getBanks,
  createBank,
  getLedgers,
  calcReceiptNo,
  getSemesters,
  saveFeeEntry,
  searchReceipt,
};
