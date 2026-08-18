"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import {
  fetchHostelNames,
  fetchSessions,
  fetchCourses,
  fetchBatches,
  fetchHostelReport,
  fetchHostelPendingReport,
  clearReport,
} from "@/store/slices/HostelReportSlice";

export default function HostelReportPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { hostelNames, sessions, courses, batches, rows, totalCredit, totalDebit, balance, loading, error } =
    useSelector((state: RootState) => state.hostelReport);

  const [colleges, setColleges] = useState<string[]>([]);
  const [session, setSession] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [hostelName, setHostelName] = useState("");
  const [idType, setIdType] = useState<"registrationNo" | "idNo">("idNo");
  const [showReport, setShowReport] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
    dispatch(fetchHostelNames());
    dispatch(fetchSessions());
  }, [dispatch]);

  const handleCollegeChange = (value: string) => {
    setCollegeName(value);
    setCourse("");
    setBatch("");
    if (value) {
      dispatch(fetchCourses(value));
      dispatch(fetchBatches(value));
    }
  };

  const runReport = (thunk: typeof fetchHostelReport, title: string) => {
    if (!hostelName) {
      setFormError("Please Select Hostel Name");
      return;
    }
    setFormError(null);
    setReportTitle(title);
    setShowReport(true);
    dispatch(
      thunk({
        collegeName: collegeName || undefined,
        course: course || undefined,
        batch: batch || undefined,
        session: session || undefined,
        hostelName,
      })
    );
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      {!showReport ? (
        <div className="max-w-2xl mx-auto mt-24">
          <fieldset className="border border-gray-300 rounded bg-white/80 p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="w-28 font-semibold text-[13px] text-gray-800">Session</label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900"
                >
                  <option value="">-- All --</option>
                  {sessions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-[13px] text-gray-800">College Name</label>
                  <select
                    value={collegeName}
                    onChange={(e) => handleCollegeChange(e.target.value)}
                    className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900"
                  >
                    <option value="">-- All --</option>
                    {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-[13px] text-gray-800">Course</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    disabled={!collegeName}
                    className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900 disabled:bg-gray-100"
                  >
                    <option value="">-- All --</option>
                    {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-[13px] text-gray-800">Batch</label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    disabled={!collegeName}
                    className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900 disabled:bg-gray-100"
                  >
                    <option value="">-- All --</option>
                    {batches.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-[13px] text-gray-800">Hostel Name</label>
                  <select
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                    className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900"
                  >
                    <option value="">-- Select --</option>
                    {hostelNames.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 pt-1">
                <label className="flex items-center gap-1 text-[13px] font-semibold text-gray-800">
                  <input type="radio" checked={idType === "registrationNo"} onChange={() => setIdType("registrationNo")} />
                  Registration No.
                </label>
                <label className="flex items-center gap-1 text-[13px] font-semibold text-gray-800">
                  <input type="radio" checked={idType === "idNo"} onChange={() => setIdType("idNo")} />
                  ID No.
                </label>
              </div>
            </div>
          </fieldset>

          {formError && (
            <p className="text-red-600 text-[13px] font-medium mt-2 text-center">{formError}</p>
          )}

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => runReport(fetchHostelReport, "Hostel Report")}
              className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700"
            >
              View Report
            </button>
            <button
              onClick={() => runReport(fetchHostelPendingReport as any, "Hostel Report (Pending Fee)")}
              className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700"
            >
              Print Pending
            </button>
            <button className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded shadow-sm p-6 max-w-5xl mx-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-10">{error}</p>
          ) : (
            <>
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {collegeName || "All Privileged Colleges"}
                </h1>
                <h2 className="text-lg font-bold underline mt-2 text-gray-900">{reportTitle}</h2>
              </div>

              <div className="flex flex-wrap justify-between gap-2 text-[13px] font-semibold mb-2 text-gray-900">
                <span>Hostel Name : {hostelName}</span>
                <span>Session : {session || "All"}</span>
                <span>Total Students : {rows.length}</span>
              </div>

              {reportTitle === "Hostel Report" && (
                <div className="flex justify-end gap-6 text-[13px] font-semibold mb-2 text-gray-900">
                  <span>Total Credit : {totalCredit}</span>
                  <span>Total Debit : {totalDebit}</span>
                  <span>Balance : {balance}</span>
                </div>
              )}

              <table className="w-full border-collapse text-[12px] mt-2">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2 text-gray-900">ID No</th>
                    <th className="text-left py-2 text-gray-900">Registration No</th>
                    <th className="text-left py-2 text-gray-900">Uni. Roll No.</th>
                    <th className="text-left py-2 text-gray-900">Class</th>
                    <th className="text-left py-2 text-gray-900">Student Name</th>
                    <th className="text-left py-2 text-gray-900">Room Type</th>
                    <th className="text-left py-2 text-gray-900">Room No</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={`${row.IDNo}-${i}`} className="border-b border-gray-200">
                      <td className="py-2 text-gray-900">{row.IDNo}</td>
                      <td className="py-2 text-gray-900">{row.RegistrationNo ?? ""}</td>
                      <td className="py-2 text-gray-900">{row.UniRollNo ?? ""}</td>
                      <td className="py-2 text-blue-700">{row.Class}</td>
                      <td className="py-2 text-blue-700">{row.StudentName}</td>
                      <td className="py-2 text-gray-900">{row.RoomType ?? ""}</td>
                      <td className="py-2 text-gray-900">{row.RoomNo ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => { setShowReport(false); dispatch(clearReport()); }}
                  className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}