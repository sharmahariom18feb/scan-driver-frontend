'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X, MessageCircle } from 'lucide-react'
import { WHATSAPP_CUSTOMER, getWhatsAppLink } from '@/constants'
import { WhatsAppIcon } from '@/components/common/icons'

export function FloatingWhatsApp() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  // Strictly exclude Driver App and Admin portal (both by pathname and by subdomain)
  const isExcluded =
    Boolean(
      pathname?.startsWith('/admin') ||
      pathname?.startsWith('/driver-app') ||
      (typeof window !== 'undefined' &&
        (window.location.hostname.includes('admin.') ||
          window.location.hostname.includes('partner.') ||
          window.location.pathname.startsWith('/admin') ||
          window.location.pathname.startsWith('/driver-app')))
    )


  useEffect(() => {
    if (isExcluded) return

    // 1. Auto open floating widget on first time landing on the website after a brief delay
    const seen = sessionStorage.getItem('scandriver_welcome_popup_seen')
    if (!seen) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        setHasOpenedOnce(true)
        sessionStorage.setItem('scandriver_welcome_popup_seen', 'true')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isExcluded])

  useEffect(() => {
    if (isExcluded) return

    // 2. Exit Intent: Trigger center popup when user moves mouse to leave window
    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse left through top edge of the window
      if (e.clientY <= 10 && !e.relatedTarget) {
        const exitSeen = sessionStorage.getItem('scandriver_exit_intent_shown')
        if (!exitSeen) {
          setShowExitModal(true)
          sessionStorage.setItem('scandriver_exit_intent_shown', 'true')
        }
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowExitModal(false)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExcluded])

  if (isExcluded) {
    return null
  }

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
    if (!hasOpenedOnce) {
      setHasOpenedOnce(true)
      sessionStorage.setItem('scandriver_welcome_popup_seen', 'true')
    }
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
  }

  const handleCloseExitModal = () => {
    setShowExitModal(false)
  }

  const whatsappUrl = getWhatsAppLink(
    WHATSAPP_CUSTOMER,
    'Hi ScanDriver! I want to book a driver. Can you help me with details?'
  )

  const exitWhatsappUrl = getWhatsAppLink(
    WHATSAPP_CUSTOMER,
    'Hi ScanDriver! I was on your website and want to book a driver. Can you share the best quote?'
  )

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[850] flex flex-col items-end gap-3 select-none">
      {/* ─── Popup Card ─── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="WhatsApp Support Chat"
          className="w-[320px] max-w-[calc(100vw-40px)] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.25)] border border-border/20 bg-white dark:bg-zinc-900 transition-all duration-300 animate-in slide-in-from-bottom-6 fade-in"
        >
          {/* Header */}
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              {/* Support Avatar */}
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#25D366] shadow-sm">
                  <MessageCircle size={22} className="fill-[#25D366] text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-300 border-2 border-[#25D366]" />
              </div>

              <div>
                <h4 className="font-bold text-base leading-tight text-white">
                  ScanDriver Support
                </h4>
                <p className="text-[11px] text-white/95 flex items-center gap-1.5 mt-0.5 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
                  Typically replies instantly
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-1 rounded-full text-white/85 hover:text-white hover:bg-black/10 transition-colors cursor-pointer"
              aria-label="Close popup"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-3.5 bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-100">
            <p className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>👋</span> Hi there!
            </p>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Have questions about One Way, Round Trip, Outstation, or Monthly driver hire?
            </p>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Chat with our team directly on WhatsApp for instant bookings and queries.
            </p>

            {/* Big WhatsApp CTA Button */}
            <div className="pt-1.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(37,211,102,0.35)] transition-all duration-200 cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5 text-white" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── Floating Trigger Button ─── */}
      <div className="relative">
        {/* Pulsating badge if closed and not yet interacted */}
        {!isOpen && !hasOpenedOnce && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-[9px] font-extrabold items-center justify-center">
              1
            </span>
          </span>
        )}

        <button
          onClick={handleToggle}
          className="w-[58px] h-[58px] rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-[0_6px_24px_rgba(37,211,102,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label={isOpen ? 'Close WhatsApp Chat' : 'Open WhatsApp Chat'}
        >
          {isOpen ? (
            <X size={26} className="text-white animate-in zoom-in-75 duration-200" />
          ) : (
            <WhatsAppIcon className="w-7 h-7 text-white" />
          )}
        </button>
      </div>

      {/* ─── Exit-Intent Center Screen Modal ─── */}
      {showExitModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Before you leave"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleCloseExitModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-border/20 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
          >
            {/* Header with WhatsApp Gradient */}
            <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white pt-7 pb-6 px-6 text-center relative">
              <button
                onClick={handleCloseExitModal}
                className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-black/15 rounded-full transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 rounded-full bg-white text-[#25D366] flex items-center justify-center mx-auto mb-3 shadow-md">
                <span className="text-3xl select-none">🚗</span>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight">
                Wait! Before You Leave…
              </h3>
              <p className="text-xs text-white/90 mt-1 font-medium max-w-[280px] mx-auto leading-relaxed">
                Need a trusted, police-verified driver in Delhi NCR? Let us help you right now!
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-center">
              {/* Feature Pills */}
              <div className="grid grid-cols-2 gap-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2 bg-surface2/60 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-border/10">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Verified Drivers</span>
                </div>
                <div className="flex items-center gap-2 bg-surface2/60 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-border/10">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Instant Quotes</span>
                </div>
                <div className="flex items-center gap-2 bg-surface2/60 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-border/10">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>One Way & Outstation</span>
                </div>
                <div className="flex items-center gap-2 bg-surface2/60 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-border/10">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Monthly Packages</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal pt-1">
                Chat with our booking manager directly on WhatsApp. Get a driver assigned in minutes!
              </p>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <a
                  href={exitWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCloseExitModal}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-black text-base flex items-center justify-center gap-2.5 shadow-[0_6px_20px_rgba(37,211,102,0.4)] transition-all duration-200 cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                  <span>Chat on WhatsApp Now</span>
                </a>

                <button
                  onClick={handleCloseExitModal}
                  className="w-full py-2 text-xs text-text-muted hover:text-foreground font-semibold cursor-pointer transition-colors"
                >
                  No thanks, continue browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

