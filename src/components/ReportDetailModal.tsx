import React, { useState } from 'react';
import {
  X,
  Printer,
  MessageSquare,
  ShieldCheck,
  QrCode,
  Download,
  AlertCircle,
  AlertTriangle,
  Building,
  CheckCircle2,
  Edit3,
  Trash2,
  Check,
  PhoneCall,
  BellRing,
} from 'lucide-react';
import { LabReport } from '../types';
import { maskMobileForOnlineReport } from '../utils/reportUtils';
import { ReportCopyrightBottomBar } from './ReportCopyrightBottomBar';
import { generateReportPdf } from '../utils/pdfGenerator';
import { printReportSafely } from '../utils/printHelper';
import { checkPanicOrCriticalValue } from '../utils/criticalAlerts';
import { DigitalSignatureBadge } from './DigitalSignatureBadge';

interface ReportDetailModalProps {
  report: LabReport | null;
  isOpen: boolean;
  onClose: () => void;
  onEditReport?: (report: LabReport) => void;
  onDeleteReport?: (report: LabReport) => void;
  onOpenPatientPortal?: (reportId: string, mobile: string) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  onClose,
  onEditReport,
  onDeleteReport,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [doctorAlertLogged, setDoctorAlertLogged] = useState(false);
  const [doctorAlertTime, setDoctorAlertTime] = useState<string>('');

  if (!isOpen || !report) return null;

  const handleDownloadPdf = () => {
    try {
      generateReportPdf(report);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handlePrint = () => {
    printReportSafely(report);
  };

  const handleWhatsApp = () => {
    const reportUrl = `${window.location.origin}?report=${report.reportId}`;
    const text = encodeURIComponent(
      `Hello ${report.patientName}, your authenticated diagnostic report (${report.reportId}) from ${report.labName} is ready. View & download without login: ${reportUrl}`
    );
    window.open(`https://wa.me/91${report.mobile}?text=${text}`, '_blank');
  };

  const handleEdit = () => {
    onClose();
    if (onEditReport) {
      onEditReport(report);
    }
  };

  const handleDelete = () => {
    if (onDeleteReport) {
      onDeleteReport(report);
    }
  };

  const handleLogDoctorTelephonicAlert = () => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setDoctorAlertTime(now);
    setDoctorAlertLogged(true);
  };

  const itemsWithAlerts = report.items.map((item) => {
    const critical = checkPanicOrCriticalValue(item.parameter, item.result, item.unit);
    return {
      ...item,
      critical,
      isPanic: critical.isCritical,
    };
  });

  const criticalItems = itemsWithAlerts.filter((i) => i.isPanic);
  const abnormalItems = itemsWithAlerts.filter((i) => i.isAbnormal && !i.isPanic);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Action Bar (Top) */}
        <div className="bg-[#123B6D] text-white px-5 py-3 flex items-center justify-between no-print flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold">
              Authenticated NABL Clinical Report • ID: {report.reportId}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onEditReport && (
              <button
                onClick={handleEdit}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                title="Edit parameters, patient info or doctor remarks in this report"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Report</span>
              </button>
            )}

            {onDeleteReport && (
              <button
                onClick={handleDelete}
                className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Delete this report"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <button
              onClick={handleDownloadPdf}
              className="bg-[#0F766E] hover:bg-[#0d655e] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Download official NABL medical PDF file"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="bg-white text-[#123B6D] hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Print on letterhead"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Document Sheet (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-[#172033] space-y-6 print:p-0">
          {/* Quick Edit Banner on top of document */}
          {onEditReport && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between no-print text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Need to modify results or patient details?</strong> Click Edit to change any test parameter, reference ranges, or doctor notes.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg transition shrink-0 cursor-pointer shadow-2xs"
                >
                  Edit This Report
                </button>
                {onDeleteReport && (
                  <button
                    onClick={handleDelete}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          )}
          {/* Header with Lab Branding */}
          <div className="border-b-2 border-[#123B6D] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#123B6D] text-white flex items-center justify-center font-black text-xl shadow-xs">
                  <span className="text-amber-400">AP</span>EX
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-[#123B6D] tracking-tight uppercase">
                    {report.labName}
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-lg">
                    {report.labAddress}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Phone: {report.labPhone} • Accreditation: {report.nablAccreditationNo}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
              <div className="w-14 h-14 bg-white p-1 rounded border border-slate-300 flex items-center justify-center">
                <QrCode className="w-12 h-12 text-[#123B6D]" />
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                <div className="font-bold text-slate-800">Scan to Authenticate</div>
                <div className="text-[#123B6D] font-bold">{report.reportId}</div>
                <div className="text-emerald-700 font-semibold">ISO 15189 NABL</div>
              </div>
            </div>
          </div>

          {/* Patient Demographics Grid */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{report.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Age / Gender</span>
              <span className="font-semibold text-slate-800">{report.ageGender}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">UHID Number</span>
              <span className="font-mono font-bold text-[#123B6D]">{report.uhid}</span>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile (Online View)</span>
                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200" title="Last 4 digits masked with ____ for online report privacy">
                  Privacy Masked
                </span>
              </div>
              <span className="font-mono font-bold text-slate-800" title="Last 4 digits masked with ____ for online patient privacy">
                +91 {maskMobileForOnlineReport(report.mobile)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Referring Doctor</span>
              <span className="font-semibold text-slate-800">{report.doctor}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Sample Collected</span>
              <span className="text-slate-700">{report.sampleCollectedAt}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Reported Date</span>
              <span className="text-slate-700">{report.reportedAt}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Barcode / Status</span>
              <span className="text-emerald-700 font-bold">Verified & Final</span>
            </div>
          </div>

          {/* 🚨 PANIC / CRITICAL VALUE BANNER (ISO 15189 / NABL Requirement) */}
          {criticalItems.length > 0 && (
            <div className="bg-linear-to-r from-rose-600 via-red-600 to-rose-700 text-white rounded-xl p-4 shadow-md space-y-2 border border-rose-800 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/20 rounded-lg text-xl shrink-0 animate-bounce">
                    🚨
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-white text-rose-800 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide shadow-xs">
                        CRITICAL / PANIC LAB VALUE ALERT
                      </span>
                      <span className="text-[11px] text-rose-100 font-bold">
                        ISO 15189 / NABL Telephonic Protocol
                      </span>
                    </div>
                    <div className="text-sm font-black mt-1">
                      Immediate Clinical Attention Required: {criticalItems.length} parameter(s) at life-threatening threshold!
                    </div>
                    <div className="text-xs text-rose-100 mt-0.5">
                      {criticalItems.map((c) => `${c.parameter}: ${c.result} ${c.unit || ''} (${c.critical.label})`).join(' • ')}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {doctorAlertLogged ? (
                    <div className="bg-emerald-800/90 border border-emerald-400 text-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Doctor Alerted via Call at {doctorAlertTime}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLogDoctorTelephonicAlert}
                      className="bg-white hover:bg-rose-50 text-rose-800 px-3.5 py-1.5 rounded-lg text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                      <span>Log Doctor Telephonic Alert</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Recommended Action Box */}
              <div className="bg-black/20 rounded-lg p-2 text-xs text-rose-100 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  <strong>Action Directive:</strong> Telephonic verbal notification to referring doctor ({report.doctor}) mandated before final report release.
                </span>
              </div>
            </div>
          )}

          {/* Standard Abnormal notice banner if any non-panic abnormal items exist */}
          {abnormalItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Clinical Attention:</strong> {abnormalItems.length} parameter(s) reported outside standard biological reference intervals.
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-800">Please consult your referring physician</span>
            </div>
          )}

          {/* Investigation Results Table */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Laboratory Investigation Results
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-700 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">Test Investigation</th>
                    <th className="py-2.5 px-3 text-right">Observed Value</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Biological Reference Interval</th>
                    <th className="py-2.5 px-3 text-center">Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {itemsWithAlerts.map((item, idx) => (
                    <tr
                      key={idx}
                      className={
                        item.isPanic
                          ? 'bg-rose-100/80 border-l-4 border-rose-600 font-bold'
                          : item.isAbnormal
                          ? 'bg-amber-50/70 border-l-4 border-amber-500 font-semibold'
                          : 'hover:bg-slate-50/50'
                      }
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {item.isPanic && <span className="text-rose-600 text-sm">🚨</span>}
                          <span>{item.parameter}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{item.testName}</div>
                        {item.isPanic && item.critical.clinicalImplication && (
                          <div className="text-[10px] text-rose-800 font-normal mt-0.5 max-w-sm">
                            ⚠️ {item.critical.clinicalImplication}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-sm">
                        <span
                          className={
                            item.isPanic
                              ? 'text-rose-700 font-black text-base'
                              : item.isAbnormal
                              ? 'text-amber-700'
                              : 'text-slate-900'
                          }
                        >
                          {item.result}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {item.unit || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {item.referenceRange}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.isPanic ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-black bg-rose-600 text-white shadow-xs animate-pulse">
                            <span>{item.critical.type === 'CRITICAL_LOW' ? '⚠️ CRITICAL LOW' : '🚨 CRITICAL HIGH'}</span>
                          </span>
                        ) : item.isAbnormal ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            ABNORMAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            NORMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures & Footer Authenticity with Pathologist Digital Signature Badge */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            <div>
              <div className="text-[11px] font-bold text-slate-700 mb-1">Authenticity & Clinical Notes:</div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Test results relate only to the specimen tested. Partial reproduction of this report is not permitted. Biological reference intervals are based on ISO 15189 standard population datasets. All panic critical findings are verbally communicated to the referring clinician under NABL alert protocol.
              </p>
              <div className="mt-2 text-[10px] font-mono text-slate-400">
                Digital Hash: {report.verificationHash}
              </div>
            </div>

            {/* Pathologist Digital Signature with Official Lab Stamp */}
            <div>
              <DigitalSignatureBadge
                pathologistName={report.pathologist || 'Dr. Rohit Sharma'}
                pathologistDegrees={report.pathologistDegrees || 'Consultant Pathologist • Reg No: PMC-48192'}
                pathologistRegNo="PMC-48192"
                signedAt={report.reportedAt || '03-Sep-2026 12:45 PM'}
                verificationHash={report.verificationHash}
                labName={report.labName}
              />
            </div>
          </div>

          {/* Copyright bottom bar with "Software by indianlalaji.com" */}
          <ReportCopyrightBottomBar
            softwareDomain="indianlalaji.com"
            reportId={report.reportId}
          />
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-100 px-5 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2 no-print">
          <span>NABL / ISO 15189 Compliant Print Format • A4 Standard</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              className="text-[#0F766E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handlePrint}
              className="text-[#123B6D] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Click to Print on Letterhead</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
