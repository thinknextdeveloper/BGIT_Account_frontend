"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { reduxApiClient } from "@/services/reduxservices";
import { fetchHostelNames, fetchReport, clearReport } from "@/store/slices/hostelFacilityReportSlice";

export default function HostelFacilityReportPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { hostelNames, rows, totalStudents, loading, error } = useSelector(
    (state: RootState) => state.hostelFacilityReport
  );

  const [colleges, setColleges] = useState<string[]>([]);
  const [allColleges, setAllColleges] = useState(false);
  const [collegeName, setCollegeName] = useState("");
  const [hostelName, setHostelName] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    reduxApiClient.get("master-course/colleges").then((res) => {
      if (res.success) setColleges(res.data.data);
    });
    dispatch(fetchHostelNames());
  }, [dispatch]);

  const handleAllCollegesChange = (checked: boolean) => {
    setAllColleges(checked);
    if (checked) setCollegeName("");
  };

  const handlePrintReport = () => {
    if (!allColleges && !collegeName) {
      setFormError("Please Specify CollegeName");
      return;
    }
    setFormError(null);
    setShowReport(true);
    dispatch(fetchReport({ collegeName, allColleges, hostelName: hostelName || undefined }));
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      {!showReport ? (
        <div className="max-w-md mx-auto mt-24">
          <fieldset className="border border-gray-300 rounded bg-white/80 p-5 space-y-4">
            <div className="flex items-center gap-4">
              <label className="w-28 font-semibold text-[13px] text-gray-800">College Name :</label>
              <select
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                disabled={allColleges}
                className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900 disabled:bg-gray-100"
              >
                <option value="">-- Select --</option>
                {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="flex items-center gap-1 text-[13px] font-semibold text-gray-800 whitespace-nowrap">
                <input type="checkbox" checked={allColleges} onChange={(e) => handleAllCollegesChange(e.target.checked)} />
                All
              </label>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-28 font-semibold text-[13px] text-gray-800">Hostel Name</label>
              <select
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                className="flex-1 border border-gray-300 h-9 px-2 rounded text-[13px] bg-white text-gray-900"
              >
                <option value="">-- All --</option>
                {hostelNames.map((h) => <option key={h} value={h}>{h}</option>)}
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
        <div className="bg-white border border-gray-300 rounded shadow-sm p-6 max-w-6xl mx-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-10">{error}</p>
          ) : (
            <>
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Hostel Facility Report</h2>
                <p className="text-[13px] font-semibold text-gray-900 mt-1">Total Students : {totalStudents}</p>
              </div>

              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2 text-gray-900">ID No</th>
                    <th className="text-left py-2 text-gray-900">Student Name</th>
                    <th className="text-left py-2 text-gray-900">Father Name</th>
                    <th className="text-left py-2 text-gray-900">Phone No</th>
                    <th className="text-left py-2 text-gray-900">Student Mobile</th>
                    <th className="text-left py-2 text-gray-900">Father Mobile</th>
                    <th className="text-left py-2 text-gray-900">Permanent Address</th>
                    <th className="text-left py-2 text-gray-900">Hostel Name</th>
                    <th className="text-left py-2 text-gray-900">Room Type</th>
                    <th className="text-right py-2 text-gray-900">Hostel Charges</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={`${row.IDNo}-${i}`} className="border-b border-gray-200">
                      <td className="py-2 text-gray-900">{row.IDNo}</td>
                      <td className="py-2 text-blue-700">{row.StudentName}</td>
                      <td className="py-2 text-gray-900">{row.FatherName}</td>
                      <td className="py-2 text-gray-900">{row.PhoneNo ?? ""}</td>
                      <td className="py-2 text-gray-900">{row.StudentMobileNo ?? ""}</td>
                      <td className="py-2 text-gray-900">{row.FatherMobileNo ?? ""}</td>
                      <td className="py-2 text-gray-900">{row.PermanentAddress ?? ""}</td>
                      <td className="py-2 text-blue-700">{row.HostelName}</td>
                      <td className="py-2 text-gray-900">{row.RoomType ?? ""}</td>
                      <td className="py-2 text-right text-gray-900">{row.HostelCharges}</td>
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