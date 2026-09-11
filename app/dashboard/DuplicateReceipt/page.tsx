"use client";

import React, { useState, useEffect, useCallback } from "react";
import { feeSingleHeadApi, searchReceipt } from "@/services/feeSingleHeadApi";
import { reduxApiClient } from "@/services/reduxservices";

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

// 11 Fee Subheads matching exact order in legacy CryFeeReceipt (Multiple Head)
const OFFICIAL_MULTIPLE_SUBHEADS = [
  "Academic Fee",
  "Fine/Late Fee",
  "Misc./Prsp.",
  "Other",
  "Bus Fee",
  "Hostel Fee",
  "Security",
  "Event Pass",
  "Activity Fund",
  "Library Security",
  "Examination Fee",
];

export default function DuplicateReceiptPage() {
  // Form Controls matching VB.NET controls: cmbCollege, cmbLedgerName, txtReceiptNo, txtSession, rdbtnIDNo, rdbtnRegistration
  const [collegesList, setCollegesList] = useState<string[]>([]);
  const [cmbCollege, setCmbCollege] = useState<string>("");
  const [ledgersList, setLedgersList] = useState<string[]>([]);
  const [cmbLedgerName, setCmbLedgerName] = useState<string>("");
  const [txtReceiptNo, setTxtReceiptNo] = useState<string>("");
  const [txtSession, setTxtSession] = useState<string>("2025-26");
  const [searchType, setSearchType] = useState<"IDNo" | "Registration">("IDNo");

  // Response state
  const [receiptData, setReceiptData] = useState<{ receiptType: string; records: any[] } | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * FillCollege(cmbCollege) matching VB.NET Form_Load
   */
  const fillCollege = useCallback(async () => {
    try {
      const res = await reduxApiClient.get("master-course/colleges");
      if (res.success && res.data?.data) {
        setCollegesList(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to load colleges list:", err);
    }
  }, []);

  /**
   * ShowLedger() matching VB.NET logic: queries MasterLedgers for selected college
   */
  const showLedger = async (collegeName: string) => {
    if (!collegeName) {
      setLedgersList([]);
      setCmbLedgerName("");
      return;
    }
    try {
      const res = await feeSingleHeadApi.getLedgers(collegeName);
      if (res.success && res.data) {
        setLedgersList(res.data);
        if (res.data.length > 0) {
          setCmbLedgerName(res.data[0]);
        } else {
          setCmbLedgerName("");
        }
      }
    } catch (err) {
      console.warn("Failed to fetch ledgers for college:", err);
      setLedgersList([]);
      setCmbLedgerName("");
    }
  };

  /**
   * Form_Load matching legacy VB.NET frmSearchReceipt_Load
   */
  useEffect(() => {
    fillCollege();

    // Fetch ShowSession
    feeSingleHeadApi
      .getStudentFeeDetails("1")
      .then((res) => {
        if (res.success && res.data?.session) {
          setTxtSession(res.data.session);
        }
      })
      .catch(() => {});
  }, [fillCollege]);

  /**
   * Handle College Selection change (cmbCollege_Click)
   */
  const handleCollegeChange = (collegeName: string) => {
    setCmbCollege(collegeName);
    setCmbLedgerName("");
    setLedgersList([]);
    setError(null);
    if (collegeName) {
      showLedger(collegeName);
    }
  };

  /**
   * btnPrintPreview_Click logic matching VB.NET
   */
  const btnPrintPreview_Click = async () => {
    setError(null);

    // 1. Validations matching VB.NET:
    if (!cmbCollege || cmbCollege.trim() === "") {
      setError("Please Select CollegeName");
      return;
    }
    if (!cmbLedgerName || cmbLedgerName.trim() === "") {
      setError("Please Select LedgerName");
      return;
    }
    if (!txtReceiptNo || txtReceiptNo.trim() === "") {
      setError("Please Enter ReceiptNo");
      return;
    }

    try {
      setLoading(true);
      const res = await searchReceipt(
        cmbCollege.trim(),
        cmbLedgerName.trim(),
        txtReceiptNo.trim(),
        txtSession.trim(),
        searchType
      );

      if (res.success && res.data?.records && res.data.records.length > 0) {
        const records = res.data.records;
        const firstRow = records[0];

        // Check if there is an actual non-zero credit/debit fee payment record
        let hasValidAmount = false;
        if (res.data.receiptType === "Multiple") {
          const totalCredit1 = Number(firstRow.Credit1) || 0;
          let subheadSum = 0;
          records.forEach((r: any) => {
            if (r.Credit) subheadSum += Number(r.Credit);
          });
          if (totalCredit1 > 0 || subheadSum > 0) {
            hasValidAmount = true;
          }
        } else {
          const totalAmt = Number(firstRow.Credit) || Number(firstRow.Debit) || 0;
          if (totalAmt > 0) {
            hasValidAmount = true;
          }
        }

        if (hasValidAmount) {
          setReceiptData(res.data);
          setShowPrintModal(true);
        } else {
          setError("Sorry! No Record Found");
          setReceiptData(null);
          setShowPrintModal(false);
          alert("Sorry! No Record Found");
        }
      } else {
        setError("Sorry! No Record Found");
        setReceiptData(null);
        setShowPrintModal(false);
        alert("Sorry! No Record Found");
      }
    } catch (err: any) {
      const errMsg = err.message || "Sorry! No Record Found";
      setError(errMsg);
      setReceiptData(null);
      setShowPrintModal(false);
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Open clean printable window for Duplicate Receipt matching CryFeeReceipt / CryCreditDebitFee
   */
  const handlePrintDuplicateReceipt = () => {
    if (!receiptData || !receiptData.records || receiptData.records.length === 0) {
      alert("Sorry! No Record Found");
      return;
    }

    const firstRow = receiptData.records[0];
    const collegeName = firstRow.CollegeName || cmbCollege;
    const studentName = firstRow.StudentName || "";
    const fatherName = firstRow.FatherName || "";
    const sex = firstRow.Sex || "Male";
    const studentNameWithRelation = sex.toLowerCase() === "female"
      ? `${studentName} D/o ${fatherName}`
      : `${studentName} S/o ${fatherName}`;

    const idLabel = searchType === "Registration" ? "Reg. No" : "ID No";
    const idNoVal = searchType === "Registration"
      ? (firstRow.RegistrationNo || firstRow.IDNo || "-")
      : (firstRow.IDNo || firstRow.RegistrationNo || "-");

    const receiptNoVal = firstRow.ReceiptNo || txtReceiptNo;
    const courseVal = firstRow.Course || "-";
    const batchVal = firstRow.Batch || "-";
    const semesterVal = firstRow.Semester || "-";
    const classRollNoVal = firstRow.ClassRollNo || "-";
    const uniRollNoVal = firstRow.UniRollNo || "";
    const dateEntryVal = firstRow.DateEntry
      ? new Date(firstRow.DateEntry).toLocaleDateString("en-GB")
      : new Date().toLocaleDateString("en-GB");

    const chequeDraftNo = firstRow.ChequeDraftNo || "";
    const chequeDraftDate = firstRow.ChequeDraftDate ? new Date(firstRow.ChequeDraftDate).toLocaleDateString("en-GB") : "";
    const chequeDraftBank = firstRow.ChequeDraftBank || "";
    const modeOfPayment = firstRow.ModeOfPayment ? String(firstRow.ModeOfPayment).toUpperCase() : "CASH";

    let printHtml = "";

    if (receiptData.receiptType === "Multiple") {
      // -------------------------------------------------------------
      // MULTIPLE HEAD RECEIPT PRINT LAYOUT (CryFeeReceipt)
      // -------------------------------------------------------------
      const subheadMap: { [key: string]: number } = {};
      let totalAmount = Number(firstRow.Credit1) || 0;

      receiptData.records.forEach((r) => {
        if (r.Subhead) {
          const amt = Number(r.Credit) || 0;
          subheadMap[r.Subhead] = amt;
        }
        if (r.Credit1 && totalAmount === 0) {
          totalAmount = Number(r.Credit1);
        }
      });

      if (totalAmount === 0) {
        Object.values(subheadMap).forEach((val) => {
          totalAmount += val;
        });
      }

      const subheadRowsHtml = OFFICIAL_MULTIPLE_SUBHEADS.map((head, idx) => {
        const amtVal = subheadMap[head] !== undefined ? subheadMap[head] : 0;
        return `
          <tr>
            <td style="text-align: center; width: 40px; font-weight: bold; padding: 3px 4px;">${idx + 1}</td>
            <td style="padding: 3px 4px; font-weight: bold; font-size: 13px;">${head}</td>
            <td style="text-align: right; padding: 3px 4px; font-weight: bold; font-size: 13px;">${amtVal.toFixed(2)}</td>
          </tr>
        `;
      }).join("");

      const amountWords = numberToWords(totalAmount) + " Only";

      let paymentDetailsRowHtml = "";
      if (chequeDraftNo || modeOfPayment === "CHEQUE" || modeOfPayment === "DRAFT") {
        paymentDetailsRowHtml = `
          <tr style="border-top: 1px solid #000;">
            <td></td>
            <td colspan="2" style="padding: 4px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold;">
                <div><span>Cheque/Draft No</span> &nbsp; <span style="border-bottom: 1px solid #000; font-weight: bold;">${chequeDraftNo}</span></div>
                <div><span>Date :</span> &nbsp; <span style="border-bottom: 1px solid #000; font-weight: bold;">${chequeDraftDate}</span></div>
              </div>
              <div style="margin-top: 2px; font-size: 12px; font-weight: bold;">
                <span>Bank :</span> &nbsp; <span style="border-bottom: 1px solid #000; font-weight: bold;">${chequeDraftBank}</span>
              </div>
            </td>
          </tr>
        `;
      } else {
        paymentDetailsRowHtml = `
          <tr style="border-top: 1px solid #000;">
            <td></td>
            <td style="font-weight: bold; padding: 6px 4px;"><span class="lbl">Mode of Payment</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span>${modeOfPayment}</span></td>
            <td></td>
          </tr>
        `;
      }

      printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>FEE RECEIPT - ${receiptNoVal}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body {
              font-family: Arial, sans-serif;
              color: #000;
              background: #fff;
              margin: 0;
              padding: 10px;
              font-size: 13px;
            }
            .dup-title { text-align: center; font-size: 12px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; }
            .header-box { text-align: center; margin-bottom: 15px; }
            .college-title { font-size: 22px; font-weight: bold; margin: 0; }
            .college-sub { font-size: 11px; font-weight: 500; margin: 2px 0 0 0; }
            
            .meta-section { margin-bottom: 12px; font-size: 13px; }
            .meta-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .meta-row-grid { display: flex; margin-bottom: 5px; }
            .lbl { font-weight: bold; }
            .fill-line { border-bottom: 1px solid #000; display: inline-block; padding-bottom: 1px; font-weight: bold; }
            
            .table-container {
              width: 100%;
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              margin-top: 8px;
              margin-bottom: 10px;
            }
            .fee-table { width: 100%; border-collapse: collapse; }
            .fee-table th { border-bottom: 1.5px solid #000; padding: 5px 4px; font-weight: bold; text-align: left; }
            .fee-table td { padding: 2px 4px; }
            .total-row { border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; }
            .bottom-words { border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-top: 8px; margin-bottom: 35px; font-size: 13px; font-weight: bold; }
            .cashier-box { text-align: right; font-weight: bold; font-size: 14px; margin-top: 25px; }
          </style>
        </head>
        <body>
          <div class="dup-title">DUPLICATE RECEIPT</div>
          <div class="header-box">
            <h1 class="college-title">${collegeName}</h1>
            <p class="college-sub">Patiala-Sangrur National Highway,Bhawanigarh, Sangrur (Pb.)</p>
          </div>

          <div class="meta-section">
            <div class="meta-row">
              <div><span class="lbl">Receipt No</span> &nbsp; <span class="fill-line" style="width: 90px; text-align: center;">${receiptNoVal}</span></div>
              <div><span class="lbl">Date :</span> &nbsp; <span style="font-weight: bold;">${dateEntryVal}</span></div>
            </div>
            <div class="meta-row" style="margin-top: 4px;">
              <div style="width: 100%;"><span class="lbl">Received From</span> &nbsp; <span class="fill-line" style="width: 80%;">${studentNameWithRelation}</span></div>
            </div>
            <div class="meta-row-grid" style="margin-top: 5px;">
              <div style="width: 65%;"><span class="lbl">Course :</span> &nbsp; <span class="fill-line" style="width: 78%;">${courseVal}</span></div>
              <div style="width: 35%; text-align: right;"><span class="lbl">Batch :</span> &nbsp; <span class="fill-line" style="width: 60%; text-align: center;">${batchVal}</span></div>
            </div>
            <div class="meta-row-grid" style="margin-top: 5px;">
              <div style="width: 50%;"><span class="lbl">Class Roll No.</span> &nbsp; <span class="fill-line" style="width: 65%; text-align: center;">${classRollNoVal}</span></div>
              <div style="width: 50%; text-align: right;"><span class="lbl">ID/Reg. No.</span> &nbsp; <span class="fill-line" style="width: 65%; text-align: center;">${idNoVal}</span></div>
            </div>
            <div class="meta-row-grid" style="margin-top: 5px;">
              <div style="width: 65%;"><span class="lbl">On account of :</span> &nbsp; <span class="fill-line" style="width: 70%;">${semesterVal} Semester ( Fee )</span></div>
              <div style="width: 35%; text-align: right;"><span class="lbl">Uni Roll No.</span> &nbsp; <span class="fill-line" style="width: 55%; text-align: center;">${uniRollNoVal}</span></div>
            </div>
          </div>

          <div class="table-container">
            <table class="fee-table">
              <thead>
                <tr>
                  <th style="width: 50px; text-align: center;">S. No.</th>
                  <th style="text-align: center;">Particulars</th>
                  <th style="width: 150px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${subheadRowsHtml}
                ${paymentDetailsRowHtml}
                <tr class="total-row">
                  <td></td>
                  <td style="text-align: right; font-weight: bold; padding: 6px 15px 6px 0; font-size: 14px;">Total :</td>
                  <td style="text-align: right; font-weight: bold; padding: 6px 4px; font-size: 14px;">${totalAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bottom-words">
            <span class="lbl">Received Rs.</span> <span>${amountWords}</span>
          </div>

          <div class="cashier-box">
            Cashier
          </div>

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
    } else {
      // -------------------------------------------------------------
      // SINGLE HEAD RECEIPT PRINT LAYOUT (CryCreditDebitFee - Exact Screenshot Match)
      // -------------------------------------------------------------
      const totalAmount = Number(firstRow.Credit) || Number(firstRow.Debit) || 0;
      const amountWords = numberToWords(totalAmount) + " Only";

      let receiptStatement = "";
      const ledgerName = firstRow.LedgerName || cmbLedgerName;
      if (ledgerName === "Hostel") {
        receiptStatement = "Hostel Receipt";
      } else if (ledgerName === "Bus") {
        receiptStatement = "Transport Receipt";
      } else if (ledgerName) {
        receiptStatement = `${ledgerName} Receipt`;
      } else {
        receiptStatement = "Fee Receipt";
      }

      let paymentDetailsStr = modeOfPayment === "CHEQUE" ? "Cheque" : modeOfPayment === "DRAFT" ? "Draft" : "Cash";
      if (chequeDraftNo) {
        paymentDetailsStr = `${paymentDetailsStr} No - ${chequeDraftNo}`;
        if (chequeDraftDate) paymentDetailsStr += `, ${chequeDraftDate}`;
        if (chequeDraftBank) paymentDetailsStr += `, ${chequeDraftBank}`;
      }

      const onAccountOfVal = firstRow.OnAccountOf || firstRow.Particulars || ledgerName || "Fee";

      printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${receiptStatement.toUpperCase()} - ${receiptNoVal}</title>
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            body {
              font-family: Arial, sans-serif;
              color: #000;
              background: #fff;
              margin: 0;
              padding: 10px 20px;
              font-size: 13px;
              line-height: 2.1;
            }
            .dup-title { text-align: center; font-size: 11px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; }
            .header-box { text-align: center; margin-bottom: 12px; }
            .college-title { font-size: 22px; font-weight: bold; margin: 0; }
            .college-sub { font-size: 11px; font-weight: 500; margin: 2px 0 0 0; }
            
            .receipt-stmt { text-align: center; font-size: 14px; font-weight: bold; margin-top: 10px; margin-bottom: 18px; }
            
            .field-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .lbl { font-weight: bold; }
            .fill-line { border-bottom: 1px solid #000; display: inline-block; padding-bottom: 1px; font-weight: bold; }

            .bottom-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 35px;
            }
            .amount-box {
              border: 1px solid #000;
              padding: 6px 14px;
              font-weight: bold;
              font-size: 14px;
              min-width: 150px;
              display: flex;
              justify-content: space-between;
            }
            .sig-container { text-align: center; }
            .sig-box { border: 1px solid #000; width: 170px; height: 38px; }
            .sig-lbl { font-size: 11px; font-weight: bold; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="dup-title">DUPLICATE RECEIPT</div>
          <div class="header-box">
            <h1 class="college-title">${collegeName}</h1>
            <p class="college-sub">Patiala-Sangrur National Highway,Bhawanigarh, Sangrur(Pb.)</p>
          </div>

          <div class="receipt-stmt">
            ${receiptStatement} -
          </div>

          <div class="field-row">
            <div><span class="lbl">Receipt No.</span> &nbsp; <span style="font-weight: bold;">${receiptNoVal}</span></div>
            <div><span class="lbl">Date :</span> &nbsp; <span style="font-weight: bold;">${dateEntryVal}</span></div>
          </div>

          <div class="field-row">
            <div style="width: 100%;"><span class="lbl">Received with Thanks from</span> &nbsp; <span class="fill-line" style="width: 72%;">${studentNameWithRelation}</span></div>
          </div>

          <div class="field-row">
            <div style="width: 50%;"><span class="lbl">Course :</span> &nbsp; <span class="fill-line" style="width: 75%;">${courseVal}</span></div>
            <div style="width: 50%; text-align: right;"><span class="lbl">Batch :</span> &nbsp; <span class="fill-line" style="width: 60px; text-align: center;">${batchVal}</span> &nbsp;&nbsp;&nbsp;&nbsp; <span class="lbl">Semester :</span> &nbsp; <span class="fill-line" style="width: 90px; text-align: center;">${semesterVal}</span></div>
          </div>

          <div class="field-row">
            <div style="width: 50%;"><span class="lbl">${idLabel} :</span> &nbsp; <span class="fill-line" style="width: 70%; text-align: center;">${idNoVal}</span></div>
            <div style="width: 50%; text-align: right;"><span class="lbl">Class Roll No. :</span> &nbsp; <span class="fill-line" style="width: 110px; text-align: center;">${classRollNoVal}</span></div>
          </div>

          <div class="field-row">
            <div style="width: 100%;"><span class="lbl">Rs (In Words) :</span> &nbsp; <span class="fill-line" style="width: 82%;">${amountWords}</span></div>
          </div>

          <div class="field-row">
            <div style="width: 100%;"><span class="lbl">by</span> &nbsp; <span class="fill-line" style="width: 93%;">${paymentDetailsStr}</span></div>
          </div>

          <div class="field-row">
            <div style="width: 100%;"><span class="lbl">On account Of</span> &nbsp; <span class="fill-line" style="width: 84%;">${onAccountOfVal}</span></div>
          </div>

          <div class="bottom-container">
            <div class="amount-box">
              <span>Rs.</span>
              <span>${totalAmount}/-</span>
            </div>

            <div class="sig-container">
              <div class="sig-box"></div>
              <div class="sig-lbl">(Signature)</div>
            </div>
          </div>

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
    }

    const printWindow = window.open("", "_blank", "width=880,height=920");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      btnPrintPreview_Click();
    }
  };

  const firstRecord = receiptData?.records?.[0];

  // Calculate totals and subheads for in-app modal preview
  const isMultiple = receiptData?.receiptType === "Multiple";
  const subheadMapPreview: { [key: string]: number } = {};
  let totalAmountPreview = 0;

  if (isMultiple && receiptData?.records) {
    totalAmountPreview = Number(firstRecord?.Credit1) || 0;

    receiptData.records.forEach((r) => {
      if (r.Subhead) {
        const amt = Number(r.Credit) || 0;
        subheadMapPreview[r.Subhead] = amt;
      }
      if (r.Credit1 && totalAmountPreview === 0) {
        totalAmountPreview = Number(r.Credit1);
      }
    });

    if (totalAmountPreview === 0) {
      Object.values(subheadMapPreview).forEach((v) => {
        totalAmountPreview += v;
      });
    }
  } else if (firstRecord) {
    totalAmountPreview = Number(firstRecord.Credit) || Number(firstRecord.Debit) || 0;
  }

  const studentNameWithRel = firstRecord
    ? (firstRecord.Sex || "Male").toLowerCase() === "female"
      ? `${firstRecord.StudentName} D/o ${firstRecord.FatherName}`
      : `${firstRecord.StudentName} S/o ${firstRecord.FatherName}`
    : "";

  const idLabelText = searchType === "Registration" ? "Reg. No" : "ID No";
  const idNoValue = searchType === "Registration"
    ? (firstRecord?.RegistrationNo || firstRecord?.IDNo || "-")
    : (firstRecord?.IDNo || firstRecord?.RegistrationNo || "-");

  let singleReceiptStmt = "";
  if (firstRecord) {
    const lname = firstRecord.LedgerName || cmbLedgerName;
    if (lname === "Hostel") singleReceiptStmt = "Hostel Receipt";
    else if (lname === "Bus") singleReceiptStmt = "Transport Receipt";
    else if (lname) singleReceiptStmt = `${lname} Receipt`;
    else singleReceiptStmt = "Fee Receipt";
  }

  let paymentStrModal = firstRecord?.ModeOfPayment ? String(firstRecord.ModeOfPayment) : "Cash";
  if (firstRecord?.ChequeDraftNo) {
    paymentStrModal = `${paymentStrModal} No - ${firstRecord.ChequeDraftNo}`;
    if (firstRecord.ChequeDraftDate) paymentStrModal += `, ${new Date(firstRecord.ChequeDraftDate).toLocaleDateString("en-GB")}`;
    if (firstRecord.ChequeDraftBank) paymentStrModal += `, ${firstRecord.ChequeDraftBank}`;
  }

  return (
    <div className="space-y-6 font-sans bg-slate-50 min-h-screen p-4 sm:p-6 rounded-2xl">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-wide">Duplicate Receipt</h1>
            <span className="text-xs bg-red-500/30 border border-red-400/40 text-red-200 px-3 py-1 rounded-full font-mono font-semibold">
              Search & Print Duplicate Receipt
            </span>
          </div>
          <p className="text-xs text-sky-200/80 mt-1">
            Generate and print duplicate fee receipts by College, Ledger Name, and Receipt Number.
          </p>
        </div>
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

      {/* Main Search Panel matching legacy frmSearchReceipt form */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Receipt Search Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end text-xs">
          {/* Search Type Radio Buttons rdbtnIDNo / rdbtnRegistration */}
          <div className="md:col-span-3 flex items-center gap-4 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
            <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
              <input
                id="rdbtnIDNo"
                type="radio"
                name="searchType"
                checked={searchType === "IDNo"}
                onChange={() => setSearchType("IDNo")}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500"
              />
              <span>ID No</span>
            </label>

            <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
              <input
                id="rdbtnRegistration"
                type="radio"
                name="searchType"
                checked={searchType === "Registration"}
                onChange={() => setSearchType("Registration")}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500"
              />
              <span>Registration No</span>
            </label>
          </div>

          {/* cmbCollege Dropdown */}
          <div className="md:col-span-3 space-y-1">
            <label htmlFor="cmbCollege" className="block font-bold uppercase text-slate-600">
              College Name <span className="text-rose-500">*</span>
            </label>
            <select
              id="cmbCollege"
              value={cmbCollege}
              onChange={(e) => handleCollegeChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Select College --</option>
              {collegesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* cmbLedgerName Dropdown */}
          <div className="md:col-span-3 space-y-1">
            <label htmlFor="cmbLedgerName" className="block font-bold uppercase text-slate-600">
              Ledger Name <span className="text-rose-500">*</span>
            </label>
            <select
              id="cmbLedgerName"
              value={cmbLedgerName}
              onChange={(e) => setCmbLedgerName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Select Ledger --</option>
              {ledgersList.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* txtReceiptNo Input */}
          <div className="md:col-span-3 space-y-1">
            <label htmlFor="txtReceiptNo" className="block font-bold uppercase text-slate-600">
              Receipt No. <span className="text-rose-500">*</span>
            </label>
            <input
              id="txtReceiptNo"
              type="text"
              placeholder="e.g. 1003"
              value={txtReceiptNo}
              onChange={(e) => setTxtReceiptNo(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Session txtSession Input */}
          <div className="md:col-span-3 space-y-1">
            <label htmlFor="txtSession" className="block font-bold uppercase text-slate-600">
              Session
            </label>
            <input
              id="txtSession"
              type="text"
              list="sessionList"
              placeholder="e.g. 2025-26"
              value={txtSession}
              onChange={(e) => setTxtSession(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
            />
            <datalist id="sessionList">
              <option value="2026-27" />
              <option value="2025-26" />
              <option value="2024-25" />
              <option value="2023-24" />
              <option value="2022-23" />
              <option value="2021-22" />
            </datalist>
          </div>

          {/* Action Button btnPrintPreview */}
          <div className="md:col-span-3">
            <button
              id="btnPrintPreview"
              onClick={btnPrintPreview_Click}
              disabled={loading}
              className="w-full h-[42px] bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Searching..." : "Print Preview"}
            </button>
          </div>
        </div>
      </div>

      {/* Duplicate Receipt Results & Action Card */}
      {receiptData && firstRecord && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Receipt #{firstRecord.ReceiptNo || txtReceiptNo} Found ({isMultiple ? "CryFeeReceipt - Multiple" : "CryCreditDebitFee - Single"})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Student: <span className="font-bold text-slate-800">{firstRecord.StudentName}</span> ({firstRecord.Course})
              </p>
            </div>

            <button
              onClick={handlePrintDuplicateReceipt}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs rounded-lg shadow-md transition flex items-center gap-2"
            >
              <span>🖨️</span> Print Duplicate Receipt
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-500 block text-[10px] uppercase">College Name</span>
              <span className="font-semibold text-slate-800">{firstRecord.CollegeName}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[10px] uppercase">Student ID / Reg No</span>
              <span className="font-mono font-bold text-slate-900">{firstRecord.IDNo || firstRecord.RegistrationNo}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[10px] uppercase">Father's Name</span>
              <span className="font-medium text-slate-800">{firstRecord.FatherName}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[10px] uppercase">Course & Semester</span>
              <span className="font-medium text-slate-800">{firstRecord.Course} ({firstRecord.Semester} Sem)</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[10px] uppercase">Mode of Payment</span>
              <span className="font-bold text-blue-900">{firstRecord.ModeOfPayment || "CASH"}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[10px] uppercase">Total Amount</span>
              <span className="font-mono font-black text-emerald-800 text-sm">
                ₹{totalAmountPreview}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Receipt Modal Preview (Exact Crystal Report Layouts) */}
      {showPrintModal && receiptData && firstRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                  DUPLICATE RECEIPT PREVIEW ({isMultiple ? "CryFeeReceipt - Multiple" : "CryCreditDebitFee - Single"})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDuplicateReceipt}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg shadow transition flex items-center gap-1.5"
                >
                  <span>🖨️ Print Receipt</span>
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

            {/* In-App Crystal Report Preview */}
            <div className="p-8 border border-slate-400 bg-white font-sans text-slate-900 space-y-3 shadow-sm text-xs">
              <div className="text-center text-xs font-bold uppercase mb-1">
                DUPLICATE RECEIPT
              </div>
              <div className="text-center space-y-0.5">
                <h2 className="text-xl font-bold uppercase text-slate-900">
                  {firstRecord.CollegeName || cmbCollege}
                </h2>
                <p className="text-[11px] text-slate-700 font-medium">
                  Patiala-Sangrur National Highway,Bhawanigarh, Sangrur(Pb.)
                </p>
              </div>

              {isMultiple ? (
                /* Multiple Head Receipt Preview matching CryFeeReceipt */
                <div className="space-y-3 font-sans pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <div><span className="font-bold">Receipt No</span> &nbsp; <span className="underline font-bold">{firstRecord.ReceiptNo || txtReceiptNo}</span></div>
                    <div><span className="font-bold">Date :</span> &nbsp; <span>{firstRecord.DateEntry ? new Date(firstRecord.DateEntry).toLocaleDateString("en-GB") : "-"}</span></div>
                  </div>

                  <div>
                    <span className="font-bold">Received From</span> &nbsp; <span className="border-b border-slate-900 font-bold inline-block w-[75%]">{studentNameWithRel}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-8"><span className="font-bold">Course :</span> &nbsp; <span className="border-b border-slate-900 font-bold inline-block w-[75%]">{firstRecord.Course}</span></div>
                    <div className="col-span-4 text-right"><span className="font-bold">Batch :</span> &nbsp; <span className="border-b border-slate-900 font-bold inline-block w-[60%] text-center">{firstRecord.Batch}</span></div>
                  </div>

                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-6"><span className="font-bold">Class Roll No.</span> &nbsp; <span className="border-b border-slate-900 font-bold inline-block w-[60%] text-center">{firstRecord.ClassRollNo || "-"}</span></div>
                    <div className="col-span-6 text-right"><span className="font-bold">ID/Reg. No.</span> &nbsp; <span className="border-b border-slate-900 font-bold inline-block w-[60%] text-center">{firstRecord.IDNo || firstRecord.RegistrationNo}</span></div>
                  </div>

                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-8"><span className="font-bold">On account of :</span> &nbsp; <span className="border-b border-slate-900 font-bold inline-block w-[70%]">{firstRecord.Semester} Semester ( Fee )</span></div>
                    <div className="col-span-4 text-right"><span className="font-bold">Uni Roll No.</span> &nbsp; <span className="border-b border-slate-900 font-bold inline-block w-[50%] text-center">{firstRecord.UniRollNo || ""}</span></div>
                  </div>

                  <table className="w-full text-left border-t-2 border-b-2 border-slate-900 text-xs mt-3">
                    <thead className="border-b border-slate-900 font-bold">
                      <tr>
                        <th className="py-1 px-2 w-12 text-center">S. No.</th>
                        <th className="py-1 px-2 text-center">Particulars</th>
                        <th className="py-1 px-2 text-right w-28">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {OFFICIAL_MULTIPLE_SUBHEADS.map((head, idx) => {
                        const amtVal = subheadMapPreview[head] !== undefined ? subheadMapPreview[head] : 0;
                        return (
                          <tr key={idx}>
                            <td className="py-0.5 px-2 text-center font-bold">{idx + 1}</td>
                            <td className="py-0.5 px-2 font-bold">{head}</td>
                            <td className="py-0.5 px-2 text-right font-bold">{amtVal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      
                      {firstRecord.ChequeDraftNo || String(firstRecord.ModeOfPayment).toUpperCase() === "CHEQUE" || String(firstRecord.ModeOfPayment).toUpperCase() === "DRAFT" ? (
                        <tr className="border-t border-slate-900 text-xs">
                          <td></td>
                          <td colSpan={2} className="py-1 px-2">
                            <div className="flex justify-between font-bold">
                              <div><span>Cheque/Draft No</span> &nbsp; <span className="border-b border-slate-900 font-bold">{firstRecord.ChequeDraftNo || "-"}</span></div>
                              <div><span>Date :</span> &nbsp; <span className="border-b border-slate-900 font-bold">{firstRecord.ChequeDraftDate ? new Date(firstRecord.ChequeDraftDate).toLocaleDateString("en-GB") : "-"}</span></div>
                            </div>
                            <div className="mt-0.5 font-bold">
                              <span>Bank :</span> &nbsp; <span className="border-b border-slate-900 font-bold">{firstRecord.ChequeDraftBank || "-"}</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr className="border-t border-slate-900">
                          <td></td>
                          <td className="py-1.5 px-2 font-bold"><span className="font-bold">Mode of Payment</span> &nbsp;&nbsp;&nbsp;&nbsp; <span>{firstRecord.ModeOfPayment || "CASH"}</span></td>
                          <td></td>
                        </tr>
                      )}

                      <tr className="border-t-2 border-b-2 border-slate-900 font-bold text-sm">
                        <td></td>
                        <td className="py-1.5 px-2 text-right pr-4">Total :</td>
                        <td className="py-1.5 px-2 text-right">{totalAmountPreview}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="border-b border-slate-900 pb-1 text-xs pt-2">
                    <span className="font-bold">Received Rs.</span> <span className="font-bold">{numberToWords(totalAmountPreview)} Only</span>
                  </div>

                  <div className="text-right font-bold text-xs pt-6">
                    Cashier
                  </div>
                </div>
              ) : (
                /* Single Head Receipt Preview matching exact CryCreditDebitFee (Screenshot 2) */
                <div className="space-y-4 font-sans pt-2 text-xs leading-relaxed">
                  <div className="text-center font-bold text-sm">
                    {singleReceiptStmt} -
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div><span className="font-bold">Receipt No.</span> &nbsp; <span className="font-bold">{firstRecord.ReceiptNo || txtReceiptNo}</span></div>
                    <div><span className="font-bold">Date :</span> &nbsp; <span className="font-bold">{firstRecord.DateEntry ? new Date(firstRecord.DateEntry).toLocaleDateString("en-GB") : "-"}</span></div>
                  </div>

                  <div>
                    <span className="font-bold">Received with Thanks from</span> &nbsp; <span className="font-bold border-b border-slate-900 inline-block w-[70%]">{studentNameWithRel}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-6"><span className="font-bold">Course :</span> &nbsp; <span className="font-bold border-b border-slate-900 inline-block w-[75%]">{firstRecord.Course}</span></div>
                    <div className="col-span-6 text-right"><span className="font-bold">Batch :</span> &nbsp; <span className="font-bold border-b border-slate-900 inline-block w-14 text-center">{firstRecord.Batch}</span> &nbsp;&nbsp; <span className="font-bold">Semester :</span> &nbsp; <span className="font-bold border-b border-slate-900 inline-block w-20 text-center">{firstRecord.Semester}</span></div>
                  </div>

                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-6"><span className="font-bold">{idLabelText} :</span> &nbsp; <span className="font-bold border-b border-slate-900 inline-block w-[70%] text-center">{idNoValue}</span></div>
                    <div className="col-span-6 text-right"><span className="font-bold">Class Roll No. :</span> &nbsp; <span className="font-bold border-b border-slate-900 inline-block w-24 text-center">{firstRecord.ClassRollNo || "-"}</span></div>
                  </div>

                  <div>
                    <span className="font-bold">Rs (In Words) :</span> &nbsp; <span className="font-bold border-b border-slate-900 inline-block w-[80%]">{numberToWords(totalAmountPreview)} Only</span>
                  </div>

                  <div>
                    <span className="font-bold">by</span> &nbsp; <span className="font-bold border-b border-slate-900 inline-block w-[93%]">{paymentStrModal}</span>
                  </div>

                  <div>
                    <span className="font-bold">On account Of</span> &nbsp; <span className="font-bold border-b border-slate-900 inline-block w-[83%]">{firstRecord.OnAccountOf || firstRecord.Particulars || firstRecord.LedgerName || "Fee"}</span>
                  </div>

                  {/* Bottom Amount Box & Signature Box matching Screenshot 2 */}
                  <div className="flex justify-between items-end pt-6">
                    <div className="border border-slate-900 px-4 py-1.5 font-bold text-sm min-w-[140px] flex justify-between">
                      <span>Rs.</span>
                      <span>{totalAmountPreview}/-</span>
                    </div>

                    <div className="text-center">
                      <div className="border border-slate-900 w-44 h-10"></div>
                      <div className="text-[11px] font-bold mt-1">(Signature)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
