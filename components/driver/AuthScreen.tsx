'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import logoSd from '../../public/icons/logo-sd.png'

interface AuthScreenProps {
  handleAuth: (e: React.FormEvent) => Promise<void>
  handleGoogleLogin: () => Promise<void>
  handleResendOtp: () => Promise<void>

  password: string
  setPassword: (val: string) => void
  showPassword: boolean
  setShowPassword: (val: boolean) => void
  fullName: string
  setFullName: (val: string) => void
  phone: string
  setPhone: (val: string) => void
  currentArea: string
  setCurrentArea: (val: string) => void
  licenseNo: string
  setLicenseNo: (val: string) => void
  isLoginMode: boolean
  setIsLoginMode: (val: boolean) => void
  loginMethod: 'password' | 'otp'
  setLoginMethod: (val: 'password' | 'otp') => void
  otpSent: boolean
  setOtpSent: (val: boolean) => void
  otpCode: string
  setOtpCode: (val: string) => void
  resendTimer: number
  loading: boolean
  error: string | null
}

export default function AuthScreen({
  handleAuth,
  handleGoogleLogin,
  handleResendOtp,

  password,
  setPassword,
  showPassword,
  setShowPassword,
  fullName,
  setFullName,
  phone,
  setPhone,
  currentArea,
  setCurrentArea,
  licenseNo,
  setLicenseNo,
  isLoginMode,
  setIsLoginMode,
  loginMethod,
  setLoginMethod,
  otpSent,
  setOtpSent,
  otpCode,
  setOtpCode,
  resendTimer,
  loading,
  error,
}: AuthScreenProps) {
  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-card relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="w-46 flex items-center justify-center">
            <Image src={logoSd} alt="ScanDriver Logo" width={200} className="object-contain" priority />
          </div>
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-foreground font-sans">
          ScanDriver Partner
        </h2>
        <p className="mt-2 text-base text-text-muted">
          Your Driver One Scan Away – Driver Terminal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background/40 backdrop-blur-md py-8 px-6 shadow-xl border border-border/20 rounded-xl">
          {/* Login / Signup Selector */}
          <div className="flex rounded-lg bg-surface2 p-1 mb-6 border border-border/10">
            <button
              onClick={() => setIsLoginMode(true)}
              className={cn(
                'flex-1 text-center py-2 text-sm font-semibold rounded-md transition-all duration-300',
                isLoginMode ? 'bg-primary text-black' : 'text-text-muted hover:text-foreground'
              )}
            >
              LOGIN
            </button>
            {/*
            <button
              onClick={() => setIsLoginMode(false)}
              className={cn(
                'flex-1 text-center py-2 text-sm font-semibold rounded-md transition-all duration-300',
                !isLoginMode ? 'bg-primary text-black' : 'text-text-muted hover:text-foreground'
              )}
            >
              SIGNUP
            </button>
            */}
          </div>

          {/* Login Method Sub-selector */}
          {isLoginMode && (
            <div className="flex justify-center gap-6 mb-6 border-b border-border/10 pb-3">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp')
                  setOtpSent(false)
                }}
                className={cn(
                  'pb-1 text-sm font-bold uppercase tracking-wider transition-all duration-300 border-b-2 outline-none',
                  loginMethod === 'otp'
                    ? 'border-primary text-gold-light'
                    : 'border-transparent text-text-muted hover:text-foreground'
                )}
              >
                Phone OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password')
                  setOtpSent(false)
                }}
                className={cn(
                  'pb-1 text-sm font-bold uppercase tracking-wider transition-all duration-300 border-b-2 outline-none',
                  loginMethod === 'password'
                    ? 'border-primary text-gold-light'
                    : 'border-transparent text-text-muted hover:text-foreground'
                )}
              >
                Password Login
              </button>

            </div>
          )}

          <form className="space-y-4" onSubmit={handleAuth}>

            {!isLoginMode && (
              <>
                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-base bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                    placeholder="Ramesh Kumar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Mobile Number
                  </label>
                  <div className="flex rounded-md border border-border/30 bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden">
                    <span className="flex items-center justify-center px-3 text-base text-text-muted bg-surface2 border-r border-border/20 font-semibold select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 px-3 py-2 text-base bg-transparent focus:outline-none text-foreground"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Current Area
                  </label>
                  <input
                    type="text"
                    required
                    value={currentArea}
                    onChange={(e) => setCurrentArea(e.target.value)}
                    className="w-full px-3 py-2 text-base bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                    placeholder="Dwarka, Delhi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Driving License No.
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full px-3 py-2 text-base bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                    placeholder="DL-XXXXXXXXXXXXX"
                  />
                </div>


                <div className="relative">
                  <label className="block text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 text-base bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}


            {isLoginMode && (
              loginMethod === 'password' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Mobile Number
                    </label>
                    <div className="flex rounded-md border border-border/30 bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden">
                      <span className="flex items-center justify-center px-3 text-base text-text-muted bg-surface2 border-r border-border/20 font-semibold select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="flex-1 px-3 py-2 text-base bg-transparent focus:outline-none text-foreground"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 text-base bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Mobile Number
                    </label>
                    <div className="flex rounded-md border border-border/30 bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden">
                      <span className="flex items-center justify-center px-3 text-base text-text-muted bg-surface2 border-r border-border/20 font-semibold select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        disabled={otpSent}
                        pattern="[0-9]{10}"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="flex-1 px-3 py-2 text-base bg-transparent focus:outline-none text-foreground disabled:opacity-50"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
                        Enter 6-digit OTP
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full px-3 py-2 text-base bg-surface rounded-md border border-border/30 focus:border-primary focus:outline-none text-foreground text-center tracking-widest font-mono transition-colors"
                        placeholder="123456"
                      />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-muted">
                          Didn't receive code?
                        </span>
                        {resendTimer > 0 ? (
                          <span className="text-gold-light font-semibold">
                            Resend in {resendTimer}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-gold-light hover:underline font-semibold cursor-pointer bg-transparent border-0 p-0"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary text-black font-semibold text-base rounded-md shadow-md hover:bg-gold-light transition-colors duration-300 flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isLoginMode ? (
                loginMethod === 'otp' ? (
                  otpSent ? 'VERIFY OTP & LOG IN' : 'SEND OTP'
                ) : (
                  'LOG IN'
                )
              ) : (
                'SIGN UP'
              )}
            </button>
          </form>

          {/* Google OAuth Login Option */}
          {/* {isLoginMode && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/20" />
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-background px-2 text-text-muted">Or login with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 text-white border border-border/20 font-semibold text-base rounded-md shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mb-2"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.532 0-6.4-2.868-6.4-6.4s2.868-6.4 6.4-6.4c1.582 0 3.026.58 4.14 1.536l3.056-3.056C19.356 2.457 16.008 1.2 12.24 1.2 6.132 1.2 1.2 6.132 1.2 12.24s4.932 11.04 11.04 11.04c6.38 0 11.04-4.5 11.04-11.04 0-.744-.06-1.464-.18-2.16H12.24z" />
                </svg>
                Continue with Google
              </button>
            </>
          )} */}
          {isLoginMode && (
            <div className="mt-6 text-center text-sm">
              <span className="text-text-muted">Want to join us? </span>
              <Link
                href="/driver-app/onboarding"
                className="text-primary hover:underline font-bold tracking-wide transition-colors"
              >
                Register & Onboard
              </Link>
            </div>
          )}
          {/* Empty space/padding after login options */}
          <div className="mt-2" />
        </div>
      </div>
    </div>
  )
}
