import React from 'react';
import { Check, ArrowRight, ShieldCheck, Sparkles, Zap, Award, CheckCircle2 } from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface PricingSectionProps {
  onOpenDemo?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = () => {
  const { pricingPlans, openRegisterLabModal } = useCms();

  // Helper to get formatted duration / billing cycle subtitle
  const getBillingSubtitle = (name: string, price: number) => {
    const lower = name.toLowerCase();
    if (lower.includes('1 month') || lower.includes('1mopnth') || lower.includes('monthly')) {
      return {
        rateText: `/ 1 Month`,
        breakdownText: 'Billed monthly • Complete software access',
        badge: 'Flexible Monthly',
        accentColor: 'blue',
      };
    }
    if (lower.includes('3 month') || lower.includes('quarterly')) {
      const perMonth = Math.round(price / 3);
      return {
        rateText: `/ 3 Months`,
        breakdownText: `₹${perMonth.toLocaleString('en-IN')}/month • Billed quarterly`,
        badge: 'Most Popular',
        accentColor: 'teal',
      };
    }
    if (lower.includes('year') || lower.includes('annual') || lower.includes('1 year')) {
      const perMonth = Math.round(price / 12);
      return {
        rateText: `/ 1 Year`,
        breakdownText: `₹${perMonth.toLocaleString('en-IN')}/month • Best Value Annual Saver`,
        badge: 'Best Value • Maximum Savings',
        accentColor: 'indigo',
      };
    }
    return {
      rateText: `/ period`,
      breakdownText: 'Full access with all features',
      badge: 'Standard Plan',
      accentColor: 'blue',
    };
  };

  return (
    <section id="pricing-section" className="py-20 bg-linear-to-b from-white via-slate-50/50 to-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#123B6D]/10 text-[#123B6D] text-xs font-bold mb-3 border border-[#123B6D]/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Transparent INR Pricing • 3 Flexible Packages</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B6D] tracking-tight">
            Simple, All-Inclusive Plans for Every Laboratory
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Choose your duration: <span className="font-semibold text-slate-900">1 Month</span>,{' '}
            <span className="font-semibold text-slate-900">3 Months</span>, or{' '}
            <span className="font-semibold text-slate-900">1 Year</span>. All software features, test libraries, WhatsApp PDF sharing, and Indian support are 100% included in every package.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Same Full Features Across All 3 Packages • No Hidden Setup Fees</span>
          </div>
        </div>

        {/* Dynamic 3 Pricing Cards from CMS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan, idx) => {
            const price = plan.priceINR ?? plan.monthlyPriceINR;
            const meta = getBillingSubtitle(plan.name, price);
            const isHighlighted = plan.isPopular || plan.name.includes('3 Month');

            return (
              <div
                key={plan.id || idx}
                className={`rounded-3xl transition-all duration-200 flex flex-col justify-between relative ${
                  isHighlighted
                    ? 'border-2 border-[#123B6D] bg-white shadow-xl ring-4 ring-[#123B6D]/5 -translate-y-1'
                    : 'border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-slate-300'
                } p-6 sm:p-8`}
              >
                {/* Highlight Ribbon */}
                {isHighlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#123B6D] text-amber-300 text-[11px] font-extrabold uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Most Popular Choice</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                        isHighlighted
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-blue-50 text-[#123B6D] border-blue-200'
                      }`}
                    >
                      {plan.target || meta.badge}
                    </span>

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isHighlighted ? 'bg-[#123B6D] text-amber-400' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {idx === 0 && <Zap className="w-4 h-4" />}
                      {idx === 1 && <Sparkles className="w-4 h-4" />}
                      {idx === 2 && <Award className="w-4 h-4" />}
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900">{plan.name} Plan</h3>
                  <p className="text-xs text-slate-500 mt-1.5 min-h-[32px] leading-relaxed">
                    {plan.description || 'Full software access with all features included.'}
                  </p>

                  {/* Price Block */}
                  <div className="my-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-[#123B6D]">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">{meta.rateText}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mt-1">
                      {meta.breakdownText}
                    </div>
                  </div>

                  {/* Features List - Identical across all 3 plans */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Included in this package:
                    </div>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-slate-700 leading-snug">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 space-y-2.5">
                  <button
                    onClick={() => openRegisterLabModal()}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                      isHighlighted
                        ? 'bg-[#123B6D] hover:bg-[#0e2c52] text-white shadow-md hover:shadow-lg'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Choose {plan.name} • Register Lab</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  <div className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Access • GST Tax Invoice Included</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assurance Banner */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Need Custom Branch Licensing or Dedicated On-Premise Server?</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Our Indian technical team assists with data import from older software, barcode scanners, and custom lab letterheads.
              </p>
            </div>
          </div>
          <button
            onClick={() => openRegisterLabModal()}
            className="shrink-0 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Talk to Lab Specialist
          </button>
        </div>
      </div>
    </section>
  );
};
