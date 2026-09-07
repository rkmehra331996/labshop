import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CmsUser,
  LabStaffAccount,
  CompanySettings,
  PricingPlan,
  CompanyFeature,
  CompanyFaq,
  CompanyStat,
  VendorLabSettings,
  VendorPackage,
  VendorDoctor,
  VendorBranch,
  HomeCollectionBooking,
  TestItem,
  LabReport,
  VendorLabDirectoryItem,
  ReceptionPatientEntry,
  PortalWebsiteSections,
  VendorWebsiteSections,
  VendorStatus,
} from '../types';
import { MOCK_TESTS, FAQ_LIST, SAMPLE_REPORT, INITIAL_REPORTS, VENDOR_LABS_DIRECTORY, INITIAL_RECEPTION_ENTRIES } from '../data/mockData';

export const DEFAULT_VENDOR_SECTIONS: VendorWebsiteSections = {
  announcementBar: true,
  header: true,
  hero: true,
  dashboardsShowcase: true,
  packages: true,
  testDirectory: true,
  whyChooseUs: true,
  doctors: true,
  branches: true,
  reportInterlink: true,
  footer: true,
};

export const DEFAULT_PORTAL_SECTIONS: PortalWebsiteSections = {
  hero: true,
  trustStrip: true,
  problemSection: true,
  solutionSection: true,
  workflow: true,
  features: true,
  offline: true,
  patientPortal: true,
  vendorWebsitesShowcase: true,
  reportPreview: true,
  whatsapp: true,
  testLibrary: true,
  multiBranch: true,
  staffRoles: true,
  patientHistory: true,
  dataSafety: true,
  security: true,
  auditLog: true,
  indianMarket: true,
  pricing: true,
  demo: true,
  finalCta: true,
  faq: true,
  footer: true,
};

// --- INITIAL DEFAULTS ---
const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'LABNAME.COM',
  tagline: 'Modern Pathology Laboratory & Diagnostic Operating System',
  heroBadge: 'NABL ISO 15189 Ready • Made for India',
  heroTitle: 'Run Your Pathology Lab on Autopilot',
  heroSubtitle:
    'Complete Diagnostic Lab OS: Offline-ready desktop billing, 500+ pre-configured tests, automated WhatsApp PDF reports, multi-branch control, and instant patient results portal without login.',
  supportPhone: '+91 7087033009',
  supportEmail: 'contact@labname.com',
  announcementText: '🚀 Version 3.4 Live: Instant UPI QR Dynamic Billing & Auto WhatsApp Dispatch Added!',
};

const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan-single',
    name: 'Single Laboratory',
    target: 'Independent Diagnostic & Pathology Centers',
    monthlyPriceINR: 1499,
    yearlyPriceINR: 1199,
    description: 'Everything needed to digitize an independent pathology collection & testing lab.',
    isPopular: false,
    features: [
      'Unlimited Patients & Test Entries',
      'Offline Desktop App (Syncs when connected)',
      'WhatsApp PDF Reports with QR Code',
      '500+ Pre-Configured Test Library',
      'UPI QR Dynamic Payment Billing',
      'Patient Online Report Portal (No Login)',
      'NABL Formatted Header & Signatures',
    ],
  },
  {
    id: 'plan-multi',
    name: 'Multi-Branch Lab Network',
    target: 'Central Reference Labs & Collection Centers',
    monthlyPriceINR: 2999,
    yearlyPriceINR: 2399,
    description: 'Designed for diagnostic chains with central processing hubs and multiple sample collection desks.',
    isPopular: true,
    features: [
      'Up to 5 Branches / Collection Desks',
      'Centralized Real-Time HQ Analytics',
      'Role-Based Staff Access (Phlebo, Reception, MD)',
      'B2B Referral Doctor Commission Tracker',
      'Analyzer Interfacing Protocol Support',
      'Emergency High-Priority Sample Alerts',
      'Dedicated Indian Phone & WhatsApp Support',
    ],
  },
];

const DEFAULT_COMPANY_FEATURES: CompanyFeature[] = [
  {
    id: 'feat-1',
    title: 'Offline-First Billing & Entry',
    description: 'Never pause billing when broadband drops. Work offline and sync automatically.',
    category: 'Core Architecture',
    badge: 'USP 1',
  },
  {
    id: 'feat-2',
    title: 'Instant WhatsApp Delivery',
    description: 'Patients get verified NABL PDF reports directly on WhatsApp within 10 seconds of verification.',
    category: 'Patient Experience',
    badge: 'Popular',
  },
  {
    id: 'feat-3',
    title: '500+ Pre-Loaded Test Catalog',
    description: 'Hematology, Biochemistry, Hormones, and Urine tests ready with standard biological reference intervals.',
    category: 'Clinical Excellence',
  },
  {
    id: 'feat-4',
    title: 'Passwordless Patient Portal',
    description: 'Patients view and download reports simply with their 10-digit phone or Report ID.',
    category: 'Digital Reach',
  },
];

const DEFAULT_COMPANY_FAQS: CompanyFaq[] = FAQ_LIST.map((faq, idx) => ({
  id: `faq-${idx + 1}`,
  question: faq.q,
  answer: faq.a,
  category: 'General',
}));

const DEFAULT_COMPANY_STATS: CompanyStat[] = [
  { id: 'stat-1', label: 'Diagnostic Labs Digitized', value: '500+', subtext: 'Across 28 Indian States' },
  { id: 'stat-2', label: 'Turnaround Time Saved', value: '45 mins', subtext: 'Faster per patient' },
  { id: 'stat-3', label: 'Patient WhatsApp Delivered', value: '1.2M+', subtext: 'Digital PDF Reports' },
  { id: 'stat-4', label: 'System Uptime & Sync', value: '99.99%', subtext: 'Tier-4 Indian Datacenter' },
];

// --- VENDOR (APEX DIAGNOSTICS) DEFAULTS ---
const DEFAULT_VENDOR_LAB_SETTINGS: VendorLabSettings = {
  labShopId: 'LSP-7087',
  labName: 'Apex Diagnostic & Clinical Pathology Laboratory',
  name: 'Apex Diagnostic & Clinical Pathology Laboratory',
  tagline: 'Advanced Pathology, Biochemistry & Diagnostic Testing Centre',
  description: 'Advanced Pathology, Biochemistry & Diagnostic Testing Centre. 100% NABL Accredited & Certified. Instant digital WhatsApp PDF reports & doorstep sample collection.',
  logoUrl: '',
  websiteUrl: 'https://apexdiagnostics.labname.com',
  ogImageUrl: '',
  phone: '7087033009',
  helplinePhone: '+91 7087033009',
  whatsapp: '917087033009',
  nablAccreditationNo: 'MC-4821',
  nablNumber: 'MC-4821',
  isoCert: 'ISO 9001:2015 & ISO 15189 Compliant',
  openingHours: 'Open 7:00 AM – 9:00 PM (All 7 Days)',
  address: 'SCF 42-43, Sector 18-C, Central Healthcare Complex, Ludhiana',
  heroPromoText: 'Free Home Sample Collection Across City • Report on WhatsApp in 6 Hours',
  emergencyHours: '24x7 Emergency Services at Central Lab',
  announcementText: '🌟 Special Notice: Free Blood Glucose and Hemoglobin checkup on Saturday morning!',
  email: 'care@apexdiagnostics.in',
  domainPreview: 'apexdiagnostics.labname.com',
  merchantName: 'Apex Diagnostic Lab Pvt Ltd',
  upiId1: 'apexlab@icici',
  qrCode1Label: 'Counter Billing QR (Google Pay / PhonePe / Paytm / BHIM)',
  qrCode1Url: '',
  upiId2: 'apexdiag@oksbi',
  qrCode2Label: 'Home Sample Collection QR (Phlebotomist Handheld)',
  qrCode2Url: '',
  sections: DEFAULT_VENDOR_SECTIONS,
};

const DEFAULT_VENDOR_PACKAGES: VendorPackage[] = [
  {
    id: 'pkg-1',
    name: 'Full Body Health Checkup',
    testsCount: 68,
    description: 'Complete screen covering Liver, Kidney, Thyroid, Heart, Complete Blood Count, and Blood Sugar.',
    priceINR: 999,
    mrpINR: 2499,
    isPopular: true,
    features: [
      'Complete Hemogram (CBC + ESR - 24 tests)',
      'Liver Function Test (LFT - 11 tests)',
      'Kidney Function Test (KFT - 9 tests)',
      'Lipid Profile (Cholesterol & Triglycerides - 8 tests)',
      'Thyroid Profile (TSH)',
      'Fasting Blood Glucose (Sugar)',
      'Urine Routine & Microscopic Examination (14 tests)',
    ],
  },
  {
    id: 'pkg-2',
    name: 'Comprehensive Diabetic Care',
    testsCount: 22,
    description: 'Designed for diabetic and pre-diabetic patients to assess quarterly sugar control and organ health.',
    priceINR: 599,
    mrpINR: 1450,
    isPopular: false,
    features: [
      'HbA1c (Glycosylated Hemoglobin) with estimated average glucose',
      'Fasting Blood Sugar & Post Prandial (PP)',
      'Urine Microalbumin / Creatinine Ratio',
      'Kidney Function Screening (Creatinine, Urea, Uric Acid)',
      'Lipid Risk Assessment',
    ],
  },
  {
    id: 'pkg-3',
    name: 'Senior Citizen Health Profile',
    testsCount: 84,
    description: 'Comprehensive health monitoring for age 50+, with special focus on cardiac risk, bones, and vitamins.',
    priceINR: 1499,
    mrpINR: 3800,
    isPopular: false,
    features: [
      'Everything in Full Body Health Checkup (68 tests)',
      'Vitamin D3 (25-OH) & Vitamin B12 Levels',
      'Serum Calcium & Alkaline Phosphatase (Bone Health)',
      'High Sensitivity CRP (hs-CRP) for Heart Risk',
      'Serum Electrolytes (Sodium, Potassium, Chloride)',
      'Doctor Consultation & Diet Advice Included',
    ],
  },
];

const DEFAULT_VENDOR_DOCTORS: VendorDoctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Rajesh Sharma',
    degrees: 'MBBS, MD (Pathology)',
    specialization: 'Chief Consultant Pathologist',
    experience: 'Ex-AIIMS • 18+ Years Experience',
    bio: 'Specialist in hematopathology, surgical pathology, and automated biochemistry quality assurance.',
    avatarEmoji: '👨‍⚕️',
  },
  {
    id: 'doc-2',
    name: 'Dr. Meenakshi Sundaram',
    degrees: 'MBBS, MD (Microbiology)',
    specialization: 'Head of Quality & Microbiology',
    experience: 'CMC Ludhiana • 14+ Years Experience',
    bio: 'Oversees antimicrobial resistance profiling, serological diagnostics, and NABL internal quality checks.',
    avatarEmoji: '👩‍⚕️',
  },
  {
    id: 'doc-3',
    name: 'Dr. Arunava Ghosh',
    degrees: 'PhD (Clinical Biochemistry)',
    specialization: 'Senior Clinical Biochemist',
    experience: 'NABL Lead Assessor • 12+ Years Experience',
    bio: 'Specialist in hormonal assays, thyroid profiles, tumor markers, and HPLC chromatography analysis.',
    avatarEmoji: '👨‍🔬',
  },
];

const DEFAULT_VENDOR_BRANCHES: VendorBranch[] = [
  {
    id: 'branch-1',
    name: 'Apex Central Diagnostic Hub',
    badge: 'Central Reference Lab',
    address: 'SCF 42-43, Sector 18-C, Central Healthcare Complex',
    phone: '+91 7087033009',
    timings: 'Open 24x7 (Round the Clock Testing)',
    isEmergency: true,
  },
  {
    id: 'branch-2',
    name: 'Model Town Collection Centre',
    badge: 'Collection Desk',
    address: 'Shop 14, Main Market, Opp. Metro Pillar 42',
    phone: '+91 7087033009',
    timings: 'Mon–Sun: 7:00 AM – 9:00 PM',
  },
  {
    id: 'branch-3',
    name: 'Civil Lines Diagnostic Desk',
    badge: 'Hospital Branch',
    address: 'Near Gate 2, District Civil Hospital Road',
    phone: '+91 7087033009',
    timings: 'Mon–Sun: 7:00 AM – 8:00 PM',
  },
];

const DEFAULT_VENDOR_BOOKINGS: HomeCollectionBooking[] = [
  {
    id: 'book-101',
    patientName: 'Sunita Mehra',
    mobile: '9876543210',
    address: 'Flat 402, Green Valley Apartments, Sector 21',
    timeSlot: 'Tomorrow: 7:00 AM - 9:00 AM',
    packageOrTest: 'Full Body Health Checkup (₹999)',
    status: 'Phlebotomist Assigned',
    createdAt: 'Today, 08:30 AM',
  },
  {
    id: 'book-102',
    patientName: 'Baldev Singh',
    mobile: '9814012345',
    address: 'House No 128, Phase 7, Mohali',
    timeSlot: 'Tomorrow: 8:30 AM - 10:30 AM',
    packageOrTest: 'Complete Diabetic Care Profile (₹599)',
    status: 'Pending',
    createdAt: 'Today, 09:15 AM',
  },
  {
    id: 'book-103',
    patientName: 'Ananya Verma',
    mobile: '9988776655',
    address: 'H-34, Model Town, Near Gurudwara',
    timeSlot: 'Today: Urgent Collection',
    packageOrTest: 'Thyroid Profile & CBC (₹600)',
    status: 'Sample Collected',
    createdAt: 'Today, 07:45 AM',
  },
];

export const DEFAULT_STAFF_ACCOUNTS: LabStaffAccount[] = [
  {
    id: 'staff-reception-1',
    name: 'Pooja Verma',
    role: 'reception',
    username: 'reception@apexlab.com',
    phone: '+91 98765 11223',
    password: 'reception123',
    status: 'active',
    lastPasswordReset: '01 Sep 2026, 10:30 AM',
    shift: 'Morning & Afternoon Shift (8:00 AM - 4:00 PM)',
    notes: 'Primary reception desk token generation, patient billing & fee collection',
  },
  {
    id: 'staff-tech-1',
    name: 'Amit Khurana (DMLT)',
    role: 'technician',
    username: 'technician@apexlab.com',
    phone: '+91 98765 44556',
    password: 'tech123',
    status: 'active',
    lastPasswordReset: '01 Sep 2026, 11:15 AM',
    shift: 'Full Day Diagnostic Shift (9:00 AM - 6:00 PM)',
    notes: 'Senior laboratory technician in charge of Hematology, Biochemistry & Analyzer verification',
  },
];

// --- CMS CONTEXT INTERFACE ---
interface CmsContextType {
  currentUser: CmsUser | null;
  login: (role: 'admin' | 'technician' | 'reception' | 'vendor', email?: string, password?: string) => boolean;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  targetLoginRole: 'admin' | 'technician' | 'reception' | 'vendor' | null;
  openLoginModal: (role?: 'admin' | 'technician' | 'reception' | 'vendor') => void;

  // Lab Staff Credentials (Lab Owner creates & resets Reception & Technician)
  staffAccounts: LabStaffAccount[];
  addStaffAccount: (staff: Omit<LabStaffAccount, 'id'>) => void;
  updateStaffAccount: (id: string, updates: Partial<LabStaffAccount>) => void;
  resetStaffPassword: (id: string, newPassword: string) => void;
  deleteStaffAccount: (id: string) => void;

  // Company CMS
  companySettings: CompanySettings;
  updateCompanySettings: (newSettings: Partial<CompanySettings>) => void;
  portalSections: PortalWebsiteSections;
  updatePortalSection: (sectionKey: keyof PortalWebsiteSections, enabled: boolean) => void;
  toggleAllPortalSections: (enabled: boolean) => void;
  pricingPlans: PricingPlan[];
  addPricingPlan: (plan: Omit<PricingPlan, 'id'>) => void;
  updatePricingPlan: (id: string, plan: Partial<PricingPlan>) => void;
  deletePricingPlan: (id: string) => void;
  companyFeatures: CompanyFeature[];
  addCompanyFeature: (feature: Omit<CompanyFeature, 'id'>) => void;
  updateCompanyFeature: (id: string, feature: Partial<CompanyFeature>) => void;
  deleteCompanyFeature: (id: string) => void;
  companyFaqs: CompanyFaq[];
  addCompanyFaq: (faq: Omit<CompanyFaq, 'id'>) => void;
  updateCompanyFaq: (id: string, faq: Partial<CompanyFaq>) => void;
  deleteCompanyFaq: (id: string) => void;
  companyStats: CompanyStat[];
  updateCompanyStat: (id: string, stat: Partial<CompanyStat>) => void;

  // Vendor Lab CMS
  vendorLabSettings: VendorLabSettings;
  updateVendorLabSettings: (newSettings: Partial<VendorLabSettings>) => void;
  vendorPackages: VendorPackage[];
  addVendorPackage: (pkg: Omit<VendorPackage, 'id'>) => void;
  updateVendorPackage: (id: string, pkg: Partial<VendorPackage>) => void;
  deleteVendorPackage: (id: string) => void;
  vendorTests: TestItem[];
  addVendorTest: (test: Omit<TestItem, 'id'>) => void;
  updateVendorTest: (id: string, test: Partial<TestItem>) => void;
  deleteVendorTest: (id: string) => void;
  vendorDoctors: VendorDoctor[];
  addVendorDoctor: (doc: Omit<VendorDoctor, 'id'>) => void;
  updateVendorDoctor: (id: string, doc: Partial<VendorDoctor>) => void;
  deleteVendorDoctor: (id: string) => void;
  vendorBranches: VendorBranch[];
  addVendorBranch: (branch: Omit<VendorBranch, 'id'>) => void;
  updateVendorBranch: (id: string, branch: Partial<VendorBranch>) => void;
  deleteVendorBranch: (id: string) => void;
  vendorBookings: HomeCollectionBooking[];
  addHomeCollectionBooking: (
    booking: Omit<HomeCollectionBooking, 'id' | 'createdAt' | 'status'>
  ) => void;
  updateBookingStatus: (id: string, status: HomeCollectionBooking['status']) => void;
  deleteBooking: (id: string) => void;

  // Multi-Vendor Labs Directory & Switching
  selectedVendorLabId: string;
  selectVendorLab: (labId: string) => void;
  vendorLabsList: VendorLabDirectoryItem[];
  addVendorLab: (vendor: Omit<VendorLabDirectoryItem, 'id'>) => VendorLabDirectoryItem;
  updateVendorLab: (id: string, updates: Partial<VendorLabDirectoryItem>) => void;
  deleteVendorLab: (id: string) => void;
  setVendorStatus: (id: string, status: VendorStatus) => void;

  // Vendor Website Sections
  updateVendorSection: (sectionKey: keyof VendorWebsiteSections, enabled: boolean) => void;
  toggleAllVendorSections: (enabled: boolean) => void;

  // Lab Reports Store
  reports: LabReport[];
  addLabReport: (report: LabReport) => void;
  updateLabReport: (reportId: string, updated: Partial<LabReport>) => void;
  deleteLabReport: (reportId: string) => void;
  cancelLabReport: (reportId: string, reason: string, cancelledBy?: string) => void;
  uncancelLabReport: (reportId: string) => void;
  getReportById: (id: string) => LabReport | undefined;
  getReportByMobile: (mobile: string) => LabReport | undefined;

  // Reception Desk Patients Store
  receptionEntries: ReceptionPatientEntry[];
  addReceptionEntry: (entry: Omit<ReceptionPatientEntry, 'id'>) => ReceptionPatientEntry;
  updateReceptionStatus: (id: string, status: ReceptionPatientEntry['status']) => void;
  updateReceptionEntry: (id: string, updates: Partial<ReceptionPatientEntry>) => void;
  deleteReceptionEntry: (id: string) => void;
  clearReceptionEntries: () => void;
  sendEntryToTechnician: (id: string) => void;
  acceptEntryByTechnician: (id: string) => void;
  completeTechnicianReport: (id: string, reportId: string) => void;

  // Reset demo
  resetAllToDefaults: () => void;
}

const CmsContext = createContext<CmsContextType | null>(null);

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<CmsUser | null>(() => {
    try {
      const saved = localStorage.getItem('cms_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [targetLoginRole, setTargetLoginRole] = useState<'admin' | 'technician' | 'reception' | 'vendor' | null>(null);

  // Company State
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem('cms_company_settings');
      return saved ? JSON.parse(saved) : DEFAULT_COMPANY_SETTINGS;
    } catch {
      return DEFAULT_COMPANY_SETTINGS;
    }
  });

  const [portalSections, setPortalSections] = useState<PortalWebsiteSections>(() => {
    try {
      const saved = localStorage.getItem('cms_portal_sections');
      return saved ? { ...DEFAULT_PORTAL_SECTIONS, ...JSON.parse(saved) } : DEFAULT_PORTAL_SECTIONS;
    } catch {
      return DEFAULT_PORTAL_SECTIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cms_portal_sections', JSON.stringify(portalSections));
    } catch {}
  }, [portalSections]);

  const updatePortalSection = (sectionKey: keyof PortalWebsiteSections, enabled: boolean) => {
    setPortalSections((prev) => ({ ...prev, [sectionKey]: enabled }));
  };

  const toggleAllPortalSections = (enabled: boolean) => {
    setPortalSections((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as (keyof PortalWebsiteSections)[]).forEach((k) => {
        updated[k] = enabled;
      });
      return updated;
    });
  };

  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(() => {
    try {
      const saved = localStorage.getItem('cms_pricing_plans');
      return saved ? JSON.parse(saved) : DEFAULT_PRICING_PLANS;
    } catch {
      return DEFAULT_PRICING_PLANS;
    }
  });

  const [companyFeatures, setCompanyFeatures] = useState<CompanyFeature[]>(() => {
    try {
      const saved = localStorage.getItem('cms_company_features');
      return saved ? JSON.parse(saved) : DEFAULT_COMPANY_FEATURES;
    } catch {
      return DEFAULT_COMPANY_FEATURES;
    }
  });

  const [companyFaqs, setCompanyFaqs] = useState<CompanyFaq[]>(() => {
    try {
      const saved = localStorage.getItem('cms_company_faqs');
      return saved ? JSON.parse(saved) : DEFAULT_COMPANY_FAQS;
    } catch {
      return DEFAULT_COMPANY_FAQS;
    }
  });

  const [companyStats, setCompanyStats] = useState<CompanyStat[]>(() => {
    try {
      const saved = localStorage.getItem('cms_company_stats');
      return saved ? JSON.parse(saved) : DEFAULT_COMPANY_STATS;
    } catch {
      return DEFAULT_COMPANY_STATS;
    }
  });

  // Vendor State
  const [vendorLabSettings, setVendorLabSettings] = useState<VendorLabSettings>(() => {
    try {
      const saved = localStorage.getItem('cms_vendor_lab_settings');
      return saved ? JSON.parse(saved) : DEFAULT_VENDOR_LAB_SETTINGS;
    } catch {
      return DEFAULT_VENDOR_LAB_SETTINGS;
    }
  });

  const [vendorPackages, setVendorPackages] = useState<VendorPackage[]>(() => {
    try {
      const saved = localStorage.getItem('cms_vendor_packages');
      return saved ? JSON.parse(saved) : DEFAULT_VENDOR_PACKAGES;
    } catch {
      return DEFAULT_VENDOR_PACKAGES;
    }
  });

  const [vendorTests, setVendorTests] = useState<TestItem[]>(() => {
    try {
      const saved = localStorage.getItem('cms_vendor_tests');
      return saved ? JSON.parse(saved) : MOCK_TESTS;
    } catch {
      return MOCK_TESTS;
    }
  });

  const [vendorDoctors, setVendorDoctors] = useState<VendorDoctor[]>(() => {
    try {
      const saved = localStorage.getItem('cms_vendor_doctors');
      return saved ? JSON.parse(saved) : DEFAULT_VENDOR_DOCTORS;
    } catch {
      return DEFAULT_VENDOR_DOCTORS;
    }
  });

  const [vendorBranches, setVendorBranches] = useState<VendorBranch[]>(() => {
    try {
      const saved = localStorage.getItem('cms_vendor_branches');
      return saved ? JSON.parse(saved) : DEFAULT_VENDOR_BRANCHES;
    } catch {
      return DEFAULT_VENDOR_BRANCHES;
    }
  });

  const [vendorBookings, setVendorBookings] = useState<HomeCollectionBooking[]>(() => {
    try {
      const saved = localStorage.getItem('cms_vendor_bookings');
      return saved ? JSON.parse(saved) : DEFAULT_VENDOR_BOOKINGS;
    } catch {
      return DEFAULT_VENDOR_BOOKINGS;
    }
  });

  const [reports, setReports] = useState<LabReport[]>(() => {
    try {
      const saved = localStorage.getItem('cms_lab_reports');
      return saved ? JSON.parse(saved) : INITIAL_REPORTS;
    } catch {
      return INITIAL_REPORTS;
    }
  });

  // Save to LocalStorage effects
  useEffect(() => {
    try {
      localStorage.setItem('cms_lab_reports', JSON.stringify(reports));
    } catch {}
  }, [reports]);

  const addLabReport = (report: LabReport) => {
    setReports((prev) => [report, ...prev.filter((r) => r.reportId !== report.reportId)]);
  };

  const updateLabReport = (reportId: string, updated: Partial<LabReport>) => {
    setReports((prev) =>
      prev.map((r) => (r.reportId.toLowerCase() === reportId.toLowerCase() ? { ...r, ...updated } : r))
    );
  };

  const deleteLabReport = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.reportId.toLowerCase() !== reportId.toLowerCase()));
    setReceptionEntries((prev) =>
      prev.map((e) =>
        e.reportId?.toLowerCase() === reportId.toLowerCase()
          ? { ...e, reportId: undefined, status: 'In Lab', technicianStatus: 'Accepted' }
          : e
      )
    );
  };

  const cancelLabReport = (reportId: string, reason: string, cancelledBy: string = 'Lab Technician') => {
    const timeStr = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setReports((prev) =>
      prev.map((r) =>
        r.reportId.toLowerCase() === reportId.toLowerCase()
          ? {
              ...r,
              isCancelled: true,
              status: 'Cancelled',
              cancellationReason: reason,
              cancelledAt: timeStr,
              cancelledBy,
            }
          : r
      )
    );
  };

  const uncancelLabReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.reportId.toLowerCase() === reportId.toLowerCase()
          ? {
              ...r,
              isCancelled: false,
              status: r.verified ? 'Verified' : 'Normal',
              cancellationReason: undefined,
              cancelledAt: undefined,
              cancelledBy: undefined,
            }
          : r
      )
    );
  };

  const getReportById = (id: string) => {
    return reports.find((r) => r.reportId.toLowerCase() === id.toLowerCase());
  };

  const getReportByMobile = (mobile: string) => {
    const clean = mobile.replace(/\D/g, '');
    if (!clean) return undefined;
    return reports.find((r) => {
      const rClean = r.mobile.replace(/\D/g, '');
      return rClean.includes(clean) || clean.includes(rClean);
    });
  };

  // Reception Desk Patients Store
  const [receptionEntries, setReceptionEntries] = useState<ReceptionPatientEntry[]>(() => {
    try {
      const saved = localStorage.getItem('cms_reception_entries');
      const rawList = saved ? JSON.parse(saved) : INITIAL_RECEPTION_ENTRIES;
      const list = Array.isArray(rawList) ? rawList : INITIAL_RECEPTION_ENTRIES;
      return list.filter(Boolean).map((e: any, idx: number) => {
        const token = String(e?.tokenNumber || e?.tokenNo || `TK-${101 + idx}`);
        return {
          ...e,
          tokenNumber: token,
          tokenNo: token,
        };
      });
    } catch {
      return INITIAL_RECEPTION_ENTRIES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cms_reception_entries', JSON.stringify(receptionEntries));
    } catch {}
  }, [receptionEntries]);

  const addReceptionEntry = (entry: Omit<ReceptionPatientEntry, 'id'>): ReceptionPatientEntry => {
    const tokenVal = String(entry.tokenNumber || entry.tokenNo || `TK-${Math.floor(100 + Math.random() * 900)}`);
    const newEntry: ReceptionPatientEntry = {
      ...entry,
      tokenNumber: tokenVal,
      tokenNo: tokenVal,
      id: `rcp-${Date.now()}`,
    };
    setReceptionEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const updateReceptionStatus = (id: string, status: ReceptionPatientEntry['status']) => {
    setReceptionEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  const updateReceptionEntry = (id: string, updates: Partial<ReceptionPatientEntry>) => {
    setReceptionEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteReceptionEntry = (id: string) => {
    setReceptionEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const clearReceptionEntries = () => {
    setReceptionEntries([]);
  };

  const sendEntryToTechnician = (id: string) => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setReceptionEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              sentToTechnician: true,
              technicianStatus: 'Sent to Lab',
              status: e.status === 'Waiting' ? 'Sample Collected' : e.status,
              sentToLabAt: `Today, ${timeStr}`,
            }
          : e
      )
    );
  };

  const acceptEntryByTechnician = (id: string) => {
    setReceptionEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              technicianStatus: 'Accepted',
              status: 'In Lab',
            }
          : e
      )
    );
  };

  const completeTechnicianReport = (id: string, reportId: string) => {
    setReceptionEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              technicianStatus: 'Report Generated',
              status: 'Report Ready',
              reportId: reportId,
            }
          : e
      )
    );
  };

  // Save to LocalStorage effects
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('cms_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('cms_current_user');
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_company_settings', JSON.stringify(companySettings));
    } catch {}
  }, [companySettings]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_pricing_plans', JSON.stringify(pricingPlans));
    } catch {}
  }, [pricingPlans]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_company_features', JSON.stringify(companyFeatures));
    } catch {}
  }, [companyFeatures]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_company_faqs', JSON.stringify(companyFaqs));
    } catch {}
  }, [companyFaqs]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_company_stats', JSON.stringify(companyStats));
    } catch {}
  }, [companyStats]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_vendor_lab_settings', JSON.stringify(vendorLabSettings));
    } catch {}
  }, [vendorLabSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_vendor_packages', JSON.stringify(vendorPackages));
    } catch {}
  }, [vendorPackages]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_vendor_tests', JSON.stringify(vendorTests));
    } catch {}
  }, [vendorTests]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_vendor_doctors', JSON.stringify(vendorDoctors));
    } catch {}
  }, [vendorDoctors]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_vendor_branches', JSON.stringify(vendorBranches));
    } catch {}
  }, [vendorBranches]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_vendor_bookings', JSON.stringify(vendorBookings));
    } catch {}
  }, [vendorBookings]);

  // Lab Staff Accounts State (Reception & Technician managed by Lab Owner)
  const [staffAccounts, setStaffAccounts] = useState<LabStaffAccount[]>(() => {
    try {
      const saved = localStorage.getItem('cms_lab_staff_accounts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STAFF_ACCOUNTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cms_lab_staff_accounts', JSON.stringify(staffAccounts));
    } catch {}
  }, [staffAccounts]);

  const resetStaffPassword = (id: string, newPassword: string) => {
    const now = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setStaffAccounts((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, password: newPassword, lastPasswordReset: now } : s
      )
    );
  };

  const updateStaffAccount = (id: string, updates: Partial<LabStaffAccount>) => {
    setStaffAccounts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const addStaffAccount = (staff: Omit<LabStaffAccount, 'id'>) => {
    const now = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const newStaff: LabStaffAccount = {
      ...staff,
      id: `staff-${Date.now()}`,
      lastPasswordReset: now,
    };
    setStaffAccounts((prev) => [...prev, newStaff]);
  };

  const deleteStaffAccount = (id: string) => {
    setStaffAccounts((prev) => prev.filter((s) => s.id !== id));
  };

  // Auth actions
  const login = (role: 'admin' | 'technician' | 'reception' | 'vendor', email?: string, _password?: string): boolean => {
    if (role === 'reception') {
      const staff = staffAccounts.find((s) => s.role === 'reception');
      const user: CmsUser = {
        id: staff?.id || 'usr-reception-1',
        name: staff ? `${staff.name} (Front Desk)` : 'Pooja Verma (Front Desk)',
        email: email || staff?.username || 'reception@apexlab.com',
        role: 'reception',
        entityName: `${vendorLabSettings.labName} (Reception Desk)`,
      };
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      return true;
    } else if (role === 'technician') {
      const staff = staffAccounts.find((s) => s.role === 'technician');
      const user: CmsUser = {
        id: staff?.id || 'usr-tech-1',
        name: staff ? `${staff.name} (Lab Technician)` : 'Amit Khurana (Lab Technician)',
        email: email || staff?.username || 'technician@apexlab.com',
        role: 'technician',
        entityName: `${vendorLabSettings.labName} (Diagnostic Workstation)`,
      };
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      return true;
    } else if (role === 'admin') {
      const user: CmsUser = {
        id: 'usr-admin-super',
        name: 'R. K. Mehra (Portal Website Owner / Super Admin)',
        email: email || 'rkmehra331996@gmail.com',
        role: 'admin',
        entityName: 'Diagnostic SaaS Portal Central System',
      };
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      return true;
    } else {
      const user: CmsUser = {
        id: 'usr-vendor-1',
        name: 'Dr. Rajesh Sharma (Lab Owner)',
        email: email || '9876543210',
        role: 'vendor',
        entityName: vendorLabSettings.labName,
      };
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      return true;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('cms_current_user');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('view') || url.searchParams.has('dashboard')) {
          url.searchParams.delete('view');
          url.searchParams.delete('dashboard');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }
      }
    } catch {}
  };

  const openLoginModal = (role?: 'admin' | 'technician' | 'reception' | 'vendor') => {
    setTargetLoginRole(role || null);
    setIsAuthModalOpen(true);
  };

  // Company CMS Actions
  const updateCompanySettings = (newSettings: Partial<CompanySettings>) => {
    setCompanySettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addPricingPlan = (plan: Omit<PricingPlan, 'id'>) => {
    const newPlan: PricingPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
    };
    setPricingPlans((prev) => [...prev, newPlan]);
  };

  const updatePricingPlan = (id: string, plan: Partial<PricingPlan>) => {
    setPricingPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...plan } : p)));
  };

  const deletePricingPlan = (id: string) => {
    setPricingPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const addCompanyFeature = (feature: Omit<CompanyFeature, 'id'>) => {
    const newFeat: CompanyFeature = {
      ...feature,
      id: `feat-${Date.now()}`,
    };
    setCompanyFeatures((prev) => [...prev, newFeat]);
  };

  const updateCompanyFeature = (id: string, feature: Partial<CompanyFeature>) => {
    setCompanyFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, ...feature } : f)));
  };

  const deleteCompanyFeature = (id: string) => {
    setCompanyFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const addCompanyFaq = (faq: Omit<CompanyFaq, 'id'>) => {
    const newFaq: CompanyFaq = {
      ...faq,
      id: `faq-${Date.now()}`,
    };
    setCompanyFaqs((prev) => [...prev, newFaq]);
  };

  const updateCompanyFaq = (id: string, faq: Partial<CompanyFaq>) => {
    setCompanyFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...faq } : f)));
  };

  const deleteCompanyFaq = (id: string) => {
    setCompanyFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const updateCompanyStat = (id: string, stat: Partial<CompanyStat>) => {
    setCompanyStats((prev) => prev.map((s) => (s.id === id ? { ...s, ...stat } : s)));
  };

  // Vendor Lab CMS Actions
  const updateVendorLabSettings = (newSettings: Partial<VendorLabSettings>) => {
    setVendorLabSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateVendorSection = (sectionKey: keyof VendorWebsiteSections, enabled: boolean) => {
    setVendorLabSettings((prev) => {
      const currentSections = prev.sections || DEFAULT_VENDOR_SECTIONS;
      return {
        ...prev,
        sections: {
          ...currentSections,
          [sectionKey]: enabled,
        },
      };
    });
  };

  const toggleAllVendorSections = (enabled: boolean) => {
    setVendorLabSettings((prev) => {
      const currentSections = { ...(prev.sections || DEFAULT_VENDOR_SECTIONS) };
      (Object.keys(currentSections) as (keyof VendorWebsiteSections)[]).forEach((k) => {
        currentSections[k] = enabled;
      });
      return {
        ...prev,
        sections: currentSections,
      };
    });
  };

  const addVendorPackage = (pkg: Omit<VendorPackage, 'id'>) => {
    const newPkg: VendorPackage = {
      ...pkg,
      id: `pkg-${Date.now()}`,
    };
    setVendorPackages((prev) => [newPkg, ...prev]);
  };

  const updateVendorPackage = (id: string, pkg: Partial<VendorPackage>) => {
    setVendorPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...pkg } : p)));
  };

  const deleteVendorPackage = (id: string) => {
    setVendorPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const addVendorTest = (test: Omit<TestItem, 'id'>) => {
    const newTest: TestItem = {
      ...test,
      id: `TST-${Date.now().toString().slice(-4)}`,
    };
    setVendorTests((prev) => [newTest, ...prev]);
  };

  const updateVendorTest = (id: string, test: Partial<TestItem>) => {
    setVendorTests((prev) => prev.map((t) => (t.id === id ? { ...t, ...test } : t)));
  };

  const deleteVendorTest = (id: string) => {
    setVendorTests((prev) => prev.filter((t) => t.id !== id));
  };

  const addVendorDoctor = (doc: Omit<VendorDoctor, 'id'>) => {
    const newDoc: VendorDoctor = {
      ...doc,
      id: `doc-${Date.now()}`,
    };
    setVendorDoctors((prev) => [...prev, newDoc]);
  };

  const updateVendorDoctor = (id: string, doc: Partial<VendorDoctor>) => {
    setVendorDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, ...doc } : d)));
  };

  const deleteVendorDoctor = (id: string) => {
    setVendorDoctors((prev) => prev.filter((d) => d.id !== id));
  };

  const addVendorBranch = (branch: Omit<VendorBranch, 'id'>) => {
    const newBranch: VendorBranch = {
      ...branch,
      id: `branch-${Date.now()}`,
    };
    setVendorBranches((prev) => [...prev, newBranch]);
  };

  const updateVendorBranch = (id: string, branch: Partial<VendorBranch>) => {
    setVendorBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...branch } : b)));
  };

  const deleteVendorBranch = (id: string) => {
    setVendorBranches((prev) => prev.filter((b) => b.id !== id));
  };

  const addHomeCollectionBooking = (
    booking: Omit<HomeCollectionBooking, 'id' | 'createdAt' | 'status'>
  ) => {
    const newBooking: HomeCollectionBooking = {
      ...booking,
      id: `book-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      createdAt: 'Just now',
    };
    setVendorBookings((prev) => [newBooking, ...prev]);
  };

  const updateBookingStatus = (id: string, status: HomeCollectionBooking['status']) => {
    setVendorBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const deleteBooking = (id: string) => {
    setVendorBookings((prev) => prev.filter((b) => b.id !== id));
  };

  // Multi-Vendor Labs Directory & Switching
  const [vendorLabsList, setVendorLabsList] = useState<VendorLabDirectoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('cms_vendor_labs_list');
      return saved ? JSON.parse(saved) : VENDOR_LABS_DIRECTORY;
    } catch {
      return VENDOR_LABS_DIRECTORY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cms_vendor_labs_list', JSON.stringify(vendorLabsList));
    } catch {}
  }, [vendorLabsList]);

  const addVendorLab = (vendor: Omit<VendorLabDirectoryItem, 'id'>): VendorLabDirectoryItem => {
    const newLab: VendorLabDirectoryItem = {
      ...vendor,
      id: `lab-${Date.now()}`,
    };
    setVendorLabsList((prev) => [newLab, ...prev]);
    return newLab;
  };

  const updateVendorLab = (id: string, updates: Partial<VendorLabDirectoryItem>) => {
    setVendorLabsList((prev) =>
      prev.map((lab) => (lab.id === id ? { ...lab, ...updates } : lab))
    );
  };

  const deleteVendorLab = (id: string) => {
    setVendorLabsList((prev) => prev.filter((lab) => lab.id !== id));
  };

  const setVendorStatus = (id: string, status: VendorStatus) => {
    setVendorLabsList((prev) =>
      prev.map((lab) => (lab.id === id ? { ...lab, status } : lab))
    );
  };

  const [selectedVendorLabId, setSelectedVendorLabId] = useState<string>('lab-apex');

  const selectVendorLab = (labId: string) => {
    const lab = vendorLabsList.find((l) => l.id === labId) || VENDOR_LABS_DIRECTORY.find((l) => l.id === labId);
    if (lab) {
      setSelectedVendorLabId(lab.id);
      const newSettings: VendorLabSettings = {
        labShopId: lab.id === 'lab-apex' ? 'LSP-7087' : `LSP-${lab.id.replace('lab-', '').toUpperCase().slice(0, 5)}-${lab.phone.replace(/[^0-9]/g, '').slice(-4)}`,
        labName: lab.name,
        name: lab.name,
        tagline: lab.tagline,
        description: lab.description || `${lab.tagline}. 100% NABL Accredited & Certified diagnostic pathology center. Instant WhatsApp PDF reports.`,
        logoUrl: lab.logoUrl || '',
        websiteUrl: lab.websiteUrl || `https://${lab.domainPreview || `${lab.id.replace('lab-', '')}.labname.com`}`,
        ogImageUrl: lab.ogImageUrl || '',
        domainPreview: lab.domainPreview || `${lab.id.replace('lab-', '')}.labname.com`,
        phone: lab.phone.replace(/[^0-9]/g, '').slice(-10),
        helplinePhone: lab.phone,
        whatsapp: '91' + lab.phone.replace(/[^0-9]/g, '').slice(-10),
        nablAccreditationNo: lab.nablCode,
        nablNumber: lab.nablCode,
        isoCert: 'ISO 9001:2015 & ISO 15189 Compliant',
        openingHours: lab.emergency
          ? 'Open 24x7 (Round-The-Clock Diagnostic Desk)'
          : 'Open 7:00 AM – 9:00 PM (All 7 Days)',
        address: lab.address,
        heroPromoText: 'Free Home Sample Collection Across City • Report on WhatsApp in 6 Hours',
        emergencyHours: lab.emergency
          ? '24x7 Emergency Blood Sample Processing Available'
          : 'Routine & Urgent Samples Accepted',
      };
      setVendorLabSettings(newSettings);
      try {
        localStorage.setItem('cms_vendor_lab_settings', JSON.stringify(newSettings));
      } catch {
        // ignore
      }
    }
  };

  // Reset to original demo defaults
  const resetAllToDefaults = () => {
    setCompanySettings(DEFAULT_COMPANY_SETTINGS);
    setPortalSections(DEFAULT_PORTAL_SECTIONS);
    setVendorLabsList(VENDOR_LABS_DIRECTORY);
    setPricingPlans(DEFAULT_PRICING_PLANS);
    setCompanyFeatures(DEFAULT_COMPANY_FEATURES);
    setCompanyFaqs(DEFAULT_COMPANY_FAQS);
    setCompanyStats(DEFAULT_COMPANY_STATS);

    setVendorLabSettings(DEFAULT_VENDOR_LAB_SETTINGS);
    setVendorPackages(DEFAULT_VENDOR_PACKAGES);
    setVendorTests(MOCK_TESTS);
    setVendorDoctors(DEFAULT_VENDOR_DOCTORS);
    setVendorBranches(DEFAULT_VENDOR_BRANCHES);
    setVendorBookings(DEFAULT_VENDOR_BOOKINGS);
    setReports([SAMPLE_REPORT]);
    setReceptionEntries(INITIAL_RECEPTION_ENTRIES);
    setStaffAccounts(DEFAULT_STAFF_ACCOUNTS);

    localStorage.clear();
  };

  return (
    <CmsContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        targetLoginRole,
        openLoginModal,

        staffAccounts,
        addStaffAccount,
        updateStaffAccount,
        resetStaffPassword,
        deleteStaffAccount,

        companySettings,
        updateCompanySettings,
        portalSections,
        updatePortalSection,
        toggleAllPortalSections,
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

        vendorLabSettings,
        updateVendorLabSettings,
        updateVendorSection,
        toggleAllVendorSections,
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
        addHomeCollectionBooking,
        updateBookingStatus,
        deleteBooking,

        selectedVendorLabId,
        selectVendorLab,
        vendorLabsList,
        addVendorLab,
        updateVendorLab,
        deleteVendorLab,
        setVendorStatus,

        reports,
        addLabReport,
        updateLabReport,
        deleteLabReport,
        cancelLabReport,
        uncancelLabReport,
        getReportById,
        getReportByMobile,

        receptionEntries,
        addReceptionEntry,
        updateReceptionStatus,
        updateReceptionEntry,
        deleteReceptionEntry,
        clearReceptionEntries,
        sendEntryToTechnician,
        acceptEntryByTechnician,
        completeTechnicianReport,

        resetAllToDefaults,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
