import { Reveal } from '@/components/common/reveal'
import { SectionLabel } from '@/components/common/section-label'
import { TESTIMONIALS } from '@/constants'

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-surface relative overflow-hidden">
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-[1160px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <Reveal>
            <SectionLabel>Customer Stories</SectionLabel>
            <h2 className="font-display text-[clamp(28px,3.5vw,44px)] font-bold text-foreground">
              Trusted by Families & Professionals<br />
              Across <em className="italic text-gold-light">Delhi NCR</em>
            </h2>
          </Reveal>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.author.name} delay={0.1 * index}>
              <div className="bg-background border border-border rounded-[14px] p-7">
                <div className="text-gold-light text-sm tracking-widest mb-3.5">
                  {'★'.repeat(testimonial.stars)}
                </div>
                <p className="text-base text-muted-foreground leading-relaxed mb-5 italic">
                  {testimonial.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center font-bold text-sm text-black">
                    {testimonial.author.initial}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {testimonial.author.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {testimonial.author.location}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
