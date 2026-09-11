"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import type { AppDispatch, RootState } from "../../../store/store";
import {
  fetchColleges,
  fetchCourses,
  fetchBatches,
  fetchSemesters,
  fetchAllDebitRecords,
  clearCourses,
  clearBatches,
  clearSemesters,
} from "../../../store/slices/Alldebitrecordslice";

export default function AllDebitRecordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { colleges, courses, batches, semesters, records, loading, error } = useSelector(
    (state: RootState) => state.allDebitRecord
  );

  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [semester, setSemester] = useState("");
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Mirrors frmalldebitrecord_Load -> preload colleges.
  useEffect(() => {
    dispatch(fetchColleges());
  }, [dispatch]);

  // Mirrors cmbcollege selection driving Course/Batch/Semester reloads.
  useEffect(() => {
    if (collegeName) {
      dispatch(fetchCourses(collegeName));
      dispatch(fetchBatches(collegeName));
    } else {
      dispatch(clearCourses());
      dispatch(clearBatches());
    }
    setCourse("");
    setBatch("");
    setSemester("");
    dispatch(clearSemesters());
  }, [collegeName, dispatch]);

  // Semester list is scoped by college/course/batch (mirrors cmbsem being tied to selection)
  useEffect(() => {
    if (collegeName) {
      dispatch(fetchSemesters({ collegeName, course: course || undefined, batch: batch || undefined }));
    }
  }, [collegeName, course, batch, dispatch]);

  // Mirrors btnShow_Click -> Display4(), including its validation order.
  const handleShow = () => {
    if (!collegeName) {
      alert("Please Select College First");
      return;
    }
    if (!batch) {
      alert("Please Select Batch First");
      return;
    }
    if (!course) {
      alert("Please Select Course First");
      return;
    }
    if (!semester) {
      alert("Please Select Semester First");
      return;
    }
    dispatch(fetchAllDebitRecords({ collegeName, course, batch, semester }));
  };

  const columns = useMemo(() => records?.columns ?? [], [records]);

  // Mirrors btnExport_Click, using client-side SheetJS instead of Excel COM interop.
  const handleExport = () => {
    if (!records || records.rows.length === 0) {
      alert("No record Found");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(records.rows, { header: columns });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AllDebitRecord");
    XLSX.writeFile(workbook, `AllDebitRecord_${collegeName || "export"}.xlsx`);
  };

  // Mirrors btnClose_Click
  const handleClose = () => {
    if (window.confirm("Are you sure to exit?")) {
      router.back();
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-100 p-3">
      {/* Search panel */}
      <fieldset className="mb-3 rounded border border-slate-400 bg-white p-3">
        <legend className="px-1 text-sm font-semibold text-slate-700">Search</legend>

        <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-700">College Name</label>
            <select
              className="rounded border border-slate-400 px-2 py-1 text-sm"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            >
              <option value="">Select</option>
              {colleges.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-700">Course</label>
            <select
              className="rounded border border-slate-400 px-2 py-1 text-sm"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={!collegeName}
            >
              <option value="">Select</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-700">Batch</label>
            <select
              className="rounded border border-slate-400 px-2 py-1 text-sm"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              disabled={!collegeName}
            >
              <option value="">Select</option>
              {batches.map((b) => (
                <option key={String(b)} value={String(b)}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-700">Semester</label>
            <select
              className="rounded border border-slate-400 px-2 py-1 text-sm"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              disabled={!collegeName}
            >
              <option value="">Select</option>
              {semesters.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleShow}
            disabled={loading}
            className="rounded bg-blue-700 px-5 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Show"}
          </button>
          <button
            onClick={handleExport}
            className="rounded border border-slate-500 bg-gradient-to-b from-slate-50 to-slate-200 px-4 py-1.5 text-sm font-medium text-slate-800 shadow hover:from-slate-100 hover:to-slate-300"
          >
            Export To Excel
          </button>
          <button
            onClick={handleClose}
            className="rounded border border-slate-500 bg-gradient-to-b from-slate-50 to-slate-200 px-4 py-1.5 text-sm font-medium text-slate-800 shadow hover:from-slate-100 hover:to-slate-300"
          >
            Close
          </button>
        </div>
      </fieldset>

      {/* Total records + error */}
      <div className="mb-2 flex items-center justify-between rounded border border-slate-400 bg-white px-3 py-2">
        <span className="font-semibold text-slate-800">
          Total Records : {records?.totalRecords ?? 0}
        </span>
      </div>

      {error && (
        <div className="mb-2 rounded border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto rounded border border-slate-400 bg-white">
        <table className="min-w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-8 border border-slate-300 bg-slate-100" />
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap border border-slate-300 bg-blue-100 px-2 py-1.5 text-left font-semibold text-slate-800"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records?.rows.map((row, idx) => (
              <tr
                key={`${row.IDNo}-${idx}`}
                onClick={() => setSelectedRow(idx)}
                className={
                  idx === selectedRow
                    ? "bg-blue-600 text-white"
                    : idx % 2 === 0
                    ? "bg-white"
                    : "bg-slate-50 hover:bg-blue-50"
                }
              >
                <td className="border border-slate-200 text-center">
                  {idx === selectedRow ? "\u25B6" : ""}
                </td>
                {columns.map((col) => (
                  <td key={col} className="whitespace-nowrap border border-slate-200 px-2 py-1">
                    {row[col] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}
            {(!records || records.rows.length === 0) && !loading && (
              <tr>
                <td colSpan={columns.length + 1} className="p-6 text-center text-sm text-slate-500">
                  No records to display. Select a college and click Show.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}