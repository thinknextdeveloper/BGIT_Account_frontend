"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchCollegesForReceipt,
  fetchLedgerNames,
  bulkUpdateReceipts,
  fetchMultipleHeadReport,
  fetchSingleHeadReport,
  clearReports,
} from "@/store/slices/receiptUpdateSlice";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function DisplayReceiptPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    colleges,
    ledgers,
    updating,
    updateMessage,
    multipleHeadRows,
    singleHeadRows,
    loading,
    error,
  } = useSelector((state: RootState) => state.receiptUpdate);

  // --- Update section state ---
  const [updSession, setUpdSession] = useState("2026-27");
  const [updCollege, setUpdCollege] = useState("");
  const [updLedger, setUpdLedger] = useState("");
  const [updDate, setUpdDate] = useState(todayISO());
  const [updFrom, setUpdFrom] = useState("");
  const [updTo, setUpdTo] = useState("");

  // --- Show section state ---
  const [showSession, setShowSession] = useState("2026-27");
  const [showCollege, setShowCollege] = useState("");
  const [showLedger, setShowLedger] = useState("");
  const [showDate, setShowDate] = useState(todayISO());
  const [showFrom, setShowFrom] = useState("");
  const [showTo, setShowTo] = useState("");
  const [searchType, setSearchType] = useState<"registrationNo" | "idNo">("registrationNo");

  useEffect(() => {
    dispatch(fetchCollegesForReceipt());
    dispatch(fetchLedgerNames());
  }, [dispatch]);

  const handleUpdate = () => {
    if (!updCollege || !updLedger || !updDate || !updFrom || !updTo) return;
    dispatch(
      bulkUpdateReceipts({
        collegeName: updCollege,
        session: updSession,
        ledgerName: updLedger,
        displayDate: updDate,
        receiptFrom: updFrom,
        receiptTo: updTo,
      })
    );
  };

  const handleMultipleHeadReport = () => {
    if (!showCollege || !showFrom || !showTo || !showDate) return;
    dispatch(clearReports());
    dispatch(
      fetchMultipleHeadReport({
        collegeName: showCollege,
        session: showSession,
        receiptFrom: showFrom,
        receiptTo: showTo,
        displayDate: showDate,
      })
    );
  };

  const handleSingleHeadReport = () => {
    if (!showCollege || !showLedger || !showFrom || !showTo || !showDate) return;
    dispatch(clearReports());
    dispatch(
      fetchSingleHeadReport({
        collegeName: showCollege,
        session: showSession,
        ledgerName: showLedger,
        receiptFrom: showFrom,
        receiptTo: showTo,
        displayDate: showDate,
      })
    );
  };

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)",
      }}
    >
      <div className="grid grid-cols-12 gap-4">
        {/* Left column: Update + Show sections */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-4">
          {/* --- Update --- */}
          <fieldset className="border border-gray-300 rounded bg-white/70 p-4">
            <legend className="px-2 font-bold text-gray-800 text-[13px]">Update</legend>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center gap-3">
                <label className="w-28 font-semibold text-[12px] text-gray-800">Session</label>
                <input
                  value={updSession}
                  onChange={(e) => setUpdSession(e.target.value)}
                  className="flex-1 border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-28 font-semibold text-[12px] text-gray-800">CollegeName</label>
                <select
                  value={updCollege}
                  onChange={(e) => setUpdCollege(e.target.value)}
                  className="flex-1 border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
                >
                  <option value="">-- Select --</option>
                  {colleges.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-28 font-semibold text-[12px] text-gray-800">Ledger</label>
                <select
                  value={updLedger}
                  onChange={(e) => setUpdLedger(e.target.value)}
                  className="flex-1 border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
                >
                  <option value="">-- Select --</option>
                  {ledgers.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-28 font-semibold text-[12px] text-gray-800">
                  Receipt No. From
                </label>
                <input
                  value={updFrom}
                  onChange={(e) => setUpdFrom(e.target.value)}
                  className="w-28 border-2 border-blue-500 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
                />
                <label className="font-semibold text-[12px] text-gray-800">To</label>
                <input
                  value={updTo}
                  onChange={(e) => setUpdTo(e.target.value)}
                  className="w-28 border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-28 font-semibold text-[12px] text-gray-800">Display Date</label>
                <input
                  type="date"
                  value={updDate}
                  onChange={(e) => setUpdDate(e.target.value)}
                  className="flex-1 border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
                />
              </div>
            </div>

            {updateMessage && (
              <div className="mt-3 text-green-700 font-medium text-[12px]">{updateMessage}</div>
            )}
            {error && <div className="mt-3 text-red-600 font-medium text-[12px]">{error}</div>}
          </fieldset>

          {/* --- Show --- */}
          <fieldset className="border border-gray-300 rounded bg-white/70 p-4">
            <legend className="px-2 font-bold text-gray-800 text-[13px]">Show</legend>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center gap-3">
                <label className="w-28 font-semibold text-[12px] text-gray-800">Session</label>
                <input
                  value={showSession}
                  onChange={(e) => setShowSession(e.target.value)}
                  className="flex-1 border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-28 font-semibold text-[12px] text-gray-800">CollegeName</label>
                <select
                  value={showCollege}
                  onChange={(e) => setShowCollege(e.target.value)}
                  className="flex-1 border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
                >
                  <option value="">-- Select --</option>
                  {colleges.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-28 font-semibold text-[12px] text-gray-800">Ledger</label>
                <select
                  value={showLedger}
                  onChange={(e) => setShowLedger(e.target.value)}
                  className="flex-1 border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
                >
                  <option value="">-- Select --</option>
                  {ledgers.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-28 font-semibold text-[12px] text-gray-800">
                  Receipt No. From
                </label>
                <input
                  value={showFrom}
                  onChange={(e) => setShowFrom(e.target.value)}
                  className="w-28 border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
                />
                <label className="font-semibold text-[12px] text-gray-800">To</label>
                <input
                  value={showTo}
                  onChange={(e) => setShowTo(e.target.value)}
                  className="w-28 border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-28 font-semibold text-[12px] text-gray-800">Display Date</label>
                <input
                  type="date"
                  value={showDate}
                  onChange={(e) => setShowDate(e.target.value)}
                  className="flex-1 border border-gray-300 h-8 rounded-sm px-2 text-[12px] bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4">
              <label className="flex items-center gap-1 text-[12px] font-semibold text-gray-800">
                <input
                  type="radio"
                  checked={searchType === "registrationNo"}
                  onChange={() => setSearchType("registrationNo")}
                />
                Registration No.
              </label>
              <label className="flex items-center gap-1 text-[12px] font-semibold text-gray-800">
                <input
                  type="radio"
                  checked={searchType === "idNo"}
                  onChange={() => setSearchType("idNo")}
                />
                ID No.
              </label>
            </div>
          </fieldset>

          {/* Report results */}
          {(multipleHeadRows.length > 0 || singleHeadRows.length > 0 || loading) && (
            <div className="bg-white border border-gray-300 rounded shadow-sm p-4 overflow-auto max-h-96">
              {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
              ) : multipleHeadRows.length > 0 ? (
                <table className="w-full text-[12px]">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border px-2 py-1 text-left text-gray-900">Ledger Name</th>
                      <th className="border px-2 py-1 text-right text-gray-900">Total Debit</th>
                      <th className="border px-2 py-1 text-right text-gray-900">Total Credit</th>
                      <th className="border px-2 py-1 text-right text-gray-900">Entries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multipleHeadRows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border px-2 py-1 text-gray-900">{row.LedgerName}</td>
                        <td className="border px-2 py-1 text-right text-gray-900">{row.TotalDebit}</td>
                        <td className="border px-2 py-1 text-right text-gray-900">{row.TotalCredit}</td>
                        <td className="border px-2 py-1 text-right text-gray-900">{row.EntryCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-[12px]">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border px-2 py-1 text-left text-gray-900">Date</th>
                      <th className="border px-2 py-1 text-left text-gray-900">ID No</th>
                      <th className="border px-2 py-1 text-left text-gray-900">Receipt No</th>
                      <th className="border px-2 py-1 text-left text-gray-900">Particulars</th>
                      <th className="border px-2 py-1 text-right text-gray-900">Debit</th>
                      <th className="border px-2 py-1 text-right text-gray-900">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {singleHeadRows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border px-2 py-1 text-gray-900">{row.DateEntry}</td>
                        <td className="border px-2 py-1 text-gray-900">{row.IDNo}</td>
                        <td className="border px-2 py-1 text-gray-900">{row.ReceiptNo}</td>
                        <td className="border px-2 py-1 text-gray-900">{row.Particulars}</td>
                        <td className="border px-2 py-1 text-right text-gray-900">{row.Debit}</td>
                        <td className="border px-2 py-1 text-right text-gray-900">{row.Credit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Right column: action buttons */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-3">
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="bg-blue-600 text-white font-semibold text-[13px] h-10 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {updating ? "Updating..." : "Update"}
          </button>
          <button className="bg-blue-600 text-white font-semibold text-[13px] h-10 rounded hover:bg-blue-700">
            Close
          </button>

          <div className="h-4" />

          <button
            onClick={handleMultipleHeadReport}
            className="bg-blue-600 text-white font-semibold text-[13px] h-10 rounded hover:bg-blue-700"
          >
            View Multiple Head Report
          </button>
          <button
            onClick={handleSingleHeadReport}
            className="bg-blue-600 text-white font-semibold text-[13px] h-10 rounded hover:bg-blue-700"
          >
            View Single Head Report
          </button>
        </div>
      </div>
    </div>
  );
}