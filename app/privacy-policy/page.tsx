import type { Metadata } from 'next'
import { LegalLayout, LegalSection } from '@/components/layout/legal-layout'
import { Lock, Check, ShieldCheck, Mail, Globe, Info } from 'lucide-react'
import { EMAIL, WEBSITE } from '@/constants'

export const metadata: Metadata = {
  title: 'Privacy Policy | ScanDriver',
  description: 'Read the official ScanDriver Privacy Policy to learn how we collect, store, protect, and handle your personal information.',
  alternates: {
    canonical: 'https://scandriver.in/privacy-policy',
  },
}

const sections: LegalSection[] = [
  { id: 'sec-intro', title: 'Privacy Policy Introduction' },
  { id: 'sec-1', title: '1. Information We Collect' },
  { id: 'sec-2', title: '2. How We Collect Information' },
  { id: 'sec-3', title: '3. How We Use Your Information' },
  { id: 'sec-4', title: '4. Sharing of Information' },
  { id: 'sec-5', title: '5. Payment Information' },
  { id: 'sec-6', title: '6. Cookies & Similar Technologies' },
  { id: 'sec-7', title: '7. Data Security' },
  { id: 'sec-8', title: '8. Account Security' },
  { id: 'sec-9', title: '9. Data Retention' },
  { id: 'sec-10', title: "10. Children's Privacy" },
  { id: 'sec-11', title: '11. Third-Party Links' },
  { id: 'sec-12', title: '12. Your Rights' },
  { id: 'sec-13', title: '13. Policy Updates' },
  { id: 'sec-14', title: '14. Contact Us' },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How ScanDriver collects, uses, stores, discloses, and safeguards your personal data."
      lastUpdated="July 20, 2026"
      icon={<Lock size={14} />}
      sections={sections}
    >
      {/* Introduction */}
      <section id="sec-intro" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Info size={20} className="text-gold-light" /> Introduction
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          At ScanDriver (&quot;ScanDriver&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we value your privacy and are committed to protecting your personal information.
        </p>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-3">
          This Privacy Policy explains how we collect, use, store, disclose and protect your information when you access or use our website, mobile applications (if any), WhatsApp services, customer support channels and any other services provided by ScanDriver (collectively, the &quot;Platform&quot;).
        </p>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-3">
          By using our Platform, you consent to the collection and use of your information as described in this Privacy Policy.
        </p>
      </section>

      {/* 1. Information We Collect */}
      <section id="sec-1" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">1.</span> Information We Collect
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
          Depending on the services you use, we may collect the following information:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-background/60 border border-border/80 p-5 rounded-xl">
            <h3 className="font-bold text-foreground text-base mb-2 text-gold-light">Personal Information</h3>
            <ul className="list-disc list-inside text-xs md:text-sm text-muted-foreground space-y-1">
              <li>Full Name</li>
              <li>Mobile Number</li>
              <li>Email Address</li>
              <li>Residential City</li>
              <li>Pickup Address</li>
              <li>Drop Location</li>
              <li>Vehicle Details (where applicable)</li>
            </ul>
          </div>

          <div className="bg-background/60 border border-border/80 p-5 rounded-xl">
            <h3 className="font-bold text-foreground text-base mb-2 text-gold-light">Driver Partner Information</h3>
            <ul className="list-disc list-inside text-xs md:text-sm text-muted-foreground space-y-1">
              <li>Name & Mobile Number</li>
              <li>Driving Licence</li>
              <li>Aadhaar / Identity Proof & PAN Card</li>
              <li>Address Proof & Photograph</li>
              <li>Bank Account Details</li>
              <li>Vehicle Information & Verification Documents</li>
            </ul>
          </div>

          <div className="bg-background/60 border border-border/80 p-5 rounded-xl">
            <h3 className="font-bold text-foreground text-base mb-2 text-gold-light">Technical Information</h3>
            <ul className="list-disc list-inside text-xs md:text-sm text-muted-foreground space-y-1">
              <li>IP Address & Browser Type</li>
              <li>Device Information & OS</li>
              <li>Device ID & Application Version</li>
              <li>Log Files & Crash Reports</li>
            </ul>
          </div>

          <div className="bg-background/60 border border-border/80 p-5 rounded-xl">
            <h3 className="font-bold text-foreground text-base mb-2 text-gold-light">Location Information</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              With your permission, location data is collected to allocate nearby Driver Partners, improve booking accuracy, assist navigation, and enhance customer support.
            </p>
          </div>
        </div>
      </section>

      {/* 2. How We Collect Information */}
      <section id="sec-2" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">2.</span> How We Collect Information
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3">
          Information may be collected when you:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm text-muted-foreground">
          {[
            'Visit our website',
            'Submit a booking request',
            'Contact customer support',
            'Register as a customer',
            'Register as a Driver Partner',
            'Upload verification documents',
            'Communicate through WhatsApp',
            'Respond to surveys or promotions',
            'Make payments',
            'Interact with our Platform',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2 bg-background/40 p-2.5 rounded-lg border border-border/40">
              <Check size={14} className="text-gold-light shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-4">
          We may also receive information from trusted third-party service providers involved in payment processing, verification, analytics and communication services.
        </p>
      </section>

      {/* 3. How We Use Your Information */}
      <section id="sec-3" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">3.</span> How We Use Your Information
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3">
          We use your information for legitimate business purposes including:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-sm md:text-base leading-relaxed pl-2">
          <li>Creating and managing your account and bookings.</li>
          <li>Allocating Driver Partners and verifying document compliance.</li>
          <li>Processing payments, issuing invoices, and delivering booking updates.</li>
          <li>Sending OTPs, security alerts, and preventing fraudulent activity.</li>
          <li>Complying with legal obligations, resolving disputes, and maintaining platform security.</li>
        </ul>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-4">
          Where permitted by law, we may also send promotional offers, service announcements and marketing communications. You may opt out of promotional communications at any time.
        </p>
      </section>

      {/* 4. Sharing of Information */}
      <section id="sec-4" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">4.</span> Sharing of Information
        </h2>
        <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 mb-4">
          <p className="text-sm font-bold text-gold-light">
            ScanDriver does NOT sell your personal information.
          </p>
        </div>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3">
          We may share information only where necessary with:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-sm md:text-base leading-relaxed pl-2">
          <li>Driver Partners for fulfilling your booking.</li>
          <li>Payment gateway providers & identity verification partners.</li>
          <li>Cloud hosting, SMS, WhatsApp, and customer support service providers.</li>
          <li>Analytics providers and law enforcement authorities where required by law.</li>
        </ul>
      </section>

      {/* 5. Payment Information */}
      <section id="sec-5" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">5.</span> Payment Information
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Online payments are processed through secure third-party payment service providers. ScanDriver does not store complete debit card, credit card or UPI credentials on its own servers. Payment processing is governed by the privacy policies and security practices of the respective payment providers.
        </p>
      </section>

      {/* 6. Cookies and Similar Technologies */}
      <section id="sec-6" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">6.</span> Cookies & Similar Technologies
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3">
          Our website may use cookies and similar technologies to improve website functionality, remember preferences, measure performance, and analyze visitor behaviour.
        </p>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          You may disable cookies through your browser settings; however, certain website features may become unavailable or function less effectively.
        </p>
      </section>

      {/* 7. Data Security */}
      <section id="sec-7" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">7.</span> Data Security
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          We implement commercially reasonable technical, administrative and organizational measures to protect personal information against unauthorized access, misuse, disclosure, alteration or destruction.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm md:text-base leading-relaxed mt-3 pl-2">
          <li>Secure servers & access controls</li>
          <li>Encrypted communications where applicable</li>
          <li>Internal security procedures & periodic monitoring</li>
        </ul>
      </section>

      {/* 8. Account Security */}
      <section id="sec-8" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">8.</span> Account Security
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          You are responsible for maintaining the confidentiality of your login credentials and OTPs. You agree to notify ScanDriver immediately if you suspect unauthorized access to your account.
        </p>
      </section>

      {/* 9. Data Retention */}
      <section id="sec-9" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">9.</span> Data Retention
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          We retain personal information only for as long as reasonably necessary to provide services, meet legal obligations, resolve disputes, enforce agreements, and prevent fraud. Afterwards, data is securely deleted or anonymized.
        </p>
      </section>

      {/* 10. Children's Privacy */}
      <section id="sec-10" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">10.</span> Children&apos;s Privacy
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          The Platform is not intended for individuals below 18 years of age. We do not knowingly collect personal information from children.
        </p>
      </section>

      {/* 11. Third-Party Links */}
      <section id="sec-11" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">11.</span> Third-Party Links
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          The Platform may contain links to third-party websites or services. ScanDriver does not control and is not responsible for the privacy practices or content of third-party websites.
        </p>
      </section>

      {/* 12. Your Rights */}
      <section id="sec-12" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">12.</span> Your Rights
        </h2>
        <p className="text-sm font-semibold text-foreground mb-2">Subject to applicable law, you may have the right to:</p>
        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-sm md:text-base leading-relaxed pl-2">
          <li>Access your personal information.</li>
          <li>Request correction of inaccurate information.</li>
          <li>Request deletion of information where legally permissible.</li>
          <li>Withdraw consent for certain processing activities.</li>
          <li>Update account details & opt out of promotional communications.</li>
        </ul>
      </section>

      {/* 13. Policy Updates */}
      <section id="sec-13" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">13.</span> Policy Updates
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          ScanDriver may update this Privacy Policy from time to time to reflect changes in law, technology or business operations. Updated versions will be published on our Platform with the revised &quot;Last Updated&quot; date.
        </p>
      </section>

      {/* 14. Contact Us */}
      <section id="sec-14" className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 scroll-mt-32">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-gold-light font-display">14.</span> Contact Us
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
          For questions regarding this Privacy Policy or your personal information, please contact:
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
        <div className="mt-6 p-4 rounded-xl bg-background/80 border border-border/80">
          <h4 className="font-bold text-xs uppercase tracking-wider text-gold-light mb-1">Consent</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By accessing or using the ScanDriver Platform, you acknowledge that you have read, understood and agreed to this Privacy Policy and consent to the collection, use and disclosure of your information as described herein. © ScanDriver. All rights reserved.
          </p>
        </div>
      </section>
    </LegalLayout>
  )
}
