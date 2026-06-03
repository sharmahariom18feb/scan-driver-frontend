import { Reveal } from '@/components/common/reveal'
import { SectionLabel } from '@/components/common/section-label'
import { TERMS, EMAIL, WHATSAPP_CUSTOMER } from '@/constants'

export function TermsSection() {
  return (
    <section className="py-24 bg-surface relative overflow-hidden" id="terms">
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-[1160px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <Reveal>
            <SectionLabel>Legal</SectionLabel>
            <h2 className="font-display text-[clamp(30px,4vw,50px)] font-bold text-foreground">
              Terms & <em className="italic text-gold-light">Conditions</em>
            </h2>
            <p className="text-muted-foreground text-sm mt-2.5">
              Last updated: May 2025 &nbsp;|&nbsp; Applicable to all users of ScanDriver services in Delhi NCR.
            </p>
          </Reveal>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TERMS.map((term, index) => (
            <Reveal key={term.title} delay={0.1 * (index % 4)}>
              <div className="bg-background border border-border rounded-[14px] p-7 transition-all duration-300 hover:border-gold/35">
                <div className="text-[26px] mb-3">{term.icon}</div>
                <h3 className="text-[17px] font-bold text-foreground mb-2.5 leading-tight">
                  {term.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {term.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Footer Note */}
        <Reveal>
          <div className="mt-10 text-center text-[13px] text-muted-foreground leading-relaxed">
            For any questions regarding these terms, contact us at{' '}
            <a href={`mailto:${EMAIL}`} className="text-gold-light hover:underline">
              {EMAIL}
            </a>{' '}
            &nbsp;|&nbsp;{' '}
            <a
              href={`https://wa.me/${WHATSAPP_CUSTOMER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-light hover:underline"
            >
              WhatsApp: +91 9717-498-198
            </a>
            <br />
            ScanDriver Private Limited · Delhi NCR, India · www.ScanDriver.in
          </div>
        </Reveal>
      </div>
    </section>
  )
}
