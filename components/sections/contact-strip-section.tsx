import { Reveal } from '@/components/common/reveal'
import { CTAButton } from '@/components/common/cta-button'
import { CONTACT_INFO, WHATSAPP_CUSTOMER, getWhatsAppLink } from '@/constants'

export function ContactStripSection() {
  return (
    <section className="bg-gradient-to-br from-gold/12 to-gold/4 border-y border-border py-14">
      <div className="max-w-[1160px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Heading */}
          <Reveal>
            <div>
              <h2 className="font-display text-[clamp(24px,3vw,38px)] font-bold text-foreground">
                Ready to Book Your Driver?
              </h2>
              <p className="text-muted-foreground text-[15px] mt-1.5">
                Message us on WhatsApp and get a driver assigned in minutes.
              </p>
            </div>
          </Reveal>

          {/* Contact Info */}
          <Reveal delay={0.1}>
            <div className="flex flex-col gap-2">
              {CONTACT_INFO.map((info) => (
                <div key={info.value} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <span>{info.icon}</span>
                  {info.label && <span>{info.label}</span>}
                  <a href={info.href} className="text-foreground hover:text-gold-light transition-colors">
                    {info.value}
                  </a>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Actions */}
          <Reveal delay={0.2}>
            <div className="flex gap-3.5 flex-wrap items-center">
              <CTAButton
                href={getWhatsAppLink(WHATSAPP_CUSTOMER, 'Hi ScanDriver! I want to book a driver.')}
                variant="whatsapp"
                external
              >
                Book on WhatsApp
              </CTAButton>
              <CTAButton href="tel:+919717498198" variant="outline">
                Call Now
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
