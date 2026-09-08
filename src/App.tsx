import React, { useState, useEffect } from 'react';
import { AppView, Language } from './types';
import { TopBar } from './components/TopBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustStrip } from './components/TrustStrip';
import { ProblemSection } from './components/ProblemSection';
import { SolutionSection } from './components/SolutionSection';
import { LabWorkflow } from './components/LabWorkflow';
import { FeaturesSection } from './components/FeaturesSection';
import { OfflineSection } from './components/OfflineSection';
import { PatientPortalSection } from './components/PatientPortalSection';
import { VendorWebsitesShowcaseSection } from './components/VendorWebsitesShowcaseSection';
import { ReportPreviewSection } from './components/ReportPreviewSection';
import { WhatsAppReportSection } from './components/WhatsAppReportSection';
import { TestLibrarySection } from './components/TestLibrarySection';
import { MultiBranchSection } from './components/MultiBranchSection';
import { StaffRolesSection } from './components/StaffRolesSection';
import { PatientHistorySection } from './components/PatientHistorySection';
import { DataSafetySection } from './components/DataSafetySection';
import { SecuritySection } from './components/SecuritySection';
import { AuditLogSection } from './components/AuditLogSection';
import { IndianMarketSection } from './components/IndianMarketSection';
import { PricingSection } from './components/PricingSection';
import { DemoSection } from './components/DemoSection';
import { FinalCTASection } from './components/FinalCTASection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { MobileFixedCTA } from './components/MobileFixedCTA';
import { BookDemoModal, StartTrialModal } from './components/Modals';
import { LabSoftwareApp } from './components/LabSoftwareApp';
import { PatientPortalApp } from './components/PatientPortalApp';
import { LabVendorWebsite } from './components/LabVendorWebsite';
import { CompanyAdminDashboard } from './components/CompanyAdminDashboard';
import { LabVendorDashboard } from './components/LabVendorDashboard';
import { ReceptionEntryDashboard } from './components/ReceptionEntryDashboard';
import { TechnicianDepartmentDashboard } from './components/technician/TechnicianDepartmentDashboard';
import { DashboardAuthGuard } from './components/DashboardAuthGuard';
import { CmsAuthModal } from './components/CmsAuthModal';
import { BranchManagerDashboard } from './components/BranchManagerDashboard';
import { PathologistDashboard } from './components/PathologistDashboard';
import { isUserAuthorizedForView } from './utils/rbac';
import { useCms } from './context/CmsContext';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('website');
  const [language, setLanguage] = useState<Language>('en');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [selectedPatientMobile, setSelectedPatientMobile] = useState('');

  const { currentUser, isAuthModalOpen, setIsAuthModalOpen, portalSections } = useCms();

  // Sync view from URL parameters on initial mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') as AppView | null;
      if (
        viewParam &&
        [
          'vendor_dashboard',
          'branch_manager_dashboard',
          'reception_dashboard',
          'technician_dashboard',
          'pathologist_dashboard',
          'admin_dashboard',
          'vendor_website',
          'website',
          'patient_portal',
          'lab_app',
        ].includes(viewParam)
      ) {
        setCurrentView(viewParam);
      }
    } catch {}
  }, []);

  // Update URL search parameters when view changes (unless on public websites)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (currentView === 'website' || currentView === 'vendor_website') {
        if (url.searchParams.has('view')) {
          url.searchParams.delete('view');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }
      } else {
        url.searchParams.set('view', currentView);
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    } catch {}
  }, [currentView]);

  // Authorization check for protected dashboard workspaces using RBAC
  const isAuthorizedForView = (view: AppView): boolean => {
    return isUserAuthorizedForView(currentUser, view);
  };

  const handleOpenDemo = () => setIsDemoModalOpen(true);
  const handleOpenTrial = () => setIsTrialModalOpen(true);

  const handleViewPatientPortal = (reportId?: string, mobile?: string) => {
    setSelectedReportId(reportId || '');
    setSelectedPatientMobile(mobile || '');
    setCurrentView('patient_portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchLabApp = () => {
    setCurrentView('lab_app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToWebsite = () => {
    setCurrentView('vendor_website');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Dedicated Experience: Diagnostic Laboratory (Vendor) Website
  if (currentView === 'vendor_website') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
        <LabVendorWebsite
          language={language}
          onSelectLanguage={setLanguage}
          onOpenReportPortal={handleViewPatientPortal}
          onOpenLabSoftware={handleLaunchLabApp}
          onOpenSoftwareWebsite={() => setCurrentView('website')}
          onOpenVendorDashboard={() => setCurrentView('vendor_dashboard')}
          onOpenReceptionDashboard={() => setCurrentView('reception_dashboard')}
        />
        <CmsAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onNavigateView={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // 2. Dedicated Experience: Company Admin CMS Dashboard
  if (currentView === 'admin_dashboard') {
    if (!isAuthorizedForView('admin_dashboard')) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
          <DashboardAuthGuard
            view="admin_dashboard"
            onNavigateView={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <CmsAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onNavigateView={(v) => {
              setCurrentView(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
        <TopBar
          currentView={currentView}
          onSelectView={setCurrentView}
          language={language}
          onSelectLanguage={setLanguage}
        />
        <CompanyAdminDashboard
          onNavigateView={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
        <CmsAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onNavigateView={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // 3. Dedicated Experience: Diagnostic Lab Vendor CMS Dashboard
  if (currentView === 'vendor_dashboard') {
    if (!isAuthorizedForView('vendor_dashboard')) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
          <DashboardAuthGuard
            view="vendor_dashboard"
            onNavigateView={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <CmsAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onNavigateView={(v) => {
              setCurrentView(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
        <LabVendorDashboard
          onNavigateView={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
        <CmsAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onNavigateView={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // 4. Dedicated Experience: Reception Entry & Billing Dashboard
  if (currentView === 'reception_dashboard') {
    if (!isAuthorizedForView('reception_dashboard')) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
          <DashboardAuthGuard
            view="reception_dashboard"
            onNavigateView={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <CmsAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onNavigateView={(v) => {
              setCurrentView(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
        <ReceptionEntryDashboard
          onNavigateView={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenReportPortal={handleViewPatientPortal}
        />
        <CmsAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onNavigateView={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // 4b. Dedicated Experience: Technician Department Dashboard (Reports, Edit, Cancel Reason)
  if (currentView === 'technician_dashboard') {
    if (!isAuthorizedForView('technician_dashboard')) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
          <DashboardAuthGuard
            view="technician_dashboard"
            onNavigateView={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <CmsAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onNavigateView={(v) => {
              setCurrentView(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
        <TechnicianDepartmentDashboard
          onNavigateView={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenReportPortal={handleViewPatientPortal}
        />
        <CmsAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onNavigateView={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // 4c. Dedicated Experience: Branch Operations & Cash Manager Dashboard
  if (currentView === 'branch_manager_dashboard') {
    if (!isAuthorizedForView('branch_manager_dashboard')) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
          <DashboardAuthGuard
            view="branch_manager_dashboard"
            onNavigateView={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <CmsAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onNavigateView={(v) => {
              setCurrentView(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
        <BranchManagerDashboard
          onNavigateView={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenReportPortal={handleViewPatientPortal}
        />
        <CmsAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onNavigateView={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // 4d. Dedicated Experience: Consultant Pathologist Verification & Clinical Sign-off Desk
  if (currentView === 'pathologist_dashboard') {
    if (!isAuthorizedForView('pathologist_dashboard')) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
          <DashboardAuthGuard
            view="pathologist_dashboard"
            onNavigateView={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <CmsAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onNavigateView={(v) => {
              setCurrentView(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
        <PathologistDashboard
          onNavigateView={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenReportPortal={handleViewPatientPortal}
        />
        <CmsAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onNavigateView={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // 5. Dedicated Experience: Laboratory Software (app.labname.com)
  if (currentView === 'lab_app') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
        <LabSoftwareApp
          onBackToWebsite={handleBackToWebsite}
          onViewReport={handleViewPatientPortal}
        />
        <CmsAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onNavigateView={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // 5. Dedicated Experience: Patient Report Portal (report.labname.com)
  if (currentView === 'patient_portal') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans">
        <TopBar
          currentView={currentView}
          onSelectView={setCurrentView}
          language={language}
          onSelectLanguage={setLanguage}
        />
        <PatientPortalApp
          onBackToWebsite={handleBackToWebsite}
          initialReportId={selectedReportId}
          initialMobile={selectedPatientMobile}
        />
        <CmsAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onNavigateView={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // 3. Dedicated Experience: Public Website (labname.com)
  // Section 37: HOMEPAGE FINAL ORDER
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans selection:bg-[#123B6D]/15 selection:text-[#123B6D]">
      {/* 1. Top Bar */}
      <TopBar
        currentView={currentView}
        onSelectView={setCurrentView}
        language={language}
        onSelectLanguage={setLanguage}
      />

      {/* 2. Navigation Bar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenDemo={handleOpenDemo}
        onOpenTrial={handleOpenTrial}
      />

      <main className="flex-1">
        {/* 3. Hero Section */}
        {portalSections.hero && (
          <Hero
            onOpenTrial={handleOpenTrial}
            onOpenDemo={handleOpenDemo}
            onLaunchApp={handleLaunchLabApp}
            language={language}
          />
        )}

        {/* 4. Trust Strip */}
        {portalSections.trustStrip && <TrustStrip />}

        {/* 5. Problem Section */}
        {portalSections.problemSection && <ProblemSection />}

        {/* 6. Solution Section */}
        {portalSections.solutionSection && <SolutionSection onLaunchApp={handleLaunchLabApp} />}

        {/* 7. Laboratory Workflow */}
        {portalSections.workflow && <LabWorkflow />}

        {/* 8. Core Features */}
        {portalSections.features && <FeaturesSection />}

        {/* 9. Offline Section (USP 1) */}
        {portalSections.offline && <OfflineSection onLaunchApp={handleLaunchLabApp} />}

        {/* 10. Patient Portal Section (USP 2) */}
        {portalSections.patientPortal && (
          <PatientPortalSection
            onOpenPortal={() => handleViewPatientPortal('RPT-2026-8812', '9876543210')}
          />
        )}

        {/* Vendor Websites Showcase */}
        {portalSections.vendorWebsitesShowcase && (
          <VendorWebsitesShowcaseSection
            onSelectView={setCurrentView}
            onOpenTrial={handleOpenTrial}
            onOpenDemo={handleOpenDemo}
          />
        )}

        {/* 11. Report Preview */}
        {portalSections.reportPreview && (
          <ReportPreviewSection
            onViewFullReport={() => handleViewPatientPortal('RPT-2026-8812', '9876543210')}
          />
        )}

        {/* 12. WhatsApp Reports */}
        {portalSections.whatsapp && <WhatsAppReportSection onLaunchApp={handleLaunchLabApp} />}

        {/* 13. 500+ Test Library */}
        {portalSections.testLibrary && <TestLibrarySection />}

        {/* 14. Multi-Branch */}
        {portalSections.multiBranch && <MultiBranchSection />}

        {/* 15. Staff & Roles */}
        {portalSections.staffRoles && <StaffRolesSection onNavigateView={setCurrentView} />}

        {/* 16. Patient History */}
        {portalSections.patientHistory && <PatientHistorySection />}

        {/* 17. Data Safety */}
        {portalSections.dataSafety && <DataSafetySection />}

        {/* 18. Security */}
        {portalSections.security && <SecuritySection />}

        {/* 19. Audit Log */}
        {portalSections.auditLog && <AuditLogSection />}

        {/* 20. Indian Market */}
        {portalSections.indianMarket && <IndianMarketSection />}

        {/* 21. Pricing */}
        {portalSections.pricing && (
          <PricingSection onOpenTrial={handleOpenTrial} onOpenDemo={handleOpenDemo} />
        )}

        {/* 22. Demo Section */}
        {portalSections.demo && (
          <DemoSection onOpenDemo={handleOpenDemo} onLaunchApp={handleLaunchLabApp} />
        )}

        {/* 23. Final CTA */}
        {portalSections.finalCta && (
          <FinalCTASection onOpenTrial={handleOpenTrial} onOpenDemo={handleOpenDemo} />
        )}

        {/* 24. FAQ */}
        {portalSections.faq && <FAQSection />}
      </main>

      {/* 25. Footer */}
      {portalSections.footer && (
        <Footer
          onSelectView={setCurrentView}
          onOpenDemo={handleOpenDemo}
          onOpenTrial={handleOpenTrial}
        />
      )}

      {/* 33. Mobile Fixed CTA */}
      <MobileFixedCTA onOpenTrial={handleOpenTrial} />

      {/* Interactive Modals */}
      <BookDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
      <StartTrialModal isOpen={isTrialModalOpen} onClose={() => setIsTrialModalOpen(false)} />
      <CmsAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onNavigateView={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
