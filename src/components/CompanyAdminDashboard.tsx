import React, { useState } from 'react';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  Save,
  Check,
  Eye,
  LogOut,
  RefreshCw,
  HelpCircle,
  Layers,
  IndianRupee,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  TrendingUp,
  Building2,
  SlidersHorizontal,
  AlertTriangle,
  FlaskConical,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { AppView, PricingPlan, CompanyFeature, CompanyFaq, CompanyStat } from '../types';
import { VendorManagementTab } from './admin/VendorManagementTab';
import { WebsiteSectionsTab } from './admin/WebsiteSectionsTab';

interface CompanyAdminDashboardProps {
  onNavigateView: (view: AppView) => void;
}

export const CompanyAdminDashboard: React.FC<CompanyAdminDashboardProps> = ({ onNavigateView }) => {
  const {
    currentUser,
    logout,
    companySettings,
    updateCompanySettings,
    pricingPlans,
    addPricingPlan,
    updatePricingPlan,
    deletePricingPlan,
    companyFeatures,
    addCompanyFeature,
    updateCompanyFeature,
    deleteCompanyFeature,
    companyFaqs,
    addCompanyFaq,
    updateCompanyFaq,
    deleteCompanyFaq,
    companyStats,
    updateCompanyStat,
    resetAllToDefaults,
    vendorLabsList,
    portalSections,
    superAdminTenantScope,
    setSuperAdminTenantScope,
  } = useCms();

  type AdminTab = 'vendors' | 'sections' | 'settings' | 'pricing' | 'features' | 'faqs' | 'stats';
  const [activeTab, setActiveTab] = useState<AdminTab>('vendors');
  const [toastMessage, setToastMessage] = useState('');

  const pendingPaymentCount = vendorLabsList.filter(
    (v) => v.status === 'Processing due to payment confirmation'
  ).length;
  const activeSectionsCount = Object.values(portalSections).filter(Boolean).length;

  // Edit / Add Modal States
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isNewPlanModal, setIsNewPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState<Omit<PricingPlan, 'id'>>({
    name: '',
    target: '',
    monthlyPriceINR: 1999,
    yearlyPriceINR: 1599,
    description: '',
    isPopular: false,
    features: ['Unlimited Patients', 'WhatsApp PDF Reports', 'NABL Format Support'],
  });

  const [editingFeature, setEditingFeature] = useState<CompanyFeature | null>(null);
  const [isNewFeatureModal, setIsNewFeatureModal] = useState(false);
  const [featureForm, setFeatureForm] = useState<Omit<CompanyFeature, 'id'>>({
    title: '',
    description: '',
    category: 'Core System',
    badge: '',
  });

  const [editingFaq, setEditingFaq] = useState<CompanyFaq | null>(null);
  const [isNewFaqModal, setIsNewFaqModal] = useState(false);
  const [faqForm, setFaqForm] = useState<Omit<CompanyFaq, 'id'>>({
    question: '',
    answer: '',
    category: 'General',
  });

  // Settings local form
  const [settingsForm, setSettingsForm] = useState({ ...companySettings });

  // In-app Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Handlers for Pricing Plans
  const handleOpenAddPlan = () => {
    setPlanForm({
      name: 'Diagnostic Pro Plan',
      target: 'Growing Diagnostic Centers',
      monthlyPriceINR: 2499,
      yearlyPriceINR: 1999,
      description: 'Ideal for medium-sized diagnostic centers with barcode scanners & multiple workstations.',
      isPopular: false,
      features: [
        'Unlimited Patient Registrations',
        'Offline Desktop Sync',
        'Automatic WhatsApp PDF Reports',
        'Thermal Barcode Printing',
        'NABL Compliant Reports with Digital Sign',
        'Priority Phone Support',
      ],
    });
    setIsNewPlanModal(true);
  };

  const handleSaveNewPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name) return;
    addPricingPlan(planForm);
    setIsNewPlanModal(false);
    showToast('New pricing plan added successfully!');
  };

  const handleOpenEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      target: plan.target,
      monthlyPriceINR: plan.monthlyPriceINR,
      yearlyPriceINR: plan.yearlyPriceINR,
      description: plan.description,
      isPopular: plan.isPopular,
      features: [...plan.features],
    });
  };

  const handleSaveEditPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    updatePricingPlan(editingPlan.id, planForm);
    setEditingPlan(null);
    showToast('Pricing plan updated successfully!');
  };

  const handleDeletePlan = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Subscription Plan',
      message: `Are you sure you want to delete the plan "${name}"?`,
      confirmText: 'Yes, Delete Plan',
      onConfirm: () => {
        deletePricingPlan(id);
        showToast('Plan deleted.');
        setDeleteConfirm(null);
      },
    });
  };

  // Feature Handlers
  const handleOpenAddFeature = () => {
    setFeatureForm({
      title: 'AI Reference Range Highlighter',
      description: 'Automatically flags critical panic lab values with color-coded alerts and SMS notifications.',
      category: 'Clinical Safety',
      badge: 'New',
    });
    setIsNewFeatureModal(true);
  };

  const handleSaveNewFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureForm.title) return;
    addCompanyFeature(featureForm);
    setIsNewFeatureModal(false);
    showToast('Feature added successfully!');
  };

  const handleOpenEditFeature = (feat: CompanyFeature) => {
    setEditingFeature(feat);
    setFeatureForm({
      title: feat.title,
      description: feat.description,
      category: feat.category,
      badge: feat.badge || '',
    });
  };

  const handleSaveEditFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature) return;
    updateCompanyFeature(editingFeature.id, featureForm);
    setEditingFeature(null);
    showToast('Feature updated successfully!');
  };

  const handleDeleteFeature = (id: string, title: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Software Feature',
      message: `Are you sure you want to delete feature "${title}"?`,
      confirmText: 'Yes, Delete Feature',
      onConfirm: () => {
        deleteCompanyFeature(id);
        showToast('Feature deleted.');
        setDeleteConfirm(null);
      },
    });
  };

  // FAQ Handlers
  const handleOpenAddFaq = () => {
    setFaqForm({
      question: 'Can I import patient records from Excel / CSV?',
      answer: 'Yes! The desktop and cloud app allows 1-click import and export of patient logs, doctor lists, and test catalogs in Excel format.',
      category: 'Features',
    });
    setIsNewFaqModal(true);
  };

  const handleSaveNewFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question) return;
    addCompanyFaq(faqForm);
    setIsNewFaqModal(false);
    showToast('FAQ added successfully!');
  };

  const handleOpenEditFaq = (faq: CompanyFaq) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
    });
  };

  const handleSaveEditFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    updateCompanyFaq(editingFaq.id, faqForm);
    setEditingFaq(null);
    showToast('FAQ updated successfully!');
  };

  const handleDeleteFaq = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete FAQ',
      message: 'Are you sure you want to delete this FAQ question and answer?',
      confirmText: 'Yes, Delete FAQ',
      onConfirm: () => {
        deleteCompanyFaq(id);
        showToast('FAQ deleted.');
        setDeleteConfirm(null);
      },
    });
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(settingsForm);
    showToast('Company details & Hero section updated! View live site to inspect.');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <header className="bg-[#123B6D] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
              HQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base tracking-tight text-white">
                  {companySettings.companyName} Super Admin CMS
                </h1>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                  Live Management
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Logged in as: <strong>{currentUser?.name || 'Company Super Admin'}</strong> ({currentUser?.email || 'admin@labname.com'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateView('website')}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
              title="Open Company Public Website"
            >
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>Preview Live Website</span>
            </button>

            {/* Direct jump to Reception Counter */}
            <button
              onClick={() => onNavigateView('reception_dashboard')}
              className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-teal-400/50"
              title="Open Reception Entry & Billing Counter"
            >
              <span>🖥️ Reception Counter</span>
            </button>

            {/* Direct jump to Technician Department Dashboard */}
            <button
              onClick={() => onNavigateView('technician_dashboard')}
              className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-purple-400/50"
              title="Open Technician Department Dashboard"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
              <span>🔬 Technician Dept</span>
            </button>

            <button
              onClick={() => onNavigateView('vendor_dashboard')}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              title="Open Lab Vendor Portal"
            >
              <span>Switch to Lab Vendor CMS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                logout();
                onNavigateView('website');
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Multi-Lab Data Isolation & Tenant Scope Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-[#123B6D] to-slate-900 rounded-2xl p-4 text-white shadow-sm border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white tracking-wide">
                  Multi-Lab Data Isolation Engine
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Strict Tenant Boundary Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Each laboratory's patients, reports, tests, staff & billing are strictly isolated by unique Lab ID.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto bg-black/30 p-1.5 rounded-xl border border-white/15">
            <span className="text-[11px] font-bold text-slate-300 pl-2">Super Admin Scope:</span>
            <select
              value={superAdminTenantScope}
              onChange={(e) => {
                setSuperAdminTenantScope(e.target.value);
                const targetName =
                  e.target.value === 'all'
                    ? 'All Labs (Global)'
                    : vendorLabsList.find((l) => l.id === e.target.value)?.name || e.target.value;
                setToastMessage(`Switched Super Admin Data Scope to: ${targetName}`);
                setTimeout(() => setToastMessage(''), 3000);
              }}
              className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="all">🌐 All Labs (Global Unrestricted)</option>
              {vendorLabsList.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  🔬 {lab.name} ({lab.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Nav / Tabs Strip */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap">
            {/* 1. Manage Vendors (Partner Labs) */}
            <button
              onClick={() => setActiveTab('vendors')}
              id="tab-btn-vendors"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'vendors'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Building2 className={`w-3.5 h-3.5 ${activeTab === 'vendors' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Partner Labs & Vendors ({vendorLabsList.length})</span>
              {pendingPaymentCount > 0 && (
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black animate-pulse" title={`${pendingPaymentCount} labs awaiting payment confirmation`}>
                  {pendingPaymentCount}
                </span>
              )}
            </button>

            {/* 2. Website Sections ON / OFF */}
            <button
              onClick={() => setActiveTab('sections')}
              id="tab-btn-sections"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'sections'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className={`w-3.5 h-3.5 ${activeTab === 'sections' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>Website Sections ON/OFF ({activeSectionsCount}/24)</span>
            </button>

            {/* 3. Company Branding & Content */}
            <button
              onClick={() => setActiveTab('settings')}
              id="tab-btn-settings"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Website Content & Branding</span>
            </button>

            {/* 4. Pricing Plans */}
            <button
              onClick={() => setActiveTab('pricing')}
              id="tab-btn-pricing"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>SaaS Pricing ({pricingPlans.length})</span>
            </button>

            {/* 5. Features & Modules */}
            <button
              onClick={() => setActiveTab('features')}
              id="tab-btn-features"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Features ({companyFeatures.length})</span>
            </button>

            {/* 6. FAQs */}
            <button
              onClick={() => setActiveTab('faqs')}
              id="tab-btn-faqs"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'faqs'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQs ({companyFaqs.length})</span>
            </button>

            {/* 7. Stats & Trust Counters */}
            <button
              onClick={() => setActiveTab('stats')}
              id="tab-btn-stats"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Stats ({companyStats.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              setDeleteConfirm({
                isOpen: true,
                title: 'Reset Factory Demo Defaults',
                message: 'Reset all Company & Vendor data back to initial demo defaults?',
                confirmText: 'Yes, Reset Defaults',
                onConfirm: () => {
                  resetAllToDefaults();
                  showToast('Reset back to factory demo defaults.');
                  setDeleteConfirm(null);
                },
              });
            }}
            className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo Defaults</span>
          </button>
        </div>

        {/* 1. PARTNER LABS & VENDORS MANAGEMENT TAB */}
        {activeTab === 'vendors' && (
          <VendorManagementTab onNavigateView={onNavigateView} showToast={showToast} />
        )}

        {/* 2. WEBSITE SECTIONS ON / OFF TAB */}
        {activeTab === 'sections' && (
          <WebsiteSectionsTab onNavigateView={onNavigateView} showToast={showToast} />
        )}

        {/* 1. PRICING PLANS TAB */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#123B6D]">
                  Manage Subscription Plans (INR Pricing)
                </h2>
                <p className="text-xs text-slate-500">
                  Add, edit, or delete software subscription tiers shown on the pricing table of the company website.
                </p>
              </div>
              <button
                onClick={handleOpenAddPlan}
                className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add New Plan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border ${
                    plan.isPopular ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                  } p-5 shadow-2xs flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#123B6D] border border-blue-200">
                        {plan.target}
                      </span>
                      {plan.isPopular && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                          Most Popular
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-3">{plan.description}</p>

                    <div className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-[#123B6D]">
                          ₹{plan.monthlyPriceINR.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500">/ month</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium">
                        ₹{plan.yearlyPriceINR.toLocaleString('en-IN')}/mo when billed yearly
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Included Features ({plan.features.length}):
                      </span>
                      {plan.features.slice(0, 5).map((f, i) => (
                        <div key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                      {plan.features.length > 5 && (
                        <span className="text-[11px] text-slate-400 italic">
                          + {plan.features.length - 5} more features
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditPlan(plan)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">ID: {plan.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. FEATURES TAB */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#123B6D]">
                  Software Features & Modules
                </h2>
                <p className="text-xs text-slate-500">
                  Add, edit, or delete capability cards highlighted on the website.
                </p>
              </div>
              <button
                onClick={handleOpenAddFeature}
                className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add New Feature</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyFeatures.map((feat) => (
                <div
                  key={feat.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {feat.category}
                      </span>
                      {feat.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#123B6D]">
                          {feat.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900">{feat.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{feat.description}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditFeature(feat)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteFeature(feat.id, feat.title)}
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

        {/* 3. FAQS TAB */}
        {activeTab === 'faqs' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#123B6D]">
                  Frequently Asked Questions (FAQs)
                </h2>
                <p className="text-xs text-slate-500">
                  Add answers to queries asked by lab owners, doctors, and lab technicians.
                </p>
              </div>
              <button
                onClick={handleOpenAddFaq}
                className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-3">
              {companyFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                          {faq.category}
                        </span>
                        <h3 className="font-extrabold text-sm text-slate-900">{faq.question}</h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 pl-1 leading-relaxed">{faq.answer}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditFaq(faq)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. COMPANY BRANDING & HERO SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <h2 className="text-base font-extrabold text-[#123B6D] mb-1">
              Company Branding, Hero Section & Support Details
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Updates here will immediately alter the text, headlines, and contact links on the main SaaS homepage.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company SaaS Name</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.companyName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hero Badge Text</label>
                  <input
                    type="text"
                    value={settingsForm.heroBadge}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroBadge: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Main Headline</label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Subheadline</label>
                <textarea
                  rows={3}
                  value={settingsForm.heroSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Top Announcement Notice</label>
                <input
                  type="text"
                  value={settingsForm.announcementText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sales / Helpline Phone</label>
                  <input
                    type="text"
                    value={settingsForm.supportPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Support Email</label>
                  <input
                    type="email"
                    value={settingsForm.supportEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Save Changes to Website</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 5. STATS & COUNTERS */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-[#123B6D]">
                Platform Numbers & Trust Metrics
              </h2>
              <p className="text-xs text-slate-500">
                Edit the milestone stats displayed in the trust strip of the homepage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {companyStats.map((stat) => (
                <div key={stat.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="text-[11px] font-bold uppercase text-slate-500">{stat.label}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block">Display Value</label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => updateCompanyStat(stat.id, { value: e.target.value })}
                        className="w-full p-1.5 rounded-lg border border-slate-300 font-extrabold text-sm text-[#123B6D]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Subtext</label>
                      <input
                        type="text"
                        value={stat.subtext}
                        onChange={(e) => updateCompanyStat(stat.id, { subtext: e.target.value })}
                        className="w-full p-1.5 rounded-lg border border-slate-300 text-xs text-slate-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT PRICING PLAN */}
      {(isNewPlanModal || editingPlan) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-sm text-[#123B6D]">
                {editingPlan ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}
              </h3>
              <button
                onClick={() => {
                  setIsNewPlanModal(false);
                  setEditingPlan(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingPlan ? handleSaveEditPlan : handleSaveNewPlan} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g. Diagnostic Pro Plan"
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Audience Badge</label>
                <input
                  type="text"
                  value={planForm.target}
                  onChange={(e) => setPlanForm({ ...planForm, target: e.target.value })}
                  placeholder="e.g. Independent Pathology Centers"
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Fee (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={planForm.monthlyPriceINR}
                    onChange={(e) => setPlanForm({ ...planForm, monthlyPriceINR: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Yearly Discounted (₹/mo)</label>
                  <input
                    type="number"
                    required
                    value={planForm.yearlyPriceINR}
                    onChange={(e) => setPlanForm({ ...planForm, yearlyPriceINR: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Features (One per line)
                </label>
                <textarea
                  rows={4}
                  value={planForm.features.join('\n')}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      features: e.target.value.split('\n').filter((f) => f.trim().length > 0),
                    })
                  }
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={planForm.isPopular}
                  onChange={(e) => setPlanForm({ ...planForm, isPopular: e.target.checked })}
                  className="rounded text-[#123B6D]"
                />
                <label htmlFor="isPopular" className="font-semibold text-slate-700">
                  Highlight as "Most Popular" Plan
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewPlanModal(false);
                    setEditingPlan(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#123B6D] text-white px-4 py-1.5 rounded-lg font-bold hover:bg-[#0e2c52]"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT FEATURE */}
      {(isNewFeatureModal || editingFeature) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-sm text-[#123B6D]">
                {editingFeature ? 'Edit Feature' : 'Add Feature'}
              </h3>
              <button
                onClick={() => {
                  setIsNewFeatureModal(false);
                  setEditingFeature(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingFeature ? handleSaveEditFeature : handleSaveNewFeature} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Feature Title</label>
                <input
                  type="text"
                  required
                  value={featureForm.title}
                  onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })}
                  placeholder="e.g. Offline-First Billing"
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={featureForm.category}
                    onChange={(e) => setFeatureForm({ ...featureForm, category: e.target.value })}
                    placeholder="e.g. Clinical Safety"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge (Optional)</label>
                  <input
                    type="text"
                    value={featureForm.badge || ''}
                    onChange={(e) => setFeatureForm({ ...featureForm, badge: e.target.value })}
                    placeholder="e.g. New / USP"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={featureForm.description}
                  onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewFeatureModal(false);
                    setEditingFeature(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#123B6D] text-white px-4 py-1.5 rounded-lg font-bold hover:bg-[#0e2c52]"
                >
                  Save Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT FAQ */}
      {(isNewFaqModal || editingFaq) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-sm text-[#123B6D]">
                {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
              </h3>
              <button
                onClick={() => {
                  setIsNewFaqModal(false);
                  setEditingFaq(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingFaq ? handleSaveEditFaq : handleSaveNewFaq} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 leading-relaxed"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewFaqModal(false);
                    setEditingFaq(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#123B6D] text-white px-4 py-1.5 rounded-lg font-bold hover:bg-[#0e2c52]"
                >
                  Save FAQ
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
    </div>
  );
};
