export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2.5 mb-4">
      <span className="block w-7 h-px bg-gold" />
      <span className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-gold">
        {children}
      </span>
      <span className="block w-7 h-px bg-gold" />
    </div>
  )
}
