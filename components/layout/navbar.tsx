'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, Phone, Menu, X } from 'lucide-react'
import { CTAButton } from '@/components/common/cta-button'
import { WhatsAppIcon } from '@/components/common/icons'
import { WHATSAPP_CUSTOMER, getWhatsAppLink } from '@/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import logoSd from '../../public/icons/logo-sd.png';

const navLinks = [
  { href: '#services', label: 'Services' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#why-us', label: 'Why Us' },
  { href: '#join-driver', label: 'Join as Driver' },
  { href: '#terms', label: 'Terms' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-[900] transition-all duration-400',
          scrolled && 'bg-background/92 backdrop-blur-lg py-3 border-b border-border'
        )}
      >
        <div className="w-full  px-20">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="#" className="flex items-center gap-2.5 no-underline">
              <Image loading='eager' src={logoSd} alt="logo" width={140} style={{ height: 'auto' }} />
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden lg:flex items-center gap-8 list-none">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-[13px] font-medium tracking-wide hover:text-gold-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-full border border-border text-muted-foreground hover:text-gold-light hover:border-gold transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}
              <a
                href="tel:+919717498198"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground text-[13px] font-medium hover:border-gold hover:text-gold transition-colors"
              >
                <Phone size={14} /> Call Us
              </a>
              <CTAButton
                href={getWhatsAppLink(WHATSAPP_CUSTOMER, 'Hi ScanDriver! I want to book a driver.')}
                variant="whatsapp"
                external
                className="!px-5 !py-2.5 !text-[13px]"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Book on WhatsApp
              </CTAButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="flex lg:hidden flex-col gap-1.5 p-2"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <span className="block w-5 h-0.5 bg-foreground rounded" />
              <span className="block w-5 h-0.5 bg-foreground rounded" />
              <span className="block w-5 h-0.5 bg-foreground rounded" />
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[950] bg-background/97 flex flex-col items-center justify-center gap-8 transition-opacity duration-300',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <button
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <X size={28} />
        </button>

        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-display text-2xl font-semibold text-foreground hover:text-gold-light transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        {mounted && (
          <button
            onClick={() => {
              toggleTheme()
              setMobileMenuOpen(false)
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-gold-light"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        )}

        <CTAButton
          href={getWhatsAppLink(WHATSAPP_CUSTOMER, 'Hi ScanDriver! I want to book a driver.')}
          variant="whatsapp"
          external
          className="mt-4"
        >
          <WhatsAppIcon />
          Book Now on WhatsApp
        </CTAButton>
      </div>
    </>
  )
}
