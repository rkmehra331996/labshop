import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Edit3,
  Trash2,
  XCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Printer,
  MessageSquare,
  Search,
  Eye,
  Clock,
  User,
  ShieldCheck,
  Building,
  FileText,
  Send,
  Sparkles,
  ArrowRight,
  LogOut,
  X,
  Stethoscope,
  Calendar,
  Filter,
  CalendarDays,
  Globe,
  Lock,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { LabReport, ReceptionPatientEntry, AppView } from '../../types';
import { CreateReportModal } from '../CreateReportModal';
import { ReportDetailModal } from '../ReportDetailModal';
import { DashboardFooter } from '../DashboardFooter';

interface TechnicianDepartmentDashboardProps {
  onNavigateView?: (view: AppView) => void;
  onOpenReportPortal?: (reportId: string, mobile: string) => void;
}

export const TechnicianDepartmentDashboard: React.FC<TechnicianDepartmentDashboardProps> = ({
  onNavigateView,
  onOpenReportPortal,
}) => {
  const {
    reports,
    deleteLabReport,
    cancelLabReport,
    uncancelLabReport,
    addLabReport,
    updateLabReport,
    receptionEntries,
    acceptEntryByTechnician,
    completeTechnicianReport,
    vendorLabSettings,
    currentUser,
    logout,
  } = useCms();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Cancelled' | 'Pending'>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this_month' | 'custom_date' | 'custom_month'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // YYYY-MM

  // Date Parsing & Matching Helper
  const extractDateInfo = (dateText?: string): { year: number; month: number; day: number } | null => {
    if (!dateText) return null;
    const str = dateText.trim();
    const lower = str.toLowerCase();
    const now = new Date();

    if (lower.includes('today')) {
      return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    }
    if (lower.includes('yesterday')) {
      const yday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return { year: yday.getFullYear(), month: yday.getMonth(), day: yday.getDate() };
    }

    // Time-only strings (e.g. 08:30 AM, registered at reception counter today)
    if (/^\d{1,2}:\d{2}/.test(str)) {
      return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    }

    // 1) DD-MMM-YYYY or DD MMM YYYY (e.g. 03-Sep-2026, 3 Sep 2026, 03/Sep/2026)
    const alphaMonthMatch = str.match(/(\d{1,2})[-/ ]([A-Za-z]{3,9})[-/ ](\d{4})/);
    if (alphaMonthMatch) {
      const day = parseInt(alphaMonthMatch[1], 10);
      const mStr = alphaMonthMatch[2].toLowerCase();
      const year = parseInt(alphaMonthMatch[3], 10);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const mIdx = months.findIndex((m) => mStr.startsWith(m));
      if (mIdx !== -1) {
        return { year, month: mIdx, day };
      }
    }

    // 2) YYYY-MM-DD
    const ymdMatch = str.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        return { year, month, day };
      }
    }

    // 3) DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = str.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        return { year, month, day };
      }
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return { year: parsed.getFullYear(), month: parsed.getMonth(), day: parsed.getDate() };
    }

    return null;
  };

  const matchesDateFilter = (dateText?: string): boolean => {
    if (dateFilter === 'all') return true;
    if (!dateText) return true;
    const d = extractDateInfo(dateText);
    if (!d) return true;

    const now = new Date();
    if (dateFilter === 'today') {
      return d.year === now.getFullYear() && d.month === now.getMonth() && d.day === now.getDate();
    }
    if (dateFilter === 'yesterday') {
      const yday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return d.year === yday.getFullYear() && d.month === yday.getMonth() && d.day === yday.getDate();
    }
    if (dateFilter === 'this_month') {
      return d.year === now.getFullYear() && d.month === now.getMonth();
    }
    if (dateFilter === 'custom_date' && selectedDate) {
      const [y, m, day] = selectedDate.split('-').map(Number);
      return d.year === y && d.month === m - 1 && d.day === day;
    }
    if (dateFilter === 'custom_month' && selectedMonth) {
      const [y, m] = selectedMonth.split('-').map(Number);
      return d.year === y && d.month === m - 1;
    }

    return true;
  };

  const handleSelectDatePreset = (preset: 'all' | 'today' | 'yesterday' | 'this_month') => {
    setDateFilter(preset);
    setSelectedDate('');
    setSelectedMonth('');
  };

  const handleCustomDateChange = (dateVal: string) => {
    setSelectedDate(dateVal);
    if (dateVal) {
      setDateFilter('custom_date');
      setSelectedMonth('');
    } else {
      setDateFilter('all');
    }
  };

  const handleCustomMonthChange = (monthVal: string) => {
    setSelectedMonth(monthVal);
    if (monthVal) {
      setDateFilter('custom_month');
      setSelectedDate('');
    } else {
      setDateFilter('all');
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('All');
    setDateFilter('all');
    setSelectedDate('');
    setSelectedMonth('');
    setSearchTerm('');
  };

  const isAnyFilterActive =
    statusFilter !== 'All' ||
    dateFilter !== 'all' ||
    searchTerm.trim() !== '' ||
    selectedDate !== '' ||
    selectedMonth !== '';

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<LabReport | null>(null);
  const [selectedPatientForReport, setSelectedPatientForReport] = useState<any | null>(null);
  const [viewingReport, setViewingReport] = useState<LabReport | null>(null);

  // Cancellation Modal State
  const [cancellingReport, setCancellingReport] = useState<LabReport | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellationError, setCancellationError] = useState('');

  // Delete Confirmation Modal State
  const [deletingReport, setDeletingReport] = useState<LabReport | null>(null);

  // No registered patient in queue warning modal
  const [isNoPatientWarningOpen, setIsNoPatientWarningOpen] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState('');

  // Preset cancellation reasons
  const presetReasons = [
    'Hemolyzed blood sample unsuitable for biochemical testing',
    'Lipemic specimen - optical assay interfered',
    'Insufficient specimen volume received (QNS)',
    'Clotted EDTA blood specimen - CBC invalid',
    'Patient requested cancellation / Doctor revoked order',
    'Labeling mismatch / tube identifier discrepancy',
  ];

  // ==========================================
  // UNIFIED WORKLIST (SAB KUCH EK HI MASTER LIST MEIN)
  // ==========================================

  // 1. Reception entries that do NOT yet have an active/completed report in reports repository
  const pendingReceptionEntries = receptionEntries.filter((entry) => {
    const reportExists = reports.some(
      (r) =>
        (entry.reportId && r.reportId.toLowerCase() === entry.reportId.toLowerCase()) ||
        (!entry.reportId && entry.status === 'Report Ready' && r.uhid.toLowerCase() === entry.uhid.toLowerCase())
    );
    return !reportExists;
  });

  // Master Unified Worklist Item Type
  type WorklistStatus = 'Pending' | 'Active' | 'Cancelled';

  interface UnifiedWorklistItem {
    id: string;
    kind: 'pending' | 'report';
    displayId: string;
    tokenNumber: string;
    uhid: string;
    patientName: string;
    ageGender: string;
    mobile: string;
    doctor: string;
    tests: string;
    dateText: string;
    sampleType?: string;
    status: WorklistStatus;
    rawReport?: LabReport;
    rawEntry?: ReceptionPatientEntry;
  }

  // Pending items waiting for report creation
  const pendingWorklistItems: UnifiedWorklistItem[] = pendingReceptionEntries.map((entry) => ({
    id: `pending-${entry.id}`,
    kind: 'pending',
    displayId: entry.tokenNumber ? `Token #${entry.tokenNumber}` : `Token #${entry.tokenNo || entry.id || ''}`,
    tokenNumber: String(entry.tokenNumber || entry.tokenNo || entry.id || ''),
    uhid: entry.uhid || '',
    patientName: entry.patientName || 'Unknown Patient',
    ageGender: `${entry.age || ''} Yrs • ${entry.gender || ''}`,
    mobile: entry.mobile || '',
    doctor: entry.referringDoctor || 'Self / Walk-in',
    tests: Array.isArray(entry.tests)
      ? entry.tests.join(', ')
      : entry.testNames
      ? entry.testNames.join(', ')
      : (entry.tests || 'Diagnostic Profile'),
    dateText: entry.registeredAt || entry.sentToLabAt || 'Today',
    sampleType: entry.sampleType,
    status: 'Pending',
    rawEntry: entry,
  }));

  // Report items (Active or Cancelled)
  const reportWorklistItems: UnifiedWorklistItem[] = reports.map((report) => {
    const matchingEntry = receptionEntries.find(
      (e) =>
        (e.reportId && report.reportId && e.reportId.toLowerCase() === report.reportId.toLowerCase()) ||
        (e.uhid && report.uhid && e.uhid.toLowerCase() === report.uhid.toLowerCase())
    );

    const isCancelled = !!report.isCancelled;

    return {
      id: `report-${report.reportId}`,
      kind: 'report',
      displayId: report.reportId,
      tokenNumber: String(matchingEntry?.tokenNumber || matchingEntry?.tokenNo || ''),
      uhid: report.uhid,
      patientName: report.patientName,
      ageGender: report.ageGender,
      mobile: report.mobile || '',
      doctor: report.doctor || 'Self / Walk-in',
      tests:
        Array.from(new Set(report.items.map((i) => i.testName))).join(', ') ||
        `${report.items.length} Parameters Tested`,
      dateText: report.reportedAt || report.sampleCollectedAt || '',
      sampleType: matchingEntry?.sampleType,
      status: isCancelled ? 'Cancelled' : 'Active',
      rawReport: report,
      rawEntry: matchingEntry,
    };
  });

  // COMBINE ALL: Master list containing EVERY record (Pending + Active + Cancelled)
  const masterWorklist: UnifiedWorklistItem[] = [...pendingWorklistItems, ...reportWorklistItems];

  // Filtered Master Worklist
  const filteredWorklist = masterWorklist.filter((item) => {
    // 1. Status Filter
    if (statusFilter === 'Active' && item.status !== 'Active') return false;
    if (statusFilter === 'Cancelled' && item.status !== 'Cancelled') return false;
    if (statusFilter === 'Pending' && item.status !== 'Pending') return false;
    // When statusFilter === 'All', EVERYTHING is included!

    // 2. Search Query Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const patientMatch = (item.patientName || '').toLowerCase().includes(q);
      const uhidMatch = (item.uhid || '').toLowerCase().includes(q);
      const displayIdMatch = (item.displayId || '').toLowerCase().includes(q);
      const tokenMatch = (item.tokenNumber || '').toLowerCase().includes(q);
      const mobileMatch = (item.mobile || '').includes(q);
      const doctorMatch = (item.doctor || '').toLowerCase().includes(q);
      const testsMatch = (item.tests || '').toLowerCase().includes(q);

      if (
        !patientMatch &&
        !uhidMatch &&
        !displayIdMatch &&
        !tokenMatch &&
        !mobileMatch &&
        !doctorMatch &&
        !testsMatch
      ) {
        return false;
      }
    }

    // 3. Date Filter
    if (!matchesDateFilter(item.dateText)) return false;

    return true;
  });

  // Overall counts
  const totalAllCount = masterWorklist.length;
  const totalPendingCount = pendingWorklistItems.length;
  const totalActiveCount = reportWorklistItems.filter((i) => i.status === 'Active').length;
  const totalCancelledCount = reportWorklistItems.filter((i) => i.status === 'Cancelled').length;

  // Date-filtered counts for tabs
  const dateFilteredAll = masterWorklist.filter((i) => matchesDateFilter(i.dateText)).length;
  const dateFilteredPending = pendingWorklistItems.filter((i) => matchesDateFilter(i.dateText)).length;
  const dateFilteredActive = reportWorklistItems.filter(
    (i) => i.status === 'Active' && matchesDateFilter(i.dateText)
  ).length;
  const dateFilteredCancelled = reportWorklistItems.filter(
    (i) => i.status === 'Cancelled' && matchesDateFilter(i.dateText)
  ).length;

  // Handle Cancel Report Confirmation
  const handleConfirmCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingReport) return;
    if (!cancellationReason.trim()) {
      setCancellationError('Please provide a valid cancellation reason in the text box.');
      return;
    }

    cancelLabReport(
      cancellingReport.reportId,
      cancellationReason.trim(),
      currentUser?.name || 'Lab Technician'
    );

    setToastMessage(`Report ${cancellingReport.reportId} cancelled with reason recorded.`);
    setCancellingReport(null);
    setCancellationReason('');
    setCancellationError('');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Handle Uncancel / Restore
  const handleUncancel = (report: LabReport) => {
    uncancelLabReport(report.reportId);
    setToastMessage(`Report ${report.reportId} restored to active status.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Handle Delete Report Confirmation
  const handleConfirmDelete = () => {
    if (!deletingReport) return;
    deleteLabReport(deletingReport.reportId);
    setToastMessage(`Report ${deletingReport.reportId} permanently deleted.`);
    setDeletingReport(null);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Start report from reception patient
  const handleStartReportForPatient = (entry: ReceptionPatientEntry) => {
    acceptEntryByTechnician(entry.id);
    setSelectedPatientForReport({
      id: entry.id,
      uhid: entry.uhid,
      name: entry.patientName,
      age: entry.age,
      gender: entry.gender,
      mobile: entry.mobile,
      doctor: entry.referringDoctor,
      tests: Array.isArray(entry.tests) ? entry.tests.join(', ') : (entry.tests || ''),
      sampleType: entry.sampleType,
    });
    setEditingReport(null);
    setIsCreateModalOpen(true);
  };

  // Handle Report Created / Saved
  const handleReportCreated = (report: LabReport, patientId?: string) => {
    if (editingReport) {
      updateLabReport(report.reportId, report);
      setToastMessage(`Report ${report.reportId} updated successfully.`);
    } else {
      addLabReport(report);
      if (selectedPatientForReport?.id) {
        completeTechnicianReport(selectedPatientForReport.id, report.reportId);
      }
      setToastMessage(`Report ${report.reportId} created and authenticated!`);
    }
    setIsCreateModalOpen(false);
    setEditingReport(null);
    setSelectedPatientForReport(null);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const labName = vendorLabSettings?.labName || 'Apex Diagnostic & Clinical Pathology Laboratory';
  const labLogoUrl = vendorLabSettings?.logoUrl || '';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* Top Header: Vendor Company Logo + Dashboard Name + Vendor Home Website + Log Out Button */}
      <header className="bg-[#123B6D] text-white px-4 sm:px-8 py-3 border-b border-white/10 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Vendor Company Logo + Active Dashboard Name */}
          <div className="flex items-center gap-3 min-w-0">
            {labLogoUrl ? (
              <img
                src={labLogoUrl}
                alt={labName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-contain bg-white border border-white/20 p-0.5 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center font-black text-sm shadow-sm border border-white/20 shrink-0">
                <span className="text-amber-300">{labName.charAt(0) || 'A'}</span>
                <span>{labName.split(' ')[1]?.charAt(0) || 'L'}</span>
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight truncate">
                {labName}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <span>🔬</span>
                  <span>Technician Department Dashboard</span>
                </span>
                <span className="hidden sm:inline text-[11px] text-teal-100/90 font-medium">
                  • Pathologist Console
                </span>
              </div>
            </div>
          </div>

          {/* Actions: Vendor Home Website + Log Out Button */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {onNavigateView && (
              <button
                type="button"
                id="tech-btn-vendor-website"
                onClick={() => onNavigateView('vendor_website')}
                className="bg-white hover:bg-slate-100 text-[#123B6D] px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer border border-white/20 whitespace-nowrap"
                title="Go to Vendor Home Website"
              >
                <Globe className="w-3.5 h-3.5 text-[#123B6D]" />
                <span>Vendor Home Website</span>
              </button>
            )}

            <button
              type="button"
              id="tech-btn-logout"
              onClick={() => {
                logout();
                if (onNavigateView) onNavigateView('vendor_website');
              }}
              className="bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
              title="Log Out from Technician Dashboard"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Toast */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* UNIFIED FILTER & WORKSTATION CONTROL PANEL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          
          {/* 1. FILTER CONTROLS HEADER */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 border-b border-slate-200 space-y-4">
            
            {/* Top Bar: Title & Reset */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#123B6D]" />
                  <span>Lab Reports & Queue Filter</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  View and manage all records, pending samples, verified reports, and cancellations
                </p>
              </div>

              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="self-start sm:self-auto bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Reset all filters to default"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reset Filters (Show All)</span>
                </button>
              )}
            </div>

            {/* STEP 1: Status Filter Tabs */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span>1. Filter by Category:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    {
                      id: 'All',
                      label: 'All Records',
                      sublabel: 'Reports & Pending Samples',
                      count: dateFilter !== 'all' ? dateFilteredAll : totalAllCount,
                      color: 'blue',
                    },
                    {
                      id: 'Pending',
                      label: 'Pending Queue',
                      sublabel: 'Awaiting Test Results',
                      count: dateFilter !== 'all' ? dateFilteredPending : totalPendingCount,
                      color: 'amber',
                    },
                    {
                      id: 'Active',
                      label: 'Verified Reports',
                      sublabel: 'Completed & Ready',
                      count: dateFilter !== 'all' ? dateFilteredActive : totalActiveCount,
                      color: 'emerald',
                    },
                    {
                      id: 'Cancelled',
                      label: 'Cancelled Reports',
                      sublabel: 'Revoked with Reason',
                      count: dateFilter !== 'all' ? dateFilteredCancelled : totalCancelledCount,
                      color: 'rose',
                    },
                  ] as const
                ).map((tab) => {
                  const isSelected = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#123B6D] text-white border-[#123B6D] shadow-sm ring-2 ring-[#123B6D]/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">{tab.label}</span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tab.count}
                        </span>
                      </div>
                      <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {tab.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Date / Month Filter */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span>2. Filter by Date or Period:</span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {/* Quick Date Presets */}
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
                  <button
                    onClick={() => handleSelectDatePreset('all')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      dateFilter === 'all'
                        ? 'bg-[#123B6D] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => handleSelectDatePreset('today')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      dateFilter === 'today'
                        ? 'bg-[#123B6D] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleSelectDatePreset('yesterday')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      dateFilter === 'yesterday'
                        ? 'bg-[#123B6D] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Yesterday
                  </button>
                  <button
                    onClick={() => handleSelectDatePreset('this_month')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      dateFilter === 'this_month'
                        ? 'bg-[#123B6D] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    This Month
                  </button>
                </div>

                {/* Specific Date Picker */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
                  <CalendarDays className="w-3.5 h-3.5 text-[#123B6D]" />
                  <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">Date:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleCustomDateChange(e.target.value)}
                    className="text-xs text-slate-800 bg-transparent focus:outline-none font-medium cursor-pointer"
                    title="Select a specific day"
                  />
                </div>

                {/* Specific Month Picker */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-[#123B6D]" />
                  <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">Month:</span>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => handleCustomMonthChange(e.target.value)}
                    className="text-xs text-slate-800 bg-transparent focus:outline-none font-medium cursor-pointer"
                    title="Select a full month"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: Search Bar & Live Active Indicator */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative max-w-lg w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient name, Token #, UHID, mobile, doctor, test..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status summary pill */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <span className="text-slate-400 font-medium">Showing:</span>
                <span className="text-[#123B6D]">
                  {statusFilter === 'All'
                    ? 'All Records'
                    : statusFilter === 'Active'
                    ? 'Verified Reports'
                    : statusFilter === 'Cancelled'
                    ? 'Cancelled Reports'
                    : 'Pending Samples'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700">
                  {dateFilter === 'today'
                    ? 'Today'
                    : dateFilter === 'yesterday'
                    ? 'Yesterday'
                    : dateFilter === 'this_month'
                    ? 'This Month'
                    : dateFilter === 'custom_date'
                    ? selectedDate
                    : dateFilter === 'custom_month'
                    ? selectedMonth
                    : 'All Dates'}
                </span>
                <span className="bg-[#123B6D]/10 text-[#123B6D] px-2 py-0.5 rounded-full font-black text-[11px]">
                  {filteredWorklist.length} Records
                </span>
              </div>
            </div>

          </div>

          {/* 2. UNIFIED MASTER WORKLIST TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Token / Report ID & Date</th>
                  <th className="px-4 py-3">Patient Details</th>
                  <th className="px-4 py-3">Referring Doctor</th>
                  <th className="px-4 py-3">Tests Prescribed / Tested</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredWorklist.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-xs">
                      <div className="max-w-md mx-auto space-y-3">
                        <FileText className="w-9 h-9 text-slate-300 mx-auto" />
                        <div className="font-bold text-slate-700 text-sm">
                          No Records Found
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          No records match your selected filters (Category: <strong className="text-slate-700">{statusFilter}</strong>
                          {dateFilter !== 'all' && (
                            <span> • Date: <strong className="text-slate-700">{dateFilter}</strong></span>
                          )}
                          {searchTerm && (
                            <span> • Search: &ldquo;<strong className="text-slate-700">{searchTerm}</strong>&rdquo;</span>
                          )}
                          ).
                        </p>
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 bg-[#123B6D] hover:bg-[#0e2c52] text-white px-4 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Show All Records</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredWorklist.map((item) => {
                    const isPending = item.kind === 'pending';
                    const isCancelled = item.status === 'Cancelled';

                    return (
                      <tr
                        key={item.id}
                        className={`transition ${
                          isCancelled
                            ? 'bg-rose-50/40 hover:bg-rose-50/70'
                            : isPending
                            ? 'bg-amber-50/20 hover:bg-amber-50/50'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Token / Report ID & Date */}
                        <td className="px-4 py-3.5">
                          <div className="font-mono font-black text-slate-900 flex items-center gap-1.5">
                            {isPending ? (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-black text-[11px]">
                                {item.displayId}
                              </span>
                            ) : (
                              <div className="flex flex-col">
                                <span className={isCancelled ? 'line-through text-rose-800' : 'text-slate-900'}>
                                  {item.displayId}
                                </span>
                                {item.tokenNumber && (
                                  <span className="text-[10px] text-slate-500 font-bold font-sans">
                                    Token #{item.tokenNumber}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {isPending ? `Reg: ${item.dateText}` : `Date: ${item.dateText}`}
                          </div>
                        </td>

                        {/* Patient Details */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{item.patientName}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.ageGender} • UHID: {item.uhid}
                          </div>
                          {item.mobile && (
                            <div className="text-[10px] text-slate-400 mt-0.5">📞 {item.mobile}</div>
                          )}
                        </td>

                        {/* Doctor */}
                        <td className="px-4 py-3.5 text-slate-700 font-medium">
                          {item.doctor}
                        </td>

                        {/* Tests */}
                        <td className="px-4 py-3.5 text-slate-700">
                          <div className="font-semibold text-slate-900 max-w-xs line-clamp-2">
                            {item.tests}
                          </div>
                          {item.sampleType && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Sample: {item.sampleType}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full shadow-2xs">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Pending Sample (In Lab)</span>
                            </span>
                          ) : isCancelled ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-rose-200">
                                <AlertTriangle className="w-3 h-3" />
                                <span>CANCELLED</span>
                              </span>
                              {item.rawReport?.cancellationReason && (
                                <div className="text-[11px] text-rose-700 font-medium max-w-xs">
                                  Reason: {item.rawReport.cancellationReason}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verified & Ready</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {isPending ? (
                            /* PENDING: Create Report CTA */
                            <button
                              onClick={() => handleStartReportForPatient(item.rawEntry!)}
                              className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5 text-amber-400" />
                              <span>Create Report</span>
                            </button>
                          ) : (
                            /* REPORT: View, Edit, Cancel/Restore, Delete */
                            <>
                              {/* View Report */}
                              <button
                                onClick={() => setViewingReport(item.rawReport!)}
                                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="View official verified clinical report & print PDF"
                              >
                                <Eye className="w-3 h-3 text-[#123B6D]" />
                                <span>View</span>
                              </button>

                              {/* Edit Report (if not cancelled) */}
                              {!isCancelled && (
                                <button
                                  onClick={() => {
                                    setEditingReport(item.rawReport!);
                                    setSelectedPatientForReport(null);
                                    setIsCreateModalOpen(true);
                                  }}
                                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                  title="Edit report parameters, impressions or doctor notes"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                              )}

                              {/* Cancel or Restore */}
                              {!isCancelled ? (
                                <button
                                  onClick={() => {
                                    setCancellingReport(item.rawReport!);
                                    setCancellationReason('');
                                    setCancellationError('');
                                  }}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                  title="Cancel this report with documented reason"
                                >
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>Cancel</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUncancel(item.rawReport!)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                  title="Restore report back to active"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Restore</span>
                                </button>
                              )}

                              {/* Delete Report */}
                              <button
                                onClick={() => setDeletingReport(item.rawReport!)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Permanently delete report"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* CREATE / EDIT REPORT MODAL */}
      {isCreateModalOpen && (
        <CreateReportModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingReport(null);
            setSelectedPatientForReport(null);
          }}
          existingReport={editingReport}
          preselectedPatient={selectedPatientForReport}
          onReportCreated={handleReportCreated}
          allowNewPatientEntry={false}
        />
      )}

      {/* VIEW REPORT DETAIL MODAL */}
      {viewingReport && (
        <ReportDetailModal
          isOpen={!!viewingReport}
          onClose={() => setViewingReport(null)}
          report={viewingReport}
          onEditReport={(rep) => {
            setViewingReport(null);
            setEditingReport(rep);
            setIsCreateModalOpen(true);
          }}
          onDeleteReport={(rep) => {
            setViewingReport(null);
            setDeletingReport(rep);
          }}
        />
      )}

      {/* CANCEL REPORT MODAL (WITH MANDATORY TEXT BOX TO ENTER CANCELLATION REASON) */}
      {cancellingReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-300 overflow-hidden">
            <div className="bg-rose-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-200" />
                <span className="text-sm font-black">Cancel Diagnostic Report</span>
              </div>
              <button
                onClick={() => setCancellingReport(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancellation} className="p-6 space-y-4 text-xs">
              {/* Report Summary */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-slate-800 space-y-1">
                <div className="font-bold text-rose-900">
                  Report ID: {cancellingReport.reportId}
                </div>
                <div>Patient: <strong>{cancellingReport.patientName}</strong> ({cancellingReport.uhid})</div>
                <div className="text-[11px] text-slate-600">
                  Doctor: {cancellingReport.doctor} • Parameters: {cancellingReport.items.length}
                </div>
              </div>

              {/* Cancellation Reason Text Box (Explicit User Mandate) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-800">
                  Text box to enter cancellation reason <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => {
                    setCancellationReason(e.target.value);
                    if (cancellationError) setCancellationError('');
                  }}
                  placeholder="Enter specific laboratory cancellation reason (e.g. sample hemolyzed during separation, insufficient volume, patient requested cancellation)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-600 leading-relaxed"
                />
                {cancellationError && (
                  <p className="text-rose-600 font-bold text-[11px]">{cancellationError}</p>
                )}
              </div>

              {/* Quick Reason Chips */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400">Quick-select reason:</span>
                <div className="flex flex-wrap gap-1.5">
                  {presetReasons.map((reason, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCancellationReason(reason)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition text-left cursor-pointer"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCancellingReport(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-300 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2 rounded-full bg-rose-50">
                <Trash2 className="w-5 h-5" />
              </span>
              <h3 className="text-base font-black">Confirm Permanent Report Deletion</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete report{' '}
              <strong className="text-slate-900">{deletingReport.reportId}</strong> for{' '}
              <strong className="text-slate-900">{deletingReport.patientName}</strong>?
              This cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingReport(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* NO PATIENT IN QUEUE / RESTRICTED ENTRY MODAL */}
      {isNoPatientWarningOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-amber-300 p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-800">
              <span className="p-2.5 rounded-xl bg-amber-100">
                <Lock className="w-5 h-5 text-amber-900" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900">Lab Technician Entry Restricted</h3>
                <span className="text-[11px] text-amber-800 font-extrabold uppercase tracking-wide">
                  Patient Entry = Reception Counter Only
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Lab technicians cannot create new patient registrations. All patient entries, demographic details, and billing tokens must be created at the <strong>Reception Counter</strong>.
            </p>
            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              There are currently no pending patients in the testing worklist. Once registered at Reception, the patient sample and token will automatically arrive here for testing.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsNoPatientWarningOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
              {onNavigateView && (
                <button
                  onClick={() => {
                    setIsNoPatientWarningOpen(false);
                    onNavigateView('reception_dashboard');
                  }}
                  className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Go to Reception Counter →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer with Lab Copyright, labname.com link and Customer Care Helpline */}
      <DashboardFooter />
    </div>
  );
};
