"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  display,
  displayAll,
  addRecord,
} from "@/store/slices/masterHostelBusValiditySlice";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";

interface SemesterOption {
  semester: string;
  semesterId: number;
}

export default function HostelBusValidityPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { list, loading, error } = useSelector(
    (state: RootState) => state.hostelBusValidity
  );

  const [search, setSearch] = useState({
    collegeName: "",
    batch: "",
    semester: "",
  });

  const [colleges, setColleges] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);

  const [newRow, setNewRow] = useState({
    collegeName: "",
    batch: "",
    semester: "",
    facility: "",
    validUpTo: "",
  });
  const [newRowBatches, setNewRowBatches] = useState<string[]>([]);
  const [newRowSemesters, setNewRowSemesters] = useState<SemesterOption[]>([]);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(displayAll());

    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
  }, [dispatch]);

  const handleCollegeChange = async (value: string) => {
    setSearch({ collegeName: value, batch: "", semester: "" });
    setBatches([]);
    setSemesters([]);

    if (value) {
      const res = await reduxApiClient.get("master-course/batches", {
        collegeName: value,
      });
      if (res.success) setBatches(res.data.data);
    }
  };

  const handleBatchChange = async (value: string) => {
    setSearch((prev) => ({ ...prev, batch: value, semester: "" }));
    setSemesters([]);

    if (value) {
      const res = await reduxApiClient.get("master-course/semesters", {
        collegeName: search.collegeName,
        batch: value,
      });
      if (res.success) setSemesters(res.data.data);
    }
  };

  const handleDisplay = () => {
    dispatch(display(search));
  };

  const handleDisplayAll = () => {
    dispatch(displayAll());
    setSearch({ collegeName: "", batch: "", semester: "" });
    setBatches([]);
    setSemesters([]);
  };

  // --- New row handlers ---
  const handleNewRowCollegeChange = async (value: string) => {
    setNewRow((prev) => ({ ...prev, collegeName: value, batch: "", semester: "" }));
    setNewRowBatches([]);
    setNewRowSemesters([]);
    setAddError(null);

    if (value) {
      const res = await reduxApiClient.get("master-course/batches", {
        collegeName: value,
      });
      if (res.success) setNewRowBatches(res.data.data);
    }
  };

  const handleNewRowBatchChange = async (value: string) => {
    setNewRow((prev) => ({ ...prev, batch: value, semester: "" }));
    setNewRowSemesters([]);

    if (value) {
      const res = await reduxApiClient.get("master-course/semesters", {
        collegeName: newRow.collegeName,
        batch: value,
      });
      if (res.success) setNewRowSemesters(res.data.data);
    }
  };

  const handleAddNewRecord = async () => {
    setAddError(null);

    if (!newRow.collegeName || !newRow.batch || !newRow.semester || !newRow.facility || !newRow.validUpTo) {
      setAddError("Please fill all values in the last row, then click Add New Record.");
      return;
    }

    setAdding(true);
    const result = await dispatch(addRecord(newRow));
    setAdding(false);

    if (addRecord.fulfilled.match(result)) {
      setNewRow({ collegeName: "", batch: "", semester: "", facility: "", validUpTo: "" });
      setNewRowBatches([]);
      setNewRowSemesters([]);
      if (search.collegeName) {
        dispatch(display(search));
      } else {
        dispatch(displayAll());
      }
    } else {
      setAddError((result.payload as string) || "Something went wrong. Please try again.");
    }
  };

  // --- Export / Print ---
  const handleExportToExcel = async () => {
    try {
      // Dynamic execution to prevent Next.js build-time resolution failure if xlsx isn't installed
      const importXLSX = new Function('return import("xlsx")');
      const XLSX = await importXLSX();

      const worksheet = XLSX.utils.json_to_sheet(
        list.map((row: any) => ({
          CollegeName: row.CollegeName ?? row.collegeName,
          Batch: row.Batch ?? row.batch,
          Semester: row.Semester ?? row.semester,
          Facility: row.Facility ?? row.facility,
          ValidUpTo: row.ValidUpTo ?? row.validUpTo,
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "HostelBusValidity");
      XLSX.writeFile(workbook, "HostelBusValidity.xlsx");
    } catch {
      // CSV export compatible with Excel
      const headers = ["CollegeName", "Batch", "Semester", "Facility", "ValidUpTo"];
      let csvContent = headers.join(",") + "\n";
      list.forEach((row: any) => {
        const line = [
          `"${row.CollegeName ?? row.collegeName ?? ""}"`,
          `"${row.Batch ?? row.batch ?? ""}"`,
          `"${row.Semester ?? row.semester ?? ""}"`,
          `"${row.Facility ?? row.facility ?? ""}"`,
          `"${row.ValidUpTo ?? row.validUpTo ?? ""}"`,
        ].join(",");
        csvContent += line + "\n";
      });

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "HostelBusValidity.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Hostel/Bus Validity</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; font-size: 13px; }
            th { background: #e5e7eb; }
            h2 { margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <h2>Hostel/Bus Validity (Total Records: ${list.length})</h2>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="min-h-screen bg-[#ECECEC] p-6">
      {/* Search */}
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
              <option value="">-- Select College --</option>
              {colleges.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="mb-1 block font-semibold text-black">Batch</label>
            <select
              value={search.batch}
              onChange={(e) => handleBatchChange(e.target.value)}
              disabled={!search.collegeName}
              className="h-10 w-full rounded border border-gray-400 bg-white px-3 text-black outline-none focus:border-blue-600 disabled:bg-gray-100"
            >
              <option value="">Select Batch</option>
              {batches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
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
              <option value="">Select Semester</option>
              {semesters.map((s) => (
                <option key={s.semesterId} value={s.semester}>
                  {s.semester}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-4 flex gap-3">
            <button
              onClick={handleDisplay}
              disabled={!search.collegeName}
              className="rounded bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              Display
            </button>
            <button
              onClick={handleDisplayAll}
              className="rounded bg-green-700 px-5 py-2 font-semibold text-white hover:bg-green-800"
            >
              Display All
            </button>
          </div>
        </div>
      </fieldset>

      <div className="mt-5 text-lg font-semibold text-black">Total Records : {list.length}</div>

      {error && <div className="mt-3 font-medium text-red-600">{error}</div>}
      {addError && <div className="mt-3 font-medium text-red-600">{addError}</div>}

      {/* Table */}
      <div className="mt-5 overflow-auto rounded border border-gray-300 bg-white shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-black">
              <th className="border px-4 py-3 text-left">College Name</th>
              <th className="border px-4 py-3 text-left">Batch</th>
              <th className="border px-4 py-3 text-left">Semester</th>
              <th className="border px-4 py-3 text-left">Facility</th>
              <th className="border px-4 py-3 text-left">Valid Up To</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-black">
                  Loading...
                </td>
              </tr>
            ) : (
              <>
                {list.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-black">
                      No Records Found
                    </td>
                  </tr>
                )}

                {list.map((row: any, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                  >
                    <td className="border px-4 py-2 text-black">{row.CollegeName ?? row.collegeName}</td>
                    <td className="border px-4 py-2 text-black">{row.Batch ?? row.batch}</td>
                    <td className="border px-4 py-2 text-black">{row.Semester ?? row.semester}</td>
                    <td className="border px-4 py-2 text-black">{row.Facility ?? row.facility}</td>
                    <td className="border px-4 py-2 text-black">{row.ValidUpTo ?? row.validUpTo}</td>
                  </tr>
                ))}

                {/* New row - inline add */}
                <tr className="bg-blue-50">
                  <td className="border px-2 py-1">
                    <select
                      value={newRow.collegeName}
                      onChange={(e) => handleNewRowCollegeChange(e.target.value)}
                      className="h-9 w-full rounded border border-gray-400 bg-white px-2 text-black outline-none focus:border-blue-600"
                    >
                      <option value="">-- Select --</option>
                      {colleges.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <select
                      value={newRow.batch}
                      onChange={(e) => handleNewRowBatchChange(e.target.value)}
                      disabled={!newRow.collegeName}
                      className="h-9 w-full rounded border border-gray-400 bg-white px-2 text-black outline-none focus:border-blue-600 disabled:bg-gray-100"
                    >
                      <option value="">-- Select --</option>
                      {newRowBatches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <select
                      value={newRow.semester}
                      onChange={(e) => setNewRow((prev) => ({ ...prev, semester: e.target.value }))}
                      disabled={!newRow.batch}
                      className="h-9 w-full rounded border border-gray-400 bg-white px-2 text-black outline-none focus:border-blue-600 disabled:bg-gray-100"
                    >
                      <option value="">-- Select --</option>
                      {newRowSemesters.map((s) => (
                        <option key={s.semesterId} value={s.semester}>
                          {s.semester}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <select
                      value={newRow.facility}
                      onChange={(e) => setNewRow((prev) => ({ ...prev, facility: e.target.value }))}
                      className="h-9 w-full rounded border border-gray-400 bg-white px-2 text-black outline-none focus:border-blue-600"
                    >
                      <option value="">-- Select --</option>
                      <option value="Bus">Bus</option>
                      <option value="Hostel">Hostel</option>
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="date"
                      value={newRow.validUpTo}
                      onChange={(e) => setNewRow((prev) => ({ ...prev, validUpTo: e.target.value }))}
                      className="h-9 w-full rounded border border-gray-400 bg-white px-2 text-black outline-none focus:border-blue-600"
                    />
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Hidden printable table */}
      <div ref={printRef} className="hidden">
        <table>
          <thead>
            <tr>
              <th>College Name</th>
              <th>Batch</th>
              <th>Semester</th>
              <th>Facility</th>
              <th>Valid Up To</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row: any, index) => (
              <tr key={`print-${index}`}>
                <td>{row.CollegeName ?? row.collegeName}</td>
                <td>{row.Batch ?? row.batch}</td>
                <td>{row.Semester ?? row.semester}</td>
                <td>{row.Facility ?? row.facility}</td>
                <td>{row.ValidUpTo ?? row.validUpTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={handleAddNewRecord}
          disabled={adding}
          className="rounded bg-blue-700 px-6 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add New Record"}
        </button>

        <button
          onClick={handleExportToExcel}
          className="rounded bg-green-700 px-6 py-2 font-semibold text-white hover:bg-green-800"
        >
          Export To Excel
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