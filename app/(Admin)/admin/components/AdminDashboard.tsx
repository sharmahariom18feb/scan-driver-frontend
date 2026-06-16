'use client'

import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Briefcase, Users, LogOut, Menu, X, Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Driver, Booking, DashboardStats } from '../types'

import DashboardTab from './DashboardTab'
import BookingsTab from './BookingsTab'
import DriversTab from './DriversTab'

interface AdminDashboardProps {
  adminUser: Driver
  onLogout: () => void
}

export default function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'drivers'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
  })

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
        recentDriversRes
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
        supabase.from('users').select('*, driver_profiles(*)').eq('role', 'DRIVER').order('created_at', { ascending: false }).limit(5)
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

    return () => {
      supabase.removeChannel(bookingsChannel)
      supabase.removeChannel(driversChannel)
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
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-700/80 z-50 transform lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col justify-between ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex-1">
          {/* Sidebar Header */}
          <div className="h-16 px-6 border-b border-slate-700/80 flex items-center justify-between">
            <span className="font-bold text-sm tracking-wider text-amber-450">
              SCAN<span className="text-white">DRIVER</span> <span className="text-amber-400">ADMIN</span>
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-300 hover:text-white p-1 rounded-md"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'dashboard' as const, label: 'Overview', icon: LayoutDashboard },
              { id: 'bookings' as const, label: 'Bookings', icon: Briefcase },
              { id: 'drivers' as const, label: 'Drivers', icon: Users },
            ].map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer (User Info & Logout) */}
        <div className="p-4 border-t border-slate-700/80 space-y-3 bg-slate-900/40">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md">
              {adminUser.full_name?.[0] || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{adminUser.full_name}</p>
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Administrator</span>
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-750 text-xs font-bold text-rose-400 hover:text-rose-355 hover:bg-rose-500/5 transition-all cursor-pointer"
          >
            <LogOut size={14} /> LOGOUT
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* HEADER */}
        <header className="h-16 px-6 border-b border-slate-700/80 bg-slate-900/30 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-300 hover:text-white p-1 rounded-md"
            >
              <Menu size={20} />
            </button>
            <span className="text-xs font-bold text-slate-200 capitalize hidden sm:inline-block">
              Root Console / {activeTab}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            {/* <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-slate-750 text-slate-300 hover:text-amber-400 hover:bg-slate-800/40 transition-colors"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button> */}

            {/* Notification alert */}
            <div className="relative p-2 rounded-xl border border-slate-750 text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all">
              <Bell size={15} />
              {stats.pendingDriversCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE */}
        <main className="flex-1 p-6 overflow-y-auto">
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
                />
              )}

              {activeTab === 'bookings' && (
                <BookingsTab
                  onRefresh={fetchData}
                />
              )}

              {activeTab === 'drivers' && (
                <DriversTab
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
