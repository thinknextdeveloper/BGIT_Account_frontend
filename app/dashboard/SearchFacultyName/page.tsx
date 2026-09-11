"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import {
  fetchColleges,
  searchFaculty,
  clearResults,
} from "@/store/slices/searchFacultyNameSlice";

export default function SearchFacultyNamePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { colleges: reduxColleges, results, loading, error } = useSelector(
    (state: RootState) => state.searchFacultyName
  );

  const [colleges, setColleges] = useState<string[]>([]);
  const [allColleges, setAllColleges] = useState(false);
  const [college, setCollege] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

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
    console.log("🚀 [Frontend SearchFaculty] Current State before search:", {
      facultyName,
      college,
      allColleges,
    });

    if (!allColleges && !college) {
      setFormError("Please select college name");
      return;
    }
    if (!facultyName.trim()) {
      setFormError("Please Write Faculty Member Name");
      return;
    }

    setFormError(null);
    dispatch(clearResults());
    const actionResult = await dispatch(
      searchFaculty({
        facultyName: facultyName.trim(),
        college: allColleges ? undefined : college,
        allColleges,
      })
    );

    if (searchFaculty.rejected.match(actionResult)) {
      setFormError(String(actionResult.payload || "No match found"));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClose = () => {
    setFacultyName("");
    setCollege("");
    setAllColleges(false);
    setFormError(null);
    dispatch(clearResults());
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
      if (val.type === "Buffer") return "[Photo]";
      return "";
    }
    return String(val);
  };

  const renderSnapCell = (val: any): React.ReactNode => {
    if (!val) return <span className="text-gray-400 font-mono">-</span>;
    let src = "";
    if (typeof val === "string") {
      src = val.startsWith("data:") || val.startsWith("http") ? val : `data:image/jpeg;base64,${val}`;
    }
    if (src) {
      return (
        <img
          src={src}
          alt="Snap"
          className="w-10 h-10 rounded object-cover border border-gray-300 shadow-sm inline-block"
          loading="lazy"
        />
      );
    }
    return <span className="text-gray-400 font-mono">-</span>;
  };


  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)",
      }}
    >
      <h1 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
        Search Faculty Member Name
      </h1>

      <div className="flex items-start gap-4 mb-6 flex-wrap">
        <fieldset className="border border-gray-300 rounded bg-white/85 shadow-sm p-4 flex-1 min-w-[320px] max-w-2xl">
          <legend className="text-xs font-semibold text-gray-600 px-1">
            Search Filters
          </legend>
          <div className="flex flex-col gap-3">
            {/* College selection */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <label className="flex items-center gap-2 w-44 font-semibold text-[13px] text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allColleges}
                  onChange={(e) => handleAllCollegesToggle(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                All Colleges
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                disabled={allColleges}
                className="flex-1 border border-gray-300 h-9 px-3 rounded text-[13px] bg-white text-gray-900 disabled:bg-gray-200 disabled:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Select College --</option>
                {colleges.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Faculty Member Name input */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <label className="w-44 font-semibold text-[13px] text-gray-800">
                Faculty Member Name
              </label>
              <input
                type="text"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter Faculty Member Name"
                className="flex-1 border border-gray-300 h-9 px-3 rounded text-[13px] bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </fieldset>

        {/* Action Buttons */}
        <div className="flex gap-3 items-center self-center sm:self-start">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded shadow hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {loading ? "Searching..." : "Find"}
          </button>
          <button
            onClick={handleClose}
            className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded shadow hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {(formError || error) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded">
          {formError ?? error}
        </div>
      )}

      {/* Results Section */}
      <div className="bg-white/80 border border-gray-300 rounded shadow-sm p-4">
        {results && results.length > 0 && (
          <div className="flex justify-between items-center mb-3">
            <p className="text-[13px] font-semibold text-gray-800">
              Total Records : {results.length}
            </p>
          </div>
        )}

        <div className="bg-gray-200 border border-gray-300 rounded min-h-[420px] max-h-[600px] overflow-auto">
          {results && results.length > 0 ? (
            <table className="w-full text-[12px] bg-white text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0 border-b border-gray-300 z-10">
                <tr>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">College Name</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">ID No</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Card ID</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Name</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Father Name</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Mother Name</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Designation</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Department</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Type</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Shift Name</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Gender</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Correspondance Address</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Permanent Address</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Contact No</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Mobile No</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Email ID</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Date Of Birth</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Blood Group</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Date Of Joining</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap text-right">Salary At Joining</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap text-right">Salary At Present</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Qualification</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Previous Experience</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Bank Name</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Bank Account No</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">PAN No</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Snap</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Locked</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Date Of Leaving</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap text-right">PF</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap text-right">Security</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap text-right">Advance</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap text-right">TDS</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Emp Code</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Total Leaves</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Level</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Designation Level</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Address Line 1</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Address Line 2</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Address Line 3</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Smart Card Access</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Department ID</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Pre Year Perform</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Pre Year Threats/Opp</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Other Work</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Other Achievement</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Suggestion</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={`${r.IDNo}-${r.CardID}-${i}`}
                    className={i % 2 === 0 ? "bg-white hover:bg-blue-50/50" : "bg-gray-50 hover:bg-blue-50/50"}
                  >
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.CollegeName)}</td>
                    <td className="border px-2 py-1.5 text-blue-700 whitespace-nowrap font-semibold">{renderSafeText(r.IDNo)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.CardID)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap font-medium">{renderSafeText(r.Name)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.FatherName)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.MotherName)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.Designation)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.Department)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.Type)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.ShiftName)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.Gender)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.CorrespondanceAddress)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.PermanentAddress)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.ContactNo)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.MobileNo)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.EmailID)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{formatDate(r.DateOfBirth)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.BloodGroup)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{formatDate(r.DateOfJoining)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap text-right">
                      {r.SalaryAtJoining != null ? Number(r.SalaryAtJoining).toFixed(2) : ""}
                    </td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap text-right">
                      {r.SalaryAtPresent != null ? Number(r.SalaryAtPresent).toFixed(2) : ""}
                    </td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.Qualification)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.PreviousExperience)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.BankName)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.BankAccountNo)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.PANNo)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap text-center">{renderSnapCell(r.Snap)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.Locked)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{formatDate(r.DateOfLeaving)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap text-right">
                      {r.PF != null ? Number(r.PF).toFixed(2) : ""}
                    </td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap text-right">
                      {r.Security != null ? Number(r.Security).toFixed(2) : ""}
                    </td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap text-right">
                      {r.Advance != null ? Number(r.Advance).toFixed(2) : ""}
                    </td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap text-right">
                      {r.TDS != null ? Number(r.TDS).toFixed(2) : ""}
                    </td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.EmpCode)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.TotalLeaves)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.Level)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.DesignationLevel)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.AddressLine1)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.AddressLine2)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.AddressLine3)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.SmartCardAccess)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.DepartmentID)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.Pre_Year_Perforn)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.Pre_Year_Threats_Opp)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.OtherWork)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.OtherAchievement)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{renderSafeText(r.Suggestion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-[420px] flex items-center justify-center text-gray-500 text-sm">
              {loading ? "Searching..." : "No records to display. Enter Faculty Member Name and click Find."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
