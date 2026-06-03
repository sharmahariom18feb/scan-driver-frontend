import { MARQUEE_ITEMS } from '@/constants'

export function MarqueeStrip() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div className="bg-gradient-to-r from-gold via-gold-light to-gold py-3.5 overflow-hidden">
      <div className="flex gap-12 animate-marquee w-max">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <span className="text-xs font-bold tracking-[0.12em] uppercase text-black whitespace-nowrap">
              {item}
            </span>
            <span className="w-1 h-1 rounded-full bg-black/40" />
          </div>
        ))}
      </div>
    </div>
  )
}
