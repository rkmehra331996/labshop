import React from 'react';
import { ArrowRight, CheckCircle2, Users, FlaskConical, Clock, CheckCheck, IndianRupee, AlertCircle, Laptop, ShieldCheck, WifiOff } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { useCms } from '../context/CmsContext';

interface HeroProps {
  onOpenTrial: () => void;
  onOpenDemo: () => void;
  onLaunchApp: () => void;
  language?: Language;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenTrial,
  onOpenDemo,
  onLaunchApp,
  language = 'en',
}) => {
  const { companySettings } = useCms();
  const t = (language && TRANSLATIONS[language]) || TRANSLATIONS['en'];

  // Use dynamic CMS company settings if English, or fall back to translated text
  const heroBadge = language === 'en' ? companySettings.heroBadge : t.tagline;
  const heroHeading = language === 'en' ? companySettings.heroTitle : t.heroHeading;
  const heroSubheading = language === 'en' ? companySettings.heroSubtitle : t.heroSubheading;

  return (
    <section id="hero-section" className="relative overflow-hidden bg-[#F8FAFC] pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Messaging & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123B6D]/10 text-[#123B6D] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{heroBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] lg:leading-[1.1] font-extrabold text-[#123B6D] tracking-tight">
              {heroHeading}
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-[480px]">
              {heroSubheading}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
              <button
                id="hero-btn-start-trial"
                onClick={onOpenTrial}
                className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-8 py-3.5 rounded-lg font-bold text-sm transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span>{t.startTrial}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                id="hero-btn-book-demo"
                onClick={onOpenDemo}
                className="bg-white hover:bg-slate-50 border-2 border-[#123B6D] text-[#123B6D] px-8 py-3.5 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <span>{t.bookDemo}</span>
              </button>
            </div>

            {/* Trust Points */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-[#64748B] tracking-wider uppercase">
                <span>Cloud Based</span>
                <span>•</span>
                <span>₹ INR Billing</span>
                <span>•</span>
                <span>WhatsApp Reports</span>
                <span>•</span>
                <span>Offline Support</span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Dashboard Preview with Clean Minimalism floating badge */}
          <div className="lg:col-span-6 relative pb-6 sm:pb-0">
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
              {/* Window Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
                <span className="text-xs font-bold text-[#123B6D] uppercase tracking-widest">
                  Laboratory Dashboard
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  </div>
                  <button
                    onClick={onLaunchApp}
                    className="text-[10px] bg-[#123B6D] hover:bg-[#0e2c52] text-white px-2 py-0.5 rounded font-semibold transition"
                  >
                    Launch App
                  </button>
                </div>
              </div>

              {/* Dashboard Content as specified */}
              <div className="p-5 sm:p-6 space-y-4 bg-white">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-xs text-[#64748B] font-medium">Today's Patients</div>
                    <div className="text-2xl font-bold text-[#123B6D] mt-0.5">126</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1">↑ 12% from yesterday</div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-xs text-[#64748B] font-medium">Total Collection</div>
                    <div className="text-2xl font-bold text-[#123B6D] mt-0.5">₹42,850</div>
                    <div className="text-[10px] text-[#F59E0B] font-bold mt-1">₹8,420 Outstanding</div>
                  </div>
                </div>

                {/* Live Activity Row inside dashboard preview */}
                <div className="space-y-2 mt-2">
                  <div className="text-xs font-bold uppercase text-[#64748B] tracking-wider mb-2">
                    Recent Activities
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 font-medium">
                    <span>CBC Report Verified (ID: 10421)</span>
                    <span className="font-mono text-[11px]">12:03 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 text-slate-700 rounded-lg border border-slate-100">
                    <span>Patient Sample Collected (ID: 10425)</span>
                    <span className="font-mono text-[11px] text-slate-500">11:18 AM</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-blue-50/70 text-blue-900 rounded-lg border border-blue-100/60">
                    <span>Thyroid Profile (TSH, T3, T4) Processing</span>
                    <span className="font-mono text-[11px] text-blue-700">10:45 AM</span>
                  </div>
                </div>
              </div>

              {/* Bottom bar of dashboard preview */}
              <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-[#64748B]">
                <span className="font-medium">NABL & ISO 15189 Workflow Ready</span>
                <span className="font-bold text-[#123B6D]">₹42,850 INR Today</span>
              </div>
            </div>

            {/* Floating Offline Mode Badge Card (Clean Minimalism Spec) */}
            <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-4 sm:-left-6 w-full sm:w-[280px] bg-[#0F766E] text-white p-5 rounded-2xl shadow-xl z-20 border border-teal-600/30">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  !
                </div>
                <div className="text-xs font-bold uppercase tracking-wide">Offline Mode</div>
              </div>
              <p className="text-xs opacity-95 leading-normal mb-3 font-medium">
                Internet Gaya? Lab Ka Kaam Nahi Rukega. Automatic Sync When Back.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight">
                <span className="px-2 py-0.5 bg-rose-500 text-white rounded">Offline</span>
                <span className="text-white/70">→</span>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded">Queue</span>
                <span className="text-white/70">→</span>
                <span className="px-2 py-0.5 bg-emerald-400 text-slate-950 rounded">Cloud</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Clean Minimalist Feature Cards under Hero as in Design Spec */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 pt-8 border-t border-slate-200">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 shrink-0 bg-blue-50 text-[#123B6D] rounded-lg flex items-center justify-center text-xl">
              📑
            </div>
            <div>
              <h3 className="font-bold text-[#123B6D] text-sm mb-1">Patient Report Portal</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Download reports without login using Name and Mobile Number.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 shrink-0 bg-green-50 text-[#0F766E] rounded-lg flex items-center justify-center text-xl">
              💬
            </div>
            <div>
              <h3 className="font-bold text-[#123B6D] text-sm mb-1">WhatsApp Automation</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Send verified PDF reports directly to patients as soon as they are ready.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 shrink-0 bg-amber-50 text-[#F59E0B] rounded-lg flex items-center justify-center text-xl">
              🏢
            </div>
            <div>
              <h3 className="font-bold text-[#123B6D] text-sm mb-1">Multi-Branch Sync</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Centralized management for laboratory groups and collection centers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
