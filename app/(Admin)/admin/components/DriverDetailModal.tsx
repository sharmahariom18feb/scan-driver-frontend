'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Star,
  Award,
  Calendar,
  Car,
  Clock,
  Download,
  ZoomIn,
  Check,
  Copy,
  MessageCircle,
  User,
  FileText,
  ExternalLink,
  Briefcase,
  Users,
  AlertCircle
} from 'lucide-react'
import JSZip from 'jszip'
import { toast } from 'sonner'
import { Driver, Booking, DriverProfile, DriverDocument } from '../types'

interface DriverDetailModalProps {
  driver: Driver
  booking?: Booking | null
  onClose: () => void
}

export default function DriverDetailModal({ driver, booking, onClose }: DriverDetailModalProps) {
  const [mounted, setMounted] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [viewingImage, setViewingImage] = useState<{ url: string; label: string } | null>(null)
  const [downloadingZip, setDownloadingZip] = useState(false)

  // Mount to document.body and handle scroll lock + Escape key
  useEffect(() => {
    setMounted(true)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewingImage) {
          setViewingImage(null)
        } else {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, viewingImage])


  // Helper to extract profile
  const profile: DriverProfile | null = React.useMemo(() => {
    if (!driver.driver_profiles) return null
    if (Array.isArray(driver.driver_profiles)) {
      return driver.driver_profiles[0] || null
    }
    return driver.driver_profiles
  }, [driver])

  // Helper to extract documents
  const docs: DriverDocument | null = React.useMemo(() => {
    if (!driver.driver_documents) return null
    if (Array.isArray(driver.driver_documents)) {
      return driver.driver_documents[0] || null
    }
    return driver.driver_documents
  }, [driver])

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    toast.success(`${label} copied to clipboard!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const cleanPhone = (driver.phone || '').replace(/\D/g, '').slice(-10)

  // Document list
  const documentsList = [
    { label: 'Aadhaar Card (Front)', url: docs?.aadhaar_front_url, isPayment: false },
    { label: 'Aadhaar Card (Back)', url: docs?.aadhaar_back_url, isPayment: false },
    { label: 'Driving License', url: docs?.driving_license_url, isPayment: false },
    { label: 'PAN Card', url: docs?.pan_card_url, isPayment: false },
    { label: 'Selfie / Photo', url: docs?.selfie_url, isPayment: false },
    { label: 'Payment Receipt', url: docs?.payment, isPayment: true },
  ]

  const uploadedDocsCount = documentsList.filter(d => Boolean(d.url)).length

  // Download all docs as ZIP
  const handleDownloadZip = async (excludePayment = false) => {
    const validDocs = documentsList
      .filter((d) => !excludePayment || !d.isPayment)
      .filter((d) => Boolean(d.url))

    if (validDocs.length === 0) {
      toast.error(`No uploaded documents to download${excludePayment ? ' (without payment slip)' : ''}.`)
      return
    }

    setDownloadingZip(true)
    const toastId = toast.loading(`Zipping ${validDocs.length} documents${excludePayment ? ' (without payment slip)' : ''}...`)
    try {
      const zip = new JSZip()
      const driverFirstName = (driver.full_name || 'Driver').trim().split(/\s+/)[0]
      const driverId = driver.unique_id || driver.id.slice(0, 8)
      const baseZipName = excludePayment
        ? `${driverFirstName}_${driverId}_documents_without_payment`
        : `${driverFirstName}_${driverId}_documents`

      for (const item of validDocs) {
        if (!item.url) continue
        const response = await fetch(item.url)
        if (!response.ok) throw new Error(`Failed to fetch ${item.label}`)
        const blob = await response.blob()
        const extension = item.url.split('.').pop()?.split('?')[0] || 'jpg'
        zip.file(`${item.label.replace(/\s+/g, '_')}.${extension}`, blob)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const blobUrl = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${baseZipName}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)

      toast.success(`Documents ${excludePayment ? '(without payment slip) ' : ''}downloaded successfully!`, { id: toastId })
    } catch (err: any) {
      console.error('ZIP download error:', err)
      toast.error('Failed to download documents: ' + (err.message || 'Error'), { id: toastId })
    } finally {
      setDownloadingZip(false)
    }
  }

  // Copy full driver summary for dispatch / customer sharing
  const handleCopySummary = () => {
    const summary = `🚗 DRIVER DETAILS
Name: ${driver.full_name}
Phone: ${driver.phone}
License No: ${driver.license_no || 'N/A'}
Experience: ${profile?.experience || 'N/A'}
Current Area: ${driver.current_area || 'N/A'}
Rating: ${driver.rating || 5.0}★
Status: ${driver.verified ? 'Verified' : 'Pending Verification'}
${booking ? `Assigned Booking: ${booking.id} (${booking.type})` : ''}`

    navigator.clipboard.writeText(summary.trim())
    toast.success('Driver summary copied to clipboard!')
  }

  if (!mounted) return null

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* ─── Modal Header ─── */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            {/* Avatar / Selfie */}
            <div className="relative">
              {docs?.selfie_url ? (
                <img
                  src={docs.selfie_url}
                  alt={driver.full_name}
                  className="w-13 h-13 rounded-full object-cover border-2 border-amber-500/80 shadow-md"
                />
              ) : (
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
                  {driver.full_name?.charAt(0)?.toUpperCase() || 'D'}
                </div>
              )}
              {/* Online pulse indicator */}
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                  driver.is_online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
                title={driver.is_online ? 'Driver is Online' : 'Driver is Offline'}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {driver.full_name}
                </h3>
                {driver.unique_id && (
                  <span className="bg-slate-800 border border-slate-700 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    {driver.unique_id}
                  </span>
                )}
                {/* Rating Badge */}
                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold px-2 py-0.5 rounded-md">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {driver.rating || 5.0}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                {/* Verification Badge */}
                {driver.verified ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                    <ShieldCheck size={13} /> Verified Driver
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-semibold">
                    <ShieldAlert size={13} /> Unverified Profile
                  </span>
                )}
                <span className="text-slate-600">•</span>
                {/* Online / Offline */}
                <span className={`text-[11px] font-semibold ${driver.is_online ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {driver.is_online ? 'Active / Online' : 'Offline'}
                </span>
                {driver.is_suspended && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-rose-400 font-extrabold text-[11px] bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded">
                      SUSPENDED
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-full cursor-pointer hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
        </div>

        {/* ─── Assigned Booking Context Strip (if passed) ─── */}
        {booking && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 text-amber-300">
              <Car size={14} className="text-amber-400 shrink-0" />
              <span>
                Assigned to Booking: <strong className="text-white font-bold">{booking.id}</strong> ({booking.type} • {booking.vehicle})
              </span>
            </div>
            <div className="text-[11px] text-amber-200/80 font-medium">
              Customer: <span className="text-white font-semibold">{booking.customer_name}</span> ({booking.phone})
            </div>
          </div>
        )}

        {/* ─── Scrollable Modal Body ─── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-350">

          {/* 1. Quick Contact Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Phone & Direct Call */}
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Phone size={15} />
                </div>
                <div>
                  <p className="text-[9px] font-extrabold uppercase text-slate-500">Phone</p>
                  <p className="text-xs font-bold text-white">{driver.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {driver.phone && (
                  <>
                    <a
                      href={`tel:${driver.phone}`}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                      title="Call Driver"
                    >
                      <Phone size={13} />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(driver.phone, 'Phone number')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedField === 'Phone number' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* WhatsApp Quick Message */}
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle size={15} />
                </div>
                <div>
                  <p className="text-[9px] font-extrabold uppercase text-slate-500">WhatsApp</p>
                  <p className="text-xs font-bold text-white">+91 {cleanPhone || 'N/A'}</p>
                </div>
              </div>
              {cleanPhone && (
                <a
                  href={`https://wa.me/91${cleanPhone}?text=Hi%20${encodeURIComponent(driver.full_name)},%20this%20is%20ScanDriver%20Admin.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  CHAT
                </a>
              )}
            </div>

            {/* Operating Area */}
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin size={15} />
                </div>
                <div className="truncate">
                  <p className="text-[9px] font-extrabold uppercase text-slate-500">Current Area</p>
                  <p className="text-xs font-bold text-white truncate" title={driver.current_area || 'Delhi NCR'}>
                    {driver.current_area || 'Delhi NCR'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Address */}
          <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-lime-500/10 text-[#A3E635] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-extrabold uppercase text-slate-500">Current Address</p>
                {(driver.current_address || profile?.current_address) && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(driver.current_address || profile?.current_address || '', 'Address')}
                    className="text-slate-500 hover:text-white cursor-pointer"
                    title="Copy Address"
                  >
                    {copiedField === 'Address' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                )}
              </div>
              <p className="text-xs font-semibold text-white break-words mt-0.5">
                {driver.current_address || profile?.current_address || 'Not Provided'}
              </p>
            </div>
          </div>

          {/* 2. Professional Credentials & Driving Info */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635] flex items-center gap-1.5">
              <Award size={13} /> Driver Credentials & Experience
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* License Number */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl space-y-1">
                <span className="text-[9px] font-extrabold uppercase text-slate-500">Driving License</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-white truncate" title={driver.license_no || 'N/A'}>
                    {driver.license_no || 'Not Provided'}
                  </span>
                  {driver.license_no && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(driver.license_no, 'License Number')}
                      className="text-slate-500 hover:text-white cursor-pointer"
                      title="Copy License"
                    >
                      {copiedField === 'License Number' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                  )}
                </div>
              </div>

              {/* License Status */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl space-y-1">
                <span className="text-[9px] font-extrabold uppercase text-slate-500">License Status</span>
                <p className="text-xs font-bold text-white">
                  {profile?.license_status || 'Valid'}
                </p>
              </div>

              {/* Experience */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl space-y-1">
                <span className="text-[9px] font-extrabold uppercase text-slate-500">Experience</span>
                <p className="text-xs font-bold text-amber-400">
                  {profile?.experience || 'Experienced'}
                </p>
              </div>

              {/* Availability */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl space-y-1">
                <span className="text-[9px] font-extrabold uppercase text-slate-500">Availability</span>
                <p className="text-xs font-bold text-white capitalize">
                  {profile?.availability || 'On-demand'}
                </p>
              </div>
            </div>

            {/* Previous platforms & comments */}
            {(profile?.previous_platforms || profile?.additional_comments || driver.email) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {driver.email && (
                  <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl">
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block mb-0.5">Email Address</span>
                    <a
                      href={`mailto:${driver.email}`}
                      className="text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                    >
                      {driver.email}
                    </a>
                  </div>
                )}
                {profile?.previous_platforms && (
                  <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl">
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block mb-0.5">Previous Platforms</span>
                    <span className="text-xs font-semibold text-slate-200">{profile.previous_platforms}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Vehicle Specialties & Service Preferences */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635] flex items-center gap-1.5">
              <Car size={13} /> Capabilities & Preferences
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vehicle Specialties */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
                <span className="text-[9px] font-extrabold uppercase text-slate-500">Vehicle Specialties</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.vehicle_specialties && profile.vehicle_specialties.length > 0 ? (
                    profile.vehicle_specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded-lg"
                      >
                        {spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">All vehicle types (Manual & Automatic)</span>
                  )}
                </div>
              </div>

              {/* Service Preferences */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
                <span className="text-[9px] font-extrabold uppercase text-slate-500">Service Preferences</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.service_preference && profile.service_preference.length > 0 ? (
                    profile.service_preference.map((pref, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold rounded-lg"
                      >
                        {pref}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">Hourly, Outstation, Monthly</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Verification Documents (Interactive Gallery) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635] flex items-center gap-1.5">
                <FileText size={13} /> Verification Documents ({uploadedDocsCount}/{documentsList.length})
              </h4>
              {uploadedDocsCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleDownloadZip(false)}
                    disabled={downloadingZip}
                    className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                    title="Download all documents including payment receipt"
                  >
                    <Download size={11} /> {downloadingZip ? 'Zipping...' : 'Download All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadZip(true)}
                    disabled={downloadingZip}
                    className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 rounded-lg border border-amber-500/30 transition-colors cursor-pointer disabled:opacity-50"
                    title="Download verification documents without payment slip"
                  >
                    <Download size={11} /> Without Payment Slip
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {documentsList.map((doc, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-between text-center space-y-1.5"
                >
                  <span className="text-[9px] font-bold text-slate-400 line-clamp-1" title={doc.label}>
                    {doc.label}
                  </span>

                  {doc.url ? (
                    <div
                      onClick={() => setViewingImage({ url: doc.url!, label: doc.label })}
                      className="relative w-full h-20 rounded-lg overflow-hidden border border-slate-800 hover:border-amber-500 cursor-zoom-in group transition-all"
                    >
                      <img
                        src={doc.url}
                        alt={doc.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <ZoomIn size={14} className="text-white" />
                        <span className="text-[9px] font-bold text-white">VIEW</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-20 rounded-lg bg-slate-900 border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600">
                      <FileText size={16} />
                      <span className="text-[8px] font-bold mt-1 text-slate-500">Not Uploaded</span>
                    </div>
                  )}

                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[8px] font-extrabold text-amber-400 hover:underline uppercase inline-flex items-center gap-0.5"
                    >
                      Open <ExternalLink size={8} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Verification References */}
          {docs?.references && Array.isArray(docs.references) && docs.references.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635] flex items-center gap-1.5">
                <Users size={13} /> Emergency & Verification References
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {docs.references.map((ref, rIdx) => (
                  <div key={rIdx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                    <p className="text-[9px] font-extrabold text-amber-500 uppercase">
                      Reference {rIdx + 1}
                    </p>
                    <p className="text-xs text-slate-200">
                      <span className="text-slate-500 font-bold">Name:</span> {ref.fullName || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-200 flex items-center justify-between">
                      <span><span className="text-slate-500 font-bold">Phone:</span> {ref.phone || 'N/A'}</span>
                      {ref.phone && (
                        <a
                          href={`tel:${ref.phone}`}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-slate-800 transition-colors"
                          title="Call Reference"
                        >
                          <Phone size={11} />
                        </a>
                      )}
                    </p>
                    <p className="text-xs text-slate-200">
                      <span className="text-slate-500 font-bold">Relation:</span> {ref.relation || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ─── Modal Footer ─── */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Copy size={13} /> Copy Driver Summary
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>

      {/* ─── Document Zoom Lightbox Modal ─── */}
      {viewingImage && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setViewingImage(null)} />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 bg-slate-900 border border-slate-700 max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {viewingImage.label}
              </h4>
              <button
                onClick={() => setViewingImage(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto bg-slate-950/50">
              <img
                src={viewingImage.url}
                alt={viewingImage.label}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg border border-slate-800"
              />
            </div>
            <div className="px-5 py-3 border-t border-slate-800 flex justify-end gap-2 bg-slate-950">
              <a
                href={viewingImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 inline-flex items-center gap-1"
              >
                Open Original <ExternalLink size={12} />
              </a>
              <button
                onClick={() => setViewingImage(null)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )

  return createPortal(modalContent, document.body)
}
