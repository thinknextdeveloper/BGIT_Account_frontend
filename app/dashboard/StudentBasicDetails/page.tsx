"use client";

import React, { useEffect, useRef } from "react";
import { useStudentBasicDetails } from "@/hooks/useStudentBasicDetails";

export default function StudentBasicDetailsPage() {
  const {
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
    refetch,
  } = useStudentBasicDetails();

  // Reference for IntersectionObserver scroll sentinel
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  /**
   * IntersectionObserver setup for automatic infinite scroll fetching
   */
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreRecords();
        }
      },
      {
        root: null, // relative to viewport/scroll parent
        rootMargin: "200px", // pre-fetch 200px before reaching the bottom
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loading, loadingMore, loadMoreRecords]);

  /**
   * Helper to safely render table cell values and prevent React child object errors
   */
  const renderCell = (val: any): React.ReactNode => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object") {
      if (val.type === "Buffer" && Array.isArray(val.data)) {
        return "";
      }
      return JSON.stringify(val);
    }
    return String(val);
  };

  /**
   * Helper to render student photo / Snap field safely
   */
  const renderSnapCell = (val: any): React.ReactNode => {
    if (!val) return <span className="text-gray-400 font-mono">-</span>;
    if (typeof val === "string" && val.startsWith("data:image")) {
      return (
        <img
          src={val}
          alt="Snap"
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
          loading="lazy"
        />
      );
    }
    if (typeof val === "object") {
      return <span className="text-gray-400 font-mono">-</span>;
    }
    return String(val);
  };

  /**
   * Export StudentBasicDetails loaded records to Excel (.csv file with UTF-8 BOM)
   */
  const exportToExcel = () => {
    if (!records || records.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "CollegeName",
      "Course",
      "Batch",
      "Class",
      "LateralEntry",
      "AdmissionDate",
      "IDNo",
      "ClassRollNo",
      "StudentName",
      "FatherName",
      "MotherName",
      "Sex",
      "DOB",
      "FatherOccupation",
      "CorrespondanceAddress",
      "PermanentAddress",
      "EmailID",
      "PhoneNo",
      "StudentMobileNo",
      "FatherMobileNo",
      "Facility",
      "StudentType",
      "Category",
      "Scheme",
      "Snap",
    ];

    let csvContent = headers.join(",") + "\n";

    records.forEach((row) => {
      const line = headers
        .map((h) => {
          const val = (row as any)[h] !== undefined && (row as any)[h] !== null ? String((row as any)[h]) : "";
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",");
      csvContent += line + "\n";
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Student_Basic_Details_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Print StudentBasicDetails loaded records / Save as PDF
   */
  const handlePrintPDF = () => {
    if (!records || records.length === 0) {
      alert("No data available to print.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = records
      .map(
        (row, idx) => `
          <tr>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.IDNo ?? ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.ClassRollNo ?? ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${row.StudentName ?? ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.FatherName ?? ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.CollegeName ?? ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.Course ?? ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.Batch ?? ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.Class ?? ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.AdmissionDate ?? ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.DOB ?? ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.Sex ?? ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.StudentMobileNo ?? ""}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${row.Category ?? ""}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Basic Details Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
            h2 { text-align: center; color: #0f172a; margin-bottom: 4px; }
            p { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background-color: #f8fafc; padding: 8px; border: 1px solid #cbd5e1; text-align: left; font-weight: 700; color: #475569; }
            td { font-size: 11px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h2>Student Basic Details Report</h2>
          <p>Generated on: ${new Date().toLocaleString()} | Total Loaded Records: ${records.length}</p>
          <table>
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th>ID No</th>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Father Name</th>
                <th>College Name</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Class</th>
                <th>Admission Date</th>
                <th>DOB</th>
                <th>Sex</th>
                <th>Mobile</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); };
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
            StudentBasicDetails
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Display student admission basic details with high-performance infinite scrolling.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Export to Excel Button */}
          <button
            onClick={exportToExcel}
            disabled={records.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-medium rounded-lg shadow transition duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Excel
          </button>

          {/* Print PDF Button */}
          <button
            onClick={handlePrintPDF}
            disabled={records.length === 0}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm font-medium rounded-lg shadow transition duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print PDF
          </button>

          {/* Refresh Button */}
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

          {/* Reset Filters Button */}
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition duration-150"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={refetch} className="underline text-red-600 hover:text-red-800 text-xs font-semibold">Retry</button>
        </div>
      )}

      {/* Dynamic Filter Section (Uses existing GetCollege functionality) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            College Name
          </label>
          <select
            value={selectedCollege}
            onChange={(e) => handleCollegeChange(e.target.value)}
            disabled={loading}
            className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
          >
            <option value="">All Assigned Colleges</option>
            {colleges.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Search & Summary Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search students (ID, Name, Roll No...)"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Total Records Counter Badge (lblTotalRecords) */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm shadow-sm">
          <span className="text-gray-500 font-medium">Records:</span>
          <span id="lblTotalRecords" className="font-bold text-blue-600 text-base">
            {records.length}
          </span>
          <span className="text-xs text-gray-400">
            of <strong className="text-gray-700">{totalRecords.toLocaleString("en-US")}</strong> total
          </span>
        </div>
      </div>

      {/* DataGridView Table with Scroll Container & Infinite Scroll */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[650px] overflow-y-auto relative">
          <table className="w-full text-left text-xs text-gray-800 whitespace-nowrap">
            <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600 border-b border-gray-200 sticky top-0 z-10 shadow-xs">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-semibold w-12 text-center bg-gray-100">#</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">IDNo</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">ClassRollNo</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">StudentName</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">FatherName</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">MotherName</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">Sex</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">DOB</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">CollegeName</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">Course</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">Batch</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">Class</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">LateralEntry</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">AdmissionDate</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">FatherOccupation</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">CorrespondanceAddress</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">PermanentAddress</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">EmailID</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">PhoneNo</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">StudentMobileNo</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">FatherMobileNo</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">Facility</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">StudentType</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">Category</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">Scheme</th>
                <th scope="col" className="px-4 py-3.5 font-semibold bg-gray-100">Snap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading && records.length === 0 ? (
                // Initial Load Skeleton Rows
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-6 mx-auto"></div></td>
                    {Array.from({ length: 25 }).map((_, colIdx) => (
                      <td key={colIdx} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={26} className="px-6 py-8 text-center text-gray-500">
                    No student basic details found.
                  </td>
                </tr>
              ) : (
                records.map((row, index) => (
                  <tr
                    key={`${row.IDNo}-${index}`}
                    className="hover:bg-blue-50/50 transition duration-150"
                  >
                    <td className="px-4 py-3 text-center text-gray-400 font-mono">{index + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{renderCell(row.IDNo)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.ClassRollNo)}</td>
                    <td className="px-4 py-3 font-medium text-blue-900">{renderCell(row.StudentName)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.FatherName)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.MotherName)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.Sex)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.DOB)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.CollegeName)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.Course)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.Batch)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.Class)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.LateralEntry)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.AdmissionDate)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.FatherOccupation)}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={typeof row.CorrespondanceAddress === 'string' ? row.CorrespondanceAddress : ''}>{renderCell(row.CorrespondanceAddress)}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={typeof row.PermanentAddress === 'string' ? row.PermanentAddress : ''}>{renderCell(row.PermanentAddress)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.EmailID)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.PhoneNo)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.StudentMobileNo)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.FatherMobileNo)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.Facility)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.StudentType)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.Category)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderCell(row.Scheme)}</td>
                    <td className="px-4 py-3 text-gray-700">{renderSnapCell(row.Snap)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* IntersectionObserver Sentinel & Infinite Scroll Loader */}
          <div ref={observerTargetRef} className="py-4 text-center border-t border-gray-100 bg-gray-50/60">
            {loadingMore ? (
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600">
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Loading next batch of 100 students ({records.length} of {totalRecords} loaded)...</span>
              </div>
            ) : hasMore && records.length > 0 ? (
              <div className="text-xs text-gray-400 font-medium">
                Scroll down to load more records...
              </div>
            ) : records.length > 0 ? (
              <div className="text-xs font-semibold text-emerald-600">
                ✓ All {records.length.toLocaleString()} student records loaded
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
