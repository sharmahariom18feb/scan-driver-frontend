'use client'

import React, { useState, useEffect } from 'react'
import { Search, CheckCircle, RefreshCw, Mail, Phone, Clock, MessageSquare, Trash2, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Enquiry } from '../types'

interface EnquiriesTabProps {
  onRefresh: () => void
}

export default function EnquiriesTab({ onRefresh }: EnquiriesTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Fetch enquiries
  const fetchEnquiries = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('customer_enquiries')
        .select('*', { count: 'exact' })

      // 1. Search filter
      if (searchTerm.trim()) {
        const term = `%${searchTerm.trim()}%`
        query = query.or(`name.ilike.${term},phone.ilike.${term},email.ilike.${term},message.ilike.${term}`)
      }

      // 2. Status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // 3. Range
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      setEnquiries((data || []) as Enquiry[])
      setTotalCount(count || 0)
    } catch (err: any) {
      console.error('Error fetching enquiries:', err)
      toast.error('Failed to load enquiries from database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [page, pageSize, searchTerm, statusFilter])

  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    setPage(1)
  }

  const handleStatusFilterChange = (val: typeof statusFilter) => {
    setStatusFilter(val)
    setPage(1)
  }

  const refreshAll = () => {
    onRefresh()
    fetchEnquiries()
  }

  // Update Status
  const updateStatus = async (enquiryId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    setUpdatingId(enquiryId)
    try {
      const { error } = await supabase
        .from('customer_enquiries')
        .update({ status: newStatus })
        .eq('id', enquiryId)

      if (error) throw error

      toast.success(`Enquiry marked as ${newStatus.replace('_', ' ')}!`)
      refreshAll()
    } catch (err: any) {
      console.error('Error updating enquiry status:', err)
      toast.error(err.message || 'Failed to update enquiry status')
    } finally {
      setUpdatingId(null)
    }
  }

  // Delete Enquiry
  const handleDeleteEnquiry = async (enquiryId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this enquiry?')
    if (!confirmDelete) return

    setUpdatingId(enquiryId)
    try {
      const { error } = await supabase
        .from('customer_enquiries')
        .delete()
        .eq('id', enquiryId)

      if (error) throw error

      toast.success('Enquiry deleted successfully!')
      refreshAll()
    } catch (err: any) {
      console.error('Error deleting enquiry:', err)
      toast.error(err.message || 'Failed to delete enquiry')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadge = (status: Enquiry['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            Pending
          </span>
        )
      case 'in_progress':
        return (
          <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
            In Progress
          </span>
        )
      case 'completed':
        return (
          <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-450">
            Completed
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Customer Enquiries</h1>
          <p className="text-slate-200 text-xs mt-1">Track status, answer messages, and manage callback requests from customers.</p>
        </div>
        <button
          onClick={refreshAll}
          className="p-2 bg-slate-900 border border-slate-750 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
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
            placeholder="Search by name, phone, email, message..."
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-350 hover:text-white'
              }`}
            >
              {status === 'all' ? 'All Enquiries' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries List */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all duration-200">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-750 px-4 py-2.5 rounded-xl shadow-xl">
              <div className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-extrabold">Syncing with server...</span>
            </div>
          </div>
        )}

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-[10px] uppercase font-bold tracking-widest text-slate-300">
                <th className="py-4 px-5">Customer Details</th>
                <th className="py-4 px-5">Message / Requirements</th>
                <th className="py-4 px-5">Received At</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400 italic">
                    No customer enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-800/30 transition-all text-xs">
                    {/* Customer */}
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <p className="font-extrabold text-white">{enq.name}</p>
                        <p className="font-bold text-slate-100 flex items-center gap-1.5">
                          <Phone size={10} className="text-slate-450 shrink-0" /> {enq.phone}
                        </p>
                        {enq.email && (
                          <p className="text-slate-350 flex items-center gap-1.5 font-semibold">
                            <Mail size={10} className="text-slate-450 shrink-0" /> {enq.email}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Message */}
                    <td className="py-4 px-5 max-w-sm">
                      <div className="flex items-start gap-1.5 text-slate-300 whitespace-pre-wrap font-medium">
                        <MessageSquare size={13} className="text-slate-450 shrink-0 mt-0.5" />
                        <span>{enq.message || 'No description provided.'}</span>
                      </div>
                    </td>

                    {/* Received */}
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-100 flex items-center gap-1.5">
                        <Clock size={11} className="text-slate-450 shrink-0" />
                        {new Date(enq.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      {getStatusBadge(enq.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap space-x-2">
                      {enq.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(enq.id, 'in_progress')}
                          disabled={updatingId === enq.id}
                          className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[9px] py-1.5 px-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          <ArrowRight size={11} /> START
                        </button>
                      )}
                      {enq.status !== 'completed' && (
                        <button
                          onClick={() => updateStatus(enq.id, 'completed')}
                          disabled={updatingId === enq.id}
                          className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-[9px] py-1.5 px-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle size={11} /> COMPLETE
                        </button>
                      )}
                      {enq.status === 'completed' && (
                        <button
                          onClick={() => updateStatus(enq.id, 'pending')}
                          disabled={updatingId === enq.id}
                          className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[9px] py-1.5 px-3 rounded-lg transition-all cursor-pointer border border-slate-700"
                        >
                          REOPEN
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteEnquiry(enq.id)}
                        disabled={updatingId === enq.id}
                        className="inline-flex items-center gap-1 bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-505 hover:text-slate-950 font-extrabold text-[9px] py-1.5 px-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-slate-800/80">
          {enquiries.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-400 italic">No customer enquiries found.</p>
          ) : (
            enquiries.map((enq) => (
              <div key={enq.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-extrabold text-white text-xs">{enq.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(enq.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {getStatusBadge(enq.status)}
                </div>

                <div className="space-y-1 text-slate-200 text-[11px] font-semibold">
                  <p>Mobile: {enq.phone}</p>
                  {enq.email && <p>Email: {enq.email}</p>}
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-350 space-y-1.5 mt-2 flex items-start gap-1.5 whitespace-pre-wrap leading-relaxed">
                    <MessageSquare size={12} className="text-slate-450 shrink-0 mt-0.5" />
                    <span>{enq.message || 'No description.'}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-850 flex justify-end gap-2">
                  {enq.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(enq.id, 'in_progress')}
                      disabled={updatingId === enq.id}
                      className="bg-amber-500 text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                    >
                      Start
                    </button>
                  )}
                  {enq.status !== 'completed' && (
                    <button
                      onClick={() => updateStatus(enq.id, 'completed')}
                      disabled={updatingId === enq.id}
                      className="bg-emerald-500 text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer shadow-md"
                    >
                      Complete
                    </button>
                  )}
                  {enq.status === 'completed' && (
                    <button
                      onClick={() => updateStatus(enq.id, 'pending')}
                      disabled={updatingId === enq.id}
                      className="bg-slate-800 border border-slate-700 text-slate-200 hover:text-white py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                    >
                      Reopen
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteEnquiry(enq.id)}
                    disabled={updatingId === enq.id}
                    className="bg-rose-955/60 border border-rose-800 text-rose-300 hover:bg-rose-500 hover:text-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                  >
                    Delete
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
            Showing {totalCount > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, totalCount)} of {totalCount} enquiries
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-355 hover:text-white hover:border-slate-600 transition-all cursor-pointer disabled:opacity-40 disabled:hover:text-slate-355 disabled:cursor-not-allowed uppercase text-[9px] font-extrabold tracking-wide"
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
                      : 'bg-slate-950 text-slate-355 hover:text-white hover:bg-slate-800/80 border border-slate-855'
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
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-755 text-slate-355 hover:text-white hover:border-slate-600 transition-all cursor-pointer disabled:opacity-40 disabled:hover:text-slate-355 disabled:cursor-not-allowed uppercase text-[9px] font-extrabold tracking-wide"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
