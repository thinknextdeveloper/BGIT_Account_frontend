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

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const responseText = await response.text();
    let data: any;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      return { success: false, message: "Invalid JSON response" } as any;
    }

    if (!response.ok) {
      return { success: false, message: data?.message || `HTTP ${response.status}` } as any;
    }

    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Network error" } as any;
  }
}

export async function getCancelRestoreStudentDetails(idNo: string): Promise<any> {
  const res = await fetchWithAuth<any>(`/cancel-restore/display-student?idNo=${encodeURIComponent(idNo)}`);
  return res;
}

export async function getDisplayAllCancellation(): Promise<any> {
  const res = await fetchWithAuth<any>("/cancel-restore/display-student?idNo=ALL");
  console.log("[cancelRestoreApi] getDisplayAllCancellation raw API response:", res);
  return res;
}

export async function getCoursesByCollege(collegeName: string): Promise<any> {
  let res = await fetchWithAuth<any>(`/cancel-restore/courses-by-college?collegeName=${encodeURIComponent(collegeName)}`);
  if (!res || !res.success || res.message?.includes("404")) {
    console.log("[cancelRestoreApi] Fallback: fetching courses from /master-course/courses");
    const masterRes = await fetchWithAuth<any>(`/master-course/courses?collegeName=${encodeURIComponent(collegeName)}`);
    if (masterRes && (masterRes.success || Array.isArray(masterRes.data))) {
      return masterRes;
    }
  }
  return res;
}

export async function addCancelledAdmission(payload: any): Promise<any> {
  let res = await fetchWithAuth<any>("/cancel-restore/add-cancelled-admission", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res || !res.success || res.message?.includes("404")) {
    console.log("[cancelRestoreApi] Fallback 1: posting to /cancel-restore/display-student");
    const fb1 = await fetchWithAuth<any>("/cancel-restore/display-student", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (fb1 && fb1.success) return fb1;
  }

  if (!res || !res.success || res.message?.includes("404")) {
    console.log("[cancelRestoreApi] Fallback 2: posting to /admissions/cancel-restore-student");
    const fb2 = await fetchWithAuth<any>("/admissions/cancel-restore-student", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (fb2 && fb2.success) return fb2;
  }

  return res;
}

export async function restoreAdmission(idNo: string): Promise<any> {
  let res = await fetchWithAuth<any>("/cancel-restore/restore-admission", {
    method: "POST",
    body: JSON.stringify({ idNo, action: "restore" }),
  });

  if (!res || !res.success || res.message?.includes("404")) {
    console.log("[cancelRestoreApi] Fallback 1: posting restore to /cancel-restore/add-cancelled-admission");
    const fb1 = await fetchWithAuth<any>("/cancel-restore/add-cancelled-admission", {
      method: "POST",
      body: JSON.stringify({ idNo, action: "restore" }),
    });
    if (fb1 && fb1.success) return fb1;
  }

  if (!res || !res.success || res.message?.includes("404")) {
    console.log("[cancelRestoreApi] Fallback 2: posting restore to /cancel-restore/display-student");
    const fb2 = await fetchWithAuth<any>("/cancel-restore/display-student", {
      method: "POST",
      body: JSON.stringify({ idNo, action: "restore" }),
    });
    if (fb2 && fb2.success) return fb2;
  }

  return res;
}
