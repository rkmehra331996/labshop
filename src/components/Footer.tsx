import React from 'react';
import { MessageSquare, Phone, MapPin, Heart, Shield } from 'lucide-react';
import { AppView } from '../types';

interface FooterProps {
  onSelectView: (view: AppView) => void;
  onOpenDemo: () => void;
  onOpenTrial: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectView, onOpenDemo, onOpenTrial }) => {
  const scrollTo = (id: string) => {
    onSelectView('website');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <footer className="bg-[#0b1c33] text-slate-300 text-xs border-t border-slate-800 pb-20 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#123B6D] text-white flex items-center justify-center font-bold text-sm border border-white/20">
                <span className="text-amber-400">L</span>N
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                LABNAME<span className="text-teal-400">.COM</span>
              </span>
            </div>

            <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
              Laboratory Management Software for India.
            </p>
            <p className="text-slate-400 max-w-sm text-[11px] leading-relaxed">
              Empowering standalone pathology labs and multi-branch diagnostic chains with offline capabilities, ₹ INR billing, and instant WhatsApp report delivery.
            </p>

            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <div>Founder: <strong>Rahul K.</strong></div>
              <div>Market: <strong>India 🇮🇳</strong></div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollTo('features-section')} className="hover:text-white transition">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('pricing-section')} className="hover:text-white transition">
                  Pricing
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('demo-section')} className="hover:text-white transition">
                  Demo
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectView('patient_portal')}
                  className="hover:text-white transition text-amber-300"
                >
                  Patient Portal
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('security-section')} className="hover:text-white transition">
                  Security
                </button>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Solutions
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollTo('pricing-section')} className="hover:text-white transition">
                  Single Branch
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('multi-branch-section')} className="hover:text-white transition">
                  Multi Branch
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('solution-section')} className="hover:text-white transition">
                  Diagnostic Labs
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('solution-section')} className="hover:text-white transition">
                  Pathology Labs
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Resources & Support
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollTo('faq-section')} className="hover:text-white transition">
                  FAQ
                </button>
              </li>
              <li>
                <span className="text-slate-400">Help & Docs</span>
              </li>
              <li>
                <span className="text-slate-400">Documentation</span>
              </li>
              <li>
                <button onClick={onOpenDemo} className="hover:text-white transition">
                  Contact
                </button>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] space-y-1">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>7087033009</span>
              </div>
              <div className="text-slate-400">Mon–Fri, 10 AM–6 PM</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Company Links and Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <div>
            © LABNAME.COM. All Rights Reserved. Made for Indian Healthcare.
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            <button onClick={() => scrollTo('security-section')} className="hover:text-white transition">
              Security
            </button>
            <button onClick={() => scrollTo('data-safety-section')} className="hover:text-white transition">
              Privacy Policy
            </button>
            <a
              href="https://wa.me/917087033009"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
