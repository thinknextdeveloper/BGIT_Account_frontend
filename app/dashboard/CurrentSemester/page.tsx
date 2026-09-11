"use client";

import React, { useState } from "react";
import { useMasterSemester } from "@/hooks/useMasterSemester";
import { semesterApi, createSemester } from "@/services/semesterApi";
import { SemesterItem } from "@/types/semester";

export default function FrmCurrentSemesterPage() {
  const {
    records,
    totalRecords,
    filters,
    colleges,
    courses,
    batches,
    semesters,
    loading,
    dropdownLoading,
    error,
    handleFilterChange,
    resetFilters,
    refetch,
  } = useMasterSemester();

  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalCollege, setModalCollege] = useState("");
  const [modalCourse, setModalCourse] = useState("");
  const [modalBatch, setModalBatch] = useState("");
  const [modalSemester, setModalSemester] = useState("");

  const [modalCourses, setModalCourses] = useState<string[]>([]);
  const [modalBatches, setModalBatches] = useState<string[]>([]);
  const [modalSemesters, setModalSemesters] = useState<SemesterItem[]>([]);

  const [modalLoading, setModalLoading] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [pageSuccess, setPageSuccess] = useState<string | null>(null);

  // Client-side quick search filtering across all columns
  const filteredRecords = records.filter((rec) => {
    const term = searchTerm.toLowerCase();
    return (
      rec.CollegeName?.toLowerCase().includes(term) ||
      rec.Course?.toLowerCase().includes(term) ||
      rec.Batch?.toLowerCase().includes(term) ||
      rec.Semester?.toLowerCase().includes(term)
    );
  });

  const isCollegeSelected = Boolean(filters.collegeName);

  // Open modal and reset fields
  const handleOpenAddModal = () => {
    setModalCollege("");
    setModalCourse("");
    setModalBatch("");
    setModalSemester("");
    setModalCourses([]);
    setModalBatches([]);
    setModalSemesters([]);
    setModalError(null);
    setIsAddModalOpen(true);
  };

  // Handle College change inside modal to load dependent Course, Batch, and Semester options dynamically
  const handleModalCollegeChange = async (college: string) => {
    setModalCollege(college);
    setModalCourse("");
    setModalBatch("");
    setModalSemester("");
    setModalCourses([]);
    setModalBatches([]);
    setModalSemesters([]);

    if (!college) return;

    try {
      setModalLoading(true);
      setModalError(null);
      const [crsRes, bthRes, semRes] = await Promise.all([
        semesterApi.getCourse(college),
        semesterApi.getBatch(college),
        semesterApi.getSemester(college),
      ]);

      setModalCourses(crsRes.data || []);
      setModalBatches(bthRes.data || []);
      setModalSemesters(semRes.data || []);
    } catch (err: any) {
      setModalError(err.message || "Failed to load dropdown options for selected college.");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Course change inside modal to refresh Batch & Semester options for that course
  const handleModalCourseChange = async (course: string) => {
    setModalCourse(course);
    setModalBatch("");
    setModalSemester("");

    if (!modalCollege) return;

    try {
      setModalLoading(true);
      const [bthRes, semRes] = await Promise.all([
        semesterApi.getBatch(modalCollege, course),
        semesterApi.getSemester(modalCollege, course),
      ]);
      setModalBatches(bthRes.data || []);
      setModalSemesters(semRes.data || []);
    } catch (err: any) {
      console.error("Failed to update modal options:", err);
    } finally {
      setModalLoading(false);
    }
  };

  // Save new record
  const handleSaveModal = async () => {
    if (!modalCollege || !modalCourse || !modalBatch || !modalSemester) {
      setModalError("Please select all 4 fields: College Name, Course, Batch, and Semester.");
      return;
    }

    try {
      setModalSaving(true);
      setModalError(null);
      const saveFn = semesterApi?.createSemester || createSemester;
      const res = await saveFn({
        collegeName: modalCollege,
        course: modalCourse,
        batch: modalBatch,
        semester: modalSemester,
      });

      setPageSuccess(res.message || "Record added successfully!");
      setIsAddModalOpen(false);
      refetch(); // Refresh table data without page reload

      setTimeout(() => {
        setPageSuccess(null);
      }, 4000);
    } catch (err: any) {
      setModalError(err.message || "Failed to insert record.");
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Master Current Semester
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage current semester records according to assigned user colleges.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow transition duration-150 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition duration-150"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {pageSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{pageSuccess}</span>
          </div>
          <button onClick={() => setPageSuccess(null)} className="text-emerald-600 hover:text-emerald-900 text-xs font-bold">&times;</button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={refetch} className="underline text-red-600 hover:text-red-800 text-xs">Retry</button>
        </div>
      )}

      {/* Filter Toolbar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
        {/* 1. College Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            College Name
          </label>
          <select
            value={filters.collegeName}
            onChange={(e) => handleFilterChange("collegeName", e.target.value)}
            disabled={dropdownLoading}
            className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
          >
            <option value="">Select College</option>
            {colleges.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Course Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Course
          </label>
          <select
            value={filters.course}
            onChange={(e) => handleFilterChange("course", e.target.value)}
            disabled={!isCollegeSelected || dropdownLoading}
            className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {!isCollegeSelected ? "-- Select College First --" : "All Courses"}
            </option>
            {isCollegeSelected &&
              courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
          </select>
        </div>

        {/* 3. Batch Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Batch
          </label>
          <select
            value={filters.batch}
            onChange={(e) => handleFilterChange("batch", e.target.value)}
            disabled={!isCollegeSelected || dropdownLoading}
            className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {!isCollegeSelected ? "-- Select College First --" : "All Batches"}
            </option>
            {isCollegeSelected &&
              batches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
          </select>
        </div>

        {/* 4. Semester Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Semester
          </label>
          <select
            value={filters.semester}
            onChange={(e) => handleFilterChange("semester", e.target.value)}
            disabled={!isCollegeSelected || dropdownLoading}
            className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {!isCollegeSelected ? "-- Select College First --" : "All Semesters"}
            </option>
            {isCollegeSelected &&
              semesters.map((sem, idx) => (
                <option key={`sem-${sem.semesterId}-${sem.semester}-${idx}`} value={sem.semester}>
                  {sem.semester}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Quick Search & Summary Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Total Records Counter Badge */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm shadow-sm">
          <span className="text-gray-500">Total Records:</span>
          <span id="lblTotalRecords1" className="font-bold text-blue-600 text-base">{filteredRecords.length}</span>
          {filteredRecords.length !== totalRecords && (
            <span className="text-xs text-gray-400">(of {totalRecords})</span>
          )}
        </div>
      </div>

      {/* React DataTable Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-800">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3.5 font-semibold">#</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">College Name</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Course</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Batch</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Semester</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-6"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  </tr>
                ))
              ) : filteredRecords.length === 0 ? (
                // No Records State
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-base font-medium text-gray-700">No record found</p>
                    <p className="text-xs text-gray-400 mt-1">Try clearing filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                // Data Rows
                filteredRecords.map((row, index) => (
                  <tr
                    key={`${row.CollegeName}-${row.Course}-${row.Batch}-${row.Semester}-${index}`}
                    className="hover:bg-blue-50/50 transition duration-150"
                  >
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.CollegeName}</td>
                    <td className="px-6 py-4 text-gray-700">{row.Course}</td>
                    <td className="px-6 py-4 text-gray-700 font-mono text-xs">{row.Batch}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {row.Semester}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bootstrap Modal Popup for Add New Master Current Semester Record */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="modal-dialog modal-dialog-centered w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h5 className="modal-title text-lg font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Add Master Current Semester Record
                </h5>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-lg transition"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-6 space-y-4">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Field 1: College Name */}
                <div className="form-group space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    College Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalCollege}
                    onChange={(e) => handleModalCollegeChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  >
                    <option value="">-- Select College --</option>
                    {colleges.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 2: Course */}
                <div className="form-group space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalCourse}
                    onChange={(e) => handleModalCourseChange(e.target.value)}
                    disabled={!modalCollege || modalLoading}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!modalCollege ? "-- Select College First --" : "-- Select Course --"}
                    </option>
                    {modalCourses.map((crs) => (
                      <option key={crs} value={crs}>
                        {crs}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 3: Batch */}
                <div className="form-group space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalBatch}
                    onChange={(e) => setModalBatch(e.target.value)}
                    disabled={!modalCollege || modalLoading}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!modalCollege ? "-- Select College First --" : "-- Select Batch --"}
                    </option>
                    {modalBatches.map((bth) => (
                      <option key={bth} value={bth}>
                        {bth}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 4: Semester */}
                <div className="form-group space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalSemester}
                    onChange={(e) => setModalSemester(e.target.value)}
                    disabled={!modalCollege || modalLoading}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!modalCollege ? "-- Select College First --" : "-- Select Semester --"}
                    </option>
                    {modalSemesters.map((sem, idx) => (
                      <option key={`modal-sem-${sem.semesterId}-${sem.semester}-${idx}`} value={sem.semester}>
                        {sem.semester}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModal}
                  disabled={modalSaving || !modalCollege || !modalCourse || !modalBatch || !modalSemester}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow transition disabled:opacity-50 flex items-center gap-2"
                >
                  {modalSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Record"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
