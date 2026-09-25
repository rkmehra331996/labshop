import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Printer,
  Share2,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  FileText,
  Mail,
  MessageSquare,
  Copy,
  Check,
  X,
  ShieldCheck,
  Lock,
  CreditCard,
  Phone,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { LabReport } from '../types';
import {
  getCanonicalReportPdfBlob,
  downloadReportPdf,
  printCanonicalReportPdf,
} from '../utils/pdfGenerator';
import { renderPdfPages, RenderedPdfPage } from '../utils/canonicalPdfRenderer';

interface CanonicalPdfViewerProps {
  report: LabReport;
  isPaymentPending?: boolean;
  activeDueAmount?: number;
  onPayOnline?: () => void;
  onClose?: () => void;
  className?: string;
  autoRenderNativeEmbed?: boolean;
  title?: string;
}

export const CanonicalPdfViewer: React.FC<CanonicalPdfViewerProps> = ({
  report,
  isPaymentPending = false,
  activeDueAmount = 0,
  onPayOnline,
  onClose,
  className = '',
  autoRenderNativeEmbed = false,
  title,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderedPages, setRenderedPages] = useState<RenderedPdfPage[]>([]);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareRecipientEmail, setShareRecipientEmail] = useState('');
  const [shareEmailStatus, setShareEmailStatus] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [useNativeEmbed, setUseNativeEmbed] = useState(autoRenderNativeEmbed);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  // Generate canonical PDF bytes and render pages
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function loadPdf() {
      try {
        const canonical = await getCanonicalReportPdfBlob(report);
        if (!isMounted) return;

        setBlobUrl(canonical.blobUrl);

        // Render PDF pages using pdfjs-dist
        const pages = await renderPdfPages(canonical.arrayBuffer, 2.0); // 2.0x for crisp retina display
        if (!isMounted) return;

        setRenderedPages(pages);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to render canonical PDF:', err);
        if (isMounted) {
          setError('Could not render PDF preview directly. You can still download and print the official PDF document.');
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [report.reportId, report.reportedAt]);

  const handleDownloadPdf = async () => {
    if (isPaymentPending && onPayOnline) {
      onPayOnline();
      return;
    }
    try {
      await downloadReportPdf(report);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handlePrint = async () => {
    if (isPaymentPending && onPayOnline) {
      onPayOnline();
      return;
    }
    try {
      setPrintSuccess(true);
      await printCanonicalReportPdf(report, blobUrl || undefined);
      setTimeout(() => setPrintSuccess(false), 4000);
    } catch (err) {
      console.error('Print error:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const reportUrl = `${window.location.origin}?report=${encodeURIComponent(report.reportId)}`;
    const text = encodeURIComponent(
      `*Official Diagnostic Report - ${report.labName}*\n\n` +
      `👤 Patient: ${report.patientName}\n` +
      `📄 Report ID: ${report.reportId}\n` +
      `🔬 Test: ${report.items?.[0]?.testName || 'Clinical Examination'}\n` +
      `📅 Reported: ${report.reportedAt}\n` +
      `🔒 NABL Authenticated: MC-4892 / ISO 15189\n\n` +
      `🔗 View Canonical PDF Report:\n${reportUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareRecipientEmail) return;

    const reportUrl = `${window.location.origin}?report=${encodeURIComponent(report.reportId)}`;
    const subject = encodeURIComponent(`NABL Authenticated Lab Report - ${report.patientName} (${report.reportId})`);
    const body = encodeURIComponent(
      `Hello,\n\nPlease find attached the verified medical diagnostic lab report from ${report.labName}.\n\n` +
      `Patient Name: ${report.patientName}\n` +
      `Report ID: ${report.reportId}\n` +
      `Date: ${report.reportedAt}\n` +
      `Status: Officially Authenticated & Signed\n\n` +
      `Direct Online Report Link:\n${reportUrl}\n\n` +
      `Regards,\n${report.labName}`
    );

    window.location.href = `mailto:${encodeURIComponent(shareRecipientEmail)}?subject=${subject}&body=${body}`;
    setShareEmailStatus('Email client opened with pre-filled report details.');
    setTimeout(() => {
      setShareEmailStatus(null);
      setIsShareModalOpen(false);
    }, 3000);
  };

  const handleCopyLink = () => {
    const reportUrl = `${window.location.origin}?report=${encodeURIComponent(report.reportId)}`;
    navigator.clipboard.writeText(reportUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {
        setIsFullscreen(!isFullscreen);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      } ${className}`}
    >
      {/* Hidden print iframe for direct silent PDF printing */}
      <iframe ref={printFrameRef} className="hidden" title="Print Frame" />

      {/* TOP CANONICAL REPORT ACTION BAR */}
      <div className="bg-[#0B2545] border-b border-slate-700 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none">
        {/* Left: Status & Identity */}
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-wide">
              {title || 'CANONICAL REPORT PDF'}
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline font-mono text-emerald-300 text-[11px] font-bold">
              ID: {report.reportId}
            </span>
            <span className="hidden md:inline px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-[10px] font-bold">
              Exact Download / Print Master
            </span>
          </div>
        </div>

        {/* Right: The 4 Core Specified Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* 1. 👁️ View Report */}
          <button
            type="button"
            onClick={() => setViewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs transition border border-slate-600 cursor-pointer shadow-xs active:scale-95"
            title="Open high-resolution full report view"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>👁️ View Report</span>
          </button>

          {/* 2. 📥 Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer shadow-xs active:scale-95 ${
              isPaymentPending
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[#0F766E] hover:bg-[#0d655e] text-white border border-teal-500/50'
            }`}
            title="Download the exact identical NABL PDF"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Downloaded!</span>
              </>
            ) : isPaymentPending ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-200" />
                <span>📥 Download PDF (Locked)</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-emerald-300" />
                <span>📥 Download PDF</span>
              </>
            )}
          </button>

          {/* 3. 🖨️ Print Report */}
          <button
            type="button"
            onClick={handlePrint}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer shadow-xs active:scale-95 ${
              isPaymentPending
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-sm'
            }`}
            title="Print the exact identical NABL PDF"
          >
            {printSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Printing...</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5 text-slate-800" />
                <span>🖨️ Print Report</span>
              </>
            )}
          </button>

          {/* 4. 📤 Share Report */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
            title="Share report via WhatsApp or Email"
          >
            <Share2 className="w-3.5 h-3.5 text-white" />
            <span>📤 Share Report</span>
          </button>
        </div>
      </div>

      {/* SECONDARY TOOLBAR: Zoom & Display Controls */}
      <div className="bg-slate-800/90 border-b border-slate-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 select-none">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold">
            {renderedPages.length > 0 ? `Page 1 of ${renderedPages.length}` : 'Loading document...'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Identical Canonical PDF Master</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom In / Out Controls */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setZoomScale((s) => Math.max(0.6, s - 0.15))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-bold text-slate-200">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((s) => Math.min(1.8, s + 0.15))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(1.0)}
              className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>

          {/* Toggle Native PDF Reader vs High-Res Canvas */}
          {blobUrl && (
            <button
              type="button"
              onClick={() => setUseNativeEmbed(!useNativeEmbed)}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-750 text-[11px] font-semibold text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Switch between Canvas View and Native Browser PDF Viewer"
            >
              {useNativeEmbed ? 'Vector View' : 'Native PDF Reader'}
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* PAYMENT PENDING OVERLAY (if active) */}
      {isPaymentPending && (
        <div className="bg-amber-950/90 border-b border-amber-600/60 p-4 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="font-bold text-amber-100 text-sm">
                Official Report Ready • Payment Due: ₹{activeDueAmount}
              </div>
              <p className="text-amber-300/90 text-xs mt-0.5">
                Clear pending dues to unlock high-resolution unwatermarked diagnostic investigations and official digital signature.
              </p>
            </div>
          </div>
          {onPayOnline && (
            <button
              type="button"
              onClick={onPayOnline}
              className="bg-amber-500 hover:bg-amber-400 text-amber-950 px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 shadow-sm active:scale-95"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay ₹{activeDueAmount} & Unlock Official PDF</span>
            </button>
          )}
        </div>
      )}

      {/* MAIN DOCUMENT CANVAS / EMBED CONTAINER */}
      <div className="flex-1 overflow-auto bg-slate-950/80 p-4 sm:p-6 flex flex-col items-center min-h-[500px] max-h-[82vh] relative">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-emerald-400 animate-spin" />
            <div className="text-center">
              <div className="font-bold text-slate-200 text-sm">Generating Canonical PDF Master...</div>
              <p className="text-xs text-slate-400 mt-1">
                Compiling official NABL vector layouts, DSC cryptographic signature, and embedded verification QR.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-md my-auto bg-rose-950/50 border border-rose-800 rounded-xl p-5 text-center text-xs text-rose-200 space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <div className="font-bold text-sm text-rose-100">Canonical Preview Notice</div>
            <p className="text-rose-300">{error}</p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Download PDF Directly
              </button>
            </div>
          </div>
        )}

        {/* 1. NATIVE BROWSER EMBED MODE (if toggled) */}
        {!loading && !error && useNativeEmbed && blobUrl && (
          <div className="w-full h-full min-h-[680px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-700">
            <object
              data={blobUrl}
              type="application/pdf"
              className="w-full h-full min-h-[680px]"
            >
              <iframe
                src={`${blobUrl}#toolbar=0`}
                className="w-full h-full min-h-[680px] border-0"
                title="Canonical PDF Report Preview"
              />
            </object>
          </div>
        )}

        {/* 2. VECTOR CANVAS RENDER MODE (Default & 100% Reliable across all devices and sandboxes) */}
        {!loading && !error && !useNativeEmbed && renderedPages.length > 0 && (
          <div
            className="flex flex-col items-center gap-6 transition-transform duration-150 origin-top"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {renderedPages.map((page) => (
              <div
                key={page.pageNumber}
                className="bg-white rounded-md shadow-2xl overflow-hidden border border-slate-400/30 text-slate-900 transition-all select-none relative"
                style={{
                  width: `${Math.min(794, (page.width / 2))}px`,
                  maxWidth: '100%',
                }}
              >
                {/* Visual Paper Sheet */}
                <img
                  src={page.dataUrl}
                  alt={`Lab Report ${report.reportId} Page ${page.pageNumber}`}
                  className="w-full h-auto block"
                />

                {/* Bottom Paper Page Footer Watermark Indicator */}
                <div className="bg-slate-100 border-t border-slate-200 px-3 py-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Page {page.pageNumber} of {renderedPages.length}</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>NABL MC-4892 • ISO 15189 Standard Master</span>
                  </span>
                  <span>{report.reportId}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4-ACTION SHARE MODAL (WhatsApp or Email) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="bg-[#123B6D] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-sm">Share Report (WhatsApp / Email)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 text-xs">
              {/* Summary Card */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{report.patientName}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Report ID: <span className="font-mono font-bold text-slate-700">{report.reportId}</span> • {report.items?.[0]?.testName || 'Pathology Test'}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  NABL Verified
                </span>
              </div>

              {/* 1. Share via WhatsApp */}
              <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Option A: Share via WhatsApp</span>
                </div>
                <p className="text-emerald-800 text-[11px]">
                  Send a pre-formatted message with patient details, lab accreditation, and instant one-click report link.
                </p>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full mt-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send via WhatsApp (+91 {report.mobile})</span>
                </button>
              </div>

              {/* 2. Share via Email */}
              <form onSubmit={handleSendEmail} className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-blue-950 font-extrabold text-xs">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Option B: Share via Email</span>
                </div>
                <p className="text-blue-900 text-[11px]">
                  Compose an email directly to the patient, doctor, or hospital EMR desk.
                </p>

                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={shareRecipientEmail}
                    onChange={(e) => setShareRecipientEmail(e.target.value)}
                    placeholder="Enter recipient email (e.g. doctor@hospital.com)"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer shrink-0"
                  >
                    Send Email
                  </button>
                </div>
                {shareEmailStatus && (
                  <p className="text-emerald-700 font-semibold text-[11px] pt-1">
                    ✓ {shareEmailStatus}
                  </p>
                )}
              </form>

              {/* 3. Direct Link Copy */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-500 font-medium truncate">
                  {window.location.origin}?report={report.reportId}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL VIEW MODAL (When 👁️ View Report is clicked) */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-900 text-white w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="bg-[#0B2545] px-4 py-3 border-b border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400" />
                <span className="font-extrabold text-sm text-white">
                  High-Resolution Official Report View • {report.patientName} ({report.reportId})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-800" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center bg-slate-950">
              {renderedPages.map((page) => (
                <div
                  key={`modal-${page.pageNumber}`}
                  className="bg-white rounded shadow-2xl overflow-hidden mb-6 max-w-3xl w-full border border-slate-300"
                >
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-auto block"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
