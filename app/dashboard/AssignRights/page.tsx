"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import {
  fetchLoginTypes,
  findStaff,
  submitRights,
  moveSelectedToAssigned,
  moveAllToAssigned,
  removeSelectedFromAssigned,
  clearAssigned,
  setSelectedAvailableIds,
  setSelectedAssignedIds,
  resetForm,
  clearMessage,
} from "../../../store/slices/assignRightsSlice";

const API_BASE = "/api/assign-rights";

export default function AssignRights() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    loginTypes,
    staff,
    hasPassword,
    availableItems,
    assignedItems,
    selectedAvailableIds,
    selectedAssignedIds,
    loading,
    submitting,
    error,
    message,
  } = useSelector((s: RootState) => s.assignRights);

  const [idNo, setIdNo] = useState("");
  const [loginType, setLoginType] = useState("");

  useEffect(() => {
    dispatch(fetchLoginTypes());
  }, [dispatch]);

  const canEditLists = hasPassword && !!staff;

  const handleFind = () => {
    if (!idNo) return alert("Please specify ID No.");
    if (!/^\d{6}$/.test(idNo)) return alert("Please specify valid ID No.");
    if (!loginType) return alert("Please specify Login Type");
    dispatch(findStaff({ idNo, loginType }));
  };

  const handleSubmit = () => {
    if (assignedItems.length === 0) return alert("No Rights found to assigned.");
    dispatch(
      submitRights({
        idNo: staff?.IDNo || idNo,
        loginType,
        itemIds: assignedItems.map((i) => i.ID_ITEM),
      })
    );
  };

  const handleNewEntry = () => {
    setIdNo("");
    setLoginType("");
    dispatch(resetForm());
  };

  useEffect(() => {
    if (message || error) {
      alert(message || error);
      dispatch(clearMessage());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, error]);

  const optionsFromSelect = (e: React.ChangeEvent<HTMLSelectElement>) =>
    Array.from(e.target.selectedOptions).map((o) => Number(o.value));

  return (
    <div className="ar-root">
      <style>{`
        .ar-root, .ar-root * {
          box-sizing: border-box;
        }
        .ar-root {
          font-family: "Segoe UI", Arial, sans-serif;
          background: #dbe9f4;
          padding: 20px;
          color: #1a1a1a;
          min-height: 100vh;
        }
        .ar-top-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .ar-label {
          font-weight: 600;
          color: #1a1a1a;
          white-space: nowrap;
          font-size: 14px;
        }
        .ar-input, .ar-select {
          padding: 6px 8px;
          border: 1px solid #7ea3c2;
          border-radius: 3px;
          background: #fff;
          color: #1a1a1a;
          font-size: 14px;
        }
        .ar-input { width: 130px; }
        .ar-select { width: 170px; }
        .ar-btn {
          padding: 7px 18px;
          border: 1px solid #4a7fb5;
          border-radius: 3px;
          background: #eaf2fa;
          color: #1a1a1a;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .ar-btn:hover:not(:disabled) { background: #d6e8f7; }
        .ar-btn:disabled { color: #8a9aa8; cursor: not-allowed; }

        .ar-fieldset {
          border: 1px solid #4a7fb5;
          border-radius: 4px;
          padding: 14px 16px;
          margin-bottom: 24px;
          background: #f0f6fb;
          display: flex;
          justify-content: space-between;
          gap: 24px;
        }
        .ar-legend {
          font-weight: 700;
          color: #1a1a1a;
          padding: 0 6px;
        }
        .ar-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(260px, 1fr));
          gap: 10px 32px;
          flex: 1;
        }
        .ar-field-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ar-field-label {
          width: 110px;
          flex: 0 0 110px;
          font-weight: 600;
          font-size: 13px;
          color: #1a1a1a;
          white-space: nowrap;
        }
        .ar-field-input {
          flex: 1;
          min-width: 0;
          padding: 5px 8px;
          border: 1px solid #b9c9d6;
          border-radius: 3px;
          background: #fff;
          color: #1a1a1a;
          font-size: 13px;
        }
        .ar-photo-box {
          width: 90px;
          height: 90px;
          background: #c9c9c9;
          flex-shrink: 0;
          border: 1px solid #9aa9b5;
          overflow: hidden;
        }
        .ar-photo-box img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .ar-lists-row {
          display: flex;
          align-items: stretch;
          gap: 14px;
          flex-wrap: wrap;
        }
        .ar-listbox {
          width: 300px;
          height: 320px;
          background: #fff;
          color: #1a1a1a;
          border: 1px solid #7ea3c2;
          border-radius: 3px;
          font-size: 13px;
          padding: 4px;
        }
        .ar-listbox option { padding: 3px 4px; }
        .ar-listbox:disabled { background: #d9d9d9; color: #6b6b6b; }

        .ar-transfer-col {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 10px;
        }
        .ar-transfer-btn {
          width: 42px;
          height: 32px;
          border: 1px solid #4a7fb5;
          border-radius: 3px;
          background: #eaf2fa;
          color: #1a1a1a;
          font-weight: 700;
          cursor: pointer;
        }
        .ar-transfer-btn:hover:not(:disabled) { background: #d6e8f7; }
        .ar-transfer-btn:disabled { color: #a8b6c0; cursor: not-allowed; }

        .ar-action-col {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 14px;
          margin-left: 20px;
        }
        .ar-action-btn {
          padding: 10px 26px;
          border: 1px solid #4a7fb5;
          border-radius: 3px;
          background: #eaf2fa;
          color: #1a1a1a;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .ar-action-btn:hover:not(:disabled) { background: #d6e8f7; }
        .ar-action-btn:disabled { color: #a8b6c0; cursor: not-allowed; }
      `}</style>

      {/* Top bar */}
      <div className="ar-top-bar">
        <span className="ar-label">Enter ID No. :</span>
        <input
          className="ar-input"
          value={idNo}
          maxLength={6}
          onChange={(e) => setIdNo(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleFind()}
        />

        <span className="ar-label" style={{ marginLeft: 20 }}>
          Login Type :
        </span>
        <select
          className="ar-select"
          value={loginType}
          onChange={(e) => setLoginType(e.target.value)}
        >
          <option value="" />
          {loginTypes.map((lt) => (
            <option key={lt} value={lt}>
              {lt}
            </option>
          ))}
        </select>

        <button className="ar-btn" onClick={handleFind} disabled={loading}>
          {loading ? "Finding..." : "Find"}
        </button>
        <button className="ar-btn" onClick={() => window.history.back()}>
          Close
        </button>
      </div>

      {/* Personal Detail panel */}
      <fieldset className="ar-fieldset">
        <legend className="ar-legend">Personal Detail</legend>
        <div className="ar-detail-grid">
          <Field label="College Name :" value={staff?.CollegeName} />
          <Field label="ID No. :" value={staff?.IDNo} />
          <Field label="Name :" value={staff?.Name} />
          <Field label="Father Name :" value={staff?.FatherName} />
          <Field label="Department :" value={staff?.Department} />
          <Field label="Designation :" value={staff?.Designation} />
        </div>
        <div className="ar-photo-box">
          {staff?.HasSnap ? (
            <img src={`${API_BASE}/photo/${staff.IDNo}`} alt="staff" />
          ) : null}
        </div>
      </fieldset>

      {/* Dual list picker */}
      <div className="ar-lists-row">
        <select
          multiple
          className="ar-listbox"
          disabled={!canEditLists}
          value={selectedAvailableIds.map(String)}
          onChange={(e) => dispatch(setSelectedAvailableIds(optionsFromSelect(e)))}
        >
          {availableItems.map((item) => (
            <option key={item.ID_ITEM} value={item.ID_ITEM}>
              {item.ID_ITEM} - {item.TEXT}
            </option>
          ))}
        </select>

        <div className="ar-transfer-col">
          <button
            className="ar-transfer-btn"
            disabled={!canEditLists}
            onClick={() => dispatch(moveSelectedToAssigned())}
          >
            {">"}
          </button>
          <button
            className="ar-transfer-btn"
            disabled={!canEditLists}
            onClick={() => dispatch(moveAllToAssigned())}
          >
            {">>"}
          </button>
          <button
            className="ar-transfer-btn"
            disabled={!canEditLists}
            onClick={() => dispatch(removeSelectedFromAssigned())}
          >
            {"<"}
          </button>
          <button
            className="ar-transfer-btn"
            disabled={!canEditLists}
            onClick={() => dispatch(clearAssigned())}
          >
            {"<<"}
          </button>
        </div>

        <select
          multiple
          className="ar-listbox"
          disabled={!canEditLists}
          value={selectedAssignedIds.map(String)}
          onChange={(e) => dispatch(setSelectedAssignedIds(optionsFromSelect(e)))}
        >
          {assignedItems.map((item) => (
            <option key={item.ID_ITEM} value={item.ID_ITEM}>
              {item.ID_ITEM} - {item.TEXT}
            </option>
          ))}
        </select>

        <div className="ar-action-col">
          <button
            className="ar-action-btn"
            disabled={!canEditLists || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
          <button className="ar-action-btn" onClick={handleNewEntry}>
            New Entry
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="ar-field-row">
      <span className="ar-field-label">{label}</span>
      <input className="ar-field-input" value={value || ""} readOnly />
    </div>
  );
}