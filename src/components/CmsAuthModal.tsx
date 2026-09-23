import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  Building2,
  FlaskConical,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  UserCheck,
  Receipt,
  LogOut,
  Phone,
  Hash,
  Crown,
  AlertCircle,
  Network,
  Check,
  Sparkles,
  MapPin,
  ShieldCheck,
  User,
  ChevronRight,
  Info,
  Zap,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { AppView, UserRole } from '../types';
import { ALL_ROLES_CONFIG, LAB_OPTIONS, BRANCH_OPTIONS, getPermissionsForRole } from '../utils/rbac';

interface CmsAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView: (view: AppView) => void;
  isVendorContext?: boolean;
}

export type AuthRole = 'super_admin' | 'vendor' | 'reception' | 'technician';

export const CmsAuthModal: React.FC<CmsAuthModalProps> = ({
  isOpen,
  onClose,
  onNavigateView,
  isVendorContext = false,
}) => {
  const {
    login,
    targetLoginRole,
    currentUser,
    logout,
    vendorLabsList,
    vendorLabSettings,
    selectedVendorLabId,
    vendorBranches,
    authModalTab,
    setAuthModalTab,
    registerNewLab,
  } = useCms();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form States (NO auto-fill, user enters manually)
  const [selectedRole, setSelectedRole] = useState<AuthRole>(isVendorContext ? 'vendor' : 'super_admin');
  const [selectedLabId, setSelectedLabId] = useState<string>(() => selectedVendorLabId || 'lab-apex');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('branch-1');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register / Create Lab Form States
  const [labName, setLabName] = useState('');
  const [labCategory, setLabCategory] = useState('Clinical Pathology & Biochemistry');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Punjab');
  const [address, setAddress] = useState('');
  const [nablCode, setNablCode] = useState('');
  const [tagline, setTagline] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState<'Starter' | 'Professional' | 'Enterprise'>('Professional');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Sync tab with context when modal opens or target role changes
  useEffect(() => {
    if (isVendorContext) {
      setActiveTab('login');
    } else if (authModalTab) {
      setActiveTab(authModalTab);
    }
  }, [authModalTab, isOpen, isVendorContext]);

  useEffect(() => {
    if (isVendorContext) {
      let mapped: AuthRole = 'vendor';
      if (targetLoginRole === 'reception') mapped = 'reception';
      else if (targetLoginRole === 'technician') mapped = 'technician';
      else mapped = 'vendor';

      setSelectedRole(mapped);
      setLoginError('');
      const defaultLab = selectedVendorLabId || (vendorLabsList && vendorLabsList.length > 0 ? vendorLabsList[0].id : 'lab-apex');
      setSelectedLabId(defaultLab);
      setSelectedBranchId('branch-1');
    } else if (targetLoginRole) {
      let mapped: AuthRole = 'vendor';
      if (targetLoginRole === 'admin') mapped = 'super_admin';
      else if (targetLoginRole === 'vendor') mapped = 'vendor';
      else if (targetLoginRole === 'reception') mapped = 'reception';
      else if (targetLoginRole === 'technician') mapped = 'technician';

      setSelectedRole(mapped);
      setLoginError('');
      if (mapped === 'super_admin') {
        setSelectedLabId('all');
        setSelectedBranchId('branch-1');
      } else {
        const defaultLab = selectedVendorLabId || (vendorLabsList && vendorLabsList.length > 0 ? vendorLabsList[0].id : 'lab-apex');
        setSelectedLabId(defaultLab);
        setSelectedBranchId('branch-1');
      }
    }
  }, [targetLoginRole, isVendorContext, isOpen]);

  if (!isOpen) return null;

  // Role metadata configurations (without auto-fill demo credentials)
  const roleConfigs: Record<
    AuthRole,
    {
      roleType: 'admin' | 'vendor' | 'reception' | 'technician';
      title: string;
      subtitle: string;
      identifierLabel: string;
      identifierPlaceholder: string;
      identifierType: 'email' | 'tel' | 'text';
      hasPin: boolean;
      defaultView: AppView;
      badgeColor: string;
      icon: React.ReactNode;
      allowedSummary: string[];
    }
  > = {
    super_admin: {
      roleType: 'admin',
      title: 'Portal Super Admin',
      subtitle: 'Global SaaS Master • Multi-lab directory, licensing & platform control',
      identifierLabel: 'Super Admin Email Address',
      identifierPlaceholder: 'Enter master email ID',
      identifierType: 'email',
      hasPin: true,
      defaultView: 'admin_dashboard',
      badgeColor: 'bg-rose-600 text-white',
      icon: <Crown className="w-4 h-4 text-rose-600" />,
      allowedSummary: ['Multi-Lab Directory', 'SaaS Licensing & Billing', 'Platform CMS', 'System Audit Logs'],
    },
    vendor: {
      roleType: 'vendor',
      title: 'Lab Admin / Owner',
      subtitle: 'Central Laboratory Owner • Test master, pricing, team credentials & finances',
      identifierLabel: 'Registered Mobile Number or Email',
      identifierPlaceholder: '10-digit mobile number or lab owner email',
      identifierType: 'text',
      hasPin: true,
      defaultView: 'vendor_dashboard',
      badgeColor: 'bg-amber-500 text-slate-950',
      icon: <Building className="w-4 h-4 text-amber-700" />,
      allowedSummary: ['Single-Center Lab Control', 'Test Master & Pricing', 'Staff Credentials', 'P&L & Accounting'],
    },
    reception: {
      roleType: 'reception',
      title: 'Reception & Billing',
      subtitle: 'Front Desk Counter • Patient registration, UHID, receipt slips & due collections',
      identifierLabel: 'Receptionist Staff ID / Username / Mobile',
      identifierPlaceholder: 'e.g. reception.apex or staff mobile',
      identifierType: 'text',
      hasPin: false,
      defaultView: 'reception_dashboard',
      badgeColor: 'bg-teal-600 text-white',
      icon: <Receipt className="w-4 h-4 text-teal-600" />,
      allowedSummary: ['Patient UHID Registration', 'Thermal Print Receipt Slips', 'Due Payment Desk', 'Token Queue'],
    },
    technician: {
      roleType: 'technician',
      title: 'Lab Technician',
      subtitle: 'Diagnostic Workstation • Analyzer entry, specimen validation & normal ranges',
      identifierLabel: 'Technician Staff ID / Username / Mobile',
      identifierPlaceholder: 'e.g. tech.apex or staff mobile',
      identifierType: 'text',
      hasPin: false,
      defaultView: 'technician_dashboard',
      badgeColor: 'bg-purple-600 text-white',
      icon: <FlaskConical className="w-4 h-4 text-purple-600" />,
      allowedSummary: ['Sample Processing Queue', 'Analyzer Value Entry', 'Specimen Verification', 'QC Flags'],
    },
  };

  const handleRoleChange = (role: AuthRole) => {
    if (isVendorContext && role === 'super_admin') return;
    setSelectedRole(role);
    setLoginError('');
    if (role === 'super_admin') {
      setSelectedLabId('all');
      setSelectedBranchId('all');
    }
  };

  // Roles to display in selection grid (Super Admin excluded in vendor context)
  const rolesToDisplay: AuthRole[] = isVendorContext
    ? ['vendor', 'reception', 'technician']
    : (Object.keys(roleConfigs) as AuthRole[]);

  const currentRoleCfg = roleConfigs[selectedRole];
  const userPermissions = getPermissionsForRole(currentRoleCfg.roleType);

  // Handle Manual Login Submit
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (isVendorContext && selectedRole === 'super_admin') {
      setLoginError('Super Admin login is restricted to the SaaS central platform.');
      return;
    }

    if (!emailOrPhone.trim()) {
      setLoginError(`Please enter your ${currentRoleCfg.identifierLabel}.`);
      return;
    }
    if (!password.trim()) {
      setLoginError('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = login(
        currentRoleCfg.roleType,
        emailOrPhone.trim(),
        password.trim(),
        selectedLabId,
        selectedBranchId,
        pinCode.trim()
      );

      setIsSubmitting(false);

      if (result.success) {
        onClose();
        onNavigateView(result.targetView || currentRoleCfg.defaultView);
      } else {
        setLoginError(result.error || 'Authentication failed. Please verify your credentials and role.');
      }
    }, 150);
  };

  // 1-Click Quick Direct Login Helper
  const handleDirectQuickLogin = (role: 'admin' | 'vendor' | 'reception' | 'technician', labId?: string) => {
    setIsSubmitting(true);
    setLoginError('');
    const targetLab = labId || selectedLabId || 'lab-apex';
    const res = login(role, '', '', targetLab);
    setIsSubmitting(false);
    if (res.success) {
      onClose();
      onNavigateView(res.targetView);
    } else {
      setLoginError(res.error || 'Login failed');
    }
  };

  // Handle Register / Create Lab Submit
  const handleRegisterLab = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!labName.trim()) {
      setRegisterError('Please provide the Laboratory Name.');
      return;
    }
    if (!ownerName.trim()) {
      setRegisterError('Please provide the Owner or Lab Director full name.');
      return;
    }
    const cleanPhone = ownerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setRegisterError('Please enter a valid 10-digit mobile number for the Lab Owner.');
      return;
    }
    if (!ownerEmail.trim() || !ownerEmail.includes('@')) {
      setRegisterError('Please enter a valid business email address.');
      return;
    }
    if (!city.trim()) {
      setRegisterError('Please specify the city where the laboratory is located.');
      return;
    }
    if (!address.trim()) {
      setRegisterError('Please provide the complete street or building address.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setRegisterError('Master Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setRegisterError('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setRegisterError('Please provide a 6-digit numeric Security PIN (for owner actions).');
      return;
    }

    setIsSubmitting(true);
    setRegisterSuccess('Setting up your laboratory workstation and generating staff accounts...');

    setTimeout(() => {
      const { lab } = registerNewLab({
        labName: labName.trim(),
        ownerName: ownerName.trim(),
        phone: cleanPhone,
        email: ownerEmail.trim(),
        city: city.trim(),
        state: stateName.trim(),
        address: address.trim(),
        tagline: tagline.trim() || `${labCategory} & Diagnostic Services`,
        nablCode: nablCode.trim() || undefined,
        password: newPassword,
        pin: newPin,
        category: labCategory,
        subscriptionPlan,
      });

      setIsSubmitting(false);
      setRegisterSuccess(`Laboratory "${lab.name}" created in DRAFT mode! Your website is pending Admin Approval before going live. Opening your dashboard...`);

      setTimeout(() => {
        onClose();
        onNavigateView('vendor_dashboard');
      }, 700);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="bg-[#123B6D] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shrink-0">
              {isVendorContext || activeTab === 'login' ? <KeyRound className="w-5 h-5 text-slate-950" /> : <Building2 className="w-5 h-5 text-slate-950" />}
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight leading-none text-white flex items-center gap-2">
                <span>
                  {isVendorContext
                    ? 'Laboratory Staff & Management Login'
                    : activeTab === 'login'
                    ? 'Pathology Portal Authentication'
                    : 'Create & Register New Laboratory'}
                </span>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  {isVendorContext ? 'Lab Workstation' : activeTab === 'login' ? 'Role Access' : 'New Lab Onboarding'}
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {isVendorContext
                  ? 'Manual credential verification for Lab Owner, Reception Desk & Testing Technicians'
                  : activeTab === 'login'
                  ? 'Manual credential verification for Super Admin, Lab Owners, Receptionists & Technicians'
                  : 'Instant multi-branch setup, test catalog initialization & staff credential provisioning'}
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

        {/* Tab Selector: Login vs Register (Hidden on vendor website) */}
        {!isVendorContext && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2.5 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setAuthModalTab('login');
              }}
              className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === 'login'
                  ? 'border-[#123B6D] text-[#123B6D]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Staff & Admin Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setAuthModalTab('register');
              }}
              className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === 'register'
                  ? 'border-[#123B6D] text-[#123B6D]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Create / Register New Lab</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                Free Setup
              </span>
            </button>
          </div>
        )}

        {/* Current Active Session Bar */}
        {currentUser && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2 text-emerald-950 font-semibold">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>
                Logged in as: <strong>{currentUser.name}</strong>{' '}
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold">
                  {currentUser.role}
                </span>{' '}
                <span className="text-emerald-700 text-[11px]">
                  ({currentUser.labName || 'Apex Lab'} • {currentUser.branchName || 'Central Hub'})
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
                className="font-bold text-[#123B6D] hover:underline cursor-pointer text-xs"
              >
                Go to Workspace →
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setLoginError('');
                }}
                className="text-rose-700 font-bold hover:underline flex items-center gap-1 cursor-pointer text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* ================= TAB 1: LOGIN ================= */}
          {activeTab === 'login' && (
            <div className="space-y-5">
              {/* 1-Click Quick Access Bar */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 rounded-xl border-2 border-blue-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#123B6D]">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Instant 1-Click Role Login (तुरंत लॉगिन करें)</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#123B6D] text-white px-2 py-0.5 rounded-full">
                    Direct Access
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Click any role below to instantly log in with dedicated data isolation:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {!isVendorContext && (
                    <button
                      type="button"
                      onClick={() => handleDirectQuickLogin('admin')}
                      className="p-2 rounded-lg bg-white border border-rose-200 hover:border-rose-400 hover:shadow-xs transition text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs mb-0.5">
                        <Crown className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Super Admin</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate group-hover:text-rose-600">
                        R. K. Mehra (Portal)
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDirectQuickLogin('vendor', selectedLabId || 'lab-apex')}
                    className="p-2 rounded-lg bg-white border border-amber-200 hover:border-amber-400 hover:shadow-xs transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-0.5">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Lab Owner</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate group-hover:text-amber-700">
                      Dr. Rajesh (Owner)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectQuickLogin('reception', selectedLabId || 'lab-apex')}
                    className="p-2 rounded-lg bg-white border border-teal-200 hover:border-teal-400 hover:shadow-xs transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-teal-700 font-bold text-xs mb-0.5">
                      <Receipt className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Reception Desk</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate group-hover:text-teal-600">
                      Pooja Verma (Billing)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectQuickLogin('technician', selectedLabId || 'lab-apex')}
                    className="p-2 rounded-lg bg-white border border-purple-200 hover:border-purple-400 hover:shadow-xs transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs mb-0.5">
                      <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Lab Technician</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate group-hover:text-purple-600">
                      Amit Khurana (DMLT)
                    </span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Or Log In with Specific Role Credentials
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Role Selection Segmented Grid */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                  Select Login Role to Authenticate
                </label>
                <div className={`grid gap-2.5 ${isVendorContext ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                  {rolesToDisplay.map((roleKey) => {
                    const cfg = roleConfigs[roleKey];
                    const isSelected = selectedRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => handleRoleChange(roleKey)}
                        className={`p-2.5 rounded-xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-[#123B6D] bg-blue-50/60 shadow-xs ring-1 ring-[#123B6D]/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="p-1 rounded-md bg-slate-100">{cfg.icon}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#123B6D]" />}
                        </div>
                        <span className="font-bold text-xs text-slate-900 leading-tight block">{cfg.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Role Scope & Authority Summary */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{currentRoleCfg.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentRoleCfg.badgeColor}`}>
                      {selectedRole.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Workspace: <strong>{currentRoleCfg.defaultView}</strong>
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{currentRoleCfg.subtitle}</p>
                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-200">
                  {currentRoleCfg.allowedSummary.map((item, idx) => (
                    <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Manual Login Form */}
              <form onSubmit={handleManualLogin} className="space-y-4">
                {/* Diagnostic Center Context */}
                {selectedRole !== 'super_admin' && (
                  isVendorContext ? (
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-[#123B6D] flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-tight">
                          Dedicated Laboratory Workspace (Locked)
                        </span>
                        <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                          {vendorLabsList.find((l) => l.id === selectedLabId)?.name || vendorLabSettings?.labName || 'Apex Diagnostic & Clinical Pathology Laboratory'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Select Laboratory / Diagnostic Center <span className="text-rose-600">*</span></span>
                        <span className="text-[10px] text-slate-400 font-normal">Multi-Tenant Scoped</span>
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={selectedLabId}
                          onChange={(e) => {
                            setSelectedLabId(e.target.value);
                            setLoginError('');
                          }}
                          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none appearance-none cursor-pointer hover:border-slate-400 transition shadow-xs"
                        >
                          {vendorLabsList.map((lab) => (
                            <option key={lab.id} value={lab.id}>
                              {lab.name} — {lab.city} ({lab.id})
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                  )
                )}

                {/* Identifier Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {currentRoleCfg.identifierLabel} <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    {currentRoleCfg.identifierType === 'tel' ? (
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    ) : (
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type={currentRoleCfg.identifierType}
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder={currentRoleCfg.identifierPlaceholder}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password & PIN in Grid */}
                <div className={`grid ${currentRoleCfg.hasPin ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Password <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* 6-Digit PIN (Super Admin & Lab Owner) */}
                  {currentRoleCfg.hasPin && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-[#123B6D]" />
                        <span>6-Digit Security PIN</span>
                        <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        required
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit numeric PIN"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-mono tracking-widest placeholder:text-slate-400"
                      />
                    </div>
                  )}
                </div>

                {/* Authorized Credentials Helper / Quick Fill Box */}
                {(() => {
                  let demoId = '';
                  let demoPass = '';
                  let demoPin = '';
                  let demoName = '';

                  if (selectedRole === 'super_admin') {
                    demoId = 'rkmehra331996@gmail.com';
                    demoPass = 'admin123';
                    demoPin = '199633';
                    demoName = 'R. K. Mehra (Global Portal Super Admin)';
                  } else if (selectedRole === 'vendor') {
                    if (selectedLabId === 'lab-citycare') {
                      demoId = '9815012345';
                      demoPass = 'owner123';
                      demoPin = '123456';
                      demoName = 'Dr. S. K. Narang (CityCare Owner)';
                    } else if (selectedLabId === 'lab-metropath') {
                      demoId = '9417098765';
                      demoPass = 'owner123';
                      demoPin = '123456';
                      demoName = 'Dr. Arunava Ghosh (MetroPath Owner)';
                    } else {
                      demoId = '9876543210';
                      demoPass = 'owner123';
                      demoPin = '123456';
                      demoName = 'Dr. Rajesh Sharma (Apex Owner)';
                    }
                  } else if (selectedRole === 'reception') {
                    if (selectedLabId === 'lab-citycare') {
                      demoId = 'reception.citycare';
                      demoPass = 'reception123';
                      demoName = 'Jasleen Kaur (CityCare Billing Desk)';
                    } else if (selectedLabId === 'lab-metropath') {
                      demoId = 'reception.metro';
                      demoPass = 'reception123';
                      demoName = 'Divya Mehra (MetroPath Billing Desk)';
                    } else {
                      demoId = 'reception.apex';
                      demoPass = 'reception123';
                      demoName = 'Pooja Verma (Apex Billing Desk)';
                    }
                  } else if (selectedRole === 'technician') {
                    if (selectedLabId === 'lab-citycare') {
                      demoId = 'tech.citycare';
                      demoPass = 'tech123';
                      demoName = 'Satnam Singh (CityCare Testing Desk)';
                    } else if (selectedLabId === 'lab-metropath') {
                      demoId = 'tech.metro';
                      demoPass = 'tech123';
                      demoName = 'Nikhil Bhatt (MetroPath Testing Desk)';
                    } else {
                      demoId = 'tech.apex';
                      demoPass = 'tech123';
                      demoName = 'Amit Khurana (Apex Testing Desk)';
                    }
                  }

                  const handleAutoFill = () => {
                    setEmailOrPhone(demoId);
                    setPassword(demoPass);
                    if (demoPin) setPinCode(demoPin);
                    setLoginError('');
                  };

                  return (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span>Authorized Test Account for {currentRoleCfg.title}:</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleAutoFill}
                          className="px-2 py-0.5 bg-[#123B6D] hover:bg-[#0e2c52] text-white rounded-md text-[10px] font-bold cursor-pointer transition shadow-xs"
                        >
                          ⚡ Auto-Fill Credentials
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-3 gap-y-1 font-mono">
                        <span>ID: <strong className="text-slate-900">{demoId}</strong></span>
                        <span>Pass: <strong className="text-slate-900">{demoPass}</strong></span>
                        {demoPin && <span>PIN: <strong className="text-slate-900">{demoPin}</strong></span>}
                      </div>
                      <div className="text-[10px] text-slate-500 italic">
                        Account: {demoName}
                      </div>
                    </div>
                  );
                })()}

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#123B6D] hover:bg-[#0e2c52] disabled:opacity-50 text-white py-3 rounded-xl text-xs font-black transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>

                {/* Footer Switch to Register (Hidden in Vendor Website context) */}
                {!isVendorContext && (
                  <div className="pt-2 text-center text-xs text-slate-600">
                    <span>Want to establish a new diagnostic laboratory? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('register');
                        setAuthModalTab('register');
                      }}
                      className="text-[#123B6D] font-bold hover:underline cursor-pointer"
                    >
                      Register & Create Lab →
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ================= TAB 2: CREATE / REGISTER NEW LAB (Disabled in vendor context) ================= */}
          {!isVendorContext && activeTab === 'register' && (
            <form onSubmit={handleRegisterLab} className="space-y-5">
              {/* Introduction Banner */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-start gap-3">
                <Building2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-amber-950 text-sm">Pathology Laboratory Registration</h4>
                  <p className="text-amber-800 text-xs mt-0.5">
                    Fill out the laboratory and owner details. The platform will automatically provision your Central Hub branch, initial staff credentials for Reception & Lab Technician, and load standard test profiles.
                  </p>
                </div>
              </div>

              {/* 1. Laboratory Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#123B6D]" />
                  <span>1. Laboratory Diagnostic Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Laboratory Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                      placeholder="e.g. LifeCare Diagnostic & Pathology"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Specialization / Lab Category
                    </label>
                    <select
                      value={labCategory}
                      onChange={(e) => setLabCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                    >
                      <option value="Clinical Pathology & Biochemistry">Clinical Pathology & Biochemistry</option>
                      <option value="Molecular Biology & Genetics">Molecular Biology & Genetics</option>
                      <option value="Histopathology & Cytology">Histopathology & Cytology</option>
                      <option value="Imaging, Radiology & Blood Diagnostics">Imaging, Radiology & Blood Diagnostics</option>
                      <option value="Comprehensive Multi-Specialty Diagnostic Center">Comprehensive Multi-Specialty Diagnostic Center</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      City <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Chandigarh / Mohali"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Punjab"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      NABL / ICMR Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={nablCode}
                      onChange={(e) => setNablCode(e.target.value)}
                      placeholder="e.g. MC-4592"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Complete Street Address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. SCO 14, Main Commercial Complex, Sector 62"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tagline / Announcement</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Doorstep Sample Collection & Instant WhatsApp PDF Reports"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* 2. Owner Credentials & Verification */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#123B6D]" />
                  <span>2. Lab Owner / Medical Director Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Owner Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Verma"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Owner Mobile Number (Login ID) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Official Email ID <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="e.g. director@lifecarelab.in"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Master Password & 6-Digit PIN */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#123B6D]" />
                  <span>3. Master Owner Security & PIN Setup</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Master Password <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Confirm Password <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      6-Digit Security PIN <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="6 numeric digits"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none font-mono tracking-widest"
                    />
                  </div>
                </div>
              </div>

              {registerError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{registerError}</span>
                </div>
              )}

              {registerSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{registerSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#123B6D] hover:bg-[#0e2c52] disabled:opacity-50 text-white py-3 rounded-xl text-xs font-black transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>{isSubmitting ? 'Registering Laboratory...' : 'Complete Registration & Create Laboratory'}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-600">
                <span>Already registered your laboratory? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setAuthModalTab('login');
                  }}
                  className="text-[#123B6D] font-bold hover:underline cursor-pointer"
                >
                  Go to Login →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
