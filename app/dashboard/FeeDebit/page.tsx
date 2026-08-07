// app/debit-entry/page.tsx
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

  // Ledgers
  const [ledgerName, setLedgerName] = useState<"Fee" | "Hostel" | "Bus" | "Others">("Fee");
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
  const [feeCategory, setFeeCategory] = useState(""); // mirrors VB's cmbFeeCategory
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

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
  }, []);

  useEffect(() => {
    if (collegeName) {
      dispatch(fetchMetaOptions({ collegeName, route: route || undefined }));
    }
  }, [dispatch, collegeName, route]);

  // Fee Category dropdown — mirrors VB's FillFeeCategory(collegeName).
  // NOTE: confirm this endpoint path matches your real master-category route
  // (check controllers/masterCategoryController.js) — adjust if different.
  useEffect(() => {
    if (!collegeName) {
      setFeeCategoryOptions([]);
      setFeeCategory("");
      return;
    }
    reduxApiClient
      .get("master-category/fee-categories", { collegeName })
      .then((res) => {
        if (res.success) {
          setFeeCategoryOptions(res.data.data || res.data.feeCategories || []);
        }
      });
    setFeeCategory("");
  }, [collegeName]);

  // Map the fetched student record onto the detail form.
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
    }
  }, [student]);

  // Load the Heads/Credit grid whenever a student is found, or Semester /
  // Fee Category change — mirrors VB's SetSubHeader() triggers.
  useEffect(() => {
    if (student && semester && feeCategory) {
      setSelectedFeeHeadIndex(null);
      dispatch(
        fetchFeeHeads({
          idNo: idNo.trim() || String(student.IDNo),
          semester,
          feeCategory,
        })
      );
    } else {
      dispatch(clearFeeHeads());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student, semester, feeCategory, dispatch]);

  const handleFeeHeadClick = (idx: number) => {
    setSelectedFeeHeadIndex(idx);
    const row = feeHeads[idx];
    if (row) {
      setParticulars(row.head);
      setDebit(String(row.credit));
    }
  };

  const handleSearchStudent = () => {
    const trimmed = idNo.trim();
    if (!trimmed) {
      setFormError("Please enter ID No. to search");
      return;
    }
    setFormError(null);
    dispatch(fetchStudentByIdNo(trimmed));
  };

  const handleIdNoBlur = () => {
    if (studentType === "Old" && idNo.trim()) {
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
    setParticulars("Fee");
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
    if (!idNo.trim()) {
      setFormError("Please enter ID No.");
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
    setFormError(null);

    const payload: SaveDebitPayload = {
      studentType,
      idNo: idNo.trim(),
      studentDetail:
        studentType === "New"
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
    };

    dispatch(saveDebitEntry(payload));
  };

  const inputCls =
    "flex-1 border border-gray-300 h-8 px-2 rounded text-[13px] bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500";
  const labelCls = "w-36 font-semibold text-[13px] text-gray-800 shrink-0";
  const selectCls =
    "flex-1 border border-gray-300 h-8 px-2 rounded text-[13px] bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400";
  const radioCls = "flex items-center gap-1 text-[13px] font-semibold text-gray-800";
  const checkCls = "flex items-center gap-1 text-[13px] font-semibold text-gray-800";

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4">
        {/* ============ LEFT COLUMN ============ */}
        <div className="space-y-4">
          <fieldset className="border border-gray-400 rounded bg-white/70 p-3">
            <legend className="px-1 font-bold text-[13px] text-gray-900">
              Debits From
            </legend>
            <div className="flex items-center gap-6 mb-2">
              <label className={radioCls}>
                <input
                  type="radio"
                  checked={debitFrom === "Individual"}
                  onChange={() => setDebitFrom("Individual")}
                />
                Individual
              </label>
              <label className={radioCls}>
                <input
                  type="radio"
                  checked={debitFrom === "Course"}
                  onChange={() => setDebitFrom("Course")}
                />
                Course
              </label>
            </div>
            <div className="flex items-center gap-6 mb-2">
              <label className={radioCls}>
                <input
                  type="radio"
                  checked={fromMode === "registrationNo"}
                  onChange={() => setFromMode("registrationNo")}
                />
                Registration No.
              </label>
              <label className={radioCls}>
                <input
                  type="radio"
                  checked={fromMode === "idNo"}
                  onChange={() => setFromMode("idNo")}
                />
                ID No.
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold text-[13px] text-gray-800 w-16">
                ID No.
              </label>
              <input
                value={idNo}
                onChange={(e) => setIdNo(e.target.value)}
                onBlur={handleIdNoBlur}
                onKeyDown={handleIdNoKeyDown}
                className="w-36 border border-gray-300 h-8 px-2 rounded text-[13px] bg-white text-gray-900"
              />
              <button
                type="button"
                onClick={handleSearchStudent}
                disabled={studentLoading}
                title="Search student"
                className="flex items-center gap-1 bg-blue-600 text-white font-semibold text-[13px] px-3 h-8 rounded hover:bg-blue-700 disabled:opacity-50 shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
                {studentLoading ? "..." : "Search"}
              </button>
              <label className="font-semibold text-[13px] text-gray-800 ml-4 w-16">
                Date
              </label>
              <input
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-32 border border-gray-300 h-8 px-2 rounded text-[13px] bg-white text-gray-900"
              />
            </div>
            {studentError && (
              <p className="text-red-600 text-[12px] mt-1">{studentError}</p>
            )}
          </fieldset>

          <fieldset className="border border-gray-400 rounded bg-white/70 p-3">
            <legend className="px-1 font-bold text-[13px] text-gray-900">
              Ledgers
            </legend>
            <div className="flex items-center gap-5 flex-wrap">
              {(["Fee", "Hostel", "Bus", "Others"] as const).map((l) => (
                <label key={l} className={radioCls}>
                  <input
                    type="radio"
                    checked={ledgerName === l}
                    onChange={() => setLedgerName(l)}
                  />
                  {l}
                </label>
              ))}
              <select
                value={othersLedgerName}
                onChange={(e) => setOthersLedgerName(e.target.value)}
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

          <fieldset className="border border-gray-400 rounded bg-white/70 p-3">
            <legend className="px-1 font-bold text-[13px] text-gray-900">
              Update Facility Detail
            </legend>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <label className={checkCls + " w-28"}>
                  <input
                    type="checkbox"
                    checked={chkHostel}
                    onChange={(e) => setChkHostel(e.target.checked)}
                  />
                  Hostel Name
                </label>
                <select
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                  disabled={!chkHostel}
                  className={selectCls}
                >
                  <option value="">-- select --</option>
                  {metaOptions.hostelNames.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className={checkCls + " w-28"}>
                  <input
                    type="checkbox"
                    checked={chkRoomType}
                    onChange={(e) => setChkRoomType(e.target.checked)}
                  />
                  Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  disabled={!chkRoomType}
                  className={selectCls}
                >
                  <option value="">-- select --</option>
                  {metaOptions.roomTypes.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className={checkCls + " w-28"}>
                  <input
                    type="checkbox"
                    checked={chkRoute}
                    onChange={(e) => setChkRoute(e.target.checked)}
                  />
                  Route
                </label>
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  disabled={!chkRoute}
                  className={selectCls}
                >
                  <option value="">-- select --</option>
                  {metaOptions.routes.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className={checkCls + " w-28"}>
                  <input
                    type="checkbox"
                    checked={chkStopage}
                    onChange={(e) => setChkStopage(e.target.checked)}
                  />
                  Stopage
                </label>
                <select
                  value={stopage}
                  onChange={(e) => setStopage(e.target.value)}
                  disabled={!chkStopage}
                  className={selectCls}
                >
                  <option value="">-- select --</option>
                  {metaOptions.stopages.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
              <label className="font-semibold text-[13px] text-gray-800">
                Amount
              </label>
              <input
                value={facilityAmount}
                onChange={(e) => setFacilityAmount(e.target.value)}
                className="w-32 border border-gray-300 h-8 px-2 rounded text-[13px] bg-white text-gray-900"
              />
            </div>
          </fieldset>

          <fieldset className="border border-gray-400 rounded bg-white/70 p-3">
            <legend className="px-1 font-bold text-[13px] text-gray-900">
              Debit
            </legend>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className={labelCls}>Session</label>
                  <input
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className={labelCls}>Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">-- select --</option>
                    {["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"].map((s) => (
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
                  <label className={checkCls + " w-36 shrink-0"}>
                    <input
                      type="checkbox"
                      checked={allCategory}
                      onChange={(e) => setAllCategory(e.target.checked)}
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
                  <label className={checkCls + " w-36 shrink-0"}>
                    <input
                      type="checkbox"
                      checked={allModeAdmission}
                      onChange={(e) => setAllModeAdmission(e.target.checked)}
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

              {/* Heads / Credit grid */}
              <div className="w-56 shrink-0 border border-gray-400 rounded overflow-hidden bg-white self-start">
                <div className="overflow-y-auto overflow-x-auto max-h-40">
                  <table className="w-full text-[12px] border-collapse">
                    <thead className="sticky top-0 bg-gray-100 z-10">
                      <tr>
                        <th className="w-4 border-b border-gray-300"></th>
                        <th className="text-left px-2 py-1 border-b border-l border-gray-300 font-semibold text-gray-800">
                          Heads
                        </th>
                        <th className="text-left px-2 py-1 border-b border-l border-gray-300 font-semibold text-gray-800">
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeHeadsLoading ? (
                        <tr>
                          <td colSpan={3} className="px-2 py-2 text-center text-gray-500">
                            Loading…
                          </td>
                        </tr>
                      ) : feeHeadsError ? (
                        <tr>
                          <td colSpan={3} className="px-2 py-2 text-center text-red-600">
                            {feeHeadsError}
                          </td>
                        </tr>
                      ) : !Array.isArray(feeHeads) || feeHeads.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-2 py-2 text-center text-gray-500">
                            No heads
                          </td>
                        </tr>
                      ) : (
                        feeHeads.map((row, idx) => {
                          const selected = idx === selectedFeeHeadIndex;
                          return (
                            <tr
                              key={`${row.head}-${idx}`}
                              onClick={() => handleFeeHeadClick(idx)}
                              className={`cursor-pointer ${
                                selected
                                  ? "bg-blue-600 text-white"
                                  : idx % 2 === 0
                                  ? "bg-white text-gray-900"
                                  : "bg-blue-50/40 text-gray-900"
                              }`}
                            >
                              <td className="w-4 text-center border-t border-gray-200">
                                {selected ? "▶" : ""}
                              </td>
                              <td className="px-2 py-1 border-t border-l border-gray-200">
                                {row.head}
                              </td>
                              <td className="px-2 py-1 border-t border-l border-gray-200">
                                {row.credit.toLocaleString()}
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

            <div className="flex justify-center mt-3">
              <button
                onClick={handleClear}
                className="bg-blue-600 text-white font-semibold text-[13px] px-8 h-8 rounded hover:bg-blue-700"
              >
                Clear
              </button>
            </div>
          </fieldset>
        </div>

        {/* ============ RIGHT COLUMN ============ */}
        <div className="space-y-4">
          <fieldset className="border border-gray-400 rounded bg-white/70 p-3">
            <legend className="px-1 font-bold text-[13px] text-gray-900">
              Student's type
            </legend>
            <div className="flex justify-center gap-10">
              <label className={radioCls}>
                <input
                  type="radio"
                  checked={studentType === "New"}
                  onChange={() => handleStudentTypeChange("New")}
                />
                New
              </label>
              <label className={radioCls}>
                <input
                  type="radio"
                  checked={studentType === "Old"}
                  onChange={() => handleStudentTypeChange("Old")}
                />
                Old
              </label>
            </div>
          </fieldset>

          <fieldset className="border border-gray-400 rounded bg-white/70 p-3">
            <legend className="px-1 font-bold text-[13px] text-gray-900">
              Student detail
            </legend>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
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
                  <label className={checkCls + " ml-3 shrink-0"}>
                    <input
                      type="checkbox"
                      checked={detail.lateralEntry}
                      onChange={(e) => setDetail({ ...detail, lateralEntry: e.target.checked })}
                      disabled={detailReadOnly}
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
                    />
                    Male
                  </label>
                  <label className={radioCls}>
                    <input
                      type="radio"
                      checked={detail.sex === "Female"}
                      onChange={() => !detailReadOnly && setDetail({ ...detail, sex: "Female" })}
                      disabled={detailReadOnly}
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
                    className="flex-1 border border-gray-300 px-2 py-1 rounded text-[13px] bg-white text-gray-900 disabled:bg-gray-100 h-14 resize-none"
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

              <div className="w-24 h-24 bg-blue-100 border border-blue-300 shrink-0 overflow-hidden flex items-center justify-center self-start">
                {detail.photo ? (
                  <img
                    src={detail.photo}
                    alt="Student"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] text-gray-500">No Photo</span>
                )}
              </div>
            </div>
          </fieldset>

          {formError && (
            <p className="text-red-600 text-[13px] font-medium text-center">
              {formError}
            </p>
          )}
          {saveError && (
            <p className="text-red-600 text-[13px] font-medium text-center">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p className="text-green-700 text-[13px] font-medium text-center">
              {saveSuccess}
            </p>
          )}

          <div className="flex justify-center gap-5">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="bg-blue-600 text-white font-semibold text-[13px] px-8 h-9 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "ADD"}
            </button>
            <button
              onClick={handleNewEntry}
              className="bg-blue-600 text-white font-semibold text-[13px] px-8 h-9 rounded hover:bg-blue-700"
            >
              New Entry
            </button>
            <button className="bg-blue-600 text-white font-semibold text-[13px] px-8 h-9 rounded hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}