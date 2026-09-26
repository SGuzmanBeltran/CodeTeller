export type Theme = 'light' | 'dark'

export function getInitialTheme(): Theme {
  try {
    const savedTheme = window.localStorage.getItem('codeteller-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  } catch {
    // Fall back to the device preference if local storage is unavailable.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
