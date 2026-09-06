import React from 'react';
import { GitBranch, Building2, TrendingUp, Users, FileCheck, IndianRupee, Stethoscope, Clock, ShieldCheck } from 'lucide-react';
import { MOCK_BRANCHES } from '../data/mockData';

export const MultiBranchSection: React.FC = () => {
  const branches = MOCK_BRANCHES;
  const totalRevenue = branches.reduce((sum, b) => sum + b.collectionToday, 0); // ₹2,38,350
  const totalPatients = branches.reduce((sum, b) => sum + b.patientsToday, 0); // 126
  const totalPending = branches.reduce((sum, b) => sum + b.pendingReports, 0); // 18

  return (
    <section id="multi-branch-section" className="py-16 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold mb-3 border border-teal-200">
            <GitBranch className="w-3.5 h-3.5 text-teal-600" />
            <span>Centralized Group Control</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            One Account. Multiple Laboratories.
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Monitor real-time cash collection, specimen logistics, doctor referrals, and diagnostic volume across all your branches from a single Head Office login.
          </p>
        </div>

        {/* Head Office Dashboard Card */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* HO Top Header */}
          <div className="bg-[#123B6D] text-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Head Office Consolidated Overview
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Real-time multi-branch synchronization • All Branches Online
              </p>
            </div>

            {/* Total Revenue Highlight Badge required by spec */}
            <div className="bg-[#0e2c52] border border-white/20 px-4 py-2 rounded-xl text-right">
              <span className="text-[11px] text-amber-300 uppercase font-semibold block">
                Total Group Collection
              </span>
              <span className="text-xl sm:text-2xl font-black text-white">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Metric Strip across all branches */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200 border-b border-slate-200 bg-slate-50/60 text-xs">
            <div className="p-4">
              <span className="text-[#64748B] block text-[11px] font-semibold uppercase">Total Patients</span>
              <div className="text-xl font-bold text-[#172033] mt-0.5">{totalPatients} Today</div>
              <span className="text-[10px] text-emerald-600 font-medium">Across 3 branches</span>
            </div>
            <div className="p-4">
              <span className="text-[#64748B] block text-[11px] font-semibold uppercase">Total Reports</span>
              <div className="text-xl font-bold text-[#172033] mt-0.5">284 Tests</div>
              <span className="text-[10px] text-emerald-600 font-medium">266 Completed</span>
            </div>
            <div className="p-4">
              <span className="text-[#64748B] block text-[11px] font-semibold uppercase">Referring Doctors</span>
              <div className="text-xl font-bold text-[#172033] mt-0.5">42 Doctors</div>
              <span className="text-[10px] text-slate-500 font-medium">Active referral ledger</span>
            </div>
            <div className="p-4">
              <span className="text-[#64748B] block text-[11px] font-semibold uppercase">Pending Reports</span>
              <div className="text-xl font-bold text-amber-600 mt-0.5">{totalPending} Pending</div>
              <span className="text-[10px] text-amber-700 font-medium">Normal TAT buffer</span>
            </div>
          </div>

          {/* Branch Performance Cards as specified */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#172033] mb-2">
              <span>Individual Branch Performance</span>
              <span className="text-[#64748B]">Updated 2 mins ago</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {branches.map((b) => {
                const percentage = Math.round((b.collectionToday / totalRevenue) * 100);
                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-[#0F766E]/40 hover:shadow-xs transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#123B6D]">{b.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        Online
                      </span>
                    </div>

                    <div className="text-2xl font-black text-[#172033] my-1">
                      ₹{b.collectionToday.toLocaleString('en-IN')}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden my-2">
                      <div
                        className="bg-[#0F766E] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block">Patients:</span>
                        <span className="font-semibold text-slate-800">{b.patientsToday}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Pending:</span>
                        <span className="font-semibold text-amber-700">{b.pendingReports}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Tests:</span>
                        <span className="font-semibold text-slate-800">{b.testsToday}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Active Staff:</span>
                        <span className="font-semibold text-slate-800">{b.activeStaff}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Summary Strip */}
          <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
            <span>Branch A (₹82,450) + Branch B (₹64,280) + Branch C (₹91,620)</span>
            <span className="font-bold text-[#123B6D]">
              Consolidated Total Collection: ₹2,38,350
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
