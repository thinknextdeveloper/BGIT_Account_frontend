"use client";

import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  searchByIdNo,
  clearDetails,
} from "@/store/slices/searchByIdNoSlice";

export default function SearchByIDNoPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.searchByIdNo);

  const [activeTab, setActiveTab] = useState<"registration" | "academic">("registration");
  const [idNoInput, setIdNoInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const idInputRef = useRef<HTMLInputElement>(null);

  const admission = data?.admission || null;
  const heads = data?.heads || [];
  const eduQualifications = data?.eduQualifications || [];
  const documents = data?.documents || [];

  const handleSearch = async () => {
    if (!idNoInput.trim()) {
      setFormError("Enter IDNo");
      idInputRef.current?.focus();
      return;
    }

    if (isNaN(Number(idNoInput.trim()))) {
      setFormError("Enter Numeric value");
      idInputRef.current?.focus();
      return;
    }

    setFormError(null);
    dispatch(clearDetails());

    const resultAction = await dispatch(searchByIdNo(idNoInput.trim()));

    if (searchByIdNo.rejected.match(resultAction)) {
      const errMsg = String(
        resultAction.payload || "Sorry! This IDNo has No Record Or May be IDNo is not valid."
      );
      setFormError(errMsg);
      setIdNoInput("");
      idInputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClose = () => {
    setIdNoInput("");
    setFormError(null);
    dispatch(clearDetails());
    idInputRef.current?.focus();
  };

  const formatDate = (val: unknown): string => {
    if (!val) return "";
    try {
      const d = new Date(String(val));
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
    } catch {
      return String(val);
    }
  };

  const renderSafeText = (val: any) => {
    if (val === null || val === undefined) return "";
    return String(val);
  };

  // Facility detection
  const hasHostel = Boolean(admission?.HostelName);
  const hasBus = Boolean(admission?.BusRoute);
  const facilityType = hasHostel ? "Hostel" : hasBus ? "Bus" : "None";

  // Student type
  const isOldStudent = String(admission?.StudentType || "").toLowerCase() === "old";

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 font-sans">
      {/* Title */}
      <h1 className="text-xl font-bold text-gray-800 mb-3 tracking-tight">
        Accounts - [Search By ID No]
      </h1>

      {/* Top Search Controls Bar */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-bold text-gray-700">
            Student ID No :
          </label>
          <input
            ref={idInputRef}
            type="text"
            value={idNoInput}
            onChange={(e) => {
              setIdNoInput(e.target.value);
              setFormError(null);
            }}
            onKeyDown={handleKeyPress}
            placeholder="Enter Student ID No"
            className="w-56 px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition min-w-[85px] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Searching..." : "Display"}
          </button>

          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-1.5 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white text-sm font-semibold rounded-md shadow-sm transition min-w-[85px] cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Error message banner */}
        {formError && (
          <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center gap-2">
            <span>⚠️</span>
            <span>{formError}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-300 mb-4 bg-white rounded-t-lg shadow-sm px-2 pt-2">
        <button
          onClick={() => setActiveTab("registration")}
          className={`px-5 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === "registration"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t"
              : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
        >
          Registration
        </button>
        <button
          onClick={() => setActiveTab("academic")}
          className={`px-5 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === "academic"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t"
              : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
        >
          Academic
        </button>
      </div>

      {/* Tab 1: Registration Details */}
      {activeTab === "registration" && (
        <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm p-5 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Column 1: Student Detail */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">
                Student Detail
              </h3>

              <div>
                <label className="text-xs font-semibold text-gray-600">College Name :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.CollegeName)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Course :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.Course)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Class :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.Class)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Class Roll No :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.ClassRollNo)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Student Name :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.StudentName)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-bold text-blue-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Student Mobile No :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.StudentMobileNo)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Email ID :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.EmailID)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Correspondance Address :</label>
                <textarea
                  readOnly
                  rows={2}
                  value={renderSafeText(admission?.CorrespondanceAddress)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Father Occupation :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.FatherOccupation)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Category :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.Category)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Religion :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.Religion)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Entrance Test 1 :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.EntranceTest1 || "None")}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Entrance Test 1 Roll No. :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.EntranceTest1RollNo)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Entrance Test 1 Rank :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.EntranceTest1Rank)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Entrance Test 2 :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.EntranceTest2 || "None")}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Entrance Test 2 Roll No :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.EntranceTest2RollNo)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Entrance Test 2 Rank :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.EntranceTest2Rank)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Group Name :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.GroupName || "None")}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Uni Roll No :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.UniRollNo)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-bold text-blue-700"
                />
              </div>
            </div>

            {/* Column 2: Personal & Facility Info */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">
                Personal Information
              </h3>

              <div>
                <label className="text-xs font-semibold text-gray-600">Student ID No :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.IDNo)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Batch :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.Batch)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">First Preference :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.FirstPreference || "None")}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Third Preference :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.ThirdPreference || "None")}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Father Name :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.FatherName)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Blood Group :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.BloodGroup)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Father Mobile No :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.FatherMobileNo)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Permanent Address :</label>
                <textarea
                  readOnly
                  rows={2}
                  value={renderSafeText(admission?.PermanentAddress)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Mother Occupation :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.MotherOccupation)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Locality :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.Locality)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Caste :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.Caste)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Concession :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.Concession || "No")}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Concession Amount :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(data?.concessionFeeAmount || "")}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              {/* Facility Sub-box */}
              <div className="border border-gray-300 rounded p-3 bg-blue-50/30 space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 border-b pb-1">
                  <span>Facility</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 font-normal cursor-pointer">
                      <input
                        type="radio"
                        checked={facilityType === "Hostel"}
                        readOnly
                        className="w-3.5 h-3.5 text-blue-600"
                      />
                      Hostel
                    </label>
                    <label className="flex items-center gap-1 font-normal cursor-pointer">
                      <input
                        type="radio"
                        checked={facilityType === "Bus"}
                        readOnly
                        className="w-3.5 h-3.5 text-blue-600"
                      />
                      Bus
                    </label>
                    <label className="flex items-center gap-1 font-normal cursor-pointer">
                      <input
                        type="radio"
                        checked={facilityType === "None"}
                        readOnly
                        className="w-3.5 h-3.5 text-blue-600"
                      />
                      None
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">
                    {hasHostel ? "Hostel Name :" : "Bus Route :"}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={renderSafeText(hasHostel ? admission?.HostelName : admission?.BusRoute)}
                    className="w-full mt-0.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">
                    {hasHostel ? "Room Type :" : "Stopage :"}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={renderSafeText(hasHostel ? admission?.RoomType : admission?.Stopage)}
                    className="w-full mt-0.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-800"
                  />
                </div>

                {hasHostel && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Debit Hostel Charges :</label>
                    <input
                      type="text"
                      readOnly
                      value={renderSafeText(admission?.HostelCharges)}
                      className="w-full mt-0.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-800"
                    />
                  </div>
                )}

                {hasBus && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Bus Fee :</label>
                    <input
                      type="text"
                      readOnly
                      value={renderSafeText(admission?.BusFee)}
                      className="w-full mt-0.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-800"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-600">Concession Amount :</label>
                  <input
                    type="text"
                    readOnly
                    value={renderSafeText(data?.concessionFacilityAmount || "")}
                    className="w-full mt-0.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">Particulars :</label>
                  <input
                    type="text"
                    readOnly
                    value={hasHostel ? "Hostel Fee" : hasBus ? "Bus Fee" : ""}
                    className="w-full mt-0.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Column 3: Academic & Heads Info */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">
                Academic & Fee Status
              </h3>

              <div>
                <label className="text-xs font-semibold text-gray-600">Admission Date :</label>
                <input
                  type="text"
                  readOnly
                  value={formatDate(admission?.AdmissionDate)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Semester :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(data?.semester || admission?.Semester)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Second Preference :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.SecondPreference || "None")}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Fourth Preference :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.FourthPreference || "None")}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Mother Name :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.MotherName)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Phone No :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.PhoneNo)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Mother Mobile No :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.MotherMobileNo)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Sex :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.Sex)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">DOB :</label>
                <input
                  type="text"
                  readOnly
                  value={formatDate(admission?.DOB)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">State :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.State)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Father Designation :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.FatherDesignation)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Quota :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.Quota || "None")}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Scheme :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.Scheme || "None")}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Concession Detail :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.ConcessionDetails || "Select")}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Concession Percentage :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.ConcessionPerc)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Concession Total Amount :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(admission?.ConcessionTotalAmount)}
                  className="w-full mt-0.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800"
                />
              </div>

              {/* Heads Breakdown Table */}
              <div className="border border-gray-300 rounded overflow-hidden mt-4">
                <div className="max-h-36 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
                      <tr>
                        <th className="py-1 px-2 border-r">Head</th>
                        <th className="py-1 px-2 text-right">Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {heads.length > 0 ? (
                        heads.map((h, idx) => (
                          <tr key={idx}>
                            <td className="py-1 px-2 border-r">{h.Head}</td>
                            <td className="py-1 px-2 text-right">
                              {renderSafeText(h.Credit)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="py-3 text-center text-gray-400">
                            No heads data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-2 bg-gray-50 border-t flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-600">Particulars: Fee</span>
                  <span className="font-bold text-gray-800">
                    Total : {data?.totalDebit || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 4: Student Type, Payable & Photo */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">
                Status & Photo
              </h3>

              {/* Student Type Box */}
              <div className="border border-gray-300 rounded p-3 bg-gray-50/50 space-y-2">
                <span className="text-xs font-bold text-gray-700 block">Student Type</span>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="studentType"
                      checked={isOldStudent}
                      readOnly
                      className="w-3.5 h-3.5 text-blue-600"
                    />
                    Old
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="studentType"
                      checked={!isOldStudent}
                      readOnly
                      className="w-3.5 h-3.5 text-blue-600"
                    />
                    New
                  </label>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(admission?.LateralEntry)}
                      readOnly
                      className="w-3.5 h-3.5 text-blue-600 rounded"
                    />
                    Lateral Entry
                  </label>
                </div>
              </div>

              {/* Total Amount Payable */}
              <div>
                <label className="text-xs font-semibold text-gray-700">Total Amount Payable :</label>
                <input
                  type="text"
                  readOnly
                  value={renderSafeText(data?.totalDebit || 0)}
                  className="w-full mt-1 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded font-bold text-sm text-blue-800"
                />
              </div>

              {/* Student Photo */}
              <div className="border border-gray-300 rounded-lg p-3 bg-white flex flex-col items-center">
                <span className="text-xs font-semibold text-gray-600 mb-2">Student Photo</span>
                {admission?.Snap ? (
                  <img
                    src={admission.Snap}
                    alt="Student Photo"
                    className="w-36 h-44 object-cover rounded border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition"
                    onClick={() => setPreviewImage(admission.Snap)}
                  />
                ) : (
                  <div className="w-36 h-44 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                    No Photo
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Academic Details */}
      {activeTab === "academic" && (
        <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm p-5 space-y-6">
          {/* Top Table: Educational Qualification */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              Educational Qualification
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
                  <tr>
                    <th className="py-2.5 px-3 border-r">Exam Passed</th>
                    <th className="py-2.5 px-3 border-r">Course</th>
                    <th className="py-2.5 px-3 border-r">Subjects Studied</th>
                    <th className="py-2.5 px-3 border-r">Board / Univ</th>
                    <th className="py-2.5 px-3 border-r">Year of Passing</th>
                    <th className="py-2.5 px-3 border-r">Marks Obtained</th>
                    <th className="py-2.5 px-3 border-r">Total Marks</th>
                    <th className="py-2.5 px-3 border-r">Percentage</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {eduQualifications.length > 0 ? (
                    eduQualifications.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50">
                        <td className="py-2 px-3 border-r font-medium text-gray-800">
                          {renderSafeText(row.ExamPassed)}
                        </td>
                        <td className="py-2 px-3 border-r">{renderSafeText(row.Course)}</td>
                        <td className="py-2 px-3 border-r">{renderSafeText(row.SubjectsStudied)}</td>
                        <td className="py-2 px-3 border-r">{renderSafeText(row.BoardUniv)}</td>
                        <td className="py-2 px-3 border-r">{renderSafeText(row.YearOfPassing)}</td>
                        <td className="py-2 px-3 border-r">{renderSafeText(row.MarksObtained)}</td>
                        <td className="py-2 px-3 border-r">{renderSafeText(row.TotalMarks)}</td>
                        <td className="py-2 px-3 border-r">{renderSafeText(row.Percentage)}</td>
                        <td className="py-2 px-3">{renderSafeText(row.Remarks)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-gray-400">
                        No educational qualification records
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Table: Documents Required & Action Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <h3 className="text-sm font-bold text-gray-800 mb-2">
                Documents Required
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                  <thead className="bg-gray-100 text-gray-700 font-semibold border-b sticky top-0">
                    <tr>
                      <th className="py-2 px-3 border-r w-16">Sr No</th>
                      <th className="py-2 px-3 border-r">Documents Required</th>
                      <th className="py-2 px-3 w-32">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {documents.length > 0 ? (
                      documents.map((doc, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/50">
                          <td className="py-1.5 px-3 border-r">{renderSafeText(doc.SerialNo || idx + 1)}</td>
                          <td className="py-1.5 px-3 border-r">{renderSafeText(doc.DocumentsRequired)}</td>
                          <td className="py-1.5 px-3 font-medium">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] ${
                                doc.Status === "Submitted"
                                  ? "bg-green-100 text-green-800"
                                  : doc.Status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {renderSafeText(doc.Status || "NA")}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-gray-400">
                          No document status records
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Academic Tab Buttons */}
            <div className="lg:col-span-4 flex flex-col gap-3 pt-6">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-md shadow-sm transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white text-sm font-semibold rounded-md shadow-sm transition cursor-pointer"
              >
                New Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-lg p-4 shadow-xl max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-gray-800">Student Photo</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-500 hover:text-gray-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={previewImage}
                alt="Enlarged Student"
                className="max-h-96 max-w-full rounded object-contain border"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
