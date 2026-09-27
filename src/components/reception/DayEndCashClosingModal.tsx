import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Printer,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  Download,
  Receipt,
  History,
  FileSpreadsheet,
  Share2,
  Phone,
  Filter,
  Check,
  Building,
  Coins,
  CreditCard,
  QrCode,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Save,
  Lock,
} from 'lucide-react';
import * as XLSX from 'xlsx';
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

type DateFilterOption = 'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'Custom Date';
type PaymentFilterOption = 'All' | 'Full Payment' | 'Advance Payment' | 'Due Payment';

export const DayEndCashClosingModal: React.FC<DayEndCashClosingModalProps> = ({
  isOpen,
  onClose,
  receptionEntries: propReceptionEntries,
  staffName,
}) => {
  const { receptionEntries: contextReceptionEntries, vendorLabSettings, currentUser } = useCms();
  const receptionEntries = propReceptionEntries || contextReceptionEntries || [];

  // Active view tab
  const [activeTab, setActiveTab] = useState<'report' | 'drawer' | 'history'>('report');

  // Date Filter & Custom range
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilterOption>('Today');
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [customStartDate, setCustomStartDate] = useState<string>(todayStr);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  // Payment Filter
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilterOption>('All');

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Drawer / Closing States
  const [cashierName] = useState<string>(
    staffName || currentUser?.name || 'Reception Staff'
  );
  const [handoverTo, setHandoverTo] = useState<string>('Lab Owner / Accounts Manager');
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [openingFloat, setOpeningFloat] = useState<number>(1000);
  const [denominations, setDenominations] = useState<Denominations>({
    n500: 0,
    n200: 0,
    n100: 0,
    n50: 0,
    n20: 0,
    n10: 0,
    coins: 0,
  });

  const [closingHistory, setClosingHistory] = useState<SavedClosingRecord[]>(() => {
    try {
      const stored = localStorage.getItem('reception_day_closings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Ref for Report Capture to Image
  const reportCaptureRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to extract comparable date string 'YYYY-MM-DD' from an entry
  const getEntryDateKey = (entry: ReceptionPatientEntry): string => {
    if (entry.entryDate && /^\d{4}-\d{2}-\d{2}$/.test(entry.entryDate)) {
      return entry.entryDate;
    }
    if (entry.registeredAt) {
      // Check if registeredAt has date formatted as YYYY-MM-DD or contains date
      const match = entry.registeredAt.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (match) return match[0];
      const parsed = new Date(entry.registeredAt);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }
    // Default to today
    return todayStr;
  };

  // Date Boundaries Calculation
  const dateBoundaries = useMemo(() => {
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toISOString().split('T')[0];

    // Monday of current week
    const currentDay = today.getDay(); // 0 is Sunday
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    const mondayFormatted = monday.toISOString().split('T')[0];

    // 1st day of current month
    const firstDayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayMonthFormatted = firstDayMonth.toISOString().split('T')[0];

    return {
      today: todayFormatted,
      yesterday: yesterdayFormatted,
      monday: mondayFormatted,
      firstDayMonth: firstDayMonthFormatted,
    };
  }, []);

  // Filtered Entries according to Date Filter and Payment Filter
  const filteredEntries = useMemo(() => {
    return receptionEntries.filter((entry) => {
      const entryDate = getEntryDateKey(entry);

      // 1. Date Filter Matching
      let matchesDate = false;
      if (selectedDateFilter === 'Today') {
        matchesDate = entryDate === dateBoundaries.today;
      } else if (selectedDateFilter === 'Yesterday') {
        matchesDate = entryDate === dateBoundaries.yesterday;
      } else if (selectedDateFilter === 'This Week') {
        matchesDate = entryDate >= dateBoundaries.monday && entryDate <= dateBoundaries.today;
      } else if (selectedDateFilter === 'This Month') {
        matchesDate = entryDate >= dateBoundaries.firstDayMonth && entryDate <= dateBoundaries.today;
      } else if (selectedDateFilter === 'Custom Date') {
        const start = customStartDate || '1970-01-01';
        const end = customEndDate || '2099-12-31';
        matchesDate = entryDate >= start && entryDate <= end;
      }

      if (!matchesDate) return false;

      // 2. Payment Filter Matching
      const netTotal = Math.max(0, (entry.totalAmount || 0) - (entry.discountINR || 0));
      const received = (entry.paidAmount || 0) + (entry.balancePaidAmount || 0);
      const due = entry.dueAmount ?? Math.max(0, netTotal - received);

      const isFull = due === 0 || entry.paymentStatus === 'Full Payment' || entry.paymentStatus === 'Paid';
      const isAdvance = (due > 0 && received > 0) || entry.paymentStatus === 'Advance' || entry.paymentStatus === 'Partial';
      const isDue = (received === 0 && due > 0) || entry.paymentStatus === 'Due' || entry.paymentStatus === 'Due Payment';

      if (paymentFilter === 'Full Payment') return isFull;
      if (paymentFilter === 'Advance Payment') return isAdvance;
      if (paymentFilter === 'Due Payment') return isDue;

      return true;
    });
  }, [
    receptionEntries,
    selectedDateFilter,
    customStartDate,
    customEndDate,
    paymentFilter,
    dateBoundaries,
  ]);

  // Summary Metrics — Automatically calculated based on filtered entries
  const metrics = useMemo(() => {
    let totalEarning = 0; // Net Invoiced
    let inPocket = 0; // Actually Received
    let cashInPocket = 0;
    let upiInPocket = 0;
    let cardInPocket = 0;
    let fullPaymentAmount = 0;
    let fullPaymentCount = 0;
    let advancePaymentAmount = 0;
    let advancePaymentCount = 0;
    let duePaymentAmount = 0;
    let duePaymentCount = 0;

    filteredEntries.forEach((entry) => {
      const net = Math.max(0, (entry.totalAmount || 0) - (entry.discountINR || 0));
      totalEarning += net;

      // Received
      const initialPaid = entry.paidAmount || 0;
      const balancePaid = entry.balancePaidAmount || 0;
      const totalRec = initialPaid + balancePaid;
      inPocket += totalRec;

      // Cash / UPI breakdown
      if (entry.paymentMode === 'Cash') cashInPocket += initialPaid;
      if (entry.paymentMode === 'UPI') upiInPocket += initialPaid;
      if (entry.paymentMode === 'Card') cardInPocket += initialPaid;

      if (entry.balancePaymentMode === 'Cash') cashInPocket += balancePaid;
      if (entry.balancePaymentMode === 'UPI') upiInPocket += balancePaid;
      if (entry.balancePaymentMode === 'Card') cardInPocket += balancePaid;

      // Status Categorization
      const due = entry.dueAmount ?? Math.max(0, net - totalRec);

      if (due === 0 || entry.paymentStatus === 'Full Payment' || entry.paymentStatus === 'Paid') {
        fullPaymentAmount += totalRec;
        fullPaymentCount++;
      } else if (due > 0 && totalRec > 0) {
        advancePaymentAmount += totalRec;
        advancePaymentCount++;
        duePaymentAmount += due;
        duePaymentCount++;
      } else {
        duePaymentAmount += due;
        duePaymentCount++;
      }
    });

    return {
      totalEarning,
      inPocket,
      cashInPocket,
      upiInPocket,
      cardInPocket,
      fullPaymentAmount,
      fullPaymentCount,
      advancePaymentAmount,
      advancePaymentCount,
      duePaymentAmount,
      duePaymentCount,
      patientCount: filteredEntries.length,
    };
  }, [filteredEntries]);

  // Physical Cash Calculation from denominations (for Drawer Tab)
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

  const expectedCashInDrawer = openingFloat + metrics.cashInPocket;
  const cashDifference = countedPhysicalCash - expectedCashInDrawer;

  // Auto-fill denominations to match expected cash
  const handleAutoFillDenominations = () => {
    let remaining = Math.max(0, expectedCashInDrawer);
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

    setDenominations({ n500, n200, n100, n50, n20, n10, coins });
  };

  // Save closing record to archive
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
      systemCash: metrics.cashInPocket,
      systemUpi: metrics.upiInPocket,
      systemCard: metrics.cardInPocket,
      totalCollected: metrics.inPocket,
      totalNetBilled: metrics.totalEarning,
      totalDue: metrics.duePaymentAmount,
      patientCount: metrics.patientCount,
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

    showToast('✅ Day-End Cash Register finalized & archived successfully!');
  };

  // Canvas-based error-free report card image generator (avoids CSS/oklch parser issues)
  const renderReportToCanvas = (
    labName: string,
    address: string,
    phone: string,
    dateRangeLabel: string,
    curPaymentFilter: string
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const width = 1100;
    const rowCount = Math.max(1, filteredEntries.length);
    const rowHeight = 44;
    const headerHeight = 115;
    const metricsHeight = 115;
    const tableHeaderHeight = 40;
    const tableBodyHeight = rowCount * rowHeight;
    const tableFooterHeight = 48;
    const bottomFooterHeight = 65;
    const totalHeight =
      headerHeight + metricsHeight + tableHeaderHeight + tableBodyHeight + tableFooterHeight + bottomFooterHeight + 40;

    canvas.width = width;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, totalHeight);

    const drawBox = (x: number, y: number, w: number, h: number, r: number) => {
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.rect(x, y, w, h);
      }
    };

    // Header Banner
    ctx.beginPath();
    drawBox(20, 20, width - 40, 95, 14);
    ctx.fillStyle = '#0F766E';
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(labName, 42, 58);

    ctx.fillStyle = '#CCFBF1';
    ctx.font = 'normal 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${address}  •  Phone: +91 ${phone}`, 42, 84);

    // Header right badge
    ctx.beginPath();
    drawBox(width - 330, 32, 290, 70, 10);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();

    ctx.fillStyle = '#FDE68A';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('DAY & CASH EARNING REPORT', width - 315, 56);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'normal 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Date: ${dateRangeLabel}  •  Filter: ${curPaymentFilter}`, width - 315, 80);

    // 5 Summary Metric Cards
    const cardY = 130;
    const cardW = (width - 40 - 32) / 5;
    const cardH = 92;

    const cardDefs = [
      {
        title: 'TOTAL EARNING',
        value: `₹${metrics.totalEarning.toLocaleString('en-IN')}`,
        sub: `${metrics.patientCount} Patients Billed`,
        bg: '#EFF6FF',
        stroke: '#BFDBFE',
        text: '#1E3A8A',
      },
      {
        title: 'IN POCKET (REC.)',
        value: `₹${metrics.inPocket.toLocaleString('en-IN')}`,
        sub: `Cash: ₹${metrics.cashInPocket} • UPI: ₹${metrics.upiInPocket}`,
        bg: '#ECFDF5',
        stroke: '#A7F3D0',
        text: '#065F46',
      },
      {
        title: 'FULL PAYMENT',
        value: `₹${metrics.fullPaymentAmount.toLocaleString('en-IN')}`,
        sub: `${metrics.fullPaymentCount} Cleared (Nil Due)`,
        bg: '#F0FDFA',
        stroke: '#99F6E4',
        text: '#115E59',
      },
      {
        title: 'ADVANCE PAYMENT',
        value: `₹${metrics.advancePaymentAmount.toLocaleString('en-IN')}`,
        sub: `${metrics.advancePaymentCount} Patients Advance`,
        bg: '#FFFBEB',
        stroke: '#FDE68A',
        text: '#92400E',
      },
      {
        title: 'DUE PAYMENT',
        value: `₹${metrics.duePaymentAmount.toLocaleString('en-IN')}`,
        sub: `${metrics.duePaymentCount} Pending Balance`,
        bg: '#FFF1F2',
        stroke: '#FECDD3',
        text: '#9F1239',
      },
    ];

    cardDefs.forEach((card, idx) => {
      const cx = 20 + idx * (cardW + 8);
      ctx.beginPath();
      drawBox(cx, cardY, cardW, cardH, 12);
      ctx.fillStyle = card.bg;
      ctx.fill();
      ctx.strokeStyle = card.stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = card.text;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(card.title, cx + 12, cardY + 24);

      ctx.font = 'bold 20px monospace, sans-serif';
      ctx.fillText(card.value, cx + 12, cardY + 54);

      ctx.font = 'normal 10px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(card.sub, cx + 12, cardY + 76);
    });

    // Table Header
    const tableY = 240;
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    drawBox(20, tableY, width - 40, tableHeaderHeight, 8);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('TOKEN', 32, tableY + 25);
    ctx.fillText('DATE & TIME', 115, tableY + 25);
    ctx.fillText('CLIENT / MOBILE', 230, tableY + 25);
    ctx.fillText('TESTS SELECTED', 460, tableY + 25);
    ctx.fillText('BILL (₹)', 725, tableY + 25);
    ctx.fillText('RECEIVED (₹)', 830, tableY + 25);
    ctx.fillText('STATUS', 940, tableY + 25);
    ctx.fillText('DUE (₹)', 1015, tableY + 25);

    // Rows
    let curY = tableY + tableHeaderHeight;
    if (filteredEntries.length === 0) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'normal 13px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No patient records found for the selected filter.', width / 2, curY + 26);
      ctx.textAlign = 'left';
      curY += rowHeight;
    } else {
      filteredEntries.forEach((entry, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        ctx.fillRect(20, curY, width - 40, rowHeight);

        // Separator border
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, curY + rowHeight);
        ctx.lineTo(width - 20, curY + rowHeight);
        ctx.stroke();

        const netBilled = Math.max(0, (entry.totalAmount || 0) - (entry.discountINR || 0));
        const received = (entry.paidAmount || 0) + (entry.balancePaidAmount || 0);
        const due = entry.dueAmount ?? Math.max(0, netBilled - received);

        // Token badge
        ctx.fillStyle = '#123B6D';
        ctx.beginPath();
        drawBox(30, curY + 11, 68, 22, 5);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px monospace, sans-serif';
        ctx.fillText(entry.tokenNumber || entry.tokenNo || `TK-${101 + idx}`, 36, curY + 26);

        // Date / Time
        ctx.fillStyle = '#334155';
        ctx.font = 'normal 11px system-ui, -apple-system, sans-serif';
        ctx.fillText(entry.entryDate || todayStr, 115, curY + 20);
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'normal 10px system-ui, -apple-system, sans-serif';
        ctx.fillText(entry.registeredAt || 'Morning Shift', 115, curY + 34);

        // Client details
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        const nameText = entry.patientName ? entry.patientName.slice(0, 24) : 'Patient';
        ctx.fillText(nameText, 230, curY + 20);
        ctx.fillStyle = '#64748B';
        ctx.font = 'normal 10px monospace, sans-serif';
        ctx.fillText(`+91 ${entry.mobile || ''} (${entry.age || '-'}Y/${entry.gender?.[0] || '-'})`, 230, curY + 34);

        // Tests
        ctx.fillStyle = '#475569';
        ctx.font = 'normal 11px system-ui, -apple-system, sans-serif';
        const testsStr = Array.isArray(entry.tests) ? entry.tests.join(', ') : '';
        const displayTests = testsStr.length > 28 ? testsStr.slice(0, 26) + '...' : testsStr;
        ctx.fillText(displayTests || 'General Checkup', 460, curY + 26);

        // Bill
        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 12px monospace, sans-serif';
        ctx.fillText(`₹${netBilled.toLocaleString('en-IN')}`, 725, curY + 26);

        // Received
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 12px monospace, sans-serif';
        ctx.fillText(`₹${received.toLocaleString('en-IN')}`, 830, curY + 26);

        // Status
        const isFull = due === 0 || entry.paymentStatus === 'Full Payment' || entry.paymentStatus === 'Paid';
        const isAdv = due > 0 && received > 0;
        ctx.beginPath();
        drawBox(932, curY + 11, 65, 20, 10);
        ctx.fillStyle = isFull ? '#D1FAE5' : isAdv ? '#FEF3C7' : '#FFE4E6';
        ctx.fill();
        ctx.fillStyle = isFull ? '#065F46' : isAdv ? '#92400E' : '#9F1239';
        ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
        ctx.fillText(isFull ? 'Full Paid' : isAdv ? 'Advance' : 'Due', 941, curY + 25);

        // Due
        ctx.fillStyle = due > 0 ? '#DC2626' : '#059669';
        ctx.font = 'bold 12px monospace, sans-serif';
        ctx.fillText(due > 0 ? `₹${due.toLocaleString('en-IN')}` : '₹0', 1015, curY + 26);

        curY += rowHeight;
      });
    }

    // Totals Row
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(20, curY, width - 40, tableFooterHeight);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, curY, width - 40, tableFooterHeight);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`TOTALS (${filteredEntries.length} PATIENTS)`, 32, curY + 29);

    ctx.font = 'bold 14px monospace, sans-serif';
    ctx.fillStyle = '#1E3A8A';
    ctx.fillText(`₹${metrics.totalEarning.toLocaleString('en-IN')}`, 720, curY + 29);

    ctx.fillStyle = '#059669';
    ctx.fillText(`₹${metrics.inPocket.toLocaleString('en-IN')}`, 825, curY + 29);

    ctx.fillStyle = '#DC2626';
    ctx.fillText(`₹${metrics.duePaymentAmount.toLocaleString('en-IN')}`, 1010, curY + 29);

    curY += tableFooterHeight + 20;

    // Footer / Signature Strip
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, curY);
    ctx.lineTo(width - 20, curY);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = 'normal 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('Authorized Signature & Stamp: ___________________________', 32, curY + 24);

    ctx.textAlign = 'right';
    ctx.fillText(`Generated by Apex Lab Smart OS  •  ${new Date().toLocaleString('en-IN')}`, width - 32, curY + 24);
    ctx.textAlign = 'left';

    return canvas;
  };

  // 1. WhatsApp Share in Image Format
  const handleShareWhatsAppImage = async () => {
    setIsExporting(true);

    try {
      showToast('📸 Generating high-res report image for WhatsApp...');

      const dateRangeLabel =
        selectedDateFilter === 'Custom Date'
          ? `${customStartDate} to ${customEndDate}`
          : selectedDateFilter;

      const canvas = renderReportToCanvas(
        vendorLabSettings?.labName || 'Apex Diagnostic & Pathology Laboratory',
        vendorLabSettings?.address || 'Main Hospital Road, Medical Enclave',
        vendorLabSettings?.phone || '9876543210',
        dateRangeLabel,
        paymentFilter
      );

      // Summary text message for WhatsApp
      const summaryText =
        `📊 *DAY & CASH EARNING REPORT*\n` +
        `🏥 *${vendorLabSettings?.labName || 'Apex Diagnostic & Pathology Laboratory'}*\n` +
        `📅 *Date Filter:* ${dateRangeLabel}\n` +
        `💳 *Payment Filter:* ${paymentFilter}\n` +
        `----------------------------------------\n` +
        `💰 *Total Earning:* ₹${metrics.totalEarning.toLocaleString('en-IN')}\n` +
        `📥 *In Pocket (Received):* ₹${metrics.inPocket.toLocaleString('en-IN')}\n` +
        `   • 💵 Cash: ₹${metrics.cashInPocket.toLocaleString('en-IN')}\n` +
        `   • 📱 UPI: ₹${metrics.upiInPocket.toLocaleString('en-IN')}\n` +
        `✅ *Full Payment:* ₹${metrics.fullPaymentAmount.toLocaleString('en-IN')} (${metrics.fullPaymentCount} Patients)\n` +
        `⚠️ *Advance Payment:* ₹${metrics.advancePaymentAmount.toLocaleString('en-IN')} (${metrics.advancePaymentCount} Patients)\n` +
        `❌ *Due Payment:* ₹${metrics.duePaymentAmount.toLocaleString('en-IN')} (${metrics.duePaymentCount} Pending)\n` +
        `👥 *Total Patients:* ${metrics.patientCount}\n` +
        `----------------------------------------\n` +
        `🕒 Generated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n` +
        `_Report image has been downloaded / attached._`;

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsExporting(false);
          return;
        }

        const fileName = `Day_and_Cash_Report_${selectedDateFilter}_${todayStr}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        // Check if Web Share API with files is supported
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Day & Cash Earning Report - ${dateRangeLabel}`,
              text: summaryText,
            });
            showToast('✅ Shared via WhatsApp / Device Share!');
            setIsExporting(false);
            return;
          } catch {
            // User cancelled or share failed, fallback to download + open WhatsApp
          }
        }

        // Fallback: Download image and open WhatsApp with formatted summary
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`;
        window.open(waUrl, '_blank');

        showToast('✅ Report image downloaded & WhatsApp opened!');
        setIsExporting(false);
      }, 'image/png');
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to generate report image. Please try again.');
      setIsExporting(false);
    }
  };

  // 2. Download Excel (.xlsx) Format
  const handleDownloadExcel = () => {
    try {
      const dateRangeLabel =
        selectedDateFilter === 'Custom Date'
          ? `${customStartDate} to ${customEndDate}`
          : selectedDateFilter;

      // 1. Patient Records Sheet
      const recordsData = filteredEntries.map((entry, idx) => {
        const netBilled = Math.max(0, (entry.totalAmount || 0) - (entry.discountINR || 0));
        const received = (entry.paidAmount || 0) + (entry.balancePaidAmount || 0);
        const due = entry.dueAmount ?? Math.max(0, netBilled - received);

        const paymentStatus =
          due === 0 || entry.paymentStatus === 'Full Payment' || entry.paymentStatus === 'Paid'
            ? 'Full Payment'
            : due > 0 && received > 0
            ? 'Advance'
            : 'Due';

        return {
          'S.No': idx + 1,
          'Token Number': entry.tokenNumber || entry.tokenNo || `TK-${100 + idx + 1}`,
          'Date': entry.entryDate || entry.registeredAt || todayStr,
          'Time': entry.registeredAt || '',
          'Patient Name': entry.patientName,
          'Mobile Number': entry.mobile ? `+91 ${entry.mobile}` : '',
          'Age / Gender': `${entry.age || '-'}Y / ${entry.gender || '-'}`,
          'Referring Doctor': entry.referringDoctor || 'Self Walk-in',
          'Selected Tests': Array.isArray(entry.tests) ? entry.tests.join(', ') : '',
          'Total Bill (₹)': entry.totalAmount || 0,
          'Discount (₹)': entry.discountINR || 0,
          'Net Total Earning (₹)': netBilled,
          'In Pocket Received (₹)': received,
          'Payment Mode': entry.paymentMode || 'Cash',
          'Payment Status': paymentStatus,
          'Due Amount (₹)': due,
        };
      });

      const recordsWorksheet = XLSX.utils.json_to_sheet(recordsData);

      // Auto-fit column widths
      recordsWorksheet['!cols'] = [
        { wch: 6 }, // S.No
        { wch: 14 }, // Token
        { wch: 12 }, // Date
        { wch: 12 }, // Time
        { wch: 22 }, // Name
        { wch: 16 }, // Mobile
        { wch: 12 }, // Age/Gender
        { wch: 24 }, // Doctor
        { wch: 32 }, // Tests
        { wch: 14 }, // Total Bill
        { wch: 14 }, // Discount
        { wch: 20 }, // Net Total
        { wch: 20 }, // In Pocket
        { wch: 14 }, // Mode
        { wch: 16 }, // Status
        { wch: 14 }, // Due
      ];

      // 2. Summary Sheet
      const summaryRows = [
        { 'Metric / Parameter': 'Report Title', 'Value': 'Day & Cash Earning Report' },
        { 'Metric / Parameter': 'Laboratory Name', 'Value': vendorLabSettings?.labName || 'Apex Diagnostic Laboratory' },
        { 'Metric / Parameter': 'Date Filter', 'Value': dateRangeLabel },
        { 'Metric / Parameter': 'Payment Filter', 'Value': paymentFilter },
        { 'Metric / Parameter': 'Report Generated At', 'Value': new Date().toLocaleString('en-IN') },
        { 'Metric / Parameter': 'Total Patients', 'Value': metrics.patientCount },
        { 'Metric / Parameter': 'Total Earning (Net Invoiced ₹)', 'Value': metrics.totalEarning },
        { 'Metric / Parameter': 'In Pocket (Actually Received ₹)', 'Value': metrics.inPocket },
        { 'Metric / Parameter': '• Cash In Pocket (₹)', 'Value': metrics.cashInPocket },
        { 'Metric / Parameter': '• UPI In Pocket (₹)', 'Value': metrics.upiInPocket },
        { 'Metric / Parameter': '• Card In Pocket (₹)', 'Value': metrics.cardInPocket },
        { 'Metric / Parameter': 'Full Payment Total (₹)', 'Value': `${metrics.fullPaymentAmount} (${metrics.fullPaymentCount} Patients)` },
        { 'Metric / Parameter': 'Advance Payment Total (₹)', 'Value': `${metrics.advancePaymentAmount} (${metrics.advancePaymentCount} Patients)` },
        { 'Metric / Parameter': 'Due Payment Total (₹)', 'Value': `${metrics.duePaymentAmount} (${metrics.duePaymentCount} Patients)` },
      ];

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryRows);
      summaryWorksheet['!cols'] = [{ wch: 32 }, { wch: 36 }];

      // Build workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
      XLSX.utils.book_append_sheet(workbook, recordsWorksheet, 'Patient Earning Records');

      // Write file
      const fileName = `Day_and_Cash_Report_${selectedDateFilter.replace(/\s+/g, '_')}_${todayStr}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      showToast(`✅ Excel file "${fileName}" downloaded successfully!`);
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to export Excel file. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header Bar */}
        <div className="bg-[#0F766E] text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl border border-white/20 shadow-xs shrink-0">
              📊
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Day & Cash Workspace
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Earning & Closing
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-0.5 truncate">
                {vendorLabSettings?.labName || 'Apex Diagnostic & Pathology Laboratory'} • Daily Register & Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="hidden sm:flex bg-teal-900/60 p-1 rounded-xl text-xs font-bold border border-teal-600/50">
              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'report' ? 'bg-white text-teal-900 shadow-xs' : 'text-teal-100 hover:text-white'
                }`}
              >
                <span>📊 Earning Report</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('drawer')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'drawer' ? 'bg-white text-teal-900 shadow-xs' : 'text-teal-100 hover:text-white'
                }`}
              >
                <span>💵 Cash Drawer (Z-Register)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'history' ? 'bg-white text-teal-900 shadow-xs' : 'text-teal-100 hover:text-white'
                }`}
              >
                <span>🕒 History ({closingHistory.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-teal-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex bg-teal-800 text-xs font-bold border-b border-teal-700 px-3 py-1.5 gap-1 overflow-x-auto no-print">
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'report' ? 'bg-white text-teal-900 font-black' : 'text-teal-100'}`}
          >
            📊 Earning Report
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('drawer')}
            className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'drawer' ? 'bg-white text-teal-900 font-black' : 'text-teal-100'}`}
          >
            💵 Cash Drawer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'history' ? 'bg-white text-teal-900 font-black' : 'text-teal-100'}`}
          >
            🕒 History ({closingHistory.length})
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 text-[#172033] space-y-5">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-emerald-700 hover:underline text-xs cursor-pointer ml-3"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeTab === 'report' && (
            /* ========================================================
               TAB 1: DAY & CASH EARNING REPORT (Default Main View)
               ======================================================== */
            <div className="space-y-5">
              {/* Controls Bar: Filters & Export Actions */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 no-print">
                {/* Row 1: Date Filter Buttons */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-700" />
                      <span>Date Filter:</span>
                    </span>
                    {(['Today', 'Yesterday', 'This Week', 'This Month', 'Custom Date'] as DateFilterOption[]).map(
                      (opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedDateFilter(opt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs ${
                            selectedDateFilter === opt
                              ? 'bg-[#0F766E] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    )}
                  </div>

                  {/* Export Action Buttons: WhatsApp (Image) + Excel (.xlsx) + Print */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* WhatsApp Report in Image Format */}
                    <button
                      type="button"
                      onClick={handleShareWhatsAppImage}
                      disabled={isExporting}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-2xs cursor-pointer hover:shadow-xs active:scale-95"
                      title="Share report image on WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isExporting ? 'Generating Image...' : 'WhatsApp (Image)'}</span>
                    </button>

                    {/* Download Excel (.xlsx) */}
                    <button
                      type="button"
                      onClick={handleDownloadExcel}
                      className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-2xs cursor-pointer hover:shadow-xs active:scale-95"
                      title="Download complete report in Excel (.xlsx) spreadsheet format"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Download Excel (.xlsx)</span>
                    </button>

                    {/* Print Report */}
                    <button
                      type="button"
                      onClick={() => safePrint()}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Print Paper Report / Save as PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Print</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: Custom Date Pickers & Payment Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  {/* Custom Date Pickers (if Custom Date is chosen) */}
                  {selectedDateFilter === 'Custom Date' ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-600">From:</span>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 outline-none focus:border-teal-600 bg-white"
                      />
                      <span className="text-xs font-semibold text-slate-600">To:</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 outline-none focus:border-teal-600 bg-white"
                      />
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>
                        Showing report for: <strong>{selectedDateFilter}</strong> ({filteredEntries.length} patient records found)
                      </span>
                    </div>
                  )}

                  {/* Payment Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Filter className="w-3 h-3 text-slate-400" />
                      <span>Payment Filter:</span>
                    </span>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value as PaymentFilterOption)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-1 focus:ring-teal-600 outline-none cursor-pointer"
                    >
                      <option value="All">All Payments</option>
                      <option value="Full Payment">Full Payment</option>
                      <option value="Advance Payment">Advance Payment</option>
                      <option value="Due Payment">Due Payment</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Printable & Capturable Report Card */}
              <div
                ref={reportCaptureRef}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5"
              >
                {/* Report Header for Paper & Image */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#123B6D] tracking-tight">
                      {vendorLabSettings?.labName || 'Apex Diagnostic & Pathology Laboratory'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {vendorLabSettings?.address || 'Main Hospital Road, Medical Enclave'} • Phone: +91 {vendorLabSettings?.phone || '9876543210'}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <div className="inline-block bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl text-xs font-black text-[#0F766E] uppercase tracking-wider">
                      Day & Cash Earning Report
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center sm:justify-end gap-1.5">
                      <span>Date:</span>
                      <strong className="text-slate-800">
                        {selectedDateFilter === 'Custom Date' ? `${customStartDate} to ${customEndDate}` : selectedDateFilter}
                      </strong>
                      <span>•</span>
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* 5 Summary Cards: Automatically updated according to date range */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {/* Card 1: Total Earning */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/60 p-3.5 rounded-2xl border border-blue-200 shadow-2xs">
                    <div className="text-[11px] font-black text-blue-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Total Earning</span>
                      <IndianRupee className="w-3.5 h-3.5 text-blue-700" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#123B6D] mt-1 font-mono">
                      ₹{metrics.totalEarning.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-blue-700 mt-0.5 font-medium truncate">
                      Net Billed ({metrics.patientCount} Patients)
                    </div>
                  </div>

                  {/* Card 2: In Pocket — actually received amount */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
                    <div className="text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center justify-between">
                      <span>In Pocket</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-black px-1.5 py-0.2 rounded">
                        Received
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 font-mono">
                      ₹{metrics.inPocket.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-emerald-800 mt-0.5 font-semibold flex items-center gap-1.5 flex-wrap">
                      <span>💵 Cash: ₹{metrics.cashInPocket.toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span>📱 UPI: ₹{metrics.upiInPocket.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Card 3: Full Payment */}
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100/60 p-3.5 rounded-2xl border border-teal-200 shadow-2xs">
                    <div className="text-[11px] font-black text-teal-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Full Payment</span>
                      <Check className="w-3.5 h-3.5 text-teal-700" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-teal-800 mt-1 font-mono">
                      ₹{metrics.fullPaymentAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-teal-700 mt-0.5 font-medium">
                      {metrics.fullPaymentCount} Patients (Nil Due)
                    </div>
                  </div>

                  {/* Card 4: Advance Payment */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
                    <div className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Advance Payment</span>
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-amber-800 mt-1 font-mono">
                      ₹{metrics.advancePaymentAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5 font-medium">
                      {metrics.advancePaymentCount} Patients with Advance
                    </div>
                  </div>

                  {/* Card 5: Due Payment */}
                  <div className="bg-gradient-to-br from-rose-50 to-rose-100/60 p-3.5 rounded-2xl border border-rose-200 shadow-2xs col-span-2 sm:col-span-1">
                    <div className="text-[11px] font-black text-rose-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Due Payment</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1 font-mono">
                      ₹{metrics.duePaymentAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-rose-700 mt-0.5 font-medium">
                      {metrics.duePaymentCount} Pending Balance
                    </div>
                  </div>
                </div>

                {/* Earning Report Clean Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                    <span className="uppercase tracking-wider">
                      Patient Earning Records ({filteredEntries.length})
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Auto-updated as filters change
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                            <th className="py-3 px-3">Token No.</th>
                            <th className="py-3 px-3">Date & Time</th>
                            <th className="py-3 px-3">Client Details / Mobile</th>
                            <th className="py-3 px-3">Tests Selected</th>
                            <th className="py-3 px-3 text-right">Total Bill</th>
                            <th className="py-3 px-3 text-right">In Pocket (Received)</th>
                            <th className="py-3 px-3 text-center">Status</th>
                            <th className="py-3 px-3 text-right">Due Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {filteredEntries.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-400">
                                <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <div className="font-bold text-slate-600 text-sm">No records found for this filter</div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                  Try selecting another date or payment filter.
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredEntries.map((entry, idx) => {
                              const netTotal = Math.max(0, (entry.totalAmount || 0) - (entry.discountINR || 0));
                              const received = (entry.paidAmount || 0) + (entry.balancePaidAmount || 0);
                              const due = entry.dueAmount ?? Math.max(0, netTotal - received);

                              const paymentStatusType: 'Full Payment' | 'Advance' | 'Due' =
                                due === 0 || entry.paymentStatus === 'Full Payment' || entry.paymentStatus === 'Paid'
                                  ? 'Full Payment'
                                  : due > 0 && received > 0
                                  ? 'Advance'
                                  : 'Due';

                              return (
                                <tr key={entry.id || idx} className="hover:bg-teal-50/40 transition">
                                  {/* Token Number */}
                                  <td className="py-3 px-3 font-mono font-black text-slate-900">
                                    <span className="bg-[#123B6D] text-white px-2 py-0.5 rounded text-[11px]">
                                      {entry.tokenNumber || entry.tokenNo || `TK-${100 + idx + 1}`}
                                    </span>
                                  </td>

                                  {/* Date & Time */}
                                  <td className="py-3 px-3">
                                    <div className="font-semibold text-slate-800">
                                      {entry.entryDate || todayStr}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {entry.registeredAt || 'Morning Shift'}
                                    </div>
                                  </td>

                                  {/* Client Details: Token, Name, Mobile */}
                                  <td className="py-3 px-3">
                                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                      <span>{entry.patientName}</span>
                                      <span className="text-[11px] text-slate-400 font-normal">
                                        ({entry.age}Y • {entry.gender})
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                                      <Phone className="w-3 h-3 text-slate-400" />
                                      <span>+91 {entry.mobile}</span>
                                    </div>
                                  </td>

                                  {/* Tests Selected */}
                                  <td className="py-3 px-3">
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                      {entry.tests && entry.tests.length > 0 ? (
                                        entry.tests.map((t, tIdx) => (
                                          <span
                                            key={tIdx}
                                            className="bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-[10px] text-slate-700"
                                          >
                                            {t}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-slate-400 italic text-[11px]">General Checkup</span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Total Bill */}
                                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                                    ₹{netTotal.toLocaleString('en-IN')}
                                  </td>

                                  {/* In Pocket (Received) + Mode */}
                                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-700">
                                    <div>₹{received.toLocaleString('en-IN')}</div>
                                    <div className="text-[10px] font-sans font-medium text-slate-500">
                                      {entry.paymentMode === 'UPI' ? '📱 UPI' : entry.paymentMode === 'Cash' ? '💵 Cash' : entry.paymentMode}
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td className="py-3 px-3 text-center">
                                    {paymentStatusType === 'Full Payment' ? (
                                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                                        <Check className="w-2.5 h-2.5" /> Full Paid
                                      </span>
                                    ) : paymentStatusType === 'Advance' ? (
                                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                                        Advance Paid
                                      </span>
                                    ) : (
                                      <span className="bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                                        Payment Due
                                      </span>
                                    )}
                                  </td>

                                  {/* Due Amount */}
                                  <td className="py-3 px-3 text-right font-mono font-bold">
                                    {due > 0 ? (
                                      <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                        ₹{due.toLocaleString('en-IN')}
                                      </span>
                                    ) : (
                                      <span className="text-emerald-700 text-[11px]">✓ ₹0</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>

                        {/* Grand Totals Footer */}
                        {filteredEntries.length > 0 && (
                          <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-black text-xs text-slate-900">
                            <tr>
                              <td colSpan={4} className="py-3 px-3 uppercase tracking-wider">
                                Total Summary ({filteredEntries.length} Patients)
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-[#123B6D] text-sm">
                                ₹{metrics.totalEarning.toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm">
                                ₹{metrics.inPocket.toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-3 text-center text-[11px] text-slate-500 font-semibold">
                                {metrics.fullPaymentCount} Full • {metrics.advancePaymentCount} Adv
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-rose-600 text-sm">
                                ₹{metrics.duePaymentAmount.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                </div>

                {/* Footer Signature Strip on Print/Image */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <div>
                    <span>Authorized Signature & Stamp: _______________________</span>
                  </div>
                  <div className="text-[11px]">
                    System Generated • Apex Lab Smart OS (indianlalaji.com)
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'drawer' && (
            /* ========================================================
               TAB 2: CASH DRAWER & PHYSICAL DENOMINATIONS (Z-Register)
               ======================================================== */
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <span>Physical Cash Drawer Denomination Tally</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Count cash bills in the cash box to verify with computer billing records.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillDenominations}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Auto-Fill to Match System
                  </button>
                </div>

                {/* Denominations Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { key: 'n500', label: '₹500 Notes', value: 500 },
                    { key: 'n200', label: '₹200 Notes', value: 200 },
                    { key: 'n100', label: '₹100 Notes', value: 100 },
                    { key: 'n50', label: '₹50 Notes', value: 50 },
                    { key: 'n20', label: '₹20 Notes', value: 20 },
                    { key: 'n10', label: '₹10 Notes', value: 10 },
                    { key: 'coins', label: 'Coins (₹)', value: 1 },
                  ].map((denom) => (
                    <div
                      key={denom.key}
                      className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center space-y-1.5"
                    >
                      <div className="text-xs font-black text-slate-700">{denom.label}</div>
                      <input
                        type="number"
                        min="0"
                        value={(denominations as any)[denom.key] || ''}
                        placeholder="0"
                        onChange={(e) =>
                          setDenominations({
                            ...denominations,
                            [denom.key]: Math.max(0, parseInt(e.target.value) || 0),
                          })
                        }
                        className="w-full text-center py-1.5 rounded-xl border border-slate-300 font-mono font-bold text-sm bg-white outline-none focus:border-teal-600"
                      />
                      <div className="text-[11px] font-mono text-slate-500 font-bold">
                        = ₹{(((denominations as any)[denom.key] || 0) * denom.value).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Drawer Summary & Difference Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-500">Expected in Drawer</div>
                    <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                      ₹{expectedCashInDrawer.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Float (₹{openingFloat}) + Cash Received (₹{metrics.cashInPocket})
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-500">Physical Counted</div>
                    <div className="text-xl font-black text-teal-800 font-mono mt-0.5">
                      ₹{countedPhysicalCash.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">From bill denomination counting</div>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border ${
                      cashDifference === 0
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : cashDifference < 0
                        ? 'bg-rose-50 border-rose-300 text-rose-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="text-xs font-bold">Difference Status</div>
                    <div className="text-xl font-black font-mono mt-0.5">
                      {cashDifference === 0
                        ? '✓ Balanced (₹0)'
                        : cashDifference < 0
                        ? `-₹${Math.abs(cashDifference)} (Short)`
                        : `+₹${cashDifference} (Excess)`}
                    </div>
                    <div className="text-[10px] opacity-80">
                      {cashDifference === 0
                        ? 'Drawer tallies 100% with computer'
                        : 'Please cross-verify register change'}
                    </div>
                  </div>
                </div>

                {/* Handover & Finalize Closing */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-600 shrink-0">Handover To:</span>
                    <input
                      type="text"
                      value={handoverTo}
                      onChange={(e) => setHandoverTo(e.target.value)}
                      placeholder="Manager / Owner name"
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white outline-none w-full sm:w-64"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveClosing}
                    className="w-full sm:w-auto bg-[#0F766E] hover:bg-[#0d655e] text-white px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Finalize & Archive Day Closing</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            /* ========================================================
               TAB 3: CLOSING ARCHIVE HISTORY
               ======================================================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-600" />
                  <span>Archived Day-End Closing Records</span>
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  Total Records: {closingHistory.length}
                </span>
              </div>

              {closingHistory.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
                  <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-700 text-sm">No past closing records found</p>
                  <p className="text-xs mt-1">
                    When you close today's register using the "Finalize" button in the Cash Drawer tab, records appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-200">
                          <th className="py-2.5 px-3">Date / Timestamp</th>
                          <th className="py-2.5 px-3">Cashier</th>
                          <th className="py-2.5 px-3 text-center">Patients</th>
                          <th className="py-2.5 px-3 text-right">Cash Received</th>
                          <th className="py-2.5 px-3 text-right">UPI Received</th>
                          <th className="py-2.5 px-3 text-right">Total In Pocket</th>
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
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{rec.cashierName}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-700">{rec.patientCount}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                              ₹{rec.systemCash?.toLocaleString('en-IN') || 0}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                              ₹{rec.systemUpi?.toLocaleString('en-IN') || 0}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                              ₹{rec.totalCollected?.toLocaleString('en-IN') || 0}
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
                            <td className="py-2.5 px-3 text-slate-600 text-[11px]">{rec.handoverTo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
