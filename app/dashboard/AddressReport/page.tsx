"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchColleges,
  searchByAddress,
  clearResults,
} from "@/store/slices/Searchbyaddressslice";

export default function SearchByAddressPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { colleges, results, loading, error } = useSelector(
    (state: RootState) => state.searchByAddress
  );

  const [allColleges, setAllColleges] = useState(false);
  const [college, setCollege] = useState("");
  const [address, setAddress] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchColleges());
  }, [dispatch]);

  // Mirrors chkCollege_CheckedChanged: toggling "All Colleges" disables the
  // dropdown and resets its selection either way.
  const handleAllCollegesToggle = (checked: boolean) => {
    setAllColleges(checked);
    setCollege("");
  };

  const handleFind = () => {
    // Same validation order as btnFind_Click: College first (unless "All
    // Colleges" is checked), then Address.
    if (!allColleges && !college) return setFormError("Please specify College");
    if (!address) return setFormError("Please Specify Address");
    setFormError(null);
    dispatch(clearResults());
    dispatch(searchByAddress({ address, college: allColleges ? undefined : college, allColleges }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleFind();
  };

  const handleClose = () => {
    setAddress("");
    setCollege("");
    setAllColleges(false);
    setFormError(null);
    dispatch(clearResults());
  };

  // Note: btnPrint_Click is commented out in the VB.NET source (never
  // actually wired to any Handles clause), so Print does nothing in the
  // original app. This is a reasonable web equivalent, not a ported
  // behavior — replace with a proper export/report view if you need one.
  const handlePrint = () => window.print();

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      <div className="flex items-start gap-4 mb-6">
        <fieldset className="border border-gray-300 rounded bg-white/80 p-4 flex-1 max-w-xl">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 w-28 font-semibold text-[13px] text-gray-800">
                <input
                  type="checkbox"
                  checked={allColleges}
                  onChange={(e) => handleAllCollegesToggle(e.target.checked)}
                />
                All Colleges
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                disabled={allColleges}
                className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900 disabled:bg-gray-200"
              >
                <option value="">-- Select --</option>
                {colleges.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-28 font-semibold text-[13px] text-gray-800">Enter Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900"
              />
            </div>
          </div>
        </fieldset>

        <div className="flex gap-3 flex-wrap max-w-[180px]">
          <button
            onClick={handleFind}
            disabled={loading}
            className="bg-blue-600 text-white font-semibold text-[13px] px-5 h-9 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Finding..." : "Find"}
          </button>
          <button
            onClick={handlePrint}
            disabled={results.length === 0}
            className="bg-blue-600 text-white font-semibold text-[13px] px-5 h-9 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            Print
          </button>
          <button
            onClick={handleClose}
            className="bg-blue-600 text-white font-semibold text-[13px] px-5 h-9 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>

      {(formError || error) && (
        <p className="text-red-600 text-[13px] font-medium mb-4">{formError ?? error}</p>
      )}

      <div className="bg-white/70 border border-gray-300 rounded p-4">
        {results.length > 0 && (
          <p className="text-[13px] font-semibold text-gray-800 mb-2">
            Total Records : {results.length}
          </p>
        )}
        <div className="bg-gray-300 border border-gray-400 rounded min-h-[400px] overflow-auto">
          {results.length > 0 ? (
            <table className="w-full text-[12px] bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1 text-left text-gray-900">ID No</th>
                  <th className="border px-2 py-1 text-left text-gray-900">Student Name</th>
                  <th className="border px-2 py-1 text-left text-gray-900">Class</th>
                  <th className="border px-2 py-1 text-left text-gray-900">Father Name</th>
                  <th className="border px-2 py-1 text-left text-gray-900">Phone No</th>
                  <th className="border px-2 py-1 text-left text-gray-900">Student Mobile No</th>
                  <th className="border px-2 py-1 text-left text-gray-900">Father Mobile No</th>
                  <th className="border px-2 py-1 text-left text-gray-900">Mother Mobile No</th>
                  <th className="border px-2 py-1 text-left text-gray-900 w-72">Address</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={`${r.IDNo}-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border px-2 py-1 text-gray-900">{r.IDNo}</td>
                    <td className="border px-2 py-1 text-gray-900">{r.StudentName}</td>
                    <td className="border px-2 py-1 text-gray-900">{r.Class}</td>
                    <td className="border px-2 py-1 text-gray-900">{r.FatherName}</td>
                    <td className="border px-2 py-1 text-gray-900">{r.PhoneNo ?? ""}</td>
                    <td className="border px-2 py-1 text-gray-900">{r.StudentMobileNo ?? ""}</td>
                    <td className="border px-2 py-1 text-gray-900">{r.FatherMobileNo ?? ""}</td>
                    <td className="border px-2 py-1 text-gray-900">{r.MotherMobileNo ?? ""}</td>
                    <td className="border px-2 py-1 text-gray-900">{r.PermanentAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-[400px]" />
          )}
        </div>
      </div>
    </div>
  );
}