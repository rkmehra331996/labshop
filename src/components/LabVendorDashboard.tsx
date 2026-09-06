import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Edit2,
  Trash2,
  Save,
  Check,
  Eye,
  LogOut,
  RefreshCw,
  Search,
  Users,
  Building2,
  Package,
  CalendarCheck,
  Phone,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  ExternalLink,
  Percent,
  TrendingUp,
  DollarSign,
  Activity,
  FileText,
  MessageSquare,
  Share2,
  Stethoscope,
  BadgePercent,
  Clock,
  MapPin,
  Printer,
  Sparkles,
  Globe,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { DashboardFooter } from './DashboardFooter';
import {
  AppView,
  VendorPackage,
  VendorDoctor,
  VendorBranch,
  HomeCollectionBooking,
  TestItem,
} from '../types';
import { VendorWebsiteCmsTab } from './vendor/VendorWebsiteCmsTab';
import { VendorBillingTab } from './vendor/VendorBillingTab';
import { VendorPatientsTab } from './vendor/VendorPatientsTab';
import { VendorTestsTab } from './vendor/VendorTestsTab';

interface LabVendorDashboardProps {
  onNavigateView: (view: AppView) => void;
}

export const LabVendorDashboard: React.FC<LabVendorDashboardProps> = ({ onNavigateView }) => {
  const {
    currentUser,
    logout,
    vendorLabSettings,
    updateVendorLabSettings,
    vendorPackages,
    addVendorPackage,
    updateVendorPackage,
    deleteVendorPackage,
    vendorTests,
    addVendorTest,
    updateVendorTest,
    deleteVendorTest,
    vendorDoctors,
    addVendorDoctor,
    updateVendorDoctor,
    deleteVendorDoctor,
    vendorBranches,
    addVendorBranch,
    updateVendorBranch,
    deleteVendorBranch,
    vendorBookings,
    updateBookingStatus,
    deleteBooking,
    resetAllToDefaults,
  } = useCms();

  const [activeTab, setActiveTab] = useState<
    'website' | 'patients' | 'billing' | 'tests' | 'packages' | 'bookings' | 'doctors' | 'branches' | 'overview' | 'profile'
  >('website');

  const [toastMessage, setToastMessage] = useState('');
  const [testSearch, setTestSearch] = useState('');
  const [testCategoryFilter, setTestCategoryFilter] = useState('All');

  // Modals and Forms
  // 1. Package Modal
  const [isPackageModal, setIsPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<VendorPackage | null>(null);
  const [pkgFeaturesText, setPkgFeaturesText] = useState('');
  const [pkgForm, setPkgForm] = useState<Omit<VendorPackage, 'id'>>({
    name: '',
    testsCount: 24,
    description: '',
    priceINR: 799,
    mrpINR: 1999,
    isPopular: false,
    features: ['Complete Hemogram', 'Liver Function', 'Kidney Function', 'Fasting Blood Sugar'],
  });

  // Delete Confirmation Modal State (replaces window.confirm for iframe compatibility)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  // 2. Test Modal
  const [isTestModal, setIsTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState<TestItem | null>(null);
  const [testForm, setTestForm] = useState<Omit<TestItem, 'id'>>({
    name: '',
    code: 'TEST-001',
    category: 'Biochemistry',
    sampleType: 'Serum / Clot',
    unit: 'mg/dL',
    normalRange: '70 - 110 mg/dL',
    priceINR: 250,
    turnaroundTime: '4 Hours',
  });

  // 3. Doctor Modal
  const [isDoctorModal, setIsDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<VendorDoctor | null>(null);
  const [doctorForm, setDoctorForm] = useState<Omit<VendorDoctor, 'id'>>({
    name: '',
    degrees: 'MBBS, MD',
    specialization: 'Consultant Pathologist',
    experience: '10+ Years Experience',
    bio: '',
    avatarEmoji: '👨‍⚕️',
    referralCommissionPct: 15,
    monthlyReferrals: 20,
    totalReferredBilling: 25000,
  });

  // 4. Branch Modal
  const [isBranchModal, setIsBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<VendorBranch | null>(null);
  const [branchForm, setBranchForm] = useState<Omit<VendorBranch, 'id'>>({
    name: '',
    badge: 'Collection Center',
    address: '',
    phone: '+91 7087033009',
    timings: '7:00 AM - 9:00 PM',
    isEmergency: false,
  });

  // 5. Lab Settings Form
  const [labSettingsForm, setLabSettingsForm] = useState({ ...vendorLabSettings });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Package Handlers
  const handleOpenAddPackage = () => {
    setPkgForm({
      name: '',
      testsCount: 25,
      description: '',
      priceINR: 799,
      mrpINR: 1800,
      isPopular: false,
      features: [],
    });
    setPkgFeaturesText('Complete Blood Count (CBC + ESR)\nLiver Function Tests (LFT)\nKidney Screening (Creatinine & Urea)\nFasting Blood Glucose (Sugar)\nLipid / Cholesterol Screening');
    setEditingPackage(null);
    setIsPackageModal(true);
  };

  const handleOpenEditPackage = (pkg: VendorPackage) => {
    setEditingPackage(pkg);
    setPkgForm({
      name: pkg.name,
      testsCount: pkg.testsCount,
      description: pkg.description,
      priceINR: pkg.priceINR,
      mrpINR: pkg.mrpINR,
      isPopular: !!pkg.isPopular,
      features: [...pkg.features],
    });
    setPkgFeaturesText(pkg.features.join('\n'));
    setIsPackageModal(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgForm.name.trim()) {
      showToast('Please enter a package name');
      return;
    }
    const parsedFeatures = pkgFeaturesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      name: pkgForm.name.trim(),
      description: pkgForm.description.trim(),
      priceINR: Number(pkgForm.priceINR) || 0,
      mrpINR: Number(pkgForm.mrpINR) || 0,
      testsCount: Number(pkgForm.testsCount) || parsedFeatures.length || 1,
      isPopular: Boolean(pkgForm.isPopular),
      features: parsedFeatures.length > 0 ? parsedFeatures : ['General Diagnostic Evaluation'],
    };

    if (editingPackage) {
      updateVendorPackage(editingPackage.id, payload);
      showToast(`Package "${payload.name}" updated!`);
    } else {
      addVendorPackage(payload);
      showToast(`New Health Package "${payload.name}" created!`);
    }
    setIsPackageModal(false);
  };

  const handleDeletePackage = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Health Package',
      message: `Are you sure you want to delete package "${name}"? It will be removed from your website and catalog.`,
      confirmText: 'Yes, Delete Package',
      onConfirm: () => {
        deleteVendorPackage(id);
        showToast(`Package "${name}" deleted successfully.`);
        setDeleteConfirm(null);
      },
    });
  };

  // Test Handlers
  const handleOpenAddTest = () => {
    setTestForm({
      name: '',
      code: `TST-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Biochemistry',
      sampleType: 'Serum (Yellow Top SST)',
      unit: 'mg/dL',
      normalRange: '70 - 110 mg/dL',
      priceINR: 350,
      turnaroundTime: '4 Hours',
    });
    setEditingTest(null);
    setIsTestModal(true);
  };

  const handleOpenEditTest = (test: TestItem) => {
    setEditingTest(test);
    setTestForm({
      name: test.name,
      code: test.code,
      category: test.category,
      sampleType: test.sampleType,
      unit: test.unit,
      normalRange: test.normalRange,
      priceINR: test.priceINR,
      turnaroundTime: test.turnaroundTime,
    });
    setIsTestModal(true);
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.name.trim()) {
      showToast('Please enter test name');
      return;
    }
    const payload = {
      ...testForm,
      name: testForm.name.trim(),
      code: testForm.code.trim().toUpperCase(),
      priceINR: Number(testForm.priceINR) || 0,
    };

    if (editingTest) {
      updateVendorTest(editingTest.id, payload);
      showToast(`Test "${payload.name}" updated!`);
    } else {
      addVendorTest(payload);
      showToast(`New test "${payload.name}" added to catalog!`);
    }
    setIsTestModal(false);
  };

  const handleDeleteTest = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Diagnostic Test',
      message: `Delete test "${name}" from your diagnostic catalog?`,
      confirmText: 'Yes, Delete Test',
      onConfirm: () => {
        deleteVendorTest(id);
        showToast(`Test "${name}" removed from catalog.`);
        setDeleteConfirm(null);
      },
    });
  };

  // Doctor Handlers
  const handleOpenAddDoctor = () => {
    setDoctorForm({
      name: '',
      degrees: 'MBBS, MD (Pathology)',
      specialization: 'Senior Consultant Pathologist',
      experience: '10+ Years Clinical Experience',
      bio: '',
      avatarEmoji: '👨‍⚕️',
      referralCommissionPct: 15,
      monthlyReferrals: 0,
      totalReferredBilling: 0,
    });
    setEditingDoctor(null);
    setIsDoctorModal(true);
  };

  const handleOpenEditDoctor = (doc: VendorDoctor) => {
    setEditingDoctor(doc);
    setDoctorForm({
      name: doc.name,
      degrees: doc.degrees,
      specialization: doc.specialization,
      experience: doc.experience,
      bio: doc.bio,
      avatarEmoji: doc.avatarEmoji,
      referralCommissionPct: doc.referralCommissionPct ?? 15,
      monthlyReferrals: doc.monthlyReferrals ?? 0,
      totalReferredBilling: doc.totalReferredBilling ?? 0,
    });
    setIsDoctorModal(true);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorForm.name.trim()) {
      showToast('Please enter doctor name');
      return;
    }
    const payload = {
      ...doctorForm,
      name: doctorForm.name.trim(),
      referralCommissionPct: Number(doctorForm.referralCommissionPct) || 15,
    };

    if (editingDoctor) {
      updateVendorDoctor(editingDoctor.id, payload);
      showToast(`Doctor "${payload.name}" updated!`);
    } else {
      addVendorDoctor(payload);
      showToast(`New doctor "${payload.name}" added to panel!`);
    }
    setIsDoctorModal(false);
  };

  const handleDeleteDoctor = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Remove Doctor from Panel',
      message: `Are you sure you want to remove "${name}" from your active medical panel?`,
      confirmText: 'Yes, Remove Doctor',
      onConfirm: () => {
        deleteVendorDoctor(id);
        showToast(`Doctor "${name}" removed.`);
        setDeleteConfirm(null);
      },
    });
  };

  // Branch Handlers
  const handleOpenAddBranch = () => {
    setBranchForm({
      name: '',
      badge: 'Collection Center',
      address: '',
      phone: '+91 7087033009',
      timings: 'Mon-Sun: 7:00 AM - 8:30 PM',
      isEmergency: false,
    });
    setEditingBranch(null);
    setIsBranchModal(true);
  };

  const handleOpenEditBranch = (branch: VendorBranch) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      badge: branch.badge,
      address: branch.address,
      phone: branch.phone,
      timings: branch.timings,
      isEmergency: branch.isEmergency,
    });
    setIsBranchModal(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim()) {
      showToast('Please enter branch / center name');
      return;
    }
    const payload = {
      ...branchForm,
      name: branchForm.name.trim(),
    };

    if (editingBranch) {
      updateVendorBranch(editingBranch.id, payload);
      showToast(`Branch "${payload.name}" updated!`);
    } else {
      addVendorBranch(payload);
      showToast(`New branch "${payload.name}" added!`);
    }
    setIsBranchModal(false);
  };

  const handleDeleteBranch = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Collection Center / Branch',
      message: `Are you sure you want to delete branch "${name}"?`,
      confirmText: 'Yes, Delete Branch',
      onConfirm: () => {
        deleteVendorBranch(id);
        showToast(`Branch "${name}" deleted.`);
        setDeleteConfirm(null);
      },
    });
  };

  // Lab Settings Save
  const handleSaveLabSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateVendorLabSettings(labSettingsForm);
    showToast('Lab profile & contact info saved! Changes visible on website.');
  };

  // Filtered Tests
  const categories = ['All', ...Array.from(new Set(vendorTests.map((t) => t.category)))];
  const filteredTests = vendorTests.filter((t) => {
    const matchesCategory = testCategoryFilter === 'All' || t.category === testCategoryFilter;
    const matchesSearch =
      t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
      t.code.toLowerCase().includes(testSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-[#123B6D] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
              LAB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base tracking-tight text-white">
                  {vendorLabSettings.labName}
                </h1>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                  Vendor CMS
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Logged in as: <strong>{currentUser?.name || 'Lab Vendor Owner'}</strong> ({currentUser?.email || 'vendor@apexlab.com'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct jump to Reception Desk Dashboard */}
            <button
              onClick={() => onNavigateView('reception_dashboard')}
              className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-teal-400/50"
              title="Open Reception Entry Desk (Patient Entry, Billing & Token Counter)"
            >
              <span>🖥️ Reception Counter</span>
            </button>

            {/* Direct jump to Technician Department Dashboard */}
            <button
              onClick={() => onNavigateView('technician_dashboard')}
              className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-purple-400/50"
              title="Open Technician Department Dashboard (Test Results & Pathologist Console)"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
              <span>🔬 Technician Dept</span>
            </button>

            <button
              type="button"
              id="vendor-btn-home-website"
              onClick={() => onNavigateView('vendor_website')}
              className="bg-white hover:bg-slate-100 text-[#123B6D] px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer border border-white/30"
              title="Go to Vendor Home Website (Apex Diagnostics)"
            >
              <Globe className="w-3.5 h-3.5 text-[#123B6D]" />
              <span>Vendor Home Website</span>
            </button>

            <button
              onClick={() => onNavigateView('admin_dashboard')}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              title="Switch to SaaS Company CMS"
            >
              <span>Switch to Company CMS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                logout();
                onNavigateView('vendor_website');
              }}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Quick Nav / Tabs Strip */}
        <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* 1. Website Editor & Sections ON/OFF */}
            <button
              onClick={() => setActiveTab('website')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'website' || activeTab === 'profile'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-950" />
              <span>🌐 Vendor's Website & Sections</span>
            </button>

            {/* 2. Manage Patient Details */}
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-teal-400" />
              <span>👥 Manage Patients</span>
            </button>

            {/* 3. Payment & Billing (QR Codes) */}
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>💳 Payment & Billing (QR Codes)</span>
            </button>

            {/* 4. Tests (Add / Edit / Delete) */}
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'tests'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-indigo-300" />
              <span>🧪 Tests Catalog ({vendorTests.length})</span>
            </button>

            {/* Separator */}
            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Lab Management Tabs */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'packages'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Packages ({vendorPackages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Home Bookings ({vendorBookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'doctors'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Doctors ({vendorDoctors.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick jump to Technician Dashboard */}
            <button
              onClick={() => onNavigateView('technician_dashboard')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Open Technician Department Dashboard"
            >
              <span>🔬 Technician Dept ➔</span>
            </button>

            {/* Quick jump to reception */}
            <button
              onClick={() => onNavigateView('reception_dashboard')}
              className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Open Reception Entry Dashboard"
            >
              <span>🖥️ Reception Counter ➔</span>
            </button>

            <button
              onClick={() => {
                setDeleteConfirm({
                  isOpen: true,
                  title: 'Reset Demo Database',
                  message: 'Are you sure you want to reset all lab packages, tests, branches, and bookings to default demo values?',
                  confirmText: 'Yes, Reset to Defaults',
                  onConfirm: () => {
                    resetAllToDefaults();
                    showToast('Reset to demo defaults.');
                    setDeleteConfirm(null);
                  },
                });
              }}
              className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* 1. VENDOR'S OWN WEBSITE CMS & SECTIONS ON/OFF TAB */}
        {(activeTab === 'website' || activeTab === 'profile') && (
          <VendorWebsiteCmsTab onPreviewWebsite={() => onNavigateView('vendor_website')} />
        )}

        {/* 2. MANAGE PATIENT DETAILS TAB */}
        {activeTab === 'patients' && (
          <VendorPatientsTab onNavigateToBilling={() => setActiveTab('billing')} />
        )}

        {/* 3. PAYMENT & BILLING (1 or 2 QR CODES & LEDGER) TAB */}
        {activeTab === 'billing' && (
          <VendorBillingTab />
        )}

        {/* 4. TESTS (ADD / EDIT / DELETE) TAB */}
        {activeTab === 'tests' && (
          <VendorTestsTab />
        )}

        {/* 0. LIVE OVERVIEW & TODAY'S BUSINESS KPIS TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Today's Patients */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Today's Patients
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#123B6D] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">28</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +16%
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>19 Walk-in</span>
                  <span>•</span>
                  <span className="text-amber-700 font-semibold">9 Home Collections</span>
                </div>
              </div>

              {/* Card 2: Today's Revenue */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Today's Revenue
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">₹42,850</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                    UPI Active
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-emerald-700 font-medium">UPI: ₹26,400</span>
                  <span>•</span>
                  <span>Cash: ₹12,150</span>
                </div>
              </div>

              {/* Card 3: Due Amount */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Due / Balance
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600">₹2,800</span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    from 3 patients
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Efficiency: 93.4%</span>
                  <button
                    onClick={() => showToast('WhatsApp payment reminder queued for 3 patients!')}
                    className="text-[#123B6D] hover:underline font-bold text-[10px]"
                  >
                    Send Reminders
                  </button>
                </div>
              </div>

              {/* Card 4: Reports Pipeline */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Diagnostic Reports
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">21 / 28</span>
                  <span className="text-xs font-bold text-[#0F766E] bg-teal-50 px-1.5 py-0.5 rounded-md">
                    Ready & Sent
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-blue-700 font-medium">4 In-Verification</span>
                  <span>•</span>
                  <span>3 Processing</span>
                </div>
              </div>
            </div>

            {/* Quick Action Launchpad */}
            <div className="bg-gradient-to-r from-[#123B6D] to-[#0F766E] rounded-2xl p-5 text-white shadow-md">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" />
                    Quick Operations Launchpad
                  </div>
                  <h3 className="text-base font-extrabold tracking-tight">
                    Manage Daily Laboratory Operations & Patient Front
                  </h3>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Launch the offline billing desk, manage test catalog, or visit your live patient website.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onNavigateView('lab_app')}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Open Billing & Report Software</span>
                  </button>

                  <button
                    onClick={() => onNavigateView('vendor_website')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-300" />
                    <span>View Public Lab Website</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Two-Column Section: Recent Incoming Home Bookings + Tests Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Recent Home Bookings from Website */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-[#123B6D]" />
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Recent Home Collection Leads from Website
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-[#0F766E] hover:underline font-bold"
                  >
                    View All ({vendorBookings.length}) →
                  </button>
                </div>

                {vendorBookings.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No home collection requests currently.
                  </div>
                ) : (
                  <div className="space-y-2.5 flex-1">
                    {vendorBookings.slice(0, 4).map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900 text-sm">{b.patientName}</span>
                            <span className="text-[10px] text-slate-500">{b.mobile}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                b.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'Sample Collected'
                                  ? 'bg-blue-100 text-blue-800'
                                  : b.status === 'Phlebotomist Assigned'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>
                          <p className="text-slate-600 truncate text-[11px] mb-0.5">
                            <strong className="text-slate-800">Test:</strong> {b.packageOrTest}
                          </p>
                          <p className="text-slate-500 text-[11px] truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {b.address} • <Clock className="w-3 h-3 text-slate-400 shrink-0" /> {b.timeSlot}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={`https://wa.me/91${b.mobile.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(
                              b.patientName
                            )},%20this%20is%20${encodeURIComponent(
                              vendorLabSettings.labName
                            )}.%20Your%20home%20sample%20collection%20is%20scheduled%20for%20${encodeURIComponent(
                              b.timeSlot
                            )}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                            title="Send WhatsApp Update"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          <select
                            value={b.status}
                            onChange={(e) => {
                              updateBookingStatus(b.id, e.target.value as any);
                              showToast(`Booking status updated to ${e.target.value}`);
                            }}
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-hidden"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Phlebotomist Assigned">Phlebotomist Assigned</option>
                            <option value="Sample Collected">Sample Collected</option>
                            <option value="Report Delivered">Report Delivered</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Col: Category Distribution & Quality Metrics */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Test Volume Breakdown</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Today
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1 text-slate-700">
                      <span>Biochemistry & Sugar</span>
                      <span className="font-bold text-slate-900">38% (34 tests)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#123B6D] h-full rounded-full w-[38%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1 text-slate-700">
                      <span>Hematology & CBC</span>
                      <span className="font-bold text-slate-900">32% (28 tests)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0F766E] h-full rounded-full w-[32%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1 text-slate-700">
                      <span>Hormones & Thyroid</span>
                      <span className="font-bold text-slate-900">18% (16 tests)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full w-[18%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1 text-slate-700">
                      <span>Urine & Microbiology</span>
                      <span className="font-bold text-slate-900">12% (11 tests)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full w-[12%]" />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Average Turnaround Time (TAT):</span>
                    <strong className="text-emerald-700 font-bold">3.4 Hours</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Active Doctor Network:</span>
                    <strong className="text-slate-800 font-bold">{vendorDoctors.length} Doctors</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Diagnostic Desk Status:</span>
                    <strong className="text-emerald-700 font-bold">Operational (100%)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. HEALTH PACKAGES TAB */}
        {activeTab === 'packages' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#123B6D]">
                  Health Checkup Packages
                </h2>
                <p className="text-xs text-slate-500">
                  Add, edit, or delete preventive health packages displayed on your lab website.
                </p>
              </div>
              <button
                onClick={handleOpenAddPackage}
                className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add New Package</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {vendorPackages.map((pkg) => {
                const discount = Math.round(((pkg.mrpINR - pkg.priceINR) / pkg.mrpINR) * 100);
                return (
                  <div
                    key={pkg.id}
                    className={`bg-white rounded-2xl border ${
                      pkg.isPopular ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                    } p-5 shadow-2xs flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#123B6D]">
                          {pkg.testsCount} Parameters
                        </span>
                        {pkg.isPopular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                            Best Value
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-900">{pkg.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 mb-3">{pkg.description}</p>

                      <div className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 flex items-baseline justify-between">
                        <div>
                          <span className="text-xl font-black text-[#123B6D]">₹{pkg.priceINR}</span>
                          <span className="text-xs text-slate-400 line-through ml-2">₹{pkg.mrpINR}</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {discount}% OFF
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Included Tests:
                        </span>
                        {pkg.features.map((feat, i) => (
                          <div key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditPackage(pkg)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">ID: {pkg.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. TESTS CATALOG TAB (Replaced with VendorTestsTab above) */}
        {false && activeTab === 'tests' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-[#123B6D]">
                  Diagnostic Pathology Tests Directory ({vendorTests.length} Tests)
                </h2>
                <p className="text-xs text-slate-500">
                  Manage test names, rates (INR), specimen vials, and report turnaround times.
                </p>
              </div>
              <button
                onClick={handleOpenAddTest}
                className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add New Test</span>
              </button>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search test by name or code (e.g. CBC, HbA1c, Thyroid)..."
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#123B6D]/30"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-xl text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTestCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                      testCategoryFilter === cat
                        ? 'bg-[#123B6D] text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Test Code</th>
                      <th className="p-3">Test Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Sample Specimen</th>
                      <th className="p-3">Turnaround (TAT)</th>
                      <th className="p-3">Price (₹ INR)</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTests.map((test) => (
                      <tr key={test.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono font-bold text-[#123B6D]">{test.code}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{test.name}</div>
                          <div className="text-[10px] text-slate-400">Ref: {test.normalRange}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium">
                            {test.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{test.sampleType}</td>
                        <td className="p-3 text-slate-600">{test.turnaroundTime}</td>
                        <td className="p-3 font-black text-slate-900">₹{test.priceINR}</td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditTest(test)}
                              className="p-1 rounded-md hover:bg-blue-50 text-blue-600"
                              title="Edit Test"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTest(test.id, test.name)}
                              className="p-1 rounded-md hover:bg-rose-50 text-rose-600"
                              title="Delete Test"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTests.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                          No diagnostic tests matched your search filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. HOME COLLECTION BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#123B6D]">
                  Home Sample Collection Booking Requests
                </h2>
                <p className="text-xs text-slate-500">
                  Track and assign phlebotomists for blood collection bookings placed by patients on the lab website.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendorBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-400">ID: {b.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'Sample Collected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'Phlebotomist Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900">{b.patientName}</h3>
                    <div className="text-xs text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#123B6D]" />
                      <span>{b.mobile}</span>
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div>
                        <span className="text-slate-400">Package/Test:</span>{' '}
                        <strong className="text-slate-800">{b.packageOrTest}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Time Slot:</span>{' '}
                        <strong className="text-slate-700">{b.timeSlot}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Address:</span>{' '}
                        <span className="text-slate-700">{b.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        updateBookingStatus(b.id, e.target.value as HomeCollectionBooking['status'])
                      }
                      className="text-[11px] font-semibold p-1 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Phlebotomist Assigned">Phlebotomist Assigned</option>
                      <option value="Sample Collected">Sample Collected</option>
                      <option value="Report Delivered">Report Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => {
                        setDeleteConfirm({
                          isOpen: true,
                          title: 'Delete Booking Lead',
                          message: `Are you sure you want to remove home collection booking for "${b.patientName}"?`,
                          confirmText: 'Yes, Delete Booking',
                          onConfirm: () => {
                            deleteBooking(b.id);
                            showToast('Booking deleted.');
                            setDeleteConfirm(null);
                          },
                        });
                      }}
                      className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. DOCTORS / PATHOLOGISTS TAB */}
        {activeTab === 'doctors' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#123B6D]">
                  Pathologist & Medical Specialist Panel
                </h2>
                <p className="text-xs text-slate-500">
                  Showcase qualified doctors with AIIMS/NABL credentials on your lab website.
                </p>
              </div>
              <button
                onClick={handleOpenAddDoctor}
                className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Doctor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {vendorDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl">
                        {doc.avatarEmoji}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900">{doc.name}</h3>
                        <div className="text-xs text-[#123B6D] font-bold">{doc.degrees}</div>
                        <div className="text-[10px] text-slate-400">{doc.specialization}</div>
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg inline-block mb-2">
                      {doc.experience}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{doc.bio}</p>

                    {/* Referral & Incentive Track */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Referral Incentive:</span>
                        <span className="font-bold text-[#0F766E] bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          {doc.referralCommissionPct || 15}% Commission
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                        <span>Referred: <strong>{doc.monthlyReferrals || 38} pts</strong></span>
                        <span>Monthly Billing: <strong>₹{doc.totalReferredBilling?.toLocaleString('en-IN') || '54,200'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditDoctor(doc)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                      className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. LAB PROFILE & BRANDING TAB (Replaced with VendorWebsiteCmsTab above) */}
        {false && activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <h2 className="text-base font-extrabold text-[#123B6D] mb-1">
              Lab Identity, NABL Accreditation & Contact Channels
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Changes made here will be displayed instantly on the lab's public website header, hero, and footers.
            </p>

            <form onSubmit={handleSaveLabSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Diagnostic Lab Name</label>
                  <input
                    type="text"
                    required
                    value={labSettingsForm.labName}
                    onChange={(e) => setLabSettingsForm({ ...labSettingsForm, labName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lab Tagline / Subtitle</label>
                  <input
                    type="text"
                    value={labSettingsForm.tagline}
                    onChange={(e) => setLabSettingsForm({ ...labSettingsForm, tagline: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Helpline Phone (Call)</label>
                  <input
                    type="text"
                    required
                    value={labSettingsForm.phone}
                    onChange={(e) => setLabSettingsForm({ ...labSettingsForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Booking Number</label>
                  <input
                    type="text"
                    required
                    value={labSettingsForm.whatsapp}
                    onChange={(e) => setLabSettingsForm({ ...labSettingsForm, whatsapp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NABL Accreditation No.</label>
                  <input
                    type="text"
                    value={labSettingsForm.nablAccreditationNo}
                    onChange={(e) =>
                      setLabSettingsForm({ ...labSettingsForm, nablAccreditationNo: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ISO Certification Tag</label>
                  <input
                    type="text"
                    value={labSettingsForm.isoCert}
                    onChange={(e) => setLabSettingsForm({ ...labSettingsForm, isoCert: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Central Lab Full Address</label>
                  <input
                    type="text"
                    value={labSettingsForm.address}
                    onChange={(e) => setLabSettingsForm({ ...labSettingsForm, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Regular Lab Timings</label>
                  <input
                    type="text"
                    value={labSettingsForm.openingHours}
                    onChange={(e) => setLabSettingsForm({ ...labSettingsForm, openingHours: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hero Home Collection Promotional Banner Text
                </label>
                <input
                  type="text"
                  value={labSettingsForm.heroPromoText}
                  onChange={(e) => setLabSettingsForm({ ...labSettingsForm, heroPromoText: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-hidden"
                />
              </div>

              {/* Statutory Registrations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={labSettingsForm.gstin || '03AAACL1234F1Z8'}
                    onChange={(e) => setLabSettingsForm({ ...labSettingsForm, gstin: e.target.value })}
                    placeholder="e.g. 03AAACL1234F1Z8"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State Medical Council (PMC) Reg. No.</label>
                  <input
                    type="text"
                    value={labSettingsForm.pmcRegistrationNo || 'PMC-PUNJAB-4921'}
                    onChange={(e) => setLabSettingsForm({ ...labSettingsForm, pmcRegistrationNo: e.target.value })}
                    placeholder="e.g. PMC-PUNJAB-4921"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* WhatsApp Automation & Report Customization */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-[#0F766E]">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Automated WhatsApp Report Notification Template
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  This message is auto-sent to patient's WhatsApp when their NABL report is approved & signed.
                </p>

                <div>
                  <textarea
                    rows={3}
                    value={
                      labSettingsForm.whatsappTemplate ||
                      'Namaste {patientName},\nYour diagnostic test report ({reportId}) from {labName} is ready. Click below to download your NABL signed digital PDF:\n{downloadLink}\nThank you for choosing {labName}!'
                    }
                    onChange={(e) => setLabSettingsForm({ ...labSettingsForm, whatsappTemplate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-hidden"
                  />
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span>Available Tags:</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">{`{patientName}`}</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">{`{reportId}`}</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">{`{labName}`}</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">{`{downloadLink}`}</span>
                  </div>
                </div>

                {/* Digital Stamp & Signatures */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
                    <input
                      type="checkbox"
                      checked={labSettingsForm.enableDigitalSignature !== false}
                      onChange={(e) =>
                        setLabSettingsForm({ ...labSettingsForm, enableDigitalSignature: e.target.checked })
                      }
                      className="rounded text-[#123B6D] w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">MD Pathologist Digital Signature</span>
                      <span className="text-[10px] text-slate-500">Auto-attach verified digital sign to PDF reports</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
                    <input
                      type="checkbox"
                      checked={labSettingsForm.enableLabStamp !== false}
                      onChange={(e) =>
                        setLabSettingsForm({ ...labSettingsForm, enableLabStamp: e.target.checked })
                      }
                      className="rounded text-[#123B6D] w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">NABL & Lab Digital Seal / Stamp</span>
                      <span className="text-[10px] text-slate-500">Embed official circular stamp with QR authentication</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Save Lab Profile & Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT PACKAGE */}
      {isPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-sm text-[#123B6D]">
                {editingPackage ? 'Edit Health Package' : 'Create New Health Package'}
              </h3>
              <button
                onClick={() => setIsPackageModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={pkgForm.name}
                  onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                  placeholder="e.g. Master Full Body Profile"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Special Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={pkgForm.priceINR}
                    onChange={(e) => setPkgForm({ ...pkgForm, priceINR: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Market MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={pkgForm.mrpINR}
                    onChange={(e) => setPkgForm({ ...pkgForm, mrpINR: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Test Count</label>
                  <input
                    type="number"
                    required
                    value={pkgForm.testsCount}
                    onChange={(e) => setPkgForm({ ...pkgForm, testsCount: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={pkgForm.description}
                  onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tests & Biomarkers Included (One per line)
                </label>
                <textarea
                  rows={5}
                  value={pkgFeaturesText}
                  onChange={(e) => setPkgFeaturesText(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono text-[11px]"
                  placeholder="Complete Blood Count (CBC + ESR)&#10;Liver Function Tests (LFT)&#10;Kidney Screening"
                />
                <p className="text-[10px] text-slate-400 mt-1">Press Enter to add multiple tests. Each line will appear as an included test item.</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pkgPopular"
                  checked={pkgForm.isPopular}
                  onChange={(e) => setPkgForm({ ...pkgForm, isPopular: e.target.checked })}
                  className="rounded text-[#123B6D]"
                />
                <label htmlFor="pkgPopular" className="font-semibold text-slate-700">
                  Mark as "Popular / Best Value"
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPackageModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#123B6D] text-white px-4 py-1.5 rounded-lg font-bold hover:bg-[#0e2c52]"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT TEST */}
      {isTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-sm text-[#123B6D]">
                {editingTest ? 'Edit Diagnostic Test' : 'Add Diagnostic Test'}
              </h3>
              <button
                onClick={() => setIsTestModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Test Name</label>
                <input
                  type="text"
                  required
                  value={testForm.name}
                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  placeholder="e.g. Thyroid Stimulating Hormone (TSH)"
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Test Code</label>
                  <input
                    type="text"
                    required
                    value={testForm.code}
                    onChange={(e) => setTestForm({ ...testForm, code: e.target.value })}
                    placeholder="e.g. TSH-01"
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={testForm.category}
                    onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Urine Analysis">Urine Analysis</option>
                    <option value="Serology">Serology</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={testForm.priceINR}
                    onChange={(e) => setTestForm({ ...testForm, priceINR: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Turnaround Time</label>
                  <input
                    type="text"
                    value={testForm.turnaroundTime}
                    onChange={(e) => setTestForm({ ...testForm, turnaroundTime: e.target.value })}
                    placeholder="e.g. 4 Hours"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sample Specimen</label>
                  <input
                    type="text"
                    value={testForm.sampleType}
                    onChange={(e) => setTestForm({ ...testForm, sampleType: e.target.value })}
                    placeholder="e.g. Serum / EDTA Blood"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={testForm.unit}
                    onChange={(e) => setTestForm({ ...testForm, unit: e.target.value })}
                    placeholder="e.g. mg/dL, µIU/mL"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Normal Reference Range</label>
                <input
                  type="text"
                  value={testForm.normalRange}
                  onChange={(e) => setTestForm({ ...testForm, normalRange: e.target.value })}
                  placeholder="e.g. 0.35 - 4.94 µIU/mL"
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTestModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#123B6D] text-white px-4 py-1.5 rounded-lg font-bold hover:bg-[#0e2c52]"
                >
                  Save Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT DOCTOR */}
      {isDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-sm text-[#123B6D]">
                {editingDoctor ? 'Edit Doctor Details' : 'Add Pathologist / Doctor'}
              </h3>
              <button
                onClick={() => setIsDoctorModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Degrees</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.degrees}
                    onChange={(e) => setDoctorForm({ ...doctorForm, degrees: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avatar Emoji</label>
                  <input
                    type="text"
                    value={doctorForm.avatarEmoji}
                    onChange={(e) => setDoctorForm({ ...doctorForm, avatarEmoji: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specialization / Role</label>
                <input
                  type="text"
                  value={doctorForm.specialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Experience / Background</label>
                <input
                  type="text"
                  value={doctorForm.experience}
                  onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Referral Incentive / Commission (%)</label>
                <input
                  type="number"
                  value={doctorForm.referralCommissionPct}
                  onChange={(e) => setDoctorForm({ ...doctorForm, referralCommissionPct: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                  placeholder="e.g. 15"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biography</label>
                <textarea
                  rows={3}
                  value={doctorForm.bio}
                  onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDoctorModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#123B6D] text-white px-4 py-1.5 rounded-lg font-bold hover:bg-[#0e2c52]"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT BRANCH */}
      {isBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-sm text-[#123B6D]">
                {editingBranch ? 'Edit Branch' : 'Add Diagnostic Center / Desk'}
              </h3>
              <button
                onClick={() => setIsBranchModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Center / Branch Name</label>
                <input
                  type="text"
                  required
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={branchForm.badge}
                    onChange={(e) => setBranchForm({ ...branchForm, badge: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Timings</label>
                <input
                  type="text"
                  value={branchForm.timings}
                  onChange={(e) => setBranchForm({ ...branchForm, timings: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isEmergency"
                  checked={branchForm.isEmergency}
                  onChange={(e) => setBranchForm({ ...branchForm, isEmergency: e.target.checked })}
                  className="rounded text-[#123B6D]"
                />
                <label htmlFor="isEmergency" className="font-semibold text-slate-700">
                  Open 24x7 Emergency Services
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBranchModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#123B6D] text-white px-4 py-1.5 rounded-lg font-bold hover:bg-[#0e2c52]"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* IN-APP DELETE / ACTION CONFIRMATION MODAL */}
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

      {/* Footer with Lab Copyright, labname.com link and Customer Care Helpline */}
      <DashboardFooter />
    </div>
  );
};
