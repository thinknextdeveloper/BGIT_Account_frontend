"use client";

import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import {
  fetchColleges,
  fetchCourses,
  fetchBatches,
  fetchSemesters,
  displayStudent,
  saveStudentImage,
  savePass,
  setSlotField,
  clearSaveStatus,
  SlotKey,
  LookupType,
  Facility,
} from "../../../store/slices/hostelBusPassSlice";

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
  okBg: "#e6f4ea",
  okText: "#1e5b1e",
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

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#6b7280",
  borderColor: "#4b5563",
};

const thStyle: React.CSSProperties = { padding: "4px 6px", textAlign: "left", border: "1px solid #ccc", color: COLORS.text };
const tdStyle: React.CSSProperties = { padding: "4px 6px", border: "1px solid #ccc" };

/* ------------------------------------------------------------------ */
/*  One "Student N" panel — its own webcam, its own slice slot         */
/* ------------------------------------------------------------------ */

function StudentPanel({ slotKey, label, lookupType }: { slotKey: SlotKey; label: string; lookupType: LookupType }) {
  const dispatch = useDispatch<AppDispatch>();
  const slot = useSelector((s: RootState) => s.hostelBusPass[slotKey]);

  const [idNo, setIdNo] = useState("");
  const [routeType, setRouteType] = useState<"Single Side" | "Double Side">("Double Side");
  const [isFree, setIsFree] = useState(false);
  const [validMode, setValidMode] = useState<"date" | "text">("date");
  const [validUpToInput, setValidUpToInput] = useState(new Date().toISOString().slice(0, 10));
  const [validForText, setValidForText] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const snapshotCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; curX?: number; curY?: number } | null>(null);
  const [camActive, setCamActive] = useState(false);
  const [hasSnapshot, setHasSnapshot] = useState(false);

  const student = slot.student;

  useEffect(() => () => stopCam(), []);

  useEffect(() => {
    if (slot.selectedSemester) setValidMode("date");
  }, [slot.selectedSemester]);

  function handleDisplay() {
    if (!idNo) return;
    dispatch(displayStudent({ slot: slotKey, type: lookupType, idNo }));
  }

  function setFacility(facility: Facility) {
    if (!student) return;
    dispatch(setSlotField({ slot: slotKey, field: "student", value: { ...student, Facility: facility } }));
  }

  function editField(field: string, value: string) {
    if (!student) return;
    dispatch(setSlotField({ slot: slotKey, field: "student", value: { ...student, [field]: value } }));
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
    if (!idNo) return;
    const preview = previewCanvasRef.current!;
    if (!preview.width || !preview.height) return;
    preview.toBlob((blob) => {
      if (blob) dispatch(saveStudentImage({ slot: slotKey, type: lookupType, idNo, blob }));
    }, "image/jpeg", 0.92);
  }

  function handleSave(force = false) {
    if (!student) return;
    dispatch(
      savePass({
        slot: slotKey,
        type: lookupType,
        idNo,
        studentName: student.StudentName,
        collegeName: student.CollegeName,
        course: student.Course,
        batch: student.Batch,
        semester: slot.selectedSemester,
        fatherName: student.FatherName,
        facility: student.Facility,
        routeType,
        isFree,
        validMode,
        validUpTo: validMode === "date" ? validUpToInput : undefined,
        validFor: validMode === "text" ? validForText : undefined,
        force,
      })
    );
  }

  return (
    <fieldset
      style={{
        flex: 1,
        border: `1px solid ${COLORS.panelBorder}`,
        borderRadius: 4,
        background: "#f7f9fc",
        padding: 12,
      }}
    >
      <legend style={{ fontWeight: 700, color: COLORS.label, padding: "0 6px" }}>{label}</legend>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
        <input
          value={idNo}
          onChange={(e) => setIdNo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleDisplay()}
          placeholder="Reg/ID No."
          style={{ ...inputStyle, width: 140 }}
        />
        <button onClick={handleDisplay} style={buttonStyle} disabled={slot.displayLoading}>
          {slot.displayLoading ? "Loading..." : "Display"}
        </button>
      </div>

      {slot.displayError && (
        <div
          style={{
            color: COLORS.error,
            background: COLORS.errorBg,
            border: "1px solid #f3b3ac",
            padding: "6px 10px",
            borderRadius: 3,
            marginBottom: 8,
          }}
        >
          {slot.displayError}
        </div>
      )}

      <div style={{ display: "flex", gap: 18, marginBottom: 10, flexWrap: "wrap" }}>
        <label style={{ color: COLORS.label }}>
          <input type="radio" checked={student?.Facility === "Bus"} onChange={() => setFacility("Bus")} /> Bus
        </label>
        <label style={{ color: COLORS.label }}>
          <input type="radio" checked={student?.Facility === "Hostel"} onChange={() => setFacility("Hostel")} /> Hostel
        </label>
        <label style={{ color: COLORS.label }}>
          <input type="radio" checked={student?.Facility === "None"} onChange={() => setFacility("None")} /> None
        </label>
        <label style={{ color: COLORS.muted, fontWeight: 400 }}>
          <input
            type="checkbox"
            checked={routeType === "Single Side"}
            onChange={(e) => setRouteType(e.target.checked ? "Single Side" : "Double Side")}
          />{" "}
          Single Side
        </label>
        <label style={{ color: COLORS.muted, fontWeight: 400 }}>
          <input
            type="checkbox"
            checked={isFree}
            disabled={!slot.freePassAvailable}
            onChange={(e) => setIsFree(e.target.checked)}
          />{" "}
          Free Pass
        </label>
      </div>

      <div style={{ display: "flex", gap: 24, background: "#fff", border: `1px solid ${COLORS.panelBorder}`, padding: 12, borderRadius: 4 }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>College</label> <input readOnly value={student?.CollegeName || ""} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Batch</label>{" "}
            <input value={String(student?.Batch || "")} onChange={(e) => editField("Batch", e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Name</label>{" "}
            <input value={student?.StudentName || ""} onChange={(e) => editField("StudentName", e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Father Name</label>{" "}
            <input value={student?.FatherName || ""} onChange={(e) => editField("FatherName", e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Course</label>{" "}
            <input value={student?.Course || ""} onChange={(e) => editField("Course", e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <label style={labelStyle}>Semester</label>
            <select
              value={slot.selectedSemester}
              onChange={(e) => dispatch(setSlotField({ slot: slotKey, field: "selectedSemester", value: e.target.value }))}
              style={inputStyle}
            >
              <option value="" />
              {slot.semesters.map((s) => (
                <option key={s.SemesterID} value={s.Semester}>
                  {s.Semester}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              background: "#fafafa",
              border: `1px solid ${COLORS.panelBorder}`,
              borderRadius: 4,
              padding: 8,
            }}
          >
            <label style={{ color: COLORS.label }}>
              <input type="radio" checked={validMode === "date"} onChange={() => setValidMode("date")} /> Valid for ( In Date )
            </label>
            <input
              type="date"
              value={validUpToInput}
              disabled={validMode !== "date"}
              onChange={(e) => setValidUpToInput(e.target.value)}
              style={inputStyle}
            />
            <label style={{ color: COLORS.label }}>
              <input type="radio" checked={validMode === "text"} onChange={() => setValidMode("text")} /> Valid for ( In Text )
            </label>
            <input
              type="text"
              value={validForText}
              disabled={validMode !== "text"}
              onChange={(e) => setValidForText(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {slot.blockedMessage && (
        <div style={{ background: COLORS.warnBg, color: COLORS.warnText, padding: 8, marginTop: 8, borderRadius: 3 }}>
          {slot.blockedMessage}
        </div>
      )}

      <div
        style={{
          background: COLORS.gridBg,
          padding: 6,
          margin: "10px 0",
          borderRadius: 3,
          minHeight: 90,
          maxHeight: 160,
          overflow: "auto",
        }}
      >
        {slot.feeRows.length > 0 && (
          <table style={{ width: "100%", background: "#fff", borderCollapse: "collapse", color: COLORS.text }}>
            <thead>
              <tr style={{ background: COLORS.gridHeaderBg }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Semester</th>
                <th style={thStyle}>Subhead</th>
                <th style={thStyle}>Fee Received</th>
              </tr>
            </thead>
            <tbody>
              {slot.feeRows.map((row, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{row.DateEntry?.slice?.(0, 10) ?? row.DateEntry}</td>
                  <td style={tdStyle}>{row.Semester}</td>
                  <td style={tdStyle}>{row.Subhead}</td>
                  <td style={tdStyle}>{row.FeeReceived}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {slot.duplicateConfirmPending && (
        <div style={{ background: COLORS.warnBg, color: COLORS.warnText, padding: 8, marginBottom: 8, borderRadius: 3 }}>
          {slot.saveError}{" "}
          <button onClick={() => handleSave(true)} style={buttonStyle}>
            Yes, add duplicate
          </button>{" "}
          <button onClick={() => dispatch(clearSaveStatus({ slot: slotKey }))} style={secondaryButtonStyle}>
            No
          </button>
        </div>
      )}
      {slot.saveMessage && (
        <div style={{ background: COLORS.okBg, color: COLORS.okText, padding: 8, marginBottom: 8, borderRadius: 3 }}>
          {slot.saveMessage}
        </div>
      )}
      {slot.saveError && !slot.duplicateConfirmPending && (
        <div style={{ color: COLORS.error, background: COLORS.errorBg, border: "1px solid #f3b3ac", padding: "6px 10px", borderRadius: 3, marginBottom: 8 }}>
          {slot.saveError}
        </div>
      )}
      {slot.saveImageError && (
        <div style={{ color: COLORS.error, background: COLORS.errorBg, border: "1px solid #f3b3ac", padding: "6px 10px", borderRadius: 3, marginBottom: 8 }}>
          {slot.saveImageError}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0" }}>
        <button onClick={startCam} disabled={camActive} style={buttonStyle}>
          Start Cam
        </button>
        <button onClick={captureFrame} disabled={!camActive} style={buttonStyle}>
          Capture
        </button>
        <button onClick={handleSaveImage} disabled={slot.savingImage} style={buttonStyle}>
          {slot.savingImage ? "Saving..." : "Save Photo"}
        </button>
        <button onClick={stopCam} disabled={!camActive} style={buttonStyle}>
          Close Cam
        </button>
        <button onClick={() => handleSave(false)} disabled={!student || !slot.canPrint || slot.saving} style={buttonStyle}>
          {slot.saving ? "Saving..." : "Save Pass"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: 160, height: 190, background: COLORS.camBg, border: `1px solid ${COLORS.camBorder}` }}
        />
        <canvas
          ref={snapshotCanvasRef}
          onMouseDown={onCropMouseDown}
          onMouseMove={onCropMouseMove}
          onMouseUp={onCropMouseUp}
          style={{ width: 160, height: 190, background: COLORS.camBg, border: `1px solid ${COLORS.camBorder}` }}
        />
        <canvas
          ref={previewCanvasRef}
          style={{ width: 160, height: 190, background: COLORS.camBg, border: `1px solid ${COLORS.camBorder}` }}
        />
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function HostelBusPassForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { colleges, courses, batches } = useSelector((s: RootState) => s.hostelBusPass);
console.log("--------",colleges,courses,batches)
  const [lookupType, setLookupType] = useState<LookupType>("IDNo");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");

  useEffect(() => {
    dispatch(fetchColleges());
  }, [dispatch]);

  useEffect(() => {
    if (college) dispatch(fetchCourses(college));
  }, [college, dispatch]);

  useEffect(() => {
    if (college) dispatch(fetchBatches({ collegeName: college, course }));
  }, [college, course, dispatch]);

  return (
    <div style={{ fontFamily: "Segoe UI, Tahoma, sans-serif", fontSize: 13, padding: 12, maxWidth: 1200, color: COLORS.text, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          background: COLORS.panelBg,
          border: `1px solid ${COLORS.panelBorder}`,
          padding: 10,
          borderRadius: 4,
          marginBottom: 12,
        }}
      >
        <label style={{ color: COLORS.label }}>
          <input type="radio" checked={lookupType === "Registration"} onChange={() => setLookupType("Registration")} /> Registration No.
        </label>
        <label style={{ color: COLORS.label }}>
          <input type="radio" checked={lookupType === "IDNo"} onChange={() => setLookupType("IDNo")} /> ID No.
        </label>

        <label style={labelStyle}>College Name</label>
        <select value={college} onChange={(e) => setCollege(e.target.value)} style={inputStyle}>
          <option value="" />
          {Array.isArray(colleges?.data) &&
  colleges?.data.map((c: string, index: number) => (
    <option key={index} value={c}>
      {c}
    </option>
  ))}
        </select>

        <label style={labelStyle}>Course</label>
        <select value={course} onChange={(e) => setCourse(e.target.value)} style={inputStyle}>
          <option value="" />
       {Array.isArray(courses?.data) &&
  courses.data.map((c: string, index: number) => (
    <option key={index} value={c}>
      {c}
    </option>
  ))}
        </select>

        <label style={labelStyle}>Batch</label>
        <select value={batch} onChange={(e) => setBatch(e.target.value)} style={inputStyle}>
          <option value="" />
         {Array.isArray(batches?.data) &&
  batches.data.map((b: string, index: number) => (
    <option key={index} value={b}>
      {b}
    </option>
  ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StudentPanel slotKey="slot1" label="Student 1" lookupType={lookupType} />
        <StudentPanel slotKey="slot2" label="Student 2" lookupType={lookupType} />
      </div>
    </div>
  );
}