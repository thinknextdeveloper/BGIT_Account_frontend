// "use client";

// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "../../../store/store";
// import { reduxApiClient } from "../../../services/reduxservices";
// import { displayStudents, updateStudentField } from "./../../../store/slices/studentDetailsSlice";

// const getSexDisplayValue = (raw: unknown): string => {
//   if (!raw) return "";
//   const normalized = String(raw).trim().toUpperCase();

//   if (normalized === "M" || normalized === "MALE") return "Male";
//   if (normalized === "F" || normalized === "FEMALE") return "Female";

//   return "";
// };

// const EDITABLE_DROPDOWNS: Record<string, string[]> = {
//   Sex: ["Male", "Female"],
//   Category: ["BC", "Fee waiver", "General", "NRI", "OBC", "SC", "SC to General", "ST"],
//   Scheme: ["Economically Weak", "General", "Lateral Entry", "Physically Handicap Scheme", "Through Counseling", "Women"],
// };

// export default function StudentDetailsPage() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { rows, loading, error } = useSelector((state: RootState) => state.studentDetails);

//   const [search, setSearch] = useState({ collegeName: "", course: "", batch: "" });
//   const [colleges, setColleges] = useState<string[]>([]);
//   const [courses, setCourses] = useState<string[]>([]);
//   const [batches, setBatches] = useState<string[]>([]);
//   const [savingCell, setSavingCell] = useState<string | null>(null);

//   useEffect(() => {
//     reduxApiClient.get("master-course/colleges").then((res) => {
//       if (res.success) setColleges(res.data.data);
//     });
//   }, []);

//   const handleCollegeChange = async (value: string) => {
//     setSearch({ collegeName: value, course: "", batch: "" });
//     setCourses([]);
//     setBatches([]);

//     if (value) {
//       const res = await reduxApiClient.get("master-course/courses", { collegeName: value });
//       if (res.success) setCourses(res.data.data);
//     }
//   };

//   const handleCourseChange = async (value: string) => {
//     setSearch((prev) => ({ ...prev, course: value, batch: "" }));
//     setBatches([]);

//     if (value) {
//       const res = await reduxApiClient.get("master-course/batches", {
//         collegeName: search.collegeName,
//         course: value,
//       });
//       if (res.success) setBatches(res.data.data);
//     }
//   };

//   const handleShow = () => {
//     if (!search.collegeName) return;
//     dispatch(displayStudents(search));
//   };

//   const handleExportToExcel = async () => {
//     if (rows.length === 0) return;
//     const XLSX = await import("xlsx");
//     const worksheet = XLSX.utils.json_to_sheet(rows);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
//     XLSX.writeFile(workbook, "StudentDetails.xlsx");
//   };

//   const handleFieldChange = async (idNo: number, field: string, value: string) => {
//     const cellKey = `${idNo}-${field}`;
//     setSavingCell(cellKey);
//     await dispatch(updateStudentField({ idNo, field, value }));
//     setSavingCell(null);
//   };

//   const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

//   const renderCellValue = (value: unknown): string => {
//     if (value === null || value === undefined) return "";
//     if (typeof value === "object") return "[binary]";
//     return String(value);
//   };

//   return (
//     <div className="min-h-screen bg-[#ECECEC] p-6">
//       <fieldset className="rounded border border-gray-400 bg-white p-5 shadow">
//         <legend className="px-2 text-lg font-bold text-black">Search</legend>

//         <div className="grid grid-cols-12 gap-4 items-end">
//           <div className="col-span-4">
//             <label className="mb-1 block font-semibold text-black">College Name</label>
//             <select
//               value={search.collegeName}
//               onChange={(e) => handleCollegeChange(e.target.value)}
//               className="h-10 w-full rounded border border-gray-400 bg-white px-3 text-black outline-none focus:border-blue-600"
//             >
//               <option value="">-- Select --</option>
//               {colleges.map((c) => (
//                 <option key={c} value={c}>
//                   {c}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="col-span-3">
//             <label className="mb-1 block font-semibold text-black">Course</label>
//             <select
//               value={search.course}
//               onChange={(e) => handleCourseChange(e.target.value)}
//               disabled={!search.collegeName}
//               className="h-10 w-full rounded border border-gray-400 bg-white px-3 text-black outline-none focus:border-blue-600 disabled:bg-gray-100"
//             >
//               <option value="">-- Select --</option>
//               {courses.map((c) => (
//                 <option key={c} value={c}>
//                   {c}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="col-span-2">
//             <label className="mb-1 block font-semibold text-black">Batch</label>
//             <select
//               value={search.batch}
//               onChange={(e) => setSearch((prev) => ({ ...prev, batch: e.target.value }))}
//               disabled={!search.course}
//               className="h-10 w-full rounded border border-gray-400 bg-white px-3 text-black outline-none focus:border-blue-600 disabled:bg-gray-100"
//             >
//               <option value="">-- Select --</option>
//               {batches.map((b) => (
//                 <option key={b} value={b}>
//                   {b}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="col-span-3 flex gap-3">
//             <button
//               onClick={handleShow}
//               disabled={!search.collegeName}
//               className="h-10 flex-1 rounded bg-blue-700 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
//             >
//               Show
//             </button>
//             <button
//               onClick={handleExportToExcel}
//               className="h-10 flex-1 rounded bg-green-700 font-semibold text-white hover:bg-green-800"
//             >
//               Export To Excel
//             </button>
//           </div>
//         </div>
//       </fieldset>

//       {error && <div className="mt-3 font-medium text-red-600">{error}</div>}

//       <div className="mt-5 text-lg font-semibold text-black">
//         {rows.length === 0 ? "No records found" : `Total Records : ${rows.length}`}
//       </div>

//       <div className="mt-3 overflow-auto rounded border border-gray-300 bg-white shadow max-h-[500px]">
//         <table className="w-full border-collapse text-xs">
//           <thead className="sticky top-0 bg-gray-200">
//             <tr>
//               {columns.map((col) => (
//                 <th key={col} className="border px-2 py-2 text-left text-black">
//                   {col}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan={columns.length || 1} className="py-6 text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : rows.length === 0 ? (
//               <tr>
//                 <td colSpan={columns.length || 1} className="py-6 text-center text-black">
//                   No Records Found
//                 </td>
//               </tr>
//             ) : (
//               rows.map((row, index) => (
//                 <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
//                   {columns.map((col) => {
//                     const dropdownOptions = EDITABLE_DROPDOWNS[col];
//                     const cellKey = `${row.IDNo}-${col}`;
//                     const isSaving = savingCell === cellKey;

//                     if (dropdownOptions) {
//                       const displayValue =
//                         col === "Sex" ? getSexDisplayValue(row[col]) : row[col] ?? "";

//                       return (
//                         <td key={col} className="border px-1 py-1 whitespace-nowrap">
//                           <select
//                             value={displayValue}
//                             disabled={isSaving}
//                             onChange={(e) =>
//                               handleFieldChange(row.IDNo, col, e.target.value)
//                             }
//                             className="h-7 min-w-[90px] rounded-none border-none bg-transparent px-1 font-medium outline-none disabled:opacity-60 cursor-pointer"
//                             style={{ color: "#1d4ed8" }}
//                           >
//                             <option value="" style={{ color: "#1d4ed8" }}>
//                               Select
//                             </option>
//                            {dropdownOptions.map((opt) => (
//   <option key={opt} value={opt} style={{ color: "#1d4ed8" }}>
//     {opt}
//   </option>
// ))}
//                           </select>
//                         </td>
//                       );
//                     }

//                     return (
//                       <td key={col} className="border px-2 py-1 text-black">
//                         {renderCellValue(row[col])}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="mt-8 flex justify-center gap-4">
//         <button className="rounded bg-blue-700 px-6 py-2 font-semibold text-white hover:bg-blue-800">
//           Save New Record
//         </button>
//         <button className="rounded bg-red-700 px-6 py-2 font-semibold text-white hover:bg-red-800">
//           Close
//         </button>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { reduxApiClient } from "../../../services/reduxservices";
import {
  displayStudents,
  updateStudentField,
  createStudent,
} from "./../../../store/slices/studentDetailsSlice";

const getSexDisplayValue = (raw: unknown): string => {
  if (!raw) return "";
  const normalized = String(raw).trim().toUpperCase();
  if (normalized === "M" || normalized === "MALE") return "Male";
  if (normalized === "F" || normalized === "FEMALE") return "Female";
  return "";
};

const EDITABLE_DROPDOWNS: Record<string, string[]> = {
  Sex: ["Male", "Female"],
  Category: ["BC", "Fee waiver", "General", "NRI", "OBC", "SC", "SC to General", "ST"],
  Scheme: ["Economically Weak", "General", "Lateral Entry", "Physically Handicap Scheme", "Through Counseling", "Women"],
};

// Same order as the backend `DISPLAY_COLUMNS` in admissionsModel.js, so the
// grid header (and the blank "add record" row) render even before any Show.
const ADMISSION_COLUMNS = [
  "CollegeName", "Course", "Batch", "Class", "LateralEntry", "AdmissionDate",
  "IDNo", "ClassRollNo", "StudentName", "FatherName", "MotherName", "Sex", "DOB",
  "FatherOccupation", "MotherOccupation", "FatherDesignation", "CorrespondanceAddress",
  "PermanentAddress", "EmailID", "PhoneNo", "StudentMobileNo", "FatherMobileNo",
  "MotherMobileNo", "Facility", "BusRoute", "RouteID", "Stopage", "StopageID",
  "HostelName", "RoomType", "HostelCharges", "BusFee", "StudentType", "Concession",
  "ConcessionDetails", "ConcessionPerc", "ConcessionTotalAmount", "BloodGroup",
  "Category", "Locality", "Medium", "Quota", "FeeWaiverScheme", "FirstPreference",
  "SecondPreference", "ThirdPreference", "FourthPreference", "Scheme",
  "InstitutionLastAttended", "University", "BoardRegistrationNo", "State", "Religion",
  "SeatConfirmed", "City", "GroupName", "UniRollNo", "ConcessionReferenceLetterNo",
  "Village", "VPO", "PO", "Tehsil", "District", "GuardianAddress", "GuardianContactNo",
  "Nationality", "PreviousMedicalIllness", "OtherEntranceTest", "NSS", "Sports",
  "OtherAchievements", "UserID", "EnquiryNo", "EnquiryDate", "RegistrationNo",
  "RegistrationDate", "CardIssued", "CardIssuedDate", "ValidUpTo", "LastExam", "Board",
  "LastExamPerc", "Newspaper", "ThirdPerson", "CableTV", "Student", "StaffMember",
  "FlexBoard", "Pamphlet", "Comments", "ThirdPersonName", "ThirdPersonDesignation",
  "ThirdPersonAddress", "ThirdPersonContactNo", "CableTVChannel", "ReferenceStudentClass",
  "StaffMemberName", "StaffMemberDesignation", "NewspaperName", "CommentsDetail",
  "Locked", "SmartCardIssued", "SmartCardIssuedDate", "EntranceTest1",
  "EntranceTest1RollNo", "EntranceTest1Rank", "EntranceTest2", "EntranceTest2RollNo",
  "EntranceTest2Rank",
];

const DATE_FIELDS = ["AdmissionDate", "DOB", "EnquiryDate", "RegistrationDate", "CardIssuedDate", "ValidUpTo", "SmartCardIssuedDate"];
const NUMBER_FIELDS = ["ClassRollNo", "HostelCharges", "BusFee", "ConcessionPerc", "ConcessionTotalAmount", "EnquiryNo", "LastExamPerc"];
const YESNO_FIELDS = ["LateralEntry", "Concession", "CardIssued", "Locked", "SmartCardIssued", "Newspaper", "ThirdPerson", "CableTV", "Student", "StaffMember", "FlexBoard", "Pamphlet", "SeatConfirmed", "NSS"];
const REQUIRED_NEW_FIELDS = ["IDNo", "StudentName", "CollegeName", "Course", "Batch", "Class"];

export default function StudentDetailsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { rows, loading, saving, error } = useSelector((state: RootState) => state.studentDetails);

  const [search, setSearch] = useState({ collegeName: "", course: "", batch: "" });
  const [colleges, setColleges] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [savingCell, setSavingCell] = useState<string | null>(null);

  // ---- New-record row state ----
  const [newRow, setNewRow] = useState<Record<string, string>>({});
  const [newCourses, setNewCourses] = useState<string[]>([]);
  const [newBatches, setNewBatches] = useState<string[]>([]);
  const [newRowError, setNewRowError] = useState<string | null>(null);

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
  }, []);

  const handleCollegeChange = async (value: string) => {
    setSearch({ collegeName: value, course: "", batch: "" });
    setCourses([]);
    setBatches([]);
    if (value) {
      const res = await reduxApiClient.get("master-course/courses", { collegeName: value });
      if (res.success) setCourses(res.data.data);
    }
  };

  const handleCourseChange = async (value: string) => {
    setSearch((prev) => ({ ...prev, course: value, batch: "" }));
    setBatches([]);
    if (value) {
      const res = await reduxApiClient.get("master-course/batches", {
        collegeName: search.collegeName,
        course: value,
      });
      if (res.success) setBatches(res.data.data);
    }
  };

  const handleShow = () => {
    if (!search.collegeName) return;
    dispatch(displayStudents(search));
  };

  const handleExportToExcel = async () => {
    if (rows.length === 0) return;
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "StudentDetails.xlsx");
  };

  const handleFieldChange = async (idNo: number, field: string, value: string) => {
    const cellKey = `${idNo}-${field}`;
    setSavingCell(cellKey);
    await dispatch(updateStudentField({ idNo, field, value }));
    setSavingCell(null);
  };

  const columns = ADMISSION_COLUMNS;

  const renderCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return "[binary]";
    return String(value);
  };

  // ---- New-record row helpers ----
  const updateNewRow = (field: string, value: string) => {
    setNewRow((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewCollegeChange = async (value: string) => {
    setNewRow((prev) => ({ ...prev, CollegeName: value, Course: "", Batch: "" }));
    setNewCourses([]);
    setNewBatches([]);
    if (value) {
      const res = await reduxApiClient.get("master-course/courses", { collegeName: value });
      if (res.success) setNewCourses(res.data.data);
    }
  };

  const handleNewCourseChange = async (value: string) => {
    setNewRow((prev) => ({ ...prev, Course: value, Batch: "" }));
    setNewBatches([]);
    if (value && newRow.CollegeName) {
      const res = await reduxApiClient.get("master-course/batches", {
        collegeName: newRow.CollegeName,
        course: value,
      });
      if (res.success) setNewBatches(res.data.data);
    }
  };

  const resetNewRow = () => {
    setNewRow({});
    setNewCourses([]);
    setNewBatches([]);
    setNewRowError(null);
  };

  const handleSaveNewRecord = async () => {
    setNewRowError(null);

    const missing = REQUIRED_NEW_FIELDS.filter((f) => !newRow[f] || String(newRow[f]).trim() === "");
    if (missing.length) {
      setNewRowError(`Please fill: ${missing.join(", ")}`);
      return;
    }
    if (isNaN(Number(newRow.IDNo))) {
      setNewRowError("ID No. must be numeric");
      return;
    }

    const payload: Record<string, any> = { ...newRow, IDNo: Number(newRow.IDNo) };
    const result: any = await dispatch(createStudent(payload));

    if (createStudent.rejected.match(result)) {
      setNewRowError(result.payload || "Failed to save record");
      return;
    }
    resetNewRow();
  };

  const renderNewRowCell = (col: string) => {
    if (col === "CollegeName") {
      return (
        <select
          value={newRow.CollegeName || ""}
          onChange={(e) => handleNewCollegeChange(e.target.value)}
          className="h-8 min-w-[150px] border-none bg-transparent px-1 text-blue-700 outline-none"
        >
          <option value="">Select</option>
          {colleges.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      );
    }
    if (col === "Course") {
      return (
        <select
          value={newRow.Course || ""}
          onChange={(e) => handleNewCourseChange(e.target.value)}
          disabled={!newRow.CollegeName}
          className="h-8 min-w-[150px] border-none bg-transparent px-1 text-blue-700 outline-none disabled:opacity-50"
        >
          <option value="">Select</option>
          {newCourses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      );
    }
    if (col === "Batch") {
      return (
        <select
          value={newRow.Batch || ""}
          onChange={(e) => updateNewRow("Batch", e.target.value)}
          disabled={!newRow.Course}
          className="h-8 min-w-[90px] border-none bg-transparent px-1 text-blue-700 outline-none disabled:opacity-50"
        >
          <option value="">Select</option>
          {newBatches.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      );
    }
    if (EDITABLE_DROPDOWNS[col] || col === "Sex") {
      const options = col === "Sex" ? EDITABLE_DROPDOWNS.Sex : EDITABLE_DROPDOWNS[col];
      return (
        <select
          value={newRow[col] || ""}
          onChange={(e) => updateNewRow(col, e.target.value)}
          className="h-8 min-w-[90px] border-none bg-transparent px-1 text-blue-700 outline-none"
        >
          <option value="">Select</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    if (YESNO_FIELDS.includes(col)) {
      return (
        <select
          value={newRow[col] || ""}
          onChange={(e) => updateNewRow(col, e.target.value)}
          className="h-8 min-w-[70px] border-none bg-transparent px-1 text-blue-700 outline-none"
        >
          <option value="">--</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      );
    }
    if (DATE_FIELDS.includes(col)) {
      return (
        <input
          type="date"
          value={newRow[col] || ""}
          onChange={(e) => updateNewRow(col, e.target.value)}
          className="h-8 w-[130px] border-none bg-transparent px-1 outline-none"
        />
      );
    }
    if (NUMBER_FIELDS.includes(col) || col === "IDNo") {
      return (
        <input
          type="number"
          value={newRow[col] || ""}
          onChange={(e) => updateNewRow(col, e.target.value)}
          className="h-8 w-[100px] border-none bg-transparent px-1 outline-none"
        />
      );
    }
    return (
      <input
        type="text"
        value={newRow[col] || ""}
        onChange={(e) => updateNewRow(col, e.target.value)}
        className="h-8 min-w-[110px] border-none bg-transparent px-1 outline-none"
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#ECECEC] p-6">
      <fieldset className="rounded border border-gray-400 bg-white p-5 shadow">
        <legend className="px-2 text-lg font-bold text-black">Search</legend>
        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-4">
            <label className="mb-1 block font-semibold text-black">College Name</label>
            <select
              value={search.collegeName}
              onChange={(e) => handleCollegeChange(e.target.value)}
              className="h-10 w-full rounded border border-gray-400 bg-white px-3 text-black outline-none focus:border-blue-600"
            >
              <option value="">-- Select --</option>
              {colleges.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="col-span-3">
            <label className="mb-1 block font-semibold text-black">Course</label>
            <select
              value={search.course}
              onChange={(e) => handleCourseChange(e.target.value)}
              disabled={!search.collegeName}
              className="h-10 w-full rounded border border-gray-400 bg-white px-3 text-black outline-none focus:border-blue-600 disabled:bg-gray-100"
            >
              <option value="">-- Select --</option>
              {courses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="mb-1 block font-semibold text-black">Batch</label>
            <select
              value={search.batch}
              onChange={(e) => setSearch((prev) => ({ ...prev, batch: e.target.value }))}
              disabled={!search.course}
              className="h-10 w-full rounded border border-gray-400 bg-white px-3 text-black outline-none focus:border-blue-600 disabled:bg-gray-100"
            >
              <option value="">-- Select --</option>
              {batches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="col-span-3 flex gap-3">
            <button
              onClick={handleShow}
              disabled={!search.collegeName}
              className="h-10 flex-1 rounded bg-blue-700 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              Show
            </button>
            <button
              onClick={handleExportToExcel}
              className="h-10 flex-1 rounded bg-green-700 font-semibold text-white hover:bg-green-800"
            >
              Export To Excel
            </button>
          </div>
        </div>
      </fieldset>

      {error && <div className="mt-3 font-medium text-red-600">{error}</div>}
      {newRowError && <div className="mt-3 font-medium text-red-600">{newRowError}</div>}

      <div className="mt-5 flex items-center justify-between">
        <div className="text-lg font-semibold text-black">
          {rows.length === 0 ? "No records found" : `Total Records : ${rows.length}`}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSaveNewRecord}
            disabled={saving}
            className="rounded bg-blue-700 px-6 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save New Record"}
          </button>
          <button
            onClick={resetNewRow}
            className="rounded bg-red-700 px-6 py-2 font-semibold text-white hover:bg-red-800"
          >
            Close
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-auto rounded border border-gray-300 bg-white shadow max-h-[500px]">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-gray-200">
            <tr>
              {columns.map((col) => (
                <th key={col} className="border px-2 py-2 text-left text-black">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-6 text-center">Loading...</td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.IDNo ?? index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {columns.map((col) => {
                    const dropdownOptions = EDITABLE_DROPDOWNS[col];
                    const cellKey = `${row.IDNo}-${col}`;
                    const isSaving = savingCell === cellKey;

                    if (dropdownOptions) {
                      const displayValue = col === "Sex" ? getSexDisplayValue(row[col]) : row[col] ?? "";
                      return (
                        <td key={col} className="border px-1 py-1 whitespace-nowrap">
                          <select
                            value={displayValue}
                            disabled={isSaving}
                            onChange={(e) => handleFieldChange(row.IDNo, col, e.target.value)}
                            className="h-7 min-w-[90px] rounded-none border-none bg-transparent px-1 font-medium outline-none disabled:opacity-60 cursor-pointer"
                            style={{ color: "#1d4ed8" }}
                          >
                            <option value="" style={{ color: "#1d4ed8" }}>Select</option>
                            {dropdownOptions.map((opt) => (
                              <option key={opt} value={opt} style={{ color: "#1d4ed8" }}>{opt}</option>
                            ))}
                          </select>
                        </td>
                      );
                    }

                    return (
                      <td key={col} className="border px-2 py-1 text-black">
                        {renderCellValue(row[col])}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}

            {/* Blank editable "new record" row, always shown at the bottom — like the VB DataGridView */}
            <tr className="bg-yellow-50">
              {columns.map((col) => (
                <td key={col} className="border px-1 py-1 whitespace-nowrap">
                  {renderNewRowCell(col)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}