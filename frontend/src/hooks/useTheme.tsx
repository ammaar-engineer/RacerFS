import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'day' | 'night'

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'day',
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'day'
    return (localStorage.getItem('racerfs-theme') as Theme) || 'day'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('night', theme === 'night')
    localStorage.setItem('racerfs-theme', theme)
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'day' ? 'night' : 'day')), [])

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)
