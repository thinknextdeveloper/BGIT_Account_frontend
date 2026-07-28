"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchDeadDebitColleges,
  fetchDeadDebitCourses,
  fetchDeadDebits,
  deleteDeadDebit,
  setPage,
} from "@/store/slices/deadDebitsSice";

export default function DeadDebitsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    colleges,
    courses,
    rows,
    page,
    pageSize,
    totalRecords,
    totalPages,
    loading,
    deleting,
    error,
  } = useSelector((state: RootState) => state.deadDebits);

  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDeadDebitColleges());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDeadDebits({ collegeName, course, page, pageSize }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleCollegeChange = async (value: string) => {
    setCollegeName(value);
    setCourse("");
    dispatch(setPage(1));

    if (value) {
      dispatch(fetchDeadDebitCourses(value));
    }
    dispatch(fetchDeadDebits({ collegeName: value, course: "", page: 1, pageSize }));
  };

  const handleCourseChange = (value: string) => {
    setCourse(value);
    dispatch(setPage(1));
    dispatch(fetchDeadDebits({ collegeName, course: value, page: 1, pageSize }));
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    dispatch(setPage(newPage));
  };

  const openDeleteModal = (transactionId: number) => {
    setDeleteTarget(transactionId);
    setComments("");
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!comments.trim()) {
      setDeleteError("Please specify comment to delete debit entry");
      return;
    }
    if (deleteTarget === null) return;

    const result = await dispatch(
      deleteDeadDebit({ transactionId: deleteTarget, comments: comments.trim() })
    );

    if (deleteDeadDebit.fulfilled.match(result)) {
      setDeleteTarget(null);
    } else {
      setDeleteError((result.payload as string) || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-[#ECECEC] p-6">
      <fieldset className="rounded border border-gray-400 bg-white p-5 shadow">
        <legend className="px-2 text-lg font-bold text-black">Dead Debits</legend>

        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-5">
            <label className="mb-1 block font-semibold text-black">College Name</label>
            <select
              value={collegeName}
              onChange={(e) => handleCollegeChange(e.target.value)}
              className="h-10 w-full rounded border border-gray-400 bg-white px-3 text-black outline-none focus:border-blue-600"
            >
              <option value="">-- All Colleges --</option>
              {colleges.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-5">
            <label className="mb-1 block font-semibold text-black">Course</label>
            <select
              value={course}
              onChange={(e) => handleCourseChange(e.target.value)}
              disabled={!collegeName}
              className="h-10 w-full rounded border border-gray-400 bg-white px-3 text-black outline-none focus:border-blue-600 disabled:bg-gray-100"
            >
              <option value="">-- All Courses --</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {error && <div className="mt-3 font-medium text-red-600">{error}</div>}

      <div className="mt-5 text-lg font-semibold text-black">
        Total Records : {totalRecords}
      </div>

      <div className="mt-3 overflow-auto rounded border border-gray-300 bg-white shadow">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-200 text-black">
              <th className="border px-2 py-2 text-left">Date</th>
              <th className="border px-2 py-2 text-left">College</th>
              <th className="border px-2 py-2 text-left">ID No</th>
              <th className="border px-2 py-2 text-left">Student Name</th>
              <th className="border px-2 py-2 text-left">Course</th>
              <th className="border px-2 py-2 text-left">Father Name</th>
              <th className="border px-2 py-2 text-left">Particulars</th>
              <th className="border px-2 py-2 text-right">Debit</th>
              <th className="border px-2 py-2 text-left">Comments</th>
              <th className="border px-2 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-6 text-center text-black">
                  No Records Found
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={`${row.TransactionID}-${index}`}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border px-2 py-1 text-black">{row.DateEntry}</td>
                  <td className="border px-2 py-1 text-black">{row.CollegeName}</td>
                  <td className="border px-2 py-1 text-black">{row.IDNo}</td>
                  <td className="border px-2 py-1 text-black">{row.StudentName}</td>
                  <td className="border px-2 py-1 text-black">{row.Course}</td>
                  <td className="border px-2 py-1 text-black">{row.FatherName}</td>
                  <td className="border px-2 py-1 text-black">{row.Particulars}</td>
                  <td className="border px-2 py-1 text-right text-black">{row.Debit}</td>
                  <td className="border px-2 py-1 text-black">{row.Comments ?? ""}</td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => openDeleteModal(row.TransactionID)}
                      className="text-red-600 font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
          className="rounded bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-black font-medium">
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
          className="rounded bg-blue-700 px-4 py-1.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h3 className="font-bold text-black mb-3">Delete Debit Entry</h3>
            <p className="text-sm text-red-600 font-medium mb-2">
              Please specify comment to delete debit entry
            </p>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="w-full border border-gray-400 rounded px-2 py-1 text-black outline-none focus:border-blue-600"
            />
            {deleteError && (
              <p className="text-sm text-red-600 mt-2">{deleteError}</p>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded bg-gray-400 text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded bg-red-700 text-white font-semibold disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}