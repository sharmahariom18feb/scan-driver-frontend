import { Reveal } from '@/components/common/reveal'
import { SectionLabel } from '@/components/common/section-label'
import { SERVICES } from '@/constants'
import Link from 'next/link'
import { Clock, Calendar, CalendarDays, Compass, Briefcase, Plane, Sparkles } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  hourly: <Clock className="w-6 h-6 text-gold" />,
  monthly: <Calendar className="w-6 h-6 text-gold" />,
  weekly: <CalendarDays className="w-6 h-6 text-gold" />,
  outstation: <Compass className="w-6 h-6 text-gold" />,
  corporate: <Briefcase className="w-6 h-6 text-gold" />,
  airport: <Plane className="w-6 h-6 text-gold" />,
  event: <Sparkles className="w-6 h-6 text-gold" />,
}

export function ServicesSection() {
  return (
    <section className="py-24 bg-background" id="services">
      <div className="max-w-[1160px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <Reveal>
            <SectionLabel>What We Offer</SectionLabel>
            <h2 className="font-display text-[clamp(32px,4vw,52px)] font-bold text-foreground leading-tight">
              Driver Services Built<br />
              for <em className="italic text-gold-light">Every Need</em>
            </h2>
            <p className="text-muted-foreground text-base mt-3.5 max-w-[480px] mx-auto">
              From a quick hourly ride to a full-time monthly driver — we&apos;ve got you covered across Delhi NCR.
            </p>
          </Reveal>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((service, index) => (
            <Reveal key={service.id} delay={0.1 * (index % 4)}>
              <Link
                href={`/booking?service=${service.id}`}
                className="block bg-surface border border-border rounded-[14px] p-7 cursor-pointer transition-all duration-300 relative overflow-hidden group hover:border-gold/50 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-[54px] h-[54px] rounded-[14px] bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                    {iconMap[service.id] || <span className="text-[26px]">{service.icon}</span>}
                  </div>
                  <h3 className="font-sans text-[19px] font-semibold text-foreground mb-2.5">
                    {service.name}
                  </h3>
                  <p className="text-[15px] text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold mt-4 group-hover:gap-2.5 transition-all">
                    Book Now →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
