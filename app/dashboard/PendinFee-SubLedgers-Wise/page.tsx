"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import * as XLSX from "xlsx";
import {
  fetchCourses,
  fetchBatches,
  fetchSubHeads,
  fetchDisplay,
  fetchSingleSubHead,
  clearReport,
} from "@/store/slices/allSubLedgersPendingFeeSlice";

export default function AllSubLedgersPendingFeePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { courses, batches, subHeads, rows, columns, totalRecords, loading, error } =
    useSelector((state: RootState) => state.allSubLedgersPendingFee);

  const [colleges, setColleges] = useState<string[]>([]);
  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [subHead, setSubHead] = useState("");
  const [session, setSession] = useState("2025-26"); // mirrors frmdebit.ShowSession default

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
  }, []);

  const handleCollegeChange = (value: string) => {
    setCollegeName(value);
    setCourse("");
    setBatch("");
    setSubHead("");
    dispatch(clearReport());
    if (value) {
      dispatch(fetchCourses(value));
      dispatch(fetchBatches(value));
      dispatch(fetchSubHeads(value)); // mirrors cmbCollege_SelectedIndexChanged
    }
  };

  const handleDisplay = () => {
    dispatch(fetchDisplay({ collegeName, course, batch }));
  };

  const handleSingleSubHeadWise = () => {
    dispatch(fetchSingleSubHead({ collegeName, course, batch, subHead, session }));
  };

  const exportToExcel = () => {
    if (rows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SubLedgersPendingFee");
    XLSX.writeFile(wb, "sub-ledgers-pending-fee.xlsx");
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
        <div className="bg-white/80 border border-gray-300 rounded p-4 grid grid-cols-12 gap-4">
          <Field label="College" span={4}>
            <select value={collegeName} onChange={(e) => handleCollegeChange(e.target.value)} className={selectCls}>
              <option value="">-- Select --</option>
              {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Session" span={4}>
            <input value={session} onChange={(e) => setSession(e.target.value)} className={inputCls} />
          </Field>
          <Field label="" span={4}><span /></Field>

          <Field label="Course" span={4}>
            <select value={course} onChange={(e) => setCourse(e.target.value)} disabled={!collegeName} className={selectCls}>
              <option value="">-- Select --</option>
              {courses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Batch" span={4}>
            <select value={batch} onChange={(e) => setBatch(e.target.value)} disabled={!collegeName} className={selectCls}>
              <option value="">-- Select --</option>
              {batches.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="SubHead" span={4}>
            <select value={subHead} onChange={(e) => setSubHead(e.target.value)} disabled={!collegeName} className={selectCls}>
              <option value="">-- Select --</option>
              {subHeads.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="border border-gray-400 rounded px-3 py-1.5 bg-white/90 font-semibold text-[13px] text-gray-900">
            Total Records : {totalRecords}
          </div>
          <div className="flex gap-3">
            <button onClick={handleDisplay} className={btnCls}>Display</button>
            <button onClick={handleSingleSubHeadWise} className={btnCls}>Single SubHead Wise</button>
            <button onClick={exportToExcel} disabled={rows.length === 0} className={btnCls}>Export to Excel</button>
            <button onClick={handlePrint} disabled={rows.length === 0} className={btnCls}>Print</button>
            <button className={btnCls}>Close</button>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded shadow-sm mt-2 overflow-auto max-h-[70vh]">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-10">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              Choose filters and click Display, or pick a SubHead and click Single SubHead Wise.
            </p>
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
                        {row[col] ?? ""}
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

const selectCls = "w-full border border-gray-300 h-8 px-2 rounded text-[12px] bg-white text-gray-900 disabled:bg-gray-100";
const inputCls = "w-full border border-gray-300 h-8 px-2 rounded text-[12px] bg-white text-gray-900";
const btnCls = "bg-blue-600 text-white font-semibold text-[12px] px-4 h-9 rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed";

function Field({ label, span, children }: { label: string; span: number; children: React.ReactNode }) {
  return (
    <div className={`col-span-${span} flex items-center gap-2`}>
      {label && <label className="w-20 shrink-0 font-semibold text-[12px] text-gray-800">{label}</label>}
      <div className="flex-1">{children}</div>
    </div>
  );
}