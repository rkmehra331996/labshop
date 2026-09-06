import React from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Eye,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  Layers,
  FileText,
  Shield,
  CreditCard,
  HelpCircle,
  Laptop,
  Smartphone,
  Database,
  Building,
  Check,
  X,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { PortalWebsiteSections, AppView } from '../../types';

interface WebsiteSectionsTabProps {
  onNavigateView: (view: AppView) => void;
  showToast: (msg: string) => void;
}

interface SectionMeta {
  key: keyof PortalWebsiteSections;
  name: string;
  category: 'Core' | 'Features' | 'Diagnostics' | 'Security' | 'Conversion';
  description: string;
  badge?: string;
}

const SECTIONS_CONFIG: SectionMeta[] = [
  {
    key: 'hero',
    name: 'Hero Section & Instant Demo Access',
    category: 'Core',
    description: 'Main display headline, announcement badge, call-to-action buttons, and preview.',
  },
  {
    key: 'trustStrip',
    name: 'Trust Strip & Lab Accreditations',
    category: 'Core',
    description: 'NABL, ICMR, ISO 9001:2015, and 100% Made in India trust markers.',
  },
  {
    key: 'problemSection',
    name: 'Challenges Faced by Traditional Diagnostic Labs',
    category: 'Core',
    description: 'Highlights manual transcription errors, WhatsApp chaos, and paper delays.',
  },
  {
    key: 'solutionSection',
    name: 'Unified Modern Diagnostic Solution',
    category: 'Core',
    description: 'Overview of modern laboratory architecture solving traditional operational bottlenecks.',
  },
  {
    key: 'workflow',
    name: '5-Step Pathological Workflow Engine',
    category: 'Features',
    description: 'Patient entry → Barcoding → Analyzer tests → Pathologist verification → Delivery.',
  },
  {
    key: 'features',
    name: 'Core Clinical Features & Smart Alerts',
    category: 'Features',
    description: 'Panic range notifications, abnormal reference flags, and digital signature stamps.',
  },
  {
    key: 'offline',
    name: '100% Offline Desktop Desk (USP #1)',
    category: 'Features',
    description: 'Allows patient registration and billing during internet outages with auto-sync.',
    badge: 'Flagship USP',
  },
  {
    key: 'patientPortal',
    name: 'Online Patient Report Download Portal (USP #2)',
    category: 'Features',
    description: 'Self-service patient report download using mobile number and token or UHID.',
    badge: 'Popular',
  },
  {
    key: 'vendorWebsitesShowcase',
    name: 'Partner Laboratories & Vendor Directory Showcase',
    category: 'Features',
    description: 'Interactive directory showcasing partnered clinical laboratories with dedicated sites.',
    badge: 'Vendor Hub',
  },
  {
    key: 'reportPreview',
    name: 'Interactive Diagnostic Report Preview',
    category: 'Diagnostics',
    description: 'Live interactive NABL-formatted lab report showing CBC, Lipid, and Thyroid profiles.',
  },
  {
    key: 'whatsapp',
    name: 'Automated Instant WhatsApp Delivery',
    category: 'Diagnostics',
    description: 'Dispatches signed PDF reports directly to patients and doctors on WhatsApp.',
  },
  {
    key: 'testLibrary',
    name: '500+ Pre-Configured Pathology Test Catalog',
    category: 'Diagnostics',
    description: 'Comprehensive test definitions with Indian clinical reference ranges and units.',
  },
  {
    key: 'multiBranch',
    name: 'Multi-Branch & Sample Collection Centers',
    category: 'Diagnostics',
    description: 'Manage multiple collection desks, satellite centers, and processing labs.',
  },
  {
    key: 'staffRoles',
    name: 'Staff Roles & Permission Matrix',
    category: 'Security',
    description: 'Role-based access separating Reception, Lab Technician, Doctor, and Admin.',
  },
  {
    key: 'patientHistory',
    name: '10-Year Longitudinal Patient Medical History',
    category: 'Diagnostics',
    description: 'Track patient parameter trends (e.g. HbA1c, Creatinine) over multiple visits.',
  },
  {
    key: 'dataSafety',
    name: 'Bank-Grade Data Safety & Automated Backups',
    category: 'Security',
    description: 'Daily automated cloud snapshots, AES-256 encryption, and local backup vault.',
  },
  {
    key: 'security',
    name: 'DISHA & HIPAA Regulatory Compliance',
    category: 'Security',
    description: 'Ensures full compliance with Indian digital health data protection standards.',
  },
  {
    key: 'auditLog',
    name: 'Regulatory Audit Trail & Forensic Activity Log',
    category: 'Security',
    description: 'Every edit, reprint, and verification is permanently logged with timestamp and actor.',
  },
  {
    key: 'indianMarket',
    name: 'Built Specifically for Indian Diagnostic Labs',
    category: 'Security',
    description: 'Multi-language support (Hindi, Punjabi), UPI QR payments, and GST tax invoicing.',
  },
  {
    key: 'pricing',
    name: 'Transparent SaaS Pricing Packages',
    category: 'Conversion',
    description: 'Interactive monthly/annual pricing comparison with feature checklists.',
  },
  {
    key: 'demo',
    name: 'Interactive Video & Live Software Demo',
    category: 'Conversion',
    description: 'Schedule an in-depth walkthrough or request a 1-on-1 personalized demo.',
  },
  {
    key: 'finalCta',
    name: 'Final 14-Day Free Trial Call to Action',
    category: 'Conversion',
    description: 'Prominent closing section encouraging new laboratories to start their free trial.',
  },
  {
    key: 'faq',
    name: 'Frequently Asked Questions (FAQ)',
    category: 'Conversion',
    description: 'Answers common questions regarding installation, WhatsApp API, and data migration.',
  },
  {
    key: 'footer',
    name: 'Portal Website Footer & Navigation',
    category: 'Core',
    description: 'Company information, social links, legal notices, and directory shortcuts.',
  },
];

export const WebsiteSectionsTab: React.FC<WebsiteSectionsTabProps> = ({
  onNavigateView,
  showToast,
}) => {
  const { portalSections, updatePortalSection, toggleAllPortalSections } = useCms();

  const totalSections = SECTIONS_CONFIG.length;
  const activeCount = Object.values(portalSections).filter(Boolean).length;

  const handleToggle = (key: keyof PortalWebsiteSections) => {
    const nextState = !portalSections[key];
    updatePortalSection(key, nextState);
    showToast(
      `${SECTIONS_CONFIG.find((s) => s.key === key)?.name || key} is now ${
        nextState ? 'visible (ON)' : 'hidden (OFF)'
      }`
    );
  };

  const handleEnableAll = () => {
    toggleAllPortalSections(true);
    showToast('All 24 website sections are now enabled and visible on the portal.');
  };

  const handleMinimalMode = () => {
    // Keep only essential sections
    toggleAllPortalSections(false);
    updatePortalSection('hero', true);
    updatePortalSection('vendorWebsitesShowcase', true);
    updatePortalSection('pricing', true);
    updatePortalSection('footer', true);
    showToast('Minimalist mode enabled (Hero, Vendor Showcase, Pricing, and Footer only).');
  };

  const handleResetDefaults = () => {
    toggleAllPortalSections(true);
    showToast('Restored all sections to default active state.');
  };

  // Group by category
  const categories = ['Core', 'Features', 'Diagnostics', 'Security', 'Conversion'] as const;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <SlidersHorizontal className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Portal Website Sections Management (ON / OFF)
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Control the live visibility of every module on your public portal website. Turn sections on or off with a single click without touching any code.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigateView('website')}
            className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Inspect changes on the live website"
          >
            <Eye className="w-3.5 h-3.5 text-amber-300" />
            <span>Preview Live Website</span>
          </button>
        </div>
      </div>

      {/* Control Strip & Counters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Active Counter */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm">
            {activeCount}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              {activeCount} of {totalSections} Sections Active
            </div>
            <div className="text-[11px] text-slate-500">
              {totalSections - activeCount} section(s) currently hidden on public website
            </div>
          </div>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleEnableAll}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Enable All
          </button>
          <button
            onClick={handleMinimalMode}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Minimalist Mode
          </button>
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Section Categories */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const catSections = SECTIONS_CONFIG.filter((s) => s.category === cat);
          if (catSections.length === 0) return null;

          const catActiveCount = catSections.filter((s) => portalSections[s.key]).length;

          return (
            <div key={cat} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              {/* Category Header */}
              <div className="bg-slate-50/80 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-slate-700">
                  <span>{cat} Sections</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[10px] text-slate-600 font-mono">
                    {catActiveCount} / {catSections.length} ON
                  </span>
                </div>
              </div>

              {/* Sections List */}
              <div className="divide-y divide-slate-100">
                {catSections.map((sec) => {
                  const isEnabled = !!portalSections[sec.key];

                  return (
                    <div
                      key={sec.key}
                      className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition ${
                        isEnabled ? 'bg-white' : 'bg-slate-50/40 opacity-75'
                      }`}
                    >
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm text-slate-900">{sec.name}</h4>
                          {sec.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              {sec.badge}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-mono px-2 py-0.2 rounded-md ${
                              isEnabled
                                ? 'bg-emerald-100 text-emerald-800 font-bold'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isEnabled ? '● Active on Live Site' : '○ Disabled (Hidden)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{sec.description}</p>
                      </div>

                      {/* Toggle Button */}
                      <button
                        onClick={() => handleToggle(sec.key)}
                        id={`toggle-section-${sec.key}`}
                        className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#123B6D] focus:ring-offset-2 ${
                          isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                        role="switch"
                        aria-checked={isEnabled}
                        title={`Turn ${isEnabled ? 'OFF' : 'ON'} ${sec.name}`}
                      >
                        <span className="sr-only">Toggle {sec.name}</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                            isEnabled ? 'translate-x-6 text-emerald-600' : 'translate-x-0 text-slate-400'
                          }`}
                        >
                          {isEnabled ? <Check className="w-3.5 h-3.5 font-bold" /> : <X className="w-3.5 h-3.5" />}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
