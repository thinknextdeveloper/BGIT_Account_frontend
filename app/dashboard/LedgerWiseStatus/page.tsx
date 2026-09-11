"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchCollegesForLedger,
  fetchCourses,
  fetchBatches,
  fetchSessions,
  fetchDisplay,
  fetchPendingFeeOnly,
  clearResults,
} from "@/store/slices/ledgerwiseStatusSlice";

export default function LedgerwiseStatusPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    colleges,
    courses,
    batches,
    sessions,
    rows,
    totalDebits,
    totalCredits,
    balance,
    loading,
    error,
  } = useSelector((state: RootState) => state.ledgerwiseStatus);

  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [session, setSession] = useState("");
  const [betweenTwoDates, setBetweenTwoDates] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [mode, setMode] = useState<"registration" | "idno">("idno");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCollegesForLedger());
    dispatch(fetchSessions());
  }, [dispatch]);

  const handleCollegeChange = (value: string) => {
    setCollegeName(value);
    setCourse("");
    setBatch("");
    dispatch(clearResults());
    if (value) dispatch(fetchCourses(value));
  };

  const handleCourseChange = (value: string) => {
    setCourse(value);
    setBatch("");
    if (collegeName) dispatch(fetchBatches(collegeName));
  };

  const buildParams = () => ({
    collegeName,
    course: course || undefined,
    batch: batch || undefined,
    session: session || undefined,
    dateFrom: betweenTwoDates ? dateFrom : undefined,
    dateTo: betweenTwoDates ? dateTo : undefined,
    mode,
  });

  const handleDisplay = () => {
    if (!collegeName) {
      setFormError("Please Select College");
      return;
    }
    setFormError(null);
    dispatch(fetchDisplay(buildParams()));
  };

  const handlePrintPendingFee = () => {
    if (!collegeName) {
      setFormError("Please Select College");
      return;
    }
    setFormError(null);
    dispatch(fetchPendingFeeOnly(buildParams()));
  };

  const handleClose = () => {
    setCollegeName("");
    setCourse("");
    setBatch("");
    setSession("");
    setBetweenTwoDates(false);
    setDateFrom("");
    setDateTo("");
    setMode("idno");
    setFormError(null);
    dispatch(clearResults());
  };

  const idColumnLabel = mode === "registration" ? "Registration No." : "ID No.";
  const secondColumnLabel = mode === "registration" ? "ID No." : "Class Roll No.";

  return (
    <div
      className="min-h-screen p-4"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      <div className="flex justify-between items-start gap-4">
        <fieldset className="border border-gray-300 rounded bg-white/80 p-4 flex-1">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <label className="w-16 font-semibold text-[13px] text-gray-800">College</label>
              <select
                value={collegeName}
                onChange={(e) => handleCollegeChange(e.target.value)}
                className="flex-1 border border-gray-400 h-8 px-2 rounded text-[13px] bg-white text-gray-900"
              >
                <option value="">--Select--</option>
                {colleges.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-16 font-semibold text-[13px] text-gray-800">Course</label>
              <select
                value={course}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="flex-1 border border-gray-400 h-8 px-2 rounded text-[13px] bg-white text-gray-900"
              >
                <option value="">--Select--</option>
                {courses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-16 font-semibold text-[13px] text-gray-800">Batch</label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="flex-1 border border-gray-400 h-8 px-2 rounded text-[13px] bg-white text-gray-900"
              >
                <option value="">--Select--</option>
                {batches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-16 font-semibold text-[13px] text-gray-800">Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="flex-1 border border-gray-400 h-8 px-2 rounded text-[13px] bg-white text-gray-900"
              >
                <option value="">--Select--</option>
                {sessions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4 flex-wrap">
            <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
              <input
                type="checkbox"
                checked={betweenTwoDates}
                onChange={(e) => setBetweenTwoDates(e.target.checked)}
              />
              Between Two Dates
            </label>

            {betweenTwoDates && (
              <>
                <label className="flex items-center gap-2 text-[13px] text-gray-800">
                  From
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="border border-gray-400 h-8 px-2 rounded text-[13px]"
                  />
                </label>
                <label className="flex items-center gap-2 text-[13px] text-gray-800">
                  To
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="border border-gray-400 h-8 px-2 rounded text-[13px]"
                  />
                </label>
              </>
            )}

            <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
              <input
                type="radio"
                checked={mode === "registration"}
                onChange={() => setMode("registration")}
              />
              Registration
            </label>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
              <input
                type="radio"
                checked={mode === "idno"}
                onChange={() => setMode("idno")}
              />
              ID No.
            </label>

            <button
              onClick={handleDisplay}
              disabled={loading}
              className="ml-auto bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Display"}
            </button>
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700">
              Print
            </button>
            <button
              onClick={handleClose}
              className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
          <button
            onClick={handlePrintPendingFee}
            disabled={loading}
            className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Print Pending Fee Only
          </button>
        </div>
      </div>

      {(formError || error) && (
        <p className="text-red-600 text-[13px] font-medium mt-3">{formError || error}</p>
      )}

      <div className="flex justify-start gap-10 mt-4 text-[13px] font-semibold text-gray-900">
        <span>Total Debits : {totalDebits}</span>
        <span>Total Credits : {totalCredits}</span>
        <span>Balance : {balance}</span>
      </div>

      <div
        className="mt-3 bg-gray-100 border border-gray-400 rounded p-2 overflow-auto"
        style={{ minHeight: 400 }}
      >
        {rows.length > 0 ? (
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left py-2 px-1 text-gray-900">{idColumnLabel}</th>
                <th className="text-left py-2 px-1 text-gray-900">{secondColumnLabel}</th>
                <th className="text-left py-2 px-1 text-gray-900">Student Name</th>
                <th className="text-left py-2 px-1 text-gray-900">Father Name</th>
                <th className="text-left py-2 px-1 text-gray-900">Ledger Name</th>
                <th className="text-right py-2 px-1 text-gray-900">Debit</th>
                <th className="text-right py-2 px-1 text-gray-900">Credit</th>
                <th className="text-right py-2 px-1 text-gray-900">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-300 bg-white">
                  <td className="py-1 px-1 text-gray-900">
                    {mode === "registration" ? row.RegistrationNo : row.IDNo}
                  </td>
                  <td className="py-1 px-1 text-gray-900">
                    {mode === "registration" ? row.IDNo : row.ClassRollNo}
                  </td>
                  <td className="py-1 px-1 text-gray-900">{row.StudentName}</td>
                  <td className="py-1 px-1 text-gray-900">{row.FatherName}</td>
                  <td className="py-1 px-1 text-gray-900">{row.LedgerName}</td>
                  <td className="py-1 px-1 text-right text-gray-900">{row.Debit}</td>
                  <td className="py-1 px-1 text-right text-gray-900">{row.Credit}</td>
                  <td className="py-1 px-1 text-right text-gray-900">{row.Balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}