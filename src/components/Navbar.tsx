import React, { useState } from 'react';
import { Menu, X, ArrowRight, Building2, KeyRound } from 'lucide-react';
import { AppView } from '../types';
import { useCms } from '../context/CmsContext';

interface NavbarProps {
  onOpenDemo: () => void;
  onSelectView: (view: AppView) => void;
  currentView: AppView;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDemo,
  onSelectView,
  currentView,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openLoginModal, openRegisterLabModal, companySettings } = useCms();
  const displayBrand = companySettings?.companyName || 'INDIANLALAJI.COM';

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'hero-section' || id === 'home') {
      if (currentView !== 'website') {
        onSelectView('website');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (currentView !== 'website') {
      onSelectView('website');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 bg-white border-b border-slate-200 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectView('website')}
              className="flex items-center gap-2.5 text-left group"
              id="navbar-logo-btn"
            >
              <div className="w-9 h-9 rounded-lg bg-[#123B6D] text-white flex items-center justify-center font-black text-base tracking-wider shadow-xs group-hover:bg-[#0e2c52] transition">
                <span className="text-amber-400">I</span>L
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-2xl tracking-tighter text-[#123B6D] leading-none uppercase">
                  {displayBrand.replace(/\.com$/i, '')}<span className="text-[#0F766E]">.COM</span>
                </span>
                <span className="text-[10px] text-[#64748B] font-medium tracking-wide mt-0.5">
                  Laboratory Management Software for India
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Menu: Home, Features, Solutions, Pricing, Contact Us */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-semibold text-slate-700 whitespace-nowrap">
            {/* 1. Home */}
            <button
              onClick={() => scrollToSection('hero-section')}
              className="hover:text-[#123B6D] transition cursor-pointer text-slate-700 hover:font-bold whitespace-nowrap inline-block"
              id="nav-link-home"
            >
              Home
            </button>

            {/* 2. Features */}
            <button
              onClick={() => scrollToSection('features-section')}
              className="hover:text-[#123B6D] transition cursor-pointer text-slate-700 hover:font-bold whitespace-nowrap inline-block"
              id="nav-link-features"
            >
              Features
            </button>

            {/* 3. Workflow */}
            <button
              onClick={() => scrollToSection('workflow-section')}
              className="hover:text-[#123B6D] transition cursor-pointer text-slate-700 hover:font-bold whitespace-nowrap inline-block"
              id="nav-link-workflow"
            >
              Workflow
            </button>

            {/* 4. Pricing */}
            <button
              onClick={() => scrollToSection('pricing-section')}
              className="hover:text-[#123B6D] transition cursor-pointer text-slate-700 hover:font-bold whitespace-nowrap inline-block"
              id="nav-link-pricing"
            >
              Pricing
            </button>

            {/* 5. Contact Us */}
            <button
              onClick={() => scrollToSection('contact-section')}
              className="hover:text-[#123B6D] transition cursor-pointer text-slate-700 hover:font-bold whitespace-nowrap inline-block"
              id="nav-link-contact"
            >
              Contact Us
            </button>
          </div>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Login */}
            <button
              onClick={() => openLoginModal(undefined, 'login')}
              className="text-xs font-bold text-[#123B6D] hover:text-[#0e2c52] px-3 py-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
              id="navbar-btn-login"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Login</span>
            </button>

            {/* Register / Create Lab */}
            <button
              onClick={() => openRegisterLabModal()}
              className="text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-2 border border-slate-200 hover:border-slate-300 rounded-lg transition flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100"
              id="navbar-btn-register-lab"
            >
              <Building2 className="w-3.5 h-3.5 text-[#123B6D]" />
              <span>Create Lab</span>
            </button>

            {/* Book Demo CTA */}
            <button
              onClick={onOpenDemo}
              className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
              id="navbar-btn-demo"
            >
              <span>Book Demo</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenDemo}
              className="bg-[#123B6D] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs"
            >
              Demo
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#123B6D] focus:outline-none"
              aria-label="Toggle navigation menu"
              id="navbar-mobile-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu - Clean 5 items: Home, Features, Solutions, Pricing, Contact Us */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1 text-sm font-semibold text-slate-800">
            {/* 1. Home */}
            <button
              onClick={() => scrollToSection('hero-section')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 font-bold text-[#123B6D] flex items-center justify-between"
            >
              <span>Home</span>
            </button>

            {/* 2. Features */}
            <button
              onClick={() => scrollToSection('features-section')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
            >
              <span>Features</span>
            </button>

            {/* 3. Workflow */}
            <button
              onClick={() => scrollToSection('workflow-section')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
            >
              <span>Workflow</span>
            </button>

            {/* 4. Pricing */}
            <button
              onClick={() => scrollToSection('pricing-section')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
            >
              <span>Pricing</span>
            </button>

            {/* 5. Contact Us */}
            <button
              onClick={() => scrollToSection('contact-section')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-between"
            >
              <span>Contact Us</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                7087033009
              </span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLoginModal(undefined, 'login');
                }}
                className="w-full bg-[#123B6D] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Login</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openRegisterLabModal();
                }}
                className="w-full bg-amber-400 text-slate-950 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Create Lab</span>
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo();
              }}
              className="w-full bg-[#123B6D] hover:bg-[#0e2c52] text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

