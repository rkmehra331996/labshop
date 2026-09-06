import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  Check,
  Upload,
  Image as ImageIcon,
  Share2,
  Link as LinkIcon,
  Copy,
} from 'lucide-react';
import { useCms, DEFAULT_VENDOR_SECTIONS } from '../../context/CmsContext';
import { VendorWebsiteSections, VendorLabSettings } from '../../types';
import { generateDefaultOgImage } from '../../utils/seo';

interface VendorWebsiteCmsTabProps {
  onPreviewWebsite?: () => void;
}

interface SectionMeta {
  key: keyof VendorWebsiteSections;
  name: string;
  description: string;
  badge: string;
  category: 'Core' | 'Public Info' | 'Clinical';
}

const SECTION_METAS: SectionMeta[] = [
  {
    key: 'announcementBar',
    name: 'Top Emergency & Notice Bar',
    description: 'Displays 24x7 lab helpline, opening hours, NABL accreditation status, and emergency alert message.',
    badge: 'Notice Strip',
    category: 'Public Info',
  },
  {
    key: 'header',
    name: 'Main Website Header & Navigation',
    description: 'Lab logo, name, tagline, navigation menu links, and quick action buttons (Book Test, Reception Desk, Download Report).',
    badge: 'Header',
    category: 'Core',
  },
  {
    key: 'hero',
    name: 'Hero Banner & Instant Home Booking Card',
    description: 'Main promotional headline, WhatsApp booking button, trust badges, and home sample collection booking form.',
    badge: 'Hero Section',
    category: 'Core',
  },
  {
    key: 'dashboardsShowcase',
    name: 'Dedicated Operational Portals Showcase',
    description: 'Interactive cards linking to Reception Desk, Lab Software & Technician, Patient Portal, and Vendor CMS.',
    badge: 'Portals',
    category: 'Core',
  },
  {
    key: 'packages',
    name: 'Preventive Health Packages Grid',
    description: 'Full Body Health Checkup, Diabetic Care, Senior Citizen profiles with INR pricing, MRP discount, and test counts.',
    badge: 'Packages',
    category: 'Clinical',
  },
  {
    key: 'testDirectory',
    name: '500+ Diagnostic Tests Directory & Search',
    description: 'Searchable directory with categories (Hematology, Biochemistry, Thyroid, Urine, etc.), sample types, TAT, and prices.',
    badge: 'Test Library',
    category: 'Clinical',
  },
  {
    key: 'whyChooseUs',
    name: 'Why Choose Us / Quality Assurance',
    description: 'Highlights automated analyzers, Barcode vacutainer tracking, MD Pathologist review, and cold-chain sample logistics.',
    badge: 'Quality Strip',
    category: 'Public Info',
  },
  {
    key: 'doctors',
    name: 'Pathologists & Consultant Doctors Section',
    description: 'Profiles of chief pathologist, biochemist, and microbiologist with medical council registration numbers and degrees.',
    badge: 'Doctors',
    category: 'Clinical',
  },
  {
    key: 'branches',
    name: 'Our Centers & Collection Desks',
    description: 'List of all branches, central labs, phlebotomy centers with addresses, contact numbers, and timings.',
    badge: 'Centers',
    category: 'Public Info',
  },
  {
    key: 'reportInterlink',
    name: 'Patient Report Download Callout',
    description: 'Direct callout banner allowing patients to look up and download their authenticated NABL report via Report ID & Mobile.',
    badge: 'Reports CTA',
    category: 'Core',
  },
  {
    key: 'footer',
    name: 'Website Footer & Legal Disclaimers',
    description: 'Copyright, lab address, emergency contacts, quick links, and medical laboratory accreditation disclaimers.',
    badge: 'Footer',
    category: 'Public Info',
  },
];

export const VendorWebsiteCmsTab: React.FC<VendorWebsiteCmsTabProps> = ({ onPreviewWebsite }) => {
  const { vendorLabSettings, updateVendorLabSettings, updateVendorSection, toggleAllVendorSections } = useCms();

  // Local form for Website Details
  const [formData, setFormData] = useState<VendorLabSettings>({
    ...vendorLabSettings,
  });

  useEffect(() => {
    setFormData({
      ...vendorLabSettings,
    });
  }, [vendorLabSettings]);

  const [copiedMeta, setCopiedMeta] = useState(false);

  // File Upload Handlers for Logo & OG Image
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleOgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, ogImageUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSectionFilter, setActiveSectionFilter] = useState<'All' | 'Core' | 'Public Info' | 'Clinical'>('All');

  // Custom Announcements List (Website Add / Edit / Delete)
  const [announcements, setAnnouncements] = useState<string[]>(() => {
    return vendorLabSettings.announcementText
      ? [vendorLabSettings.announcementText]
      : ['🌟 Special Discount: 20% off on all preventative full body checkups this week!'];
  });
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [showAddBanner, setShowAddBanner] = useState(false);

  const currentSections: VendorWebsiteSections = {
    ...DEFAULT_VENDOR_SECTIONS,
    ...(vendorLabSettings?.sections || {}),
  };

  const activeSectionsCount = Object.values(currentSections).filter(Boolean).length;
  const totalSectionsCount = SECTION_METAS.length;

  const handleSaveWebsiteInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateVendorLabSettings({
      ...formData,
      announcementText: announcements[0] || '',
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    const updated = [newAnnouncement.trim(), ...announcements];
    setAnnouncements(updated);
    updateVendorLabSettings({ announcementText: updated[0] });
    setNewAnnouncement('');
    setShowAddBanner(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteAnnouncement = (index: number) => {
    const updated = announcements.filter((_, i) => i !== index);
    setAnnouncements(updated);
    updateVendorLabSettings({ announcementText: updated[0] || '' });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetToDefaults = () => {
    toggleAllVendorSections(true);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const filteredSections = SECTION_METAS.filter((s) => {
    if (activeSectionFilter === 'All') return true;
    return s.category === activeSectionFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#123B6D]/10 text-[#123B6D]">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-[#123B6D]">Vendor’s Own Website Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Edit all content, branding, contact numbers, and turn individual website sections ON or OFF in real-time.
            Changes reflect instantly on your dedicated laboratory portal.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {onPreviewWebsite && (
            <button
              onClick={onPreviewWebsite}
              className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Live Website Preview</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Website content and section controls saved successfully! All updates are live.</span>
        </div>
      )}

      {/* 1. SECTIONS ON/OFF CONTROLS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#123B6D]" />
              <h3 className="text-sm font-black text-slate-800">Website Sections ON / OFF Control</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                {activeSectionsCount} of {totalSectionsCount} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Turn any section of your public website ON or OFF with a single toggle. Disabled sections will be completely hidden.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => toggleAllVendorSections(true)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Turn All ON
            </button>
            <button
              onClick={() => toggleAllVendorSections(false)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Turn All OFF
            </button>
            <button
              onClick={handleResetToDefaults}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Section Filters */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold mr-1">Filter:</span>
          {(['All', 'Core', 'Clinical', 'Public Info'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveSectionFilter(cat)}
              className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                activeSectionFilter === cat
                  ? 'bg-[#123B6D] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sections Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSections.map((sec) => {
            const isEnabled = !!currentSections[sec.key];
            return (
              <div
                key={sec.key}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isEnabled
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 opacity-75'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        isEnabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {sec.badge}
                    </span>
                    <span className="text-xs font-black text-slate-800">{sec.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pr-2">
                    {sec.description}
                  </p>
                </div>

                <div className="shrink-0 pt-0.5">
                  <button
                    onClick={() => updateVendorSection(sec.key, !isEnabled)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isEnabled
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
                    }`}
                    title={isEnabled ? 'Click to Turn OFF' : 'Click to Turn ON'}
                  >
                    {isEnabled ? (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        <span>ON</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        <span>OFF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. WEBSITE EDIT: MAIN LAB PROFILE & CONTENT */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800">Website Edit — Core Profile & Identity</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit the text, phone numbers, laboratory address, and credentials displayed on your website.
            </p>
          </div>
          <button
            onClick={handleSaveWebsiteInfo}
            className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>Save Website Content</span>
          </button>
        </div>

        <form onSubmit={handleSaveWebsiteInfo} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* Lab Name */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Laboratory / Shop Name (Shop Name & og:title) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.labName}
                onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D] font-semibold"
                placeholder="e.g. Apex Diagnostic & Clinical Pathology Laboratory"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Acts dynamically as your shop name in website header, reports, invoices, and <span className="font-mono font-semibold text-[#123B6D]">og:title</span>.
              </p>
            </div>

            {/* Lab / Shop ID Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Lab Shop ID Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.labShopId || ''}
                onChange={(e) => setFormData({ ...formData, labShopId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D] font-mono font-bold"
                placeholder="e.g. LSP-7087"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Unique identifier displayed inline in header.
              </p>
            </div>

            {/* Shop Website URL */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Shop Website URL (Canonical URL & og:url)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    value={formData.websiteUrl || ''}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D] font-mono text-xs"
                    placeholder="https://apexdiagnostics.in"
                  />
                </div>
                {formData.websiteUrl && (
                  <a
                    href={formData.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1.5 transition text-xs font-semibold"
                    title="Open Website in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </a>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Current tenant's exact URL, used for <span className="font-mono font-semibold text-[#123B6D]">og:url</span> and canonical links.
              </p>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Short Tagline / Catchphrase
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                placeholder="e.g. Advanced Pathology & Diagnostic Testing"
              />
            </div>

            {/* Shop Short Description */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Shop Short Description (og:description & Search Snippet)
              </label>
              <textarea
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                placeholder="Complete diagnostic pathology, biochemistry, microbiology, and hormonal testing. NABL Certified with fast WhatsApp delivery."
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Used for <span className="font-mono font-semibold text-[#123B6D]">og:description</span> and preview snippets when sharing on WhatsApp, iMessage, and social networks.
              </p>
            </div>

            {/* Shop Logo (Tenant Uploaded Logo) */}
            <div className="md:col-span-3 p-4 bg-slate-50/80 border border-slate-200 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-xs font-bold text-[#123B6D] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>Shop Logo (Tenant Uploaded Logo)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload your official lab logo. Appears dynamically in website header, footer, bills, and serves as the default social share preview.
                  </p>
                </div>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoUrl: '' })}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Logo</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* Logo Preview box */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-slate-300 bg-white p-1.5 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Shop Logo Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-6 h-6 stroke-1" />
                        <span className="text-[9px] font-bold">NO LOGO</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-700">
                      {formData.logoUrl ? 'Custom Logo Uploaded' : 'Default Monogram Active'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      PNG, JPG, SVG or WebP
                    </div>
                  </div>
                </div>

                {/* Upload Action */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition">
                      <Upload className="w-3.5 h-3.5 text-[#123B6D]" />
                      <span>Upload Logo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                    <span className="text-slate-400 text-xs">or paste image URL:</span>
                  </div>
                  <input
                    type="url"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D] font-mono text-[11px]"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>

            {/* Social Sharing Image (og:image) */}
            <div className="md:col-span-3 p-4 bg-slate-50/80 border border-slate-200 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-xs font-bold text-[#123B6D] flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>Open Graph Social Sharing Image (og:image)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    The image displayed when your lab website URL is shared on WhatsApp, Facebook, LinkedIn, Twitter, or iMessage.
                  </p>
                </div>
                {formData.ogImageUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, ogImageUrl: '' })}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to Shop Logo</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* OG Image Preview */}
                <div className="w-full h-24 rounded-lg border border-slate-300 bg-white p-1 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                  <img
                    src={formData.ogImageUrl || formData.logoUrl || generateDefaultOgImage(formData.labName, formData.labShopId, formData.nablAccreditationNo)}
                    alt="Social Share Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition">
                      <Upload className="w-3.5 h-3.5 text-[#123B6D]" />
                      <span>Upload Custom OG Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleOgImageUpload}
                      />
                    </label>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, ogImageUrl: formData.logoUrl })}
                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-3 py-2 rounded-lg text-xs transition"
                      >
                        Use Uploaded Logo
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, ogImageUrl: generateDefaultOgImage(formData.labName, formData.labShopId, formData.nablAccreditationNo) })}
                      className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-3 py-2 rounded-lg text-xs flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Auto-Generate Branded Card</span>
                    </button>
                  </div>
                  <input
                    type="url"
                    value={formData.ogImageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D] font-mono text-[11px]"
                    placeholder="https://example.com/social-preview.jpg"
                  />
                </div>
              </div>
            </div>

            {/* LIVE OPEN GRAPH INTERACTIVE PREVIEW CARD */}
            <div className="md:col-span-3 p-4.5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl shadow-sm border border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs text-white">Live Open Graph (OG) & Social Card Preview</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    og:type="website"
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const activeOgImage = formData.ogImageUrl || formData.logoUrl || generateDefaultOgImage(formData.labName, formData.labShopId, formData.nablAccreditationNo);
                    const tagSnippet = `<meta property="og:type" content="website" />\n<meta property="og:title" content="${formData.labName}" />\n<meta property="og:description" content="${formData.description || formData.tagline}" />\n<meta property="og:url" content="${formData.websiteUrl || 'https://apexdiagnostics.in'}" />\n<meta property="og:image" content="${activeOgImage}" />`;
                    navigator.clipboard?.writeText(tagSnippet);
                    setCopiedMeta(true);
                    setTimeout(() => setCopiedMeta(false), 2500);
                  }}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition cursor-pointer self-start sm:self-auto"
                >
                  {copiedMeta ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied OG Tags!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Meta Tags</span>
                    </>
                  )}
                </button>
              </div>

              {/* Realistic Social Share Card Representation */}
              <div className="max-w-md mx-auto bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                <div className="w-full h-44 bg-slate-800 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={formData.ogImageUrl || formData.logoUrl || generateDefaultOgImage(formData.labName, formData.labShopId, formData.nablAccreditationNo)}
                    alt="Social Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-white/20">
                    og:image
                  </div>
                </div>
                <div className="p-3.5 space-y-1.5 bg-slate-900 border-t border-slate-800">
                  <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-bold flex items-center gap-1">
                    <span className="truncate">
                      {(formData.websiteUrl || 'https://apexdiagnostics.in').replace(/^https?:\/\//, '')}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">website</span>
                  </div>
                  <div className="text-sm font-bold text-white leading-tight line-clamp-1">
                    {formData.labName || 'Apex Diagnostic & Clinical Pathology Laboratory'}
                  </div>
                  <div className="text-[11px] text-slate-300 leading-normal line-clamp-2">
                    {formData.description || formData.tagline || 'Advanced Pathology, Biochemistry & Diagnostic Testing Centre. 100% NABL Accredited.'}
                  </div>
                </div>
              </div>

              {/* Exact Injected Tags Info */}
              <div className="mt-4 pt-3 border-t border-slate-700/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
                <div>
                  <span className="text-slate-500">og:title → </span>
                  <span className="text-white font-semibold">{formData.labName}</span>
                </div>
                <div>
                  <span className="text-slate-500">og:type → </span>
                  <span className="text-emerald-400 font-semibold">website</span>
                </div>
                <div>
                  <span className="text-slate-500">og:url → </span>
                  <span className="text-cyan-300 truncate inline-block max-w-[220px] align-bottom">
                    {formData.websiteUrl || 'https://apexdiagnostics.in'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">og:image → </span>
                  <span className="text-amber-300">
                    {formData.ogImageUrl ? 'Custom OG Banner' : formData.logoUrl ? 'Tenant Logo' : 'Generated Branded Card'}
                  </span>
                </div>
              </div>
            </div>

            {/* Phone & Helpline */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Helpline Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                placeholder="e.g. 7087033009"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                WhatsApp Dispatch & Booking Number
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                placeholder="e.g. 917087033009"
              />
            </div>

            {/* NABL Accreditation Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                NABL Accreditation Number
              </label>
              <input
                type="text"
                value={formData.nablAccreditationNo}
                onChange={(e) => setFormData({ ...formData, nablAccreditationNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                placeholder="e.g. MC-4821"
              />
            </div>

            {/* ISO Certification */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ISO & Quality Certification
              </label>
              <input
                type="text"
                value={formData.isoCert}
                onChange={(e) => setFormData({ ...formData, isoCert: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                placeholder="e.g. ISO 9001:2015 & ISO 15189 Compliant"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Physical Lab Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                placeholder="e.g. SCF 42-43, Sector 18-C, Central Healthcare Complex, Ludhiana"
              />
            </div>

            {/* Opening Hours & Emergency */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Laboratory Opening Hours
              </label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                placeholder="e.g. Open 7:00 AM – 9:00 PM (All 7 Days)"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Emergency Services Info
              </label>
              <input
                type="text"
                value={formData.emergencyHours}
                onChange={(e) => setFormData({ ...formData, emergencyHours: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                placeholder="e.g. 24x7 Emergency Services at Central Lab"
              />
            </div>

            {/* Hero Promo Banner Text */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Hero Promotional Banner Text
              </label>
              <input
                type="text"
                value={formData.heroPromoText}
                onChange={(e) => setFormData({ ...formData, heroPromoText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                placeholder="e.g. Free Home Sample Collection Across City • Report on WhatsApp in 6 Hours"
              />
            </div>

            {/* Email & GSTIN */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Lab Official Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                placeholder="e.g. care@apexdiagnostics.in"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={formData.gstin || ''}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                placeholder="e.g. 03AABCA1234D1Z8"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Save & Publish to Website</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. WEBSITE ADD / DELETE: CUSTOM BANNERS & NOTICES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800">Website Custom Announcements (Add / Delete)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add urgent notices, seasonal health camp alerts, or special discounts to display at the top of your website.
            </p>
          </div>
          <button
            onClick={() => setShowAddBanner(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Announcement</span>
          </button>
        </div>

        {/* Add Announcement Modal / Form */}
        {showAddBanner && (
          <div className="p-5 bg-amber-50/50 border-b border-amber-200 space-y-3">
            <h4 className="text-xs font-black text-amber-900">Add New Website Top Announcement</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="e.g. 🩸 Free Hemoglobin Checkup Camp this Sunday 9AM - 1PM! Call to register."
                className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={handleAddAnnouncement}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddBanner(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Current Announcements List */}
        <div className="p-5 space-y-3">
          {announcements.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No custom announcements active. Click "Add Announcement" above.
            </div>
          ) : (
            announcements.map((ann, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-semibold text-slate-800">{ann}</span>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(idx)}
                  className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                  title="Delete this announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
