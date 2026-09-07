import React, { useState, useEffect } from 'react';
import {
  Users,
  FlaskConical,
  Clock,
  CheckCheck,
  IndianRupee,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Search,
  Printer,
  MessageSquare,
  ShieldCheck,
  Check,
  ArrowLeft,
  Filter,
  QrCode,
  Building,
  UserCheck,
  Download,
  Share2,
  FileText,
  FileCheck,
  Eye,
  Zap,
  Sparkles,
  Edit2,
  Trash2,
  Globe,
  Lock,
  LogOut,
} from 'lucide-react';
import { Patient, TestItem, LabReport, ReportItem, ReceptionPatientEntry } from '../types';
import { MOCK_PATIENTS, MOCK_TESTS, MOCK_BRANCHES, SAMPLE_REPORT } from '../data/mockData';
import { CreateReportModal } from './CreateReportModal';
import { ReportDetailModal } from './ReportDetailModal';
import { useCms } from '../context/CmsContext';
import { TEST_TEMPLATES, checkIsAbnormal } from '../data/testTemplates';
import { DashboardFooter } from './DashboardFooter';

interface LabSoftwareAppProps {
  onBackToWebsite: () => void;
  onViewReport: (reportId: string, mobile: string) => void;
}

export const LabSoftwareApp: React.FC<LabSoftwareAppProps> = ({ onBackToWebsite, onViewReport }) => {
  const {
    vendorLabSettings,
    addLabReport,
    updateLabReport,
    deleteLabReport,
    getReportById,
    reports,
    receptionEntries,
    sendEntryToTechnician,
    acceptEntryByTechnician,
    completeTechnicianReport,
    logout,
  } = useCms();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'results' | 'reception_orders'>('dashboard');
  const [receptionFilter, setReceptionFilter] = useState<'All' | 'Awaiting' | 'Accepted' | 'Completed'>('All');
  const [receptionSearch, setReceptionSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('br-a');
  const [currentUser, setCurrentUser] = useState('Dr. Rohit Sharma (MD Pathologist)');
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);

  // Reception Queue Computed metrics for Technician
  const pendingReceptionEntries = receptionEntries.filter((r) => r.sentToTechnician);
  const awaitingAcceptCount = receptionEntries.filter(
    (r) => r.sentToTechnician && r.technicianStatus === 'Sent to Lab'
  ).length;
  const inTestingCount = receptionEntries.filter(
    (r) => r.sentToTechnician && r.technicianStatus === 'Accepted'
  ).length;
  const completedReceptionCount = receptionEntries.filter(
    (r) => r.sentToTechnician && (r.technicianStatus === 'Report Generated' || !!r.reportId)
  ).length;

  // Report Generator & Detail Modals
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false);
  const [selectedPatientForReport, setSelectedPatientForReport] = useState<Patient | null>(null);
  const [selectedReportToEdit, setSelectedReportToEdit] = useState<LabReport | null>(null);
  const [previewReport, setPreviewReport] = useState<LabReport | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Workstation Tab (Tab 4: Results) State
  const [workstationPatientId, setWorkstationPatientId] = useState<string>(MOCK_PATIENTS[0]?.id || '');
  const [workstationParams, setWorkstationParams] = useState<
    { id: string; testName: string; parameter: string; result: string; unit: string; referenceRange: string; isAbnormal: boolean }[]
  >([]);
  const [workstationImpression, setWorkstationImpression] = useState(
    'Parameters are within biological reference intervals for age and gender.'
  );
  const [workstationSuccessNotice, setWorkstationSuccessNotice] = useState(false);

  // Offline Simulation State
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // New Patient Form State
  const [showRegModal, setShowRegModal] = useState(false);
  const [isTechnicianEntryBlockedModalOpen, setIsTechnicianEntryBlockedModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('42');
  const [newPatientGender, setNewPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newPatientMobile, setNewPatientMobile] = useState('');
  const [newPatientDoctor, setNewPatientDoctor] = useState('Dr. S. K. Gupta (MD Med)');
  const [selectedTests, setSelectedTests] = useState<string[]>(['Complete Blood Count (CBC) with ESR']);
  const [paidNow, setPaidNow] = useState('350');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Card'>('UPI');

  // In-app Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  // Search in table
  const [searchFilter, setSearchFilter] = useState('');

  // Handle Offline Simulation Toggle
  const toggleOffline = () => {
    if (!isOffline) {
      setIsOffline(true);
    } else {
      setIsSyncing(true);
      setTimeout(() => {
        setIsOffline(false);
        setOfflineQueue(0);
        setIsSyncing(false);
      }, 1200);
    }
  };

  const handleOpenAddPatient = () => {
    setIsTechnicianEntryBlockedModalOpen(true);
  };

  const handleOpenEditPatient = (p: Patient) => {
    setEditingPatient(p);
    setNewPatientName(p.name);
    setNewPatientAge(String(p.age));
    setNewPatientGender(p.gender as any);
    setNewPatientMobile(p.mobile);
    setNewPatientDoctor(p.referringDoctor);
    setSelectedTests(p.tests && p.tests.length > 0 ? [...p.tests] : ['Complete Blood Count (CBC) with ESR']);
    setPaidNow(String(p.paidAmount ?? 0));
    setPaymentMode((p.paymentMode as any) || 'UPI');
    setShowRegModal(true);
  };

  const handleDeletePatient = (p: Patient) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Patient Record',
      message: `Are you sure you want to delete patient "${p.name}" (${p.uhid})? This will remove them from the today worklist and queue.`,
      confirmText: 'Yes, Delete Patient',
      onConfirm: () => {
        setPatients((prev) => prev.filter((item) => item.id !== p.id));
        if (workstationPatientId === p.id) {
          const remaining = patients.filter((item) => item.id !== p.id);
          if (remaining.length > 0) setWorkstationPatientId(remaining[0].id);
        }
        setDeleteConfirm(null);
      },
    });
  };

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newPatientMobile.trim()) return;

    const total = selectedTests.reduce((acc, testName) => {
      const found = MOCK_TESTS.find((t) => t.name === testName);
      return acc + (found?.priceINR || 300);
    }, 0);

    const paid = Number(paidNow) || 0;
    const due = Math.max(0, (total || 350) - paid);

    if (editingPatient) {
      // Update existing patient
      setPatients((prev) =>
        prev.map((p) =>
          p.id === editingPatient.id
            ? {
                ...p,
                name: newPatientName.trim(),
                age: Number(newPatientAge) || p.age,
                gender: newPatientGender,
                mobile: newPatientMobile.trim(),
                referringDoctor: newPatientDoctor,
                tests: selectedTests.length > 0 ? selectedTests : p.tests,
                totalBill: total > 0 ? total : p.totalBill,
                paidAmount: paid,
                dueAmount: due,
                paymentMode: paymentMode,
              }
            : p
        )
      );
    } else {
      // Create new patient is strictly blocked for technicians
      setShowRegModal(false);
      setIsTechnicianEntryBlockedModalOpen(true);
      return;
    }

    // Reset Form
    setNewPatientName('');
    setNewPatientMobile('');
    setEditingPatient(null);
    setShowRegModal(false);
  };

  const handleWhatsAppSend = (patient: Patient) => {
    const labTitle = vendorLabSettings?.labName || 'Apex Diagnostics';
    const reportUrl = `${window.location.origin}?report=${patient.reportId}`;
    const text = encodeURIComponent(
      `Namaste ${patient.name} Ji, your test report (${patient.reportId}) from ${labTitle} is ready. View & download without login: ${reportUrl}`
    );
    window.open(`https://wa.me/91${patient.mobile}?text=${text}`, '_blank');
  };

  // Workstation parameter loader when workstationPatientId changes
  useEffect(() => {
    const pat = patients.find((p) => p.id === workstationPatientId) || patients[0];
    if (!pat) return;

    // Build initial parameters based on patient tests
    const initialParams: {
      id: string;
      testName: string;
      parameter: string;
      result: string;
      unit: string;
      referenceRange: string;
      isAbnormal: boolean;
    }[] = [];

    const matchedTemplates: string[] = [];
    pat.tests.forEach((t) => {
      const lower = t.toLowerCase();
      if (lower.includes('cbc') || lower.includes('blood count')) matchedTemplates.push('cbc');
      if (lower.includes('diabet') || lower.includes('sugar') || lower.includes('hba1c')) matchedTemplates.push('diabetes');
      if (lower.includes('lipid') || lower.includes('cholesterol')) matchedTemplates.push('lipid');
      if (lower.includes('lft') || lower.includes('liver')) matchedTemplates.push('lft');
      if (lower.includes('kft') || lower.includes('kidney')) matchedTemplates.push('kft');
      if (lower.includes('thyroid')) matchedTemplates.push('thyroid');
      if (lower.includes('urine')) matchedTemplates.push('urine_rm');
    });

    const activeTemplates = matchedTemplates.length > 0 ? Array.from(new Set(matchedTemplates)) : ['cbc'];

    activeTemplates.forEach((tid) => {
      const tmpl = TEST_TEMPLATES.find((t) => t.id === tid);
      if (tmpl) {
        tmpl.parameters.slice(0, 8).forEach((p, idx) => {
          initialParams.push({
            id: `${tid}-${idx}`,
            testName: tmpl.name,
            parameter: p.name,
            result: p.defaultNormalValue,
            unit: p.unit,
            referenceRange: p.referenceRange,
            isAbnormal: false,
          });
        });
      }
    });

    setWorkstationParams(initialParams);
  }, [workstationPatientId, patients]);

  const handleOpenCreateReportModal = (patient?: Patient, report?: LabReport) => {
    setSelectedPatientForReport(patient || null);
    if (report) {
      setSelectedReportToEdit(report);
    } else if (patient && patient.reportId) {
      const existing = getReportById(patient.reportId) || reports.find(r => r.reportId === patient.reportId);
      setSelectedReportToEdit(existing || null);
    } else {
      setSelectedReportToEdit(null);
    }
    setIsCreateReportModalOpen(true);
  };

  const handleEditReport = (report: LabReport) => {
    setIsPreviewModalOpen(false);
    const pat = patients.find(
      (p) => p.reportId === report.reportId || p.uhid === report.uhid || p.mobile === report.mobile
    );
    setSelectedPatientForReport(pat || null);
    setSelectedReportToEdit(report);
    setIsCreateReportModalOpen(true);
  };

  const handleDeleteReport = (report: LabReport) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Diagnostic Report',
      message: `Are you sure you want to permanently delete Report ${report.reportId} for patient "${report.patientName}"? This will erase the verified lab results and update the sample status. This action cannot be undone.`,
      confirmText: 'Yes, Delete Report',
      onConfirm: () => {
        deleteLabReport(report.reportId);
        setPatients((prev) =>
          prev.map((p) =>
            p.reportId === report.reportId ? { ...p, status: 'Sample Collected' } : p
          )
        );
        if (previewReport?.reportId === report.reportId) {
          setIsPreviewModalOpen(false);
          setPreviewReport(null);
        }
        setDeleteConfirm(null);
      },
    });
  };

  const handleReportCreated = (report: LabReport, patientId?: string) => {
    addLabReport(report);

    // Sync with reception entry if applicable
    const rec = receptionEntries.find(
      (r) =>
        r.id === patientId ||
        r.uhid === report.uhid ||
        r.reportId === report.reportId ||
        (r.mobile && report.mobile && r.mobile.replace(/\D/g, '').slice(-10) === report.mobile.replace(/\D/g, '').slice(-10))
    );
    if (rec) {
      completeTechnicianReport(rec.id, report.reportId);
    }

    setPatients((prev) =>
      prev.map((p) => {
        if (
          (patientId && p.id === patientId) ||
          p.uhid === report.uhid ||
          p.mobile === report.mobile ||
          p.reportId === report.reportId
        ) {
          return {
            ...p,
            status: 'Report Ready',
            reportId: report.reportId,
          };
        }
        return p;
      })
    );
    setPreviewReport(report);
  };

  const handleCreateReportForReceptionEntry = (entry: ReceptionPatientEntry) => {
    const convertedPatient: Patient = {
      id: entry.id,
      uhid: entry.uhid,
      name: entry.patientName,
      age: Number(entry.age) || 30,
      gender: entry.gender,
      mobile: entry.mobile,
      city: 'Ludhiana, PB',
      referringDoctor: entry.referringDoctor,
      registeredAt: entry.registeredAt,
      reportId: entry.reportId || `RPT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Sample Collected',
      tests: entry.tests,
      totalBill: entry.totalAmount,
      paidAmount: entry.paidAmount,
      dueAmount: entry.dueAmount,
      paymentMode: entry.paymentMode,
    };
    setSelectedPatientForReport(convertedPatient);
    setSelectedReportToEdit(null);
    setIsCreateReportModalOpen(true);
  };

  const handleOpenReportPreview = (reportId: string, mobile: string) => {
    const found = getReportById(reportId) || reports.find((r) => r.reportId === reportId);
    if (found) {
      setPreviewReport(found);
      setIsPreviewModalOpen(true);
    } else {
      onViewReport(reportId, mobile);
    }
  };

  const handleSignWorkstationReport = () => {
    const pat = patients.find((p) => p.id === workstationPatientId) || patients[0];
    if (!pat) return;

    const items: ReportItem[] = workstationParams.map((wp) => ({
      testName: wp.testName,
      parameter: wp.parameter,
      result: wp.result,
      unit: wp.unit,
      referenceRange: wp.referenceRange,
      isAbnormal: wp.isAbnormal,
    }));

    const rpt: LabReport = {
      reportId: pat.reportId || `RPT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      uhid: pat.uhid,
      patientName: pat.name,
      ageGender: `${pat.age} Yrs / ${pat.gender}`,
      mobile: pat.mobile,
      doctor: pat.referringDoctor,
      sampleCollectedAt: 'Today, 08:30 AM',
      reportedAt: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      labName: vendorLabSettings.labName || 'APEX DIAGNOSTICS & PATHOLOGY LABORATORY',
      labAddress: vendorLabSettings.address || 'SCO 42, Green Park Avenue, Near Civil Hospital, Ludhiana - 141001',
      labPhone: vendorLabSettings.phone || '+91 7087033009',
      nablAccreditationNo: vendorLabSettings.nablAccreditationNo || 'MC-2849 (ISO 15189:2022 Certified)',
      pathologist: 'Dr. Rohit Sharma, MD (Pathology)',
      pathologistDegrees: 'Consultant Pathologist • Reg No: PMC-48192',
      barcode: '||||| | |||| ||| |||||| ||||| |||',
      verified: true,
      verificationHash: `SHA256: ${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      items,
    };

    addLabReport(rpt);
    handleReportCreated(rpt, pat.id);
    setWorkstationSuccessNotice(true);
    setTimeout(() => setWorkstationSuccessNotice(false), 3000);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.mobile.includes(searchFilter) ||
    p.uhid.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.reportId.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const labName = vendorLabSettings?.labName || 'Apex Diagnostic & Clinical Pathology Laboratory';
  const labLogoUrl = vendorLabSettings?.logoUrl || '';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
      {/* Top Application Bar: Vendor Company Logo + Dashboard Name + Vendor Home Website + Log Out Button */}
      <header className="bg-[#123B6D] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
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
                  <span>Technician Lab Workstation & Reports</span>
                </span>
                <span className="hidden sm:inline text-[11px] text-teal-100/90 font-medium">
                  • Clinical Pathology Console
                </span>
              </div>
            </div>
          </div>

          {/* Action Items: Vendor Home Website + Log Out Button */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              id="tech-btn-vendor-website"
              onClick={onBackToWebsite}
              className="bg-white hover:bg-slate-100 text-[#123B6D] px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer border border-white/30 whitespace-nowrap"
              title="Go to Vendor Home Website"
            >
              <Globe className="w-3.5 h-3.5 text-[#123B6D]" />
              <span>Vendor Home Website</span>
            </button>

            <button
              type="button"
              id="tech-btn-logout"
              onClick={() => {
                logout();
                onBackToWebsite();
              }}
              className="bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
              title="Log Out from Technician Dashboard"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Dashboard, Patient Queue, Reception Queue, Results) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto border-t border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-3.5 font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'dashboard'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`py-2 px-3.5 font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'patients'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <span>Patient Queue</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">{patients.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('reception_orders')}
            className={`py-2 px-3.5 font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'reception_orders'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <span>📥 Reception Desk Queue</span>
            {awaitingAcceptCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-pulse">
                {awaitingAcceptCount} New
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                {pendingReceptionEntries.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`py-2 px-3.5 font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'results'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <span>Result Entry & Sign-off</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30">
              Enter Results
            </span>
          </button>
        </div>
      </header>

      {/* Offline Alert Banner if simulated offline */}
      {isOffline && (
        <div className="bg-amber-500 text-slate-900 text-xs px-4 py-2 font-bold flex items-center justify-between border-b border-amber-600">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4" />
            <span>
              OFFLINE MODE ACTIVE: All registrations, results and payments are saving locally to browser storage. Pending sync items: <strong>{offlineQueue}</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Reception Queue Incoming Samples Alert */}
            {awaitingAcceptCount > 0 && (
              <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-teal-500/15 border border-amber-400/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                    📥
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                      <span>{awaitingAcceptCount} Patient Specimen(s) Waiting for Acceptance</span>
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        Reception Action
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      The reception desk has registered patients and dispatched their samples to the lab technician. Click to accept specimen and prepare reports.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('reception_orders')}
                  className="bg-[#123B6D] hover:bg-blue-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
                  <span>Review & Accept Samples ({awaitingAcceptCount}) ➔</span>
                </button>
              </div>
            )}

            {/* 6 Core Metrics as specified */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Today's Patients</span>
                <div className="text-2xl font-black text-[#172033] mt-0.5">126</div>
                <div className="text-[10px] text-emerald-600 font-medium">↑ 14% vs yesterday</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Today's Tests</span>
                <div className="text-2xl font-black text-[#0F766E] mt-0.5">284</div>
                <div className="text-[10px] text-slate-500 font-medium">18 Profiles</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
                <span className="text-[11px] font-semibold text-amber-800 uppercase">Pending Reports</span>
                <div className="text-2xl font-black text-amber-800 mt-0.5">18</div>
                <div className="text-[10px] text-amber-700 font-medium">Pathologist Queue</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Completed Reports</span>
                <div className="text-2xl font-black text-[#16A34A] mt-0.5">246</div>
                <div className="text-[10px] text-emerald-600 font-medium">96% On Time</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Today's Collection</span>
                <div className="text-2xl font-black text-[#123B6D] mt-0.5">₹42,850</div>
                <div className="text-[10px] text-emerald-600 font-medium">UPI: ₹34,100</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
                <span className="text-[11px] font-semibold text-rose-800 uppercase">Due Amount</span>
                <div className="text-2xl font-black text-rose-600 mt-0.5">₹8,420</div>
                <div className="text-[10px] text-slate-500 font-medium">Pending balance</div>
              </div>
            </div>

            {/* Quick Action Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenAddPatient}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Patient Registration is only allowed at Reception Counter"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Patient Entry: Reception Only</span>
                </button>
                <button
                  onClick={() => handleOpenCreateReportModal()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>+ Create Report</span>
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className="bg-[#0F766E] hover:bg-teal-800 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Result Workstation</span>
                </button>
              </div>

              <div className="text-xs text-slate-600 font-medium">
                Live Status: <strong className="text-emerald-700">Online & Sync Active</strong>
              </div>
            </div>

            {/* Live Queue Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold text-[#172033]">
                  Active Patient Worklist (Today)
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter by name, mobile, UHID..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#123B6D]/30"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-4 font-bold">UHID & Date</th>
                      <th className="py-2.5 px-4 font-bold">Patient Details</th>
                      <th className="py-2.5 px-4 font-bold">Doctor Reference</th>
                      <th className="py-2.5 px-4 font-bold">Tests</th>
                      <th className="py-2.5 px-4 font-bold">Bill & Due</th>
                      <th className="py-2.5 px-4 font-bold">Status</th>
                      <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-[#123B6D]">{p.uhid}</div>
                          <div className="text-[10px] text-slate-400">{p.registeredAt}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {p.age} Y / {p.gender} • +91 {p.mobile}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <div className="font-medium">{p.referringDoctor}</div>
                          <div className="text-[10px] text-slate-400">ID: {p.reportId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs truncate font-medium text-slate-800">
                            {p.tests.join(', ')}
                          </div>
                          <div className="text-[10px] text-slate-400">{p.tests.length} tests</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">₹{p.totalBill}</div>
                          {p.dueAmount > 0 ? (
                            <span className="text-[10px] text-rose-600 font-semibold block">
                              Due: ₹{p.dueAmount}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold block">
                              Paid ({p.paymentMode})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'Report Ready' || p.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'Pending Verification'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-[#123B6D]'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleOpenCreateReportModal(p)}
                              className="px-2.5 py-1 rounded bg-[#123B6D] hover:bg-[#0e2c52] text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Enter results or create report for this patient"
                            >
                              <FlaskConical className="w-3 h-3 text-amber-300 fill-amber-300" />
                              <span>{p.status === 'Report Ready' ? 'Edit Report' : 'Make Report'}</span>
                            </button>
                            <button
                              onClick={() => handleOpenReportPreview(p.reportId, p.mobile)}
                              className="p-1.5 text-slate-600 hover:text-[#123B6D] hover:bg-slate-100 rounded"
                              title="View & Print Report"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleWhatsAppSend(p)}
                              className="p-1.5 text-[#0F766E] hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Send WhatsApp Report"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditPatient(p)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer"
                              title="Edit Patient Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePatient(p)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded cursor-pointer"
                              title="Delete Patient Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PATIENTS QUEUE & REGISTRATION */}
        {activeTab === 'patients' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#172033]">Patient Registration & Master Queue</h2>
                <p className="text-xs text-slate-500">Fast 10-digit mobile lookup, Indian name formats, and direct test report generation</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenAddPatient}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Patient entry is restricted to Reception Counter"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>New Patient: Reception Desk Only</span>
                </button>
                <button
                  onClick={() => handleOpenCreateReportModal()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-2 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>+ Create Report</span>
                </button>
              </div>
            </div>

            {/* Patient Cards with Make Report CTA */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {patients.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs font-bold text-[#123B6D]">{p.uhid}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            p.status === 'Report Ready'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 mt-1">{p.name}</div>
                      <div className="text-xs text-slate-500">+91 {p.mobile} • {p.age} Y / {p.gender}</div>
                      <div className="text-[11px] text-slate-600 mt-1 truncate">
                        <strong>Doctor:</strong> {p.referringDoctor}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate">
                        <strong>Tests:</strong> {p.tests.join(', ')}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200/80 flex items-center justify-between gap-1.5">
                      <div className="text-xs font-bold text-slate-800">
                        ₹{p.totalBill} <span className="text-[10px] font-normal text-slate-500">({p.paymentMode})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenCreateReportModal(p)}
                          className="px-2.5 py-1 rounded bg-[#123B6D] hover:bg-[#0e2c52] text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Generate or edit report for this patient"
                        >
                          <FlaskConical className="w-3 h-3 text-amber-300 fill-amber-300" />
                          <span>{p.status === 'Report Ready' ? 'Edit Report' : 'Make Report'}</span>
                        </button>
                        <button
                          onClick={() => handleOpenReportPreview(p.reportId, p.mobile)}
                          className="p-1 text-slate-600 hover:text-[#123B6D] rounded border border-slate-200 bg-white"
                          title="Print/Preview"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditPatient(p)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded border border-slate-200 bg-white"
                          title="Edit Patient"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(p)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded border border-slate-200 bg-white"
                          title="Delete Patient"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-500 text-center py-1">
                Showing all {patients.length} active registered patients in this session.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RESULTS ENTRY, REPORT GENERATION & SIGN-OFF */}
        {activeTab === 'results' && (() => {
          const currentPat = patients.find(p => p.id === workstationPatientId) || patients[0];
          const abnormalCount = workstationParams.filter(p => p.isAbnormal).length;

          return (
            <div className="space-y-4">
              {/* Header with Title and Primary Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-[#172033]">
                      Report Maker & Pathologist Verification Desk
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">
                      Verified Pathologist
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dr. Rohit Sharma, MD (Pathology) • Enter observations, flag abnormal parameters, and issue NABL digitally signed reports
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleOpenCreateReportModal(currentPat)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <FlaskConical className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>+ Full Report Creator</span>
                  </button>
                  <button
                    onClick={() => handleOpenReportPreview(currentPat?.reportId || 'RPT-2026-8812', currentPat?.mobile || '9876543210')}
                    className="bg-[#0F766E] hover:bg-teal-800 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Preview NABL Report</span>
                  </button>
                </div>
              </div>

              {/* Patient Selector Worklist */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                      Select Patient:
                    </label>
                    <select
                      value={workstationPatientId}
                      onChange={(e) => setWorkstationPatientId(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-[#123B6D] focus:outline-none focus:ring-2 focus:ring-[#123B6D]/30 w-full max-w-md cursor-pointer"
                    >
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.age}Y/{p.gender}) — UHID: {p.uhid} [{p.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Status:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        currentPat?.status === 'Report Ready'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {currentPat?.status || 'Pending'}
                    </span>
                    {currentPat?.status === 'Report Ready' && (
                      <button
                        onClick={() => handleWhatsAppSend(currentPat)}
                        className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 text-[11px] font-bold"
                        title="Send report link on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Selected Patient Details Pill Strip */}
                {currentPat && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">PATIENT NAME</span>
                      <span className="font-bold text-slate-900">{currentPat.name}</span> ({currentPat.age}Y/{currentPat.gender})
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">UHID & REPORT ID</span>
                      <span className="font-mono font-bold text-[#123B6D]">{currentPat.uhid}</span>
                      <div className="text-[10px] text-slate-500 font-mono">{currentPat.reportId}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">REFERRING DOCTOR</span>
                      <span className="font-medium text-slate-800">{currentPat.referringDoctor}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">TESTS PRESCRIBED</span>
                      <span className="font-medium text-slate-800 truncate block">{currentPat.tests.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Success Notification Banner when signed */}
              {workstationSuccessNotice && (
                <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 bg-white text-emerald-700 rounded-full p-0.5" />
                    <div>
                      <div className="font-bold text-sm">Report Successfully Generated & Digitally Signed!</div>
                      <div className="text-xs text-emerald-100">
                        NABL ISO 15189 SHA-256 verification seal applied. Patient report is ready for download & WhatsApp dispatch.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReportPreview(currentPat?.reportId || '', currentPat?.mobile || '')}
                      className="px-3 py-1.5 rounded-lg bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition shadow-xs"
                    >
                      View & Print
                    </button>
                    {currentPat && (
                      <button
                        onClick={() => handleWhatsAppSend(currentPat)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Interactive Observed Values Entry Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Parameter Result Entry Sheet
                    </h3>
                    <span className="text-xs text-slate-500">
                      ({workstationParams.length} parameters)
                    </span>
                    {abnormalCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                        ⚠️ {abnormalCount} Abnormal Flag{abnormalCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        ✓ All Values Normal
                      </span>
                    )}
                  </div>

                  {/* Fast Tools */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        // Auto-fill normal values
                        setWorkstationParams(prev =>
                          prev.map(p => {
                            const range = p.referenceRange;
                            let val = p.result;
                            if (range.includes('–') || range.includes('-')) {
                              const parts = range.split(/[–-]/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
                              if (parts.length >= 2) {
                                val = ((parts[0] + parts[1]) / 2).toFixed(1);
                              }
                            } else if (range.toLowerCase().includes('negative')) {
                              val = 'Negative';
                            } else if (range.includes('<')) {
                              const num = parseFloat(range.replace('<', '').trim());
                              if (!isNaN(num)) val = (num * 0.8).toFixed(1);
                            }
                            return { ...p, result: val, isAbnormal: false };
                          })
                        );
                      }}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Pre-populate all parameters with middle healthy normal values"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Auto-Fill Normal Values</span>
                    </button>
                    <button
                      onClick={() => {
                        const newId = `custom-${Date.now()}`;
                        setWorkstationParams(prev => [
                          ...prev,
                          {
                            id: newId,
                            testName: 'General Clinical Biochemistry',
                            parameter: 'Serum Electrolytes / Additional Parameter',
                            result: '138.0',
                            unit: 'mmol/L',
                            referenceRange: '135.0–145.0',
                            isAbnormal: false,
                          },
                        ]);
                      }}
                      className="px-2.5 py-1 rounded bg-[#123B6D] hover:bg-[#0e2c52] text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Parameter</span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="py-2.5 px-3">Test Section</th>
                        <th className="py-2.5 px-3">Parameter Name</th>
                        <th className="py-2.5 px-3 w-44">Observed Result (Enter Value)</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3">Biological Reference Interval</th>
                        <th className="py-2.5 px-3 text-center">Status Flag</th>
                        <th className="py-2.5 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {workstationParams.map((p, idx) => {
                        return (
                          <tr
                            key={p.id}
                            className={`transition ${
                              p.isAbnormal ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3 font-semibold text-slate-600 text-[11px]">
                              {p.testName}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {p.parameter}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={p.result}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const isAbn = checkIsAbnormal(p.parameter, val, p.referenceRange);
                                    setWorkstationParams(prev =>
                                      prev.map(item =>
                                        item.id === p.id ? { ...item, result: val, isAbnormal: isAbn } : item
                                      )
                                    );
                                  }}
                                  className={`w-full px-2.5 py-1 rounded font-bold font-mono text-xs border transition ${
                                    p.isAbnormal
                                      ? 'border-rose-300 bg-rose-50 text-rose-800 focus:ring-2 focus:ring-rose-400'
                                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#123B6D]/30'
                                  }`}
                                  placeholder="Type result..."
                                />
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                              {p.unit}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                              {p.referenceRange}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {p.isAbnormal ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                  <span>⚠️</span>
                                  <span>ABNORMAL</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <span>✓</span>
                                  <span>NORMAL</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <button
                                onClick={() => {
                                  setWorkstationParams(prev => prev.filter(item => item.id !== p.id));
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1 text-[11px]"
                                title="Remove parameter"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Doctor Clinical Impression */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Pathologist Clinical Interpretation & Notes:
                    </label>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500">Quick Presets:</span>
                      <button
                        onClick={() =>
                          setWorkstationImpression('Parameters are within biological reference intervals for age and gender.')
                        }
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-semibold text-[10px]"
                      >
                        All Normal
                      </button>
                      <button
                        onClick={() =>
                          setWorkstationImpression(
                            'Microcytic hypochromic red blood cell picture. Suggestive of Iron Deficiency Anemia. Clinical correlation recommended.'
                          )
                        }
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-semibold text-[10px]"
                      >
                        Anemia
                      </button>
                      <button
                        onClick={() =>
                          setWorkstationImpression(
                            'Impaired fasting plasma glucose / elevated HbA1c observed. Lifestyle modification and physician consult recommended.'
                          )
                        }
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-semibold text-[10px]"
                      >
                        Diabetes Flag
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={workstationImpression}
                    onChange={(e) => setWorkstationImpression(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                    placeholder="Enter clinical impression and doctor comments..."
                  />
                </div>

                {/* Sign-off & Issue Footer Bar */}
                <div className="p-4 bg-[#0e2c52] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold">Authorized Signatory: Dr. Rohit Sharma, MD (Pathology)</div>
                      <div className="text-[10px] text-slate-300">
                        NABL ISO 15189:2022 Verified • SHA-256 Tamper-Proof Cryptographic Hash will be generated
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={handleSignWorkstationReport}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-5 py-2.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-black/30 active:scale-95 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 fill-slate-950 text-slate-950" />
                      <span>Apply Digital Signature & Issue Report</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Master Archive of Generated Reports in this session */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Recent Verified Reports Archive ({reports.length} Reports)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Accessible via Zero-Login Patient Portal & WhatsApp
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="py-2 px-3">Report ID</th>
                        <th className="py-2 px-3">Patient Name</th>
                        <th className="py-2 px-3">Age / Gender</th>
                        <th className="py-2 px-3">Mobile</th>
                        <th className="py-2 px-3">Reported At</th>
                        <th className="py-2 px-3">Flags</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reports.map((rpt) => {
                        const abn = rpt.items.filter(i => i.isAbnormal).length;
                        return (
                          <tr key={rpt.reportId} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#123B6D]">
                              {rpt.reportId}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {rpt.patientName}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {rpt.ageGender}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              +91 {rpt.mobile}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                              {rpt.reportedAt}
                            </td>
                            <td className="py-2.5 px-3">
                              {abn > 0 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                  {abn} Abnormal
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Normal
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleEditReport(rpt)}
                                  className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Edit report parameters & observations"
                                >
                                  <Edit2 className="w-3 h-3 text-amber-700" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteReport(rpt)}
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50 hover:border-rose-400 border border-rose-200 transition cursor-pointer shadow-2xs"
                                  title="Delete this report"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenReportPreview(rpt.reportId, rpt.mobile)}
                                  className="px-2.5 py-1 rounded bg-[#123B6D] hover:bg-[#0e2c52] text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>Print / View</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const text = encodeURIComponent(
                                      `Hello ${rpt.patientName}, your authenticated test report (${rpt.reportId}) from ${rpt.labName} is ready. View & download without login: ${window.location.origin}?report=${rpt.reportId}`
                                    );
                                    window.open(`https://wa.me/91${rpt.mobile}?text=${text}`, '_blank');
                                  }}
                                  className="p-1 rounded text-emerald-700 hover:bg-emerald-50 border border-emerald-200 cursor-pointer"
                                  title="Send WhatsApp Link"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 4: RECEPTION DESK QUEUE & SAMPLE ACCEPTANCE */}
        {activeTab === 'reception_orders' && (
          <div className="space-y-5">
            {/* Header Title & Subtitle */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-base font-extrabold text-[#172033] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-black">
                    📥
                  </span>
                  <span>Reception Desk Requests & Specimen Acceptance</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live workflow pipeline: patients registered at the reception counter sent to the technician workstation for sample testing and report generation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{awaitingAcceptCount} Pending Acceptance</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenCreateReportModal()}
                  className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>New Direct Report</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500">Total from Reception</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{receptionEntries.length}</div>
                <span className="text-[10px] text-slate-400">Registered today</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
                <span className="text-[11px] font-semibold text-amber-800">Awaiting Tech Accept</span>
                <div className="text-2xl font-black text-amber-800 mt-0.5">{awaitingAcceptCount}</div>
                <span className="text-[10px] text-amber-700">Specimen ready at desk</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
                <span className="text-[11px] font-semibold text-blue-800">In Lab Testing</span>
                <div className="text-2xl font-black text-blue-800 mt-0.5">{inTestingCount}</div>
                <span className="text-[10px] text-blue-600">Sample accepted</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
                <span className="text-[11px] font-semibold text-emerald-800">Reports Completed</span>
                <div className="text-2xl font-black text-emerald-700 mt-0.5">{completedReceptionCount}</div>
                <span className="text-[10px] text-emerald-600">Ready for pickup/WhatsApp</span>
              </div>
            </div>

            {/* Search & Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setReceptionFilter('All')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    receptionFilter === 'All'
                      ? 'bg-[#123B6D] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({receptionEntries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReceptionFilter('Awaiting')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    receptionFilter === 'Awaiting'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Awaiting Acceptance ({awaitingAcceptCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceptionFilter('Accepted')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    receptionFilter === 'Accepted'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>In Testing ({inTestingCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceptionFilter('Completed')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    receptionFilter === 'Completed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Report Done ({completedReceptionCount})</span>
                </button>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search token, name, phone, test..."
                  value={receptionSearch}
                  onChange={(e) => setReceptionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#123B6D]"
                />
              </div>
            </div>

            {/* List of Reception Patient Orders */}
            {(() => {
              const filtered = receptionEntries.filter((entry) => {
                // Status Filter
                if (receptionFilter === 'Awaiting') {
                  if (!(entry.sentToTechnician && entry.technicianStatus === 'Sent to Lab')) return false;
                } else if (receptionFilter === 'Accepted') {
                  if (!(entry.sentToTechnician && entry.technicianStatus === 'Accepted')) return false;
                } else if (receptionFilter === 'Completed') {
                  if (!(entry.sentToTechnician && (entry.technicianStatus === 'Report Generated' || !!entry.reportId))) return false;
                }

                // Search Filter
                if (receptionSearch.trim()) {
                  const q = receptionSearch.toLowerCase();
                  const matchToken = entry.tokenNumber.toLowerCase().includes(q);
                  const matchName = entry.patientName.toLowerCase().includes(q);
                  const matchMobile = entry.mobile.includes(q);
                  const matchUhid = entry.uhid.toLowerCase().includes(q);
                  const matchTest = entry.tests.some((t) => t.toLowerCase().includes(q));
                  if (!matchToken && !matchName && !matchMobile && !matchUhid && !matchTest) return false;
                }

                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <FlaskConical className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">No Patient Requests Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {receptionSearch
                        ? `No records matching "${receptionSearch}". Try another query.`
                        : 'No patient registrations in this view yet. Patients registered at the reception counter will appear here in real-time.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((entry) => {
                    const isPending = entry.sentToTechnician && entry.technicianStatus === 'Sent to Lab';
                    const isAccepted = entry.sentToTechnician && entry.technicianStatus === 'Accepted';
                    const isCompleted = entry.sentToTechnician && (entry.technicianStatus === 'Report Generated' || !!entry.reportId);
                    const isNotSent = !entry.sentToTechnician || entry.technicianStatus === 'Not Sent';

                    return (
                      <div
                        key={entry.id}
                        className={`bg-white rounded-2xl p-4 border transition hover:shadow-md space-y-3 ${
                          isPending
                            ? 'border-amber-300 ring-1 ring-amber-300/40 bg-amber-50/10'
                            : isAccepted
                            ? 'border-blue-200'
                            : isCompleted
                            ? 'border-emerald-200 bg-emerald-50/5'
                            : 'border-slate-200'
                        }`}
                      >
                        {/* Top: Token, UHID, Status Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-[#123B6D] text-white font-black text-xs rounded-lg shadow-2xs">
                              {entry.tokenNumber}
                            </span>
                            <div>
                              <div className="font-extrabold text-slate-900 text-sm">{entry.patientName}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                                <span>{entry.uhid}</span>
                                <span>•</span>
                                <span>{entry.age} Y / {entry.gender}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Pill */}
                          <div>
                            {isPending && (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg text-[11px] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                <span>Awaiting Accept</span>
                              </span>
                            )}
                            {isAccepted && (
                              <span className="px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-300 font-bold rounded-lg text-[11px] flex items-center gap-1">
                                <FlaskConical className="w-3 h-3 text-blue-600" />
                                <span>In Testing</span>
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded-lg text-[11px] flex items-center gap-1">
                                <CheckCheck className="w-3 h-3 text-emerald-600" />
                                <span>Report Ready</span>
                              </span>
                            )}
                            {isNotSent && (
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 font-medium rounded-lg text-[11px]">
                                At Reception Desk
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: Tests prescribed */}
                        <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 space-y-1.5 border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">Prescribed Tests:</span>
                            <span className="text-[11px] text-slate-500">
                              Ref: <strong>{entry.referringDoctor}</strong>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {entry.tests.map((t, idx) => (
                              <span
                                key={idx}
                                className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-800"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                            <span>Phone: <strong>{entry.mobile}</strong></span>
                            <span>Time: <strong>{entry.registeredAt}</strong></span>
                          </div>
                        </div>

                        {/* Billing status */}
                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">Total: ₹{entry.totalAmount}</span>
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              Paid: ₹{entry.paidAmount}
                            </span>
                            {entry.dueAmount > 0 && (
                              <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                                Due: ₹{entry.dueAmount}
                              </span>
                            )}
                          </div>

                          {entry.reportId && (
                            <span className="font-mono text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              {entry.reportId}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons for Technician */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  acceptEntryByTechnician(entry.id);
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
                                title="Accept specimen into laboratory"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>✓ Accept Sample</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  acceptEntryByTechnician(entry.id);
                                  handleCreateReportForReceptionEntry(entry);
                                }}
                                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
                                title="Accept sample and open report creator"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Accept & Make Report</span>
                              </button>
                            </>
                          )}

                          {isAccepted && (
                            <button
                              type="button"
                              onClick={() => handleCreateReportForReceptionEntry(entry)}
                              className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                              title="Enter parameters, values and create diagnostic report"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Enter Results & Make Report</span>
                            </button>
                          )}

                          {isCompleted && entry.reportId && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenReportPreview(entry.reportId!, entry.mobile)}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Report</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const text = encodeURIComponent(
                                    `*${vendorLabSettings.labName}*\nHello ${entry.patientName}, your test report (${entry.reportId}) for ${entry.tests.join(', ')} is ready!\n\nView online at: ${window.location.origin}?report=${entry.reportId}`
                                  );
                                  window.open(`https://wa.me/91${entry.mobile.replace(/\D/g, '')}?text=${text}`, '_blank');
                                }}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition cursor-pointer"
                                title="Share Report via WhatsApp"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {isNotSent && (
                            <button
                              type="button"
                              onClick={() => sendEntryToTechnician(entry.id)}
                              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                            >
                              <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
                              <span>Pull Specimen to Lab</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* NEW PATIENT REGISTRATION MODAL */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            <h3 className="text-base font-extrabold text-[#172033] mb-1">
              {editingPatient ? 'Edit Patient Information' : 'New Patient Registration & Intake'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingPatient
                ? `Update demographics, referring doctor, tests or billing for ${editingPatient.uhid}`
                : 'Creates instant UHID, barcode specimen label, and billing receipt.'}
            </p>

            <form onSubmit={handleRegisterPatient} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="e.g. Harpreet Singh"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Age</label>
                  <input
                    type="number"
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Gender</label>
                  <select
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mobile No.</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={newPatientMobile}
                    onChange={(e) => setNewPatientMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10 Digits"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Referring Doctor</label>
                <input
                  type="text"
                  value={newPatientDoctor}
                  onChange={(e) => setNewPatientDoctor(e.target.value)}
                  placeholder="e.g. Dr. S. K. Gupta"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Select Tests to Schedule</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {MOCK_TESTS.slice(0, 8).map((t) => {
                    const isSelected = selectedTests.includes(t.name);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTests(selectedTests.filter(name => name !== t.name));
                          } else {
                            setSelectedTests([...selectedTests, t.name]);
                          }
                        }}
                        className={`text-left p-1.5 rounded border text-[11px] transition ${
                          isSelected
                            ? 'bg-[#123B6D] text-white border-[#0e2c52] font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="truncate">{t.name}</div>
                        <div className={isSelected ? 'text-amber-300' : 'text-[#123B6D]'}>
                          ₹{t.priceINR}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Advance Amount Received</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-slate-500 font-semibold">₹</span>
                    <input
                      type="number"
                      value={paidNow}
                      onChange={(e) => setPaidNow(e.target.value)}
                      className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Card</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegModal(false);
                    setEditingPatient(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#123B6D] hover:bg-[#0e2c52] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{editingPatient ? 'Update Patient Record' : 'Save & Print Barcode'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Full Interactive Report Creator & Editor */}
      <CreateReportModal
        isOpen={isCreateReportModalOpen}
        onClose={() => {
          setIsCreateReportModalOpen(false);
          setSelectedReportToEdit(null);
        }}
        patients={patients}
        existingReport={selectedReportToEdit || undefined}
        allowNewPatientEntry={false}
        onReportCreated={(createdReport) => {
          handleReportCreated(createdReport, selectedPatientForReport?.id);
          setPreviewReport(createdReport);
          setIsPreviewModalOpen(true);
        }}
        preselectedPatient={selectedPatientForReport || undefined}
        onOpenReportPreview={(rptId, mob) => {
          handleOpenReportPreview(rptId, mob);
        }}
      />

      {/* MODAL: NABL Report Detail & Print/WhatsApp Preview */}
      {previewReport && (
        <ReportDetailModal
          report={previewReport}
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          onEditReport={(report) => handleEditReport(report)}
          onDeleteReport={(report) => handleDeleteReport(report)}
          onOpenPatientPortal={(rptId, mob) => onViewReport(rptId, mob)}
        />
      )}

      {/* IN-APP DELETE CONFIRMATION MODAL */}
      {deleteConfirm && deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{deleteConfirm.title}</h3>
                <p className="text-[11px] text-slate-500 font-medium">Confirmation Required</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {deleteConfirm.message}
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteConfirm.onConfirm}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteConfirm.confirmText || 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TECHNICIAN ENTRY BLOCKED WARNING MODAL */}
      {isTechnicianEntryBlockedModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-amber-300 p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-800">
              <span className="p-2.5 rounded-xl bg-amber-100">
                <Lock className="w-5 h-5 text-amber-900" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900">Lab Technician Entry Restricted</h3>
                <span className="text-[11px] text-amber-800 font-extrabold uppercase tracking-wide">
                  Patient Registration = Reception Desk Only
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Lab technicians cannot register new patients or generate billing tokens. All patient registration, demographic capture (name, mobile, age, referring doctor), and billing must be conducted at the <strong>Reception Desk</strong>.
            </p>
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Technicians enter test parameter observations and generate clinical pathology reports for patients that have already been registered by the Reception Counter.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsTechnicianEntryBlockedModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Lab Copyright, labname.com link and Customer Care Helpline */}
      <DashboardFooter />
    </div>
  );
};
