'use client'

import React, { useState } from 'react'
import { Reveal } from '@/components/common/reveal'
import { SectionLabel } from '@/components/common/section-label'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Mail, Phone, User, Send, CheckCircle2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CustomerEnquirySection() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('customer_enquiries')
        .insert({
          name: name.trim(),
          phone: cleanPhone,
          email: email.trim() || null,
          message: message.trim() || null,
          status: 'pending'
        })

      if (error) throw error

      setSuccess(true)
      toast.success('Thank you! Your enquiry has been received.')
      setName('')
      setPhone('')
      setEmail('')
      setMessage('')
    } catch (err: any) {
      console.error('Enquiry submission error:', err)
      toast.error(err.message || 'Failed to submit enquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      className="py-24 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(201,146,42,0.05)_0%,transparent_80%),var(--background)] relative overflow-hidden"
      id="customer-enquiry"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/1 to-transparent pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Info Side (Col Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal>
              <SectionLabel>Get in Touch</SectionLabel>
              <h2 className="font-display text-[clamp(32px,3.5vw,48px)] font-bold text-foreground leading-tight mt-3">
                Have Questions?<br />
                <em className="italic text-gold-light">Send an Enquiry.</em>
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mt-4">
                Whether you need a monthly driver, corporate chauffeur, outstation round-trip, or have specific package queries, send us an enquiry. Our customer relationship team will reach out with customized quotes within 15 minutes.
              </p>
            </Reveal>

            {/* Quick Stats/Features */}
            <div className="space-y-4 pt-2">
              <Reveal delay={0.1}>
                <div className="flex items-center gap-3.5 bg-surface/50 border border-border/40 rounded-2xl p-4 transition-all duration-300 hover:border-gold/45">
                  <span className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold-light shrink-0">
                    <User size={18} />
                  </span>
                  <div>
                    <h4 className="text-[15px] font-semibold text-foreground">Dedicated Relationship Manager</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Assigned to handle all your bookings & updates</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="flex items-center gap-3.5 bg-surface/50 border border-border/40 rounded-2xl p-4 transition-all duration-300 hover:border-gold/45">
                  <span className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold-light shrink-0">
                    <MessageSquare size={18} />
                  </span>
                  <div>
                    <h4 className="text-[15px] font-semibold text-foreground">Tailored Custom Quotes</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Customized billing options for long term requirements</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Form Side (Col Span 7) */}
          <div className="lg:col-span-7">
            <Reveal delay={0.3}>
              <div className="bg-surface border border-border/60 rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
                {/* Accent glow corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

                {success ? (
                  <div className="text-center py-10 space-y-4 animate-in fade-in-50 zoom-in-95 duration-300">
                    <div className="h-14 w-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground font-display">Enquiry Submitted!</h3>
                      <p className="text-xs text-muted-foreground mt-2 max-w-[320px] mx-auto leading-relaxed">
                        Thank you for reaching out. A relationship specialist has been notified and will contact you on your WhatsApp / mobile number shortly.
                      </p>
                    </div>
                    <button
                      onClick={() => setSuccess(false)}
                      className="px-6 py-2 border border-border/40 text-xs font-bold rounded-xl text-gold-light hover:bg-gold/5 transition-all mt-4 cursor-pointer"
                    >
                      SUBMIT ANOTHER ENQUIRY
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                      <h3 className="text-lg font-bold text-foreground font-display mb-1">
                        Customer Enquiry Form
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        Please fill in your details and message to request a callback.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="relative">
                        <label className="text-[10px] font-bold text-foreground/80 block mb-1 uppercase tracking-wider">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                            <User size={14} />
                          </span>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-background border border-border/40 rounded-xl focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground/45 transition-colors"
                            placeholder="Enter your name"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="relative">
                        <label className="text-[10px] font-bold text-foreground/80 block mb-1 uppercase tracking-wider">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                            <Phone size={14} />
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-background border border-border/40 rounded-xl focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground/45 transition-colors"
                            placeholder="10-digit mobile number"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    {/* <div className="relative">
                      <label className="text-[10px] font-bold text-foreground/80 block mb-1 uppercase tracking-wider">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                          <Mail size={14} />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-background border border-border/40 rounded-xl focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground/45 transition-colors"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div> */}

                    {/* Message / Description */}
                    <div className="relative">
                      <label className="text-[10px] font-bold text-foreground/80 block mb-1 uppercase tracking-wider">
                        Your Message / Service Requirements
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className="w-full px-3.5 py-2.5 text-xs bg-background border border-border/40 rounded-xl focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground/45 transition-colors resize-none min-h-[80px]"
                        placeholder="Describe your driver needs, duration, dates, or specific location queries..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className={cn(
                        "w-full py-2.5 bg-gradient-to-r from-gold-light to-gold hover:opacity-95 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      )}
                    >
                      {submitting ? (
                        <>
                          <div className="h-4.5 w-4.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Submitting Enquiry...
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          Send Enquiry Request
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  )
}
