// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/store/store";
// import * as XLSX from "xlsx";
// import {
//   getColleges,
//   getCourses,
//   getBatches,
//   getFeeCategories,
//   getSessions,
//   getAllRecords,
//   clearRecords,
//   AllRecordRow,
// } from "@/store/slices/allRecordSlice";

// /* ------------------------------------------------------------------ */
// /*  Config                                                              */
// /* ------------------------------------------------------------------ */

// const SEMESTERS = [
//   "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth",
// ];

// function fmtNum(n: number | null | undefined): string {
//   if (n === null || n === undefined || Number.isNaN(n)) return "";
//   return n.toLocaleString("en-IN");
// }

// /* ------------------------------------------------------------------ */
// /*  Small UI atoms                                                      */
// /* ------------------------------------------------------------------ */

// function HeaderButton({
//   children,
//   onClick,
//   disabled,
//   outline = false,
// }: {
//   children: React.ReactNode;
//   onClick?: () => void;
//   disabled?: boolean;
//   outline?: boolean;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={
//         outline
//           ? "bg-white text-blue-800 text-[12px] font-semibold px-4 h-8 rounded-sm border-2 border-blue-600 shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50"
//           : "bg-gradient-to-b from-blue-500 to-blue-800 text-white text-[12px] font-semibold px-4 h-8 rounded-sm border border-blue-900 shadow disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-400 hover:to-blue-700"
//       }
//     >
//       {children}
//     </button>
//   );
// }

// function SearchField({
//   label,
//   value,
//   onChange,
//   options,
//   disabled,
// }: {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   options: (string | number)[] | null | undefined;
//   disabled?: boolean;
// }) {
//   const safeOptions = Array.isArray(options) ? options : [];

//   return (
//     <div className="flex items-center gap-2 flex-1">
//       <label className="w-24 shrink-0 text-[12px] font-bold text-gray-800">{label}</label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         disabled={disabled}
//         className="flex-1 border border-gray-400 h-7 px-2 rounded-sm text-[12px] bg-gray-100 disabled:bg-gray-200"
//       >
//         <option value=""></option>
//         {safeOptions.map((opt, index) => (
//           <option key={index} value={opt}>
//             {opt}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Main page                                                           */
// /* ------------------------------------------------------------------ */

// export default function AllRecordPage() {
//   const dispatch = useDispatch<AppDispatch>();

//   const allRecord = useSelector((state: RootState) => state.allRecord);
// console.log("Rows:", allRecord?.rows);
// // console.log("allRecord State:", allRecord);
// // console.log("Colleges:", allRecord?.colleges?.data);
// // console.log("Courses:", allRecord?.courses);
// // console.log("Batches:", allRecord?.batches);
// // console.log("Fee Categories:", allRecord?.feeCategories);
// // console.log("Sessions:", allRecord?.sessions);
// // console.log("Rows:", allRecord?.rows);
// // console.log("Total Debit:", allRecord?.totalDebit);
// // console.log("Total Credit:", allRecord?.totalCredit);
// // console.log("Total Pending:", allRecord?.totalPending);
// // console.log("Total Records:", allRecord?.totalRecords);
// // console.log("Loading:", allRecord?.loading);
// // console.log("Error:", allRecord?.error);

// const {
//   colleges = [],
//   courses = [],
//   batches = [],
//   feeCategories = [],
//   sessions = [],
//   rows = [],
//   totalDebit = null,
//   totalCredit = null,
//   totalPending = null,
//   totalRecords = null,
//   loading = false,
//   error = null,
// } = allRecord ?? {};

//   const [collegeName, setCollegeName] = useState("");
//   const [course, setCourse] = useState("");
//   const [batch, setBatch] = useState("");
//   const [feeCategory, setFeeCategory] = useState("");
//   const [semester, setSemester] = useState("");
//   const [session, setSession] = useState("");

//   useEffect(() => {
//     dispatch(getColleges());
//     dispatch(getFeeCategories());
//     dispatch(getSessions());
//   }, [dispatch]);

//   useEffect(() => {
//     dispatch(getCourses({ collegeName: collegeName || undefined }));
//     dispatch(getBatches({ collegeName: collegeName || undefined }));
//   }, [collegeName, dispatch]);

//   const handleShow = () => {
//     dispatch(
//       getAllRecords({
//         collegeName: collegeName || undefined,
//         course: course || undefined,
//         batch: batch || undefined,
//         semester: semester || undefined,
//         session: session || undefined,
//         feeCategory: feeCategory || undefined,
//       })
//     );
//   };

//   const handleClose = () => {
//     dispatch(clearRecords());
//     setCollegeName("");
//     setCourse("");
//     setBatch("");
//     setFeeCategory("");
//     setSemester("");
//     setSession("");
//   };

//   const handleExport = () => {
//     if (rows.length === 0) return;
//     const ws = XLSX.utils.json_to_sheet(rows);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "AllRecords");
//     XLSX.writeFile(wb, "all-records.xlsx");
//   };

//   const handlePrint = () => {
//     if (rows.length === 0) return;
//     window.print();
//   };

//   const hasRows = rows.length > 0;

//   const statusMessage = useMemo(() => {
//     if (loading) return "Loading...";
//     if (!loading && !hasRows && !error) return "No data to display";
//     return "";
//   }, [loading, hasRows, error]);

//   return (
//     <div
//       className="min-h-screen p-3 text-[13px] text-gray-800"
//       style={{
//         background:
//           "radial-gradient(ellipse at top, #cfe3f7 0%, #a9c7ea 55%, #7fa8d9 100%)",
//       }}
//     >
//       <fieldset className="bg-white/70 border border-gray-500 rounded-sm shadow px-3 pb-3 pt-1 mb-3">
//         <legend className="text-[12px] font-bold px-1">Search</legend>
//         <div className="flex flex-col gap-2">
//           <div className="flex gap-4">
//             <SearchField label="College Name" value={collegeName} onChange={setCollegeName} options={colleges?.data} />
//             <SearchField label="Course" value={course} onChange={setCourse} options={courses?.data} />
//             <SearchField label="Batch" value={batch} onChange={setBatch} options={batches?.data} />
//           </div>
//           <div className="flex gap-4">
//             <SearchField label="Category" value={feeCategory} onChange={setFeeCategory} options={feeCategories?.data} />
//             <SearchField label="Semester" value={semester} onChange={setSemester} options={SEMESTERS} />
//             <SearchField label="Session" value={session} onChange={setSession} options={sessions?.data} />
//           </div>
//         </div>
//       </fieldset>

//       <div className="flex gap-3 mb-3">
//         <HeaderButton onClick={handleShow} disabled={loading}>
//           {loading ? "Loading..." : "Show"}
//         </HeaderButton>
//         <HeaderButton onClick={handlePrint} disabled={rows.length === 0}>
//           Print
//         </HeaderButton>
//         <HeaderButton onClick={handleExport} disabled={rows.length === 0}>
//           Export to Excel
//         </HeaderButton>
//         <HeaderButton onClick={handleClose} outline>
//           Close
//         </HeaderButton>
//       </div>

//       {error && (
//         <div className="mb-3 bg-red-100 border border-red-400 text-red-800 text-[12px] font-semibold px-3 py-2 rounded-sm max-w-xl">
//           {error}
//         </div>
//       )}

//       <div className="flex flex-wrap gap-x-10 gap-y-1 mb-2 text-[13px] font-bold text-gray-900">
//         <span>Total Debit : {fmtNum(totalDebit)}</span>
//         <span>Total Credit : {fmtNum(totalCredit)}</span>
//         <span>Total Pending : {fmtNum(totalPending)}</span>
//         <span>Total Records: {totalRecords ?? ""}</span>
//       </div>

//       <div className="bg-white/95 border border-gray-400 rounded-sm shadow">
//         {hasRows ? (
//           <div className="max-h-[60vh] overflow-auto">
//             <table className="w-full text-[12px]">
//               <thead className="sticky top-0 bg-gray-200">
//                 <tr>
//                   <th className="border border-gray-300 px-2 py-1 text-left">College Name</th>
//                   <th className="border border-gray-300 px-2 py-1 text-left">Student Name</th>
//                   <th className="border border-gray-300 px-2 py-1 text-left">Course</th>
//                   <th className="border border-gray-300 px-2 py-1 text-left">Batch</th>
//                   <th className="border border-gray-300 px-2 py-1 text-left">Semester</th>
//                   <th className="border border-gray-300 px-2 py-1 text-left">Session</th>
//                   <th className="border border-gray-300 px-2 py-1 text-left">Fee Category</th>
//                   <th className="border border-gray-300 px-2 py-1 text-right">Debit</th>
//                   <th className="border border-gray-300 px-2 py-1 text-right">Credit</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {rows.map((r: AllRecordRow, i: number) => (
//                   <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
//                     <td className="border border-gray-300 px-2">{r.CollegeName}</td>
//                     <td className="border border-gray-300 px-2">{r.StudentName}</td>
//                     <td className="border border-gray-300 px-2">{r.Course}</td>
//                     <td className="border border-gray-300 px-2">{r.Batch}</td>
//                     <td className="border border-gray-300 px-2">{r.Semester}</td>
//                     <td className="border border-gray-300 px-2">{r.Session}</td>
//                     <td className="border border-gray-300 px-2">{r.FeeCategory}</td>
//                     <td className="border border-gray-300 px-2 text-right">{fmtNum(r.Debit)}</td>
//                     <td className="border border-gray-300 px-2 text-right">{fmtNum(r.Credit)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="h-64 flex items-center justify-center text-gray-500 italic">
//             {statusMessage}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import * as XLSX from "xlsx";
import {
  getColleges,
  getCourses,
  getBatches,
  getFeeCategories,
  getSessions,
  getAllRecords,
  clearRecords,
  AllRecordRow,
} from "@/store/slices/allRecordSlice";

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const SEMESTERS = [
  "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth",
];

function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "";
  return n.toLocaleString("en-IN");
}

/* ------------------------------------------------------------------ */
/*  Small UI atoms                                                      */
/* ------------------------------------------------------------------ */

function HeaderButton({
  children,
  onClick,
  disabled,
  outline = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  outline?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        outline
          ? "bg-white text-blue-800 text-[12px] font-semibold px-4 h-8 rounded-sm border-2 border-blue-600 shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50"
          : "bg-gradient-to-b from-blue-500 to-blue-800 text-white text-[12px] font-semibold px-4 h-8 rounded-sm border border-blue-900 shadow disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-400 hover:to-blue-700"
      }
    >
      {children}
    </button>
  );
}

function SearchField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | number)[] | null | undefined;
  disabled?: boolean;
}) {
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div className="flex items-center gap-2 flex-1">
      <label className="w-24 shrink-0 text-[12px] font-bold text-gray-800">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex-1 border border-gray-400 h-7 px-2 rounded-sm text-[12px] bg-gray-100 disabled:bg-gray-200"
      >
        <option value=""></option>
        {safeOptions.map((opt, index) => (
          <option key={index} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export default function AllRecordPage() {
  const dispatch = useDispatch<AppDispatch>();

  const allRecord = useSelector((state: RootState) => state.allRecord);

  const {
    colleges = [],
    courses = [],
    batches = [],
    feeCategories = [],
    sessions = [],
    rows = [],
    totalDebit = null,
    totalCredit = null,
    totalPending = null,
    totalRecords = null,
    loading = false,
    error = null,
  } = allRecord ?? {};

  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [feeCategory, setFeeCategory] = useState("");
  const [semester, setSemester] = useState("");
  const [session, setSession] = useState("");

  useEffect(() => {
    dispatch(getColleges());
    dispatch(getFeeCategories());
    dispatch(getSessions());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCourses({ collegeName: collegeName || undefined }));
    dispatch(getBatches({ collegeName: collegeName || undefined }));
  }, [collegeName, dispatch]);

  const handleShow = () => {
    dispatch(
      getAllRecords({
        collegeName: collegeName || undefined,
        course: course || undefined,
        batch: batch || undefined,
        semester: semester || undefined,
        session: session || undefined,
        feeCategory: feeCategory || undefined,
      })
    );
  };

  const handleClose = () => {
    dispatch(clearRecords());
    setCollegeName("");
    setCourse("");
    setBatch("");
    setFeeCategory("");
    setSemester("");
    setSession("");
  };

  const handleExport = () => {
    if (rows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AllRecords");
    XLSX.writeFile(wb, "all-records.xlsx");
  };

  const handlePrint = () => {
    if (rows.length === 0) return;
    window.print();
  };

  const hasRows = rows.length > 0;

  const statusMessage = useMemo(() => {
    if (loading) return "Loading...";
    if (!loading && !hasRows && !error) return "No data to display";
    return "";
  }, [loading, hasRows, error]);

  return (
    <div
      className="min-h-screen p-3 text-[13px] text-gray-800"
      style={{
        background:
          "radial-gradient(ellipse at top, #cfe3f7 0%, #a9c7ea 55%, #7fa8d9 100%)",
      }}
    >
      <fieldset className="bg-white/70 border border-gray-500 rounded-sm shadow px-3 pb-3 pt-1 mb-3">
        <legend className="text-[12px] font-bold px-1">Search</legend>
        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
            <SearchField label="College Name" value={collegeName} onChange={setCollegeName} options={colleges} />
            <SearchField label="Course" value={course} onChange={setCourse} options={courses} />
            <SearchField label="Batch" value={batch} onChange={setBatch} options={batches} />
          </div>
          <div className="flex gap-4">
            <SearchField label="Category" value={feeCategory} onChange={setFeeCategory} options={feeCategories} />
            <SearchField label="Semester" value={semester} onChange={setSemester} options={SEMESTERS} />
            <SearchField label="Session" value={session} onChange={setSession} options={sessions} />
          </div>
        </div>
      </fieldset>

      <div className="flex gap-3 mb-3">
        <HeaderButton onClick={handleShow} disabled={loading}>
          {loading ? "Loading..." : "Show"}
        </HeaderButton>
        <HeaderButton onClick={handlePrint} disabled={rows.length === 0}>
          Print
        </HeaderButton>
        <HeaderButton onClick={handleExport} disabled={rows.length === 0}>
          Export to Excel
        </HeaderButton>
        <HeaderButton onClick={handleClose} outline>
          Close
        </HeaderButton>
      </div>

      {error && (
        <div className="mb-3 bg-red-100 border border-red-400 text-red-800 text-[12px] font-semibold px-3 py-2 rounded-sm max-w-xl">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-x-10 gap-y-1 mb-2 text-[13px] font-bold text-gray-900">
        <span>Total Debit : {fmtNum(totalDebit)}</span>
        <span>Total Credit : {fmtNum(totalCredit)}</span>
        <span>Total Pending : {fmtNum(totalPending)}</span>
        <span>Total Records: {totalRecords ?? ""}</span>
      </div>

      <div className="bg-white/95 border border-gray-400 rounded-sm shadow">
        {hasRows ? (
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 py-1 text-left">College Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Student Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Course</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Batch</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Semester</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Session</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Fee Category</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Debit</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: AllRecordRow, i: number) => (
                  <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                    <td className="border border-gray-300 px-2">{r.CollegeName}</td>
                    <td className="border border-gray-300 px-2">{r.StudentName}</td>
                    <td className="border border-gray-300 px-2">{r.Course}</td>
                    <td className="border border-gray-300 px-2">{r.Batch}</td>
                    <td className="border border-gray-300 px-2">{r.Semester}</td>
                    <td className="border border-gray-300 px-2">{r.Session}</td>
                    <td className="border border-gray-300 px-2">{r.FeeCategory}</td>
                    <td className="border border-gray-300 px-2 text-right">{fmtNum(r.Debit)}</td>
                    <td className="border border-gray-300 px-2 text-right">{fmtNum(r.Credit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500 italic">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}