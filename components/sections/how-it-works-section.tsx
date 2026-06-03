import { Reveal } from '@/components/common/reveal'
import { SectionLabel } from '@/components/common/section-label'
import { STEPS } from '@/constants'

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-surface relative overflow-hidden" id="how-it-works">
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      {/* Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-[1160px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal>
            <SectionLabel>Simple Process</SectionLabel>
            <h2 className="font-display text-[clamp(30px,4vw,50px)] font-bold text-foreground">
              Book a Driver in <em className="italic text-gold-light">3 Easy Steps</em>
            </h2>
          </Reveal>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-[repeating-linear-gradient(90deg,var(--gold)_0,var(--gold)_8px,transparent_8px,transparent_16px)]" />

          {STEPS.map((step, index) => (
            <Reveal key={step.number} delay={0.1 * index}>
              <div className="text-center px-6 py-6 md:py-0">
                <div className="w-16 h-16 rounded-full bg-background border-2 border-gold flex items-center justify-center font-display text-[22px] font-bold text-gold-light mx-auto mb-6 relative z-10">
                  {step.number}
                </div>
                <span className="text-[26px] mb-4 block">{step.icon}</span>
                <h3 className="text-[21px] font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{step.description}</p>
                {step.tagline && (
                  <div className="inline-flex items-center gap-1.5 mt-3.5 text-xs font-bold text-gold-light tracking-wide bg-gold/10 border border-gold/25 rounded-full px-3.5 py-1.5">
                    {step.tagline}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
