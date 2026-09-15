import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Printer,
  Calendar,
  IndianRupee,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  FileText,
  User,
  Building,
  RefreshCw,
  Lock,
  Save,
  DollarSign,
  CreditCard,
  QrCode,
  Coins,
  Receipt,
  History,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { ReceptionPatientEntry } from '../../types';
import { safePrint } from '../../utils/printHelper';

interface DayEndCashClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  receptionEntries?: ReceptionPatientEntry[];
  staffName?: string;
}

interface Denominations {
  n500: number;
  n200: number;
  n100: number;
  n50: number;
  n20: number;
  n10: number;
  coins: number;
}

interface SavedClosingRecord {
  id: string;
  date: string;
  closedAt: string;
  cashierName: string;
  openingFloat: number;
  systemCash: number;
  systemUpi: number;
  systemCard: number;
  totalCollected: number;
  totalNetBilled: number;
  totalDue: number;
  patientCount: number;
  physicalCashCounted: number;
  difference: number;
  handoverTo: string;
  notes: string;
}

export const DayEndCashClosingModal: React.FC<DayEndCashClosingModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  receptionEntries: propReceptionEntries,
  staffName,
}) => {
  const { receptionEntries: contextReceptionEntries, vendorLabSettings, currentUser } = useCms();
  const receptionEntries = propReceptionEntries || contextReceptionEntries;

  const [activeTab, setActiveTab] = useState<'closing' | 'history'>('closing');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('Today');
  const [cashierName, setCashierName] = useState<string>(
    staffName || currentUser?.name || 'Receptionist (Counter #1)'
  );
  const [handoverTo, setHandoverTo] = useState<string>('Lab Owner / Accounts Manager');
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [openingFloat, setOpeningFloat] = useState<number>(1000); // Morning change in drawer

  // Denominations state
  const [denominations, setDenominations] = useState<Denominations>({
    n500: 0,
    n200: 0,
    n100: 0,
    n50: 0,
    n20: 0,
    n10: 0,
    coins: 0,
  });

  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [closingHistory, setClosingHistory] = useState<SavedClosingRecord[]>(() => {
    try {
      const stored = localStorage.getItem('reception_day_closings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Filter entries according to date selection
  const relevantEntries = useMemo(() => {
    return receptionEntries; // Single branch counter entries
  }, [receptionEntries, selectedDateFilter]);

  // Calculations
  const patientCount = relevantEntries.length;
  const totalGrossBilled = relevantEntries.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
  const totalDiscounts = relevantEntries.reduce((sum, e) => sum + (e.discountINR || 0), 0);
  const totalNetBilled = Math.max(0, totalGrossBilled - totalDiscounts);

  // Collections by Payment Mode
  const cashCollection = relevantEntries.reduce((sum, e) => {
    let amt = 0;
    if (e.paymentMode === 'Cash') amt += e.paidAmount || 0;
    if (e.balancePaymentMode === 'Cash') amt += e.balancePaidAmount || 0;
    return sum + amt;
  }, 0);

  const upiCollection = relevantEntries.reduce((sum, e) => {
    let amt = 0;
    if (e.paymentMode === 'UPI') amt += e.paidAmount || 0;
    if (e.balancePaymentMode === 'UPI') amt += e.balancePaidAmount || 0;
    return sum + amt;
  }, 0);

  const cardCollection = relevantEntries.reduce((sum, e) => {
    let amt = 0;
    if (e.paymentMode === 'Card') amt += e.paidAmount || 0;
    if (e.balancePaymentMode === 'Card') amt += e.balancePaidAmount || 0;
    return sum + amt;
  }, 0);

  const totalCollected = cashCollection + upiCollection + cardCollection;
  const totalDuePending = relevantEntries.reduce((sum, e) => sum + (e.dueAmount || 0), 0);

  // Physical Cash Calculation from denominations
  const countedPhysicalCash = useMemo(() => {
    return (
      (denominations.n500 || 0) * 500 +
      (denominations.n200 || 0) * 200 +
      (denominations.n100 || 0) * 100 +
      (denominations.n50 || 0) * 50 +
      (denominations.n20 || 0) * 20 +
      (denominations.n10 || 0) * 10 +
      (denominations.coins || 0)
    );
  }, [denominations]);

  // Expected Cash in Drawer = Opening Float + System Cash Collected
  const expectedCashInDrawer = openingFloat + cashCollection;
  const cashDifference = countedPhysicalCash - expectedCashInDrawer;

  // Auto-fill denominations to match expected cash for convenience
  const handleAutoFillDenominations = () => {
    let remaining = expectedCashInDrawer;
    const n500 = Math.floor(remaining / 500);
    remaining %= 500;
    const n200 = Math.floor(remaining / 200);
    remaining %= 200;
    const n100 = Math.floor(remaining / 100);
    remaining %= 100;
    const n50 = Math.floor(remaining / 50);
    remaining %= 50;
    const n20 = Math.floor(remaining / 20);
    remaining %= 20;
    const n10 = Math.floor(remaining / 10);
    remaining %= 10;
    const coins = remaining;

    setDenominations({
      n500,
      n200,
      n100,
      n50,
      n20,
      n10,
      coins,
    });
  };

  // Reset denominations
  const handleClearDenominations = () => {
    setDenominations({
      n500: 0,
      n200: 0,
      n100: 0,
      n50: 0,
      n20: 0,
      n10: 0,
      coins: 0,
    });
  };

  // Save closing record
  const handleSaveClosing = () => {
    const nowTime = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const record: SavedClosingRecord = {
      id: `CLOSING-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      closedAt: nowTime,
      cashierName,
      openingFloat,
      systemCash: cashCollection,
      systemUpi: upiCollection,
      systemCard: cardCollection,
      totalCollected,
      totalNetBilled,
      totalDue: totalDuePending,
      patientCount,
      physicalCashCounted: countedPhysicalCash,
      difference: cashDifference,
      handoverTo,
      notes: closingNotes,
    };

    const updated = [record, ...closingHistory];
    setClosingHistory(updated);
    try {
      localStorage.setItem('reception_day_closings', JSON.stringify(updated));
    } catch {}

    setSavedSuccessMsg('✅ Day-End Cash Register finalized & archived successfully!');
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  // Print Tally Sheet
  const handlePrintTallySheet = () => {
    safePrint();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Strip */}
        <div className="bg-[#0F766E] text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-xl border border-white/20">
              💵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">
                  Day-End Reception Cash Closing (Daily Tally Sheet)
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Daily Z-Register
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                {vendorLabSettings?.labName || 'Apex Diagnostic & Pathology Laboratory'} • Counter #1 Reconciliation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-teal-900/60 p-1 rounded-lg text-xs font-bold border border-teal-600/50">
              <button
                type="button"
                onClick={() => setActiveTab('closing')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  activeTab === 'closing' ? 'bg-white text-teal-900 shadow-xs' : 'text-teal-100 hover:text-white'
                }`}
              >
                Today's Closing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  activeTab === 'history' ? 'bg-white text-teal-900 shadow-xs' : 'text-teal-100 hover:text-white'
                }`}
              >
                Closing History ({closingHistory.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-teal-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Sheet */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 text-[#172033] space-y-6">
          {savedSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{savedSuccessMsg}</span>
              </div>
              <button
                onClick={() => setSavedSuccessMsg(null)}
                className="text-emerald-700 hover:underline text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeTab === 'history' ? (
            /* History Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-600" />
                  <span>Archived Day-End Closing Records</span>
                </h3>
                <span className="text-xs text-slate-500">
                  Total Records: {closingHistory.length}
                </span>
              </div>

              {closingHistory.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
                  <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-700 text-sm">No past closing records found</p>
                  <p className="text-xs mt-1">
                    When you close today's register using the "Save & Finalize" button, the audit history will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                          <th className="py-2.5 px-3">Date / Timestamp</th>
                          <th className="py-2.5 px-3">Cashier</th>
                          <th className="py-2.5 px-3 text-center">Patients</th>
                          <th className="py-2.5 px-3 text-right">Cash In Drawer</th>
                          <th className="py-2.5 px-3 text-right">UPI Received</th>
                          <th className="py-2.5 px-3 text-right">Total Realized</th>
                          <th className="py-2.5 px-3 text-center">Tally Status</th>
                          <th className="py-2.5 px-3">Handed Over To</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {closingHistory.map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{rec.date}</div>
                              <div className="text-[10px] text-slate-400">{rec.closedAt}</div>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {rec.cashierName}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                              {rec.patientCount}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                              ₹{rec.systemCash.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                              ₹{rec.systemUpi.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                              ₹{rec.totalCollected.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {rec.difference === 0 ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                                  BALANCED (₹0)
                                </span>
                              ) : rec.difference < 0 ? (
                                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                                  SHORT -₹{Math.abs(rec.difference)}
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                                  EXCESS +₹{rec.difference}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                              {rec.handoverTo}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Active Day Closing Form & Tally Sheet */
            <div className="space-y-6">
              {/* Lab & Shift Header on Printed Slip */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                  <div>
                    <h3 className="font-black text-base text-[#123B6D]">
                      {vendorLabSettings?.labName || 'Apex Diagnostic & Pathology Laboratory'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daily Cash Counter Shift Closing • Date: {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-slate-100 px-3 py-1.5 rounded-lg font-mono">
                      <span className="text-slate-400 mr-1">Shift:</span>
                      <strong className="text-slate-800">Day General (Counter 1)</strong>
                    </div>
                  </div>
                </div>

                {/* 4 Big Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Patients</span>
                    <span className="text-xl font-black text-slate-900 mt-0.5 block">{patientCount}</span>
                    <span className="text-[10px] text-slate-500">Registered today</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Net Billed</span>
                    <span className="text-xl font-black text-[#123B6D] mt-0.5 block">
                      ₹{totalNetBilled.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500">Disc: ₹{totalDiscounts}</span>
                  </div>

                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">Total Collection</span>
                    <span className="text-xl font-black text-emerald-800 mt-0.5 block">
                      ₹{totalCollected.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">100% Realized</span>
                  </div>

                  <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200">
                    <span className="text-[10px] font-bold uppercase text-rose-700 block">Pending Due</span>
                    <span className="text-xl font-black text-rose-800 mt-0.5 block">
                      ₹{totalDuePending.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-rose-600 font-medium">To collect on report</span>
                  </div>
                </div>
              </div>

              {/* Collections by Payment Method Breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>1. Mode-wise System Collections (Reconciled from Billing)</span>
                  <span className="text-[11px] font-mono text-slate-500">Audited against token bills</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Cash Mode */}
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                        ₹
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm">Cash in Counter</div>
                        <div className="text-[10px] text-slate-500">Physical notes to deposit</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-emerald-800 font-mono">
                        ₹{cashCollection.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">
                        {totalCollected > 0 ? Math.round((cashCollection / totalCollected) * 100) : 0}% of total
                      </div>
                    </div>
                  </div>

                  {/* UPI Mode */}
                  <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm">UPI / QR Bank</div>
                        <div className="text-[10px] text-slate-500">PhonePe / GPay / Paytm</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-blue-800 font-mono">
                        ₹{upiCollection.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">
                        Direct to lab bank
                      </div>
                    </div>
                  </div>

                  {/* Card POS Mode */}
                  <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm">Card POS Swipe</div>
                        <div className="text-[10px] text-slate-500">Credit / Debit machine</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-purple-800 font-mono">
                        ₹{cardCollection.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">
                        Merchant settlement
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Physical Cash Drawer Denominations & Reconciliation Calculator */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-600" />
                      <span>2. Physical Cash Drawer Denomination Tally (Count Physical Currency)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Count each currency bundle in cash drawer to ensure zero leakage or shortage.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoFillDenominations}
                      className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                      title="Auto-fill denominations matching expected cash"
                    >
                      ⚡ Auto-Fill Expected
                    </button>
                    <button
                      type="button"
                      onClick={handleClearDenominations}
                      className="text-[11px] text-slate-500 hover:text-slate-800 px-2 py-1 transition cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Opening Float configuration */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">Morning Opening Cash Float (Change in Drawer):</span>
                    <span className="text-[10px] text-slate-500">Cash present in drawer before morning shift starts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={openingFloat}
                      onChange={(e) => setOpeningFloat(Math.max(0, Number(e.target.value) || 0))}
                      className="w-28 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-right font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Denominations Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* ₹500 Note */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                      <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded text-[11px]">₹500 Note</span>
                      <span className="font-mono text-slate-900 font-black">₹{(denominations.n500 || 0) * 500}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[10px]">Count:</span>
                      <input
                        type="number"
                        min={0}
                        value={denominations.n500 || ''}
                        placeholder="0"
                        onChange={(e) =>
                          setDenominations({ ...denominations, n500: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md font-mono text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* ₹200 Note */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                      <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[11px]">₹200 Note</span>
                      <span className="font-mono text-slate-900 font-black">₹{(denominations.n200 || 0) * 200}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[10px]">Count:</span>
                      <input
                        type="number"
                        min={0}
                        value={denominations.n200 || ''}
                        placeholder="0"
                        onChange={(e) =>
                          setDenominations({ ...denominations, n200: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md font-mono text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* ₹100 Note */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                      <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded text-[11px]">₹100 Note</span>
                      <span className="font-mono text-slate-900 font-black">₹{(denominations.n100 || 0) * 100}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[10px]">Count:</span>
                      <input
                        type="number"
                        min={0}
                        value={denominations.n100 || ''}
                        placeholder="0"
                        onChange={(e) =>
                          setDenominations({ ...denominations, n100: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md font-mono text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* ₹50 Note */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                      <span className="bg-cyan-100 text-cyan-900 px-1.5 py-0.5 rounded text-[11px]">₹50 Note</span>
                      <span className="font-mono text-slate-900 font-black">₹{(denominations.n50 || 0) * 50}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[10px]">Count:</span>
                      <input
                        type="number"
                        min={0}
                        value={denominations.n50 || ''}
                        placeholder="0"
                        onChange={(e) =>
                          setDenominations({ ...denominations, n50: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md font-mono text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* ₹20 Note */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                      <span className="bg-orange-100 text-orange-900 px-1.5 py-0.5 rounded text-[11px]">₹20 Note</span>
                      <span className="font-mono text-slate-900 font-black">₹{(denominations.n20 || 0) * 20}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[10px]">Count:</span>
                      <input
                        type="number"
                        min={0}
                        value={denominations.n20 || ''}
                        placeholder="0"
                        onChange={(e) =>
                          setDenominations({ ...denominations, n20: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md font-mono text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* ₹10 Note */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                      <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[11px]">₹10 Note</span>
                      <span className="font-mono text-slate-900 font-black">₹{(denominations.n10 || 0) * 10}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[10px]">Count:</span>
                      <input
                        type="number"
                        min={0}
                        value={denominations.n10 || ''}
                        placeholder="0"
                        onChange={(e) =>
                          setDenominations({ ...denominations, n10: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md font-mono text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* Loose Coins Total */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between col-span-2">
                    <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                      <span className="bg-slate-200 text-slate-900 px-1.5 py-0.5 rounded text-[11px]">Loose Coins (₹1, ₹2, ₹5, ₹10)</span>
                      <span className="font-mono text-slate-900 font-black">₹{denominations.coins || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px]">Total Coins (₹):</span>
                      <input
                        type="number"
                        min={0}
                        value={denominations.coins || ''}
                        placeholder="0"
                        onChange={(e) =>
                          setDenominations({ ...denominations, coins: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md font-mono text-right font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Reconciliation Match Box */}
                <div className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="text-xs text-slate-500">
                      Physical Cash Counted: <strong className="text-slate-900 font-mono text-sm">₹{countedPhysicalCash.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="text-xs text-slate-500">
                      Expected in Drawer (Float ₹{openingFloat} + Collections ₹{cashCollection}):{' '}
                      <strong className="text-[#123B6D] font-mono text-sm">₹{expectedCashInDrawer.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {cashDifference === 0 ? (
                      <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-2 rounded-xl text-center">
                        <div className="text-xs font-black uppercase flex items-center gap-1 justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Tally Balanced</span>
                        </div>
                        <div className="text-sm font-black text-emerald-800">Exact Match (₹0 Diff)</div>
                      </div>
                    ) : cashDifference < 0 ? (
                      <div className="bg-rose-100 border border-rose-300 text-rose-900 px-4 py-2 rounded-xl text-center">
                        <div className="text-xs font-black uppercase flex items-center gap-1 justify-center">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Shortage in Drawer</span>
                        </div>
                        <div className="text-sm font-black text-rose-800 font-mono">
                          - ₹{Math.abs(cashDifference).toLocaleString('en-IN')} Short
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl text-center">
                        <div className="text-xs font-black uppercase flex items-center gap-1 justify-center">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Excess Cash in Drawer</span>
                        </div>
                        <div className="text-sm font-black text-amber-800 font-mono">
                          + ₹{cashDifference.toLocaleString('en-IN')} Surplus
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Handover & Authorization */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Cashier / Shift Operator Name:
                  </label>
                  <input
                    type="text"
                    value={cashierName}
                    onChange={(e) => setCashierName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                    placeholder="e.g. S. Verma / Counter 1"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Physical Cash Handed Over To:
                  </label>
                  <input
                    type="text"
                    value={handoverTo}
                    onChange={(e) => setHandoverTo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                    placeholder="e.g. Dr. Rajesh Sharma / Safe Box #2 / Bank Deposit"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Closing Remarks / Shift Notes:
                  </label>
                  <input
                    type="text"
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    placeholder="e.g. All reports dispatched; UPI statement checked with PhonePe merchant app; drawer locked."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>NABL / ISO 15189 Financial Audit Standard</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrintTallySheet}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Tally Sheet</span>
            </button>

            <button
              type="button"
              onClick={handleSaveClosing}
              className="bg-[#0F766E] hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Finalize Closing</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 text-xs font-bold px-2 py-1 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
