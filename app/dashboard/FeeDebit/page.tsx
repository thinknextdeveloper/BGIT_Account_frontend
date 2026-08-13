// app/dashboard/FeeDebit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import {
  fetchMetaOptions,
  fetchStudentByIdNo,
  fetchFeeHeads,
  saveDebitEntry,
  clearStudent,
  clearSaveStatus,
  clearFeeHeads,
  bufferToDataUrl,
  SaveDebitPayload,
} from "@/store/slices/DebitEntrySlice";
import { getStorage } from "@/utils/storage";

const todayStr = () => {
  const d = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${months[d.getMonth()]}-${yy}`;
};

export default function DebitEntryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    metaOptions,
    student,
    studentLoading,
    studentError,
    feeHeads,
    feeHeadsLoading,
    feeHeadsError,
    saving,
    saveError,
    saveSuccess,
  } = useSelector((state: RootState) => state.debitEntry);

  const [colleges, setColleges] = useState<string[]>([]);
  const [collegeName, setCollegeName] = useState("");

  // Debits From
  const [debitFrom, setDebitFrom] = useState<"Individual" | "Course">("Individual");
  const [fromMode, setFromMode] = useState<"registrationNo" | "idNo">("idNo");
  const [idNo, setIdNo] = useState("");
  const [entryDate, setEntryDate] = useState(todayStr());

  // Course mode fields
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>(String(new Date().getFullYear()));
  const [courseStudentType, setCourseStudentType] = useState<"All" | "New" | "Old">("All");

  // Ledgers
  const [ledgerName, setLedgerName] = useState<"Fee" | "Hostel" | "Bus" | "Fine" | "Others">("Fee");
  const [othersLedgerName, setOthersLedgerName] = useState("");

  // Update Facility Detail
  const [chkHostel, setChkHostel] = useState(false);
  const [hostelName, setHostelName] = useState("");
  const [chkRoomType, setChkRoomType] = useState(false);
  const [roomType, setRoomType] = useState("");
  const [chkRoute, setChkRoute] = useState(false);
  const [route, setRoute] = useState("");
  const [chkStopage, setChkStopage] = useState(false);
  const [stopage, setStopage] = useState("");
  const [facilityAmount, setFacilityAmount] = useState("");

  // Debit panel
  const [session, setSession] = useState("2026-27");
  const [semester, setSemester] = useState("");
  const [feeCategoryOptions, setFeeCategoryOptions] = useState<string[]>([]);
  const [feeCategory, setFeeCategory] = useState("");
  const [allCategory, setAllCategory] = useState(false);
  const [category, setCategory] = useState("");
  const [allModeAdmission, setAllModeAdmission] = useState(false);
  const [modeOfAdmission, setModeOfAdmission] = useState("");
  const [refundEntry, setRefundEntry] = useState<"Yes" | "No">("No");
  const [concessionEntry, setConcessionEntry] = useState<"Yes" | "No">("No");
  const [particulars, setParticulars] = useState("Fee");
  const [debit, setDebit] = useState("");
  const [remarks, setRemarks] = useState("");

  // Heads / Credit grid selection
  const [selectedFeeHeadIndex, setSelectedFeeHeadIndex] = useState<number | null>(null);

  // Student's type + Student detail
  const [studentType, setStudentType] = useState<"New" | "Old">("Old");
  const [detail, setDetail] = useState({
    collegeName: "",
    course: "",
    batch: "",
    studentClass: "",
    classRollNo: "",
    uniRollNo: "",
    studentName: "",
    fatherName: "",
    motherName: "",
    scheme: "",
    dob: "",
    sex: "",
    permanentAddress: "",
    phoneNo: "",
    studentMobile: "",
    fatherMobile: "",
    motherMobile: "",
    lateralEntry: false,
    photo: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Load Colleges
  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
  }, []);

  // Load Meta Options (Sessions, Semesters, Hostel, Routes, etc)
  useEffect(() => {
    dispatch(fetchMetaOptions({ collegeName: collegeName || undefined, route: route || undefined }));
  }, [dispatch, collegeName, route]);

  // Sync Session with dynamic currentSession or sessions
  useEffect(() => {
    if (metaOptions.currentSession) {
      setSession(metaOptions.currentSession);
    } else if (metaOptions.sessions && metaOptions.sessions.length > 0 && !session) {
      setSession(metaOptions.sessions[0]);
    }
  }, [metaOptions.currentSession, metaOptions.sessions]);

  // Load Courses for College
  useEffect(() => {
    if (!collegeName) {
      setCourses([]);
      setSelectedCourse("");
      return;
    }
    reduxApiClient.get("master-course/courses", { collegeName }).then((res) => {
      if (res.success) setCourses(res.data.data || []);
    });
  }, [collegeName]);

  // Load Fee Categories for College
  useEffect(() => {
    if (!collegeName) {
      setFeeCategoryOptions([]);
      setFeeCategory("");
      return;
    }
    reduxApiClient
      .get("master-category")
      .then((res) => {
        if (res.success && Array.isArray(res.data?.data)) {
          const filtered = res.data.data
            .filter((row: any) => !collegeName || row.CollegeName === collegeName)
            .map((row: any) => row.Category);
          setFeeCategoryOptions(Array.from(new Set(filtered)) as string[]);
        }
      });
    setFeeCategory("");
  }, [collegeName]);

  // Map student record
  useEffect(() => {
    if (student) {
      setDetail({
        collegeName: student.CollegeName || "",
        course: student.Course || "",
        batch: String(student.Batch ?? ""),
        studentClass: student.Class || "",
        classRollNo: student.ClassRollNo || "",
        uniRollNo: student.UniRollNo || "",
        studentName: student.StudentName || "",
        fatherName: student.FatherName || "",
        motherName: student.MotherName || "",
        scheme: student.Scheme || "",
        dob: student.DOB || "",
        sex: student.Sex || "",
        photo: bufferToDataUrl(student.Snap),
        permanentAddress: student.PermanentAddress || "",
        phoneNo: student.PhoneNo || "",
        studentMobile: student.StudentMobileNo || "",
        fatherMobile: student.FatherMobileNo || "",
        motherMobile: student.MotherMobileNo || "",
        lateralEntry:
          student.LateralEntry === "Yes" || student.LateralEntry === true,
      });
      if (student.CollegeName) setCollegeName(student.CollegeName);
      if (student.FeeCategory) setFeeCategory(student.FeeCategory);

      // Auto-populate Facility details matching VB.NET Display()
      const isHostel =
        student.Facility === "Hostel" ||
        Boolean(student.HostelName) ||
        (student.HostelCharges != null && Number(student.HostelCharges) > 0);
      const isBus =
        student.Facility === "Bus" ||
        Boolean(student.BusRoute) ||
        (student.BusFee != null && Number(student.BusFee) > 0);

      if (isHostel) {
        setChkHostel(true);
        setChkRoomType(true);
        setChkRoute(false);
        setChkStopage(false);
        if (student.HostelName) setHostelName(student.HostelName);
        if (student.RoomType) setRoomType(student.RoomType);
        if (student.HostelCharges != null) setFacilityAmount(String(student.HostelCharges));
      } else if (isBus) {
        setChkHostel(false);
        setChkRoomType(false);
        setChkRoute(true);
        setChkStopage(true);
        if (student.BusRoute) setRoute(student.BusRoute);
        if (student.Stopage) setStopage(student.Stopage);
        if (student.BusFee != null) setFacilityAmount(String(student.BusFee));
      } else {
        setChkHostel(false);
        setChkRoomType(false);
        setChkRoute(false);
        setChkStopage(false);
        setHostelName("");
        setRoomType("");
        setRoute("");
        setStopage("");
        setFacilityAmount("");
      }
    }
  }, [student]);

  // Handle Ledger radio button changes (mirrors VB rdbtnFee / rdbtnHostel / rdbtnBus / rdbtnFine / rdbtnOthers)
  const handleLedgerChange = (l: "Fee" | "Hostel" | "Bus" | "Fine" | "Others") => {
    setLedgerName(l);
    if (l === "Fee") {
      setParticulars("Fee");
    } else if (l === "Hostel") {
      setParticulars("Hostel Fee");
      setChkHostel(true);
      setChkRoomType(true);
      setChkRoute(false);
      setChkStopage(false);
    } else if (l === "Bus") {
      setParticulars("Bus Fee");
      setChkHostel(false);
      setChkRoomType(false);
      setChkRoute(true);
      setChkStopage(true);
    } else if (l === "Fine") {
      setParticulars("Late Fee");
      setChkHostel(false);
      setChkRoomType(false);
      setChkRoute(false);
      setChkStopage(false);
    } else if (l === "Others") {
      setParticulars(othersLedgerName || "Others");
      setChkHostel(false);
      setChkRoomType(false);
      setChkRoute(false);
      setChkStopage(false);
    }
  };

  // Load Fee Heads grid whenever parameters change
  useEffect(() => {
    if (feeCategory && (idNo.trim() || (collegeName && selectedCourse && selectedBatch))) {
      setSelectedFeeHeadIndex(null);
      dispatch(
        fetchFeeHeads({
          idNo: debitFrom === "Individual" ? idNo.trim() : undefined,
          collegeName: debitFrom === "Course" ? collegeName : undefined,
          course: debitFrom === "Course" ? selectedCourse : undefined,
          batch: debitFrom === "Course" ? selectedBatch : undefined,
          semester: semester || undefined,
          feeCategory,
          ledgerName,
        })
      );
    } else {
      dispatch(clearFeeHeads());
    }
  }, [student, semester, feeCategory, ledgerName, debitFrom, idNo, collegeName, selectedCourse, selectedBatch, dispatch]);

  const [localFeeHeads, setLocalFeeHeads] = useState<{ head: string; credit: number | string }[]>([]);

  // Sync localFeeHeads when feeHeads loads from Redux
  useEffect(() => {
    if (Array.isArray(feeHeads)) {
      const mapped = feeHeads.map((h) => ({ head: h.head, credit: h.credit || 0 }));
      setLocalFeeHeads(mapped);
      if (ledgerName === "Fee") {
        const total = mapped.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
        setDebit(String(total));
      }
    } else {
      setLocalFeeHeads([]);
    }
  }, [feeHeads, ledgerName]);

  const handleCreditCellChange = (index: number, val: string) => {
    const updated = [...localFeeHeads];
    updated[index] = { ...updated[index], credit: val };
    setLocalFeeHeads(updated);
    if (ledgerName === "Fee") {
      const total = updated.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
      setDebit(String(total));
    }
  };

  const handleFeeHeadClick = (idx: number) => {
    setSelectedFeeHeadIndex(idx);
    const row = localFeeHeads[idx];
    if (row) {
      setParticulars(row.head);
      setDebit(String(row.credit));
    }
  };

  const handleSearchStudent = () => {
    const trimmed = idNo.trim();
    if (!trimmed) {
      setFormError("Please enter ID No. or Registration No. to search");
      return;
    }
    setFormError(null);
    dispatch(fetchStudentByIdNo(trimmed));
  };

  const handleIdNoBlur = () => {
    if (debitFrom === "Individual" && studentType === "Old" && idNo.trim()) {
      dispatch(fetchStudentByIdNo(idNo.trim()));
    }
  };

  const handleIdNoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchStudent();
    }
  };

  const handleStudentTypeChange = (type: "New" | "Old") => {
    setStudentType(type);
    dispatch(clearStudent());
    dispatch(clearFeeHeads());
    setSelectedFeeHeadIndex(null);
    if (type === "New") {
      setDetail({
        collegeName: "",
        course: "",
        batch: "",
        studentClass: "",
        classRollNo: "",
        uniRollNo: "",
        studentName: "",
        fatherName: "",
        motherName: "",
        scheme: "",
        dob: "",
        sex: "",
        permanentAddress: "",
        phoneNo: "",
        studentMobile: "",
        fatherMobile: "",
        motherMobile: "",
        lateralEntry: false,
        photo: "",
      });
    }
  };

  const detailReadOnly = studentType === "Old";

  const resetDebitFieldsOnly = () => {
    setSemester("");
    setFeeCategory("");
    setAllCategory(false);
    setCategory("");
    setAllModeAdmission(false);
    setModeOfAdmission("");
    setRefundEntry("No");
    setConcessionEntry("No");
    setParticulars(ledgerName === "Fee" ? "Fee" : ledgerName === "Hostel" ? "Hostel Fee" : ledgerName === "Bus" ? "Bus Fee" : "Others");
    setDebit("");
    setRemarks("");
    setSelectedFeeHeadIndex(null);
  };

  const handleClear = () => {
    setIdNo("");
    setEntryDate(todayStr());
    setLedgerName("Fee");
    setOthersLedgerName("");
    setChkHostel(false);
    setHostelName("");
    setChkRoomType(false);
    setRoomType("");
    setChkRoute(false);
    setRoute("");
    setChkStopage(false);
    setStopage("");
    setFacilityAmount("");
    setSession("2026-27");
    resetDebitFieldsOnly();
    dispatch(clearStudent());
    dispatch(clearSaveStatus());
    dispatch(clearFeeHeads());
    setFormError(null);
  };

  const handleNewEntry = () => {
    resetDebitFieldsOnly();
    dispatch(clearSaveStatus());
  };

  const handleAdd = () => {
    if (debitFrom === "Individual" && !idNo.trim()) {
      setFormError("Please enter ID No.");
      return;
    }
    if (debitFrom === "Course") {
      if (!collegeName) { setFormError("Please select College"); return; }
      if (!selectedCourse) { setFormError("Please select Course"); return; }
      if (!selectedBatch) { setFormError("Please select Batch"); return; }
    }
    if (!semester) {
      setFormError("Please Select Semester");
      return;
    }
    if (!feeCategory) {
      setFormError("Select Fee Category");
      return;
    }
    if (ledgerName === "Others" && !othersLedgerName) {
      setFormError("Please select an Others ledger");
      return;
    }
    if (!debit || Number(debit) <= 0) {
      setFormError("Please enter a valid Debit amount");
      return;
    }
    if (concessionEntry === "Yes" && Number(debit) < 0) {
      setFormError("Enter Amount without '-' Sign.");
      return;
    }
    setFormError(null);

    const payload: SaveDebitPayload = {
      debitFrom,
      courseStudentType: debitFrom === "Course" ? courseStudentType : undefined,
      collegeName: debitFrom === "Course" ? collegeName : undefined,
      course: debitFrom === "Course" ? selectedCourse : undefined,
      batch: debitFrom === "Course" ? selectedBatch : undefined,
      studentType,
      idNo: debitFrom === "Individual" ? idNo.trim() : undefined,
      studentDetail:
        debitFrom === "Individual" && studentType === "New"
          ? {
              collegeName: detail.collegeName,
              course: detail.course,
              batch: detail.batch,
              studentClass: detail.studentClass,
              classRollNo: detail.classRollNo,
              uniRollNo: detail.uniRollNo,
              studentName: detail.studentName,
              fatherName: detail.fatherName,
              motherName: detail.motherName,
              scheme: detail.scheme,
              dob: detail.dob,
              sex: detail.sex,
              permanentAddress: detail.permanentAddress,
              phoneNo: detail.phoneNo,
              studentMobile: detail.studentMobile,
              fatherMobile: detail.fatherMobile,
              motherMobile: detail.motherMobile,
              lateralEntry: detail.lateralEntry,
            }
          : undefined,
      session,
      semester,
      semesterId: (() => {
        if (!semester) return 1;
        const s = semester.trim().toLowerCase();
        if (s === "first" || s === "1st year" || s === "1year" || s === "1 year" || s === "1st") return 1;
        if (s === "second" || s === "secound" || s === "2nd year" || s === "2ndyear" || s === "2 year" || s === "2nd") return 2;
        if (s === "third" || s === "3rd year" || s === "3rdyear" || s === "3 year" || s === "3rd") return 3;
        if (s === "fourth" || s === "4th year" || s === "4thyear" || s === "4 year" || s === "4th") return 4;
        if (s === "fifth" || s === "5th") return 5;
        if (s === "sixth" || s === "6th" || s === "6-month") return 6;
        if (s === "seventh" || s === "7th") return 7;
        if (s === "eighth" || s === "eight" || s === "8th" || s === "internship") return 8;
        const match = s.match(/\d+/);
        return match ? parseInt(match[0], 10) : 1;
      })(),
      category: allCategory ? category : undefined,
      modeOfAdmission: allModeAdmission ? modeOfAdmission : undefined,
      ledgerName,
      othersLedgerName: ledgerName === "Others" ? othersLedgerName : undefined,
      facility:
        chkHostel || chkRoomType || chkRoute || chkStopage
          ? {
              hostelName: chkHostel ? hostelName : undefined,
              roomType: chkRoomType ? roomType : undefined,
              route: chkRoute ? route : undefined,
              stopage: chkStopage ? stopage : undefined,
              amount: facilityAmount || undefined,
            }
          : undefined,
      refundEntry,
      concessionEntry,
      particulars,
      debit,
      remarks,
      dateEntry: entryDate,
      userId: getStorage("userid") || getStorage("user") || "711177",
      feeHeads: localFeeHeads,
    };

    dispatch(saveDebitEntry(payload));
  };

  const inputCls =
    "flex-1 border border-slate-300 h-8 px-2 rounded text-[12px] bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 transition-colors";
  const labelCls = "w-28 font-semibold text-[12px] text-slate-700 shrink-0";
  const selectCls =
    "flex-1 border border-slate-300 h-8 px-2 rounded text-[12px] bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 transition-colors";
  const radioCls = "flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 cursor-pointer";
  const checkCls = "flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 cursor-pointer";

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-6 text-slate-800">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============ LEFT COLUMN (col-span-6) ============ */}
        <div className="lg:col-span-6 space-y-4">
          {/* Debits From Card */}
          <fieldset className="border border-slate-300 rounded-lg bg-white p-3.5 shadow-sm space-y-2">
            <legend className="px-2 font-bold text-[12px] text-blue-900 bg-blue-50 border border-blue-200 rounded-md">
              Debits From
            </legend>
            <div className="flex items-center gap-6">
              <label className={radioCls}>
                <input
                  type="radio"
                  checked={debitFrom === "Individual"}
                  onChange={() => {
                    setDebitFrom("Individual");
                    dispatch(clearFeeHeads());
                  }}
                  className="accent-blue-600"
                />
                Individual
              </label>
              <label className={radioCls}>
                <input
                  type="radio"
                  checked={debitFrom === "Course"}
                  onChange={() => {
                    setDebitFrom("Course");
                    dispatch(clearStudent());
                    dispatch(clearFeeHeads());
                  }}
                  className="accent-blue-600"
                />
                Course
              </label>
            </div>

            {debitFrom === "Individual" ? (
              <>
                <div className="flex items-center gap-6">
                  <label className={radioCls}>
                    <input
                      type="radio"
                      checked={fromMode === "registrationNo"}
                      onChange={() => setFromMode("registrationNo")}
                      className="accent-blue-600"
                    />
                    Registration No.
                  </label>
                  <label className={radioCls}>
                    <input
                      type="radio"
                      checked={fromMode === "idNo"}
                      onChange={() => setFromMode("idNo")}
                      className="accent-blue-600"
                    />
                    ID No.
                  </label>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <label className="font-semibold text-[12px] text-slate-700 w-16 shrink-0">
                    {fromMode === "registrationNo" ? "Reg No." : "ID No."}
                  </label>
                  <input
                    value={idNo}
                    onChange={(e) => setIdNo(e.target.value)}
                    onBlur={handleIdNoBlur}
                    onKeyDown={handleIdNoKeyDown}
                    className="w-36 border border-slate-300 h-8 px-2 rounded text-[12px] bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearchStudent}
                    disabled={studentLoading}
                    title="Search student"
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[12px] px-3.5 h-8 rounded transition-all shadow-sm disabled:opacity-50 shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {studentLoading ? "..." : "Search"}
                  </button>
                  <label className="font-semibold text-[12px] text-slate-700 ml-auto mr-1 shrink-0">
                    Date
                  </label>
                  <input
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-28 border border-slate-300 h-8 px-2 rounded text-[12px] bg-white text-slate-900 text-center"
                  />
                </div>
              </>
            ) : (
              /* Course Selection Mode */
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-[12px] text-slate-700 w-16 shrink-0">
                    College
                  </label>
                  <select
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">-- select college --</option>
                    {colleges.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-[12px] text-slate-700 w-16 shrink-0">
                    Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">-- select course --</option>
                    {courses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-[12px] text-slate-700 w-16 shrink-0">
                    Batch
                  </label>
                  <input
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-32 border border-slate-300 h-8 px-2 rounded text-[12px] bg-white text-slate-900"
                  />
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <span className="font-semibold text-[12px] text-slate-700">Student Type:</span>
                  {(["All", "New", "Old"] as const).map((t) => (
                    <label key={t} className={radioCls}>
                      <input
                        type="radio"
                        checked={courseStudentType === t}
                        onChange={() => setCourseStudentType(t)}
                        className="accent-blue-600"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {studentError && (
              <p className="text-red-600 text-[12px] font-medium mt-1">{studentError}</p>
            )}
          </fieldset>

          {/* Ledgers Card */}
          <fieldset className="border border-slate-300 rounded-lg bg-white p-3.5 shadow-sm">
            <legend className="px-2 font-bold text-[12px] text-blue-900 bg-blue-50 border border-blue-200 rounded-md">
              Ledgers / SubLedgers
            </legend>
            <div className="flex items-center gap-5 flex-wrap">
              {(["Fee", "Hostel", "Bus", "Fine", "Others"] as const).map((l) => (
                <label key={l} className={radioCls}>
                  <input
                    type="radio"
                    checked={ledgerName === l}
                    onChange={() => handleLedgerChange(l)}
                    className="accent-blue-600"
                  />
                  {l}
                </label>
              ))}
              <select
                value={othersLedgerName}
                onChange={(e) => {
                  setOthersLedgerName(e.target.value);
                  if (ledgerName === "Others") setParticulars(e.target.value);
                }}
                disabled={ledgerName !== "Others"}
                className={selectCls + " max-w-[160px]"}
              >
                <option value="">-- select --</option>
                <option>Library Fine</option>
                <option>Exam Fee</option>
                <option>Miscellaneous</option>
              </select>
            </div>
          </fieldset>

          {/* Update Facility Detail Card */}
          <fieldset className="border border-slate-300 rounded-lg bg-white p-3.5 shadow-sm space-y-2">
            <legend className="px-2 font-bold text-[12px] text-blue-900 bg-blue-50 border border-blue-200 rounded-md">
              Update Facility Detail
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <label className={checkCls + " w-24 shrink-0"}>
                  <input
                    type="checkbox"
                    checked={chkHostel}
                    onChange={(e) => setChkHostel(e.target.checked)}
                    disabled={ledgerName === "Bus"}
                    className="accent-blue-600"
                  />
                  Hostel Name
                </label>
                <select
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                  disabled={!chkHostel || ledgerName === "Bus"}
                  className={selectCls}
                >
                  <option value="">-- select --</option>
                  {metaOptions.hostelNames.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className={checkCls + " w-24 shrink-0"}>
                  <input
                    type="checkbox"
                    checked={chkRoomType}
                    onChange={(e) => setChkRoomType(e.target.checked)}
                    disabled={ledgerName === "Bus"}
                    className="accent-blue-600"
                  />
                  Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  disabled={!chkRoomType || ledgerName === "Bus"}
                  className={selectCls}
                >
                  <option value="">-- select --</option>
                  {metaOptions.roomTypes.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className={checkCls + " w-24 shrink-0"}>
                  <input
                    type="checkbox"
                    checked={chkRoute}
                    onChange={(e) => setChkRoute(e.target.checked)}
                    disabled={ledgerName === "Hostel"}
                    className="accent-blue-600"
                  />
                  Route
                </label>
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  disabled={!chkRoute || ledgerName === "Hostel"}
                  className={selectCls}
                >
                  <option value="">-- select --</option>
                  {metaOptions.routes.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className={checkCls + " w-24 shrink-0"}>
                  <input
                    type="checkbox"
                    checked={chkStopage}
                    onChange={(e) => setChkStopage(e.target.checked)}
                    disabled={ledgerName === "Hostel"}
                    className="accent-blue-600"
                  />
                  Stopage
                </label>
                <select
                  value={stopage}
                  onChange={(e) => setStopage(e.target.value)}
                  disabled={!chkStopage || ledgerName === "Hostel"}
                  className={selectCls}
                >
                  <option value="">-- select --</option>
                  {metaOptions.stopages.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100 mt-2">
              <label className="font-semibold text-[12px] text-slate-700">
                Amount
              </label>
              <input
                value={facilityAmount}
                onChange={(e) => setFacilityAmount(e.target.value)}
                className="w-32 border border-slate-300 h-8 px-2 rounded text-[12px] bg-white text-slate-900"
              />
            </div>
          </fieldset>

          {/* Debit Card (Form + Embedded Heads Grid) */}
          <fieldset className="border border-slate-300 rounded-lg bg-white p-3.5 shadow-sm">
            <legend className="px-2 font-bold text-[12px] text-blue-900 bg-blue-50 border border-blue-200 rounded-md">
              Debit
            </legend>
            <div className="flex flex-col sm:flex-row gap-4 min-w-0">
              {/* Inputs column */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <label className={labelCls}>Session</label>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className={selectCls}
                  >
                    {(metaOptions.sessions && metaOptions.sessions.length > 0
                      ? metaOptions.sessions
                      : ["2026-27", "2025-26", "2024-25", "2023-24", "2022-23", "2021-22", "2020-21", "2019-20", "2018-19", "2017-18", "2016-17", "2015-16", "2014-15", "2013-14"]
                    ).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className={labelCls}>Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">-- select --</option>
                    {(metaOptions.semesters && metaOptions.semesters.length > 0
                      ? metaOptions.semesters
                      : ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Eight", "1st Year", "1Year", "1 Year", "2nd Year", "2ndYear", "2 Year", "3rdYear", "3rd Year", "4thYear", "4th Year", "6-Month", "Internship", "Secound"]
                    ).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className={labelCls}>Fee Category</label>
                  <select
                    value={feeCategory}
                    onChange={(e) => setFeeCategory(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">-- select --</option>
                    {feeCategoryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className={checkCls + " w-28 shrink-0"}>
                    <input
                      type="checkbox"
                      checked={allCategory}
                      onChange={(e) => setAllCategory(e.target.checked)}
                      className="accent-blue-600"
                    />
                    All Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={!allCategory}
                    className={selectCls}
                  >
                    <option value="">-- select --</option>
                    {metaOptions.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className={checkCls + " w-28 shrink-0"}>
                    <input
                      type="checkbox"
                      checked={allModeAdmission}
                      onChange={(e) => setAllModeAdmission(e.target.checked)}
                      className="accent-blue-600"
                    />
                    All Mode of Admission
                  </label>
                  <select
                    value={modeOfAdmission}
                    onChange={(e) => setModeOfAdmission(e.target.value)}
                    disabled={!allModeAdmission}
                    className={selectCls}
                  >
                    <option value="">-- select --</option>
                    {metaOptions.modesOfAdmission.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className={labelCls}>Refund Entry</label>
                  <select
                    value={refundEntry}
                    onChange={(e) => setRefundEntry(e.target.value as "Yes" | "No")}
                    className={selectCls}
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className={labelCls}>Concession Entry</label>
                  <select
                    value={concessionEntry}
                    onChange={(e) => setConcessionEntry(e.target.value as "Yes" | "No")}
                    className={selectCls}
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className={labelCls}>Particulars</label>
                  <input
                    value={particulars}
                    onChange={(e) => setParticulars(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className={labelCls}>Debit</label>
                  <input
                    value={debit}
                    onChange={(e) => setDebit(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className={labelCls}>Remarks</label>
                  <input
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Heads / Credit grid container */}
              <div className="w-full sm:w-48 shrink-0 border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm self-start min-w-0">
                <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex justify-between items-center">
                  <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">Fee Heads</span>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {feeHeads.length} items
                  </span>
                </div>
                <div className="overflow-y-auto max-h-48">
                  <table className="w-full text-[11px] border-collapse">
                    <thead className="sticky top-0 bg-slate-50 shadow-xs z-10">
                      <tr>
                        <th className="w-3 py-1 border-b border-slate-200"></th>
                        <th className="text-left px-2 py-1 border-b border-l border-slate-200 font-semibold text-slate-700">
                          Heads
                        </th>
                        <th className="text-right px-2 py-1 border-b border-l border-slate-200 font-semibold text-slate-700">
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeHeadsLoading ? (
                        <tr>
                          <td colSpan={3} className="px-2 py-3 text-center text-slate-400">
                            Loading…
                          </td>
                        </tr>
                      ) : feeHeadsError ? (
                        <tr>
                          <td colSpan={3} className="px-2 py-3 text-center text-red-600">
                            {feeHeadsError}
                          </td>
                        </tr>
                      ) : !Array.isArray(localFeeHeads) || localFeeHeads.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-2 py-3 text-center text-slate-400 font-medium">
                            No heads
                          </td>
                        </tr>
                      ) : (
                        localFeeHeads.map((row, idx) => {
                          const selected = idx === selectedFeeHeadIndex;
                          return (
                            <tr
                              key={`${row.head}-${idx}`}
                              onClick={() => handleFeeHeadClick(idx)}
                              className={`cursor-pointer transition-colors ${
                                selected
                                  ? "bg-blue-50 text-slate-900 font-medium"
                                  : idx % 2 === 0
                                  ? "bg-white text-slate-800 hover:bg-slate-50"
                                  : "bg-slate-50/70 text-slate-800 hover:bg-slate-100"
                              }`}
                            >
                              <td className="w-3 text-center border-t border-slate-150 text-[10px] text-blue-600 font-bold">
                                {selected ? "▶" : ""}
                              </td>
                              <td className="px-2 py-1 border-t border-l border-slate-150 truncate max-w-[90px]" title={row.head}>
                                {row.head}
                              </td>
                              <td className="px-1 py-0.5 border-t border-l border-slate-150 text-right">
                                <input
                                  type="text"
                                  value={row.credit}
                                  onChange={(e) => handleCreditCellChange(idx, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full text-right bg-white text-slate-900 border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 text-[11px] font-semibold"
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClear}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-[12px] px-6 h-8 rounded-md transition-colors"
              >
                Clear
              </button>
            </div>
          </fieldset>
        </div>

        {/* ============ RIGHT COLUMN (col-span-6) ============ */}
        <div className="lg:col-span-6 space-y-4">
          {debitFrom === "Individual" ? (
            <>
              {/* Student Type Card */}
              <fieldset className="border border-slate-300 rounded-lg bg-white p-3.5 shadow-sm">
                <legend className="px-2 font-bold text-[12px] text-blue-900 bg-blue-50 border border-blue-200 rounded-md">
                  Student's type
                </legend>
                <div className="flex justify-center gap-10">
                  <label className={radioCls}>
                    <input
                      type="radio"
                      checked={studentType === "New"}
                      onChange={() => handleStudentTypeChange("New")}
                      className="accent-blue-600"
                    />
                    New
                  </label>
                  <label className={radioCls}>
                    <input
                      type="radio"
                      checked={studentType === "Old"}
                      onChange={() => handleStudentTypeChange("Old")}
                      className="accent-blue-600"
                    />
                    Old
                  </label>
                </div>
              </fieldset>

              {/* Student Detail Card */}
              <fieldset className="border border-slate-300 rounded-lg bg-white p-3.5 shadow-sm">
                <legend className="px-2 font-bold text-[12px] text-blue-900 bg-blue-50 border border-blue-200 rounded-md">
                  Student detail
                </legend>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>CollegeName</label>
                      <select
                        value={detail.collegeName}
                        onChange={(e) => {
                          setDetail({ ...detail, collegeName: e.target.value });
                          setCollegeName(e.target.value);
                        }}
                        disabled={detailReadOnly}
                        className={selectCls}
                      >
                        <option value="">-- select --</option>
                        {colleges.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>ID No.</label>
                      <input value={idNo} readOnly className={inputCls} />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Course</label>
                      <input
                        value={detail.course}
                        onChange={(e) => setDetail({ ...detail, course: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Batch</label>
                      <input
                        value={detail.batch}
                        onChange={(e) => setDetail({ ...detail, batch: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Class</label>
                      <input
                        value={detail.studentClass}
                        onChange={(e) => setDetail({ ...detail, studentClass: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Class Roll No</label>
                      <input
                        value={detail.classRollNo}
                        onChange={(e) => setDetail({ ...detail, classRollNo: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Uni Roll No</label>
                      <input
                        value={detail.uniRollNo}
                        onChange={(e) => setDetail({ ...detail, uniRollNo: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Name</label>
                      <input
                        value={detail.studentName}
                        onChange={(e) => setDetail({ ...detail, studentName: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                      <label className={checkCls + " ml-2 shrink-0"}>
                        <input
                          type="checkbox"
                          checked={detail.lateralEntry}
                          onChange={(e) => setDetail({ ...detail, lateralEntry: e.target.checked })}
                          disabled={detailReadOnly}
                          className="accent-blue-600"
                        />
                        Lateral Entry
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Father Name</label>
                      <input
                        value={detail.fatherName}
                        onChange={(e) => setDetail({ ...detail, fatherName: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Mother Name</label>
                      <input
                        value={detail.motherName}
                        onChange={(e) => setDetail({ ...detail, motherName: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Scheme</label>
                      <input
                        value={detail.scheme}
                        onChange={(e) => setDetail({ ...detail, scheme: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>DOB</label>
                      <input
                        value={detail.dob}
                        onChange={(e) => setDetail({ ...detail, dob: e.target.value })}
                        readOnly={detailReadOnly}
                        placeholder="dd-Mon-yy"
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Sex</label>
                      <label className={radioCls}>
                        <input
                          type="radio"
                          checked={detail.sex === "Male"}
                          onChange={() => !detailReadOnly && setDetail({ ...detail, sex: "Male" })}
                          disabled={detailReadOnly}
                          className="accent-blue-600"
                        />
                        Male
                      </label>
                      <label className={radioCls}>
                        <input
                          type="radio"
                          checked={detail.sex === "Female"}
                          onChange={() => !detailReadOnly && setDetail({ ...detail, sex: "Female" })}
                          disabled={detailReadOnly}
                          className="accent-blue-600"
                        />
                        Female
                      </label>
                    </div>
                    <div className="flex items-start gap-2">
                      <label className={labelCls + " pt-1"}>Address</label>
                      <textarea
                        value={detail.permanentAddress}
                        onChange={(e) => setDetail({ ...detail, permanentAddress: e.target.value })}
                        readOnly={detailReadOnly}
                        className="flex-1 border border-slate-300 px-2 py-1 rounded text-[12px] bg-white text-slate-900 disabled:bg-slate-100 h-14 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Phone No</label>
                      <input
                        value={detail.phoneNo}
                        onChange={(e) => setDetail({ ...detail, phoneNo: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Student Mobile No</label>
                      <input
                        value={detail.studentMobile}
                        onChange={(e) => setDetail({ ...detail, studentMobile: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Father Mobile No</label>
                      <input
                        value={detail.fatherMobile}
                        onChange={(e) => setDetail({ ...detail, fatherMobile: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={labelCls}>Mother Mobile No</label>
                      <input
                        value={detail.motherMobile}
                        onChange={(e) => setDetail({ ...detail, motherMobile: e.target.value })}
                        readOnly={detailReadOnly}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Student Photo Card */}
                  <div className="w-28 h-32 bg-slate-50 border border-slate-300 rounded-md shrink-0 overflow-hidden flex flex-col items-center justify-center self-start shadow-xs p-1">
                    {detail.photo ? (
                      <img
                        src={detail.photo}
                        alt="Student"
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <svg className="w-8 h-8 text-slate-300 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-[10px] text-slate-400 font-medium">No Photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </fieldset>
            </>
          ) : (
            <div className="border border-blue-200 bg-blue-50/70 rounded-lg p-8 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-blue-900 text-[15px]">Course Debit Mode Active</h3>
              <p className="text-[12px] text-slate-600 max-w-md mx-auto leading-relaxed">
                In Course mode, debit entries will be created in bulk for all students belonging to the selected College, Course, and Batch.
              </p>
            </div>
          )}

          {formError && (
            <p className="text-red-600 text-[12px] font-semibold text-center bg-red-50 border border-red-200 p-2 rounded-md">
              {formError}
            </p>
          )}
          {saveError && (
            <p className="text-red-600 text-[12px] font-semibold text-center bg-red-50 border border-red-200 p-2 rounded-md">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p className="text-emerald-700 text-[12px] font-semibold text-center bg-emerald-50 border border-emerald-200 p-2 rounded-md">
              {saveSuccess}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px] px-8 h-9 rounded-md shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "ADD"}
            </button>
            <button
              onClick={handleNewEntry}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px] px-8 h-9 rounded-md shadow-sm transition-all"
            >
              New Entry
            </button>
            <button
              onClick={handleClear}
              className="bg-slate-600 hover:bg-slate-700 text-white font-semibold text-[13px] px-8 h-9 rounded-md shadow-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}