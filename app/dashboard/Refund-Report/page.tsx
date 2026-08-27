"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import { fetchLedgerNames, fetchSessions, fetchDisplay, clearReport } from "@/store/slices/refundReportSlice";

export default function RefundReportPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { ledgerNames, sessions, rows, totalCredit, totalRecords, loading, error } = useSelector(
    (state: RootState) => state.refundReport
  );

  const [colleges, setColleges] = useState<string[]>([]);
  const [collegeName, setCollegeName] = useState("");
  const [ledgerName, setLedgerName] = useState("");
  const [session, setSession] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
    dispatch(fetchSessions());
  }, [dispatch]);

  const handleCollegeChange = (value: string) => {
    setCollegeName(value);
    setLedgerName("");
    if (value) dispatch(fetchLedgerNames(value));
  };

  const handleDisplay = () => {
    if (!collegeName) {
      setFormError("Please select College Name");
      return;
    }
    if (!ledgerName) {
      setFormError("Please select Ledger Name");
      return;
    }
    setFormError(null);
    setHasSearched(true);
    dispatch(fetchDisplay({ collegeName, ledgerName, session: session || undefined }));
  };

  const handleExport = () => {
    if (!collegeName) {
      setFormError("Please Select College");
      return;
    }
    setFormError(null);
    const params = new URLSearchParams({
      collegeName,
      ...(ledgerName ? { ledgerName } : {}),
      ...(session ? { session } : {}),
    });
    window.open(`/api/refund-report/export?${params.toString()}`, "_blank");
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      <div className="max-w-3xl mx-auto">
        <fieldset className="border border-gray-300 rounded bg-white/80 p-4 space-y-3">
          <div className="flex items-center gap-4">
            <label className="w-28 font-semibold text-[13px] text-gray-800">College</label>
            <select value={collegeName} onChange={(e) => handleCollegeChange(e.target.value)} className={selectCls}>
              <option value="">-- Select --</option>
              {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-28 font-semibold text-[13px] text-gray-800">Ledger Name</label>
            <select value={ledgerName} onChange={(e) => setLedgerName(e.target.value)} disabled={!collegeName} className={selectCls}>
              <option value="">-- Select --</option>
              {ledgerNames.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-28 font-semibold text-[13px] text-gray-800">Session</label>
            <select value={session} onChange={(e) => setSession(e.target.value)} className={selectCls}>
              <option value="">-- All --</option>
              {sessions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </fieldset>

        {formError && (
          <p className="text-red-600 text-[13px] font-medium mt-2 text-center">{formError}</p>
        )}

        <div className="flex justify-center gap-4 mt-4">
          <button onClick={handleDisplay} className={btnCls}>Display</button>
          <button className={btnCls}>Close</button>
          <button onClick={handleExport} className={btnCls}>Export to Excel</button>
        </div>

        <div className="mt-4 flex justify-between text-[13px] font-semibold text-gray-900">
          <span>{hasSearched ? `Total Record : ${totalRecords}` : ""}</span>
          <span>{hasSearched && rows.length > 0 ? `Total Credit : ${totalCredit}` : ""}</span>
        </div>

        <div className="bg-white border border-gray-300 rounded shadow-sm mt-2 overflow-auto max-h-[60vh]">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-10">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              {hasSearched ? "No Record Found" : "Choose filters and click Display."}
            </p>
          ) : (
            <table className="w-full border-collapse text-[12px]">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-2 px-2 text-gray-900">Date</th>
                  <th className="text-left py-2 px-2 text-gray-900">Receipt No</th>
                  <th className="text-left py-2 px-2 text-gray-900">ID No</th>
                  <th className="text-left py-2 px-2 text-gray-900">Uni Roll No</th>
                  <th className="text-left py-2 px-2 text-gray-900">Student Name</th>
                  <th className="text-left py-2 px-2 text-gray-900">Father Name</th>
                  <th className="text-left py-2 px-2 text-gray-900">Ledger Name</th>
                  <th className="text-right py-2 px-2 text-gray-900">Credit</th>
                  <th className="text-left py-2 px-2 text-gray-900">Mode</th>
                  <th className="text-left py-2 px-2 text-gray-900">Bank</th>
                  <th className="text-left py-2 px-2 text-gray-900">Cheque No</th>
                  <th className="text-left py-2 px-2 text-gray-900">Cheque Date</th>
                  <th className="text-right py-2 px-2 text-gray-900">Cash</th>
                  <th className="text-right py-2 px-2 text-gray-900">Other</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={`${row.ReceiptNo}-${i}`} className="border-b border-gray-200">
                    <td className="py-1.5 px-2 text-gray-900">
                      {row.DateEntry ? new Date(row.DateEntry).toLocaleDateString("en-GB") : ""}
                    </td>
                    <td className="py-1.5 px-2 text-gray-900">{row.ReceiptNo}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.IDNo}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.UniRollNo ?? ""}</td>
                    <td className="py-1.5 px-2 text-blue-700">{row.StudentName}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.FatherName}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.LedgerName}</td>
                    <td className="py-1.5 px-2 text-right text-gray-900">{row.Credit}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.ModeOfPayment ?? ""}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.ChequeDraftBank ?? ""}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.ChequeDraftNo ?? ""}</td>
                    <td className="py-1.5 px-2 text-gray-900">{row.ChequeDraftDate ?? ""}</td>
                    <td className="py-1.5 px-2 text-right text-gray-900">{row.CashAmount ?? ""}</td>
                    <td className="py-1.5 px-2 text-right text-gray-900">{row.OtherAmount ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const selectCls = "flex-1 border border-gray-300 h-8 px-2 rounded text-[12px] bg-white text-gray-900 disabled:bg-gray-100";
const btnCls = "bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700";