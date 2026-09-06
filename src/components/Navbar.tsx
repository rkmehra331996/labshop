import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ArrowRight, ChevronDown, Building2, ExternalLink, Sparkles } from 'lucide-react';
import { AppView } from '../types';
import { useCms } from '../context/CmsContext';

interface NavbarProps {
  onOpenTrial: () => void;
  onOpenDemo: () => void;
  onSelectView: (view: AppView) => void;
  currentView: AppView;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTrial,
  onOpenDemo,
  onSelectView,
  currentView,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const vendorDropdownRef = useRef<HTMLDivElement>(null);
  const { vendorLabsList, selectVendorLab } = useCms();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(e.target as Node)) {
        setVendorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setVendorDropdownOpen(false);
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
                <span className="text-amber-400">L</span>N
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-2xl tracking-tighter text-[#123B6D] leading-none">
                  LABNAME<span className="text-[#0F766E]">.COM</span>
                </span>
                <span className="text-[10px] text-[#64748B] font-medium tracking-wide mt-0.5">
                  Laboratory Management Software for India
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Menu - Exact requested 6 menu items: Home, Features, Solutions, Showcase, Pricing, Contact Us */}
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

            {/* 3. Solutions */}
            <button
              onClick={() => scrollToSection('solution-section')}
              className="hover:text-[#123B6D] transition cursor-pointer text-slate-700 hover:font-bold whitespace-nowrap inline-block"
              id="nav-link-solutions"
            >
              Solutions
            </button>

            {/* 4. Showcase (Partner Lab Websites) */}
            <div
              className="relative whitespace-nowrap"
              ref={vendorDropdownRef}
              onMouseEnter={() => setVendorDropdownOpen(true)}
              onMouseLeave={() => setVendorDropdownOpen(false)}
            >
              <button
                onClick={() => scrollToSection('vendor-showcase-section')}
                className={`hover:text-[#123B6D] transition flex items-center gap-1.5 py-1 cursor-pointer whitespace-nowrap ${
                  vendorDropdownOpen ? 'text-[#123B6D]' : 'text-slate-700'
                }`}
                id="nav-link-showcase"
                aria-expanded={vendorDropdownOpen}
                title="View Partner Lab Websites in Showcase Cards"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Showcase</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-full border border-amber-200">
                  {vendorLabsList.length} Labs
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    vendorDropdownOpen ? 'rotate-180 text-[#123B6D]' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Dropdown Menu listing all vendor websites */}
              {vendorDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[430px] z-50">
                  <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-3">
                    <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-bold text-[#123B6D] uppercase tracking-wider block">
                          Partner Lab Showcase
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Live client websites with online booking & reports
                        </span>
                      </div>
                    </div>

                    {/* View All Showcase Cards Button */}
                    <button
                      onClick={() => scrollToSection('vendor-showcase-section')}
                      className="w-full mb-2.5 p-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>View All Showcase Cards</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                      {vendorLabsList.map((lab) => (
                        <button
                          key={lab.id}
                          onClick={() => {
                            selectVendorLab(lab.id);
                            onSelectView('vendor_website');
                            setVendorDropdownOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-amber-50/70 border border-transparent hover:border-amber-200 transition group flex items-start gap-3 cursor-pointer"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 font-bold text-[11px] shadow-2xs mt-0.5"
                            style={{ backgroundColor: lab.color || '#123B6D' }}
                          >
                            {lab.city.slice(0, 3).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-slate-900 group-hover:text-[#123B6D] truncate">
                                {lab.name}
                              </span>
                              <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/70 shrink-0">
                                {lab.city}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{lab.tagline}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span className="text-emerald-700 font-semibold">✓ {lab.nablCode}</span>
                              <span>•</span>
                              <span>{lab.activePackages} Packages</span>
                              {lab.emergency && (
                                <>
                                  <span>•</span>
                                  <span className="text-rose-600 font-bold">24x7</span>
                                </>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#123B6D] shrink-0 mt-1" />
                        </button>
                      ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] px-2 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Live Lab Portals
                      </span>
                      <button
                        onClick={() => {
                          setVendorDropdownOpen(false);
                          onOpenTrial();
                        }}
                        className="text-[#0F766E] font-bold hover:underline cursor-pointer"
                      >
                        Get Your Lab Website →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Pricing */}
            <button
              onClick={() => scrollToSection('pricing-section')}
              className="hover:text-[#123B6D] transition cursor-pointer text-slate-700 hover:font-bold whitespace-nowrap inline-block"
              id="nav-link-pricing"
            >
              Pricing
            </button>

            {/* 6. Contact Us */}
            <button
              onClick={() => scrollToSection('contact-section')}
              className="hover:text-[#123B6D] transition cursor-pointer text-slate-700 hover:font-bold whitespace-nowrap inline-block"
              id="nav-link-contact"
            >
              Contact Us
            </button>
          </div>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Book a Demo */}
            <button
              onClick={onOpenDemo}
              className="text-xs font-bold text-[#123B6D] hover:text-[#0e2c52] px-3.5 py-2 border border-slate-200 hover:border-slate-300 rounded-lg transition cursor-pointer"
              id="navbar-btn-demo"
            >
              Book a Demo
            </button>

            {/* Start Free Trial CTA */}
            <button
              onClick={onOpenTrial}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              id="navbar-btn-trial"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenTrial}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs"
            >
              Free Trial
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

      {/* Mobile Drawer Menu - Clean 6 items: Home, Features, Solutions, Showcase, Pricing, Contact Us */}
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

            {/* 3. Solutions */}
            <button
              onClick={() => scrollToSection('solution-section')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
            >
              <span>Solutions</span>
            </button>

            {/* 4. Showcase (Partner Lab Websites) */}
            <div className="py-1">
              <button
                onClick={() => scrollToSection('vendor-showcase-section')}
                className="w-full text-left py-2 px-3 rounded-lg bg-amber-50 text-amber-900 font-bold border border-amber-200/80 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Showcase</span>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-black">
                  {vendorLabsList.length} Partner Labs
                </span>
              </button>
            </div>

            {/* 5. Pricing */}
            <button
              onClick={() => scrollToSection('pricing-section')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
            >
              <span>Pricing</span>
            </button>

            {/* 6. Contact Us */}
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
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrial();
              }}
              className="w-full bg-[#123B6D] hover:bg-[#0e2c52] text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo();
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold"
            >
              Book a Demo
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

