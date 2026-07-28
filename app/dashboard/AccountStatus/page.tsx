"use client";

import React, { useState, useEffect, useCallback } from "react";
import { feeSingleHeadApi } from "@/services/feeSingleHeadApi";
import { reduxApiClient } from "@/services/reduxservices";

interface StudentDetails {
  IDNo?: string | number;
  CollegeName?: string;
  StudentName?: string;
  FatherName?: string;
  Course?: string;
  Batch?: string;
  Class?: string;
  ClassRollNo?: string;
  UniRollNo?: string;
  PermanentAddress?: string;
  Sex?: string;
  Facility?: string;
  BusRoute?: string;
  Route?: string;
  PhoneNo?: string;
  StudentMobileNo?: string;
  FatherMobileNo?: string;
  Snap?: string | null;
  Semester?: string;
}

interface LedgerRecord {
  DateEntry?: string;
  TransactionID?: string | number;
  ReceiptNo?: string | number;
  Particulars?: string;
  TransactionType?: string;
  Batch?: string;
  Semester?: string;
  ModeOfPayment?: string;
  Debit?: number;
  Credit?: number;
  Remarks?: string;
  LedgerName?: string;
  Balance?: number;
}

export default function AccountStatusPage() {
  // Search state matching VB controls: rdbtnIDNo, rdbtnRegistrationNo, txtIDNo, Cmbbatch, ChkAllbatch
  const [searchType, setSearchType] = useState<"IDNo" | "RegistrationNo">("IDNo");
  const [txtIDNo, setTxtIDNo] = useState<string>("");
  const [cmbbatch, setCmbbatch] = useState<string>("");
  const [chkAllbatch, setChkAllbatch] = useState<boolean>(true);
  const [batchesList, setBatchesList] = useState<string[]>([]);

  // Student Details state
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [semester, setSemester] = useState<string>("");
  const [session, setSession] = useState<string>("");

  // Ledger details & totals state matching dgvdetail, lblTotalCredits, lblTotalDebits, lblTotalBalance
  const [ledgerRecords, setLedgerRecords] = useState<LedgerRecord[]>([]);
  const [totalDebits, setTotalDebits] = useState<number>(0);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  // Print & PDF modal state
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Status & loading indicators
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearched, setIsSearched] = useState<boolean>(false);

  // Fetch available batches list for dropdown options
  useEffect(() => {
    reduxApiClient
      .get("master-course/colleges")
      .then(async (res) => {
        if (res.success && res.data?.data && res.data.data.length > 0) {
          const firstCollege = res.data.data[0];
          const courseRes = await reduxApiClient.get("master-course/courses", { collegeName: firstCollege });
          if (courseRes.success && courseRes.data?.data && courseRes.data.data.length > 0) {
            const firstCourse = courseRes.data.data[0];
            const batchRes = await reduxApiClient.get("master-course/batches", {
              collegeName: firstCollege,
              course: firstCourse,
            });
            if (batchRes.success && batchRes.data?.data) {
              setBatchesList(batchRes.data.data);
            }
          }
        }
      })
      .catch((err) => console.warn("Failed to load initial batches:", err));
  }, []);

  /**
   * Clear all fields matching legacy VB Clear() subroutine
   */
  const clearAllFields = useCallback(() => {
    setStudent(null);
    setSemester("");
    setSession("");
    setLedgerRecords([]);
    setTotalDebits(0);
    setTotalCredits(0);
    setTotalBalance(0);
    setIsSearched(false);
    setShowPrintModal(false);
  }, []);

  /**
   * DisplayStudentDetails() logic translated from legacy VB.NET
   */
  const DisplayStudentDetails = async () => {
    setError(null);

    const cleanInput = txtIDNo.trim();

    // 1. Radio Button validation matching VB.NET:
    // If rdbtnIDNo.Checked = True Then If Len(txtIDNo.Text) <> 10 Then MsgBox("Invalid ID No.") Clear() Exit Sub
    // ElseIf rdbtnRegistrationNo.Checked = True Then If Len(txtIDNo.Text) <> 6 Then MsgBox("Invalid Registration No.") Clear() Exit Sub
    if (searchType === "IDNo") {
      if (cleanInput.length !== 10) {
        setError("Invalid ID No.");
        clearAllFields();
        return;
      }
    } else if (searchType === "RegistrationNo") {
      if (cleanInput.length !== 6) {
        setError("Invalid Registration No.");
        clearAllFields();
        return;
      }
    }

    if (!cleanInput) {
      setError(searchType === "IDNo" ? "Invalid ID No." : "Invalid Registration No.");
      clearAllFields();
      return;
    }

    try {
      setLoading(true);

      // Fetch student details & ledger from feeSingleHeadApi (utilizes existing service layer)
      const res = await feeSingleHeadApi.getStudentFeeDetails(cleanInput);

      if (res.success && res.data) {
        const studentData = res.data.studentDetails;
        const currentSession = res.data.session || "";

        setStudent(studentData);
        setSession(currentSession);

        // Populate semester if available or default
        if ((studentData as any)?.Semester) {
          setSemester((studentData as any).Semester);
        } else if (studentData?.CollegeName) {
          try {
            const semRes = await feeSingleHeadApi.getSemesters(studentData.CollegeName);
            if (semRes.success && semRes.data && semRes.data.length > 0) {
              const semVal = typeof semRes.data[0] === "string" ? semRes.data[0] : semRes.data[0].Semester;
              setSemester(semVal || "");
            }
          } catch (e) {
            console.warn("Failed to fetch semester:", e);
          }
        }

        // ShowDgvDetail() logic: Filter and calculate ledger details & balance
        ShowDgvDetail(res.data.ledgerDetails || []);
        setIsSearched(true);
      } else {
        // Rights / Invalid error check matching VB.NET
        if (res.message && res.message.toLowerCase().includes("rights")) {
          if (searchType === "RegistrationNo") {
            setError("This Registration No. does not belong to your rights.");
          } else {
            setError("This ID No. does not belong to your rights.");
          }
        } else {
          if (searchType === "RegistrationNo") {
            setError("Invalid Registration No");
          } else {
            setError("Invalid ID No");
          }
        }
        clearAllFields();
      }
    } catch (err: any) {
      console.error("Error in DisplayStudentDetails:", err);
      const msg = err.message || "";
      if (msg.toLowerCase().includes("rights")) {
        if (searchType === "RegistrationNo") {
          setError("This Registration No. does not belong to your rights.");
        } else {
          setError("This ID No. does not belong to your rights.");
        }
      } else {
        if (searchType === "RegistrationNo") {
          setError("Invalid Registration No");
        } else {
          setError("Invalid ID No");
        }
      }
      clearAllFields();
    } finally {
      setLoading(false);
    }
  };

  /**
   * ShowDgvDetail() logic translated from legacy VB.NET
   */
  const ShowDgvDetail = (rawLedger: LedgerRecord[]) => {
    let filteredLedger = [...rawLedger];

    // Apply batch filtering matching VB:
    // If rdbtnIDNo.Checked = True Then If txtIDNo.Text <> "" And Cmbbatch.Text <> "" Then where IDNo = ... and batch = ...
    if (!chkAllbatch && cmbbatch && cmbbatch.trim() !== "") {
      filteredLedger = filteredLedger.filter(
        (row) => row.Batch && String(row.Batch).trim().toLowerCase() === cmbbatch.trim().toLowerCase()
      );
    }

    let calculatedTotalCredits = 0;
    let calculatedTotalDebits = 0;
    let runningBalance = 0;

    const processedRows = filteredLedger.map((row) => {
      const credit = Number(row.Credit) || 0;
      const debit = Number(row.Debit) || 0;

      calculatedTotalCredits += credit;
      calculatedTotalDebits += debit;

      // Balance calculation matching VB.NET ShowDgvDetail:
      // If TransactionType = "Credit" Then varbalance1 = varbalance1 - CDbl(varcredit)
      // ElseIf TransactionType = "Debit" Then varbalance1 = varbalance1 + CDbl(vardebit)
      const txnType = row.TransactionType || (credit > 0 ? "Credit" : "Debit");
      if (txnType === "Credit") {
        runningBalance -= credit;
      } else if (txnType === "Debit") {
        runningBalance += debit;
      }

      return {
        ...row,
        Credit: credit,
        Debit: debit,
        TransactionType: txnType,
        Balance: runningBalance,
      };
    });

    // Net Balance matching VB.NET: varBalance = vartotalDebits - vartotalcredits
    const netBalance = calculatedTotalDebits - calculatedTotalCredits;

    setLedgerRecords(processedRows);
    setTotalDebits(calculatedTotalDebits);
    setTotalCredits(calculatedTotalCredits);
    setTotalBalance(netBalance);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      DisplayStudentDetails();
    }
  };

  /**
   * Open dedicated print window with exact Crystal Report layout (guarantees non-blank PDF print dialog)
   */
  const handlePrintReport = () => {
    if (!student) return;

    const collegeName = student.CollegeName || "Asra College of Education";
    const studentName = student.StudentName || "-";
    const fatherName = student.FatherName || "-";
    const idNoVal = student.IDNo || txtIDNo || "-";
    const courseVal = student.Course || "-";
    const batchVal = student.Batch || "-";
    const addressVal = student.PermanentAddress || "-";
    const busRouteVal = student.BusRoute || student.Route || "-";
    const sessionVal = session || "2026-27";
    const currentDate = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
    const currentTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

    const rowsHtml = ledgerRecords.length === 0
      ? `<tr><td colspan="6" style="text-align:center; padding: 15px;">No transactions found.</td></tr>`
      : ledgerRecords.map((row) => `
          <tr>
            <td>${row.DateEntry || "-"}</td>
            <td>${row.ReceiptNo ? String(row.ReceiptNo) : ""}</td>
            <td style="font-weight: 500;">${row.Particulars || "-"}</td>
            <td style="text-align: right;">${row.Debit !== undefined && row.Debit !== 0 ? row.Debit : ""}</td>
            <td style="text-align: right;">${row.Credit !== undefined && row.Credit !== 0 ? row.Credit : ""}</td>
            <td style="text-align: right; font-weight: 500;">${row.Balance !== undefined ? row.Balance : ""}</td>
          </tr>
        `).join("");

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ACCOUNT STATUS REPORT - ${idNoVal}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 10px;
            font-size: 12px;
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            font-family: monospace;
            font-size: 11px;
            margin-bottom: 10px;
          }
          .title-section {
            text-align: center;
            margin-bottom: 12px;
          }
          .college-title {
            font-size: 22px;
            font-weight: bold;
            margin: 0;
          }
          .college-sub {
            font-size: 11px;
            margin: 3px 0 0 0;
          }
          .report-title {
            font-size: 13px;
            font-weight: bold;
            text-decoration: underline;
            margin: 8px 0 2px 0;
            text-transform: uppercase;
          }
          .id-no {
            font-size: 12px;
            font-weight: bold;
            margin: 0;
          }
          .info-box {
            border: 1px solid #000;
            padding: 8px 10px;
            margin-bottom: 12px;
            font-size: 12px;
          }
          .info-row {
            display: flex;
            margin-bottom: 5px;
          }
          .info-row:last-child {
            margin-bottom: 0;
          }
          .col-4 { width: 33%; display: flex; }
          .col-5 { width: 42%; display: flex; }
          .col-3 { width: 25%; display: flex; }
          .col-7 { width: 58%; display: flex; }
          .col-8 { width: 67%; display: flex; }
          .lbl { font-weight: bold; margin-right: 5px; }
          
          .ledger-table {
            width: 100%;
            border-collapse: collapse;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            margin-top: 10px;
            font-size: 11px;
          }
          .ledger-table th {
            border-bottom: 1px solid #000;
            padding: 5px 4px;
            text-align: left;
            font-weight: bold;
          }
          .ledger-table td {
            padding: 4px 4px;
            border-bottom: 1px solid #ddd;
          }
          .footer-sec {
            margin-top: 25px;
            border-top: 1px solid #ccc;
            padding-top: 6px;
            display: flex;
            justify-content: space-between;
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #222;
          }
        </style>
      </head>
      <body>
        <div class="header-top">
          <div>${currentDate}</div>
          <div>${currentTime}</div>
        </div>

        <div class="title-section">
          <h1 class="college-title">${collegeName}</h1>
          <p class="college-sub">Patiala-Sangrur National Highway,Bhawanigarh, Sangrur (Pb.)</p>
          <h2 class="report-title">ACCOUNT STATUS REPORT</h2>
          <p class="id-no">ID No : ${idNoVal}</p>
        </div>

        <div class="info-box">
          <div class="info-row">
            <div class="col-4"><span class="lbl" style="width: 70px;">Session :</span> <span>${sessionVal}</span></div>
            <div class="col-5"><span class="lbl" style="width: 70px;">Course :</span> <span>${courseVal}</span></div>
            <div class="col-3"><span class="lbl" style="width: 55px;">Batch :</span> <span>${batchVal}</span></div>
          </div>
          <div class="info-row">
            <div class="col-4"><span class="lbl" style="width: 70px;">Name :</span> <strong>${studentName}</strong></div>
            <div class="col-8"><span class="lbl" style="width: 95px;">Father Name :</span> <span>${fatherName}</span></div>
          </div>
          <div class="info-row">
            <div class="col-7"><span class="lbl" style="width: 70px;">Address :</span> <span>${addressVal}</span></div>
            <div class="col-5"><span class="lbl" style="width: 80px;">Bus Route :</span> <span>${busRouteVal}</span></div>
          </div>
        </div>

        <table class="ledger-table">
          <thead>
            <tr>
              <th style="width: 90px;">DateEntry</th>
              <th style="width: 80px;">Receipt No</th>
              <th>Particulars</th>
              <th style="width: 80px; text-align: right;">Debit</th>
              <th style="width: 80px; text-align: right;">Credit</th>
              <th style="width: 90px; text-align: right;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>


        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 250);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=900");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 font-sans bg-slate-50 min-h-screen p-4 sm:p-6 rounded-2xl">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-wide">Account Status</h1>
            <span className="text-xs bg-sky-500/30 border border-sky-400/40 text-sky-200 px-3 py-1 rounded-full font-mono font-semibold">
              Student Details & Ledger
            </span>
          </div>
          <p className="text-xs text-sky-200/80 mt-1">
            Search student by ID No or Registration No to check admission profile and complete ledger status.
          </p>
        </div>

        {isSearched && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintReport}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs rounded-lg shadow-md transition flex items-center gap-2 transform active:scale-95"
            >
              <span>🖨️</span> Print Report
            </button>

            <button
              onClick={handlePrintReport}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs rounded-lg shadow-md transition flex items-center gap-2 transform active:scale-95"
            >
              <span>📥</span> Download PDF
            </button>

            <button
              onClick={() => {
                setTxtIDNo("");
                clearAllFields();
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition transform active:scale-95"
            >
              New Search
            </button>
          </div>
        )}
      </div>

      {/* Error Notification Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-sm font-semibold rounded-r-xl shadow-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Search Panel matching VB.NET rdbtnIDNo, rdbtnRegistrationNo, txtIDNo, Cmbbatch, ChkAllbatch */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Search Options
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search Type Radio Buttons */}
          <div className="md:col-span-4 flex items-center gap-5 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                id="rdbtnIDNo"
                type="radio"
                name="searchType"
                checked={searchType === "IDNo"}
                onChange={() => {
                  setSearchType("IDNo");
                  setError(null);
                }}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500"
              />
              <span>ID No (10 Digits)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                id="rdbtnRegistrationNo"
                type="radio"
                name="searchType"
                checked={searchType === "RegistrationNo"}
                onChange={() => {
                  setSearchType("RegistrationNo");
                  setError(null);
                }}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500"
              />
              <span>Registration No (6 Digits)</span>
            </label>
          </div>

          {/* Search Input txtIDNo */}
          <div className="md:col-span-3 space-y-1">
            <label htmlFor="txtIDNo" className="block text-[11px] font-bold uppercase text-slate-600">
              {searchType === "IDNo" ? "ID No." : "Registration No."} <span className="text-rose-500">*</span>
            </label>
            <input
              id="txtIDNo"
              type="text"
              placeholder={searchType === "IDNo" ? "e.g. 5826011001" : "e.g. 123456"}
              value={txtIDNo}
              onChange={(e) => setTxtIDNo(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-semibold rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Batch Dropdown & All Batch Checkbox */}
          <div className="md:col-span-3 flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <label htmlFor="Cmbbatch" className="block text-[11px] font-bold uppercase text-slate-600">
                Batch
              </label>
              <select
                id="Cmbbatch"
                value={cmbbatch}
                onChange={(e) => setCmbbatch(e.target.value)}
                disabled={chkAllbatch}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              >
                <option value="">-- Select Batch --</option>
                {batchesList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer pt-5">
              <input
                id="ChkAllbatch"
                type="checkbox"
                checked={chkAllbatch}
                onChange={(e) => setChkAllbatch(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
              />
              <span>All Batches</span>
            </label>
          </div>

          {/* Action Find Button */}
          <div className="md:col-span-2">
            <button
              id="btnFind"
              onClick={DisplayStudentDetails}
              disabled={loading}
              className="w-full h-[42px] bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Searching..." : "Find Student"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Student Details & Ledger Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Details Card matching DisplayStudentDetails() fields */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-sky-900 uppercase tracking-wider border-b border-sky-100 pb-2 flex items-center justify-between">
            <span>Student Profile Details</span>
            <span className="text-[11px] font-mono text-slate-500">Session: {session || "N/A"}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* PictureBox1 / Photo Container */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center">
              <div className="w-28 h-36 border-2 border-dashed border-sky-300 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner">
                {student?.Snap ? (
                  <img src={student.Snap} alt="Student Photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <span className="text-2xl block">👤</span>
                    <span className="text-[10px] font-semibold">No Photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields: College, Name, Father Name, Sex */}
            <div className="sm:col-span-8 space-y-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500">College Name</label>
                <input
                  id="txtStudentDetailCollegeName"
                  type="text"
                  readOnly
                  value={student?.CollegeName || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500">Student Name</label>
                <input
                  id="txtStudentDetailName"
                  type="text"
                  readOnly
                  value={student?.StudentName || ""}
                  className="w-full bg-sky-50/60 border border-sky-200 rounded-md p-1.5 font-bold text-sky-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500">Father Name</label>
                <input
                  id="txtStudentDetailFatherName"
                  type="text"
                  readOnly
                  value={student?.FatherName || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-slate-800"
                />
              </div>

              {/* Sex Radio Indicators rdbtnMale / rdbtnFemale */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Gender (Sex)</label>
                <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-md border border-slate-200">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <input
                      id="rdbtnMale"
                      type="radio"
                      disabled
                      checked={String(student?.Sex).toLowerCase() === "male"}
                      className="text-sky-600"
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <input
                      id="rdbtnFemale"
                      type="radio"
                      disabled
                      checked={String(student?.Sex).toLowerCase() === "female"}
                      className="text-sky-600"
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Academic & Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500">Course</label>
              <input
                id="txtStudentDetailCourse"
                type="text"
                readOnly
                value={student?.Course || ""}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500">Class</label>
              <input
                id="txtStudentDetailClass"
                type="text"
                readOnly
                value={student?.Class || ""}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500">Class Roll No</label>
              <input
                id="TxtClassRollno"
                type="text"
                readOnly
                value={student?.ClassRollNo || ""}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500">Semester</label>
              <input
                id="txtSemester"
                type="text"
                readOnly
                value={semester}
                className="w-full bg-sky-50 border border-sky-200 rounded-md p-1.5 font-bold text-sky-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500">Phone No.</label>
              <input
                id="txtPhoneNo"
                type="text"
                readOnly
                value={student?.PhoneNo || ""}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500">Student Mobile</label>
              <input
                id="txtStudentMobileNo"
                type="text"
                readOnly
                value={student?.StudentMobileNo || ""}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-slate-800 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500">Father Mobile</label>
              <input
                id="txtFatherMobileNo"
                type="text"
                readOnly
                value={student?.FatherMobileNo || ""}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500">Bus Route</label>
              <input
                id="txtBusRoute"
                type="text"
                readOnly
                value={student?.Facility === "Bus" ? student?.BusRoute || student?.Route || "" : ""}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-500">Permanent Address</label>
              <textarea
                id="txtStudentDetailAddesss"
                readOnly
                rows={2}
                value={student?.PermanentAddress || ""}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Ledger DataGridView Table (dgvdetail) matching ShowDgvDetail() */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-sky-300">
                  Ledger Transaction Details (dgvdetail)
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Complete statement of credits, debits and running balance
                </p>
              </div>

              {isSearched && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintReport}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] rounded shadow transition flex items-center gap-1"
                    title="Print Crystal Report or Save as PDF"
                  >
                    <span>🖨️</span> Print Report
                  </button>
                  <span className="text-xs font-mono bg-sky-800/60 border border-sky-400/40 text-sky-200 px-3 py-1 rounded-md">
                    {ledgerRecords.length} Txns
                  </span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto max-h-[420px]">
              <table id="dgvdetail" className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-[10px] uppercase tracking-wider text-slate-600 border-b border-slate-200 sticky top-0 font-bold">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 text-center w-8">#</th>
                    <th scope="col" className="px-3 py-2.5">Date Entry</th>
                    <th scope="col" className="px-3 py-2.5">Particulars</th>
                    <th scope="col" className="px-3 py-2.5">Ledger Name</th>
                    <th scope="col" className="px-3 py-2.5">Txn Type</th>
                    <th scope="col" className="px-3 py-2.5 text-right">Debit (₹)</th>
                    <th scope="col" className="px-3 py-2.5 text-right">Credit (₹)</th>
                    <th scope="col" className="px-3 py-2.5 text-right">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-400 font-medium">
                        No ledger transactions found for this student.
                      </td>
                    </tr>
                  ) : (
                    ledgerRecords.map((row, index) => (
                      <tr key={index} className="hover:bg-sky-50/50 transition font-medium">
                        <td className="px-3 py-2.5 text-center text-slate-400 font-mono">{index + 1}</td>
                        <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">{row.DateEntry}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-900">{row.Particulars}</td>
                        <td className="px-3 py-2.5 text-slate-700">{row.LedgerName || "-"}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.TransactionType === "Debit"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                              }`}
                          >
                            {row.TransactionType}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-900">
                          {row.Debit ? row.Debit.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-emerald-800 font-semibold">
                          {row.Credit ? row.Credit.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                          {row.Balance !== undefined
                            ? row.Balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Summaries Footer matching lblTotalDebits, lblTotalCredits, lblTotalBalance */}
          <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-extrabold">
            <div id="lblTotalDebits" className="bg-white border border-slate-200 px-3.5 py-2 rounded-lg text-slate-700 shadow-xs">
              Total Debits : <span className="text-blue-900 font-mono text-sm ml-1">₹{totalDebits.toLocaleString("en-IN")}</span>
            </div>

            <div id="lblTotalCredits" className="bg-white border border-slate-200 px-3.5 py-2 rounded-lg text-slate-700 shadow-xs">
              Total Credits : <span className="text-emerald-800 font-mono text-sm ml-1">₹{totalCredits.toLocaleString("en-IN")}</span>
            </div>

            <div id="lblTotalBalance" className="bg-white border border-slate-200 px-3.5 py-2 rounded-lg text-slate-700 shadow-xs">
              Balance :{" "}
              <span
                className={`font-mono text-sm ml-1 ${totalBalance >= 0 ? "text-slate-900" : "text-rose-600 font-black"
                  }`}
              >
                ₹{totalBalance.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* In-app Crystal Report Preview Modal */}
      {showPrintModal && isSearched && student && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 space-y-4 border border-slate-200">
            {/* Modal Top Actions */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                  ACCOUNT STATUS REPORT - Crystal Report Preview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReport}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-lg shadow transition flex items-center gap-1.5"
                >
                  <span>🖨️ Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full font-bold text-lg transition"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Crystal Report Layout matching uploaded screenshot */}
            <div
              className="p-8 bg-white font-serif text-slate-900 space-y-4 shadow-sm border border-slate-300 rounded-none max-w-4xl mx-auto"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              {/* Top Timestamp Row */}
              <div className="flex justify-between items-center text-xs font-mono text-slate-800 font-medium">
                <div>{new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}</div>
                <div>{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}</div>
              </div>

              {/* Institution Title */}
              <div className="text-center space-y-0.5">
                <h2 className="text-2xl font-bold text-slate-900 tracking-wide font-serif">
                  {student.CollegeName || "Asra College of Education"}
                </h2>
                <p className="text-xs text-slate-800 font-serif">
                  Patiala-Sangrur National Highway,Bhawanigarh, Sangrur (Pb.)
                </p>
              </div>

              {/* Report Title */}
              <div className="text-center pt-2 space-y-1">
                <h3 className="text-sm font-bold underline uppercase tracking-wider font-serif">
                  ACCOUNT STATUS REPORT
                </h3>
                <p className="text-xs font-bold font-serif">
                  ID No : {student.IDNo || txtIDNo}
                </p>
              </div>

              {/* Boxed Student Info matching screenshot */}
              <div className="border border-slate-900 p-3 text-xs font-serif space-y-2 rounded-none">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4 flex">
                    <span className="font-bold w-20">Session :</span>
                    <span>{session || "2026-27"}</span>
                  </div>
                  <div className="col-span-5 flex">
                    <span className="font-bold w-20">Course :</span>
                    <span>{student.Course || "-"}</span>
                  </div>
                  <div className="col-span-3 flex">
                    <span className="font-bold w-16">Batch :</span>
                    <span>{student.Batch || "-"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4 flex">
                    <span className="font-bold w-20">Name :</span>
                    <span className="font-bold">{student.StudentName || "-"}</span>
                  </div>
                  <div className="col-span-8 flex">
                    <span className="font-bold w-28">Father Name :</span>
                    <span>{student.FatherName || "-"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7 flex">
                    <span className="font-bold w-20">Address :</span>
                    <span className="truncate">{student.PermanentAddress || "-"}</span>
                  </div>
                  <div className="col-span-5 flex">
                    <span className="font-bold w-24">Bus Route :</span>
                    <span>{student.BusRoute || student.Route || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Ledger Statement Table matching Crystal Report format in screenshot */}
              <div className="pt-2">
                <table className="w-full text-left text-xs font-serif border-t-2 border-b-2 border-slate-900">
                  <thead className="border-b border-slate-900 font-bold">
                    <tr>
                      <th className="py-1.5 px-1 font-bold w-28">DateEntry</th>
                      <th className="py-1.5 px-1 font-bold w-24">Receipt No</th>
                      <th className="py-1.5 px-1 font-bold">Particulars</th>
                      <th className="py-1.5 px-1 font-bold text-right w-24">Debit</th>
                      <th className="py-1.5 px-1 font-bold text-right w-24">Credit</th>
                      <th className="py-1.5 px-1 font-bold text-right w-28">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {ledgerRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500 font-serif">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      ledgerRecords.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 font-serif">
                          <td className="py-1 px-1 whitespace-nowrap">{row.DateEntry || "-"}</td>
                          <td className="py-1 px-1">{row.ReceiptNo ? String(row.ReceiptNo) : ""}</td>
                          <td className="py-1 px-1 font-medium">{row.Particulars || "-"}</td>
                          <td className="py-1 px-1 text-right">
                            {row.Debit ? row.Debit : ""}
                          </td>
                          <td className="py-1 px-1 text-right">
                            {row.Credit ? row.Credit : ""}
                          </td>
                          <td className="py-1 px-1 text-right font-medium">
                            {row.Balance !== undefined ? row.Balance : ""}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Report Footer matching screenshot */}
              <div className="pt-6 flex justify-between items-center text-[10px] font-sans text-slate-800 border-t border-slate-300">
                <div>
                  A Product of ThinkNEXT Technologies Private Limited, Mohali : 9815994197
                </div>
                <div>
                  {new Date().toLocaleDateString("en-US")} {new Date().toLocaleTimeString("en-US")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
