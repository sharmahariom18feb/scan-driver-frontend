import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FloatingWhatsApp } from '@/components/layout/floating-whatsapp'
import { HeroSection } from '@/components/sections/hero-section'
import { MarqueeStrip } from '@/components/sections/marquee-strip'
import { ServicesSection } from '@/components/sections/services-section'
import { HowItWorksSection } from '@/components/sections/how-it-works-section'
import { WhyUsSection } from '@/components/sections/why-us-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { WhatsAppFirstSection } from '@/components/sections/whatsapp-first-section'
import { DriverJoinSection } from '@/components/sections/driver-join-section'
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
    <>
      {/* Structured Data for SEO — rendered server-side */}
      <OrganizationJsonLd />
      <LocalBusinessJsonLd />
      <FAQJsonLd />
      <ServiceJsonLd />

      <Navbar />
      <main>
        <HeroSection />
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
    </>
  )
}
