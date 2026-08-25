"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import * as XLSX from "xlsx";
import {
  fetchMasterAnnualFeeReport,
  clearMasterAnnualFeeReport,
} from "@/store/slices/masterAnnualFeeSlice";

export default function MasterAnnualFeeReportPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    reportRows: rows,
    reportTotalRecords: totalRecords,
    reportLoading: loading,
    reportError: error,
  } = useSelector((state: RootState) => state.masterAnnualFee);

  useEffect(() => {
    dispatch(fetchMasterAnnualFeeReport());
    return () => {
      dispatch(clearMasterAnnualFeeReport());
    };
  }, [dispatch]);

  const exportToExcel = () => {
    if (rows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MasterAnnualFee");
    XLSX.writeFile(wb, "master-annual-fee.xlsx");
  };

  const handlePrint = () => {
    if (rows.length === 0) return;
    window.print();
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="border border-gray-400 rounded px-4 py-2 bg-white/90 font-semibold text-[13px] text-gray-900">
            Total Records : {totalRecords}
          </div>
          <div className="flex gap-3">
            <button onClick={handlePrint} disabled={rows.length === 0} className={btnCls}>
              Print
            </button>
            <button onClick={exportToExcel} disabled={rows.length === 0} className={btnCls}>
              Export to Excel
            </button>
            <button className={btnCls}>Close</button>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-auto max-h-[75vh]">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-10">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No records found.</p>
          ) : (
            <table className="w-full border-collapse text-[12px]">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-2 px-2 text-gray-900">College Name</th>
                  <th className="text-left py-2 px-2 text-gray-900">Course</th>
                  <th className="text-left py-2 px-2 text-gray-900">Batch</th>
                  <th className="text-left py-2 px-2 text-gray-900">Semester</th>
                  <th className="text-left py-2 px-2 text-gray-900">Head</th>
                  <th className="text-right py-2 px-2 text-gray-900">Amount</th>
                  <th className="text-left py-2 px-2 text-gray-900">Category</th>
                  <th className="text-left py-2 px-2 text-gray-900">Mode Of Admission</th>
                  <th className="text-left py-2 px-2 text-gray-900">Scheme</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={`${row.CollegeName}-${row.Course}-${row.Batch}-${i}`} className="border-b border-gray-200">
                    <td className="py-1.5 px-2 text-blue-700">{row.CollegeName}</td>
                    <td className="py-1.5 px-2 text-blue-700">{row.Course}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.Batch}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.Semester}</td>
                    <td className="py-1.5 px-2 text-blue-700">{row.Head}</td>
                    <td className="py-1.5 px-2 text-right text-gray-900">{row.Amount}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.Category}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.ModeOfAdmission}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.Scheme ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const btnCls = "bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed";