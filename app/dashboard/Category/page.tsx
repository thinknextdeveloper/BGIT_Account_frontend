"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchCategories, addCategory } from "@/store/slices/masterCategorySlice";

export default function MasterCategoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { rows, loading, saving } = useSelector((state: RootState) => state.masterCategory);

  const [newCollegeName, setNewCollegeName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const uniqueColleges = Array.from(new Set(rows.map((r: any) => r.CollegeName))).sort();

  const handleAddRow = async () => {
    if (!newCollegeName || !newCategory.trim()) return;
    await dispatch(addCategory({ collegeName: newCollegeName, category: newCategory.trim() }));
    setNewCollegeName("");
    setNewCategory("");
  };

  const handleExportToExcel = async () => {
    try {
      const importXLSX = new Function('return import("xlsx")');
      const XLSX = await importXLSX();

      const worksheet = XLSX.utils.json_to_sheet(
        rows.map((row: any) => ({
          CollegeName: row.CollegeName,
          Category: row.Category,
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "MasterCategory");
      XLSX.writeFile(workbook, "MasterCategory.xlsx");
    } catch {
      // Standard CSV export for Excel compatibility
      const headers = ["CollegeName", "Category"];
      let csvContent = headers.join(",") + "\n";
      rows.forEach((row: any) => {
        csvContent += `"${row.CollegeName || ""}","${row.Category || ""}"\n`;
      });
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "MasterCategory.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Master Category</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; font-size: 13px; }
            th { background: #e5e7eb; }
            h2 { margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <h2>Master Category (Total Records: ${rows.length})</h2>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="p-4 text-gray-900">
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Category Master</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and view student category classifications.
        </p>
      </div>

      <p className="font-semibold mb-3">Total Records : {rows.length}</p>

      <div className="border border-gray-400 max-w-2xl rounded overflow-hidden">
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm border-collapse table-fixed">
            <colgroup>
              <col className="w-1/2" />
              <col className="w-1/2" />
            </colgroup>
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="border px-2 py-1 text-left">CollegeName</th>
                <th className="border px-2 py-1 text-left">Category</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : (
                rows.map((row: any, index: number) => (
                  <tr key={`${row.CollegeName}-${row.Category}-${index}`}>
                    <td className="border px-2 py-1">{row.CollegeName}</td>
                    <td className="border px-2 py-1">{row.Category}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add new row - always visible below the scrollable list */}
        <table className="w-full text-sm border-collapse table-fixed border-t-2 border-gray-500">
          <colgroup>
            <col className="w-1/2" />
            <col className="w-1/2" />
          </colgroup>
          <tbody>
            <tr>
              <td className="border px-2 py-1">
                <select
                  value={newCollegeName}
                  onChange={(e) => setNewCollegeName(e.target.value)}
                  className="w-full outline-none bg-white text-gray-900"
                >
                  <option value="">-- Select --</option>
                  {uniqueColleges.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border px-2 py-1">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRow()}
                  placeholder="Type category and press Enter"
                  className="w-full outline-none bg-transparent text-gray-900"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Hidden printable table, kept in sync with real data */}
      <div ref={printRef} className="hidden">
        <table>
          <thead>
            <tr>
              <th>CollegeName</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, index: number) => (
              <tr key={`print-${index}`}>
                <td>{row.CollegeName}</td>
                <td>{row.Category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 mt-4 max-w-[180px]">
        <button
          onClick={handleAddRow}
          disabled={saving || !newCollegeName || !newCategory.trim()}
          className="bg-blue-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add New Record"}
        </button>
        <button
          onClick={handleExportToExcel}
          className="bg-blue-700 text-white px-4 py-2 rounded font-semibold"
        >
          Export To Excel
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-700 text-white px-4 py-2 rounded font-semibold"
        >
          Print
        </button>
        <button className="bg-gray-500 text-white px-4 py-2 rounded font-semibold">
          Close
        </button>
      </div>
    </div>
  );
}