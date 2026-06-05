'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Toaster, toast } from 'sonner'
import { Driver } from './types'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState<Driver | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // Session check on load
  const verifySession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      if (session?.user) {
        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          await supabase.auth.signOut()
          throw new Error('User profile record not found.')
        }

        if (profile && profile.role === 'ADMIN') {
          setAdminUser(profile as Driver)
        } else {
          await supabase.auth.signOut()
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

  const handleLoginSuccess = (user: Driver) => {
    setAdminUser(user)
  }

  const handleLogout = () => {
    setAdminUser(null)
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-white relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="z-10 flex flex-col items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-slate-900 border border-amber-500/30 flex items-center justify-center shadow-lg mb-2">
            <span className="font-bold text-xl text-amber-400">SD</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Verifying console security...
            </p>
          </div>
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
