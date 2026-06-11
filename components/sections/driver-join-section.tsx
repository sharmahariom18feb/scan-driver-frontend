import { Reveal } from '@/components/common/reveal'
import { SectionLabel } from '@/components/common/section-label'
import { CTAButton } from '@/components/common/cta-button'
import { WhatsAppIcon } from '@/components/common/icons'
import { DRIVER_BENEFITS, WHATSAPP_DRIVER, getWhatsAppLink } from '@/constants'

export function DriverJoinSection() {
  return (
    <section
      className="py-32 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(201,146,42,0.07)_0%,transparent_70%),var(--background)] relative overflow-hidden"
      id="join-driver"
    >
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-[1160px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Content (Order 2 on Desktop) */}
          <div className="lg:order-2">
            <Reveal>
              <SectionLabel>For Drivers</SectionLabel>
              <h2 className="font-display text-[clamp(34px,4vw,56px)] font-bold text-foreground leading-tight mb-4">
                Are You a Professional Driver?<br />
                <em className="italic text-gold-light">Join ScanDriver.</em>
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-9">
                Earn on your schedule. Join Delhi NCR&apos;s fastest-growing verified driver network. We bring you trusted customers — you bring the skills.
              </p>
            </Reveal>

            {/* Benefits */}
            <div className="flex flex-col gap-3.5 mb-9">
              {DRIVER_BENEFITS.map((benefit, index) => (
                <Reveal key={benefit.title} delay={0.1 * index}>
                  <div className="flex items-center gap-3.5 bg-surface border border-border rounded-xl p-3.5 transition-all duration-300 hover:border-gold/40 hover:translate-x-1.5">
                    <span className="text-2xl shrink-0">{benefit.icon}</span>
                    <div>
                      <h4 className="text-[17px] font-semibold text-foreground">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.4}>
              <CTAButton
                href={getWhatsAppLink(WHATSAPP_DRIVER, 'Hi ScanDriver! I want to join as a driver.')}
                variant="whatsapp"
                external
              >
                <WhatsAppIcon />
                Apply via WhatsApp
              </CTAButton>
            </Reveal>
          </div>

          {/* Right Card (Order 1 on Desktop) */}
          <div className="lg:order-1">
            <Reveal delay={0.2}>
              <div className="bg-surface border border-border rounded-3xl p-12 text-center">
                <span className="text-7xl mb-5 block">🧑‍✈️</span>
                <h3 className="font-display text-[34px] font-bold text-foreground mb-3">
                  Start Earning Today
                </h3>
                <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
                  Join 500+ verified drivers already earning with ScanDriver. WhatsApp us to apply now.
                </p>

                {/* Contact Box */}
                <div className="bg-border/50 rounded-lg p-3 mb-5">
                  <div className="text-[11px] text-muted-foreground mb-1">Driver WhatsApp</div>
                  <div className="text-lg font-bold text-gold-light">+91 97181 81498</div>
                </div>

                <CTAButton
                  href={getWhatsAppLink(WHATSAPP_DRIVER, 'Hi ScanDriver! I want to join as a driver.')}
                  variant="gold"
                  external
                  className="w-full justify-center"
                >
                  Apply as Driver →
                </CTAButton>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
