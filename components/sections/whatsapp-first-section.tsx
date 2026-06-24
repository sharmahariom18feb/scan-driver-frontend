import { Reveal } from '@/components/common/reveal'
import { SectionLabel } from '@/components/common/section-label'
import { CTAButton } from '@/components/common/cta-button'
import { Smartphone, Zap, ShieldCheck } from 'lucide-react'

export function WhatsAppFirstSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-[1160px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <Reveal>
            <div>
              <SectionLabel>How Booking Works</SectionLabel>
              <h2 className="font-display text-[clamp(30px,4vw,50px)] font-bold text-foreground leading-tight mb-4">
                WhatsApp-First<br />
                <em className="italic text-gold-light">Booking System</em>
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-9">
                No app downloads. No long forms. No waiting. Book, track, and communicate with your driver entirely through WhatsApp — in under 2 minutes.
              </p>
              <CTAButton
                href="/booking"
                variant="gold"
              >
                Book Now
              </CTAButton>
            </div>
          </Reveal>

          {/* WhatsApp Phone Mockup */}
          <Reveal delay={0.2}>
            <div className="bg-[#111b21] rounded-3xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
              {/* Header */}
              <div className="bg-[#1f2c33] px-5 py-4 flex items-center gap-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center font-extrabold text-[13px] text-black shrink-0">
                  SD
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-[#e9edef]">ScanDriver</div>
                  <div className="text-xs text-[#8696a0] mt-0.5">
                    <span className="text-wa-green">●</span> Online · Typically replies instantly
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="p-5 flex flex-col gap-3.5 bg-[#0b141a]">
                {/* User Message */}
                <div className="flex flex-col items-start">
                  <div className="max-w-[82%] px-3.5 py-2.5 rounded-lg rounded-tl-sm bg-[#202c33] text-[13px] text-[#e9edef] leading-relaxed">
                    Hi! I need a driver for tomorrow 9am from Gurgaon Sector 50.
                  </div>
                  <div className="text-[10px] text-[#8696a0] mt-1 px-1">10:32 AM ✓✓</div>
                </div>

                {/* ScanDriver Reply */}
                <div className="flex flex-col items-end">
                  <div className="max-w-[82%] px-3.5 py-2.5 rounded-lg rounded-tr-sm bg-[#005c4b] text-[13px] text-[#e9edef] leading-relaxed">
                    👋 Hello! We have verified drivers available tomorrow morning.<br /><br />
                    Please share:<br />
                    📍 Pickup location<br />
                    🕘 Exact time<br />
                    🗓️ Duration needed
                  </div>
                  <div className="text-[10px] text-[#8696a0] mt-1 px-1">10:32 AM ✓✓</div>
                </div>

                {/* User Message */}
                <div className="flex flex-col items-start">
                  <div className="max-w-[82%] px-3.5 py-2.5 rounded-lg rounded-tl-sm bg-[#202c33] text-[13px] text-[#e9edef] leading-relaxed">
                    Sector 50, 9am, need for full day (8 hours)
                  </div>
                  <div className="text-[10px] text-[#8696a0] mt-1 px-1">10:33 AM ✓✓</div>
                </div>

                {/* ScanDriver Confirmation */}
                <div className="flex flex-col items-end">
                  <div className="max-w-[82%] px-3.5 py-2.5 rounded-lg rounded-tr-sm bg-[#005c4b] text-[13px] text-[#e9edef] leading-relaxed">
                    ✅ Confirmed! Your verified driver <strong>Ramesh K.</strong> will arrive at 9:00 AM sharp.<br /><br />
                    📋 Driver ID shared. 8-hour rate: ₹1,200.<br />
                    No app needed — we handle everything here.
                  </div>
                  <div className="text-[10px] text-[#8696a0] mt-1 px-1">10:33 AM ✓✓</div>
                </div>
              </div>

              {/* Features Row */}
              <div className="flex gap-2 px-4 py-3.5 bg-[#1f2c33] border-t border-white/5 flex-wrap">
                <div className="bg-wa-green/10 border border-wa-green/25 rounded-full px-3 py-1.5 text-[11px] font-semibold text-wa-green flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>No App</span>
                </div>
                <div className="bg-wa-green/10 border border-wa-green/25 rounded-full px-3 py-1.5 text-[11px] font-semibold text-wa-green flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>&lt;2 Min Reply</span>
                </div>
                <div className="bg-wa-green/10 border border-wa-green/25 rounded-full px-3 py-1.5 text-[11px] font-semibold text-wa-green flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
