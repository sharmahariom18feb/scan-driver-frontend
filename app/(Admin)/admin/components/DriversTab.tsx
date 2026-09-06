'use client'

import React, { useState, useEffect } from 'react'
import { Search, ShieldCheck, UserCheck, ShieldAlert, Star, Phone, MapPin, Award, CheckCircle, Ban, Key, X, Edit, Trash2, Upload, Download, UserX, FileSpreadsheet } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import JSZip from 'jszip'
import { Driver } from '../types'

interface DriversTabProps {
  onRefresh: () => void
  mode?: 'active' | 'suspended'
}

export default function DriversTab({ onRefresh, mode = 'active' }: DriversTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all')
  const [onlineFilter, setOnlineFilter] = useState<'all' | 'online' | 'offline'>('all')

  // Pagination & Loading States
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Image viewing modal states
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null)
  const [viewingImageLabel, setViewingImageLabel] = useState<string>('')

  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null)
  const [exportingExcel, setExportingExcel] = useState(false)

  const getProfile = (d: Driver) => {
    if (!d.driver_profiles) return null
    if (Array.isArray(d.driver_profiles)) {
      return d.driver_profiles[0] || null
    }
    return d.driver_profiles
  }

  const getDocuments = (d: Driver) => {
    if (!d.driver_documents) return null
    if (Array.isArray(d.driver_documents)) {
      return d.driver_documents[0] || null
    }
    return d.driver_documents
  }

  const downloadAllDocuments = async (d: Driver, excludePayment = false) => {
    const docs = getDocuments(d)
    if (!docs) {
      toast.error('No documents to download')
      return
    }

    const allFiles = [
      { label: 'Aadhaar_Front', url: docs.aadhaar_front_url },
      { label: 'Aadhaar_Back', url: docs.aadhaar_back_url },
      { label: 'Driving_License', url: docs.driving_license_url },
      { label: 'PAN_Card', url: docs.pan_card_url },
      { label: 'Selfie', url: docs.selfie_url },
      { label: 'Payment_Receipt', url: docs.payment, isPayment: true },
    ]

    const filesToDownload = allFiles
      .filter((item) => !excludePayment || !item.isPayment)
      .filter((item): item is { label: string; url: string; isPayment?: boolean } => !!item.url)

    if (filesToDownload.length === 0) {
      toast.error(`No uploaded documents found for this driver${excludePayment ? ' (excluding payment slip)' : ''}`)
      return
    }

    const toastId = toast.loading(`Preparing ZIP with ${filesToDownload.length} documents${excludePayment ? ' (without payment slip)' : ''}...`)

    try {
      const zip = new JSZip()
      const driverFirstName = (d.full_name || 'Driver').trim().split(/\s+/)[0]
      const driverId = d.unique_id || d.id || 'NoID'
      const driverLocation = (d.current_area || 'NoLocation').trim().replace(/\s+/g, '_')
      
      const baseZipName = excludePayment
        ? `${driverFirstName}_${driverId}_${driverLocation}_without_payment`
        : `${driverFirstName}_${driverId}_${driverLocation}`

      for (let i = 0; i < filesToDownload.length; i++) {
        const item = filesToDownload[i]
        const response = await fetch(item.url)
        if (!response.ok) {
          throw new Error(`Failed to fetch ${item.label}`)
        }
        const blob = await response.blob()
        const extension = item.url.split('.').pop()?.split('?')[0] || 'jpg'
        
        const fileNameInsideZip = `${baseZipName}_${item.label}.${extension}`
        zip.file(fileNameInsideZip, blob)
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

      toast.success(`Documents ${excludePayment ? '(without payment slip) ' : ''}zipped and downloaded successfully!`, { id: toastId })
    } catch (error) {
      console.error('Error generating zip:', error)
      toast.error('Failed to download documents as ZIP', { id: toastId })
    }
  }

  const renderVerificationSection = (d: Driver) => {
    const docs = getDocuments(d)
    
    const getDocsArray = (documentsObject: any) => {
      return [
        { label: 'Aadhaar Front', field: 'aadhaar_front_url', url: documentsObject?.aadhaar_front_url },
        { label: 'Aadhaar Back', field: 'aadhaar_back_url', url: documentsObject?.aadhaar_back_url },
        { label: 'Driving License', field: 'driving_license_url', url: documentsObject?.driving_license_url },
        { label: 'PAN Card', field: 'pan_card_url', url: documentsObject?.pan_card_url },
        { label: 'Selfie', field: 'selfie_url', url: documentsObject?.selfie_url },
        { label: 'Payment Receipt', field: 'payment', url: documentsObject?.payment },
      ]
    }

    const docsArray = getDocsArray(docs)

    return (
      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4">
        {/* Document images */}
        <div>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635]">Uploaded Verification Documents</h4>
            {docsArray.some(doc => !!doc.url) && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => downloadAllDocuments(d, false)}
                  className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-[9px] py-1 px-2.5 rounded-lg border border-slate-700 transition-all cursor-pointer"
                  title="Download all documents including payment slip"
                >
                  <Download size={10} /> DOWNLOAD ALL
                </button>
                <button
                  type="button"
                  onClick={() => downloadAllDocuments(d, true)}
                  className="inline-flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 font-extrabold text-[9px] py-1 px-2.5 rounded-lg border border-amber-500/30 transition-all cursor-pointer"
                  title="Download verification documents without payment slip"
                >
                  <Download size={10} /> WITHOUT PAYMENT SLIP
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {docsArray.map((doc, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center space-y-1.5 relative">
                <span className="text-[9px] font-bold text-slate-400 text-center">{doc.label}</span>
                {doc.url ? (
                  <>
                    <button 
                      type="button"
                      onClick={() => {
                        setViewingImageUrl(doc.url || null)
                        setViewingImageLabel(doc.label)
                      }}
                      className="relative block w-full h-20 rounded-lg overflow-hidden border border-slate-750 hover:border-amber-500 transition-all group cursor-zoom-in"
                    >
                      <img src={doc.url} alt={doc.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[8px] font-extrabold text-white bg-slate-950/80 px-1.5 py-0.5 rounded">ZOOM</span>
                      </div>
                    </button>
                    <div className="flex w-full gap-1 mt-1">
                      <label className="flex-grow text-center py-1 bg-slate-800 hover:bg-slate-700 text-slate-350 font-extrabold text-[8px] rounded border border-slate-700 cursor-pointer transition-all">
                        REPLACE
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          disabled={managingDocId === `${d.id}-${doc.field}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleDocumentAction(d.id, doc.field, 'replace', file)
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        disabled={managingDocId === `${d.id}-${doc.field}`}
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete this ${doc.label} document?`)) {
                            handleDocumentAction(d.id, doc.field, 'delete')
                          }
                        }}
                        className="p-1 bg-rose-950/40 hover:bg-rose-900 border border-rose-900 text-rose-300 hover:text-rose-200 font-extrabold text-[8px] rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
                        title="Delete Document"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full">
                    <span className="text-[9px] text-rose-450 italic py-2">Not Uploaded</span>
                    <label className="w-full text-center py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[8px] rounded cursor-pointer transition-all flex items-center justify-center gap-1">
                      <Upload size={8} /> UPLOAD
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        disabled={managingDocId === `${d.id}-${doc.field}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleDocumentAction(d.id, doc.field, 'replace', file)
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* References */}
        {docs && docs.references && Array.isArray(docs.references) && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635]">Verification References</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {docs.references.map((ref: any, refIdx: number) => (
                <div key={refIdx} className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-1">
                  <p className="text-[9px] font-extrabold text-amber-500 uppercase font-display">Reference {refIdx + 1}</p>
                  <p className="text-[11px] text-slate-200"><span className="font-bold text-slate-400">Name:</span> {ref.fullName || 'N/A'}</p>
                  <p className="text-[11px] text-slate-200"><span className="font-bold text-slate-400">Phone:</span> {ref.phone || 'N/A'}</p>
                  <p className="text-[11px] text-slate-200"><span className="font-bold text-slate-400">Relation:</span> {ref.relation || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }


  // Edit driver profile modal states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  
  // User fields
  const [editFullName, setEditFullName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editLicenseNo, setEditLicenseNo] = useState('')
  const [editCurrentArea, setEditCurrentArea] = useState('')
  const [editCurrentAddress, setEditCurrentAddress] = useState('')
  const [editRating, setEditRating] = useState(5.0)
  const [editVerified, setEditVerified] = useState(false)
  const [editIsOnline, setEditIsOnline] = useState(false)
  const [editRole, setEditRole] = useState<'ADMIN' | 'DRIVER' | 'CUSTOMER'>('DRIVER')
  const [editUniqueId, setEditUniqueId] = useState('')

  // Driver profile fields
  const [editExperience, setEditExperience] = useState('')
  const [editLicenseStatus, setEditLicenseStatus] = useState('')
  const [editAvailability, setEditAvailability] = useState('')
  const [editPreviousPlatforms, setEditPreviousPlatforms] = useState('')
  const [editAdditionalComments, setEditAdditionalComments] = useState('')
  const [editServicePreference, setEditServicePreference] = useState<string[]>([])
  const [editVehicleSpecialties, setEditVehicleSpecialties] = useState<string[]>([])

  const [editReferences, setEditReferences] = useState<{ fullName: string; phone: string; relation: string }[]>([
    { fullName: '', phone: '', relation: '' },
    { fullName: '', phone: '', relation: '' },
    { fullName: '', phone: '', relation: '' }
  ])

  const [savingProfile, setSavingProfile] = useState(false)

  const openEditModal = (d: Driver) => {
    setEditingDriver(d)
    const profile = getProfile(d)
    
    // User fields
    setEditFullName(d.full_name || '')
    setEditPhone(d.phone || '')
    setEditEmail(d.email || '')
    setEditLicenseNo(d.license_no || '')
    setEditCurrentArea(d.current_area || '')
    setEditCurrentAddress(d.current_address || profile?.current_address || '')
    setEditRating(Number(d.rating) || 5.0)
    setEditVerified(!!d.verified)
    setEditIsOnline(!!d.is_online)
    setEditRole((d.role as any) || 'DRIVER')
    setEditUniqueId(d.unique_id || '')

    // Profile fields
    setEditExperience(profile?.experience || '')
    setEditLicenseStatus(profile?.license_status || '')
    setEditAvailability(profile?.availability || '')
    setEditPreviousPlatforms(profile?.previous_platforms || '')
    setEditAdditionalComments(profile?.additional_comments || '')
    setEditServicePreference(profile?.service_preference || [])
    setEditVehicleSpecialties(profile?.vehicle_specialties || [])

    // References fields
    const docs = getDocuments(d)
    const initialRefs = docs?.references || []
    const parsedRefs = [
      { fullName: initialRefs[0]?.fullName || '', phone: initialRefs[0]?.phone || '', relation: initialRefs[0]?.relation || '' },
      { fullName: initialRefs[1]?.fullName || '', phone: initialRefs[1]?.phone || '', relation: initialRefs[1]?.relation || '' },
      { fullName: initialRefs[2]?.fullName || '', phone: initialRefs[2]?.phone || '', relation: initialRefs[2]?.relation || '' }
    ]
    setEditReferences(parsedRefs)

    setEditModalOpen(true)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDriver) return

    setSavingProfile(true)
    const toastId = toast.loading('Saving changes...')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const payload = {
        driverId: editingDriver.id,
        userData: {
          full_name: editFullName,
          phone: editPhone,
          email: editEmail || null,
          license_no: editLicenseNo,
          current_area: editCurrentArea,
          current_address: editCurrentAddress || null,
          rating: Number(editRating),
          verified: editVerified,
          is_online: editIsOnline,
          role: editRole,
          unique_id: editUniqueId || null
        },
        profileData: editRole === 'DRIVER' ? {
          experience: editExperience,
          license_status: editLicenseStatus,
          availability: editAvailability,
          previous_platforms: editPreviousPlatforms || null,
          additional_comments: editAdditionalComments || null,
          current_address: editCurrentAddress || null,
          service_preference: editServicePreference,
          vehicle_specialties: editVehicleSpecialties
        } : null,
        documentData: editRole === 'DRIVER' ? {
          references: editReferences
        } : null
      }

      const response = await fetch('/api/admin/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      const res = await response.json()
      if (!response.ok) {
        throw new Error(res.error || 'Failed to update profile')
      }

      toast.success('Driver profile updated successfully!', { id: toastId })
      setEditModalOpen(false)
      fetchDriversLocal()
      onRefresh()
    } catch (err: any) {
      console.error('Error saving profile:', err)
      toast.error(err.message || 'An error occurred while saving profile', { id: toastId })
    } finally {
      setSavingProfile(false)
    }
  }

  // Document management states & handlers
  const [managingDocId, setManagingDocId] = useState<string | null>(null)

  const handleDocumentAction = async (driverId: string, field: string, action: 'delete' | 'replace', file?: File) => {
    const key = `${driverId}-${field}`
    setManagingDocId(key)
    const toastId = toast.loading(`${action === 'delete' ? 'Deleting' : 'Uploading'} document...`)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      let newUrl = ''
      if (action === 'replace' && file) {
        const { uploadToCloudinary } = await import('@/lib/cloudinary')
        newUrl = await uploadToCloudinary(file)
      }

      const response = await fetch('/api/admin/manage-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          driverId,
          action,
          documentField: field,
          newUrl: action === 'replace' ? newUrl : undefined
        })
      })

      const res = await response.json()
      if (!response.ok) {
        throw new Error(res.error || `Failed to ${action} document`)
      }

      toast.success(`Document ${action === 'delete' ? 'deleted' : 'updated'} successfully!`, { id: toastId })
      fetchDriversLocal()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || `An error occurred during document ${action}`, { id: toastId })
    } finally {
      setManagingDocId(null)
    }
  }


  // Password reset states
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [targetDriverId, setTargetDriverId] = useState<string | null>(null)
  const [targetDriverName, setTargetDriverName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)

  const openResetModal = (driverId: string, driverName: string) => {
    setTargetDriverId(driverId)
    setTargetDriverName(driverName)
    setNewPassword('')
    setResetModalOpen(true)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetDriverId || !newPassword) return

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setResettingPassword(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('You must be logged in as admin to perform this action')
      }

      const response = await fetch('/api/reset-driver-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          driverId: targetDriverId,
          newPassword: newPassword
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password')
      }

      toast.success('Driver password reset successfully!')
      setResetModalOpen(false)
    } catch (err: any) {
      console.error('Password reset error:', err)
      toast.error(err.message || 'An error occurred during password reset')
    } finally {
      setResettingPassword(false)
    }
  }

  // Fetch paginated, filtered drivers
  const fetchDriversLocal = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('users')
        .select('*, driver_profiles(*), driver_documents(*)', { count: 'exact' })
        .eq('role', 'DRIVER')

      // Filter by mode: active vs suspended
      if (mode === 'suspended') {
        query = query.eq('is_suspended', true)
      } else {
        query = query.eq('is_suspended', false)
      }

      // 1. Apply Search Filter
      if (searchTerm.trim()) {
        const term = `%${searchTerm.trim()}%`
        query = query.or(`full_name.ilike.${term},phone.ilike.${term},license_no.ilike.${term},current_area.ilike.${term}`)
      }

      // 2. Apply Verification Filter
      if (verificationFilter !== 'all') {
        query = query.eq('verified', verificationFilter === 'verified')
      }

      // 3. Apply Online Status Filter
      if (onlineFilter !== 'all') {
        query = query.eq('is_online', onlineFilter === 'online')
      }

      // 4. Sorting & Range
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      setDrivers((data || []) as Driver[])
      setTotalCount(count || 0)
    } catch (err: any) {
      console.error('Error fetching drivers:', err)
      toast.error('Failed to load drivers from database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDriversLocal()
  }, [mode, page, pageSize, searchTerm, verificationFilter, onlineFilter])

  // Custom filters state updater to reset page to 1
  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    setPage(1)
  }

  const handleVerificationFilterChange = (val: typeof verificationFilter) => {
    setVerificationFilter(val)
    setPage(1)
  }

  const handleOnlineFilterChange = (val: typeof onlineFilter) => {
    setOnlineFilter(val)
    setPage(1)
  }

  // Wrapper to refresh parent statistics and local list
  const refreshAll = () => {
    onRefresh()
    fetchDriversLocal()
  }

  const filteredDrivers = drivers

  // Verify/Suspend Action
  const toggleVerification = async (driverId: string, currentStatus: boolean) => {
    setUpdatingId(driverId)
    const newStatus = !currentStatus

    try {
      const { error } = await supabase
        .from('users')
        .update({ verified: newStatus })
        .eq('id', driverId)

      if (error) throw error

      toast.success(`Driver verification ${newStatus ? 'Approved' : 'Removed'}!`)

      // Add a system notification to the driver
      await supabase.from('notifications').insert({
        driver_id: driverId,
        title: newStatus ? 'Account Approved!' : 'Verification Status Removed',
        description: newStatus 
          ? 'Your ScanDriver profile has been verified and approved by the administrator. You are now authorized to accept rides!' 
          : 'Your account verification has been removed by the administrator.',
        time: 'Just now',
        type: 'system',
        read: false,
      })

      refreshAll()
    } catch (err: any) {
      console.error('Error toggling driver verification:', err)
      toast.error(err.message || 'Failed to update verification status')
    } finally {
      setUpdatingId(null)
    }
  }

  // Suspend/Unsuspend Action
  const toggleSuspension = async (driverId: string, currentSuspended: boolean) => {
    setUpdatingId(driverId)
    const newSuspended = !currentSuspended

    try {
      const updateData: any = { is_suspended: newSuspended }
      if (newSuspended) {
        updateData.is_online = false
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', driverId)

      if (error) throw error

      toast.success(`Driver account ${newSuspended ? 'Suspended' : 'Activated'}!`)

      // Add a system notification to the driver
      await supabase.from('notifications').insert({
        driver_id: driverId,
        title: newSuspended ? 'Account Suspended' : 'Account Activated',
        description: newSuspended 
          ? 'Your account has been temporarily suspended by the administrator. Contact support for details.'
          : 'Your ScanDriver profile has been reactivated. You are now authorized to accept rides!',
        time: 'Just now',
        type: 'system',
        read: false,
      })

      refreshAll()
    } catch (err: any) {
      console.error('Error toggling driver suspension:', err)
      toast.error(err.message || 'Failed to update suspension status')
    } finally {
      setUpdatingId(null)
    }
  }

  // Reject/Delete Driver Action
  const handleRejectDriver = async (driverId: string) => {
    const confirmReject = window.confirm('Are you sure you want to reject and delete this driver request?')
    if (!confirmReject) return

    setUpdatingId(driverId)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('You must be logged in as admin to perform this action')
      }

      const response = await fetch('/api/delete-driver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ driverId })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject driver')
      }

      toast.success('Driver application rejected and deleted successfully!')
      refreshAll()
    } catch (err: any) {
      console.error('Error rejecting driver:', err)
      toast.error(err.message || 'Failed to reject driver')
    } finally {
      setUpdatingId(null)
    }
  }

  // Force Toggle Online Action (For Admin convenience/testing)
  const toggleOnline = async (driverId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_online: !currentStatus })
        .eq('id', driverId)

      if (error) throw error
      toast.success(`Driver set to ${!currentStatus ? 'Online' : 'Offline'}`)
      refreshAll()
    } catch (err: any) {
      console.error('Error toggling online status:', err)
      toast.error(err.message || 'Failed to update online status')
    }
  }

  // Minimal Driver Data Excel Export
  const handleExportExcel = async () => {
    setExportingExcel(true)
    const toastId = toast.loading('Generating Excel export...')
    try {
      let query = supabase
        .from('users')
        .select('*, driver_profiles(*)')
        .eq('role', 'DRIVER')

      if (mode === 'suspended') {
        query = query.eq('is_suspended', true)
      } else {
        query = query.eq('is_suspended', false)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        toast.info('No driver data found to export.', { id: toastId })
        return
      }

      const minimalData = data.map((d: any) => {
        const profile = Array.isArray(d.driver_profiles) ? d.driver_profiles[0] : d.driver_profiles
        return {
          'Driver ID': d.unique_id || 'N/A',
          'Full Name': d.full_name || 'N/A',
          'Mobile': d.phone || 'N/A',
          'License No': d.license_no || 'N/A',
          'Area': d.current_area || 'N/A',
          'Current Address': d.current_address || profile?.current_address || 'Not provided',
          'Rating': Number(d.rating || 5.0).toFixed(2),
          'Verification': d.verified ? 'Verified' : 'Pending',
          'Status': d.is_suspended ? 'Suspended' : 'Active',
          'Online': d.is_online ? 'Online' : 'Offline',
          'Joined Date': d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN') : 'N/A'
        }
      })

      const XLSX = await import('xlsx')
      const worksheet = XLSX.utils.json_to_sheet(minimalData)

      // Set clean column widths
      worksheet['!cols'] = [
        { wch: 14 }, // Driver ID
        { wch: 24 }, // Full Name
        { wch: 18 }, // Mobile
        { wch: 24 }, // License No
        { wch: 24 }, // Area
        { wch: 36 }, // Current Address
        { wch: 10 }, // Rating
        { wch: 15 }, // Verification
        { wch: 14 }, // Status
        { wch: 12 }, // Online
        { wch: 14 }, // Joined Date
      ]

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, mode === 'suspended' ? 'Suspended Drivers' : 'Drivers')

      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `ScanDriver_${mode === 'suspended' ? 'Suspended_Drivers' : 'Drivers'}_${dateStr}.xlsx`

      XLSX.writeFile(workbook, filename)
      toast.success(`Exported ${minimalData.length} drivers to Excel!`, { id: toastId })
    } catch (err: any) {
      console.error('Error exporting Excel:', err)
      toast.error(err.message || 'Failed to export Excel file', { id: toastId })
    } finally {
      setExportingExcel(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            {mode === 'suspended' ? (
              <>
                <UserX className="text-rose-400" size={24} /> Suspended Drivers
              </>
            ) : (
              'Drivers'
            )}
          </h1>
          <p className="text-slate-200 text-xs mt-1">
            {mode === 'suspended'
              ? 'Review temporarily suspended driver accounts and reactivate access when needed.'
              : 'Verify licenses, manage account status, and track online drivers.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 border border-emerald-500/30"
            title="Export Driver Data to Excel (.xlsx)"
          >
            {exportingExcel ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet size={15} />
            )}
            <span>{exportingExcel ? 'Exporting...' : 'Export Excel'}</span>
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900 border border-slate-700/80 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-500 transition-colors"
            placeholder="Search by name, phone, license, area..."
          />
        </div>

        {/* Verification Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700 overflow-x-auto">
          {(['all', 'verified', 'pending'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleVerificationFilterChange(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                verificationFilter === status
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-355 hover:text-white'
              }`}
            >
              {status === 'pending' ? 'Pending Approval' : status}
            </button>
          ))}
        </div>

        {/* Online Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700 overflow-x-auto">
          {(['all', 'online', 'offline'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleOnlineFilterChange(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                onlineFilter === status
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-350 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers List */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all duration-200">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-750 px-4 py-2.5 rounded-xl shadow-xl">
              <div className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-extrabold">Syncing with server...</span>
            </div>
          </div>
        )}
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-[10px] uppercase font-bold tracking-widest text-slate-300">
                <th className="py-4 px-5">Driver Name</th>
                <th className="py-4 px-5">Mobile</th>
                <th className="py-4 px-5">License</th>
                <th className="py-4 px-5">Area & Rating</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400 italic">
                    {mode === 'suspended'
                      ? 'No suspended drivers found.'
                      : 'No drivers registered matching current filters.'}
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d) => (
                  <React.Fragment key={d.id}>
                    <tr className="hover:bg-slate-800/30 transition-all text-xs">
                    {/* Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center font-extrabold text-slate-400">
                          {(d.full_name || '').split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || ''}
                        </div>
                        <div>
                          <p className="font-extrabold text-white flex items-center gap-1.5">
                            {d.full_name}
                            {d.verified && <ShieldCheck size={14} className="text-emerald-400" />}
                          </p>
                          {d.unique_id && (
                            <p className="text-[9px] font-mono text-slate-400 mt-0.5 select-all">
                              ID: {d.unique_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-100 flex items-center gap-1">
                        <Phone size={11} className="text-slate-450 shrink-0" /> {d.phone}
                      </p>
                    </td>

                    {/* License */}
                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <p className="font-bold text-white tracking-wide font-mono uppercase">{d.license_no}</p>
                        <p className="text-[9px] text-slate-350 uppercase tracking-widest font-bold flex items-center gap-1">
                          <Award size={10} className="text-amber-500" /> Professional Class
                        </p>
                      </div>
                    </td>

                    {/* Rating & Area */}
                    <td className="py-4 px-5 max-w-[240px]">
                      <div className="space-y-0.5">
                        <p className="text-slate-100 font-bold flex items-center gap-1">
                          <MapPin size={11} className="text-slate-450 shrink-0" /> {d.current_area}
                        </p>
                        <p
                          className="text-[10px] text-slate-350 line-clamp-2 break-words leading-tight"
                          title={d.current_address || getProfile(d)?.current_address || 'Not provided'}
                        >
                          <span className="text-slate-500 font-semibold">Address:</span>{' '}
                          {d.current_address || getProfile(d)?.current_address || (
                            <span className="text-slate-500 italic">Not provided</span>
                          )}
                        </p>
                        <p className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 pt-0.5">
                          <Star size={10} className="fill-amber-450" /> {Number(d.rating).toFixed(2)} / 5.0
                        </p>
                      </div>
                    </td>

                    {/* Online status */}
                    <td className="py-4 px-5">
                      <button
                        onClick={() => toggleOnline(d.id, d.is_online)}
                        className="flex items-center gap-1.5 hover:underline text-left cursor-pointer bg-transparent border-0 p-0"
                      >
                        <span className={`h-2 w-2 rounded-full ${d.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                        <span className="font-bold text-slate-200">{d.is_online ? 'Online' : 'Offline'}</span>
                      </button>
                    </td>

                     {/* Verification Toggle & Reset Password */}
                    <td className="py-4 px-5 text-right whitespace-nowrap space-x-2">
                      {!d.verified ? (
                        <>
                          <button
                            onClick={() => toggleVerification(d.id, d.verified)}
                            disabled={updatingId === d.id}
                            className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/5"
                          >
                            <UserCheck size={12} /> APPROVE
                          </button>
                          <button
                            onClick={() => handleRejectDriver(d.id)}
                            disabled={updatingId === d.id}
                            className="inline-flex items-center gap-1 bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-500 hover:text-slate-950 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Ban size={12} /> REJECT
                          </button>
                        </>
                      ) : d.is_suspended ? (
                        <button
                          onClick={() => toggleSuspension(d.id, d.is_suspended)}
                          disabled={updatingId === d.id}
                          className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          <UserCheck size={12} /> UNSUSPEND
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleSuspension(d.id, d.is_suspended)}
                          disabled={updatingId === d.id}
                          className="inline-flex items-center gap-1 bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-500 hover:text-slate-950 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Ban size={12} /> SUSPEND
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(d)}
                        className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                      >
                        <Edit size={12} /> EDIT PROFILE
                      </button>
                      <button
                        onClick={() => openResetModal(d.id, d.full_name)}
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer border border-slate-700"
                      >
                        <Key size={12} /> RESET PASSWORD
                      </button>
                      <button
                        onClick={() => setExpandedDriverId(expandedDriverId === d.id ? null : d.id)}
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer border border-slate-700"
                      >
                        {expandedDriverId === d.id ? 'HIDE DETAILS' : 'VIEW DETAILS'}
                      </button>
                    </td>
                  </tr>
                  {expandedDriverId === d.id && (() => {
                    const profile = getProfile(d)
                    return (
                      <tr className="bg-slate-950/60 text-xs">
                        <td colSpan={6} className="py-4 px-6 border-b border-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635]">Background & Licence</h4>
                              <p><span className="font-bold text-white">Experience:</span> {profile ? profile.experience : 'N/A'}</p>
                              <p><span className="font-bold text-white">Licence Validity:</span> {profile ? profile.license_status : 'N/A'}</p>
                              <p><span className="font-bold text-white">Documents:</span> {profile && profile.documents_available.length > 0 ? profile.documents_available.join(', ') : 'None selected'}</p>
                            </div>
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635]">Availability & Preference</h4>
                              <p><span className="font-bold text-white">Kaam schedule:</span> {profile ? profile.availability : 'N/A'}</p>
                              <p><span className="font-bold text-white">Service Preference:</span> {profile && profile.service_preference.length > 0 ? profile.service_preference.join(', ') : 'None selected'}</p>
                              <p><span className="font-bold text-white">Vehicles:</span> {profile && profile.vehicle_specialties.length > 0 ? profile.vehicle_specialties.join(', ') : 'None selected'}</p>
                            </div>
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635]">Additional Details</h4>
                              <p><span className="font-bold text-white">Pehle platform pe:</span> {profile ? (profile.previous_platforms || 'Nahi') : 'N/A'}</p>
                              <p className="whitespace-pre-wrap"><span className="font-bold text-white">Comments:</span> {profile ? (profile.additional_comments || 'Nahi') : 'N/A'}</p>
                            </div>
                          </div>
                          {renderVerificationSection(d)}
                        </td>
                      </tr>
                    )
                  })()}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="block md:hidden divide-y divide-slate-800/80">
          {filteredDrivers.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-400 italic">No drivers found.</p>
          ) : (
            filteredDrivers.map((d) => (
              <div key={d.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center font-extrabold text-slate-400 text-xs">
                      {(d.full_name || '').split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || ''}
                    </div>
                    <div>
                      <p className="font-extrabold text-white flex items-center gap-1 text-xs">
                        {d.full_name}
                        {d.verified && <ShieldCheck size={14} className="text-emerald-400" />}
                      </p>
                      {d.unique_id && (
                        <p className="text-[8px] font-mono text-slate-400 mt-0.5 select-all">
                          ID: {d.unique_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      d.verified
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {d.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <div className="space-y-1 text-slate-200 text-[11px] font-semibold">
                  <p>License: <span className="font-mono text-white font-bold">{d.license_no}</span></p>
                  <p>Mobile: {d.phone}</p>
                  <p>Area: {d.current_area} • Rating: {Number(d.rating).toFixed(2)}★</p>
                  <p className="text-[10px] text-slate-350 break-words">
                    <span className="text-slate-500 font-semibold">Address:</span>{' '}
                    {d.current_address || getProfile(d)?.current_address || (
                      <span className="text-slate-500 italic">Not provided</span>
                    )}
                  </p>
                  <p className="flex items-center gap-1 mt-1 font-semibold">
                    Status: <span className={`h-1.5 w-1.5 rounded-full ${d.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="font-bold text-slate-200">{d.is_online ? 'Online' : 'Offline'}</span>
                  </p>
                </div>

                {expandedDriverId === d.id && (() => {
                  const profile = getProfile(d)
                  return (
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-350 space-y-3 mt-2">
                      <div className="space-y-1">
                        <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-[#A3E635]">Background & Licence</h4>
                        <p><span className="font-bold text-slate-200">Experience:</span> {profile ? profile.experience : 'N/A'}</p>
                        <p><span className="font-bold text-slate-200">Licence Validity:</span> {profile ? profile.license_status : 'N/A'}</p>
                        <p><span className="font-bold text-slate-200">Documents:</span> {profile && profile.documents_available.length > 0 ? profile.documents_available.join(', ') : 'None'}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-[#A3E635]">Availability & Preference</h4>
                        <p><span className="font-bold text-slate-200">Schedule:</span> {profile ? profile.availability : 'N/A'}</p>
                        <p><span className="font-bold text-slate-200">Services:</span> {profile && profile.service_preference.length > 0 ? profile.service_preference.join(', ') : 'None'}</p>
                        <p><span className="font-bold text-slate-200">Vehicles:</span> {profile && profile.vehicle_specialties.length > 0 ? profile.vehicle_specialties.join(', ') : 'None'}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-[#A3E635]">Additional Details</h4>
                        <p><span className="font-bold text-slate-200">Pehle Platform:</span> {profile ? (profile.previous_platforms || 'Nahi') : 'N/A'}</p>
                        <p className="whitespace-pre-wrap"><span className="font-bold text-slate-200">Comments:</span> {profile ? (profile.additional_comments || 'Nahi') : 'N/A'}</p>
                      </div>
                      {renderVerificationSection(d)}
                    </div>
                  )
                })()}

                <div className="pt-2.5 border-t border-slate-850 flex justify-end gap-2 flex-wrap">
                  {!d.verified ? (
                    <>
                      <button
                        onClick={() => toggleVerification(d.id, d.verified)}
                        disabled={updatingId === d.id}
                        className="bg-emerald-500 text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer shadow-md"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectDriver(d.id)}
                        disabled={updatingId === d.id}
                        className="bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-500 hover:text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  ) : d.is_suspended ? (
                    <button
                      onClick={() => toggleSuspension(d.id, d.is_suspended)}
                      disabled={updatingId === d.id}
                      className="bg-emerald-500 text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer shadow-md"
                    >
                      Unsuspend Account
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleSuspension(d.id, d.is_suspended)}
                      disabled={updatingId === d.id}
                      className="bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-500 hover:text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                    >
                      Suspend Account
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(d)}
                    className="bg-amber-500 text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer flex items-center gap-1"
                  >
                    <Edit size={10} /> Edit Profile
                  </button>
                  <button
                    onClick={() => openResetModal(d.id, d.full_name)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 hover:text-white py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer flex items-center gap-1"
                  >
                    <Key size={10} /> Reset Password
                  </button>
                  <button
                    onClick={() => setExpandedDriverId(expandedDriverId === d.id ? null : d.id)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 hover:text-white py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                  >
                    {expandedDriverId === d.id ? 'Hide details' : 'View details'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-700/80 p-4 rounded-2xl mt-4 text-xs font-semibold text-slate-350">
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="bg-slate-950 border border-slate-705 text-white rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:border-amber-500 cursor-pointer text-[10px]"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="ml-4 text-slate-400">
            Showing {totalCount > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, totalCount)} of {totalCount} drivers
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-350 hover:text-white hover:border-slate-600 transition-all cursor-pointer disabled:opacity-40 disabled:hover:text-slate-350 disabled:cursor-not-allowed uppercase text-[9px] font-extrabold tracking-wide"
          >
            Previous
          </button>
          
          {/* Page Numbers */}
          {Array.from({ length: Math.ceil(totalCount / pageSize) }).map((_, idx) => {
            const pageNum = idx + 1
            if (pageNum === 1 || pageNum === Math.ceil(totalCount / pageSize) || Math.abs(pageNum - page) <= 1) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    page === pageNum
                      ? 'bg-amber-500 text-slate-955 font-extrabold'
                      : 'bg-slate-950 text-slate-355 hover:text-white hover:bg-slate-800/80 border border-slate-850'
                  }`}
                >
                  {pageNum}
                </button>
              )
            }
            if (pageNum === 2 || pageNum === Math.ceil(totalCount / pageSize) - 1) {
              return <span key={pageNum} className="px-1 text-slate-500">...</span>
            }
            return null
          })}

          <button
            onClick={() => setPage((p) => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
            disabled={page >= Math.ceil(totalCount / pageSize)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-355 hover:text-white hover:border-slate-600 transition-all cursor-pointer disabled:opacity-40 disabled:hover:text-slate-355 disabled:cursor-not-allowed uppercase text-[9px] font-extrabold tracking-wide"
          >
            Next
          </button>
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-2">Reset Password</h3>
            <p className="text-xs text-slate-350 mb-4">
              Enter a new password for <span className="font-extrabold text-amber-400">{targetDriverName}</span>. 
              The driver will receive a security notification and must use the new password to log in next time.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  disabled={resettingPassword}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 shadow-md shadow-amber-500/5"
                >
                  {resettingPassword ? (
                    <>
                      <div className="h-3 w-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editModalOpen && editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-950 rounded-t-2xl shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit size={16} className="text-amber-500" />
                Edit Driver Profile: <span className="text-amber-400">{editingDriver.full_name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-full cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* SECTION 1: Core User Details */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635] border-b border-slate-800 pb-1">
                  Core Account details (Users Table)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                      placeholder="driver@scandriver.in"
                    />
                  </div>

                  {/* License No */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                      License Number
                    </label>
                    <input
                      type="text"
                      required
                      value={editLicenseNo}
                      onChange={(e) => setEditLicenseNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                    />
                  </div>

                  {/* Current Area */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                      Current Area
                    </label>
                    <input
                      type="text"
                      required
                      value={editCurrentArea}
                      onChange={(e) => setEditCurrentArea(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                    />
                  </div>

                  {/* Current Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                      Current Address
                    </label>
                    <textarea
                      rows={2}
                      value={editCurrentAddress}
                      onChange={(e) => setEditCurrentAddress(e.target.value)}
                      placeholder="Enter driver current address"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors resize-none"
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                      Rating (1.00 - 5.00)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="5"
                      required
                      value={editRating}
                      onChange={(e) => setEditRating(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                      Account Role
                    </label>
                    <select
                      value={editRole}
                      onChange={(e: any) => setEditRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl transition-colors"
                    >
                      <option value="DRIVER">DRIVER</option>
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  {/* Unique ID */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                      Unique ID / Referral Code
                    </label>
                    <input
                      type="text"
                      value={editUniqueId}
                      onChange={(e) => setEditUniqueId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                      placeholder="e.g. SD100234"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editVerified}
                      onChange={(e) => setEditVerified(e.target.checked)}
                      className="rounded border-slate-750 text-amber-500 bg-slate-950 focus:ring-amber-500 h-4 w-4"
                    />
                    Is Verified Account
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsOnline}
                      onChange={(e) => setEditIsOnline(e.target.checked)}
                      className="rounded border-slate-750 text-amber-500 bg-slate-950 focus:ring-amber-500 h-4 w-4"
                    />
                    Is Online (Duty)
                  </label>
                </div>
              </div>

              {/* SECTION 2: Driver Profile Details */}
              {editRole === 'DRIVER' && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635] border-b border-slate-800 pb-1">
                    Advanced Driver Profile details (Driver_profiles Table)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Experience */}
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                        Driving Experience
                      </label>
                      <input
                        type="text"
                        value={editExperience}
                        onChange={(e) => setEditExperience(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                        placeholder="e.g. 5 Years"
                      />
                    </div>

                    {/* License Status */}
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                        Licence Validity Status
                      </label>
                      <input
                        type="text"
                        value={editLicenseStatus}
                        onChange={(e) => setEditLicenseStatus(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                        placeholder="e.g. Valid, Active"
                      />
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                        Availability Schedule
                      </label>
                      <input
                        type="text"
                        value={editAvailability}
                        onChange={(e) => setEditAvailability(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                        placeholder="e.g. Full Time"
                      />
                    </div>

                    {/* Previous Platforms */}
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                        Previous Working Platforms
                      </label>
                      <input
                        type="text"
                        value={editPreviousPlatforms}
                        onChange={(e) => setEditPreviousPlatforms(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors"
                        placeholder="e.g. Uber, Ola"
                      />
                    </div>
                  </div>

                  {/* Service Preference Multi-select/text */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-2">
                      Service Preference (Select all applicable)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950 border border-slate-800 p-3 rounded-xl">
                      {[
                        'Hourly Driver', 'Monthly Driver', 'Weekly Driver',
                        'Outstation Driver', 'Corporate Driver', 'Airport Transfer', 'Event & Wedding'
                      ].map((pref) => {
                        const checked = editServicePreference.includes(pref)
                        return (
                          <label key={pref} className="flex items-center gap-2 text-[10px] text-slate-300 font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setEditServicePreference(editServicePreference.filter(x => x !== pref))
                                } else {
                                  setEditServicePreference([...editServicePreference, pref])
                                }
                              }}
                              className="rounded border-slate-750 text-amber-500 bg-slate-900 focus:ring-amber-500 h-3 w-3"
                            />
                            {pref}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Vehicle Specialties Multi-select/text */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-2">
                      Vehicle Specialties (Select all applicable)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 border border-slate-800 p-3 rounded-xl">
                      {['Hatchback', 'Sedan', 'SUV', 'Luxury'].map((vSpec) => {
                        const checked = editVehicleSpecialties.includes(vSpec)
                        return (
                          <label key={vSpec} className="flex items-center gap-2 text-[10px] text-slate-300 font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setEditVehicleSpecialties(editVehicleSpecialties.filter(x => x !== vSpec))
                                } else {
                                  setEditVehicleSpecialties([...editVehicleSpecialties, vSpec])
                                }
                              }}
                              className="rounded border-slate-750 text-amber-500 bg-slate-900 focus:ring-amber-500 h-3 w-3"
                            />
                            {vSpec}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Additional Comments */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-350 mb-1">
                      Additional Comments / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={editAdditionalComments}
                      onChange={(e) => setEditAdditionalComments(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none text-white rounded-xl placeholder:text-slate-600 transition-colors resize-none"
                      placeholder="Enter any other administrative notes about the driver..."
                    />
                  </div>

                  {/* Verification References Edit Section */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                      Verification References (Up to 3)
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
                          <p className="text-[9px] font-extrabold text-amber-500 uppercase">
                            Reference {idx + 1}
                          </p>
                          <div>
                            <label className="block text-[8px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">
                              Name
                            </label>
                            <input
                              type="text"
                              value={editReferences[idx]?.fullName || ''}
                              onChange={(e) => {
                                const newRefs = [...editReferences]
                                newRefs[idx] = { ...newRefs[idx], fullName: e.target.value }
                                setEditReferences(newRefs)
                              }}
                              className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-750 focus:border-amber-500 focus:outline-none text-white rounded-lg placeholder:text-slate-600 transition-colors"
                              placeholder="Full Name"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">
                              Phone
                            </label>
                            <input
                              type="text"
                              value={editReferences[idx]?.phone || ''}
                              onChange={(e) => {
                                const newRefs = [...editReferences]
                                newRefs[idx] = { ...newRefs[idx], phone: e.target.value }
                                setEditReferences(newRefs)
                              }}
                              className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-750 focus:border-amber-500 focus:outline-none text-white rounded-lg placeholder:text-slate-600 transition-colors"
                              placeholder="Phone Number"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">
                              Relation
                            </label>
                            <input
                              type="text"
                              value={editReferences[idx]?.relation || ''}
                              onChange={(e) => {
                                const newRefs = [...editReferences]
                                newRefs[idx] = { ...newRefs[idx], relation: e.target.value }
                                setEditReferences(newRefs)
                              }}
                              className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-750 focus:border-amber-500 focus:outline-none text-white rounded-lg placeholder:text-slate-600 transition-colors"
                              placeholder="Relation"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 bg-slate-900/50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={savingProfile}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 shadow-md shadow-amber-500/5"
                >
                  {savingProfile ? (
                    <>
                      <div className="h-3 w-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Driver Document */}
      {viewingImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-850 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-800/60 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-amber-500">{viewingImageLabel}</h3>
              <button
                type="button"
                onClick={() => {
                  setViewingImageUrl(null)
                  setViewingImageLabel('')
                }}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-full cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            {/* Body */}
            <div className="p-4 flex flex-col items-center justify-center bg-slate-950 overflow-y-auto max-h-[70vh] w-full">
              <img
                src={viewingImageUrl}
                alt={viewingImageLabel}
                className="max-w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-md"
              />
            </div>
            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-800/60 flex justify-between items-center bg-slate-950">
              <a
                href={viewingImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-350 text-[10px] font-bold cursor-pointer transition-all uppercase tracking-wider"
              >
                Open Raw File
              </a>
              <button
                type="button"
                onClick={() => {
                  setViewingImageUrl(null)
                  setViewingImageLabel('')
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
