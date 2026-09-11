"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchRoutes,
  fetchRouteWiseReport,
  clearReport,
} from "@/store/slices/routeWiseReportSlice";

export default function RouteWiseReportPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { routes, groups, totalStudents, totalStopages, loading, error } = useSelector(
    (state: RootState) => state.routeWiseReport
  );

  const [route, setRoute] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchRoutes());
  }, [dispatch]);

  const handlePrintReport = () => {
    if (!route) {
      setFormError("Please Specify Route");
      return;
    }
    setFormError(null);
    setShowReport(true);
    // Session is intentionally omitted here — the backend defaults to the
    // same "2018-19" session the VB.NET form hardcodes. If a session
    // selector gets added to this form later, pass it through here.
    dispatch(fetchRouteWiseReport({ route }));
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
              <label className="w-20 font-semibold text-[13px] text-gray-800">Route :</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900"
              >
                <option value="">-- Select --</option>
                {routes.map((r, index) => (
                  <option key={index} value={r.route}>{r.route}</option>
                ))}
              </select>
            </div>
          </fieldset>

          {formError && (
            <p className="text-red-600 text-[13px] font-medium mt-2 text-center">{formError}</p>
          )}

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handlePrintReport}
              className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700"
            >
              Print Report
            </button>
            <button className="bg-blue-600 text-white font-semibold text-[13px] px-6 h-9 rounded hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded shadow-sm p-6 max-w-7xl mx-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-10">{error}</p>
          ) : (
            <>
              {/* Header laid out like the Crystal Report: stopage/student
                  counts flank the title on one line, route sits underneath. */}
              <div className="grid grid-cols-3 items-start mb-1 text-[13px] font-semibold text-gray-900">
                <span>Total Stopages : {totalStopages}</span>
                <h2 className="text-lg font-bold underline text-center text-gray-900">
                  ROUTE WISE REPORT
                </h2>
                <span className="text-right">Total Students : {totalStudents}</span>
              </div>
              <div className="text-center text-[13px] font-semibold text-gray-900 mb-4">
                Route : {route}
              </div>

              <table className="w-full border-collapse text-[12px] table-fixed">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2 pr-2 text-gray-900 w-20">Stoppage ID</th>
                    <th className="text-left py-2 pr-2 text-gray-900 w-24">Stoppage</th>
                    <th className="text-left py-2 pr-2 text-gray-900 w-16">Session</th>
                    <th className="text-left py-2 pr-2 text-gray-900 w-20">ID No</th>
                    <th className="text-left py-2 pr-2 text-gray-900">Student Name</th>
                    <th className="text-left py-2 pr-2 text-gray-900">Father Name</th>
                    <th className="text-left py-2 pr-2 text-gray-900 w-24">Phone No</th>
                    <th className="text-left py-2 pr-2 text-gray-900 w-24">Student Mobile</th>
                    <th className="text-left py-2 pr-2 text-gray-900 w-24">Father Mobile</th>
                    <th className="text-left py-2 text-gray-900">Permanent Address</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <>
                      {group.students.map((s, i) => (
                        <tr key={`${group.stopageId}-${s.IDNo}-${i}`} className="border-b border-gray-200">
                          {i === 0 ? (
                            <>
                              <td className="py-2 text-gray-900 align-top font-semibold" rowSpan={group.students.length}>
                                {group.stopageId}
                              </td>
                              <td className="py-2 text-blue-700 align-top font-semibold" rowSpan={group.students.length}>
                                {group.stopage}
                              </td>
                            </>
                          ) : null}
                          <td className="py-2 text-gray-900">{s.Session}</td>
                          <td className="py-2 text-gray-900">{s.IDNo}</td>
                          <td className="py-2 text-blue-700">{s.StudentName}</td>
                          <td className="py-2 text-gray-900">{s.FatherName}</td>
                          <td className="py-2 text-gray-900">{s.PhoneNo ?? ""}</td>
                          <td className="py-2 text-gray-900">{s.StudentMobileNo ?? ""}</td>
                          <td className="py-2 text-gray-900">{s.FatherMobileNo ?? ""}</td>
                          <td className="py-2 text-gray-900">{s.PermanentAddress ?? ""}</td>
                        </tr>
                      ))}
                    </>
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