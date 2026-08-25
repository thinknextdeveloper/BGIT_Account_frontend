"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import * as XLSX from "xlsx";
import {
  fetchCourses, fetchSemesters, fetchBatches, fetchCurrentSession,
  fetchReport, clearReport, FundRow,
} from "@/store/slices/studentActivityFundSlice";

const FUND_COLUMNS: { key: keyof FundRow; label: string }[] = [
  { key: "StudentFund", label: "Student Fund" },
  { key: "AnnualCultureFund", label: "Annual Culture Fund" },
  { key: "AudioVisual", label: "Audio Visual" },
  { key: "CommonRoom", label: "Common Room" },
  { key: "LibraryFund", label: "Library Fund" },
  { key: "MagazineCharge", label: "Magazine Charge" },
  { key: "NCCNSS", label: "NCC/NSS" },
  { key: "CycleScooterCharge", label: "Cycle/Scooter Charge" },
  { key: "MedicalFund", label: "Medical Fund" },
  { key: "DrawingBoard", label: "Drawing Board" },
  { key: "GeneralMaintenance", label: "General Maintenance" },
  { key: "Recreation", label: "Recreation" },
  { key: "StudentChapter", label: "Student Chapter" },
  { key: "StationeryCharge", label: "Stationery Charge" },
  { key: "ValedictoryFund", label: "Valedictory Fund" },
  { key: "IdentityCard", label: "Identity Card" },
  { key: "RefundableSecurity", label: "Refundable Security" },
  { key: "Total", label: "Total" },
];

export default function StudentActivityFundPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { courses, semesters, batches, session, rows, totals, totalRecords, loading, error } =
    useSelector((state: RootState) => state.studentActivityFund);

  const [colleges, setColleges] = useState<string[]>([]);
  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [semester, setSemester] = useState("");
  const [useDateRange, setUseDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
    dispatch(fetchCurrentSession());
  }, [dispatch]);

  const handleCollegeChange = (value: string) => {
    setCollegeName(value);
    setCourse("");
    setBatch("");
    setSemester("");
    if (value) {
      dispatch(fetchCourses(value));
      dispatch(fetchBatches(value));
      dispatch(fetchSemesters(value));
    }
  };

  const runReport = () => {
    if (!collegeName) {
      setFormError("Please Specify College");
      return;
    }
    setFormError(null);
    setHasSearched(true);
    dispatch(
      fetchReport({
        collegeName,
        course: course || undefined,
        batch: batch || undefined,
        semester: semester || undefined,
        dateFrom: useDateRange ? dateFrom || undefined : undefined,
        dateTo: useDateRange ? dateTo || undefined : undefined,
      })
    );
  };

  const exportToExcel = () => {
    if (rows.length === 0) return;
    const exportRows = [...rows, { ...totals, Category: "Total" } as any];
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StudentActivityFund");
    XLSX.writeFile(wb, "student-activity-fund.xlsx");
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 border border-gray-300 rounded p-4 grid grid-cols-12 gap-4">
          <Field label="College" span={3}>
            <select value={collegeName} onChange={(e) => handleCollegeChange(e.target.value)} className={selectCls}>
              <option value="">-- Select --</option>
              {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Course" span={3}>
            <select value={course} onChange={(e) => setCourse(e.target.value)} disabled={!collegeName} className={selectCls}>
              <option value="">-- All --</option>
              {courses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Batch" span={3}>
            <select value={batch} onChange={(e) => setBatch(e.target.value)} disabled={!collegeName} className={selectCls}>
              <option value="">-- All --</option>
              {batches.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Semester" span={3}>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} disabled={!collegeName} className={selectCls}>
              <option value="">-- All --</option>
              {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="" span={12}>
            <div className="flex items-center gap-4 text-[13px] font-semibold text-gray-800">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={useDateRange} onChange={(e) => setUseDateRange(e.target.checked)} /> Between Two Dates
              </label>
              {useDateRange && (
                <>
                  <span>From</span>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputCls} w-auto`} />
                  <span>To</span>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputCls} w-auto`} />
                </>
              )}
              {session && <span className="ml-auto text-gray-600">Session: {session}</span>}
            </div>
          </Field>
        </div>

        {formError && (
          <p className="text-red-600 text-[13px] font-medium mt-2 text-center">{formError}</p>
        )}

        <div className="flex justify-center gap-4 mt-4">
          <button onClick={runReport} className={btnCls}>Display</button>
          <button onClick={runReport} className={btnCls}>Print</button>
          <button onClick={exportToExcel} disabled={rows.length === 0} className={`${btnCls} disabled:opacity-40`}>
            Export to Excel
          </button>
          <button className={btnCls}>Close</button>
        </div>

        <p className="text-[13px] font-semibold text-gray-900 mt-4">
          Total Records : {hasSearched ? totalRecords : 0}
        </p>

        <div className="bg-white border border-gray-300 rounded shadow-sm mt-2 p-2 min-h-[300px] overflow-x-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-10">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              {hasSearched ? "No record found!" : "Choose a college and run Display."}
            </p>
          ) : (
            <table className="border-collapse text-[11px] min-w-max">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-2 px-2 text-gray-900">Date</th>
                  <th className="text-left py-2 px-2 text-gray-900">Receipt No</th>
                  <th className="text-left py-2 px-2 text-gray-900">ID No</th>
                  <th className="text-left py-2 px-2 text-gray-900">Student Name</th>
                  <th className="text-left py-2 px-2 text-gray-900">Scheme</th>
                  <th className="text-left py-2 px-2 text-gray-900">Category</th>
                  {FUND_COLUMNS.map((c) => (
                    <th key={c.key} className="text-right py-2 px-2 text-gray-900 whitespace-nowrap">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={`${row.ReceiptNo}-${i}`} className="border-b border-gray-200">
                    <td className="py-1.5 px-2 text-gray-900">
                      {row.ReceiptDate ? new Date(row.ReceiptDate).toLocaleDateString("en-GB") : ""}
                    </td>
                    <td className="py-1.5 px-2 text-gray-900">{row.ReceiptNo}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.IDNo}</td>
                    <td className="py-1.5 px-2 text-blue-700">{row.StudentName}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.Scheme}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.Category}</td>
                    {FUND_COLUMNS.map((c) => (
                      <td key={c.key} className="py-1.5 px-2 text-right text-gray-900">{row[c.key] ?? 0}</td>
                    ))}
                  </tr>
                ))}
                {/* Totals row — bold, mirrors VB's DataGridView1_CellFormatting bold-last-row logic */}
                <tr className="border-t-2 border-gray-800 font-bold">
                  <td className="py-1.5 px-2" colSpan={6}>Total</td>
                  {FUND_COLUMNS.map((c) => (
                    <td key={c.key} className="py-1.5 px-2 text-right text-gray-900">{totals[c.key] ?? 0}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const selectCls = "w-full border border-gray-300 h-8 px-2 rounded text-[12px] bg-white text-gray-900 disabled:bg-gray-100";
const inputCls = "border border-gray-300 h-8 px-2 rounded text-[12px] bg-white text-gray-900";
const btnCls = "bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700";

function Field({ label, span, children }: { label: string; span: number; children: React.ReactNode }) {
  return (
    <div className={`col-span-${span} flex items-center gap-2`}>
      {label && <label className="w-20 shrink-0 font-semibold text-[12px] text-gray-800">{label}</label>}
      <div className="flex-1">{children}</div>
    </div>
  );
}