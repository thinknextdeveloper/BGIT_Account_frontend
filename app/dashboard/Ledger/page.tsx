"use client";

import React, { useState } from "react";
import { useMasterLedger } from "@/hooks/useMasterLedger";
import { ledgerApi, createLedger } from "@/services/ledgerApi";

export default function LedgerPage() {
  const {
    records,
    totalRecords,
    selectedCollege,
    colleges,
    loading,
    error,
    handleCollegeChange,
    resetFilters,
    refetch,
  } = useMasterLedger();

  const [searchTerm, setSearchTerm] = useState("");

  // New row input state for inline DataGridView-style row addition
  const [newRowCollege, setNewRowCollege] = useState("");
  const [newRowLedger, setNewRowLedger] = useState("");

  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Client-side quick search filtering across CollegeName and LedgerName
  const filteredRecords = records.filter((rec) => {
    const term = searchTerm.toLowerCase();
    return (
      rec.CollegeName?.toLowerCase().includes(term) ||
      rec.LedgerName?.toLowerCase().includes(term)
    );
  });

  /**
   * Equivalent to legacy Private Sub btnSave_Click implementation
   */
  const btnSave_Click = async () => {
    setValidationError(null);
    setSuccessMessage(null);

    // 1. Validate College Name
    if (!newRowCollege || newRowCollege.trim() === "") {
      setValidationError("Please Enter College Name");
      return;
    }

    // 2. Validate Ledger Name
    if (!newRowLedger || newRowLedger.trim() === "") {
      setValidationError("Please Enter Ledger Name");
      return;
    }

    try {
      setSaving(true);
      const saveFn = ledgerApi?.createLedger || createLedger;
      const res = await saveFn({
        collegeName: newRowCollege.trim(),
        ledgerName: newRowLedger.trim(),
      });

      setSuccessMessage(res.message || "Ledger record added successfully!");
      setNewRowCollege("");
      setNewRowLedger("");
      refetch(); // Equivalent to Display()

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      setValidationError(err.message || "Failed to add ledger record.");
      refetch(); // Equivalent to Display() call on duplicate exit sub
    } finally {
      setSaving(false);
    }
  };

  /**
   * Export Ledger table data to Excel (.csv file with UTF-8 BOM)
   */
  const exportToExcel = () => {
    if (!filteredRecords || filteredRecords.length === 0) {
      alert("No data available to export.");
      return;
    }

    let csvContent = "CollegeName,LedgerName\n";
    filteredRecords.forEach((row) => {
      const college = `"${(row.CollegeName || "").replace(/"/g, '""')}"`;
      const ledger = `"${(row.LedgerName || "").replace(/"/g, '""')}"`;
      csvContent += `${college},${ledger}\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Master_Ledgers_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Print Ledger table data / Save as PDF
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
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${row.CollegeName || ""}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${row.LedgerName || ""}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Master Ledgers Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; }
            h2 { text-align: center; color: #0f172a; margin-bottom: 4px; }
            p { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-size: 13px; font-weight: 700; color: #475569; }
            td { font-size: 12px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h2>Master Ledgers Report</h2>
          <p>Generated on: ${new Date().toLocaleString()} | Total Records: ${filteredRecords.length}</p>
          <table>
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">#</th>
                <th>College Name</th>
                <th>Ledger Name</th>
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
            Ledger
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Display and manage ledgers from MasterLedgers table.
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

          {/* Export to Excel Button */}
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

          {/* Print PDF Button */}
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
            placeholder="Search ledgers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Total Records Counter Badge (Matches legacy lblTotalRecords.Text = "Total Records : " & Count) */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm shadow-sm">
          <span className="text-gray-500 font-medium">Total Records :</span>
          <span id="lblTotalRecords" className="font-bold text-blue-600 text-base">{filteredRecords.length}</span>
          {filteredRecords.length !== totalRecords && (
            <span className="text-xs text-gray-400">(of {totalRecords})</span>
          )}
        </div>
      </div>

      {/* DataGridView Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-800">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3.5 font-semibold w-16">#</th>
                <th scope="col" className="px-6 py-3.5 font-semibold" style={{ width: "200px" }}>CollegeName</th>
                <th scope="col" className="px-6 py-3.5 font-semibold" style={{ width: "100px" }}>LedgerName</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-6"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                  </tr>
                ))
              ) : (
                <>
                  {/* MasterLedgers Data Rows */}
                  {filteredRecords.map((row, index) => (
                    <tr
                      key={`${row.CollegeName}-${row.LedgerName}-${index}`}
                      className="hover:bg-blue-50/50 transition duration-150"
                    >
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{row.CollegeName}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{row.LedgerName}</td>
                    </tr>
                  ))}

                  {/* Empty Row at the end for new entry (Preserves DataGridView1.Rows.Add() & btnSave_Click behavior) */}
                  <tr className="bg-emerald-50/40 border-2 border-dashed border-emerald-300">
                    <td className="px-6 py-3.5 text-xs font-mono text-emerald-600 font-bold">*</td>
                    <td className="px-6 py-3.5">
                      <select
                        value={newRowCollege}
                        onChange={(e) => setNewRowCollege(e.target.value)}
                        className="w-full bg-white border border-emerald-300 text-gray-800 text-sm rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      >
                        <option value="">-- Select CollegeName --</option>
                        {colleges.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3.5">
                      <input
                        type="text"
                        placeholder="Enter Ledger Name..."
                        value={newRowLedger}
                        onChange={(e) => setNewRowLedger(e.target.value)}
                        className="w-full bg-white border border-emerald-300 text-gray-800 text-sm rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      />
                    </td>
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
