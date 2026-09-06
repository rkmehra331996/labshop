import React from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';

interface MobileFixedCTAProps {
  onOpenTrial: () => void;
}

export const MobileFixedCTA: React.FC<MobileFixedCTAProps> = ({ onOpenTrial }) => {
  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/917087033009?text=Hello%20LABNAME.COM,%20I%20want%20to%20start%20a%20free%20trial%20for%20my%20laboratory',
      '_blank'
    );
  };

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

        {/* Start Free Trial Button */}
        <button
          onClick={onOpenTrial}
          className="h-11 bg-[#123B6D] hover:bg-[#0e2c52] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
          aria-label="Start Free Trial"
        >
          <span>START FREE TRIAL</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>
    </div>
  );
};
