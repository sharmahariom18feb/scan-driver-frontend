'use client'

import React from 'react'
import { Bell, Briefcase, CheckCircle, Star, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DriverNotification } from '@/redux/slices/driverSlice'

interface AlertsTabProps {
  notifications: DriverNotification[]
  unreadNotificationsCount: number
  onMarkAllRead: () => void
}

export default function AlertsTab({
  notifications,
  unreadNotificationsCount,
  onMarkAllRead,
}: AlertsTabProps) {
  return (
    <div className="px-5 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
          Notifications
        </h2>
        {unreadNotificationsCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-gold-light hover:underline font-semibold bg-transparent border-0 cursor-pointer p-0"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-card border border-border/10 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 text-text-muted">
          <Bell size={24} className="opacity-40" />
          <p className="text-xs">No alerts yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'bg-card border rounded-xl p-4 shadow-xs relative flex items-start gap-3 transition-colors duration-300',
                notif.read ? 'border-border/10 opacity-75' : 'border-border/20'
              )}
            >
              {/* Circle badge based on type */}
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center shrink-0 border',
                  notif.type === 'booking'
                    ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                    : notif.type === 'system'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : notif.type === 'rating'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                )}
              >
                {notif.type === 'booking' && <Briefcase size={14} />}
                {notif.type === 'system' && <CheckCircle size={14} />}
                {notif.type === 'rating' && <Star size={14} className="fill-amber-500" />}
                {notif.type === 'payout' && <DollarSign size={14} />}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-foreground leading-snug">
                    {notif.title}
                  </h4>
                  <span className="text-[9px] text-text-muted">{notif.time}</span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  {notif.description}
                </p>
              </div>

              {/* Unread indicator */}
              {!notif.read && (
                <span className="absolute right-3 bottom-3 h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
