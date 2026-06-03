/**
 * JSON-LD Structured Data for SEO
 * Rendered server-side so search engines can parse it immediately.
 */

interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/** Organization schema for ScanDriver */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ScanDriver Private Limited',
        url: 'https://scandriver.in',
        logo: 'https://scandriver.in/icons/logo-sd.png',
        description:
          "Delhi NCR's most trusted on-demand verified driver service.",
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Delhi NCR',
          addressCountry: 'IN',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+91-9717498198',
            contactType: 'customer service',
            areaServed: 'IN',
            availableLanguage: ['English', 'Hindi'],
          },
        ],
        sameAs: ['https://wa.me/919717498198'],
      }}
    />
  )
}

/** LocalBusiness schema for local SEO ranking */
export function LocalBusinessJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'ScanDriver',
        description:
          'Hire verified, professional drivers hourly, weekly, monthly or for outstation in Delhi NCR. Book via WhatsApp instantly.',
        url: 'https://scandriver.in',
        telephone: '+91-9717498198',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Delhi NCR',
          addressRegion: 'Delhi',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '28.6139',
          longitude: '77.2090',
        },
        areaServed: {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: '28.6139',
            longitude: '77.2090',
          },
          geoRadius: '100000',
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '00:00',
          closes: '23:59',
        },
        priceRange: '₹₹',
      }}
    />
  )
}

/** FAQ schema for rich snippets */
export function FAQJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I book a driver with ScanDriver?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Simply send a WhatsApp message to +91 9717498198 with your pickup location, time, and duration. We will assign a verified driver within 2 minutes.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are ScanDriver drivers verified?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, every ScanDriver driver undergoes multi-layer verification including background checks, reference verification, and driving skill assessment.',
            },
          },
          {
            '@type': 'Question',
            name: 'What areas does ScanDriver cover?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ScanDriver operates across Delhi NCR including Delhi, Gurgaon, Noida, Faridabad, and Ghaziabad. We also provide outstation driver services.',
            },
          },
          {
            '@type': 'Question',
            name: 'What types of driver services do you offer?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We offer hourly drivers, daily drivers, weekly drivers, monthly drivers, outstation drivers, and corporate driver services across Delhi NCR.',
            },
          },
        ],
      }}
    />
  )
}

/** Service schema */
export function ServiceJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: 'On-Demand Driver Service',
        provider: {
          '@type': 'Organization',
          name: 'ScanDriver Private Limited',
        },
        areaServed: {
          '@type': 'Place',
          name: 'Delhi NCR, India',
        },
        description:
          'Hire verified, professional drivers on-demand. Hourly, daily, weekly, monthly, or outstation — all bookable via WhatsApp.',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      }}
    />
  )
}
