"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import {
  fetchCourses,
  fetchBatches,
  fetchReport,
  clearReport,
} from "@/store/slices/pendingRegistrationFeeSlice";

export default function PendingRegistrationFeePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { courses, batches, rows, totalRecords, loading, error } = useSelector(
    (state: RootState) => state.pendingRegistrationFee
  );

  const [colleges, setColleges] = useState<string[]>([]);
  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
  }, []);

  const handleCollegeChange = (value: string) => {
    setCollegeName(value);
    setCourse("");
    setBatch("");
    if (value) {
      dispatch(fetchCourses(value));
      dispatch(fetchBatches(value));
    }
  };

  const handleShow = () => {
    if (!collegeName) {
      setFormError("Please Select College");
      return;
    }
    setFormError(null);
    setHasSearched(true);
    dispatch(fetchReport({ collegeName, course: course || undefined, batch: batch || undefined }));
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
      <div className="max-w-6xl mx-auto">
        <fieldset className="border border-gray-300 rounded bg-white/80 p-4">
          <legend className="px-1 text-[13px] font-semibold text-gray-800">Search</legend>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <label className="w-24 font-semibold text-[13px] text-gray-800">College Name</label>
              <select value={collegeName} onChange={(e) => handleCollegeChange(e.target.value)} className={selectCls}>
                <option value="">-- Select --</option>
                {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-16 font-semibold text-[13px] text-gray-800">Course</label>
              <select value={course} onChange={(e) => setCourse(e.target.value)} disabled={!collegeName} className={selectCls}>
                <option value="">-- All --</option>
                {courses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-16 font-semibold text-[13px] text-gray-800">Batch</label>
              <select value={batch} onChange={(e) => setBatch(e.target.value)} disabled={!collegeName} className={selectCls}>
                <option value="">-- All --</option>
                {batches.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </fieldset>

        {formError && (
          <p className="text-red-600 text-[13px] font-medium mt-2 text-center">{formError}</p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="border border-gray-400 rounded px-3 py-1.5 bg-white/90 font-semibold text-[13px] text-gray-900">
            Total Records : {hasSearched ? totalRecords : 0}
          </div>
          <div className="flex gap-3">
            <button onClick={handleShow} className={btnCls}>Show</button>
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
              {hasSearched ? "No Record Found" : "Choose a college and click Show."}
            </p>
          ) : (
            <table className="w-full border-collapse text-[12px]">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-2 px-2 text-gray-900">Registration No</th>
                  <th className="text-left py-2 px-2 text-gray-900">Course</th>
                  <th className="text-left py-2 px-2 text-gray-900">Batch</th>
                  <th className="text-left py-2 px-2 text-gray-900">Student Name</th>
                  <th className="text-left py-2 px-2 text-gray-900">Father Name</th>
                  <th className="text-right py-2 px-2 text-gray-900">Debit</th>
                  <th className="text-right py-2 px-2 text-gray-900">Credit</th>
                  <th className="text-right py-2 px-2 text-gray-900">Balance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={`${row.RegistrationNo}-${i}`} className="border-b border-gray-200">
                    <td className="py-1.5 px-2 text-blue-700">{row.RegistrationNo}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.Course}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.Batch}</td>
                    <td className="py-1.5 px-2 text-blue-700">{row.StudentName}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.FatherName}</td>
                    <td className="py-1.5 px-2 text-right text-gray-900">{row.Debit}</td>
                    <td className="py-1.5 px-2 text-right text-gray-900">{row.Credit}</td>
                    <td className="py-1.5 px-2 text-right text-gray-900">{row.Balance}</td>
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

const selectCls = "flex-1 border border-gray-300 h-8 px-2 rounded text-[12px] bg-white text-gray-900 disabled:bg-gray-100";
const btnCls = "bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed";