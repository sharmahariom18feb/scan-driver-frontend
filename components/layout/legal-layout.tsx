'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FloatingWhatsApp } from '@/components/layout/floating-whatsapp'
import { Shield, ChevronRight, Mail, MessageCircle, FileText, ArrowUp } from 'lucide-react'
import { EMAIL, WHATSAPP_CUSTOMER } from '@/constants'
import { cn } from '@/lib/utils'

export interface LegalSection {
  id: string
  title: string
}

interface LegalLayoutProps {
  title: string
  subtitle: string
  lastUpdated: string
  icon?: React.ReactNode
  sections: LegalSection[]
  children: React.ReactNode
}

export function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  icon,
  sections,
  children,
}: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '')
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)

      const scrollPosition = window.scrollY + 200
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const top = element.offsetTop
          const height = element.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -120
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
      setActiveSection(id)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#0d0e12] to-[#070908] dark:block hidden" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff] via-[#faf8f4] to-[#f4f8f6] dark:hidden block" />
        <div className="absolute top-[5%] left-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-[130px] dark:block hidden" />
        <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-emerald-500/8 to-transparent blur-[120px] dark:block hidden" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(201,146,42,0.08)_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-100" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow pt-32 pb-24">
          {/* Hero Header */}
          <div className="border-b border-border/60 bg-card/40 backdrop-blur-md py-12 mb-12">
            <div className="max-w-[1160px] mx-auto px-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                <Link href="/" className="hover:text-gold-light transition-colors">
                  Home
                </Link>
                <ChevronRight size={12} />
                <span className="text-foreground font-medium">{title}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold-light text-xs font-semibold uppercase tracking-wider mb-4">
                    {icon || <Shield size={14} />}
                    <span>ScanDriver Official Legal Document</span>
                  </div>
                  <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight">
                    {title}
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl">
                    {subtitle}
                  </p>
                </div>

                <div className="shrink-0 bg-background/80 border border-border p-4 rounded-xl text-right md:text-left self-start">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold mb-1">
                    Last Updated
                  </span>
                  <span className="text-sm font-bold text-gold-light">{lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Document Content */}
          <div className="max-w-[1160px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Table of Contents Sidebar */}
              <aside className="lg:col-span-4 hidden lg:block">
                <div className="sticky top-32 bg-card/70 backdrop-blur-md border border-border rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border text-foreground font-bold text-base">
                    <FileText size={18} className="text-gold-light" />
                    <span>Table of Contents</span>
                  </div>
                  <nav className="flex flex-col gap-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
                    {sections.map((sec) => {
                      const isActive = activeSection === sec.id
                      return (
                        <button
                          key={sec.id}
                          onClick={() => scrollToSection(sec.id)}
                          className={cn(
                            'text-left text-xs py-2 px-3 rounded-lg transition-all leading-snug font-medium flex items-center justify-between group',
                            isActive
                              ? 'bg-gold/15 text-gold-light font-semibold border-l-2 border-gold'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                        >
                          <span className="line-clamp-1">{sec.title}</span>
                          <ChevronRight
                            size={12}
                            className={cn(
                              'shrink-0 transition-transform duration-200',
                              isActive
                                ? 'text-gold-light translate-x-0.5'
                                : 'opacity-0 group-hover:opacity-100'
                            )}
                          />
                        </button>
                      )
                    })}
                  </nav>

                  {/* Help Card */}
                  <div className="mt-6 pt-5 border-t border-border bg-background/60 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-foreground mb-1">Have Legal Questions?</h4>
                    <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">
                      Reach out directly to our dedicated legal & support team.
                    </p>
                    <div className="flex flex-col gap-2 text-xs">
                      <a
                        href={`mailto:${EMAIL}`}
                        className="flex items-center gap-2 text-gold-light hover:underline font-medium"
                      >
                        <Mail size={13} /> {EMAIL}
                      </a>
                      <a
                        href={`https://wa.me/${WHATSAPP_CUSTOMER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-emerald-500 hover:underline font-medium"
                      >
                        <MessageCircle size={13} /> WhatsApp Support
                      </a>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="lg:col-span-8">
                {/* Mobile Quick Nav Dropdown */}
                <div className="lg:hidden mb-8 bg-card border border-border p-4 rounded-xl">
                  <label htmlFor="mobile-toc" className="text-xs font-bold text-foreground block mb-2">
                    Jump to Section
                  </label>
                  <select
                    id="mobile-toc"
                    value={activeSection}
                    onChange={(e) => scrollToSection(e.target.value)}
                    className="w-full bg-background border border-border text-foreground text-sm rounded-lg p-2.5 outline-none focus:border-gold"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-8">{children}</div>

                {/* Bottom Contact Box */}
                <div className="mt-16 bg-card border border-border/80 rounded-2xl p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    Questions regarding our policies?
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
                    Our team is available 24/7 to clarify any questions regarding ScanDriver services, terms, or customer safety policies.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <a
                      href={`mailto:${EMAIL}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-background hover:border-gold hover:text-gold transition-colors text-sm font-semibold text-foreground"
                    >
                      <Mail size={16} /> Email Legal Support
                    </a>
                    <a
                      href={`https://wa.me/${WHATSAPP_CUSTOMER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-sm font-semibold shadow-lg shadow-emerald-900/20"
                    >
                      <MessageCircle size={16} /> WhatsApp Customer Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Back to top button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 z-50 p-3 rounded-full bg-card/90 border border-gold/40 text-gold-light hover:bg-gold hover:text-black transition-all shadow-xl backdrop-blur-md"
            aria-label="Back to top"
          >
            <ArrowUp size={18} />
          </button>
        )}

        <Footer />
        <FloatingWhatsApp />
      </div>
    </div>
  )
}
