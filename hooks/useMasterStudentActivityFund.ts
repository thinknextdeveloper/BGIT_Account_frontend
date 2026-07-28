"use client";

import { useState, useEffect, useCallback } from "react";
import { studentActivityFundApi } from "@/services/studentActivityFundApi";
import { MasterStudentActivityFundRecord, StudentActivityFundFilters } from "@/types/studentActivityFund";

export function useMasterStudentActivityFund() {
  const [records, setRecords] = useState<MasterStudentActivityFundRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Filters state
  const [filters, setFilters] = useState<StudentActivityFundFilters>({
    session: "",
    collegeName: "",
    course: "",
    batch: "",
    semester: "",
  });

  // Dropdown options state
  const [colleges, setColleges] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [schemes, setSchemes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [dropdownLoading, setDropdownLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch MasterStudentActivityFund records
   */
  const fetchRecords = useCallback(async (currentFilters: StudentActivityFundFilters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentActivityFundApi.display(currentFilters);
      setRecords(res.data || []);
      setTotalRecords(res.totalRecords ?? res.data?.length ?? 0);
    } catch (err: any) {
      console.error("Error loading student activity fund records:", err);
      setError(err.message || "Failed to load student activity fund records.");
      setRecords([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Step 1: When College is selected, load Courses for that College only
   */
  const loadCoursesForCollege = async (collegeName: string) => {
    setCourses([]);
    setBatches([]);
    setSemesters([]);
    if (!collegeName) return;

    try {
      setDropdownLoading(true);
      const res = await studentActivityFundApi.getCourse(collegeName);
      setCourses(res.data || []);
    } catch (err) {
      console.error("Error loading courses:", err);
    } finally {
      setDropdownLoading(false);
    }
  };

  /**
   * Step 2: When Course is selected, load Batches for that Course only
   */
  const loadBatchesForCourse = async (collegeName: string, course: string) => {
    setBatches([]);
    setSemesters([]);
    if (!collegeName || !course) return;

    try {
      setDropdownLoading(true);
      const res = await studentActivityFundApi.getBatch(collegeName, course);
      setBatches(res.data || []);
    } catch (err) {
      console.error("Error loading batches:", err);
    } finally {
      setDropdownLoading(false);
    }
  };

  /**
   * Step 3: When Batch is selected, load Semesters for that Batch only
   */
  const loadSemestersForBatch = async (collegeName: string, course: string, batch: string) => {
    setSemesters([]);
    if (!collegeName || !course || !batch) return;

    try {
      setDropdownLoading(true);
      const res = await studentActivityFundApi.getSemester(collegeName, course, batch);
      setSemesters((res.data || []).map((s: any) => (typeof s === "string" ? s : s.semester)));
    } catch (err) {
      console.error("Error loading semesters:", err);
    } finally {
      setDropdownLoading(false);
    }
  };

  /**
   * Initial Load: Load static dropdowns (Colleges, Schemes, Categories)
   */
  useEffect(() => {
    const initializeDropdowns = async () => {
      try {
        setDropdownLoading(true);

        const [colRes, schRes, catRes] = await Promise.all([
          studentActivityFundApi.getCollege(),
          studentActivityFundApi.getScheme(),
          studentActivityFundApi.getCategory(),
        ]);

        setColleges(colRes.data || []);
        setSchemes(schRes.data || []);
        setCategories(catRes.data || []);

        await fetchRecords({});
      } catch (err: any) {
        console.error("Error initializing dropdowns:", err);
        setError(err.message || "Failed to initialize filter dropdown options.");
      } finally {
        setDropdownLoading(false);
      }
    };

    initializeDropdowns();
  }, [fetchRecords]);

  /**
   * Handle filter changes and trigger strict step-by-step cascade loading
   */
  const handleFilterChange = (key: keyof StudentActivityFundFilters, value: string) => {
    let updatedFilters = { ...filters, [key]: value };

    if (key === "collegeName") {
      updatedFilters = {
        ...updatedFilters,
        course: "",
        batch: "",
        semester: "",
      };
      loadCoursesForCollege(value);
    } else if (key === "course") {
      updatedFilters = {
        ...updatedFilters,
        batch: "",
        semester: "",
      };
      loadBatchesForCourse(filters.collegeName || "", value);
    } else if (key === "batch") {
      updatedFilters = {
        ...updatedFilters,
        semester: "",
      };
      loadSemestersForBatch(filters.collegeName || "", filters.course || "", value);
    }

    setFilters(updatedFilters);
    fetchRecords(updatedFilters);
  };

  /**
   * Reset filters
   */
  const resetFilters = () => {
    const emptyFilters: StudentActivityFundFilters = {
      session: "",
      collegeName: "",
      course: "",
      batch: "",
      semester: "",
    };
    setCourses([]);
    setBatches([]);
    setSemesters([]);
    setFilters(emptyFilters);
    fetchRecords(emptyFilters);
  };

  return {
    records,
    totalRecords,
    filters,
    colleges,
    courses,
    batches,
    semesters,
    schemes,
    categories,
    loading,
    dropdownLoading,
    error,
    handleFilterChange,
    resetFilters,
    loadCoursesForCollege,
    loadBatchesForCourse,
    loadSemestersForBatch,
    refetch: () => fetchRecords(filters),
  };
}
