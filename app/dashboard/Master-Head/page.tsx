"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchColleges,
  fetchMasterHeads,
  createMasterHead,
  updateMasterHead,
  deleteMasterHead,
  clearMessage,
  emptyDraft,
  MasterHeadDraft,
  MasterHead,
} from "@/store/slices/masterHeadsSlice";
import { getStorage } from "@/utils/storage";

export default function MasterHeadPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { colleges, rows, totalRecords, loading, submitting, error } = useSelector(
    (state: RootState) => state.masterHeads
  );

  const userid = getStorage("userid");

  const [newRow, setNewRow] = useState<MasterHeadDraft>(emptyDraft);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<MasterHeadDraft>(emptyDraft);

  useEffect(() => {
    dispatch(fetchColleges());
    if (userid) dispatch(fetchMasterHeads(userid));
  }, [dispatch, userid]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearMessage());
    }
  }, [error, dispatch]);

  const handleAddNewRecord = async () => {
    if (!newRow.collegeName) return alert("Please enter College Name.");
    if (!newRow.head) return alert("Please enter Head.");
    if (!newRow.srNo) return alert("Please enter SrNo.");

    const result = await dispatch(createMasterHead(newRow));
    if (createMasterHead.fulfilled.match(result)) {
      setNewRow(emptyDraft);
      if (userid) dispatch(fetchMasterHeads(userid));
    }
  };

  const startEdit = (row: MasterHead) => {
    setEditingKey(`${row.collegeName}|${row.head}|${row.srNo}`);
    setEditDraft({ collegeName: row.collegeName, head: row.head, srNo: String(row.srNo) });
  };

  const commitEdit = async (original: MasterHead) => {
    if (!editDraft.collegeName || !editDraft.head || !editDraft.srNo) {
      alert("You can not leave field blank.");
      return;
    }
    const result = await dispatch(
      updateMasterHead({
        original: { collegeName: original.collegeName, head: original.head, srNo: original.srNo },
        draft: editDraft,
      })
    );
    if (updateMasterHead.fulfilled.match(result)) setEditingKey(null);
  };

  const handleDelete = (row: MasterHead) => {
    if (!confirm(`Delete ${row.collegeName} - ${row.head}?`)) return;
    dispatch(deleteMasterHead({ collegeName: row.collegeName, head: row.head, srNo: row.srNo }));
  };

  const handleExport = () => {
    if (rows.length === 0) return;
    const header = "CollegeName,Head,SrNo";
    const lines = rows.map((r) => `"${r.collegeName}","${r.head}",${r.srNo}`);
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "MasterHeads.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const inputClass =
    "w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Total Records: <span className="text-gray-900">{totalRecords}</span>
      </h2>

      <div className="flex gap-6 items-start">
        <table className="border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white text-sm w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                CollegeName
              </th>
              <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Head
              </th>
              <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                SrNo
              </th>
              <th className="border-b border-gray-300 px-3 py-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const key = `${row.collegeName}|${row.head}|${row.srNo}`;
                const isEditing = editingKey === key;
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">
                      {isEditing ? (
                        <select
                          className={inputClass}
                          value={editDraft.collegeName}
                          onChange={(e) => setEditDraft({ ...editDraft, collegeName: e.target.value })}
                        >
                          {colleges.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <span onClick={() => startEdit(row)} className="cursor-pointer text-gray-900 hover:text-blue-700">
                          {row.collegeName}
                        </span>
                      )}
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      {isEditing ? (
                        <input
                          className={inputClass}
                          value={editDraft.head}
                          onChange={(e) => setEditDraft({ ...editDraft, head: e.target.value })}
                          onBlur={() => commitEdit(row)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => startEdit(row)} className="cursor-pointer text-gray-900 hover:text-blue-700">
                          {row.head}
                        </span>
                      )}
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      {isEditing ? (
                        <input
                          type="number"
                          className={inputClass}
                          value={editDraft.srNo}
                          onChange={(e) => setEditDraft({ ...editDraft, srNo: e.target.value })}
                          onBlur={() => commitEdit(row)}
                        />
                      ) : (
                        <span onClick={() => startEdit(row)} className="cursor-pointer text-gray-900">
                          {row.srNo}
                        </span>
                      )}
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2 text-center">
                      <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-700 text-xs font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}

            <tr className="bg-amber-50">
              <td className="border-b border-gray-200 px-3 py-2">
                <select
                  className={inputClass}
                  value={newRow.collegeName}
                  onChange={(e) => setNewRow({ ...newRow, collegeName: e.target.value })}
                >
                  <option value="">Select</option>
                  {colleges.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </td>
              <td className="border-b border-gray-200 px-3 py-2">
                <input
                  className={inputClass}
                  value={newRow.head}
                  onChange={(e) => setNewRow({ ...newRow, head: e.target.value })}
                  placeholder="Head"
                />
              </td>
              <td className="border-b border-gray-200 px-3 py-2">
                <input
                  type="number"
                  className={inputClass}
                  value={newRow.srNo}
                  onChange={(e) => setNewRow({ ...newRow, srNo: e.target.value })}
                  placeholder="SrNo"
                />
              </td>
              <td className="border-b border-gray-200 px-3 py-2"></td>
            </tr>
          </tbody>
        </table>

        <div className="flex flex-col gap-3 w-48 shrink-0">
          <button
            onClick={handleAddNewRecord}
            disabled={submitting}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white py-2.5 rounded-md font-medium text-sm transition-colors"
          >
            Add New Record
          </button>
          <button
            onClick={handleExport}
            disabled={rows.length === 0}
            className="bg-gray-200 disabled:opacity-70 disabled:cursor-not-allowed text-gray-600 py-2.5 rounded-md font-medium text-sm enabled:hover:bg-gray-300 transition-colors"
          >
            Export To Excel
          </button>
          <button
            onClick={handlePrint}
            className="bg-sky-300 hover:bg-sky-400 text-white py-2.5 rounded-md font-medium text-sm transition-colors"
          >
            Print
          </button>
          <button
            onClick={() => history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-md font-medium text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}