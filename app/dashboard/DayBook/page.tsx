"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/store/store";
import {
  getDayBookOptions,
  getDayBookEntries,
  getLedgerWiseSummary,
  DayBookEntry,
} from "@/store/slices/dayBookSlice";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type IdMode = "Registration" | "ID" | "UniRoll";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/** Academic session like "2026-27" — April(=month 3)+ rolls to next year. */
function currentSession(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed
  const startYear = month >= 3 ? year : year - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endYearShort}`;
}

function formatDDMMYYYY(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "0";
  return n.toLocaleString("en-IN");
}

function escapeHtml(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function csvEscape(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/* ------------------------------------------------------------------ */
/*  Print helpers (self-contained popup window, same pattern as the    */
/*  Fee receipt print)                                                 */
/* ------------------------------------------------------------------ */

function openPrintWindow(title: string, bodyHtml: string) {
  const printWindow = window.open("", "_blank", "width=1000,height=1000");
  if (!printWindow) {
    window.alert(
      "Your browser blocked the print popup. Please allow popups for this site and try again."
    );
    return;
  }

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        color: #000;
        margin: 0;
        padding: 16px;
      }
      .report-header {
        text-align: center;
        margin-bottom: 12px;
      }
      .report-college {
        font-weight: bold;
        font-size: 15px;
      }
      .report-title {
        font-weight: bold;
        font-size: 13px;
        margin-top: 4px;
      }
      .report-meta {
        display: flex;
        justify-content: space-between;
        margin: 10px 0;
        font-size: 11px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 8px 0;
      }
      th, td {
        border: 1px solid #000;
        padding: 3px 6px;
        font-size: 10.5px;
      }
      th {
        background: #eee;
      }
      .report-totals {
        margin-top: 12px;
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        font-size: 12px;
      }
      @media print {
        body { padding: 0; }
      }
    </style>
  </head>
  <body>
    ${bodyHtml}
  </body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
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
      className="bg-gradient-to-b from-blue-500 to-blue-800 text-white text-[12px] font-semibold px-3 h-9 rounded-sm border border-blue-900 shadow disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-400 hover:to-blue-700 w-full"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export default function DayBookPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    colleges = [],
    ledgerNames = [],
    modesOfPayment = [],
    entries = [],
    totalAmount,
    count,
    loading,
    error,
  } = useSelector((state: RootState) => state.dayBook as any);

  const [dateFrom, setDateFrom] = useState(todayISO());
  const [dateTo, setDateTo] = useState(todayISO());
  const [session, setSession] = useState(currentSession());
  const [allSessions, setAllSessions] = useState(false);
  const [collegeName, setCollegeName] = useState("");
  const [ledgerName, setLedgerName] = useState("");
  const [modeOfPayment, setModeOfPayment] = useState("");
  const [idMode, setIdMode] = useState<IdMode>("ID");

  // Tracks whether a Display search has actually run, so we can tell the
  // difference between "haven't searched yet" (blank placeholder, same as
  // the VB form before Display() is clicked) and "searched but got zero
  // rows back" (show No Record Found), instead of showing the same blank
  // box for both cases.
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    dispatch(getDayBookOptions());
  }, [dispatch]);

  const idColumnLabel =
    idMode === "Registration" ? "Registration No" : idMode === "ID" ? "ID No" : "Uni Roll No";

  // Mirrors VB's Display(): runs the query, then — if zero rows come
  // back — shows the same "No Record Found" message VB's MsgBox gave,
  // plus leaves a persistent inline note in the grid area.
  const handleDisplay = async () => {
    try {
      const result = await dispatch(
        getDayBookEntries({
          collegeName: collegeName || undefined,
          dateFrom,
          dateTo,
          session: session || undefined,
          allSessions,
          ledgerName: ledgerName || undefined,
          modeOfPayment: modeOfPayment || undefined,
        })
      ).unwrap();

      setHasSearched(true);

    
    } catch {
      // request failed — the `error` banner below already surfaces this,
      // but we still mark hasSearched so the placeholder doesn't linger
      setHasSearched(true);
    }
  };

  const handleClose = () => {
    setCollegeName("");
    setLedgerName("");
    setModeOfPayment("");
    setDateFrom(todayISO());
    setDateTo(todayISO());
    setSession(currentSession());
    setAllSessions(false);
    setHasSearched(false);
  };

  const idValueFor = (row: DayBookEntry): string => {
    if (idMode === "UniRoll") return row.UniRollNo ?? "";
    return row.IDNo !== null && row.IDNo !== undefined ? String(row.IDNo) : "";
  };

  /* ---------------- Export to Excel (CSV) ---------------- */

  const handleExportToExcel = () => {
    if (!entries || entries.length === 0) {
      window.alert("No records to export.");
      return;
    }

    const headers = [
      "Date Entry",
      idColumnLabel,
      "Receipt No",
      "Student Name",
      "Father Name",
      "Course",
      "Ledger Name",
      "Mode of Payment",
      "Cheque/Draft No",
      "Cheque/Draft Date",
      "Cheque/Draft Bank",
      "Credit",
    ];

    const lines = [headers.map(csvEscape).join(",")];

    entries.forEach((row: DayBookEntry) => {
      lines.push(
        [
          formatDDMMYYYY(row.DateEntry),
          idValueFor(row),
          row.ReceiptNo,
          row.StudentName,
          row.FatherName,
          row.Course,
          row.LedgerName,
          row.ModeOfPayment,
          row.ChequeDraftNo ?? "",
          row.ChequeDraftDate ? formatDDMMYYYY(row.ChequeDraftDate) : "",
          row.ChequeDraftBank ?? "",
          row.Credit ?? 0,
        ]
          .map(csvEscape)
          .join(",")
      );
    });

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DayBook_${dateFrom}_to_${dateTo}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ---------------- Print: Date Wise ---------------- */

  const handlePrintDateWise = () => {
    if (!collegeName) {
      window.alert("Select College");
      return;
    }
    if (!entries || entries.length === 0) {
      window.alert("Sorry! No Record Found To Be Displayed.");
      return;
    }

    const sorted = [...entries].sort(
      (a, b) => new Date(a.DateEntry).getTime() - new Date(b.DateEntry).getTime()
    );

    renderAndPrintReport("Day Book (Date Wise) Report", sorted);
  };

  /* ---------------- Print: Receipt No Wise ---------------- */

  const handlePrintReceiptNoWise = () => {
    if (!collegeName) {
      window.alert("Please Select College");
      return;
    }
    if (!entries || entries.length === 0) {
      window.alert("Sorry! No Record Found To Be Displayed.");
      return;
    }

    const sorted = [...entries].sort((a, b) => Number(a.ReceiptNo) - Number(b.ReceiptNo));

    renderAndPrintReport("Day Book (Receipt No. Wise) Report", sorted);
  };

  function renderAndPrintReport(title: string, rows: DayBookEntry[]) {
    const cashTotal = rows
      .filter((r) => r.ModeOfPayment === "Cash")
      .reduce((s, r) => s + (Number(r.Credit) || 0), 0);
    const bankTotal = rows
      .filter((r) => r.ModeOfPayment !== "Cash")
      .reduce((s, r) => s + (Number(r.Credit) || 0), 0);
    const grandTotal = cashTotal + bankTotal;

    const rowsHtml = rows
      .map(
        (r) => `
        <tr>
          <td>${escapeHtml(formatDDMMYYYY(r.DateEntry))}</td>
          <td>${escapeHtml(r.ReceiptNo)}</td>
          <td>${escapeHtml(idValueFor(r))}</td>
          <td>${escapeHtml(r.StudentName)}</td>
          <td>${escapeHtml(r.FatherName)}</td>
          <td>${escapeHtml(r.LedgerName)}</td>
          <td>${escapeHtml(r.ModeOfPayment)}</td>
          <td style="text-align:right">${Number(r.Credit ?? 0).toFixed(2)}</td>
        </tr>`
      )
      .join("");

    const bodyHtml = `
      <div class="report-header">
        <div class="report-college">${escapeHtml(collegeName)}</div>
        <div class="report-title">${escapeHtml(title)}</div>
      </div>
      <div class="report-meta">
        <span>Date From : ${escapeHtml(formatDDMMYYYY(dateFrom))}</span>
        <span>Date To : ${escapeHtml(formatDDMMYYYY(dateTo))}</span>
        <span>Total Transactions : ${rows.length}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Receipt No</th>
            <th>${escapeHtml(idColumnLabel)}</th>
            <th>Student Name</th>
            <th>Father Name</th>
            <th>Ledger Name</th>
            <th>Mode of Payment</th>
            <th>Credit</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div class="report-totals">
        <span>Total Cash : ${cashTotal.toFixed(2)}</span>
        <span>Total Bank/Other : ${bankTotal.toFixed(2)}</span>
        <span>Grand Total : ${grandTotal.toFixed(2)}</span>
      </div>
    `;

    openPrintWindow(title, bodyHtml);
  }

  /* ---------------- Print: Ledger Wise ---------------- */

  const handleLedgerWise = async () => {
    if (!collegeName) {
      window.alert("Please Select College");
      return;
    }

    const result = await dispatch(
      getLedgerWiseSummary({ collegeName, dateFrom, dateTo })
    ).unwrap();

    const summary = result.summary ?? [];
    if (summary.length === 0) {
      window.alert("Sorry No Record Found To Print");
      return;
    }

    const cashVsBank = result.cashVsBank ?? { cashTotal: 0, bankTotal: 0 };

    const rowsHtml = summary
      .map(
        (r: any) => `
        <tr>
          <td>${escapeHtml(r.LedgerName)}</td>
          <td style="text-align:right">${Number(r.Credit ?? 0).toFixed(2)}</td>
        </tr>`
      )
      .join("");

    const bodyHtml = `
      <div class="report-header">
        <div class="report-college">${escapeHtml(collegeName)}</div>
        <div class="report-title">Day Book (Ledger Wise) Report</div>
      </div>
      <div class="report-meta">
        <span>Date From : ${escapeHtml(formatDDMMYYYY(dateFrom))}</span>
        <span>Date To : ${escapeHtml(formatDDMMYYYY(dateTo))}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Ledger Name</th>
            <th>Credit</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div class="report-totals">
        <span>Total Cash : ${Number(cashVsBank.cashTotal).toFixed(2)}</span>
        <span>Total Bank/Other : ${Number(cashVsBank.bankTotal).toFixed(2)}</span>
        <span>Grand Total : ${Number(result.total ?? 0).toFixed(2)}</span>
      </div>
    `;

    openPrintWindow("Day Book (Ledger Wise) Report", bodyHtml);
  };

  const hasEntries = entries && entries.length > 0;

  return (
    <div
      className="min-h-screen p-3 text-[13px] text-gray-800"
      style={{
        background:
          "radial-gradient(ellipse at top, #cfe3f7 0%, #a9c7ea 55%, #7fa8d9 100%)",
      }}
    >
      {/* ---------- Filter / command bar ---------- */}
      <div className="bg-white/90 border border-gray-400 rounded-sm shadow p-3 mb-3">
        <div className="grid grid-cols-12 gap-3">
          {/* Left: filters */}
          <div className="col-span-9 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <label className="font-semibold text-[12px]">Dates : From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white"
              />
              <label className="font-semibold text-[12px]">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white"
              />
              <label className="font-semibold text-[12px] ml-2">Session</label>
              <input
                value={session}
                onChange={(e) => setSession(e.target.value)}
                disabled={allSessions}
                className="border border-gray-400 h-8 px-2 w-24 rounded-sm text-[12px] bg-white disabled:bg-gray-200"
              />
              <label className="flex items-center gap-1 text-[12px] font-semibold ml-2">
                <input
                  type="checkbox"
                  checked={allSessions}
                  onChange={(e) => setAllSessions(e.target.checked)}
                />
                All Session
              </label>
            </div>

            <div className="flex items-center gap-3">
              <label className="font-semibold text-[12px] w-16">College</label>
              <select
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white flex-1"
              >
                <option value=""></option>
                {colleges.map((c: string, i: number) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="font-semibold text-[12px]">Ledger Name</label>
              <select
                value={ledgerName}
                onChange={(e) => setLedgerName(e.target.value)}
                className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white w-40"
              >
                <option value=""></option>
                {ledgerNames.map((l: string, i: number) => (
                  <option key={i} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <label className="font-semibold text-[12px] ml-2">Mode Of Payment</label>
              <select
                value={modeOfPayment}
                onChange={(e) => setModeOfPayment(e.target.value)}
                className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white w-40"
              >
                <option value=""></option>
                {modesOfPayment.map((m: string, i: number) => (
                  <option key={i} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-4 ml-4">
                <label className="flex items-center gap-1 text-[12px]">
                  <input
                    type="radio"
                    checked={idMode === "Registration"}
                    onChange={() => setIdMode("Registration")}
                  />
                  Registration No.
                </label>
                <label className="flex items-center gap-1 text-[12px]">
                  <input
                    type="radio"
                    checked={idMode === "ID"}
                    onChange={() => setIdMode("ID")}
                  />
                  ID No.
                </label>
                <label className="flex items-center gap-1 text-[12px]">
                  <input
                    type="radio"
                    checked={idMode === "UniRoll"}
                    onChange={() => setIdMode("UniRoll")}
                  />
                  Uni Roll No.
                </label>
              </div>
            </div>
          </div>

          {/* Right: action buttons, 2 columns x 3 rows */}
          <div className="col-span-3 grid grid-cols-2 gap-2">
            <HeaderButton onClick={handleDisplay}>Display</HeaderButton>
            <HeaderButton onClick={handleLedgerWise}>Ledger- Wise</HeaderButton>
            <HeaderButton onClick={handlePrintDateWise}>Print DateWise</HeaderButton>
            <HeaderButton onClick={handleExportToExcel}>Export To Excel</HeaderButton>
            <HeaderButton onClick={handlePrintReceiptNoWise}>Receipt No. Wise</HeaderButton>
            <HeaderButton onClick={handleClose}>Close</HeaderButton>
          </div>
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
        {hasEntries ? (
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 py-1 text-left">Date</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Receipt No</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">
                    {idColumnLabel}
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Student Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Father Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Course</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Ledger Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Mode of Payment</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Cheque/Draft No</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Cheque/Draft Date</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Bank</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row: DayBookEntry, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-2">
                      {formatDDMMYYYY(row.DateEntry)}
                    </td>
                    <td className="border border-gray-300 px-2">{row.ReceiptNo}</td>
                    <td className="border border-gray-300 px-2">{idValueFor(row)}</td>
                    <td className="border border-gray-300 px-2">{row.StudentName}</td>
                    <td className="border border-gray-300 px-2">{row.FatherName}</td>
                    <td className="border border-gray-300 px-2">{row.Course}</td>
                    <td className="border border-gray-300 px-2">{row.LedgerName}</td>
                    <td className="border border-gray-300 px-2">{row.ModeOfPayment}</td>
                    <td className="border border-gray-300 px-2">{row.ChequeDraftNo ?? ""}</td>
                    <td className="border border-gray-300 px-2">
                      {row.ChequeDraftDate ? formatDDMMYYYY(row.ChequeDraftDate) : ""}
                    </td>
                    <td className="border border-gray-300 px-2">{row.ChequeDraftBank ?? ""}</td>
                    <td className="border border-gray-300 px-2 text-right">
                      {fmtNum(row.Credit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : hasSearched && !loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <span className="text-gray-600 font-semibold text-[14px]">No Record Found</span>
          </div>
        ) : (
          <div className="h-[400px] bg-gray-400/70 border border-gray-400" />
        )}
      </div>

      {/* ---------- Footer ---------- */}
      <div className="mt-2 flex items-center justify-between px-1">
        <span className="font-semibold text-[13px] text-gray-800">
          {hasEntries
            ? `Total Records ${count}`
            : hasSearched
            ? "Number Of Receipts : 0"
            : "Number Of Receipts"}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[13px] text-gray-800">Total Amount</span>
          <input
            readOnly
            value={hasSearched ? fmtNum(totalAmount) : ""}
            className="border border-gray-400 h-8 px-2 w-32 rounded-sm text-[12px] bg-gray-100 text-right"
          />
        </div>
      </div>
    </div>
  );
}