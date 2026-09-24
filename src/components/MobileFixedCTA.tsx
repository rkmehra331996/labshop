import React from 'react';
import { MessageSquare, FileText } from 'lucide-react';

interface MobileFixedCTAProps {
  onOpenDemo?: () => void;
  onOpenReport?: () => void;
}

export const MobileFixedCTA: React.FC<MobileFixedCTAProps> = ({ onOpenDemo, onOpenReport }) => {
  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/917087033009?text=Hello%20IndianLalaji.com,%20I%20want%20to%20inquire%20about%20the%20laboratory%20software',
      '_blank'
    );
  };

  const handleReportAction = onOpenReport || onOpenDemo || (() => {});

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 shadow-2xl safe-area-bottom no-print">
      <div className="grid grid-cols-2 gap-2">
        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          className="h-11 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-98"
          aria-label="Contact WhatsApp Support"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WHATSAPP</span>
        </button>

        {/* Track Report Button */}
        <button
          onClick={handleReportAction}
          className="h-11 bg-[#123B6D] hover:bg-[#0e2c52] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-98"
          aria-label="Track Lab Report"
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>TRACK REPORT</span>
        </button>
      </div>
    </div>
  );
};
