import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Printer,
  MessageSquare,
  CheckCircle2,
  Clock,
  FlaskConical,
  IndianRupee,
  Phone,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Settings,
  Globe,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  FileText,
  UserCheck,
  RefreshCw,
  Share2,
  Sparkles,
  Eye,
  Send,
  Lock,
  CreditCard,
  Undo2,
  Save,
  LogOut,
  Download,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { DashboardFooter } from './DashboardFooter';
import { AppView, ReceptionPatientEntry } from '../types';
import { EditReceptionEntryModal } from './EditReceptionEntryModal';
import { CollectRemainingPaymentModal } from './CollectRemainingPaymentModal';
import { generateThermalReceiptPdf } from '../utils/pdfGenerator';
import { safePrint } from '../utils/printHelper';

interface ReceptionEntryDashboardProps {
  onNavigateView: (view: AppView) => void;
  onOpenReportPortal?: (reportId?: string, mobile?: string) => void;
}

export const ReceptionEntryDashboard: React.FC<ReceptionEntryDashboardProps> = ({
  onNavigateView,
  onOpenReportPortal,
}) => {
  const {
    currentUser,
    logout,
    vendorLabSettings,
    vendorTests,
    vendorDoctors,
    receptionEntries,
    addReceptionEntry,
    updateReceptionStatus,
    updateReceptionEntry,
    deleteReceptionEntry,
    sendEntryToTechnician,
  } = useCms();

  const labName = vendorLabSettings?.labName || 'Apex Diagnostic & Clinical Pathology Laboratory';
  const labNabl = vendorLabSettings?.nablAccreditationNo || 'MC-4821';
  const labPhone = vendorLabSettings?.phone || '7087033009';
  const labAddress = vendorLabSettings?.address || 'SCF 42-43, Sector 18-C, Central Healthcare Complex, Ludhiana';

  // --- FORM STATE ---
  // In-form Editing Mode (allows editing any patient directly without re-typing)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Snapshot of last filled data before submit or clear (so user can 1-click restore if they made a mistake)
  const [lastFormSnapshot, setLastFormSnapshot] = useState<{
    patientName: string;
    age: string;
    gender: 'Male' | 'Female' | 'Other';
    mobile: string;
    referringDoctor: string;
    selectedTests: string[];
    sampleType: string;
    hasDiscount: boolean;
    discountINR: number;
    paymentChoice: 'Full Payment' | 'Advance' | 'Due';
    advancePercent: number;
    customPaidAmount: string;
    paymentMode: 'Cash' | 'UPI' | 'Card';
    notes: string;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('reception_last_snapshot');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Recently registered entry tracking for quick correction banner
  const [lastRegisteredEntry, setLastRegisteredEntry] = useState<ReceptionPatientEntry | null>(null);
  const [showRecentlyRegisteredBanner, setShowRecentlyRegisteredBanner] = useState<boolean>(false);

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('32');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [mobile, setMobile] = useState('');
  const [referringDoctor, setReferringDoctor] = useState('Dr. S. K. Gupta (MD Med)');
  const [selectedTests, setSelectedTests] = useState<string[]>(['Complete Blood Count (CBC)']);
  const [sampleType, setSampleType] = useState('EDTA Whole Blood (Lavender Tube)');

  // Optional Discount with Checkbox
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountINR, setDiscountINR] = useState<number>(0);

  // Payment Options: 'Full Payment' | 'Advance' | 'Due'
  const [paymentChoice, setPaymentChoice] = useState<'Full Payment' | 'Advance' | 'Due'>('Full Payment');
  const [advancePercent, setAdvancePercent] = useState<number>(50);
  const [customPaidAmount, setCustomPaidAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card'>('UPI');
  const [notes, setNotes] = useState('');
  const [testSearch, setTestSearch] = useState('');

  // Load unsaved active draft from localStorage on initial render
  useEffect(() => {
    try {
      const draft = localStorage.getItem('reception_form_active_draft');
      if (draft) {
        const p = JSON.parse(draft);
        if (p.patientName || p.mobile) {
          setPatientName(p.patientName || '');
          if (p.age) setAge(p.age);
          if (p.gender) setGender(p.gender);
          if (p.mobile) setMobile(p.mobile);
          if (p.referringDoctor) setReferringDoctor(p.referringDoctor);
          if (p.selectedTests && p.selectedTests.length > 0) setSelectedTests(p.selectedTests);
          if (p.sampleType) setSampleType(p.sampleType);
          if (p.hasDiscount !== undefined) setHasDiscount(p.hasDiscount);
          if (p.discountINR) setDiscountINR(p.discountINR);
          if (p.paymentChoice) setPaymentChoice(p.paymentChoice);
          if (p.advancePercent) setAdvancePercent(p.advancePercent);
          if (p.customPaidAmount) setCustomPaidAmount(p.customPaidAmount);
          if (p.paymentMode) setPaymentMode(p.paymentMode);
          if (p.notes) setNotes(p.notes);
        }
      }
    } catch {}
  }, []);

  // Auto-save form draft so refreshing or navigating doesn't wipe typed content
  useEffect(() => {
    if (!editingEntryId) {
      if (patientName || mobile || notes || selectedTests.length > 1 || discountINR > 0) {
        try {
          localStorage.setItem(
            'reception_form_active_draft',
            JSON.stringify({
              patientName,
              age,
              gender,
              mobile,
              referringDoctor,
              selectedTests,
              sampleType,
              hasDiscount,
              discountINR,
              paymentChoice,
              advancePercent,
              customPaidAmount,
              paymentMode,
              notes,
            })
          );
        } catch {}
      }
    }
  }, [
    patientName,
    age,
    gender,
    mobile,
    referringDoctor,
    selectedTests,
    sampleType,
    hasDiscount,
    discountINR,
    paymentChoice,
    advancePercent,
    customPaidAmount,
    paymentMode,
    notes,
    editingEntryId,
  ]);

  // Queue search & status filter
  const [queueSearch, setQueueSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Waiting' | 'Sample Collected' | 'In Lab' | 'Report Ready'>('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Full Payment' | 'Advance' | 'Due'>('All');

  // Thermal Slip Modal
  const [selectedReceipt, setSelectedReceipt] = useState<ReceptionPatientEntry | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Edit Patient Entry Modal
  const [editingEntry, setEditingEntry] = useState<ReceptionPatientEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Collect Remaining Payment Modal
  const [collectingPaymentEntry, setCollectingPaymentEntry] = useState<ReceptionPatientEntry | null>(null);
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<ReceptionPatientEntry | null>(null);

  // Success Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Popular Quick-Click Tests
  const quickTestPills = [
    { name: 'Complete Blood Count (CBC)', price: 350, sample: 'EDTA Blood' },
    { name: 'Fasting Blood Sugar (FBS)', price: 120, sample: 'Fluoride Plasma' },
    { name: 'Kidney Function Test (KFT)', price: 600, sample: 'Serum Clot' },
    { name: 'Liver Function Test (LFT)', price: 650, sample: 'Serum Clot' },
    { name: 'Lipid Profile', price: 550, sample: 'Serum Clot' },
    { name: 'Thyroid Profile (Total)', price: 450, sample: 'Serum Clot' },
    { name: 'Full Body Health Checkup', price: 999, sample: 'EDTA + Serum + Urine' },
    { name: 'Urine Routine & Microscopic', price: 150, sample: 'Sterile Urine' },
    { name: 'HbA1c (Glycosylated Hb)', price: 450, sample: 'EDTA Whole Blood' },
    { name: 'Dengue Serology (NS1 + Platelets)', price: 800, sample: 'Serum + EDTA' },
  ];

  // Calculate gross test amount
  const grossAmount = useMemo(() => {
    return selectedTests.reduce((acc, testName) => {
      // Look in quick pills
      const pill = quickTestPills.find((p) => p.name === testName);
      if (pill) return acc + pill.price;
      // Look in vendor tests
      const vTest = vendorTests.find((t) => t.name === testName);
      if (vTest) return acc + vTest.priceINR;
      return acc + 300; // default fallback
    }, 0);
  }, [selectedTests, vendorTests]);

  const effectiveDiscount = hasDiscount ? (discountINR || 0) : 0;
  const netPayable = Math.max(0, grossAmount - effectiveDiscount);

  // Calculate actual paid amount based on payment choice & manual inputs
  const paidAmount = useMemo(() => {
    if (paymentChoice === 'Full Payment') {
      return netPayable;
    }
    if (paymentChoice === 'Due') {
      return 0;
    }
    // Advance %
    if (customPaidAmount !== '') {
      const parsed = Number(customPaidAmount);
      if (!isNaN(parsed)) {
        return Math.min(netPayable, Math.max(0, parsed));
      }
    }
    return Math.min(netPayable, Math.max(0, Math.round((netPayable * advancePercent) / 100)));
  }, [paymentChoice, netPayable, customPaidAmount, advancePercent]);

  const dueAmount = Math.max(0, netPayable - paidAmount);

  // Auto-fill existing patient detection
  const existingPatientMatch = useMemo(() => {
    if (mobile.length >= 10) {
      return receptionEntries.find((e) => e.mobile.includes(mobile.slice(-10)));
    }
    return null;
  }, [mobile, receptionEntries]);

  // Handle Quick Add or Remove Test
  const handleToggleTest = (testName: string, suggestedSample?: string) => {
    if (selectedTests.includes(testName)) {
      setSelectedTests((prev) => prev.filter((t) => t !== testName));
    } else {
      setSelectedTests((prev) => [...prev, testName]);
      if (suggestedSample && sampleType === 'EDTA Whole Blood (Lavender Tube)') {
        setSampleType(suggestedSample);
      }
    }
  };

  // Save current form inputs before reset/submit so user never loses their typed data
  const saveCurrentAsSnapshot = () => {
    if (patientName.trim() || mobile.trim() || selectedTests.length > 1) {
      const snapshot = {
        patientName,
        age,
        gender,
        mobile,
        referringDoctor,
        selectedTests,
        sampleType,
        hasDiscount,
        discountINR,
        paymentChoice,
        advancePercent,
        customPaidAmount,
        paymentMode,
        notes,
      };
      setLastFormSnapshot(snapshot);
      try {
        sessionStorage.setItem('reception_last_snapshot', JSON.stringify(snapshot));
      } catch {}
    }
  };

  // Restore last form data with 1 click so user doesn't have to refill entire form
  const handleRestoreLastData = () => {
    if (!lastFormSnapshot) {
      showToast('⚠️ No previous patient data available to restore.');
      return;
    }
    setPatientName(lastFormSnapshot.patientName);
    setAge(lastFormSnapshot.age);
    setGender(lastFormSnapshot.gender);
    setMobile(lastFormSnapshot.mobile);
    setReferringDoctor(lastFormSnapshot.referringDoctor);
    setSelectedTests(lastFormSnapshot.selectedTests);
    setSampleType(lastFormSnapshot.sampleType);
    setHasDiscount(lastFormSnapshot.hasDiscount);
    setDiscountINR(lastFormSnapshot.discountINR);
    setPaymentChoice(lastFormSnapshot.paymentChoice);
    setAdvancePercent(lastFormSnapshot.advancePercent);
    setCustomPaidAmount(lastFormSnapshot.customPaidAmount);
    setPaymentMode(lastFormSnapshot.paymentMode);
    setNotes(lastFormSnapshot.notes);
    showToast('↺ Data restored! Change only what was incorrect without refilling the whole form.');
  };

  // Load an existing entry directly into the main form for in-place correction
  const handleLoadEntryToForm = (entry: ReceptionPatientEntry) => {
    saveCurrentAsSnapshot();
    setEditingEntryId(entry.id);
    setPatientName(entry.patientName);
    setAge(String(entry.age));
    setGender(entry.gender);
    setMobile(entry.mobile);
    setReferringDoctor(entry.referringDoctor);
    setSelectedTests(entry.tests && entry.tests.length > 0 ? entry.tests : ['Complete Blood Count (CBC)']);
    setSampleType(entry.sampleType || 'EDTA Whole Blood (Lavender Tube)');
    
    const hasDisc = (entry.discountINR || 0) > 0;
    setHasDiscount(hasDisc);
    setDiscountINR(entry.discountINR || 0);

    if (entry.dueAmount === 0 || entry.paymentStatus === 'Full Payment' || entry.paymentStatus === 'Paid') {
      setPaymentChoice('Full Payment');
      setCustomPaidAmount('');
    } else if (entry.paidAmount === 0 || entry.paymentStatus === 'Pending' || entry.paymentStatus === 'Due' || entry.paymentStatus === 'Due Payment') {
      setPaymentChoice('Due');
      setCustomPaidAmount('0');
    } else {
      setPaymentChoice('Advance');
      setCustomPaidAmount(String(entry.paidAmount));
    }

    setPaymentMode(entry.paymentMode || 'UPI');
    setNotes(entry.notes || '');

    // Scroll smoothly to the form container
    const formElement = document.getElementById('reception-patient-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showToast(`✏️ Token ${entry.tokenNumber} (${entry.patientName}) loaded into form. Fix whatever was wrong!`);
  };

  // Cancel edit mode and return to fresh entry
  const handleCancelEdit = () => {
    setEditingEntryId(null);
    handleResetForm();
    showToast('Cancelled editing. Ready for new patient entry.');
  };

  // Save corrections for an existing entry without re-typing from scratch
  const handleSaveCorrections = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntryId) return;
    if (!patientName.trim()) {
      showToast('⚠️ Please enter patient name!');
      return;
    }
    if (selectedTests.length === 0) {
      showToast('⚠️ Please select at least one test!');
      return;
    }

    const calculatedPaymentStatus: ReceptionPatientEntry['paymentStatus'] =
      dueAmount === 0 ? 'Full Payment' : paidAmount === 0 ? 'Due' : 'Advance';

    const updates: Partial<ReceptionPatientEntry> = {
      patientName: patientName.trim(),
      age: age || '30',
      gender,
      mobile: mobile || '9876500000',
      referringDoctor,
      tests: selectedTests,
      sampleType,
      totalAmount: grossAmount,
      discountINR: effectiveDiscount,
      paidAmount,
      dueAmount,
      paymentMode,
      paymentStatus: calculatedPaymentStatus,
      notes: notes.trim() || undefined,
    };

    updateReceptionEntry(editingEntryId, updates);

    const target = receptionEntries.find((e) => e.id === editingEntryId);
    if (target) {
      const merged: ReceptionPatientEntry = { ...target, ...updates };
      setLastRegisteredEntry(merged);
      setShowRecentlyRegisteredBanner(true);
      setSelectedReceipt(merged);
    }

    showToast(`✅ Galti theek kar di gayi hai! Token updated successfully.`);
    setEditingEntryId(null);
    handleResetForm();
  };

  // Handle Form Submit
  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      showToast('⚠️ Please enter patient name!');
      return;
    }
    if (selectedTests.length === 0) {
      showToast('⚠️ Please select at least one test!');
      return;
    }

    const nextTokenNum = `TK-${100 + receptionEntries.length + 1}`;
    const nextUHID = `LAB-2026-${9040 + receptionEntries.length + 1}`;

    const calculatedPaymentStatus: ReceptionPatientEntry['paymentStatus'] =
      dueAmount === 0 ? 'Full Payment' : paidAmount === 0 ? 'Due' : 'Advance';

    const newEntry: Omit<ReceptionPatientEntry, 'id'> = {
      uhid: nextUHID,
      tokenNumber: nextTokenNum,
      patientName: patientName.trim(),
      age: age || '30',
      gender,
      mobile: mobile || '9876500000',
      referringDoctor,
      tests: selectedTests,
      sampleType,
      totalAmount: grossAmount,
      discountINR: effectiveDiscount,
      paidAmount,
      dueAmount,
      paymentMode,
      paymentStatus: calculatedPaymentStatus,
      status: 'Waiting',
      registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: notes.trim() || undefined,
    };

    const saved = addReceptionEntry(newEntry);
    showToast(`✅ Patient Registered! Token: ${saved.tokenNumber} (${saved.patientName})`);

    // Track recently registered entry for quick 1-click mistake correction
    setLastRegisteredEntry(saved);
    setShowRecentlyRegisteredBanner(true);

    // Open thermal slip automatically for instant print
    setSelectedReceipt(saved);
    setIsReceiptModalOpen(true);

    // Reset Form for next patient
    handleResetForm();
  };

  // Register and Immediately Send to Lab Technician
  const handleRegisterAndSendToLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      showToast('⚠️ Please enter patient name!');
      return;
    }
    if (selectedTests.length === 0) {
      showToast('⚠️ Please select at least one test!');
      return;
    }

    const nextTokenNum = `TK-${100 + receptionEntries.length + 1}`;
    const nextUHID = `LAB-2026-${9040 + receptionEntries.length + 1}`;
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const calculatedPaymentStatus: ReceptionPatientEntry['paymentStatus'] =
      dueAmount === 0 ? 'Full Payment' : paidAmount === 0 ? 'Due' : 'Advance';

    const newEntry: Omit<ReceptionPatientEntry, 'id'> = {
      uhid: nextUHID,
      tokenNumber: nextTokenNum,
      patientName: patientName.trim(),
      age: age || '30',
      gender,
      mobile: mobile || '9876500000',
      referringDoctor,
      tests: selectedTests,
      sampleType,
      totalAmount: grossAmount,
      discountINR: effectiveDiscount,
      paidAmount,
      dueAmount,
      paymentMode,
      paymentStatus: calculatedPaymentStatus,
      status: 'In Lab',
      sentToTechnician: true,
      technicianStatus: 'Sent to Lab',
      sentToLabAt: `Today, ${nowTime}`,
      registeredAt: nowTime,
      notes: notes.trim() || undefined,
    };

    const saved = addReceptionEntry(newEntry);
    showToast(`🚀 Registered & sent to Lab Technician! Token: ${saved.tokenNumber}`);

    setLastRegisteredEntry(saved);
    setShowRecentlyRegisteredBanner(true);

    setSelectedReceipt(saved);
    setIsReceiptModalOpen(true);
    handleResetForm();
  };

  // Remaining Balance Collection Handler
  const handleOpenCollectPayment = (entry: ReceptionPatientEntry) => {
    setCollectingPaymentEntry(entry);
    setIsCollectPaymentOpen(true);
  };

  const handleCollectPayment = (
    entryId: string,
    collectedAmount: number,
    mode: 'Cash' | 'UPI' | 'Card',
    note?: string
  ) => {
    const entry = receptionEntries.find((e) => e.id === entryId);
    if (!entry) return;

    const netPayable = Math.max(0, entry.totalAmount - (entry.discountINR || 0));
    const newPaidAmount = Math.min(netPayable, entry.paidAmount + collectedAmount);
    const newDueAmount = Math.max(0, netPayable - newPaidAmount);
    const newPaymentStatus: ReceptionPatientEntry['paymentStatus'] =
      newDueAmount === 0 ? 'Full Payment' : 'Advance';

    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const updated: ReceptionPatientEntry = {
      ...entry,
      paidAmount: newPaidAmount,
      dueAmount: newDueAmount,
      paymentStatus: newPaymentStatus,
      paymentMode: mode,
      balancePaidAmount: (entry.balancePaidAmount || 0) + collectedAmount,
      balancePaymentMode: mode,
      balancePaidAt: `Today, ${nowTime}`,
      notes: note
        ? entry.notes
          ? `${entry.notes} • [Paid ₹${collectedAmount} via ${mode}: ${note}]`
          : `[Paid ₹${collectedAmount} via ${mode}: ${note}]`
        : entry.notes,
    };

    updateReceptionEntry(entryId, updated);
    showToast(`✅ Collected ₹${collectedAmount} for ${entry.tokenNumber}! Status: ${newPaymentStatus}`);

    setSelectedReceipt(updated);
    setIsReceiptModalOpen(true);
  };

  // Edit Patient Handlers
  const handleOpenEdit = (entry: ReceptionPatientEntry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updated: ReceptionPatientEntry) => {
    updateReceptionEntry(updated.id, updated);
    setLastRegisteredEntry(updated);
    showToast(`✅ Patient entry updated: ${updated.tokenNumber} (${updated.patientName})`);
  };

  const handleSaveAndSendToLab = (updated: ReceptionPatientEntry) => {
    updateReceptionEntry(updated.id, updated);
    sendEntryToTechnician(updated.id);
    setLastRegisteredEntry(updated);
    showToast(`🚀 Updated & dispatched ${updated.tokenNumber} to Lab Technician!`);
  };

  // Lab Technician Pipeline Actions
  const handleSendToLab = (entry: ReceptionPatientEntry) => {
    sendEntryToTechnician(entry.id);
    showToast(`🧪 Token ${entry.tokenNumber} (${entry.patientName}) sent to Lab Technician!`);
  };

  const handleResetForm = () => {
    saveCurrentAsSnapshot();
    setEditingEntryId(null);
    setPatientName('');
    setAge('30');
    setGender('Male');
    setMobile('');
    setSelectedTests(['Complete Blood Count (CBC)']);
    setHasDiscount(false);
    setDiscountINR(0);
    setPaymentChoice('Full Payment');
    setAdvancePercent(50);
    setCustomPaidAmount('');
    setNotes('');
    try {
      localStorage.removeItem('reception_form_active_draft');
    } catch {}
  };

  const handleApplyExistingPatient = () => {
    if (existingPatientMatch) {
      setPatientName(existingPatientMatch.patientName);
      setAge(String(existingPatientMatch.age));
      setGender(existingPatientMatch.gender);
      setReferringDoctor(existingPatientMatch.referringDoctor);
      showToast(`✨ Auto-filled data for ${existingPatientMatch.patientName}`);
    }
  };

  // Payment status counts
  const fullPaymentCount = receptionEntries.filter(
    (e) => e.dueAmount === 0 || e.paymentStatus === 'Full Payment' || e.paymentStatus === 'Paid'
  ).length;
  const advancePaymentCount = receptionEntries.filter(
    (e) => (e.dueAmount > 0 && e.paidAmount > 0) || e.paymentStatus === 'Advance' || e.paymentStatus === 'Partial'
  ).length;
  const pendingPaymentCount = receptionEntries.filter(
    (e) => e.paidAmount === 0 || e.paymentStatus === 'Pending' || e.paymentStatus === 'Due' || e.paymentStatus === 'Due Payment'
  ).length;

  // Filtered Queue
  const filteredQueue = receptionEntries.filter((item) => {
    const matchesFilter = statusFilter === 'All' || item.status === statusFilter;
    const matchesPayment =
      paymentFilter === 'All' ||
      (paymentFilter === 'Full Payment' && (item.dueAmount === 0 || item.paymentStatus === 'Full Payment' || item.paymentStatus === 'Paid')) ||
      (paymentFilter === 'Advance' && ((item.dueAmount > 0 && item.paidAmount > 0) || item.paymentStatus === 'Advance' || item.paymentStatus === 'Partial')) ||
      (paymentFilter === 'Due' && (item.paidAmount === 0 || item.paymentStatus === 'Pending' || item.paymentStatus === 'Due' || item.paymentStatus === 'Due Payment'));

    const q = queueSearch.toLowerCase();
    const matchesSearch =
      item.patientName.toLowerCase().includes(q) ||
      item.tokenNumber.toLowerCase().includes(q) ||
      item.uhid.toLowerCase().includes(q) ||
      item.mobile.includes(q) ||
      item.referringDoctor.toLowerCase().includes(q);
    return matchesFilter && matchesPayment && matchesSearch;
  });

  // Today's Counter Stats
  const totalPatientsToday = receptionEntries.length;
  const totalNetBilled = receptionEntries.reduce((acc, e) => acc + Math.max(0, e.totalAmount - (e.discountINR || 0)), 0);
  const totalCashCollected = receptionEntries.reduce((acc, e) => acc + (e.paymentMode === 'Cash' ? e.paidAmount : 0), 0);
  const totalUpiCollected = receptionEntries.reduce((acc, e) => acc + (e.paymentMode === 'UPI' ? e.paidAmount : 0), 0);
  const totalTotalCollection = receptionEntries.reduce((acc, e) => acc + e.paidAmount, 0);
  const totalDuePending = receptionEntries.reduce((acc, e) => acc + e.dueAmount, 0);
  const patientsWithDueCount = receptionEntries.filter((e) => e.dueAmount > 0).length;
  const waitingSamplesCount = receptionEntries.filter((e) => e.status === 'Waiting').length;
  const reportsReadyCount = receptionEntries.filter((e) => e.status === 'Report Ready').length;

  // Next status stepper
  const handleAdvanceStatus = (entry: ReceptionPatientEntry) => {
    let nextStatus: ReceptionPatientEntry['status'] = 'Waiting';
    if (entry.status === 'Waiting') nextStatus = 'Sample Collected';
    else if (entry.status === 'Sample Collected') nextStatus = 'In Lab';
    else if (entry.status === 'In Lab') nextStatus = 'Report Ready';
    else nextStatus = 'Report Ready';

    updateReceptionStatus(entry.id, nextStatus);
    showToast(`🔄 Token ${entry.tokenNumber} updated to: ${nextStatus}`);
  };

  const handleWhatsAppReceipt = (entry: ReceptionPatientEntry) => {
    const text = encodeURIComponent(
      `*${labName}* - Reception Receipt\n` +
      `--------------------------------\n` +
      `Token No: *${entry.tokenNumber}*\n` +
      `UHID: ${entry.uhid}\n` +
      `Patient: *${entry.patientName}* (${entry.age}Y/${entry.gender})\n` +
      `Tests: ${entry.tests.join(', ')}\n` +
      `Total: ₹${entry.totalAmount} | Paid: ₹${entry.paidAmount} (${entry.paymentMode})\n` +
      `${entry.dueAmount > 0 ? `Due Balance: ₹${entry.dueAmount}\n` : ''}` +
      `Status: ${entry.status}\n` +
      `Online Report: https://apexlab.in/report?id=${entry.uhid}\n\n` +
      `Thank you for choosing ${labName}!`
    );
    window.open(`https://wa.me/91${entry.mobile.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
      {/* 1. Reception Counter Top Bar */}
      <div className="bg-[#0F766E] text-white px-4 sm:px-8 py-2.5 border-b border-teal-700/50 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Lab Identity + Desk Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-black text-amber-300 border border-white/20">
              🖥️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">{labName}</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Reception Desk #1
                </span>
              </div>
              <p className="text-[11px] text-teal-100/90 font-medium">
                Fast Patient Registration • Billing & Due • Thermal Slip • Live Token Board
              </p>
            </div>
          </div>

          {/* Reception Counter Status & Security (No other role dashboards shown on Reception desk) */}
          <div className="flex items-center gap-2.5">
            {/* Live Counter Badge */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-50 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white">Live Counter #1 Active</span>
            </div>

            {/* Direct Button to Vendor Home Website */}
            <button
              type="button"
              id="reception-btn-vendor-website"
              onClick={() => onNavigateView('vendor_website')}
              className="bg-white hover:bg-teal-50 text-[#0F766E] px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer border border-white/30"
              title="Go to Vendor Home Website (Apex Diagnostics)"
            >
              <Globe className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Vendor Home Website</span>
            </button>

            {/* If Admin/Lab Owner is inspecting Reception Desk, provide return button */}
            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => onNavigateView('vendor_dashboard')}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Return to Lab Owner Dashboard"
              >
                <span>← Back to Lab Owner CMS</span>
              </button>
            ) : currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-teal-100 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                  👤 {currentUser.name}
                </span>
                <button
                  onClick={() => {
                    logout();
                    onNavigateView('vendor_website');
                  }}
                  className="bg-rose-500/80 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Logout from Reception Desk"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full space-y-6">
        {/* Today's Reception Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Card 1: Today's Patients */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Today's Tokens</span>
              <span className="text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded text-[10px] font-bold">Counter 1</span>
            </div>
            <div className="text-2xl font-black text-[#172033] mt-1">
              {totalPatientsToday} <span className="text-xs font-medium text-slate-400">Patients</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Live queue active</div>
          </div>

          {/* Card 2: Total Net Billed */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Total Billed</span>
              <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-bold">Net Invoiced</span>
            </div>
            <div className="text-2xl font-black text-[#123B6D] mt-1">
              ₹{totalNetBilled.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">After test discounts</div>
          </div>

          {/* Card 3: Today's Collection */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Total Collected</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold">Received</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              ₹{totalTotalCollection.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex gap-2">
              <span>Cash: ₹{totalCashCollected}</span>
              <span>•</span>
              <span>UPI: ₹{totalUpiCollected}</span>
            </div>
          </div>

          {/* Card 4: Pending Due Balance */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Pending Due</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${totalDuePending > 0 ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'}`}>
                {totalDuePending > 0 ? `${patientsWithDueCount} Pending` : 'All Clear'}
              </span>
            </div>
            <div className={`text-2xl font-black mt-1 ${totalDuePending > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              ₹{totalDuePending.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {totalDuePending > 0 ? 'To collect on report pickup' : 'No outstanding balances'}
            </div>
          </div>

          {/* Card 5: Lab Pipeline */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Reports Ready</span>
              <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded text-[10px] font-bold">{reportsReadyCount} Ready</span>
            </div>
            <div className="text-2xl font-black text-[#0F766E] mt-1">
              {reportsReadyCount} <span className="text-xs font-medium text-slate-400">Ready</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {waitingSamplesCount} samples in phlebotomy
            </div>
          </div>
        </div>

        {/* 3. Split Workstation Layout: Left Form + Right Live Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: New Patient Fast Entry & Billing Form (5 Cols) */}
          <div id="reception-patient-form" className={`lg:col-span-5 bg-white rounded-2xl border shadow-sm p-5 space-y-4 transition-all ${editingEntryId ? 'border-amber-400 ring-2 ring-amber-300/40' : 'border-slate-200'}`}>
            {editingEntryId ? (
              <div className="flex items-center justify-between border-b border-amber-200 pb-3 bg-amber-50/80 -mx-5 -mt-5 p-4 rounded-t-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide">
                      ✏️ Edit Mode Active
                    </span>
                    <h2 className="text-sm sm:text-base font-black text-amber-950">
                      Token {receptionEntries.find((e) => e.id === editingEntryId)?.tokenNumber || ''} Correction
                    </h2>
                  </div>
                  <p className="text-[11px] text-amber-900 mt-0.5">
                    💡 <strong>Sirf galat data badlein:</strong> Pura form dobara nahi bharna padega.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <X className="w-3.5 h-3.5 text-rose-500" />
                  <span>Cancel Edit</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-black text-[#123B6D] flex items-center gap-1.5">
                    <span>⚡ New Patient & Billing Entry</span>
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Instant UHID, Barcode, Thermal Slip & Live Queue token
                  </p>
                </div>
                <span className="bg-teal-100 text-teal-900 text-xs font-black px-2.5 py-1 rounded-lg">
                  TK-{100 + receptionEntries.length + 1}
                </span>
              </div>
            )}

            {/* Recently Registered Patient Banner (Instant 1-Click Correction) */}
            {showRecentlyRegisteredBanner && lastRegisteredEntry && !editingEntryId && (
              <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 border-2 border-teal-300 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs">
                <div className="flex items-start sm:items-center gap-2">
                  <span className="text-teal-700 bg-teal-100 p-1.5 rounded-lg shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span>✓ Just Registered:</span>
                      <span className="bg-teal-700 text-white px-1.5 py-0.2 rounded font-mono text-[11px] font-bold">
                        {lastRegisteredEntry.tokenNumber}
                      </span>
                      <span className="text-teal-950 font-bold">{lastRegisteredEntry.patientName}</span>
                      <span className="text-[11px] font-normal text-slate-600">
                        ({lastRegisteredEntry.age}Y • +91 {lastRegisteredEntry.mobile})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Koi data galti se galat ho gaya? <strong>Pura form dubara bharne ki zaroorat nahi hai!</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleLoadEntryToForm(lastRegisteredEntry)}
                    className="bg-[#0F766E] hover:bg-[#0d655e] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Galti Theek Karein (Edit)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRecentlyRegisteredBanner(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer text-xs"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Returning patient banner if detected */}
            {existingPatientMatch && (
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Existing Patient Found: <strong>{existingPatientMatch.patientName}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyExistingPatient}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px] cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            <form onSubmit={editingEntryId ? handleSaveCorrections : handleRegisterPatient} className="space-y-3.5">
              {/* Patient Name */}
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Gurpreet Singh / Anita Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-[#172033] focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 outline-none"
                />
              </div>

              {/* Age & Gender Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    Age (Years) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-[#172033] focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                    {(['Male', 'Female', 'Other'] as const).map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setGender(g)}
                        className={`py-1.5 rounded-md text-[11px] transition cursor-pointer ${
                          gender === g ? 'bg-white text-teal-800 shadow-2xs font-black' : 'text-slate-600'
                        }`}
                      >
                        {g === 'Male' ? 'M' : g === 'Female' ? 'F' : 'O'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 10-Digit Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  10-Digit Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    pattern="[0-9]{10}"
                    className="w-full pl-11 pr-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-[#172033] focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 outline-none"
                  />
                </div>
              </div>

              {/* Referring Doctor */}
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">Referring Doctor / Clinic</label>
                <select
                  value={referringDoctor}
                  onChange={(e) => setReferringDoctor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-[#172033] bg-white focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 outline-none"
                >
                  <option value="Self Walk-in (Direct Patient)">Self Walk-in (Direct Patient)</option>
                  {vendorDoctors.map((doc) => (
                    <option key={doc.id} value={`${doc.name} (${doc.degrees})`}>
                      {doc.name} ({doc.degrees}) • {doc.specialization}
                    </option>
                  ))}
                  <option value="Dr. S. K. Gupta (MD Med)">Dr. S. K. Gupta (MD Med)</option>
                  <option value="Dr. Anita Joshi, MD (Obs & Gynae)">Dr. Anita Joshi, MD (Obs & Gynae)</option>
                  <option value="Dr. Hardeep Bawa, MS">Dr. Hardeep Bawa, MS</option>
                </select>
              </div>

              {/* Test Selection: Quick Pills + Search */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#172033]">
                    Select Diagnostic Tests <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-teal-700">
                    {selectedTests.length} Selected
                  </span>
                </div>

                {/* Quick 1-click test chips */}
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200 mb-2">
                  {quickTestPills.map((test) => {
                    const isSelected = selectedTests.includes(test.name);
                    return (
                      <button
                        type="button"
                        key={test.name}
                        onClick={() => handleToggleTest(test.name, test.sample)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#0F766E] text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-teal-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{test.name}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                          ₹{test.price}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Tests Tag Cloud */}
                {selectedTests.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booked Tests:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTests.map((t) => (
                        <span
                          key={t}
                          className="bg-teal-50 border border-teal-200 text-teal-900 text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 font-medium"
                        >
                          <span>{t}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleTest(t)}
                            className="text-teal-600 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Tube Type */}
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">Sample Collection Tube</label>
                <select
                  value={sampleType}
                  onChange={(e) => setSampleType(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-[#172033] bg-white outline-none"
                >
                  <option value="EDTA Whole Blood (Lavender Tube)">EDTA Whole Blood (Lavender Tube)</option>
                  <option value="Serum Clot Activator (Yellow / Red Tube)">Serum Clot Activator (Yellow / Red Tube)</option>
                  <option value="Fluoride Plasma (Gray Tube - Glucose)">Fluoride Plasma (Gray Tube - Glucose)</option>
                  <option value="Sodium Citrate (Blue Tube - PT/INR)">Sodium Citrate (Blue Tube - PT/INR)</option>
                  <option value="Sterile Urine Container">Sterile Urine Container</option>
                  <option value="EDTA + Serum + Urine Combo">EDTA + Serum + Urine Combo</option>
                </select>
              </div>

              {/* Billing Calculation Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Gross Test Amount:</span>
                  <span className="font-bold text-slate-900">₹{grossAmount}</span>
                </div>

                {/* Optional Discount with Checkbox */}
                <div className="pt-1 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasDiscount}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setHasDiscount(checked);
                          if (!checked) {
                            setDiscountINR(0);
                          }
                        }}
                        className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span>Discount / Concession</span>
                        <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                      </span>
                    </label>

                    {hasDiscount && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-slate-500">₹</span>
                        <input
                          type="number"
                          min="0"
                          max={grossAmount}
                          value={discountINR || ''}
                          onChange={(e) => setDiscountINR(Number(e.target.value) || 0)}
                          placeholder="0"
                          className="w-20 px-2 py-0.5 text-right font-bold text-slate-800 rounded border border-teal-300 bg-white text-xs outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    )}
                  </div>

                  {hasDiscount && (
                    <div className="flex items-center justify-end gap-1 mt-1.5">
                      {[50, 100, 200].map((disc) => (
                        <button
                          type="button"
                          key={disc}
                          onClick={() => setDiscountINR(disc)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition cursor-pointer ${
                            discountINR === disc
                              ? 'bg-teal-700 text-white border-teal-700 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          ₹{disc} Off
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-sm font-black text-[#123B6D] pt-1 border-t border-slate-200">
                  <span>Net Payable:</span>
                  <span>₹{netPayable}</span>
                </div>

                {/* Payment Options: Full Payment / Advance % / Due Payment */}
                <div className="pt-1 border-t border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider flex items-center justify-between">
                    <span>Payment Options:</span>
                    <span className="text-[10px] font-semibold text-teal-700">
                      {paymentChoice === 'Full Payment'
                        ? '100% Paid'
                        : paymentChoice === 'Advance'
                        ? `Advance (${advancePercent}%)`
                        : '0% Paid (Due)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentChoice('Full Payment');
                        setCustomPaidAmount('');
                      }}
                      className={`py-1.5 px-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center gap-1 ${
                        paymentChoice === 'Full Payment'
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                          : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Full Payment</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentChoice('Advance');
                        setCustomPaidAmount('');
                      }}
                      className={`py-1.5 px-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center gap-1 ${
                        paymentChoice === 'Advance'
                          ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                          : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      <span>⚠️ Advance %</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentChoice('Due');
                        setCustomPaidAmount('0');
                      }}
                      className={`py-1.5 px-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center gap-1 ${
                        paymentChoice === 'Due'
                          ? 'bg-rose-700 text-white border-rose-800 shadow-2xs'
                          : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      <span>❌ Due Payment</span>
                    </button>
                  </div>

                  {/* Advance % selector */}
                  {paymentChoice === 'Advance' && (
                    <div className="mt-2 p-2 bg-amber-50/80 border border-amber-200 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                        <span>Advance Percentage:</span>
                        <span className="text-amber-800 font-extrabold">
                          {advancePercent}% = ₹{Math.round((netPayable * advancePercent) / 100)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[25, 50, 75].map((pct) => (
                          <button
                            type="button"
                            key={pct}
                            onClick={() => {
                              setAdvancePercent(pct);
                              setCustomPaidAmount('');
                            }}
                            className={`flex-1 py-1 text-xs font-bold rounded-md border transition cursor-pointer ${
                              advancePercent === pct && customPaidAmount === ''
                                ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                                : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            {pct}% (₹{Math.round((netPayable * pct) / 100)})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount Paid & Due */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Amount Paid (₹)</label>
                    <input
                      type="number"
                      min="0"
                      max={netPayable}
                      value={paidAmount}
                      onChange={(e) => {
                        setPaymentChoice('Advance');
                        setCustomPaidAmount(e.target.value);
                      }}
                      placeholder={`₹${paidAmount}`}
                      className="w-full px-2.5 py-1 text-xs font-bold text-emerald-700 rounded border border-slate-300 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Balance Due</label>
                    <div
                      className={`text-xs font-black py-1 px-2 rounded ${
                        dueAmount > 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      ₹{dueAmount}
                    </div>
                  </div>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                    {(['UPI', 'Cash', 'Card'] as const).map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setPaymentMode(mode)}
                        className={`py-1.5 px-2 rounded-lg transition border cursor-pointer ${
                          paymentMode === mode
                            ? 'bg-[#123B6D] text-white border-[#123B6D]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {mode === 'UPI' ? '📱 UPI / QR' : mode === 'Cash' ? '💵 Cash' : '💳 Card'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full bg-[#0F766E] hover:bg-[#0d655e] text-white py-2.5 rounded-xl font-black text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Generate Token & Print Thermal Slip</span>
                </button>

                <button
                  type="button"
                  onClick={handleRegisterAndSendToLab}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2.5 rounded-xl font-bold text-xs transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                  title="Register patient and immediately dispatch specimen to Lab Technician workstation"
                >
                  <FlaskConical className="w-4 h-4 text-amber-300" />
                  <span>Register & Send to Lab Tech</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPatientName('Harpreet Kaur');
                      setAge('28');
                      setGender('Female');
                      setMobile('9876543210');
                      setSelectedTests(['Thyroid Profile (Total)', 'Complete Blood Count (CBC)']);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>⚡ Demo Patient</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Clear Form</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right: Today's Live Queue & Token Calling Board (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            {/* Board Header & Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-[#172033] flex items-center gap-2">
                  <span>📋 Today's Live Reception Queue</span>
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {filteredQueue.length} Patients
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500">Realtime tracking from sample collection to report dispatch</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  placeholder="Search token, name, phone..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#172033] focus:border-teal-600 outline-none"
                />
              </div>
            </div>

            {/* Queue Filter Controls */}
            <div className="space-y-2">
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                {(['All', 'Waiting', 'Sample Collected', 'In Lab', 'Report Ready'] as const).map((st) => {
                  const count =
                    st === 'All'
                      ? receptionEntries.length
                      : receptionEntries.filter((e) => e.status === st).length;
                  return (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`py-1 px-2.5 rounded-lg transition text-[11px] flex items-center gap-1 cursor-pointer ${
                        statusFilter === st
                          ? 'bg-white text-teal-800 font-black shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{st}</span>
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Payment Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Payment:
                </span>
                <button
                  type="button"
                  onClick={() => setPaymentFilter('All')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    paymentFilter === 'All'
                      ? 'bg-[#123B6D] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({receptionEntries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentFilter('Full Payment')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                    paymentFilter === 'Full Payment'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>Full Payment ({fullPaymentCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentFilter('Advance')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                    paymentFilter === 'Advance'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span>⚠️ Advance ({advancePaymentCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentFilter('Due')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                    paymentFilter === 'Due'
                      ? 'bg-rose-700 text-white shadow-2xs'
                      : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <span>❌ Due Payment ({pendingPaymentCount})</span>
                </button>
              </div>
            </div>

            {/* Patients List Cards */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredQueue.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No patient entries match the selected search or status filter.
                </div>
              ) : (
                filteredQueue.map((entry) => {
                  const statusColors = {
                    Waiting: 'bg-amber-100 text-amber-900 border-amber-300',
                    'Sample Collected': 'bg-blue-100 text-blue-900 border-blue-300',
                    'In Lab': 'bg-purple-100 text-purple-900 border-purple-300',
                    'Report Ready': 'bg-emerald-100 text-emerald-900 border-emerald-300',
                  }[entry.status];

                  const isReportReady =
                    entry.status === 'Report Ready' ||
                    entry.technicianStatus === 'Report Generated' ||
                    Boolean(entry.reportId);

                  const paymentStatusType: 'Full Payment' | 'Advance' | 'Due' =
                    entry.dueAmount === 0 || entry.paymentStatus === 'Full Payment' || entry.paymentStatus === 'Paid'
                      ? 'Full Payment'
                      : (entry.paidAmount > 0 && entry.dueAmount > 0) || entry.paymentStatus === 'Advance' || entry.paymentStatus === 'Partial'
                      ? 'Advance'
                      : 'Due';

                  return (
                    <div
                      key={entry.id}
                      className="border border-slate-200 rounded-xl p-3.5 hover:border-teal-300 hover:shadow-xs transition bg-white space-y-2"
                    >
                      {/* Top Row: Token, Name, Payment Status, Stepper */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="bg-[#123B6D] text-white text-xs font-black px-2.5 py-1 rounded-lg shrink-0">
                            {entry.tokenNumber}
                          </span>
                          <div>
                            <div className="font-extrabold text-sm text-[#172033] flex items-center gap-2">
                              <span>{entry.patientName}</span>
                              <span className="text-xs text-slate-400 font-normal">
                                ({entry.age}Y • {entry.gender})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>UHID: {entry.uhid}</span>
                              <span>•</span>
                              <span>Mob: +91 {entry.mobile}</span>
                              <span>•</span>
                              <span>{entry.registeredAt}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Payment Status Pill */}
                          {paymentStatusType === 'Full Payment' && (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Full Paid</span>
                            </span>
                          )}
                          {paymentStatusType === 'Advance' && (
                            <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span>⚠️ Advance Paid</span>
                            </span>
                          )}
                          {paymentStatusType === 'Due' && (
                            <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span>❌ Payment Due</span>
                            </span>
                          )}

                          {/* Lock badge if report ready */}
                          {isReportReady && (
                            <span
                              className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5"
                              title="Report is ready: Patient info and tests are locked. Remaining payment management only."
                            >
                              <Lock className="w-2.5 h-2.5 text-amber-700" />
                              <span>Locked</span>
                            </span>
                          )}

                          {/* Status Stepper Button */}
                          <button
                            onClick={() => handleAdvanceStatus(entry)}
                            title="Click to advance status"
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 shrink-0 ${statusColors}`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{entry.status}</span>
                            <span className="text-[9px] opacity-60">➔</span>
                          </button>
                        </div>
                      </div>

                      {/* Middle: Selected Tests & Doctor */}
                      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="font-bold text-slate-700">Tests:</span>
                          {entry.tests.map((t, idx) => (
                            <span key={idx} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px]">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Ref: <strong>{entry.referringDoctor.split(' ')[1] || entry.referringDoctor}</strong>
                        </div>
                      </div>

                      {/* Lab Technician Pipeline Status Bar */}
                      <div className="pt-0.5">
                        {(!entry.sentToTechnician || entry.technicianStatus === 'Not Sent') ? (
                          <div className="flex flex-wrap items-center justify-between gap-2 bg-purple-50/60 border border-purple-100 px-2.5 py-1.5 rounded-lg text-xs">
                            <span className="text-purple-900 font-medium text-[11px] flex items-center gap-1.5">
                              <FlaskConical className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>Lab Status: <strong>Not Sent Yet</strong> (Waiting at desk)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSendToLab(entry)}
                              className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-[11px] font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                              title="Send sample entry to Lab Technician workstation"
                            >
                              <FlaskConical className="w-3 h-3 text-amber-300" />
                              <span>Send to Lab Tech</span>
                            </button>
                          </div>
                        ) : entry.technicianStatus === 'Sent to Lab' ? (
                          <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg text-xs">
                            <span className="text-amber-900 font-medium text-[11px] flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                              <span>
                                Sent to Lab {entry.sentToLabAt ? `(${entry.sentToLabAt})` : ''} • <strong>Specimen Dispatched to Technician</strong>
                              </span>
                            </span>
                            <span className="text-[10px] bg-amber-200/80 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-md">
                              Awaiting Technician
                            </span>
                          </div>
                        ) : entry.technicianStatus === 'Accepted' ? (
                          <div className="flex flex-wrap items-center justify-between gap-2 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg text-xs">
                            <span className="text-blue-900 font-medium text-[11px] flex items-center gap-1.5">
                              <FlaskConical className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>Sample Accepted by Technician • <strong>Testing in Progress</strong></span>
                            </span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 border border-blue-300 font-bold px-2 py-0.5 rounded-md">
                              In Lab Analysis
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs">
                            <span className="text-emerald-900 font-bold text-[11px] flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Report Completed • {entry.reportId}</span>
                            </span>
                            {entry.reportId && (
                              <button
                                type="button"
                                onClick={() => onOpenReportPortal?.(entry.reportId, entry.mobile)}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View Report</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom: Payment Summary & Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between pt-1 text-xs gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#123B6D]">
                            Total: ₹{entry.totalAmount - (entry.discountINR || 0)}
                          </span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            Paid: ₹{entry.paidAmount} ({entry.paymentMode})
                          </span>
                          {entry.dueAmount > 0 ? (
                            <span className="text-rose-700 font-black bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                              <span>Due:</span>
                              <span>₹{entry.dueAmount}</span>
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-bold bg-emerald-50 text-[10px] px-1.5 py-0.5 rounded">
                              ✓ Nil Due
                            </span>
                          )}
                          {entry.balancePaidAmount && entry.balancePaidAmount > 0 && (
                            <span className="text-teal-800 bg-teal-50 border border-teal-200 text-[10px] font-bold px-1.5 py-0.5 rounded" title="Includes later balance collection">
                              (Bal Cleared: ₹{entry.balancePaidAmount})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Quick Collect Due Button */}
                          {entry.dueAmount > 0 && (
                            <button
                              type="button"
                              onClick={() => handleOpenCollectPayment(entry)}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-black shadow-2xs transition flex items-center gap-1 cursor-pointer"
                              title="Collect remaining balance payment"
                            >
                              <IndianRupee className="w-3.5 h-3.5 text-amber-300" />
                              <span>Collect Due ₹{entry.dueAmount}</span>
                            </button>
                          )}

                          {/* Edit Entry / Manage Payment Button */}
                          {isReportReady ? (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(entry)}
                              title="Report is ready: Patient demographics & tests are locked. Manage remaining balance payment only."
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Manage Payment</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(entry)}
                              title="Edit Patient Details & Billing"
                              className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                          )}

                          {/* Thermal Print Receipt Slip */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReceipt(entry);
                              setIsReceiptModalOpen(true);
                            }}
                            title="Print Thermal Slip / Receipt"
                            className="p-1.5 bg-slate-100 hover:bg-teal-100 hover:text-teal-800 rounded-lg text-slate-600 transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp Token Slip */}
                          <button
                            type="button"
                            onClick={() => handleWhatsAppReceipt(entry)}
                            title="Send Receipt on WhatsApp"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Entry */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(entry)}
                            title="Delete Patient Entry from live queue"
                            className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-700 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 4. Thermal Receipt / Token Slip Modal (80mm POS Slip) */}
      {isReceiptModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Thermal Slip Content */}
            <div id="thermal-print-area" className="border border-dashed border-slate-300 p-4 rounded-xl bg-slate-50/50 font-mono text-xs text-slate-900 space-y-3">
              {/* Header */}
              <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-2">
                <div className="font-black text-sm uppercase tracking-tight">{labName}</div>
                <div className="text-[10px] text-slate-500">NABL Accredited • {labNabl}</div>
                <div className="text-[10px] text-slate-500">{labAddress}</div>
                <div className="text-[10px] text-slate-600">Ph: {labPhone}</div>
              </div>

              {/* Token & UHID */}
              <div className="text-center py-1 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="text-[10px] uppercase font-bold text-teal-800">Queue Token Number</div>
                <div className="text-2xl font-black text-teal-950">{selectedReceipt.tokenNumber}</div>
                <div className="text-[10px] text-teal-700">UHID: {selectedReceipt.uhid}</div>
              </div>

              {/* Patient Details */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date/Time:</span>
                  <span>{new Date().toLocaleDateString('en-IN')} {selectedReceipt.registeredAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold">{selectedReceipt.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Age / Sex:</span>
                  <span>{selectedReceipt.age} Yrs / {selectedReceipt.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile:</span>
                  <span>+91 {selectedReceipt.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ref Doctor:</span>
                  <span className="font-bold">{selectedReceipt.referringDoctor}</span>
                </div>
              </div>

              {/* Tests Breakdown */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                <div className="font-bold text-slate-700">Tests Prescribed:</div>
                {selectedReceipt.tests.map((t, idx) => (
                  <div key={idx} className="flex justify-between text-slate-800">
                    <span>{idx + 1}. {t}</span>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Gross Amount:</span>
                  <span>₹{selectedReceipt.totalAmount}</span>
                </div>
                {selectedReceipt.discountINR > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-₹{selectedReceipt.discountINR}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-200">
                  <span>Net Payable:</span>
                  <span>₹{selectedReceipt.totalAmount - selectedReceipt.discountINR}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Total Received:</span>
                  <span>₹{selectedReceipt.paidAmount} ({selectedReceipt.paymentMode})</span>
                </div>
                {selectedReceipt.balancePaidAmount && selectedReceipt.balancePaidAmount > 0 && (
                  <div className="flex justify-between text-slate-500 font-normal text-[10px]">
                    <span>• Incl. Balance Cleared:</span>
                    <span>₹{selectedReceipt.balancePaidAmount} ({selectedReceipt.balancePaymentMode || 'Cash'})</span>
                  </div>
                )}
                {selectedReceipt.dueAmount > 0 ? (
                  <div className="flex justify-between text-rose-700 font-bold text-xs pt-1 border-t border-rose-200">
                    <span>Outstanding Due Balance:</span>
                    <span>₹{selectedReceipt.dueAmount}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-emerald-700 font-bold text-[10px] pt-0.5">
                    <span>Payment Status:</span>
                    <span>Full Payment Cleared ✓ (Nil Due)</span>
                  </div>
                )}
              </div>

              {/* Barcode & Online Verification */}
              <div className="text-center space-y-1 pt-1">
                <div className="font-mono text-sm tracking-widest font-black">||||| |||| ||||| |||||||</div>
                <div className="text-[10px] text-slate-500">Download report password-free at:</div>
                <div className="text-[10px] font-bold text-teal-700">apexlab.in/report</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  const success = safePrint(() => {
                    generateThermalReceiptPdf(selectedReceipt);
                  });
                  if (!success) {
                    generateThermalReceiptPdf(selectedReceipt);
                  }
                }}
                className="bg-[#0F766E] hover:bg-[#0d655e] text-white py-2.5 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                title="Print 80mm thermal slip"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Print Slip</span>
              </button>

              <button
                type="button"
                onClick={() => generateThermalReceiptPdf(selectedReceipt)}
                className="bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                title="Download 80mm thermal receipt PDF file"
              >
                <Download className="w-3.5 h-3.5 text-emerald-300" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleWhatsAppReceipt(selectedReceipt)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. In-App Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-black text-slate-900">Remove Patient Entry?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Remove token <strong>{deleteTarget.tokenNumber} ({deleteTarget.patientName})</strong> from today's reception queue?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteReceptionEntry(deleteTarget.id);
                  setDeleteTarget(null);
                  showToast('🗑️ Entry removed from queue');
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Edit Patient Entry Modal */}
      {isEditModalOpen && editingEntry && (
        <EditReceptionEntryModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingEntry(null);
          }}
          entry={editingEntry}
          onSave={handleSaveEdit}
          onSaveAndSendToLab={handleSaveAndSendToLab}
          vendorDoctors={vendorDoctors}
        />
      )}

      {/* 7. Collect Remaining Payment Modal */}
      {isCollectPaymentOpen && collectingPaymentEntry && (
        <CollectRemainingPaymentModal
          isOpen={isCollectPaymentOpen}
          onClose={() => {
            setIsCollectPaymentOpen(false);
            setCollectingPaymentEntry(null);
          }}
          entry={collectingPaymentEntry}
          onCollectPayment={handleCollectPayment}
        />
      )}

      {/* Footer with Lab Copyright, labname.com link and Customer Care Helpline */}
      <DashboardFooter />
    </div>
  );
};
