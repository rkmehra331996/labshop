import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Building,
  FlaskConical,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  KeyRound,
  UserCheck,
  Receipt,
  LogOut,
  Phone,
  Hash,
  Crown,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { AppView } from '../types';

interface CmsAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView: (view: AppView) => void;
}

export type AuthRole = 'super_admin' | 'vendor' | 'reception' | 'technician';

export const CmsAuthModal: React.FC<CmsAuthModalProps> = ({ isOpen, onClose, onNavigateView }) => {
  const { login, targetLoginRole, currentUser, logout, staffAccounts } = useCms();

  const [selectedRole, setSelectedRole] = useState<AuthRole>('super_admin');

  // Input fields
  const [emailOrPhone, setEmailOrPhone] = useState('rkmehra331996@gmail.com');
  const [password, setPassword] = useState('Asdfzxcv@331996@#');
  const [pinCode, setPinCode] = useState('199633');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const receptionStaff = staffAccounts.find((s) => s.role === 'reception');
  const techStaff = staffAccounts.find((s) => s.role === 'technician');

  // Credentials config for each role
  const roleConfigs: Record<
    AuthRole,
    {
      roleType: 'admin' | 'vendor' | 'reception' | 'technician';
      title: string;
      subtitle: string;
      defaultIdentifier: string;
      identifierLabel: string;
      identifierType: 'email' | 'tel' | 'text';
      defaultPassword: string;
      hasPin: boolean;
      defaultPin?: string;
      defaultView: AppView;
      resetAuthority: string;
      canResetWhom: string;
      badgeColor: string;
    }
  > = {
    super_admin: {
      roleType: 'admin',
      title: 'Portal Website Owner / Super Admin',
      subtitle: 'Master SaaS Owner • Full control over all Labs & Owners',
      defaultIdentifier: 'rkmehra331996@gmail.com',
      identifierLabel: 'Super Admin Email ID',
      identifierType: 'email',
      defaultPassword: 'Asdfzxcv@331996@#',
      hasPin: true,
      defaultPin: '199633',
      defaultView: 'admin_dashboard',
      resetAuthority: 'Master Root (Self / Server Level)',
      canResetWhom: 'Creates & Resets All Lab Owners (Phone + Password + 6-digit PIN)',
      badgeColor: 'bg-rose-500 text-white',
    },
    vendor: {
      roleType: 'vendor',
      title: 'Lab Owner / Diagnostic Center Admin',
      subtitle: 'Diagnostic Center Licensee • Tests, doctors, and team control',
      defaultIdentifier: '9876543210',
      identifierLabel: 'Registered Mobile Number (10 Digits)',
      identifierType: 'tel',
      defaultPassword: 'LabOwner@2026#',
      hasPin: true,
      defaultPin: '123456',
      defaultView: 'vendor_dashboard',
      resetAuthority: 'Only Portal Website Owner / Super Admin can reset Lab Owner',
      canResetWhom: 'Creates & Resets Receptionist & Technician ID/Passwords',
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    reception: {
      roleType: 'reception',
      title: 'Reception & Front Desk',
      subtitle: 'Patient registration, billing slips & due collection',
      defaultIdentifier: receptionStaff?.username || 'reception@apexlab.com',
      identifierLabel: 'Staff Username or Email',
      identifierType: 'text',
      defaultPassword: receptionStaff?.password || 'reception123',
      hasPin: false,
      defaultView: 'reception_dashboard',
      resetAuthority: 'Created & Reset by Lab Owner',
      canResetWhom: 'Front desk operations only (Cannot create/reset users)',
      badgeColor: 'bg-teal-600 text-white',
    },
    technician: {
      roleType: 'technician',
      title: 'Lab Technician Department',
      subtitle: 'Sample testing, analyzer values entry & report dispatch',
      defaultIdentifier: techStaff?.username || 'technician@apexlab.com',
      identifierLabel: 'Technician Staff ID or Email',
      identifierType: 'text',
      defaultPassword: techStaff?.password || 'tech123',
      hasPin: false,
      defaultView: 'technician_dashboard',
      resetAuthority: 'Created & Reset by Lab Owner',
      canResetWhom: 'Diagnostic operations only (Cannot create/reset users)',
      badgeColor: 'bg-purple-600 text-white',
    },
  };

  useEffect(() => {
    if (targetLoginRole) {
      let mapped: AuthRole = 'vendor';
      if (targetLoginRole === 'admin') mapped = 'super_admin';
      else if (targetLoginRole === 'vendor') mapped = 'vendor';
      else if (targetLoginRole === 'reception') mapped = 'reception';
      else if (targetLoginRole === 'technician') mapped = 'technician';

      setSelectedRole(mapped);
      const cfg = roleConfigs[mapped];
      setEmailOrPhone(cfg.defaultIdentifier);
      setPassword(cfg.defaultPassword);
      setPinCode(cfg.defaultPin || '');
    }
  }, [targetLoginRole]);

  if (!isOpen) return null;

  const handleRoleSelect = (role: AuthRole) => {
    setSelectedRole(role);
    setError('');
    const cfg = roleConfigs[role];
    setEmailOrPhone(cfg.defaultIdentifier);
    setPassword(cfg.defaultPassword);
    setPinCode(cfg.defaultPin || '');
  };

  const handle1ClickLogin = (role: AuthRole) => {
    setError('');
    const cfg = roleConfigs[role];
    setEmailOrPhone(cfg.defaultIdentifier);
    setPassword(cfg.defaultPassword);
    setPinCode(cfg.defaultPin || '');

    setSuccessMessage(`Authenticating ${cfg.title}...`);
    setTimeout(() => {
      login(cfg.roleType, cfg.defaultIdentifier, cfg.defaultPassword);
      onClose();
      onNavigateView(cfg.defaultView);
      setSuccessMessage('');
    }, 350);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cfg = roleConfigs[selectedRole];

    if (!emailOrPhone.trim()) {
      setError(`Please enter your ${cfg.identifierLabel}.`);
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    // PIN check for Super Admin and Lab Owner
    if (cfg.hasPin) {
      if (!pinCode.trim() || pinCode.length !== 6 || !/^\d{6}$/.test(pinCode)) {
        setError('6-Digit Security PIN is required (e.g. 199633 or 123456).');
        return;
      }
    }

    setSuccessMessage(`Logging into ${cfg.title}...`);
    setTimeout(() => {
      login(cfg.roleType, emailOrPhone, password);
      onClose();
      onNavigateView(cfg.defaultView);
      setSuccessMessage('');
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#123B6D] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
              <KeyRound className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight leading-none text-white flex items-center gap-2">
                <span>Multi-Tier Laboratory Role Authentication</span>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  RBAC Hierarchy
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Super Admin ➔ Lab Owners (Phone + Pass + 6-digit PIN) ➔ Staff (Reception & Technician)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Session */}
        {currentUser && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2 text-emerald-950 font-semibold">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>
                Active Session: <strong>{currentUser.name}</strong>{' '}
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold">
                  {currentUser.role}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (currentUser.role === 'admin') onNavigateView('admin_dashboard');
                  else if (currentUser.role === 'vendor') onNavigateView('vendor_dashboard');
                  else if (currentUser.role === 'reception') onNavigateView('reception_dashboard');
                  else onNavigateView('technician_dashboard');
                }}
                className="font-bold text-[#123B6D] hover:underline cursor-pointer"
              >
                Go to Workspace →
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setError('');
                  setSuccessMessage('Logged out successfully');
                  setTimeout(() => setSuccessMessage(''), 1500);
                }}
                className="text-rose-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* SECURITY HIERARCHY NOTICE CARD */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#123B6D]" />
              <span>Credentials Creation & Password Reset Permission Rules:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200">
                <div className="font-extrabold text-rose-900 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-rose-700" />
                  <span>1. Portal Super Admin</span>
                </div>
                <div className="text-slate-600 mt-0.5">
                  • <strong>Email + Pass + 6-digit PIN</strong>
                </div>
                <div className="text-rose-700 font-semibold mt-1">
                  ➔ <strong>Can create & reset:</strong> All Lab Owners (Phone, Password & PIN).
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                <div className="font-extrabold text-amber-950 flex items-center gap-1">
                  <Building className="w-3 h-3 text-amber-800" />
                  <span>2. Lab Owner (Vendor)</span>
                </div>
                <div className="text-slate-600 mt-0.5">
                  • <strong>Phone + Pass + 6-digit PIN</strong>
                </div>
                <div className="text-amber-900 font-semibold mt-1">
                  ➔ <strong>Can create & reset:</strong> Receptionist & Technician credentials.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200">
                <div className="font-extrabold text-teal-950 flex items-center gap-1">
                  <FlaskConical className="w-3 h-3 text-teal-800" />
                  <span>3. Staff (Reception / Tech)</span>
                </div>
                <div className="text-slate-600 mt-0.5">
                  • <strong>Staff ID / Username + Pass</strong>
                </div>
                <div className="text-teal-800 font-semibold mt-1">
                  ➔ <strong>Reset rule:</strong> Only their Lab Owner can reset their passwords.
                </div>
              </div>
            </div>
          </div>

          {/* 4 1-CLICK ROLE ACCESS TILES */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant 1-Click Role Login</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Select to autofill & test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Tile 1: Super Admin */}
              <div
                onClick={() => handle1ClickLogin('super_admin')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  selectedRole === 'super_admin'
                    ? 'border-rose-600 bg-rose-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-rose-400 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="p-1 rounded-md bg-rose-100 text-rose-700 font-black text-xs">
                      <Crown className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                      SUPER ADMIN
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-slate-900">Website Owner</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    rkmehra331996@gmail.com
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 mt-1">
                    PIN: <strong className="text-rose-700">199633</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-2 w-full bg-rose-600 hover:bg-rose-700 text-white py-1 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Portal Admin</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Tile 2: Lab Owner */}
              <div
                onClick={() => handle1ClickLogin('vendor')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  selectedRole === 'vendor'
                    ? 'border-amber-600 bg-amber-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-amber-400 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="p-1 rounded-md bg-amber-100 text-amber-800 font-black text-xs">
                      <Building className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[9px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full">
                      LAB OWNER
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-slate-900">Lab Owner (Licensee)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    Phone: 9876543210
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 mt-1">
                    PIN: <strong className="text-amber-800">123456</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-1 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Lab Owner</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Tile 3: Receptionist */}
              <div
                onClick={() => handle1ClickLogin('reception')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  selectedRole === 'reception'
                    ? 'border-teal-600 bg-teal-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-teal-400 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="p-1 rounded-md bg-teal-100 text-teal-800 font-black text-xs">
                      <Receipt className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[9px] font-bold bg-teal-600 text-white px-1.5 py-0.2 rounded-full">
                      RECEPTION
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-slate-900">Receptionist Desk</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    reception@apexlab.com
                  </div>
                  <div className="text-[10px] text-teal-700 mt-1 font-semibold">
                    By Lab Owner
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white py-1 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Reception</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Tile 4: Technician */}
              <div
                onClick={() => handle1ClickLogin('technician')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  selectedRole === 'technician'
                    ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-purple-400 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="p-1 rounded-md bg-purple-100 text-purple-800 font-black text-xs">
                      <FlaskConical className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[9px] font-bold bg-purple-600 text-white px-1.5 py-0.2 rounded-full">
                      TECHNICIAN
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-slate-900">Lab Technician</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    technician@apexlab.com
                  </div>
                  <div className="text-[10px] text-purple-700 mt-1 font-semibold">
                    By Lab Owner
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Technician</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 font-semibold uppercase">
              Or Sign In with Exact Credentials
            </span>
          </div>

          {/* MANUAL LOGIN FORM */}
          <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
            {/* Role Select Tabs */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['super_admin', 'vendor', 'reception', 'technician'] as AuthRole[]).map((r) => {
                  const cfg = roleConfigs[r];
                  const isSel = selectedRole === r;
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                        isSel
                          ? 'border-[#123B6D] bg-blue-50/50 shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-extrabold text-xs text-slate-900 truncate">
                        {r === 'super_admin'
                          ? '👑 Super Admin'
                          : r === 'vendor'
                          ? '🏢 Lab Owner'
                          : r === 'reception'
                          ? '🖥️ Reception'
                          : '🔬 Technician'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {r === 'super_admin' || r === 'vendor' ? 'Phone/Email + PIN' : 'ID + Password'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Role Authority Banner */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 font-medium">Reset Authority: </span>
                <strong className="text-slate-800">{roleConfigs[selectedRole].resetAuthority}</strong>
              </div>
              <div className="text-[#123B6D] font-bold text-[10px]">
                {roleConfigs[selectedRole].canResetWhom}
              </div>
            </div>

            {/* Identifier Field (Email for Super Admin, Phone for Lab Owner, Username for Staff) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  {roleConfigs[selectedRole].identifierLabel} <span className="text-rose-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setEmailOrPhone(roleConfigs[selectedRole].defaultIdentifier)}
                  className="text-[10px] text-[#123B6D] hover:underline font-semibold cursor-pointer"
                >
                  Autofill: {roleConfigs[selectedRole].defaultIdentifier}
                </button>
              </div>

              <div className="relative">
                {selectedRole === 'vendor' ? (
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                )}
                <input
                  type={roleConfigs[selectedRole].identifierType}
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                  placeholder={
                    selectedRole === 'vendor'
                      ? 'e.g. 9876543210'
                      : selectedRole === 'super_admin'
                      ? 'rkmehra331996@gmail.com'
                      : 'staff@apexlab.com'
                  }
                />
              </div>
            </div>

            {/* Password & 6-digit PIN in Grid */}
            <div className={`grid ${roleConfigs[selectedRole].hasPin ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3`}>
              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Password <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword(roleConfigs[selectedRole].defaultPassword)}
                    className="text-[10px] text-[#123B6D] hover:underline font-semibold cursor-pointer"
                  >
                    Autofill Password
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              {/* 6-digit PIN Code (For Super Admin and Lab Owner) */}
              {roleConfigs[selectedRole].hasPin && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <span>Security PIN Code (6 Digits)</span>
                      <span className="text-rose-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPinCode(roleConfigs[selectedRole].defaultPin || '')}
                      className="text-[10px] text-[#123B6D] hover:underline font-semibold cursor-pointer"
                    >
                      Autofill PIN: {roleConfigs[selectedRole].defaultPin}
                    </button>
                  </div>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-mono tracking-widest"
                      placeholder="e.g. 199633"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {selectedRole === 'super_admin'
                      ? 'Master Portal PIN: 199633'
                      : 'Lab Owner 6-digit PIN set by Super Admin'}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#123B6D] hover:bg-[#0e2c52] text-white py-2.5 rounded-xl text-xs font-black transition shadow-xs flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>Sign In to {roleConfigs[selectedRole].title}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
