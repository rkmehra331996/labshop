import React from 'react';
import { Phone, Globe, KeyRound, LogOut, UserCheck, LayoutDashboard } from 'lucide-react';
import { AppView, Language } from '../types';
import { useCms } from '../context/CmsContext';

interface TopBarProps {
  currentView?: AppView;
  onSelectView?: (view: AppView) => void;
  language?: Language;
  onSelectLanguage?: (lang: Language) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView = 'website',
  onSelectView = (_view: AppView) => {},
  language = 'en',
  onSelectLanguage = (_lang: Language) => {},
}) => {
  const { currentUser, logout, openLoginModal, login, companySettings } = useCms();
  const supportPhone = companySettings.supportPhone || '+91 7087033009';

  const handleQuickLaunchDepartment = (role: 'reception' | 'technician' | 'admin', view: AppView) => {
    login(role);
    onSelectView(view);
  };

  return (
    <div className="bg-[#123B6D] text-white text-xs border-b border-white/10 shrink-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 flex items-center justify-between gap-4">
        {/* 1. Support Number & Vendor Website Navigation */}
        <div className="flex items-center gap-3">
          <a
            href={`tel:${supportPhone.replace(/\s+/g, '')}`}
            id="topbar-support-phone"
            className="inline-flex items-center gap-2 text-slate-100 hover:text-white transition font-medium text-xs sm:text-sm group"
            title="Call laboratory support helpline"
          >
            <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="hidden sm:inline text-slate-300 font-normal text-xs">Support:</span>
            <span className="font-semibold tracking-wide text-amber-300 group-hover:text-amber-200">{supportPhone}</span>
          </a>

          {(currentView === 'reception_dashboard' ||
            currentView === 'technician_dashboard' ||
            currentView === 'vendor_dashboard' ||
            currentView === 'lab_app') && (
            <button
              type="button"
              onClick={() => onSelectView('vendor_website')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-full text-[11px] sm:text-xs transition shadow-xs cursor-pointer active:scale-95 animate-pulse"
              title="Return to Vendor Home Website"
            >
              <Globe className="w-3.5 h-3.5 text-slate-950" />
              <span>← Vendor Home Website</span>
            </button>
          )}
        </div>

        {/* Right side: 2. Staff Login & 3. Language */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* 2. Staff Login */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-black/25 pl-2.5 pr-1.5 py-1 rounded-full border border-white/20 text-xs">
              <div className="flex items-center gap-1.5 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="max-w-[110px] sm:max-w-[150px] truncate text-slate-200 font-semibold">{currentUser.name}</span>
                <span className="hidden md:inline-block px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider bg-white/15 text-amber-300">
                  {currentUser.role === 'admin' ? '👑 Admin' : currentUser.role === 'reception' ? '🖥️ Reception' : '🔬 Tech'}
                </span>
              </div>

              {/* Direct Dashboard Link */}
              {currentUser.role === 'admin' && currentView !== 'reception_dashboard' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectView('vendor_dashboard')}
                    className="px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-full text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
                    title="Open Lab Owner CMS & Master Dashboard"
                  >
                    <span>👑 Lab Owner</span>
                  </button>
                  <button
                    onClick={() => onSelectView('reception_dashboard')}
                    className="px-2 py-0.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-full text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
                    title="Open Reception Department Desk"
                  >
                    <span>🖥️ Reception</span>
                  </button>
                  <button
                    onClick={() => onSelectView('technician_dashboard')}
                    className="px-2 py-0.5 bg-purple-400 hover:bg-purple-300 text-slate-950 font-bold rounded-full text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
                    title="Open Technician Department Workstation"
                  >
                    <span>🔬 Technician</span>
                  </button>
                  <button
                    onClick={() => onSelectView('admin_dashboard')}
                    className="px-2 py-0.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-full text-[11px] flex items-center gap-1 transition cursor-pointer border border-white/20"
                    title="Open SaaS Portal Admin"
                  >
                    <LayoutDashboard className="w-3 h-3 text-amber-300" />
                    <span className="hidden sm:inline">CMS</span>
                  </button>
                </div>
              )}

              {currentUser.role === 'reception' && (
                <button
                  onClick={() => onSelectView('reception_dashboard')}
                  className="px-2 py-0.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-full text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
                  title="Open Reception Desk"
                >
                  <LayoutDashboard className="w-3 h-3" />
                  <span className="hidden sm:inline">Reception Counter #1</span>
                </button>
              )}

              {currentUser.role === 'technician' && (
                <button
                  onClick={() => onSelectView('technician_dashboard')}
                  className="px-2 py-0.5 bg-purple-400 hover:bg-purple-300 text-slate-950 font-bold rounded-full text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
                  title="Open Technician Department Dashboard"
                >
                  <LayoutDashboard className="w-3 h-3" />
                  <span className="hidden sm:inline">Technician Workstation</span>
                </button>
              )}

              <button
                onClick={logout}
                title="Sign out of staff account"
                className="ml-1 text-rose-300 hover:text-rose-100 font-bold hover:underline flex items-center gap-1 p-1 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="hidden lg:inline text-[11px] text-slate-300 font-bold mr-1">
                3 Departments:
              </span>
              <button
                onClick={() => handleQuickLaunchDepartment('reception', 'reception_dashboard')}
                className="px-2 py-1 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                title="Open Reception Department Panel"
              >
                <span>🖥️ Reception</span>
              </button>
              <button
                onClick={() => handleQuickLaunchDepartment('technician', 'technician_dashboard')}
                className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                title="Open Technician Department Panel"
              >
                <span>🔬 Technician</span>
              </button>
              <button
                onClick={() => handleQuickLaunchDepartment('admin', 'vendor_dashboard')}
                className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                title="Open Lab Owner / Admin Panel"
              >
                <span>👑 Lab Owner</span>
              </button>
              <button
                onClick={() => openLoginModal()}
                id="topbar-btn-staff-login"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] border border-white/20 transition cursor-pointer"
                title="Custom Login credentials"
              >
                <KeyRound className="w-3 h-3 text-amber-300" />
                <span className="hidden sm:inline">Login</span>
              </button>
            </div>
          )}

          {/* 3. Language Selector */}
          <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-white/20">
            <Globe className="w-3.5 h-3.5 text-slate-300" />
            <select
              id="topbar-language-select"
              aria-label="Select website language"
              value={language}
              onChange={(e) => onSelectLanguage(e.target.value as Language)}
              className="bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-md px-2 py-1 border border-white/20 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer transition"
            >
              <option value="en" className="text-slate-900 bg-white">English</option>
              <option value="hi" className="text-slate-900 bg-white">हिंदी</option>
              <option value="pa" className="text-slate-900 bg-white">ਪੰਜਾਬੀ</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
