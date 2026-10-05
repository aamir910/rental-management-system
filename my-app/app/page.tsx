"use client";

import { ApprovalPreview } from "@/components/ApprovalPreview";
import { ComingSoon } from "@/components/ComingSoon";
import { CTA } from "@/components/CTA";
import { DashboardPreview } from "@/components/DashboardPreview";
import { Features } from "@/components/Features";
import { FinancePreview } from "@/components/FinancePreview";
import { FloatingLanguageToggle } from "@/components/FloatingLanguageToggle";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HouseholdPreview } from "@/components/HouseholdPreview";
import { InvoicePreview } from "@/components/InvoicePreview";
import { Navbar } from "@/components/Navbar";
import { ProblemSection } from "@/components/ProblemSection";
import { RentAutomation } from "@/components/RentAutomation";
import { Roadmap } from "@/components/Roadmap";
import { SolutionSection } from "@/components/SolutionSection";
import { TenantPreview } from "@/components/TenantPreview";
import { WhyYasin } from "@/components/WhyYasin";
import { LanguageProvider } from "@/context/LanguageContext";

export default function Home() {
  return (
    <LanguageProvider>
      <Navbar />
      <FloatingLanguageToggle />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <Features />
        <FinancePreview />
        <HouseholdPreview />
        <TenantPreview />
        <ApprovalPreview />
        <RentAutomation />
        <InvoicePreview />
        <DashboardPreview />
        <ComingSoon />
        <WhyYasin />
        <Roadmap />
        <CTA />
      </main>
      <Footer />
    </LanguageProvider>
  );
}
