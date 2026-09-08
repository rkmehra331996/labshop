import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Building,
  Building2,
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
  Stethoscope,
  Network,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { AppView, UserRole } from '../types';
import { ALL_ROLES_CONFIG, LAB_OPTIONS, BRANCH_OPTIONS, getPermissionsForRole } from '../utils/rbac';

interface CmsAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView: (view: AppView) => void;
}

export type AuthRole = 'super_admin' | 'vendor' | 'branch_manager' | 'reception' | 'technician' | 'pathologist';

export const CmsAuthModal: React.FC<CmsAuthModalProps> = ({ isOpen, onClose, onNavigateView }) => {
  const { login, targetLoginRole, currentUser, logout, staffAccounts, vendorLabsList, vendorBranches } = useCms();

  const [selectedRole, setSelectedRole] = useState<AuthRole>('super_admin');
  const [selectedLabId, setSelectedLabId] = useState<string>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

  // Input fields
  const [emailOrPhone, setEmailOrPhone] = useState('rkmehra331996@gmail.com');
  const [password, setPassword] = useState('Asdfzxcv@331996@#');
  const [pinCode, setPinCode] = useState('199633');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const receptionStaff = staffAccounts.find((s) => s.role === 'reception');
  const techStaff = staffAccounts.find((s) => s.role === 'technician');
  const managerStaff = staffAccounts.find((s) => s.role === 'branch_manager');
  const pathoStaff = staffAccounts.find((s) => s.role === 'pathologist');

  // Role configs
  const roleConfigs: Record<
    AuthRole,
    {
      roleType: 'admin' | 'vendor' | 'branch_manager' | 'reception' | 'technician' | 'pathologist';
      title: string;
      subtitle: string;
      defaultIdentifier: string;
      identifierLabel: string;
      identifierType: 'email' | 'tel' | 'text';
      defaultPassword: string;
      hasPin: boolean;
      defaultPin?: string;
      defaultLabId: string;
      defaultBranchId: string;
      defaultView: AppView;
      badgeColor: string;
      icon: React.ReactNode;
      allowedSummary: string[];
    }
  > = {
    super_admin: {
      roleType: 'admin',
      title: 'Portal Super Admin',
      subtitle: 'Global SaaS Master • Multi-lab directory, licenses & platform telemetry',
      defaultIdentifier: 'rkmehra331996@gmail.com',
      identifierLabel: 'Super Admin Email ID',
      identifierType: 'email',
      defaultPassword: 'Asdfzxcv@331996@#',
      hasPin: true,
      defaultPin: '199633',
      defaultLabId: 'all',
      defaultBranchId: 'all',
      defaultView: 'admin_dashboard',
      badgeColor: 'bg-rose-600 text-white',
      icon: <Crown className="w-4 h-4 text-rose-600" />,
      allowedSummary: ['All Labs Directory', 'SaaS Licensing', 'Audit Logs', 'Admin CMS'],
    },
    vendor: {
      roleType: 'vendor',
      title: 'Lab Admin / Owner',
      subtitle: 'Central Lab Licensee • Multi-branch control, test master, financial & team management',
      defaultIdentifier: '9876543210',
      identifierLabel: 'Registered Mobile Number (10 Digits)',
      identifierType: 'tel',
      defaultPassword: 'LabOwner@2026#',
      hasPin: true,
      defaultPin: '123456',
      defaultLabId: 'lab-apex',
      defaultBranchId: 'all',
      defaultView: 'vendor_dashboard',
      badgeColor: 'bg-amber-500 text-slate-950',
      icon: <Building className="w-4 h-4 text-amber-700" />,
      allowedSummary: ['Multi-Branch HQ', 'Test Master & Pricing', 'Staff Credentials', 'Revenue & P&L'],
    },
    branch_manager: {
      roleType: 'branch_manager',
      title: 'Branch Manager',
      subtitle: 'Branch Operations Supervisor • Cash settlement, sample transit & local patient queue',
      defaultIdentifier: managerStaff?.username || 'manager.modeltown@apexlab.com',
      identifierLabel: 'Manager Username or Email',
      identifierType: 'text',
      defaultPassword: managerStaff?.password || 'manager123',
      hasPin: false,
      defaultLabId: 'lab-apex',
      defaultBranchId: 'branch-2',
      defaultView: 'branch_manager_dashboard',
      badgeColor: 'bg-blue-600 text-white',
      icon: <Building2 className="w-4 h-4 text-blue-600" />,
      allowedSummary: ['Branch Cash Reconcile', 'Branch Patient Queue', 'Cold-chain Sample Transit', 'Staff Roster'],
    },
    reception: {
      roleType: 'reception',
      title: 'Receptionist / Front Desk',
      subtitle: 'Patient Registration • Token slips, barcode printing, due payment & fast intake',
      defaultIdentifier: receptionStaff?.username || 'reception@apexlab.com',
      identifierLabel: 'Receptionist Staff ID / Email',
      identifierType: 'text',
      defaultPassword: receptionStaff?.password || 'reception123',
      hasPin: false,
      defaultLabId: 'lab-apex',
      defaultBranchId: 'branch-1',
      defaultView: 'reception_dashboard',
      badgeColor: 'bg-teal-600 text-white',
      icon: <Receipt className="w-4 h-4 text-teal-600" />,
      allowedSummary: ['Patient Registration', 'Token Printing', 'Due Payment Collection', 'Fast Queue Entry'],
    },
    technician: {
      roleType: 'technician',
      title: 'Lab Technician',
      subtitle: 'Diagnostic Bench Workstation • Analyzer values entry, specimen logging & pre-check',
      defaultIdentifier: techStaff?.username || 'technician@apexlab.com',
      identifierLabel: 'Technician Staff ID / Email',
      identifierType: 'text',
      defaultPassword: techStaff?.password || 'tech123',
      hasPin: false,
      defaultLabId: 'lab-apex',
      defaultBranchId: 'branch-1',
      defaultView: 'technician_dashboard',
      badgeColor: 'bg-purple-600 text-white',
      icon: <FlaskConical className="w-4 h-4 text-purple-600" />,
      allowedSummary: ['Workstation Queue', 'Analyzer Data Entry', 'Specimen Verification', 'QC Parameters'],
    },
    pathologist: {
      roleType: 'pathologist',
      title: 'Consultant Pathologist (MD)',
      subtitle: 'Medical Sign-off Desk • Critical panic alerts, differential diagnosis & digital NABL signature',
      defaultIdentifier: pathoStaff?.username || 'pathologist@apexlab.com',
      identifierLabel: 'Doctor Email / Signatory ID',
      identifierType: 'text',
      defaultPassword: pathoStaff?.password || 'patho123',
      hasPin: false,
      defaultLabId: 'lab-apex',
      defaultBranchId: 'all',
      defaultView: 'pathologist_dashboard',
      badgeColor: 'bg-emerald-600 text-white',
      icon: <Stethoscope className="w-4 h-4 text-emerald-600" />,
      allowedSummary: ['Clinical Sign-off', 'Critical Value Alerts', 'NABL Digital Signature', 'Abnormal Panic Flags'],
    },
  };

  useEffect(() => {
    if (targetLoginRole) {
      let mapped: AuthRole = 'vendor';
      if (targetLoginRole === 'admin') mapped = 'super_admin';
      else if (targetLoginRole === 'vendor') mapped = 'vendor';
      else if (targetLoginRole === 'branch_manager') mapped = 'branch_manager';
      else if (targetLoginRole === 'reception') mapped = 'reception';
      else if (targetLoginRole === 'technician') mapped = 'technician';
      else if (targetLoginRole === 'pathologist') mapped = 'pathologist';

      setSelectedRole(mapped);
      const cfg = roleConfigs[mapped];
      setEmailOrPhone(cfg.defaultIdentifier);
      setPassword(cfg.defaultPassword);
      setPinCode(cfg.defaultPin || '');
      setSelectedLabId(cfg.defaultLabId);
      setSelectedBranchId(cfg.defaultBranchId);
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
    setSelectedLabId(cfg.defaultLabId);
    setSelectedBranchId(cfg.defaultBranchId);
  };

  const handle1ClickLogin = (role: AuthRole) => {
    setError('');
    const cfg = roleConfigs[role];
    setEmailOrPhone(cfg.defaultIdentifier);
    setPassword(cfg.defaultPassword);
    setPinCode(cfg.defaultPin || '');
    setSelectedLabId(cfg.defaultLabId);
    setSelectedBranchId(cfg.defaultBranchId);

    setSuccessMessage(`Authenticating ${cfg.title} with Role + Lab + Branch context...`);
    setTimeout(() => {
      const result = login(
        cfg.roleType,
        cfg.defaultIdentifier,
        cfg.defaultPassword,
        cfg.defaultLabId,
        cfg.defaultBranchId
      );
      onClose();
      onNavigateView(result.targetView || cfg.defaultView);
      setSuccessMessage('');
    }, 300);
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

    setSuccessMessage(`Authorizing ${cfg.title} (Role + Lab + Branch)...`);
    setTimeout(() => {
      const result = login(
        cfg.roleType,
        emailOrPhone,
        password,
        selectedLabId,
        selectedBranchId
      );
      onClose();
      onNavigateView(result.targetView || cfg.defaultView);
      setSuccessMessage('');
    }, 300);
  };

  // Lab options for select
  const labSelectOptions = [
    { id: 'all', name: '🌐 All Registered Labs (Super Admin Scope)' },
    ...(vendorLabsList && vendorLabsList.length > 0
      ? vendorLabsList.map((l) => ({ id: l.id, name: `${l.name} (${l.id})` }))
      : LAB_OPTIONS.map((l) => ({ id: l.id, name: `${l.name} (${l.id})` }))),
  ];

  // Branch options for select
  const branchSelectOptions = [
    { id: 'all', name: '🏢 All Branches / Central Hub' },
    ...(vendorBranches && vendorBranches.length > 0
      ? vendorBranches.map((b) => ({ id: b.id, name: `${b.name} (${b.badge || 'Branch'})` }))
      : BRANCH_OPTIONS.map((b) => ({ id: b.id, name: `${b.name} (${b.badge || 'Branch'})` }))),
  ];

  const currentRoleCfg = roleConfigs[selectedRole];
  const userPermissions = getPermissionsForRole(currentRoleCfg.roleType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-[#123B6D] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
              <KeyRound className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight leading-none text-white flex items-center gap-2">
                <span>Role-Based Authentication & Context Gate</span>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  Role + Lab + Branch
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Super Admin • Lab Admin • Branch Manager • Receptionist • Technician • Pathologist
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

        {/* Current Active Session Bar */}
        {currentUser && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2 text-emerald-950 font-semibold">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>
                Active Session: <strong>{currentUser.name}</strong>{' '}
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold">
                  {currentUser.role}
                </span>{' '}
                <span className="text-emerald-700 text-[11px]">
                  ({currentUser.labName || 'Apex Lab'} • {currentUser.branchName || 'Central'})
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const target = ALL_ROLES_CONFIG[currentUser.role]?.defaultView || 'vendor_dashboard';
                  onNavigateView(target);
                }}
                className="font-bold text-[#123B6D] hover:underline cursor-pointer"
              >
                Go to Active Workspace →
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
          {/* 6 1-CLICK ROLE ACCESS TILES */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant 1-Click Role Login (Role + Lab + Branch Context)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Click tile to login immediately</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {(Object.keys(roleConfigs) as AuthRole[]).map((roleKey) => {
                const cfg = roleConfigs[roleKey];
                const isSelected = selectedRole === roleKey;
                return (
                  <div
                    key={roleKey}
                    onClick={() => handleRoleSelect(roleKey)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#123B6D] bg-blue-50/40 shadow-xs ring-1 ring-[#123B6D]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="p-1 rounded-md bg-slate-100">{cfg.icon}</span>
                          <span className="font-extrabold text-xs text-slate-900">{cfg.title}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badgeColor}`}>
                          {roleKey.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-600 line-clamp-1 mb-1 font-medium">
                        {cfg.subtitle}
                      </div>

                      <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100 text-[10px] space-y-0.5 font-mono text-slate-600">
                        <div className="truncate">
                          ID: <strong className="text-slate-900">{cfg.defaultIdentifier}</strong>
                        </div>
                        <div className="truncate text-slate-500">
                          Scope: {cfg.defaultLabId === 'all' ? 'All Labs' : 'Apex Lab'} •{' '}
                          {cfg.defaultBranchId === 'all' ? 'All Branches' : cfg.defaultBranchId}
                        </div>
                      </div>

                      {/* Allowed modules tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cfg.allowedSummary.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium"
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handle1ClickLogin(roleKey);
                      }}
                      className="mt-2.5 w-full bg-[#123B6D] hover:bg-[#0e2c52] text-white py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>1-Click Launch Dashboard</span>
                      <ArrowRight className="w-3 h-3 text-amber-300" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-500 font-semibold uppercase">
              Or Customize Role, Lab ID & Branch ID Credentials
            </span>
          </div>

          {/* CUSTOM CREDENTIALS & CONTEXT FORM */}
          <form onSubmit={handleManualSubmit} className="space-y-4 text-xs bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            {/* Context Inputs: Lab ID & Branch ID Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Lab ID */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-[#123B6D]" />
                    <span>Lab ID / Diagnostic Center</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Determines Lab tenant</span>
                </label>
                <select
                  value={selectedLabId}
                  onChange={(e) => setSelectedLabId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                >
                  {labSelectOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch ID */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Network className="w-3.5 h-3.5 text-[#123B6D]" />
                    <span>Branch ID / Collection Desk</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Limits sample & patient data</span>
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                >
                  {branchSelectOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Role Authority & Permission Scope Display */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Current Role: {currentRoleCfg.title}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${currentRoleCfg.badgeColor}`}>
                    {selectedRole.toUpperCase()}
                  </span>
                </div>
                <div className="text-slate-500 font-medium text-[10px]">
                  Opens Dashboard: <strong>{currentRoleCfg.defaultView}</strong>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-semibold text-[10px]">Data Access:</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  selectedBranchId === 'all'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedBranchId === 'all' ? 'All Branches (Unrestricted)' : `Restricted to Branch: ${selectedBranchId}`}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Reports: {userPermissions.canSignAndApproveReports ? 'Can Medically Sign' : userPermissions.canEnterLabResults ? 'Can Enter Values' : 'View / Print Only'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                  Cash Desk: {userPermissions.canReconcileCash ? 'Can Settle Branch Cash' : userPermissions.canCollectBilling ? 'Can Collect Due Payments' : 'No Cash Access'}
                </span>
              </div>
            </div>

            {/* Identifier Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  {currentRoleCfg.identifierLabel} <span className="text-rose-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setEmailOrPhone(currentRoleCfg.defaultIdentifier)}
                  className="text-[10px] text-[#123B6D] hover:underline font-semibold cursor-pointer"
                >
                  Autofill: {currentRoleCfg.defaultIdentifier}
                </button>
              </div>

              <div className="relative">
                {selectedRole === 'vendor' ? (
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                )}
                <input
                  type={currentRoleCfg.identifierType}
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                  placeholder={currentRoleCfg.defaultIdentifier}
                />
              </div>
            </div>

            {/* Password & Security PIN in Grid */}
            <div className={`grid ${currentRoleCfg.hasPin ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3`}>
              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Password <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword(currentRoleCfg.defaultPassword)}
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              {/* 6-digit PIN Code (For Super Admin and Lab Owner) */}
              {currentRoleCfg.hasPin && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <span>Security PIN Code (6 Digits)</span>
                      <span className="text-rose-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPinCode(currentRoleCfg.defaultPin || '')}
                      className="text-[10px] text-[#123B6D] hover:underline font-semibold cursor-pointer"
                    >
                      Autofill PIN: {currentRoleCfg.defaultPin}
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
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-mono tracking-widest"
                      placeholder="e.g. 199633"
                    />
                  </div>
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
              <span>Authenticate Role + Lab ID + Branch ID</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
