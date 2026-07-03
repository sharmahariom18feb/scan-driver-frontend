import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FloatingWhatsApp } from '@/components/layout/floating-whatsapp'
import { HeroSection } from '@/components/sections/hero-section'
import { AboutUsSection } from '@/components/sections/about-us-section'
import { MarqueeStrip } from '@/components/sections/marquee-strip'
import { ServicesSection } from '@/components/sections/services-section'
import { HowItWorksSection } from '@/components/sections/how-it-works-section'
import { WhyUsSection } from '@/components/sections/why-us-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { WhatsAppFirstSection } from '@/components/sections/whatsapp-first-section'
import { DriverJoinSection } from '@/components/sections/driver-join-section'
import { CustomerEnquirySection } from '@/components/sections/customer-enquiry-section'
import { ContactStripSection } from '@/components/sections/contact-strip-section'
import { TermsSection } from '@/components/sections/terms-section'
import {
  OrganizationJsonLd,
  LocalBusinessJsonLd,
  FAQJsonLd,
  ServiceJsonLd,
} from '@/components/seo/json-ld'


export const metadata: Metadata = {
  title: 'ScanDriver – Your Driver One Scan Away | Delhi NCR',
  description:
    "Delhi NCR's most trusted on-demand driver service. Hire verified, professional drivers hourly, weekly, monthly or for outstation. Book via WhatsApp instantly.",
  keywords:
    'hire driver Delhi NCR, on demand driver Delhi, verified driver Gurgaon, personal driver Noida, monthly driver hire, outstation driver Delhi, hourly driver service',
  alternates: {
    canonical: 'https://scandriver.in',
  },
  openGraph: {
    title: 'ScanDriver – Your Driver One Scan Away | Delhi NCR',
    description:
      "Verified. Professional. On-Demand. Delhi NCR's most trusted driver platform. Book via WhatsApp in 2 minutes.",
    url: 'https://scandriver.in',
    siteName: 'ScanDriver',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScanDriver – Your Driver One Scan Away | Delhi NCR',
    description:
      "Verified. Professional. On-Demand. Delhi NCR's most trusted driver platform.",
  },
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* ─── Stylish Background Layer ─── */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        {/* Dark Theme Base & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#0d0e12] to-[#070908] dark:block hidden" />

        {/* Dark Mode Glowing Orbs */}
        <div className="absolute top-[8%] left-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-[130px] animate-float dark:block hidden" />
        <div className="absolute top-[25%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-emerald-500/8 to-transparent blur-[120px] animate-float-delay-2 dark:block hidden" />
        <div className="absolute top-[48%] left-[10%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-primary/8 to-transparent blur-[140px] animate-float-delay-1 dark:block hidden" />
        <div className="absolute top-[68%] right-[-5%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-emerald-600/6 to-transparent blur-[150px] animate-float-delay-3 dark:block hidden" />
        <div className="absolute bottom-[5%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-primary/9 to-transparent blur-[130px] animate-float dark:block hidden" />

        {/* Light Theme Base & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff] via-[#faf8f4] to-[#f4f8f6] dark:hidden block" />

        {/* Light Mode Glowing Orbs */}
        <div className="absolute top-[8%] left-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-[130px] animate-float dark:hidden block" />
        <div className="absolute top-[25%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-emerald-500/4 to-transparent blur-[120px] animate-float-delay-2 dark:hidden block" />
        <div className="absolute top-[48%] left-[10%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-primary/4 to-transparent blur-[140px] animate-float-delay-1 dark:hidden block" />
        <div className="absolute top-[68%] right-[-5%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-emerald-600/3 to-transparent blur-[150px] animate-float-delay-3 dark:hidden block" />
        <div className="absolute bottom-[5%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-primary/4.5 to-transparent blur-[130px] animate-float dark:hidden block" />

        {/* Blueprint Dotted Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(201,146,42,0.08)_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-100" />

        {/* Coordinate Grid Check Line Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025] dark:opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonal-grid-enhanced" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
              <line x1="0" y1="0" x2="0" y2="120" stroke="currentColor" strokeWidth="1" className="text-primary" />
              <line x1="0" y1="0" x2="120" y2="0" stroke="currentColor" strokeWidth="1" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-grid-enhanced)" />
        </svg>

        {/* Elegant Fluid Vector Wave Lines */}
        <svg className="absolute inset-x-0 top-[10%] w-full h-[600px] opacity-[0.03] dark:opacity-[0.07] text-primary" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 150 C 350 400, 700 100, 1050 350 C 1200 450, 1350 480, 1440 450" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 0 180 C 320 420, 680 140, 1020 380 C 1180 470, 1330 490, 1440 470" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 6" />
        </svg>

        <svg className="absolute inset-x-0 top-[45%] w-full h-[600px] opacity-[0.02] dark:opacity-[0.05] text-emerald-500" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 1440 100 C 1090 350, 740 50, 390 300 C 240 400, 90 430, 0 400" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 1440 130 C 1060 370, 710 90, 360 330 C 210 420, 70 440, 0 420" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="relative z-10 page-stylish-bg flex flex-col min-h-screen">
        {/* Structured Data for SEO — rendered server-side */}
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
        <FAQJsonLd />
        <ServiceJsonLd />

        <Navbar />
        <main className="flex-grow">
          <HeroSection />
          <CustomerEnquirySection />
          <AboutUsSection />
          <MarqueeStrip />
          <ServicesSection />
          <HowItWorksSection />
          <WhyUsSection />
          <TestimonialsSection />
          <WhatsAppFirstSection />
          <DriverJoinSection />
          <ContactStripSection />
          <TermsSection />
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    </div>
  )
}
