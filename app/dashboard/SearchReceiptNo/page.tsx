"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import {
  fetchColleges,
  searchReceipt,
  clearResults,
} from "@/store/slices/searchReceiptNoSlice";

export default function SearchReceiptNoPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { colleges: reduxColleges, results, loading, error } = useSelector(
    (state: RootState) => state.searchReceiptNo
  );

  const [colleges, setColleges] = useState<string[]>([]);
  const [allColleges, setAllColleges] = useState(false);
  const [college, setCollege] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchColleges());
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success && Array.isArray(res.data?.data)) {
        setColleges(res.data.data);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (reduxColleges && reduxColleges.length > 0) {
      setColleges(reduxColleges);
    }
  }, [reduxColleges]);

  const handleAllCollegesToggle = (checked: boolean) => {
    setAllColleges(checked);
    setCollege("");
  };

  const handleFind = async () => {
    if (!receiptNo.trim()) {
      setFormError("Please Enter Receipt No.");
      return;
    }

    if (!allColleges && !college) {
      setFormError("Please specify College");
      return;
    }

    setFormError(null);
    dispatch(clearResults());
    const actionResult = await dispatch(
      searchReceipt({
        receiptNo: receiptNo.trim(),
        college: allColleges ? undefined : college,
        allColleges,
      })
    );

    if (searchReceipt.rejected.match(actionResult)) {
      setFormError(String(actionResult.payload || "Sorry No record found"));
      setReceiptNo("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFind();
    }
  };

  const handleClose = () => {
    setReceiptNo("");
    setCollege("");
    setAllColleges(false);
    setFormError(null);
    dispatch(clearResults());
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)",
      }}
    >
      <h1 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
        Search By Receipt No
      </h1>

      <div className="flex items-start gap-4 mb-6 flex-wrap">
        <fieldset className="border border-gray-300 rounded bg-white/85 shadow-sm p-4 flex-1 min-w-[320px] max-w-2xl">
          <legend className="text-xs font-semibold text-gray-600 px-1">
            Search Filters
          </legend>
          <div className="flex flex-col gap-3">
            {/* College selection */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <label className="flex items-center gap-2 w-36 font-semibold text-[13px] text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allColleges}
                  onChange={(e) => handleAllCollegesToggle(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                All Colleges
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                disabled={allColleges}
                className="flex-1 border border-gray-300 h-9 px-3 rounded text-[13px] bg-white text-gray-900 disabled:bg-gray-200 disabled:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Select College --</option>
                {colleges.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Receipt No input */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <label className="w-36 font-semibold text-[13px] text-gray-800">
                Enter Receipt No.
              </label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter Receipt No"
                className="flex-1 border border-gray-300 h-9 px-3 rounded text-[13px] bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </fieldset>

        {/* Action Buttons */}
        <div className="flex gap-3 items-center self-center sm:self-start">
          <button
            onClick={handleFind}
            disabled={loading}
            className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded shadow hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {loading ? "Finding..." : "Find"}
          </button>
          <button
            onClick={handleClose}
            className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded shadow hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {(formError || error) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded">
          {formError ?? error}
        </div>
      )}

      {/* Results Section */}
      <div className="bg-white/80 border border-gray-300 rounded shadow-sm p-4">
        {results && results.length > 0 && (
          <div className="flex justify-between items-center mb-3">
            <p className="text-[13px] font-semibold text-gray-800">
              Total Records : {results.length}
            </p>
          </div>
        )}

        <div className="bg-gray-200 border border-gray-300 rounded min-h-[420px] max-h-[600px] overflow-auto">
          {results && results.length > 0 ? (
            <table className="w-full text-[12px] bg-white text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0 border-b border-gray-300 z-10">
                <tr>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Session</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">College Name</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Transaction ID</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Date Entry</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">ID No</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Uni Roll No</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Student Name</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Father Name</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Mother Name</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Course</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Class</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Batch</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Class Roll No</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Semester</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Semester ID</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Scheme</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Fee Category</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Mode Of Admission</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Sex</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">On Account Of</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Particulars</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Receipt No</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap text-right">Debit</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap text-right">Credit</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap text-right">Balance</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Ledger Name</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Transaction Type</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Concession Entry</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap text-right">Concession Amount</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Cheque/Draft Bank</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Cheque/Draft No</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Cheque/Draft Date</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Mode Of Payment</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Receipt Type</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Registration No</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">User ID</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Display Date</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Security</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap text-right">Cash Amount</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap text-right">Other Amount</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Remarks</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Brother/Sis</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Category</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">Is Legacy</th>
                  <th className="border px-2 py-2 text-gray-800 font-semibold whitespace-nowrap">System IP</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={`${r.TransactionID}-${r.ReceiptNo}-${i}`}
                    className={i % 2 === 0 ? "bg-white hover:bg-blue-50/50" : "bg-gray-50 hover:bg-blue-50/50"}
                  >
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.Session ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.CollegeName ?? ""}</td>
                    <td className="border px-2 py-1.5 text-blue-700 whitespace-nowrap font-semibold">{r.TransactionID ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{formatDate(r.DateEntry)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.IDNo ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.UniRollNo ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap font-medium">{r.StudentName ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.FatherName ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.MotherName ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.Course ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.Class ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.Batch ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.ClassRollNo ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.Semester ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.SemesterID ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.Scheme ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.FeeCategory ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.ModeOfAdmission ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.Sex ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.OnAccountOf ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.Particulars ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap font-medium">{r.ReceiptNo ?? ""}</td>
                    <td className="border px-2 py-1.5 text-red-600 whitespace-nowrap text-right font-medium">
                      {r.Debit != null ? Number(r.Debit).toFixed(2) : "0.00"}
                    </td>
                    <td className="border px-2 py-1.5 text-green-600 whitespace-nowrap text-right font-medium">
                      {r.Credit != null ? Number(r.Credit).toFixed(2) : "0.00"}
                    </td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap text-right">
                      {r.Balance != null ? Number(r.Balance).toFixed(2) : ""}
                    </td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.LedgerName ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.TransactionType ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.ConcessionEntry ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap text-right">
                      {r.ConcessionAmount != null ? Number(r.ConcessionAmount).toFixed(2) : ""}
                    </td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.ChequeDraftBank ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.ChequeDraftNo ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{formatDate(r.ChequeDraftDate)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.ModeOfPayment ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.ReceiptType ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.RegistrationNo ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.UserID ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{formatDate(r.DisplayDate)}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.Security ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap text-right">
                      {r.CashAmount != null ? Number(r.CashAmount).toFixed(2) : ""}
                    </td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap text-right">
                      {r.OtherAmount != null ? Number(r.OtherAmount).toFixed(2) : ""}
                    </td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.Remarks ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.BrotherSis ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.Category ?? ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.IsLegacy != null ? String(r.IsLegacy) : ""}</td>
                    <td className="border px-2 py-1.5 text-gray-900 whitespace-nowrap">{r.SystemIP ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-[420px] flex items-center justify-center text-gray-500 text-sm">
              {loading ? "Searching..." : "No records to display. Enter a Receipt No and click Find."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
