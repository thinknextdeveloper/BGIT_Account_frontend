"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchColleges,
  fetchCourses,
  fetchBatches,
  fetchSemesters,
  fetchSubHeads,
  fetchSessions,
  fetchReport,
  clearReport,
  clearCourseBatchSemester,
} from "@/store/slices/customSubLedgersSlice";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
}

export default function CustomSubLedgersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { colleges, courses, batches, semesters, subHeads, sessions, report, loading, error } =
    useSelector((state: RootState) => state.customSubLedgers);

  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [semester, setSemester] = useState("");
  const [session, setSession] = useState("");
  const [allSubLedgers, setAllSubLedgers] = useState(true);
  const [checkedHeads, setCheckedHeads] = useState<string[]>([]);
  const [betweenDates, setBetweenDates] = useState(false);
  const [dateFrom, setDateFrom] = useState(todayISO());
  const [dateTo, setDateTo] = useState(todayISO());
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchColleges());
    dispatch(fetchSessions());
  }, [dispatch]);

  // Mirrors cmbcollege_SelectedIndexChanged: reload Course/Batch/Semester/
  // SubHeads whenever college changes, and reset selections.
  useEffect(() => {
    setCourse("");
    setBatch("");
    setSemester("");
    setCheckedHeads([]);
    dispatch(clearCourseBatchSemester());
    if (college) {
      dispatch(fetchCourses(college));
      dispatch(fetchBatches(college));
      dispatch(fetchSemesters(college));
      dispatch(fetchSubHeads(college));
    }
  }, [college, dispatch]);

  // Mirrors chkSubLedgers_CheckedChanged.
  useEffect(() => {
    if (allSubLedgers) setCheckedHeads(subHeads);
  }, [allSubLedgers, subHeads]);

  const toggleHead = (head: string) => {
    setAllSubLedgers(false);
    setCheckedHeads((prev) =>
      prev.includes(head) ? prev.filter((h) => h !== head) : [...prev, head]
    );
  };

  const handleDisplay = () => {
    // Same validation as btnDisplay_Click.
    if (!college) return setFormError("Please Specify College ");
    if (checkedHeads.length === 0) return setFormError("Please specify Sub Ledger");
    setFormError(null);
    dispatch(clearReport());
    const params: Parameters<typeof fetchReport>[0] = {
      college,
      subHeads: checkedHeads,
    };
    if (course) params.course = course;
    if (batch) params.batch = batch;
    if (semester) params.semester = semester;
    if (session) params.session = session;
    if (betweenDates) {
      params.dateFrom = dateFrom;
      params.dateTo = dateTo;
    }
    dispatch(fetchReport(params));
  };

  const handleExport = async () => {
    if (!report || report.rows.length === 0) return;
    const XLSX = await import("xlsx");
    const header = ["DateEntry", "ReceiptNo", "IDNo", "ClassRollNo", "UniRollNo", "StudentName", "FatherName", ...report.subHeads, "Total"];
    const dataRows = report.rows.map((r) => [
      formatDate(r.DateEntry),
      r.ReceiptNo,
      r.IDNo,
      r.ClassRollNo ?? "",
      r.UniRollNo ?? "",
      r.StudentName,
      r.FatherName,
      ...report.subHeads.map((h) => r.amounts[h] ?? 0),
      r.total,
    ]);
    const totalRow = ["", "", "", "", "", "", "Total", ...report.subHeads.map((h) => report.columnTotals[h] ?? 0), report.grandTotal];
    const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows, totalRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SubLedgers");
    XLSX.writeFile(wb, `SubLedgers_${college}_${todayISO()}.xlsx`);
  };

  const handleClose = () => {
    setCollege("");
    setFormError(null);
    dispatch(clearReport());
  };

  return (
    <div
      className="min-h-screen p-4"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      <fieldset className="border border-blue-300 rounded bg-white/70 p-4 mb-4">
        <legend className="px-2 font-bold text-gray-800 text-[13px]">Search</legend>
        <div className="grid grid-cols-4 gap-x-6 gap-y-3 items-start">
          <div>
            <label className="block font-semibold text-[12px] text-gray-800 mb-1">College Name</label>
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
            >
              <option value="">-- Select --</option>
              {colleges.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[12px] text-gray-800 mb-1">Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={!college}
              className="w-full border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900 disabled:bg-gray-100"
            >
              <option value="">-- All --</option>
              {courses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[12px] text-gray-800 mb-1">Session</label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
            >
              <option value="">-- All --</option>
              {sessions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="row-span-3">
            <div className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={allSubLedgers}
                onChange={(e) => setAllSubLedgers(e.target.checked)}
              />
              <label className="font-semibold text-[12px] text-gray-800">All Sub Ledgers</label>
            </div>
            <div className="border border-gray-300 rounded bg-white h-32 overflow-y-auto px-2 py-1">
              {subHeads.length === 0 ? (
                <p className="text-[11px] text-gray-400 mt-2">Select a college first</p>
              ) : (
                subHeads.map((head) => (
                  <label key={head} className="flex items-center gap-2 text-[12px] text-gray-900 py-0.5">
                    <input
                      type="checkbox"
                      checked={checkedHeads.includes(head)}
                      onChange={() => toggleHead(head)}
                    />
                    {head}
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[12px] text-gray-800 mb-1">Batch</label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              disabled={!college}
              className="w-full border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900 disabled:bg-gray-100"
            >
              <option value="">-- All --</option>
              {batches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[12px] text-gray-800 mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              disabled={!college}
              className="w-full border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900 disabled:bg-gray-100"
            >
              <option value="">-- All --</option>
              {semesters.map((s,index) => (
                <option key={index} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="flex items-center gap-2 font-semibold text-[12px] text-gray-800">
            <input
              type="checkbox"
              checked={betweenDates}
              onChange={(e) => setBetweenDates(e.target.checked)}
            />
            Between Two Dates :
          </label>
          {betweenDates && (
            <div className="flex items-center gap-3 mt-2">
              <label className="text-[12px] text-gray-800">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
              />
              <label className="text-[12px] text-gray-800">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
              />
            </div>
          )}
        </div>

        {(formError || error) && (
          <p className="text-red-600 text-[12px] font-medium mt-3">{formError ?? error}</p>
        )}
      </fieldset>

      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-gray-900">
          Total Records : {report?.totalRecords ?? 0}
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleDisplay}
            disabled={loading}
            className="bg-blue-600 text-white font-semibold text-[13px] px-5 h-9 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Loading..." : "Display"}
          </button>
          <button
            onClick={handleExport}
            disabled={!report || report.rows.length === 0}
            className="bg-blue-600 text-white font-semibold text-[13px] px-5 h-9 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            Export To Excel
          </button>
          <button
            onClick={handleClose}
            className="bg-blue-600 text-white font-semibold text-[13px] px-5 h-9 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded overflow-auto max-h-[500px]">
        {report && report.rows.length > 0 ? (
          <table className="w-full text-[12px] border-collapse">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="border px-2 py-1 text-left text-gray-900">DateEntry</th>
                <th className="border px-2 py-1 text-left text-gray-900">ReceiptNo</th>
                <th className="border px-2 py-1 text-left text-gray-900">IDNo</th>
                <th className="border px-2 py-1 text-left text-gray-900">ClassRollNo</th>
                <th className="border px-2 py-1 text-left text-gray-900">UniRollNo</th>
                <th className="border px-2 py-1 text-left text-gray-900">StudentName</th>
                <th className="border px-2 py-1 text-left text-gray-900">FatherName</th>
                {report.subHeads.map((h) => (
                  <th key={h} className="border px-2 py-1 text-right text-gray-900">{h}</th>
                ))}
                <th className="border px-2 py-1 text-right text-gray-900 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r, i) => (
                <tr key={`${r.ReceiptNo}-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border px-2 py-1 text-blue-700">{formatDate(r.DateEntry)}</td>
                  <td className="border px-2 py-1 text-blue-700">{r.ReceiptNo}</td>
                  <td className="border px-2 py-1 text-gray-900">{r.IDNo}</td>
                  <td className="border px-2 py-1 text-gray-900">{r.ClassRollNo ?? ""}</td>
                  <td className="border px-2 py-1 text-gray-900">{r.UniRollNo ?? ""}</td>
                  <td className="border px-2 py-1 text-gray-900">{r.StudentName}</td>
                  <td className="border px-2 py-1 text-gray-900">{r.FatherName}</td>
                  {report.subHeads.map((h) => (
                    <td key={h} className="border px-2 py-1 text-right text-gray-900">{r.amounts[h] ?? 0}</td>
                  ))}
                  <td className="border px-2 py-1 text-right font-bold text-gray-900">{r.total}</td>
                </tr>
              ))}
              <tr className="bg-gray-200 font-bold">
                <td className="border px-2 py-1" colSpan={6}></td>
                <td className="border px-2 py-1 text-gray-900">Total</td>
                {report.subHeads.map((h) => (
                  <td key={h} className="border px-2 py-1 text-right text-gray-900">{report.columnTotals[h] ?? 0}</td>
                ))}
                <td className="border px-2 py-1 text-right text-gray-900">{report.grandTotal}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="h-[300px]" />
        )}
      </div>
    </div>
  );
}