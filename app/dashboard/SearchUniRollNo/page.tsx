"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import {
  fetchColleges,
  searchByUniRollNo,
  clearResults,
  UniRollNoSearchRow,
} from "@/store/slices/searchUniRollNoSlice";

const COLUMN_KEYS = [
  "Session",
  "CollegeName",
  "Course",
  "Class",
  "Batch",
  "Section",
  "GroupName",
  "IDNo",
  "ClassRollNo",
  "UniRollNo",
  "LateralEntry",
  "AdmissionDate",
  "StudentName",
  "FatherName",
  "MotherName",
  "Sex",
  "DOB",
  "FatherOccupation",
  "MotherOccupation",
  "FatherDesignation",
  "CorrespondanceAddress",
  "PermanentAddress",
  "EmailID",
  "OfficialEmailID",
  "PhoneNo",
  "StudentMobileNo",
  "FatherEmailID",
  "FatherMobileNo",
  "MotherMobileNo",
  "Facility",
  "BusRoute",
  "RouteID",
  "Stopage",
  "StopageID",
  "HostelName",
  "RoomType",
  "HostelCharges",
  "BusFee",
  "StudentType",
  "Concession",
  "ConcessionDetails",
  "ConcessionPerc",
  "ConcessionTotalAmount",
  "BloodGroup",
  "Category",
  "Locality",
  "Medium",
  "CETRank",
  "AIEEERank",
  "METRank",
  "CETRollNo",
  "AIEEERollNo",
  "METRollNo",
  "Quota",
  "FeeWaiverScheme",
  "FirstPreference",
  "SecondPreference",
  "ThirdPreference",
  "FourthPreference",
  "Scheme",
  "InstitutionLastAttended",
  "University",
  "State",
  "Religion",
  "Caste",
  "SeatConfirmed",
  "City",
  "BoardRegistrationNo",
  "CET",
  "MET",
  "AIEEE",
  "ConcessionReferenceLetterNo",
  "Village",
  "VPO",
  "PO",
  "Tehsil",
  "District",
  "GuardianAddress",
  "GuardianContactNo",
  "Nationality",
  "PreviousMedicalIllness",
  "OtherEntranceTest",
  "NSS",
  "Sports",
  "OtherAchievements",
  "EnquiryNo",
  "EnquiryDate",
  "RegistrationNo",
  "RegistrationDate",
  "Snap",
  "CardIssued",
  "CardIssuedDate",
  "ValidUpTo",
  "JETRank",
  "JETRollNo",
  "JET",
  "Newspaper",
  "ThirdPerson",
  "CableTV",
  "Student",
  "StaffMember",
  "FlexBoard",
  "Pamphlet",
  "Comments",
  "ThirdPersonName",
  "ThirdPersonDesignation",
  "ThirdPersonAddress",
  "ThirdPersonContactNo",
  "CableTVChannel",
  "ReferenceStudentClass",
  "StaffMemberName",
  "StaffMemberDesignation",
  "NewspaperName",
  "CommentsDetail",
  "LastExam",
  "Board",
  "LastExamPerc",
  "UserID",
  "Locked",
  "SmartCardIssued",
  "SmartCardIssuedDate",
  "EntranceTest1",
  "EntranceTest1RollNo",
  "EntranceTest1Rank",
  "EntranceTest2",
  "EntranceTest2RollNo",
  "EntranceTest2Rank",
  "CardID",
  "Shift",
  "TotalConcession",
  "Internet",
  "SMS",
  "EducationFair",
  "Consultant",
  "CollegePresentation",
  "EnquiryMode",
  "AddressLine1",
  "AddressLine2",
  "AddressLine3",
  "CardLocked",
  "ValidFor",
  "CardPayment",
  "LastModifiedDate",
  "FeeCategory",
  "status",
  "Consaltant_Name",
  "Consaltant_ID",
  "Team_Name",
  "Team_Members",
  "Branch",
  "Staffid",
  "Categorys",
  "FollowupRemarks1",
] as const;

export default function SearchUniRollNoPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { colleges: reduxColleges, results, loading } = useSelector(
    (state: RootState) => state.searchUniRollNo
  );

  const [colleges, setColleges] = useState<string[]>([]);
  const [allColleges, setAllColleges] = useState(false);
  const [college, setCollege] = useState("");
  const [uniRollNo, setUniRollNo] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const uniRollNoInputRef = useRef<HTMLInputElement>(null);

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
    if (!uniRollNo.trim()) {
      setFormError("Please specify University roll No");
      uniRollNoInputRef.current?.focus();
      return;
    }

    if (!allColleges && !college) {
      setFormError("Please Select College");
      return;
    }

    setFormError(null);
    dispatch(clearResults());

    const actionResult = await dispatch(
      searchByUniRollNo({
        uniRollNo: uniRollNo.trim(),
        college: allColleges ? undefined : college,
        allColleges,
      })
    );

    if (searchByUniRollNo.rejected.match(actionResult)) {
      const errMsg = String(actionResult.payload || "Sorry No Record Found");
      setFormError(errMsg);
      setUniRollNo("");
      uniRollNoInputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClose = () => {
    setUniRollNo("");
    setCollege("");
    setAllColleges(false);
    setFormError(null);
    dispatch(clearResults());
    uniRollNoInputRef.current?.focus();
  };

  const formatDate = (val: unknown): string => {
    if (!val) return "";
    try {
      const d = new Date(String(val));
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
    } catch {
      return String(val);
    }
  };

  const renderCellValue = (key: string, val: any): React.ReactNode => {
    if (val === null || val === undefined) return "";

    if (key === "Snap") {
      if (!val) return <span className="text-gray-400 font-mono">-</span>;
      const src =
        typeof val === "string" && (val.startsWith("data:") || val.startsWith("http"))
          ? val
          : `data:image/jpeg;base64,${val}`;
      return (
        <div className="flex items-center justify-center">
          <img
            src={src}
            alt="Snap"
            className="w-10 h-10 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80 transition"
            onClick={() => setPreviewImage(src)}
          />
        </div>
      );
    }

    if (
      key.toLowerCase().includes("date") ||
      key === "DOB" ||
      key === "ValidUpTo"
    ) {
      return formatDate(val);
    }

    if (typeof val === "boolean") {
      return val ? "Yes" : "No";
    }

    if (typeof val === "object") {
      return "";
    }

    return String(val);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 font-sans">
      {/* Title */}
      <h1 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
        Search By University Roll No
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

            {/* University Roll No Input Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="text-sm font-semibold text-gray-700 w-44">
                Enter University Roll No
              </label>
              <input
                ref={uniRollNoInputRef}
                type="text"
                value={uniRollNo}
                onChange={(e) => {
                  setUniRollNo(e.target.value);
                  setFormError(null);
                }}
                onKeyDown={handleKeyPress}
                placeholder="Enter University Roll No"
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
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0 z-10 border-b border-gray-200 shadow-sm">
              <tr>
                {COLUMN_KEYS.map((key) => (
                  <th
                    key={key}
                    className="py-2.5 px-3 border-r border-gray-200 text-left font-semibold text-gray-700 bg-gray-100"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {results && results.length > 0 ? (
                results.map((row: UniRollNoSearchRow, idx: number) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    {COLUMN_KEYS.map((key) => (
                      <td
                        key={key}
                        className={`py-2 px-3 border-r border-gray-200 ${
                          key === "UniRollNo" || key === "IDNo" || key === "StudentName"
                            ? "font-medium text-blue-600"
                            : ""
                        }`}
                      >
                        {renderCellValue(key, row[key])}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={COLUMN_KEYS.length}
                    className="py-8 text-center text-gray-400"
                  >
                    {loading ? "Loading records..." : "No records to display"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snap Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-lg p-4 shadow-xl max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-gray-800">Student Photo</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-500 hover:text-gray-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={previewImage}
                alt="Student Preview"
                className="max-h-96 max-w-full rounded object-contain border"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
