import React from 'react';
import {
  ShieldCheck,
  Building,
  MapPin,
  Lock,
  ChevronDown,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { AppView } from '../types';
import { ALL_ROLES_CONFIG } from '../utils/rbac';

interface RoleContextBannerProps {
  currentView: AppView;
  onNavigateView: (view: AppView) => void;
}

export const RoleContextBanner: React.FC<RoleContextBannerProps> = ({
  currentView,
  onNavigateView,
}) => {
  const { currentUser, logout, openLoginModal, vendorBranches, activeBranchId, setActiveBranchId } =
    useCms();

  if (!currentUser) return null;

  const role = currentUser.role;
  const permissions = currentUser.permissions;

  // Find role metadata
  let roleKey: keyof typeof ALL_ROLES_CONFIG = 'receptionist';
  if (role === 'admin') roleKey = 'super_admin';
  else if (role === 'vendor') roleKey = 'lab_admin';
  else if (role === 'branch_manager') roleKey = 'branch_manager';
  else if (role === 'reception') roleKey = 'receptionist';
  else if (role === 'technician') roleKey = 'technician';
  else if (role === 'pathologist') roleKey = 'pathologist';

  const cfg = ALL_ROLES_CONFIG[roleKey];
  const canSwitchBranches = permissions?.canViewAllBranchesData || role === 'admin' || role === 'vendor';

  return (
    <aside aria-label="Role & Branch Context" className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs px-4 py-2 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Section: User Role & Active Lab */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* User Tag */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-full">
            <span className="text-sm">{cfg.emoji}</span>
            <span className="font-bold text-white tracking-tight">{currentUser.name}</span>
            <span
              className={`ml-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.badgeColor}`}
            >
              {cfg.title.split('(')[0].trim()}
            </span>
          </div>

          {/* Active Lab */}
          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800/60 border border-slate-700/60 px-2.5 py-1 rounded-full text-[11px]">
            <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400">Lab:</span>
            <span className="font-bold text-slate-200 truncate max-w-[130px] sm:max-w-[200px]">
              {currentUser.labName || 'Apex Diagnostic Central'}
            </span>
            <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-mono">
              {currentUser.labId || 'lab-apex'}
            </span>
          </div>

          {/* Active Branch */}
          <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 px-2.5 py-1 rounded-full text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400">Branch:</span>
            {canSwitchBranches ? (
              <div className="flex items-center gap-1">
                <select
                  value={activeBranchId}
                  onChange={(e) => setActiveBranchId(e.target.value)}
                  className="bg-slate-900 text-amber-300 font-bold border border-slate-700 rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none cursor-pointer"
                  title="Switch branch context"
                >
                  <option value="all">🌐 All Branches (Consolidated)</option>
                  {vendorBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      📍 {b.name} ({b.id})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                  Multi-Branch Access
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-bold text-amber-300">
                  {currentUser.branchName || 'Model Town Collection Centre'}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded font-semibold">
                  <Lock className="w-2.5 h-2.5" />
                  <span>{currentUser.branchId || 'branch-2'}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Role Permissions Pills & Switcher */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Dashboard Quick Switcher if user has multi-dashboard privilege */}
          {role === 'admin' && (
            <div className="hidden lg:flex items-center gap-1">
              <button
                type="button"
                onClick={() => onNavigateView('admin_dashboard')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  currentView === 'admin_dashboard'
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-300 hover:text-white bg-slate-800'
                }`}
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => onNavigateView('vendor_dashboard')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  currentView === 'vendor_dashboard'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white bg-slate-800'
                }`}
              >
                Lab Admin
              </button>
              <button
                type="button"
                onClick={() => onNavigateView('branch_manager_dashboard')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  currentView === 'branch_manager_dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white bg-slate-800'
                }`}
              >
                Branch Manager
              </button>
              <button
                type="button"
                onClick={() => onNavigateView('reception_dashboard')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  currentView === 'reception_dashboard'
                    ? 'bg-teal-500 text-white'
                    : 'text-slate-300 hover:text-white bg-slate-800'
                }`}
              >
                Reception
              </button>
              <button
                type="button"
                onClick={() => onNavigateView('technician_dashboard')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  currentView === 'technician_dashboard'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:text-white bg-slate-800'
                }`}
              >
                Technician
              </button>
              <button
                type="button"
                onClick={() => onNavigateView('pathologist_dashboard')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  currentView === 'pathologist_dashboard'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white bg-slate-800'
                }`}
              >
                Pathologist
              </button>
            </div>
          )}

          {/* Quick 1-Click Role Switch button */}
          <button
            type="button"
            onClick={() => openLoginModal()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-[11px] transition shadow-xs cursor-pointer active:scale-95"
            title="Switch login role or test another role"
          >
            <RefreshCw className="w-3 h-3 text-slate-950" />
            <span>Switch Role / Re-login</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-rose-900/40 text-rose-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700/60 rounded-lg text-[11px] font-bold transition cursor-pointer"
            title="Sign out of current role"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
