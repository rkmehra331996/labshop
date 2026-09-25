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
  Smartphone,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  QrCode,
  Copy,
  Globe,
  Mail,
  Send,
  Share2,
  Navigation,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ExternalLink,
  Lock,
  KeyRound,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { updateDocumentMetadata, generateDefaultOgImage } from '../utils/seo';
import { Language } from '../types';
import { OnlineTestBookingModal } from './vendor/OnlineTestBookingModal';
import { HeroBookingForm } from './vendor/HeroBookingForm';
import { LabWelcomeFirstScreen } from './vendor/LabWelcomeFirstScreen';
import { getTenantWebsiteUrl, getTenantSubdomain, getTenantBrowserUrl, SUPER_ADMIN_DOMAIN } from '../constants/domains';
import { isTenantMatch } from '../utils/tenantSecurity';

interface LabVendorWebsiteProps {
  language?: Language;
  onSelectLanguage?: (lang: Language) => void;
  onOpenReportPortal: (reportId?: string, mobile?: string, labId?: string) => void;
  onOpenLabSoftware: () => void;
  onOpenSoftwareWebsite: () => void;
  onOpenVendorDashboard?: () => void;
  onOpenReceptionDashboard?: () => void;
  onOpenAdminDashboard?: () => void;
}

export const LabVendorWebsite: React.FC<LabVendorWebsiteProps> = ({
  language = 'en',
  onSelectLanguage,
  onOpenReportPortal,
  onOpenLabSoftware,
  onOpenSoftwareWebsite,
  onOpenVendorDashboard,
  onOpenReceptionDashboard,
  onOpenAdminDashboard,
}) => {
  const {
    currentUser,
    vendorLabSettings,
    vendorPackages,
    vendorTests,
    vendorDoctors,
    addHomeCollectionBooking,
    openLoginModal,
    vendorLabsList,
    selectedVendorLabId,
    setVendorStatus,
    allReports,
  } = useCms();

  const [inlineReportSearch, setInlineReportSearch] = useState('');

  const currentLabItem = React.useMemo(() => {
    return (
      vendorLabsList.find((l) => l.id === (vendorLabSettings?.labId || selectedVendorLabId)) ||
      vendorLabsList.find(
        (l) => l.name?.toLowerCase() === (vendorLabSettings?.labName || vendorLabSettings?.name)?.toLowerCase()
      ) ||
      vendorLabsList[0] ||
      null
    );
  }, [vendorLabsList, vendorLabSettings, selectedVendorLabId]);

  const currentVendorReport = React.useMemo(() => {
    const tid = currentLabItem?.id || selectedVendorLabId;
    return (allReports || []).find((r) => isTenantMatch(r, tid));
  }, [allReports, currentLabItem?.id, selectedVendorLabId]);

  const handleCheckReport = (reportId?: string, mobile?: string) => {
    const rId = reportId || '';
    const mob = mobile || '';
    onOpenReportPortal(rId, mob, currentLabItem?.id || selectedVendorLabId);
  };

  const dedicatedDomain = currentLabItem?.domainPreview || `${currentLabItem?.id || 'apexdiagnostics'}.${SUPER_ADMIN_DOMAIN}`;
  const canonicalUrl = getTenantWebsiteUrl(dedicatedDomain);

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
  const labWhatsapp = vendorLabSettings?.whatsapp || labPhone || '7087033009';
  const labEmail = vendorLabSettings?.email || 'care@apexdiagnostics.in';
  const labTagline = vendorLabSettings?.tagline || 'Advanced Pathology, Biochemistry & Diagnostic Testing Centre';
  const labHours = vendorLabSettings?.openingHours || 'Open 7:00 AM – 9:00 PM (All 7 Days)';
  const labEmergency = vendorLabSettings?.emergencyHours || '24x7 Emergency Services at Central Lab';
  const labAddress = vendorLabSettings?.address || 'SCF 42-43, Sector 18-C, Central Healthcare Complex, Ludhiana';
  const labDescription = vendorLabSettings?.description || labTagline || 'Advanced Pathology, Biochemistry & Diagnostic Testing Centre. 100% NABL Accredited.';
  const labWebsiteUrl = vendorLabSettings?.websiteUrl && !vendorLabSettings.websiteUrl.includes('labname.com') ? vendorLabSettings.websiteUrl : canonicalUrl;
  const labLogoUrl = vendorLabSettings?.logoUrl || '';
  const labOgImageUrl = vendorLabSettings?.ogImageUrl || labLogoUrl || generateDefaultOgImage(labName, labShopId, labNabl);

  const cleanPhone = (labPhone || '7087033009').replace(/\D/g, '');
  const cleanWhatsapp = (labWhatsapp || '7087033009').replace(/\D/g, '');
  const stickyWhatsappUrl = `https://wa.me/91${cleanWhatsapp}?text=${encodeURIComponent(
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

  // First Screen (Welcome Gateway) vs Full Website Exploration State
  const [hasEnteredWebsite, setHasEnteredWebsite] = useState(false);

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

  // Contact Us Inquiry Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Test Inquiry & Pricing');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactRefId, setContactRefId] = useState('');
  const [contactError, setContactError] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');

    if (!contactName.trim()) {
      setContactError('Please enter your full name.');
      return;
    }

    const cleanNum = contactPhone.replace(/\D/g, '');
    if (cleanNum.length < 10) {
      setContactError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setContactSubmitting(true);
    setTimeout(() => {
      const generatedRef = `INQ-${Math.floor(100000 + Math.random() * 900000)}`;
      setContactRefId(generatedRef);
      setContactSubmitting(false);
      setContactSubmitted(true);
    }, 500);
  };

  const handleCopyText = (text: string, type: 'phone' | 'email') => {
    try {
      navigator.clipboard.writeText(text);
      if (type === 'phone') {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      } else {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
    } catch {}
  };

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

  // Check if website is in Draft mode (Not Approved/Published by Admin)
  // When a website is created, it starts in Draft mode; until Super Admin publishes it, visit/preview is locked.
  const isDraftOrPending = currentLabItem ? currentLabItem.status !== 'Active' || !currentLabItem.isWebsiteApproved : false;

  if (isDraftOrPending) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
              HQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">{currentLabItem?.name || labName}</span>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Draft Mode (Pending Approval)</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser?.role === 'admin' ? (
              <button
                type="button"
                onClick={onOpenAdminDashboard}
                className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>← Super Admin Dashboard</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenSoftwareWebsite}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>🏠 Main Portal</span>
              </button>
            )}
          </div>
        </header>

        {/* Central Draft Lock Box - Light Theme Only */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-lg w-full bg-white border border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Lock Icon */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-18 h-18 rounded-3xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-amber-600 shadow-inner">
                <Lock className="w-9 h-9" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-sm">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Titles & Message in English Only */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                <span>⚠️ Website In Draft Mode • Pending Admin Approval</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Website In Draft Mode
              </h1>
              <p className="text-sm font-semibold text-amber-800">
                This website will not be live or accessible for visit until the Admin publishes it.
              </p>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed pt-1">
                This laboratory website was created and is currently in <strong>Draft Status</strong>. Public visit, patient bookings, and diagnostic catalog are locked until Super Admin reviews and approves it.
              </p>
            </div>

            {/* Contact Support Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="font-extrabold text-amber-950 flex items-center justify-center gap-1.5 text-sm">
                <Phone className="w-4 h-4 text-amber-700" />
                <span>Contact with 7087033009</span>
              </div>
              <p className="text-[11px] text-slate-600">
                For approval, verification, or administrative queries, contact central support:
              </p>
              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                <a
                  href="tel:+917087033009"
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Call: 7087033009</span>
                </a>
                <a
                  href="https://wa.me/917087033009?text=Hello%20Admin,%20I%20need%20approval%20and%20activation%20for%20my%20laboratory%20website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                  <span>WhatsApp: 7087033009</span>
                </a>
              </div>
            </div>

            {/* Lab Info Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Laboratory:</span>
                <span className="font-bold text-slate-900 text-right">{currentLabItem?.name || labName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Owner / City:</span>
                <span className="font-medium text-slate-700">{currentLabItem?.ownerName || 'Lab Owner'} • {currentLabItem?.city || 'India'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  Draft (Pending Approval)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              {currentUser?.role === 'admin' ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentLabItem) {
                        setVendorStatus(currentLabItem.id, 'Active');
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Approve & Publish Live Now</span>
                  </button>
                  <p className="text-[11px] text-slate-500">
                    Clicking "Approve" will make this website instantly live and move the laboratory to "Our Clients".
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={onOpenSoftwareWebsite}
                    className="w-full bg-[#123B6D] hover:bg-[#0e2c52] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
                  >
                    Return to Main Portal
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 1. ISOLATED FIRST SCREEN GATEWAY (Pure Welcome Screen - No Scrolling into Website)
  // Shown exclusively until user clicks "Visit Website", "Book Test", or "Check Report"
  if (!hasEnteredWebsite) {
    return (
      <div className="relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 font-sans">
        <LabWelcomeFirstScreen
          labName={labName}
          labShopId={labShopId}
          labLogoUrl={labLogoUrl}
          labNabl={labNabl}
          labAddress={labAddress}
          labPhone={labPhone}
          backgroundImageUrl={vendorLabSettings?.heroBackgroundImageUrl}
          onVisitWebsite={() => {
            setHasEnteredWebsite(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBookTest={() => {
            setHasEnteredWebsite(true);
            setSelectedTestOrPackage(
              vendorPackages[0] ? `${vendorPackages[0].name} (₹${vendorPackages[0].priceINR})` : 'Full Body Health Checkup (₹999)'
            );
            setIsBookingModalOpen(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onCheckReport={() => {
            handleCheckReport();
          }}
          onStaffLogin={() => openLoginModal('vendor')}
          onOpenSoftwareWebsite={onOpenSoftwareWebsite}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans selection:bg-[#123B6D]/15 selection:text-[#123B6D]">
      {/* Super Admin Website Live Control & Status Banner */}
      {currentUser?.role === 'admin' && (
        <div className="bg-slate-950 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shadow-md sticky top-0 z-50">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
              Super Admin Mode
            </span>
            <span className="text-slate-300">
              Previewing Lab Website: <strong className="text-white">{labName}</strong>
            </span>
            {currentLabItem?.status === 'Draft' ? (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Status: DRAFT (Pending Approval)</span>
              </span>
            ) : (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Status: LIVE (Approved & Active)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {currentLabItem && (currentLabItem.status !== 'Active' || !currentLabItem.isWebsiteApproved) && (
              <button
                type="button"
                onClick={() => {
                  setVendorStatus(currentLabItem.id, 'Active');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Website (Make Live)</span>
              </button>
            )}

            {currentLabItem && currentLabItem.status !== 'Draft' && (
              <button
                type="button"
                onClick={() => {
                  setVendorStatus(currentLabItem.id, 'Draft');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Move to Draft</span>
              </button>
            )}

            {onOpenAdminDashboard && (
              <button
                type="button"
                onClick={onOpenAdminDashboard}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer border border-slate-700"
              >
                <span>← Back to Super Admin Dashboard</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSoftwareWebsite}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-xs"
              title="Go to IndianLalaji.com Home Portal"
            >
              <span>🏠 Main Portal Home</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Lab Header */}
      <header id="main-website-header" className="sticky top-0 bg-white border-b border-slate-200 z-40 shadow-xs">
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
            {/* 1. Simple Home (Vendor Website) */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-[#123B6D] transition cursor-pointer text-[#123B6D] font-bold whitespace-nowrap py-1"
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

          {/* Action Items: (Mobile: Check Report + Book Test + Menu | Desktop: Language + QR + Report + Book + Login) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop Language Selector */}
            <div
              className="hidden xl:flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 rounded-lg px-2 sm:px-2.5 py-1.5 sm:py-2 border border-slate-200 text-xs text-slate-700 font-semibold transition cursor-pointer shrink-0"
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

            {/* Desktop Payment QR Button */}
            <button
              onClick={() => setIsPaymentQrModalOpen(true)}
              className="hidden lg:inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/90 font-bold text-xs transition cursor-pointer shadow-2xs shrink-0"
              id="header-payment-qr-btn"
              title="Scan Lab Payment QR Code"
            >
              <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
              <span>Payment QR</span>
            </button>

            {/* Check Report Button (Mobile: logo + check report + book test + menu icon) */}
            <button
              onClick={() => handleCheckReport()}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-300/90 font-bold text-xs transition cursor-pointer shadow-2xs shrink-0 active:scale-95"
              id="header-download-report-btn"
              title={`Check or Download Patient Lab Report for ${labName}`}
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F766E] shrink-0" />
              <span className="text-[11px] sm:text-xs">Check Report</span>
            </button>

            {/* Book Test Button (Mobile: logo + check report + book test + menu icon) */}
            <button
              onClick={() => {
                setSelectedTestOrPackage(
                  vendorPackages[0] ? `${vendorPackages[0].name} (₹${vendorPackages[0].priceINR})` : 'Full Body Health Checkup (₹999)'
                );
                setIsBookingModalOpen(true);
              }}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-2xs shrink-0 active:scale-95"
              id="header-book-test-btn"
              title="Book Lab Test or Health Package"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0" />
              <span className="text-[11px] sm:text-xs">Book Test</span>
            </button>

            {/* Desktop Lab Staff / Admin Login Button */}
            <button
              onClick={() => openLoginModal('vendor')}
              className="hidden lg:inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#123B6D] hover:bg-[#0e2c52] text-white font-bold text-xs transition cursor-pointer shadow-2xs shrink-0 active:scale-98"
              id="header-lab-login-btn"
              title="Lab Admin, Receptionist & Technician Login"
            >
              <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
              <span>Login</span>
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
            {/* 1. Simple Home (Vendor Website) */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full text-left py-2 px-3 rounded-lg bg-blue-50/70 font-bold text-[#123B6D] flex items-center justify-between text-sm"
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
                  handleCheckReport();
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

              {/* Lab Staff & Admin Login */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLoginModal('vendor');
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg bg-[#123B6D] text-white font-bold flex items-center justify-between text-sm shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-300" />
                  <span>Lab Staff & Admin Login</span>
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">
                  Portal
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

              {/* Call Helpline */}
              <a
                href={`tel:${labPhone}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                Call Lab Helpline: +91 {labPhone}
              </a>
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
                  onClick={() => handleCheckReport()}
                  className="bg-white hover:bg-slate-50 border-2 border-[#123B6D] text-[#123B6D] px-5 py-3.5 rounded-lg text-sm font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  title={`Check & Download Verified Patient Report for ${labName}`}
                >
                  <FileText className="w-4 h-4 text-[#123B6D]" />
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

            {/* Right: Lab Test Booking / Sample Collection Form */}
            <div className="lg:col-span-5">
              <HeroBookingForm onOpenReportPortal={() => handleCheckReport()} />
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

      {/* 8. Dedicated Contact Us & Lab Location Section */}
      <section id="contact" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#123B6D] text-xs font-bold mb-3 border border-blue-200">
              <Phone className="w-3.5 h-3.5 text-[#123B6D]" />
              <span>Direct Laboratory Support & Location</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B6D] tracking-tight">
              Contact Us & Visit Our Diagnostic Lab
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
              Have questions about blood test preparations, fasting guidelines, package prices, or home sample collection? 
              Reach out to our clinical staff via phone, WhatsApp, email, or visit our central lab counter.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Direct Channels & Social Media Links (7 Cols on lg) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 4 Core Channel Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Phone Helpline */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold mb-3.5">
                      <Phone className="w-5 h-5 text-amber-700" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Lab Phone Helpline</span>
                    <a
                      href={`tel:+91${cleanPhone}`}
                      className="text-base font-extrabold text-[#123B6D] hover:underline block mt-1 tracking-tight"
                    >
                      +91 {labPhone}
                    </a>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {labHours}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      <span>⚡ {labEmergency}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <a
                      href={`tel:+91${cleanPhone}`}
                      className="flex-1 bg-[#123B6D] hover:bg-[#0e2f57] text-white py-2 px-3 rounded-lg text-xs font-bold transition text-center flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyText(`+91 ${labPhone}`, 'phone')}
                      title="Copy phone number"
                      className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition cursor-pointer shrink-0"
                    >
                      {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. WhatsApp Support */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold mb-3.5">
                      <MessageSquare className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Desk</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Instant Reply
                      </span>
                    </div>
                    <a
                      href={stickyWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-extrabold text-emerald-700 hover:underline block mt-1 tracking-tight"
                    >
                      +91 {cleanWhatsapp}
                    </a>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Instant WhatsApp test booking, price inquiries & digital PDF report download support.
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                      <span>💬 Direct Chat Available</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <a
                      href={stickyWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2 px-3 rounded-lg text-xs font-bold transition text-center flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* 3. Address & Location */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#123B6D] flex items-center justify-center font-bold mb-3.5">
                      <MapPin className="w-5 h-5 text-[#123B6D]" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Laboratory Address</span>
                    <p className="text-xs font-bold text-slate-800 mt-1 leading-relaxed">
                      {labAddress}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Accreditation: <span className="font-semibold text-slate-700">NABL {labNabl}</span>
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${labName} ${labAddress}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 px-3 rounded-lg text-xs font-bold transition text-center flex items-center justify-center gap-1.5 border border-slate-200"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#123B6D]" />
                      <span>Google Maps Directions</span>
                    </a>
                  </div>
                </div>

                {/* 4. Official Email Support */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold mb-3.5">
                      <Mail className="w-5 h-5 text-indigo-700" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Official Email</span>
                    <a
                      href={`mailto:${labEmail}`}
                      className="text-xs font-extrabold text-[#123B6D] hover:underline block mt-1 break-all"
                    >
                      {labEmail}
                    </a>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      For corporate health checkups, doctor tie-ups, B2B samples & general medical feedback.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <a
                      href={`mailto:${labEmail}`}
                      className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 py-2 px-3 rounded-lg text-xs font-bold transition text-center flex items-center justify-center gap-1.5 border border-indigo-200"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Email</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyText(labEmail, 'email')}
                      title="Copy email"
                      className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition cursor-pointer shrink-0"
                    >
                      {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Media Links Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#123B6D] flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-[#123B6D]" />
                      <span>Connect With Our Laboratory on Social Media</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Follow for seasonal health alerts, preventive wellness camps & special blood test packages.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Official Handles
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {/* WhatsApp */}
                  <a
                    href={stickyWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition text-center group cursor-pointer"
                    title={`Chat on WhatsApp: +91 ${cleanWhatsapp}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold">WhatsApp</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition text-center group cursor-pointer"
                    title="Follow on Facebook"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <Facebook className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold">Facebook</span>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition text-center group cursor-pointer"
                    title="Follow on Instagram"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold">Instagram</span>
                  </a>

                  {/* Twitter / X */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 transition text-center group cursor-pointer"
                    title="Follow on X (Twitter)"
                  >
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <Twitter className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold">Twitter / X</span>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 transition text-center group cursor-pointer"
                    title="Watch on YouTube"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <Youtube className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold">YouTube</span>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 transition text-center group cursor-pointer"
                    title="Connect on LinkedIn"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold">LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Basic Contact & Inquiry Form (5 Cols on lg) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <span>Direct Desk Assistance</span>
                  </div>
                  <h3 className="font-extrabold text-xl text-[#123B6D] tracking-tight">
                    Send Us an Inquiry
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Leave your details and message. Our phlebotomy coordinator will respond within 15–30 minutes.
                  </p>
                </div>

                {contactSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-emerald-950">Inquiry Submitted Successfully!</h4>
                      <p className="text-xs text-emerald-800 mt-1">
                        Thank you, <span className="font-bold">{contactName}</span>. Your query regarding{' '}
                        <span className="font-semibold">"{contactSubject}"</span> has been registered.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs text-slate-700">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inquiry Reference Token</div>
                      <div className="font-mono font-black text-sm text-[#123B6D] mt-0.5">{contactRefId}</div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Our reception desk will contact you on <span className="font-bold text-slate-800">+91 {contactPhone}</span>.
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <a
                        href={`https://wa.me/91${cleanWhatsapp}?text=${encodeURIComponent(
                          `Hello ${labName}, I just submitted inquiry ${contactRefId} regarding "${contactSubject}" for patient ${contactName}. Message: ${contactMessage || 'Please call back.'}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Send Message via WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setContactSubmitted(false);
                          setContactName('');
                          setContactPhone('');
                          setContactEmail('');
                          setContactMessage('');
                        }}
                        className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                      >
                        Submit Another Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    {contactError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{contactError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="text-xs font-bold text-slate-400 absolute left-3 top-2.5">+91</span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="98765 43210"
                            className="w-full pl-11 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="patient@example.com"
                            className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Inquiry Topic / Reason
                      </label>
                      <select
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                      >
                        <option value="Test Inquiry & Pricing">Test Inquiry & Price Estimate</option>
                        <option value="Home Sample Collection Request">Home Sample Collection Request</option>
                        <option value="Report Status & Delivery Help">Report Status & Delivery Help</option>
                        <option value="Fasting & Test Preparation Instructions">Fasting & Test Preparation Instructions</option>
                        <option value="Doctor Prescription Consultation">Doctor Prescription / Second Opinion</option>
                        <option value="Corporate / Health Camp Tie-up">Corporate / Health Camp Tie-up</option>
                        <option value="General Feedback & Other">General Feedback & Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Message / Test Details <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Mention test names (e.g. CBC, Thyroid, HbA1c), doctor recommendation, or preferred collection time..."
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className="w-full bg-[#123B6D] hover:bg-[#0e2f57] text-white py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-75"
                    >
                      {contactSubmitting ? (
                        <span>Submitting inquiry...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-amber-400" />
                          <span>Send Inquiry to Laboratory Reception</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-slate-400 mt-2">
                      🔒 Your medical inquiries and contact details remain strictly confidential under HIPAA / DISHA guidelines.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Report Download Banner with Inline Search */}
      <section id="download-report" className="py-12 bg-slate-900 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700/70 shadow-xl">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{labName} Patient Report Portal</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Download Your Diagnostic Report Online
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Directly check reports for {labName}. No password required. Enter your registered 10-digit mobile number or Token / Report ID below.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0">
              <input
                type="text"
                value={inlineReportSearch}
                onChange={(e) => setInlineReportSearch(e.target.value)}
                placeholder="Mobile number or Token / Report ID"
                className="px-4 py-3 bg-slate-900/90 border border-slate-600 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 min-w-[240px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (inlineReportSearch.trim()) {
                      const cleanDigits = inlineReportSearch.replace(/\D/g, '');
                      if (cleanDigits.length >= 10) {
                        handleCheckReport('', cleanDigits);
                      } else {
                        handleCheckReport(inlineReportSearch.trim(), '');
                      }
                    } else {
                      handleCheckReport();
                    }
                  }
                }}
              />

              <button
                type="button"
                onClick={() => {
                  if (inlineReportSearch.trim()) {
                    const cleanDigits = inlineReportSearch.replace(/\D/g, '');
                    if (cleanDigits.length >= 10) {
                      handleCheckReport('', cleanDigits);
                    } else {
                      handleCheckReport(inlineReportSearch.trim(), '');
                    }
                  } else {
                    handleCheckReport();
                  }
                }}
                className="bg-[#0F766E] hover:bg-[#0c615a] text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                <span>Go to Report Portal</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
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
              <p className="text-slate-500 leading-relaxed mb-3">
                {labDescription}
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#123B6D] shrink-0" />
                  <a href={`tel:+91${cleanPhone}`} className="hover:text-[#123B6D] font-bold">
                    +91 {labPhone}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <a href={stickyWhatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 font-bold text-emerald-700">
                    WhatsApp: +91 {cleanWhatsapp}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <a href={`mailto:${labEmail}`} className="hover:text-indigo-800 break-all">
                    {labEmail}
                  </a>
                </div>
                <div className="flex items-start gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#123B6D] shrink-0 mt-0.5" />
                  <span>{labAddress}</span>
                </div>
              </div>

              {/* Social Media Links inside Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Follow Us Online
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={stickyWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp"
                    className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook"
                    className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center transition"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                    className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center transition"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Twitter / X"
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center transition"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="YouTube"
                    className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center justify-center transition"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                    className="w-7 h-7 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center transition"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                </div>
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
                    onClick={onOpenSoftwareWebsite}
                    className="hover:text-[#123B6D] flex items-center gap-1.5 cursor-pointer text-[#0F766E] font-bold"
                  >
                    <span>🏠 Main Home Portal</span>
                  </button>
                </li>
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
                  <button onClick={() => handleCheckReport()} className="hover:text-[#123B6D] text-teal-700 font-semibold cursor-pointer">
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
                  href="https://indianlalaji.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#123B6D] hover:underline font-black"
                >
                  indianlalaji.com
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

      {/* 2-Step Online Test Booking Modal (Step 1: Test & Form, Step 2: QR / Pay at Branch) */}
      <OnlineTestBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialSelection={selectedTestOrPackage}
        onOpenReportPortal={handleCheckReport}
      />
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
