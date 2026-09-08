import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  AppView,
} from '../types';
import { MOCK_TESTS, FAQ_LIST, SAMPLE_REPORT, INITIAL_REPORTS, VENDOR_LABS_DIRECTORY, INITIAL_RECEPTION_ENTRIES } from '../data/mockData';
import { getPermissionsForRole, LAB_OPTIONS } from '../utils/rbac';
import { isTenantMatch, verifyTenantOwnership, stampTenant } from '../utils/tenantSecurity';

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
    labId: 'lab-apex',
    name: 'Apex Central Diagnostic Hub',
    badge: 'Central Reference Lab',
    address: 'SCF 42-43, Sector 18-C, Central Healthcare Complex',
    phone: '+91 7087033009',
    timings: 'Open 24x7 (Round the Clock Testing)',
    isEmergency: true,
  },
  {
    id: 'branch-2',
    labId: 'lab-apex',
    name: 'Model Town Collection Centre',
    badge: 'Collection Desk',
    address: 'Shop 14, Main Market, Opp. Metro Pillar 42',
    phone: '+91 7087033009',
    timings: 'Mon–Sun: 7:00 AM – 9:00 PM',
  },
  {
    id: 'branch-3',
    labId: 'lab-apex',
    name: 'Civil Lines Diagnostic Desk',
    badge: 'Hospital Branch',
    address: 'Near Gate 2, District Civil Hospital Road',
    phone: '+91 7087033009',
    timings: 'Mon–Sun: 7:00 AM – 8:00 PM',
  },
  // CityCare Branches (lab-citycare)
  {
    id: 'branch-cc-1',
    labId: 'lab-citycare',
    name: 'CityCare Phase 7 Diagnostic Hub',
    badge: 'Main Lab & Scanning Center',
    address: 'SCO 14, Phase 7, Near Fortis Chowk, Mohali',
    phone: '+91 9815012345',
    timings: 'Mon–Sat: 7:00 AM – 9:00 PM',
    isEmergency: true,
  },
  {
    id: 'branch-cc-2',
    labId: 'lab-citycare',
    name: 'Phase 3B2 Collection Desk',
    badge: 'Collection Centre',
    address: 'Shop 8, Market 3B2, Mohali',
    phone: '+91 9815012345',
    timings: 'Mon–Sun: 7:30 AM – 8:00 PM',
  },
  // MetroPath Branches (lab-metropath)
  {
    id: 'branch-mp-1',
    labId: 'lab-metropath',
    name: 'MetroPath Sector 34-A Super Specialty Hub',
    badge: 'Reference & Molecular Lab',
    address: 'SCO 128-129, Sector 34-A, Healthcare District, Chandigarh',
    phone: '+91 9417098765',
    timings: 'Open 24x7',
    isEmergency: true,
  },
  {
    id: 'branch-mp-2',
    labId: 'lab-metropath',
    name: 'Sector 22 Health Express Counter',
    badge: 'Express Sample Point',
    address: 'Booth 55, Sector 22-D, Chandigarh',
    phone: '+91 9417098765',
    timings: 'Mon–Sun: 7:00 AM – 8:30 PM',
  },
];

const DEFAULT_VENDOR_BOOKINGS: HomeCollectionBooking[] = [
  {
    id: 'book-101',
    labId: 'lab-apex',
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
    labId: 'lab-apex',
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
    labId: 'lab-apex',
    patientName: 'Ananya Verma',
    mobile: '9988776655',
    address: 'H-34, Model Town, Near Gurudwara',
    timeSlot: 'Today: Urgent Collection',
    packageOrTest: 'Thyroid Profile & CBC (₹600)',
    status: 'Sample Collected',
    createdAt: 'Today, 07:45 AM',
  },
  // CityCare Bookings (lab-citycare)
  {
    id: 'book-cc-201',
    labId: 'lab-citycare',
    patientName: 'Harpreet Singh Walia',
    mobile: '9815012345',
    address: 'House 542, Phase 4, Mohali',
    timeSlot: 'Tomorrow: 7:30 AM - 9:30 AM',
    packageOrTest: 'CityCare Senior Citizen Panel (₹1,499)',
    status: 'Phlebotomist Assigned',
    createdAt: 'Today, 08:45 AM',
  },
  {
    id: 'book-cc-202',
    labId: 'lab-citycare',
    patientName: 'Simi Kapoor',
    mobile: '9814099881',
    address: 'Flat 103, Silver Heights, Zirakpur',
    timeSlot: 'Today: 2:00 PM - 4:00 PM',
    packageOrTest: 'Vitamin Profile Complete (₹1,200)',
    status: 'Pending',
    createdAt: 'Today, 09:30 AM',
  },
  // MetroPath Bookings (lab-metropath)
  {
    id: 'book-mp-301',
    labId: 'lab-metropath',
    patientName: 'Devendra Singhal',
    mobile: '9417098765',
    address: 'House 1204, Sector 33-C, Chandigarh',
    timeSlot: 'Tomorrow: 7:00 AM - 8:30 AM',
    packageOrTest: 'Cardiac Risk Marker Panel (₹1,800)',
    status: 'Sample Collected',
    createdAt: 'Today, 07:15 AM',
  },
];

export const DEFAULT_STAFF_ACCOUNTS: LabStaffAccount[] = [
  // --- APEX DIAGNOSTICS STAFF (lab-apex) ---
  {
    id: 'staff-reception-1',
    name: 'Pooja Verma',
    role: 'reception',
    username: 'reception@apexlab.com',
    phone: '+91 98765 11223',
    password: 'reception123',
    status: 'active',
    labId: 'lab-apex',
    labName: 'Apex Diagnostic & Clinical Pathology Laboratory',
    branchId: 'branch-1',
    branchName: 'Apex Central Diagnostic Hub',
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
    labId: 'lab-apex',
    labName: 'Apex Diagnostic & Clinical Pathology Laboratory',
    branchId: 'branch-1',
    branchName: 'Apex Central Diagnostic Hub',
    lastPasswordReset: '01 Sep 2026, 11:15 AM',
    shift: 'Full Day Diagnostic Shift (9:00 AM - 6:00 PM)',
    notes: 'Senior laboratory technician in charge of Hematology, Biochemistry & Analyzer verification',
  },
  {
    id: 'staff-manager-1',
    name: 'Vikram Malhotra',
    role: 'branch_manager',
    username: 'manager.modeltown@apexlab.com',
    phone: '+91 98140 99887',
    password: 'manager123',
    status: 'active',
    labId: 'lab-apex',
    labName: 'Apex Diagnostic & Clinical Pathology Laboratory',
    branchId: 'branch-2',
    branchName: 'Model Town Collection Centre',
    lastPasswordReset: '02 Sep 2026, 09:00 AM',
    shift: 'General Branch Shift (7:00 AM - 3:00 PM)',
    notes: 'Branch operations supervisor, cash reconciliation & sample logistics runner',
  },
  {
    id: 'staff-pathologist-1',
    name: 'Dr. Meenakshi Sundaram',
    role: 'pathologist',
    username: 'pathologist@apexlab.com',
    phone: '+91 98150 11223',
    password: 'patho123',
    status: 'active',
    labId: 'lab-apex',
    labName: 'Apex Diagnostic & Clinical Pathology Laboratory',
    branchId: 'all',
    branchName: 'All Branches (Central Sign-off Authority)',
    lastPasswordReset: '03 Sep 2026, 12:00 PM',
    shift: 'Clinical Sign-off Hours (10:00 AM - 7:00 PM)',
    notes: 'Consultant Pathologist & Clinical Director, NABL signatory',
  },
  // --- CITYCARE ADVANCED DIAGNOSTICS STAFF (lab-citycare) ---
  {
    id: 'staff-cc-reception-1',
    name: 'Jasleen Chawla',
    role: 'reception',
    username: 'reception@citycare.com',
    phone: '+91 98150 22334',
    password: 'reception123',
    status: 'active',
    labId: 'lab-citycare',
    labName: 'CityCare Advanced Diagnostics & Scan Centre',
    branchId: 'branch-cc-1',
    branchName: 'CityCare Phase 7 Diagnostic Hub',
    lastPasswordReset: '01 Sep 2026, 09:30 AM',
    shift: 'Front Desk Shift (7:30 AM - 3:30 PM)',
    notes: 'CityCare registration lead, token allocation & due settlements',
  },
  {
    id: 'staff-cc-tech-1',
    name: 'Satnam Singh (DMLT)',
    role: 'technician',
    username: 'technician@citycare.com',
    phone: '+91 98150 55667',
    password: 'tech123',
    status: 'active',
    labId: 'lab-citycare',
    labName: 'CityCare Advanced Diagnostics & Scan Centre',
    branchId: 'branch-cc-1',
    branchName: 'CityCare Phase 7 Diagnostic Hub',
    lastPasswordReset: '01 Sep 2026, 10:00 AM',
    shift: 'Analyzer Workstation Shift (8:00 AM - 5:00 PM)',
    notes: 'Biochemistry, Immunoturbidimetry & Vitamin profiling specialist',
  },
  {
    id: 'staff-cc-manager-1',
    name: 'Paramjit Sandhu',
    role: 'branch_manager',
    username: 'manager@citycare.com',
    phone: '+91 98150 77889',
    password: 'manager123',
    status: 'active',
    labId: 'lab-citycare',
    labName: 'CityCare Advanced Diagnostics & Scan Centre',
    branchId: 'branch-cc-2',
    branchName: 'Phase 3B2 Collection Desk',
    lastPasswordReset: '02 Sep 2026, 08:30 AM',
    shift: 'Collection Centre Manager (8:00 AM - 4:00 PM)',
    notes: 'Branch ops, runner coordination to Phase 7 Hub & cash reconciliation',
  },
  {
    id: 'staff-cc-patho-1',
    name: 'Dr. S. K. Narang (MD Path)',
    role: 'pathologist',
    username: 'pathologist@citycare.com',
    phone: '+91 98150 12345',
    password: 'patho123',
    status: 'active',
    labId: 'lab-citycare',
    labName: 'CityCare Advanced Diagnostics & Scan Centre',
    branchId: 'all',
    branchName: 'All Branches (Central Sign-off Authority)',
    lastPasswordReset: '03 Sep 2026, 11:30 AM',
    shift: 'Clinical Sign-off Hours (9:30 AM - 6:30 PM)',
    notes: 'Senior Clinical Director, QCI signatory',
  },
  // --- METROPATH SCANS & MOLECULAR LAB STAFF (lab-metropath) ---
  {
    id: 'staff-mp-reception-1',
    name: 'Divya Sehgal',
    role: 'reception',
    username: 'reception@metropath.com',
    phone: '+91 94170 11223',
    password: 'reception123',
    status: 'active',
    labId: 'lab-metropath',
    labName: 'MetroPath Scans & Molecular Pathology Hub',
    branchId: 'branch-mp-1',
    branchName: 'MetroPath Sector 34-A Super Specialty Hub',
    lastPasswordReset: '01 Sep 2026, 08:45 AM',
    shift: 'Morning Intake Shift (8:00 AM - 4:00 PM)',
    notes: 'Patient intake, Barcode tagging & Cashless TPA / UPI processing',
  },
  {
    id: 'staff-mp-tech-1',
    name: 'Nikhil Kashyap (M.Sc MLT)',
    role: 'technician',
    username: 'technician@metropath.com',
    phone: '+91 94170 33445',
    password: 'tech123',
    status: 'active',
    labId: 'lab-metropath',
    labName: 'MetroPath Scans & Molecular Pathology Hub',
    branchId: 'branch-mp-1',
    branchName: 'MetroPath Sector 34-A Super Specialty Hub',
    lastPasswordReset: '01 Sep 2026, 09:15 AM',
    shift: 'Molecular & Cardiac Lab Shift (9:00 AM - 6:00 PM)',
    notes: 'Specializes in High Sensitivity Troponin, PSA and real-time PCR testing',
  },
  {
    id: 'staff-mp-manager-1',
    name: 'Rohit Batra',
    role: 'branch_manager',
    username: 'manager@metropath.com',
    phone: '+91 94170 66778',
    password: 'manager123',
    status: 'active',
    labId: 'lab-metropath',
    labName: 'MetroPath Scans & Molecular Pathology Hub',
    branchId: 'branch-mp-2',
    branchName: 'Sector 22 Health Express Counter',
    lastPasswordReset: '02 Sep 2026, 09:30 AM',
    shift: 'Express Centre Incharge (7:00 AM - 3:00 PM)',
    notes: 'Cold-chain sample transit monitor & branch collection auditor',
  },
  {
    id: 'staff-mp-patho-1',
    name: 'Dr. Arunava Ghosh (MD Path)',
    role: 'pathologist',
    username: 'pathologist@metropath.com',
    phone: '+91 94170 98765',
    password: 'patho123',
    status: 'active',
    labId: 'lab-metropath',
    labName: 'MetroPath Scans & Molecular Pathology Hub',
    branchId: 'all',
    branchName: 'All Branches (Central Sign-off Authority)',
    lastPasswordReset: '03 Sep 2026, 10:00 AM',
    shift: 'Clinical Sign-off Hours (9:00 AM - 7:00 PM)',
    notes: 'Consultant Molecular Pathologist, NABL accredited digital signatory',
  },
];

// --- CMS CONTEXT INTERFACE ---
interface CmsContextType {
  currentUser: CmsUser | null;
  activeBranchId: string;
  setActiveBranchId: (branchId: string) => void;
  login: (
    role: 'admin' | 'vendor' | 'branch_manager' | 'reception' | 'technician' | 'pathologist',
    email?: string,
    password?: string,
    labId?: string,
    branchId?: string
  ) => { success: boolean; targetView: AppView; error?: string };
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  targetLoginRole: 'admin' | 'technician' | 'reception' | 'vendor' | 'branch_manager' | 'pathologist' | null;
  openLoginModal: (role?: 'admin' | 'technician' | 'reception' | 'vendor' | 'branch_manager' | 'pathologist') => void;

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
  labReports: LabReport[];
  setLabReports: React.Dispatch<React.SetStateAction<LabReport[]>>;
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

  // Multi-Lab Data Isolation & Tenant Security
  activeTenantId: string;
  activeTenantName: string;
  superAdminTenantScope: string;
  setSuperAdminTenantScope: (scope: string) => void;
  isTenantIsolated: boolean;
  queryTenantIsolatedPatients: (targetLabId?: string) => ReceptionPatientEntry[];
  queryTenantIsolatedReports: (targetLabId?: string) => LabReport[];
  queryTenantIsolatedBilling: (targetLabId?: string) => {
    totalCollection: number;
    dueAmount: number;
    totalPatients: number;
    bookings: HomeCollectionBooking[];
  };
  queryTenantIsolatedStaff: (targetLabId?: string) => LabStaffAccount[];
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
  const [targetLoginRole, setTargetLoginRole] = useState<
    'admin' | 'technician' | 'reception' | 'vendor' | 'branch_manager' | 'pathologist' | null
  >(null);
  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('cms_current_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.branchId && u.branchId !== 'all') return u.branchId;
      }
      return 'branch-1';
    } catch {
      return 'branch-1';
    }
  });

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

  // Multi-Vendor Labs Directory & Active Lab Selection
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

  const [selectedVendorLabId, setSelectedVendorLabId] = useState<string>('lab-apex');

  // Super Admin global vs lab-specific view scope ('all' or specific labId)
  const [superAdminTenantScope, setSuperAdminTenantScope] = useState<string>('all');

  // Compute the current active tenant/laboratory ID
  const activeTenantId = useMemo(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        return superAdminTenantScope;
      }
      return currentUser.labId || 'lab-apex';
    }
    return selectedVendorLabId || 'lab-apex';
  }, [currentUser, superAdminTenantScope, selectedVendorLabId]);

  const isTenantIsolated = activeTenantId !== 'all';

  const activeTenantName = useMemo(() => {
    if (activeTenantId === 'all') return 'All Laboratories (Super Admin Global Scope)';
    const match = vendorLabsList.find((l) => l.id === activeTenantId);
    return match ? match.name : (currentUser?.labName || 'Apex Diagnostic Central');
  }, [activeTenantId, vendorLabsList, currentUser]);

  // Vendor Lab Settings & Profile
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

  const [vendorDoctors, setVendorDoctors] = useState<VendorDoctor[]>(() => {
    try {
      const saved = localStorage.getItem('cms_vendor_doctors');
      return saved ? JSON.parse(saved) : DEFAULT_VENDOR_DOCTORS;
    } catch {
      return DEFAULT_VENDOR_DOCTORS;
    }
  });

  // Master Raw Stores (Isolated by labId)
  const [allReports, setAllReports] = useState<LabReport[]>(() => {
    try {
      const saved = localStorage.getItem('cms_lab_reports');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasOtherLabs = parsed.some((r: any) => r.labId === 'lab-citycare' || r.labId === 'lab-metropath');
          if (hasOtherLabs) return parsed;
          const otherLabReports = INITIAL_REPORTS.filter((r) => r.labId && r.labId !== 'lab-apex');
          return [...parsed, ...otherLabReports];
        }
      }
      return INITIAL_REPORTS;
    } catch {
      return INITIAL_REPORTS;
    }
  });

  const [allReceptionEntries, setAllReceptionEntries] = useState<ReceptionPatientEntry[]>(() => {
    try {
      const saved = localStorage.getItem('cms_reception_entries');
      const rawList = saved ? JSON.parse(saved) : INITIAL_RECEPTION_ENTRIES;
      let list = Array.isArray(rawList) ? rawList : INITIAL_RECEPTION_ENTRIES;
      const hasOtherLabs = list.some((e: any) => e.labId === 'lab-citycare' || e.labId === 'lab-metropath');
      if (!hasOtherLabs) {
        const otherLabEntries = INITIAL_RECEPTION_ENTRIES.filter((e) => e.labId && e.labId !== 'lab-apex');
        list = [...list, ...otherLabEntries];
      }
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

  const [allVendorBranches, setAllVendorBranches] = useState<VendorBranch[]>(() => {
    try {
      const saved = localStorage.getItem('cms_vendor_branches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasOtherLabs = parsed.some((b: any) => b.labId === 'lab-citycare' || b.labId === 'lab-metropath');
          if (hasOtherLabs) return parsed;
          const otherBranches = DEFAULT_VENDOR_BRANCHES.filter((b) => b.labId && b.labId !== 'lab-apex');
          return [...parsed, ...otherBranches];
        }
      }
      return DEFAULT_VENDOR_BRANCHES;
    } catch {
      return DEFAULT_VENDOR_BRANCHES;
    }
  });

  const [allVendorBookings, setAllVendorBookings] = useState<HomeCollectionBooking[]>(() => {
    try {
      const saved = localStorage.getItem('cms_vendor_bookings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasOtherLabs = parsed.some((b: any) => b.labId === 'lab-citycare' || b.labId === 'lab-metropath');
          if (hasOtherLabs) return parsed;
          const otherBookings = DEFAULT_VENDOR_BOOKINGS.filter((b) => b.labId && b.labId !== 'lab-apex');
          return [...parsed, ...otherBookings];
        }
      }
      return DEFAULT_VENDOR_BOOKINGS;
    } catch {
      return DEFAULT_VENDOR_BOOKINGS;
    }
  });

  const [allStaffAccounts, setAllStaffAccounts] = useState<LabStaffAccount[]>(() => {
    try {
      const saved = localStorage.getItem('cms_lab_staff_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasOtherLabs = parsed.some((s: any) => s.labId === 'lab-citycare' || s.labId === 'lab-metropath');
          if (hasOtherLabs) return parsed;
          const otherStaff = DEFAULT_STAFF_ACCOUNTS.filter((s) => s.labId && s.labId !== 'lab-apex');
          return [...parsed, ...otherStaff];
        }
      }
      return DEFAULT_STAFF_ACCOUNTS;
    } catch {
      return DEFAULT_STAFF_ACCOUNTS;
    }
  });

  const [allVendorTests, setAllVendorTests] = useState<TestItem[]>(() => {
    try {
      const saved = localStorage.getItem('cms_vendor_tests');
      return saved ? JSON.parse(saved) : MOCK_TESTS;
    } catch {
      return MOCK_TESTS;
    }
  });

  // LocalStorage sync effects
  useEffect(() => {
    try {
      localStorage.setItem('cms_lab_reports', JSON.stringify(allReports));
    } catch {}
  }, [allReports]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_reception_entries', JSON.stringify(allReceptionEntries));
    } catch {}
  }, [allReceptionEntries]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_vendor_branches', JSON.stringify(allVendorBranches));
    } catch {}
  }, [allVendorBranches]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_vendor_bookings', JSON.stringify(allVendorBookings));
    } catch {}
  }, [allVendorBookings]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_lab_staff_accounts', JSON.stringify(allStaffAccounts));
    } catch {}
  }, [allStaffAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem('cms_vendor_tests', JSON.stringify(allVendorTests));
    } catch {}
  }, [allVendorTests]);

  // Tenant-Scoped Filtered Views (Zero cross-lab data leakage)
  const reports = useMemo(() => {
    if (activeTenantId === 'all') return allReports;
    return allReports.filter((r) => isTenantMatch(r, activeTenantId));
  }, [allReports, activeTenantId]);

  const receptionEntries = useMemo(() => {
    if (activeTenantId === 'all') return allReceptionEntries;
    return allReceptionEntries.filter((e) => isTenantMatch(e, activeTenantId));
  }, [allReceptionEntries, activeTenantId]);

  const vendorBranches = useMemo(() => {
    if (activeTenantId === 'all') return allVendorBranches;
    return allVendorBranches.filter((b) => isTenantMatch(b, activeTenantId));
  }, [allVendorBranches, activeTenantId]);

  const vendorBookings = useMemo(() => {
    if (activeTenantId === 'all') return allVendorBookings;
    return allVendorBookings.filter((b) => isTenantMatch(b, activeTenantId));
  }, [allVendorBookings, activeTenantId]);

  const staffAccounts = useMemo(() => {
    if (activeTenantId === 'all') return allStaffAccounts;
    return allStaffAccounts.filter((s) => isTenantMatch(s, activeTenantId));
  }, [allStaffAccounts, activeTenantId]);

  const vendorTests = useMemo(() => {
    if (activeTenantId === 'all') return allVendorTests;
    return allVendorTests.filter((t) => !t.labId || isTenantMatch(t, activeTenantId));
  }, [allVendorTests, activeTenantId]);

  // Tenant-Isolated Query Helpers
  const queryTenantIsolatedPatients = (targetLabId?: string): ReceptionPatientEntry[] => {
    const tid = targetLabId || activeTenantId;
    if (tid === 'all') return allReceptionEntries;
    return allReceptionEntries.filter((e) => isTenantMatch(e, tid));
  };

  const queryTenantIsolatedReports = (targetLabId?: string): LabReport[] => {
    const tid = targetLabId || activeTenantId;
    if (tid === 'all') return allReports;
    return allReports.filter((r) => isTenantMatch(r, tid));
  };

  const queryTenantIsolatedBilling = (targetLabId?: string) => {
    const tid = targetLabId || activeTenantId;
    const pts = queryTenantIsolatedPatients(tid);
    const bks = tid === 'all' ? allVendorBookings : allVendorBookings.filter((b) => isTenantMatch(b, tid));
    const totalCollection = pts.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
    const dueAmount = pts.reduce((sum, p) => sum + (Number(p.dueAmount) || 0), 0);
    return {
      totalCollection,
      dueAmount,
      totalPatients: pts.length,
      bookings: bks,
    };
  };

  const queryTenantIsolatedStaff = (targetLabId?: string): LabStaffAccount[] => {
    const tid = targetLabId || activeTenantId;
    if (tid === 'all') return allStaffAccounts;
    return allStaffAccounts.filter((s) => isTenantMatch(s, tid));
  };

  // Secure Mutators - Lab Reports
  const addLabReport = (report: LabReport) => {
    const effectiveTenant = activeTenantId === 'all' ? (report.labId || 'lab-apex') : activeTenantId;
    const effectiveBranch = report.branchId || (activeBranchId !== 'all' ? activeBranchId : 'branch-1');
    const stamped = stampTenant({ ...report, branchId: effectiveBranch }, effectiveTenant);
    setAllReports((prev) => [stamped, ...prev.filter((r) => r.reportId !== stamped.reportId)]);
  };

  const updateLabReport = (reportId: string, updated: Partial<LabReport>) => {
    setAllReports((prev) =>
      prev.map((r) => {
        if (r.reportId.toLowerCase() === reportId.toLowerCase()) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(r, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant report update for reportId: ${reportId}`);
            return r;
          }
          return { ...r, ...updated };
        }
        return r;
      })
    );
  };

  const deleteLabReport = (reportId: string) => {
    setAllReports((prev) =>
      prev.filter((r) => {
        if (r.reportId.toLowerCase() === reportId.toLowerCase()) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(r, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant report deletion for reportId: ${reportId}`);
            return true;
          }
          return false;
        }
        return true;
      })
    );
    setAllReceptionEntries((prev) =>
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
    setAllReports((prev) =>
      prev.map((r) => {
        if (r.reportId.toLowerCase() === reportId.toLowerCase()) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(r, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant report cancellation for reportId: ${reportId}`);
            return r;
          }
          return {
            ...r,
            isCancelled: true,
            status: 'Cancelled',
            cancellationReason: reason,
            cancelledAt: timeStr,
            cancelledBy,
          };
        }
        return r;
      })
    );
  };

  const uncancelLabReport = (reportId: string) => {
    setAllReports((prev) =>
      prev.map((r) => {
        if (r.reportId.toLowerCase() === reportId.toLowerCase()) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(r, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant uncancel for reportId: ${reportId}`);
            return r;
          }
          return {
            ...r,
            isCancelled: false,
            status: r.verified ? 'Verified' : 'Normal',
            cancellationReason: undefined,
            cancelledAt: undefined,
            cancelledBy: undefined,
          };
        }
        return r;
      })
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

  // Secure Mutators - Reception Patients
  const addReceptionEntry = (entry: Omit<ReceptionPatientEntry, 'id'>): ReceptionPatientEntry => {
    const tokenVal = String(entry.tokenNumber || entry.tokenNo || `TK-${Math.floor(100 + Math.random() * 900)}`);
    const effectiveTenant = activeTenantId === 'all' ? (entry.labId || 'lab-apex') : activeTenantId;
    const effectiveBranch = entry.branchId || (activeBranchId !== 'all' ? activeBranchId : 'branch-1');
    const newEntry: ReceptionPatientEntry = {
      ...entry,
      labId: effectiveTenant,
      branchId: effectiveBranch,
      tokenNumber: tokenVal,
      tokenNo: tokenVal,
      id: `rcp-${Date.now()}`,
    };
    setAllReceptionEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const updateReceptionStatus = (id: string, status: ReceptionPatientEntry['status']) => {
    setAllReceptionEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(e, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant patient status update`);
            return e;
          }
          return { ...e, status };
        }
        return e;
      })
    );
  };

  const updateReceptionEntry = (id: string, updates: Partial<ReceptionPatientEntry>) => {
    setAllReceptionEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(e, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant patient update`);
            return e;
          }
          return { ...e, ...updates };
        }
        return e;
      })
    );
  };

  const deleteReceptionEntry = (id: string) => {
    setAllReceptionEntries((prev) =>
      prev.filter((e) => {
        if (e.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(e, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant patient deletion`);
            return true;
          }
          return false;
        }
        return true;
      })
    );
  };

  const clearReceptionEntries = () => {
    if (activeTenantId === 'all') {
      setAllReceptionEntries([]);
    } else {
      setAllReceptionEntries((prev) => prev.filter((e) => !isTenantMatch(e, activeTenantId)));
    }
  };

  const sendEntryToTechnician = (id: string) => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setAllReceptionEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(e, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant lab handoff`);
            return e;
          }
          return {
            ...e,
            sentToTechnician: true,
            technicianStatus: 'Sent to Lab',
            status: e.status === 'Waiting' ? 'Sample Collected' : e.status,
            sentToLabAt: `Today, ${timeStr}`,
          };
        }
        return e;
      })
    );
  };

  const acceptEntryByTechnician = (id: string) => {
    setAllReceptionEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(e, activeTenantId)) {
            return e;
          }
          return {
            ...e,
            technicianStatus: 'Accepted',
            status: 'In Lab',
          };
        }
        return e;
      })
    );
  };

  const completeTechnicianReport = (id: string, reportId: string) => {
    setAllReceptionEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(e, activeTenantId)) {
            return e;
          }
          return {
            ...e,
            technicianStatus: 'Report Generated',
            status: 'Report Ready',
            reportId: reportId,
          };
        }
        return e;
      })
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

  // Lab Staff Accounts Mutators (Isolated by tenant labId)
  const resetStaffPassword = (id: string, newPassword: string) => {
    const now = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setAllStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(s, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant password reset for staff ${id}`);
            return s;
          }
          return { ...s, password: newPassword, lastPasswordReset: now };
        }
        return s;
      })
    );
  };

  const updateStaffAccount = (id: string, updates: Partial<LabStaffAccount>) => {
    setAllStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(s, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant staff update for staff ${id}`);
            return s;
          }
          return { ...s, ...updates };
        }
        return s;
      })
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
    const effectiveTenant = activeTenantId === 'all' ? (staff.labId || 'lab-apex') : activeTenantId;
    const newStaff: LabStaffAccount = {
      ...staff,
      labId: effectiveTenant,
      id: `staff-${Date.now()}`,
      lastPasswordReset: now,
    };
    setAllStaffAccounts((prev) => [...prev, newStaff]);
  };

  const deleteStaffAccount = (id: string) => {
    setAllStaffAccounts((prev) =>
      prev.filter((s) => {
        if (s.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(s, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant staff deletion for staff ${id}`);
            return true;
          }
          return false;
        }
        return true;
      })
    );
  };

  // Auth actions
  const login = (
    role: 'admin' | 'vendor' | 'branch_manager' | 'reception' | 'technician' | 'pathologist',
    email?: string,
    _password?: string,
    labId?: string,
    branchId?: string
  ): { success: boolean; targetView: AppView; error?: string } => {
    // Resolve lab details
    const chosenLabId = labId || (role === 'admin' ? 'all' : selectedVendorLabId || 'lab-apex');
    const selectedLabObj = vendorLabsList.find((l) => l.id === chosenLabId) || vendorLabsList[0];
    const labName =
      chosenLabId === 'all'
        ? 'All Registered Labs (Global)'
        : selectedLabObj?.name || vendorLabSettings.labName;

    // Resolve branch details
    const chosenBranchId =
      branchId ||
      (role === 'admin' || role === 'vendor' || role === 'pathologist' ? 'all' : 'branch-1');
    const branchObj = vendorBranches.find((b) => b.id === chosenBranchId);
    const branchName =
      chosenBranchId === 'all'
        ? 'All Branches'
        : branchObj?.name ||
          (chosenBranchId === 'branch-2'
            ? 'Model Town Collection Centre'
            : 'Apex Central Diagnostic Hub');

    const permissions = getPermissionsForRole(role);

    let user: CmsUser;
    let targetView: AppView = 'vendor_dashboard';

    // Staff lookup scoped to tenant labId
    const findStaffForTenant = (targetRole: LabStaffAccount['role']) => {
      return (
        allStaffAccounts.find((s) => s.role === targetRole && (s.labId === chosenLabId || !s.labId || chosenLabId === 'all')) ||
        allStaffAccounts.find((s) => s.role === targetRole)
      );
    };

    if (role === 'admin') {
      user = {
        id: 'usr-admin-super',
        name: 'R. K. Mehra (Super Admin)',
        email: email || 'rkmehra331996@gmail.com',
        role: 'admin',
        entityName: 'Diagnostic SaaS Portal Central System',
        labId: 'all',
        labName: 'All Laboratories (Global Portal)',
        branchId: 'all',
        branchName: 'All Branches (Unrestricted)',
        permissions,
      };
      targetView = 'admin_dashboard';
    } else if (role === 'branch_manager') {
      const staff = findStaffForTenant('branch_manager');
      user = {
        id: staff?.id || `usr-manager-${chosenLabId}`,
        name: staff ? `${staff.name} (Branch Manager)` : 'Vikram Malhotra (Branch Manager)',
        email: email || staff?.username || `manager@${chosenLabId}.com`,
        role: 'branch_manager',
        entityName: `${labName} (${branchName})`,
        labId: chosenLabId,
        labName,
        branchId: chosenBranchId === 'all' ? 'branch-2' : chosenBranchId,
        branchName,
        permissions,
      };
      targetView = 'branch_manager_dashboard';
    } else if (role === 'reception') {
      const staff = findStaffForTenant('reception');
      user = {
        id: staff?.id || `usr-reception-${chosenLabId}`,
        name: staff ? `${staff.name} (Front Desk)` : 'Pooja Verma (Front Desk)',
        email: email || staff?.username || `reception@${chosenLabId}.com`,
        role: 'reception',
        entityName: `${labName} (${branchName})`,
        labId: chosenLabId,
        labName,
        branchId: chosenBranchId === 'all' ? 'branch-1' : chosenBranchId,
        branchName,
        permissions,
      };
      targetView = 'reception_dashboard';
    } else if (role === 'technician') {
      const staff = findStaffForTenant('technician');
      user = {
        id: staff?.id || `usr-tech-${chosenLabId}`,
        name: staff ? `${staff.name} (Lab Technician)` : 'Amit Khurana (Lab Technician)',
        email: email || staff?.username || `technician@${chosenLabId}.com`,
        role: 'technician',
        entityName: `${labName} (Diagnostic Workstation)`,
        labId: chosenLabId,
        labName,
        branchId: chosenBranchId,
        branchName,
        permissions,
      };
      targetView = 'technician_dashboard';
    } else if (role === 'pathologist') {
      const staff = findStaffForTenant('pathologist');
      user = {
        id: staff?.id || `usr-pathologist-${chosenLabId}`,
        name: staff ? `${staff.name} (MD Pathologist)` : 'Dr. Meenakshi Sundaram (MD Pathologist)',
        email: email || staff?.username || `pathologist@${chosenLabId}.com`,
        role: 'pathologist',
        entityName: `${labName} (Clinical Sign-off Desk)`,
        labId: chosenLabId,
        labName,
        branchId: chosenBranchId,
        branchName,
        permissions,
      };
      targetView = 'pathologist_dashboard';
    } else {
      // vendor / lab_admin
      let ownerName = 'Dr. Rajesh Sharma (Lab Owner)';
      let defaultEmail = '9876543210';
      if (chosenLabId === 'lab-citycare') {
        ownerName = 'Dr. S. K. Narang (Lab Owner & Director)';
        defaultEmail = 'dr.narang@citycare.com';
      } else if (chosenLabId === 'lab-metropath') {
        ownerName = 'Dr. Arunava Ghosh (Managing Pathologist & Owner)';
        defaultEmail = 'dr.ghosh@metropath.com';
      }
      user = {
        id: `usr-vendor-${chosenLabId}`,
        name: ownerName,
        email: email || defaultEmail,
        role: 'vendor',
        entityName: labName,
        labId: chosenLabId,
        labName,
        branchId: chosenBranchId,
        branchName,
        permissions,
      };
      targetView = 'vendor_dashboard';
    }

    setCurrentUser(user);
    if (user.branchId && user.branchId !== 'all') {
      setActiveBranchId(user.branchId);
    }
    setIsAuthModalOpen(false);

    try {
      localStorage.setItem('cms_current_user', JSON.stringify(user));
    } catch {}

    return { success: true, targetView };
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

  const openLoginModal = (
    role?: 'admin' | 'technician' | 'reception' | 'vendor' | 'branch_manager' | 'pathologist'
  ) => {
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
    const effectiveTenant = activeTenantId === 'all' ? (test.labId || 'lab-apex') : activeTenantId;
    const newTest: TestItem = {
      ...test,
      labId: effectiveTenant,
      id: `TST-${Date.now().toString().slice(-4)}`,
    };
    setAllVendorTests((prev) => [newTest, ...prev]);
  };

  const updateVendorTest = (id: string, test: Partial<TestItem>) => {
    setAllVendorTests((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(t, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant test update for ${id}`);
            return t;
          }
          return { ...t, ...test };
        }
        return t;
      })
    );
  };

  const deleteVendorTest = (id: string) => {
    setAllVendorTests((prev) =>
      prev.filter((t) => {
        if (t.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(t, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant test deletion for ${id}`);
            return true;
          }
          return false;
        }
        return true;
      })
    );
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
    const effectiveTenant = activeTenantId === 'all' ? (branch.labId || 'lab-apex') : activeTenantId;
    const newBranch: VendorBranch = {
      ...branch,
      labId: effectiveTenant,
      id: `branch-${Date.now()}`,
    };
    setAllVendorBranches((prev) => [...prev, newBranch]);
  };

  const updateVendorBranch = (id: string, branch: Partial<VendorBranch>) => {
    setAllVendorBranches((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(b, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant branch update for ${id}`);
            return b;
          }
          return { ...b, ...branch };
        }
        return b;
      })
    );
  };

  const deleteVendorBranch = (id: string) => {
    setAllVendorBranches((prev) =>
      prev.filter((b) => {
        if (b.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(b, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant branch deletion for ${id}`);
            return true;
          }
          return false;
        }
        return true;
      })
    );
  };

  const addHomeCollectionBooking = (
    booking: Omit<HomeCollectionBooking, 'id' | 'createdAt' | 'status'>
  ) => {
    const effectiveTenant = activeTenantId === 'all' ? (booking.labId || 'lab-apex') : activeTenantId;
    const effectiveBranch = booking.branchId || (activeBranchId !== 'all' ? activeBranchId : 'branch-1');
    const newBooking: HomeCollectionBooking = {
      ...booking,
      labId: effectiveTenant,
      branchId: effectiveBranch,
      id: `book-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      createdAt: 'Just now',
    };
    setAllVendorBookings((prev) => [newBooking, ...prev]);
  };

  const updateBookingStatus = (id: string, status: HomeCollectionBooking['status']) => {
    setAllVendorBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(b, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant booking status update for ${id}`);
            return b;
          }
          return { ...b, status };
        }
        return b;
      })
    );
  };

  const deleteBooking = (id: string) => {
    setAllVendorBookings((prev) =>
      prev.filter((b) => {
        if (b.id === id) {
          if (currentUser?.role !== 'admin' && activeTenantId !== 'all' && !verifyTenantOwnership(b, activeTenantId)) {
            console.warn(`[SECURITY] Blocked unauthorized cross-tenant booking deletion for ${id}`);
            return true;
          }
          return false;
        }
        return true;
      })
    );
  };

  // Vendor Lab Directory Management
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
    setAllVendorTests(MOCK_TESTS);
    setVendorDoctors(DEFAULT_VENDOR_DOCTORS);
    setAllVendorBranches(DEFAULT_VENDOR_BRANCHES);
    setAllVendorBookings(DEFAULT_VENDOR_BOOKINGS);
    setAllReports(INITIAL_REPORTS);
    setAllReceptionEntries(INITIAL_RECEPTION_ENTRIES);
    setAllStaffAccounts(DEFAULT_STAFF_ACCOUNTS);
    setSuperAdminTenantScope('all');

    localStorage.clear();
  };

  return (
    <CmsContext.Provider
      value={{
        currentUser,
        activeBranchId,
        setActiveBranchId,
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
        labReports: reports,
        setLabReports: setAllReports,
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

        // Multi-Lab Data Isolation & Tenant Security
        activeTenantId,
        activeTenantName,
        superAdminTenantScope,
        setSuperAdminTenantScope,
        isTenantIsolated,
        queryTenantIsolatedPatients,
        queryTenantIsolatedReports,
        queryTenantIsolatedBilling,
        queryTenantIsolatedStaff,
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
