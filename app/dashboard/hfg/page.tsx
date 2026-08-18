"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchColleges,
  fetchLedgersByCollege,
  fetchSessions,
  fetchDuplicateReceipt,
  clearReceipt,
  clearLedgers,
} from "@/store/slices/receiptSearchSlice";

export default function SearchPrintReceiptPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { colleges, ledgers, sessions, receipt, loading, error } = useSelector(
    (state: RootState) => state.receiptSearch
  );

  const [college, setCollege] = useState("");
  const [ledger, setLedger] = useState("");
  const [session, setSession] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [searchType, setSearchType] = useState<"idNo" | "registrationNo">("idNo");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchColleges());
    dispatch(fetchSessions());
  }, [dispatch]);

  // Mirrors cmbLedgerName_Click -> ShowLedger(): re-fetch ledgers whenever
  // college changes, and reset the ledger selection (VB.NET does
  // cmbLedgerName.Items.Clear() at the top of ShowLedger()).
  useEffect(() => {
    setLedger("");
    dispatch(clearLedgers());
    if (college) {
      dispatch(fetchLedgersByCollege(college));
    }
  }, [college, dispatch]);

  const handlePrint = () => {
    // Same order and messages as btnPrint_Click's validation.
    if (!college) return setFormError("Please Select CollegeName");
    if (!ledger) return setFormError("Please Select LedgerName");
    if (!receiptNo) return setFormError("Please Enter ReceiptNo");
    if (!session) return setFormError("Please Select Session");
    setFormError(null);
    dispatch(clearReceipt());
    dispatch(fetchDuplicateReceipt({ college, ledger, session, receiptNo, searchType }));
  };

  const handleClose = () => {
    setCollege("");
    setLedger("");
    setReceiptNo("");
    setFormError(null);
    dispatch(clearReceipt());
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      <h1 className="text-lg font-bold text-gray-900 mb-6">SEARCH AND PRINT ANY RECEIPT</h1>

      <div className="max-w-lg">
        <fieldset className="border border-gray-300 rounded bg-white/80 p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <label className="w-28 font-semibold text-[13px] text-gray-800">College</label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900"
              >
                <option value="">-- Select --</option>
                {colleges.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-28 font-semibold text-[13px] text-gray-800">Ledger Name</label>
              <select
                value={ledger}
                onChange={(e) => setLedger(e.target.value)}
                disabled={!college}
                className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900 disabled:bg-gray-100"
              >
                <option value="">-- Select --</option>
                {ledgers.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-28 font-semibold text-[13px] text-gray-800">Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900"
              >
                <option value="">-- Select --</option>
                {sessions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-28 font-semibold text-[13px] text-gray-800">Enter Receipt No.</label>
              <input
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value.replace(/[^0-9]/g, ""))}
                className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <label className="flex items-center gap-1 text-[13px] font-semibold text-gray-800">
              <input
                type="radio"
                checked={searchType === "registrationNo"}
                onChange={() => setSearchType("registrationNo")}
              />
              Registration No.
            </label>
            <label className="flex items-center gap-1 text-[13px] font-semibold text-gray-800">
              <input
                type="radio"
                checked={searchType === "idNo"}
                onChange={() => setSearchType("idNo")}
              />
              ID No.
            </label>
          </div>
        </fieldset>

        {(formError || error) && (
          <p className="text-red-600 text-[13px] font-medium mt-2 text-center">
            {formError ?? error}
          </p>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handlePrint}
            disabled={loading}
            className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Searching..." : "Print"}
          </button>
          <button
            onClick={handleClose}
            className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700"
          >
            Close
          </button>
          <a
            href="/day-book"
            className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700 flex items-center"
          >
            Go to Day Book
          </a>
        </div>
      </div>

      {receipt && (
        <div className="bg-white border border-gray-300 rounded shadow-sm p-6 max-w-2xl mt-8">
          <div className="text-center mb-4">
            <h2 className="text-base font-bold text-gray-900">{receipt.collegeName}</h2>
            <p className="text-sm font-semibold text-gray-700 mt-1">DUPLICATE RECEIPT</p>
          </div>

          <div className="grid grid-cols-2 gap-y-1 text-[13px] text-gray-900">
            <span><strong>Receipt No:</strong> {receipt.receiptNo}</span>
            <span><strong>Date:</strong> {receipt.dateEntry}</span>
            <span>
              <strong>{searchType === "registrationNo" ? "Registration No:" : "ID No:"}</strong> {receipt.idNo}
            </span>
            {searchType === "idNo" && receipt.uniRollNo && (
              <span><strong>Uni Roll No:</strong> {receipt.uniRollNo}</span>
            )}
            {searchType === "idNo" && receipt.classRollNo && (
              <span><strong>Class Roll No:</strong> {receipt.classRollNo}</span>
            )}
            <span><strong>Course:</strong> {receipt.course}</span>
            <span><strong>Batch:</strong> {receipt.batch}</span>
            <span className="col-span-2"><strong>Name:</strong> {receipt.studentDisplayName}</span>
            <span className="col-span-2"><strong>On Account of:</strong> {receipt.semesterLabel}</span>
          </div>

          <table className="w-full mt-4 text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-1 text-gray-900">Subhead</th>
                <th className="text-right py-1 text-gray-900">Credit</th>
              </tr>
            </thead>
            <tbody>
              {receipt.subheads.map((s, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-1 text-gray-900">{s.subhead}</td>
                  <td className="py-1 text-right text-gray-900">{s.credit}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between mt-3 text-[13px] font-semibold text-gray-900">
            <span>
              {receipt.modeOfPayment}
              {receipt.chequeDraftNo ? ` — No. ${receipt.chequeDraftNo}` : ""}
              {receipt.chequeDraftBank ? `, ${receipt.chequeDraftBank}` : ""}
              {receipt.chequeDraftDate ? `, ${receipt.chequeDraftDate}` : ""}
            </span>
            <span>Total Credit: {receipt.totalCredit}.00</span>
          </div>
        </div>
      )}
    </div>
  );
}