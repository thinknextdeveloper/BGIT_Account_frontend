"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import * as XLSX from "xlsx";
import {
  fetchSemesters,
  fetchFeeCategories,
  fetchLedgerStatusReport,
  clearReport,
  ReportAction,
} from "@/store/slices/ledgerStatusSlice";

export default function LedgerStatusPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { semesters, feeCategories, rows, totalCredit, totalDebit, balance, loading, error } =
    useSelector((state: RootState) => state.ledgerStatus);

  const [colleges, setColleges] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [ledgerNames, setLedgerNames] = useState<string[]>([]);

  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [ledgerName, setLedgerName] = useState("");
  const [session, setSession] = useState("2025-26");
  const [semester, setSemester] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [useDateRange, setUseDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [idType, setIdType] = useState<"idNo" | "registration">("idNo");
  const [checkAll, setCheckAll] = useState(false);
  const [selectedFeeCategories, setSelectedFeeCategories] = useState<string[]>([]);

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
    dispatch(fetchSemesters());
    dispatch(fetchFeeCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!collegeName) return;
    reduxApiClient.get("hostel-report/courses", { collegeName }).then((res) => {
      if (res.success) setCourses(res.data.data);
    });
    reduxApiClient.get("hostel-report/batches", { collegeName }).then((res) => {
      if (res.success) setBatches(res.data.data);
    });
    reduxApiClient.get("concession/ledger-names", { collegeName }).then((res) => {
      if (res.success) setLedgerNames(res.data.data);
    });
  }, [collegeName]);

  const toggleFeeCategory = (fc: string) => {
    setSelectedFeeCategories((prev) =>
      prev.includes(fc) ? prev.filter((x) => x !== fc) : [...prev, fc]
    );
  };

  const toggleCheckAll = (checked: boolean) => {
    setCheckAll(checked);
    setSelectedFeeCategories(checked ? feeCategories : []);
  };

  const runReport = (action: ReportAction) => {
    if (!collegeName) return; // backend also guards this with "Please Select College"
    dispatch(
      fetchLedgerStatusReport({
        collegeName,
        course: course || undefined,
        batch: batch || undefined,
        ledgerName: ledgerName || undefined,
        semester: semester || undefined,
        session: session || undefined,
        idType,
        action,
        feeCategories: selectedFeeCategories,
      })
    );
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LedgerStatus");
    XLSX.writeFile(wb, "ledger-status.xlsx");
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 border border-gray-300 rounded p-4 grid grid-cols-12 gap-4">
          {/* Row 1: College / Ledger */}
          <Field label="College" span={3}>
            <select value={collegeName} onChange={(e) => { setCollegeName(e.target.value); setCourse(""); setBatch(""); }} className={selectCls}>
              <option value="">-- Select --</option>
              {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Ledger Name" span={3}>
            <select value={ledgerName} onChange={(e) => setLedgerName(e.target.value)} disabled={!collegeName} className={selectCls}>
              <option value="">-- All --</option>
              {ledgerNames.map((l) => <option key={l} value={l}>{l}</option>)}
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

          {/* Row 2: Session / Semester / Sort */}
          <Field label="Session" span={3}>
            <input value={session} onChange={(e) => setSession(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Semester" span={3}>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} className={selectCls}>
              <option value="">-- All --</option>
              {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Sort By" span={3}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectCls}>
              <option value="">-- Default --</option>
              <option value="StudentName">Student Name</option>
              <option value="IDNo">ID No</option>
              <option value="Balance">Balance</option>
            </select>
          </Field>
          <Field label="" span={3}>
            <div className="flex items-center gap-4 text-[13px] font-semibold text-gray-800 pt-1">
              <label className="flex items-center gap-1">
                <input type="radio" checked={idType === "registration"} onChange={() => setIdType("registration")} /> Registration
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" checked={idType === "idNo"} onChange={() => setIdType("idNo")} /> ID No.
              </label>
            </div>
          </Field>

          {/* Row 3: Dates */}
          <Field label="" span={12}>
            <div className="flex items-center gap-4 text-[13px] font-semibold text-gray-800">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={useDateRange} onChange={(e) => setUseDateRange(e.target.checked)} /> Dates:
              </label>
              <span>From</span>
              <input type="date" disabled={!useDateRange} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputCls} w-auto disabled:bg-gray-100`} />
              <span>To</span>
              <input type="date" disabled={!useDateRange} value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputCls} w-auto disabled:bg-gray-100`} />
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-12 gap-4 mt-4">
          {/* Action buttons */}
          <div className="col-span-9 grid grid-cols-3 gap-2">
            <ActionButton onClick={() => runReport("current")}>Display Only(Current Student)</ActionButton>
            <ActionButton disabled={rows.length === 0}>Print Only(Current Student)</ActionButton>
            <ActionButton onClick={() => runReport("zero-balance")}>Display Student(With Zero Bal.)</ActionButton>
            <ActionButton disabled={rows.length === 0}>Print Student(With Zero Bal.)</ActionButton>
            <ActionButton onClick={exportToExcel} disabled={rows.length === 0}>Export to Excel</ActionButton>
            <ActionButton onClick={() => runReport("left-only")}>Display Left Student</ActionButton>
            <ActionButton disabled={rows.length === 0}>Print left Students</ActionButton>
            <ActionButton>Close</ActionButton>
            <ActionButton onClick={() => runReport("with-left")}>Display All Students(Current + Left)</ActionButton>
            <ActionButton disabled={rows.length === 0}>Print All Students(Current+Left)</ActionButton>
          </div>

          {/* Fee category checklist */}
          <div className="col-span-3 bg-white/90 border border-gray-300 rounded p-2 max-h-48 overflow-y-auto">
            <label className="flex items-center gap-1 text-[13px] font-semibold text-gray-800 border-b pb-1 mb-1">
              <input type="checkbox" checked={checkAll} onChange={(e) => toggleCheckAll(e.target.checked)} /> Check All
            </label>
            {feeCategories.map((fc) => (
              <label key={fc} className="flex items-center gap-1 text-[12px] text-gray-800">
                <input type="checkbox" checked={selectedFeeCategories.includes(fc)} onChange={() => toggleFeeCategory(fc)} /> {fc}
              </label>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-between text-[13px] font-semibold mt-4 text-gray-900 px-2">
          <span>Total Debits : {totalDebit}</span>
          <span>Total Credits : {totalCredit}</span>
          <span>Balance : {balance}</span>
          <span>Total Students : {rows.length}</span>
        </div>

        {/* Grid */}
        <div className="bg-white border border-gray-300 rounded shadow-sm mt-2 p-2 min-h-[300px]">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-10">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No data — choose filters and run a report.</p>
          ) : (
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-2 text-gray-900">ID No</th>
                  <th className="text-left py-2 text-gray-900">Student Name</th>
                  <th className="text-left py-2 text-gray-900">Father Name</th>
                  <th className="text-left py-2 text-gray-900">Category</th>
                  <th className="text-left py-2 text-gray-900">Course</th>
                  <th className="text-right py-2 text-gray-900">Credit</th>
                  <th className="text-right py-2 text-gray-900">Debit</th>
                  <th className="text-right py-2 text-gray-900">Balance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={`${row.IDNo}-${i}`} className="border-b border-gray-200">
                    <td className="py-2 text-gray-900">{row.IDNo}</td>
                    <td className="py-2 text-blue-700">{row.StudentName}</td>
                    <td className="py-2 text-gray-900">{row.FatherName}</td>
                    <td className="py-2 text-gray-900">{row.Category}</td>
                    <td className="py-2 text-gray-900">{row.Course}</td>
                    <td className="py-2 text-right text-gray-900">{row.Credit}</td>
                    <td className="py-2 text-right text-gray-900">{row.Debit}</td>
                    <td className="py-2 text-right text-gray-900">{row.Balance}</td>
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

function Field({ label, span, children }: { label: string; span: number; children: React.ReactNode }) {
  return (
    <div className={`col-span-${span} flex items-center gap-2`}>
      {label && <label className="w-20 shrink-0 font-semibold text-[12px] text-gray-800">{label}</label>}
      <div className="flex-1">{children}</div>
    </div>
  );
}

function ActionButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-blue-600 text-white font-semibold text-[11px] px-2 h-10 rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}