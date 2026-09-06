import React, { useState } from 'react';
import { Check, ArrowRight, ShieldCheck, Sparkles, Building, GitBranch } from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface PricingSectionProps {
  onOpenTrial: () => void;
  onOpenDemo: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenTrial, onOpenDemo }) => {
  const [isYearly, setIsYearly] = useState(true);
  const { pricingPlans } = useCms();

  return (
    <section id="pricing-section" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#123B6D]/10 text-[#123B6D] text-xs font-semibold mb-3">
            <span>Transparent INR Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B6D] tracking-tight">
            Simple, Predictable Plans for Indian Labs
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            No hidden setup costs or per-report royalties. Every plan includes free updates, cloud backup, and Indian WhatsApp support.
          </p>

          {/* Monthly / Yearly Toggle as specified */}
          <div className="mt-6 inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                !isYearly ? 'bg-white text-[#172033] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                isYearly ? 'bg-[#123B6D] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Pricing Cards from CMS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan) => {
            const price = isYearly ? plan.yearlyPriceINR : plan.monthlyPriceINR;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border ${
                  plan.isPopular
                    ? 'border-2 border-[#123B6D] bg-white shadow-lg relative'
                    : 'border border-slate-200 bg-[#F8FAFC] hover:border-slate-300'
                } p-6 sm:p-8 flex flex-col justify-between transition`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 right-6 bg-[#0F766E] text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                    Recommended for Groups
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${
                        plan.isPopular ? 'bg-teal-100 text-[#0F766E]' : 'bg-blue-100 text-[#123B6D]'
                      } flex items-center justify-center`}
                    >
                      {plan.isPopular ? <GitBranch className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#123B6D] border border-blue-200">
                      {plan.target}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#172033]">{plan.name}</h3>
                  <p className="text-xs text-[#64748B] mt-1">{plan.description}</p>

                  {/* Price Range */}
                  <div className="my-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-[#123B6D]">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {isYearly
                        ? `Billed annually (₹${(price * 12).toLocaleString('en-IN')}/yr) + GST`
                        : 'Billed monthly • Cancel anytime'}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-4 border-t border-slate-200 text-xs">
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2.5 text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 space-y-2">
                  <button
                    onClick={onOpenTrial}
                    className={`w-full ${
                      plan.isPopular
                        ? 'bg-[#123B6D] hover:bg-[#0e2c52] text-white'
                        : 'bg-[#123B6D] hover:bg-[#0e2c52] text-white'
                    } py-3 rounded-xl font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5`}
                  >
                    <span>Start 14-Day Free Trial</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  <div className="text-[11px] text-center text-slate-500">
                    Online Payment • Instant Tax Invoice • Easy Renewal
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
