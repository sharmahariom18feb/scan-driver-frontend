import { Reveal } from '@/components/common/reveal'
import { SectionLabel } from '@/components/common/section-label'
import { CTAButton } from '@/components/common/cta-button'
import { TRUST_FEATURES, STATS, WHATSAPP_CUSTOMER, getWhatsAppLink } from '@/constants'

export function WhyUsSection() {
  return (
    <section className="py-24 bg-background" id="why-us">
      <div className="max-w-[1160px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <div>
            <Reveal>
              <SectionLabel>Why Choose Us</SectionLabel>
              <h2 className="font-display text-[clamp(30px,4vw,50px)] font-bold text-foreground leading-tight mb-5">
                We Don&apos;t Just Find Drivers.<br />
                <em className="italic text-gold-light">We Verify Them.</em>
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-9">
                Every ScanDriver driver goes through a multi-layer verification before they ever sit behind your wheel. Your safety isn&apos;t a feature — it&apos;s our foundation.
              </p>
            </Reveal>

            {/* Trust Checks */}
            <div className="flex flex-col gap-4 mb-10">
              {TRUST_FEATURES.map((feature, index) => (
                <Reveal key={feature.title} delay={0.1 * index}>
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center text-xl shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-[17px] font-semibold text-foreground mb-1">{feature.title}</h4>
                      <p className="text-[15px] text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.4}>
              <CTAButton
                href={getWhatsAppLink(WHATSAPP_CUSTOMER, 'Hi ScanDriver! I want to book a driver.')}
                variant="gold"
                external
              >
                Book Your Verified Driver
              </CTAButton>
            </Reveal>
          </div>

          {/* Right Stats */}
          <Reveal delay={0.2}>
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className={`bg-surface border border-border rounded-[14px] p-7 ${
                    stat.highlighted
                      ? 'bg-gradient-to-br from-gold/15 to-gold/5 border-gold/35'
                      : ''
                  }`}
                >
                  <div className="font-display text-[44px] font-bold text-gold-light leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[13px] text-muted-foreground mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
