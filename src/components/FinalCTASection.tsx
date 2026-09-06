import React from 'react';
import { ArrowRight, MessageSquare, PhoneCall, ShieldCheck } from 'lucide-react';

interface FinalCTASectionProps {
  onOpenTrial: () => void;
  onOpenDemo: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onOpenTrial, onOpenDemo }) => {
  return (
    <section id="contact-section" className="py-16 sm:py-20 bg-gradient-to-br from-[#123B6D] to-[#0e2c52] text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold mb-4">
          <span>14-Day Free Trial • No Credit Card Required</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Start Your Laboratory Digitally.
        </h2>

        {/* Subheading as required by spec */}
        <p className="text-base sm:text-lg text-slate-200 mt-3 font-medium tracking-wide">
          Patients. Tests. Samples. Reports. Billing. Branches.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button
            id="final-cta-btn-trial"
            onClick={onOpenTrial}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-900 px-7 py-3.5 rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center gap-2"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4 text-slate-900" />
          </button>

          <button
            id="final-cta-btn-demo"
            onClick={onOpenDemo}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/25 px-7 py-3.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <span>Book a Demo</span>
          </button>
        </div>

        {/* WhatsApp support as specified */}
        <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
          <a
            href="https://wa.me/917087033009?text=Hello%20LABNAME.COM,%20I%20am%20interested%20in%20digitizing%20my%20laboratory"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200 font-semibold transition"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Support: 7087033009</span>
          </a>
          <span className="hidden sm:inline text-white/30">•</span>
          <span>Founder: Rahul K.</span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span>Onboarding & Data Import Assistance Included</span>
        </div>
      </div>
    </section>
  );
};
