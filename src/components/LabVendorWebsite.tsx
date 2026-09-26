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
  Shield,
  RotateCcw,
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
  Image as ImageIcon,
  Users,
  Maximize2,
  Upload,
  Trash2,
  Plus,
  ShoppingCart,
  Info,
  Sparkles,
  Tag,
  TestTube,
} from 'lucide-react';
import { useCms, DEFAULT_ALL_VENDOR_DOCTORS } from '../context/CmsContext';
import { updateDocumentMetadata, generateDefaultOgImage } from '../utils/seo';
import { Language } from '../types';
import { OnlineTestBookingModal } from './vendor/OnlineTestBookingModal';
import { HeroBookingForm } from './vendor/HeroBookingForm';
import { LabWelcomeFirstScreen } from './vendor/LabWelcomeFirstScreen';
import { TermsConditionsModal } from './TermsConditionsModal';
import { VendorPolicyModal, PolicyTabType } from './vendor/VendorPolicyModal';
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
    updateVendorLabSettings,
  } = useCms();

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

  const handleOpenAdmin = () => {
    if (currentUser && currentUser.role === 'admin') {
      if (onOpenAdminDashboard) onOpenAdminDashboard();
    } else if (currentUser && currentUser.role === 'vendor') {
      if (onOpenVendorDashboard) onOpenVendorDashboard();
    } else {
      openLoginModal('admin');
    }
  };

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

  // Multi-number support for WhatsApp & Calling
  const whatsappNumberList = React.useMemo(() => {
    const raw = vendorLabSettings?.whatsapp || labWhatsapp || '7087033009';
    const splitNums = raw.split(/[,/|&]+/).map((s: string) => s.trim()).filter(Boolean);
    const unique = Array.from(new Set(splitNums));
    return unique.length > 0 ? unique : ['7087033009'];
  }, [vendorLabSettings?.whatsapp, labWhatsapp]);

  const callNumberList = React.useMemo(() => {
    const rawList: string[] = [];
    if (vendorLabSettings?.phone) {
      rawList.push(...vendorLabSettings.phone.split(/[,/|&]+/));
    }
    if (vendorLabSettings?.helplinePhone && vendorLabSettings.helplinePhone !== vendorLabSettings.phone) {
      rawList.push(...vendorLabSettings.helplinePhone.split(/[,/|&]+/));
    }
    if (rawList.length === 0 && labPhone) {
      rawList.push(...labPhone.split(/[,/|&]+/));
    }
    const cleanList = Array.from(new Set(rawList.map((s: string) => s.trim()).filter(Boolean)));
    return cleanList.length > 0 ? cleanList : ['7087033009'];
  }, [vendorLabSettings?.phone, vendorLabSettings?.helplinePhone, labPhone]);

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
  const [selectedBookTestCategory, setSelectedBookTestCategory] = useState<string>('All');
  const [selectedTestInfoModal, setSelectedTestInfoModal] = useState<any | null>(null);
  const [showFullDirectory, setShowFullDirectory] = useState(false);
  const [cartToast, setCartToast] = useState<{ testName: string; price: number } | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPaymentQrModalOpen, setIsPaymentQrModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [selectedQrType, setSelectedQrType] = useState<'counter' | 'home'>('counter');
  const [isWebsiteQrModalOpen, setIsWebsiteQrModalOpen] = useState(false);
  const [copiedWebsiteUrl, setCopiedWebsiteUrl] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyModalTab, setPolicyModalTab] = useState<PolicyTabType>('terms');

  const openPolicyModal = (tab: PolicyTabType) => {
    setPolicyModalTab(tab);
    setIsPolicyModalOpen(true);
  };

  const websiteDirectUrl = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const search = window.location.search;
      if (search && search.includes('lab=')) {
        return `${origin}${window.location.pathname}${search}`;
      }
      const slug = currentLabItem?.domainPreview?.replace(`.${SUPER_ADMIN_DOMAIN}`, '') || currentLabItem?.id || 'apexdiagnostics';
      return `${origin}/?lab=${slug}`;
    }
    return canonicalUrl;
  }, [currentLabItem, canonicalUrl]);

  // Default Pathology & Diagnostic Banners
  const DEFAULT_HERO_BANNER_IMAGES = React.useMemo(() => [
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1600&q=80',
  ], []);

  // Section 1: Hero Carousel State (Admin Uploadable Photo Banners with 2%-5% Peek Effect)
  const heroBannersList = React.useMemo(() => {
    if (vendorLabSettings?.heroBanners && vendorLabSettings.heroBanners.length > 0) {
      return vendorLabSettings.heroBanners;
    }
    return DEFAULT_HERO_BANNER_IMAGES;
  }, [vendorLabSettings?.heroBanners, DEFAULT_HERO_BANNER_IMAGES]);

  const [activeHeroBanner, setActiveHeroBanner] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const heroCarouselRef = React.useRef<HTMLDivElement>(null);
  const touchStartXRef = React.useRef<number | null>(null);
  const touchEndXRef = React.useRef<number | null>(null);

  // Admin Banner Upload & Management State
  const [isBannerManagerOpen, setIsBannerManagerOpen] = useState(false);
  const [tempBannersList, setTempBannersList] = useState<string[]>([]);
  const [newBannerInputUrl, setNewBannerInputUrl] = useState('');
  const [bannerSaveNotice, setBannerSaveNotice] = useState('');
  const bannerFileInputRef = React.useRef<HTMLInputElement>(null);

  const openBannerManager = () => {
    setTempBannersList([...heroBannersList]);
    setNewBannerInputUrl('');
    setBannerSaveNotice('');
    setIsBannerManagerOpen(true);
  };

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setBannerSaveNotice('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setTempBannersList((prev) => [...prev, base64]);
        setBannerSaveNotice('Image photo added! Click "Save & Publish" to update.');
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleAddBannerUrl = () => {
    const url = newBannerInputUrl.trim();
    if (!url) return;
    setTempBannersList((prev) => [...prev, url]);
    setNewBannerInputUrl('');
    setBannerSaveNotice('Banner URL added! Click "Save & Publish" to update.');
  };

  const handleRemoveBanner = (index: number) => {
    setTempBannersList((prev) => prev.filter((_, i) => i !== index));
    setBannerSaveNotice('Banner removed from list. Click "Save & Publish" to update.');
  };

  const handleSaveBanners = () => {
    const finalBanners = tempBannersList.length > 0 ? tempBannersList : DEFAULT_HERO_BANNER_IMAGES;
    updateVendorLabSettings({ heroBanners: finalBanners });
    setBannerSaveNotice('✅ Banners updated successfully!');
    setTimeout(() => {
      setIsBannerManagerOpen(false);
      setBannerSaveNotice('');
      setActiveHeroBanner(0);
    }, 900);
  };

  const handleResetDefaultBanners = () => {
    setTempBannersList([...DEFAULT_HERO_BANNER_IMAGES]);
    updateVendorLabSettings({ heroBanners: DEFAULT_HERO_BANNER_IMAGES });
    setBannerSaveNotice('Reset to default diagnostic promotional banners.');
  };

  // Auto-slide carousel every 4.5 seconds (resets on interaction)
  useEffect(() => {
    if (isHeroPaused || heroBannersList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroBanner((prev) => (prev + 1) % heroBannersList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHeroPaused, heroBannersList.length]);

  // Smooth scroll carousel container to active slide
  useEffect(() => {
    if (heroCarouselRef.current) {
      const container = heroCarouselRef.current;
      const targetCard = container.children[activeHeroBanner] as HTMLElement;
      if (targetCard) {
        container.scrollTo({
          left: targetCard.offsetLeft - 12,
          behavior: 'smooth',
        });
      }
    }
  }, [activeHeroBanner]);

  const handleHeroTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsHeroPaused(true);
  };

  const handleHeroTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleHeroTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const delta = touchStartXRef.current - touchEndXRef.current;
      if (Math.abs(delta) > 35) {
        if (delta > 0) {
          // swipe left -> next slide
          setActiveHeroBanner((prev) => (prev + 1) % heroBannersList.length);
        } else {
          // swipe right -> previous slide
          setActiveHeroBanner((prev) => (prev - 1 + heroBannersList.length) % heroBannersList.length);
        }
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    setTimeout(() => setIsHeroPaused(false), 2500);
  };

  // Section 2: Quick Check Report Box State
  const [quickReportTab, setQuickReportTab] = useState<'mobile' | 'report_id'>('mobile');
  const [quickReportInput, setQuickReportInput] = useState('');
  const [quickReportError, setQuickReportError] = useState('');

  const handleQuickReportSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setQuickReportError('');
    const val = quickReportInput.trim();
    if (!val) {
      handleCheckReport();
      return;
    }
    if (quickReportTab === 'mobile') {
      const cleanDigits = val.replace(/\D/g, '');
      if (cleanDigits.length < 10) {
        setQuickReportError('Please enter a valid 10-digit mobile number.');
        return;
      }
      handleCheckReport('', cleanDigits);
    } else {
      handleCheckReport(val, '');
    }
  };

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

  // Section 4: Book Test Section Category Tabs
  const BOOK_TEST_CATEGORY_TABS = [
    'All',
    'Hematology',
    'Biochemistry',
    'Thyroid & Hormones',
    'Diabetes',
    'Vitamins',
    'Urine Analysis',
  ];

  const isTestInBookCategory = (test: any, cat: string) => {
    if (cat === 'All') return true;
    const catLower = cat.toLowerCase();
    const tCat = (test.category || '').toLowerCase();
    const tName = (test.name || '').toLowerCase();
    const tCode = (test.code || '').toLowerCase();

    if (cat === 'Hematology') {
      return (
        tCat.includes('hematology') ||
        tCat.includes('blood') ||
        tName.includes('cbc') ||
        tName.includes('esr') ||
        tName.includes('hemogram') ||
        tCode.includes('hem')
      );
    }
    if (cat === 'Biochemistry') {
      return (
        tCat.includes('biochemistry') ||
        tName.includes('lft') ||
        tName.includes('kft') ||
        tName.includes('liver') ||
        tName.includes('kidney') ||
        tName.includes('lipid') ||
        tCode.includes('bio')
      );
    }
    if (cat === 'Thyroid & Hormones') {
      return (
        tCat.includes('thyroid') ||
        tCat.includes('hormone') ||
        tName.includes('tsh') ||
        tName.includes('thyroid') ||
        tName.includes('t3') ||
        tName.includes('t4') ||
        tCode.includes('thy')
      );
    }
    if (cat === 'Diabetes') {
      return (
        tCat.includes('diabetes') ||
        tName.includes('hba1c') ||
        tName.includes('glucose') ||
        tName.includes('sugar') ||
        tName.includes('insulin')
      );
    }
    if (cat === 'Vitamins') {
      return (
        tCat.includes('vitamin') ||
        tName.includes('vitamin') ||
        tName.includes('d3') ||
        tName.includes('b12') ||
        tName.includes('calcium') ||
        tCode.includes('vit')
      );
    }
    if (cat === 'Urine Analysis') {
      return (
        tCat.includes('urine') ||
        tCat.includes('stool') ||
        tName.includes('urine') ||
        tName.includes('stool') ||
        tCode.includes('urn')
      );
    }
    return tCat.includes(catLower) || tName.includes(catLower);
  };

  const getTestDetails = (test: any) => {
    const name = test.name || '';
    const price = test.priceINR || 350;
    const mrp = test.mrpINR || Math.round(price * 1.85);
    const discount = Math.max(15, Math.round(((mrp - price) / mrp) * 100));
    const turnaround = test.turnaroundTime || '4-6 Hours';
    const sample = test.sampleType || 'Whole Blood (EDTA)';
    const code = test.code || 'LAB-01';

    const isFastingRequired =
      name.toLowerCase().includes('lipid') ||
      name.toLowerCase().includes('sugar') ||
      name.toLowerCase().includes('glucose') ||
      name.toLowerCase().includes('fasting') ||
      name.toLowerCase().includes('kft');

    const fastingLabel = isFastingRequired
      ? '10-12 Hours Fasting Required'
      : 'No Fasting Required (Can be given anytime)';

    const fastingDetail = isFastingRequired
      ? 'Overnight fasting for 10-12 hours is required before sample collection. Do not consume tea, coffee, milk, or breakfast. Plain drinking water is permitted.'
      : 'No fasting required. You may follow your normal dietary and medication schedule prior to sample collection.';

    let clinicalUse = test.description || 'Clinical diagnostic blood/specimen test used to assess physiological markers and detect medical conditions.';
    if (name.includes('CBC')) {
      clinicalUse = 'Complete 24-parameter automated cell counter analysis (Hemoglobin, RBC, WBC, Platelets, MCV). Essential for detecting viral/bacterial infections, anemia, fatigue, and blood disorders.';
    } else if (name.includes('HbA1c')) {
      clinicalUse = 'Gold standard 3-month average blood glucose control analysis via HPLC. Highly accurate for diabetic diagnosis, quarterly monitoring, and pre-diabetic risk evaluation.';
    } else if (name.includes('Thyroid') || name.includes('TSH')) {
      clinicalUse = 'Assesses Thyroid Stimulating Hormone (TSH), Total T3, and Total T4. Crucial for diagnosing Hypothyroidism, Hyperthyroidism, unexplained weight changes, lethargy, and hair loss.';
    } else if (name.includes('Lipid')) {
      clinicalUse = 'Measures Total Cholesterol, HDL (good cholesterol), LDL (bad cholesterol), and Triglycerides. Evaluates cardiac risk, arterial health, and blood vessel wellness.';
    } else if (name.includes('Vitamin D')) {
      clinicalUse = '25-Hydroxy Vitamin D level check essential for bone calcium absorption, joint strength, muscle wellness, and immune resistance.';
    } else if (name.includes('Vitamin B12')) {
      clinicalUse = 'Serum Cyanocobalamin evaluation vital for nervous system health, red blood cell generation, memory clarity, and preventing tingling sensations.';
    } else if (name.includes('LFT') || name.includes('Liver')) {
      clinicalUse = 'Screens liver enzymes (SGOT, SGPT, Bilirubin, Alkaline Phosphatase, Albumin) to evaluate liver health, fatty liver, jaundice, or medication load.';
    } else if (name.includes('KFT') || name.includes('Kidney')) {
      clinicalUse = 'Assesses Serum Creatinine, Blood Urea, and Uric Acid to assess kidney filtration, hydration, and renal clearance rate.';
    } else if (name.includes('Urine')) {
      clinicalUse = 'Physical, chemical, and microscopic urine screen for pus cells, RBCs, protein, sugar, and crystals. Rapidly flags Urinary Tract Infection (UTI) and kidney stones.';
    }

    return {
      price,
      mrp,
      discount,
      turnaround,
      sample,
      code,
      isFastingRequired,
      fastingLabel,
      fastingDetail,
      clinicalUse,
    };
  };

  const handleBookTestClick = (e: React.MouseEvent, test: any) => {
    e.stopPropagation();
    setSelectedTestOrPackage(`${test.name} (₹${test.priceINR})`);
    setCartToast({ testName: test.name, price: test.priceINR });
    setTimeout(() => setCartToast(null), 3500);
    setIsBookingModalOpen(true);
  };

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
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
                  className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-2xs group-hover:scale-105 transition shrink-0"
                />
              ) : (
                <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-xl bg-[#123B6D] text-white flex items-center justify-center font-black text-xs xs:text-sm sm:text-lg shadow-2xs group-hover:scale-105 transition shrink-0">
                  <span className="text-amber-400">{labName.charAt(0) || 'A'}</span>
                  <span>{labName.split(' ')[1]?.charAt(0) || 'L'}</span>
                </div>
              )}
              <div className="flex flex-col justify-center min-w-0">
                <div className="text-xs xs:text-sm sm:text-base lg:text-lg font-black tracking-tight text-[#123B6D] leading-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[220px] md:max-w-none">
                  {labName.toUpperCase()}
                </div>
                <div className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-500 font-semibold tracking-wide flex items-center gap-1 whitespace-nowrap mt-0.5">
                  <span className="hidden xs:inline">ID:</span>
                  <span className="font-mono font-bold text-[#123B6D] bg-slate-100 px-1 py-0.2 rounded text-[9px] xs:text-[10px] border border-slate-200">
                    {labShopId}
                  </span>
                  <span className="hidden sm:inline-block text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] border border-emerald-200">
                    • {labNabl}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links: Balanced & Clean */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs lg:text-sm font-semibold text-slate-700 whitespace-nowrap">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-[#123B6D] transition cursor-pointer text-[#123B6D] font-bold whitespace-nowrap py-1"
              id="vendor-nav-home"
            >
              Home
            </button>

            <a
              href="#packages"
              className="hover:text-[#123B6D] transition text-slate-700 hover:font-bold whitespace-nowrap py-1"
              id="vendor-nav-packages"
            >
              Packages
            </a>

            <a
              href="#test-directory"
              className="hover:text-[#123B6D] transition text-slate-700 hover:font-bold whitespace-nowrap py-1"
              id="vendor-nav-tests"
            >
              Tests
            </a>

            <a
              href="#about"
              className="hover:text-[#123B6D] transition text-slate-700 hover:font-bold whitespace-nowrap py-1"
              id="vendor-nav-about"
            >
              About
            </a>

            <a
              href="#doctors"
              className="hover:text-[#123B6D] transition text-slate-700 hover:font-bold whitespace-nowrap py-1"
              id="vendor-nav-team"
            >
              Team
            </a>

            <a
              href="#contact"
              className="hover:text-[#123B6D] transition text-slate-700 hover:font-bold whitespace-nowrap py-1"
              id="vendor-nav-contact"
            >
              Contact
            </a>
          </nav>

          {/* Action Items: Mobile (Report + Test + Menu) | Desktop (Language + QR + Report + Test + Login) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop Language Selector */}
            <div
              className="hidden xl:flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 rounded-lg px-2 py-1.5 border border-slate-200 text-xs text-slate-700 font-semibold transition cursor-pointer shrink-0"
              title="Change Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-[#123B6D] shrink-0" />
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
              className="hidden lg:inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition cursor-pointer shadow-2xs shrink-0"
              id="header-payment-qr-btn"
              title="Scan Lab Payment QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Payment QR</span>
            </button>

            {/* 1. Report Button (Mobile & Desktop: Direct Patient Report Portal / Download Page) */}
            <button
              onClick={() => handleCheckReport()}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-300/90 font-bold text-xs transition cursor-pointer shadow-2xs shrink-0 active:scale-95"
              id="header-download-report-btn"
              title={`Check or Download Patient Lab Report for ${labName}`}
            >
              <FileText className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
              <span>Report</span>
            </button>

            {/* 2. Test Button (Mobile & Desktop: Direct Test Booking / Home Collection Modal) */}
            <button
              onClick={() => {
                setSelectedTestOrPackage(
                  vendorPackages[0] ? `${vendorPackages[0].name} (₹${vendorPackages[0].priceINR})` : 'Full Body Health Checkup (₹999)'
                );
                setIsBookingModalOpen(true);
              }}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-2xs shrink-0 active:scale-95"
              id="header-book-test-btn"
              title="Book Lab Test or Home Collection"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span>Test</span>
            </button>

            {/* 3. Menu Icon (Hamburger: opens Side Drawer on Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 xs:p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 lg:hidden transition cursor-pointer shrink-0"
              aria-label="Open Navigation Menu Drawer"
              id="header-mobile-menu-btn"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>
          </div>
        </div>

        {/* Mobile Slide-Over Side Drawer with all 9 links & actions */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-over Drawer Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
              <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
                {/* Drawer Header */}
                <div className="px-5 py-4 bg-[#123B6D] text-white flex items-center justify-between border-b border-blue-900/40">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {labLogoUrl ? (
                      <img
                        src={labLogoUrl}
                        alt={labName}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-xl object-contain bg-white p-0.5 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-white/15 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                        <span className="text-amber-400">{labName.charAt(0) || 'A'}</span>
                        <span>{labName.split(' ')[1]?.charAt(0) || 'L'}</span>
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-sm text-white truncate leading-tight">
                        {labName}
                      </span>
                      <span className="text-[10px] text-blue-200 font-mono">
                        ID: {labShopId} • {labNabl}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                    aria-label="Close Navigation Drawer"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Primary Quick Action Buttons */}
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleCheckReport();
                    }}
                    className="py-2.5 px-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-98 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#0F766E]" />
                    <span>Report Portal</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSelectedTestOrPackage(
                        vendorPackages[0] ? `${vendorPackages[0].name} (₹${vendorPackages[0].priceINR})` : 'Full Body Health Checkup (₹999)'
                      );
                      setIsBookingModalOpen(true);
                    }}
                    className="py-2.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-98 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-950" />
                    <span>Book Test</span>
                  </button>
                </div>

                {/* Scrollable Navigation Links (Home, Packages, Tests, About, Team, Contact) */}
                <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1 text-sm font-semibold text-slate-700">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
                    Quick Links
                  </div>

                  {/* 1. Home */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 transition flex items-center gap-3 text-slate-800 font-bold cursor-pointer"
                  >
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#123B6D] flex items-center justify-center text-xs">🏠</span>
                    <span>Home</span>
                  </button>

                  {/* 2. Packages */}
                  <a
                    href="#packages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 transition flex items-center gap-3 text-slate-800 font-bold cursor-pointer"
                  >
                    <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xs">📦</span>
                    <span>Packages</span>
                  </a>

                  {/* 3. Tests */}
                  <a
                    href="#test-directory"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 transition flex items-center gap-3 text-slate-800 font-bold cursor-pointer"
                  >
                    <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs">🔬</span>
                    <span>Tests</span>
                  </a>

                  {/* 4. About */}
                  <a
                    href="#about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 transition flex items-center gap-3 text-slate-800 font-bold cursor-pointer"
                  >
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs">ℹ️</span>
                    <span>About</span>
                  </a>

                  {/* 5. Team */}
                  <a
                    href="#doctors"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 transition flex items-center gap-3 text-slate-800 font-bold cursor-pointer"
                  >
                    <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-xs">👨‍⚕️</span>
                    <span>Team (Pathologists)</span>
                  </a>

                  {/* 6. Contact */}
                  <a
                    href="#contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 transition flex items-center gap-3 text-slate-800 font-bold cursor-pointer"
                  >
                    <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center text-xs">📍</span>
                    <span>Contact &amp; Location</span>
                  </a>

                  {/* Payment QR Button in Drawer */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsPaymentQrModalOpen(true);
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-amber-50 text-amber-900 border border-amber-200 transition flex items-center justify-between text-xs font-bold cursor-pointer mt-2"
                  >
                    <span className="flex items-center gap-2.5">
                      <QrCode className="w-4 h-4 text-amber-600" />
                      <span>Lab Payment QR Code</span>
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-black">
                      UPI
                    </span>
                  </button>
                </div>

                {/* Drawer Footer Actions (8. Staff Login, 9. T&C, Language, Call Support) */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5">
                  {/* 8. Staff Login */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openLoginModal('vendor');
                    }}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#123B6D] hover:bg-[#0e2c52] text-white font-bold text-xs flex items-center justify-between shadow-xs transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-300" />
                      <span>Staff Login (Admin / Tech / Rec)</span>
                    </span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">
                      Portal
                    </span>
                  </button>

                  {/* 9. Terms & Conditions Modal Opener */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsTermsModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold text-xs flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Terms &amp; Conditions (T&amp;C)</span>
                    </span>
                    <span className="text-slate-400 text-xs font-bold">View →</span>
                  </button>

                  {/* Language Selector */}
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white border border-slate-200">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Globe className="w-3.5 h-3.5 text-[#123B6D]" />
                      <span>Language / भाषा:</span>
                    </span>
                    <select
                      aria-label="Select website language"
                      value={language}
                      onChange={(e) => onSelectLanguage?.(e.target.value as Language)}
                      className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी</option>
                      <option value="pa">ਪੰਜਾਬੀ</option>
                    </select>
                  </div>

                  {/* Call Helpline Direct */}
                  <a
                    href={`tel:${cleanPhone}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs"
                  >
                    📞 Call Lab Helpline: +91 {cleanPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* SECTION 1: HERO SECTION (Image Banners Carousel with 2%-5% Mobile Peek Effect) */}
      <section id="top" className="bg-gradient-to-b from-[#F8FAFC] via-slate-50 to-white py-3.5 sm:py-6 border-b border-slate-200 scroll-mt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 space-y-3.5 sm:space-y-5">
          {/* Main Photo Banner Carousel Container */}
          <div className="relative">
            {/* Carousel Track with 2%-5% Peek Effect on Mobile */}
            <div
              ref={heroCarouselRef}
              onTouchStart={handleHeroTouchStart}
              onTouchMove={handleHeroTouchMove}
              onTouchEnd={handleHeroTouchEnd}
              onMouseEnter={() => setIsHeroPaused(true)}
              onMouseLeave={() => setIsHeroPaused(false)}
              className="flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 no-scrollbar px-2 sm:px-0 py-1 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {heroBannersList.map((bannerUrl, idx) => (
                <div
                  key={idx}
                  className="w-[94%] xs:w-[95%] sm:w-[95%] lg:w-full shrink-0 snap-center rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg relative bg-slate-950 aspect-[16/8] sm:aspect-[21/9] max-h-[360px] sm:max-h-[440px] group cursor-pointer border border-slate-200/80"
                  onClick={() => {
                    setSelectedTestOrPackage('Full Body Health Checkup (₹999)');
                    setIsBookingModalOpen(true);
                  }}
                  title="Click to Book Lab Tests"
                >
                  <img
                    src={bannerUrl}
                    alt={`${labName} Promotional Banner ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-101"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40 pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Desktop Navigation Arrows */}
            {heroBannersList.length > 1 && (
              <div className="hidden lg:flex items-center justify-between absolute top-1/2 -translate-y-1/2 left-3 right-3 pointer-events-none">
                <button
                  type="button"
                  onClick={() => setActiveHeroBanner((prev) => (prev - 1 + heroBannersList.length) % heroBannersList.length)}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition cursor-pointer pointer-events-auto active:scale-95 border border-slate-200 backdrop-blur-xs"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHeroBanner((prev) => (prev + 1) % heroBannersList.length)}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition cursor-pointer pointer-events-auto active:scale-95 border border-slate-200 backdrop-blur-xs"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            )}
          </div>

          {/* Carousel Indicators & Swipe Notification */}
          <div className="flex items-center justify-between px-3">
            {/* Pill Indicator Dots */}
            <div className="flex items-center gap-2">
              {heroBannersList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveHeroBanner(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeHeroBanner === idx
                      ? 'w-8 bg-[#123B6D] shadow-xs'
                      : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to banner slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Mobile swipe hint */}
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span className="sm:hidden text-slate-400 font-medium">👉 Swipe for next banner (2% peek)</span>
              <span className="hidden sm:inline">Banner {activeHeroBanner + 1} of {heroBannersList.length}</span>
            </div>
          </div>

          {/* 1-Step Lab Test Booking Form & Trust Highlights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pt-2">
            {/* Left: Quick Booking Form */}
            <div className="lg:col-span-7">
              <HeroBookingForm onOpenReportPortal={() => handleCheckReport()} />
            </div>

            {/* Right: Quick Features & Trust Credentials */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Why Patients Trust {labName}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="font-bold text-[#123B6D] flex items-center gap-1.5">
                      <span>🧪</span>
                      <span>Zero Mix-Up Barcode</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Sample vacutainers tagged with patient UHID right at collection.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="font-bold text-[#123B6D] flex items-center gap-1.5">
                      <span>❄️</span>
                      <span>Cold-Chain Integrity</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Temperature maintained at 2°C–8°C in insulated gel boxes.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="font-bold text-[#123B6D] flex items-center gap-1.5">
                      <span>📱</span>
                      <span>Instant WhatsApp PDF</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Signed reports sent directly to your phone in 4 to 6 hours.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="font-bold text-[#123B6D] flex items-center gap-1.5">
                      <span>👨‍⚕️</span>
                      <span>MD Pathologist Sign-Off</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      100% human doctor validation on every critical test parameter.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#123B6D]" />
                    <span className="font-semibold text-slate-700">Need immediate booking?</span>
                  </div>
                  <a
                    href={`tel:${cleanPhone}`}
                    className="font-bold text-[#123B6D] hover:underline"
                  >
                    +91 {cleanPhone} →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CHECK REPORT QUICK SECTION (Directly Below Hero Section) */}
      <section
        id="check-report-quick"
        className="py-6 sm:py-8 bg-gradient-to-r from-slate-900 via-[#123B6D] to-slate-900 text-white scroll-mt-20 border-b border-slate-800 relative overflow-hidden"
      >
        {/* Subtle decorative medical ambient light */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-3 sm:px-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl space-y-4 sm:space-y-5">
            {/* Top Header Badge & Text */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Instant 10-Second Report Access</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Check &amp; Download Patient Lab Report
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Access your ISO 15189 verified medical reports for <strong>{labName}</strong> directly without password or login.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">NABL Accredited • 256-Bit Encrypted</span>
              </div>
            </div>

            {/* Error Message if Any */}
            {quickReportError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{quickReportError}</span>
              </div>
            )}

            {/* Search Mode Tabs: Mobile Number vs Token / Report ID */}
            <div className="flex items-center gap-2 bg-slate-950/40 p-1 rounded-2xl max-w-md">
              <button
                type="button"
                onClick={() => {
                  setQuickReportTab('mobile');
                  setQuickReportError('');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  quickReportTab === 'mobile'
                    ? 'bg-white text-[#123B6D] shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Search by Mobile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuickReportTab('report_id');
                  setQuickReportError('');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  quickReportTab === 'report_id'
                    ? 'bg-white text-[#123B6D] shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Search by Report ID</span>
              </button>
            </div>

            {/* Fast Form Input Box */}
            <form onSubmit={handleQuickReportSearch} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <div className="relative flex-1">
                  {quickReportTab === 'mobile' ? (
                    <>
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span className="text-xs sm:text-sm font-bold text-slate-300">+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={quickReportInput}
                        onChange={(e) => {
                          setQuickReportInput(e.target.value.replace(/\D/g, '').slice(0, 10));
                          if (quickReportError) setQuickReportError('');
                        }}
                        placeholder="Enter 10-digit registered mobile number"
                        className="w-full pl-12 pr-10 py-3.5 bg-slate-950/60 border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400 font-medium transition"
                      />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <FileText className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={quickReportInput}
                        onChange={(e) => {
                          setQuickReportInput(e.target.value);
                          if (quickReportError) setQuickReportError('');
                        }}
                        placeholder="Enter Report ID (e.g. RPT-2026-001 or Token #)"
                        className="w-full pl-10 pr-10 py-3.5 bg-slate-950/60 border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400 font-medium transition"
                      />
                    </>
                  )}

                  {quickReportInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuickReportInput('');
                        setQuickReportError('');
                      }}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 cursor-pointer shrink-0"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>Check / Download Report</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>

              {/* Demo Shortcut Chips & WhatsApp Alternative */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs text-slate-400">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-300">Quick Samples:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickReportTab('report_id');
                      setQuickReportInput('RPT-2026-001');
                      handleCheckReport('RPT-2026-001', '');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 border border-white/15 text-[11px] font-bold transition cursor-pointer"
                  >
                    RPT-2026-001 (Rahul)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickReportTab('report_id');
                      setQuickReportInput('RPT-2026-002');
                      handleCheckReport('RPT-2026-002', '');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/15 text-[11px] font-bold transition cursor-pointer"
                  >
                    RPT-2026-002 (Sunita)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCheckReport()}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 border border-white/15 text-[11px] font-bold transition cursor-pointer"
                  >
                    Open Direct Portal →
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Send "REPORT" to WhatsApp:</span>
                  <a
                    href={stickyWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-bold"
                  >
                    +91 {cleanWhatsapp}
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 3: HEALTH PACKAGES (with Booking Button & Peek Carousel) */}
      <section id="packages" className="py-16 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#123B6D]/10 text-[#123B6D] text-xs font-bold mb-3">
              <span>Preventive Health Packages</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B6D] tracking-tight">
              Comprehensive Health Checkups with Up to 60% Savings
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              सभी पॉपुलर प्रिवेंटिव हेल्थ पैकेजेस (Full Body Checkup, Diabetes Care, Senior Citizen, Women Wellness आदि)। Free home sample pickup, digital NABL reports and free doctor consultation.
            </p>

            {/* Mobile View Peek Hint */}
            <div className="flex sm:hidden items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold mt-3">
              <span>👉 Swipe left for next package (2% peek view)</span>
            </div>
          </div>

          {/* Section 3 Peek Carousel: 1st card 88%-90% width, next card peeks 2%-5% on mobile */}
          <div
            className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible pb-4 pt-2 snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {vendorPackages.map((pkg, idx) => {
              const mrp = pkg.mrpINR || Math.round(pkg.priceINR * 2.5);
              const savePct = Math.round(((mrp - pkg.priceINR) / mrp) * 100);
              return (
                <div
                  key={pkg.id || idx}
                  className="w-[88%] xs:w-[89%] sm:w-[90%] md:w-auto shrink-0 snap-start bg-[#F8FAFC] rounded-2xl border border-slate-200 hover:border-[#123B6D]/50 p-5 sm:p-6 flex flex-col justify-between transition-all hover:shadow-lg relative group"
                >
                  {(pkg.isPopular || idx === 0) && (
                    <div className="absolute -top-3 right-6 bg-[#F59E0B] text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-bold text-[#0F766E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
                      <span>{pkg.testsCount || 68} Tests / Parameters</span>
                    </div>

                    <h3 className="text-lg font-black text-[#123B6D] leading-snug">{pkg.name}</h3>

                    <p className="text-xs text-[#64748B] mt-1.5 mb-4 leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-slate-200">
                      <span className="text-3xl font-black text-[#123B6D]">₹{pkg.priceINR}</span>
                      <span className="text-sm text-slate-400 line-through">₹{mrp}</span>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        Save {savePct}%
                      </span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="text-xs font-bold text-slate-800">Key Tests Included:</div>
                      {pkg.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTestOrPackage(`${pkg.name} (₹${pkg.priceINR})`);
                        setIsBookingModalOpen(true);
                      }}
                      className="w-full bg-[#123B6D] hover:bg-[#0e2c52] text-white py-2.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <span>Book Package</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppBooking(pkg.name, pkg.priceINR)}
                      className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075e54] border border-[#25D366]/30 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp Booking</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: BOOK TEST SECTION (Categories + Cart Icon + Popup + 2-Row Peek Grid) */}
      <section id="book-test-section" className="py-16 bg-[#F8FAFC] border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/10 text-[#0F766E] text-xs font-bold mb-2">
                <span>Book Diagnostic Test</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B6D] tracking-tight">
                Book Pathology Tests Online with Instant Fasting Info
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                Click any test card for clinical usage and fasting preparation instructions, or add directly to booking.
              </p>
            </div>

            {/* Mobile swipe hint */}
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto">
              <span className="text-[#123B6D]">💡</span>
              <span>2 full cards on screen • 3rd card peeks 2%–5% • 50%-50% if 2 cards</span>
            </div>
          </div>

          {/* Category Tabs: All, Hematology, Biochemistry, Thyroid & Hormones, Diabetes, Vitamins, Urine Analysis */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {BOOK_TEST_CATEGORY_TABS.map((cat) => {
              const isSelected = selectedBookTestCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedBookTestCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    isSelected
                      ? 'bg-[#123B6D] text-white ring-2 ring-[#123B6D]/20 shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{cat}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                </button>
              );
            })}
          </div>

          {/* 2-ROW HORIZONTAL PEEK GRID */}
          <div className="space-y-6">
            {/* ROW 1: Test Cards (e.g. CBC, HbA1c, Thyroid, Lipid Profile) */}
            {(() => {
              // Row 1 selection logic
              let r1Tests: any[] = [];
              if (selectedBookTestCategory === 'All') {
                r1Tests = vendorTests.filter((t) => {
                  const n = t.name.toLowerCase();
                  return n.includes('cbc') || n.includes('hba1c') || n.includes('thyroid') || n.includes('tsh') || n.includes('lipid');
                });
                if (r1Tests.length < 2) r1Tests = vendorTests.slice(0, 4);
              } else {
                const matched = vendorTests.filter((t) => isTestInBookCategory(t, selectedBookTestCategory));
                if (matched.length <= 2) {
                  r1Tests = matched;
                } else {
                  r1Tests = matched.slice(0, Math.ceil(matched.length / 2));
                }
              }

              const isRow1TwoCards = r1Tests.length <= 2;

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black uppercase tracking-wider text-[#123B6D] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <span>Row 1: {selectedBookTestCategory === 'All' ? 'Primary Blood Tests (CBC, HbA1c, Thyroid, Lipid)' : `${selectedBookTestCategory} (Line 1)`}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {r1Tests.length} Tests Available
                    </span>
                  </div>

                  {/* Horizontal Scroll / Fit Container */}
                  <div
                    className={
                      isRow1TwoCards
                        ? 'w-full flex gap-3 sm:gap-4'
                        : 'w-full flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth'
                    }
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {r1Tests.map((test, idx) => {
                      const details = getTestDetails(test);
                      return (
                        <div
                          key={test.id || `r1-${idx}`}
                          onClick={() => setSelectedTestInfoModal(test)}
                          className={`bg-white rounded-2xl border border-slate-200 hover:border-[#123B6D]/50 hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between cursor-pointer group relative ${
                            isRow1TwoCards
                              ? 'flex-1 w-[calc(50%-6px)] sm:w-[calc(50%-8px)] min-w-0'
                              : 'w-[calc(47.5%-6px)] sm:w-[calc(48%-8px)] md:w-[calc(31.5%-10px)] lg:w-[calc(23.5%-12px)] shrink-0 snap-start'
                          }`}
                        >
                          <div>
                            {/* Card Top: Medical Icon, Code, Info icon */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="w-9 h-9 rounded-xl bg-[#123B6D]/10 text-[#123B6D] flex items-center justify-center font-bold text-sm group-hover:bg-[#123B6D] group-hover:text-white transition">
                                🧪
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                                  {details.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTestInfoModal(test);
                                  }}
                                  className="p-1 rounded-lg text-slate-400 hover:text-[#123B6D] hover:bg-slate-100 transition cursor-pointer"
                                  title="View Test Information & Fasting Prep"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Test Name */}
                            <h4 className="font-black text-xs sm:text-sm text-[#123B6D] line-clamp-2 leading-snug group-hover:text-blue-700 transition mb-2">
                              {test.name}
                            </h4>

                            {/* Specimen & Reporting Time */}
                            <div className="space-y-1 mb-3 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-medium">Sample:</span>
                                <span className="font-bold text-slate-700 truncate max-w-[120px]" title={details.sample}>
                                  {details.sample}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-medium">Reporting:</span>
                                <span className="font-bold text-emerald-700">⏱️ {details.turnaround}</span>
                              </div>
                            </div>

                            {/* Fasting Badge */}
                            <div className="mb-3">
                              {details.isFastingRequired ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                                  <span>⚠️</span>
                                  <span>10-12h Fasting</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                  <span>✅</span>
                                  <span>No Fasting Req.</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price, Discount & Cart/Book Test Button */}
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <div className="flex items-baseline justify-between">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-base sm:text-lg font-black text-[#123B6D]">₹{details.price}</span>
                                <span className="text-xs text-slate-400 line-through">₹{details.mrp}</span>
                              </div>
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Save {details.discount}%
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleBookTestClick(e, test)}
                              className="w-full bg-[#123B6D] hover:bg-[#0e2c52] text-white py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                              title="Book test online"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                              <span>Book Test</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ROW 2: Test Cards (e.g. Vitamin D3, Vitamin B12, LFT, KFT, Urine Routine) */}
            {(() => {
              // Row 2 selection logic
              let r2Tests: any[] = [];
              if (selectedBookTestCategory === 'All') {
                r2Tests = vendorTests.filter((t) => {
                  const n = t.name.toLowerCase();
                  return (
                    n.includes('vitamin') ||
                    n.includes('d3') ||
                    n.includes('b12') ||
                    n.includes('lft') ||
                    n.includes('liver') ||
                    n.includes('kft') ||
                    n.includes('kidney') ||
                    n.includes('urine')
                  );
                });
                if (r2Tests.length < 2) r2Tests = vendorTests.slice(4, 9);
              } else {
                const matched = vendorTests.filter((t) => isTestInBookCategory(t, selectedBookTestCategory));
                if (matched.length > 2) {
                  r2Tests = matched.slice(Math.ceil(matched.length / 2));
                }
              }

              if (r2Tests.length === 0) return null;

              const isRow2TwoCards = r2Tests.length <= 2;

              return (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black uppercase tracking-wider text-[#123B6D] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <span>Row 2: {selectedBookTestCategory === 'All' ? 'Essential Profiles (Vitamin D3, B12, LFT, KFT, Urine)' : `${selectedBookTestCategory} (Line 2)`}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {r2Tests.length} Tests Available
                    </span>
                  </div>

                  {/* Horizontal Scroll / Fit Container */}
                  <div
                    className={
                      isRow2TwoCards
                        ? 'w-full flex gap-3 sm:gap-4'
                        : 'w-full flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth'
                    }
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {r2Tests.map((test, idx) => {
                      const details = getTestDetails(test);
                      return (
                        <div
                          key={test.id || `r2-${idx}`}
                          onClick={() => setSelectedTestInfoModal(test)}
                          className={`bg-white rounded-2xl border border-slate-200 hover:border-[#123B6D]/50 hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between cursor-pointer group relative ${
                            isRow2TwoCards
                              ? 'flex-1 w-[calc(50%-6px)] sm:w-[calc(50%-8px)] min-w-0'
                              : 'w-[calc(47.5%-6px)] sm:w-[calc(48%-8px)] md:w-[calc(31.5%-10px)] lg:w-[calc(23.5%-12px)] shrink-0 snap-start'
                          }`}
                        >
                          <div>
                            {/* Card Top: Medical Icon, Code, Info icon */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm group-hover:bg-[#123B6D] group-hover:text-white transition">
                                🔬
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                                  {details.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTestInfoModal(test);
                                  }}
                                  className="p-1 rounded-lg text-slate-400 hover:text-[#123B6D] hover:bg-slate-100 transition cursor-pointer"
                                  title="View Test Information & Fasting Prep"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Test Name */}
                            <h4 className="font-black text-xs sm:text-sm text-[#123B6D] line-clamp-2 leading-snug group-hover:text-blue-700 transition mb-2">
                              {test.name}
                            </h4>

                            {/* Specimen & Reporting Time */}
                            <div className="space-y-1 mb-3 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-medium">Sample:</span>
                                <span className="font-bold text-slate-700 truncate max-w-[120px]" title={details.sample}>
                                  {details.sample}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-medium">Reporting:</span>
                                <span className="font-bold text-emerald-700">⏱️ {details.turnaround}</span>
                              </div>
                            </div>

                            {/* Fasting Badge */}
                            <div className="mb-3">
                              {details.isFastingRequired ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                                  <span>⚠️</span>
                                  <span>10-12h Fasting</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                  <span>✅</span>
                                  <span>No Fasting Req.</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price, Discount & Cart/Book Test Button */}
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <div className="flex items-baseline justify-between">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-base sm:text-lg font-black text-[#123B6D]">₹{details.price}</span>
                                <span className="text-xs text-slate-400 line-through">₹{details.mrp}</span>
                              </div>
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Save {details.discount}%
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleBookTestClick(e, test)}
                              className="w-full bg-[#123B6D] hover:bg-[#0e2c52] text-white py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                              title="Book test online"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                              <span>Book Test</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 2 लाइन्स के ठीक नीचे: "View All Tests (500+ Tests Directory) →" बड़ा बटन */}
          <div className="mt-10 text-center">
            <button
              type="button"
              id="btn-view-all-tests"
              onClick={() => {
                setShowFullDirectory(!showFullDirectory);
                setTimeout(() => {
                  const el = document.getElementById('full-test-directory-view');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#123B6D] via-[#1E4E8C] to-[#0F766E] hover:from-[#0e2c52] hover:to-[#0d5f58] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 border border-white/20"
            >
              <span>View All Tests (500+ Tests Directory)</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Expandable 500+ Tests Complete Directory Section */}
          {showFullDirectory && (
            <div id="full-test-directory-view" className="mt-12 pt-8 border-t border-slate-200 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#123B6D]/10 text-[#123B6D] text-xs font-bold mb-2">
                    <span>Complete 500+ Pathology Directory</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#123B6D]">
                    Search Blood Tests & View Exact Prices
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Transparent rates with fast turnaround times and verified pathologist reporting.
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
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none bg-white shadow-xs font-medium"
                  />
                </div>
              </div>

              {/* Full Test Directory Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTests.map((test) => {
                  const details = getTestDetails(test);
                  return (
                    <div
                      key={test.id}
                      onClick={() => setSelectedTestInfoModal(test)}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {test.category}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400 font-bold">{details.code}</span>
                        </div>

                        <h4 className="text-sm font-bold text-[#123B6D] group-hover:text-blue-700 transition">{test.name}</h4>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                          <div>
                            <span className="block text-[10px] text-slate-400">Specimen</span>
                            <span className="font-medium text-slate-700 truncate block">{details.sample}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">Report In</span>
                            <span className="font-medium text-slate-700">{details.turnaround}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Test Fee</span>
                          <span className="text-base font-extrabold text-[#123B6D]">₹{details.price}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsAppBooking(test.name, details.price);
                            }}
                            className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075e54] border border-[#25D366]/30 transition cursor-pointer"
                            title="Book via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleBookTestClick(e, test)}
                            className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <ShoppingCart className="w-3 h-3 text-amber-400" />
                            <span>Book Test</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <a
              href={`https://wa.me/91${cleanWhatsapp}?text=${encodeURIComponent(
                `Hello ${labName}, I want to inquire about pathology test booking & home sample collection.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#123B6D] hover:underline"
            >
              <span>Can't find a test? Ask us directly on WhatsApp (+91 {cleanWhatsapp})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 5: ABOUT US SECTION (with Founder / Director Image & Lab Story) */}
      <section id="about" className="py-16 sm:py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          {/* Top Title & Accreditation Badges */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>NABL Accredited &bull; ISO 15189:2022 Certified Medical Laboratory</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#123B6D] tracking-tight">
              About Our Laboratory &amp; Medical Leadership
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Serving patients, referring physicians, and hospital networks with uncompromising diagnostic precision, automated pathology, and compassionate care since {currentLabItem?.establishedYear || 2012}.
            </p>
          </div>

          {/* Main 2-Column Grid: Lab Story & Legacy + Founder / Director Profile Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left 7 Columns: Lab Story & Clinical Heritage */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#123B6D] flex items-center justify-center font-black text-sm">
                    🏛️
                  </span>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 leading-snug">
                      Our Journey &amp; Legacy of Clinical Excellence
                    </h3>
                    <span className="text-xs font-semibold text-[#0F766E]">
                      Trusted Laboratory &amp; Diagnostic Pathology Services
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Founded with a singular dedication to diagnostic excellence, <strong>{labName}</strong> bridges the gap between modern clinical science and patient-centered healthcare. From routine health panels to specialized diagnostic assays, our laboratory is trusted by families, clinicians, and medical networks.
                </p>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We operate in strict compliance with <strong>ISO 15189:2022</strong> and <strong>NABL (National Accreditation Board for Testing and Calibration Laboratories)</strong> standards (Accreditation No: <span className="font-mono font-bold text-[#123B6D]">{labNabl}</span>). Every specimen undergoes rigorous multi-tier internal quality controls (IQC) and participating International External Quality Assessment Schemes (EQAS).
                </p>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Equipped with advanced fully-automated biochemistry analyzers, 5-part hematology counters, and bidirectionally interfaced barcode systems, we maintain sample integrity and deliver verified digital reports on time.
                </p>
              </div>
            </div>

            {/* Right 5 Columns: Founder / Medical Director Profile Card */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="h-full bg-gradient-to-b from-[#F8FAFC] to-white rounded-3xl border-2 border-slate-200/90 hover:border-[#123B6D]/40 p-6 sm:p-7 shadow-lg flex flex-col justify-between relative group transition-all">
                {/* Director Badge */}
                <div className="absolute -top-3.5 right-6 bg-[#123B6D] text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Chief Medical Director &amp; Founder</span>
                </div>

                <div className="space-y-5">
                  {/* Photo & Identity Header */}
                  <div className="flex items-center gap-4 pt-1">
                    {/* Founder Real Photo */}
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-md bg-slate-100">
                        <img
                          src="/src/assets/images/founder_pathologist_1790345211989.jpg"
                          alt="Dr. R. K. Sharma - Founder & Chief Medical Director"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold" title="Verified Pathologist">
                        ✓
                      </span>
                    </div>

                    {/* Name, Degrees, AIIMS Gold Medalist */}
                    <div className="space-y-1 min-w-0">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F766E] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>AIIMS Gold Medalist</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-[#123B6D] leading-tight truncate">
                        Dr. R. K. Sharma
                      </h3>
                      <div className="text-xs font-bold text-slate-800">
                        MBBS, MD (Pathology)
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Chief Pathologist &bull; 18+ Years Clinical Experience
                      </div>
                    </div>
                  </div>

                  {/* Founder's Message & Resolution */}
                  <div className="relative bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                    <span className="text-3xl text-blue-200 font-serif absolute -top-3 left-3 select-none pointer-events-none">
                      &ldquo;
                    </span>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#123B6D] flex items-center gap-1.5 pt-1">
                      <span>Message from Chief Medical Director</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      &ldquo;A pathology report is not merely numbers on paper; a doctor relies on it to prescribe life-saving medicine, and a patient trusts it with their health. At our laboratory, our sacred commitment is diagnostic accuracy, uncompromising sample purity, and delivering every report with complete transparency.&rdquo;
                    </p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-[#123B6D]">— Dr. R. K. Sharma</span>
                      <span className="text-slate-500 font-medium">Consultant Pathologist</span>
                    </div>
                  </div>

                  {/* Clinical Credentials List */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>MD Pathology from AIIMS &bull; Senior Resident Ex-Fellow</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Fellow of Indian College of Pathologists (FICP)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Lead Auditor for NABL / ISO 15189 Quality Systems</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: QUALIFIED TEAM SECTION (Pathologists, Biochemists & Senior Lab Technicians) */}
      <section id="doctors" className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 text-[#123B6D] text-xs font-black mb-3 border border-blue-200/80 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-blue-700" />
              <span>Qualified Clinical &amp; Laboratory Team</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B6D] tracking-tight">
              Our Medical &amp; Laboratory Experts
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Experienced Pathologists, Biochemists &amp; Senior Technicians ensuring accurate diagnostics and timely reports.
            </p>
          </div>

          {/* Qualified Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {((vendorDoctors && vendorDoctors.length > 0)
              ? vendorDoctors
              : DEFAULT_ALL_VENDOR_DOCTORS.filter((d) => isTenantMatch(d, vendorLabSettings?.labId || selectedVendorLabId || 'lab-apex')).length > 0
              ? DEFAULT_ALL_VENDOR_DOCTORS.filter((d) => isTenantMatch(d, vendorLabSettings?.labId || selectedVendorLabId || 'lab-apex'))
              : DEFAULT_ALL_VENDOR_DOCTORS.slice(0, 3)
            ).map((doc, idx) => {
              // Doctor values with robust fallbacks
              const docName = doc.name || 'Medical Specialist';
              const docQualification = doc.qualification || doc.degrees || 'MBBS, MD (Pathology)';
              const docSpeciality =
                doc.specialization ||
                doc.specialty ||
                doc.specialExpertise ||
                doc.designation ||
                doc.roleCategory ||
                'Clinical Pathology & Diagnostics';

              // Clean experience for side badge
              const docExp = doc.experience || '';
              const expMatch = docExp.match(/(\d+\+?\s*(?:years?|yrs?))/i);
              const cleanExp = expMatch
                ? `${expMatch[1]} Exp`
                : docExp
                ? docExp.length > 15
                  ? docExp.split('•').pop()?.trim() || docExp
                  : docExp
                : '';

              // Fallback image based on role
              let fallbackImg = '/src/assets/images/team_pathologist_woman_1790345423035.jpg';
              if (doc.roleCategory === 'Biochemist' || docSpeciality.toLowerCase().includes('biochem')) {
                fallbackImg = '/src/assets/images/team_biochemist_1790345449541.jpg';
              } else if (doc.roleCategory === 'Phlebotomist' || docSpeciality.toLowerCase().includes('phlebotom')) {
                fallbackImg = '/src/assets/images/team_phlebotomist_1790345465190.jpg';
              } else if (doc.roleCategory === 'Technician' || docSpeciality.toLowerCase().includes('technic')) {
                fallbackImg = '/src/assets/images/team_technologist_1790345481173.jpg';
              } else if (idx === 0) {
                fallbackImg = '/src/assets/images/founder_pathologist_1790345211989.jpg';
              }
              const displayImage = doc.imageUrl || fallbackImg;

              return (
                <div
                  key={doc.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-[#123B6D]/40 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
                >
                  {/* Top: Photo, Name & Experience Side Badge */}
                  <div className="flex items-start justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* 1. Image */}
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-2xs group-hover:border-[#123B6D] transition-colors bg-slate-100">
                          <img
                            src={displayImage}
                            alt={docName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <span
                          className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black border-2 border-white shadow-2xs"
                          title="Verified Specialist"
                        >
                          ✓
                        </span>
                      </div>

                      {/* 2. Name */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-sm sm:text-base text-[#123B6D] leading-snug group-hover:text-blue-700 transition">
                          {docName}
                        </h3>
                      </div>
                    </div>

                    {/* 5. Experience (Side me chhota sa badge) */}
                    {cleanExp && (
                      <span className="shrink-0 text-[10px] sm:text-[11px] font-bold text-[#123B6D] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shadow-2xs whitespace-nowrap mt-0.5">
                        ⏱️ {cleanExp}
                      </span>
                    )}
                  </div>

                  {/* Bottom: 3. Qualification + 4. Speciality */}
                  <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
                    {/* Qualification */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-slate-400 font-medium shrink-0">Qualification:</span>
                      <span className="font-bold text-slate-800 break-words">
                        {docQualification}
                      </span>
                    </div>

                    {/* Speciality */}
                    <div className="flex items-baseline gap-1.5 text-[#0F766E]">
                      <span className="text-slate-400 font-medium shrink-0">Speciality:</span>
                      <span className="font-bold text-[#0F766E] break-words">
                        {docSpeciality}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Minimal Contact Us Section */}
      <section id="contact" className="py-12 sm:py-16 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-8">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Get In Touch</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B6D] tracking-tight">
              Contact Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Connect with our laboratory desk or submit an inquiry form below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Side: 5 Minimal Contact Lines */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5">
              {/* 1. Line: WhatsApp Number (may be multi) */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Number</span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                    {whatsappNumberList.map((num, idx) => {
                      const clean = num.replace(/\D/g, '');
                      return (
                        <a
                          key={idx}
                          href={`https://wa.me/91${clean}?text=${encodeURIComponent(`Hello ${labName}, I would like to inquire about tests & services.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
                        >
                          <span>+91 {num}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 2. Line: Call Number (maybe multi) */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#123B6D] border border-blue-200/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Call Number</span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                    {callNumberList.map((num, idx) => {
                      const clean = num.replace(/\D/g, '');
                      return (
                        <a
                          key={idx}
                          href={`tel:+91${clean}`}
                          className="text-xs sm:text-sm font-bold text-[#123B6D] hover:underline inline-flex items-center gap-1"
                        >
                          <span>+91 {num}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Line: Email ID */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Email ID</span>
                  <a
                    href={`mailto:${labEmail}`}
                    className="text-xs sm:text-sm font-bold text-slate-800 hover:text-[#123B6D] hover:underline mt-0.5 block break-all"
                  >
                    {labEmail}
                  </a>
                </div>
              </div>

              {/* 4. Line: Address in text only (not google location) */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Address</span>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 mt-0.5 leading-relaxed">
                    {labAddress}
                  </p>
                </div>
              </div>

              {/* 5. Line: Social Media Small Icons */}
              <div className="flex items-start gap-3.5 pt-3 border-t border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Social Media</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={stickyWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp"
                      className="w-7 h-7 rounded-full bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-200 hover:border-emerald-300 flex items-center justify-center transition shadow-2xs hover:scale-105"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Facebook"
                      className="w-7 h-7 rounded-full bg-white hover:bg-blue-50 text-[#1877F2] border border-slate-200 hover:border-blue-300 flex items-center justify-center transition shadow-2xs hover:scale-105"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                      className="w-7 h-7 rounded-full bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 flex items-center justify-center transition shadow-2xs hover:scale-105"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Twitter / X"
                      className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-400 flex items-center justify-center transition shadow-2xs hover:scale-105"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="YouTube"
                      className="w-7 h-7 rounded-full bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-300 flex items-center justify-center transition shadow-2xs hover:scale-105"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn"
                      className="w-7 h-7 rounded-full bg-white hover:bg-sky-50 text-[#0A66C2] border border-slate-200 hover:border-sky-300 flex items-center justify-center transition shadow-2xs hover:scale-105"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form (name, phone, subject, message) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
              <h3 className="text-base sm:text-lg font-bold text-[#123B6D] mb-1">
                Send Us a Message
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Leave your details below and our diagnostic coordinator will assist you.
              </p>

              {contactSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">Message Sent Successfully!</h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      Thank you, <span className="font-bold">{contactName}</span>. Your message regarding{' '}
                      <span className="font-semibold">"{contactSubject || 'General Inquiry'}"</span> has been received.
                    </p>
                    <p className="text-[11px] font-mono text-emerald-700 mt-1">
                      Reference Token: {contactRefId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactName('');
                      setContactPhone('');
                      setContactSubject('');
                      setContactMessage('');
                    }}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 underline cursor-pointer pt-1 block mx-auto"
                  >
                    Submit Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {contactError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{contactError}</span>
                    </div>
                  )}

                  {/* 1. Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                      />
                    </div>
                  </div>

                  {/* 2. Phone & 3. Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="text-xs font-bold text-slate-400 absolute left-3 top-2">+91</span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="98765 43210"
                          className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="e.g. Test Inquiry, Pricing"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                      />
                    </div>
                  </div>

                  {/* 4. Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Write your message or inquiry..."
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="w-full bg-[#123B6D] hover:bg-[#0e2f57] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-75 active:scale-99"
                  >
                    {contactSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Footer — 5 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 text-xs text-slate-600">
            {/* Column 1: Lab Info (Lab Name + ID + Contact Number) */}
            <div className="space-y-3.5 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5">
                {labLogoUrl ? (
                  <img
                    src={labLogoUrl}
                    alt={labName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#123B6D] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    <span className="text-amber-400">{labName.charAt(0) || 'A'}</span>
                    {labName.split(' ')[1]?.charAt(0) || 'L'}
                  </div>
                )}
                <div>
                  <span className="font-extrabold text-[#123B6D] text-sm block leading-tight">{labName}</span>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold border border-slate-200">
                      ID: {labShopId}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold border border-emerald-200">
                      NABL
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-slate-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#123B6D] shrink-0" />
                  <a href={`tel:+91${cleanPhone}`} className="hover:text-[#123B6D] font-bold text-xs">
                    +91 {labPhone}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <a href={stickyWhatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 font-bold text-xs text-emerald-700">
                    WhatsApp: +91 {cleanWhatsapp}
                  </a>
                </div>

                {labAddress && (
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-500 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#123B6D] shrink-0 mt-0.5" />
                    <span>{labAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Main Menu */}
            <div>
              <h4 className="font-extrabold text-[#123B6D] mb-4 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>Main Menu</span>
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('top') || document.getElementById('main-website-header');
                      el ? el.scrollIntoView({ behavior: 'smooth' }) : window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#123B6D] hover:font-bold transition cursor-pointer text-slate-600 text-left"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <a
                    href="#packages"
                    className="hover:text-[#123B6D] hover:font-bold transition text-slate-600 block"
                  >
                    Packages
                  </a>
                </li>
                <li>
                  <a
                    href="#book-test-section"
                    className="hover:text-[#123B6D] hover:font-bold transition text-slate-600 block"
                  >
                    Tests
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="hover:text-[#123B6D] hover:font-bold transition text-slate-600 block"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#doctors"
                    className="hover:text-[#123B6D] hover:font-bold transition text-slate-600 block"
                  >
                    Team
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-[#123B6D] hover:font-bold transition text-slate-600 block"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Quick Access */}
            <div>
              <h4 className="font-extrabold text-[#123B6D] mb-4 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>Quick Access</span>
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    type="button"
                    onClick={() => handleCheckReport()}
                    className="hover:text-[#123B6D] text-teal-700 font-bold flex items-center gap-1.5 cursor-pointer text-left transition"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>Download Report</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsPaymentQrModalOpen(true)}
                    className="hover:text-[#123B6D] hover:font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer text-left transition"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Lab Payment UPI QR</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsWebsiteQrModalOpen(true)}
                    className="hover:text-[#123B6D] hover:font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer text-left transition"
                  >
                    <QrCode className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Website QR (Lab Website QR)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal & Policy */}
            <div>
              <h4 className="font-extrabold text-[#123B6D] mb-4 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>Legal &amp; Policy</span>
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    type="button"
                    onClick={() => openPolicyModal('terms')}
                    className="hover:text-[#123B6D] hover:font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer text-left transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Terms &amp; Conditions</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openPolicyModal('privacy')}
                    className="hover:text-[#123B6D] hover:font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer text-left transition"
                  >
                    <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openPolicyModal('refund')}
                    className="hover:text-[#123B6D] hover:font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer text-left transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Refund &amp; Cancellation Policy</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 5: Login / Portal */}
            <div>
              <h4 className="font-extrabold text-[#123B6D] mb-4 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>Login / Portal</span>
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    type="button"
                    onClick={handleOpenAdmin}
                    className="hover:text-[#123B6D] hover:font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer text-left transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                    <span>Admin Login</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleOpenReception}
                    className="hover:text-[#123B6D] hover:font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer text-left transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0"></span>
                    <span>Reception Login</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleOpenTechnician}
                    className="hover:text-[#123B6D] hover:font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer text-left transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                    <span>Technician Login</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span>© {new Date().getFullYear()} {labName}. All Rights Reserved.</span>
            </div>
            <div className="flex items-center gap-2 font-medium flex-wrap">
              <span>Powered by</span>
              <a
                href="https://indianlalaji.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#123B6D] hover:underline font-black"
              >
                indianlalaji.com
              </a>
              <span className="text-slate-300">|</span>
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

      {/* Terms & Conditions / Privacy / Refund Policy Modal */}
      <VendorPolicyModal
        isOpen={isPolicyModalOpen || isTermsModalOpen}
        onClose={() => {
          setIsPolicyModalOpen(false);
          setIsTermsModalOpen(false);
        }}
        activeTab={policyModalTab}
        onSelectTab={setPolicyModalTab}
        labName={labName}
        labPhone={labPhone}
        labEmail={labEmail}
      />

      {/* Website QR Modal */}
      {isWebsiteQrModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="website-qr-modal-title"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setIsWebsiteQrModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 relative shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsWebsiteQrModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close Website QR Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 id="website-qr-modal-title" className="text-base font-extrabold text-slate-900 leading-tight mb-1">
              Official Website QR Code
            </h3>
            <p className="text-xs text-slate-500 mb-4 line-clamp-1">
              {labName}
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 shadow-inner flex flex-col items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(websiteDirectUrl)}`}
                alt={`${labName} Website QR`}
                className="w-48 h-48 rounded-xl object-contain bg-white p-2 border border-slate-200 shadow-xs"
              />
              <span className="text-[11px] font-semibold text-slate-500 mt-2 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                Scan to open vendor lab website
              </span>
            </div>

            <div className="w-full bg-slate-50 rounded-xl p-2.5 border border-slate-200 mb-4 flex items-center justify-between text-xs font-mono text-slate-700">
              <span className="truncate pr-2 select-all">{websiteDirectUrl}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(websiteDirectUrl);
                  setCopiedWebsiteUrl(true);
                  setTimeout(() => setCopiedWebsiteUrl(false), 2000);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition flex items-center gap-1 cursor-pointer"
              >
                {copiedWebsiteUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebsiteUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 text-xs">
              <a
                href={websiteDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span>Visit Link</span>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Visit ${labName} Website: ${websiteDirectUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share QR</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Test Information & Fasting Preparation Modal */}
      {selectedTestInfoModal && (() => {
        const details = getTestDetails(selectedTestInfoModal);
        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-info-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setSelectedTestInfoModal(null)}
          >
            <div
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#123B6D] flex items-center justify-center text-base">
                    🧪
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded font-bold">
                      {details.code}
                    </span>
                    <h2 id="test-info-modal-title" className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                      {selectedTestInfoModal.name}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTestInfoModal(null)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center text-lg font-bold transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
                {/* Fasting & Preparation Alert */}
                <div className={`p-4 rounded-2xl border ${
                  details.isFastingRequired
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1">
                    <span className="text-base">{details.isFastingRequired ? '⚠️' : '✅'}</span>
                    <span>Preparation / तैयारी: {details.isFastingRequired ? '10-12 Hours Fasting Required' : 'No Fasting Required (Normal Diet)'}</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90 pl-6">
                    {details.fastingDetail}
                  </p>
                </div>

                {/* Clinical Usage / किस काम आता है */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Clinical Significance &amp; Usage (टेस्ट का उपयोग):</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">
                    {details.clinicalUse}
                  </p>
                </div>

                {/* Key Specimen & Report Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Sample Type (सैंपल)
                    </span>
                    <span className="font-bold text-slate-800 text-xs">{details.sample}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Turnaround Time (रिपोर्ट समय)
                    </span>
                    <span className="font-bold text-emerald-700 text-xs">⏱️ {details.turnaround}</span>
                  </div>
                </div>

                {/* Pricing & Discount */}
                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Special Offer Fee</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl font-black text-[#123B6D]">₹{details.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{details.mrp}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                    Save {details.discount}%
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleWhatsAppBooking(selectedTestInfoModal.name, details.price);
                    setSelectedTestInfoModal(null);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075e54] font-bold text-xs border border-[#25D366]/30 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp Booking</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTestInfoModal(null)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const test = selectedTestInfoModal;
                      setSelectedTestInfoModal(null);
                      setSelectedTestOrPackage(`${test.name} (₹${details.price})`);
                      setIsBookingModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#123B6D] hover:bg-[#0e2c52] text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                    <span>Book Test Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Admin Hero Banner Upload & Management Modal */}
      {isBannerManagerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="banner-manager-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setIsBannerManagerOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-[#123B6D] to-[#1E4E8C] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h2 id="banner-manager-modal-title" className="text-base font-extrabold leading-tight">
                    Manage Hero Photo Banners (Admin)
                  </h2>
                  <p className="text-[11px] text-blue-100">
                    Upload photos from your computer/phone or enter image web links
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBannerManagerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Notice Banner */}
              {bannerSaveNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{bannerSaveNotice}</span>
                </div>
              )}

              {/* Upload Input Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Device File Upload */}
                <div
                  className="p-4 rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 transition text-center flex flex-col items-center justify-center space-y-2 cursor-pointer"
                  onClick={() => bannerFileInputRef.current?.click()}
                >
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileUpload}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#123B6D] flex items-center justify-center shadow-2xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#123B6D] block">
                      Upload from Computer / Mobile
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Supports JPG, PNG, WebP (Max 5MB)
                    </span>
                  </div>
                </div>

                {/* 2. Web Image URL Input */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Or Paste Image URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/banner.jpg"
                      value={newBannerInputUrl}
                      onChange={(e) => setNewBannerInputUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBannerUrl();
                        }
                      }}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#123B6D]"
                    />
                    <button
                      type="button"
                      onClick={handleAddBannerUrl}
                      disabled={!newBannerInputUrl.trim()}
                      className="px-3 py-1.5 rounded-xl bg-[#123B6D] text-white text-xs font-bold hover:bg-[#0e2c52] disabled:opacity-50 transition cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Recommended dimension: 1600×700 or 1200×600
                  </span>
                </div>
              </div>

              {/* Current Banners Grid Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Current Active Banners ({tempBannersList.length})</span>
                  <button
                    type="button"
                    onClick={handleResetDefaultBanners}
                    className="text-[#0F766E] hover:underline cursor-pointer text-[11px]"
                  >
                    Reset to Default Images
                  </button>
                </div>

                {tempBannersList.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400">
                    No banners added. Please upload at least one photo banner.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tempBannersList.map((url, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[16/9] shadow-2xs"
                      >
                        <img
                          src={url}
                          alt={`Banner ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white font-mono text-[10px] font-bold">
                          #{idx + 1}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveBanner(idx)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition cursor-pointer active:scale-90"
                          title="Remove this banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsBannerManagerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveBanners}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save &amp; Publish Banners</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
