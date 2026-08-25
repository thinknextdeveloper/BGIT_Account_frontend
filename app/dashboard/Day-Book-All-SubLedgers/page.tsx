"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import * as XLSX from "xlsx";
import { fetchDisplay, fetchTotals, clearReport } from "@/store/slices/dayBookAllSubLedgersSlice";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DayBookAllSubLedgersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { rows, columns, totalRecords, cash, other, total, loading, error } = useSelector(
    (state: RootState) => state.dayBookAllSubLedgers
  );

  const [colleges, setColleges] = useState<string[]>([]);
  const [collegeName, setCollegeName] = useState("");
  const [dateFrom, setDateFrom] = useState(todayISO());
  const [dateTo, setDateTo] = useState(todayISO());
  const [session, setSession] = useState("2025-26");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
  }, []);

  const handleDisplay = () => {
    if (!collegeName) {
      setFormError("Please Select CollegeName");
      return;
    }
    setFormError(null);
    dispatch(fetchDisplay({ collegeName, dateFrom, dateTo }));
  };

  const exportToExcel = () => {
    if (rows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DayBookAllSubLedgers");
    XLSX.writeFile(wb, "daybook-all-sub-ledgers.xlsx");
  };

  const handlePrint = () => {
    if (rows.length === 0) return;
    dispatch(fetchTotals({ collegeName, dateFrom, dateTo }));
    setTimeout(() => window.print(), 300); // let totals load before print dialog
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 border border-gray-300 rounded p-4 grid grid-cols-12 gap-4 items-center">
          <Field label="Dates : From" span={3}>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
          </Field>
          <Field label="To" span={3}>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Session" span={3}>
            <input value={session} onChange={(e) => setSession(e.target.value)} className={inputCls} />
          </Field>
          <Field label="" span={3}><span /></Field>
          <Field label="College" span={6}>
            <select value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className={selectCls}>
              <option value="">-- Select --</option>
              {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        {formError && (
          <p className="text-red-600 text-[13px] font-medium mt-2 text-center">{formError}</p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="border border-gray-400 rounded px-3 py-1.5 bg-white/90 font-semibold text-[13px] text-gray-900">
            Total Records : {totalRecords}
          </div>
          <div className="flex gap-3">
            <button onClick={handleDisplay} className={btnCls}>Display</button>
            <button onClick={exportToExcel} disabled={rows.length === 0} className={btnCls}>Export to Excel</button>
            <button onClick={handlePrint} disabled={rows.length === 0} className={btnCls}>Print</button>
            <button className={btnCls}>Close</button>
          </div>
        </div>

        {/* Print-only summary header, mirrors the Crystal Report's cash/other/total block */}
        <div className="hidden print:block mt-4 text-[13px] text-gray-900">
          <p className="font-bold text-lg">{collegeName}</p>
          <p>Date From: {dateFrom}  To: {dateTo}</p>
          <p>Cash Amount: {cash} &nbsp; Other Amount: {other} &nbsp; Total Amount: {total}</p>
        </div>

        <div className="bg-white border border-gray-300 rounded shadow-sm mt-2 overflow-auto max-h-[65vh]">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-10">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Choose a college and date range, then click Display.</p>
          ) : (
            <table className="border-collapse text-[12px] min-w-max">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-2 border-gray-800">
                  {columns.map((col) => (
                    <th key={col} className="text-left py-2 px-2 text-gray-900 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    {columns.map((col) => (
                      <td key={col} className="py-1.5 px-2 text-gray-900 whitespace-nowrap">
                        {col.toLowerCase().includes("date") && row[col]
                          ? new Date(row[col]).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                          : row[col] ?? ""}
                      </td>
                    ))}
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

const selectCls = "w-full border border-gray-300 h-8 px-2 rounded text-[12px] bg-white text-gray-900";
const inputCls = "w-full border border-gray-300 h-8 px-2 rounded text-[12px] bg-white text-gray-900";
const btnCls = "bg-blue-600 text-white font-semibold text-[12px] px-4 h-9 rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed";

function Field({ label, span, children }: { label: string; span: number; children: React.ReactNode }) {
  return (
    <div className={`col-span-${span} flex items-center gap-2`}>
      {label && <label className="w-28 shrink-0 font-semibold text-[12px] text-gray-800">{label}</label>}
      <div className="flex-1">{children}</div>
    </div>
  );
}