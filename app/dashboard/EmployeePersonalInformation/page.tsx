"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// If your app already exports typed hooks (useAppDispatch/useAppSelector),
// swap them in here instead of the plain react-redux hooks below.
import {
  fetchEmployee,
  updateEmployee,
  getBanks,
  addBank,
  startNewEntry,
  updateField,
  clearEmployeeError,
  EmployeeRecord,
} from "../../../store/slices/Employeeslice";

interface EmployeeDetailsPageProps {
  /** Called when either Close button is confirmed. Wire to a route change / modal close. */
  onClose?: () => void;
}

export default function EmployeeDetailsPage({ onClose }: EmployeeDetailsPageProps) {
  const dispatch = useDispatch<any>();
  const { record, banks, loading, saving, error } = useSelector((state: any) => state.employee);

  const [searchId, setSearchId] = useState("");
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [newBankName, setNewBankName] = useState("");

  useEffect(() => {
    dispatch(getBanks());
  }, [dispatch]);

  const field = (name: keyof EmployeeRecord): any => (record ? (record as any)[name] ?? "" : "");

  // HTML date inputs need "YYYY-MM-DD"; trims a Mongo/ISO timestamp down to that.
  const dateValue = (name: keyof EmployeeRecord): string => {
    const v = field(name);
    return typeof v === "string" && v ? v.slice(0, 10) : "";
  };

  const handleFieldChange = (name: keyof EmployeeRecord, value: any) => {
    dispatch(updateField({ field: name, value }));
  };

  const handleFind = () => {
    if (!searchId.trim()) {
      window.alert("Please specify Employee ID");
      return;
    }
    dispatch(fetchEmployee(searchId.trim()));
  };

  // Mirrors btnClose1_Click — closes immediately, no confirmation.
  const handleTopClose = () => {
    onClose?.();
  };

  // Mirrors btnClose_Click — confirms before closing.
  const handleBottomClose = () => {
    if (window.confirm("Are you sure to close the page?")) {
      onClose?.();
    }
  };

  // Mirrors btnNewentry_Click — blanks the form for a fresh entry.
  const handleNewEntry = () => {
    dispatch(startNewEntry());
    setSearchId("");
  };

  // Mirrors btnUpdate_Click's guard clauses, then saves.
  const handleUpdate = () => {
    if (!searchId.trim()) {
      window.alert("Please specify Employee ID");
      return;
    }
    if (!record?.IDNo) {
      window.alert("No record found to update");
      return;
    }
    dispatch(updateEmployee(record)).then((res: any) => {
      if (!res.error) window.alert("Record has been updated successfully");
    });
  };

  // Mirrors the dlgBank "..." dialog + AddBankName().
  const handleAddBank = () => {
    if (!newBankName.trim()) return;
    dispatch(addBank(newBankName.trim())).then((res: any) => {
      if (!res.error) {
        handleFieldChange("BankName", newBankName.trim());
        setNewBankName("");
        setShowBankDialog(false);
      }
    });
  };

  return (
    <div className="empPage">
      <div className="empContainer">
        <fieldset className="empSearchBox">
          <legend>Search</legend>
          <div className="empSearchRow">
            <label className="empSearchLabel">Employee ID</label>
            <input
              className="empInput empSearchInput"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFind()}
            />
            <button className="empBtn" onClick={handleFind} disabled={loading}>
              {loading ? "Finding..." : "Find"}
            </button>
            <button className="empBtn" onClick={handleTopClose}>
              Close
            </button>
          </div>
        </fieldset>

        <div className="empBody">
          <fieldset className="empDetailsBox">
            <legend>Employee&rsquo;s Details</legend>

            <div className="empGrid">
              {/* -------- Left column -------- */}
              <div className="empCol empColLeft">
                <Row label="College Name">
                  <input className="empInput empDisabled" value={field("CollegeName")} disabled />
                </Row>
                <Row label="Employee ID">
                  <input className="empInput empDisabled" value={field("IDNo")} disabled />
                </Row>
                <Row label="Employee Name">
                  <input
                    className="empInput"
                    value={field("Name")}
                    onChange={(e) => handleFieldChange("Name", e.target.value)}
                  />
                </Row>
                <Row label="Father Name">
                  <input
                    className="empInput"
                    value={field("FatherName")}
                    onChange={(e) => handleFieldChange("FatherName", e.target.value)}
                  />
                </Row>
                <Row label="Mother Name">
                  <input
                    className="empInput"
                    value={field("MotherName")}
                    onChange={(e) => handleFieldChange("MotherName", e.target.value)}
                  />
                </Row>
                <Row label="Permanent Address" align="top">
                  <textarea
                    className="empInput empTextarea"
                    value={field("PermanentAddress")}
                    onChange={(e) => handleFieldChange("PermanentAddress", e.target.value)}
                  />
                </Row>
                <Row label="Correspondance Address" align="top">
                  <textarea
                    className="empInput empTextarea"
                    value={field("CorrespondanceAddress")}
                    onChange={(e) => handleFieldChange("CorrespondanceAddress", e.target.value)}
                  />
                </Row>
                <Row label="Contact No.">
                  <input
                    className="empInput"
                    value={field("ContactNo")}
                    onChange={(e) => handleFieldChange("ContactNo", e.target.value)}
                  />
                </Row>
                <Row label="Mobile No">
                  <input
                    className="empInput"
                    value={field("MobileNo")}
                    onChange={(e) => handleFieldChange("MobileNo", e.target.value)}
                  />
                </Row>
                <Row label="Email ID">
                  <input
                    className="empInput"
                    value={field("EmailID")}
                    onChange={(e) => handleFieldChange("EmailID", e.target.value)}
                  />
                </Row>
              </div>

              {/* -------- Right column -------- */}
              <div className="empCol empColRight">
                <div className="empTopRight">
                  <div className="empTopRightFields">
                    <Row label="DOB" compact>
                      <input
                        type="date"
                        className="empInput"
                        value={dateValue("DateOfBirth")}
                        onChange={(e) => handleFieldChange("DateOfBirth", e.target.value)}
                      />
                    </Row>
                    <Row label="Sex" compact>
                      <div className="empRadioGroup">
                        <label className="empRadioLabel">
                          <input
                            type="radio"
                            name="gender"
                            checked={field("Gender") === "Male"}
                            onChange={() => handleFieldChange("Gender", "Male")}
                          />
                          Male
                        </label>
                        <label className="empRadioLabel">
                          <input
                            type="radio"
                            name="gender"
                            checked={field("Gender") === "Female"}
                            onChange={() => handleFieldChange("Gender", "Female")}
                          />
                          Female
                        </label>
                      </div>
                    </Row>
                    <Row label="Date of Joining" compact>
                      <input
                        type="date"
                        className="empInput"
                        value={dateValue("DateofJoining")}
                        onChange={(e) => handleFieldChange("DateofJoining", e.target.value)}
                      />
                    </Row>
                    <Row label="Date of Leaving" compact>
                      <input
                        type="date"
                        className="empInput"
                        value={dateValue("DateofLeaving")}
                        onChange={(e) => handleFieldChange("DateofLeaving", e.target.value)}
                      />
                    </Row>
                  </div>
                  <div className="empPhotoBox">
                    {field("Photo") ? (
                      <img src={field("Photo")} alt="Employee" className="empPhotoImg" />
                    ) : null}
                  </div>
                </div>

                <Row label="Department">
                  <input
                    className="empInput"
                    value={field("Department")}
                    onChange={(e) => handleFieldChange("Department", e.target.value)}
                  />
                </Row>
                <Row label="Designation">
                  <input
                    className="empInput"
                    value={field("Designation")}
                    onChange={(e) => handleFieldChange("Designation", e.target.value)}
                  />
                </Row>
                <Row label="Qualification">
                  <input
                    className="empInput"
                    value={field("Qualification")}
                    onChange={(e) => handleFieldChange("Qualification", e.target.value)}
                  />
                </Row>
                <Row label="Salary At Joining">
                  <input
                    className="empInput"
                    value={field("SalaryAtJoining")}
                    onChange={(e) => handleFieldChange("SalaryAtJoining", e.target.value)}
                  />
                </Row>
                <Row label="Salary At Present">
                  <input
                    className="empInput"
                    value={field("SalaryAtPresent")}
                    onChange={(e) => handleFieldChange("SalaryAtPresent", e.target.value)}
                  />
                </Row>
                <Row label="Previous Experience">
                  <input
                    className="empInput"
                    value={field("PreviousExperience")}
                    onChange={(e) => handleFieldChange("PreviousExperience", e.target.value)}
                  />
                </Row>
                <Row label="Bank">
                  <div className="empBankRow">
                    <select
                      className="empInput empSelect"
                      value={field("BankName")}
                      onChange={(e) => handleFieldChange("BankName", e.target.value)}
                    >
                      <option value=""></option>
                      {banks.map((b: string) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="empBtn empBankAddBtn"
                      title="Add a new bank"
                      onClick={() => setShowBankDialog(true)}
                    >
                      &hellip;
                    </button>
                  </div>
                </Row>
                <Row label="Bank Account No.">
                  <input
                    className="empInput"
                    value={field("BankAccountNo")}
                    onChange={(e) => handleFieldChange("BankAccountNo", e.target.value)}
                  />
                </Row>
                <Row label="PAN No.">
                  <input
                    className="empInput"
                    value={field("PANNo")}
                    onChange={(e) => handleFieldChange("PANNo", e.target.value)}
                  />
                </Row>
              </div>
            </div>
          </fieldset>

          <div className="empActions">
            <button className="empBtn empActionBtn" onClick={handleUpdate} disabled={saving}>
              {saving ? "Saving..." : "Update"}
            </button>
            <button className="empBtn empActionBtn" onClick={handleNewEntry}>
              New Entry
            </button>
            <button className="empBtn empActionBtn" onClick={handleBottomClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="empError" role="alert" onClick={() => dispatch(clearEmployeeError())}>
          {error}
        </div>
      ) : null}

      {showBankDialog ? (
        <div className="empModalOverlay" onClick={() => setShowBankDialog(false)}>
          <div className="empModal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Bank</h3>
            <input
              className="empInput"
              autoFocus
              placeholder="Bank name"
              value={newBankName}
              onChange={(e) => setNewBankName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddBank()}
            />
            <div className="empModalActions">
              <button className="empBtn" onClick={handleAddBank}>
                Save
              </button>
              <button className="empBtn" onClick={() => setShowBankDialog(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .empPage {
          padding: 16px;
          font-family: "Segoe UI", Arial, sans-serif;
          color: #1f2937;
          background: #f3f4f6;
          min-height: 100vh;
        }

        .empContainer {
          max-width: 1100px;
          margin: 0 auto;
        }

        /* ---- Search box ---- */
        .empSearchBox {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #fff;
          padding: 12px 16px;
          margin-bottom: 16px;
        }

        .empSearchBox :global(legend) {
          font-weight: 600;
          padding: 0 6px;
        }

        .empSearchRow {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .empSearchLabel {
          font-weight: 500;
        }

        .empSearchInput {
          width: 220px;
        }

        /* ---- Details box ---- */
        .empBody {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empDetailsBox {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #fff;
          padding: 16px 20px;
        }

        .empDetailsBox :global(legend) {
          font-weight: 600;
          padding: 0 6px;
        }

        .empGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 32px;
        }

        @media (max-width: 800px) {
          .empGrid {
            grid-template-columns: 1fr;
          }
        }

        .empCol {
          display: flex;
          flex-direction: column;
        }

        /* ---- Rows (rendered by the separate Row component, so :global) ---- */
        :global(.empRow) {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        :global(.empRowTop) {
          align-items: flex-start;
        }

        :global(.empRowCompact) {
          margin-bottom: 8px;
        }

        :global(.empLabel) {
          width: 170px;
          min-width: 170px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        :global(.empField) {
          flex: 1;
        }

        /* ---- Inputs ---- */
        :global(.empInput) {
          width: 100%;
          box-sizing: border-box;
          padding: 6px 8px;
          font-size: 13px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: #fff;
          color: #111827;
        }

        :global(.empInput:focus) {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
        }

        :global(.empDisabled) {
          background: #f3f4f6;
          color: #6b7280;
          cursor: not-allowed;
        }

        :global(.empTextarea) {
          min-height: 60px;
          resize: vertical;
        }

        :global(.empSelect) {
          cursor: pointer;
        }

        /* ---- Top-right (DOB/Sex/dates + photo) ---- */
        .empTopRight {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 4px;
        }

        .empTopRightFields {
          flex: 1;
        }

        .empPhotoBox {
          width: 110px;
          height: 130px;
          flex-shrink: 0;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .empPhotoImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ---- Radio group ---- */
        .empRadioGroup {
          display: flex;
          gap: 16px;
        }

        .empRadioLabel {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
        }

        /* ---- Bank row ---- */
        .empBankRow {
          display: flex;
          gap: 6px;
        }

        .empBankAddBtn {
          flex-shrink: 0;
          padding: 6px 10px;
        }

        /* ---- Buttons ---- */
        :global(.empBtn) {
          padding: 7px 16px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid #2563eb;
          border-radius: 4px;
          background: #2563eb;
          color: #fff;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        :global(.empBtn:hover) {
          background: #1d4ed8;
        }

        :global(.empBtn:disabled) {
          background: #93c5fd;
          border-color: #93c5fd;
          cursor: not-allowed;
        }

        .empActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }

        .empActionBtn {
          min-width: 100px;
        }

        /* ---- Error banner ---- */
        .empError {
          position: fixed;
          bottom: 16px;
          right: 16px;
          max-width: 360px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #991b1b;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* ---- Add Bank modal ---- */
        .empModalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }

        .empModal {
          background: #fff;
          border-radius: 6px;
          padding: 20px;
          width: 280px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .empModal :global(h3) {
          margin: 0 0 12px;
          font-size: 15px;
        }

        .empModalActions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 14px;
        }
      `}</style>
    </div>
  );
}

/* Small row helper to keep every label/input pair in the form consistent. */
function Row({
  label,
  children,
  align,
  compact,
}: {
  label: string;
  children: React.ReactNode;
  align?: "top";
  compact?: boolean;
}) {
  return (
    <div className={["empRow", align === "top" ? "empRowTop" : "", compact ? "empRowCompact" : ""].join(" ").trim()}>
      <label className="empLabel">{label}</label>
      <div className="empField">{children}</div>
    </div>
  );
}