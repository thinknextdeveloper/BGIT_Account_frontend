"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import {
  fetchColleges,
  searchFacultyByIDNo,
  clearResults,
  FacultyRow,
} from "@/store/slices/searchFacultyIdNoSlice";

export default function SearchFacultyIDNoPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { colleges: reduxColleges, results, loading, error } = useSelector(
    (state: RootState) => state.searchFacultyIdNo
  );

  const [colleges, setColleges] = useState<string[]>([]);
  const [allColleges, setAllColleges] = useState(false);
  const [college, setCollege] = useState("");
  const [idNo, setIdNo] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const idInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
    setCollege("");
  };

  const handleSearch = async () => {
    console.log("🚀 [Frontend SearchFacultyIDNo] State before search:", {
      idNo,
      college,
      allColleges,
    });

    if (!idNo.trim()) {
      setFormError("Please specify Faculty ID No");
      idInputRef.current?.focus();
      return;
    }

    if (!allColleges && !college) {
      setFormError("Please Select College");
      return;
    }

    setFormError(null);
    dispatch(clearResults());

    const actionResult = await dispatch(
      searchFacultyByIDNo({
        idNo: idNo.trim(),
        college: allColleges ? undefined : college,
        allColleges,
      })
    );

    if (searchFacultyByIDNo.rejected.match(actionResult)) {
      const errMsg = String(actionResult.payload || "Sorry No Record Found");
      setFormError(errMsg);
      setIdNo("");
      idInputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClose = () => {
    setIdNo("");
    setCollege("");
    setAllColleges(false);
    setFormError(null);
    dispatch(clearResults());
    idInputRef.current?.focus();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
    } catch {
      return dateString;
    }
  };

  const renderSafeText = (val: any) => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object") {
      if (val.type === "Buffer" && Array.isArray(val.data)) {
        return `[Binary ${val.data.length} bytes]`;
      }
      return JSON.stringify(val);
    }
    if (typeof val === "boolean") {
      return val ? "True" : "False";
    }
    return String(val);
  };

  const renderSnapCell = (snap: any, facultyName: string | null) => {
    if (!snap) return <span className="text-gray-400 text-xs italic">No Photo</span>;

    let src = "";
    if (typeof snap === "string") {
      const trimmed = snap.trim();
      if (trimmed.startsWith("data:image") || trimmed.startsWith("http")) {
        src = trimmed;
      } else if (trimmed.length > 20) {
        src = `data:image/jpeg;base64,${trimmed}`;
      }
    } else if (typeof snap === "object" && Array.isArray(snap?.data)) {
      try {
        const base64 = btoa(
          snap.data.reduce((data: string, byte: number) => data + String.fromCharCode(byte), "")
        );
        src = `data:image/jpeg;base64,${base64}`;
      } catch {
        src = "";
      }
    }

    if (!src) {
      return <span className="text-gray-400 text-xs italic">No Photo</span>;
    }

    return (
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => setSelectedPhoto(src)}
          className="group relative cursor-pointer focus:outline-none"
          title="Click to view full photo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={facultyName || "Faculty Photo"}
            className="w-9 h-9 object-cover rounded border border-gray-300 shadow-sm group-hover:scale-110 transition-transform duration-150"
          />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 font-sans">
      {/* Title */}
      <h1 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
        Search By Faculty ID No
      </h1>

      {/* Search Filters Container */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-5 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            {/* College Selector Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-gray-700 w-36">
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

            {/* Faculty ID No Input Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="text-sm font-semibold text-gray-700 w-36">
                Enter ID No
              </label>
              <input
                ref={idInputRef}
                type="text"
                value={idNo}
                onChange={(e) => {
                  setIdNo(e.target.value);
                  setFormError(null);
                }}
                onKeyDown={handleKeyPress}
                placeholder="Enter Faculty ID No"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row md:flex-col gap-2 self-start md:self-auto">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition-colors flex items-center justify-center min-w-[90px] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Searching..." : "Display"}
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

        {/* Error / Notification Banner */}
        {formError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {formError}
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
                <th className="py-2.5 px-3 border-r border-gray-200">ID No</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Card ID</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Name</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Father Name</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Mother Name</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Designation</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Department</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Type</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Shift Name</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Gender</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Correspondance Address</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Permanent Address</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Contact No</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Mobile No</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Email ID</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Date Of Birth</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Blood Group</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Date Of Joining</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Salary At Joining</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Salary At Present</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Qualification</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Previous Experience</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Bank Name</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Bank Account No</th>
                <th className="py-2.5 px-3 border-r border-gray-200">PAN No</th>
                <th className="py-2.5 px-3 border-r border-gray-200 text-center">Snap</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Locked</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Date Of Leaving</th>
                <th className="py-2.5 px-3 border-r border-gray-200">PF</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Security</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Advance</th>
                <th className="py-2.5 px-3 border-r border-gray-200">TDS</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Emp Code</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Total Leaves</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Level</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Designation Level</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Address Line 1</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Address Line 2</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Address Line 3</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Smart Card Access</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Department ID</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Pre Year Perforn</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Pre Year Threats Opp</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Other Work</th>
                <th className="py-2.5 px-3 border-r border-gray-200">Other Achievement</th>
                <th className="py-2.5 px-3">Suggestion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {results && results.length > 0 ? (
                results.map((row: FacultyRow, idx: number) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.CollegeName)}</td>
                    <td className="py-2 px-3 border-r border-gray-200 font-medium text-blue-600">
                      {renderSafeText(row.IDNo)}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.CardID)}</td>
                    <td className="py-2 px-3 border-r border-gray-200 font-medium">{renderSafeText(row.Name)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.FatherName)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.MotherName)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.Designation)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.Department)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.Type)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.ShiftName)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.Gender)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.CorrespondanceAddress)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.PermanentAddress)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.ContactNo)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.MobileNo)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.EmailID)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{formatDate(row.DateOfBirth)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.BloodGroup)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{formatDate(row.DateOfJoining)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.SalaryAtJoining)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.SalaryAtPresent)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.Qualification)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.PreviousExperience)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.BankName)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.BankAccountNo)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.PANNo)}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-center">
                      {renderSnapCell(row.Snap, row.Name)}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.Locked)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{formatDate(row.DateOfLeaving)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.PF)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.Security)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.Advance)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.TDS)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.EmpCode)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.TotalLeaves)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.Level)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.DesignationLevel)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.AddressLine1)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.AddressLine2)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.AddressLine3)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.SmartCardAccess)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.DepartmentID)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.Pre_Year_Perforn)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.Pre_Year_Threats_Opp)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.OtherWork)}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{renderSafeText(row.OtherAchievement)}</td>
                    <td className="py-2 px-3">{renderSafeText(row.Suggestion)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={47} className="py-8 text-center text-gray-400">
                    {loading ? "Loading records..." : "No records to display"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Modal Preview */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white p-3 rounded-lg shadow-xl max-w-sm w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto}
              alt="Faculty Snap Preview"
              className="max-h-[350px] w-auto rounded object-contain mb-3"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="w-full py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-xs font-semibold rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
