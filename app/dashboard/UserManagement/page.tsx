"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import {
  fetchLoginTypes,
  findStaff,
  generatePassword,
  toggleSelectAllColleges,
  toggleCollege,
  resetForm,
  clearMessage,
} from "../../../store/slices/userManagementSlice";

const API_BASE = "/api/user-management";

export default function UserManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    loginTypes,
    staff,
    colleges,
    selectedColleges,
    selectAll,
    userRecords,
    totalRecords,
    sectionsVisible,
    loading,
    generating,
    error,
    message,
  } = useSelector((s: RootState) => s.userManagement);

  const [idNo, setIdNo] = useState("");
  const [loginType, setLoginType] = useState("");

  useEffect(() => {
    dispatch(fetchLoginTypes());
  }, [dispatch]);

  const handleFind = () => {
    if (!idNo) return alert("Please specify ID No.");
    if (!/^\d{6}$/.test(idNo)) return alert("Please specify valid ID No.");
    if (!loginType) return alert("Please specify Login Type");
    dispatch(findStaff({ idNo, loginType }));
  };

  const handleGenerate = () => {
    if (selectedColleges.length === 0) return alert("Please specify College Name");
    dispatch(
      generatePassword({
        idNo: staff?.IDNo || idNo,
        loginType,
        colleges: selectedColleges,
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

  return (
    <div className="um-root">
      <style>{`
        .um-root, .um-root * { box-sizing: border-box; }
        .um-root {
          font-family: "Segoe UI", Arial, sans-serif;
          background: linear-gradient(#bcd7ea, #eaf3fa);
          padding: 20px;
          color: #1a1a1a;
          min-height: 100vh;
        }
        .um-top-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .um-label { font-weight: 600; color: #1a1a1a; white-space: nowrap; font-size: 14px; }
        .um-input, .um-select {
          padding: 6px 8px;
          border: 1px solid #7ea3c2;
          border-radius: 3px;
          background: #fff;
          color: #1a1a1a;
          font-size: 14px;
        }
        .um-input { width: 130px; }
        .um-select { width: 170px; }
        .um-btn {
          padding: 7px 18px;
          border: 1px solid #4a7fb5;
          border-radius: 3px;
          background: #eaf2fa;
          color: #1a1a1a;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .um-btn:hover:not(:disabled) { background: #d6e8f7; }
        .um-btn:disabled { color: #8a9aa8; cursor: not-allowed; }

        .um-fieldset {
          border: 1px solid #4a7fb5;
          border-radius: 4px;
          padding: 14px 16px;
          margin-bottom: 20px;
          background: #f0f6fb;
          display: flex;
          justify-content: space-between;
          gap: 24px;
        }
        .um-legend { font-weight: 700; color: #1a1a1a; padding: 0 6px; }
        .um-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(260px, 1fr));
          gap: 10px 32px;
          flex: 1;
        }
        .um-field-row { display: flex; align-items: center; gap: 8px; }
        .um-field-label { width: 110px; flex: 0 0 110px; font-weight: 600; font-size: 13px; white-space: nowrap; }
        .um-field-input {
          flex: 1; min-width: 0; padding: 5px 8px;
          border: 1px solid #b9c9d6; border-radius: 3px;
          background: #fff; color: #1a1a1a; font-size: 13px;
        }
        .um-photo-box {
          width: 90px; height: 90px; background: #ececec;
          flex-shrink: 0; border: 1px solid #9aa9b5; overflow: hidden;
        }
        .um-photo-box img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .um-sections { display: flex; gap: 20px; flex-wrap: wrap; }

        .um-groupbox {
          border: 1px solid #4a7fb5;
          border-radius: 4px;
          background: #f0f6fb;
          padding: 14px 16px;
        }
        .um-groupbox-college { flex: 0 0 300px; }
        .um-groupbox-records { flex: 1; min-width: 400px; }

        .um-selectall-row {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 8px; font-weight: 600; font-size: 13px;
        }
        .um-college-list {
          background: #fff; border: 1px solid #b9c9d6; border-radius: 3px;
          height: 260px; overflow-y: auto; padding: 6px;
        }
        .um-college-item {
          display: flex; align-items: center; gap: 8px;
          padding: 3px 4px; font-size: 13px;
        }
        .um-generate-btn {
          margin-top: 12px; width: 100%; padding: 9px;
          border: 1px solid #4a7fb5; border-radius: 3px;
          background: #eaf2fa; color: #1a1a1a; font-weight: 700; cursor: pointer;
        }
        .um-generate-btn:hover:not(:disabled) { background: #d6e8f7; }
        .um-generate-btn:disabled { color: #a8b6c0; cursor: not-allowed; }

        .um-records-label { font-weight: 600; font-size: 13px; margin-bottom: 8px; }
        .um-table-wrap { max-height: 300px; overflow: auto; border: 1px solid #b9c9d6; border-radius: 3px; background: #fff; }
        .um-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .um-table th, .um-table td {
          border-bottom: 1px solid #e0e6eb; padding: 6px 10px; text-align: left; white-space: nowrap;
        }
        .um-table th { background: #dceaf5; position: sticky; top: 0; }
        .um-empty-row td { text-align: center; color: #7a8794; padding: 16px; }
      `}</style>

      {/* Top bar */}
      <div className="um-top-bar">
        <span className="um-label">Enter ID No. :</span>
        <input
          className="um-input"
          value={idNo}
          maxLength={6}
          onChange={(e) => setIdNo(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleFind()}
        />

        <span className="um-label" style={{ marginLeft: 20 }}>
          Login Type :
        </span>
        <select className="um-select" value={loginType} onChange={(e) => setLoginType(e.target.value)}>
          <option value="" />
          {loginTypes.map((lt) => (
            <option key={lt} value={lt}>
              {lt}
            </option>
          ))}
        </select>

        <button className="um-btn" onClick={handleFind} disabled={loading}>
          {loading ? "Finding..." : "Find"}
        </button>
        <button className="um-btn" onClick={handleNewEntry}>
          New Entry
        </button>
        <button className="um-btn" onClick={() => window.history.back()}>
          Close
        </button>
      </div>

      {/* Personal Detail */}
      <fieldset className="um-fieldset">
        <legend className="um-legend">Personal Detail</legend>
        <div className="um-detail-grid">
          <Field label="College Name :" value={staff?.CollegeName} />
          <Field label="ID No. :" value={staff?.IDNo} />
          <Field label="Name :" value={staff?.Name} />
          <Field label="Father Name :" value={staff?.FatherName} />
          <Field label="Department :" value={staff?.Department} />
          <Field label="Designation :" value={staff?.Designation} />
        </div>
        <div className="um-photo-box">
          {staff?.HasSnap ? <img src={`${API_BASE}/photo/${staff.IDNo}`} alt="staff" /> : null}
        </div>
      </fieldset>

      {/* College checklist + records grid — mirrors GroupBox2 / GroupBox3 */}
      {sectionsVisible && (
        <div className="um-sections">
          <div className="um-groupbox um-groupbox-college">
            <div className="um-selectall-row">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => dispatch(toggleSelectAllColleges(e.target.checked))}
              />
              Select All Colleges
            </div>
            <div className="um-college-list">
              {colleges.map((college) => (
                <label key={college} className="um-college-item">
                  <input
                    type="checkbox"
                    checked={selectedColleges.includes(college)}
                    onChange={() => dispatch(toggleCollege(college))}
                  />
                  {college}
                </label>
              ))}
            </div>
            <button className="um-generate-btn" disabled={generating} onClick={handleGenerate}>
              {generating ? "Generating..." : "Generate Password"}
            </button>
          </div>

          <div className="um-groupbox um-groupbox-records">
            <div className="um-records-label">Total Records : {totalRecords}</div>
            <div className="um-table-wrap">
              <table className="um-table">
                <thead>
                  <tr>
                    <th>UserName</th>
                    <th>Password</th>
                    <th>LoginType</th>
                    <th>ApplicationType</th>
                    <th>ApplicationName</th>
                    <th>CollegeName</th>
                  </tr>
                </thead>
                <tbody>
                  {userRecords.length === 0 ? (
                    <tr className="um-empty-row">
                      <td colSpan={6}>No records</td>
                    </tr>
                  ) : (
                    userRecords.map((r, i) => (
                      <tr key={i}>
                        <td>{r.UserName}</td>
                        <td>{r.Password}</td>
                        <td>{r.LoginType}</td>
                        <td>{r.ApplicationType}</td>
                        <td>{r.ApplicationName}</td>
                        <td>{r.CollegeName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="um-field-row">
      <span className="um-field-label">{label}</span>
      <input className="um-field-input" value={value || ""} readOnly />
    </div>
  );
}