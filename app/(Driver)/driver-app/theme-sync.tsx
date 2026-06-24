'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

export function DriverThemeSync() {
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    // Force light theme for partner driver application
    if (theme !== 'light') {
      setTheme('light')
    }
  }, [theme, setTheme])

  return null
}
