import Link from 'next/link'
import { FOOTER_COLUMNS, EMAIL, WEBSITE } from '@/constants'

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-16 pb-8">
      <div className="max-w-[1160px] mx-auto px-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="#" className="flex items-center gap-2.5 no-underline mb-3.5">
              <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-light rounded-[10px] flex items-center justify-content text-lg">
                🚗
              </div>
              <div>
                <span className="font-sans text-xl font-bold text-foreground">
                  Scan<span className="text-gold-light">Driver</span>
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-[13px] leading-relaxed max-w-[260px]">
              Delhi NCR&apos;s most trusted on-demand verified driver service. Professional drivers for every need — no app required.
            </p>
          </div>

          {/* Footer Columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-gold mb-4">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-2.5 list-none">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-gold-light transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-gold-light transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 ScanDriver Private Limited. All rights reserved. | Delhi NCR, India
          </p>
          <div className="flex gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <span>✓</span> Verified Drivers
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <span>🔒</span> Safe & Trusted
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <span>⚡</span> 24/7 Available
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
