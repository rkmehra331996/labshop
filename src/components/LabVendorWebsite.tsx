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
import { useCms } from '../context/CmsContext';
import { updateDocumentMetadata, generateDefaultOgImage } from '../utils/seo';
import { Language } from '../types';
import { OnlineTestBookingModal } from './vendor/OnlineTestBookingModal';
import { HeroBookingForm } from './vendor/HeroBookingForm';
import { LabWelcomeFirstScreen } from './vendor/LabWelcomeFirstScreen';
import { TermsConditionsModal } from './TermsConditionsModal';
import { getTenantWebsiteUrl, getTenantSubdomain, getTenantBrowserUrl, SUPER_ADMIN_DOMAIN } from '../constants/domains';
import { isTenantMatch } from '../utils/tenantSecurity';

export interface LabGalleryItem {
  id: string;
  title: string;
  category: 'Equipment' | 'Phlebotomy' | 'Facility' | 'Quality';
  tag: string;
  description: string;
  image: string;
}

export const LAB_GALLERY_ITEMS: LabGalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Sysmex Automated 5-Part Hematology Cell Counter',
    category: 'Equipment',
    tag: 'Automated CBC Testing',
    description: 'Precision automated cell counter delivering complete blood counts with fluorescent flow cytometry flags.',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gal-2',
    title: 'Roche Cobas Immunoassay & Biochemistry Platform',
    category: 'Equipment',
    tag: 'Clinical Chemistry',
    description: 'Electrochemiluminescence technology for liver, kidney, hormonal, and cardiac biomarker diagnostics.',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gal-3',
    title: 'Vacuum-Sealed Sterile Vacutainer Tubes',
    category: 'Phlebotomy',
    tag: 'Safe Blood Collection',
    description: 'Color-coded EDTA, fluoride, and gel-separator vacutainer collection tubes preventing pre-analytical errors.',
    image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gal-4',
    title: 'High-Resolution Binocular Clinical Microscope',
    category: 'Equipment',
    tag: 'Morphology & Histology',
    description: 'Equipped with plan-achromatic optics for peripheral blood smear examination and cytology analysis.',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gal-5',
    title: 'Sterile Phlebotomy Blood Collection Chair',
    category: 'Phlebotomy',
    tag: 'Patient Comfort',
    description: 'Ergonomic blood collection chair with adjustable armrests ensuring comfortable and safe venipuncture.',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gal-6',
    title: 'Cold-Chain Temperature Controlled Transport Carrier',
    category: 'Phlebotomy',
    tag: 'Temperature 2°C–8°C',
    description: 'Insulated sample boxes with calibrated gel ice packs maintaining specimen integrity during transit.',
    image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gal-7',
    title: 'Air-Conditioned Patient Reception & Waiting Lounge',
    category: 'Facility',
    tag: 'Comfort & Cleanliness',
    description: 'Hygienic, comfortable waiting area with real-time digital token display and drinking water amenities.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gal-8',
    title: 'Senior Clinical Pathologist Review Bench',
    category: 'Quality',
    tag: 'NABL Verification',
    description: 'Each report is cross-checked against clinical history and delta checks before applying the digital signature.',
    image: 'https://images.unsplash.com/photo-1583912267670-6575ad472688?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gal-9',
    title: 'Precision Micro-Pipetting & Serology Setup',
    category: 'Equipment',
    tag: 'Microliter Accuracy',
    description: 'Multi-channel micropipettes calibrated weekly with gravimetric checks for allergy and serology tests.',
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gal-10',
    title: 'Class II Biosafety Laminar Airflow Cabinet',
    category: 'Quality',
    tag: 'Sterile Processing',
    description: 'HEPA filtration protecting lab personnel and infectious samples during culture & microbiological processing.',
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gal-11',
    title: 'Automated Barcode Generation & UHID Tracking Station',
    category: 'Quality',
    tag: 'Zero Sample Mix-up',
    description: 'Thermal barcoded labels printed instantaneously at the registration counter linked to the cloud database.',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gal-12',
    title: 'Digital Consultation & WhatsApp Dispatch Desk',
    category: 'Facility',
    tag: 'Instant Delivery',
    description: 'Dedicated client support desk for inquiries, doctor consultation coordination, and report printouts.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
  },
];

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
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<any | null>(null);
  const [galleryCategory, setGalleryCategory] = useState<'All' | 'Equipment' | 'Phlebotomy' | 'Facility' | 'Quality'>('All');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [selectedQrType, setSelectedQrType] = useState<'counter' | 'home'>('counter');

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
              href="#gallery"
              className="hover:text-[#123B6D] transition text-slate-700 hover:font-bold whitespace-nowrap py-1"
              id="vendor-nav-gallery"
            >
              Gallery
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

            {/* Desktop Lab Staff / Admin Login Button */}
            <button
              onClick={() => openLoginModal('vendor')}
              className="hidden lg:inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-[#123B6D] hover:bg-[#0e2c52] text-white font-bold text-xs transition cursor-pointer shadow-2xs shrink-0 active:scale-98"
              id="header-lab-login-btn"
              title="Lab Admin, Receptionist & Technician Login"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Login</span>
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

                {/* Scrollable Navigation Links (Home, Packages, Tests, About, Team, Gallery, Contact) */}
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

                  {/* 6. Gallery */}
                  <a
                    href="#gallery"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 transition flex items-center gap-3 text-slate-800 font-bold cursor-pointer"
                  >
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">🖼️</span>
                    <span>Gallery (12 Photos)</span>
                  </a>

                  {/* 7. Contact */}
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

      {/* SECTION 1: HERO SECTION (Admin Uploaded Image Banners Carousel with 2%-5% Mobile Peek Effect) */}
      <section id="top" className="bg-gradient-to-b from-[#F8FAFC] via-slate-50 to-white py-3.5 sm:py-6 border-b border-slate-200 scroll-mt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 space-y-3.5 sm:space-y-5">
          {/* Admin Header Action Strip */}
          <div className="flex items-center justify-between px-2 sm:px-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">
                100% NABL Accredited Diagnostics • Free Doorstep Collection
              </span>
            </div>

            {/* Admin Upload Banner Button */}
            <button
              type="button"
              onClick={openBannerManager}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#123B6D] border border-blue-200 shadow-2xs text-xs font-black transition cursor-pointer active:scale-95"
              id="admin-upload-banner-btn"
              title="Admin: Upload or change Hero Banner photos"
            >
              <Upload className="w-3.5 h-3.5 text-[#123B6D]" />
              <span>Upload Banner (Admin)</span>
            </button>
          </div>

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

          {/* Main 2-Column Grid: Lab Story & Mission + Founder / Director Profile Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left 7 Columns: Lab Story, Foundation, NABL/ISO, and Mission */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              {/* Lab Story & Foundation */}
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
                      Established in {currentLabItem?.establishedYear || 2012} &bull; Over a Decade of Trusted Pathology
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Founded in <strong>{currentLabItem?.establishedYear || 2012}</strong>, <strong>{labName}</strong> was established with a singular focus: to bridge the gap between advanced medical science and patient-centric healthcare in India. From a modest routine testing center, our laboratory has grown into a premier clinical pathology reference facility trusted by thousands of families and top consulting doctors.
                </p>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We operate in strict compliance with <strong>ISO 15189:2022</strong> and <strong>NABL (National Accreditation Board for Testing and Calibration Laboratories)</strong> standards (Accreditation No: <span className="font-mono font-bold text-[#123B6D]">{labNabl}</span>). Every specimen undergoes rigorous 3-tier internal quality controls (IQC) and participating International External Quality Assessment Schemes (EQAS).
                </p>
              </div>

              {/* Lab Mission & Core Values */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 hover:border-blue-300 transition">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                    🎯
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#123B6D]">Our Mission (हमारा मिशन)</h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    To deliver clinical reports of utmost accuracy with rapid turnaround, ensuring early diagnosis, personalized treatments, and accessible healthcare for every citizen.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 hover:border-emerald-300 transition">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    ⭐
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-emerald-900">100% NABL Quality Verification</h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    Zero sample mix-up with automated two-way LIS barcode interfacing, vacuum blood collection, and secondary verification by senior pathologists.
                  </p>
                </div>
              </div>

              {/* Key Highlights Strip */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-xl sm:text-2xl font-black text-[#123B6D]">{currentLabItem?.establishedYear || 2012}</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5">Year Established</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-xl sm:text-2xl font-black text-emerald-700">ISO 15189</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5">Accreditation Standard</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-xl sm:text-2xl font-black text-amber-600">2,50,000+</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5">Patients Served</div>
                </div>
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

                  {/* Founder's Vision Message & Pledge of Accuracy */}
                  <div className="relative bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                    <span className="text-3xl text-blue-200 font-serif absolute -top-3 left-3 select-none pointer-events-none">
                      &ldquo;
                    </span>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#123B6D] flex items-center gap-1.5 pt-1">
                      <span>Founder&apos;s Vision &amp; Resolution for Accuracy</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      &ldquo;A pathology report is not merely numbers on paper; a doctor relies on it to prescribe life-saving medicine, and a patient trusts it with their health. At our laboratory, our sacred resolution (संकल्प) is zero-error diagnosis, uncompromising sample purity, and delivering every report with complete transparency.&rdquo;
                    </p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-[#123B6D]">— Dr. R. K. Sharma</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Zero-Error Resolution
                      </span>
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

                {/* Director Consultation CTA */}
                <div className="pt-5 mt-4 border-t border-slate-200/90 flex flex-col sm:flex-row items-center gap-2">
                  <a
                    href={`https://wa.me/91${cleanWhatsapp}?text=${encodeURIComponent(
                      `Hello Dr. Sharma / ${labName}, I would like to request expert pathologist consultation for my laboratory test report.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075e54] font-bold text-xs border border-[#25D366]/30 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp Doctor Desk</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTestOrPackage(
                        vendorPackages[0] ? `${vendorPackages[0].name} (₹${vendorPackages[0].priceINR})` : 'Comprehensive Health Checkup (₹999)'
                      );
                      setIsBookingModalOpen(true);
                    }}
                    className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-[#123B6D] hover:bg-[#0e2c52] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span>Book Checkup Now</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
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
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 text-[#123B6D] text-xs font-black mb-3 border border-blue-200/80 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-blue-700" />
              <span>Qualified Clinical &amp; Laboratory Team</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#123B6D] tracking-tight">
              Experienced Pathologists, Biochemists &amp; Senior Technicians
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
              लैब के अनुभवी पैथोलॉजिस्ट्स, बायोकेमिस्ट्स और सीनियर लैब टेक्नीशियन्स — Every test sample undergoes rigorous multi-tier verification before digital sign-off and dispatch.
            </p>
          </div>

          {/* Qualified Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {vendorDoctors.map((doc, idx) => {
              // Fallback image based on role
              let fallbackImg = '/src/assets/images/team_pathologist_woman_1790345423035.jpg';
              if (doc.roleCategory === 'Biochemist' || doc.specialization?.toLowerCase().includes('biochem')) {
                fallbackImg = '/src/assets/images/team_biochemist_1790345449541.jpg';
              } else if (doc.roleCategory === 'Phlebotomist' || doc.specialization?.toLowerCase().includes('phlebotom')) {
                fallbackImg = '/src/assets/images/team_phlebotomist_1790345465190.jpg';
              } else if (doc.roleCategory === 'Technician' || doc.specialization?.toLowerCase().includes('technic')) {
                fallbackImg = '/src/assets/images/team_technologist_1790345481173.jpg';
              } else if (idx === 0) {
                fallbackImg = '/src/assets/images/founder_pathologist_1790345211989.jpg';
              }
              const displayImage = doc.imageUrl || fallbackImg;

              const roleBadgeColor =
                doc.roleCategory === 'Pathologist'
                  ? 'bg-blue-100 text-blue-900 border-blue-200'
                  : doc.roleCategory === 'Biochemist'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                  : doc.roleCategory === 'Phlebotomist'
                  ? 'bg-amber-100 text-amber-900 border-amber-200'
                  : 'bg-purple-100 text-purple-900 border-purple-200';

              return (
                <div
                  key={doc.id || idx}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-[#123B6D]/50 p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top Bar Accent */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#123B6D] via-[#0F766E] to-blue-500 opacity-90 group-hover:h-2 transition-all" />

                  <div>
                    {/* Photo + Designation Badge Container */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Doctor / Staff Photo in Medical Coat */}
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md group-hover:border-[#123B6D] transition-colors bg-slate-100">
                          <img
                            src={displayImage}
                            alt={doc.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs" title="NABL Verified Clinician">
                          ✓
                        </span>
                      </div>

                      {/* Name, Degrees & Designation */}
                      <div className="min-w-0 flex-1">
                        <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${roleBadgeColor} mb-1`}>
                          {doc.roleCategory || 'Clinical Specialist'}
                        </span>
                        <h3 className="font-black text-base sm:text-lg text-[#123B6D] leading-snug group-hover:text-blue-700 transition truncate">
                          {doc.name}
                        </h3>
                        <div className="text-xs font-bold text-slate-800 line-clamp-1">
                          {doc.degrees}
                        </div>
                        <div className="text-[11px] font-semibold text-[#0F766E] mt-0.5 line-clamp-1">
                          {doc.designation || doc.specialization}
                        </div>
                      </div>
                    </div>

                    {/* Experience & Qualification Highlights */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 mb-3.5 text-xs">
                      {/* Experience */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold text-[11px]">Experience:</span>
                        <span className="font-extrabold text-[#123B6D] bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                          ⏱️ {doc.experience}
                        </span>
                      </div>

                      {/* Special Qualification */}
                      {doc.qualification && (
                        <div className="flex items-start justify-between gap-1 pt-1 border-t border-slate-200/60 text-[11px]">
                          <span className="text-slate-400 font-semibold shrink-0">Credentials:</span>
                          <span className="font-bold text-slate-700 text-right line-clamp-1" title={doc.qualification}>
                            🎓 {doc.qualification}
                          </span>
                        </div>
                      )}

                      {/* Special Expertise */}
                      {doc.specialExpertise && (
                        <div className="flex items-start justify-between gap-1 pt-1 border-t border-slate-200/60 text-[11px]">
                          <span className="text-slate-400 font-semibold shrink-0">Specialty:</span>
                          <span className="font-bold text-emerald-800 text-right line-clamp-1" title={doc.specialExpertise}>
                            🔬 {doc.specialExpertise}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Short Clinical Bio */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
                      {doc.bio}
                    </p>
                  </div>

                  {/* Card Bottom: WhatsApp Consult & Booking Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`https://wa.me/91${cleanWhatsapp}?text=${encodeURIComponent(
                        `Hello ${doc.name} (${labName}), I would like to consult regarding a lab report / diagnostic guidance.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075e54] font-bold text-xs border border-[#25D366]/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
                      title="Chat on WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp Consult</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTestOrPackage(
                          vendorPackages[0] ? `${vendorPackages[0].name} (₹${vendorPackages[0].priceINR})` : 'Comprehensive Diagnostic Panel (₹999)'
                        );
                        setIsBookingModalOpen(true);
                      }}
                      className="py-2 px-3 rounded-xl bg-[#123B6D] hover:bg-[#0e2c52] text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                      title="Book Test Online"
                    >
                      <span>Book Test</span>
                      <ArrowRight className="w-3 h-3 text-amber-300" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Banner Under Team Grid */}
          <div className="mt-12 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#123B6D]">
                  Dual-Doctor Verification for Critical &amp; Panic Value Reports
                </h4>
                <p className="text-slate-500 mt-0.5">
                  Any abnormal, critical, or panic value is immediately re-tested on a backup analyzer and reviewed by two qualified pathologists prior to dispatch.
                </p>
              </div>
            </div>

            <a
              href={`tel:${cleanPhone}`}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-[#123B6D]" />
              <span>Direct Doctor Line: +91 {cleanPhone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 8. Laboratory & Infrastructure Photo Gallery Section (12 High-Res Photos) */}
      <section id="gallery" className="py-16 sm:py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>NABL Certified Diagnostic Center Tour</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B6D] tracking-tight">
              Laboratory &amp; Pathology Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Take a visual tour of our advanced clinical chemistry analyzers, sterile phlebotomy stations, temperature-controlled cold-chain sample logistics, and patient consultation lounge.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {(['All', 'Equipment', 'Phlebotomy', 'Facility', 'Quality'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setGalleryCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer active:scale-95 ${
                    galleryCategory === cat
                      ? 'bg-[#123B6D] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat === 'All' ? 'All Photos (12)' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* 12 Image Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {LAB_GALLERY_ITEMS.filter(
              (item) => galleryCategory === 'All' || item.category === galleryCategory
            ).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedGalleryImage(item)}
                className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col"
              >
                {/* Photo with Overlay Zoom */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />
                  
                  {/* Category Badge */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-slate-900 shadow-2xs">
                    {item.category}
                  </span>

                  {/* Zoom Trigger Button */}
                  <div className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 inline-block mb-1">
                      {item.tag}
                    </span>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug group-hover:text-[#123B6D] transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick CTA inside Gallery */}
          <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-teal-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#123B6D] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Strict ISO 15189 Quality Protocol &amp; NABL Accreditation
                </h4>
                <p className="text-xs text-slate-500">
                  All equipment calibrated daily with commercial controls and verified by qualified technologists.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedTestOrPackage(
                  vendorPackages[0] ? `${vendorPackages[0].name} (₹${vendorPackages[0].priceINR})` : 'Full Body Health Checkup (₹999)'
                );
                setIsBookingModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#123B6D] hover:bg-[#0e2c52] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>Book Test at this Lab</span>
            </button>
          </div>
        </div>

        {/* Gallery Image Lightbox Modal */}
        {selectedGalleryImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setSelectedGalleryImage(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedGalleryImage(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[60vh] overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={selectedGalleryImage.image}
                  alt={selectedGalleryImage.title}
                  className="w-full max-h-[60vh] object-cover"
                />
              </div>

              <div className="p-5 sm:p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-full">
                    {selectedGalleryImage.category}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {selectedGalleryImage.tag}
                  </span>
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  {selectedGalleryImage.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedGalleryImage.description}
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedGalleryImage(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 9. Dedicated Contact Us & Lab Location Section */}
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
      <section id="download-report-footer" className="py-12 bg-slate-900 text-white scroll-mt-20">
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

      {/* Terms & Conditions Modal */}
      <TermsConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

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
