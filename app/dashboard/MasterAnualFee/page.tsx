"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchColleges,
  fetchCourses,
  fetchBatches,
  fetchSemesters,
  fetchFeeStructure,
  saveFeeStructure,
  resetCourses,
  resetBatches,
  resetSemesters,
  updateFeeRow,
  addEmptyRow,
  FeeRow,
} from "@/store/slices/masterAnnualFeeSlice";

export default function MasterAnnualFeePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { colleges, courses, batches, semesters, feeRows, loading, saving } =
    useSelector((state: RootState) => state.masterAnnualFee);

  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [semester, setSemester] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    dispatch(fetchColleges());
  }, [dispatch]);

  const handleCollegeChange = (value: string) => {
    setCollegeName(value);
    setCourse("");
    setBatch("");
    setSemester("");
    setHasSearched(false);
    dispatch(resetCourses());
    if (value) dispatch(fetchCourses(value));
  };

  const handleCourseChange = (value: string) => {
    setCourse(value);
    setBatch("");
    setSemester("");
    setHasSearched(false);
    dispatch(resetBatches());
    if (value) dispatch(fetchBatches({ collegeName, course: value }));
  };

  const handleBatchChange = (value: string) => {
    setBatch(value);
    setSemester("");
    setHasSearched(false);
    dispatch(resetSemesters());
    if (value) dispatch(fetchSemesters({ collegeName, course, batch: value }));
  };

  const handleDisplay = () => {
    if (!collegeName || !course || !batch || !semester) return;
    setHasSearched(true);
    dispatch(fetchFeeStructure({ collegeName, course, batch, semester }));
  };

  const handleRowChange = (index: number, field: keyof FeeRow, value: string | number) => {
    dispatch(updateFeeRow({ index, field, value }));
  };

  // const handleAddRow = () => {
  //   dispatch(
  //     addEmptyRow({
  //       CollegeName: collegeName,
  //       Course: course,
  //       Batch: Number(batch),
  //       Semester: semester,
  //       Category: "",
  //       ModeOfAdmission: "",
  //       Scheme: "",
  //       Head: "",
  //       Amount: 0,
  //     })
  //   );
  // };


  const handleAddRow = () => {
  dispatch(
    addEmptyRow({
      CollegeName: collegeName,
      Course: course,
      Batch: Number(batch),
      Semester: semester,
      Category: "",
      ModeOfAdmission: "",
      Scheme: "",
      Head: "",
      Amount: 0,
      isNew: true,
    })
  );
};


const handleSave = async () => {
  console.log("feeRows before save:", feeRows);
const newRows = feeRows.filter((row) => row.isNew);

if (newRows.length === 0) {
  alert("No new records to save.");
  return;
}

await dispatch(saveFeeStructure(newRows));
handleDisplay();
  // await dispatch(saveFeeStructure(feeRows));
  // handleDisplay();
};

  return (
    <div className="p-4 text-gray-900">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-4">
        <div className="flex items-center gap-3">
          <label className="w-28 font-semibold text-sm text-gray-900">College Name :</label>
          <select
            value={collegeName}
            onChange={(e) => handleCollegeChange(e.target.value)}
            className="flex-1 border border-gray-400 rounded px-2 py-1.5 bg-white text-gray-900"
          >
            <option value="">-- Select --</option>
            {colleges.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-28 font-semibold text-sm text-gray-900">Course :</label>
          <select
            value={course}
            onChange={(e) => handleCourseChange(e.target.value)}
            disabled={!collegeName}
            className="flex-1 border border-gray-400 rounded px-2 py-1.5 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">-- Select --</option>
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-28 font-semibold text-sm text-gray-900">Batch :</label>
          <select
            value={batch}
            onChange={(e) => handleBatchChange(e.target.value)}
            disabled={!course}
            className="flex-1 border border-gray-400 rounded px-2 py-1.5 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">-- Select --</option>
            {batches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-28 font-semibold text-sm text-gray-900">Semester :</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            disabled={!batch}
            className="flex-1 border border-gray-400 rounded px-2 py-1.5 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">-- Select --</option>
            {semesters.map((s) => (
              <option key={s.semesterId} value={s.semester}>
                {s.semester}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleDisplay}
        disabled={!semester}
        className="bg-blue-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50 mb-4"
      >
        Display
      </button>

      <p className="text-sm font-semibold mb-2 text-gray-900">Total Records : {feeRows.length}</p>

      {/* Grid or empty state */}
      {hasSearched && !loading && feeRows.length === 0 ? (
        <div className="border border-gray-400 rounded py-10 text-center text-gray-500 bg-gray-50">
          No records found for this selection.
        </div>
      ) : (
        <div className="border border-gray-400 overflow-auto">
          <table className="w-full text-sm text-gray-900">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-2 py-1 text-left text-gray-900">Course</th>
                <th className="border px-2 py-1 text-left text-gray-900">Batch</th>
                <th className="border px-2 py-1 text-left text-gray-900">Semester</th>
                <th className="border px-2 py-1 text-left text-gray-900">Category</th>
                <th className="border px-2 py-1 text-left text-gray-900">Mode Of Admission</th>
                <th className="border px-2 py-1 text-left text-gray-900">Scheme</th>
                <th className="border px-2 py-1 text-left text-gray-900">Head</th>
                <th className="border px-2 py-1 text-left text-gray-900">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : (
                feeRows.map((row, index) => (
                  <tr key={index}>
                    <td className="border px-2 py-1 text-blue-700 font-medium">{row.Course}</td>
                    <td className="border px-2 py-1 text-gray-900">{row.Batch}</td>
                    <td className="border px-2 py-1 text-gray-900">{row.Semester}</td>
                    <td className="border px-2 py-1">
                      <input
                        value={row.Category}
                        onChange={(e) => handleRowChange(index, "Category", e.target.value)}
                        className="w-full outline-none bg-transparent text-gray-900"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        value={row.ModeOfAdmission}
                        onChange={(e) => handleRowChange(index, "ModeOfAdmission", e.target.value)}
                        className="w-full outline-none bg-transparent text-gray-900"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        value={row.Scheme}
                        onChange={(e) => handleRowChange(index, "Scheme", e.target.value)}
                        className="w-full outline-none bg-transparent text-gray-900"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        value={row.Head}
                        onChange={(e) => handleRowChange(index, "Head", e.target.value)}
                        className="w-full outline-none bg-transparent text-gray-900"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={row.Amount}
                        onChange={(e) =>
                          handleRowChange(index, "Amount", Number(e.target.value))
                        }
                        className="w-full outline-none bg-transparent text-gray-900"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={handleAddRow}
        disabled={!semester}
        className="mt-2 text-sm text-blue-700 underline disabled:opacity-50"
      >
        + Add Row
      </button>

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSave}
          disabled={saving || feeRows.length === 0}
          className="bg-blue-700 text-white px-8 py-2 rounded font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button className="bg-gray-500 text-white px-8 py-2 rounded font-semibold">
          Close
        </button>
      </div>
    </div>
  );
}