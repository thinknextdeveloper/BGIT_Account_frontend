"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store"; // adjust to your store's path
import {
  fetchColleges,
  fetchBatches,
  fetchHostelCharges,
  createHostelCharge,
  updateHostelCharge,
  deleteHostelCharge,
  setSelectedCollege,
  setSelectedBatch,
  clearMessage,
  emptyDraft,
  rowKey,
  HostelCharge,
  HostelChargeDraft,
  HostelChargeKey,
} from "../../../store/slices/Hostelchargesslice";

interface Props {
  onClose?: () => void;
}

const draftFromRow = (row: HostelCharge): HostelChargeDraft => ({
  collegeName: row.collegeName,
  batch: row.batch,
  hostelName: row.hostelName,
  roomType: row.roomType || "",
  hostelFee: String(row.hostelFee),
  totalSeats: String(row.totalSeats),
  hostelSecurity: row.hostelSecurity || "",
});

const keyFromRow = (row: HostelCharge): HostelChargeKey => ({
  collegeName: row.collegeName,
  batch: row.batch,
  hostelName: row.hostelName,
  roomType: row.roomType,
});

export default function MasterHostelCharges({ onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    colleges,
    batches,
    selectedCollege,
    selectedBatch,
    rows,
    totalRecords,
    loading,
    submitting,
    error,
    message,
  } = useSelector((state: RootState) => state.hostelCharges);

  // editingKey is a snapshot of the row's pre-edit natural key — the table has
  // no surrogate id, so this is what identifies the row to the API on save.
  const [editingKey, setEditingKey] = useState<HostelChargeKey | null>(null);
  const [editDraft, setEditDraft] = useState<HostelChargeDraft>(emptyDraft);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addDraft, setAddDraft] = useState<HostelChargeDraft>(emptyDraft);

  useEffect(() => {
    dispatch(fetchColleges());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCollege) dispatch(fetchBatches(selectedCollege));
  }, [dispatch, selectedCollege]);

  const handleDisplay = () => {
    if (!selectedCollege) {
      window.alert("Please specify College Name");
      return;
    }
    dispatch(fetchHostelCharges({ collegeName: selectedCollege, batch: selectedBatch }));
  };

  const startEdit = (row: HostelCharge) => {
    setEditingKey(keyFromRow(row));
    setEditDraft(draftFromRow(row));
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditDraft(emptyDraft);
  };

  const saveEdit = async () => {
    if (!editingKey) return;
    const result = await dispatch(updateHostelCharge({ original: editingKey, draft: editDraft }));
    if (updateHostelCharge.fulfilled.match(result)) {
      setEditingKey(null);
    }
  };

  const handleDeleteRow = async (row: HostelCharge) => {
    const ok = window.confirm(
      `Delete ${row.hostelName} (${row.collegeName}, Batch ${row.batch})?`
    );
    if (!ok) return;
    await dispatch(deleteHostelCharge(keyFromRow(row)));
  };

  const handleAddSubmit = async () => {
    const result = await dispatch(createHostelCharge(addDraft));
    if (createHostelCharge.fulfilled.match(result)) {
      setShowAddModal(false);
      setAddDraft(emptyDraft);
      // refresh grid, mirroring Display() being called after insert
      if (selectedCollege) {
        dispatch(fetchHostelCharges({ collegeName: selectedCollege, batch: selectedBatch }));
      }
    }
  };

  const columns = useMemo(
    () => [
      { key: "collegeName", label: "CollegeName", width: 200 },
      { key: "batch", label: "Batch", width: 100 },
      { key: "hostelName", label: "HostelName", width: 140 },
      { key: "roomType", label: "Roomtype", width: 140 },
      { key: "hostelFee", label: "HostelFee", width: 110 },
      { key: "totalSeats", label: "TotalSeats", width: 110 },
      { key: "hostelSecurity", label: "HostelSecurity", width: 140 },
    ],
    []
  );

  return (
    <div style={styles.page}>
      {(error || message) && (
        <div style={error ? styles.errorBanner : styles.infoBanner}>
          <span>{error || message}</span>
          <button style={styles.bannerClose} onClick={() => dispatch(clearMessage())}>
            &times;
          </button>
        </div>
      )}

      <div style={styles.header}>
        <label style={styles.label}>College Name :</label>
        <select
          style={styles.select}
          value={selectedCollege}
          onChange={(e) => dispatch(setSelectedCollege(e.target.value))}
        >
          <option value=""></option>
          {colleges.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label style={styles.label}>Batch :</label>
        <select
          style={styles.select}
          value={selectedBatch}
          onChange={(e) => dispatch(setSelectedBatch(e.target.value))}
          disabled={!selectedCollege}
        >
          <option value=""></option>
          {batches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <button style={styles.displayBtn} onClick={handleDisplay} disabled={loading}>
          {loading ? "Loading..." : "Display"}
        </button>
      </div>

      <div style={styles.totalRecords}>Total Records : {totalRecords}</div>

      <div style={styles.gridWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ ...styles.th, width: col.width }}>
                  {col.label}
                </th>
              ))}
              <th style={{ ...styles.th, width: 130 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const thisKey = rowKey(row);
              const isEditing = editingKey !== null && rowKey(editingKey) === thisKey;
              return (
                <tr key={thisKey} style={styles.tr}>
                  {isEditing ? (
                    <>
                      <Cell>
                        <input
                          style={styles.input}
                          value={editDraft.collegeName}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, collegeName: e.target.value })
                          }
                        />
                      </Cell>
                      <Cell>
                        <input
                          style={styles.input}
                          value={editDraft.batch}
                          onChange={(e) => setEditDraft({ ...editDraft, batch: e.target.value })}
                        />
                      </Cell>
                      <Cell>
                        <input
                          style={styles.input}
                          value={editDraft.hostelName}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, hostelName: e.target.value })
                          }
                        />
                      </Cell>
                      <Cell>
                        <input
                          style={styles.input}
                          value={editDraft.roomType}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, roomType: e.target.value })
                          }
                        />
                      </Cell>
                      <Cell>
                        <input
                          style={styles.input}
                          value={editDraft.hostelFee}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, hostelFee: e.target.value })
                          }
                        />
                      </Cell>
                      <Cell>
                        <input
                          style={styles.input}
                          value={editDraft.totalSeats}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, totalSeats: e.target.value })
                          }
                        />
                      </Cell>
                      <Cell>
                        <input
                          style={styles.input}
                          value={editDraft.hostelSecurity}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, hostelSecurity: e.target.value })
                          }
                        />
                      </Cell>
                      <Cell>
                        <button style={styles.smallBtnPrimary} onClick={saveEdit}>
                          Save
                        </button>
                        <button style={styles.smallBtn} onClick={cancelEdit}>
                          Cancel
                        </button>
                      </Cell>
                    </>
                  ) : (
                    <>
                      <Cell onDoubleClick={() => startEdit(row)}>{row.collegeName || "-"}</Cell>
                      <Cell onDoubleClick={() => startEdit(row)}>{row.batch || "-"}</Cell>
                      <Cell onDoubleClick={() => startEdit(row)}>{row.hostelName || "-"}</Cell>
                      <Cell onDoubleClick={() => startEdit(row)}>{row.roomType || "None"}</Cell>
                      <Cell onDoubleClick={() => startEdit(row)}>
                        {row.hostelFee ?? "-"}
                      </Cell>
                      <Cell onDoubleClick={() => startEdit(row)}>
                        {row.totalSeats ?? "-"}
                      </Cell>
                      <Cell onDoubleClick={() => startEdit(row)}>
                        {row.hostelSecurity || "None"}
                      </Cell>
                      <Cell>
                        <button style={styles.smallBtn} onClick={() => startEdit(row)}>
                          Edit
                        </button>
                        <button style={styles.smallBtnDanger} onClick={() => handleDeleteRow(row)}>
                          Delete
                        </button>
                      </Cell>
                    </>
                  )}
                </tr>
              );
            })}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={columns.length + 1} style={styles.emptyRow}>
                  No record Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.footer}>
        <button style={styles.footerBtnPrimary} onClick={() => setShowAddModal(true)}>
          Add New Record
        </button>
        <button style={styles.footerBtn} onClick={onClose}>
          Close
        </button>
      </div>

      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Add New Hostel Charge</h3>

            <Field label="College Name">
              <input
                style={styles.modalInput}
                value={addDraft.collegeName}
                onChange={(e) => setAddDraft({ ...addDraft, collegeName: e.target.value })}
              />
            </Field>
            <Field label="Batch">
              <input
                style={styles.modalInput}
                value={addDraft.batch}
                onChange={(e) => setAddDraft({ ...addDraft, batch: e.target.value })}
              />
            </Field>
            <Field label="Hostel Name">
              <input
                style={styles.modalInput}
                value={addDraft.hostelName}
                onChange={(e) => setAddDraft({ ...addDraft, hostelName: e.target.value })}
              />
            </Field>
            <Field label="Room Type">
              <input
                style={styles.modalInput}
                value={addDraft.roomType}
                onChange={(e) => setAddDraft({ ...addDraft, roomType: e.target.value })}
              />
            </Field>
            <Field label="Hostel Fee">
              <input
                style={styles.modalInput}
                value={addDraft.hostelFee}
                onChange={(e) => setAddDraft({ ...addDraft, hostelFee: e.target.value })}
              />
            </Field>
            <Field label="Total Seats">
              <input
                style={styles.modalInput}
                value={addDraft.totalSeats}
                onChange={(e) => setAddDraft({ ...addDraft, totalSeats: e.target.value })}
              />
            </Field>
            <Field label="Hostel Security">
              <input
                style={styles.modalInput}
                value={addDraft.hostelSecurity}
                onChange={(e) => setAddDraft({ ...addDraft, hostelSecurity: e.target.value })}
              />
            </Field>

            <div style={styles.modalFooter}>
              <button
                style={styles.footerBtnPrimary}
                onClick={handleAddSubmit}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save"}
              </button>
              <button
                style={styles.footerBtn}
                onClick={() => {
                  setShowAddModal(false);
                  setAddDraft(emptyDraft);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Cell({
  children,
  onDoubleClick,
}: {
  children: React.ReactNode;
  onDoubleClick?: () => void;
}) {
  return (
    <td style={styles.td} onDoubleClick={onDoubleClick}>
      {children}
    </td>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "Segoe UI, Arial, sans-serif",
    background: "linear-gradient(135deg,#dceeff,#eef6ff)",
    padding: 16,
    minHeight: "100%",
    color: "#1a1a1a",
    colorScheme: "light",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f2f2f2",
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
    color: "#1a1a1a",
  },
  label: { fontWeight: 600, fontSize: 14, color: "#1a1a1a" },
  select: {
    padding: "4px 6px",
    minWidth: 220,
    fontSize: 14,
    color: "#1a1a1a",
    background: "#fff",
    border: "1px solid #999",
    borderRadius: 3,
  },
  displayBtn: {
    marginLeft: "auto",
    padding: "8px 20px",
    fontWeight: 600,
    background: "#e8e8e8",
    border: "1px solid #999",
    borderRadius: 3,
    cursor: "pointer",
    color: "#1a1a1a",
  },
  totalRecords: {
    fontWeight: 700,
    marginBottom: 6,
    padding: "4px 6px",
    color: "#1a1a1a",
  },
  gridWrap: {
    background: "#fff",
    border: "1px solid #999",
    borderRadius: 2,
    overflowX: "auto",
    maxHeight: 480,
    overflowY: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#1a1a1a" },
  th: {
    background: "#e6e6e6",
    borderBottom: "1px solid #aaa",
    borderRight: "1px solid #ccc",
    textAlign: "left",
    padding: "6px 8px",
    position: "sticky",
    top: 0,
    color: "#1a1a1a",
    fontWeight: 700,
  },
  tr: { borderBottom: "1px solid #eee" },
  td: {
    padding: "6px 8px",
    borderRight: "1px solid #eee",
    whiteSpace: "nowrap",
    color: "#1a1a1a",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "2px 4px",
    fontSize: 13,
    color: "#1a1a1a",
    background: "#fff",
    border: "1px solid #bbb",
    borderRadius: 2,
  },
  emptyRow: { textAlign: "center", padding: 20, color: "#666" },
  smallBtn: {
    marginRight: 6,
    padding: "3px 8px",
    fontSize: 12,
    cursor: "pointer",
    color: "#1a1a1a",
    background: "#f0f0f0",
    border: "1px solid #aaa",
    borderRadius: 3,
  },
  smallBtnPrimary: {
    marginRight: 6,
    padding: "3px 8px",
    fontSize: 12,
    cursor: "pointer",
    background: "#2f6fed",
    color: "#fff",
    border: "none",
    borderRadius: 3,
  },
  smallBtnDanger: {
    padding: "3px 8px",
    fontSize: 12,
    cursor: "pointer",
    background: "#e0134a",
    color: "#fff",
    border: "none",
    borderRadius: 3,
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
  },
  footerBtnPrimary: {
    padding: "8px 22px",
    fontWeight: 600,
    background: "#e8e8e8",
    border: "1px solid #999",
    borderRadius: 3,
    cursor: "pointer",
    color: "#1a1a1a",
  },
  footerBtn: {
    padding: "8px 22px",
    fontWeight: 600,
    background: "#e8e8e8",
    border: "1px solid #999",
    borderRadius: 3,
    cursor: "pointer",
    color: "#1a1a1a",
  },
  errorBanner: {
    background: "#fdecea",
    color: "#a11",
    border: "1px solid #f5c6cb",
    borderRadius: 4,
    padding: "8px 12px",
    marginBottom: 8,
    display: "flex",
    justifyContent: "space-between",
  },
  infoBanner: {
    background: "#e7f6ec",
    color: "#256029",
    border: "1px solid #b7e4c7",
    borderRadius: 4,
    padding: "8px 12px",
    marginBottom: 8,
    display: "flex",
    justifyContent: "space-between",
  },
  bannerClose: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    color: "inherit",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: 20,
    borderRadius: 6,
    width: 360,
    maxHeight: "90vh",
    overflowY: "auto",
    color: "#1a1a1a",
  },
  field: { marginBottom: 10, display: "flex", flexDirection: "column" },
  fieldLabel: { fontSize: 12, fontWeight: 600, marginBottom: 2, color: "#1a1a1a" },
  modalInput: {
    padding: "6px 8px",
    fontSize: 14,
    color: "#1a1a1a",
    background: "#fff",
    border: "1px solid #bbb",
    borderRadius: 3,
  },
  modalFooter: { display: "flex", gap: 10, marginTop: 12 },
};