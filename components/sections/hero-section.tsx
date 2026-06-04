import { Reveal } from '@/components/common/reveal'
import { CTAButton } from '@/components/common/cta-button'
import { WhatsAppIcon } from '@/components/common/icons'
import { WHATSAPP_CUSTOMER, getWhatsAppLink } from '@/constants'

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden pt-[120px] pb-20" id="home">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_50%,rgba(201,146,42,0.08)_0%,transparent_70%),radial-gradient(ellipse_50%_80%_at_10%_80%,rgba(201,146,42,0.05)_0%,transparent_60%),linear-gradient(160deg,#0d0d0d_0%,#080808_100%)] dark:block hidden" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_50%,rgba(201,146,42,0.05)_0%,transparent_70%),radial-gradient(ellipse_50%_80%_at_10%_80%,rgba(201,146,42,0.03)_0%,transparent_60%),linear-gradient(160deg,#fafafa_0%,#ffffff_100%)] dark:hidden" />

      {/* Grid Lines */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(201,146,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(201,146,42,0.04)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black_0%,transparent_100%)]" />

      <div className="w-[1160px] flex align-middle justify-center px-6 relative z-10">
        <div className="w-[700px]">
          {/* Badge */}
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-full px-4 py-1.5 text-xs font-medium text-gold-light mb-7">
              <span className="w-2 h-2 rounded-full bg-gold-light animate-pulse-dot" />
              Now serving across Delhi NCR
            </div>
          </Reveal>

          {/* Heading */}
          <Reveal delay={0.1}>
            <h1 className=" text-[clamp(44px,6vw,76px)] font-[1000] leading-[1.08] text-foreground mb-6">
              Your Driver,
              <em className="block italic text-gold-light">One Scan Away.</em>
            </h1>
          </Reveal>

          {/* Subtext */}
          <Reveal delay={0.2}>
            <p className="text-base md:text-[17px] text-muted-foreground max-w-[480px] leading-relaxed font-light mb-10">
              Verified, background-checked, and professionally trained drivers — available hourly, weekly, or monthly. No app needed. Just WhatsApp.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.3}>
            <div className="flex gap-3.5 flex-wrap">
              <CTAButton
                href={getWhatsAppLink(WHATSAPP_CUSTOMER, 'Hi ScanDriver! I want to book a driver.')}
                variant="whatsapp"
                external
              >
                <WhatsAppIcon />
                Book a Driver Now
              </CTAButton>
              <CTAButton href="#services" variant="outline">
                Explore Services ↓
              </CTAButton>
            </div>
          </Reveal>

          {/* Trust Items */}
          <Reveal delay={0.4}>
            <div className="flex items-center gap-6 mt-12 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center text-[13px]">✓</div>
                Background Verified, 2 Refs
              </div>
              <div className="w-px h-5 bg-border hidden sm:block" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center text-[13px]">🔒</div>
                100% Safe
              </div>
              <div className="w-px h-5 bg-border hidden sm:block" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center text-[13px]">⚡</div>
                24/7 Available
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Floating Cards */}
      <div className="hidden xl:flex flex-col gap-4 absolute right-12 top-1/2 -translate-y-1/2 z-10">
        <div className="bg-surface/94 backdrop-blur-lg border border-border rounded-2xl p-[18px_24px] min-w-[180px] animate-float-delay-1">
          <div className="text-[10px] text-muted-foreground font-medium tracking-[0.08em] uppercase">Our Drivers</div>
          <div className="text-[22px] font-bold text-gold-light leading-tight">500+</div>
          <div className="text-[11px] text-muted-foreground">Verified & Active</div>
        </div>
        <div className="bg-surface/94 backdrop-blur-lg border border-border rounded-2xl p-[18px_24px] min-w-[180px] animate-float-delay-2">
          <div className="text-[10px] text-muted-foreground font-medium tracking-[0.08em] uppercase">Response Time</div>
          <div className="text-[22px] font-bold text-gold-light leading-tight">&lt; 2 min</div>
          <div className="text-[11px] text-muted-foreground">WhatsApp reply</div>
        </div>
        <div className="bg-surface/94 backdrop-blur-lg border border-border rounded-2xl p-[18px_24px] min-w-[180px] animate-float-delay-3">
          <div className="text-[10px] text-muted-foreground font-medium tracking-[0.08em] uppercase">Happy Customers</div>
          <div className="text-[22px] font-bold text-gold-light leading-tight">1,000+</div>
          <div className="text-[11px] text-muted-foreground">Across Delhi NCR</div>
        </div>
      </div>
    </section>
  )
}
