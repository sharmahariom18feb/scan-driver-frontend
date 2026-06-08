import type { Service, Step, TrustFeature, Stat, Testimonial, DriverBenefit, TermsCard, FooterColumn, ContactInfo } from '@/types'

export const WHATSAPP_CUSTOMER = '919717498198'
export const WHATSAPP_DRIVER = '919718181498'
export const EMAIL = 'care@scandriver.in'
export const WEBSITE = 'www.ScanDriver.in'

export const getWhatsAppLink = (number: string, message: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`

export const SERVICES: Service[] = [
  {
    id: 'hourly',
    icon: '🕐',
    name: 'Hourly Driver',
    description: 'Book a driver by the hour for errands, appointments, or short trips across Delhi NCR.',
    whatsappMessage: 'Hi ScanDriver! I need an Hourly Driver.',
  },
  {
    id: 'monthly',
    icon: '📅',
    name: 'Monthly Driver',
    description: 'Dedicated personal driver for the entire month. Consistent, trusted, and always on time.',
    whatsappMessage: 'Hi ScanDriver! I need a Monthly Driver.',
  },
  {
    id: 'weekly',
    icon: '📆',
    name: 'Weekly Driver',
    description: 'Need a driver just for the week? Our weekly packages are flexible and hassle-free.',
    whatsappMessage: 'Hi ScanDriver! I need a Weekly Driver.',
  },
  {
    id: 'outstation',
    icon: '🛣️',
    name: 'Outstation Driver',
    description: 'Long-distance trips, city-to-city travel, or hill station trips — handled by experienced outstation drivers.',
    whatsappMessage: 'Hi ScanDriver! I need an Outstation Driver.',
  },
  {
    id: 'corporate',
    icon: '💼',
    name: 'Corporate Driver',
    description: 'Professional chauffeurs for executives and corporate fleets. Uniformed, punctual, discreet.',
    whatsappMessage: 'Hi ScanDriver! I need a Corporate Driver.',
  },
  {
    id: 'airport',
    icon: '✈️',
    name: 'Airport Transfer',
    description: 'On-time pickups and drops to Delhi IGI Airport. Track your flight, stress-free transfer guaranteed.',
    whatsappMessage: 'Hi ScanDriver! I need an Airport Transfer.',
  },
  {
    id: 'event',
    icon: '💍',
    name: 'Event & Wedding Driver',
    description: 'Elegantly dressed, reliable drivers for weddings, social events, and ceremonies across NCR.',
    whatsappMessage: 'Hi ScanDriver! I need a driver for my Wedding or Event.',
  },
]

export const STEPS: Step[] = [
  {
    number: 1,
    icon: '📲',
    title: 'Scan or Message',
    description: 'Scan the QR code or directly WhatsApp us. Tell us your date, time, and driver requirement.',
    tagline: '📲 Your driver just 1 scan away',
  },
  {
    number: 2,
    icon: '🧑‍✈️',
    title: 'Get a Verified Driver',
    description: 'We assign you a verified, background-checked driver matched to your need — within minutes.',
  },
  {
    number: 3,
    icon: '🚗',
    title: 'Ride Safely',
    description: 'Your driver arrives on time. No app, no signup. Just safe, reliable, professional driving.',
  },
]

export const TRUST_FEATURES: TrustFeature[] = [
  {
    icon: '🪪',
    title: 'Aadhaar & License Verified',
    description: "Every driver's Aadhaar card and driving license is manually verified before onboarding.",
  },
  {
    icon: '🔍',
    title: 'Background & Criminal Record Check',
    description: 'Full criminal background check + minimum 2 reference verifications before any driver is onboarded.',
  },
  {
    icon: '🤝',
    title: '3-Reference Check',
    description: 'Minimum three trusted references verified before a driver joins our network.',
  },
  {
    icon: '⭐',
    title: '5+ Years Experience Required',
    description: 'We only work with experienced, professional drivers — no rookies.',
  },
]

export const STATS: Stat[] = [
  { value: '500+', label: 'Verified Drivers in Network', highlighted: true },
  { value: '1K+', label: 'Happy Customers Served' },
  { value: '24/7', label: 'WhatsApp Support Available' },
  { value: '100%', label: 'Background Checked Drivers' },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    stars: 5,
    text: '"Got a driver within 2 hours of messaging on WhatsApp. He was polite, punctual and very professional. Highly recommend ScanDriver for monthly hiring."',
    author: { name: 'Rahul Sharma', location: 'Sector 50, Gurgaon', initial: 'R' },
  },
  {
    stars: 5,
    text: '"Used ScanDriver for my company\'s executive travel. The driver was in uniform, arrived early, and drove impeccably. Will continue using for corporate needs."',
    author: { name: 'Priya Mehta', location: 'Connaught Place, Delhi', initial: 'P' },
  },
  {
    stars: 5,
    text: '"Booked for my daughter\'s wedding — the driver showed up perfectly on time, was respectful throughout and handled outstation too. Great experience overall."',
    author: { name: 'Sunita Agarwal', location: 'Noida Sector 18', initial: 'S' },
  },
]

export const DRIVER_BENEFITS: DriverBenefit[] = [
  {
    icon: '💰',
    title: 'Guaranteed Earnings',
    description: 'Weekly payouts with no delays. Transparent rate structure.',
  },
  {
    icon: '🕐',
    title: 'Flexible Timing',
    description: 'Work full-time, part-time, or hourly. You set the schedule.',
  },
  {
    icon: '🛡️',
    title: 'Trusted Platform',
    description: 'Work only with verified, genuine customers. Zero harassment guarantee.',
  },
  {
    icon: '📈',
    title: 'Career Growth',
    description: 'Top drivers get priority assignments, bonuses, and corporate client access.',
  },
]

export const TERMS: TermsCard[] = [
  {
    icon: '📋',
    title: '1. Acceptance of Terms',
    description: 'By contacting ScanDriver via WhatsApp, phone, or website, or by using any driver service provided by us, you agree to these Terms & Conditions in full. If you do not agree, please discontinue use immediately.',
  },
  {
    icon: '🧑‍✈️',
    title: '2. Nature of Service',
    description: 'ScanDriver is a driver aggregation and placement platform. We connect verified drivers with customers requiring on-demand driving services. ScanDriver is not a transport company and does not own vehicles.',
  },
  {
    icon: '✅',
    title: '3. Driver Verification',
    description: 'All drivers on our platform undergo multi-layer verification including Aadhaar card, driving licence, criminal background check, and a minimum of two personal references.',
  },
  {
    icon: '💰',
    title: '4. Payments & Cancellations',
    description: 'All payments are to be made directly to ScanDriver or as directed by our team. Cancellation within 2 hours of the confirmed booking time may attract a cancellation fee of up to ₹200.',
  },
  {
    icon: '🛡️',
    title: '5. Liability & Limitation',
    description: "ScanDriver's liability in any dispute is strictly limited to the service fee paid for that specific booking. We are not liable for damage to the customer's vehicle or accidents caused by the driver.",
  },
  {
    icon: '🚗',
    title: '6. Customer Obligations',
    description: 'Customers must ensure their vehicle is in roadworthy condition with valid documents (RC, insurance, PUC), and treat the assigned driver with respect and dignity.',
  },
  {
    icon: '🔒',
    title: '7. Privacy & Data',
    description: 'Customer and driver information shared with ScanDriver is used solely for service delivery and communication purposes. We do not sell or share personal data with third parties.',
  },
  {
    icon: '⚖️',
    title: '8. Governing Law & Disputes',
    description: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Delhi, India.',
  },
]

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Services',
    links: [
      { label: 'Hourly Driver', href: '/booking?service=hourly' },
      { label: 'Monthly Driver', href: '/booking?service=monthly' },
      { label: 'Weekly Driver', href: '/booking?service=weekly' },
      { label: 'Outstation Driver', href: '/booking?service=outstation' },
      { label: 'Corporate Driver', href: '/booking?service=corporate' },
      { label: 'Airport Transfer', href: '/booking?service=airport' },
      { label: 'Event & Wedding', href: '/booking?service=event' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Why ScanDriver', href: '/#why-us' },
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Join as Driver', href: '/#join-driver' },
      { label: 'About Us', href: `mailto:${EMAIL}` },
      { label: 'Contact', href: `mailto:${EMAIL}` },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: '📞 Customer: 97174 98198', href: 'tel:+919717498198' },
      { label: '🚗 Driver: 97181 81498', href: 'tel:+919718181498' },
      { label: `✉️ ${EMAIL}`, href: `mailto:${EMAIL}` },
      { label: `🌐 ${WEBSITE}`, href: `https://${WEBSITE}`, external: true },
    ],
  },
]

export const MARQUEE_ITEMS = [
  'Background Verified, 2 Refs Drivers',
  'Aadhaar Checked',
  'License Verified',
  'Reference Checked',
  'Available 24/7',
  'No App Needed',
  'Instant WhatsApp Booking',
  'Delhi NCR Coverage',
]

export const CONTACT_INFO: ContactInfo[] = [
  { icon: '👤', label: 'Customer:', value: '+91 9717-498-198', href: 'tel:+919717498198' },
  { icon: '🚗', label: 'Driver Signup:', value: '+91 9718-181-498', href: 'tel:+919718181498' },
  { icon: '✉️', value: EMAIL, href: `mailto:${EMAIL}` },
]
