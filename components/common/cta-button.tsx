import Link from 'next/link'
import { cn } from '@/lib/utils'

type ButtonVariant = 'gold' | 'whatsapp' | 'outline'

interface ButtonProps {
  href: string
  variant?: ButtonVariant
  children: React.ReactNode
  className?: string
  external?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  gold: 'bg-gradient-to-br from-gold to-gold-light text-black shadow-[0_6px_28px_rgba(201,146,42,0.35)] hover:translate-y-[-2px] hover:shadow-[0_10px_36px_rgba(201,146,42,0.5)]',
  whatsapp: 'bg-wa-green text-white shadow-[0_6px_24px_rgba(37,211,102,0.3)] hover:translate-y-[-2px] hover:shadow-[0_10px_32px_rgba(37,211,102,0.5)]',
  outline: 'bg-transparent border-[1.5px] border-border text-foreground hover:border-gold hover:text-gold',
}

export function CTAButton({
  href,
  variant = 'gold',
  children,
  className,
  external = false,
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-sans text-sm font-semibold cursor-pointer no-underline transition-all duration-300 whitespace-nowrap'

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseStyles, variantStyles[variant], className)}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={cn(baseStyles, variantStyles[variant], className)}>
      {children}
    </Link>
  )
}
