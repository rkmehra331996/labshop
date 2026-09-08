import React from 'react';
import { Phone, Globe, KeyRound, LogOut, UserCheck, LayoutDashboard, Building2, Stethoscope } from 'lucide-react';
import { AppView, Language, UserRole } from '../types';
import { useCms } from '../context/CmsContext';
import { ALL_ROLES_CONFIG } from '../utils/rbac';

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
  const { currentUser, logout, openLoginModal, companySettings } = useCms();
  const supportPhone = companySettings.supportPhone || '+91 7087033009';

  const handleLaunchDepartment = (role: UserRole, view: AppView) => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'vendor' || currentUser.role === role)) {
      onSelectView(view);
    } else {
      openLoginModal(role);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return '👑 Super Admin';
      case 'vendor':
        return '🏢 Lab Admin';
      case 'branch_manager':
        return '🏢 Branch Mgr';
      case 'reception':
        return '🖥️ Reception';
      case 'technician':
        return '🔬 Tech';
      case 'pathologist':
        return '🩺 Pathologist';
      default:
        return role;
    }
  };

  return (
    <div className="bg-[#123B6D] text-white text-xs border-b border-white/10 shrink-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 flex items-center justify-between gap-4">
        {/* 1. Support Number & Navigation */}
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
            currentView === 'branch_manager_dashboard' ||
            currentView === 'pathologist_dashboard' ||
            currentView === 'vendor_dashboard' ||
            currentView === 'admin_dashboard' ||
            currentView === 'lab_app') && (
            <button
              type="button"
              onClick={() => onSelectView('vendor_website')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-full text-[11px] sm:text-xs transition shadow-xs cursor-pointer active:scale-95"
              title="Return to Vendor Home Website"
            >
              <Globe className="w-3.5 h-3.5 text-slate-950" />
              <span>← Lab Website</span>
            </button>
          )}
        </div>

        {/* Right side: 2. Staff Login & 3. Language */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Active User Session & Role Switches */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-black/25 pl-2.5 pr-1.5 py-1 rounded-full border border-white/20 text-xs">
              <div className="flex items-center gap-1.5 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="max-w-[100px] sm:max-w-[140px] truncate text-slate-200 font-semibold">
                  {currentUser.name}
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white/15 text-amber-300">
                  {getRoleLabel(currentUser.role)}
                </span>
                {currentUser.branchName && (
                  <span className="hidden xl:inline-block text-[10px] text-slate-300 font-normal">
                    • {currentUser.branchName}
                  </span>
                )}
              </div>

              {/* Quick Workspace Switchers for Admin / Vendor */}
              {(currentUser.role === 'admin' || currentUser.role === 'vendor') && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectView('vendor_dashboard')}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                      currentView === 'vendor_dashboard'
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-white/50'
                        : 'bg-amber-400/80 hover:bg-amber-400 text-slate-950'
                    }`}
                    title="Lab Owner / Vendor Dashboard"
                  >
                    <span>Lab HQ</span>
                  </button>
                  <button
                    onClick={() => onSelectView('branch_manager_dashboard')}
                    className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                      currentView === 'branch_manager_dashboard'
                        ? 'bg-blue-400 text-slate-950 ring-2 ring-white/50'
                        : 'bg-blue-400/80 hover:bg-blue-400 text-slate-950'
                    }`}
                    title="Branch Operations Desk"
                  >
                    <span>Branch</span>
                  </button>
                  <button
                    onClick={() => onSelectView('reception_dashboard')}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                      currentView === 'reception_dashboard'
                        ? 'bg-teal-400 text-slate-950 ring-2 ring-white/50'
                        : 'bg-teal-400/80 hover:bg-teal-400 text-slate-950'
                    }`}
                    title="Receptionist Counter"
                  >
                    <span>Reception</span>
                  </button>
                  <button
                    onClick={() => onSelectView('technician_dashboard')}
                    className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                      currentView === 'technician_dashboard'
                        ? 'bg-purple-400 text-slate-950 ring-2 ring-white/50'
                        : 'bg-purple-400/80 hover:bg-purple-400 text-slate-950'
                    }`}
                    title="Technician Workstation"
                  >
                    <span>Tech</span>
                  </button>
                  <button
                    onClick={() => onSelectView('pathologist_dashboard')}
                    className={`hidden md:inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                      currentView === 'pathologist_dashboard'
                        ? 'bg-emerald-400 text-slate-950 ring-2 ring-white/50'
                        : 'bg-emerald-400/80 hover:bg-emerald-400 text-slate-950'
                    }`}
                    title="Pathologist Verification Desk"
                  >
                    <span>Patho</span>
                  </button>
                </div>
              )}

              {/* Dedicated role button for non-admin staff */}
              {currentUser.role === 'branch_manager' && (
                <button
                  onClick={() => onSelectView('branch_manager_dashboard')}
                  className="px-2 py-0.5 bg-blue-400 hover:bg-blue-300 text-slate-950 font-bold rounded-full text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  <Building2 className="w-3 h-3" />
                  <span>Branch Desk</span>
                </button>
              )}

              {currentUser.role === 'pathologist' && (
                <button
                  onClick={() => onSelectView('pathologist_dashboard')}
                  className="px-2 py-0.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-full text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  <Stethoscope className="w-3 h-3" />
                  <span>Clinical Desk</span>
                </button>
              )}

              {currentUser.role === 'reception' && (
                <button
                  onClick={() => onSelectView('reception_dashboard')}
                  className="px-2 py-0.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-full text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  <LayoutDashboard className="w-3 h-3" />
                  <span>Reception Desk</span>
                </button>
              )}

              {currentUser.role === 'technician' && (
                <button
                  onClick={() => onSelectView('technician_dashboard')}
                  className="px-2 py-0.5 bg-purple-400 hover:bg-purple-300 text-slate-950 font-bold rounded-full text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  <LayoutDashboard className="w-3 h-3" />
                  <span>Technician Bench</span>
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
              <button
                onClick={() => handleLaunchDepartment('reception', 'reception_dashboard')}
                className="px-2 py-1 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                title="Login / Open Reception Department"
              >
                <span>🖥️ Reception</span>
              </button>
              <button
                onClick={() => handleLaunchDepartment('technician', 'technician_dashboard')}
                className="hidden sm:inline-flex px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[11px] items-center gap-1 transition shadow-2xs cursor-pointer"
                title="Login / Open Technician Department"
              >
                <span>🔬 Tech</span>
              </button>
              <button
                onClick={() => handleLaunchDepartment('pathologist', 'pathologist_dashboard')}
                className="hidden md:inline-flex px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] items-center gap-1 transition shadow-2xs cursor-pointer"
                title="Login / Open Pathologist Desk"
              >
                <span>🩺 Pathologist</span>
              </button>
              <button
                onClick={() => handleLaunchDepartment('vendor', 'vendor_dashboard')}
                className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                title="Login / Open Lab Owner Panel"
              >
                <span>👑 Lab Admin</span>
              </button>
              <button
                onClick={() => openLoginModal()}
                id="topbar-btn-staff-login"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] border border-white/20 transition cursor-pointer"
                title="Role-Based Login"
              >
                <KeyRound className="w-3 h-3 text-amber-300" />
                <span>Role Login</span>
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
