"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchStudent, fetchPrint, clearPrint } from "@/store/slices/duplicateHostelBusPassSlice";

export default function DuplicateHostelBusPassPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { student1, student2, printError, printLoading } = useSelector(
    (state: RootState) => state.duplicateHostelBusPass
  );

  const [idNo1, setIdNo1] = useState("");
  const [idNo2, setIdNo2] = useState("");
  const [srNo1, setSrNo1] = useState("");
  const [srNo2, setSrNo2] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleDisplay = () => {
    if (idNo1 && idNo1.length !== 10) {
      setFormError("Invalid ID No.");
      return;
    }
    if (idNo2 && idNo2.length !== 10) {
      setFormError("Invalid ID No.");
      return;
    }
    setFormError(null);
    if (idNo1) dispatch(fetchStudent({ idNo: idNo1, panel: "student1" }));
    if (idNo2) dispatch(fetchStudent({ idNo: idNo2, panel: "student2" }));
  };

  // Preserves VB bug: both print buttons use student1's facility + college,
  // regardless of which student's data is actually being printed.
  const handlePrint = () => {
    if (!idNo1) {
      setFormError("Please enter IDNo");
      return;
    }
    if (!srNo1) {
      setFormError("Please enter SrNo");
      return;
    }
    if (!student1.admission?.collegeName) {
      setFormError("Please specify collegename");
      return;
    }
    const facility = student1.admission.facility;
    if (facility !== "Bus" && facility !== "Hostel") {
      setFormError("Pls Select Facility between Bus/Hostel");
      return;
    }
    setFormError(null);
    dispatch(clearPrint());
    dispatch(
      fetchPrint({
        idNo1, idNo2: idNo2 || undefined, srNo1, srNo2: srNo2 || undefined,
        collegeName: student1.admission.collegeName, facility,
      })
    );
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef3f9 35%, #b9d3ec 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start gap-4 mb-4">
          <fieldset className="border border-gray-300 rounded bg-white/80 p-4 grid grid-cols-2 gap-x-6 gap-y-3 flex-1">
            <legend className="px-1 text-[13px] font-semibold text-gray-800">Display Criteria</legend>
            <Field label="First ID No.">
              <input value={idNo1} onChange={(e) => setIdNo1(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Second ID No.">
              <input value={idNo2} onChange={(e) => setIdNo2(e.target.value)} className={inputCls} />
            </Field>
            <Field label="First SrNo.">
              <input value={srNo1} onChange={(e) => setSrNo1(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Second SrNo.">
              <input value={srNo2} onChange={(e) => setSrNo2(e.target.value)} className={inputCls} />
            </Field>
          </fieldset>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleDisplay} className={btnCls}>Display</button>
            <button className={btnCls}>Close</button>
            <button className={`${btnCls} opacity-40 cursor-not-allowed`} title="No handler in original VB form">
              View
            </button>
            <button onClick={handlePrint} disabled={printLoading} className={btnCls}>Print</button>
          </div>
        </div>

        {(formError || printError) && (
          <p className="text-red-600 text-[13px] font-medium text-center mb-4">{formError || printError}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <StudentPanel title="Student 1" panel={student1} />
          <StudentPanel title="Student 2" panel={student2} />
        </div>
      </div>
    </div>
  );
}

function StudentPanel({ title, panel }: { title: string; panel: any }) {
  const a = panel.admission;
  return (
    <fieldset className="border border-gray-300 rounded bg-white/80 p-4">
      <legend className="px-1 text-[13px] font-semibold text-gray-800">{title}</legend>

      <div className="flex items-center gap-4 mb-3 text-[13px] font-semibold text-gray-800">
        <label className="flex items-center gap-1"><input type="radio" checked={a?.facility === "Bus"} readOnly /> Bus</label>
        <label className="flex items-center gap-1"><input type="radio" checked={a?.facility === "Hostel"} readOnly /> Hostel</label>
        <label className="flex items-center gap-1"><input type="radio" checked={a?.facility === "None"} readOnly /> None</label>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <ReadField label="College" value={a?.collegeName} />
          <ReadField label="Course" value={a?.course} />
          <ReadField label="Batch" value={a?.batch} />
          <div className="flex items-center gap-2">
            <label className="w-24 shrink-0 font-semibold text-[13px] text-gray-800">Semester</label>
            <select className={inputCls} disabled={!panel.semesters?.length}>
              {(panel.semesters ?? []).map((s: string) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <ReadField label="Name" value={a?.studentName} />
          <ReadField label="Father Name" value={a?.fatherName} />
        </div>
        <div className="w-24 h-24 border border-gray-300 bg-gray-100 flex items-center justify-center shrink-0">
          {a?.snapBase64 ? (
            <img src={`data:image/jpeg;base64,${a.snapBase64}`} alt="Student" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-gray-400">No photo</span>
          )}
        </div>
      </div>

      <div className="mt-3 border border-gray-300 rounded overflow-auto max-h-64">
        {panel.loading ? (
          <p className="text-center text-gray-500 py-6 text-[12px]">Loading...</p>
        ) : panel.error ? (
          <p className="text-center text-red-600 py-6 text-[12px]">{panel.error}</p>
        ) : panel.ledgerEntries?.length ? (
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="border-b-2 border-gray-800 bg-gray-50">
                <th className="text-left py-1.5 px-2 text-gray-900">Date</th>
                <th className="text-left py-1.5 px-2 text-gray-900">Semester</th>
                <th className="text-left py-1.5 px-2 text-gray-900">Ledger</th>
                <th className="text-left py-1.5 px-2 text-gray-900">Particulars</th>
                <th className="text-right py-1.5 px-2 text-gray-900">Debit</th>
                <th className="text-right py-1.5 px-2 text-gray-900">Credit</th>
              </tr>
            </thead>
            <tbody>
              {panel.ledgerEntries.map((e: any, i: number) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-1 px-2 text-gray-900">
                    {e.DateEntry ? new Date(e.DateEntry).toLocaleDateString("en-GB") : ""}
                  </td>
                  <td className="py-1 px-2 text-gray-900">{e.Semester}</td>
                  <td className="py-1 px-2 text-gray-900">{e.LedgerName}</td>
                  <td className="py-1 px-2 text-gray-900">{e.Particulars}</td>
                  <td className="py-1 px-2 text-right text-gray-900">{e.Debit}</td>
                  <td className="py-1 px-2 text-right text-gray-900">{e.Credit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-400 py-6 text-[12px]">No hostel/bus ledger entries.</p>
        )}
      </div>
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-28 shrink-0 font-semibold text-[13px] text-gray-800">{label}</label>
      {children}
    </div>
  );
}

function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-24 shrink-0 font-semibold text-[13px] text-gray-800">{label}</label>
      <input readOnly value={value ?? ""} className={inputCls + " bg-gray-50"} />
    </div>
  );
}

const inputCls = "flex-1 border border-gray-300 h-8 px-2 rounded text-[12px] bg-white text-gray-900";
const btnCls = "bg-blue-600 text-white font-semibold text-[12px] px-4 h-9 rounded hover:bg-blue-700 disabled:opacity-40";