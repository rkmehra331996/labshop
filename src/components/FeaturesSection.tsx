import React from 'react';
import {
  Users,
  BookOpen,
  Stethoscope,
  TestTubes,
  Activity,
  FileEdit,
  FileCheck2,
  ShieldCheck,
  IndianRupee,
  History,
  MessageSquare,
  QrCode,
  WifiOff,
  RefreshCw,
  HardDriveDownload,
  Building,
  TrendingUp,
  UserCog,
  ArrowRight,
  FlaskConical,
  Database,
  Lock,
  Layers,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface FeaturesSectionProps {
  onExploreFeatures?: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  BookOpen,
  Stethoscope,
  TestTubes,
  Activity,
  FileEdit,
  FileCheck2,
  ShieldCheck,
  IndianRupee,
  History,
  MessageSquare,
  QrCode,
  WifiOff,
  RefreshCw,
  HardDriveDownload,
  Building,
  TrendingUp,
  UserCog,
  FlaskConical,
  Database,
  Lock,
  Layers,
};

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onExploreFeatures }) => {
  const { labManagementFeatures } = useCms();

  const featuresList = labManagementFeatures && labManagementFeatures.length > 0
    ? labManagementFeatures
    : [];

  return (
    <section id="features-section" className="py-16 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#123B6D]/10 text-[#123B6D] text-xs font-semibold mb-3">
            <span>Built for Modern Laboratories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Complete Laboratory Management Features
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Every instrument, sample, report, rupee, and user is accounted for across all {featuresList.length} essential modules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuresList.map((feat, idx) => {
            const Icon = (feat.iconName && ICON_MAP[feat.iconName]) || Activity;
            return (
              <div
                key={feat.id || idx}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-[#123B6D]/30 hover:shadow-xs transition duration-150 flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#123B6D]/10 text-[#123B6D] group-hover:bg-[#123B6D] group-hover:text-white transition flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#172033]">{feat.title}</h3>
                    {feat.category && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {feat.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-1 leading-snug">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA as specified */}
        <div className="mt-10 text-center">
          <button
            id="features-btn-explore-all"
            onClick={onExploreFeatures}
            className="inline-flex items-center gap-2 bg-[#123B6D] hover:bg-[#0e2c52] text-white px-6 py-3 rounded-xl text-xs font-bold tracking-wide transition shadow-sm hover:shadow cursor-pointer"
          >
            <span>Explore All Features</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </section>
  );
};
