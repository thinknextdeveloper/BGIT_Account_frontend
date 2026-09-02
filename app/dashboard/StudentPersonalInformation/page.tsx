"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchAdmission,
  saveAdmission,
  startNewEntry,
  updateField,
  updateEduRow,
  updateDocRowStatus,
  getColleges,
  getCategories,
  getVillages,
  getDistricts,
  getTehsils,
  getGroupNames,
  getHostelNames,
  getRoomTypes,
  getBusRoutes,
  getStopages,
  lookupConcession,
  lookupHostelFee,
  lookupBusFee,
  fetchEduQualifications,
  saveEduQualifications,
  fetchDocumentStatus,
  saveDocumentStatus,
  deleteDocumentStatus,
  getPreviousCourses,
  getPreviousBoards,
  getInstitutions,
  AdmissionRecord,
  EduQualificationRow,
} from "@/store/slices/studentAdmission";

/* ------------------------------------------------------------------ */
/*  UI atoms                                                            */
/* ------------------------------------------------------------------ */

const inputCls = "w-full border border-gray-400 h-7 px-2 rounded-sm text-[12px] bg-white disabled:bg-gray-100";
const selectCls = inputCls;
const textAreaCls = "w-full border border-gray-400 px-2 py-1 rounded-sm text-[12px] bg-white resize-none";

function Field({ label, children, labelWidth = "w-32" }: { label: string; children: React.ReactNode; labelWidth?: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className={`${labelWidth} shrink-0 text-[12px] font-semibold text-gray-800`}>{label} :</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, disabled }: { value: string | number | undefined; onChange: (v: string) => void; disabled?: boolean }) {
  return <input type="text" className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} />;
}

function Select({ value, onChange, options, disabled }: { value: string | undefined; onChange: (v: string) => void; options: string[]; disabled?: boolean }) {
  return (
    <select className={selectCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      <option value=""></option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function DotsButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="h-7 w-7 shrink-0 bg-blue-600 text-white text-[12px] rounded-sm border border-blue-800">
      ...
    </button>
  );
}

const BLOOD_GROUPS = ["None", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const PREFERENCE_PLACEHOLDER = ["None"];

/* ------------------------------------------------------------------ */
/*  Registration tab                                                    */
/* ------------------------------------------------------------------ */

function RegistrationTab({
  record,
  set,
  colleges,
  categories,
  villages,
  districts,
  tehsils,
  hostelNames,
  roomTypes,
  busRoutes,
  stopages,
  dispatch,
}: any) {
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  const handleFacilityChange = (facility: "Hostel" | "Bus" | "None") => {
    set("Facility", facility);
    set("HostelName", "");
    set("RoomType", "");
    set("BusRoute", "");
    set("Stopage", "");
    set("HostelCharges", "");
    set("BusFee", "");
    if (facility === "Hostel") dispatch(getHostelNames({ collegeName: record?.CollegeName || "", batch: record?.Batch || "" }));
    if (facility === "Bus") dispatch(getBusRoutes({ session: record?.Session || "" }));
  };

  const handleHostelBusRouteChange = (value: string) => {
    if (record?.Facility === "Hostel") {
      set("HostelName", value);
      dispatch(getRoomTypes({ collegeName: record?.CollegeName || "", batch: record?.Batch || "", hostelName: value }));
    }
    if (record?.Facility === "Bus") {
      set("BusRoute", value);
      dispatch(getStopages({ session: record?.Session || "", route: value }));
    }
  };

  const handleRoomTypeStopageChange = (value: string) => {
    if (record?.Facility === "Hostel") {
      set("RoomType", value);
      dispatch(lookupHostelFee({ collegeName: record?.CollegeName || "", batch: record?.Batch, hostelName: record?.HostelName || "", roomType: value }));
    }
    if (record?.Facility === "Bus") {
      set("Stopage", value);
      dispatch(lookupBusFee({ session: record?.Session || "", route: record?.BusRoute || "", stopage: value }));
    }
  };

  const handleConcessionDetailChange = (value: string) => {
    set("ConcessionDetails", value);
    if (record?.CollegeName) dispatch(lookupConcession({ collegeName: record.CollegeName, concessionDetails: value }));
  };

  const handleSameAsPermanentChange = (checked: boolean) => {
    setSameAsPermanent(checked);
    if (checked && record?.PermanentAddress) set("CorrespondanceAddress", record.PermanentAddress);
    else if (!checked) set("CorrespondanceAddress", "");
  };

  const hostelBusOptions = record?.Facility === "Hostel" ? hostelNames : record?.Facility === "Bus" ? busRoutes : [];
  const roomTypeStopageOptions = record?.Facility === "Hostel" ? roomTypes : record?.Facility === "Bus" ? stopages : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
      {/* Column 1 */}
      <div className="flex flex-col gap-3">
        <fieldset className="bg-white/80 border border-gray-500 rounded-sm shadow p-3">
          <legend className="text-[12px] font-bold px-1">Student Detail</legend>
          <div className="flex flex-col gap-2">
            <Field label="College Name"><Select value={record?.CollegeName} onChange={(v) => set("CollegeName", v)} options={colleges} /></Field>
            <Field label="Course"><TextInput value={record?.Course} onChange={(v) => set("Course", v)} /></Field>
            <Field label="Class"><TextInput value={record?.Class} onChange={(v) => set("Class", v)} /></Field>
            <Field label="Batch"><TextInput value={record?.Batch} onChange={(v) => set("Batch", v)} /></Field>
            <Field label="Student ID No"><TextInput value={record?.IDNo} onChange={(v) => set("IDNo", v)} /></Field>
          </div>
        </fieldset>

        <fieldset className="bg-white/80 border border-gray-500 rounded-sm shadow p-3">
          <legend className="text-[12px] font-bold px-1">Facility</legend>
          <div className="flex gap-4 mb-2">
            {(["Hostel", "Bus", "None"] as const).map((f) => (
              <label key={f} className="flex items-center gap-1 text-[12px]">
                <input type="radio" checked={record?.Facility === f} onChange={() => handleFacilityChange(f)} />
                {f}
              </label>
            ))}
          </div>
          {record?.Facility && record.Facility !== "None" && (
            <div className="flex flex-col gap-2">
              <Select
                value={record?.Facility === "Hostel" ? record?.HostelName : record?.BusRoute}
                onChange={handleHostelBusRouteChange}
                options={hostelBusOptions}
              />
              <Select
                value={record?.Facility === "Hostel" ? record?.RoomType : record?.Stopage}
                onChange={handleRoomTypeStopageChange}
                options={roomTypeStopageOptions}
              />
            </div>
          )}
        </fieldset>

        <fieldset className="bg-white/80 border border-gray-500 rounded-sm shadow p-3">
          <legend className="text-[12px] font-bold px-1">Debit</legend>
          <div className="flex flex-col gap-2">
            <Field label="Concession Amt" labelWidth="w-28"><TextInput value={record?.ConcessionTotalAmount} onChange={(v) => set("ConcessionTotalAmount", v)} disabled /></Field>
            <Field label="Particulars" labelWidth="w-28"><TextInput value={record?.Facility === "Hostel" ? "Hostel Fee" : record?.Facility === "Bus" ? "Bus Fee" : ""} onChange={() => {}} disabled /></Field>
          </div>
          <div className="h-40 mt-2 border border-gray-400 bg-gray-300 rounded-sm" />
          <Field label="Particulars" labelWidth="w-24"><TextInput value="" onChange={() => {}} disabled /></Field>
          <Field label="Total" labelWidth="w-24"><TextInput value="" onChange={() => {}} disabled /></Field>
        </fieldset>
      </div>

      {/* Column 2 */}
      <div className="flex flex-col gap-3">
        <fieldset className="bg-white/80 border border-gray-500 rounded-sm shadow p-3">
          <legend className="text-[12px] font-bold px-1">Admission Details</legend>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-[12px] font-semibold">
              <input type="checkbox" checked={record?.LateralEntry === true || record?.LateralEntry === "Yes"} onChange={(e) => set("LateralEntry", e.target.checked)} />
              Lateral Entry
            </label>
            <div className="flex gap-4 text-[12px]">
              <span className="font-semibold">Student Type :</span>
              <label className="flex items-center gap-1"><input type="radio" checked={record?.StudentType === "Old"} onChange={() => set("StudentType", "Old")} />Old</label>
              <label className="flex items-center gap-1"><input type="radio" checked={record?.StudentType === "New"} onChange={() => set("StudentType", "New")} />New</label>
            </div>
            <Field label="First Prefrence"><Select value={record?.FirstPreference} onChange={(v) => set("FirstPreference", v)} options={PREFERENCE_PLACEHOLDER} /></Field>
            <Field label="Second Prefrence"><Select value={record?.SecondPreference} onChange={(v) => set("SecondPreference", v)} options={PREFERENCE_PLACEHOLDER} /></Field>
            <Field label="Third Prefrence"><Select value={record?.ThirdPreference} onChange={(v) => set("ThirdPreference", v)} options={PREFERENCE_PLACEHOLDER} /></Field>
            <Field label="FourthPrefrence"><Select value={record?.FourthPreference} onChange={(v) => set("FourthPreference", v)} options={PREFERENCE_PLACEHOLDER} /></Field>
            <Field label="Semester"><TextInput value={record?.Semester} onChange={(v) => set("Semester", v)} /></Field>
            <Field label="Session"><TextInput value={record?.Session} onChange={(v) => set("Session", v)} /></Field>
            <Field label="Class Roll No"><TextInput value={record?.ClassRollNo} onChange={(v) => set("ClassRollNo", v)} /></Field>
            <Field label="Fee Category"><Select value={record?.Category} onChange={(v) => set("Category", v)} options={categories} /></Field>
            <Field label="Religion"><TextInput value={record?.Religion} onChange={(v) => set("Religion", v)} /></Field>
            <Field label="Mode of Admission"><TextInput value={record?.Quota} onChange={(v) => set("Quota", v)} /></Field>
            <Field label="Scheme"><TextInput value={record?.Scheme} onChange={(v) => set("Scheme", v)} /></Field>
            <Field label="Concession"><Select value={record?.Concession} onChange={(v) => set("Concession", v)} options={["Yes", "No"]} /></Field>
          </div>
        </fieldset>

        <fieldset className="bg-white/80 border border-gray-500 rounded-sm shadow p-3">
          <div className="flex flex-col gap-2">
            <Field label="Total Amt Payable" labelWidth="w-36"><TextInput value={record?.ConcessionTotalAmount} onChange={() => {}} disabled /></Field>
            <Field label="Concession Ref. Letter" labelWidth="w-36"><TextInput value={record?.ConcessionReferenceLetterNo} onChange={(v) => set("ConcessionReferenceLetterNo", v)} /></Field>
            <Field label="P.O.O" labelWidth="w-36"><TextInput value={record?.PO} onChange={(v) => set("PO", v)} /></Field>
            <Field label="State" labelWidth="w-36">
              <div className="flex gap-1">
                <TextInput value={record?.State} onChange={(v) => set("State", v)} />
                <DotsButton onClick={() => {}} />
              </div>
            </Field>
            <Field label="Locality" labelWidth="w-36"><TextInput value={record?.Locality} onChange={(v) => set("Locality", v)} /></Field>
          </div>
        </fieldset>
      </div>

      {/* Columns 3–4: Personal + Address */}
      <div className="flex flex-col gap-3 lg:col-span-2">
        <fieldset className="bg-white/80 border border-gray-500 rounded-sm shadow p-3">
          <legend className="text-[12px] font-bold px-1">Personal Details</legend>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <Field label="Admission Date" labelWidth="w-36">
              <input type="date" className={inputCls} value={record?.AdmissionDate ? String(record.AdmissionDate).slice(0, 10) : ""} onChange={(e) => set("AdmissionDate", e.target.value)} />
            </Field>
            <Field label="Student Name" labelWidth="w-36"><TextInput value={record?.StudentName} onChange={(v) => set("StudentName", v)} /></Field>
            <Field label="Father Name" labelWidth="w-36"><TextInput value={record?.FatherName} onChange={(v) => set("FatherName", v)} /></Field>
            <Field label="Mother Name" labelWidth="w-36"><TextInput value={record?.MotherName} onChange={(v) => set("MotherName", v)} /></Field>
            <Field label="Blood Group" labelWidth="w-36"><Select value={record?.BloodGroup} onChange={(v) => set("BloodGroup", v)} options={BLOOD_GROUPS} /></Field>
            <Field label="Email ID" labelWidth="w-36"><TextInput value={record?.EmailID} onChange={(v) => set("EmailID", v)} /></Field>
            <Field label="DOB" labelWidth="w-36">
              <input type="date" className={inputCls} value={record?.DOB ? String(record.DOB).slice(0, 10) : ""} onChange={(e) => set("DOB", e.target.value)} />
            </Field>
            <Field label="Sex" labelWidth="w-36"><Select value={record?.Sex} onChange={(v) => set("Sex", v)} options={["Male", "Female", "Other"]} /></Field>
            <Field label="Phone No" labelWidth="w-36"><TextInput value={record?.PhoneNo} onChange={(v) => set("PhoneNo", v)} /></Field>
            <Field label="Student Mobile No" labelWidth="w-36"><TextInput value={record?.StudentMobileNo} onChange={(v) => set("StudentMobileNo", v)} /></Field>
            <Field label="Father Mobile No" labelWidth="w-36"><TextInput value={record?.FatherMobileNo} onChange={(v) => set("FatherMobileNo", v)} /></Field>
            <Field label="Mother Mobile No" labelWidth="w-36"><TextInput value={record?.MotherMobileNo} onChange={(v) => set("MotherMobileNo", v)} /></Field>
            <Field label="FatherDesignation" labelWidth="w-36"><TextInput value={record?.FatherDesignation} onChange={(v) => set("FatherDesignation", v)} /></Field>
            <Field label="Father Occupation" labelWidth="w-36"><TextInput value={record?.FatherOccupation} onChange={(v) => set("FatherOccupation", v)} /></Field>
            <Field label="Mother Occupation" labelWidth="w-36"><TextInput value={record?.MotherOccupation} onChange={(v) => set("MotherOccupation", v)} /></Field>
          </div>
          <div className="mt-2">
            <label className="text-[12px] font-semibold">Permanent Address :</label>
            <textarea className={textAreaCls} rows={2} value={record?.PermanentAddress ?? ""} onChange={(e) => set("PermanentAddress", e.target.value)} />
          </div>
        </fieldset>

        <fieldset className="bg-white/80 border border-gray-500 rounded-sm shadow p-3">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-[12px]">
              <input type="checkbox" checked={sameAsPermanent} onChange={(e) => handleSameAsPermanentChange(e.target.checked)} />
              If Permanent and Corr. Address are Same, Please Check
            </label>
            <label className="text-[12px] font-semibold">Correspondance Address :</label>
            <textarea className={textAreaCls} rows={2} value={record?.CorrespondanceAddress ?? ""} onChange={(e) => set("CorrespondanceAddress", e.target.value)} disabled={sameAsPermanent} />

            <Field label="Village" labelWidth="w-20">
              <div className="flex gap-1"><Select value={record?.Village} onChange={(v) => set("Village", v)} options={villages} /><DotsButton onClick={() => {}} /></div>
            </Field>
            <Field label="Tehsil" labelWidth="w-20">
              <div className="flex gap-1"><Select value={record?.Tehsil} onChange={(v) => set("Tehsil", v)} options={tehsils} /><DotsButton onClick={() => {}} /></div>
            </Field>
            <Field label="City/Town" labelWidth="w-20">
              <div className="flex gap-1"><TextInput value={record?.City} onChange={(v) => set("City", v)} /><DotsButton onClick={() => {}} /></div>
            </Field>
            <Field label="District" labelWidth="w-20">
              <div className="flex gap-1"><Select value={record?.District} onChange={(v) => set("District", v)} options={districts} /><DotsButton onClick={() => {}} /></div>
            </Field>
          </div>
        </fieldset>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Academic tab                                                        */
/* ------------------------------------------------------------------ */

const EDU_COLUMNS: { key: keyof EduQualificationRow; label: string; editable: boolean }[] = [
  { key: "ExamPassed", label: "Exam Passed", editable: false },
  { key: "Course", label: "Course", editable: true },
  { key: "SubjectsStudied", label: "SubjectsStudied", editable: true },
  { key: "BoardUniv", label: "Board/University", editable: true },
  { key: "YearOfPassing", label: "YearofPassing", editable: true },
  { key: "MarksObtained", label: "Marks\nObtained", editable: true },
  { key: "TotalMarks", label: "Total Marks", editable: true },
  { key: "Percentage", label: "Percentage", editable: true },
  { key: "Remarks", label: "Remarks", editable: true },
];

function AcademicTab({
  record,
  set,
  eduQualifications,
  documentStatus,
  previousCourses,
  previousBoards,
  institutions,
  groupNames,
  dispatch,
}: any) {
  const idNo = record?.IDNo;

  const handleEduChange = (index: number, field: keyof EduQualificationRow, value: string) => {
    dispatch(updateEduRow({ index, field, value }));
  };

  const handleDocStatusChange = (index: number, status: string) => {
    dispatch(updateDocRowStatus({ index, status }));
  };

  const handleUpdate = () => {
    if (!idNo) return;
    dispatch(saveEduQualifications({ idNo, rows: eduQualifications }));
    dispatch(saveDocumentStatus({ idNo, studentName: record?.StudentName || "", rows: documentStatus }));
  };

  const handleDeleteDocsStatus = () => {
    if (!idNo) return;
    dispatch(deleteDocumentStatus(idNo));
  };

  const handleExport = () => {
    // Client-side CSV export of the education-qualification grid.
    const header = EDU_COLUMNS.map((c) => c.label.replace("\n", " ")).join(",");
    const rows = eduQualifications.map((r: EduQualificationRow) =>
      EDU_COLUMNS.map((c) => `"${(r[c.key] ?? "").toString().replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "education-qualifications.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3">
      <fieldset className="bg-white/80 border border-gray-500 rounded-sm shadow p-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <Field label="Last Institution Attended" labelWidth="w-44">
            <div className="flex gap-1"><Select value={record?.InstitutionLastAttended} onChange={(v) => set("InstitutionLastAttended", v)} options={institutions} /><DotsButton onClick={() => {}} /></div>
          </Field>
          <Field label="Board Registration No." labelWidth="w-44"><TextInput value={record?.BoardRegistrationNo} onChange={(v) => set("BoardRegistrationNo", v)} /></Field>

          <Field label="Entrance Test 1" labelWidth="w-44"><TextInput value={record?.EntranceTest1} onChange={(v) => set("EntranceTest1", v)} /></Field>
          <Field label="Entrance Test 1 Roll No." labelWidth="w-44"><TextInput value={record?.EntranceTest1RollNo} onChange={(v) => set("EntranceTest1RollNo", v)} /></Field>

          <Field label="Entrance Test 1 Rank" labelWidth="w-44"><TextInput value={record?.EntranceTest1Rank} onChange={(v) => set("EntranceTest1Rank", v)} /></Field>
          <Field label="Entrance Test 2 Roll No." labelWidth="w-44"><TextInput value={record?.EntranceTest2RollNo} onChange={(v) => set("EntranceTest2RollNo", v)} /></Field>

          <Field label="Entrance Test 2" labelWidth="w-44"><TextInput value={record?.EntranceTest2} onChange={(v) => set("EntranceTest2", v)} /></Field>
          <Field label="Entrance Test 2 Rank" labelWidth="w-44"><TextInput value={record?.EntranceTest2Rank} onChange={(v) => set("EntranceTest2Rank", v)} /></Field>

          <Field label="Group Name" labelWidth="w-44">
            <div className="flex gap-1"><Select value={record?.GroupName} onChange={(v) => set("GroupName", v)} options={groupNames} /><DotsButton onClick={() => {}} /></div>
          </Field>
          <Field label="Uni Roll No" labelWidth="w-44"><TextInput value={record?.UniRollNo} onChange={(v) => set("UniRollNo", v)} /></Field>
        </div>
      </fieldset>

      <fieldset className="bg-white/80 border border-gray-500 rounded-sm shadow p-3">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-200">
                {EDU_COLUMNS.map((c) => (
                  <th key={c.key} className="border border-gray-300 px-2 py-1 whitespace-pre-line text-left">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eduQualifications.map((row: EduQualificationRow, i: number) => (
                <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                  {EDU_COLUMNS.map((c) => (
                    <td key={c.key} className="border border-gray-300 px-1 py-0.5">
                      {c.editable ? (
                        c.key === "Course" ? (
                          <select className="w-full text-[11px] border-0" value={row.Course ?? ""} onChange={(e) => handleEduChange(i, "Course", e.target.value)}>
                            <option value=""></option>
                            {previousCourses.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : c.key === "BoardUniv" ? (
                          <select className="w-full text-[11px] border-0" value={row.BoardUniv ?? ""} onChange={(e) => handleEduChange(i, "BoardUniv", e.target.value)}>
                            <option value=""></option>
                            {previousBoards.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="w-full text-[11px] border-0 outline-none"
                            value={(row[c.key] as string) ?? ""}
                            onChange={(e) => handleEduChange(i, c.key, e.target.value)}
                          />
                        )
                      ) : (
                        <span className="px-1">{row.ExamPassed}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>

      {documentStatus?.length > 0 && (
        <fieldset className="bg-white/80 border border-gray-500 rounded-sm shadow p-3">
          <legend className="text-[12px] font-bold px-1">Documents Required</legend>
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-2 py-1 text-left">Sr No</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Documents Required</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {documentStatus.map((row: any, i: number) => (
                <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="border border-gray-300 px-2">{row.SerialNo}</td>
                  <td className="border border-gray-300 px-2">{row.DocumentsRequired}</td>
                  <td className="border border-gray-300 px-1">
                    <select className="w-full text-[11px] border-0" value={row.Status ?? ""} onChange={(e) => handleDocStatusChange(i, e.target.value)}>
                      <option value="NA">NA</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </fieldset>
      )}

      <div className="flex flex-wrap gap-3">
        <button className="bg-gradient-to-b from-blue-500 to-blue-800 text-white text-[12px] font-semibold px-4 h-9 rounded-sm border border-blue-900 shadow">Course</button>
        <button className="bg-gradient-to-b from-blue-500 to-blue-800 text-white text-[12px] font-semibold px-4 h-9 rounded-sm border border-blue-900 shadow">Board/Univ</button>
        <button onClick={handleExport} className="bg-gradient-to-b from-blue-500 to-blue-800 text-white text-[12px] font-semibold px-4 h-9 rounded-sm border border-blue-900 shadow">Export</button>
        <button onClick={handleUpdate} className="bg-gradient-to-b from-green-500 to-green-700 text-white text-[12px] font-semibold px-4 h-9 rounded-sm border border-green-900 shadow">Update</button>
        <button onClick={handleDeleteDocsStatus} className="bg-white text-red-700 text-[12px] font-semibold px-4 h-9 rounded-sm border-2 border-red-500 shadow">Delete Docs Status</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export default function StudentRegistrationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const admission = useSelector((state: RootState) => state.admission);

  const {
    record,
    colleges,
    categories,
    villages,
    districts,
    tehsils,
    groupNames,
    hostelNames,
    roomTypes,
    busRoutes,
    stopages,
    eduQualifications,
    documentStatus,
    previousCourses,
    previousBoards,
    institutions,
    loading,
    saving,
    error,
  } = admission;

  const [activeTab, setActiveTab] = useState<"registration" | "academic">("registration");
  const [idNoInput, setIdNoInput] = useState("");

  useEffect(() => {
    dispatch(getColleges());
    dispatch(getCategories());
    dispatch(getVillages());
    dispatch(getDistricts());
    dispatch(getTehsils());
    dispatch(getPreviousCourses());
    dispatch(getPreviousBoards());
    dispatch(getInstitutions());
  }, [dispatch]);

  useEffect(() => {
    if (record?.CollegeName) dispatch(getGroupNames({ collegeName: record.CollegeName }));
  }, [record?.CollegeName, dispatch]);

  const set = (field: keyof AdmissionRecord, value: any) => dispatch(updateField({ field, value }));

  const handleDisplay = () => {
    if (!idNoInput.trim()) return;
    dispatch(fetchAdmission(idNoInput.trim())).then(() => {
      dispatch(fetchEduQualifications(idNoInput.trim()));
      dispatch(fetchDocumentStatus({ idNo: idNoInput.trim() }));
    });
  };

  const handleClose = () => {
    setIdNoInput("");
    dispatch(startNewEntry());
  };

  const handleSave = () => {
    if (!record?.IDNo) return;
    dispatch(saveAdmission(record));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-300 p-3 text-[13px] text-gray-800">
      {/* Tabs */}
      <div className="flex gap-1 mb-2">
        {(["registration", "academic"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-[12px] font-semibold rounded-t-sm border border-b-0 ${
              activeTab === tab ? "bg-white/90 border-gray-500" : "bg-sky-200 border-sky-300 text-gray-600"
            }`}
          >
            {tab === "registration" ? "Registration" : "Academic"}
          </button>
        ))}
      </div>

      <div className="bg-white/60 border border-gray-500 rounded-sm shadow p-3">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-3">
          <span className="font-bold text-[12px]">Student ID No :</span>
          <input
            type="text"
            className="border border-gray-400 h-7 px-2 rounded-sm text-[12px] w-64"
            value={idNoInput}
            onChange={(e) => setIdNoInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDisplay()}
          />
          <button onClick={handleDisplay} disabled={loading} className="bg-gradient-to-b from-blue-500 to-blue-800 text-white text-[12px] font-semibold px-4 h-8 rounded-sm border border-blue-900 shadow disabled:opacity-50">
            {loading ? "Loading..." : "Display"}
          </button>
          <button onClick={handleClose} className="bg-white text-blue-800 text-[12px] font-semibold px-4 h-8 rounded-sm border-2 border-blue-600 shadow hover:bg-blue-50">Close</button>
          <div className="flex-1" />
          <button onClick={handleSave} disabled={saving} className="bg-gradient-to-b from-green-500 to-green-700 text-white text-[12px] font-semibold px-4 h-8 rounded-sm border border-green-900 shadow disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {error && (
          <div className="mb-3 bg-red-100 border border-red-400 text-red-800 text-[12px] font-semibold px-3 py-2 rounded-sm">{error}</div>
        )}

        {activeTab === "registration" ? (
          <RegistrationTab
            record={record}
            set={set}
            colleges={colleges}
            categories={categories}
            villages={villages}
            districts={districts}
            tehsils={tehsils}
            hostelNames={hostelNames}
            roomTypes={roomTypes}
            busRoutes={busRoutes}
            stopages={stopages}
            dispatch={dispatch}
          />
        ) : (
          <AcademicTab
            record={record}
            set={set}
            eduQualifications={eduQualifications}
            documentStatus={documentStatus}
            previousCourses={previousCourses}
            previousBoards={previousBoards}
            institutions={institutions}
            groupNames={groupNames}
            dispatch={dispatch}
          />
        )}
      </div>
    </div>
  );
}