"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/store/store";
import {
  getCustomSubLedgersColleges,
  getCustomSubLedgersOptions,
  getCustomSubLedgersReport,
  clearReport,
  clearCollegeOptions,
  ReportRow,
} from "@/store/slices/customSubLedgersSlice";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDDMMYYYY(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "0";
  return n.toLocaleString("en-IN");
}

function csvEscape(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/* ------------------------------------------------------------------ */
/*  Small UI atoms                                                      */
/* ------------------------------------------------------------------ */

function HeaderButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-gradient-to-b from-blue-500 to-blue-800 text-white text-[12px] font-semibold px-4 h-8 rounded-sm border border-blue-900 shadow disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-400 hover:to-blue-700"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export default function CustomSubLedgersPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    colleges = [],
    heads = [],
    courses = [],
    batches = [],
    semesters = [],
    rows = [],
    headers = [],
    totalRecords,
    columnTotals = {},
    grandTotal,
    loading,
    error,
  } = useSelector((state: RootState) => state.customSubLedgers as any);

  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [semester, setSemester] = useState("");
  const [session, setSession] = useState("");

  const [allSubLedgers, setAllSubLedgers] = useState(false);
  const [selectedHeads, setSelectedHeads] = useState<string[]>([]);

  const [betweenTwoDates, setBetweenTwoDates] = useState(false);
  const [dateFrom, setDateFrom] = useState(todayISO());
  const [dateTo, setDateTo] = useState(todayISO());

  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    dispatch(getCustomSubLedgersColleges());
  }, [dispatch]);

  // Whenever the college changes, refresh its dependent option lists and
  // reset anything scoped to the previous college — mirrors VB's
  // cmbcollege_SelectedIndexChanged clearing CheckedListBox1.
  useEffect(() => {
    if (collegeName) {
      dispatch(getCustomSubLedgersOptions(collegeName));
    } else {
      dispatch(clearCollegeOptions());
    }
    setCourse("");
    setBatch("");
    setSemester("");
    setSelectedHeads([]);
    setAllSubLedgers(false);
    dispatch(clearReport());
    setHasSearched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeName]);

  const toggleAllSubLedgers = (checked: boolean) => {
    setAllSubLedgers(checked);
    setSelectedHeads(checked ? [...heads] : []);
  };

  const toggleHead = (head: string) => {
    setSelectedHeads((prev) =>
      prev.includes(head) ? prev.filter((h) => h !== head) : [...prev, head]
    );
  };

  const handleDisplay = async () => {
    if (!collegeName) {
      window.alert("Please Specify College");
      return;
    }
    if (!allSubLedgers && selectedHeads.length === 0) {
      window.alert("Please specify Sub Ledger");
      return;
    }

    const headsToUse = allSubLedgers ? heads : selectedHeads;

    try {
      const result = await dispatch(
        getCustomSubLedgersReport({
          collegeName,
          dateFrom: betweenTwoDates ? dateFrom : undefined,
          dateTo: betweenTwoDates ? dateTo : undefined,
          course: course || undefined,
          batch: batch || undefined,
          semester: semester || undefined,
          session: session || undefined,
          heads: headsToUse,
        })
      ).unwrap();

      setHasSearched(true);

      if (!result.rows || result.rows.length === 0) {
        window.alert("No record found!");
      }
    } catch {
      setHasSearched(true);
    }
  };

  const handleClose = () => {
    setCollegeName("");
    setCourse("");
    setBatch("");
    setSemester("");
    setSession("");
    setAllSubLedgers(false);
    setSelectedHeads([]);
    setBetweenTwoDates(false);
    setDateFrom(todayISO());
    setDateTo(todayISO());
    dispatch(clearReport());
    setHasSearched(false);
  };

  const handleExportToExcel = () => {
    if (!rows || rows.length === 0) {
      window.alert("Sorry No Record is found to Export");
      return;
    }
    if (!collegeName) {
      window.alert("Please Specify College");
      return;
    }

    const displayHeaders = [
      "DateEntry",
      "ReceiptNo",
      "IDNo",
      "ClassRollNo",
      "UniRollNo",
      "StudentName",
      "FatherName",
      ...headers,
      "Total",
    ];

    const lines = [displayHeaders.map(csvEscape).join(",")];

    rows.forEach((row: ReportRow) => {
      lines.push(
        [
          formatDDMMYYYY(row.DateEntry),
          row.ReceiptNo,
          row.IDNo ?? "",
          row.ClassRollNo ?? "",
          row.UniRollNo ?? "",
          row.StudentName,
          row.FatherName,
          ...headers.map((h: string) => row.heads[h] ?? 0),
          row.total,
        ]
          .map(csvEscape)
          .join(",")
      );
    });

    // Footer totals row, matching the "Total" row VB appends at the bottom
    lines.push(
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "Total",
        ...headers.map((h: string) => columnTotals[h] ?? 0),
        grandTotal,
      ]
        .map(csvEscape)
        .join(",")
    );

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CustomSubLedgers_${collegeName.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasRows = rows && rows.length > 0;

  return (
    <div
      className="min-h-screen p-3 text-[13px] text-gray-800"
      style={{
        background:
          "radial-gradient(ellipse at top, #cfe3f7 0%, #a9c7ea 55%, #7fa8d9 100%)",
      }}
    >
      {/* ---------- Search panel ---------- */}
      <div className="bg-white/90 border border-gray-400 rounded-sm shadow p-3 mb-3">
        <div className="font-bold text-[13px] mb-2">Search</div>

        <div className="grid grid-cols-12 gap-3">
          {/* Left column: filters */}
          <div className="col-span-8 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  College Name
                </label>
                <select
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white"
                >
                  <option value=""></option>
                  {colleges.map((c: string, i: number) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    Course
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white"
                  >
                    <option value=""></option>
                    {courses.map((c: string, i: number) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    Session
                  </label>
                  <input
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Batch
                </label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white"
                >
                  <option value=""></option>
                  {batches.map((b: string | number, i: number) => (
                    <option key={i} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white"
                >
                  <option value=""></option>
                  {semesters.map((s: string, i: number) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-[12px] font-semibold">
                <input
                  type="checkbox"
                  checked={betweenTwoDates}
                  onChange={(e) => setBetweenTwoDates(e.target.checked)}
                />
                Between Two Dates :
              </label>
              {betweenTwoDates && (
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-[12px] font-semibold">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white"
                  />
                  <label className="text-[12px] font-semibold">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white"
                  />
                </div>
              )}
            </div>

            <div className="font-bold text-[13px] mt-2">
              Total Records : {hasSearched ? totalRecords : 0}
            </div>
          </div>

          {/* Right column: All Sub Ledgers + checklist */}
          <div className="col-span-4">
            <label className="flex items-center gap-2 text-[12px] font-semibold mb-2">
              <input
                type="checkbox"
                checked={allSubLedgers}
                onChange={(e) => toggleAllSubLedgers(e.target.checked)}
              />
              All Sub Ledgers
            </label>
            <div className="border border-gray-400 bg-white rounded-sm h-32 overflow-y-auto p-1">
              {heads.length === 0 ? (
                <div className="text-[11px] text-gray-500 italic p-1">
                  Select a college to load sub ledgers
                </div>
              ) : (
                heads.map((h: string, i: number) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 text-[12px] px-1 py-0.5 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHeads.includes(h)}
                      onChange={() => toggleHead(h)}
                    />
                    {h}
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ---------- Action buttons ---------- */}
        <div className="flex gap-3 mt-3">
          <HeaderButton onClick={handleDisplay}>Display</HeaderButton>
          <HeaderButton onClick={handleExportToExcel}>Export To Excel</HeaderButton>
          <HeaderButton onClick={handleClose}>Close</HeaderButton>
        </div>
      </div>

      {loading && (
        <div className="mb-3 text-white font-semibold text-[13px]">Loading...</div>
      )}

      {error && !loading && (
        <div className="mb-3 bg-red-100 border border-red-400 text-red-800 text-[12px] font-semibold px-3 py-2 rounded-sm">
          {error}
        </div>
      )}

      {/* ---------- Grid ---------- */}
      <div className="bg-white/95 border border-gray-400 rounded-sm shadow min-h-[400px]">
        {hasRows ? (
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 py-1 text-left">Date Entry</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Receipt No</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">IDNo</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Class Roll No</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Uni Roll No</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Student Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Father Name</th>
                  {headers.map((h: string, i: number) => (
                    <th key={i} className="border border-gray-300 px-2 py-1 text-right">
                      {h}
                    </th>
                  ))}
                  <th className="border border-gray-300 px-2 py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: ReportRow, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-2">
                      {formatDDMMYYYY(row.DateEntry)}
                    </td>
                    <td className="border border-gray-300 px-2">{row.ReceiptNo}</td>
                    <td className="border border-gray-300 px-2">{row.IDNo}</td>
                    <td className="border border-gray-300 px-2">{row.ClassRollNo}</td>
                    <td className="border border-gray-300 px-2">{row.UniRollNo}</td>
                    <td className="border border-gray-300 px-2">{row.StudentName}</td>
                    <td className="border border-gray-300 px-2">{row.FatherName}</td>
                    {headers.map((h: string, hi: number) => (
                      <td key={hi} className="border border-gray-300 px-2 text-right">
                        {fmtNum(row.heads[h])}
                      </td>
                    ))}
                    <td className="border border-gray-300 px-2 text-right font-semibold">
                      {fmtNum(row.total)}
                    </td>
                  </tr>
                ))}
                {/* Footer totals row — matches VB's manually appended row with
                    FatherName="Total" and per-column vertical sums */}
                <tr className="bg-gray-200 font-bold">
                  <td className="border border-gray-300 px-2"></td>
                  <td className="border border-gray-300 px-2"></td>
                  <td className="border border-gray-300 px-2"></td>
                  <td className="border border-gray-300 px-2"></td>
                  <td className="border border-gray-300 px-2"></td>
                  <td className="border border-gray-300 px-2"></td>
                  <td className="border border-gray-300 px-2">Total</td>
                  {headers.map((h: string, hi: number) => (
                    <td key={hi} className="border border-gray-300 px-2 text-right">
                      {fmtNum(columnTotals[h])}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-2 text-right">
                    {fmtNum(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : hasSearched && !loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <span className="text-gray-600 font-semibold text-[14px]">No record found!</span>
          </div>
        ) : (
          <div className="h-[400px] bg-gray-400/70 border border-gray-400" />
        )}
      </div>
    </div>
  );
}