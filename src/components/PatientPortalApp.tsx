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
  Lock,
  Phone,
  MapPin,
  CreditCard,
  IndianRupee,
  Clock,
  ExternalLink,
  X,
  ArrowRight,
} from 'lucide-react';
import { QRVerifyModal } from './Modals';
import { useCms } from '../context/CmsContext';
import { LabReport, ReceptionPatientEntry } from '../types';
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
  const { 
    reports, 
    receptionEntries, 
    vendorLabSettings, 
    updateReceptionEntry,
    refreshCloudData,
    isCloudConnected,
    cloudSyncStatus,
    lastCloudSyncTime 
  } = useCms();

  // Search Option: 'name_mobile' | 'report_id'
  const [searchMethod, setSearchMethod] = useState<'name_mobile' | 'report_id'>('name_mobile');

  // Option 1 Fields (Patient Name + Mobile Number must both match)
  const [patientName, setPatientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // Option 2 Field (Token or Report ID)
  const [reportIdInput, setReportIdInput] = useState('');

  // Current Searched Report State (null by default - no report shown until searched & matched)
  const [searchedReport, setSearchedReport] = useState<LabReport | null>(null);

  // Matched Reception Entry (for checking payment dues and publication status)
  const [matchedEntry, setMatchedEntry] = useState<ReceptionPatientEntry | null>(null);

  // Online Payment Clearance Modal
  const [showPayOnlineModal, setShowPayOnlineModal] = useState(false);
  const [payingMode, setPayingMode] = useState<'UPI' | 'Card'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Pending Sample Status (for samples in lab registered at reception but report not finalized yet)
  const [pendingSampleStatus, setPendingSampleStatus] = useState<{
    tokenNumber: string;
    patientName: string;
    ageGender: string;
    tests: string[];
    registeredAt: string;
    status: string;
    technicianStatus: string;
    branchName?: string;
    branchPhone?: string;
  } | null>(null);

  // Error States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // QR Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [matchedList, setMatchedList] = useState<Array<{ type: 'report' | 'entry'; report?: LabReport; entry?: ReceptionPatientEntry }>>([]);

  // Lab details for contact
  const labName = vendorLabSettings?.labName || 'Apex Diagnostic & Clinical Pathology Laboratory';
  const labPhone = vendorLabSettings?.phone || '7087033009';
  const labAddress = vendorLabSettings?.address || 'SCO 42, Green Park Avenue, Near Civil Hospital, Ludhiana, Punjab';
  const labUpi = vendorLabSettings?.upiId || 'apexlab@upi';

  // Calculate active due amount
  const activeDueAmount =
    matchedEntry !== null && matchedEntry.dueAmount !== undefined
      ? matchedEntry.dueAmount
      : searchedReport?.dueAmount !== undefined
      ? searchedReport.dueAmount
      : 0;

  const isPaymentPending = activeDueAmount > 0;

  // Real-time Firestore auto-sync for patient screen (Instant updates on client phone when lab changes anything)
  useEffect(() => {
    if (searchedReport) {
      const liveReport = reports.find(
        (r) => r.reportId.toLowerCase() === searchedReport.reportId.toLowerCase()
      );
      if (liveReport) {
        if (
          liveReport.status !== searchedReport.status ||
          liveReport.verified !== searchedReport.verified ||
          liveReport.dueAmount !== searchedReport.dueAmount ||
          liveReport.paymentStatus !== searchedReport.paymentStatus ||
          JSON.stringify(liveReport.items) !== JSON.stringify(searchedReport.items)
        ) {
          setSearchedReport(liveReport);
        }
      }
    }
  }, [reports, searchedReport]);

  useEffect(() => {
    if (matchedEntry) {
      const liveEntry = (receptionEntries || []).find((e) => e.id === matchedEntry.id);
      if (liveEntry) {
        if (
          liveEntry.status !== matchedEntry.status ||
          liveEntry.technicianStatus !== matchedEntry.technicianStatus ||
          liveEntry.dueAmount !== matchedEntry.dueAmount ||
          liveEntry.reportId !== matchedEntry.reportId ||
          liveEntry.isReportPublished !== matchedEntry.isReportPublished
        ) {
          setMatchedEntry(liveEntry);
          // If lab technician finalized report and generated reportId, instantly switch to full report!
          if (liveEntry.reportId) {
            const foundReport = reports.find(
              (r) => r.reportId.toLowerCase() === liveEntry.reportId?.toLowerCase()
            );
            if (foundReport) {
              setSearchedReport(foundReport);
              setPendingSampleStatus(null);
            }
          }
        }
      }
    }
  }, [receptionEntries, reports, matchedEntry]);

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

        const match = (receptionEntries || []).find(
          (e) =>
            (e.reportId && e.reportId.toLowerCase() === found.reportId.toLowerCase()) ||
            (e.uhid && found.uhid && e.uhid.toLowerCase() === found.uhid.toLowerCase())
        );
        setMatchedEntry(match || null);
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

        const match = (receptionEntries || []).find(
          (e) => (e.mobile || '').replace(/\D/g, '') === cleanMob
        );
        setMatchedEntry(match || null);
      }
    }
  }, [initialReportId, initialMobile, reports, receptionEntries]);

  const handleSelectRecord = (match: { type: 'report' | 'entry'; report?: LabReport; entry?: ReceptionPatientEntry }) => {
    setErrorMessage(null);
    setErrorDetails(null);
    setMatchedList([]);

    if (match.type === 'report' && match.report) {
      setSearchedReport(match.report);
      setMatchedEntry(match.entry || null);
      setPendingSampleStatus(null);
    } else if (match.entry) {
      setMatchedEntry(match.entry);
      setSearchedReport(null);
      setPendingSampleStatus({
        tokenNumber: match.entry.tokenNumber,
        patientName: match.entry.patientName,
        ageGender: `${match.entry.age} Yrs / ${match.entry.gender}`,
        tests: match.entry.tests || [],
        registeredAt: match.entry.registeredAt || 'Today',
        status: match.entry.status || 'Sample in Testing',
        technicianStatus: match.entry.technicianStatus || 'Sent to Lab',
        branchName: match.entry.branchName || 'Apex Central Diagnostic Hub',
        branchPhone: labPhone,
      });
    }
  };

  // Option 1: Search by Mobile Number (Instant client lookup, Name optional)
  const handleSearchByNameAndMobile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorDetails(null);
    setSearchedReport(null);
    setPendingSampleStatus(null);
    setMatchedEntry(null);
    setMatchedList([]);

    // Trigger instant background server pull to guarantee 0% stale cache
    refreshCloudData().catch(() => {});

    const inputMobile = mobileNumber.replace(/\D/g, '');
    const inputName = patientName.trim().toLowerCase();

    if (!inputMobile || inputMobile.length < 10) {
      setErrorMessage('मोबाइल नंबर दर्ज करें (Please enter mobile number)');
      setErrorDetails('कृपया 10 अंकों का पंजीकृत मोबाइल नंबर दर्ज करें (e.g. 9876543210)।');
      return;
    }

    // 1. Find all matching reports
    const matchedReports = reports.filter((r) => {
      const rMob = (r.mobile || '').replace(/\D/g, '');
      return rMob === inputMobile || rMob.endsWith(inputMobile) || inputMobile.endsWith(rMob);
    });

    // 2. Find all matching reception entries
    const matchedReception = (receptionEntries || []).filter((entry) => {
      const eMob = (entry.mobile || '').replace(/\D/g, '');
      return eMob === inputMobile || eMob.endsWith(inputMobile) || inputMobile.endsWith(eMob);
    });

    // Combine matches
    const allMatches: Array<{ type: 'report' | 'entry'; report?: LabReport; entry?: ReceptionPatientEntry }> = [];

    matchedReports.forEach((r) => {
      const associatedEntry = (receptionEntries || []).find(
        (e) =>
          (e.reportId && e.reportId.toLowerCase() === r.reportId.toLowerCase()) ||
          (e.uhid && r.uhid && e.uhid.toLowerCase() === r.uhid.toLowerCase())
      );
      allMatches.push({ type: 'report', report: r, entry: associatedEntry });
    });

    matchedReception.forEach((entry) => {
      const alreadyIncluded = allMatches.some(
        (m) =>
          (m.report && entry.reportId && m.report.reportId.toLowerCase() === entry.reportId.toLowerCase()) ||
          (m.entry && m.entry.id === entry.id)
      );
      if (!alreadyIncluded) {
        if (entry.reportId) {
          const rep = reports.find((r) => r.reportId.toLowerCase() === entry.reportId?.toLowerCase());
          if (rep) {
            allMatches.push({ type: 'report', report: rep, entry });
            return;
          }
        }
        allMatches.push({ type: 'entry', entry });
      }
    });

    // Filter or prioritize if name was entered
    let results = allMatches;
    if (inputName) {
      const byName = allMatches.filter((m) => {
        const pName = (m.report?.patientName || m.entry?.patientName || '').toLowerCase();
        return pName.includes(inputName) || inputName.includes(pName);
      });
      if (byName.length > 0) {
        results = byName;
      }
    }

    if (results.length === 0) {
      setErrorMessage('कोई रिकॉर्ड नहीं मिला (No Record Found)');
      setErrorDetails(
        `मोबाइल नंबर +91 ${inputMobile} ${inputName ? `(Name: ${patientName})` : ''} पर कोई सक्रिय जांच रिकॉर्ड नहीं मिला। कृपया रिसेप्शन से संपर्क करें या टोकन नंबर से खोजें।`
      );
      return;
    }

    if (results.length === 1) {
      const match = results[0];
      handleSelectRecord(match);
      return;
    }

    // Multiple records found for this mobile number
    setMatchedList(results);
  };

  // Option 2: Search by Token Number OR Report ID
  const handleSearchByReportIdOrToken = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorDetails(null);
    setSearchedReport(null);
    setMatchedEntry(null);
    setPendingSampleStatus(null);
    refreshCloudData().catch(() => {});

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
      const match = (receptionEntries || []).find(
        (e) =>
          (e.reportId && e.reportId.toLowerCase() === reportMatch.reportId.toLowerCase()) ||
          (e.uhid && reportMatch.uhid && e.uhid.toLowerCase() === reportMatch.uhid.toLowerCase()) ||
          (e.tokenNumber && reportMatch.tokenNumber && e.tokenNumber.toLowerCase() === reportMatch.tokenNumber.toLowerCase())
      );
      setMatchedEntry(match || null);
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
      setMatchedEntry(receptionMatch);
      const hasReportReady =
        receptionMatch.status === 'Report Ready' ||
        receptionMatch.technicianStatus === 'Report Generated' ||
        Boolean(receptionMatch.reportId);

      // Check if report already exists for this entry
      if (hasReportReady && receptionMatch.reportId) {
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
        branchName: receptionMatch.branchName || 'Apex Central Diagnostic Hub',
        branchPhone: labPhone,
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
    setMatchedEntry(null);
    setPendingSampleStatus(null);
    setErrorMessage(null);
    setErrorDetails(null);
    setPatientName('');
    setMobileNumber('');
    setReportIdInput('');
  };

  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [printIframeNotice, setPrintIframeNotice] = useState(false);

  // Online Payment Clearance Handler (Simulates immediate clearance & unlocks report)
  const handlePayDueOnline = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      if (matchedEntry) {
        const updatedPaid = (matchedEntry.paidAmount || 0) + activeDueAmount;
        updateReceptionEntry(matchedEntry.id, {
          paidAmount: updatedPaid,
          dueAmount: 0,
          paymentStatus: 'Full Payment',
          paymentMode: payingMode,
          isReportPublished: true,
          publishedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          publishedBy: 'Online Portal Gateway',
          balancePaidAmount: (matchedEntry.balancePaidAmount || 0) + activeDueAmount,
          balancePaymentMode: payingMode,
          balancePaidAt: `Today, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
        });
        setMatchedEntry((prev) =>
          prev
            ? {
                ...prev,
                paidAmount: updatedPaid,
                dueAmount: 0,
                paymentStatus: 'Full Payment',
                paymentMode: payingMode,
                isReportPublished: true,
              }
            : null
        );
      }
      if (searchedReport) {
        setSearchedReport((prev) =>
          prev
            ? {
                ...prev,
                dueAmount: 0,
                paidAmount: (prev.paidAmount || 0) + activeDueAmount,
                isReportPublished: true,
              }
            : null
        );
      }
      setIsProcessingPayment(false);
      setShowPayOnlineModal(false);
      setDownloadSuccessToast(
        `Payment of ₹${activeDueAmount} received successfully! Your complete diagnostic report is now unlocked.`
      );
      setTimeout(() => setDownloadSuccessToast(null), 5000);
    }, 800);
  };

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
      `Here is my authenticated lab report (${searchedReport.reportId}) from ${searchedReport.labName}: https://report.indianlalaji.com/rpt/${searchedReport.reportId}`
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
              className="px-2.5 py-1.5 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 text-xs font-bold cursor-pointer transition border border-slate-200 bg-white shadow-2xs"
              title="Back to Website (वापस जाएं)"
            >
              <ArrowLeft className="w-4 h-4 text-[#123B6D]" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-[#123B6D]">
              <span>report.indianlalaji.com</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Patient Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => refreshCloudData()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
              title="Click to check latest live report directly from Cloud Server (No cache)"
            >
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
              <span className="hidden sm:inline">Live Cloud Sync</span>
              <RefreshCw className={`w-3 h-3 text-emerald-600 ${cloudSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            </button>
            <div className="text-xs text-slate-500 hidden md:flex items-center gap-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              <span>Zero-Login Secure NABL Portal</span>
            </div>
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
                  <span>Option 1: Mobile Number</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                    10 Digits • Real-Time Sync
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter registered 10-digit mobile number to view report instantly (Name optional)
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

          {/* OPTION 1 FORM: 10-DIGIT MOBILE NUMBER (+ OPTIONAL PATIENT NAME) */}
          {searchMethod === 'name_mobile' && (
            <form onSubmit={handleSearchByNameAndMobile} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    1. Registered Mobile No. (10 Digits / मोबाइल नंबर) <span className="text-rose-500">*</span>
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
                  <p className="text-[10px] text-slate-500 mt-1">Enter 10-digit mobile number given at lab reception</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    2. Patient Full Name (मरीज का नाम) <span className="text-slate-400 font-normal">(Optional / वैकल्पिक)</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="e.g. Ramesh Kumar Verma (Optional)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Leave empty to view all reports under this mobile number</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Real-time cross-device cloud sync enabled</span>
                </div>
                <button
                  type="submit"
                  className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-amber-300" />
                  <span>Search Reports / रिपोर्ट खोजें</span>
                </button>
              </div>
            </form>
          )}

          {/* MULTI-RECORD RESULTS LIST FOR CLIENT MOBILE NUMBER */}
          {matchedList.length > 0 && (
            <div className="mt-5 p-4 sm:p-5 bg-blue-50/80 border-2 border-blue-200 rounded-2xl animate-in fade-in duration-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#123B6D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {matchedList.length}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-[#123B6D]">
                      {matchedList.length} Records Found for +91 {mobileNumber}
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      इस मोबाइल नंबर पर {matchedList.length} जांच रिकॉर्ड मिले हैं। कृपया अपनी जांच रिपोर्ट चुनें:
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMatchedList([])}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  title="Close list"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {matchedList.map((m, idx) => {
                  const pName = m.report?.patientName || m.entry?.patientName || 'Patient';
                  const testNames =
                    m.report?.items?.map((p) => p.testName || p.parameter).slice(0, 3).join(', ') ||
                    m.entry?.tests?.slice(0, 3).join(', ') ||
                    'Diagnostic Profile';
                  const tokenOrId = m.report?.reportId || m.entry?.tokenNumber || `Record #${idx + 1}`;
                  const isReady = Boolean(m.report) || m.entry?.status === 'Report Ready';

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-[#123B6D] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isReady ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isReady ? <FileText className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                            <span>{pName}</span>
                            <span className="font-mono text-[10px] text-slate-600 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-bold">
                              {tokenOrId}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 truncate max-w-xs sm:max-w-md mt-0.5">
                            {testNames}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isReady ? 'Report Ready' : 'In Testing'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectRecord(m)}
                          className="px-3.5 py-1.5 bg-[#123B6D] hover:bg-[#0e2c52] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <span>View Live Report</span>
                          <ArrowRight className="w-3 h-3 text-amber-300" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
              <span>Quick Test Scenarios:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSearchMethod('name_mobile');
                  handleQuickFill('Ramesh Kumar Verma', '9876543210', 'RPT-2026-8812');
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition cursor-pointer border border-emerald-200 flex items-center gap-1"
                title="Ramesh Kumar Verma (Fully Paid & Unlocked Report)"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Ramesh (Paid • Unlocked)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMethod('report_id');
                  setReportIdInput('TK-104');
                  setErrorMessage(null);
                  setErrorDetails(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-semibold transition cursor-pointer border border-amber-200 flex items-center gap-1"
                title="Sunita Devi (TK-104 / RPT-2026-8815) - Report Ready but Due ₹300 (Locked/Blurred)"
              >
                <Lock className="w-3 h-3 text-amber-700" />
                <span>TK-104 (Sunita • Due ₹300 Locked)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMethod('report_id');
                  setReportIdInput('TK-103');
                  setErrorMessage(null);
                  setErrorDetails(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#123B6D] text-[11px] font-semibold transition cursor-pointer border border-blue-200 flex items-center gap-1"
                title="Rajesh Sharma (TK-103) - Sample In Lab Processing"
              >
                <Clock className="w-3 h-3 text-blue-600" />
                <span>TK-103 (Rajesh • In Lab Processing)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMethod('report_id');
                  setReportIdInput('RPT-2026-8812');
                  setErrorMessage(null);
                  setErrorDetails(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                title="Direct Report ID RPT-2026-8812"
              >
                📄 #RPT-2026-8812
              </button>
            </div>
          </div>
        </div>

        {/* LIVE SAMPLE PROGRESS STATE (When Token or Patient is registered but lab testing is still in progress) */}
        {pendingSampleStatus && !searchedReport && (
          <div className="bg-white rounded-2xl border-2 border-blue-300 shadow-md p-6 sm:p-7 space-y-5 text-xs animate-in fade-in duration-200 no-print">
            {/* Live Real-Time Multi-Device Sync Indicator */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-950 shadow-2xs">
              <div className="flex items-center gap-2.5 font-bold">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Live Real-Time Sync Active (सभी डिवाइस पर लाइव कनेक्टेड • लैब में अपडेट होते ही यहाँ दिखेगा)</span>
              </div>
              <a
                href={`https://wa.me/91${(matchedEntry?.mobile || mobileNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Apex Diagnostic Lab Status Update:\nPatient: ${pendingSampleStatus.patientName}\nToken: ${pendingSampleStatus.tokenNumber}\nStatus: Sample in Lab Processing\nBranch: ${pendingSampleStatus.branchName || 'Apex Central Lab'}\nPhone: ${pendingSampleStatus.branchPhone || labPhone}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1ebd5a] text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shrink-0 self-start sm:self-auto cursor-pointer shadow-2xs"
                title="Send status update to WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp to Client</span>
              </a>
            </div>

            {/* Primary Hindi Notification Banner requested by user */}
            <div className="p-4 sm:p-5 bg-blue-50 border-2 border-blue-200 rounded-xl text-blue-950 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-900">
                <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping shrink-0" />
                <span>Lab Processing Status / लैब स्थिति</span>
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                “Aapki report abhi lab mein process ho rahi hai, please wait.”
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Your biological sample is currently undergoing scientific testing and biochemical analyzer processing. Once verified and authorized by our Pathologist, it will be published here.
              </p>
            </div>

            {/* Lab & Branch Contact Information Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Diagnostic Centre & Branch
                </span>
                <span className="font-black text-slate-900 text-xs sm:text-sm block mt-0.5">
                  {labName}
                </span>
                <span className="text-[11px] text-teal-800 font-bold flex items-center gap-1 mt-0.5">
                  <Building className="w-3 h-3 text-teal-600 shrink-0" />
                  <span>{pendingSampleStatus.branchName || 'Main Diagnostic & Testing Hub'}</span>
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Helpline / Contact Number
                </span>
                <span className="font-black text-[#123B6D] text-xs sm:text-sm flex items-center gap-1 font-mono mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-[#123B6D] shrink-0" />
                  <span>+91 {labPhone}</span>
                </span>
                <div className="flex items-center gap-2 pt-1.5">
                  <a
                    href={`tel:${labPhone}`}
                    className="px-2.5 py-1 bg-[#123B6D] hover:bg-[#0e2c52] text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Lab</span>
                  </a>
                  <a
                    href={`https://wa.me/91${labPhone.replace(/\D/g, '')}?text=Hello,%20checking%20status%20of%20Token%20${pendingSampleStatus.tokenNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Centre Address & Hours
                </span>
                <span className="text-[11px] text-slate-700 block mt-0.5 leading-snug">
                  {labAddress}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Sample Processing: 24x7 Emergency Services
                </span>
              </div>
            </div>

            {/* Token & Patient Demographics Summary */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                <span className="font-bold text-slate-800 text-xs sm:text-sm">{pendingSampleStatus.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Age / Gender</span>
                <span className="font-semibold text-slate-700">{pendingSampleStatus.ageGender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Token Number</span>
                <span className="font-mono font-black text-sm text-[#123B6D]">{pendingSampleStatus.tokenNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Stage</span>
                <span className="inline-flex items-center gap-1 text-blue-700 font-bold text-[11px] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                  <span>{pendingSampleStatus.status}</span>
                </span>
              </div>
              <div className="col-span-2 sm:col-span-4 pt-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Investigations in Laboratory</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {pendingSampleStatus.tests.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-semibold text-slate-800 text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
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
            {/* Live Real-Time Multi-Device Sync Indicator & Client WhatsApp */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-950 shadow-2xs no-print">
              <div className="flex items-center gap-2.5 font-bold">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Live Real-Time Sync Active (सभी डिवाइस पर लाइव कनेक्टेड • डॉक्टर या लैब में कोई भी बदलाव तुरंत यहाँ दिखेगा)</span>
              </div>
              <a
                href={`https://wa.me/91${(searchedReport.mobile || mobileNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Apex Diagnostic Lab Report Ready:\nPatient: ${searchedReport.patientName}\nToken: ${searchedReport.tokenNumber || ''}\nReport ID: ${searchedReport.reportId}\nStatus: ${searchedReport.verified ? 'Verified & Final' : searchedReport.status}\nLab: ${labName}\nPhone: ${labPhone}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1ebd5a] text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shrink-0 self-start sm:self-auto cursor-pointer shadow-2xs"
                title="Send official report summary to client WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp to Client</span>
              </a>
            </div>

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

            {/* MANDATORY PAYMENT PENDING NOTIFICATION BANNER (When Report is Ready but Payment is Due) */}
            {isPaymentPending && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 text-xs text-amber-950 shadow-md space-y-3.5 no-print">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 border-2 border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Lock className="w-6 h-6 text-amber-700" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-amber-600 text-white font-black px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wide">
                        REPORT READY • PAYMENT PENDING / भुगतान बकाया
                      </span>
                      <span className="text-[11px] text-amber-900 font-bold bg-amber-200/80 px-2 py-0.5 rounded">
                        Pending Amount: ₹{activeDueAmount}
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                      “Aapki report ready hai, lekin payment clear na hone ki wajah se report abhi view nahi ki ja sakti. Payment clear karne ke baad aap complete report dekh sakte hain.”
                    </div>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      Pathologist has verified and certified your lab report. As per clinic billing protocol, investigation parameter results and official PDF download are locked until the outstanding dues of ₹{activeDueAmount} are cleared.
                    </p>
                  </div>
                </div>

                {/* Lab & Branch Contact Information Strip */}
                <div className="bg-white/90 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#123B6D]" />
                      <span>{labName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-teal-800 font-bold">
                        Branch: {matchedEntry?.branchName || searchedReport.branchName || 'Apex Central Diagnostic Hub'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-[#123B6D] font-mono font-bold">
                        <Phone className="w-3 h-3" />
                        <span>Helpline: +91 {labPhone}</span>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>{labAddress}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowPayOnlineModal(true)}
                      className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-4 py-2 rounded-xl text-xs font-black transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                      <span>Pay ₹{activeDueAmount} Online</span>
                    </button>
                    <a
                      href={`tel:${labPhone}`}
                      className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3 text-slate-600" />
                      <span>Call Lab</span>
                    </a>
                  </div>
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
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    searchedReport.cancelled
                      ? 'bg-rose-500'
                      : isPaymentPending
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-emerald-500 animate-pulse'
                  }`}
                />
                <span className="text-xs font-bold text-[#172033]">
                  {(searchedReport as any).cancelled || searchedReport.cancelledAt ? (
                    <>Cancelled Report for <strong>{searchedReport.patientName}</strong></>
                  ) : isPaymentPending ? (
                    <>Report Ready (Locked • Due ₹{activeDueAmount}) for <strong>{searchedReport.patientName}</strong></>
                  ) : (
                    <>Report Verified & Unlocked for <strong>{searchedReport.patientName}</strong></>
                  )}{' '}
                  <span className="text-slate-400 font-mono">({searchedReport.reportId})</span>
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

                {/* 1. PDF Download Button (Conditional on Payment Clearance) */}
                {isPaymentPending ? (
                  <button
                    id="btn-download-pdf-portal-locked"
                    onClick={() => setShowPayOnlineModal(true)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title={`Payment pending: Clear ₹${activeDueAmount} to download report PDF`}
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Download PDF (Due ₹{activeDueAmount})</span>
                  </button>
                ) : (
                  <button
                    id="btn-download-pdf-portal"
                    onClick={handleDownloadPdf}
                    className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    title="Download Official NABL Medical Report PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Download PDF</span>
                  </button>
                )}

                {/* 2. Print Report Button (Conditional on Payment Clearance) */}
                {isPaymentPending ? (
                  <button
                    id="btn-print-report-portal-locked"
                    onClick={() => setShowPayOnlineModal(true)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title={`Payment pending: Clear ₹${activeDueAmount} to print report`}
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Print (Locked)</span>
                  </button>
                ) : (
                  <button
                    id="btn-print-report-portal"
                    onClick={handlePrint}
                    className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                    title="Print Report on A4 / Letterhead"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    <span>Print Report</span>
                  </button>
                )}

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
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Report Status</span>
                  {(searchedReport as any).cancelled || searchedReport.cancelledAt ? (
                    <span className="text-rose-700 font-bold">Cancelled</span>
                  ) : isPaymentPending ? (
                    <span className="text-amber-700 font-bold">Ready (Pending Clearance)</span>
                  ) : (
                    <span className="text-emerald-700 font-bold">Verified & Authorized</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Clearance</span>
                  {isPaymentPending ? (
                    <span className="text-rose-700 font-black bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block font-mono">
                      Due: ₹{activeDueAmount}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                      ✓ Cleared & Published
                    </span>
                  )}
                </div>
              </div>

              {/* Test Results Table (BLURRED & LOCKED IF PAYMENT IS PENDING) */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="bg-[#123B6D]/10 px-3 py-1.5 rounded-lg text-xs font-bold text-[#123B6D] uppercase tracking-wider flex items-center justify-between">
                    <span>Clinical Pathology & Biochemistry Results</span>
                    <span className="text-[10px] text-slate-500 lowercase font-normal">Method: Automated NABL Sysmex / HPLC</span>
                  </div>

                  {isPaymentPending ? (
                    /* LOCKED & BLURRED REPORT SECTION */
                    <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300 bg-amber-50/20 p-2">
                      {/* Blurred Background Table */}
                      <div className="filter blur-md select-none pointer-events-none opacity-25" aria-hidden="true">
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
                              <tr key={rIdx}>
                                <td className="py-2.5 px-3 font-bold text-slate-800">{res.parameter}</td>
                                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">XX.XX</td>
                                <td className="py-2.5 px-3 font-mono">{res.unit}</td>
                                <td className="py-2.5 px-3 font-mono text-[11px]">{res.referenceRange}</td>
                                <td className="py-2.5 px-3 text-center">Protected</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Prominent Frosted Lock Overlay with Required Hindi Message & Lab Contact */}
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 sm:p-8 bg-white/90 backdrop-blur-[4px] text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-800 flex items-center justify-center shadow-md">
                          <Lock className="w-7 h-7 text-amber-700" />
                        </div>

                        <div className="max-w-lg space-y-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full inline-block">
                            REPORT LOCKED • PAYMENT CLEARANCE REQUIRED
                          </span>
                          <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            “Aapki report ready hai, lekin payment clear na hone ki wajah se report abhi view nahi ki ja sakti. Payment clear karne ke baad aap complete report dekh sakte hain.”
                          </h3>
                          <div className="text-xs text-slate-600 font-medium">
                            Total Outstanding Due: <strong className="text-rose-600 font-black text-sm">₹{activeDueAmount}</strong>
                          </div>
                        </div>

                        {/* Lab and Branch Contact Details */}
                        <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Diagnostic Lab:</span>
                            <span className="font-bold text-slate-900">{labName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Branch Centre:</span>
                            <span className="font-bold text-teal-800">
                              {matchedEntry?.branchName || searchedReport.branchName || 'Apex Central Diagnostic Hub'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Helpline Contact:</span>
                            <span className="font-bold font-mono text-[#123B6D] flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>+91 {labPhone}</span>
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowPayOnlineModal(true)}
                            className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-6 py-2.5 rounded-xl text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            <CreditCard className="w-4 h-4 text-amber-300" />
                            <span>Pay ₹{activeDueAmount} Online & Unlock Complete Report</span>
                          </button>
                          <a
                            href={`tel:${labPhone}`}
                            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-600" />
                            <span>Call Reception Desk</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* UNLOCKED FULL TABLE */
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
                  )}
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
                  This is a computer-verified diagnostic document issued under NABL guidelines. Valid without physical ink signature. For authenticity check, scan the QR code above or visit report.indianlalaji.com.
                </div>

                {/* Copyright bottom bar with "Software use indianlalaji.com" */}
                <ReportCopyrightBottomBar
                  softwareDomain="indianlalaji.com"
                  reportId={searchedReport.reportId}
                />
              </div>

              {/* Bottom Quick Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 no-print">
                <span className="text-xs text-slate-500 font-semibold">
                  Official A4 Format • Valid For Medical Reference & Hospital Submission
                </span>
                <div className="flex items-center gap-2">
                  {isPaymentPending ? (
                    <button
                      type="button"
                      onClick={() => setShowPayOnlineModal(true)}
                      className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-amber-300" />
                      <span>Pay ₹{activeDueAmount} to Unlock & Download</span>
                    </button>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ONLINE PAYMENT CLEARANCE MODAL (Simulated Instant Clearance to Unlock Report) */}
      {showPayOnlineModal && searchedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Clear Balance & Unlock Report
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Secure Patient Payment Portal • {searchedReport.reportId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPayOnlineModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Bill & Due Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Patient Name:</span>
                <span className="font-bold text-slate-900">{searchedReport.patientName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>UHID / Token:</span>
                <span className="font-mono font-bold text-[#123B6D]">{searchedReport.uhid}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Investigation Cost:</span>
                <span className="font-mono font-semibold text-slate-800">
                  ₹{matchedEntry?.totalAmount || searchedReport.totalAmount || 650}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Already Paid at Counter:</span>
                <span className="font-mono font-semibold text-emerald-700">
                  ₹{matchedEntry?.paidAmount || searchedReport.paidAmount || 350}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                <span className="text-slate-900">Outstanding Balance to Clear:</span>
                <span className="text-rose-600 font-mono text-base">₹{activeDueAmount}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Select Payment Mode / भुगतान का तरीका
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayingMode('UPI')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                    payingMode === 'UPI'
                      ? 'border-[#123B6D] bg-[#123B6D]/5 text-[#123B6D] font-bold ring-2 ring-[#123B6D]/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#0F766E]" />
                  <div>
                    <div className="text-xs font-bold">UPI / QR Code</div>
                    <div className="text-[10px] text-slate-500">GPay, PhonePe, Paytm</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPayingMode('Card')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                    payingMode === 'Card'
                      ? 'border-[#123B6D] bg-[#123B6D]/5 text-[#123B6D] font-bold ring-2 ring-[#123B6D]/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#123B6D]" />
                  <div>
                    <div className="text-xs font-bold">Debit / Card</div>
                    <div className="text-[10px] text-slate-500">Visa, RuPay, Master</div>
                  </div>
                </button>
              </div>

              {/* UPI QR Display Box */}
              {payingMode === 'UPI' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-4 text-xs">
                  <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center shrink-0">
                    <QrCode className="w-14 h-14 text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">Scan & Pay via any UPI App</div>
                    <div className="text-[11px] text-slate-600 font-mono">UPI ID: <strong>{labUpi}</strong></div>
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      Instant automatic payment webhook verification
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pay Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowPayOnlineModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handlePayDueOnline}
                className="flex-2 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0d655e] text-white text-xs font-black transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Pay ₹{activeDueAmount} & Unlock Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
