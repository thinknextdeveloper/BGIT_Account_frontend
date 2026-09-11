"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import {
  fetchColleges,
  searchByName,
  clearResults,
  StudentNameSearchRow,
} from "@/store/slices/searchNameSlice";

export default function SearchNamePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { colleges: reduxColleges, results, loading } = useSelector(
    (state: RootState) => state.searchName
  );

  const [colleges, setColleges] = useState<string[]>([]);
  const [allColleges, setAllColleges] = useState(false);
  const [college, setCollege] = useState("");
  const [studentName, setStudentName] = useState("");
  const [searchType, setSearchType] = useState<"part" | "exact">("part");
  const [formError, setFormError] = useState<string | null>(null);

  const studentNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch colleges using existing API
    dispatch(fetchColleges());
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success && Array.isArray(res.data?.data)) {
        setColleges(res.data.data);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (reduxColleges && reduxColleges.length > 0) {
      setColleges(reduxColleges);
    }
  }, [reduxColleges]);

  const handleAllCollegesToggle = (checked: boolean) => {
    setAllColleges(checked);
    if (checked) {
      setCollege("");
    }
    setFormError(null);
  };

  const handleSearch = async () => {
    // Validation matching VB.NET logic
    if (!allColleges && !college) {
      setFormError("Please specify college name");
      return;
    }

    if (!studentName.trim()) {
      setFormError("Please specify student name");
      studentNameInputRef.current?.focus();
      return;
    }

    setFormError(null);
    dispatch(clearResults());

    const actionResult = await dispatch(
      searchByName({
        studentName: studentName.trim(),
        college: allColleges ? undefined : college,
        allColleges,
        searchType,
      })
    );

    if (searchByName.rejected.match(actionResult)) {
      const errMsg = String(actionResult.payload || "Sorry No record found");
      setFormError(errMsg);
      setStudentName("");
      studentNameInputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClose = () => {
    setStudentName("");
    setCollege("");
    setAllColleges(false);
    setSearchType("part");
    setFormError(null);
    dispatch(clearResults());
    studentNameInputRef.current?.focus();
  };

  const renderSafeText = (val: any) => {
    if (val === null || val === undefined) return "";
    return String(val);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 font-sans">
      {/* Title */}
      <h1 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
        Search By Student Name
      </h1>

      {/* Search Filter Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-5 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            {/* College Selector Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-gray-700 w-44">
                <input
                  type="checkbox"
                  checked={allColleges}
                  onChange={(e) => handleAllCollegesToggle(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                All Colleges
              </label>

              <select
                disabled={allColleges}
                value={college}
                onChange={(e) => {
                  setCollege(e.target.value);
                  setFormError(null);
                }}
                className={`flex-1 max-w-md px-3 py-2 border rounded-md text-sm outline-none transition-colors ${
                  allColleges
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              >
                <option value="">-- Select College --</option>
                {colleges.map((col, idx) => (
                  <option key={`${col}-${idx}`} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Name Input Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="text-sm font-semibold text-gray-700 w-44">
                Enter Student Name
              </label>
              <input
                ref={studentNameInputRef}
                type="text"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  setFormError(null);
                }}
                onKeyDown={handleKeyPress}
                placeholder="Enter Student Name"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Radio Selection: Part of Field vs Exact Phrase */}
            <div className="flex flex-wrap items-center gap-6 pt-1 sm:pl-48">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 select-none">
                <input
                  type="radio"
                  name="searchType"
                  value="part"
                  checked={searchType === "part"}
                  onChange={() => setSearchType("part")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                Part of the Field
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 select-none">
                <input
                  type="radio"
                  name="searchType"
                  value="exact"
                  checked={searchType === "exact"}
                  onChange={() => setSearchType("exact")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                Exact Phrase Only
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row md:flex-col gap-2 self-start md:self-auto">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition-colors flex items-center justify-center min-w-[90px] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Searching..." : "Find"}
            </button>
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition-colors min-w-[90px] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Error / Alert message */}
        {formError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center gap-2">
            <span>⚠️</span>
            <span>{formError}</span>
          </div>
        )}
      </div>

      {/* Total Records Header */}
      <div className="mb-2 text-sm font-bold text-gray-800">
        Total Records : {results?.length || 0}
      </div>

      {/* Results Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3 border-r border-gray-200">College Name</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Student Name</th>
                <th className="py-2.5 px-3 border-r border-gray-200">ID No</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Class</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Father Name</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Phone No</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Student Mobile No</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Father Mobile No</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Mother Mobile No</th>
                <th className="py-2.5 px-3 min-w-[300px]">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {results && results.length > 0 ? (
                results.map((row: StudentNameSearchRow, idx: number) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-2 px-3 border-r border-gray-200 font-medium text-gray-800">
                      {renderSafeText(row.CollegeName)}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200 font-medium text-blue-600">
                      {renderSafeText(row.StudentName)}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200 font-medium">
                      {renderSafeText(row.IDNo)}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      {renderSafeText(row.Class)}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      {renderSafeText(row.FatherName)}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      {renderSafeText(row.PhoneNo)}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      {renderSafeText(row.StudentMobileNo)}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      {renderSafeText(row.FatherMobileNo)}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      {renderSafeText(row.MotherMobileNo)}
                    </td>
                    <td className="py-2 px-3">
                      {renderSafeText(row.PermanentAddress)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-400">
                    {loading ? "Loading records..." : "No records to display"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
