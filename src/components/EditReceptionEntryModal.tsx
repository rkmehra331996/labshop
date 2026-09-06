import React, { useState, useEffect } from 'react';
import { X, Check, FlaskConical, AlertCircle, Save, Lock, CreditCard, IndianRupee } from 'lucide-react';
import { ReceptionPatientEntry } from '../types';

interface EditReceptionEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ReceptionPatientEntry | null;
  onSave: (updatedEntry: ReceptionPatientEntry) => void;
  onSaveAndSendToLab?: (updatedEntry: ReceptionPatientEntry) => void;
  vendorDoctors?: Array<{ id: string; name: string; specialty: string }>;
}

const COMMON_TESTS = [
  { name: 'Complete Blood Count (CBC)', price: 350, sample: 'EDTA Whole Blood' },
  { name: 'Fasting Blood Sugar (FBS)', price: 120, sample: 'Fluoride Plasma' },
  { name: 'Kidney Function Test (KFT)', price: 600, sample: 'Serum Clot' },
  { name: 'Liver Function Test (LFT)', price: 650, sample: 'Serum Clot' },
  { name: 'Lipid Profile', price: 550, sample: 'Serum Clot' },
  { name: 'Thyroid Profile (Total)', price: 450, sample: 'Serum Clot' },
  { name: 'HbA1c (Glycosylated Hb)', price: 450, sample: 'EDTA Whole Blood' },
  { name: 'Dengue Serology (NS1 + Platelets)', price: 800, sample: 'Serum + EDTA' },
  { name: 'Urine Routine & Microscopic', price: 150, sample: 'Sterile Urine' },
  { name: 'Vitamin D3 & B12 Combo', price: 1200, sample: 'Serum Clot' },
];

export const EditReceptionEntryModal: React.FC<EditReceptionEntryModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSave,
  onSaveAndSendToLab,
  vendorDoctors = [],
}) => {
  if (!isOpen || !entry) return null;

  // Determine if report is already generated / ready
  const isReportReady =
    entry.status === 'Report Ready' ||
    entry.technicianStatus === 'Report Generated' ||
    Boolean(entry.reportId);

  const [patientName, setPatientName] = useState(entry.patientName);
  const [age, setAge] = useState(String(entry.age));
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(entry.gender);
  const [mobile, setMobile] = useState(entry.mobile);
  const [referringDoctor, setReferringDoctor] = useState(entry.referringDoctor);
  const [selectedTests, setSelectedTests] = useState<string[]>(entry.tests || []);
  const [sampleType, setSampleType] = useState(entry.sampleType);
  const [totalAmount, setTotalAmount] = useState<number>(entry.totalAmount);
  const [discountINR, setDiscountINR] = useState<number>(entry.discountINR || 0);
  const [paidAmount, setPaidAmount] = useState<number>(entry.paidAmount);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card'>(entry.paymentMode || 'UPI');
  const [paymentStatus, setPaymentStatus] = useState<'Full Payment' | 'Advance' | 'Pending' | 'Paid'>(
    entry.paymentStatus === 'Full Payment' || entry.paymentStatus === 'Paid'
      ? 'Full Payment'
      : entry.paymentStatus === 'Advance' || (entry.paidAmount > 0 && entry.dueAmount > 0)
      ? 'Advance'
      : 'Pending'
  );
  const [status, setStatus] = useState<ReceptionPatientEntry['status']>(entry.status);
  const [notes, setNotes] = useState(entry.notes || '');

  // Reset when entry changes
  useEffect(() => {
    if (entry) {
      setPatientName(entry.patientName);
      setAge(String(entry.age));
      setGender(entry.gender);
      setMobile(entry.mobile);
      setReferringDoctor(entry.referringDoctor);
      setSelectedTests(entry.tests || []);
      setSampleType(entry.sampleType);
      setTotalAmount(entry.totalAmount);
      setDiscountINR(entry.discountINR || 0);
      setPaidAmount(entry.paidAmount);
      setPaymentMode(entry.paymentMode || 'UPI');
      setPaymentStatus(
        entry.paymentStatus === 'Full Payment' || entry.paymentStatus === 'Paid'
          ? 'Full Payment'
          : entry.paymentStatus === 'Advance' || (entry.paidAmount > 0 && entry.dueAmount > 0)
          ? 'Advance'
          : 'Pending'
      );
      setStatus(entry.status);
      setNotes(entry.notes || '');
    }
  }, [entry]);

  // Recalculate financial due
  const netPayable = Math.max(0, totalAmount - (discountINR || 0));
  const dueAmount = Math.max(0, netPayable - (paidAmount || 0));

  // Quick payment status actions
  const handleSelectPaymentPreset = (type: 'Full Payment' | 'Advance' | 'Due') => {
    if (type === 'Full Payment') {
      setPaidAmount(netPayable);
      setPaymentStatus('Full Payment');
    } else if (type === 'Due') {
      setPaidAmount(0);
      setPaymentStatus('Due Payment');
    } else if (type === 'Advance') {
      const half = Math.round(netPayable / 2);
      setPaidAmount(half);
      setPaymentStatus('Advance');
    }
  };

  const handlePaidAmountChange = (val: number) => {
    const clamped = Math.max(0, Math.min(netPayable, val));
    setPaidAmount(clamped);
    if (clamped >= netPayable) {
      setPaymentStatus('Full Payment');
    } else if (clamped > 0) {
      setPaymentStatus('Advance');
    } else {
      setPaymentStatus('Due Payment');
    }
  };

  const handleToggleTest = (testName: string, testPrice: number, suggestedSample?: string) => {
    if (isReportReady) return; // Prevent changing tests once report is ready

    if (selectedTests.includes(testName)) {
      const remaining = selectedTests.filter((t) => t !== testName);
      setSelectedTests(remaining);
      setTotalAmount((prev) => Math.max(0, prev - testPrice));
    } else {
      setSelectedTests([...selectedTests, testName]);
      setTotalAmount((prev) => prev + testPrice);
      if (suggestedSample && sampleType.includes('EDTA')) {
        setSampleType(suggestedSample);
      }
    }
  };

  const handleSaveInternal = (sendToLab: boolean = false) => {
    if (!patientName.trim()) {
      alert('Patient name is required');
      return;
    }

    // Determine final payment status
    let finalPaymentStatus: ReceptionPatientEntry['paymentStatus'] = 'Pending';
    if (dueAmount === 0 || paidAmount >= netPayable) {
      finalPaymentStatus = 'Full Payment';
    } else if (paidAmount > 0) {
      finalPaymentStatus = 'Advance';
    } else {
      finalPaymentStatus = 'Pending';
    }

    const updated: ReceptionPatientEntry = {
      ...entry,
      patientName: isReportReady ? entry.patientName : patientName.trim(),
      age: isReportReady ? entry.age : age.trim() || '30',
      gender: isReportReady ? entry.gender : gender,
      mobile: isReportReady ? entry.mobile : mobile.trim(),
      referringDoctor: isReportReady ? entry.referringDoctor : referringDoctor,
      tests: isReportReady ? entry.tests : selectedTests.length > 0 ? selectedTests : ['Complete Blood Count (CBC)'],
      sampleType: isReportReady ? entry.sampleType : sampleType,
      totalAmount: isReportReady ? entry.totalAmount : totalAmount,
      discountINR: isReportReady ? entry.discountINR : discountINR,
      paidAmount,
      dueAmount,
      paymentMode,
      paymentStatus: finalPaymentStatus,
      // If report is already ready, keep status and technicianStatus unchanged
      status: isReportReady ? entry.status : sendToLab ? 'In Lab' : status,
      sentToTechnician: isReportReady ? entry.sentToTechnician : sendToLab ? true : entry.sentToTechnician,
      technicianStatus: isReportReady
        ? entry.technicianStatus
        : sendToLab
        ? 'Sent to Lab'
        : entry.technicianStatus || (sendToLab ? 'Sent to Lab' : 'Not Sent'),
      sentToLabAt: isReportReady
        ? entry.sentToLabAt
        : sendToLab
        ? `Today, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
        : entry.sentToLabAt,
      notes: notes.trim() || undefined,
    };

    if (sendToLab && onSaveAndSendToLab && !isReportReady) {
      onSaveAndSendToLab(updated);
    } else {
      onSave(updated);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#123B6D] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-white font-black px-2.5 py-1 rounded-lg text-xs">
              {entry.tokenNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {isReportReady ? 'Payment Management (Report Ready)' : 'Edit Patient Entry & Billing'}
                </h2>
                {isReportReady && (
                  <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>LOCKED</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100">
                UHID: {entry.uhid} • Registered: {entry.registeredAt}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lock Banner if Report is Ready */}
        {isReportReady && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 sm:px-6 flex items-start gap-2.5 text-amber-950 text-xs">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-black text-amber-900 flex items-center gap-1.5">
                <span>Diagnostic Report Issued ({entry.reportId || 'Report Ready'})</span>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-1.5 py-0.2 rounded">
                  Entry Locked
                </span>
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Because the laboratory report has already been clinically verified and issued, patient demographics and test selections cannot be altered. Only remaining balance payment and payment status management can be updated.
              </p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>
                  Patient Full Name <span className="text-rose-500">*</span>
                </span>
                {isReportReady && (
                  <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </label>
              <input
                type="text"
                disabled={isReportReady}
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden ${
                  isReportReady
                    ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-900 border-slate-300'
                }`}
                placeholder="e.g. Ramesh Kumar Verma"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>
                  Age & Gender <span className="text-rose-500">*</span>
                </span>
                {isReportReady && (
                  <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  disabled={isReportReady}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={`w-16 px-2.5 py-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-center ${
                    isReportReady
                      ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-900 border-slate-300'
                  }`}
                />
                <select
                  disabled={isReportReady}
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className={`flex-1 px-2.5 py-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden ${
                    isReportReady
                      ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-900 border-slate-300'
                  }`}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>10-Digit Mobile Number (WhatsApp)</span>
                {isReportReady && (
                  <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">+91</span>
                <input
                  type="tel"
                  disabled={isReportReady}
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className={`w-full pl-11 pr-3 py-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden ${
                    isReportReady
                      ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-900 border-slate-300'
                  }`}
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Referring Doctor</span>
                {isReportReady && (
                  <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </label>
              <select
                disabled={isReportReady}
                value={referringDoctor}
                onChange={(e) => setReferringDoctor(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden ${
                  isReportReady
                    ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-900 border-slate-300'
                }`}
              >
                <option value="Self / Walk-in Patient">Self / Walk-in Patient</option>
                <option value="Dr. S. K. Gupta (MD Med)">Dr. S. K. Gupta (MD Med)</option>
                <option value="Dr. Anita Joshi, MD (Obs & Gynae)">Dr. Anita Joshi, MD (Obs & Gynae)</option>
                <option value="Dr. Hardeep Bawa, MS (Gen Surgery)">Dr. Hardeep Bawa, MS (Gen Surgery)</option>
                <option value="Dr. M. K. Aggarwal, MD (Chest & Allergy)">Dr. M. K. Aggarwal, MD</option>
                {vendorDoctors.map((doc) => (
                  <option key={doc.id} value={`${doc.name} (${doc.specialty})`}>
                    {doc.name} ({doc.specialty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Test Panels */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>Diagnostic Tests Prescribed ({selectedTests.length} selected)</span>
                {isReportReady && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Locked by Report
                  </span>
                )}
              </label>
              {!isReportReady && <span className="text-[11px] text-slate-400">Click to toggle</span>}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
              {COMMON_TESTS.map((t) => {
                const isSelected = selectedTests.includes(t.name);
                return (
                  <button
                    type="button"
                    disabled={isReportReady}
                    key={t.name}
                    onClick={() => handleToggleTest(t.name, t.price, t.sample)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                      isSelected
                        ? isReportReady
                          ? 'bg-teal-900/80 text-white border-teal-900 cursor-not-allowed'
                          : 'bg-teal-700 text-white border-teal-800 shadow-2xs cursor-pointer'
                        : isReportReady
                        ? 'opacity-40 bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 cursor-pointer'
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                      ₹{t.price}
                    </span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sample Tube Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Primary Sample Tube / Container</span>
              {isReportReady && (
                <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> Locked
                </span>
              )}
            </label>
            <select
              disabled={isReportReady}
              value={sampleType}
              onChange={(e) => setSampleType(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden ${
                isReportReady
                  ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-900 border-slate-300'
              }`}
            >
              <option value="EDTA Whole Blood (Lavender Tube)">EDTA Whole Blood (Lavender Tube - CBC / HbA1c)</option>
              <option value="Serum Clot Activator (Yellow / Red Tube)">Serum Clot Activator (Yellow/Red - LFT/KFT/Lipid)</option>
              <option value="Sodium Fluoride Plasma (Grey Tube)">Sodium Fluoride Plasma (Grey Tube - Fasting/PP Sugar)</option>
              <option value="Serum Clot + EDTA Dual Tubes">Serum Clot + EDTA Dual Tubes</option>
              <option value="Sterile Midstream Urine Container">Sterile Midstream Urine Container</option>
              <option value="Sodium Citrate Plasma (Blue Tube)">Sodium Citrate Plasma (Blue Tube - PT/INR)</option>
            </select>
          </div>

          {/* Billing & Payment Adjustment (ALWAYS ACTIVE & MANAGABLE) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-teal-700" />
                <span>Payment Management & Remaining Balance</span>
              </h4>
              {isReportReady && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Active Payment Settlement
                </span>
              )}
            </div>

            {/* Payment Status Presets */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Payment Status Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPaymentPreset('Full Payment')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                    paidAmount >= netPayable
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                      : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Full Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPaymentPreset('Advance')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                    paidAmount > 0 && paidAmount < netPayable
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <span>⚠️ Advance</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPaymentPreset('Due')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                    paidAmount === 0
                      ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                      : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <span>❌ Due Payment</span>
                </button>
              </div>
            </div>

            {/* Financial Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Total Bill (₹)</label>
                <input
                  type="number"
                  disabled={isReportReady}
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                  className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-hidden ${
                    isReportReady
                      ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-900 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Discount (₹)</label>
                <input
                  type="number"
                  disabled={isReportReady}
                  value={discountINR}
                  onChange={(e) => setDiscountINR(Number(e.target.value) || 0)}
                  className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-hidden ${
                    isReportReady
                      ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-900 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Amount Paid (₹) <span className="text-emerald-700 font-extrabold">*</span>
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => handlePaidAmountChange(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-emerald-400 rounded-lg text-xs font-extrabold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Balance Due</label>
                <div
                  className={`px-2.5 py-1.5 border rounded-lg text-xs font-black text-center ${
                    dueAmount > 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  ₹{dueAmount}
                </div>
              </div>
            </div>

            {/* Quick Settle Due Button if dueAmount > 0 */}
            {dueAmount > 0 && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2 flex items-center justify-between gap-2">
                <div className="text-[11px] text-amber-900">
                  <span className="font-bold">Remaining Due: ₹{dueAmount}</span>
                  <span className="text-amber-700 ml-1">
                    (Advance ₹{paidAmount} of ₹{netPayable} paid)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPaymentPreset('Full Payment')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Settle Full Due (Pay ₹{dueAmount})</span>
                </button>
              </div>
            )}

            {/* Payment Mode */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Payment Mode:</span>
                {(['UPI', 'Cash', 'Card'] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setPaymentMode(m)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      paymentMode === m
                        ? 'bg-[#123B6D] text-white border-[#123B6D]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {m === 'UPI' ? '📱 UPI' : m === 'Cash' ? '💵 Cash' : '💳 Card'}
                  </button>
                ))}
              </div>

              {!isReportReady && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Queue Status:</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Waiting">Waiting</option>
                    <option value="Sample Collected">Sample Collected</option>
                    <option value="In Lab">In Lab</option>
                    <option value="Report Ready">Report Ready</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Front-Desk / Payment Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Balance settled at counter • Verified by Reception Desk"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {/* Save & Send to Lab Tech (Only when report is NOT ready) */}
            {!isReportReady && (
              <button
                type="button"
                onClick={() => handleSaveInternal(true)}
                className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Save changes and immediately dispatch to Lab Technician Workstation"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Save & Send to Lab</span>
              </button>
            )}

            {/* Save Changes / Save Payment Settlement */}
            <button
              type="button"
              onClick={() => handleSaveInternal(false)}
              className="px-4 py-2 bg-[#123B6D] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isReportReady ? 'Save Payment Settlement' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
