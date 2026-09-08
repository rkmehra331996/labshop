import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ban,
  Trash2,
  Edit2,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  IndianRupee,
  Receipt,
  FileCheck,
  ChevronDown,
  X,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { VendorLabDirectoryItem, VendorStatus, AppView } from '../../types';

interface VendorManagementTabProps {
  onNavigateView: (view: AppView) => void;
  showToast: (msg: string) => void;
}

export const VendorManagementTab: React.FC<VendorManagementTabProps> = ({
  onNavigateView,
  showToast,
}) => {
  const {
    vendorLabsList,
    addVendorLab,
    updateVendorLab,
    deleteVendorLab,
    setVendorStatus,
    selectVendorLab,
    superAdminTenantScope,
    setSuperAdminTenantScope,
  } = useCms();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | VendorStatus>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorLabDirectoryItem | null>(null);
  const [deleteConfirmVendor, setDeleteConfirmVendor] = useState<VendorLabDirectoryItem | null>(null);

  // Form state for add / edit
  const initialFormState: Omit<VendorLabDirectoryItem, 'id'> = {
    name: '',
    tagline: 'Precision Diagnostics & Pathology Services',
    ownerName: '',
    phone: '',
    email: '',
    city: '',
    state: 'Punjab',
    address: '',
    nablCode: '',
    badge: 'NABL Certified',
    rating: 4.9,
    activePackages: 12,
    turnaroundTime: '6-8 Hours',
    emergency: true,
    color: '#123B6D',
    status: 'Processing due to payment confirmation',
    subscriptionPlan: 'Professional Lab Plan',
    subscriptionAmount: 1999,
    paymentMode: 'UPI / QR Code',
    paymentReference: '',
    paymentNotes: '',
    joinedDate: new Date().toISOString().split('T')[0],
    domainPreview: '',
    establishedYear: 2018,
    reviewsCount: 140,
    features: ['WhatsApp Reports', 'Home Collection', 'NABL Format', 'Thermal Barcode'],
  };

  const [formState, setFormState] = useState<Omit<VendorLabDirectoryItem, 'id'>>(initialFormState);

  // Stats calculation
  const stats = useMemo(() => {
    const total = vendorLabsList.length;
    const active = vendorLabsList.filter((v) => v.status === 'Active').length;
    const pending = vendorLabsList.filter((v) => v.status === 'Pending').length;
    const processingPayment = vendorLabsList.filter(
      (v) => v.status === 'Processing due to payment confirmation'
    ).length;
    const suspended = vendorLabsList.filter((v) => v.status === 'Suspended').length;
    return { total, active, pending, processingPayment, suspended };
  }, [vendorLabsList]);

  // Unique cities for filter
  const cities = useMemo(() => {
    const set = new Set<string>();
    vendorLabsList.forEach((v) => {
      if (v.city) set.add(v.city);
    });
    return Array.from(set).sort();
  }, [vendorLabsList]);

  // Filtered list
  const filteredVendors = useMemo(() => {
    return vendorLabsList.filter((v) => {
      const matchesStatus = statusFilter === 'All' ? true : v.status === statusFilter;
      const matchesCity = selectedCity === 'All' ? true : v.city === selectedCity;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        (v.ownerName && v.ownerName.toLowerCase().includes(q)) ||
        (v.phone && v.phone.toLowerCase().includes(q)) ||
        (v.city && v.city.toLowerCase().includes(q)) ||
        (v.nablCode && v.nablCode.toLowerCase().includes(q)) ||
        (v.paymentReference && v.paymentReference.toLowerCase().includes(q));

      return matchesStatus && matchesCity && matchesSearch;
    });
  }, [vendorLabsList, statusFilter, selectedCity, searchQuery]);

  // Handlers
  const handleOpenAddModal = () => {
    setFormState({
      ...initialFormState,
      joinedDate: new Date().toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (vendor: VendorLabDirectoryItem) => {
    setEditingVendor(vendor);
    setFormState({
      name: vendor.name,
      tagline: vendor.tagline || 'Precision Diagnostics & Pathology Services',
      ownerName: vendor.ownerName || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      city: vendor.city || '',
      state: vendor.state || 'Punjab',
      address: vendor.address || '',
      nablCode: vendor.nablCode || '',
      badge: vendor.badge || 'NABL Certified',
      rating: vendor.rating || 4.8,
      activePackages: vendor.activePackages || 10,
      turnaroundTime: vendor.turnaroundTime || '6-8 Hours',
      emergency: vendor.emergency ?? true,
      color: vendor.color || '#123B6D',
      status: vendor.status || 'Active',
      subscriptionPlan: vendor.subscriptionPlan || 'Professional Lab Plan',
      subscriptionAmount: vendor.subscriptionAmount || 1999,
      paymentMode: vendor.paymentMode || 'UPI / QR Code',
      paymentReference: vendor.paymentReference || '',
      paymentNotes: vendor.paymentNotes || '',
      joinedDate: vendor.joinedDate || new Date().toISOString().split('T')[0],
      domainPreview: vendor.domainPreview || '',
      establishedYear: vendor.establishedYear || 2018,
      reviewsCount: vendor.reviewsCount || 100,
      features: vendor.features || ['WhatsApp Reports', 'Home Collection'],
    });
  };

  const handleSubmitSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      showToast('Please enter the laboratory name');
      return;
    }

    if (editingVendor) {
      updateVendorLab(editingVendor.id, formState);
      showToast(`Updated laboratory: ${formState.name}`);
      setEditingVendor(null);
    } else {
      addVendorLab(formState);
      showToast(`Added new laboratory vendor: ${formState.name}`);
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmVendor) {
      deleteVendorLab(deleteConfirmVendor.id);
      showToast(`Deleted laboratory "${deleteConfirmVendor.name}"`);
      setDeleteConfirmVendor(null);
    }
  };

  const handleOpenLabWebsite = (labId: string) => {
    selectVendorLab(labId);
    onNavigateView('vendor_website');
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Building2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Partner Laboratories & Vendor Management
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Control onboarding, approvals, payment confirmation status, and live websites of all diagnostic laboratories hosted on your portal.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          id="btn-add-new-vendor"
          className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Add New Lab Vendor</span>
        </button>
      </div>

      {/* Payment Confirmation Alert Banner (if any lab is in payment confirmation status) */}
      {stats.processingPayment > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 sm:p-5 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950 flex items-center gap-2">
                <span>{stats.processingPayment} Lab(s) Awaiting Payment Confirmation</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 uppercase font-black tracking-wider">
                  Action Required
                </span>
              </h4>
              <p className="text-xs text-amber-900/80 mt-0.5">
                New laboratories have submitted onboarding requests with payment references. Review their bank/UPI reference and click <strong>Confirm & Activate</strong> to grant them full access.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStatusFilter('Processing due to payment confirmation')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span>Review {stats.processingPayment} Lab(s)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total */}
        <div
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            statusFilter === 'All'
              ? 'bg-white border-[#123B6D] ring-2 ring-[#123B6D]/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Labs</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-[11px] text-slate-500 font-medium">onboarded</span>
          </div>
        </div>

        {/* Active */}
        <div
          onClick={() => setStatusFilter('Active')}
          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            statusFilter === 'Active'
              ? 'bg-emerald-50/50 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>Active & Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{stats.active}</span>
            <span className="text-[11px] text-emerald-600 font-medium">operational</span>
          </div>
        </div>

        {/* Processing due to payment confirmation */}
        <div
          onClick={() => setStatusFilter('Processing due to payment confirmation')}
          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            statusFilter === 'Processing due to payment confirmation'
              ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-500/30 shadow-xs'
              : 'bg-white border-slate-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span>Payment Due Conf.</span>
            <Receipt className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">{stats.processingPayment}</span>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-200 px-1.5 py-0.2 rounded-full">
              verify UTR
            </span>
          </div>
        </div>

        {/* Pending */}
        <div
          onClick={() => setStatusFilter('Pending')}
          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            statusFilter === 'Pending'
              ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between text-sky-700 text-xs font-semibold">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-800">{stats.pending}</span>
            <span className="text-[11px] text-sky-600 font-medium">in queue</span>
          </div>
        </div>

        {/* Suspended */}
        <div
          onClick={() => setStatusFilter('Suspended')}
          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            statusFilter === 'Suspended'
              ? 'bg-rose-50 border-rose-600 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>Suspended</span>
            <Ban className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700">{stats.suspended}</span>
            <span className="text-[11px] text-rose-600 font-medium">disabled</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search lab name, owner, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#123B6D] focus:border-transparent bg-slate-50 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 flex-wrap w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Active', 'Processing due to payment confirmation', 'Pending', 'Suspended'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#123B6D] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {status === 'Processing due to payment confirmation'
                  ? 'Payment Confirmation'
                  : status}
              </button>
            )
          )}
        </div>

        {/* City Filter */}
        {cities.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white focus:outline-none font-semibold text-slate-700"
            >
              <option value="All">All Cities ({vendorLabsList.length})</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Vendor Cards List */}
      <div className="space-y-4">
        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No laboratories match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords or resetting the status filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setSelectedCity('All');
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredVendors.map((vendor) => {
            const isProcessing = vendor.status === 'Processing due to payment confirmation';
            const isActive = vendor.status === 'Active';
            const isPending = vendor.status === 'Pending';
            const isSuspended = vendor.status === 'Suspended';

            return (
              <div
                key={vendor.id}
                className={`bg-white rounded-2xl border transition shadow-2xs overflow-hidden ${
                  isProcessing
                    ? 'border-amber-300 ring-1 ring-amber-400/40'
                    : isActive
                    ? 'border-slate-200 hover:border-slate-300'
                    : isSuspended
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="p-5 sm:p-6">
                  {/* Top Row: Lab Identity & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm shrink-0"
                        style={{ backgroundColor: vendor.color || '#123B6D' }}
                      >
                        {vendor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-slate-900">{vendor.name}</h3>
                          {vendor.nablCode && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>{vendor.nablCode}</span>
                            </span>
                          )}
                          {vendor.emergency && (
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                              24x7 Emergency
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {vendor.city}, {vendor.state} — {vendor.address}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {isActive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active on Portal</span>
                        </span>
                      )}
                      {isProcessing && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Processing due to payment confirmation</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>Pending Admin Approval</span>
                        </span>
                      )}
                      {isSuspended && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <Ban className="w-3.5 h-3.5 text-rose-600" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mid Row: Contacts, Subscription & Payment Details */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Owner & Phone */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        Lab Incharge / Owner
                      </span>
                      <div className="font-bold text-slate-800">{vendor.ownerName || 'Dr. Medical Director'}</div>
                      <div className="text-slate-600 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{vendor.phone}</span>
                      </div>
                      {vendor.email && (
                        <div className="text-slate-500 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{vendor.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Subscription Plan */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        SaaS Subscription Plan
                      </span>
                      <div className="font-bold text-slate-800">{vendor.subscriptionPlan || 'Professional Lab'}</div>
                      <div className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{vendor.subscriptionAmount ? vendor.subscriptionAmount.toLocaleString('en-IN') : '1,999'} / month</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Joined: {vendor.joinedDate || 'Recent'}</div>
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        Payment Confirmation
                      </span>
                      <div className="font-medium text-slate-700 flex items-center gap-1">
                        <Receipt className="w-3 h-3 text-slate-400" />
                        <span>Mode: <strong>{vendor.paymentMode || 'UPI / QR'}</strong></span>
                      </div>
                      <div className="text-slate-600 font-mono text-[11px] truncate">
                        Ref/UTR: <span className="font-bold text-slate-800">{vendor.paymentReference || 'None Provided'}</span>
                      </div>
                      {vendor.paymentNotes && (
                        <div className="text-slate-500 text-[11px] italic truncate">{vendor.paymentNotes}</div>
                      )}
                    </div>

                    {/* Portal Domain & Rating */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        Website Subdomain
                      </span>
                      <div className="font-mono text-indigo-700 text-xs truncate">
                        {vendor.domainPreview || `${vendor.id}.labname.com`}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        ★ {vendor.rating} ({vendor.reviewsCount || 80}+ reviews) • {vendor.turnaroundTime} TAT
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Actions & Status Switchers */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    {/* Status Changer Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-semibold mr-1">Change Status:</span>

                      {/* 1-Click Activate */}
                      {vendor.status !== 'Active' && (
                        <button
                          onClick={() => {
                            setVendorStatus(vendor.id, 'Active');
                            showToast(`Activated ${vendor.name} successfully!`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Confirm payment and activate lab"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Confirm & Activate</span>
                        </button>
                      )}

                      {/* Mark Processing due to payment confirmation */}
                      {vendor.status !== 'Processing due to payment confirmation' && (
                        <button
                          onClick={() => {
                            setVendorStatus(vendor.id, 'Processing due to payment confirmation');
                            showToast(`Marked ${vendor.name} as Processing due to payment confirmation`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Receipt className="w-3 h-3 text-amber-600" />
                          <span>Mark Payment Due Conf.</span>
                        </button>
                      )}

                      {/* Mark Pending */}
                      {vendor.status !== 'Pending' && (
                        <button
                          onClick={() => {
                            setVendorStatus(vendor.id, 'Pending');
                            showToast(`Marked ${vendor.name} as Pending review`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Clock className="w-3 h-3 text-sky-600" />
                          <span>Set Pending</span>
                        </button>
                      )}

                      {/* Suspend */}
                      {vendor.status !== 'Suspended' && (
                        <button
                          onClick={() => {
                            setVendorStatus(vendor.id, 'Suspended');
                            showToast(`Suspended ${vendor.name}`);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-medium transition cursor-pointer"
                          title="Temporarily deactivate lab access"
                        >
                          <span>Suspend</span>
                        </button>
                      )}
                    </div>

                    {/* Operational Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Filter Super Admin Data Scope */}
                      <button
                        onClick={() => {
                          setSuperAdminTenantScope(vendor.id);
                          showToast(`Super Admin data scope set to: ${vendor.name} (${vendor.id})`);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          superAdminTenantScope === vendor.id
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                        }`}
                        title="Isolate Super Admin view to this specific lab tenant"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{superAdminTenantScope === vendor.id ? 'Scope Active' : 'Filter Scope'}</span>
                      </button>

                      {/* View Website */}
                      <button
                        onClick={() => handleOpenLabWebsite(vendor.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#123B6D] text-slate-700 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="View the dedicated patient-facing website for this lab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview Lab Website</span>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEditModal(vendor)}
                        className="p-1.5 text-slate-600 hover:text-[#123B6D] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Edit lab vendor details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirmVendor(vendor)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete laboratory vendor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Vendor Modal */}
      {(isAddModalOpen || editingVendor) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#123B6D] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingVendor ? `Edit Laboratory: ${editingVendor.name}` : 'Add New Laboratory Vendor'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Configure vendor profile, NABL accreditation, and payment verification details
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingVendor(null);
                }}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lab Name */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Laboratory Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="e.g. Apex Diagnostics & Imaging Center"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Owner / Incharge Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lab Incharge / Owner Name
                  </label>
                  <input
                    type="text"
                    value={formState.ownerName || ''}
                    onChange={(e) => setFormState({ ...formState, ownerName: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Sharma (MD Path)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Helpline / WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formState.email || ''}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="e.g. contact@apexlab.in"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* NABL Code */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NABL / ICMR Accreditation No.
                  </label>
                  <input
                    type="text"
                    value={formState.nablCode}
                    onChange={(e) => setFormState({ ...formState, nablCode: e.target.value })}
                    placeholder="e.g. NABL-MC-2024-998"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    placeholder="e.g. Ludhiana"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formState.state}
                    onChange={(e) => setFormState({ ...formState, state: e.target.value })}
                    placeholder="e.g. Punjab"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Physical Address
                  </label>
                  <input
                    type="text"
                    value={formState.address}
                    onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                    placeholder="e.g. SCO 42, Ground Floor, Mall Road Market"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Status Selection (Crucial requirement) */}
                <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <label className="block font-extrabold text-slate-900 text-xs">
                    Current Vendor Status *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      formState.status === 'Active' ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' : 'bg-white border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        name="vendorStatus"
                        value="Active"
                        checked={formState.status === 'Active'}
                        onChange={() => setFormState({ ...formState, status: 'Active' })}
                        className="text-emerald-600"
                      />
                      <span>✅ Active (Fully Operational)</span>
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      formState.status === 'Processing due to payment confirmation' ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold' : 'bg-white border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        name="vendorStatus"
                        value="Processing due to payment confirmation"
                        checked={formState.status === 'Processing due to payment confirmation'}
                        onChange={() => setFormState({ ...formState, status: 'Processing due to payment confirmation' })}
                        className="text-amber-600"
                      />
                      <span>💳 Processing due to payment confirmation</span>
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      formState.status === 'Pending' ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold' : 'bg-white border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        name="vendorStatus"
                        value="Pending"
                        checked={formState.status === 'Pending'}
                        onChange={() => setFormState({ ...formState, status: 'Pending' })}
                        className="text-sky-600"
                      />
                      <span>⏳ Pending (Admin Review)</span>
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      formState.status === 'Suspended' ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold' : 'bg-white border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        name="vendorStatus"
                        value="Suspended"
                        checked={formState.status === 'Suspended'}
                        onChange={() => setFormState({ ...formState, status: 'Suspended' })}
                        className="text-rose-600"
                      />
                      <span>⛔ Suspended (Temporarily Deactivated)</span>
                    </label>
                  </div>
                </div>

                {/* Subscription & Payment Section */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Subscription Plan
                  </label>
                  <select
                    value={formState.subscriptionPlan || 'Professional Lab Plan'}
                    onChange={(e) => setFormState({ ...formState, subscriptionPlan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  >
                    <option value="Starter Lab Plan">Starter Lab Plan (₹999/mo)</option>
                    <option value="Professional Lab Plan">Professional Lab Plan (₹1,999/mo)</option>
                    <option value="Multi-Branch Network Plan">Multi-Branch Network Plan (₹2,999/mo)</option>
                    <option value="Enterprise Diagnostics">Enterprise Diagnostics (Custom)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Monthly Fee (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={formState.subscriptionAmount || 1999}
                    onChange={(e) => setFormState({ ...formState, subscriptionAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={formState.paymentMode || 'UPI / QR Code'}
                    onChange={(e) => setFormState({ ...formState, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  >
                    <option value="UPI / QR Code">UPI / QR Code</option>
                    <option value="NEFT / RTGS Bank Transfer">NEFT / RTGS Bank Transfer</option>
                    <option value="Cheque / Draft">Cheque / Draft</option>
                    <option value="Cash at Corporate Desk">Cash at Corporate Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Payment Reference / UTR Number
                  </label>
                  <input
                    type="text"
                    value={formState.paymentReference || ''}
                    onChange={(e) => setFormState({ ...formState, paymentReference: e.target.value })}
                    placeholder="e.g. UPI-928172648102"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Payment Notes */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Payment Verification Notes
                  </label>
                  <input
                    type="text"
                    value={formState.paymentNotes || ''}
                    onChange={(e) => setFormState({ ...formState, paymentNotes: e.target.value })}
                    placeholder="e.g. Advance paid via GPay. Awaiting 1st month clearance."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Emergency toggle */}
                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="emergency-checkbox"
                    checked={formState.emergency}
                    onChange={(e) => setFormState({ ...formState, emergency: e.target.checked })}
                    className="rounded text-[#123B6D] focus:ring-[#123B6D] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="emergency-checkbox" className="font-semibold text-slate-800 cursor-pointer">
                    Enable 24x7 Round-the-Clock Sample Processing badge for this lab
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingVendor(null);
                  }}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#123B6D] hover:bg-[#0e2c52] text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{editingVendor ? 'Save Changes' : 'Add Laboratory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-extrabold text-slate-900">
                Delete Laboratory Vendor?
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Are you sure you want to permanently delete <strong>{deleteConfirmVendor.name}</strong> from your portal directory? Their dedicated website subdomain will be disabled.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmVendor(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Laboratory</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
