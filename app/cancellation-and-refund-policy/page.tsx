import type { Metadata } from 'next'
import { LegalLayout, LegalSection } from '@/components/layout/legal-layout'
import { RefreshCw, CheckCircle2, AlertTriangle, HelpCircle, ShieldCheck, Mail, Globe } from 'lucide-react'
import { EMAIL, WEBSITE } from '@/constants'

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | ScanDriver',
  description: 'Understand ScanDriver cancellation terms, refund eligibility, processing times, and policies for driver bookings in Delhi NCR.',
  alternates: {
    canonical: 'https://scandriver.in/cancellation-and-refund-policy',
  },
}

const sections: LegalSection[] = [
  { id: 'sec-1', title: '1. Overview' },
  { id: 'sec-2', title: '2. Booking Cancellation by Customer' },
  { id: 'sec-3', title: '3. Cancellation by ScanDriver' },
  { id: 'sec-4', title: '4. Cancellation by Driver Partner' },
  { id: 'sec-5', title: '5. Refund Eligibility' },
  { id: 'sec-6', title: '6. Non-Refundable Situations' },
  { id: 'sec-7', title: '7. Refund Request Process' },
  { id: 'sec-8', title: '8. Refund Processing' },
  { id: 'sec-9', title: '9. Failed or Pending Transactions' },
  { id: 'sec-10', title: '10. Chargebacks' },
  { id: 'sec-11', title: '11. Fraudulent Claims' },
  { id: 'sec-12', title: '12. Force Majeure' },
  { id: 'sec-13', title: '13. Changes to this Policy' },
  { id: 'sec-14', title: '14. Contact Us' },
]

export default function CancellationAndRefundPolicyPage() {
  return (
    <LegalLayout
      title="Cancellation & Refund Policy"
      subtitle="Detailed rules governing cancellations, refund eligibility, and request timelines for ScanDriver services."
      lastUpdated="July 20, 2026"
      icon={<RefreshCw size={14} />}
      sections={sections}
    >
      {/* 1. Overview */}
      <section id="sec-1" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">1.</span> Overview
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          This Cancellation & Refund Policy (&quot;Policy&quot;) explains the circumstances under which ScanDriver (&quot;ScanDriver&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) may process cancellations and refunds for bookings made through our website, WhatsApp, customer support channels, or any other official booking platform.
        </p>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-3">
          By placing a booking with ScanDriver, you agree to this Policy.
        </p>
      </section>

      {/* 2. Booking Cancellation by Customer */}
      <section id="sec-2" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">2.</span> Booking Cancellation by Customer
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
          Customers may request cancellation of a booking by contacting ScanDriver through our official support channels.
        </p>
        <p className="text-sm font-semibold text-foreground mb-2">Cancellation charges, if any, may depend upon:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm md:text-base leading-relaxed pl-2">
          <li>Time remaining before the scheduled booking.</li>
          <li>Whether a Driver Partner has already been assigned.</li>
          <li>Whether the Driver Partner has commenced travel to the pickup location.</li>
          <li>Operational costs already incurred by ScanDriver.</li>
        </ul>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-4">
          Any applicable cancellation charges shall be communicated to the Customer at the time of cancellation, where reasonably practicable.
        </p>
      </section>

      {/* 3. Cancellation by ScanDriver */}
      <section id="sec-3" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">3.</span> Cancellation by ScanDriver
        </h2>
        <p className="text-sm font-semibold text-foreground mb-2">ScanDriver reserves the right to cancel a booking where:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm md:text-base leading-relaxed pl-2">
          <li>A suitable Driver Partner is unavailable.</li>
          <li>Incorrect or incomplete booking information has been provided.</li>
          <li>Payment authorization fails.</li>
          <li>Fraudulent or suspicious activity is detected.</li>
          <li>Service cannot be safely or legally provided.</li>
          <li>Circumstances beyond our reasonable control prevent fulfilment of the booking.</li>
        </ul>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-4">
          Where payment has already been received for a booking cancelled by ScanDriver, the Customer shall generally be eligible for a refund in accordance with this Policy.
        </p>
      </section>

      {/* 4. Cancellation by Driver Partner */}
      <section id="sec-4" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">4.</span> Cancellation by Driver Partner
        </h2>
        <p className="text-sm font-semibold text-foreground mb-2">
          A Driver Partner may cancel a booking due to circumstances including, but not limited to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm md:text-base leading-relaxed pl-2">
          <li>Medical emergencies.</li>
          <li>Personal emergencies.</li>
          <li>Safety concerns.</li>
          <li>Vehicle access issues.</li>
          <li>Force majeure events.</li>
        </ul>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-4">
          Where reasonably possible, ScanDriver will attempt to assign another available Driver Partner. If no replacement Driver Partner can be arranged and payment has already been collected, the Customer may be eligible for a refund.
        </p>
      </section>

      {/* 5. Refund Eligibility */}
      <section id="sec-5" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">5.</span> Refund Eligibility
        </h2>
        <p className="text-sm font-semibold text-foreground mb-2">Refunds may be considered in circumstances including:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {[
            'Booking cancelled by ScanDriver.',
            'Driver could not be assigned.',
            'Duplicate or multiple payments for the same booking.',
            'Failed transaction resulting in debit without booking confirmation.',
            'Incorrect amount charged due to a technical error.',
            'Other situations determined by ScanDriver to warrant a refund.',
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-background/50 border border-border/60 p-3.5 rounded-xl">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-xs md:text-sm text-foreground">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-4">
          Refunds are subject to verification and approval by ScanDriver.
        </p>
      </section>

      {/* 6. Non-Refundable Situations */}
      <section id="sec-6" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">6.</span> Non-Refundable Situations
        </h2>
        <p className="text-sm font-semibold text-foreground mb-2">Refunds may not be granted in circumstances including:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {[
            'Customer no-show.',
            'Incorrect booking information provided by the Customer.',
            'Cancellation after the Driver Partner has reached the pickup location, where cancellation charges apply.',
            'Services already completed.',
            'Delays caused by traffic, weather, road conditions, or other circumstances beyond ScanDriver’s reasonable control.',
            'Customer dissatisfaction not arising from any breach of ScanDriver’s obligations.',
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-background/50 border border-border/60 p-3.5 rounded-xl">
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span className="text-xs md:text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-4 font-medium">
          Nothing in this section limits any rights available to Customers under applicable law.
        </p>
      </section>

      {/* 7. Refund Request Process */}
      <section id="sec-7" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">7.</span> Refund Request Process
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
          To request a refund, Customers should contact ScanDriver Customer Support through the official support email or other designated support channels.
        </p>
        <p className="text-sm font-semibold text-foreground mb-2">The refund request should include, where applicable:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm md:text-base leading-relaxed pl-2">
          <li>Booking ID.</li>
          <li>Registered mobile number.</li>
          <li>Date of booking.</li>
          <li>Reason for the refund request.</li>
          <li>Supporting documents or screenshots, if available.</li>
        </ul>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-4">
          ScanDriver may request additional information to verify the claim before processing the refund.
        </p>
      </section>

      {/* 8. Refund Processing */}
      <section id="sec-8" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">8.</span> Refund Processing
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Where a refund request is approved, ScanDriver will make reasonable efforts to process the refund within <strong className="text-foreground font-semibold">7 to 10 business days</strong>.
        </p>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-3">
          Refunds will generally be credited to the original payment method used for the booking unless otherwise required by law or mutually agreed.
        </p>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-3">
          Actual credit timelines may vary depending upon the policies and processing times of banks, payment gateways, card issuers, UPI providers, or other financial institutions.
        </p>
      </section>

      {/* 9. Failed or Pending Transactions */}
      <section id="sec-9" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">9.</span> Failed or Pending Transactions
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          If payment has been debited but no booking confirmation has been generated due to a technical issue, Customers are requested to contact ScanDriver Customer Support.
        </p>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-3">
          Following verification, ScanDriver will make reasonable efforts to resolve the issue, including initiating a refund where appropriate.
        </p>
      </section>

      {/* 10. Chargebacks */}
      <section id="sec-10" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">10.</span> Chargebacks
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Customers may have the right to initiate a chargeback through their card issuer or financial institution in accordance with the terms governing their payment method.
        </p>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-3">
          Chargebacks are processed by the relevant financial institution and not by ScanDriver.
        </p>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-3">
          Where a chargeback is initiated, ScanDriver reserves the right to investigate the related booking and temporarily suspend any associated account if fraudulent activity is reasonably suspected.
        </p>
      </section>

      {/* 11. Fraudulent Claims */}
      <section id="sec-11" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">11.</span> Fraudulent Claims
        </h2>
        <p className="text-sm font-semibold text-foreground mb-2">ScanDriver reserves the right to reject refund requests where:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm md:text-base leading-relaxed pl-2">
          <li>False or misleading information has been provided.</li>
          <li>Fraudulent activity is suspected.</li>
          <li>The request is inconsistent with Platform records.</li>
          <li>Abuse of the refund process is detected.</li>
        </ul>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-4">
          Repeated misuse of the refund process may result in suspension or permanent termination of access to the Platform.
        </p>
      </section>

      {/* 12. Force Majeure */}
      <section id="sec-12" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">12.</span> Force Majeure
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver shall not be liable for delays in processing refunds arising from events beyond its reasonable control, including but not limited to: natural disasters, government restrictions, banking system outages, internet failures, payment gateway downtime, war, civil unrest, pandemics, or other force majeure events.
        </p>
      </section>

      {/* 13. Changes to this Policy */}
      <section id="sec-13" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">13.</span> Changes to this Policy
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver reserves the right to modify this Cancellation & Refund Policy at any time. Any updated version will be published on the Platform along with the revised &quot;Last Updated&quot; date. Continued use of the Platform after publication of the updated Policy constitutes acceptance of the revised Policy.
        </p>
      </section>

      {/* 14. Contact Us */}
      <section id="sec-14" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">14.</span> Contact Us
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
          For refund requests or questions relating to this Policy, please contact:
        </p>
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
          <p className="text-muted-foreground text-xs pt-1">
            Customer Support: As published on the Platform.
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
          This Cancellation & Refund Policy is effective from the date published on the ScanDriver Platform and forms an integral part of the ScanDriver Terms & Conditions. © ScanDriver. All rights reserved.
        </p>
      </section>
    </LegalLayout>
  )
}
