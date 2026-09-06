import React from 'react';
import { ShieldCheck, Phone } from 'lucide-react';

interface ReportCopyrightBottomBarProps {
  softwareDomain?: string;
  reportId?: string;
  verificationHash?: string;
}

export const ReportCopyrightBottomBar: React.FC<ReportCopyrightBottomBarProps> = ({
  softwareDomain = 'labname.com',
  reportId,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div
      className="mt-6 pt-3 pb-2.5 border-t-2 border-slate-300 text-[10px] text-slate-500 bg-slate-50/90 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 print:bg-white print:border-t-2 print:border-slate-800 print:mt-4 print:pt-2"
      id="report-copyright-bottom-bar"
    >
      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
        <div className="flex items-center gap-1.5 font-black text-slate-800 tracking-tight">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse print:hidden" />
          <span className="text-[11px] text-[#123B6D]">
            Software by{' '}
            <a
              href="https://labname.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#123B6D] hover:underline font-bold"
            >
              labname.com
            </a>
          </span>
        </div>
        <span className="text-slate-300 hidden sm:inline">|</span>
        <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
          <ShieldCheck className="w-3 h-3 text-emerald-600 print:hidden" />
          <span>NABL & ISO 15189 Standard LIMS</span>
        </span>
        <span className="text-slate-300 hidden sm:inline">|</span>
        <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
          <Phone className="w-3 h-3 text-[#123B6D] print:hidden" />
          <span>Care: <a href="tel:7087033009" className="text-[#123B6D] hover:underline font-bold">7087033009</a></span>
        </span>
      </div>

      <div className="flex items-center gap-2 text-slate-500 text-[10px] flex-wrap justify-center sm:justify-end">
        <span>Copyright © {currentYear} <a href="https://labname.com" target="_blank" rel="noopener noreferrer" className="hover:underline">labname.com</a>. All Rights Reserved.</span>
        {reportId && (
          <>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="font-mono text-slate-400 hidden sm:inline">Doc Ref: {reportId}</span>
          </>
        )}
      </div>
    </div>
  );
};
