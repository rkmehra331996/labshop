import React, { useState, useRef } from 'react';
import {
  CreditCard,
  QrCode,
  Upload,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Printer,
  Smartphone,
  Sparkles,
  Search,
  Receipt,
  FileText,
  X,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { ReceptionPatientEntry } from '../../types';
import { CollectRemainingPaymentModal } from '../CollectRemainingPaymentModal';

// Built-in clean vector QR code data URIs for instant preview/testing
const PRESET_QR_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23123B6D"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="24" height="24" fill="%23123B6D"/><rect x="14" y="14" width="16" height="16" fill="white"/><rect x="18" y="18" width="8" height="8" fill="%23123B6D"/><rect x="66" y="10" width="24" height="24" fill="%23123B6D"/><rect x="70" y="14" width="16" height="16" fill="white"/><rect x="74" y="18" width="8" height="8" fill="%23123B6D"/><rect x="10" y="66" width="24" height="24" fill="%23123B6D"/><rect x="14" y="70" width="16" height="16" fill="white"/><rect x="18" y="74" width="8" height="8" fill="%23123B6D"/><rect x="40" y="12" width="8" height="12"/><rect x="52" y="18" width="8" height="6"/><rect x="40" y="38" width="18" height="6"/><rect x="66" y="42" width="8" height="8"/><rect x="78" y="48" width="12" height="6"/><rect x="40" y="52" width="8" height="18"/><rect x="52" y="64" width="8" height="8"/><rect x="66" y="66" width="8" height="12"/><rect x="76" y="66" width="14" height="6"/><rect x="72" y="78" width="18" height="12"/><rect x="44" y="78" width="14" height="8"/><circle cx="50" cy="50" r="5" fill="%23F59E0B"/></svg>`;

const PRESET_QR_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%230F766E"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="24" height="24" fill="%230F766E"/><rect x="14" y="14" width="16" height="16" fill="white"/><rect x="18" y="18" width="8" height="8" fill="%230F766E"/><rect x="66" y="10" width="24" height="24" fill="%230F766E"/><rect x="70" y="14" width="16" height="16" fill="white"/><rect x="74" y="18" width="8" height="8" fill="%230F766E"/><rect x="10" y="66" width="24" height="24" fill="%230F766E"/><rect x="14" y="70" width="16" height="16" fill="white"/><rect x="18" y="74" width="8" height="8" fill="%230F766E"/><rect x="38" y="16" width="10" height="8"/><rect x="52" y="12" width="6" height="16"/><rect x="38" y="32" width="20" height="6"/><rect x="64" y="38" width="12" height="6"/><rect x="80" y="44" width="8" height="8"/><rect x="38" y="48" width="12" height="12"/><rect x="54" y="54" width="8" height="16"/><rect x="68" y="60" width="6" height="15"/><rect x="80" y="60" width="8" height="12"/><rect x="68" y="80" width="22" height="8"/><rect x="40" y="74" width="16" height="12"/><circle cx="50" cy="50" r="5" fill="%230F766E"/></svg>`;

export const VendorBillingTab: React.FC = () => {
  const { vendorLabSettings, updateVendorLabSettings, receptionEntries, updateReceptionEntry } = useCms();

  // QR Code 1 state
  const [qr1Url, setQr1Url] = useState<string>(vendorLabSettings.qrCode1Url || PRESET_QR_1);
  const [qr1Label, setQr1Label] = useState<string>(
    vendorLabSettings.qrCode1Label || 'Counter Billing QR (Google Pay / PhonePe / Paytm / BHIM)'
  );
  const [upiId1, setUpiId1] = useState<string>(vendorLabSettings.upiId1 || 'apexlab@icici');

  // QR Code 2 state
  const [qr2Url, setQr2Url] = useState<string>(vendorLabSettings.qrCode2Url || PRESET_QR_2);
  const [qr2Label, setQr2Label] = useState<string>(
    vendorLabSettings.qrCode2Label || 'Home Sample Collection QR (Phlebotomist Handheld)'
  );
  const [upiId2, setUpiId2] = useState<string>(vendorLabSettings.upiId2 || 'apexdiag@oksbi');

  const [merchantName, setMerchantName] = useState<string>(
    vendorLabSettings.merchantName || vendorLabSettings.labName || 'Apex Diagnostic & Pathology Lab'
  );

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showStandeeModal, setShowStandeeModal] = useState(false);

  // Hidden file inputs
  const fileInputRef1 = useRef<HTMLInputElement | null>(null);
  const fileInputRef2 = useRef<HTMLInputElement | null>(null);

  // Patient Invoices Search & Filter
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Paid' | 'Partial' | 'Due'>('All');
  const [collectPaymentEntry, setCollectPaymentEntry] = useState<ReceptionPatientEntry | null>(null);

  // Handle File Upload 1
  const handleFileUpload1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setQr1Url(dataUrl);
      updateVendorLabSettings({ qrCode1Url: dataUrl });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    };
    reader.readAsDataURL(file);
  };

  // Handle File Upload 2
  const handleFileUpload2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setQr2Url(dataUrl);
      updateVendorLabSettings({ qrCode2Url: dataUrl });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    };
    reader.readAsDataURL(file);
  };

  // Save QR Code Configurations
  const handleSaveQrConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateVendorLabSettings({
      qrCode1Url: qr1Url,
      qrCode1Label: qr1Label,
      upiId1: upiId1,
      qrCode2Url: qr2Url,
      qrCode2Label: qr2Label,
      upiId2: upiId2,
      merchantName: merchantName,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Financial Metrics
  const totalBilled = receptionEntries.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
  const totalCollected = receptionEntries.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
  const totalDue = receptionEntries.reduce((sum, e) => sum + (e.dueAmount || 0), 0);
  const totalBillsCount = receptionEntries.length;

  // Filtered Invoices
  const filteredInvoices = receptionEntries.filter((entry) => {
    const matchesSearch =
      (entry.patientName || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      (entry.uhid || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      (entry.mobile || '').includes(invoiceSearch) ||
      (entry.tokenNo || entry.tokenNumber || '').toLowerCase().includes(invoiceSearch.toLowerCase());

    const matchesFilter =
      paymentFilter === 'All' ||
      (paymentFilter === 'Paid' && entry.paymentStatus === 'Paid') ||
      (paymentFilter === 'Partial' && entry.paymentStatus === 'Partial') ||
      (paymentFilter === 'Due' && entry.paymentStatus === 'Due');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CreditCard className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-[#123B6D]">Payment & Billing Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure up to 2 QR Code images for counter & home collection payments, track INR patient billing ledgers, and collect outstanding dues.
          </p>
        </div>

        <button
          onClick={() => setShowStandeeModal(true)}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Tabletop QR Standee</span>
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Billed</span>
            <span className="p-1.5 rounded-md bg-blue-50 text-blue-600 text-xs font-bold">INR</span>
          </div>
          <div className="text-2xl font-black text-[#123B6D] mt-2">
            ₹{totalBilled.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across {totalBillsCount} patient visits</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">Collected Revenue</span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 text-xs font-bold">100% Secure</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Realized into lab bank/cash</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">Pending Dues</span>
            <span className="p-1.5 rounded-md bg-amber-50 text-amber-600 text-xs font-bold">Outstanding</span>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            ₹{totalDue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Due to be cleared before report</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Payment Modes</span>
            <QrCode className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">2 Active QRs</div>
          <div className="text-[11px] text-slate-400 mt-1">Counter + Phlebotomist Mobile</div>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Payment settings & QR Codes saved successfully! Available across website and billing desk.</span>
        </div>
      )}

      {/* 1. ADD 1 OR 2 QR CODE IMAGES FOR PAYMENT */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#123B6D]" />
              <h3 className="text-sm font-black text-slate-800">Add 1 or 2 QR Code Images for Payment</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload your lab's actual Google Pay / PhonePe / Paytm / BHIM QR codes or choose preset samples.
            </p>
          </div>

          <button
            onClick={handleSaveQrConfig}
            className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>Save Payment QRs</span>
          </button>
        </div>

        <form onSubmit={handleSaveQrConfig} className="p-6 space-y-6">
          {/* Merchant Name */}
          <div className="max-w-md text-xs">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Registered Merchant / Account Name
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
              placeholder="e.g. Apex Diagnostic & Pathology Lab"
            />
          </div>

          {/* 2 QR Codes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR CODE 1 */}
            <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#123B6D] text-white flex items-center justify-center font-black text-xs">
                    1
                  </span>
                  <span className="text-xs font-black text-[#123B6D]">Payment QR Code 1 (Primary)</span>
                </div>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Billing Counter
                </span>
              </div>

              {/* QR Image Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="w-28 h-28 shrink-0 bg-white border border-slate-300 rounded-lg p-1.5 shadow-2xs flex items-center justify-center">
                  <img
                    src={qr1Url}
                    alt="Payment QR 1"
                    className="w-full h-full object-contain rounded"
                  />
                </div>

                <div className="space-y-2 text-xs flex-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef1.current?.click()}
                      className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload QR Image</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef1}
                      onChange={handleFileUpload1}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => setQr1Url(PRESET_QR_1)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Use sample vector QR"
                    >
                      Use Sample QR
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Upload any JPG, PNG, or SVG screenshot of your UPI QR code.
                  </p>
                </div>
              </div>

              {/* QR 1 Settings */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    QR 1 Label / Purpose
                  </label>
                  <input
                    type="text"
                    value={qr1Label}
                    onChange={(e) => setQr1Label(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                    placeholder="e.g. Counter Billing QR (Google Pay / PhonePe / Paytm)"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    UPI ID 1 (VPA)
                  </label>
                  <input
                    type="text"
                    value={upiId1}
                    onChange={(e) => setUpiId1(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                    placeholder="e.g. apexlab@icici"
                  />
                </div>
              </div>
            </div>

            {/* QR CODE 2 */}
            <div className="p-5 rounded-xl border border-teal-200 bg-teal-50/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-black text-xs">
                    2
                  </span>
                  <span className="text-xs font-black text-[#0F766E]">Payment QR Code 2 (Secondary)</span>
                </div>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  Phlebotomist / Home
                </span>
              </div>

              {/* QR Image Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="w-28 h-28 shrink-0 bg-white border border-slate-300 rounded-lg p-1.5 shadow-2xs flex items-center justify-center">
                  <img
                    src={qr2Url}
                    alt="Payment QR 2"
                    className="w-full h-full object-contain rounded"
                  />
                </div>

                <div className="space-y-2 text-xs flex-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef2.current?.click()}
                      className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload QR Image</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef2}
                      onChange={handleFileUpload2}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => setQr2Url(PRESET_QR_2)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Use sample vector QR"
                    >
                      Use Sample QR
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Phlebotomist mobile QR for door-to-door collection payments.
                  </p>
                </div>
              </div>

              {/* QR 2 Settings */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    QR 2 Label / Purpose
                  </label>
                  <input
                    type="text"
                    value={qr2Label}
                    onChange={(e) => setQr2Label(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    placeholder="e.g. Home Sample Collection QR (Phlebotomist)"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    UPI ID 2 (VPA)
                  </label>
                  <input
                    type="text"
                    value={upiId2}
                    onChange={(e) => setUpiId2(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    placeholder="e.g. apexdiag@oksbi"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Save QR Codes</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. PATIENT BILLING LEDGER / INVOICES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-800">Patient Invoices & Billing Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live records of patient bills, paid amounts, outstanding balances, and receipt dispatch.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 text-xs">
            {(['All', 'Paid', 'Partial', 'Due'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setPaymentFilter(status)}
                className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                  paymentFilter === status
                    ? 'bg-[#123B6D] text-white'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              placeholder="Search by Patient Name, UHID, Token, or Mobile..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Patient & Token</th>
                <th className="px-4 py-3">Tests Prescribed</th>
                <th className="px-4 py-3">Total Bill</th>
                <th className="px-4 py-3">Paid Amount</th>
                <th className="px-4 py-3">Balance Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No matching billing records found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{inv.patientName}</div>
                      <div className="text-[11px] text-slate-500">
                        {inv.uhid} • Token #{inv.tokenNo || inv.tokenNumber || inv.id} • {inv.mobile}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate">
                      {inv.testNames.join(', ')}
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      ₹{inv.totalAmount}
                    </td>

                    <td className="px-4 py-3.5 font-bold text-emerald-700">
                      ₹{inv.paidAmount} ({inv.paymentMode})
                    </td>

                    <td className="px-4 py-3.5 font-bold text-rose-600">
                      ₹{inv.dueAmount}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                          inv.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {inv.dueAmount > 0 ? (
                        <button
                          onClick={() => setCollectPaymentEntry(inv)}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 rounded-md text-[11px] font-black transition cursor-pointer shadow-2xs"
                        >
                          Collect Due (₹{inv.dueAmount})
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Settled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standee Modal */}
      {showStandeeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden">
            <div className="bg-[#123B6D] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-black">Official Countertop Payment Standee</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Standee</span>
                </button>
                <button
                  onClick={() => setShowStandeeModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Standee Canvas for Printing */}
            <div className="p-8 text-center bg-gradient-to-b from-slate-50 to-white space-y-6">
              <div className="border-4 border-[#123B6D] rounded-2xl p-6 bg-white shadow-md">
                <div className="text-2xl font-black text-[#123B6D] tracking-tight">
                  {merchantName.toUpperCase()}
                </div>
                <div className="text-xs text-slate-500 font-bold mt-1">
                  NABL Accredited • Pathology & Diagnostic Services
                </div>

                <div className="my-6 py-2 bg-amber-400 text-slate-950 font-black text-sm tracking-wider uppercase rounded-lg shadow-xs">
                  Scan & Pay with Any UPI App
                </div>

                {/* 2 QRs on Standee */}
                <div className="grid grid-cols-2 gap-6 items-center max-w-lg mx-auto">
                  {/* QR 1 */}
                  <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-lg border border-slate-300 shadow-xs flex items-center justify-center">
                      <img src={qr1Url} alt="QR 1" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-[11px] font-black text-[#123B6D] mt-2 truncate">
                      {qr1Label}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{upiId1}</div>
                  </div>

                  {/* QR 2 */}
                  <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-lg border border-slate-300 shadow-xs flex items-center justify-center">
                      <img src={qr2Url} alt="QR 2" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-[11px] font-black text-[#0F766E] mt-2 truncate">
                      {qr2Label}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{upiId2}</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-4">
                  <span>Google Pay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM UPI</span> • <span>All Indian Banks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collect Remaining Payment Modal */}
      {collectPaymentEntry && (
        <CollectRemainingPaymentModal
          isOpen={!!collectPaymentEntry}
          onClose={() => setCollectPaymentEntry(null)}
          entry={collectPaymentEntry}
          onPaymentCollected={(updated) => {
            updateReceptionEntry(updated.id, updated);
            setCollectPaymentEntry(null);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
          }}
        />
      )}
    </div>
  );
};
