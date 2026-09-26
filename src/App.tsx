import { useEffect, useLayoutEffect, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { ChallengePage } from './components/ChallengePage'
import { LandingPage } from './components/LandingPage'
import { changeIds, type ChangeId, type TestResult } from './data/challenge'
import { translations, type Language } from './i18n/translations'
import { getInitialTheme, type Theme } from './theme'
import styles from './App.module.css'

type View = 'landing' | 'challenge'

type ChallengeProgress = {
  started: boolean
  selectedChanges: ChangeId[]
  testResult: TestResult
}

const progressKey = 'codeteller-challenge-01'
const emptyProgress: ChallengeProgress = {
  started: false,
  selectedChanges: [],
  testResult: null,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isChangeId(value: unknown): value is ChangeId {
  return typeof value === 'string' && changeIds.includes(value as ChangeId)
}

function getInitialProgress(): ChallengeProgress {
  try {
    const stored = window.localStorage.getItem(progressKey)
    if (!stored) return emptyProgress

    const value: unknown = JSON.parse(stored)
    if (!isRecord(value)) return emptyProgress

    const selectedChanges = Array.isArray(value.selectedChanges)
      ? value.selectedChanges.filter(isChangeId)
      : []
    const testResult: TestResult = value.testResult === 'passed' || value.testResult === 'incomplete'
      ? value.testResult
      : null

    return {
      started: value.started === true || selectedChanges.length > 0 || testResult !== null,
      selectedChanges,
      testResult,
    }
  } catch {
    return emptyProgress
  }
}

function getInitialLanguage(): Language {
  try {
    return window.localStorage.getItem('codeteller-language') === 'en' ? 'en' : 'es'
  } catch {
    return 'es'
  }
}

function App() {
  const [view, setView] = useState<View>('landing')
  const [language, setLanguage] = useState<Language>(getInitialLanguage)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [progress, setProgress] = useState<ChallengeProgress>(getInitialProgress)
  const copy = translations[language]

  useEffect(() => {
    document.documentElement.lang = language
    document.title = copy.documentTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', copy.metaDescription)

    try {
      window.localStorage.setItem('codeteller-language', language)
    } catch {
      // The language switch still works for this session if storage is unavailable.
    }
  }, [copy.documentTitle, copy.metaDescription, language])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    try {
      window.localStorage.setItem('codeteller-theme', theme)
    } catch {
      // The theme switch still works for this session if storage is unavailable.
    }
  }, [theme])

  useEffect(() => {
    try {
      window.localStorage.setItem(progressKey, JSON.stringify(progress))
    } catch {
      // The challenge still works for this session if storage is unavailable.
    }
  }, [progress])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  function startChallenge() {
    setProgress((current) => ({ ...current, started: true }))
    setView('challenge')
  }

  function toggleChange(changeId: ChangeId) {
    setProgress((current) => ({
      started: true,
      selectedChanges: current.selectedChanges.includes(changeId)
        ? current.selectedChanges.filter((selected) => selected !== changeId)
        : [...current.selectedChanges, changeId],
      testResult: null,
    }))
  }

  function resetChallenge() {
    setProgress({ started: true, selectedChanges: [], testResult: null })
  }

  function runTest() {
    setProgress((current) => ({
      ...current,
      started: true,
      testResult: changeIds.every((id) => current.selectedChanges.includes(id)) ? 'passed' : 'incomplete',
    }))
  }

  return (
    <div className={styles.app}>
      <AppHeader
        copy={copy.header}
        language={language}
        onHome={() => setView('landing')}
        onLanguageChange={setLanguage}
        onReset={resetChallenge}
        onThemeToggle={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
        showReset={view === 'challenge'}
        theme={theme}
      />

      {view === 'landing' ? (
        <LandingPage copy={copy.landing} hasStarted={progress.started} onStart={startChallenge} />
      ) : (
        <ChallengePage
          copy={copy}
          onRunTest={runTest}
          onToggleChange={toggleChange}
          selectedChanges={progress.selectedChanges}
          testResult={progress.testResult}
        />
      )}
    </div>
  )
}

export default App
