"use client";

import React, { useState } from "react";
import { useMasterStudentActivityFund } from "@/hooks/useMasterStudentActivityFund";
import { studentActivityFundApi, createStudentActivityFund } from "@/services/studentActivityFundApi";

export default function MasterStudentActivityFundPage() {
  const {
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
    refetch,
  } = useMasterStudentActivityFund();

  const [searchTerm, setSearchTerm] = useState("");

  // New row input state for inline entry matching DataGridView last row
  const [newSession, setNewSession] = useState("");
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newBatch, setNewBatch] = useState("");
  const [newSemester, setNewSemester] = useState("");
  const [newScheme, setNewScheme] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Dependent options for new row entry
  const [newRowCourses, setNewRowCourses] = useState<string[]>([]);
  const [newRowBatches, setNewRowBatches] = useState<string[]>([]);
  const [newRowSemesters, setNewRowSemesters] = useState<string[]>([]);
  const [newRowLoading, setNewRowLoading] = useState(false);

  const [studentFund, setStudentFund] = useState("");
  const [annualCultureFund, setAnnualCultureFund] = useState("");
  const [audioVisual, setAudioVisual] = useState("");
  const [commonRoom, setCommonRoom] = useState("");
  const [libraryFund, setLibraryFund] = useState("");
  const [magazineCharge, setMagazineCharge] = useState("");
  const [nccnss, setNccnss] = useState("");
  const [cycleScooterCharge, setCycleScooterCharge] = useState("");
  const [medicalFund, setMedicalFund] = useState("");
  const [drawingBoard, setDrawingBoard] = useState("");
  const [generalMaintenance, setGeneralMaintenance] = useState("");
  const [recreation, setRecreation] = useState("");
  const [studentChapter, setStudentChapter] = useState("");
  const [stationeryCharge, setStationeryCharge] = useState("");
  const [valedictoryFund, setValedictoryFund] = useState("");
  const [identityCard, setIdentityCard] = useState("");
  const [refundableSecurity, setRefundableSecurity] = useState("");

  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 1: Handle College change for new row
  const handleNewRowCollegeChange = async (collegeName: string) => {
    setNewCollegeName(collegeName);
    setNewCourse("");
    setNewBatch("");
    setNewSemester("");
    setNewRowCourses([]);
    setNewRowBatches([]);
    setNewRowSemesters([]);

    if (!collegeName) return;

    try {
      setNewRowLoading(true);
      const res = await studentActivityFundApi.getCourse(collegeName);
      setNewRowCourses(res.data || []);
    } catch (err: any) {
      console.error("Failed to load courses for new row:", err);
    } finally {
      setNewRowLoading(false);
    }
  };

  // Step 2: Handle Course change for new row
  const handleNewRowCourseChange = async (course: string) => {
    setNewCourse(course);
    setNewBatch("");
    setNewSemester("");
    setNewRowBatches([]);
    setNewRowSemesters([]);

    if (!newCollegeName || !course) return;

    try {
      setNewRowLoading(true);
      const res = await studentActivityFundApi.getBatch(newCollegeName, course);
      setNewRowBatches(res.data || []);
    } catch (err: any) {
      console.error("Failed to load batches for new row:", err);
    } finally {
      setNewRowLoading(false);
    }
  };

  // Step 3: Handle Batch change for new row
  const handleNewRowBatchChange = async (batch: string) => {
    setNewBatch(batch);
    setNewSemester("");
    setNewRowSemesters([]);

    if (!newCollegeName || !newCourse || !batch) return;

    try {
      setNewRowLoading(true);
      const res = await studentActivityFundApi.getSemester(newCollegeName, newCourse, batch);
      setNewRowSemesters((res.data || []).map((s: any) => (typeof s === "string" ? s : s.semester)));
    } catch (err: any) {
      console.error("Failed to load semesters for new row:", err);
    } finally {
      setNewRowLoading(false);
    }
  };

  // Calculate total for new row dynamically
  const calculatedNewTotal =
    (parseFloat(studentFund) || 0) +
    (parseFloat(annualCultureFund) || 0) +
    (parseFloat(audioVisual) || 0) +
    (parseFloat(commonRoom) || 0) +
    (parseFloat(libraryFund) || 0) +
    (parseFloat(magazineCharge) || 0) +
    (parseFloat(nccnss) || 0) +
    (parseFloat(cycleScooterCharge) || 0) +
    (parseFloat(medicalFund) || 0) +
    (parseFloat(drawingBoard) || 0) +
    (parseFloat(generalMaintenance) || 0) +
    (parseFloat(recreation) || 0) +
    (parseFloat(studentChapter) || 0) +
    (parseFloat(stationeryCharge) || 0) +
    (parseFloat(valedictoryFund) || 0) +
    (parseFloat(identityCard) || 0) +
    (parseFloat(refundableSecurity) || 0);

  // Client-side quick search filtering
  const filteredRecords = records.filter((rec) => {
    const term = searchTerm.toLowerCase();
    return (
      rec.Session?.toLowerCase().includes(term) ||
      rec.CollegeName?.toLowerCase().includes(term) ||
      rec.Course?.toLowerCase().includes(term) ||
      rec.Batch?.toString().toLowerCase().includes(term) ||
      rec.Semester?.toLowerCase().includes(term) ||
      rec.Scheme?.toLowerCase().includes(term) ||
      rec.Category?.toLowerCase().includes(term)
    );
  });

  /**
   * Equivalent to legacy Private Sub btnSave_Click implementation
   */
  const btnSave_Click = async () => {
    setValidationError(null);
    setSuccessMessage(null);

    // 1. Session validation
    if (!newSession || newSession.trim() === "") {
      setValidationError("Please enter Session");
      return;
    }

    // 2. College Name validation
    if (!newCollegeName || newCollegeName.trim() === "") {
      setValidationError("Please Enter College Name");
      return;
    }

    // 3. Course validation
    if (!newCourse || newCourse.trim() === "") {
      setValidationError("Please Enter Course");
      return;
    }

    // 4. Batch validation
    if (!newBatch || newBatch.trim() === "") {
      setValidationError("Please Enter Batch");
      return;
    }

    // 5. Semester validation
    if (!newSemester || newSemester.trim() === "") {
      setValidationError("Please Enter Semester");
      return;
    }

    // 6. Scheme validation
    if (!newScheme || newScheme.trim() === "") {
      setValidationError("Please Enter Scheme");
      return;
    }

    // 7. Category validation
    if (!newCategory || newCategory.trim() === "") {
      setValidationError("Please Enter Category");
      return;
    }

    try {
      setSaving(true);
      const saveFn = studentActivityFundApi?.createStudentActivityFund || createStudentActivityFund;
      const res = await saveFn({
        session: newSession.trim(),
        collegeName: newCollegeName.trim(),
        course: newCourse.trim(),
        batch: newBatch.trim(),
        semester: newSemester.trim(),
        scheme: newScheme.trim(),
        category: newCategory.trim(),
        studentFund: studentFund ? parseFloat(studentFund) : null,
        annualCultureFund: annualCultureFund ? parseFloat(annualCultureFund) : null,
        audioVisual: audioVisual ? parseFloat(audioVisual) : null,
        commonRoom: commonRoom ? parseFloat(commonRoom) : null,
        libraryFund: libraryFund ? parseFloat(libraryFund) : null,
        magazineCharge: magazineCharge ? parseFloat(magazineCharge) : null,
        nccnss: nccnss ? parseFloat(nccnss) : null,
        cycleScooterCharge: cycleScooterCharge ? parseFloat(cycleScooterCharge) : null,
        medicalFund: medicalFund ? parseFloat(medicalFund) : null,
        drawingBoard: drawingBoard ? parseFloat(drawingBoard) : null,
        generalMaintenance: generalMaintenance ? parseFloat(generalMaintenance) : null,
        recreation: recreation ? parseFloat(recreation) : null,
        studentChapter: studentChapter ? parseFloat(studentChapter) : null,
        stationeryCharge: stationeryCharge ? parseFloat(stationeryCharge) : null,
        valedictoryFund: valedictoryFund ? parseFloat(valedictoryFund) : null,
        identityCard: identityCard ? parseFloat(identityCard) : null,
        refundableSecurity: refundableSecurity ? parseFloat(refundableSecurity) : null,
        total: calculatedNewTotal,
      });

      setSuccessMessage(res.message || "New record added successfully!");

      // Clear input fields
      setNewSession("");
      setNewCollegeName("");
      setNewCourse("");
      setNewBatch("");
      setNewSemester("");
      setNewScheme("");
      setNewCategory("");
      setNewRowCourses([]);
      setNewRowBatches([]);
      setNewRowSemesters([]);

      setStudentFund("");
      setAnnualCultureFund("");
      setAudioVisual("");
      setCommonRoom("");
      setLibraryFund("");
      setMagazineCharge("");
      setNccnss("");
      setCycleScooterCharge("");
      setMedicalFund("");
      setDrawingBoard("");
      setGeneralMaintenance("");
      setRecreation("");
      setStudentChapter("");
      setStationeryCharge("");
      setValedictoryFund("");
      setIdentityCard("");
      setRefundableSecurity("");

      refetch(); // Call Display()

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      setValidationError(err.message || "Failed to add record.");
      refetch(); // Call Display() on error / duplicate exit sub
    } finally {
      setSaving(false);
    }
  };

  /**
   * Export table data to Excel (.csv with UTF-8 BOM)
   */
  const exportToExcel = () => {
    if (!filteredRecords || filteredRecords.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "Session",
      "CollegeName",
      "Course",
      "Batch",
      "Semester",
      "SemesterID",
      "Scheme",
      "Category",
      "StudentFund",
      "AnnualCultureFund",
      "AudioVisual",
      "CommonRoom",
      "LibraryFund",
      "MagazineCharge",
      "NCCNSS",
      "CycleScooterCharge",
      "MedicalFund",
      "DrawingBoard",
      "GeneralMaintenance",
      "Recreation",
      "StudentChapter",
      "StationeryCharge",
      "ValedictoryFund",
      "IdentityCard",
      "RefundableSecurity",
      "Total",
    ];

    let csvContent = headers.join(",") + "\n";
    filteredRecords.forEach((row) => {
      const line = [
        `"${row.Session || ""}"`,
        `"${row.CollegeName || ""}"`,
        `"${row.Course || ""}"`,
        `"${row.Batch || ""}"`,
        `"${row.Semester || ""}"`,
        `"${row.SemesterID || ""}"`,
        `"${row.Scheme || ""}"`,
        `"${row.Category || ""}"`,
        row.StudentFund || 0,
        row.AnnualCultureFund || 0,
        row.AudioVisual || 0,
        row.CommonRoom || 0,
        row.LibraryFund || 0,
        row.MagazineCharge || 0,
        row.NCCNSS || 0,
        row.CycleScooterCharge || 0,
        row.MedicalFund || 0,
        row.DrawingBoard || 0,
        row.GeneralMaintenance || 0,
        row.Recreation || 0,
        row.StudentChapter || 0,
        row.StationeryCharge || 0,
        row.ValedictoryFund || 0,
        row.IdentityCard || 0,
        row.RefundableSecurity || 0,
        row.Total || 0,
      ].join(",");
      csvContent += line + "\n";
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Master_Student_Activity_Fund_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Print table data / Save as PDF
   */
  const handlePrintPDF = () => {
    if (!filteredRecords || filteredRecords.length === 0) {
      alert("No data available to print.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = filteredRecords
      .map(
        (row, idx) => `
          <tr>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.Session || ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.CollegeName || ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.Course || ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.Batch || ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.Semester || ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.SemesterID || ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.Scheme || ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.Category || ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${row.Total || 0}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Master Student Activity Fund Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
            h2 { text-align: center; color: #0f172a; margin-bottom: 4px; }
            p { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background-color: #f8fafc; padding: 8px; border: 1px solid #cbd5e1; text-align: left; font-weight: 700; color: #475569; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h2>Master Student Activity Fund Report</h2>
          <p>Generated on: ${new Date().toLocaleString()} | Total Records: ${filteredRecords.length}</p>
          <table>
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th>Session</th>
                <th>College Name</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Semester</th>
                <th>SemesterID</th>
                <th>Scheme</th>
                <th>Category</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Master Student Activity Fund
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Display and add student activity fund structures calculated across assigned user colleges.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Save Button (btnSave) */}
          <button
            id="btnSave"
            onClick={btnSave_Click}
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-medium rounded-lg shadow transition duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            Save
          </button>

          {/* Export to Excel */}
          <button
            onClick={exportToExcel}
            disabled={filteredRecords.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-medium rounded-lg shadow transition duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Excel
          </button>

          {/* Print PDF */}
          <button
            onClick={handlePrintPDF}
            disabled={filteredRecords.length === 0}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm font-medium rounded-lg shadow transition duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print PDF
          </button>

          {/* Refresh */}
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition duration-150"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-sm font-medium rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{validationError}</span>
          </div>
          <button onClick={() => setValidationError(null)} className="text-amber-700 hover:text-amber-950 text-xs font-bold">&times;</button>
        </div>
      )}

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 text-xs font-bold">&times;</button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={refetch} className="underline text-red-600 hover:text-red-800 text-xs">Retry</button>
        </div>
      )}

      {/* Filter Section Cards - Strict 3-step cascade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
        {/* 1. College Name Filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            College Name
          </label>
          <select
            value={filters.collegeName || ""}
            onChange={(e) => handleFilterChange("collegeName", e.target.value)}
            disabled={dropdownLoading}
            className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
          >
            <option value="">Select College</option>
            {colleges.map((col, idx) => (
              <option key={`col-filter-${idx}`} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Course Filter (Cascade Step 1: Disabled until College selected) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Course
          </label>
          <select
            value={filters.course || ""}
            onChange={(e) => handleFilterChange("course", e.target.value)}
            disabled={!filters.collegeName || dropdownLoading}
            className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {!filters.collegeName ? "-- Select College First --" : "All Courses"}
            </option>
            {Boolean(filters.collegeName) &&
              courses.map((crs, idx) => (
                <option key={`crs-filter-${idx}`} value={crs}>
                  {crs}
                </option>
              ))}
          </select>
        </div>

        {/* 3. Batch Filter (Cascade Step 2: Disabled until Course selected) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Batch
          </label>
          <select
            value={filters.batch || ""}
            onChange={(e) => handleFilterChange("batch", e.target.value)}
            disabled={!filters.course || dropdownLoading}
            className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {!filters.course ? "-- Select Course First --" : "All Batches"}
            </option>
            {Boolean(filters.course) &&
              batches.map((bth, idx) => (
                <option key={`bth-filter-${idx}`} value={bth}>
                  {bth}
                </option>
              ))}
          </select>
        </div>

        {/* 4. Semester Filter (Cascade Step 3: Disabled until Batch selected) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Semester
          </label>
          <select
            value={filters.semester || ""}
            onChange={(e) => handleFilterChange("semester", e.target.value)}
            disabled={!filters.batch || dropdownLoading}
            className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {!filters.batch ? "-- Select Batch First --" : "All Semesters"}
            </option>
            {Boolean(filters.batch) &&
              semesters.map((sem, idx) => (
                <option key={`sem-filter-${idx}`} value={sem}>
                  {sem}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Search and Summary Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search activity funds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Total Record Count Display matching Legacy VB.NET logic */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm shadow-sm">
          <span id="lblTotalRecords" className="font-bold text-blue-600 text-base">
            {filteredRecords.length === 0
              ? "Sorry! No Record Found!"
              : `Total Records : ${filteredRecords.length}`}
          </span>
          {filteredRecords.length !== totalRecords && filteredRecords.length > 0 && (
            <span className="text-xs text-gray-400">(of {totalRecords})</span>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-800 whitespace-nowrap">
            <thead className="bg-gray-50 uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">#</th>
                <th scope="col" className="px-4 py-3 font-semibold">Session</th>
                <th scope="col" className="px-4 py-3 font-semibold" style={{ width: "200px" }}>CollegeName</th>
                <th scope="col" className="px-4 py-3 font-semibold" style={{ width: "150px" }}>Course</th>
                <th scope="col" className="px-4 py-3 font-semibold" style={{ width: "100px" }}>Batch</th>
                <th scope="col" className="px-4 py-3 font-semibold" style={{ width: "100px" }}>Semester</th>
                <th scope="col" className="px-4 py-3 font-semibold">SemesterID</th>
                <th scope="col" className="px-4 py-3 font-semibold" style={{ width: "100px" }}>Scheme</th>
                <th scope="col" className="px-4 py-3 font-semibold" style={{ width: "100px" }}>Category</th>
                <th scope="col" className="px-4 py-3 font-semibold">StudentFund</th>
                <th scope="col" className="px-4 py-3 font-semibold">AnnualCultureFund</th>
                <th scope="col" className="px-4 py-3 font-semibold">AudioVisual</th>
                <th scope="col" className="px-4 py-3 font-semibold">CommonRoom</th>
                <th scope="col" className="px-4 py-3 font-semibold">LibraryFund</th>
                <th scope="col" className="px-4 py-3 font-semibold">MagazineCharge</th>
                <th scope="col" className="px-4 py-3 font-semibold">NCCNSS</th>
                <th scope="col" className="px-4 py-3 font-semibold">CycleScooterCharge</th>
                <th scope="col" className="px-4 py-3 font-semibold">MedicalFund</th>
                <th scope="col" className="px-4 py-3 font-semibold">DrawingBoard</th>
                <th scope="col" className="px-4 py-3 font-semibold">GeneralMaintenance</th>
                <th scope="col" className="px-4 py-3 font-semibold">Recreation</th>
                <th scope="col" className="px-4 py-3 font-semibold">StudentChapter</th>
                <th scope="col" className="px-4 py-3 font-semibold">StationeryCharge</th>
                <th scope="col" className="px-4 py-3 font-semibold">ValedictoryFund</th>
                <th scope="col" className="px-4 py-3 font-semibold">IdentityCard</th>
                <th scope="col" className="px-4 py-3 font-semibold">RefundableSecurity</th>
                <th scope="col" className="px-4 py-3 font-semibold bg-blue-50 text-blue-800">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={27} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
                  </tr>
                ))
              ) : (
                <>
                  {/* MasterStudentActivityFund Data Rows */}
                  {filteredRecords.map((row, index) => (
                    <tr
                      key={`${row.Session}-${row.CollegeName}-${row.Course}-${row.Batch}-${row.Semester}-${index}`}
                      className="hover:bg-blue-50/50 transition duration-150"
                    >
                      <td className="px-4 py-3 font-mono text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3">{row.Session}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.CollegeName}</td>
                      <td className="px-4 py-3">{row.Course}</td>
                      <td className="px-4 py-3 font-mono">{row.Batch}</td>
                      <td className="px-4 py-3">{row.Semester}</td>
                      <td className="px-4 py-3 font-mono">{row.SemesterID}</td>
                      <td className="px-4 py-3">{row.Scheme}</td>
                      <td className="px-4 py-3">{row.Category}</td>
                      <td className="px-4 py-3 font-mono">{row.StudentFund}</td>
                      <td className="px-4 py-3 font-mono">{row.AnnualCultureFund}</td>
                      <td className="px-4 py-3 font-mono">{row.AudioVisual}</td>
                      <td className="px-4 py-3 font-mono">{row.CommonRoom}</td>
                      <td className="px-4 py-3 font-mono">{row.LibraryFund}</td>
                      <td className="px-4 py-3 font-mono">{row.MagazineCharge}</td>
                      <td className="px-4 py-3 font-mono">{row.NCCNSS}</td>
                      <td className="px-4 py-3 font-mono">{row.CycleScooterCharge}</td>
                      <td className="px-4 py-3 font-mono">{row.MedicalFund}</td>
                      <td className="px-4 py-3 font-mono">{row.DrawingBoard}</td>
                      <td className="px-4 py-3 font-mono">{row.GeneralMaintenance}</td>
                      <td className="px-4 py-3 font-mono">{row.Recreation}</td>
                      <td className="px-4 py-3 font-mono">{row.StudentChapter}</td>
                      <td className="px-4 py-3 font-mono">{row.StationeryCharge}</td>
                      <td className="px-4 py-3 font-mono">{row.ValedictoryFund}</td>
                      <td className="px-4 py-3 font-mono">{row.IdentityCard}</td>
                      <td className="px-4 py-3 font-mono">{row.RefundableSecurity}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700 bg-blue-50/50">{row.Total}</td>
                    </tr>
                  ))}

                  {/* Inline New Entry Row at the bottom matching DataGridView1.Rows.Add() & btnSave_Click */}
                  <tr className="bg-emerald-50/40 border-2 border-dashed border-emerald-300">
                    <td className="px-4 py-2 font-mono text-emerald-600 font-bold">*</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="Session..."
                        value={newSession}
                        onChange={(e) => setNewSession(e.target.value)}
                        className="w-24 bg-white border border-emerald-300 text-xs rounded p-1.5 focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={newCollegeName}
                        onChange={(e) => handleNewRowCollegeChange(e.target.value)}
                        className="w-48 bg-white border border-emerald-300 text-xs rounded p-1.5 focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">-- Select College --</option>
                        {colleges.map((col, idx) => (
                          <option key={`new-col-${idx}`} value={col}>{col}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={newCourse}
                        onChange={(e) => handleNewRowCourseChange(e.target.value)}
                        disabled={!newCollegeName || newRowLoading}
                        className="w-36 bg-white border border-emerald-300 text-xs rounded p-1.5 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!newCollegeName ? "-- Select College First --" : "-- Course --"}
                        </option>
                        {Boolean(newCollegeName) &&
                          newRowCourses.map((crs, idx) => (
                            <option key={`new-crs-${idx}`} value={crs}>{crs}</option>
                          ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={newBatch}
                        onChange={(e) => handleNewRowBatchChange(e.target.value)}
                        disabled={!newCourse || newRowLoading}
                        className="w-24 bg-white border border-emerald-300 text-xs rounded p-1.5 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!newCourse ? "-- Select Course First --" : "-- Batch --"}
                        </option>
                        {Boolean(newCourse) &&
                          newRowBatches.map((bth, idx) => (
                            <option key={`new-bth-${idx}`} value={bth}>{bth}</option>
                          ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={newSemester}
                        onChange={(e) => setNewSemester(e.target.value)}
                        disabled={!newBatch || newRowLoading}
                        className="w-24 bg-white border border-emerald-300 text-xs rounded p-1.5 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!newBatch ? "-- Select Batch First --" : "-- Sem --"}
                        </option>
                        {Boolean(newBatch) &&
                          newRowSemesters.map((sem, idx) => (
                            <option key={`new-sem-${idx}`} value={sem}>{sem}</option>
                          ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 font-mono text-gray-400">Auto</td>
                    <td className="px-4 py-2">
                      <select
                        value={newScheme}
                        onChange={(e) => setNewScheme(e.target.value)}
                        className="w-24 bg-white border border-emerald-300 text-xs rounded p-1.5 focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">-- Scheme --</option>
                        {schemes.map((sch, idx) => (
                          <option key={`new-sch-${idx}`} value={sch}>{sch}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-24 bg-white border border-emerald-300 text-xs rounded p-1.5 focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">-- Category --</option>
                        {categories.map((cat, idx) => (
                          <option key={`new-cat-${idx}`} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={studentFund} onChange={(e) => setStudentFund(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={annualCultureFund} onChange={(e) => setAnnualCultureFund(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={audioVisual} onChange={(e) => setAudioVisual(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={commonRoom} onChange={(e) => setCommonRoom(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={libraryFund} onChange={(e) => setLibraryFund(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={magazineCharge} onChange={(e) => setMagazineCharge(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={nccnss} onChange={(e) => setNccnss(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={cycleScooterCharge} onChange={(e) => setCycleScooterCharge(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={medicalFund} onChange={(e) => setMedicalFund(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={drawingBoard} onChange={(e) => setDrawingBoard(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={generalMaintenance} onChange={(e) => setGeneralMaintenance(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={recreation} onChange={(e) => setRecreation(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={studentChapter} onChange={(e) => setStudentChapter(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={stationeryCharge} onChange={(e) => setStationeryCharge(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={valedictoryFund} onChange={(e) => setValedictoryFund(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={identityCard} onChange={(e) => setIdentityCard(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-2 py-2"><input type="number" placeholder="0" value={refundableSecurity} onChange={(e) => setRefundableSecurity(e.target.value)} className="w-16 bg-white border border-emerald-300 text-xs rounded p-1" /></td>
                    <td className="px-4 py-2 font-mono font-bold text-emerald-700 bg-emerald-100/60">{calculatedNewTotal}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
