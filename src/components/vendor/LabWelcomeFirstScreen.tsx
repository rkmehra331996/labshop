import React from 'react';
import {
  Globe,
  Calendar,
  FileText,
  ShieldCheck,
  Phone,
  Sparkles,
  MapPin,
  Clock,
  KeyRound,
  Home,
} from 'lucide-react';

interface LabWelcomeFirstScreenProps {
  labName: string;
  labShopId: string;
  labLogoUrl?: string;
  labNabl?: string;
  labAddress?: string;
  labPhone?: string;
  backgroundImageUrl?: string;
  onVisitWebsite: () => void;
  onBookTest: () => void;
  onCheckReport: () => void;
  onStaffLogin?: () => void;
  onOpenSoftwareWebsite?: () => void;
}

export const LabWelcomeFirstScreen: React.FC<LabWelcomeFirstScreenProps> = ({
  labName,
  labShopId,
  labLogoUrl,
  labNabl = 'MC-4821',
  labPhone = '7087033009',
  backgroundImageUrl,
  onVisitWebsite,
  onBookTest,
  onCheckReport,
  onStaffLogin,
  onOpenSoftwareWebsite,
}) => {
  // Default high-resolution diagnostic laboratory background image (NABL Automated Lab)
  const defaultBg =
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=2000&q=85';
  const effectiveBg = backgroundImageUrl?.trim() || defaultBg;

  return (
    <section className="relative w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden bg-slate-950 text-white select-none">
      {/* 1. Large High-Res Laboratory Background Image (Uploaded by Vendor or Default NABL Lab) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url('${effectiveBg}')` }}
      />

      {/* 2. Automatic Transparent Gradient Overlay: bg-gradient-to-b from-slate-950/85 via-slate-900/70 to-slate-950/90 */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/70 to-slate-950/90 backdrop-blur-[2px]" />

      {/* Ambient Blue Radial Glow for Diagnostic Aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(18,59,109,0.40)_0%,transparent_70%)] pointer-events-none" />

      {/* Top Meta Bar */}
      <header className="relative z-10 w-full px-4 sm:px-8 pt-4 sm:pt-6 flex items-center justify-between gap-2 text-xs">
        {/* Left: NABL Accreditation Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-emerald-300 font-semibold shadow-sm transition">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">NABL Accredited {labNabl}</span>
        </div>

        {/* Right: Quick Action Buttons (Helpline + Staff Login) */}
        <div className="flex items-center gap-2">
          {onOpenSoftwareWebsite && (
            <button
              type="button"
              onClick={onOpenSoftwareWebsite}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-slate-200 text-xs font-medium transition cursor-pointer"
              title="IndianLalaji Network Portal"
            >
              <Home className="w-3 h-3 text-amber-300" />
              <span>Network</span>
            </button>
          )}

          <a
            href={`tel:${labPhone.replace(/\D/g, '')}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] sm:text-xs shadow-md transition"
          >
            <Phone className="w-3 h-3 text-slate-950 shrink-0" />
            <span className="hidden xs:inline">Helpline:</span>
            <span>{labPhone}</span>
          </a>

          {onStaffLogin && (
            <button
              type="button"
              onClick={onStaffLogin}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white text-[11px] sm:text-xs font-bold transition cursor-pointer shadow-xs"
              title="Lab Staff & Admin Login"
            >
              <KeyRound className="w-3 h-3 text-amber-300" />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      {/* 3. Center Screen: Lab Logo + Lab Name + Headings + 3 Main Action Buttons */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col items-center justify-center text-center my-auto">
        {/* Center Lab Logo */}
        <div className="relative mb-4 sm:mb-5 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 to-teal-400/30 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500" />
          {labLogoUrl ? (
            <img
              src={labLogoUrl}
              alt={labName}
              referrerPolicy="no-referrer"
              className="relative w-18 h-18 sm:w-24 sm:h-24 rounded-2xl object-contain bg-white/95 p-1.5 border-2 border-white/40 shadow-2xl"
            />
          ) : (
            <div className="relative w-18 h-18 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#123B6D] via-[#0F766E] to-[#1E3A8A] border-2 border-white/40 flex items-center justify-center shadow-2xl">
              <span className="font-black text-2xl sm:text-3xl tracking-tight text-white">
                <span className="text-amber-400">{labName.charAt(0) || 'A'}</span>
                {labName.split(' ')[1]?.charAt(0) || 'D'}
              </span>
            </div>
          )}
          {/* Shop ID Tag */}
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/50 text-[10px] font-mono font-bold tracking-wider shadow-sm whitespace-nowrap">
            ID: {labShopId}
          </span>
        </div>

        {/* Main Heading: Welcome to [Lab Name] */}
        <div className="space-y-2 sm:space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Official Diagnostic Laboratory Portal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md leading-[1.15]">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-teal-300">{labName}</span>
          </h1>

          {/* Subheading: Book Tests • View Reports • Get Your Lab Services Online */}
          <p className="text-sm sm:text-lg lg:text-xl font-medium text-slate-200/90 max-w-2xl mx-auto tracking-wide drop-shadow-xs">
            Book Tests • View Reports • Get Your Lab Services Online
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto hidden xs:block pt-1 leading-relaxed">
            100% NABL Accredited pathology testing, certified gentle home sample pickup, and instant verifiable WhatsApp & PDF reports.
          </p>
        </div>

        {/* 4. Neeche 3 Main Buttons (Click to Enter / Open Pages) */}
        <div className="w-full max-w-2xl mt-6 sm:mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* 1. Visit Website Button */}
          <button
            type="button"
            onClick={onVisitWebsite}
            className="group relative flex items-center justify-center gap-2.5 px-5 py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer active:scale-95 border-2 border-white/60"
            id="welcome-btn-visit-website"
          >
            <Globe className="w-5 h-5 text-[#123B6D] group-hover:rotate-12 transition-transform duration-300 shrink-0" />
            <span className="tracking-tight">Visit Website</span>
          </button>

          {/* 2. Book Test Button */}
          <button
            type="button"
            onClick={onBookTest}
            className="group relative flex items-center justify-center gap-2.5 px-5 py-3.5 sm:py-4 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-sm sm:text-base shadow-xl hover:shadow-amber-500/25 transition-all duration-200 cursor-pointer active:scale-95 border-2 border-amber-300/80"
            id="welcome-btn-book-test"
          >
            <Calendar className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform duration-300 shrink-0" />
            <span className="tracking-tight">Book Test</span>
          </button>

          {/* 3. Check Report Button */}
          <button
            type="button"
            onClick={onCheckReport}
            className="group relative flex items-center justify-center gap-2.5 px-5 py-3.5 sm:py-4 rounded-2xl bg-[#0F766E] hover:bg-[#0c615a] text-white font-black text-sm sm:text-base shadow-xl hover:shadow-teal-500/25 transition-all duration-200 cursor-pointer active:scale-95 border-2 border-teal-400/80"
            id="welcome-btn-check-report"
          >
            <FileText className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform duration-300 shrink-0" />
            <span className="tracking-tight">Check Report</span>
          </button>
        </div>

        {/* Micro Trust Indicators */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Reports within 6 Hours</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Free Home Sample Pickup</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% NABL Verified</span>
          </span>
        </div>
      </main>

      {/* Footer Bottom Note */}
      <footer className="relative z-10 w-full pb-3 sm:pb-4 text-center">
        <p className="text-[11px] text-slate-500">
          Powered by <span className="font-semibold text-slate-400">indianlalaji.com</span> • Secure Diagnostic Cloud
        </p>
      </footer>
    </section>
  );
};
