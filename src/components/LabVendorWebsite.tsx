import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageSquare,
  FileText,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Search,
  ArrowRight,
  User,
  Activity,
  Award,
  FlaskConical,
  Heart,
  Droplets,
  AlertCircle,
  HelpCircle,
  Building,
  Smartphone,
  Check,
  X,
  ChevronRight,
  Lock,
  Menu,
  QrCode,
  Copy,
  Globe,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { updateDocumentMetadata, generateDefaultOgImage } from '../utils/seo';
import { Language } from '../types';

interface LabVendorWebsiteProps {
  language?: Language;
  onSelectLanguage?: (lang: Language) => void;
  onOpenReportPortal: (reportId?: string, mobile?: string) => void;
  onOpenLabSoftware: () => void;
  onOpenSoftwareWebsite: () => void;
  onOpenVendorDashboard?: () => void;
  onOpenReceptionDashboard?: () => void;
}

export const LabVendorWebsite: React.FC<LabVendorWebsiteProps> = ({
  language = 'en',
  onSelectLanguage,
  onOpenReportPortal,
  onOpenLabSoftware,
  onOpenSoftwareWebsite,
  onOpenVendorDashboard,
  onOpenReceptionDashboard,
}) => {
  const {
    currentUser,
    vendorLabSettings,
    vendorPackages,
    vendorTests,
    vendorDoctors,
    addHomeCollectionBooking,
    openLoginModal,
  } = useCms();

  const handleOpenManagement = () => {
    if (currentUser && (currentUser.role === 'vendor' || currentUser.role === 'admin')) {
      if (onOpenVendorDashboard) onOpenVendorDashboard();
    } else {
      openLoginModal('vendor');
    }
  };

  const handleOpenReception = () => {
    if (currentUser && (currentUser.role === 'reception' || currentUser.role === 'vendor' || currentUser.role === 'admin')) {
      if (onOpenReceptionDashboard) onOpenReceptionDashboard();
    } else {
      openLoginModal('reception');
    }
  };

  const handleOpenTechnician = () => {
    if (currentUser && (currentUser.role === 'technician' || currentUser.role === 'vendor' || currentUser.role === 'admin')) {
      if (onOpenLabSoftware) onOpenLabSoftware();
    } else {
      openLoginModal('technician');
    }
  };

  const labShopId = vendorLabSettings?.labShopId || 'LSP-7087';
  const labName = vendorLabSettings?.labName || vendorLabSettings?.name || 'Apex Diagnostic & Clinical Pathology Laboratory';
  const labNabl = vendorLabSettings?.nablAccreditationNo || vendorLabSettings?.nablNumber || 'MC-4821';
  const labPhone = vendorLabSettings?.phone || vendorLabSettings?.helplinePhone || '7087033009';
  const labTagline = vendorLabSettings?.tagline || 'Advanced Pathology, Biochemistry & Diagnostic Testing Centre';
  const labHours = vendorLabSettings?.openingHours || 'Open 7:00 AM – 9:00 PM (All 7 Days)';
  const labAddress = vendorLabSettings?.address || 'SCF 42-43, Sector 18-C, Central Healthcare Complex, Ludhiana';
  const labDescription = vendorLabSettings?.description || labTagline || 'Advanced Pathology, Biochemistry & Diagnostic Testing Centre. 100% NABL Accredited.';
  const labWebsiteUrl = vendorLabSettings?.websiteUrl && !vendorLabSettings.websiteUrl.includes('labname.com') ? vendorLabSettings.websiteUrl : (typeof window !== 'undefined' ? window.location.href : '');
  const labLogoUrl = vendorLabSettings?.logoUrl || '';
  const labOgImageUrl = vendorLabSettings?.ogImageUrl || labLogoUrl || generateDefaultOgImage(labName, labShopId, labNabl);

  const cleanPhone = (labPhone || '7087033009').replace(/\D/g, '');
  const stickyWhatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    `Hello ${labName}, I would like to inquire about medical lab tests & home sample collection.`
  )}`;
  const stickyTelUrl = `tel:+91${cleanPhone}`;

  // Dynamic Open Graph, Page Title & Metadata Synchronization for Current Tenant/Shop
  useEffect(() => {
    updateDocumentMetadata({
      title: `${labName} - Diagnostic & Pathology Laboratory`,
      description: labDescription,
      ogImage: labOgImageUrl,
      ogUrl: labWebsiteUrl,
      ogType: 'website',
    });

    return () => {
      // Revert to laboratory metadata on unmount
      updateDocumentMetadata({
        title: `${labName} - Diagnostic & Pathology Laboratory`,
        description: labDescription,
        ogImage: labOgImageUrl,
        ogUrl: typeof window !== 'undefined' ? window.location.origin : '',
        ogType: 'website',
      });
    };
  }, [labName, labShopId, labNabl, labDescription, labWebsiteUrl, labOgImageUrl]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPaymentQrModalOpen, setIsPaymentQrModalOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [selectedQrType, setSelectedQrType] = useState<'counter' | 'home'>('counter');

  // Home collection booking form state
  const [patientName, setPatientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [bookingDate, setBookingDate] = useState('Tomorrow Morning (7:00 AM - 9:00 AM)');
  const [selectedTestOrPackage, setSelectedTestOrPackage] = useState(
    vendorPackages[0] ? `${vendorPackages[0].name} (₹${vendorPackages[0].priceINR})` : 'Full Body Health Checkup (₹999)'
  );

  const categories = [
    'All',
    'Hematology',
    'Biochemistry',
    'Thyroid & Hormones',
    'Diabetes',
    'Vitamins & Minerals',
    'Urine Analysis',
  ];

  const filteredTests = vendorTests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || test.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addHomeCollectionBooking({
      patientName,
      mobile: mobileNumber,
      address,
      timeSlot: bookingDate,
      packageOrTest: selectedTestOrPackage,
    });
    setBookedSuccess(true);
  };

  const handleWhatsAppBooking = (testName: string, price?: number) => {
    const text = encodeURIComponent(
      `Hello Apex Diagnostic Lab, I would like to book "${testName}"${
        price ? ` (₹${price})` : ''
      }. Please confirm home sample collection slot.`
    );
    window.open(`https://wa.me/917087033009?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans selection:bg-[#123B6D]/15 selection:text-[#123B6D]">
      {/* Main Lab Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Lab Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 sm:gap-3 text-left cursor-pointer group min-w-0"
              id="vendor-header-logo-btn"
            >
              {labLogoUrl ? (
                <img
                  src={labLogoUrl}
                  alt={labName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-sm group-hover:scale-105 transition shrink-0"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#123B6D] text-white flex items-center justify-center font-black text-sm sm:text-lg shadow-sm group-hover:scale-105 transition shrink-0">
                  <span className="text-amber-400">{labName.charAt(0) || 'A'}</span>
                  {labName.split(' ')[1]?.charAt(0) || 'L'}
                </div>
              )}
              <div className="flex flex-col justify-center min-w-0">
                <div className="text-xs sm:text-base lg:text-lg font-black tracking-tight text-[#123B6D] leading-tight truncate max-w-[130px] xs:max-w-[170px] sm:max-w-[240px] md:max-w-none">
                  {labName.toUpperCase()}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold tracking-wide flex items-center gap-1 whitespace-nowrap mt-0.5">
                  <span className="hidden sm:inline">Lab Shop ID:</span>
                  <span className="sm:hidden">ID:</span>
                  <span className="font-mono font-bold text-[#123B6D] bg-slate-100 px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
                    {labShopId}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links: (home, health package, test's, pathologists, contact us) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs lg:text-sm font-semibold text-slate-700 whitespace-nowrap">
            {/* 1. Home */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-[#123B6D] transition cursor-pointer text-slate-700 hover:font-bold whitespace-nowrap py-1"
              id="vendor-nav-home"
            >
              Home
            </button>

            {/* 2. Health Package */}
            <a
              href="#packages"
              className="hover:text-[#123B6D] transition text-slate-700 hover:font-bold whitespace-nowrap py-1"
              id="vendor-nav-packages"
            >
              Health Package
            </a>

            {/* 3. Test's */}
            <a
              href="#test-directory"
              className="hover:text-[#123B6D] transition text-slate-700 hover:font-bold whitespace-nowrap py-1"
              id="vendor-nav-tests"
            >
              Test's
            </a>

            {/* 4. Pathologists */}
            <a
              href="#doctors"
              className="hover:text-[#123B6D] transition text-slate-700 hover:font-bold whitespace-nowrap py-1"
              id="vendor-nav-pathologists"
            >
              Pathologists
            </a>

            {/* 5. Contact Us */}
            <a
              href="#contact"
              className="hover:text-[#123B6D] transition text-slate-700 hover:font-bold whitespace-nowrap py-1"
              id="vendor-nav-contact"
            >
              Contact Us
            </a>
          </nav>

          {/* Action Items: (Language + Payment QR + Report + Menu) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Selector (Hidden on mobile view, available inside mobile menu drawer) */}
            <div
              className="hidden md:flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 rounded-lg px-2 sm:px-2.5 py-1.5 sm:py-2 border border-slate-200 text-xs text-slate-700 font-semibold transition cursor-pointer shrink-0"
              title="Change Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#123B6D] shrink-0" />
              <select
                id="vendor-header-language-select"
                aria-label="Select website language"
                value={language}
                onChange={(e) => onSelectLanguage?.(e.target.value as Language)}
                className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer pr-0.5"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
              </select>
            </div>

            {/* Payment QR Button */}
            <button
              onClick={() => setIsPaymentQrModalOpen(true)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/90 font-bold text-xs transition cursor-pointer shadow-2xs shrink-0"
              id="header-payment-qr-btn"
              title="Scan Lab Payment QR Code"
            >
              <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
              <span className="hidden xs:inline">Payment QR</span>
              <span className="xs:hidden">QR</span>
            </button>

            {/* Download Report Button */}
            <button
              onClick={() => onOpenReportPortal()}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-300/90 font-bold text-xs transition cursor-pointer shadow-2xs shrink-0"
              id="header-download-report-btn"
              title="Download or View Patient Lab Report"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F766E] shrink-0" />
              <span className="hidden sm:inline">Download Report</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* Mobile Menu Button (Hamburger) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 lg:hidden transition cursor-pointer shrink-0"
              aria-label="Toggle Navigation Menu"
              id="header-mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1.5 shadow-xl animate-in fade-in duration-200">
            {/* 1. Home */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 font-bold text-[#123B6D] flex items-center justify-between text-sm"
            >
              <span>Home</span>
            </button>

            {/* 2. Health Package */}
            <a
              href="#packages"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold text-sm"
            >
              Health Package
            </a>

            {/* 3. Test's */}
            <a
              href="#test-directory"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold text-sm"
            >
              Test's
            </a>

            {/* 4. Pathologists */}
            <a
              href="#doctors"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold text-sm"
            >
              Pathologists
            </a>

            {/* 5. Contact Us */}
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold text-sm"
            >
              Contact Us
            </a>

            {/* Action Buttons in Drawer */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {/* Payment QR */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsPaymentQrModalOpen(true);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg bg-amber-50 text-amber-900 font-bold border border-amber-200 flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-amber-600" />
                  <span>Lab Payment QR Code</span>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-black">
                  UPI
                </span>
              </button>

              {/* Download your report */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenReportPortal();
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg bg-teal-50 text-[#0F766E] font-bold border border-teal-200 flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0F766E]" />
                  <span>Download your report</span>
                </span>
                <span className="text-[10px] bg-teal-200 text-teal-900 px-2 py-0.5 rounded-full font-black">
                  PDF
                </span>
              </button>

              {/* Language Selector in Mobile Drawer */}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Globe className="w-4 h-4 text-[#123B6D]" />
                  <span>Language / भाषा</span>
                </span>
                <select
                  aria-label="Select mobile website language"
                  value={language}
                  onChange={(e) => onSelectLanguage?.(e.target.value as Language)}
                  className="bg-white text-slate-800 text-xs font-bold rounded px-2 py-1 border border-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="pa">ਪੰਜਾਬੀ</option>
                </select>
              </div>

              {/* Quick Access: 3 Desks */}
              <div className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">
                  Quick Access:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenReception();
                    }}
                    className="bg-[#0F766E] text-white py-2 px-1 rounded-lg text-[11px] font-bold text-center flex flex-col items-center justify-center gap-0.5 shadow-2xs cursor-pointer active:scale-95 transition"
                  >
                    <span className="text-sm">🖥️</span>
                    <span>Reception</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenTechnician();
                    }}
                    className="bg-[#123B6D] text-white py-2 px-1 rounded-lg text-[11px] font-bold text-center flex flex-col items-center justify-center gap-0.5 shadow-2xs cursor-pointer active:scale-95 transition"
                  >
                    <span className="text-sm">🔬</span>
                    <span className="leading-tight">Lab Tech</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenManagement();
                    }}
                    className="bg-amber-400 text-slate-950 py-2 px-1 rounded-lg text-[11px] font-bold text-center flex flex-col items-center justify-center gap-0.5 shadow-2xs cursor-pointer active:scale-95 transition"
                  >
                    <span className="text-sm">⚙️</span>
                    <span className="leading-tight">Management</span>
                  </button>
                </div>
              </div>

              {/* Call Helpline */}
              <a
                href={`tel:${labPhone}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                Call Lab Helpline: +91 {labPhone}
              </a>

              {/* Staff / Lab Login link in Mobile Drawer */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLoginModal();
                }}
                className="w-full py-1.5 text-center text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 pt-1"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Staff & Lab Portal Login</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section (Patient & Customer Focused) */}
      <section id="top" className="bg-gradient-to-b from-[#F8FAFC] via-slate-50 to-white py-10 sm:py-16 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Free Home Sample Collection Across City • Call 7087033009</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] font-extrabold text-[#123B6D] tracking-tight">
                Accurate Blood Tests & Health Checkups from Home
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl">
                NABL accredited diagnostic center with fully automated analyzers, certified gentle phlebotomists, and digital reports delivered straight to your WhatsApp within 6 hours.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedTestOrPackage('Full Body Health Checkup (₹999)');
                    setIsBookingModalOpen(true);
                  }}
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 px-6 py-3.5 rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-slate-950" />
                  <span>Book Free Home Collection</span>
                </button>

                <a
                  href="https://wa.me/917087033009?text=Hello%20Apex%20Diagnostics,%20I%20want%20to%20book%20a%20blood%20test%20from%20home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-3.5 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Book via WhatsApp</span>
                </a>

                <button
                  onClick={() => onOpenReportPortal('RPT-2026-8812', '9876543210')}
                  className="bg-white hover:bg-slate-50 border-2 border-[#123B6D] text-[#123B6D] px-5 py-3.5 rounded-lg text-sm font-bold transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download My Report</span>
                </button>
              </div>

              {/* Trust Strip */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-[#172033]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <span>NABL Accredited</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>Same-Day WhatsApp PDF</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#123B6D] shrink-0" />
                  <span>7 AM – 9 PM Testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span>MD Pathologist Verified</span>
                </div>
              </div>
            </div>

            {/* Right: Quick Home Sample Booking Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-7 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-[#123B6D]">
                      Book Home Sample Collection
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Our certified phlebotomist will arrive with barcoded sterile vacutainers
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    0₹
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        10-Digit Mobile <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Preferred Time
                      </label>
                      <select
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                      >
                        <option>Tomorrow: 6:30 AM - 8:30 AM</option>
                        <option>Tomorrow: 8:30 AM - 10:30 AM</option>
                        <option>Tomorrow: 10:30 AM - 12:30 PM</option>
                        <option>Today: Urgent Collection (within 1 hr)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Select Health Package or Test
                    </label>
                    <select
                      value={selectedTestOrPackage}
                      onChange={(e) => setSelectedTestOrPackage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-semibold text-[#123B6D]"
                    >
                      <option>Full Body Health Checkup (68 Tests) - ₹999</option>
                      <option>Complete Diabetic Care Profile - ₹599</option>
                      <option>Senior Citizen Advanced Health Profile - ₹1,499</option>
                      <option>Thyroid Profile (T3, T4, TSH) - ₹350</option>
                      <option>Complete Blood Count (CBC) - ₹250</option>
                      <option>Lipid Profile (Cholesterol & Triglycerides) - ₹450</option>
                      <option>Liver Function Test (LFT) - ₹500</option>
                      <option>Kidney Function Test (KFT) - ₹500</option>
                      <option>Vitamin D3 + Vitamin B12 - ₹999</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Home Address / Sector / Landmark
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House No, Street, Sector / Area"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#123B6D] hover:bg-[#0e2c52] text-white py-3 rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 mt-2"
                  >
                    <span>Confirm Home Collection Booking</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  <div className="text-[10px] text-center text-[#64748B]">
                    🔒 Zero prepayment required. Pay online via UPI or Cash after sample collection.
                  </div>
                </form>

                {bookedSuccess && (
                  <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-extrabold text-[#172033]">
                      Booking Confirmed!
                    </h4>
                    <p className="text-xs text-[#64748B] mt-1 max-w-xs">
                      Thank you {patientName || 'Sir/Madam'}. Our phlebotomist is scheduled for <strong>{bookingDate}</strong>. Confirmation sent to {mobileNumber || 'your phone'}.
                    </p>
                    <button
                      onClick={() => setBookedSuccess(false)}
                      className="mt-4 bg-[#123B6D] text-white px-4 py-2 rounded-lg text-xs font-bold"
                    >
                      Book Another Test
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5. Dedicated Vendor Portals: 3 Easy Workspaces Showcase */}
      <section id="staff-dashboards" className="py-8 bg-slate-100 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] text-xs font-black uppercase tracking-wider mb-1">
                  <span>✨ 3 Dedicated Workspaces</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#123B6D]">
                  Vendor Operations & Lab Workspaces
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Reception counter entry, lab technician testing workstation, and lab owner management CMS.
                </p>
              </div>

              {/* Quick Access: 3 Desks */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500">Quick Access:</span>
                {/* 1. Reception */}
                <button
                  type="button"
                  id="quick-access-reception"
                  onClick={handleOpenReception}
                  className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  title="Open Reception Desk Dashboard"
                >
                  <span>🖥️ Reception</span>
                </button>

                {/* 2. Lab Technician */}
                <button
                  type="button"
                  id="quick-access-technician"
                  onClick={handleOpenTechnician}
                  className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  title="Open Lab Technician Testing & Report Station"
                >
                  <span>🔬 Lab Technician</span>
                </button>

                {/* 3. Management */}
                <button
                  type="button"
                  id="quick-access-management"
                  onClick={handleOpenManagement}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  title="Open Lab Management & Website CMS"
                >
                  <span>⚙️ Management</span>
                </button>
              </div>
            </div>

            {/* The 3 Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Dashboard 1: Reception Desk Entry */}
              <div className="rounded-2xl border-2 border-teal-200 bg-teal-50/30 p-5 flex flex-col justify-between hover:border-teal-500 transition shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#0F766E] text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      1 • Reception
                    </span>
                    <span className="text-[11px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                      Front Desk Staff
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <span>🖥️ Reception Desk & Billing</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    1-click patient registration, token queue, doctor mapping, concessions, 80mm thermal slip print, and WhatsApp bills.
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span><strong>Fast Registration:</strong> Token, UHID & Barcode</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span><strong>Instant Billing:</strong> Multi-test & UPI QR</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span><strong>Thermal Receipt:</strong> 80mm print & WhatsApp</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span><strong>Queue Stepper:</strong> Waiting ➔ Ready</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-3 border-t border-teal-100">
                  <button
                    onClick={handleOpenReception}
                    className="w-full bg-[#0F766E] hover:bg-[#0d655e] text-white py-2.5 rounded-xl font-black text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Reception Desk</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              </div>

              {/* Dashboard 2: Lab Technician Testing Workstation */}
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 p-5 flex flex-col justify-between hover:border-indigo-500 transition shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#123B6D] text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      2 • Lab Technician
                    </span>
                    <span className="text-[11px] font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      Pathologist & Tech
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <span>🔬 Testing & Report Station</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sample tube barcode scanning, investigation entry, automated abnormal alert verification, and digital signature authorization.
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span><strong>Barcode Specimen:</strong> Scan & tube status</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span><strong>Result Values:</strong> Reference range check</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span><strong>Abnormal Flags:</strong> Clinical alerts</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span><strong>Digital Sign:</strong> NABL report release</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-3 border-t border-indigo-100">
                  <button
                    onClick={handleOpenTechnician}
                    className="w-full bg-[#123B6D] hover:bg-[#0c284b] text-white py-2.5 rounded-xl font-black text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Lab Technician Desk</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              </div>

              {/* Dashboard 3: Website Edit & Lab Management */}
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/30 p-5 flex flex-col justify-between hover:border-amber-500 transition shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      3 • Management
                    </span>
                    <span className="text-[11px] font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                      Lab Owner / Admin
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <span>⚙️ Lab Management & CMS</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Instantly edit all public website content, manage 500+ test catalog pricing, doctor commissions (15%), and diagnostic reports.
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span><strong>Website Editor:</strong> Name, phone & NABL text</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span><strong>500+ Test Catalog:</strong> MRP & selling rates</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span><strong>Health Packages:</strong> Checkup offer builder</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span><strong>Doctor Commissions:</strong> 15% referral tracking</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-3 border-t border-amber-100">
                  <button
                    onClick={handleOpenManagement}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-black text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Management Desk</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Popular Preventive Health Packages */}
      <section id="packages" className="py-16 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#123B6D]/10 text-[#123B6D] text-xs font-bold mb-3">
              <span>Preventive Health Packages</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B6D] tracking-tight">
              Comprehensive Health Checkups with Up to 60% Savings
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              Early diagnosis protects your family. All packages include free home sample pickup, digital NABL reports, and free doctor consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vendorPackages.map((pkg, idx) => (
              <div
                key={pkg.id || idx}
                className="bg-[#F8FAFC] rounded-2xl border border-slate-200 hover:border-[#123B6D]/40 p-6 flex flex-col justify-between transition-all hover:shadow-lg relative group"
              >
                {(pkg.isPopular || idx === 0) && (
                  <div className="absolute -top-3 right-6 bg-[#F59E0B] text-slate-950 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-[#0F766E] uppercase tracking-wider mb-1">
                    {pkg.testsCount} Parameters Covered
                  </div>
                  <h3 className="text-lg font-extrabold text-[#123B6D]">{pkg.name}</h3>
                  <p className="text-xs text-[#64748B] mt-1.5 mb-4 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-slate-200">
                    <span className="text-3xl font-black text-[#123B6D]">₹{pkg.priceINR}</span>
                    <span className="text-sm text-slate-400 line-through">₹{pkg.mrpINR}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Save {Math.round(((pkg.mrpINR - pkg.priceINR) / pkg.mrpINR) * 100)}%
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="text-xs font-bold text-slate-800">Included In This Package:</div>
                    {pkg.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedTestOrPackage(`${pkg.name} (₹${pkg.priceINR})`);
                      setIsBookingModalOpen(true);
                    }}
                    className="w-full bg-[#123B6D] hover:bg-[#0e2c52] text-white py-2.5 rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Book Package Now</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  <button
                    onClick={() => handleWhatsAppBooking(pkg.name, pkg.priceINR)}
                    className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075e54] border border-[#25D366]/30 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Book on WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 500+ Diagnostic Tests Directory with Price List */}
      <section id="test-directory" className="py-16 bg-[#F8FAFC] border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/10 text-[#0F766E] text-xs font-bold mb-2">
                <span>500+ Pathology Tests</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B6D] tracking-tight">
                Search Blood Tests & View Exact Prices
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                Transparent Indian diagnostic rates with fast turnaround times and NABL certification.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search test (e.g. CBC, HbA1c, Thyroid)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none bg-white shadow-xs"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-[#123B6D] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.slice(0, 12).map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {test.category}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{test.code}</span>
                  </div>

                  <h4 className="text-sm font-bold text-[#123B6D]">{test.name}</h4>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <div>
                      <span className="block text-[10px] text-slate-400">Specimen</span>
                      <span className="font-medium text-slate-700">{test.sampleType}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Report In</span>
                      <span className="font-medium text-slate-700">{test.turnaroundTime}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Test Fee</span>
                    <span className="text-base font-extrabold text-[#123B6D]">₹{test.priceINR}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleWhatsAppBooking(test.name, test.priceINR)}
                      className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075e54] border border-[#25D366]/30 transition"
                      title="Book via WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTestOrPackage(`${test.name} (₹${test.priceINR})`);
                        setIsBookingModalOpen(true);
                      }}
                      className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                    >
                      Book Test
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://wa.me/917087033009?text=Hello%20Apex%20Diagnostics,%20I%20want%20to%20inquire%20about%20a%20specific%20blood%20test"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#123B6D] hover:underline"
            >
              <span>Can't find a test? Ask us directly on WhatsApp (+91 7087033009)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Our Laboratory (Vendor Quality Standard) */}
      <section id="about" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
                <span>Accreditation & Quality Assured</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B6D] tracking-tight leading-tight">
                Standard of Care Pathology with 100% NABL Quality Verification
              </h2>

              <p className="text-sm text-[#64748B] leading-relaxed">
                At Apex Diagnostics, we leave zero room for error. Every sample is collected in vacuum-sealed sterile vacutainers with unique barcoded labels, analyzed on fully automated 5-part Sysmex & Roche immunoassay analyzers, and verified by our senior MD Pathologist.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-bold text-xs text-[#123B6D]">NABL Accredited Facility</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Strict adherence to ISO 15189 standards and regular EQAS quality blind testing.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-bold text-xs text-[#123B6D]">Cold-Chain Sample Transport</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Insulated boxes with gel ice packs maintaining 2°C–8°C temperature integrity.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-bold text-xs text-[#123B6D]">Barcoded Vacutainers</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Zero sample mix-up risk. Patient UHID tagged right at the collection chair.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-bold text-xs text-[#123B6D]">Instant WhatsApp Delivery</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Verified PDF reports dispatched directly to patient phone with QR authentication.
                  </p>
                </div>
              </div>
            </div>

            {/* Quality Certifications & Stats */}
            <div className="bg-[#123B6D] text-white rounded-2xl p-8 sm:p-10 space-y-8 shadow-xl">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                  Diagnostic Excellence
                </span>
                <h3 className="text-2xl font-bold mt-1">Over 2,50,000+ Tests Conducted</h3>
                <p className="text-xs text-slate-300 mt-2">
                  Serving hospitals, clinics, referring physicians, and families with dependable laboratory results since 2012.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                <div>
                  <div className="text-3xl font-black text-white">500+</div>
                  <div className="text-xs text-slate-300 mt-1">Pathology & Immunoassay Tests</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-amber-400">99.8%</div>
                  <div className="text-xs text-slate-300 mt-1">On-Time Report Turnaround</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-400">100%</div>
                  <div className="text-xs text-slate-300 mt-1">NABL Certified Equipment</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white">6 hrs</div>
                  <div className="text-xs text-slate-300 mt-1">Average WhatsApp Report Delivery</div>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-xl flex items-center justify-between text-xs">
                <span>Need B2B / Doctor Referral Tie-Up?</span>
                <a
                  href="https://wa.me/917087033009?text=Hello%20Apex%20Diagnostics,%20I%20am%20a%20doctor/clinic%20interested%20in%20B2B%20diagnostic%20tie-up"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-amber-300 hover:underline"
                >
                  Partner With Us →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Qualified Medical & Pathologist Panel */}
      <section id="doctors" className="py-16 bg-[#F8FAFC] border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B6D] tracking-tight">
              Led by Experienced MD Pathologists
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2">
              Every report is reviewed, validated, and signed by our senior clinical experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vendorDoctors.map((doc, idx) => (
              <div key={doc.id || idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs text-center">
                <div className="w-16 h-16 rounded-full bg-[#123B6D]/10 text-[#123B6D] mx-auto flex items-center justify-center font-bold text-xl mb-4">
                  {doc.avatarEmoji || '👨‍⚕️'}
                </div>
                <h3 className="font-bold text-base text-[#123B6D]">{doc.name}</h3>
                <div className="text-xs text-[#0F766E] font-semibold">{doc.qualification || doc.degrees || 'Consultant Pathologist'}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{doc.experience} • {doc.specialization}</div>
                <p className="text-xs text-[#64748B] mt-3">
                  {doc.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal & Software Interlink Banner */}
      <section id="download-report" className="py-12 bg-slate-900 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3">
                <span>Are You A Patient Waiting For Report?</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Download Your Diagnostic Report Online</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                No passwords or account required. Simply enter your registered mobile number or report ID to view and download digitally verified NABL report.
              </p>
              <button
                onClick={() => onOpenReportPortal('RPT-2026-8812', '9876543210')}
                className="mt-4 bg-[#0F766E] hover:bg-[#0c615a] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Go to Patient Report Portal</span>
              </button>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3">
                <span>For Lab Staff & Pathologists</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Laboratory Operating Workstation</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                Access patient registration desk, barcode generation, analyzer results entry, pathologist sign-off, and offline queue sync.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  onClick={onOpenLabSoftware}
                  className="bg-[#123B6D] hover:bg-[#0e2c52] text-white border border-white/20 px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2"
                >
                  <Building className="w-4 h-4 text-amber-400" />
                  <span>Open Lab Software Workstation</span>
                </button>
                <button
                  onClick={onOpenSoftwareWebsite}
                  className="text-xs text-slate-300 hover:text-white underline"
                >
                  Software SaaS Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer id="contact" className="bg-white border-t border-slate-200 py-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-xs text-slate-600">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                {labLogoUrl ? (
                  <img
                    src={labLogoUrl}
                    alt={labName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#123B6D] text-white flex items-center justify-center font-black text-xs shrink-0">
                    <span className="text-amber-400">{labName.charAt(0) || 'A'}</span>
                    {labName.split(' ')[1]?.charAt(0) || 'L'}
                  </div>
                )}
                <div>
                  <span className="font-extrabold text-[#123B6D] text-sm block leading-tight">{labName}</span>
                  <span className="font-mono text-[10px] text-slate-500 font-bold">ID: {labShopId}</span>
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed">
                {labDescription}
              </p>
              {labWebsiteUrl && (
                <div className="mt-2 text-[11px] truncate">
                  <a href={labWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-[#123B6D] font-mono hover:underline">
                    {labWebsiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="mt-3 text-slate-700 font-semibold">
                WhatsApp: +91 {labPhone}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#123B6D] mb-3 uppercase tracking-wider text-[11px]">
                Popular Blood Tests
              </h4>
              <ul className="space-y-2">
                <li>Complete Blood Count (CBC)</li>
                <li>HbA1c & Fasting Blood Sugar</li>
                <li>Thyroid Profile (T3, T4, TSH)</li>
                <li>Lipid Profile (Cholesterol)</li>
                <li>Liver & Kidney Profiles</li>
                <li>Vitamin D3 & Vitamin B12</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#123B6D] mb-3 uppercase tracking-wider text-[11px]">
                Health Packages
              </h4>
              <ul className="space-y-2">
                <li>Full Body Health Checkup (68 Tests)</li>
                <li>Comprehensive Diabetic Care</li>
                <li>Senior Citizen Advanced Profile</li>
                <li>Women Wellness Profile</li>
                <li>Pre-Operative Profile</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#123B6D] mb-3 uppercase tracking-wider text-[11px]">
                Quick Access & Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={handleOpenReception}
                    className="hover:text-[#123B6D] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🖥️ Reception Counter</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleOpenTechnician}
                    className="hover:text-[#123B6D] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🔬 Lab Technician Station</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleOpenManagement}
                    className="hover:text-[#123B6D] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>⚙️ Management CMS</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenReportPortal()} className="hover:text-[#123B6D] text-teal-700 font-semibold cursor-pointer">
                    Download Patient Report (PDF)
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span>© {new Date().getFullYear()} {labName}. All Rights Reserved.</span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span>
                Software by{' '}
                <a
                  href="https://labname.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#123B6D] hover:underline font-black"
                >
                  labname.com
                </a>
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-slate-500">Customer Care:</span>
              <a
                href="tel:7087033009"
                className="text-[#123B6D] hover:underline font-black inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-md transition border border-slate-200"
              >
                <Phone className="w-3.5 h-3.5 text-[#123B6D]" />
                <span>7087033009</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Payment QR Modal */}
      {isPaymentQrModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 relative shadow-2xl border border-slate-100 flex flex-col items-center text-center">
            <button
              onClick={() => setIsPaymentQrModalOpen(false)}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close Payment QR Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-600">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-black text-[#123B6D] leading-tight">
                  {labName}
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Official UPI Payment QR
                </p>
              </div>
            </div>

            {/* If 2 QRs are configured, show toggle tabs */}
            {(vendorLabSettings?.upiId2 || vendorLabSettings?.qrCode2Url) && (
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl w-full my-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedQrType('counter')}
                  className={`py-1.5 px-2 rounded-lg transition text-[11px] ${
                    selectedQrType === 'counter'
                      ? 'bg-white text-[#123B6D] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {vendorLabSettings?.qrCode1Label || 'Counter Billing'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQrType('home')}
                  className={`py-1.5 px-2 rounded-lg transition text-[11px] ${
                    selectedQrType === 'home'
                      ? 'bg-white text-[#123B6D] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {vendorLabSettings?.qrCode2Label || 'Home Collection'}
                </button>
              </div>
            )}

            {/* QR Code Container */}
            <div className="mt-3 p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 w-full flex flex-col items-center">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                <img
                  src={
                    (selectedQrType === 'counter'
                      ? vendorLabSettings?.qrCode1Url
                      : vendorLabSettings?.qrCode2Url) ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
                      `upi://pay?pa=${
                        (selectedQrType === 'counter'
                          ? vendorLabSettings?.upiId1
                          : vendorLabSettings?.upiId2) ||
                        vendorLabSettings?.upiId1 ||
                        'apexlab@icici'
                      }&pn=${encodeURIComponent(
                        vendorLabSettings?.merchantName || labName
                      )}&cu=INR`
                    )}`
                  }
                  alt="UPI Payment QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                />
              </div>

              {/* Merchant and UPI ID Details */}
              <div className="mt-3 text-center w-full">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {vendorLabSettings?.merchantName || labName}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Shop ID: <span className="font-mono font-bold text-[#123B6D]">{labShopId}</span>
                </div>

                {/* 1-Click Copy UPI Bar */}
                <div className="mt-2 flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-full">
                  <div className="truncate font-mono font-bold text-slate-700 text-[11px]">
                    {(selectedQrType === 'counter'
                      ? vendorLabSettings?.upiId1
                      : vendorLabSettings?.upiId2) ||
                      vendorLabSettings?.upiId1 ||
                      'apexlab@icici'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const upi =
                        (selectedQrType === 'counter'
                          ? vendorLabSettings?.upiId1
                          : vendorLabSettings?.upiId2) ||
                        vendorLabSettings?.upiId1 ||
                        'apexlab@icici';
                      navigator.clipboard?.writeText(upi);
                      setCopiedUpi(true);
                      setTimeout(() => setCopiedUpi(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 transition shrink-0 cursor-pointer"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy UPI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Supported UPI Apps Strip */}
            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-semibold">
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">GPay</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">PhonePe</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">Paytm</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">BHIM</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">Any UPI</span>
            </div>

            <p className="text-[10px] text-slate-400 mt-2">
              Scan with any UPI application for instant blood test payment & receipt confirmation.
            </p>

            <button
              type="button"
              onClick={() => setIsPaymentQrModalOpen(false)}
              className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-[#123B6D] mb-1">
              Book Home Sample Collection
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Booking for: <strong className="text-slate-800">{selectedTestOrPackage}</strong>
            </p>

            <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Verma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">10-Digit Mobile Number</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Home Address</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Flat No, Street, Sector / Colony"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Preferred Slot</label>
                <select
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                >
                  <option>Tomorrow Morning: 6:30 AM – 8:30 AM (Fasting Preferred)</option>
                  <option>Tomorrow: 8:30 AM – 10:30 AM</option>
                  <option>Tomorrow: 10:30 AM – 12:30 PM</option>
                  <option>Today: Urgent Sample Collection</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#123B6D] hover:bg-[#0e2c52] text-white py-2.5 rounded-lg text-xs font-bold transition shadow-xs"
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleWhatsAppBooking(selectedTestOrPackage);
                    setIsBookingModalOpen(false);
                  }}
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Side Sticky Floating Action Buttons: WhatsApp & Call */}
      <aside
        aria-label="Quick contact buttons"
        className="fixed right-3.5 sm:right-6 bottom-5 sm:bottom-6 z-40 flex flex-col items-end gap-2.5 pointer-events-auto"
      >
        {/* WhatsApp Sticky Button */}
        <a
          href={stickyWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="vendor-sticky-whatsapp-btn"
          aria-label="Chat on WhatsApp"
          title={`Chat with ${labName} on WhatsApp (+91 ${cleanPhone})`}
          className="group flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-lg shadow-emerald-950/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 border border-white/30 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
            </span>
          </div>
          <span className="font-bold text-xs tracking-wide whitespace-nowrap">
            WhatsApp
          </span>
        </a>

        {/* Call Helpline Sticky Button */}
        <a
          href={stickyTelUrl}
          id="vendor-sticky-call-btn"
          aria-label={`Call Lab Helpline +91 ${cleanPhone}`}
          title={`Call ${labName}: +91 ${cleanPhone}`}
          className="group flex items-center gap-2 bg-[#123B6D] hover:bg-[#0c284b] active:scale-95 text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-lg shadow-[#123B6D]/30 hover:shadow-xl hover:shadow-[#123B6D]/40 transition-all duration-300 border border-white/25 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
          </div>
          <span className="font-bold text-xs tracking-wide whitespace-nowrap">
            Call Lab
          </span>
        </a>
      </aside>
    </div>
  );
};
