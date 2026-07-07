'use client'

import { Reveal } from '@/components/common/reveal'
import { SectionLabel } from '@/components/common/section-label'
import { CTAButton } from '@/components/common/cta-button'
import { 
  ShieldCheck, 
  Users, 
  Zap, 
  Eye, 
  Heart, 
  Target, 
  Compass, 
  Shield, 
  Sparkles, 
  UserCheck, 
  HandHeart,
  TrendingUp,
  FileCheck2,
  Lightbulb,
  Handshake
} from 'lucide-react'

export function AboutUsSection() {
  const differentiators = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-gold" />,
      title: 'Verified Professionals',
      description: 'Every driver is carefully screened before joining our platform, giving customers complete peace of mind.',
    },
    {
      icon: <Users className="w-6 h-6 text-gold" />,
      title: 'Experienced Network',
      description: 'We work with skilled drivers who understand city routes, highway driving, corporate etiquette, and customer service.',
    },
    {
      icon: <Zap className="w-6 h-6 text-gold" />,
      title: 'Fast Response',
      description: 'Our team helps customers connect with available drivers in minutes through a simple WhatsApp-based booking process.',
    },
    {
      icon: <Eye className="w-6 h-6 text-gold" />,
      title: 'Transparent Service',
      description: 'No hidden procedures or complicated booking systems—just straightforward, dependable driver solutions.',
    },
    {
      icon: <Heart className="w-6 h-6 text-gold" />,
      title: 'Customer-First Approach',
      description: 'From families and working professionals to corporate clients and event organizers, we focus on delivering punctual, safe, and hassle-free experiences.',
    },
  ]

  const services = [
    'Hourly Driver Services',
    'Daily Driver Services',
    'Weekly & Monthly Driver Hiring',
    'School Pickup & Drop Driver Services',
    'Corporate Driver Solutions',
    'Airport Pickup & Drop Drivers',
    'Outstation Drivers',
    'Event & Wedding Chauffeurs',
  ]

  const values = [
    {
      letter: 'S',
      title: 'Safety',
      description: 'Our top priority. Ensuring multi-layer driver verification and secure rides for complete peace of mind.',
      icon: <Shield className="w-5 h-5 text-gold-light" />,
    },
    {
      letter: 'C',
      title: 'Care',
      description: 'Empathy toward both drivers and customers, cultivating a supportive, respectful community.',
      icon: <HandHeart className="w-5 h-5 text-gold-light" />,
    },
    {
      letter: 'A',
      title: 'Accountability',
      description: 'Owning our service quality, maintaining complete transparency, and standing by our bookings.',
      icon: <FileCheck2 className="w-5 h-5 text-gold-light" />,
    },
    {
      letter: 'N',
      title: 'Never Settle',
      description: 'Always refining our network, optimizing booking speed, and exceeding passenger expectations.',
      icon: <TrendingUp className="w-5 h-5 text-gold-light" />,
    },
  ]

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="about-us">
      {/* Visual background accents to match page styling */}
      <div className="absolute top-[15%] left-[-8%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-gold/10 to-transparent blur-[120px] animate-float pointer-events-none" />
      <div className="absolute bottom-[15%] right-[-8%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-emerald-500/6 to-transparent blur-[130px] animate-float-delay-2 pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-6 relative z-10">
        
        {/* ─── Header ─── */}
        <div className="text-center mb-16">
          <Reveal>
            <SectionLabel>About ScanDriver</SectionLabel>
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-bold text-foreground leading-tight">
              Your Trusted Driver Partner<br />
              in <em className="italic text-gold-light">Delhi NCR</em>
            </h2>
          </Reveal>
        </div>

        {/* ─── Core Concept / Intro Paragraphs ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-20">
          <Reveal delay={0.1}>
            <div className="bg-surface border border-border/80 rounded-[18px] p-8 md:p-10 h-full flex flex-col justify-center">
              <h3 className="text-xl font-bold text-foreground mb-4">Our Core Philosophy</h3>
              <p className="text-muted-foreground text-[16px] leading-relaxed">
                At ScanDriver, we believe that finding a professional and reliable driver should be simple, fast, and stress-free. We connect individuals, families, and businesses with thoroughly verified, experienced drivers for hourly, daily, monthly, corporate, airport, and outstation requirements.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="bg-surface border border-border/80 rounded-[18px] p-8 md:p-10 h-full flex flex-col justify-center">
              <h3 className="text-xl font-bold text-foreground mb-4">Uncompromised Safety</h3>
              <p className="text-muted-foreground text-[16px] leading-relaxed">
                Every driver in our network goes through a multi-step verification process, including identity verification, driving licence validation, background checks, and reference screening. This ensures that every ride is backed by professionalism, safety, and accountability.
              </p>
            </div>
          </Reveal>
        </div>

        {/* ─── Why We Started & Driven by Trust ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden group rounded-[20px] bg-gradient-to-br from-surface to-card border border-border p-8 lg:p-10 hover:border-gold/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-colors duration-300" />
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                  <Lightbulb className="w-4.5 h-4.5" />
                </span>
                Why We Started
              </h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-4">
                Modern urban life moves quickly, but hiring a trustworthy driver often remains complicated and time-consuming. ScanDriver was created to simplify this process through a WhatsApp-first booking experience that eliminates unnecessary apps, lengthy paperwork, and endless phone calls.
              </p>
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                Whether you need a driver for a few hours, a weekend trip, daily office commute, or long-term personal assistance, we make the process quick and reliable.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="relative overflow-hidden group rounded-[20px] bg-gradient-to-br from-surface to-card border border-border p-8 lg:p-10 hover:border-gold/30 transition-all duration-300 h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-300" />
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Handshake className="w-4.5 h-4.5" />
                  </span>
                  Driven by Trust
                </h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
                  With a growing network of verified drivers and satisfied customers across Delhi NCR, ScanDriver continues to set new standards for reliability, professionalism, and customer support. We are committed to making every journey safer, smoother, and more comfortable—because the right driver can make all the difference.
                </p>
              </div>
              <div>
                <CTAButton href="/booking" variant="gold" className="w-full sm:w-auto text-center justify-center">
                  Book a Driver Now
                </CTAButton>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ─── Mission & Vision ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <Reveal delay={0.1}>
            <div className="bg-gradient-to-br from-gold/8 to-transparent border border-gold/20 rounded-[20px] p-8 md:p-10 relative overflow-hidden group hover:border-gold/40 transition-colors duration-300">
              <div className="absolute -bottom-8 -right-8 text-gold/5 group-hover:text-gold/10 transition-colors duration-300">
                <Target className="w-40 h-40" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Target className="w-6 h-6 text-gold-light" />
                Our Mission
              </h3>
              <p className="text-[16px] text-muted-foreground leading-relaxed relative z-10">
                To become India&apos;s most trusted driver aggregation platform by delivering safe, verified, and technology-enabled driver services while creating flexible earning opportunities for professional drivers.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 rounded-[20px] p-8 md:p-10 relative overflow-hidden group hover:border-emerald-500/25 transition-colors duration-300">
              <div className="absolute -bottom-8 -right-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors duration-300">
                <Compass className="w-40 h-40" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Compass className="w-6 h-6 text-emerald-400" />
                Our Vision
              </h3>
              <p className="text-[16px] text-muted-foreground leading-relaxed relative z-10">
                To redefine on-demand driver hiring through trust, transparency, and convenience, making professional driving services accessible to every household and business.
              </p>
            </div>
          </Reveal>
        </div>

        {/* ─── What Makes Us Different ─── */}
        <div className="mb-20">
          <Reveal>
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">What Makes Us Different</h3>
              <p className="text-muted-foreground text-sm max-w-[500px] mx-auto">
                Discover the safety protocols, response times, and customer-first focus that set ScanDriver apart.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentiators.map((diff, index) => (
              <Reveal key={diff.title} delay={0.05 * index} className={index === 4 ? 'md:col-span-2 lg:col-span-1' : ''}>
                <div className="h-full bg-surface border border-border/80 rounded-[16px] p-6 hover:border-gold/45 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors duration-300">
                      {diff.icon}
                    </div>
                    <h4 className="text-[17px] font-semibold text-foreground mb-2">{diff.title}</h4>
                    <p className="text-[14px] text-muted-foreground leading-relaxed">{diff.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── Our Values (S.C.A.N.) ─── */}
        <div className="mb-20">
          <Reveal>
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Our Core Values</h3>
              <p className="text-muted-foreground text-sm max-w-[450px] mx-auto">
                Our actions are guided by a simple acronym representing our promise.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, index) => (
              <Reveal key={val.title} delay={0.1 * index}>
                <div className="relative overflow-hidden h-full bg-surface border border-border/80 rounded-[16px] p-6 hover:border-gold/40 transition-all duration-300 group">
                  <div className="absolute top-2 right-4 text-[76px] font-[900] text-gold/5 group-hover:text-gold/10 select-none pointer-events-none transition-colors duration-300 font-display">
                    {val.letter}
                  </div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4 text-gold-light group-hover:bg-gold/20 transition-colors duration-300">
                      {val.icon}
                    </div>
                    <h4 className="text-[18px] font-bold text-foreground mb-2 flex items-center gap-1.5">
                      <span className="text-gold-light">{val.letter}</span> — {val.title}
                    </h4>
                    <p className="text-[13.5px] text-muted-foreground leading-relaxed">{val.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── Services Tag Strip ─── */}
        <Reveal>
          <div className="bg-surface border border-border/80 rounded-[20px] p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/5 opacity-40" />
            <h3 className="text-lg font-bold text-foreground mb-5 relative z-10">Comprehensive Solutions We Provide</h3>
            <div className="flex flex-wrap justify-center gap-2.5 relative z-10">
              {services.map((service) => (
                <span 
                  key={service} 
                  className="bg-card border border-border/80 rounded-full px-4 py-1.5 text-[13px] font-medium text-foreground hover:border-gold hover:text-gold-light transition-all duration-300 cursor-default"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
