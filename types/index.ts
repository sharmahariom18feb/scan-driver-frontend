export interface Service {
  id: string
  icon: string
  name: string
  description: string
  whatsappMessage: string
}

export interface Step {
  number: number
  icon: string
  title: string
  description: string
  tagline?: string
}

export interface TrustFeature {
  icon: string
  title: string
  description: string
}

export interface Stat {
  value: string
  label: string
  highlighted?: boolean
}

export interface Testimonial {
  stars: number
  text: string
  author: {
    name: string
    location: string
    initial: string
  }
}

export interface DriverBenefit {
  icon: string
  title: string
  description: string
}

export interface TermsCard {
  icon: string
  title: string
  description: string
}

export interface FooterColumn {
  title: string
  links: {
    label: string
    href: string
    external?: boolean
  }[]
}

export interface ContactInfo {
  icon: string
  label?: string
  value: string
  href: string
}
