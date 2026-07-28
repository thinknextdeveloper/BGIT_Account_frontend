"use client";

import { useState, useCallback, useEffect } from "react";
import { feeSingleHeadApi } from "@/services/feeSingleHeadApi";
import { FeeSingleHeadData, PaymentMode } from "@/types/feeSingleHead";

function getTodayISOString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useFeeSingleHead() {
  const [idNoInput, setIdNoInput] = useState<string>("");
  const [data, setData] = useState<FeeSingleHeadData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSearched, setIsSearched] = useState<boolean>(false);

  // Ledgers Selection States matching VB.NET rdbtnHostel, rdbtnBus, rdbtnOthers, cmbSemester
  const [ledgerType, setLedgerType] = useState<"Hostel" | "Bus" | "Others">("Others");
  const [semesters, setSemesters] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  // Payment Mode & Transaction States matching VB.NET controls
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [banks, setBanks] = useState<string[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [chequeDraftNo, setChequeDraftNo] = useState<string>("");
  const [chequeDraftDate, setChequeDraftDate] = useState<string>(getTodayISOString());
  const [dateEntry, setDateEntry] = useState<string>(getTodayISOString());
  const [onAccountOf, setOnAccountOf] = useState<string>("");
  const [amountInput, setAmountInput] = useState<string>("");

  // Ledger ("Others") States
  const [ledgers, setLedgers] = useState<string[]>([]);
  const [selectedLedger, setSelectedLedger] = useState<string>("");

  // Next Receipt Number State & Printable Receipt
  const [nextReceiptNo, setNextReceiptNo] = useState<number | null>(null);
  const [lastSavedReceipt, setLastSavedReceipt] = useState<any | null>(null);

  /**
   * Reset / clear all fields matching VB.NET clearAllFields() logic
   */
  const clearAllFields = useCallback(() => {
    setData(null);
    setIsSearched(false);
    setError(null);
    setSuccessMessage(null);
    setPaymentMode("Cash");
    setLedgerType("Others");
    setSelectedBank("");
    setChequeDraftNo("");
    setChequeDraftDate(getTodayISOString());
    setDateEntry(getTodayISOString());
    setOnAccountOf("");
    setAmountInput("");
    setLedgers([]);
    setSelectedLedger("");
    setSelectedSemester("");
    setNextReceiptNo(null);
    setLastSavedReceipt(null);
  }, []);

  /**
   * Fetch MasterBank list matching cmbBank_Click VB.NET logic
   */
  const fetchBanks = useCallback(async () => {
    try {
      const res = await feeSingleHeadApi.getBanks();
      if (res.success && res.data) {
        setBanks(res.data);
      }
    } catch (err: any) {
      console.warn("Failed to fetch banks list:", err);
    }
  }, []);

  /**
   * Fetch Ledgers matching ShowLedgers() VB.NET logic
   */
  const fetchLedgers = useCallback(async (collegeName: string) => {
    try {
      const res = await feeSingleHeadApi.getLedgers(collegeName);
      if (res.success && res.data) {
        setLedgers(res.data);
      }
    } catch (err: any) {
      console.warn("Failed to fetch ledgers:", err);
      setLedgers([]);
    }
  }, []);

  /**
   * Fetch Semesters for student's college
   */
  const fetchSemesters = useCallback(async (collegeName: string) => {
    try {
      const res = await feeSingleHeadApi.getSemesters(collegeName);
      if (res.success && res.data) {
        const semesterNames = res.data.map((item: any) => typeof item === "string" ? item : item.Semester).filter(Boolean);
        const uniqueSemesters = Array.from(new Set(semesterNames));
        setSemesters(uniqueSemesters);
        if (uniqueSemesters.length > 0) {
          setSelectedSemester(uniqueSemesters[0]);
        }
      }
    } catch (err: any) {
      console.warn("Failed to fetch semesters:", err);
      setSemesters([]);
    }
  }, []);

  /**
   * Fetch Next Receipt No matching CalcReceiptNo VB.NET logic
   */
  const fetchReceiptNo = useCallback(async (session: string) => {
    try {
      const res = await feeSingleHeadApi.calcReceiptNo(session);
      if (res.success && res.data !== undefined) {
        setNextReceiptNo(res.data);
      }
    } catch (err: any) {
      console.warn("Failed to calculate ReceiptNo:", err);
      setNextReceiptNo(1);
    }
  }, []);

  /**
   * Main Search / Find action matching legacy VB.NET Display() and btnFind_Click
   */
  const btnFind_Click = async (targetIdNo?: string) => {
    const idToSearch = targetIdNo !== undefined ? targetIdNo : idNoInput;

    // VB.NET Validation: If txtIDNo.Text = "" Then MsgBox("Enter IDNo")
    if (!idToSearch || idToSearch.trim() === "") {
      setError("Enter IDNo");
      clearAllFields();
      return;
    }

    // VB.NET Validation: If IsNumeric(txtIDNo.Text) = False Then MsgBox("Enter Numeric value")
    if (isNaN(Number(idToSearch.trim()))) {
      setError("Enter Numeric value");
      clearAllFields();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      console.log("[FeeSingleHead Hook] Searching for IDNo:", idToSearch.trim());

      const res = await feeSingleHeadApi.getStudentFeeDetails(idToSearch.trim());
      console.log("[FeeSingleHead Hook] API Response received:", res);

      if (res.success && res.data) {
        setData(res.data);
        setIsSearched(true);

        const student = res.data.studentDetails;
        if (student?.CollegeName) {
          fetchSemesters(student.CollegeName);
          fetchLedgers(student.CollegeName);
        }

        // Fetch Next Receipt Number for current session
        if (res.data.session) {
          fetchReceiptNo(res.data.session);
        }
      } else {
        setError(res.message || "Failed to load student fee details.");
        clearAllFields();
      }
    } catch (err: any) {
      console.error("Error in btnFind_Click:", err);
      setError(err.message || "Invalid ID No");
      clearAllFields();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Payment Mode Radio Changes matching VB.NET CheckedChanged logic
   */
  const handlePaymentModeChange = (mode: PaymentMode) => {
    if (mode === "Others") {
      // VB.NET Validation: If txtIDNo.Text = "" Then MsgBox("Please Enter IDNo")
      if (!isSearched || !data?.studentDetails?.CollegeName) {
        setError("Please Enter IDNo");
        return;
      }
      // ShowLedgers() for student's college
      fetchLedgers(data.studentDetails.CollegeName);
    }

    if (mode === "Cheque" || mode === "Draft" || mode === "Others") {
      fetchBanks();
    } else {
      setSelectedBank("");
      setChequeDraftNo("");
    }

    setPaymentMode(mode);
    setChequeDraftDate(getTodayISOString());
  };

  /**
   * Handle Save & Print action matching legacy VB.NET btnSubmit_Click / btnSave_Click / AddDebitEntry()
   */
  const btnSubmit_Click = async (): Promise<boolean> => {
    setError(null);
    setSuccessMessage(null);

    // 1. If txtIDNo.Text = "" Then MsgBox("Please Enter IDNo")
    if (!idNoInput || idNoInput.trim() === "" || !isSearched || !data?.studentDetails) {
      setError("Please Enter IDNo");
      return false;
    }

    // 2. If cmbSemester.Text = "" Then MsgBox("Please Select Semester")
    if (!selectedSemester || selectedSemester.trim() === "") {
      setError("Please Select Semester");
      return false;
    }

    // 3. If txtSession.Text = "" Then MsgBox("Invalid Session")
    if (!data.session || data.session.trim() === "") {
      setError("Invalid Session");
      return false;
    }

    // 4. If rdbtnBus.Checked = False And rdbtnHostel.Checked = False And cmbLedger.Text = "" Then MsgBox("Please Select Ledger Name")
    if (ledgerType === "Others" && (!selectedLedger || selectedLedger.trim() === "")) {
      setError("Please Select Ledger Name");
      return false;
    }

    // 5. If txtOnAccountOf.Text = "" Then MsgBox("Please specify On account of")
    if (!onAccountOf || onAccountOf.trim() === "") {
      setError("Please specify On account of");
      return false;
    }

    // 6. Payment Mode check
    if (!paymentMode) {
      setError("Please Select Mode Of Payment");
      return false;
    }

    // 7. If txtAmount.Text = "" Then MsgBox("Please Enter Amount Value")
    if (!amountInput || isNaN(Number(amountInput)) || Number(amountInput) <= 0) {
      setError("Please Enter Amount Value");
      return false;
    }

    // 8. Cheque / Draft / Other Bank checks
    if (paymentMode === "Cheque") {
      if (!selectedBank || selectedBank.trim() === "") {
        setError("Please Select Bank Name");
        return false;
      }
      if (!chequeDraftNo || chequeDraftNo.trim() === "") {
        setError("Please Enter Cheque No");
        return false;
      }
    } else if (paymentMode === "Draft") {
      if (!selectedBank || selectedBank.trim() === "") {
        setError("Please Select Bank Name");
        return false;
      }
      if (!chequeDraftNo || chequeDraftNo.trim() === "") {
        setError("Please Enter Draft No");
        return false;
      }
    }

    try {
      setSaving(true);

      const payload = {
        idNo: idNoInput.trim(),
        semester: selectedSemester.trim(),
        session: data.session.trim(),
        ledgerType,
        ledgerName: ledgerType === "Others" ? selectedLedger.trim() : ledgerType,
        onAccountOf: onAccountOf.trim(),
        paymentMode,
        amount: Number(amountInput),
        bankName: selectedBank ? selectedBank.trim() : "",
        chequeDraftNo: chequeDraftNo ? chequeDraftNo.trim() : "",
        chequeDraftDate,
        dateEntry,
        entryType: "Credit",
      };

      console.log("[FeeSingleHead Hook] Submitting save payload:", payload);
      const res = await feeSingleHeadApi.saveFeeEntry(payload);

      if (res.success && res.data) {
        setSuccessMessage(`Fee entry saved successfully! Receipt No: ${res.data.receiptNo}`);
        setLastSavedReceipt(res.data);
        if (res.data.updatedDetails) {
          setData(res.data.updatedDetails);
        }
        // Refresh next receipt number
        fetchReceiptNo(data.session);
        // Clear amount and onAccountOf
        setAmountInput("");
        return true;
      } else {
        setError(res.message || "Failed to save fee entry.");
        return false;
      }
    } catch (err: any) {
      console.error("Error in btnSubmit_Click:", err);
      setError(err.message || "Failed to save fee entry.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addBank = async (newBankName: string): Promise<boolean> => {
    if (!newBankName || newBankName.trim() === "") {
      setError("Please Enter Bank Name");
      return false;
    }
    try {
      const res = await feeSingleHeadApi.createBank(newBankName.trim());
      if (res.success) {
        const returnedBanks = (res as any).banks;
        if (returnedBanks && Array.isArray(returnedBanks)) {
          setBanks(returnedBanks);
        } else {
          setBanks((prev) => Array.from(new Set([...prev, newBankName.trim()])));
        }
        setSelectedBank(newBankName.trim());
        setSuccessMessage("Bank Name added successfully.");
        return true;
      }
      setError(res.message || "Failed to add Bank Name.");
      return false;
    } catch (err: any) {
      console.error("Error adding Bank Name:", err);
      setError(err.message || "Failed to add Bank Name.");
      return false;
    }
  };

  return {
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
    fetchBanks,
    addBank,
    clearAllFields,
  };
}
