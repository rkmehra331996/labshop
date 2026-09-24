import React from 'react';
import { ArrowRight, MessageSquare, PhoneCall, ShieldCheck, Building2 } from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface FinalCTASectionProps {
  onOpenDemo?: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = () => {
  const { openRegisterLabModal, companySettings } = useCms();
  const phone = companySettings?.supportPhone || '+91 7087033009';
  const cleanPhone = phone.replace(/\D/g, '');

  return (
    <section id="contact-section" className="py-16 sm:py-20 bg-gradient-to-br from-[#123B6D] to-[#0e2c52] text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 border border-white/20 text-xs font-bold mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>Made for Indian Laboratories • Instant Setup</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Start Your Laboratory Digitally.
        </h2>

        {/* Subheading */}
        <p className="text-base sm:text-lg text-slate-200 mt-3 font-medium tracking-wide">
          Patients • Tests • Samples • Reports • Billing • WhatsApp Dispatch
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button
            id="final-cta-btn-create-lab"
            onClick={openRegisterLabModal}
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 px-8 py-3.5 rounded-xl font-black text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Building2 className="w-4 h-4 text-slate-950" />
            <span>Register & Create Your Lab</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <a
            href={`https://wa.me/${cleanPhone}?text=Hello%20IndianLalaji,%20I%20want%20to%20set%20up%20software%20for%20my%20pathology%20lab`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* WhatsApp & Support info */}
        <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 font-semibold transition"
          >
            <PhoneCall className="w-4 h-4 text-amber-400" />
            <span>Helpline: {phone}</span>
          </a>
          <span className="hidden sm:inline text-white/30">•</span>
          <span>Super Admin: rkmehra331996@gmail.com</span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span>Free Initial Onboarding & Data Import Assistance</span>
        </div>
      </div>
    </section>
  );
};
