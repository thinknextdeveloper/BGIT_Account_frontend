"use client";

import { useState, useEffect, useCallback } from "react";
import { schemeApi } from "@/services/schemeApi";
import { MasterSchemeRecord } from "@/types/scheme";

export function useMasterScheme() {
  const [records, setRecords] = useState<MasterSchemeRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedCollege, setSelectedCollege] = useState<string>("");

  // College Dropdown options (loaded using existing GetCollege functionality)
  const [colleges, setColleges] = useState<string[]>([]);

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch MasterScheme records
   */
  const fetchRecords = useCallback(async (college: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await schemeApi.display(college);
      setRecords(res.data || []);
      setTotalRecords(res.totalRecords ?? res.data?.length ?? 0);
    } catch (err: any) {
      console.error("Error loading scheme records:", err);
      setError(err.message || "Failed to load scheme records.");
      setRecords([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial Load: Fetch colleges using existing GetCollege API and display scheme records
   */
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Reuse existing GetCollege functionality
        const collegeRes = await schemeApi.getCollege();
        setColleges(collegeRes.data || []);

        await fetchRecords("");
      } catch (err: any) {
        console.error("Initialization error in useMasterScheme:", err);
        setError(err.message || "Failed to initialize scheme master data.");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [fetchRecords]);

  /**
   * Handle filter selection for College Name
   */
  const handleCollegeChange = (college: string) => {
    setSelectedCollege(college);
    fetchRecords(college);
  };

  /**
   * Reset filters
   */
  const resetFilters = () => {
    setSelectedCollege("");
    fetchRecords("");
  };

  return {
    records,
    totalRecords,
    selectedCollege,
    colleges,
    loading,
    error,
    handleCollegeChange,
    resetFilters,
    refetch: () => fetchRecords(selectedCollege),
  };
}
