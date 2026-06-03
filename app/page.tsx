"use client"
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

export default function HomePage() {
  return (
    <>
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
