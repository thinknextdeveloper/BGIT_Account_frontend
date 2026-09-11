"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import { submitPasswordChange, clearMessage } from "../../../store/slices/changePasswordSlice";

export default function ChangePassword() {
  const dispatch = useDispatch<AppDispatch>();
  const { submitting, error, message } = useSelector((s: RootState) => s.changePassword);

  // TEMP: swap this for wherever your header actually gets "711177" from
  // (e.g. useSelector((s: RootState) => s.auth.userId))
  const userId = "711177";

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    if (!oldPassword) return alert("Please specify Old Password");
    if (!newPassword) return alert("Please specify New Password");
    if (!confirmPassword) return alert("Please specify Confirm Password");
    if (newPassword !== confirmPassword)
      return alert("'New Password' and 'Confirm New Password' does not match.");

    dispatch(submitPasswordChange({ oldPassword, newPassword, confirmPassword })).then(
      (res: any) => {
        if (res.meta.requestStatus === "fulfilled") {
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      }
    );
  };

  useEffect(() => {
    if (message || error) {
      alert(message || error);
      dispatch(clearMessage());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, error]);

  return (
    <div className="cp-root">
      <style>{`
        .cp-root, .cp-root * { box-sizing: border-box; }
        .cp-root {
          font-family: "Segoe UI", Arial, sans-serif;
          padding: 40px;
          color: #1a1a1a;
        }
        .cp-fieldset {
          width: 610px;
          border: 1px solid #d0d7de;
          border-radius: 4px;
          padding: 24px 28px 28px;
          background: #fff;
        }
        .cp-legend { font-weight: 700; color: #1a1a1a; padding: 0 6px; }
        .cp-row { display: flex; align-items: center; gap: 20px; margin-bottom: 18px; }
        .cp-label { width: 160px; flex: 0 0 160px; font-weight: 700; font-size: 13px; }
        .cp-input {
          width: 200px; padding: 6px 8px;
          border: 1px solid #7ea3c2; border-radius: 3px;
          background: #fff; color: #1a1a1a; font-size: 13px;
        }
        .cp-input:read-only { background: #eef3f7; color: #4a4a4a; }
        .cp-btn-row { display: flex; gap: 10px; margin-top: 6px; }
        .cp-btn {
          padding: 7px 20px;
          border: 1px solid #8a8a8a;
          border-radius: 3px;
          background: #e8e8e8;
          color: #1a1a1a;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .cp-btn:hover:not(:disabled) { background: #dcdcdc; }
        .cp-btn:disabled { color: #a0a0a0; cursor: not-allowed; }
      `}</style>

      <fieldset className="cp-fieldset">
        <legend className="cp-legend">Change Password</legend>

        <div className="cp-row">
          <span className="cp-label">User ID :</span>
          <input className="cp-input" value={userId} readOnly />
        </div>

        <div className="cp-row">
          <span className="cp-label">Old Password :</span>
          <input
            className="cp-input"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        <div className="cp-row">
          <span className="cp-label">New Password :</span>
          <input
            className="cp-input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="cp-row">
          <span className="cp-label">Confirm New Password :</span>
          <input
            className="cp-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="cp-btn-row">
          <button className="cp-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
          <button className="cp-btn" onClick={() => window.history.back()}>
            Close
          </button>
        </div>
      </fieldset>
    </div>
  );
}