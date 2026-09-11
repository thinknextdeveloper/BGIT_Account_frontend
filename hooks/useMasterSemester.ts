"use client";

import { useState, useEffect, useCallback } from "react";
import { semesterApi } from "@/services/semesterApi";
import {
  MasterSemesterRecord,
  SemesterItem,
  FilterState,
} from "@/types/semester";

const initialFilterState: FilterState = {
  collegeName: "",
  course: "",
  batch: "",
  semester: "",
};

export function useMasterSemester() {
  const [records, setRecords] = useState<MasterSemesterRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Dropdown options
  const [colleges, setColleges] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [dropdownLoading, setDropdownLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch MasterCurrentSemester records based on active filters
   */
  const fetchRecords = useCallback(async (currentFilters: FilterState) => {
    try {
      setLoading(true);
      setError(null);
      const res = await semesterApi.displayAll(currentFilters);
      setRecords(res.data || []);
      setTotalRecords(res.totalRecords ?? res.data?.length ?? 0);
    } catch (err: any) {
      console.error("Error loading master semester records:", err);
      setError(err.message || "Failed to load semester records.");
      setRecords([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial Load: Fetch assigned colleges and all current semester records.
   * Dependent options (Courses, Batches, Semesters) remain empty until a College is selected.
   */
  useEffect(() => {
    const initializeData = async () => {
      try {
        setDropdownLoading(true);
        setError(null);

        // Fetch assigned colleges for user
        const collegeRes = await semesterApi.getCollege();
        setColleges(collegeRes.data || []);

        // Initial records load
        await fetchRecords(initialFilterState);
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError(err.message || "Failed to initialize semester data.");
      } finally {
        setDropdownLoading(false);
      }
    };

    initializeData();
  }, [fetchRecords]);

  /**
   * Update dependent dropdown options based on selected filters.
   * If no college is selected, clear course, batch, and semester options.
   */
  const updateDropdownOptions = async (currentFilters: FilterState) => {
    if (!currentFilters.collegeName) {
      setCourses([]);
      setBatches([]);
      setSemesters([]);
      return;
    }

    try {
      setDropdownLoading(true);
      const [courseRes, batchRes, semRes] = await Promise.all([
        semesterApi.getCourse(currentFilters.collegeName),
        semesterApi.getBatch(currentFilters.collegeName, currentFilters.course),
        semesterApi.getSemester(
          currentFilters.collegeName,
          currentFilters.course,
          currentFilters.batch
        ),
      ]);

      setCourses(courseRes.data || []);
      setBatches(batchRes.data || []);
      setSemesters(semRes.data || []);
    } catch (err: any) {
      console.error("Error updating dependent dropdown options:", err);
    } finally {
      setDropdownLoading(false);
    }
  };

  /**
   * Handle dropdown filter selection changes
   */
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const updatedFilters = { ...filters, [key]: value };

    // Reset downstream dependent filters when parent dropdown changes
    if (key === "collegeName") {
      updatedFilters.course = "";
      updatedFilters.batch = "";
      updatedFilters.semester = "";
    } else if (key === "course") {
      updatedFilters.batch = "";
      updatedFilters.semester = "";
    } else if (key === "batch") {
      updatedFilters.semester = "";
    }

    setFilters(updatedFilters);
    fetchRecords(updatedFilters);
    updateDropdownOptions(updatedFilters);
  };

  /**
   * Reset all filters to default
   */
  const resetFilters = () => {
    setFilters(initialFilterState);
    setCourses([]);
    setBatches([]);
    setSemesters([]);
    fetchRecords(initialFilterState);
  };

  /**
   * Check if a specific college belongs to logged-in user
   */
  const checkCollegeAssigned = async (collegeName: string): Promise<boolean> => {
    try {
      const res = await semesterApi.entryAlreadyExist(collegeName);
      return res.data.exists;
    } catch {
      return false;
    }
  };

  return {
    records,
    totalRecords,
    filters,
    colleges,
    courses,
    batches,
    semesters,
    loading,
    dropdownLoading,
    error,
    handleFilterChange,
    resetFilters,
    checkCollegeAssigned,
    refetch: () => fetchRecords(filters),
  };
}
