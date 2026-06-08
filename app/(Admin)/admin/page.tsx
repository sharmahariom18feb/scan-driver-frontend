'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Toaster, toast } from 'sonner'
import { Driver } from './types'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import logoSd from '../../../public/icons/logo-sd.png'

export default function AdminPage() {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<Driver | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // Session check on load
  const verifySession = async () => {
    try {
      const adminLoginTimeStr = localStorage.getItem('admin_login_time')
      const now = Date.now()
      const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000 // 2 hours

      if (adminLoginTimeStr) {
        const loginTime = parseInt(adminLoginTimeStr, 10)
        if (now - loginTime > TWO_HOURS_IN_MS) {
          await supabase.auth.signOut()
          localStorage.removeItem('admin_login_time')
          setAdminUser(null)
          toast.error('Session expired. Please log in again.')
          setCheckingSession(false)
          return
        }
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      if (session?.user) {
        // Fallback: If session exists but no login time is recorded, initialize it
        if (!adminLoginTimeStr) {
          localStorage.setItem('admin_login_time', now.toString())
        }

        // Fetch profile and validate role (hardcoded ADMIN role check)
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .eq('role', 'ADMIN') // Enforce ADMIN role check on backend
          .single()

        if (profileError || !profile) {
          await supabase.auth.signOut()
          localStorage.removeItem('admin_login_time')
          toast.error('Access Denied: Invalid credentials or role mismatched.')
          setCheckingSession(false)
          return
        }

        if (profile && profile.role === 'ADMIN') {
          setAdminUser(profile as Driver)
        } else {
          await supabase.auth.signOut()
          localStorage.removeItem('admin_login_time')
          toast.error('Access Denied: You do not have administrator privileges.')
        }
      }
    } catch (err: any) {
      console.warn('Session verification warning:', err.message)
    } finally {
      setCheckingSession(false)
    }
  }

  useEffect(() => {
    verifySession()
  }, [])

  // Periodic session check for admin (2 hours limit)
  useEffect(() => {
    if (!adminUser) return

    const checkAdminSessionExpiry = () => {
      const adminLoginTimeStr = localStorage.getItem('admin_login_time')
      if (adminLoginTimeStr) {
        const loginTime = parseInt(adminLoginTimeStr, 10)
        const now = Date.now()
        const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000 // 2 hours
        if (now - loginTime > TWO_HOURS_IN_MS) {
          supabase.auth.signOut()
          localStorage.removeItem('admin_login_time')
          setAdminUser(null)
          toast.error('Your admin session has expired. Please log in again.')
        }
      }
    }

    // Check immediately and then every 30 seconds
    checkAdminSessionExpiry()
    const interval = setInterval(checkAdminSessionExpiry, 30000)
    return () => clearInterval(interval)
  }, [adminUser])

  const handleLoginSuccess = (user: Driver) => {
    setAdminUser(user)
  }

  const handleLogout = () => {
    setAdminUser(null)
    localStorage.removeItem('admin_login_time')
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-white relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10 flex flex-col items-center gap-5">
          <div className="w-46 flex items-center justify-center mb-2">
            <Image src={logoSd} alt="ScanDriver Logo" width={300} className="object-cover" loading='eager' />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Verifying console security...
            </p>
          </div>
          <a href="">Reload </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Toaster position="top-center" richColors />

      {adminUser ? (
        <AdminDashboard adminUser={adminUser} onLogout={handleLogout} />
      ) : (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  )
}
