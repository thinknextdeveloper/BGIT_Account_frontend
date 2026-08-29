"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import {
  fetchCourses,
  fetchBatches,
  fetchSemesters,
  fetchSessions,
  fetchSubLedgerHeads,
  fetchDisplay,
  clearReport,
} from "@/store/slices/feeSubLedgerSlice";

export default function FeeSubLedgerDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    courses, batches, semesters, sessions, subLedgerHeads,
    columns, rows, totalsRow, totalRecords, loading, error,
  } = useSelector((state: RootState) => state.feeSubLedger);

  const [colleges, setColleges] = useState<string[]>([]);
  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [allSubLedgers, setAllSubLedgers] = useState(false);
  const [subLedgerHead, setSubLedgerHead] = useState("");
  const [batch, setBatch] = useState("");
  const [semester, setSemester] = useState("");
  const [session, setSession] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [useDateFilter, setUseDateFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
    dispatch(fetchSessions());
  }, [dispatch]);

  const handleCollegeChange = (value: string) => {
    setCollegeName(value);
    setCourse("");
    setBatch("");
    setSemester("");
    setSubLedgerHead("");
    if (value) {
      dispatch(fetchCourses(value));
      dispatch(fetchBatches(value));
      dispatch(fetchSemesters(value));
      dispatch(fetchSubLedgerHeads(value));
    }
  };

  useEffect(() => {
    if (allSubLedgers) setSubLedgerHead("");
  }, [allSubLedgers]);

  const handleDisplay = () => {
    if (!collegeName) return setFormError("Please Specify College");
    if (!allSubLedgers && !subLedgerHead) return setFormError("Please specify SubLedger");
    if (allSubLedgers && subLedgerHead) return setFormError("Invalid Sub Ledger");
    if (!session) return setFormError("please specify session");

    setFormError(null);
    setHasSearched(true);
    dispatch(
      fetchDisplay({
        collegeName,
        course: course || undefined,
        batch: batch || undefined,
        semester: semester || undefined,
        session,
        receiptNo: receiptNo || undefined,
        dateFrom: useDateFilter ? dateFrom : undefined,
        dateTo: useDateFilter ? dateTo : undefined,
        allSubLedgers,
        subLedgerHead: subLedgerHead || undefined,
      })
    );
  };

  const handleExport = () => {
    if (!collegeName) return setFormError("Please Specify College");
    setFormError(null);
    const params = new URLSearchParams({
      collegeName,
      ...(course ? { course } : {}),
      ...(batch ? { batch } : {}),
      ...(semester ? { semester } : {}),
      ...(session ? { session } : {}),
      ...(receiptNo ? { receiptNo } : {}),
      ...(useDateFilter && dateFrom ? { dateFrom } : {}),
      ...(useDateFilter && dateTo ? { dateTo } : {}),
      ...(allSubLedgers ? { allSubLedgers: "true" } : {}),
      ...(subLedgerHead ? { subLedgerHead } : {}),
    });
    window.open(`/api/fee-subledger/export?${params.toString()}`, "_blank");
  };

  const handleClose = () => {
    setCollegeName("");
    setCourse("");
    setAllSubLedgers(false);
    setSubLedgerHead("");
    setBatch("");
    setSemester("");
    setSession("");
    setReceiptNo("");
    setUseDateFilter(false);
    setDateFrom("");
    setDateTo("");
    setHasSearched(false);
    setFormError(null);
    dispatch(clearReport());
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      <div className="max-w-5xl mx-auto">
        <fieldset className="border border-gray-300 rounded bg-white/80 p-4 space-y-3">
          <div className="flex items-center gap-4">
            <label className="w-32 font-semibold text-[13px] text-gray-800">College Name</label>
            <select value={collegeName} onChange={(e) => handleCollegeChange(e.target.value)} className={selectCls}>
              <option value="">-- Select --</option>
              {colleges.map((c,index) => <option key={index} value={c}>{c}</option>)}
            </select>

            <label className="w-20 font-semibold text-[13px] text-gray-800">Course</label>
            <select value={course} onChange={(e) => setCourse(e.target.value)} disabled={!collegeName} className={selectCls}>
              <option value="">-- Select --</option>
              {courses.map((c,index) => <option key={index} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="w-32 flex items-center gap-2 font-semibold text-[13px] text-gray-800">
              <input type="checkbox" checked={allSubLedgers} onChange={(e) => setAllSubLedgers(e.target.checked)} className={checkboxCls} />
              All Sub Ledgers
            </label>
            <select
              value={subLedgerHead}
              onChange={(e) => setSubLedgerHead(e.target.value)}
              disabled={!collegeName || allSubLedgers}
              className={selectCls}
            >
              <option value="">-- Select --</option>
              {subLedgerHeads.map((h,index) => <option key={index} value={h}>{h}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="w-32 font-semibold text-[13px] text-gray-800">Batch</label>
            <select value={batch} onChange={(e) => setBatch(e.target.value)} disabled={!collegeName} className={selectCls}>
              <option value="">-- Select --</option>
              {batches.map((b,index) => <option key={index} value={b}>{b}</option>)}
            </select>

            <label className="w-20 font-semibold text-[13px] text-gray-800">Semester</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} disabled={!collegeName} className={selectCls}>
              <option value="">-- Select --</option>
              {semesters.map((s,index) => <option key={index} value={s}>{s}</option>)}
            </select>

            <label className="w-20 font-semibold text-[13px] text-gray-800">Session</label>
            <select value={session} onChange={(e) => setSession(e.target.value)} className={selectCls}>
              <option value="">-- Select --</option>
              {sessions.map((s,index) => <option key={index} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="w-32 font-semibold text-[13px] text-gray-800">Receipt No.</label>
            <input
              type="text"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              className={`${selectCls} flex-none w-48`}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-40 flex items-center gap-2 font-semibold text-[13px] text-gray-800">
              <input type="checkbox" checked={useDateFilter} onChange={(e) => setUseDateFilter(e.target.checked)} className={checkboxCls} />
              Between Two Dates :
            </label>
            {useDateFilter && (
              <>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${selectCls} flex-none w-40`} />
                <span className="text-[13px] text-gray-800">to</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${selectCls} flex-none w-40`} />
              </>
            )}
          </div>
        </fieldset>

        {formError && <p className="text-red-600 text-[13px] font-medium mt-2 text-center">{formError}</p>}

        <div className="flex justify-center gap-4 mt-4">
          <button className={btnCls}>Button1</button>
          <button onClick={handleDisplay} className={btnCls}>Display</button>
          <button onClick={handleExport} className={btnCls}>Export to Excel</button>
          <button onClick={handleClose} className={btnCls}>Close</button>
        </div>

        <div className="mt-4 text-[13px] font-semibold text-gray-900">
          {hasSearched ? `Total Records : ${totalRecords}` : ""}
        </div>

        <div className="bg-white border border-gray-300 rounded shadow-sm mt-2 overflow-auto max-h-[60vh]">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-10">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              {hasSearched ? "No Record Found" : "Choose filters and click Display."}
            </p>
          ) : (
            <table className="w-full border-collapse text-[12px]">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-2 px-2 text-gray-900">Date Entry</th>
                  <th className="text-left py-2 px-2 text-gray-900">Receipt No</th>
                  <th className="text-left py-2 px-2 text-gray-900">ID No</th>
                  <th className="text-left py-2 px-2 text-gray-900">Class Roll No</th>
                  <th className="text-left py-2 px-2 text-gray-900">Uni Roll No</th>
                  <th className="text-left py-2 px-2 text-gray-900">Student Name</th>
                  <th className="text-left py-2 px-2 text-gray-900">Father Name</th>
                  <th className="text-left py-2 px-2 text-gray-900">Mode of Payment</th>
                  {columns.map((h,index) => (
                    <th key={index} className="text-right py-2 px-2 text-gray-900">{h}</th>
                  ))}
                  {columns.length > 0 && <th className="text-right py-2 px-2 text-gray-900">Total</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={`${row.ReceiptNo}-${i}`} className="border-b border-gray-200">
                    <td className="py-1.5 px-2 text-gray-900">
                      {row.DateEntry ? new Date(row.DateEntry).toLocaleDateString("en-GB") : ""}
                    </td>
                    <td className="py-1.5 px-2 text-gray-900">{row.ReceiptNo}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.IDNo}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.ClassRollNo ?? ""}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.UniRollNo ?? ""}</td>
                    <td className="py-1.5 px-2 text-blue-700">{row.StudentName}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.FatherName}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.ModeOfPayment ?? ""}</td>
                    {columns.map((h,index) => (
                      <td key={index} className="py-1.5 px-2 text-right text-gray-900">{row.heads[h] || 0}</td>
                    ))}
                    {columns.length > 0 && (
                      <td className="py-1.5 px-2 text-right font-semibold text-gray-900">{row.Total}</td>
                    )}
                  </tr>
                ))}
                {totalsRow && (
                  <tr className="border-t-2 border-gray-800 font-bold bg-gray-50">
                    <td colSpan={7} />
                    <td className="py-1.5 px-2">Total</td>
                    {columns.map((h,index) => (
                      <td key={index} className="py-1.5 px-2 text-right">{totalsRow.heads[h] || 0}</td>
                    ))}
                    <td className="py-1.5 px-2 text-right">{totalsRow.Total}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const selectCls = "flex-1 border border-gray-300 h-8 px-2 rounded text-[12px] bg-white text-gray-900 disabled:bg-gray-100";
const btnCls = "bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700";
const checkboxCls = "h-4 w-4";