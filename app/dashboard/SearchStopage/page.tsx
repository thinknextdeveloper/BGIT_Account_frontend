"use client";

import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  searchStopage,
  clearResults,
  StopageRow,
} from "@/store/slices/searchStopageSlice";

export default function SearchStopagePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { results, loading } = useSelector((state: RootState) => state.searchStopage);

  const [stopage, setStopage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const stopageInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!stopage.trim()) {
      setFormError("Please enter stopage");
      stopageInputRef.current?.focus();
      return;
    }

    setFormError(null);
    dispatch(clearResults());

    const actionResult = await dispatch(searchStopage(stopage.trim()));

    if (searchStopage.rejected.match(actionResult)) {
      const errMsg = String(actionResult.payload || "Sorry No record found");
      setFormError(errMsg);
      setStopage("");
      stopageInputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClose = () => {
    setStopage("");
    setFormError(null);
    dispatch(clearResults());
    stopageInputRef.current?.focus();
  };

  const renderSafeText = (val: any) => {
    if (val === null || val === undefined) return "";
    return String(val);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 font-sans">
      {/* Title */}
      <h1 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
        Search By Stopage
      </h1>

      {/* Search Filters Container */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-5 max-w-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Stopage Input Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap min-w-[100px]">
              Enter Stopage
            </label>
            <input
              ref={stopageInputRef}
              type="text"
              value={stopage}
              onChange={(e) => {
                setStopage(e.target.value);
                setFormError(null);
              }}
              onKeyDown={handleKeyPress}
              placeholder="Enter Stopage"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition-colors flex items-center justify-center min-w-[80px] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Searching..." : "Find"}
            </button>
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition-colors min-w-[80px] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Error / Notification Banner */}
        {formError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {formError}
          </div>
        )}
      </div>

      {/* Total Records Header */}
      <div className="mb-2 text-sm font-bold text-gray-800">
        Total Records : {results?.length || 0}
      </div>

      {/* Results Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-3xl">
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-4 border-r border-gray-200 w-[200px]">Stopage</th>
                <th className="py-2.5 px-4 border-r border-gray-200 w-[200px]">Route</th>
                <th className="py-2.5 px-4 border-gray-200 w-[100px] text-right">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {results && results.length > 0 ? (
                results.map((row: StopageRow, idx: number) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-2.5 px-4 border-r border-gray-200 font-medium">
                      {renderSafeText(row.Stopage)}
                    </td>
                    <td className="py-2.5 px-4 border-r border-gray-200">
                      {renderSafeText(row.Route)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-blue-600">
                      {row.Fee !== null && row.Fee !== undefined ? Number(row.Fee).toLocaleString() : ""}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">
                    {loading ? "Loading records..." : "No records to display"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
