"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import {
  displayDevFund,
  addDevFundRow,
  editDevFundRow,
  DevFundRow,
} from "@/store/slices/masterDevFundSlice";

interface SemesterOption {
  semester: string;
  semesterId: number;
}

const FUND_COLUMNS: { key: keyof DevFundRow; label: string }[] = [
  { key: "laboratory", label: "Laboratory" },
  { key: "workshop", label: "Workshop" },
  { key: "computerAndPeripherals", label: "Computer & Peripherals" },
  { key: "itConnectivity", label: "IT Connectivity" },
  { key: "civilWorks", label: "Civil Works" },
  { key: "facultyImprovementProgram", label: "Faculty Improvement" },
  { key: "improvementLibraryFacilities", label: "Library Facilities" },
  { key: "educationalTour", label: "Educational Tour" },
  { key: "dailyConsumableGoodsForPracticals", label: "Consumable Goods" },
  { key: "contingency", label: "Contingency" },
];

const emptyRow: DevFundRow = {
  session: "",
  collegeName: "",
  course: "",
  batch: 0,
  semester: "",
  scheme: "",
  category: "",
  laboratory: 0,
  workshop: 0,
  computerAndPeripherals: 0,
  itConnectivity: 0,
  civilWorks: 0,
  facultyImprovementProgram: 0,
  improvementLibraryFacilities: 0,
  educationalTour: 0,
  dailyConsumableGoodsForPracticals: 0,
  contingency: 0,
};

export default function MasterDevelopmentFundPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { rows, loading, error } = useSelector((state: RootState) => state.masterDevFund);

  const [search, setSearch] = useState({ collegeName: "", course: "", batch: "", semester: "" });
  const [colleges, setColleges] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);

  const [schemes, setSchemes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [newRow, setNewRow] = useState<DevFundRow>(emptyRow);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
  }, []);
  


const handlePrint = () => {


  const printContents = document.getElementById("printArea");

  if (!printContents) {
    alert("Nothing to print.");
    return;
  }

  const printWindow = window.open("", "", "width=1000,height=700");

  if (!printWindow) {
    alert("Unable to open print window.");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Master Hostel Bus Validity</title>

        <style>
          body{
            font-family: Arial, sans-serif;
            padding:20px;
          }

          h2{
            text-align:center;
            margin-bottom:20px;
          }

          table{
            width:100%;
            border-collapse:collapse;
          }

          th,td{
            border:1px solid #000;
            padding:8px;
            text-align:left;
            font-size:13px;
          }

          th{
            background:#ddd;
          }
        </style>
      </head>

      <body>
        <h2>Master Hostel Bus Validity</h2>

        ${printContents.innerHTML}

      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

  const loadSchemesAndCategories = async (collegeName: string) => {
    const [schemeRes, categoryRes] = await Promise.all([
      reduxApiClient.get("master-scheme"),
      reduxApiClient.get("master-category"),
    ]);
    if (schemeRes.success) {
      setSchemes(
        schemeRes.data.data.filter((s: any) => s.CollegeName === collegeName).map((s: any) => s.Scheme)
      );
    }
    if (categoryRes.success) {
      setCategories(
        categoryRes.data.data
          .filter((c: any) => c.CollegeName === collegeName)
          .map((c: any) => c.Category)
      );
    }
  };

  const handleCollegeChange = async (value: string) => {
    setSearch({ collegeName: value, course: "", batch: "", semester: "" });
    setCourses([]);
    setBatches([]);
    setSemesters([]);
    setNewRow({ ...emptyRow, collegeName: value });

    if (value) {
      const res = await reduxApiClient.get("master-course/courses", { collegeName: value });
      if (res.success) setCourses(res.data.data);
      loadSchemesAndCategories(value);
    }
  };

  const handleCourseChange = async (value: string) => {
    setSearch((prev) => ({ ...prev, course: value, batch: "", semester: "" }));
    setBatches([]);
    setSemesters([]);
    setNewRow((prev) => ({ ...prev, course: value }));

    if (value) {
      const res = await reduxApiClient.get("master-course/batches", {
        collegeName: search.collegeName,
        course: value,
      });
      if (res.success) setBatches(res.data.data);
    }
  };

  const handleBatchChange = async (value: string) => {
    setSearch((prev) => ({ ...prev, batch: value, semester: "" }));
    setSemesters([]);
    setNewRow((prev) => ({ ...prev, batch: Number(value) }));

    if (value) {
      const res = await reduxApiClient.get("master-course/semesters", {
        collegeName: search.collegeName,
        course: search.course,
        batch: value,
      });
      if (res.success) setSemesters(res.data.data);
    }
  };

  const handleDisplay = () => {
    if (!search.collegeName) return;
    dispatch(displayDevFund(search));
  };

  const total = FUND_COLUMNS.reduce((sum, col) => sum + (Number(newRow[col.key]) || 0), 0);

  const handleAddNewRecord = async () => {
    setAddError(null);

    if (
      !newRow.session ||
      !newRow.collegeName ||
      !newRow.course ||
      !newRow.batch ||
      !newRow.semester ||
      !newRow.scheme ||
      !newRow.category
    ) {
      setAddError("Please fill Session, College, Course, Batch, Semester, Scheme and Category.");
      return;
    }

    const result = await dispatch(addDevFundRow(newRow));

    if (addDevFundRow.fulfilled.match(result)) {
      setNewRow({ ...emptyRow, collegeName: search.collegeName, course: search.course });
      handleDisplay();
    } else {
      setAddError((result.payload as string) || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-[#ECECEC] p-6">
      {/* Search */}
      <fieldset className="rounded border border-gray-400 bg-white p-5 shadow">
        <legend className="px-2 text-lg font-bold text-black">Search</legend>

        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-3">
            <label className="mb-1 block font-semibold text-black">College Name</label>
            <select
              value={search.collegeName}
              onChange={(e) => handleCollegeChange(e.target.value)}
              className="h-10 w-full rounded border border-gray-400 bg-white px-3 text-black outline-none focus:border-blue-600"
            >
              <option value="">-- Select --</option>
              {colleges.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
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
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="mb-1 block font-semibold text-black">Batch</label>
            <select
              value={search.batch}
              onChange={(e) => handleBatchChange(e.target.value)}
              disabled={!search.course}
              className="h-10 w-full rounded border border-gray-400 bg-white px-3 text-black outline-none focus:border-blue-600 disabled:bg-gray-100"
            >
              <option value="">-- Select --</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="mb-1 block font-semibold text-black">Semester</label>
            <select
              value={search.semester}
              onChange={(e) => setSearch((prev) => ({ ...prev, semester: e.target.value }))}
              disabled={!search.batch}
              className="h-10 w-full rounded border border-gray-400 bg-white px-3 text-black outline-none focus:border-blue-600 disabled:bg-gray-100"
            >
              <option value="">-- Select --</option>
              {semesters.map((s) => (
                <option key={s.semesterId} value={s.semester}>
                  {s.semester}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <button
              onClick={handleDisplay}
              disabled={!search.collegeName}
              className="h-10 w-full rounded bg-blue-700 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              Display
            </button>
          </div>
        </div>
      </fieldset>

      {error && <div className="mt-3 font-medium text-red-600">{error}</div>}
      {addError && <div className="mt-3 font-medium text-red-600">{addError}</div>}

      <div className="mt-5 text-lg font-semibold text-black">
        {rows.length === 0 ? "No records found" : `Total Records : ${rows.length}`}
      </div>

      {/* Grid */}
      <div className="mt-3 overflow-auto rounded border border-gray-300 bg-white shadow">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-200 text-black">
              <th className="border px-2 py-2 text-left">Session</th>
              <th className="border px-2 py-2 text-left">College</th>
              <th className="border px-2 py-2 text-left">Course</th>
              <th className="border px-2 py-2 text-left">Batch</th>
              <th className="border px-2 py-2 text-left">Semester</th>
              <th className="border px-2 py-2 text-left">Scheme</th>
              <th className="border px-2 py-2 text-left">Category</th>
              {FUND_COLUMNS.map((col) => (
                <th key={col.key} className="border px-2 py-2 text-left">
                  {col.label}
                </th>
              ))}
              <th className="border px-2 py-2 text-left">Total</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7 + FUND_COLUMNS.length + 1} className="py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              rows.map((row: any, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border px-2 py-1 text-black">{row.Session}</td>
                  <td className="border px-2 py-1 text-black">{row.CollegeName}</td>
                  <td className="border px-2 py-1 text-black">{row.Course}</td>
                  <td className="border px-2 py-1 text-black">{row.Batch}</td>
                  <td className="border px-2 py-1 text-black">{row.Semester}</td>
                  <td className="border px-2 py-1 text-black">{row.Scheme}</td>
                  <td className="border px-2 py-1 text-black">{row.Category}</td>
                  {FUND_COLUMNS.map((col) => {
                    const dbKey = col.key.charAt(0).toUpperCase() + col.key.slice(1);
                    return (
                      <td key={col.key} className="border px-2 py-1 text-black">
                        {row[dbKey] ?? 0}
                      </td>
                    );
                  })}
                  <td className="border px-2 py-1 font-semibold text-black">{row.Total}</td>
                </tr>
              ))
            )}

            {/* New row */}
            <tr className="bg-blue-50">
              <td className="border px-1 py-1">
                <input
                  value={newRow.session}
                  onChange={(e) => setNewRow((prev) => ({ ...prev, session: e.target.value }))}
                  placeholder="e.g. 2024-25"
                  className="h-8 w-full rounded border border-gray-400 px-1 text-black outline-none"
                />
              </td>
              <td className="border px-1 py-1 text-black">{newRow.collegeName || "-"}</td>
              <td className="border px-1 py-1 text-black">{newRow.course || "-"}</td>
              <td className="border px-1 py-1 text-black">{newRow.batch || "-"}</td>
              <td className="border px-1 py-1 text-black">{search.semester || "-"}</td>
              <td className="border px-1 py-1">
                <select
                  value={newRow.scheme}
                  onChange={(e) => setNewRow((prev) => ({ ...prev, scheme: e.target.value }))}
                  className="h-8 w-full rounded border border-gray-400 text-black outline-none"
                >
                  <option value="">-- Select --</option>
                  {schemes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border px-1 py-1">
                <select
                  value={newRow.category}
                  onChange={(e) => setNewRow((prev) => ({ ...prev, category: e.target.value }))}
                  className="h-8 w-full rounded border border-gray-400 text-black outline-none"
                >
                  <option value="">-- Select --</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </td>
              {FUND_COLUMNS.map((col) => (
                <td key={col.key} className="border px-1 py-1">
                  <input
                    type="number"
                    value={newRow[col.key] as number}
                    onChange={(e) =>
                      setNewRow((prev) => ({ ...prev, [col.key]: Number(e.target.value) || 0 }))
                    }
                    className="h-8 w-20 rounded border border-gray-400 px-1 text-black outline-none"
                  />
                </td>
              ))}
              <td className="border px-2 py-1 font-semibold text-black">{total}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Also set newRow.semester when search.semester changes */}
      {/* handled implicitly since we read search.semester at submit time below */}

      {/* Bottom Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={() => {
            setNewRow((prev) => ({ ...prev, semester: search.semester }));
            handleAddNewRecord();
          }}
          className="rounded bg-blue-700 px-6 py-2 font-semibold text-white hover:bg-blue-800"
        >
          Add New Record
        </button>
        <button
  onClick={handlePrint}
  className="rounded bg-gray-700 px-6 py-2 font-semibold text-white hover:bg-gray-800"
>
  Print
</button>
        <button className="rounded bg-red-700 px-6 py-2 font-semibold text-white hover:bg-red-800">
          Close
        </button>
      </div>
    </div>
  );
}