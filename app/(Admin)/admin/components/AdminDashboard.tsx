'use client'

import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Briefcase, Users, LogOut, Menu, X, Sun, Moon, Bell, MessageSquare, ChevronLeft, ChevronRight, PlusCircle, UserPlus, Zap, CheckCircle2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Driver, Booking, DashboardStats } from '../types'

import DashboardTab from './DashboardTab'
import BookingsTab from './BookingsTab'
import DriversTab from './DriversTab'
import EnquiriesTab from './EnquiriesTab'

interface AdminDashboardProps {
  adminUser: Driver
  onLogout: () => void
}

export default function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'history' | 'drivers' | 'enquiries'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Auto Approval State
  const [autoApprovalEnabled, setAutoApprovalEnabled] = useState<boolean>(false)
  const [updatingAutoApproval, setUpdatingAutoApproval] = useState<boolean>(false)

  // System Data State
  const [bookings, setBookings] = useState<Booking[]>([]) // Holds 5 most recent bookings for DashboardTab
  const [drivers, setDrivers] = useState<Driver[]>([])   // Holds 5 most recent drivers for DashboardTab
  const [loading, setLoading] = useState(true)

  // Statistics State
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    availableBookings: 0,
    acceptedBookings: 0,
    completedBookings: 0,
    totalDrivers: 0,
    onlineDrivers: 0,
    pendingDriversCount: 0,
    pendingBookingsCount: 0,
    pendingEnquiriesCount: 0,
  })

  // Fetch Auto Approval Setting
  const fetchAutoApprovalSetting = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'auto_approval_enabled')
        .maybeSingle()

      if (data) {
        setAutoApprovalEnabled(data.value === 'true')
      }
    } catch (err) {
      console.error('Error fetching auto approval setting:', err)
    }
  }

  // Handle Toggle Auto Approval
  const handleToggleAutoApproval = async () => {
    const nextState = !autoApprovalEnabled
    setUpdatingAutoApproval(true)
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert(
          { key: 'auto_approval_enabled', value: nextState ? 'true' : 'false', updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )

      if (error) throw error

      setAutoApprovalEnabled(nextState)
      toast.success(
        nextState
          ? '⚡ Auto Approval Enabled! New bookings will be automatically approved and published to drivers.'
          : '🛡️ Manual Approval Enabled. New bookings will require admin approval.'
      )
    } catch (err: any) {
      console.error('Error updating auto approval setting:', err)
      toast.error('Failed to update Auto Approval setting: ' + (err.message || 'Unknown error'))
    } finally {
      setUpdatingAutoApproval(false)
    }
  }

  // Fetch stats and recent previews from backend
  const fetchData = async () => {
    try {
      // 0. Security check: Verify that the current user is still an ADMIN
      const { data: selfCheck, error: selfCheckError } = await supabase
        .from('users')
        .select('role')
        .eq('id', adminUser.id)
        .single()

      if (selfCheckError || !selfCheck || selfCheck.role !== 'ADMIN') {
        toast.error('Session expired or admin privileges revoked.')
        handleLogoutClick()
        return
      }

      // Fetch all stats counts and recent lists in parallel
      const [
        totalBookingsRes,
        availableBookingsRes,
        acceptedBookingsRes,
        completedBookingsRes,
        totalDriversRes,
        onlineDriversRes,
        pendingDriversRes,
        pendingBookingsRes,
        recentBookingsRes,
        recentDriversRes,
        pendingEnquiriesRes
      ] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'DRIVER'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'DRIVER').eq('is_online', true),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'DRIVER').eq('verified', false),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('admin_approved', false),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('users').select('*, driver_profiles(*)').eq('role', 'DRIVER').order('created_at', { ascending: false }).limit(5),
        supabase.from('customer_enquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      if (recentBookingsRes.error) throw recentBookingsRes.error
      if (recentDriversRes.error) throw recentDriversRes.error

      const castedBookings = (recentBookingsRes.data || []) as Booking[]
      const castedDrivers = (recentDriversRes.data || []) as Driver[]

      setBookings(castedBookings)
      setDrivers(castedDrivers)

      setStats({
        totalBookings: totalBookingsRes.count || 0,
        availableBookings: availableBookingsRes.count || 0,
        acceptedBookings: acceptedBookingsRes.count || 0,
        completedBookings: completedBookingsRes.count || 0,
        totalDrivers: totalDriversRes.count || 0,
        onlineDrivers: onlineDriversRes.count || 0,
        pendingDriversCount: pendingDriversRes.count || 0,
        pendingBookingsCount: pendingBookingsRes.count || 0,
        pendingEnquiriesCount: pendingEnquiriesRes.count || 0,
      })
    } catch (err: any) {
      console.error('Error fetching admin data:', err)
      toast.error('Failed to load real-time database details.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on active tab changes (also covers initial mount)
  useEffect(() => {
    fetchData()
    fetchAutoApprovalSetting()
  }, [activeTab])

  // Real-time Subscriptions on Mount
  useEffect(() => {
    // Subscribe to booking changes
    const bookingsChannel = supabase
      .channel('admin-bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Real-time bookings update received in admin:', payload)
          fetchData()
          if (payload.eventType === 'INSERT') {
            toast.info(`New Booking Alert: Ride ${payload.new.id} has been registered!`)
          }
        }
      )
      .subscribe()

    // Subscribe to driver changes (public.users)
    const driversChannel = supabase
      .channel('admin-drivers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('Real-time users update received in admin:', payload)
          fetchData()
          if (payload.eventType === 'INSERT' && payload.new.role === 'DRIVER') {
            toast.info(`New Registration: Driver ${payload.new.full_name} registered for verification.`)
          }
        }
      )
      .subscribe()

    // Subscribe to enquiry changes
    const enquiriesChannel = supabase
      .channel('admin-enquiries-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer_enquiries' },
        (payload) => {
          console.log('Real-time enquiries update received in admin:', payload)
          fetchData()
          if (payload.eventType === 'INSERT') {
            toast.info(`New Enquiry: Callback request from ${payload.new.name}!`)
          }
        }
      )
      .subscribe()

    // Subscribe to system settings changes
    const settingsChannel = supabase
      .channel('admin-settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_settings' },
        (payload) => {
          if (payload.new && (payload.new as any).key === 'auto_approval_enabled') {
            setAutoApprovalEnabled((payload.new as any).value === 'true')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(bookingsChannel)
      supabase.removeChannel(driversChannel)
      supabase.removeChannel(enquiriesChannel)
      supabase.removeChannel(settingsChannel)
    }
  }, [])

  const handleLogoutClick = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out from admin console.')
      onLogout()
    } catch (err) {
      onLogout()
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 ${
          isCollapsed ? 'lg:w-20 w-72' : 'w-72'
        } bg-slate-900 border-r border-slate-700/80 z-50 transform lg:translate-x-0 transition-all duration-300 ease-in-out flex flex-col justify-between ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1">
          {/* Sidebar Header */}
          <div
            className={`h-16 border-b border-slate-700/80 flex items-center ${
              isCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-6'
            } transition-all duration-300`}
          >
            <span className={`font-bold text-sm tracking-wider text-amber-455 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              SCAN<span className="text-white">DRIVER</span> <span className="text-amber-400">ADMIN</span>
            </span>
            {isCollapsed && (
              <span className="font-extrabold text-sm tracking-wider text-amber-455 lg:block hidden">
                SD
              </span>
            )}

            {/* Collapse toggle button for Desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-all cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-300 hover:text-white p-1 rounded-md"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-3.5 space-y-1.5">
            {[
              { id: 'dashboard' as const, label: 'Overview', icon: LayoutDashboard },
              { id: 'bookings' as const, label: 'Bookings', icon: Briefcase },
              { id: 'history' as const, label: 'Completed & Cancelled Booking', icon: CheckCircle2 },
              { id: 'drivers' as const, label: 'Drivers', icon: Users },
              { id: 'enquiries' as const, label: 'Enquiries', icon: MessageSquare },
            ].map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              const className = `w-full flex items-center ${
                isCollapsed ? 'lg:justify-center' : 'lg:justify-start'
              } gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wide transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
                  : 'text-slate-330 hover:text-white hover:bg-slate-800/60'
              }`

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={className}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={17} className="shrink-0" />
                  <span className={`${isCollapsed ? 'lg:hidden' : 'inline'} whitespace-nowrap transition-all duration-300`}>
                    {item.label}
                  </span>
                  {item.id === 'enquiries' && stats.pendingEnquiriesCount && stats.pendingEnquiriesCount > 0 ? (
                    <span
                      className={`bg-amber-400 text-slate-950 font-extrabold text-[9px] rounded-full transition-all duration-300 ${
                        isCollapsed
                          ? 'lg:absolute lg:top-1 lg:right-1.5 lg:px-1.5 lg:py-0.5'
                          : 'ml-auto px-2 py-0.5'
                      }`}
                    >
                      {stats.pendingEnquiriesCount}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer (User Info & Logout) */}
        <div className="p-4 border-t border-slate-700/80 space-y-3 bg-slate-900/40">
          <div className={`flex items-center ${isCollapsed ? 'lg:justify-center' : 'lg:justify-start'} gap-3 px-2`}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md shrink-0">
              {adminUser.full_name?.[0] || 'A'}
            </div>
            <div className={`min-w-0 flex-1 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              <p className="text-xs font-bold text-white truncate">{adminUser.full_name}</p>
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Administrator</span>
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-750 text-xs font-bold text-rose-400 hover:text-rose-355 hover:bg-rose-500/5 transition-all cursor-pointer ${
              isCollapsed ? 'px-2' : 'px-4'
            }`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={14} className="shrink-0" />
            <span className={`${isCollapsed ? 'lg:hidden' : 'inline'}`}>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'} flex flex-col min-w-0 min-h-screen`}>
        {/* HEADER */}
        <header className="h-16 px-4 sm:px-6 border-b border-slate-700/80 bg-slate-900/30 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-300 hover:text-white p-1 rounded-md"
            >
              <Menu size={20} />
            </button>
            <span className="text-xs font-bold text-slate-200 capitalize hidden sm:inline-block">
              Root Console / {activeTab === 'history' ? 'Completed & Cancelled Booking' : activeTab}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Create Booking Button */}
            <a
              href="https://scandriver.in/booking"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm shadow-amber-500/5"
              title="Create New Booking"
            >
              <PlusCircle size={14} className="shrink-0" />
              <span className="hidden sm:inline">Create Booking</span>
            </a>

            {/* Onboard Driver Button */}
            <a
              href="https://partner.scandriver.in/driver-app/onboarding"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
              title="Onboard New Driver"
            >
              <UserPlus size={14} className="shrink-0 text-amber-400" />
              <span className="hidden sm:inline">Onboard Driver</span>
            </a>

            {/* Auto Approval Toggle Control */}
            <button
              onClick={handleToggleAutoApproval}
              disabled={updatingAutoApproval}
              title={
                autoApprovalEnabled
                  ? 'Auto-Approval is ENABLED. New bookings are auto-accepted and published to drivers immediately.'
                  : 'Auto-Approval is DISABLED. Admin must manually approve each booking.'
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                updatingAutoApproval ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                autoApprovalEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/10'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              <Zap size={14} className={autoApprovalEnabled ? 'fill-emerald-400 text-emerald-400 animate-pulse' : 'text-amber-400'} />
              <span className="hidden sm:inline">Auto Approve:</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] uppercase font-extrabold ${
                autoApprovalEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
              }`}>
                {autoApprovalEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </header>

        {/* WORKSPACE */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center flex-col gap-3 py-20">
              <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-300 tracking-wider uppercase">Loading database sync…</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab
                  stats={stats}
                  recentBookings={bookings}
                  recentDrivers={drivers}
                  onTabChange={(tab) => setActiveTab(tab)}
                  autoApprovalEnabled={autoApprovalEnabled}
                  onToggleAutoApproval={handleToggleAutoApproval}
                  updatingAutoApproval={updatingAutoApproval}
                />
              )}

              {activeTab === 'bookings' && (
                <BookingsTab
                  mode="active"
                  onRefresh={fetchData}
                  autoApprovalEnabled={autoApprovalEnabled}
                  onToggleAutoApproval={handleToggleAutoApproval}
                  updatingAutoApproval={updatingAutoApproval}
                />
              )}

              {activeTab === 'history' && (
                <BookingsTab
                  mode="history"
                  onRefresh={fetchData}
                />
              )}

              {activeTab === 'drivers' && (
                <DriversTab
                  onRefresh={fetchData}
                />
              )}

              {activeTab === 'enquiries' && (
                <EnquiriesTab
                  onRefresh={fetchData}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
