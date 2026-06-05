'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Driver } from '../types'

interface AdminLoginProps {
  onLoginSuccess: (adminUser: Driver) => void
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      // 1. Supabase authentication (authenticates the user so they can pass RLS check)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (error) throw error

      if (!data.user) {
        throw new Error('Authentication failed. No user object returned.')
      }

      // 2. Fetch user profile from the database and verify their role
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        await supabase.auth.signOut()
        throw new Error('Access Denied: Admin user profile record not found.')
      }

      if (profile.role !== 'ADMIN') {
        // Log them out immediately if they are not an ADMIN
        await supabase.auth.signOut()
        throw new Error('Access Denied: You do not have administrator privileges.')
      }

      toast.success(`Welcome back, ${profile.first_name}!`)
      onLoginSuccess(profile as Driver)
    } catch (err: any) {
      console.error('Admin Login Error:', err)
      toast.error(err.message || 'Login failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 md:py-24 max-w-md mx-auto w-full">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8 relative z-10">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-slate-900 border border-amber-500/40 flex items-center justify-center shadow-lg">
            <span className="font-bold text-xl text-amber-400">SD</span>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          ScanDriver Admin
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Sign in to manage bookings, verify drivers, and run controls.
        </p>
      </div>

      <div className="relative z-10 bg-slate-900/80 backdrop-blur-md py-8 px-6 md:px-8 border border-slate-700 rounded-2xl shadow-2xl">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-200 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none text-white transition-colors placeholder:text-slate-500"
                placeholder="admin@scandriver.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-200 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none text-white transition-colors placeholder:text-slate-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              'ENTER ADMIN CONSOLE'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
