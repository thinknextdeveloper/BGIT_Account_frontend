"use client";

import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store"; 
import {
  displayIdCard,
  getValidUpTo,
  updateCardIssued,
  saveIdCardImage,
  getPrintPayload,
  resetIdCardForm,
  clearUpdateCardStatus,
  Facility,
  LookupType,
} from "../../../store/slices/idCardSlice";

const today = () => new Date().toISOString().slice(0, 10);


const COLORS = {
  text: "#111827",
  label: "#1f2937",
  muted: "#4b5563",
  border: "#9ca3af",
  panelBg: "#eef3fb",
  panelBorder: "#b9c8e0",
  inputBg: "#ffffff",
  gridBg: "#b3b3b3",
  gridHeaderBg: "#e5e7eb",
  camBg: "#dbe7f5",
  camBorder: "#9fb4cf",
  btnBg: "#3a63a3",
  btnBorder: "#2c4d80",
  btnText: "#ffffff",
  error: "#9c2a20",
  errorBg: "#fdecea",
  warnBg: "#fff3cd",
  warnText: "#7a5b00",
};

const inputStyle: React.CSSProperties = {
  color: COLORS.text,
  background: COLORS.inputBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 3,
  padding: "4px 6px",
};

const labelStyle: React.CSSProperties = {
  color: COLORS.label,
  fontWeight: 600,
  width: 90,
  display: "inline-block",
};

const buttonStyle: React.CSSProperties = {
  color: COLORS.btnText,
  background: COLORS.btnBg,
  border: `1px solid ${COLORS.btnBorder}`,
  borderRadius: 3,
  padding: "6px 12px",
  fontWeight: 600,
  cursor: "pointer",
};

export default function IdCardWebcam() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    student,
    semesters,
    ledgerRows,
    displayError,
    validUpTo,
    updatingCard,
    updateCardError,
    updateCardConflict,
    savingImage,
    printError,
  } = useSelector((s: RootState) => s.idCard); 

  const [lookupType, setLookupType] = useState<LookupType>("IDNo");
  const [idNo, setIdNo] = useState("");
  const [facility, setFacility] = useState<Facility>("None");
  const [semester, setSemester] = useState("");
  const [validMode, setValidMode] = useState<"date" | "text">("date");
  const [validUpToInput, setValidUpToInput] = useState(today());
  const [validForText, setValidForText] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const snapshotCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; curX?: number; curY?: number } | null>(null);
  const [camActive, setCamActive] = useState(false);
  const [hasSnapshot, setHasSnapshot] = useState(false);

  useEffect(() => {
    if (student) {
      setFacility(student.Facility || "None");
      if (student.ValidUpTo) setValidUpToInput(student.ValidUpTo.slice(0, 10));
      if (student.ValidFor) setValidForText(student.ValidFor);
    }
  }, [student]);

  useEffect(() => {
    if (semesters.length) setSemester(semesters[0].Semester);
  }, [semesters]);

  useEffect(() => {
    if (!semester || !student?.CollegeName || !student?.Batch || facility === "None") return;
    dispatch(
      getValidUpTo({ college: student.CollegeName, batch: String(student.Batch), semester, facility })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semester]);

  useEffect(() => {
    if (validUpTo) setValidUpToInput(validUpTo.slice(0, 10));
  }, [validUpTo]);

  useEffect(() => () => stopCam(), []);

  function handleDisplay() {
    if (!idNo) return;
    dispatch(displayIdCard({ type: lookupType, idNo }));
  }

  async function startCam() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
    setCamActive(true);
  }

  function stopCam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamActive(false);
  }

  function captureFrame() {
    if (!idNo) return;
    const video = videoRef.current;
    const canvas = snapshotCanvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
    setHasSnapshot(true);
  }

  function onCropMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!hasSnapshot) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    dragRef.current = { startX: e.clientX - rect.left, startY: e.clientY - rect.top };
  }

  function onCropMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!dragRef.current) return;
    const canvas = snapshotCanvasRef.current!;
    const video = videoRef.current!;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    const { startX, startY } = dragRef.current;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.strokeStyle = "yellow";
    ctx.setLineDash([4, 2]);
    ctx.strokeRect(startX, startY, curX - startX, curY - startY);
    ctx.restore();

    dragRef.current.curX = curX;
    dragRef.current.curY = curY;
  }

  function onCropMouseUp() {
    if (!dragRef.current || dragRef.current.curX === undefined) return;
    const { startX, startY, curX, curY } = dragRef.current as Required<typeof dragRef.current>;
    dragRef.current = null;

    const width = Math.abs(curX - startX);
    const height = Math.abs(curY - startY);
    if (width < 1 || height < 1) return;

    const snapshot = snapshotCanvasRef.current!;
    const preview = previewCanvasRef.current!;
    preview.width = width;
    preview.height = height;
    preview
      .getContext("2d")!
      .drawImage(snapshot, Math.min(startX, curX), Math.min(startY, curY), width, height, 0, 0, width, height);
  }

  function handleSaveImage() {
    const preview = previewCanvasRef.current!;
    if (!preview.width || !preview.height) return;
    preview.toBlob((blob) => {
      if (blob) dispatch(saveIdCardImage({ type: lookupType, idNo, blob }));
    }, "image/jpeg", 0.92);
  }

  async function handleUpdateCard(force = false) {
    await dispatch(
      updateCardIssued({
        type: lookupType,
        idNo,
        mode: validMode,
        validUpTo: validMode === "date" ? validUpToInput : undefined,
        validFor: validMode === "text" ? validForText : undefined,
        force,
      })
    );
  }

  async function handlePrint(verify: boolean) {
    if (facility === "None") return;
    if (verify) await handleUpdateCard(false);
    const result: any = await dispatch(getPrintPayload({ type: lookupType, idNo, facility }));
    if (result.meta.requestStatus === "fulfilled") openPrintWindow(result.payload);
  }

  function openPrintWindow(payload: any) {
    const w = window.open("", "_blank", "width=420,height=650");
    if (!w) return;
    w.document.write(`
      <html><head><title>${payload.header}</title></head>
      <body style="font-family:sans-serif;padding:16px;color:#111;">
        <h2 style="text-align:center;">${payload.header}</h2>
        ${payload.photoBase64 ? `<img src="data:image/jpeg;base64,${payload.photoBase64}" style="width:120px;display:block;margin:0 auto 12px;" />` : ""}
        <p><b>${payload.student.name}</b></p>
        <p>S/o ${payload.student.fatherName}</p>
        <p>${payload.student.college}</p>
        <p>${payload.student.course} — Batch ${payload.student.batch}</p>
        <p>${payload.label} ${payload.student.routeOrHostel || "-"}</p>
        <p>Contact: ${payload.student.contactNo || "-"}</p>
        <script>window.onload = () => window.print();</script>
      </body></html>
    `);
  }

  function handleReset() {
    stopCam();
    setIdNo("");
    setFacility("None");
    setHasSnapshot(false);
    dispatch(resetIdCardForm());
  }

  return (
    <div style={{ fontFamily: "Segoe UI, Tahoma, sans-serif", fontSize: 13, padding: 12, maxWidth: 1100, color: COLORS.text }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", background: COLORS.panelBg, border: `1px solid ${COLORS.panelBorder}`, padding: 10, borderRadius: 4 }}>
        <label style={{ color: COLORS.label }}>
          <input type="radio" checked={lookupType === "Registration"} onChange={() => setLookupType("Registration")} /> Registration No.
        </label>
        <label style={{ color: COLORS.label }}>
          <input type="radio" checked={lookupType === "IDNo"} onChange={() => setLookupType("IDNo")} /> ID No.
        </label>
        <input
          value={idNo}
          onChange={(e) => setIdNo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleDisplay()}
          style={{ ...inputStyle, width: 160 }}
        />
        <button onClick={handleDisplay} style={buttonStyle}>Display</button>
      </div>

      {displayError && (
        <div style={{ color: COLORS.error, background: COLORS.errorBg, border: "1px solid #f3b3ac", padding: "6px 10px", borderRadius: 3, margin: "8px 0" }}>
          {displayError}
        </div>
      )}

      <div style={{ display: "flex", gap: 24, margin: "10px 0" }}>
        <label style={{ color: COLORS.label }}><input type="radio" checked={facility === "Bus"} onChange={() => setFacility("Bus")} /> Bus</label>
        <label style={{ color: COLORS.label }}><input type="radio" checked={facility === "Hostel"} onChange={() => setFacility("Hostel")} /> Hostel</label>
        <label style={{ color: COLORS.label }}><input type="radio" checked={facility === "None"} onChange={() => setFacility("None")} /> None</label>
      </div>

      <div style={{ display: "flex", gap: 24, background: "#f7f9fc", border: `1px solid ${COLORS.panelBorder}`, padding: 12, borderRadius: 4 }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}><label style={labelStyle}>College</label> <input readOnly value={student?.CollegeName || ""} style={inputStyle} /></div>
          <div style={{ marginBottom: 8 }}><label style={labelStyle}>Batch</label> <input readOnly value={student?.Batch || ""} style={inputStyle} /></div>
          <div style={{ marginBottom: 8 }}><label style={labelStyle}>Name</label> <input readOnly value={student?.StudentName || ""} style={inputStyle} /></div>
          <div style={{ marginBottom: 8 }}><label style={labelStyle}>Father Name</label> <input readOnly value={student?.FatherName || ""} style={inputStyle} /></div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}><label style={labelStyle}>Course</label> <input readOnly value={student?.Course || ""} style={inputStyle} /></div>
          <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <label style={labelStyle}>Semester</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} style={inputStyle}>
              {semesters.map((s) => <option key={s.SemesterID} value={s.Semester}>{s.Semester}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4, padding: 8 }}>
            <label style={{ color: COLORS.label }}>
              <input type="radio" checked={validMode === "date"} onChange={() => setValidMode("date")} /> Valid for ( In Date )
            </label>
            <input type="date" value={validUpToInput} disabled={validMode !== "date"} onChange={(e) => setValidUpToInput(e.target.value)} style={inputStyle} />
            <label style={{ color: COLORS.label }}>
              <input type="radio" checked={validMode === "text"} onChange={() => setValidMode("text")} /> Valid for ( In Text )
            </label>
            <input type="text" value={validForText} disabled={validMode !== "text"} onChange={(e) => setValidForText(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ background: COLORS.gridBg, padding: 6, margin: "12px 0", borderRadius: 3, minHeight: 120, maxHeight: 220, overflow: "auto" }}>
        <table style={{ width: "100%", background: "#fff", borderCollapse: "collapse", color: COLORS.text }}>
          <thead>
            <tr style={{ background: COLORS.gridHeaderBg }}>
              <th style={{ padding: "4px 6px", textAlign: "left", border: "1px solid #ccc", color: COLORS.text }}>Date</th>
              <th style={{ padding: "4px 6px", textAlign: "left", border: "1px solid #ccc", color: COLORS.text }}>Semester</th>
              <th style={{ padding: "4px 6px", textAlign: "left", border: "1px solid #ccc", color: COLORS.text }}>Ledger</th>
              <th style={{ padding: "4px 6px", textAlign: "left", border: "1px solid #ccc", color: COLORS.text }}>Particulars</th>
              <th style={{ padding: "4px 6px", textAlign: "left", border: "1px solid #ccc", color: COLORS.text }}>Debit</th>
              <th style={{ padding: "4px 6px", textAlign: "left", border: "1px solid #ccc", color: COLORS.text }}>Credit</th>
            </tr>
          </thead>
          <tbody>
            {ledgerRows.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: "4px 6px", border: "1px solid #ccc" }}>{row.DateEntry?.slice(0, 10)}</td>
                <td style={{ padding: "4px 6px", border: "1px solid #ccc" }}>{row.Semester}</td>
                <td style={{ padding: "4px 6px", border: "1px solid #ccc" }}>{row.LedgerName}</td>
                <td style={{ padding: "4px 6px", border: "1px solid #ccc" }}>{row.Particulars}</td>
                <td style={{ padding: "4px 6px", border: "1px solid #ccc" }}>{row.Debit}</td>
                <td style={{ padding: "4px 6px", border: "1px solid #ccc" }}>{row.Credit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {updateCardConflict && (
        <div style={{ background: COLORS.warnBg, color: COLORS.warnText, padding: 8, marginBottom: 8, borderRadius: 3 }}>
          {updateCardError}{" "}
          <button onClick={() => { dispatch(clearUpdateCardStatus()); handleUpdateCard(true); }} style={buttonStyle}>Yes, reissue</button>{" "}
          <button onClick={() => dispatch(clearUpdateCardStatus())} style={{ ...buttonStyle, background: "#6b7280", borderColor: "#4b5563" }}>No</button>
        </div>
      )}
      {printError && (
        <div style={{ color: COLORS.error, background: COLORS.errorBg, border: "1px solid #f3b3ac", padding: "6px 10px", borderRadius: 3, marginBottom: 8 }}>
          {printError}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0" }}>
        <button onClick={startCam} disabled={camActive} style={buttonStyle}>Start Cam</button>
        <button onClick={captureFrame} disabled={!camActive} style={buttonStyle}>Save Image</button>
        <button onClick={handleSaveImage} disabled={savingImage} style={buttonStyle}>Preview</button>
        <button onClick={stopCam} disabled={!camActive} style={buttonStyle}>Close Cam</button>
        <button style={buttonStyle}>Format Cam</button>
        <button onClick={handleReset} style={buttonStyle}>Reset</button>
        <button onClick={() => handlePrint(true)} disabled={updatingCard} style={buttonStyle}>Print</button>
        <button style={buttonStyle}>Close</button>
        <button onClick={() => handlePrint(false)} style={buttonStyle}>Print Without Verification</button>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <video ref={videoRef} muted playsInline style={{ width: 260, height: 300, background: COLORS.camBg, border: `1px solid ${COLORS.camBorder}` }} />
        <canvas ref={snapshotCanvasRef} onMouseDown={onCropMouseDown} onMouseMove={onCropMouseMove} onMouseUp={onCropMouseUp} style={{ width: 260, height: 300, background: COLORS.camBg, border: `1px solid ${COLORS.camBorder}` }} />
        <canvas ref={previewCanvasRef} style={{ width: 260, height: 300, background: COLORS.camBg, border: `1px solid ${COLORS.camBorder}` }} />
      </div>
    </div>
  );
}
