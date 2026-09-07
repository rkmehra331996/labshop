export type AppView =
  | 'website'
  | 'vendor_website'
  | 'lab_app'
  | 'patient_portal'
  | 'admin_dashboard'
  | 'vendor_dashboard'
  | 'reception_dashboard'
  | 'technician_dashboard';

export type UserRole = 'admin' | 'technician' | 'reception' | 'vendor' | null;

export interface CmsUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'reception' | 'vendor';
  avatar?: string;
  entityName: string;
}

export interface LabStaffAccount {
  id: string;
  name: string;
  role: 'reception' | 'technician';
  username: string; // or email / phone
  phone?: string;
  password: string;
  status: 'active' | 'suspended';
  lastPasswordReset?: string;
  shift?: string;
  notes?: string;
}

export interface PortalWebsiteSections {
  hero: boolean;
  trustStrip: boolean;
  problemSection: boolean;
  solutionSection: boolean;
  workflow: boolean;
  features: boolean;
  offline: boolean;
  patientPortal: boolean;
  vendorWebsitesShowcase: boolean;
  reportPreview: boolean;
  whatsapp: boolean;
  testLibrary: boolean;
  multiBranch: boolean;
  staffRoles: boolean;
  patientHistory: boolean;
  dataSafety: boolean;
  security: boolean;
  auditLog: boolean;
  indianMarket: boolean;
  pricing: boolean;
  demo: boolean;
  finalCta: boolean;
  faq: boolean;
  footer: boolean;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  supportPhone: string;
  supportEmail: string;
  announcementText: string;
  sections?: Partial<PortalWebsiteSections>;
}

export interface PricingPlan {
  id: string;
  name: string;
  target: string;
  monthlyPriceINR: number;
  yearlyPriceINR: number;
  description: string;
  isPopular: boolean;
  features: string[];
}

export interface CompanyFeature {
  id: string;
  title: string;
  description: string;
  category: string;
  badge?: string;
}

export interface CompanyFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface CompanyStat {
  id: string;
  label: string;
  value: string;
  subtext: string;
}

export interface VendorWebsiteSections {
  announcementBar: boolean;
  header: boolean;
  hero: boolean;
  dashboardsShowcase: boolean;
  packages: boolean;
  testDirectory: boolean;
  whyChooseUs: boolean;
  doctors: boolean;
  branches: boolean;
  reportInterlink: boolean;
  footer: boolean;
}

export interface VendorLabSettings {
  labShopId?: string;
  labName: string;
  name?: string;
  tagline: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  ogImageUrl?: string;
  phone: string;
  helplinePhone?: string;
  whatsapp: string;
  nablAccreditationNo: string;
  nablNumber?: string;
  isoCert: string;
  openingHours: string;
  address: string;
  heroPromoText: string;
  emergencyHours: string;
  whatsappTemplate?: string;
  enableDigitalSignature?: boolean;
  enableLabStamp?: boolean;
  gstin?: string;
  pmcRegistrationNo?: string;
  email?: string;
  primaryColor?: string;
  domainPreview?: string;
  announcementText?: string;
  sections?: Partial<VendorWebsiteSections>;
  // 1 or 2 QR Code images for payment
  qrCode1Url?: string;
  qrCode1Label?: string;
  upiId1?: string;
  qrCode2Url?: string;
  qrCode2Label?: string;
  upiId2?: string;
  merchantName?: string;
}

export interface VendorPackage {
  id: string;
  name: string;
  testsCount: number;
  description: string;
  priceINR: number;
  mrpINR: number;
  isPopular?: boolean;
  features: string[];
}

export interface VendorDoctor {
  id: string;
  name: string;
  degrees: string;
  qualification?: string;
  specialization: string;
  experience: string;
  bio: string;
  avatarEmoji: string;
  referralCommissionPct?: number;
  monthlyReferrals?: number;
  totalReferredBilling?: number;
}

export interface VendorBranch {
  id: string;
  name: string;
  badge: string;
  type?: string;
  address: string;
  phone: string;
  timings: string;
  timing?: string;
  isEmergency?: boolean;
}

export interface HomeCollectionBooking {
  id: string;
  patientName: string;
  mobile: string;
  address: string;
  timeSlot: string;
  packageOrTest: string;
  status: 'Pending' | 'Phlebotomist Assigned' | 'Sample Collected' | 'Report Delivered' | 'Cancelled';
  createdAt: string;
}

export type Language = 'en' | 'hi' | 'pa';

export interface TestItem {
  id: string;
  name: string;
  code: string;
  category: string;
  sampleType: string;
  unit: string;
  normalRange: string;
  priceINR: number;
  turnaroundTime: string;
  tatHours?: number;
  description?: string;
  isPopular?: boolean;
}

export interface Patient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  city: string;
  referringDoctor: string;
  registeredAt: string;
  reportId: string;
  status: 'Sample Collected' | 'In Processing' | 'Pending Verification' | 'Report Ready' | 'Delivered';
  tests: string[];
  totalBill: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: 'UPI' | 'Cash' | 'Card';
}

export interface ReportItem {
  testName: string;
  parameter: string;
  result: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  notes?: string;
}

export interface LabReport {
  reportId: string;
  uhid: string;
  patientName: string;
  ageGender: string;
  mobile: string;
  doctor: string;
  sampleCollectedAt: string;
  reportedAt: string;
  labName: string;
  labAddress: string;
  labPhone: string;
  nablAccreditationNo: string;
  pathologist: string;
  pathologistDegrees: string;
  barcode: string;
  items: ReportItem[];
  verified: boolean;
  verificationHash: string;
  clinicalImpression?: string;
  status?: 'Normal' | 'Verified' | 'Cancelled';
  isCancelled?: boolean;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
}

export interface BranchStat {
  id: string;
  name: string;
  city: string;
  patientsToday: number;
  testsToday: number;
  collectionToday: number;
  dueAmount: number;
  pendingReports: number;
  activeStaff: number;
}

export interface AuditEntry {
  id: string;
  time: string;
  action: string;
  actor: string;
  role: string;
  details: string;
  ip: string;
}

export type VendorStatus =
  | 'Active'
  | 'Pending'
  | 'Processing due to payment confirmation'
  | 'Suspended';

export interface VendorLabDirectoryItem {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  ogImageUrl?: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  nablCode: string;
  badge: string;
  rating: number;
  activePackages: number;
  turnaroundTime: string;
  emergency: boolean;
  color: string;
  status: VendorStatus;
  ownerName?: string;
  email?: string;
  subscriptionPlan?: string;
  subscriptionAmount?: number;
  paymentMode?: string;
  paymentReference?: string;
  paymentNotes?: string;
  joinedDate?: string;
  domainPreview?: string;
  establishedYear?: number;
  reviewsCount?: number;
  features?: string[];
}

export interface ReceptionPatientEntry {
  id: string;
  uhid: string;
  tokenNumber: string;
  tokenNo?: string;
  patientName: string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  referringDoctor: string;
  tests: string[];
  sampleType: string;
  totalAmount: number;
  discountINR: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card';
  paymentStatus: 'Full Payment' | 'Paid' | 'Advance' | 'Pending' | 'Partial' | 'Due' | 'Due Payment';
  status: 'Waiting' | 'Sample Collected' | 'In Lab' | 'Report Ready';
  registeredAt: string;
  notes?: string;
  sentToTechnician?: boolean;
  technicianStatus?: 'Not Sent' | 'Sent to Lab' | 'Accepted' | 'Report Generated';
  sentToLabAt?: string;
  reportId?: string;
  technicianNotes?: string;
  balancePaidAmount?: number;
  balancePaymentMode?: 'Cash' | 'UPI' | 'Card';
  balancePaidAt?: string;
}
