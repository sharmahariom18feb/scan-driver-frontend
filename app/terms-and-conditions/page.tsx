import type { Metadata } from 'next'
import { LegalLayout, LegalSection } from '@/components/layout/legal-layout'
import { Scale, Mail, Globe } from 'lucide-react'
import { EMAIL, WEBSITE } from '@/constants'

export const metadata: Metadata = {
  title: 'Terms & Conditions | ScanDriver',
  description: 'Read the official Terms and Conditions governing your access and use of ScanDriver verified driver services in Delhi NCR.',
  alternates: {
    canonical: 'https://scandriver.in/terms-and-conditions',
  },
}

const sections: LegalSection[] = [
  { id: 'sec-1', title: '1. Introduction' },
  { id: 'sec-2', title: '2. About ScanDriver' },
  { id: 'sec-3', title: '3. Definitions' },
  { id: 'sec-4', title: '4. Eligibility' },
  { id: 'sec-5', title: '5. Acceptance of Terms' },
  { id: 'sec-6', title: '6. Nature of the Platform' },
  { id: 'sec-7', title: '7. User Registration' },
  { id: 'sec-8', title: '8. Account Security' },
  { id: 'sec-9', title: '9. Booking Services' },
  { id: 'sec-10', title: '10. Driver Allocation' },
  { id: 'sec-11', title: '11. Customer Responsibilities' },
  { id: 'sec-12', title: '12. Vehicle Requirements' },
  { id: 'sec-13', title: '13. Driver Verification' },
  { id: 'sec-14', title: '14. Service Availability' },
  { id: 'sec-15', title: '15. Communications' },
  { id: 'sec-16', title: '16. Pricing' },
  { id: 'sec-17', title: '17. Payments' },
  { id: 'sec-18', title: '18. Booking Confirmation' },
  { id: 'sec-19', title: '19. Changes to Bookings' },
  { id: 'sec-20', title: '20. Customer Cancellation' },
  { id: 'sec-21', title: '21. Cancellation by Driver Partner' },
  { id: 'sec-22', title: '22. Cancellation by ScanDriver' },
  { id: 'sec-23', title: '23. Customer Conduct' },
  { id: 'sec-24', title: '24. Driver Partner Responsibilities' },
  { id: 'sec-25', title: '25. Customer Vehicle' },
  { id: 'sec-26', title: '26. Delays' },
  { id: 'sec-27', title: '27. Safety' },
  { id: 'sec-28', title: '28. Lost Property' },
  { id: 'sec-29', title: '29. Ratings, Feedback & Complaints' },
  { id: 'sec-30', title: '30. Fraud Prevention' },
  { id: 'sec-31', title: '31. Intellectual Property' },
  { id: 'sec-32', title: '32. User Content' },
  { id: 'sec-33', title: '33. Prohibited Activities' },
  { id: 'sec-34', title: '34. Third-Party Services' },
  { id: 'sec-35', title: '35. No Warranty' },
  { id: 'sec-36', title: '36. Limitation of Liability' },
  { id: 'sec-37', title: '37. Customer Responsibility' },
  { id: 'sec-38', title: '38. Driver Partner Responsibility' },
  { id: 'sec-39', title: '39. Indemnification' },
  { id: 'sec-40', title: '40. Insurance' },
  { id: 'sec-41', title: '41. Force Majeure' },
  { id: 'sec-42', title: '42. Suspension of Access' },
  { id: 'sec-43', title: '43. Termination' },
  { id: 'sec-44', title: '44. Governing Law' },
  { id: 'sec-45', title: '45. Dispute Resolution' },
  { id: 'sec-46', title: '46. Electronic Communications' },
  { id: 'sec-47', title: '47. Changes to the Platform' },
  { id: 'sec-48', title: '48. Amendments to These Terms' },
  { id: 'sec-49', title: '49. Privacy' },
  { id: 'sec-50', title: '50. Severability' },
  { id: 'sec-51', title: '51. Waiver' },
  { id: 'sec-52', title: '52. Assignment' },
  { id: 'sec-53', title: '53. Entire Agreement' },
  { id: 'sec-54', title: '54. Relationship of the Parties' },
  { id: 'sec-55', title: '55. Feedback & Suggestions' },
  { id: 'sec-56', title: '56. Contact Information' },
  { id: 'sec-57', title: '57. Acceptance' },
]

export default function TermsAndConditionsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="Complete binding terms and guidelines governing driver bookings and usage of ScanDriver platform."
      lastUpdated="July 20, 2026"
      icon={<Scale size={14} />}
      sections={sections}
    >
      {/* 1. Introduction */}
      <section id="sec-1" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">1.</span> Introduction
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Welcome to ScanDriver (&quot;ScanDriver&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the ScanDriver website, mobile applications (if any), WhatsApp booking services, customer support channels, and any other products or services provided by ScanDriver (collectively, the &quot;Platform&quot;).
        </p>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-3">
          By accessing or using the Platform, creating an account, requesting a driver, or otherwise using any ScanDriver service, you acknowledge that you have read, understood, and agree to be legally bound by these Terms. If you do not agree to these Terms, you must not access or use the Platform.
        </p>
      </section>

      {/* 2. About ScanDriver */}
      <section id="sec-2" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">2.</span> About ScanDriver
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver is a technology platform that enables customers to connect with verified independent driver partners for driving services using the customer&apos;s own vehicle. ScanDriver does not own, lease, or operate customer vehicles and is not a transportation company, taxi operator, fleet owner, or employer of driver partners.
        </p>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-3">
          Driver partners offering services through the Platform are independent service providers responsible for providing driving services directly to customers. ScanDriver&apos;s role is limited to facilitating bookings, enabling communication between customers and driver partners, and providing technology and customer support services.
        </p>
      </section>

      {/* 3. Definitions */}
      <section id="sec-3" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">3.</span> Definitions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
          {[
            { term: 'Account', def: 'A registered customer profile created on the Platform.' },
            { term: 'Booking', def: 'A request submitted by a customer for a driver through ScanDriver.' },
            { term: 'Customer', def: 'Any individual or organization requesting driving services through the Platform.' },
            { term: 'Driver Partner', def: 'An independent driver registered and approved by ScanDriver to receive booking opportunities.' },
            { term: 'Platform', def: 'The ScanDriver website, mobile apps, WhatsApp services, software, support channels, and technology.' },
            { term: 'Services', def: 'The technology services offered by ScanDriver to facilitate driver bookings.' },
            { term: 'Driving Service', def: 'The actual driving service performed by a Driver Partner using the Customer’s own vehicle.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-background/60 border border-border/80 p-3.5 rounded-xl">
              <span className="font-bold text-gold-light">{item.term}: </span>
              <span className="text-muted-foreground">{item.def}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Eligibility */}
      <section id="sec-4" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">4.</span> Eligibility
        </h2>
        <p className="text-sm font-semibold text-foreground mb-2">To use the Platform, you must:</p>
        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-sm md:text-base leading-relaxed pl-2">
          <li>Be at least 18 years of age.</li>
          <li>Be legally capable of entering into binding agreements under applicable laws.</li>
          <li>Provide accurate and complete information when requested.</li>
          <li>Comply with all applicable laws and regulations.</li>
        </ul>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-4">
          ScanDriver reserves the right to refuse access or terminate services if eligibility requirements are not met.
        </p>
      </section>

      {/* 5. Acceptance of Terms */}
      <section id="sec-5" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">5.</span> Acceptance of Terms
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          By using the Platform, you confirm that you accept these Terms, all information provided by you is accurate, and you will comply with these Terms at all times. Continued use of the Platform after any updates constitutes acceptance of the revised Terms.
        </p>
      </section>

      {/* 6. Nature of the Platform */}
      <section id="sec-6" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">6.</span> Nature of the Platform
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver provides technology services that enable customers to locate and book verified driver partners. Driver Partners are independent contractors. No employment, partnership, agency, or joint venture relationship exists between ScanDriver and Driver Partners.
        </p>
      </section>

      {/* 7. User Registration */}
      <section id="sec-7" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">7.</span> User Registration
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3">
          When registering, you agree to provide full legal name, mobile number, pickup/destination details, vehicle details where required, and any additional information reasonably requested.
        </p>
      </section>

      {/* 8. Account Security */}
      <section id="sec-8" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">8.</span> Account Security
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          You are responsible for maintaining confidentiality of your account, protecting OTPs, and restricting unauthorized access. You must immediately notify ScanDriver if you suspect unauthorized access or misuse.
        </p>
      </section>

      {/* 9. Booking Services */}
      <section id="sec-9" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">9.</span> Booking Services
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Customers may request driver services via website, WhatsApp, customer support, or official channels. Submitting a request does not guarantee driver availability. A booking is confirmed only after confirmation by ScanDriver or driver allocation.
        </p>
      </section>

      {/* 10. Driver Allocation */}
      <section id="sec-10" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">10.</span> Driver Allocation
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Driver allocation depends on availability, customer location, schedule, service area, and traffic conditions. In situations where no suitable Driver Partner is available, ScanDriver may decline or cancel the booking.
        </p>
      </section>

      {/* 11. Customer Responsibilities */}
      <section id="sec-11" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">11.</span> Customer Responsibilities
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3">
          Customers agree to provide accurate details, ensure lawful use of their vehicle, ensure the vehicle is roadworthy and legally registered with all required documents, and treat Driver Partners respectfully.
        </p>
      </section>

      {/* 12. Vehicle Requirements */}
      <section id="sec-12" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">12.</span> Vehicle Requirements
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Customers retain responsibility for the condition of their vehicle. Insurance, registration, pollution certificates, and statutory permits remain the customer&apos;s responsibility. Mechanical failures are not the responsibility of ScanDriver or Driver Partners unless caused by proven negligence.
        </p>
      </section>

      {/* 13. Driver Verification */}
      <section id="sec-13" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">13.</span> Driver Verification
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver conducts identity, driving licence, address, background checks, and reference checks before onboarding drivers. While verification reduces risk, it does not constitute a guarantee regarding future human conduct.
        </p>
      </section>

      {/* 14. Service Availability */}
      <section id="sec-14" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">14.</span> Service Availability
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver operates in designated active areas (Delhi NCR). Availability may vary due to weather, traffic, events, or operational constraints.
        </p>
      </section>

      {/* 15. Communications */}
      <section id="sec-15" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">15.</span> Communications
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          You consent to receive booking updates, driver details, OTPs, security alerts, and promotional communications (where allowed) via phone, SMS, WhatsApp, or email.
        </p>
      </section>

      {/* 16. Pricing */}
      <section id="sec-16" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">16.</span> Pricing
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Service fees are determined based on booking type, duration, distance, time, operational costs, and taxes. Confirmed bookings will generally be charged at the price communicated at confirmation time.
        </p>
      </section>

      {/* 17. Payments */}
      <section id="sec-17" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">17.</span> Payments
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Payments may be collected via UPI, Cards, Net Banking, Digital Wallets, or cash (where permitted). Third-party payment gateways process digital payments securely.
        </p>
      </section>

      {/* 18. Booking Confirmation */}
      <section id="sec-18" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">18.</span> Booking Confirmation
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Bookings are confirmed after driver allocation or explicit confirmation by ScanDriver support. ScanDriver reserves the right to decline any booking request for safety or operational reasons.
        </p>
      </section>

      {/* 19. Changes to Bookings */}
      <section id="sec-19" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">19.</span> Changes to Bookings
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Customers may request timing or location modifications subject to driver availability. Additional charges may apply for material changes.
        </p>
      </section>

      {/* 20. Customer Cancellation */}
      <section id="sec-20" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">20.</span> Customer Cancellation
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Cancellations are governed by the ScanDriver Cancellation & Refund Policy. Applicable fees depend on driver assignment status and timing.
        </p>
      </section>

      {/* 21. Cancellation by Driver Partner */}
      <section id="sec-21" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">21.</span> Cancellation by Driver Partner
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          If a driver cancels due to emergencies or safety concerns, ScanDriver will attempt to allocate a replacement driver.
        </p>
      </section>

      {/* 22. Cancellation by ScanDriver */}
      <section id="sec-22" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">22.</span> Cancellation by ScanDriver
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver may cancel bookings due to driver unavailability, payment issues, or safety concerns, providing refunds where payment was collected.
        </p>
      </section>

      {/* 23. Customer Conduct */}
      <section id="sec-23" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">23.</span> Customer Conduct
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Abuse, harassment, illegal item transportation, or fraudulent practices are strictly prohibited and may result in immediate service termination.
        </p>
      </section>

      {/* 24. Driver Partner Responsibilities */}
      <section id="sec-24" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">24.</span> Driver Partner Responsibilities
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Driver Partners must hold valid licences, follow traffic laws, maintain professional conduct, and respect customer privacy.
        </p>
      </section>

      {/* 25. Customer Vehicle */}
      <section id="sec-25" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">25.</span> Customer Vehicle
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Customers retain full legal responsibility for their vehicles, including fuel, insurance, RC, and mechanical fitness.
        </p>
      </section>

      {/* 26 - 30 */}
      <section id="sec-26" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">26.</span> Delays
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Arrival times are estimates. Delays due to traffic, weather, or road closures are beyond ScanDriver&apos;s control.
        </p>
      </section>

      <section id="sec-27" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">27.</span> Safety
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Safety is paramount. Customers and drivers must follow traffic laws and report emergencies to relevant authorities immediately.
        </p>
      </section>

      <section id="sec-28" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">28.</span> Lost Property
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Customers must check belongings before completing a trip. ScanDriver assists in communication but is not responsible for lost items.
        </p>
      </section>

      <section id="sec-29" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">29.</span> Ratings, Feedback & Complaints
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Feedback submitted may be used for service quality improvement and platform enhancements.
        </p>
      </section>

      <section id="sec-30" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">30.</span> Fraud Prevention
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver actively monitors platform activities and reserves the right to suspend suspicious accounts.
        </p>
      </section>

      {/* 31 - 35 */}
      <section id="sec-31" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">31.</span> Intellectual Property
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          All software, trademarks, logos, branding, and content are owned by or licensed to ScanDriver.
        </p>
      </section>

      <section id="sec-32" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">32.</span> User Content
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          By submitting reviews or feedback, you grant ScanDriver a royalty-free right to use such content for operational purposes.
        </p>
      </section>

      <section id="sec-33" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">33.</span> Prohibited Activities
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Unauthorized access, hacking, payment fraud, scraping, and abusive behaviour are strictly prohibited.
        </p>
      </section>

      <section id="sec-34" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">34.</span> Third-Party Services
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver integrates with third-party payment gateways, mapping, and communication tools governed by their own policies.
        </p>
      </section>

      <section id="sec-35" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">35.</span> No Warranty
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis without express or implied warranties.
        </p>
      </section>

      {/* 36 - 40 */}
      <section id="sec-36" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">36.</span> Limitation of Liability
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver&apos;s aggregate liability is limited to the service fee paid for the specific booking. Indirect or consequential damages are disclaimed.
        </p>
      </section>

      <section id="sec-37" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">37.</span> Customer Responsibility
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Customers remain responsible for vehicle fitness, fuel, valid insurance, and safeguarding personal valuables left inside.
        </p>
      </section>

      <section id="sec-38" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">38.</span> Driver Partner Responsibility
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Driver Partners remain solely responsible for safe driving practices and compliance with traffic laws as independent service providers.
        </p>
      </section>

      <section id="sec-39" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">39.</span> Indemnification
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Users agree to indemnify ScanDriver against claims arising from breach of terms, illegal conduct, or damage to third parties.
        </p>
      </section>

      <section id="sec-40" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">40.</span> Insurance
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Customers are encouraged to maintain valid comprehensive motor insurance for their vehicle.
        </p>
      </section>

      {/* 41 - 45 */}
      <section id="sec-41" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">41.</span> Force Majeure
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver is not liable for performance failures resulting from natural disasters, government restrictions, or system outages.
        </p>
      </section>

      <section id="sec-42" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">42.</span> Suspension of Access
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver may suspend access in cases of safety violations, fraudulent behavior, or breach of terms.
        </p>
      </section>

      <section id="sec-43" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">43.</span> Termination
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Users may discontinue platform use at any time. ScanDriver reserves rights to deactivate accounts for material breaches.
        </p>
      </section>

      <section id="sec-44" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">44.</span> Governing Law
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          These Terms are governed by and construed in accordance with the laws of India.
        </p>
      </section>

      <section id="sec-45" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">45.</span> Dispute Resolution
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Disputes should be resolved amicably through Customer Support first. Courts in Delhi NCR have exclusive jurisdiction over legal disputes.
        </p>
      </section>

      {/* 46 - 50 */}
      <section id="sec-46" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">46.</span> Electronic Communications
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Electronic notices and communications satisfy all legal requirements of written communication.
        </p>
      </section>

      <section id="sec-47" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">47.</span> Changes to the Platform
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver reserves rights to introduce, modify, or discontinue features to improve user experience and security.
        </p>
      </section>

      <section id="sec-48" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">48.</span> Amendments to These Terms
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Revisions will be published on the Platform with the updated date. Continued use constitutes acceptance.
        </p>
      </section>

      <section id="sec-49" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">49.</span> Privacy
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Use of the Platform is also governed by the ScanDriver Privacy Policy.
        </p>
      </section>

      <section id="sec-50" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">50.</span> Severability
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          If any provision is held invalid, remaining provisions continue in full force and effect.
        </p>
      </section>

      {/* 51 - 57 */}
      <section id="sec-51" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">51.</span> Waiver
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Failure to enforce any provision does not constitute a waiver of rights.
        </p>
      </section>

      <section id="sec-52" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">52.</span> Assignment
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver may assign rights under corporate restructuring or asset sales.
        </p>
      </section>

      <section id="sec-53" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">53.</span> Entire Agreement
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          These Terms, together with Privacy Policy and Refund Policy, constitute the complete agreement.
        </p>
      </section>

      <section id="sec-54" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">54.</span> Relationship of the Parties
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          No employment, partnership, agency or joint venture exists between ScanDriver and customers or Driver Partners.
        </p>
      </section>

      <section id="sec-55" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">55.</span> Feedback & Suggestions
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Suggestions voluntarily submitted may be used without restriction or compensation.
        </p>
      </section>

      <section id="sec-56" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">56.</span> Contact Information
        </h2>
        <div className="bg-background/60 border border-border rounded-xl p-5 space-y-2 text-sm text-foreground">
          <p className="font-bold text-gold-light text-base">ScanDriver Private Limited</p>
          <p className="flex items-center gap-2">
            <Globe size={14} className="text-gold" />
            <span>Website: </span>
            <a href={`https://${WEBSITE}`} target="_blank" rel="noopener noreferrer" className="text-gold-light hover:underline font-medium">
              www.scandriver.in
            </a>
          </p>
          <p className="flex items-center gap-2">
            <Mail size={14} className="text-gold" />
            <span>Email: </span>
            <a href={`mailto:${EMAIL}`} className="text-gold-light hover:underline font-medium">
              {EMAIL}
            </a>
          </p>
        </div>
      </section>

      <section id="sec-57" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">57.</span> Acceptance
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          By accessing or using the ScanDriver Platform, requesting a booking, or creating an account, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms and Conditions. © ScanDriver. All rights reserved.
        </p>
      </section>
    </LegalLayout>
  )
}
