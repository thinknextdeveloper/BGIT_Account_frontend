"use client";

import React, { useState } from "react";
import { useFeeSingleHead } from "@/hooks/useFeeSingleHead";

function numberToWords(num: number): string {
  if (isNaN(num) || num === 0) return "Zero";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + inWords(n % 10000000) : "");
  }

  return inWords(Math.floor(num));
}

export default function FeeSingleHeadPage() {
  const {
    idNoInput,
    setIdNoInput,
    data,
    loading,
    saving,
    error,
    successMessage,
    isSearched,
    ledgerType,
    setLedgerType,
    semesters,
    selectedSemester,
    setSelectedSemester,
    onAccountOf,
    setOnAccountOf,
    amountInput,
    setAmountInput,
    dateEntry,
    setDateEntry,
    paymentMode,
    banks,
    selectedBank,
    setSelectedBank,
    chequeDraftNo,
    setChequeDraftNo,
    chequeDraftDate,
    setChequeDraftDate,
    ledgers,
    selectedLedger,
    setSelectedLedger,
    nextReceiptNo,
    lastSavedReceipt,
    setLastSavedReceipt,
    btnFind_Click,
    handlePaymentModeChange,
    btnSubmit_Click,
    addBank,
    clearAllFields,
  } = useFeeSingleHead();

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankInput, setNewBankInput] = useState("");
  const [addingBank, setAddingBank] = useState(false);

  const handleAddBankSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newBankInput || newBankInput.trim() === "") return;
    try {
      setAddingBank(true);
      const ok = await addBank(newBankInput.trim());
      if (ok) {
        setNewBankInput("");
        setShowAddBankModal(false);
      }
    } finally {
      setAddingBank(false);
    }
  };

  const student = data?.studentDetails;
  const ledgerDetails = data?.ledgerDetails || [];
  const session = data?.session || "";
  const totalDebits = data?.totalDebits ?? 0;
  const totalCredits = data?.totalCredits ?? 0;
  const totalBalance = data?.totalBalance ?? 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      btnFind_Click();
    }
  };

  const handleSaveAndPrint = async () => {
    const success = await btnSubmit_Click();
    if (success) {
      setShowPrintModal(true);
    }
  };

  return (
    <div className="space-y-5 font-sans bg-slate-50 min-h-screen p-4 sm:p-6 rounded-2xl">
      {/* Main Dashboard & Form Interface - Hidden during Print */}
      <div className="space-y-5 no-print">
        {/* Top Main Navigation / Bar matching Screenshot Header */}
        <div className="bg-gradient-to-r from-sky-800 via-blue-800 to-indigo-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-wide">Accounts</span>
            <span className="text-xs bg-sky-600/60 border border-sky-400/40 px-2.5 py-1 rounded-md font-mono">
              [Credit/Debit Fee]
            </span>
          </div>

          {/* Top Search Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 p-1.5 rounded-lg">
              <label htmlFor="txtIDNo" className="text-xs font-bold uppercase tracking-wider text-sky-100 pl-1">
                ID No
              </label>
              <input
                id="txtIDNo"
                type="text"
                placeholder="e.g. 5826011001"
                value={idNoInput}
                onChange={(e) => setIdNoInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || isSearched}
                className="w-36 sm:w-44 bg-white text-gray-900 text-sm rounded px-2.5 py-1 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button
                id="btnFind"
                onClick={() => btnFind_Click()}
                disabled={loading || isSearched}
                className="px-3.5 py-1 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded shadow transition disabled:opacity-50"
              >
                {loading ? "Searching..." : "Find"}
              </button>
            </div>

            {isSearched && (
              <button
                onClick={clearAllFields}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs rounded shadow transition"
              >
                New Entry
              </button>
            )}
          </div>
        </div>

        {/* Error & Success Notification Banners */}
        {error && (
          <div className="p-3.5 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm font-semibold rounded-r-lg shadow-xs flex items-center justify-between">
            <span>⚠️ {error}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm font-semibold rounded-r-lg shadow-xs flex items-center justify-between">
            <span>✅ {successMessage}</span>
          </div>
        )}

        {/* Main Form Grid Layout matching Legacy VB.NET Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Ledgers, Facility Opted, Update Facility, Student Details */}
          <div className="lg:col-span-6 space-y-5">
            {/* 1. Ledgers Panel */}
            <div className="bg-white border border-sky-200 p-4 rounded-xl shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-sky-900 uppercase tracking-wider border-b border-sky-100 pb-1.5 flex items-center justify-between">
                <span>Ledgers</span>
                <span className="text-[11px] text-gray-500 font-normal">Session: {session || "2026-27"}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                {/* Radio Group for Hostel, Bus, Others */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="ledgerType"
                      checked={ledgerType === "Hostel"}
                      onChange={() => setLedgerType("Hostel")}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Hostel</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="ledgerType"
                      checked={ledgerType === "Bus"}
                      onChange={() => setLedgerType("Bus")}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Bus</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="ledgerType"
                      checked={ledgerType === "Others"}
                      onChange={() => setLedgerType("Others")}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Others</span>
                  </label>
                </div>

                {/* Others cmbLedger Dropdown */}
                {ledgerType === "Others" && (
                  <div className="sm:col-span-2 space-y-1">
                    <select
                      id="cmbLedger"
                      value={selectedLedger}
                      onChange={(e) => {
                        setSelectedLedger(e.target.value);
                        if (e.target.value) setOnAccountOf(e.target.value);
                      }}
                      className="w-full bg-slate-50 border border-gray-300 text-gray-800 text-xs rounded p-1.5 focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">-- Select Ledger Name --</option>
                      {ledgers.map((l, idx) => (
                        <option key={`${l}-${idx}`} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Semester Dropdown */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="cmbSemester"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-300 text-gray-800 text-xs rounded p-1.5 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">-- Select Semester --</option>
                    {semesters.map((sem, idx) => (
                      <option key={`${sem}-${idx}`} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase">
                    Session
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={session}
                    className="w-full bg-sky-50 border border-sky-200 text-sky-900 font-bold text-xs rounded p-1.5 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Facility Opted Panel */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs space-y-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-1">
                Facility Opted ({student?.Facility || "None"})
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-semibold text-gray-500">Hostel Name:</span>
                  <input type="text" readOnly value={student?.Hostel || ""} className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-800" />
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Room-Type:</span>
                  <input type="text" readOnly value={student?.RoomType || ""} className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-800" />
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Route:</span>
                  <input type="text" readOnly value={student?.Route || ""} className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-800" />
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Stopage:</span>
                  <input type="text" readOnly value={student?.Stopage || ""} className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-800" />
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-500">Credit (Facility Amount):</span>
                  <input type="text" readOnly value={student?.FacilityAmount ?? ""} className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-800 font-mono font-bold" />
                </div>
              </div>
            </div>

            {/* 3. Student Details Panel with PictureBox */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-1">
                Student Detail
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Photo Box */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center">
                  <div className="w-28 h-36 border-2 border-dashed border-sky-300 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner">
                    {student?.Snap ? (
                      <img src={student.Snap} alt="Student Photo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[11px] text-gray-400 text-center p-2">No Photo</span>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="sm:col-span-8 space-y-1.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500">College Name</label>
                    <input type="text" readOnly value={student?.CollegeName || ""} className="w-full bg-gray-50 border border-gray-200 rounded p-1 font-semibold text-gray-800" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500">Name</label>
                    <input type="text" readOnly value={student?.StudentName || ""} className="w-full bg-gray-50 border border-gray-200 rounded p-1 font-bold text-blue-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500">Father Name</label>
                    <input type="text" readOnly value={student?.FatherName || ""} className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-800" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500">Course</label>
                      <input type="text" readOnly value={student?.Course || ""} className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500">Batch</label>
                      <input type="text" readOnly value={student?.Batch || ""} className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-800" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500">Class Roll No</label>
                      <input type="text" readOnly value={student?.ClassRollNo || ""} className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500">Uni Roll No</label>
                      <input type="text" readOnly value={student?.UniRollNo || ""} className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>




          {/* Right Column: Mode Of Payment, Entry Form, Save & Print, Ledger DataGridView Table */}
          <div className="lg:col-span-6 space-y-5">
            {/* 4. Mode Of Payment & Fee Collection Entry Form matching Screenshot */}
            <div className="bg-white border border-sky-300 p-4 rounded-xl shadow-xs space-y-4">
              <div className="border border-sky-200 rounded-lg p-3 bg-sky-50/50 space-y-2">
                <label className="block text-xs font-extrabold text-sky-900 uppercase tracking-wider">
                  Mode Of Payment <span className="text-red-500">*</span>
                </label>

                {/* Radios: Cash, Cheque, Draft, Other */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-800">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      id="rdbtnCash"
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === "Cash"}
                      onChange={() => handlePaymentModeChange("Cash")}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Cash</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      id="rdbtnCheque"
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === "Cheque"}
                      onChange={() => handlePaymentModeChange("Cheque")}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Cheque</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      id="rdbtnDraft"
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === "Draft"}
                      onChange={() => handlePaymentModeChange("Draft")}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Draft</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      id="rdbtnOthers"
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === "Others"}
                      onChange={() => handlePaymentModeChange("Others")}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Other</span>
                  </label>
                </div>

                {/* Conditional Bank / Cheque / Draft / Transaction Fields */}
                {paymentMode !== "Cash" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-sky-200/60 text-xs">
                    <div>
                      <label id="lblBank" className="block text-[10px] font-bold uppercase text-gray-600">Bank Name</label>
                      <div className="flex gap-1 items-center">
                        <select
                          id="cmbBank"
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded p-1 text-gray-800"
                        >
                          <option value="">-- Select Bank --</option>
                          {banks.map((b, idx) => (
                            <option key={`${b}-${idx}`} value={b}>{b}</option>
                          ))}
                        </select>
                        <button
                          id="btnBank"
                          type="button"
                          onClick={() => setShowAddBankModal(true)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-xs font-black text-slate-800 transition shrink-0"
                          title="Add Bank Name"
                        >
                          ...
                        </button>
                      </div>
                    </div>
                    <div>
                      <label id="lblChequeDraftDate" className="block text-[10px] font-bold uppercase text-gray-600">
                        {paymentMode === "Cheque"
                          ? "Cheque Date"
                          : paymentMode === "Draft"
                            ? "Draft Date"
                            : "Transaction Date"}
                      </label>
                      <input
                        id="dtpChequeDraftDate"
                        type="date"
                        value={chequeDraftDate}
                        onChange={(e) => setChequeDraftDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded p-1 text-gray-800"
                      />
                    </div>
                    <div>
                      <label id="lblChequeDraftNo" className="block text-[10px] font-bold uppercase text-gray-600">
                        {paymentMode === "Cheque"
                          ? "Cheque No"
                          : paymentMode === "Draft"
                            ? "Draft No"
                            : "Transaction No."}
                      </label>
                      <input
                        id="txtChequeDraftNo"
                        type="text"
                        placeholder="Enter No..."
                        value={chequeDraftNo}
                        onChange={(e) => setChequeDraftNo(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded p-1 text-gray-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Entry Fields matching Screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Date */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Date</label>
                  <input
                    id="dtpDateEntry"
                    type="date"
                    value={dateEntry}
                    onChange={(e) => setDateEntry(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-300 rounded p-1.5 font-medium text-gray-800"
                  />
                </div>

                {/* Receipt No */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Receipt No.</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={nextReceiptNo ?? ""}
                      className="w-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-extrabold text-xs rounded p-1.5 font-mono"
                    />
                    {lastSavedReceipt && (
                      <button
                        type="button"
                        onClick={() => setShowPrintModal(true)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded shadow transition whitespace-nowrap"
                      >
                        Print Receipt
                      </button>
                    )}
                  </div>
                </div>

                {/* On Account Of */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                    On Account Of <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="txtOnAccountOf"
                    type="text"
                    placeholder="e.g. Examination Fee, Hostel Fee..."
                    value={onAccountOf}
                    onChange={(e) => setOnAccountOf(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Credit / Amount */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                    Credit / Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="txtAmount"
                    type="number"
                    placeholder="Enter Amount..."
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 font-bold font-mono text-base focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Action Buttons matching Screenshot */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  id="btnSubmit"
                  onClick={handleSaveAndPrint}
                  disabled={saving || !isSearched}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-lg shadow transition flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save and Print"}
                </button>

                <button
                  onClick={clearAllFields}
                  className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs rounded-lg shadow transition"
                >
                  New Entry
                </button>
              </div>
            </div>

            {/* 5. Ledger DataGridView Table (dgvDetail) matching Screenshot */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs space-y-2">
              <div className="p-3 bg-slate-100 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                  Ledger Transaction History
                </h3>
                <span className="text-xs font-mono text-gray-500">
                  {ledgerDetails.length} Records
                </span>
              </div>

              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs text-gray-800">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-gray-600 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-center w-8">#</th>
                      <th scope="col" className="px-3 py-2">Date Entry</th>
                      <th scope="col" className="px-3 py-2">Particulars</th>
                      <th scope="col" className="px-3 py-2">Ledger Name</th>
                      <th scope="col" className="px-3 py-2 text-right">Debit</th>
                      <th scope="col" className="px-3 py-2 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ledgerDetails.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                          No ledger transactions found for this ID No.
                        </td>
                      </tr>
                    ) : (
                      ledgerDetails.map((row, index) => (
                        <tr key={index} className="hover:bg-sky-50/40 transition font-medium">
                          <td className="px-3 py-2 text-center text-gray-400 font-mono">{index + 1}</td>
                          <td className="px-3 py-2 text-gray-700">{row.DateEntry}</td>
                          <td className="px-3 py-2 font-semibold text-gray-900">{row.Particulars}</td>
                          <td className="px-3 py-2 text-gray-700">{row.LedgerName}</td>
                          <td className="px-3 py-2 text-right font-mono text-gray-800">
                            {row.Debit ? row.Debit.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-800 font-semibold">
                            {row.Credit ? row.Credit.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Summaries Footer matching lblTotalDebits, lblTotalCredits, lblTotalBalance */}
              <div className="p-3 bg-slate-100 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                <div id="lblTotalDebits" className="text-gray-700">
                  Total Debits : <span className="text-blue-800 font-mono">{totalDebits.toLocaleString("en-IN")}</span>
                </div>
                <div id="lblTotalCredits" className="text-gray-700">
                  Total Credits : <span className="text-emerald-800 font-mono">{totalCredits.toLocaleString("en-IN")}</span>
                </div>
                <div id="lblTotalBalance" className="text-gray-700">
                  Total Balance : <span className={`font-mono ${totalBalance >= 0 ? "text-slate-900" : "text-red-600"}`}>{totalBalance.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Receipt CrystalReport Modal matching legacy CryFacility */}
      {showPrintModal && lastSavedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 print-modal-overlay overflow-y-auto">
          <style>{`
            @media print {
              .no-print,
              .print\\:hidden {
                display: none !important;
              }
              .print-modal-overlay {
                position: static !important;
                background: transparent !important;
                padding: 0 !important;
                margin: 0 !important;
                display: block !important;
              }
              .print-modal-card {
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
                background: transparent !important;
              }
              #printableReceiptArea {
                position: relative !important;
                border: 2px solid #000000 !important;
                background: #ffffff !important;
                padding: 24px !important;
                width: 100% !important;
                margin: 0 auto !important;
                box-shadow: none !important;
                border-radius: 8px !important;
              }
            }
          `}</style>
          <div className="print-modal-card bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-gray-200">
            {/* Modal Top Header - Hidden on Print */}
            <div className="flex items-center justify-between border-b pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                  Fee Receipt Preview
                </h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full font-bold text-lg transition"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Professional Institutional Fee Receipt Area */}
            <div
              id="printableReceiptArea"
              className="p-6 border-2 border-slate-800 rounded-xl bg-white font-sans text-slate-900 space-y-4 shadow-sm"
            >
              {/* Receipt Top Header */}
              <div className="text-center space-y-1.5 border-b-2 border-slate-800 pb-4">
                <h2 className="text-xl font-black uppercase tracking-wide text-slate-900 font-serif">
                  {student?.CollegeName || "COLLEGE OF EDUCATION"}
                </h2>
                <div className="inline-block bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full font-mono">
                  Official Fee Receipt ({session || "2026-27"})
                </div>

                {/* Key Receipt Bar */}
                <div className="flex justify-between items-center pt-2 text-xs font-mono font-bold text-slate-700 border-t border-dashed border-slate-300 mt-2">
                  <div>Receipt No: <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">#{lastSavedReceipt.receiptNo}</span></div>
                  <div>Date: <span className="text-slate-900">{new Date().toLocaleDateString("en-IN")}</span></div>
                  <div>Txn ID: <span className="text-slate-900">{lastSavedReceipt.transactionId || lastSavedReceipt.savedEntry?.TransactionID || "-"}</span></div>
                </div>
              </div>

              {/* Student & Academic Info Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-200 bg-slate-50/50">
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-600 bg-slate-100/70 w-1/4">Student Name:</td>
                      <td className="px-3 py-2 font-extrabold text-slate-900 w-1/4">{student?.StudentName || "-"}</td>
                      <td className="px-3 py-2 font-bold text-slate-600 bg-slate-100/70 w-1/4">Father's Name:</td>
                      <td className="px-3 py-2 font-semibold text-slate-900 w-1/4">{student?.FatherName || "-"}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-600 bg-slate-100/70">Student ID No:</td>
                      <td className="px-3 py-2 font-mono font-bold text-slate-900">{student?.IDNo || idNoInput}</td>
                      <td className="px-3 py-2 font-bold text-slate-600 bg-slate-100/70">Course / Class:</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{student?.Course || "-"} ({student?.Class || "-"})</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-600 bg-slate-100/70">Batch / Semester:</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{student?.Batch || "-"} / {selectedSemester || "-"}</td>
                      <td className="px-3 py-2 font-bold text-slate-600 bg-slate-100/70">Mode Of Payment:</td>
                      <td className="px-3 py-2 font-bold text-blue-900">{paymentMode}</td>
                    </tr>
                    {paymentMode !== "Cash" && (
                      <tr>
                        <td className="px-3 py-2 font-bold text-slate-600 bg-slate-100/70">Bank Name:</td>
                        <td className="px-3 py-2 font-semibold text-slate-900">{selectedBank || "-"}</td>
                        <td className="px-3 py-2 font-bold text-slate-600 bg-slate-100/70">
                          {paymentMode === "Cheque"
                            ? "Cheque No:"
                            : paymentMode === "Draft"
                              ? "Draft No:"
                              : "Transaction No:"}
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-900">{chequeDraftNo || "-"}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Payment Particulars Breakdown Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-800 text-white text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-center w-10 border-r border-slate-700">#</th>
                      <th scope="col" className="px-3 py-2 border-r border-slate-700">Particulars / On Account Of</th>
                      <th scope="col" className="px-3 py-2 border-r border-slate-700">Ledger Name</th>
                      <th scope="col" className="px-3 py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="font-semibold text-slate-800">
                      <td className="px-3 py-2 text-center font-mono text-slate-500 border-r border-slate-200">1</td>
                      <td className="px-3 py-2 border-r border-slate-200 font-bold text-slate-900">
                        {onAccountOf || lastSavedReceipt.savedEntry?.OnAccountOf || "Fee Deposit"}
                      </td>
                      <td className="px-3 py-2 border-r border-slate-200 text-slate-700">
                        {lastSavedReceipt.savedEntry?.LedgerName || selectedLedger || ledgerType}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-extrabold text-slate-900 text-sm">
                        ₹{(Number(lastSavedReceipt.savedEntry?.Credit || lastSavedReceipt.savedEntry?.Debit || amountInput) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-100 border-t-2 border-slate-300 text-xs font-bold">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right uppercase tracking-wider text-slate-700">Total Amount Paid:</td>
                      <td className="px-3 py-2 text-right font-mono font-black text-slate-900 text-base text-emerald-800">
                        ₹{(Number(lastSavedReceipt.savedEntry?.Credit || lastSavedReceipt.savedEntry?.Debit || amountInput) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Amount in Words */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider text-slate-600 text-[10px] bg-slate-200 px-2 py-0.5 rounded">In Words:</span>
                <span className="italic font-bold text-slate-900">
                  {numberToWords(Number(lastSavedReceipt.savedEntry?.Credit || lastSavedReceipt.savedEntry?.Debit || amountInput))} Rupees Only
                </span>
              </div>

              {/* Signatures & Footer Note */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-xs">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-600">Printed On: {new Date().toLocaleString("en-IN")}</div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 w-44 text-center">
                    Cashier / Depositor Signature
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <div className="h-10 border border-dashed border-slate-300 w-32 flex items-center justify-center text-[9px] text-slate-400 uppercase font-mono tracking-widest mb-1">
                    College Seal
                  </div>
                  <div className="border-t border-slate-800 pt-1 font-bold text-slate-900 w-44 text-center">
                    Authorized Signatory
                  </div>
                </div>
              </div>

              {/* Computer Generated Notice */}
              <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500 font-mono">
                *** This is a computer-generated fee receipt. No physical signature required. ***
              </div>
            </div>

            {/* Modal Bottom Action Bar - Hidden on Print */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                <span>🖨️</span>
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Bank Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print">
          <div className="bg-slate-100 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-slate-400 animate-in fade-in zoom-in duration-150">
            {/* Title Bar */}
            <div className="bg-gradient-to-r from-sky-700 to-sky-900 px-4 py-2 flex items-center justify-between text-white font-bold text-sm shadow">
              <span>Master Bank</span>
              <button
                type="button"
                onClick={() => {
                  setShowAddBankModal(false);
                  setNewBankInput("");
                }}
                className="text-white hover:bg-sky-800 rounded px-2 py-0.5 text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-4 flex gap-4">
              {/* Left Column: Bank Table & Input */}
              <div className="flex-1 bg-white border border-slate-300 rounded shadow-inner flex flex-col h-64 overflow-hidden">
                <div className="bg-slate-200 border-b border-slate-300 px-3 py-1.5 font-bold text-xs text-slate-800 flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">▶</span>
                  <span>BankName</span>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {banks.map((b, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedBank(b);
                        setNewBankInput(b);
                      }}
                      className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-sky-50 transition flex items-center gap-2 ${selectedBank === b
                          ? "bg-sky-600 text-white font-bold"
                          : "text-slate-800 font-medium"
                        }`}
                    >
                      <span className="text-[10px] opacity-70">
                        {selectedBank === b ? "▶" : ""}
                      </span>
                      <span>{b}</span>
                    </div>
                  ))}
                  {banks.length === 0 && (
                    <div className="px-3 py-6 text-xs text-slate-400 text-center italic">
                      No Banks Available
                    </div>
                  )}
                </div>
                {/* Bank Input Line */}
                <div className="p-2 border-t border-slate-300 bg-slate-50">
                  <input
                    type="text"
                    placeholder="Enter new Bank Name..."
                    value={newBankInput}
                    onChange={(e) => setNewBankInput(e.target.value)}
                    className="w-full border border-sky-400 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                    autoFocus
                  />
                </div>
              </div>

              {/* Right Column: Save and Close Action Buttons */}
              <div className="flex flex-col gap-2.5 w-28 pt-2">
                <button
                  type="button"
                  onClick={() => handleAddBankSubmit()}
                  disabled={addingBank || !newBankInput.trim()}
                  className="w-full py-1.5 bg-gradient-to-b from-sky-500 to-sky-700 hover:from-sky-600 hover:to-sky-800 disabled:opacity-50 text-white font-bold text-xs rounded shadow border border-sky-800 transition"
                >
                  {addingBank ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBankModal(false);
                    setNewBankInput("");
                  }}
                  className="w-full py-1.5 bg-gradient-to-b from-slate-200 to-slate-300 hover:bg-slate-350 text-slate-800 font-bold text-xs rounded shadow border border-slate-400 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
