import React, { useState } from 'react';
import { ShieldCheck, Download, Share2, Printer, QrCode, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { SAMPLE_REPORT } from '../data/mockData';
import { maskMobileForOnlineReport } from '../utils/reportUtils';
import { ReportCopyrightBottomBar } from './ReportCopyrightBottomBar';
import { generateReportPdf } from '../utils/pdfGenerator';
import { printReportSafely } from '../utils/printHelper';

interface ReportPreviewSectionProps {
  onOpenVerifyModal?: () => void;
}

export const ReportPreviewSection: React.FC<ReportPreviewSectionProps> = ({ onOpenVerifyModal }) => {
  const report = SAMPLE_REPORT;
  const [downloadDone, setDownloadDone] = useState(false);

  const handleDownloadPdf = () => {
    try {
      generateReportPdf(report);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    printReportSafely(report);
  };

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>NABL / ISO 15189 Standard Output</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Realistic Digital Medical Report Preview
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Clean typographic layouts, biological reference intervals, automated abnormal flags, and verified digital signatures.
          </p>
        </div>

        {/* The Medical Report Document */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden print:border-none print:shadow-none">
          {/* Action Bar atop report */}
          <div className="bg-slate-100 px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-700">
                Verified Clinical Document • ID: {report.reportId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F766E] text-white text-xs font-bold hover:bg-[#0d655e] transition shadow-xs active:scale-95 cursor-pointer"
                title="Download official NABL medical PDF"
              >
                {downloadDone ? (
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
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              {onOpenVerifyModal && (
                <button
                  onClick={onOpenVerifyModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F766E] text-white text-xs font-semibold hover:bg-teal-700 transition"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Verify QR Code</span>
                </button>
              )}
            </div>
          </div>

          {/* Report Paper Inner */}
          <div className="p-6 sm:p-10 bg-white">
            {/* Header: Lab Logo & Details */}
            <div className="border-b-2 border-[#123B6D] pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-[#123B6D] text-white flex items-center justify-center font-bold text-xl tracking-wider">
                  <span className="text-amber-400">AP</span>EX
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#123B6D] tracking-tight uppercase">
                    {report.labName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-md">
                    {report.labAddress}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Phone: {report.labPhone} • NABL Cert No: {report.nablAccreditationNo}
                  </p>
                </div>
              </div>

              {/* Digital Verification Seal & QR */}
              <div className="text-right sm:text-right flex items-center sm:flex-col sm:items-end gap-3 sm:gap-1">
                <div className="w-16 h-16 border-2 border-slate-800 p-1 rounded-md bg-white flex flex-col items-center justify-center">
                  <QrCode className="w-12 h-12 text-[#123B6D]" />
                </div>
                <div className="text-[10px] font-bold text-[#0F766E] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DIGITALLY VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Patient & Sample Metadata Grid */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 text-xs text-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
                <span className="font-bold text-[#172033] text-sm">{report.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Age / Gender</span>
                <span className="font-semibold text-slate-800">{report.ageGender}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">UHID / Patient ID</span>
                <span className="font-mono font-semibold text-[#123B6D]">{report.uhid}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Report ID / Barcode</span>
                <span className="font-mono font-semibold text-slate-800">{report.reportId}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Referred By Doctor</span>
                <span className="font-semibold text-slate-800">{report.doctor}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sample Collected</span>
                <span className="font-medium text-slate-700">{report.sampleCollectedAt}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Report Signed At</span>
                <span className="font-medium text-slate-700">{report.reportedAt}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile (Online View)</span>
                <span className="font-medium text-slate-700 font-mono" title="Last 4 digits masked with ____ for privacy">
                  +91 {maskMobileForOnlineReport(report.mobile)}
                </span>
              </div>
            </div>

            {/* Test Results Table with Abnormal Flags */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#123B6D] text-white uppercase text-[11px] tracking-wider">
                    <th className="py-2.5 px-3 rounded-l font-bold">Investigation / Parameter</th>
                    <th className="py-2.5 px-3 font-bold">Observed Value</th>
                    <th className="py-2.5 px-3 font-bold">Unit</th>
                    <th className="py-2.5 px-3 font-bold">Reference Interval</th>
                    <th className="py-2.5 px-3 rounded-r font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.items.map((item, idx) => (
                    <tr key={idx} className={item.isAbnormal ? 'bg-amber-50/50' : 'hover:bg-slate-50'}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#172033]">{item.parameter}</div>
                        <div className="text-[10px] text-[#64748B]">{item.testName}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono text-sm font-bold ${
                            item.isAbnormal ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {item.result}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{item.unit}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{item.referenceRange}</td>
                      <td className="py-3 px-3 text-center">
                        {item.isAbnormal ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>ABNORMAL</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            <span>NORMAL</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Clinical Remarks */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 mb-8">
              <strong className="text-slate-800 font-semibold block mb-0.5">Clinical Remarks & Interpretation:</strong>
              <p>
                Biological reference intervals are based on NABL recommendations. Elevated HbA1c (6.8%) and borderline cholesterol (224 mg/dL) require dietary counseling and physician follow-up. Please correlate clinically.
              </p>
            </div>

            {/* Footer Sign-off: Pathologist Signature + Hash */}
            <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-mono">
                  Tamper Proof Verification Hash:
                </div>
                <div className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  {report.verificationHash}
                </div>
                <div className="text-[10px] text-slate-500">
                  QR scan redirects to verified cloud ledger on report.labname.com
                </div>
              </div>

              {/* Signature block */}
              <div className="text-right sm:text-right">
                <div className="font-serif italic text-lg text-[#123B6D] font-bold tracking-wider">
                  Dr. Rohit Sharma
                </div>
                <div className="text-xs font-bold text-[#172033]">{report.pathologist}</div>
                <div className="text-[10px] text-[#64748B]">{report.pathologistDegrees}</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  ✓ Digitally Authorized Signature
                </div>
              </div>
            </div>

            {/* Copyright bottom bar with "Software use Labname.com" */}
            <ReportCopyrightBottomBar
              softwareDomain="Labname.com"
              reportId={report.reportId}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
