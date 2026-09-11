"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchLedgers,
  fetchColleges,
  fetchReservedReceipts,
  fetchNextReceiptFrom,
  saveReservedReceipts,
  clearMessage,
  emptyDraft,
  ReservedReceiptDraft,
} from "@/store/slices/reservedReceiptsSlice";

const CURRENT_SESSION = "2025-26"; // TODO: replace with your ShowSession1 equivalent (session list/dropdown)

export default function ReservedReceiptsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { ledgers, colleges, rows, totalRecords, receiptFrom, loading, submitting, error, message } =
    useSelector((state: RootState) => state.reservedReceipts);

  const [draft, setDraft] = useState<ReservedReceiptDraft>({ ...emptyDraft, session: CURRENT_SESSION });

  useEffect(() => {
    dispatch(fetchLedgers());
    dispatch(fetchColleges());
    dispatch(fetchReservedReceipts({ session: CURRENT_SESSION }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearMessage());
    }
  }, [error, dispatch]);

  // mirrors cmbCollege_SelectedIndexChanged
  useEffect(() => {
    if (draft.collegeName && draft.ledgerName) {
      dispatch(fetchNextReceiptFrom({ collegeName: draft.collegeName, ledgerName: draft.ledgerName, session: draft.session }));
      dispatch(fetchReservedReceipts({ session: draft.session, collegeName: draft.collegeName }));
    }
  }, [draft.collegeName, draft.ledgerName, dispatch]);

  useEffect(() => {
    setDraft((d) => ({ ...d, receiptFrom: receiptFrom ? String(receiptFrom) : d.receiptFrom }));
  }, [receiptFrom]);

  const receiptTo = draft.receiptFrom && draft.noOfReceipts
    ? Number(draft.receiptFrom) + Number(draft.noOfReceipts)
    : 0;

  const inputClass =
    "border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400";

  // mirrors btnSave_Click
  const handleSave = async () => {
    const result = await dispatch(saveReservedReceipts(draft));
    if (saveReservedReceipts.fulfilled.match(result)) {
      dispatch(fetchReservedReceipts({ session: draft.session, collegeName: draft.collegeName }));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-3 gap-x-8 gap-y-4 max-w-3xl mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Session</label>
          <select
            className={`${inputClass} w-full`}
            value={draft.session}
            onChange={(e) => setDraft({ ...draft, session: e.target.value })}
          >
            <option value={CURRENT_SESSION}>{CURRENT_SESSION}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Receipt Date</label>
          <input
            type="date"
            className={`${inputClass} w-full`}
            value={draft.receiptDate}
            onChange={(e) => setDraft({ ...draft, receiptDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Total No. of Receipts</label>
          <input
            type="number"
            className={`${inputClass} w-full`}
            value={draft.noOfReceipts}
            onChange={(e) => setDraft({ ...draft, noOfReceipts: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Ledger</label>
          <select
            className={`${inputClass} w-full`}
            value={draft.ledgerName}
            onChange={(e) => setDraft({ ...draft, ledgerName: e.target.value })}
          >
            <option value="">Select</option>
            {ledgers.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div></div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Receipt No. To</label>
          <input className={`${inputClass} w-full bg-gray-100`} value={receiptTo || 0} disabled />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">College Name</label>
          <select
            className={`${inputClass} w-full`}
            value={draft.collegeName}
            onChange={(e) => setDraft({ ...draft, collegeName: e.target.value })}
          >
            <option value="">Select</option>
            {colleges.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Receipt No. From</label>
          <input
            type="number"
            className={`${inputClass} w-full`}
            value={draft.receiptFrom}
            onChange={(e) => setDraft({ ...draft, receiptFrom: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={handleSave}
          disabled={submitting}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white px-6 py-2 rounded-md font-medium text-sm"
        >
          Save
        </button>
        <button
          onClick={() => history.back()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium text-sm"
        >
          Close
        </button>
      </div>

      {message && <p className="text-green-700 text-sm mb-4">{message}</p>}

      <h3 className="text-sm font-semibold text-gray-700 mb-2">Total No. of Receipts: {totalRecords}</h3>

      <table className="border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white text-sm w-full max-w-4xl">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Session</th>
            <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">CollegeName</th>
            <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Ledger</th>
            <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ReceiptNo</th>
            <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ReceiptDate</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="text-center py-6 text-gray-500">Loading...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-6 text-gray-400">No records</td></tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border-b border-gray-200 px-3 py-2 text-gray-900">{r.session}</td>
                <td className="border-b border-gray-200 px-3 py-2 text-gray-900">{r.collegeName}</td>
                <td className="border-b border-gray-200 px-3 py-2 text-gray-900">{r.ledger}</td>
                <td className="border-b border-gray-200 px-3 py-2 text-gray-900">{r.receiptNo}</td>
                <td className="border-b border-gray-200 px-3 py-2 text-gray-900">{r.receiptDate}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}