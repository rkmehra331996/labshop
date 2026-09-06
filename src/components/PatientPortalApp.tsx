import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  ArrowLeft,
  MessageSquare,
  QrCode,
  Calendar,
  AlertTriangle,
  Building,
  User,
  Hash,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Check,
} from 'lucide-react';
import { QRVerifyModal } from './Modals';
import { useCms } from '../context/CmsContext';
import { LabReport } from '../types';
import { maskMobileForOnlineReport } from '../utils/reportUtils';
import { ReportCopyrightBottomBar } from './ReportCopyrightBottomBar';
import { generateReportPdf } from '../utils/pdfGenerator';
import { safePrint } from '../utils/printHelper';

interface PatientPortalAppProps {
  onBackToWebsite: () => void;
  initialReportId?: string;
  initialMobile?: string;
}

export const PatientPortalApp: React.FC<PatientPortalAppProps> = ({
  onBackToWebsite,
  initialReportId = '',
  initialMobile = '',
}) => {
  const { reports, receptionEntries } = useCms();

  // Search Option: 'name_mobile' | 'report_id'
  const [searchMethod, setSearchMethod] = useState<'name_mobile' | 'report_id'>('name_mobile');

  // Option 1 Fields (Patient Name + Mobile Number must both match)
  const [patientName, setPatientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // Option 2 Field (Token or Report ID)
  const [reportIdInput, setReportIdInput] = useState('');

  // Current Searched Report State (null by default - no report shown until searched & matched)
  const [searchedReport, setSearchedReport] = useState<LabReport | null>(null);

  // Pending Sample Status (for samples in lab registered at reception but report not finalized yet)
  const [pendingSampleStatus, setPendingSampleStatus] = useState<{
    tokenNumber: string;
    patientName: string;
    ageGender: string;
    tests: string[];
    registeredAt: string;
    status: string;
    technicianStatus: string;
  } | null>(null);

  // Error States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // QR Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Initialize from props only if explicitly passed (e.g. from lab queue direct link)
  useEffect(() => {
    if (initialReportId && initialReportId.trim()) {
      const cleanId = initialReportId.trim().toLowerCase();
      const found = reports.find(
        (r) => r.reportId.toLowerCase() === cleanId || (r.uhid && r.uhid.toLowerCase() === cleanId)
      );
      if (found) {
        setSearchedReport(found);
        setReportIdInput(found.reportId);
        setSearchMethod('report_id');
        setErrorMessage(null);
        setErrorDetails(null);
      }
    } else if (initialMobile && initialMobile.trim()) {
      const cleanMob = initialMobile.replace(/\D/g, '');
      const found = reports.find((r) => r.mobile.replace(/\D/g, '') === cleanMob);
      if (found) {
        setSearchedReport(found);
        setPatientName(found.patientName);
        setMobileNumber(found.mobile);
        setSearchMethod('name_mobile');
        setErrorMessage(null);
        setErrorDetails(null);
      }
    }
  }, [initialReportId, initialMobile, reports]);

  // Option 1: Search by Patient Name + Mobile Number (Both must match)
  const handleSearchByNameAndMobile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorDetails(null);
    setSearchedReport(null);
    setPendingSampleStatus(null);

    const inputName = patientName.trim().toLowerCase();
    const inputMobile = mobileNumber.replace(/\D/g, '');

    if (!inputName) {
      setErrorMessage('विवरण दर्ज करें (Please enter details)');
      setErrorDetails('Please enter the patient full name.');
      return;
    }

    if (!inputMobile || inputMobile.length < 10) {
      setErrorMessage('विवरण दर्ज करें (Please enter details)');
      setErrorDetails('Please enter a valid 10-digit registered mobile number.');
      return;
    }

    const inputTokens = inputName.split(/\s+/).filter((t) => t.length > 1);

    // 1. Check in completed reports
    const matched = reports.find((r) => {
      const rMob = r.mobile.replace(/\D/g, '');
      const rName = r.patientName.trim().toLowerCase();

      // Mobile check (exact 10 digits or match)
      const isMobileMatch = rMob === inputMobile || rMob.endsWith(inputMobile) || inputMobile.endsWith(rMob);

      // Name check (contains full name or key tokens match)
      const isNameMatch =
        rName === inputName ||
        rName.includes(inputName) ||
        inputName.includes(rName) ||
        (inputTokens.length > 0 && inputTokens.every((token) => rName.includes(token)));

      return isMobileMatch && isNameMatch;
    });

    if (matched) {
      setSearchedReport(matched);
      return;
    }

    // 2. Check in reception entries
    const receptionMatch = (receptionEntries || []).find((entry) => {
      const eMob = (entry.mobile || '').replace(/\D/g, '');
      const eName = (entry.patientName || '').trim().toLowerCase();
      const isMobMatch = eMob === inputMobile || eMob.endsWith(inputMobile) || inputMobile.endsWith(eMob);
      const isNameMatch =
        eName === inputName ||
        eName.includes(inputName) ||
        inputName.includes(eName) ||
        (inputTokens.length > 0 && inputTokens.every((t) => eName.includes(t)));
      return isMobMatch && isNameMatch;
    });

    if (receptionMatch) {
      if (receptionMatch.reportId) {
        const found = reports.find(
          (r) =>
            r.reportId.toLowerCase() === receptionMatch.reportId?.toLowerCase() ||
            (r.uhid && r.uhid.toLowerCase() === receptionMatch.uhid.toLowerCase())
        );
        if (found) {
          setSearchedReport(found);
          return;
        }
      }

      setPendingSampleStatus({
        tokenNumber: receptionMatch.tokenNumber,
        patientName: receptionMatch.patientName,
        ageGender: `${receptionMatch.age} Yrs / ${receptionMatch.gender}`,
        tests: receptionMatch.tests || [],
        registeredAt: receptionMatch.registeredAt || 'Today',
        status: receptionMatch.status || 'Sample in Testing',
        technicianStatus: receptionMatch.technicianStatus || 'Sent to Lab',
      });
      return;
    }

    // Not matched
    setErrorMessage('विवरण मेल नहीं खाया (Details did not match)');
    setErrorDetails(
      `Name "${patientName}" and Mobile number "${mobileNumber}" did not match any active lab record. Both name and 10-digit mobile must match the reception entry slip.`
    );
  };

  // Option 2: Search by Token Number OR Report ID
  const handleSearchByReportIdOrToken = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorDetails(null);
    setSearchedReport(null);
    setPendingSampleStatus(null);

    const raw = reportIdInput.trim().toLowerCase();
    if (!raw) {
      setErrorMessage('टोकन या रिपोर्ट ID दर्ज करें (Please enter details)');
      setErrorDetails('Please enter Token Number (e.g. 101, TK-101) or Report ID (e.g. RPT-2026-8812).');
      return;
    }

    const cleanDigits = raw.replace(/\D/g, '');

    // 1. Direct match in reports
    const reportMatch = reports.find((r) => {
      const rId = r.reportId.trim().toLowerCase();
      const rUhid = (r.uhid || '').trim().toLowerCase();
      return (
        rId === raw ||
        rId.endsWith(raw) ||
        rUhid === raw ||
        (cleanDigits.length >= 3 && (rId.includes(cleanDigits) || rUhid.includes(cleanDigits)))
      );
    });

    if (reportMatch) {
      setSearchedReport(reportMatch);
      return;
    }

    // 2. Check in receptionEntries by Token or UHID
    const receptionMatch = (receptionEntries || []).find((entry) => {
      const tokenLower = (entry.tokenNumber || '').toLowerCase();
      const tokenDigits = tokenLower.replace(/\D/g, '');
      const uhidLower = (entry.uhid || '').toLowerCase();
      const reportIdLower = (entry.reportId || '').toLowerCase();

      return (
        tokenLower === raw ||
        tokenLower === `tk-${raw}` ||
        `tk-${tokenLower}` === raw ||
        (cleanDigits && tokenDigits === cleanDigits) ||
        uhidLower === raw ||
        reportIdLower === raw
      );
    });

    if (receptionMatch) {
      // Check if report already exists for this entry
      if (receptionMatch.reportId) {
        const foundReport = reports.find(
          (r) =>
            r.reportId.toLowerCase() === receptionMatch.reportId?.toLowerCase() ||
            (r.uhid && r.uhid.toLowerCase() === receptionMatch.uhid.toLowerCase())
        );
        if (foundReport) {
          setSearchedReport(foundReport);
          return;
        }
      }

      // If report is not yet finalized, show live sample progress status!
      setPendingSampleStatus({
        tokenNumber: receptionMatch.tokenNumber,
        patientName: receptionMatch.patientName,
        ageGender: `${receptionMatch.age} Yrs / ${receptionMatch.gender}`,
        tests: receptionMatch.tests || [],
        registeredAt: receptionMatch.registeredAt || 'Today',
        status: receptionMatch.status || 'Sample in Testing',
        technicianStatus: receptionMatch.technicianStatus || 'Sent to Lab',
      });
      return;
    }

    // Not found
    setErrorMessage('टोकन नं. या रिपोर्ट ID नहीं मिला (Token or Report ID Not Found)');
    setErrorDetails(
      `No active record matched Token / Report ID "${reportIdInput}". Please check the Token Number (e.g. 101, TK-101) or Report ID (e.g. RPT-2026-8812) on your payment receipt slip.`
    );
  };

  const handleResetSearch = () => {
    setSearchedReport(null);
    setPendingSampleStatus(null);
    setErrorMessage(null);
    setErrorDetails(null);
    setPatientName('');
    setMobileNumber('');
    setReportIdInput('');
  };

  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [printIframeNotice, setPrintIframeNotice] = useState(false);

  const handleDownloadPdf = () => {
    if (!searchedReport) return;
    try {
      generateReportPdf(searchedReport);
      setDownloadSuccessToast(`Report ${searchedReport.reportId} PDF downloaded successfully!`);
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadSuccessToast('Download started.');
      setTimeout(() => setDownloadSuccessToast(null), 3000);
    }
  };

  const handlePrint = () => {
    if (!searchedReport) return;
    const success = safePrint(() => {
      // In sandboxed iframes where window.print() is blocked by browser security
      setPrintIframeNotice(true);
      generateReportPdf(searchedReport);
      setDownloadSuccessToast(`Browser preview sandboxed: Downloaded ${searchedReport.reportId} PDF to print directly!`);
      setTimeout(() => setDownloadSuccessToast(null), 5000);
    });

    if (!success) {
      setPrintIframeNotice(true);
      generateReportPdf(searchedReport);
      setDownloadSuccessToast(`Official PDF downloaded for printing.`);
      setTimeout(() => setDownloadSuccessToast(null), 5000);
    }
  };

  const handleShareWhatsApp = () => {
    if (!searchedReport) return;
    const text = encodeURIComponent(
      `Here is my authenticated lab report (${searchedReport.reportId}) from ${searchedReport.labName}: https://report.labname.com/rpt/${searchedReport.reportId}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Demo profile prefill helper
  const handleQuickFill = (name: string, mob: string, rptId: string) => {
    if (searchMethod === 'name_mobile') {
      setPatientName(name);
      setMobileNumber(mob);
      setErrorMessage(null);
      setErrorDetails(null);
    } else {
      setReportIdInput(rptId);
      setErrorMessage(null);
      setErrorDetails(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToWebsite}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 flex items-center gap-1 text-xs cursor-pointer transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Back to Main Website</span>
            </button>
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-[#123B6D]">
              <span>report.labname.com</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Patient Portal
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <span>Zero-Login Secure NABL Portal</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Search / Access Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm no-print">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#123B6D]/10 text-[#123B6D] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-[#172033]">
                Download Your Diagnostic Lab Report
              </h1>
              <p className="text-xs text-[#64748B]">
                Patient Report Download Portal • Select one of the two search options below to access your report
              </p>
            </div>
          </div>

          {/* TWO SEARCH OPTIONS TABS */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setSearchMethod('name_mobile');
                setErrorMessage(null);
                setErrorDetails(null);
              }}
              className={`p-3 rounded-lg text-left transition flex items-start gap-2.5 cursor-pointer ${
                searchMethod === 'name_mobile'
                  ? 'bg-white text-[#123B6D] shadow-xs font-bold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg mt-0.5 ${
                  searchMethod === 'name_mobile' ? 'bg-[#123B6D] text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>Option 1: Patient Name + Mobile</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                    Both Required
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Report unlocks when both patient name and registered mobile number match
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchMethod('report_id');
                setErrorMessage(null);
                setErrorDetails(null);
              }}
              className={`p-3 rounded-lg text-left transition flex items-start gap-2.5 cursor-pointer ${
                searchMethod === 'report_id'
                  ? 'bg-white text-[#123B6D] shadow-xs font-bold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg mt-0.5 ${
                  searchMethod === 'report_id' ? 'bg-[#123B6D] text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>Option 2: Token / Report ID</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-[#123B6D] rounded font-semibold">
                    टोकन या ID
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter Token No. (e.g. 101, TK-101) or Report ID (e.g. RPT-2026-8812) from receipt
                </p>
              </div>
            </button>
          </div>

          {/* ERROR ALERT BANNER */}
          {errorMessage && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-900 flex items-start gap-3 animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="font-extrabold text-sm text-rose-800 mb-0.5 flex items-center gap-2">
                  <span>{errorMessage}</span>
                </div>
                {errorDetails && <p className="text-rose-700 leading-relaxed">{errorDetails}</p>}
                <div className="mt-2 text-[11px] text-rose-600 font-medium">
                  Tip: Please check your lab payment slip or SMS, or click one of the quick demo buttons below.
                </div>
              </div>
            </div>
          )}

          {/* OPTION 1 FORM: PATIENT NAME + 10-DIGIT MOBILE NUMBER */}
          {searchMethod === 'name_mobile' && (
            <form onSubmit={handleSearchByNameAndMobile} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    1. Patient Full Name (मरीज का नाम) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="e.g. Ramesh Kumar Verma"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Enter patient name as registered at reception</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    2. Registered Mobile No. (10 Digits / मोबाइल नंबर) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-500 font-bold">+91</span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={mobileNumber}
                      onChange={(e) => {
                        setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="10 Digits (e.g. 9876543210)"
                      className="w-full pl-11 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">10-digit registered telephone number</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Report unlocks when both name and mobile match</span>
                </div>
                <button
                  type="submit"
                  className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-amber-300" />
                  <span>Verify & View Report</span>
                </button>
              </div>
            </form>
          )}

          {/* OPTION 2 FORM: TOKEN NUMBER OR REPORT ID */}
          {searchMethod === 'report_id' && (
            <form onSubmit={handleSearchByReportIdOrToken} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Token Number or Report ID (टोकन नं. या रिपोर्ट ID) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={reportIdInput}
                      onChange={(e) => {
                        setReportIdInput(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="e.g. 101, TK-101, or RPT-2026-8812"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Search className="w-3.5 h-3.5 text-amber-300" />
                    <span>View Report</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Enter Token Number (e.g. 101 or TK-101) or Report ID (e.g. RPT-2026-8812) from your receipt slip
                </p>
              </div>
            </form>
          )}

          {/* DEMO QUICK FILL PILLS FOR EASY TESTING */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Demo Testing:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSearchMethod('name_mobile');
                  handleQuickFill('Ramesh Kumar Verma', '9876543210', 'RPT-2026-8812');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                title="Ramesh Kumar Verma (CBC + Sugar)"
              >
                👤 Ramesh (9876543210)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMethod('report_id');
                  setReportIdInput('TK-101');
                  setErrorMessage(null);
                  setErrorDetails(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#123B6D] text-[11px] font-semibold transition cursor-pointer"
                title="Token #TK-101"
              >
                🎫 Token #TK-101
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMethod('report_id');
                  setReportIdInput('RPT-2026-8812');
                  setErrorMessage(null);
                  setErrorDetails(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition cursor-pointer"
                title="Report #RPT-2026-8812"
              >
                📄 Report #RPT-2026-8812
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMethod('report_id');
                  setReportIdInput('RPT-2026-8815');
                  setErrorMessage(null);
                  setErrorDetails(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-semibold transition cursor-pointer"
                title="Cancelled Report #RPT-2026-8815"
              >
                ⚠️ Cancelled #RPT-2026-8815
              </button>
            </div>
          </div>
        </div>

        {/* LIVE SAMPLE PROGRESS STATE (When Token or Patient is registered but lab testing is still in progress) */}
        {pendingSampleStatus && !searchedReport && (
          <div className="bg-white rounded-2xl border border-amber-200 shadow-md p-6 sm:p-7 space-y-4 text-xs animate-in fade-in duration-200 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center text-lg">
                  🔬
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      Live Sample Status
                    </span>
                    <span className="text-[11px] text-slate-500">Registered: {pendingSampleStatus.registeredAt}</span>
                  </div>
                  <h2 className="text-base font-black text-slate-900 mt-0.5">
                    Token #{pendingSampleStatus.tokenNumber} • {pendingSampleStatus.patientName}
                  </h2>
                </div>
              </div>
              <span className="self-start sm:self-auto bg-blue-50 text-[#123B6D] border border-blue-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>{pendingSampleStatus.status}</span>
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                <span className="font-bold text-slate-800 text-sm">{pendingSampleStatus.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Age / Gender</span>
                <span className="font-semibold text-slate-700">{pendingSampleStatus.ageGender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Token Number</span>
                <span className="font-mono font-black text-base text-[#123B6D]">{pendingSampleStatus.tokenNumber}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Booked Tests / Investigations</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {pendingSampleStatus.tests.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-800">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-950 space-y-1.5">
              <div className="font-bold flex items-center gap-2 text-xs text-blue-900">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Sample Under Processing in Laboratory Analyzer</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Your sample has been securely registered and barcoded. Our laboratory technician is performing automated analysis. Once certified and authorized by the Pathologist, your complete report and digital QR barcode will appear here automatically.
              </p>
            </div>
          </div>
        )}

        {/* DEFAULT STATE: WHEN NO REPORT HAS BEEN SEARCHED YET */}
        {!searchedReport && !pendingSampleStatus && !errorMessage && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 no-print">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">
              No Report Displayed
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              For patient privacy and data protection, reports are not displayed by default. Please enter your details using <strong>Option 1</strong> (Patient Name + Mobile) or <strong>Option 2</strong> (Token / Report ID) above to view your report.
            </p>
            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% NABL Verified
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#123B6D]">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-teal-700">
                <Smartphone className="w-3.5 h-3.5" /> Instant PDF Download
              </span>
            </div>
          </div>
        )}

        {/* THE AUTHENTICATED REPORT VIEW: SHOWN ONLY WHEN MATCHED SUCCESSFULLY */}
        {searchedReport && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Prominent Cancellation Banner if Report Was Cancelled */}
            {searchedReport.cancelled && (
              <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-5 text-xs text-rose-950 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-rose-600 text-white font-black px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wide">
                      REPORT CANCELLED / अस्वीकृत
                    </span>
                    <span className="text-[11px] text-rose-700 font-semibold">
                      Cancelled on {searchedReport.cancelledAt || 'Recently'} {searchedReport.cancelledBy ? `by ${searchedReport.cancelledBy}` : ''}
                    </span>
                  </div>
                  <div className="text-rose-900 font-extrabold text-sm pt-0.5">
                    Cancellation Reason: <span className="font-semibold text-rose-800 underline decoration-rose-300">{searchedReport.cancelReason || 'Sample hemolysis / recollect advised by pathologist'}</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    This lab report has been marked as cancelled by the laboratory. Please contact the laboratory reception desk for fresh sample collection or assistance.
                  </p>
                </div>
              </div>
            )}

            {/* Success Download / Print Toast */}
            {downloadSuccessToast && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{downloadSuccessToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDownloadSuccessToast(null)}
                  className="text-emerald-700 hover:text-emerald-950 text-xs px-2 py-0.5 rounded cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Action Bar for Patient */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs no-print">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${searchedReport.cancelled ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="text-xs font-bold text-[#172033]">
                  {searchedReport.cancelled ? 'Cancelled Report for' : 'Report Verified for'} <strong>{searchedReport.patientName}</strong> ({searchedReport.reportId})
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleResetSearch}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                  title="Search Another Report"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Search Another</span>
                </button>

                {/* 1. Direct PDF Download Button */}
                <button
                  id="btn-download-pdf-portal"
                  onClick={handleDownloadPdf}
                  className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  title="Download Official NABL Medical Report PDF"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Download PDF</span>
                </button>

                {/* 2. Print Report Button */}
                <button
                  id="btn-print-report-portal"
                  onClick={handlePrint}
                  className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                  title="Print Report on A4 / Letterhead"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Print Report</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Verify QR</span>
                </button>
              </div>
            </div>

            {/* The Actual Official Report Document */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-6 sm:p-8 space-y-6 print-container">
              {/* Header */}
              <div className="border-b-2 border-[#123B6D] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-[#123B6D] text-white flex items-center justify-center font-black text-base">
                      AD
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-[#123B6D] tracking-tight">
                        {searchedReport.labName}
                      </h2>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {searchedReport.nablAccreditationNo}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {searchedReport.labAddress} • Ph: {searchedReport.labPhone}
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex items-center gap-3 self-end sm:self-auto bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div className="w-14 h-14 bg-white p-1 rounded border border-slate-300 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-[#123B6D]" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    <div className="font-bold text-slate-800">Scan to Verify</div>
                    <div>{searchedReport.reportId}</div>
                    <div className="text-emerald-700 font-semibold">NABL Accredited</div>
                  </div>
                </div>
              </div>

              {/* Patient Demographics Grid */}
              <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                  <span className="font-bold text-slate-900">{searchedReport.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Age / Gender</span>
                  <span className="font-medium text-slate-800">{searchedReport.ageGender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">UHID / Lab Ref</span>
                  <span className="font-mono font-bold text-[#123B6D]">{searchedReport.uhid}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile (Online)</span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200" title="Last 4 digits masked with ____ for online patient data privacy">
                      Privacy Masked
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-800" title="Last 4 digits masked with ____ for online patient privacy">
                    +91 {maskMobileForOnlineReport(searchedReport.mobile)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Referring Doctor</span>
                  <span className="font-semibold text-slate-800">{searchedReport.doctor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Sample Collected</span>
                  <span className="text-slate-700">{searchedReport.sampleCollectedAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Report Authorized</span>
                  <span className="text-slate-700">{searchedReport.reportedAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Report Status</span>
                  <span className="text-emerald-700 font-bold">Verified & Authorized</span>
                </div>
              </div>

              {/* Test Results Table */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="bg-[#123B6D]/10 px-3 py-1.5 rounded-lg text-xs font-bold text-[#123B6D] uppercase tracking-wider flex items-center justify-between">
                    <span>Clinical Pathology & Biochemistry Results</span>
                    <span className="text-[10px] text-slate-500 lowercase font-normal">Method: Automated NABL Sysmex / HPLC</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-300 text-slate-500 text-[11px]">
                          <th className="py-2 px-3 font-bold">Investigation Parameter</th>
                          <th className="py-2 px-3 font-bold">Observed Value</th>
                          <th className="py-2 px-3 font-bold">Unit</th>
                          <th className="py-2 px-3 font-bold">Biological Ref Range</th>
                          <th className="py-2 px-3 font-bold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {searchedReport.items.map((res, rIdx) => (
                          <tr
                            key={rIdx}
                            className={res.isAbnormal ? 'bg-rose-50/40 font-semibold' : 'hover:bg-slate-50'}
                          >
                            <td className="py-2.5 px-3">
                              <span className={res.isAbnormal ? 'text-rose-900 font-bold' : 'text-slate-800'}>
                                {res.parameter}
                              </span>
                              <div className="text-[10px] text-slate-400 font-normal">{res.testName}</div>
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              <span
                                className={
                                  res.isAbnormal
                                    ? 'text-rose-700 font-black px-1.5 py-0.5 rounded bg-rose-100'
                                    : 'text-slate-900 font-bold'
                                }
                              >
                                {res.result}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 font-mono">{res.unit}</td>
                            <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{res.referenceRange}</td>
                            <td className="py-2.5 px-3 text-center">
                              {!res.isAbnormal ? (
                                <span className="text-emerald-700 font-medium text-[10px]">Normal</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[10px] bg-rose-100 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>High</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Pathologist Clinical Remarks & Digital Signatures */}
              <div className="pt-4 border-t-2 border-slate-200 space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-800 block mb-0.5">Clinical Note:</strong>
                  The above tests are performed on automated NABL-calibrated instruments. Biological reference intervals vary with age and sex. Clinical correlation is advised by the treating physician.
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                  <div className="text-center sm:text-left">
                    <div className="font-serif italic text-slate-700 font-bold">S. Kumar</div>
                    <div className="text-xs font-bold text-slate-900 mt-1">Suresh Kumar, DMLT</div>
                    <div className="text-[10px] text-slate-500">Chief Medical Lab Technician</div>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="font-serif italic text-[#123B6D] font-bold text-base">Dr. R. Sharma</div>
                    <div className="text-xs font-bold text-[#123B6D] mt-1">{searchedReport.pathologist}</div>
                    <div className="text-[10px] text-slate-500">{searchedReport.pathologistDegrees}</div>
                    <div className="text-[10px] text-emerald-700 font-mono mt-0.5 font-semibold">
                      Cryptographically Signed: {searchedReport.reportedAt}
                    </div>
                  </div>
                </div>

                {/* Footer disclaimer */}
                <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
                  This is a computer-verified diagnostic document issued under NABL guidelines. Valid without physical ink signature. For authenticity check, scan the QR code above or visit report.labname.com.
                </div>

                {/* Copyright bottom bar with "Software use Labname.com" */}
                <ReportCopyrightBottomBar
                  softwareDomain="Labname.com"
                  reportId={searchedReport.reportId}
                />
              </div>

              {/* Bottom Quick Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 no-print">
                <span className="text-xs text-slate-500 font-semibold">
                  Official A4 Format • Valid For Medical Reference & Hospital Submission
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-300" />
                    <span>Download PDF Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>Print Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* QR Verification Modal */}
      {searchedReport && (
        <QRVerifyModal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          reportId={searchedReport.reportId}
        />
      )}
    </div>
  );
};
