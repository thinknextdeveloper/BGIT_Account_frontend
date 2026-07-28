"use client";

import React, { useState, useEffect } from "react";
import {
  getCancelRestoreStudentDetails,
  getDisplayAllCancellation,
  getCoursesByCollege,
  addCancelledAdmission,
  restoreAdmission,
} from "@/services/cancelRestoreApi";

// Official 115 columns for CancelledAdmission table query
const OFFICIAL_CANCELLED_COLUMNS = [
  "CancellationDate", "CancelStatus", "Reason", "ShiftedFrom", "ShiftedTo", "CollegeName", "Course", "Class", "Batch", "Section",
  "ClassRollNo", "LateralEntry", "AdmissionDate", "IDNo", "StudentName", "Sex", "FatherName", "MotherName", "DOB", "FatherOccupation",
  "MotherOccupation", "FatherDesignation", "FatherEmailID", "CorrespondanceAddress", "PermanentAddress", "EmailID", "PhoneNo", "StudentMobileNo", "FatherMobileNo", "MotherMobileNo",
  "Facility", "BusRoute", "RouteID", "Stopage", "StopageID", "HostelName", "RoomType", "HostelCharges", "BusFee", "StudentType",
  "Concession", "ConcessionDetails", "ConcessionPerc", "ConcessionTotalAmount", "BloodGroup", "Category", "Locality", "Medium", "Quota", "FeeWaiverScheme",
  "FirstPreference", "SecondPreference", "ThirdPreference", "FourthPreference", "Scheme", "InstitutionLastAttended", "University", "State", "Religion", "SeatConfirmed",
  "City", "BoardRegistrationNo", "ConcessionReferenceLetterNo", "Village", "VPO", "PO", "Tehsil", "District", "GuardianAddress", "GuardianContactNo",
  "Nationality", "PreviousMedicalIllness", "OtherEntranceTest", "NSS", "Sports", "OtherAchievements", "GroupName", "UniRollNo", "UserID", "EnquiryNo",
  "EnquiryDate", "RegistrationNo", "RegistrationDate", "Snap", "CardIssued", "CardIssuedDate", "ValidUpTo", "LastExam", "Board", "LastExamPerc",
  "Newspaper", "ThirdPerson", "CableTV", "Student", "StaffMember", "FlexBoard", "Pamphlet", "Comments", "ThirdPersonName", "ThirdPersonDesignation",
  "ThirdPersonAddress", "ThirdPersonContactNo", "CableTVChannel", "ReferenceStudentClass", "StaffMemberName", "StaffMemberDesignation", "NewspaperName", "CommentsDetail", "Locked",
  "SmartCardIssued", "SmartCardIssuedDate", "EntranceTest1", "EntranceTest1RollNo", "EntranceTest1Rank", "EntranceTest2", "EntranceTest2RollNo", "EntranceTest2Rank"
];

// Official columns for Admissions table query
const OFFICIAL_ADMISSIONS_COLUMNS = [
  "CollegeName", "Course", "Class", "Batch", "ClassRollNo", "LateralEntry", "AdmissionDate", "IDNo", "Section", "GroupName",
  "StudentName", "FatherName", "MotherName", "Sex", "DOB", "FatherOccupation", "MotherOccupation", "FatherDesignation", "FatherEmailID", "CorrespondanceAddress",
  "PermanentAddress", "EmailID", "PhoneNo", "StudentMobileNo", "FatherMobileNo", "MotherMobileNo", "Facility", "BusRoute", "RouteID", "Stopage",
  "StopageID", "HostelName", "RoomType", "HostelCharges", "BusFee", "StudentType", "Concession", "ConcessionDetails", "ConcessionPerc", "ConcessionTotalAmount",
  "BloodGroup", "Category", "Locality", "Medium", "Quota", "FeeWaiverScheme", "FirstPreference", "SecondPreference", "ThirdPreference", "FourthPreference",
  "Scheme", "InstitutionLastAttended", "University", "State", "Religion", "SeatConfirmed", "City", "BoardRegistrationNo", "ConcessionReferenceLetterNo", "Village",
  "VPO", "PO", "Tehsil", "District", "GuardianAddress", "GuardianContactNo", "Nationality", "PreviousMedicalIllness", "NSS", "Sports",
  "OtherAchievements", "UniRollNo", "EnquiryDate", "EnquiryNo", "RegistrationNo", "RegistrationDate", "OtherEntranceTest", "UserID", "Snap", "CardIssued",
  "CardIssuedDate", "ValidUpTo", "LastExam", "Board", "LastExamPerc", "Newspaper", "ThirdPerson", "CableTV", "Student", "StaffMember",
  "FlexBoard", "Pamphlet", "Comments", "ThirdPersonName", "ThirdPersonDesignation", "ThirdPersonAddress", "ThirdPersonContactNo", "CableTVChannel", "ReferenceStudentClass", "StaffMemberName",
  "StaffMemberDesignation", "NewspaperName", "CommentsDetail", "Locked", "SmartCardIssued", "SmartCardIssuedDate", "EntranceTest1", "EntranceTest1RollNo", "EntranceTest1Rank", "EntranceTest2",
  "EntranceTest2RollNo", "EntranceTest2Rank"
];

export default function CancelRestorePage() {
  const [txtIDNo, setTxtIDNo] = useState<string>("");
  const [records, setRecords] = useState<any[]>([]);
  const [cancelledRecords, setCancelledRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cancLoading, setCancLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearched, setIsSearched] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [visibleCancelledCount, setVisibleCancelledCount] = useState<number>(100);

  // Cancellation Form Controls (Matching VB.NET cmbCancelStatus, txtReason, txtCourseFrom, cmbCourseTo)
  const [cmbCancelStatus, setCmbCancelStatus] = useState<string>("");
  const [txtReason, setTxtReason] = useState<string>("");
  const [txtCourseFrom, setTxtCourseFrom] = useState<string>("");
  const [cmbCourseTo, setCmbCourseTo] = useState<string>("");
  const [courseOptions, setCourseOptions] = useState<string[]>([]);
  const [addingCanc, setAddingCanc] = useState<boolean>(false);
  const [selectedCancelledIdNo, setSelectedCancelledIdNo] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<boolean>(false);

  useEffect(() => {
    if (selectedStudent) {
      setTxtCourseFrom(selectedStudent.Course || "");
    } else {
      setTxtCourseFrom("");
    }
  }, [selectedStudent]);

  const handleCancelledScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 250) {
      setVisibleCancelledCount((prev) => {
        if (prev < cancelledRecords.length) {
          return Math.min(prev + 100, cancelledRecords.length);
        }
        return prev;
      });
    }
  };

  /**
   * Step 2: displayStudentDetail() logic matching VB.NET
   */
  const displayStudentDetail = async () => {
    setError(null);
    const cleanInput = txtIDNo.trim();

    if (!cleanInput) {
      setError("Please specify IDNo");
      alert("Please specify IDNo");
      setRecords([]);
      setSelectedStudent(null);
      setIsSearched(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getCancelRestoreStudentDetails(cleanInput);

      if (res.success && res.data?.records && Array.isArray(res.data.records) && res.data.records.length > 0) {
        setRecords(res.data.records);
        setSelectedStudent(res.data.records[0]);
        setIsSearched(true);
      } else {
        const msg = res.message || "No Record Found";
        setError(msg);
        alert(msg);
        setRecords([]);
        setSelectedStudent(null);
        setIsSearched(false);
      }
    } catch (err: any) {
      const msg = err.message || "No Record Found";
      setError(msg);
      alert(msg);
      setRecords([]);
      setSelectedStudent(null);
      setIsSearched(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 1: DisplayAllCancellation() logic matching VB.NET (Runs on Page Load)
   */
  const displayAllCancellation = async () => {
    try {
      setCancLoading(true);
      const res = await getDisplayAllCancellation();
      console.log("[CancelRestore Page] getDisplayAllCancellation response:", res);
      let list: any[] = [];
      if (res && (res.success || res.status === 200)) {
        const rawData = res.data;
        if (Array.isArray(rawData?.records)) {
          list = rawData.records;
        } else if (Array.isArray(rawData?.records?.records)) {
          list = rawData.records.records;
        } else if (Array.isArray(rawData)) {
          list = rawData;
        } else if (Array.isArray(res.records)) {
          list = res.records;
        } else if (rawData?.data && Array.isArray(rawData.data.records)) {
          list = rawData.data.records;
        }
      }
      console.log("[CancelRestore Page] Setting cancelledRecords array count:", list.length);
      setCancelledRecords(list);
      setVisibleCancelledCount(100);
    } catch (err) {
      console.warn("Failed to fetch cancelled admissions:", err);
      setCancelledRecords([]);
      setVisibleCancelledCount(100);
    } finally {
      setCancLoading(false);
    }
  };

  // Step 1: Execute DisplayAllCancellation() on page load
  useEffect(() => {
    displayAllCancellation();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      displayStudentDetail();
    }
  };

  /**
   * Sub showCourse() matching VB.NET exact logic
   * Retrieves varcollege = dgvDetail.Rows(0).Cells("CollegeName").Value
   * Executes: select Distinct Course from MasterCourse where CollegeName='varcollege'
   */
  const showCourse = async () => {
    if (!txtIDNo.trim() || records.length === 0) {
      alert("No record found to be cancelled");
      setCourseOptions([]);
      setCmbCourseTo("");
      return;
    }

    const varcollege = records[0]?.CollegeName || selectedStudent?.CollegeName || "";
    if (!varcollege) {
      setCourseOptions([]);
      setCmbCourseTo("");
      return;
    }

    try {
      const res = await getCoursesByCollege(varcollege);
      console.log("[CancelRestore Page] getCoursesByCollege response:", res);
      let list: string[] = [];
      if (res && res.success && Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      }
      setCourseOptions(list);
    } catch (e) {
      console.warn("Error in showCourse():", e);
      setCourseOptions([]);
      setCmbCourseTo("");
    }
  };

  /**
   * cmbCancelStatus_SelectedIndexChanged logic matching VB.NET exact workflow
   */
  const handleCancelStatusChange = async (status: string) => {
    if (!status) {
      setCmbCancelStatus("");
      return;
    }

    if (!txtIDNo.trim() || records.length === 0) {
      alert("No student record found to be cancelled");
      setCmbCancelStatus("");
      return;
    }

    setCmbCancelStatus(status);

    if (status === "Shifted") {
      // Show Shifted controls, set txtCourseFrom to dgvDetail.Rows(0).Cells("Course").Value
      setTxtCourseFrom(records[0]?.Course || selectedStudent?.Course || "");
      setCmbCourseTo("");
      setTxtReason("");
      await showCourse();
    } else if (status === "Left" || status === "Other") {
      // Show Reason controls, hide Shifted controls
      setTxtCourseFrom("");
      setCmbCourseTo("");
      setCourseOptions([]);
      setTxtReason("");
    }
  };

  /**
   * cmbCourseTo_SelectedIndexChanged logic
   */
  const handleCourseToChange = (val: string) => {
    if (txtCourseFrom && val && txtCourseFrom.trim().toLowerCase() === val.trim().toLowerCase()) {
      alert("Please Select Another value");
      setCmbCourseTo("");
      return;
    }
    setCmbCourseTo(val);
  };

  /**
   * btnAddCancAdm_Click logic (Add it to Cancelled Admissions)
   */
  const handleAddCancAdm = async () => {
    if (!txtIDNo.trim()) {
      alert("Please specify ID No");
      return;
    }

    if (!cmbCancelStatus) {
      alert("Please Give any reason to cancel admission");
      return;
    }

    if (cmbCancelStatus === "Left" || cmbCancelStatus === "Other") {
      if (!txtReason.trim()) {
        alert("Please Specify Reason");
        return;
      }
    }

    if (cmbCancelStatus === "Shifted") {
      if (!txtCourseFrom.trim()) {
        alert("Please Specify Course value");
        return;
      }
      if (!cmbCourseTo.trim()) {
        alert("Please Specify Course value");
        return;
      }
    }

    if (!records || records.length === 0) {
      return;
    }

    try {
      setAddingCanc(true);
      const payload = {
        idNo: txtIDNo.trim(),
        cancelStatus: cmbCancelStatus,
        reason: txtReason.trim(),
        shiftedFrom: txtCourseFrom.trim(),
        shiftedTo: cmbCourseTo.trim(),
      };
      const res = await addCancelledAdmission(payload);
      if (res.success) {
        alert("Record has been successfully Cancelled ");
        setCmbCancelStatus("");
        setTxtReason("");
        setCmbCourseTo("");
        setTxtCourseFrom("");
        setRecords([]);
        setSelectedStudent(null);
        setTxtIDNo("");
        setIsSearched(false);
        await displayAllCancellation();
      } else {
        alert(res.message || "Failed to cancel admission");
      }
    } catch (err: any) {
      alert(err.message || "Error adding cancelled admission");
    } finally {
      setAddingCanc(false);
    }
  };

  /**
   * btnAddRegistration_Click logic (Add Selected to Admissions)
   */
  const handleAddRegistration = async () => {
    if (!selectedCancelledIdNo) {
      alert("Please select a student record from the Cancelled Admissions table (dgvDetail1) first.");
      return;
    }

    try {
      setRestoring(true);
      const res = await restoreAdmission(selectedCancelledIdNo);
      if (res && res.success) {
        alert(res.message || "Record has been successfully added in to Admissionss");
        setSelectedCancelledIdNo(null);
        await displayAllCancellation();
      } else {
        alert(res.message || "Failed to restore admission");
      }
    } catch (err: any) {
      alert(err.message || "Error restoring admission");
    } finally {
      setRestoring(false);
    }
  };

  const handleResetAll = () => {
    setTxtIDNo("");
    setRecords([]);
    setSelectedStudent(null);
    setIsSearched(false);
    setError(null);
    setCmbCancelStatus("");
    setTxtReason("");
    setTxtCourseFrom("");
    setCmbCourseTo("");
  };

  // Determine active column headers dynamically or from official list
  const admissionsColumnKeys =
    Array.isArray(records) && records.length > 0
      ? Object.keys(records[0])
      : OFFICIAL_ADMISSIONS_COLUMNS;

  const cancelledColumnKeys =
    Array.isArray(cancelledRecords) && cancelledRecords.length > 0
      ? Object.keys(cancelledRecords[0])
      : OFFICIAL_CANCELLED_COLUMNS;

  const safeCancelledRecords = Array.isArray(cancelledRecords) ? cancelledRecords : [];
  const safeAdmissionsRecords = Array.isArray(records) ? records : [];
  const displayedCancelledRecords = safeCancelledRecords.slice(0, visibleCancelledCount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-blue-400 p-2 sm:p-4 font-sans">
      {/* Outer Windows Form Card Container matching VB.NET Accounts Window */}
      <div className="max-w-[1600px] mx-auto bg-sky-200/90 backdrop-blur-md border-2 border-sky-400 rounded-xl shadow-2xl overflow-hidden flex flex-col space-y-3 p-3">
        
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-sky-800 via-blue-900 to-indigo-950 text-white px-4 py-2 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">🎓</span>
            <h1 className="text-sm font-black tracking-wide uppercase">
              Accounts - [Cancel Student Admission]
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={displayAllCancellation}
              disabled={cancLoading}
              className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded border border-sky-400 shadow-xs transition disabled:opacity-50"
            >
              {cancLoading ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-4 py-2 bg-rose-100 border border-rose-400 text-rose-800 text-xs font-bold rounded-md flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-rose-600 font-black hover:text-rose-900">
              ✕
            </button>
          </div>
        )}

        {/* Section 1: Search Header Area (Enter ID No, Find, Cancel) */}
        <div className="bg-sky-100/90 border border-sky-300 rounded-lg p-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <label htmlFor="txtIDNo" className="text-xs font-black uppercase text-slate-800">
              Enter ID No
            </label>
            <input
              id="txtIDNo"
              type="text"
              placeholder="e.g. 5825111005"
              value={txtIDNo}
              onChange={(e) => setTxtIDNo(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-64 bg-white border border-sky-400 text-slate-900 font-bold text-xs rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
            />
            <button
              id="btnFind"
              onClick={displayStudentDetail}
              disabled={loading}
              className="px-6 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded border border-blue-900 shadow-sm transition disabled:opacity-50"
            >
              {loading ? "Searching..." : "Find"}
            </button>
            <button
              id="btnCancel"
              onClick={handleResetAll}
              className="px-6 py-1.5 bg-gradient-to-r from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 text-slate-900 font-black text-xs uppercase tracking-wider rounded border border-slate-400 shadow-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Section 2: Upper DataGridView (dgvDetail) - Always Rendered */}
        <div className="bg-white border border-slate-300 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[220px]">
            <table id="dgvDetail" className="w-full text-left text-xs text-slate-800 border-collapse min-w-[2800px]">
              <thead className="bg-slate-200 text-[11px] font-bold text-slate-800 border-b border-slate-300 sticky top-0 z-10">
                <tr>
                  {admissionsColumnKeys.map((colName) => (
                    <th key={colName} className="px-3 py-2 border-r border-slate-300 whitespace-nowrap bg-slate-200">
                      {colName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {safeAdmissionsRecords.length === 0 ? (
                  <tr>
                    <td colSpan={admissionsColumnKeys.length} className="px-4 py-8 text-center text-slate-400 italic">
                      No student record loaded. Enter ID No and click Find.
                    </td>
                  </tr>
                ) : (
                  safeAdmissionsRecords.map((row, idx) => (
                    <tr key={idx} className="bg-sky-50/50 hover:bg-sky-100/70 transition">
                      {admissionsColumnKeys.map((colName) => {
                        let rawVal = row[colName];
                        let displayVal = "-";
                        if (rawVal !== null && rawVal !== undefined && rawVal !== "") {
                          if (typeof rawVal === "boolean") {
                            displayVal = rawVal ? "True" : "False";
                          } else if (typeof rawVal === "object") {
                            displayVal = JSON.stringify(rawVal);
                          } else {
                            displayVal = String(rawVal);
                          }
                        }
                        return (
                          <td
                            key={colName}
                            className="px-3 py-2 border-r border-slate-200 whitespace-nowrap text-slate-900 font-mono text-xs max-w-xs truncate"
                            title={displayVal}
                          >
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Inline Controls Bar (Cancel Status, Reason / From Course, To Course) */}
        <div className="bg-sky-100/90 border border-sky-300 rounded-lg p-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-center gap-6">
            
            {/* Cancel Status Dropdown & Buttons */}
            <div className="flex items-center gap-2">
              <label htmlFor="cmbCancelStatus" className="text-xs font-black uppercase text-slate-800 whitespace-nowrap">
                Cancel Status
              </label>
              <select
                id="cmbCancelStatus"
                value={cmbCancelStatus}
                onChange={(e) => handleCancelStatusChange(e.target.value)}
                className="bg-white border border-sky-400 text-slate-900 text-xs font-bold rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 min-w-[140px]"
              >
                <option value="">-- Select --</option>
                <option value="Left">Left</option>
                <option value="Shifted">Shifted</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Dynamic Controls based on Cancel Status */}
            {cmbCancelStatus === "Shifted" ? (
              <>
                {/* From Course */}
                <div className="flex items-center gap-2">
                  <label htmlFor="txtCourseFrom" className="text-xs font-black uppercase text-slate-800 whitespace-nowrap">
                    From Course
                  </label>
                  <input
                    id="txtCourseFrom"
                    type="text"
                    readOnly
                    value={txtCourseFrom}
                    className="w-48 bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs rounded px-3 py-1.5 cursor-not-allowed"
                  />
                </div>

                {/* To Course */}
                <div className="flex items-center gap-2">
                  <label htmlFor="cmbCourseTo" className="text-xs font-black uppercase text-slate-800 whitespace-nowrap">
                    To Course
                  </label>
                  <select
                    id="cmbCourseTo"
                    value={cmbCourseTo}
                    onChange={(e) => handleCourseToChange(e.target.value)}
                    className="w-56 bg-white border border-sky-400 text-slate-900 text-xs font-bold rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="">-- Select Course --</option>
                    {courseOptions.map((c, i) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              /* Reason input field */
              <div className="flex items-center gap-2 flex-1 max-w-xl">
                <label htmlFor="txtReason" className="text-xs font-black uppercase text-slate-800 whitespace-nowrap">
                  Reason
                </label>
                <input
                  id="txtReason"
                  type="text"
                  placeholder="Specify reason for cancellation..."
                  value={txtReason}
                  onChange={(e) => setTxtReason(e.target.value)}
                  className="w-full bg-white border border-sky-400 text-slate-900 font-medium text-xs rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Action Buttons Row (Add it to Cancelled Admissions, Close, Add Selected to Admissions) */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-1">
          <button
            id="btnAddCancAdm"
            onClick={handleAddCancAdm}
            disabled={addingCanc}
            className="px-6 py-2 bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded border border-blue-950 shadow-md transition transform active:scale-95 disabled:opacity-50"
          >
            {addingCanc ? "Processing..." : "Add it to Cancelled Admissions"}
          </button>

          <button
            id="btnClose"
            onClick={handleResetAll}
            className="px-6 py-2 bg-gradient-to-r from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 text-slate-900 font-black text-xs uppercase tracking-wider rounded border border-slate-400 shadow-md transition transform active:scale-95"
          >
            Close
          </button>

          <button
            id="btnAddSelectedToAdmissions"
            onClick={handleAddRegistration}
            disabled={restoring}
            className="px-6 py-2 bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded border border-blue-950 shadow-md transition transform active:scale-95 disabled:opacity-50"
          >
            {restoring ? "Restoring..." : "Add Selected to Admissions"}
          </button>
        </div>

        {/* Section 5: Lower DataGridView (dgvDetail1) - All Cancelled Admissions */}
        <div className="bg-white border border-slate-300 rounded-lg shadow-xs overflow-hidden flex-1">
          <div className="p-2 bg-slate-900 text-white flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 uppercase tracking-wider">
              Cancelled Admissions Records (dgvDetail1)
            </span>
            <span className="font-mono text-sky-200 text-[11px]">
              Showing {displayedCancelledRecords.length} of {safeCancelledRecords.length.toLocaleString()} Records
            </span>
          </div>

          <div
            onScroll={handleCancelledScroll}
            className="overflow-x-auto overflow-y-auto max-h-[480px] border-t border-slate-200"
          >
            <table id="dgvDetail1" className="w-full text-left text-xs text-slate-800 border-collapse min-w-[2800px]">
              <thead className="bg-slate-200 text-[11px] font-bold text-slate-800 border-b border-slate-300 sticky top-0 z-10">
                <tr>
                  {cancelledColumnKeys.map((colName) => (
                    <th key={colName} className="px-3 py-2 border-r border-slate-300 whitespace-nowrap bg-slate-200">
                      {colName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {displayedCancelledRecords.length === 0 ? (
                  <tr>
                    <td colSpan={cancelledColumnKeys.length} className="px-4 py-8 text-center text-slate-400 italic">
                      {cancLoading ? "Loading cancelled admissions..." : "No cancelled admission records found."}
                    </td>
                  </tr>
                ) : (
                  displayedCancelledRecords.map((row, idx) => {
                    const rowIdNo = String(row.IDNo || row.idNo || "");
                    const isSelected = selectedCancelledIdNo === rowIdNo && rowIdNo !== "";
                    return (
                      <tr
                        key={idx}
                        onClick={() => rowIdNo && setSelectedCancelledIdNo(rowIdNo)}
                        className={`cursor-pointer transition ${
                          isSelected
                            ? "bg-blue-100/90 font-bold border-l-4 border-blue-600 shadow-xs"
                            : "hover:bg-amber-50/70"
                        }`}
                      >
                      {cancelledColumnKeys.map((colName) => {
                        let rawVal = row[colName];
                        let displayVal = "-";
                        if (rawVal !== null && rawVal !== undefined && rawVal !== "") {
                          if (typeof rawVal === "boolean") {
                            displayVal = rawVal ? "True" : "False";
                          } else if (typeof rawVal === "object") {
                            displayVal = JSON.stringify(rawVal);
                          } else {
                            displayVal = String(rawVal);
                          }
                        }
                        return (
                          <td
                            key={colName}
                            className="px-3 py-2 border-r border-slate-200 whitespace-nowrap text-slate-900 font-mono text-xs max-w-xs truncate"
                            title={displayVal}
                          >
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer bar for infinite scroll indicator */}
          {displayedCancelledRecords.length < safeCancelledRecords.length && (
            <div className="p-2 bg-slate-100 border-t border-slate-300 flex items-center justify-between text-xs text-slate-700 font-medium">
              <span>
                Showing {displayedCancelledRecords.length} of {safeCancelledRecords.length.toLocaleString()} records. Scroll down to load next 100.
              </span>
              <button
                onClick={() => setVisibleCancelledCount((prev) => Math.min(prev + 100, safeCancelledRecords.length))}
                className="px-3 py-1 bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs rounded transition"
              >
                Load Next 100 (+100)
              </button>
            </div>
          )}
        </div>

        {/* Footer Brand Banner */}
        <div className="text-slate-800 text-[11px] font-bold text-left px-2 pt-1 border-t border-sky-300/60">
          A Product of ThinkNEXT Technologies Private Limited, Mohali : 9815994197
        </div>
      </div>
    </div>
  );
}
