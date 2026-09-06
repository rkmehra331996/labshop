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
  GitBranch,
  UserCog,
  ArrowRight,
} from 'lucide-react';

interface FeaturesSectionProps {
  onExploreFeatures?: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onExploreFeatures }) => {
  const features = [
    { title: 'Patient Management', desc: 'Fast UHID generation, 10-digit mobile lookup & family records', icon: Users },
    { title: '500+ Test Library', desc: 'Pre-configured NABL tests, reference ranges & custom profiles', icon: BookOpen },
    { title: 'Doctor Reference', desc: 'Maintain referral doctor directory, incentives & direct reports', icon: Stethoscope },
    { title: 'Sample Management', desc: 'Barcode tube generation, phlebotomy timestamps & status tracking', icon: TestTubes },
    { title: 'Test Processing', desc: 'Analyzer worklists, batch runs & bidirectional equipment ready', icon: Activity },
    { title: 'Result Entry', desc: 'Rapid numeric entry with automatic high/low panic value flagging', icon: FileEdit },
    { title: 'Report Generation', desc: 'Branded PDF reports with laboratory headers, logos & QR codes', icon: FileCheck2 },
    { title: 'Report Verification', desc: 'Pathologist digital signature with tamper-resistant audit trail', icon: ShieldCheck },
    { title: 'Billing & Payments', desc: 'Cash, UPI QR, partial dues, discount approvals & GST receipts', icon: IndianRupee },
    { title: 'Patient History', desc: 'Lifetime historical trend charts for repeat clinical visits', icon: History },
    { title: 'WhatsApp Report Sharing', desc: 'Automated 1-click dispatch to patient mobile upon sign-off', icon: MessageSquare },
    { title: 'QR Report Verification', desc: 'Instant authenticity verification without logging into an account', icon: QrCode },
    { title: 'Online + Offline Mode', desc: 'Continue front-desk operations even when local ISP is down', icon: WifiOff },
    { title: 'Automatic Cloud Sync', desc: 'Zero-conflict background synchronization once online', icon: RefreshCw },
    { title: 'Backup & Restore', desc: 'Continuous snapshot backups with one-click Excel data export', icon: HardDriveDownload },
    { title: 'Single Branch', desc: 'Optimized high-speed interface for standalone diagnostic centers', icon: Building },
    { title: 'Multi Branch', desc: 'Centralized HO oversight for regional chains & collection points', icon: GitBranch },
    { title: 'Staff & Roles', desc: 'Granular permissions for owners, technicians, pathologists & clerks', icon: UserCog },
  ];

  return (
    <section id="features-section" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#123B6D]/10 text-[#123B6D] text-xs font-semibold mb-3">
            <span>Built for Modern Laboratories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Complete Laboratory Management Features
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Every instrument, sample, report, rupee, and user is accounted for across all 18 essential modules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-[#123B6D]/30 hover:shadow-xs transition duration-150 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-lg bg-[#123B6D]/10 text-[#123B6D] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172033]">{feat.title}</h3>
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
            className="inline-flex items-center gap-2 bg-[#123B6D] hover:bg-[#0e2c52] text-white px-6 py-3 rounded-xl text-xs font-bold tracking-wide transition shadow-sm hover:shadow"
          >
            <span>Explore All Features</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </section>
  );
};
