"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  findStudent,
  fetchHostelNames,
  fetchRoomTypes,
  fetchRoomNumbers,
  fetchBusRoutes,
  fetchStopages,
  updateFacility,
  clearStudent,
} from "@/store/slices/facilitySlice";

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-gray-700 block mb-1">
        {label}
      </label>
      <input
        value={value ?? ""}
        readOnly
        className="w-full border border-gray-300 h-8 rounded-sm px-2 bg-gray-100 text-[12px] text-gray-800"
      />
    </div>
  );
}

function TitleBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-600 text-white text-[13px] font-bold px-3 py-2 rounded-t">
      {children}
    </div>
  );
}

function StudentPhoto({ src }: { src: string | null | undefined }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- data URL, not a static asset
    return (
      <img
        src={src}
        alt="Student"
        className="w-28 h-32 object-cover border border-gray-300 rounded"
      />
    );
  }
  return (
    <div className="border border-gray-300 w-28 h-32 flex items-center justify-center bg-gray-50 text-center text-[10px] font-bold text-gray-400 rounded">
      IMAGE
      <br />
      NOT FOUND
    </div>
  );
}

export default function UpdateFacilityPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    student,
    hostelNames,
    roomTypes,
    roomNumbers,
    busRoutes,
    stopages,
    loading,
    updating,
    error,
  } = useSelector((state: RootState) => state.facility);

  const [searchType, setSearchType] = useState<"registrationNo" | "idNo">("idNo");
  const [searchValue, setSearchValue] = useState("");

  const [facilityType, setFacilityType] = useState<"Hostel" | "Bus" | "None">("None");
  const [hostelName, setHostelName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [route, setRoute] = useState("");
  const [stopage, setStopage] = useState("");

  useEffect(() => {
    dispatch(fetchHostelNames());
    dispatch(fetchBusRoutes());
  }, [dispatch]);

  useEffect(() => {
    if (student) {
      const type =
        student.Facility === "Hostel" || student.Facility === "Bus"
          ? student.Facility
          : "None";
      setFacilityType(type as "Hostel" | "Bus" | "None");
      setHostelName(student.HostelName ?? "");
      setRoomType(student.RoomType ?? "");
      // RoomNo isn't part of the student record (no such column on
      // Admissions) — always starts blank and is chosen fresh via the
      // Room No. dropdown when updating a Hostel facility.
      setRoomNo("");
      setRoute(student.BusRoute ?? "");
      setStopage(student.Stopage ?? "");

      if (student.HostelName) dispatch(fetchRoomTypes(student.HostelName));
      if (student.BusRoute) dispatch(fetchStopages(student.BusRoute));
    }
  }, [student, dispatch]);

  const handleFind = () => {
    if (!searchValue.trim()) return;
    dispatch(clearStudent());
    dispatch(findStudent({ [searchType]: searchValue.trim() }));
  };

  const handleHostelChange = (value: string) => {
    setHostelName(value);
    setRoomType("");
    setRoomNo("");
    if (value) dispatch(fetchRoomTypes(value));
  };

  const handleRoomTypeChange = (value: string) => {
    setRoomType(value);
    setRoomNo("");
    if (value && hostelName) dispatch(fetchRoomNumbers({ hostelName, roomType: value }));
  };

  const handleRouteChange = (value: string) => {
    setRoute(value);
    setStopage("");
    if (value) dispatch(fetchStopages(value));
  };

  const handleUpdate = () => {
    if (!student) return;

    const facility: any = { type: facilityType };
    if (facilityType === "Hostel") {
      facility.hostelName = hostelName;
      facility.roomType = roomType;
      facility.roomNo = roomNo;
    } else if (facilityType === "Bus") {
      facility.route = route;
      facility.stopage = stopage;
    }

    dispatch(updateFacility({ idNo: student.IDNo, facility }));
  };

  // Mirrors VB txtFacilityAmount: shows HostelCharges when the student is
  // on Hostel, BusFee when on Bus, blank otherwise.
  const facilityAmount =
    student?.Facility === "Hostel"
      ? student?.HostelCharges
      : student?.Facility === "Bus"
      ? student?.BusFee
      : "";

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)",
      }}
    >
      {/* Search bar */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-3 mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-1 text-[13px] font-medium text-gray-500">
          <input
            type="radio"
            checked={searchType === "registrationNo"}
            onChange={() => setSearchType("registrationNo")}
          />
          Registration No.
        </label>
        <label className="flex items-center gap-1 text-[13px] font-medium text-gray-800">
          <input
            type="radio"
            checked={searchType === "idNo"}
            onChange={() => setSearchType("idNo")}
          />
          ID No.
        </label>
        <input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFind()}
          className="border-2 border-blue-500 h-9 px-2 w-44 rounded text-[13px] outline-none bg-white text-gray-900"
        />
        <button
          onClick={handleFind}
          className="bg-blue-600 text-white text-[13px] font-semibold px-4 h-9 rounded hover:bg-blue-700"
        >
          Find
        </button>
        <button className="bg-blue-600 text-white text-[13px] font-semibold px-4 h-9 rounded hover:bg-blue-700">
          New Entry
        </button>
        <button className="bg-blue-600 text-white text-[13px] font-semibold px-4 h-9 rounded hover:bg-blue-700">
          Close
        </button>
      </div>

      {loading && <div className="text-blue-800 font-semibold mb-2">Loading...</div>}
      {error && <div className="text-red-600 font-semibold mb-2">{error}</div>}

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Student detail */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <TitleBar>Student detail</TitleBar>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4 text-gray-500">
              <label className="flex items-center gap-1 text-[13px] font-medium">
                <input type="radio" checked={student?.StudentType === "New"} readOnly />
                New
              </label>
              <label className="flex items-center gap-1 text-[13px] font-medium">
                <input type="radio" checked={student?.StudentType === "Old"} readOnly />
                Old
              </label>
              <label className="flex items-center gap-1 text-[13px] font-medium ml-4">
                <input type="checkbox" checked={student?.LateralEntry === "Yes"} readOnly />
                Lateral Entry
              </label>
            </div>

            <Field label="CollegeName" value={student?.CollegeName} />

            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                {/* Session isn't part of the Admissions record in VB — it's
                    fetched separately via frmdebit.ShowSession(). Wire up
                    a dedicated session selector/endpoint if this needs to
                    display a live value. */}
                <Field label="Name" value={student?.StudentName} />
                <Field label="Father Name" value={student?.FatherName} />
                <Field label="Course" value={student?.Course} />
                <Field label="Batch" value={student?.Batch} />
              </div>
              <div className="w-28 shrink-0">
                <StudentPhoto src={student?.Snap} />
              </div>
            </div>

            <Field label="Class" value={student?.Class} />
            <Field label="Semester" value="" />
            {/* Scheme / Mode of Admission (Quota) removed: VB has both
                commented out in Display() — those columns don't exist on
                Admissions in this deployment. */}
            <Field label="Fee Category" value={student?.FeeCategory} />

            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-1">
                Gender
              </label>
              <div className="flex items-center gap-4 h-8 text-gray-500">
                <label className="flex items-center gap-1 text-[13px]">
                  <input type="radio" checked={student?.Sex === "Male"} readOnly />
                  Male
                </label>
                <label className="flex items-center gap-1 text-[13px]">
                  <input type="radio" checked={student?.Sex === "Female"} readOnly />
                  Female
                </label>
              </div>
            </div>

            <Field label="Address" value={student?.PermanentAddress} />
          </div>
        </div>

        {/* Right: Facility Opted + Update Facility */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <TitleBar>Facility Opted</TitleBar>
            <div className="p-4 grid grid-cols-2 gap-4">
              <Field label="Hostel Name" value={student?.HostelName} />
              <Field label="Room-Type" value={student?.RoomType} />
              <Field label="Route" value={student?.BusRoute} />
              <Field label="Stopage" value={student?.Stopage} />
              <Field label="Facility Amount" value={facilityAmount} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <TitleBar>Update Facility Detail</TitleBar>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4 text-gray-500">
                <label className="flex items-center gap-1 text-[13px] font-medium">
                  <input
                    type="radio"
                    checked={facilityType === "Hostel"}
                    onChange={() => setFacilityType("Hostel")}
                  />
                  Hostel
                </label>
                <label className="flex items-center gap-1 text-[13px] font-medium">
                  <input
                    type="radio"
                    checked={facilityType === "Bus"}
                    onChange={() => setFacilityType("Bus")}
                  />
                  Bus
                </label>
                <label className="flex items-center gap-1 text-[13px] font-medium">
                  <input
                    type="radio"
                    checked={facilityType === "None"}
                    onChange={() => setFacilityType("None")}
                  />
                  None
                </label>

                <button
                  onClick={handleUpdate}
                  disabled={!student || updating}
                  className="ml-auto bg-blue-600 text-white text-[13px] font-semibold px-4 h-9 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {updating ? "Updating..." : "Update"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-1">
                    Hostel Name
                  </label>
                  <select
                    value={hostelName}
                    onChange={(e) => handleHostelChange(e.target.value)}
                    disabled={facilityType !== "Hostel"}
                    className="w-full border border-gray-300 h-8 rounded-sm px-2 bg-white text-[12px] text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">-- Select --</option>
                    {hostelNames.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-1">
                    Room-Type
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => handleRoomTypeChange(e.target.value)}
                    disabled={facilityType !== "Hostel" || !hostelName}
                    className="w-full border border-gray-300 h-8 rounded-sm px-2 bg-white text-[12px] text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">-- Select --</option>
                    {roomTypes.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-1">
                    Route
                  </label>
                  <select
                    value={route}
                    onChange={(e) => handleRouteChange(e.target.value)}
                    disabled={facilityType !== "Bus"}
                    className="w-full border border-gray-300 h-8 rounded-sm px-2 bg-white text-[12px] text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">-- Select --</option>
                    {busRoutes.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-1">
                    Stopage
                  </label>
                  <select
                    value={stopage}
                    onChange={(e) => setStopage(e.target.value)}
                    disabled={facilityType !== "Bus" || !route}
                    className="w-full border border-gray-300 h-8 rounded-sm px-2 bg-white text-[12px] text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">-- Select --</option>
                    {stopages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-1">
                    Room No.
                  </label>
                  <select
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    disabled={facilityType !== "Hostel" || !roomType}
                    className="w-full border border-gray-300 h-8 rounded-sm px-2 bg-white text-[12px] text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">-- Select --</option>
                    {roomNumbers.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}