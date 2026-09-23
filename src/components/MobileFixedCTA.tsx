import React from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';

interface MobileFixedCTAProps {
  onOpenDemo?: () => void;
}

export const MobileFixedCTA: React.FC<MobileFixedCTAProps> = ({ onOpenDemo }) => {
  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/917087033009?text=Hello%20IndianLalaji.com,%20I%20want%20to%20inquire%20about%20the%20laboratory%20software',
      '_blank'
    );
  };

  const handleAction = onOpenDemo || (() => {});

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 shadow-2xl safe-area-bottom no-print">
      <div className="grid grid-cols-2 gap-2">
        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          className="h-11 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
          aria-label="Contact WhatsApp Support"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WHATSAPP</span>
        </button>

        {/* Book Demo Button */}
        <button
          onClick={handleAction}
          className="h-11 bg-[#123B6D] hover:bg-[#0e2c52] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
          aria-label="Book Demo"
        >
          <span>BOOK DEMO</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>
    </div>
  );
};
