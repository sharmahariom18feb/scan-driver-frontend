import { Reveal } from '@/components/common/reveal'
import { SectionLabel } from '@/components/common/section-label'
import { TERMS, EMAIL, WHATSAPP_CUSTOMER } from '@/constants'
import { ClipboardList, Users, ShieldCheck, Coins, ShieldAlert, Car, Lock, Scale } from 'lucide-react'

const iconMap: Record<number, React.ReactNode> = {
  0: <ClipboardList className="w-6 h-6 text-gold" />,
  1: <Users className="w-6 h-6 text-gold" />,
  2: <ShieldCheck className="w-6 h-6 text-gold" />,
  3: <Coins className="w-6 h-6 text-gold" />,
  4: <ShieldAlert className="w-6 h-6 text-gold" />,
  5: <Car className="w-6 h-6 text-gold" />,
  6: <Lock className="w-6 h-6 text-gold" />,
  7: <Scale className="w-6 h-6 text-gold" />,
}

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
              <div className="bg-background border border-border rounded-[14px] p-7 transition-all duration-300 hover:border-gold/35 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  {iconMap[index] || <span className="text-[26px]">{term.icon}</span>}
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-foreground mb-2.5 leading-tight">
                    {term.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {term.description}
                  </p>
                </div>
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
