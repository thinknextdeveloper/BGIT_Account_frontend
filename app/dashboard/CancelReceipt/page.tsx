"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/store/store";
import {
  getCancelReceiptColleges,
  getCancelReceiptLedgerNames,
  searchCancelReceipt,
  addToCancelledReceipts,
  getCancelledReceiptsList, 
  clearCancelStatus,
  clearSearchResults,
  clearLedgerNames,
  SearchedReceipt,
  CancelledReceiptRow,
} from "@/store/slices/cancelReceiptSlice";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentSession(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
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
  return `${day}-${month}-${year}`;
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

/* ------------------------------------------------------------------ */
/*  Print helper                                                        */
/* ------------------------------------------------------------------ */

function printCancelledList(
  collegeName: string,
  dateFrom: string,
  dateTo: string,
  rows: CancelledReceiptRow[]
) {
  const printWindow = window.open("", "_blank", "width=1000,height=1000");
  if (!printWindow) {
    window.alert(
      "Your browser blocked the print popup. Please allow popups for this site and try again."
    );
    return;
  }

  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(formatDDMMYYYY(r.DateEntry))}</td>
        <td>${escapeHtml(r.ReceiptNo)}</td>
        <td>${escapeHtml(r.CollegeName)}</td>
        <td>${escapeHtml(r.LedgerName)}</td>
        <td>${escapeHtml(r.IDNo)}</td>
        <td>${escapeHtml(r.StudentName)}</td>
        <td>${escapeHtml(r.ModeOfPayment)}</td>
        <td style="text-align:right">${Number(r.Credit ?? 0).toFixed(2)}</td>
        <td>${escapeHtml(r.Comments)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Cancel Receipt (Date Wise) Report</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 12px; color: #000; margin: 0; padding: 16px; }
      .report-header { text-align: center; margin-bottom: 12px; }
      .report-title { font-weight: bold; font-size: 15px; }
      .report-meta { display: flex; justify-content: space-between; margin: 10px 0; font-size: 11px; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0; }
      th, td { border: 1px solid #000; padding: 3px 6px; font-size: 10.5px; }
      th { background: #eee; }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    <div class="report-header">
      <div class="report-title">Cancel Receipt (Date Wise) Report</div>
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
          <th>College</th>
          <th>Ledger Name</th>
          <th>ID No</th>
          <th>Student Name</th>
          <th>Mode of Payment</th>
          <th>Credit</th>
          <th>Comments</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
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
      className="bg-gradient-to-b from-blue-500 to-blue-800 text-white text-[12px] font-semibold px-4 h-8 rounded-sm border border-blue-900 shadow disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-400 hover:to-blue-700"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export default function CancelReceiptPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    colleges = [],
    ledgerNames = [],
    searchResults = [],
    searchLoading,
    searchError,
    cancelling,
    cancelError,
    cancelMessage,
    cancelledList = [],
    cancelledListLoading,
    cancelledListError,
  } = useSelector((state: RootState) => state.cancelReceipt as any);

  const [collegeName, setCollegeName] = useState("");
  const [ledgerName, setLedgerName] = useState("");
  const [session, setSession] = useState(currentSession());
  const [receiptNo, setReceiptNo] = useState("");

  const [comments, setComments] = useState("");

  const [dateFrom, setDateFrom] = useState(todayISO());
  const [dateTo, setDateTo] = useState(todayISO());
  const [hasDisplayed, setHasDisplayed] = useState(false);

  useEffect(() => {
    dispatch(getCancelReceiptColleges());
  }, [dispatch]);

  // Mirrors VB cmbLedger_Click -> ShowLedgerName(): ledger names depend on
  // the selected college and reset whenever college changes.
  useEffect(() => {
    if (collegeName) {
      dispatch(getCancelReceiptLedgerNames(collegeName));
    } else {
      dispatch(clearLedgerNames());
    }
    setLedgerName("");
    dispatch(clearSearchResults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeName]);

  // Mirrors VB btnSearch_Click validation order exactly.
  const handleSearch = async () => {
    if (!collegeName) {
      window.alert("Please Specify College Name");
      return;
    }
    if (!ledgerName) {
      window.alert("Please Specify Ledger Name");
      return;
    }
    if (!receiptNo) {
      window.alert("Please Specify Receipt No");
      return;
    }
    if (isNaN(Number(receiptNo))) {
      window.alert("Please Specify valid Receipt No");
      return;
    }
    if (!session) {
      window.alert("Please Specify Session");
      return;
    }

    try {
      const result = await dispatch(
        searchCancelReceipt({ collegeName, ledgerName, session, receiptNo })
      ).unwrap();

      if (!result.rows || result.rows.length === 0) {
        window.alert("No Record Found");
      }
    } catch {
      // searchError banner shows below
    }
  };

  // Mirrors VB btnAddCancelReceipt_Click: re-uses the same search criteria
  // (not a grid row selection) to find and cancel the receipt.
  const handleAddToCancelled = async () => {
    if (!comments.trim()) {
      window.alert("Please Specify Comments to Cancel Receipt");
      return;
    }

    dispatch(clearCancelStatus());

    try {
      const result = await dispatch(
        addToCancelledReceipts({ collegeName, ledgerName, session, receiptNo, comments: comments.trim() })
      ).unwrap();

      if (result.success === false) {
        window.alert("No Record Found");
        return;
      }

      window.alert("Receipt has been cancelled successfully");
      setComments("");
      dispatch(clearSearchResults());

      // VB calls Display() right after a successful cancel to refresh the
      // bottom grid — do the same if a date range is already set.
      if (hasDisplayed) {
        dispatch(
          getCancelledReceiptsList({
            collegeName: collegeName || undefined,
            dateFrom,
            dateTo,
          })
        );
      }
    } catch {
      // cancelError banner shows below
    }
  };

  const handleDisplay = async () => {
    try {
      const result = await dispatch(
        getCancelledReceiptsList({ collegeName: collegeName || undefined, dateFrom, dateTo })
      ).unwrap();

      setHasDisplayed(true);

      if (!result.rows || result.rows.length === 0) {
        window.alert("No Record Found.");
      }
    } catch {
      setHasDisplayed(true);
    }
  };

  const handlePrint = () => {
    if (!cancelledList || cancelledList.length === 0) {
      window.alert("Sorry! No Record Found To Be Displayed.");
      return;
    }
    printCancelledList(collegeName, dateFrom, dateTo, cancelledList);
  };

  const handleClose = () => {
    setCollegeName("");
    setLedgerName("");
    setSession(currentSession());
    setReceiptNo("");
    setComments("");
    setDateFrom(todayISO());
    setDateTo(todayISO());
    setHasDisplayed(false);
    dispatch(clearSearchResults());
    dispatch(clearCancelStatus());
  };

  const hasSearchResults = searchResults && searchResults.length > 0;
  const hasCancelledList = cancelledList && cancelledList.length > 0;

  return (
    <div
      className="min-h-screen p-3 text-[13px] text-gray-800"
      style={{
        background:
          "radial-gradient(ellipse at top, #cfe3f7 0%, #a9c7ea 55%, #7fa8d9 100%)",
      }}
    >
      {/* ---------- Search bar ---------- */}
      <div className="bg-white/90 border border-gray-400 rounded-sm shadow p-3 mb-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[11px] font-semibold text-gray-700 block mb-1">
              College Name
            </label>
            <select
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white w-56"
            >
              <option value=""></option>
              {colleges.map((c: string, i: number) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-700 block mb-1">
              Ledger Name
            </label>
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
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-700 block mb-1">
              Session
            </label>
            <input
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white w-24"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-700 block mb-1">
              Receipt No.
            </label>
            <input
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white w-28"
            />
          </div>

          <HeaderButton onClick={handleSearch} disabled={searchLoading}>
            {searchLoading ? "Searching..." : "Search"}
          </HeaderButton>
        </div>
      </div>

      {searchError && (
        <div className="mb-3 bg-red-100 border border-red-400 text-red-800 text-[12px] font-semibold px-3 py-2 rounded-sm">
          {searchError}
        </div>
      )}

      {/* ---------- Search results grid ---------- */}
      <div className="bg-white/95 border border-gray-400 rounded-sm shadow min-h-[110px] mb-3">
        {hasSearchResults ? (
          <div className="max-h-[200px] overflow-y-auto">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 py-1 text-left">Date</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Receipt No</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">ID No</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Student Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Father Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Ledger Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Mode of Payment</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((row: SearchedReceipt, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-2">
                      {formatDDMMYYYY(row.DateEntry)}
                    </td>
                    <td className="border border-gray-300 px-2">{row.ReceiptNo}</td>
                    <td className="border border-gray-300 px-2">{row.IDNo}</td>
                    <td className="border border-gray-300 px-2">{row.StudentName}</td>
                    <td className="border border-gray-300 px-2">{row.FatherName}</td>
                    <td className="border border-gray-300 px-2">{row.LedgerName}</td>
                    <td className="border border-gray-300 px-2">{row.ModeOfPayment}</td>
                    <td className="border border-gray-300 px-2 text-right">
                      {fmtNum(row.Credit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[110px] bg-gray-400/70 border border-gray-400" />
        )}
      </div>

      {/* ---------- Comments + cancel action ---------- */}
      <div className="bg-white/90 border border-gray-400 rounded-sm shadow p-3 mb-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-[12px] font-semibold">Comments :</label>
          <input
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white flex-1 min-w-[200px]"
          />
          <span className="text-red-600 font-semibold text-[12px]">
            ( Please specify comment to cancel Receipt)
          </span>
          <HeaderButton onClick={handleAddToCancelled} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Add To Cancelled Receipts"}
          </HeaderButton>
          <HeaderButton onClick={handleClose}>Close</HeaderButton>
        </div>

        {cancelError && (
          <div className="mt-2 bg-red-100 border border-red-400 text-red-800 text-[12px] font-semibold px-3 py-2 rounded-sm">
            {cancelError}
          </div>
        )}
        {cancelMessage && (
          <div className="mt-2 bg-green-100 border border-green-400 text-green-800 text-[12px] font-semibold px-3 py-2 rounded-sm">
            {cancelMessage}
          </div>
        )}
      </div>

      {/* ---------- Date range + Display/Print ---------- */}
      <div className="bg-white/90 border border-gray-400 rounded-sm shadow p-3 mb-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-[12px] font-semibold">Dates :</label>
          <div>
            <label className="text-[11px] font-semibold text-gray-700 block mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-700 block mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-400 h-8 px-2 rounded-sm text-[12px] bg-white"
            />
          </div>
          <HeaderButton onClick={handleDisplay} disabled={cancelledListLoading}>
            {cancelledListLoading ? "Loading..." : "Display"}
          </HeaderButton>
          <HeaderButton onClick={handlePrint}>Print</HeaderButton>
        </div>
      </div>

      {cancelledListError && (
        <div className="mb-3 bg-red-100 border border-red-400 text-red-800 text-[12px] font-semibold px-3 py-2 rounded-sm">
          {cancelledListError}
        </div>
      )}

      {/* ---------- Cancelled receipts grid ---------- */}
      <div className="bg-white/95 border border-gray-400 rounded-sm shadow min-h-[400px]">
        {hasCancelledList ? (
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 py-1 text-left">Date</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Receipt No</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">College</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Ledger Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">ID No</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Student Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Mode of Payment</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Credit</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Comments</th>
                </tr>
              </thead>
              <tbody>
                {cancelledList.map((row: CancelledReceiptRow, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-2">
                      {formatDDMMYYYY(row.DateEntry)}
                    </td>
                    <td className="border border-gray-300 px-2">{row.ReceiptNo}</td>
                    <td className="border border-gray-300 px-2">{row.CollegeName}</td>
                    <td className="border border-gray-300 px-2">{row.LedgerName}</td>
                    <td className="border border-gray-300 px-2">{row.IDNo}</td>
                    <td className="border border-gray-300 px-2">{row.StudentName}</td>
                    <td className="border border-gray-300 px-2">{row.ModeOfPayment}</td>
                    <td className="border border-gray-300 px-2 text-right">
                      {fmtNum(row.Credit)}
                    </td>
                    <td className="border border-gray-300 px-2">{row.Comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : hasDisplayed && !cancelledListLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <span className="text-gray-600 font-semibold text-[14px]">No Record Found.</span>
          </div>
        ) : (
          <div className="h-[400px] bg-gray-400/70 border border-gray-400" />
        )}
      </div>
    </div>
  );
}