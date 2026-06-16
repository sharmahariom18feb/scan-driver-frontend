import Link from 'next/link'
import Image from 'next/image'
import { FOOTER_COLUMNS, EMAIL, WEBSITE, WHATSAPP_CUSTOMER } from '@/constants'
import logoSd from '../../public/icons/logo-sd.png'
import { Facebook, Instagram, MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-16 pb-8">
      <div className="max-w-[1160px] mx-auto px-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="#" className="flex items-center gap-2.5 no-underline mb-3.5">
              <div className="w-46 flex items-center justify-center">
                <Image src={logoSd} alt="ScanDriver Logo" width={200} className="object-contain" />
              </div>
              {/* <div>
                <span className="font-sans text-xl font-bold text-foreground">
                  Scan<span className="text-gold-light">Driver</span>
                </span>
              </div> */}
            </Link>
            <p className="text-muted-foreground text-[13px] leading-relaxed max-w-[260px]">
              Delhi NCR&apos;s most trusted on-demand verified driver service. Professional drivers for every need — no app required.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-8 h-8 rounded-full border border-border bg-card hover:bg-card/80 transition-all hover:border-[#1877F2]/40 hover:shadow-[0_0_10px_rgba(24,119,242,0.15)]"
                aria-label="Facebook"
              >
                <Facebook size={16} className="text-muted-foreground group-hover:text-[#1877F2] transition-colors duration-300" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-8 h-8 rounded-full border border-border bg-card hover:bg-card/80 transition-all hover:border-[#E1306C]/40 hover:shadow-[0_0_10px_rgba(225,48,108,0.15)]"
                aria-label="Instagram"
              >
                <Instagram size={16} className="text-muted-foreground group-hover:text-[#E1306C] transition-colors duration-300" />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_CUSTOMER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-8 h-8 rounded-full border border-border bg-card hover:bg-card/80 transition-all hover:border-[#25D366]/40 hover:shadow-[0_0_10px_rgba(37,211,102,0.15)]"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} className="text-muted-foreground group-hover:text-[#25D366] transition-colors duration-300" />
              </a>
            </div>
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
