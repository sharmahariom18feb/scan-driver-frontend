'use client'

import React, { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIosModal, setShowIosModal] = useState(false)

  useEffect(() => {
    // 1. Safety check for SSR
    if (typeof window === 'undefined') return

    // 2. Check if already installed / running in standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true

    if (isStandalone) {
      return
    }

    // 3. Check if dismissed previously
    const isDismissed = localStorage.getItem('sd_pwa_dismissed') === 'true'
    if (isDismissed) {
      return
    }

    // 4. Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(ios)

    // On iOS, beforeinstallprompt does not fire, so we auto-show our manual install banner.
    if (ios) {
      setShowBanner(true)
    }

    // 5. Listen for beforeinstallprompt event (Android, Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosModal(true)
      return
    }

    if (!deferredPrompt) return

    // Trigger the native installation prompt
    deferredPrompt.prompt()

    // Await user's action
    const { outcome } = await deferredPrompt.userChoice
    console.log(`PWA install prompt outcome: ${outcome}`)

    // Clean up
    setDeferredPrompt(null)
    setShowBanner(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('sd_pwa_dismissed', 'true')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <>
      {/* Installation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-black border-b border-gold-light/20 px-4 py-3 flex items-center justify-between text-white relative z-50 animate-fade-in shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-gold to-amber-500 flex items-center justify-center text-black shadow-md border border-gold-light/30">
            <Download size={18} className="animate-bounce" />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-wide text-gold-light uppercase">
              Install App
            </h4>
            <p className="text-[11px] text-slate-300">
              For a better experience & fast offline access!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold text-xs rounded-md shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* iOS Manual Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="w-full sm:max-w-xs bg-slate-900 border border-gold-light/20 rounded-2xl p-5 shadow-2xl text-center space-y-4 animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-gold-light uppercase tracking-wider">
                Install on iOS
              </h3>
              <button
                onClick={() => setShowIosModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-left text-xs text-slate-300">
              <p>Follow these quick steps to install the app on your iPhone or iPad:</p>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-gold-light shrink-0">
                  1
                </div>
                <p className="pt-0.5 leading-relaxed">
                  Tap the <strong className="text-white inline-flex items-center gap-1">Share <Share size={12} className="inline text-sky-400" /></strong> button in Safari's bottom toolbar.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-gold-light shrink-0">
                  2
                </div>
                <p className="pt-0.5 leading-relaxed">
                  Scroll down the share sheet options and select <strong className="text-white">Add to Home Screen</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-gold-light shrink-0">
                  3
                </div>
                <p className="pt-0.5 leading-relaxed">
                  Confirm by clicking <strong className="text-gold-light">Add</strong> at the top right corner.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="w-full py-2 bg-primary hover:bg-primary/95 text-black font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all text-xs cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
