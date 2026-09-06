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
  Laptop,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { AppView } from '../types';

interface CmsAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView: (view: AppView) => void;
}

type AuthRole = 'reception' | 'technician' | 'admin';

export const CmsAuthModal: React.FC<CmsAuthModalProps> = ({ isOpen, onClose, onNavigateView }) => {
  const { login, targetLoginRole, currentUser, logout } = useCms();

  const [selectedRole, setSelectedRole] = useState<AuthRole>('reception');
  const [email, setEmail] = useState('reception@apexlab.com');
  const [password, setPassword] = useState('reception123');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Default credentials mapping
  const roleCredentials: Record<AuthRole, { email: string; pass: string; defaultView: AppView; title: string }> = {
    reception: {
      email: 'reception@apexlab.com',
      pass: 'reception123',
      defaultView: 'reception_dashboard',
      title: 'Reception & Front Desk',
    },
    technician: {
      email: 'technician@apexlab.com',
      pass: 'tech123',
      defaultView: 'technician_dashboard',
      title: 'Lab Technician Department',
    },
    admin: {
      email: 'admin@apexlab.com',
      pass: 'admin123',
      defaultView: 'vendor_dashboard',
      title: 'Lab Owner & Central Admin Panel',
    },
  };

  useEffect(() => {
    if (targetLoginRole) {
      const mappedRole: AuthRole =
        targetLoginRole === 'vendor' ? 'admin' : (targetLoginRole as AuthRole);
      setSelectedRole(mappedRole);
      setEmail(roleCredentials[mappedRole].email);
      setPassword(roleCredentials[mappedRole].pass);
    }
  }, [targetLoginRole]);

  if (!isOpen) return null;

  const handleRoleChange = (role: AuthRole) => {
    setSelectedRole(role);
    setError('');
    setEmail(roleCredentials[role].email);
    setPassword(roleCredentials[role].pass);
  };

  const handleAutoFillAndLogin = (role: AuthRole) => {
    setError('');
    const cred = roleCredentials[role];
    setEmail(cred.email);
    setPassword(cred.pass);

    setSuccessMessage(`Logging in as ${cred.title}...`);
    setTimeout(() => {
      login(role, cred.email, cred.pass);
      onClose();
      onNavigateView(cred.defaultView);
      setSuccessMessage('');
    }, 350);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide your email address and password');
      return;
    }

    const cred = roleCredentials[selectedRole];
    setSuccessMessage(`Authenticating ${cred.title}...`);
    setTimeout(() => {
      login(selectedRole, email, password);
      onClose();
      onNavigateView(cred.defaultView);
      setSuccessMessage('');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#123B6D] text-white px-6 py-4.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
              <KeyRound className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight leading-none text-white">
                Laboratory Staff & Management Authentication
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Single sign-on portal for Reception, Technician, and Administrator roles
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

        {/* Current logged-in user banner with Logout */}
        {currentUser && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2 text-emerald-950 font-semibold">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>
                Active Session: <strong>{currentUser.name}</strong>{' '}
                <span className="bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold">
                  {currentUser.role}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (currentUser.role === 'reception') onNavigateView('reception_dashboard');
                  else if (currentUser.role === 'technician') onNavigateView('technician_dashboard');
                  else onNavigateView('vendor_dashboard');
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

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 3 Quick 1-Click Role Login Cards */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>3 Department Panels (Alag-Alag Panels • 1-Click Launch)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Independent workspaces</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Department 1: Reception Desk */}
              <div
                onClick={() => handleAutoFillAndLogin('reception')}
                className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  selectedRole === 'reception'
                    ? 'border-teal-600 bg-teal-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold bg-teal-700 text-white px-2 py-0.5 rounded-full">
                    DEPT 1
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">
                    🖥️ Reception Panel
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Patient registration, token thermal slip, sample handover & billing due collection.
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200/80 font-mono text-[10px] text-slate-600 space-y-0.5">
                    <div>User: <span className="font-bold text-slate-800">reception@apexlab.com</span></div>
                    <div>Pass: <span className="font-bold text-slate-800">reception123</span></div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-3 w-full bg-teal-700 hover:bg-teal-800 text-white py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>Open Reception Panel</span>
                  <ArrowRight className="w-3 h-3 text-teal-200" />
                </button>
              </div>

              {/* Department 2: Lab Technician */}
              <div
                onClick={() => handleAutoFillAndLogin('technician')}
                className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  selectedRole === 'technician'
                    ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-purple-500 bg-slate-50 hover:bg-purple-50/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold bg-purple-700 text-white px-2 py-0.5 rounded-full">
                    DEPT 2
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">
                    🔬 Technician Panel
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Sample testing, enter analyzer test findings, flags, pathologist verify & report print.
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200/80 font-mono text-[10px] text-slate-600 space-y-0.5">
                    <div>User: <span className="font-bold text-slate-800">technician@apexlab.com</span></div>
                    <div>Pass: <span className="font-bold text-slate-800">tech123</span></div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-3 w-full bg-purple-700 hover:bg-purple-800 text-white py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>Open Technician Panel</span>
                  <ArrowRight className="w-3 h-3 text-purple-200" />
                </button>
              </div>

              {/* Department 3: Lab Admin / Owner */}
              <div
                onClick={() => handleAutoFillAndLogin('admin')}
                className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  selectedRole === 'admin'
                    ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                    DEPT 3
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">
                    👑 Lab Owner / Admin Panel
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Central laboratory master control: test prices, doctor commission, revenue & staff oversight.
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200/80 font-mono text-[10px] text-slate-600 space-y-0.5">
                    <div>User: <span className="font-bold text-slate-800">admin@apexlab.com</span></div>
                    <div>Pass: <span className="font-bold text-slate-800">admin123</span></div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>Open Lab Owner Panel</span>
                  <ArrowRight className="w-3 h-3 text-slate-950" />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 font-semibold uppercase">
              Or Sign In with Credentials
            </span>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
            {/* Role Switcher Tabs */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Select Workspace to Sign In
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('reception')}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedRole === 'reception'
                      ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-600/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Reception</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('technician')}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedRole === 'technician'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Technician</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-600/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Administrator</span>
                </button>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">Email Address</label>
                <button
                  type="button"
                  onClick={() => setEmail(roleCredentials[selectedRole].email)}
                  className="text-[10px] text-[#123B6D] hover:underline font-semibold cursor-pointer"
                >
                  Autofill: {roleCredentials[selectedRole].email}
                </button>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  placeholder="staff@apexlab.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setPassword(roleCredentials[selectedRole].pass)}
                  className="text-[10px] text-[#123B6D] hover:underline font-semibold cursor-pointer"
                >
                  Autofill: {roleCredentials[selectedRole].pass}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B6D]/30 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#123B6D] hover:bg-[#0e2c52] text-white py-2.5 rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>Sign In as {roleCredentials[selectedRole].title}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
