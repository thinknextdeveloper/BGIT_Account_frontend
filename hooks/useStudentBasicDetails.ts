"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { studentBasicDetailsApi } from "@/services/studentBasicDetailsApi";
import { StudentBasicDetailsRecord } from "@/types/studentBasicDetails";

const BATCH_SIZE = 100;

export function useStudentBasicDetails() {
  const [records, setRecords] = useState<StudentBasicDetailsRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [colleges, setColleges] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Request lock guard to strictly prevent duplicate API calls
  const isFetchingRef = useRef<boolean>(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch initial / page 1 records for a college & search filter
   */
  const fetchInitialRecords = useCallback(
    async (college: string, search: string = "") => {
      if (isFetchingRef.current) return;
      try {
        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        const res = await studentBasicDetailsApi.display(college, 1, BATCH_SIZE, search);

        setRecords(res.data || []);
        setTotalRecords(res.totalRecords ?? res.data?.length ?? 0);
        setPage(1);
        setHasMore(res.hasMore ?? ((res.data?.length || 0) === BATCH_SIZE));
      } catch (err: any) {
        console.error("Error loading student basic details records:", err);
        setError(err.message || "Failed to load student basic details records.");
        setRecords([]);
        setTotalRecords(0);
        setHasMore(false);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    []
  );

  /**
   * Load next batch of 100 records as user scrolls down
   */
  const loadMoreRecords = useCallback(async () => {
    if (isFetchingRef.current || !hasMore || loading || loadingMore) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoadingMore(true);
      setError(null);

      const nextPage = page + 1;

      const res = await studentBasicDetailsApi.display(selectedCollege, nextPage, BATCH_SIZE, searchTerm);

      const newRecords = res.data || [];
      setRecords((prev) => [...prev, ...newRecords]);
      setTotalRecords(res.totalRecords ?? 0);
      setPage(nextPage);
      setHasMore(res.hasMore ?? (newRecords.length === BATCH_SIZE));
    } catch (err: any) {
      console.error("Error loading next batch of student records:", err);
      setError(err.message || "Failed to load additional student records.");
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [hasMore, loading, loadingMore, page, selectedCollege, searchTerm]);

  /**
   * Handle Search Input with 400ms server-side debounce
   */
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      fetchInitialRecords(selectedCollege, term);
    }, 400);
  };

  /**
   * Handle filter selection for College Name
   */
  const handleCollegeChange = (college: string) => {
    setSelectedCollege(college);
    fetchInitialRecords(college, searchTerm);
  };

  /**
   * Reset filters
   */
  const resetFilters = () => {
    setSelectedCollege("");
    setSearchTerm("");
    fetchInitialRecords("", "");
  };

  /**
   * Initial Load: Fetch colleges list & load first 100 records
   */
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const collegeRes = await studentBasicDetailsApi.getCollege();
        setColleges(collegeRes.data || []);

        await fetchInitialRecords("", "");
      } catch (err: any) {
        console.error("Initialization error in useStudentBasicDetails:", err);
        setError(err.message || "Failed to initialize student basic details data.");
      }
    };

    initializeData();
  }, [fetchInitialRecords]);

  return {
    records,
    totalRecords,
    selectedCollege,
    colleges,
    searchTerm,
    loading,
    loadingMore,
    hasMore,
    error,
    handleCollegeChange,
    handleSearchChange,
    loadMoreRecords,
    resetFilters,
    refetch: () => fetchInitialRecords(selectedCollege, searchTerm),
  };
}
