import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import menuReducer from "./slices/menuSlice";
import masterAnnualFeeReducer from "./slices/masterAnnualFeeSlice";
import masterCategoryReducer from "./slices/masterCategorySlice";
import hostelBusValidityReducer from "./slices/masterHostelBusValiditySlice";
import masterDevFundReducer from "./slices/masterDevFundSlice";
import studentDetailsReducer from "./slices/studentDetailsSlice";
import admissionFeeReducer from "./slices/admissionFeeSlice";
import dayBookReducer from "@/store/slices/dayBookSlice";
import customSubLedgersReducer from "@/store/slices/customSubLedgersSlice";
import cancelReceiptReducer from "@/store/slices/cancelReceiptSlice";
import deadDebitsReducer from "@/store/slices/deadDebitsSice"
import facilityReducer from "./slices/facilitySlice";
import receiptUpdateReducer from "./slices/receiptUpdateSlice";
import concessionSliceReducer from "./slices/concessionSlice"
import feeReportReducer from "@/store/slices/Feereportslice";
import hostelReportReducer from "./slices/HostelReportSlice";
import debitEntryReducer from "@/store/slices/DebitEntrySlice";
import ledgerStatusReducer from "./slices/ledgerStatusSlice";
import routeStopageReducer from "./slices/routeStopageSlice";
import routeWiseReportReducer from "./slices/routeWiseReportSlice";
import receiptSearchReducer from "./slices/Receiptsearchslice";
import searchByAddressReducer from "./slices/Searchbyaddressslice";
import studentActivityFundReducer from "./slices/studentActivityFundSlice";
import pendingRegistrationFeeReducer from "./slices/pendingRegistrationFeeSlice";
import allSubLedgersPendingFeeReducer from "./slices/allSubLedgersPendingFeeSlice";
import hostelFacilityReportReducer from "./slices/hostelFacilityReportSlice";
import duplicateHostelBusPassReducer from "./slices/duplicateHostelBusPassSlice";
import dayBookAllSubLedgersReducer from "./slices/dayBookAllSubLedgersSlice"; // <-- import
import refundReportReducer from "./slices/refundReportSlice";
import feeSubLedgerReducer from "./slices/feeSubLedgerSlice";
import allRecordsReducer from "./slices/allRecordsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    masterAnnualFee: masterAnnualFeeReducer,
    masterCategory: masterCategoryReducer,
    hostelBusValidity: hostelBusValidityReducer,
    masterDevFund: masterDevFundReducer,
    studentDetails: studentDetailsReducer,
    admissionFee:admissionFeeReducer,
    dayBook: dayBookReducer,
    customSubLedgers: customSubLedgersReducer,
    cancelReceipt: cancelReceiptReducer,
    deadDebits : deadDebitsReducer,
    facility: facilityReducer,
    receiptUpdate: receiptUpdateReducer,
    concession:concessionSliceReducer,
    feeReport: feeReportReducer,
    hostelReport: hostelReportReducer,
    debitEntry: debitEntryReducer,
    ledgerStatus: ledgerStatusReducer,
    routeStopage: routeStopageReducer,
    routeWiseReport: routeWiseReportReducer,
    receiptSearch: receiptSearchReducer,
    searchByAddress: searchByAddressReducer,
    studentActivityFund: studentActivityFundReducer,
    pendingRegistrationFee: pendingRegistrationFeeReducer,
    allSubLedgersPendingFee: allSubLedgersPendingFeeReducer,
    hostelFacilityReport: hostelFacilityReportReducer,
    duplicateHostelBusPass: duplicateHostelBusPassReducer,
    dayBookAllSubLedgers: dayBookAllSubLedgersReducer, // <-- key must match state.dayBookAllSubLedgers
    refundReport: refundReportReducer,
    feeSubLedger: feeSubLedgerReducer,
    allRecords: allRecordsReducer,





  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
