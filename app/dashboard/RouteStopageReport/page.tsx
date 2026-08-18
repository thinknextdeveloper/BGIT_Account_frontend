
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import { fetchRouteStopageReport, clearReport } from "@/store/slices/routeStopageSlice";

export default function RouteStopageReportPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { rows, collegeLabel, address, loading, error } = useSelector(
    (state: RootState) => state.routeStopage
  );

  const [colleges, setColleges] = useState<string[]>([]);
  const [allColleges, setAllColleges] = useState(false);
  const [collegeName, setCollegeName] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
  }, []);

  const handleAllCollegesChange = (checked: boolean) => {
    setAllColleges(checked);
    setCollegeName("");
  };

  const handlePrint = () => {
    setFormError(null);
    setShowReport(true);
    dispatch(fetchRouteStopageReport(allColleges ? undefined : collegeName || undefined));
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      {!showReport ? (
        <div className="max-w-md mx-auto mt-24">
          <fieldset className="border border-gray-300 rounded bg-white/80 p-5">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1 font-semibold text-[13px] text-gray-800 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={allColleges}
                  onChange={(e) => handleAllCollegesChange(e.target.checked)}
                />
                All Colleges
              </label>
              <select
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                disabled={allColleges}
                className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900 disabled:bg-gray-100"
              >
                <option value="">-- Select --</option>
                {colleges.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </fieldset>

          {formError && (
            <p className="text-red-600 text-[13px] font-medium mt-2 text-center">{formError}</p>
          )}

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700"
            >
              Print
            </button>
            <button className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded shadow-sm p-6 max-w-4xl mx-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-10">{error}</p>
          ) : (
            <>
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{collegeLabel}</h1>
                {address.addressLine1 && <p className="text-[12px] text-gray-600">{address.addressLine1}</p>}
                {address.addressLine2 && <p className="text-[12px] text-gray-600">{address.addressLine2}</p>}
                <h2 className="text-lg font-bold underline mt-2 text-gray-900">ROUTE STOPPAGE REPORT</h2>
              </div>

              <table className="w-full border-collapse text-[12px] mt-2">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2 text-gray-900">Route ID</th>
                    <th className="text-left py-2 text-gray-900">Bus Route</th>
                    <th className="text-left py-2 text-gray-900">Stoppage ID</th>
                    <th className="text-left py-2 text-gray-900">Stoppage</th>
                    <th className="text-right py-2 text-gray-900">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={`${row.RouteID}-${row.StopageID}-${i}`} className="border-b border-gray-200">
                      <td className="py-2 text-gray-900">{row.RouteID}</td>
                      <td className="py-2 text-blue-700">{row.BusRoute}</td>
                      <td className="py-2 text-gray-900">{row.StopageID}</td>
                      <td className="py-2 text-blue-700">{row.Stopage}</td>
                      <td className="py-2 text-right text-gray-900">{row.StudentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => { setShowReport(false); dispatch(clearReport()); }}
                  className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}