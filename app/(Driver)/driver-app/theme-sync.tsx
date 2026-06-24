'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function DriverThemeSync() {
  const { setTheme, theme } = useTheme()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Check if the driver has a saved theme preference
    const savedTheme = localStorage.getItem('driver-theme')
    if (savedTheme) {
      if (theme !== savedTheme) {
        setTheme(savedTheme)
      }
    } else {
      // Default to light theme for partner driver application
      if (theme !== 'light') {
        setTheme('light')
      }
      localStorage.setItem('driver-theme', 'light')
    }
    setInitialized(true)
  }, []) // Run only once on mount

  useEffect(() => {
    if (!initialized || !theme) return
    // Keep driver-theme local storage updated when theme changes
    localStorage.setItem('driver-theme', theme)
  }, [theme, initialized])

  return null
}
