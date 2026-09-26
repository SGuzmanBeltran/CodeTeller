import { useEffect, useLayoutEffect, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { ChallengePage } from './components/ChallengePage'
import { LandingPage } from './components/LandingPage'
import { diLevels, type LevelId, type TestResult } from './data/diModule'
import { translations, type Language } from './i18n/translations'
import { getInitialTheme, type Theme } from './theme'
import styles from './App.module.css'

type View = 'landing' | 'challenge'

type ModuleProgress = {
  started: boolean
  currentLevelId: LevelId
  selectedOptionIds: string[]
  testResult: TestResult
  completedLevelIds: LevelId[]
  moduleComplete: boolean
}

const progressKey = 'codeteller-di-intro-module-v2'

function createProgress(started = false): ModuleProgress {
  return {
    started,
    currentLevelId: diLevels[0].id,
    selectedOptionIds: [],
    testResult: null,
    completedLevelIds: [],
    moduleComplete: false,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isLevelId(value: unknown): value is LevelId {
  return typeof value === 'string' && diLevels.some((level) => level.id === value)
}

function getInitialProgress(): ModuleProgress {
  try {
    const stored = window.localStorage.getItem(progressKey)
    if (!stored) return createProgress()

    const value: unknown = JSON.parse(stored)
    if (!isRecord(value)) return createProgress()

    const currentLevelId = isLevelId(value.currentLevelId) ? value.currentLevelId : diLevels[0].id
    const currentLevel = diLevels.find((level) => level.id === currentLevelId) ?? diLevels[0]
    const selectedOptionIds = Array.isArray(value.selectedOptionIds)
      ? value.selectedOptionIds.filter((id): id is string =>
          typeof id === 'string' && currentLevel.choices.some((choice) => choice.id === id),
        )
      : []
    const completedLevelIds = Array.isArray(value.completedLevelIds)
      ? value.completedLevelIds.filter(isLevelId)
      : []
    const storedResult: TestResult = value.testResult === 'passed' || value.testResult === 'incomplete'
      ? value.testResult
      : null
    const testResult: TestResult = selectedOptionIds.length > 0 ? storedResult : null

    return {
      started: value.started === true || completedLevelIds.length > 0 || selectedOptionIds.length > 0,
      currentLevelId,
      selectedOptionIds,
      testResult,
      completedLevelIds,
      moduleComplete: value.moduleComplete === true && completedLevelIds.length === diLevels.length,
    }
  } catch {
    return createProgress()
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
  const [progress, setProgress] = useState<ModuleProgress>(getInitialProgress)
  const copy = translations[language]
  const levelIndex = Math.max(0, diLevels.findIndex(({ id }) => id === progress.currentLevelId))
  const level = diLevels[levelIndex]

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
      // The module still works for this session if storage is unavailable.
    }
  }, [progress])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view, progress.currentLevelId])

  function startOrReviewModule() {
    if (progress.moduleComplete) setProgress(createProgress(true))
    else setProgress((current) => ({ ...current, started: true }))
    setView('challenge')
  }

  function toggleOption(optionId: string) {
    setProgress((current) => ({
      ...current,
      started: true,
      selectedOptionIds: current.selectedOptionIds.includes(optionId)
        ? current.selectedOptionIds.filter((selected) => selected !== optionId)
        : [...current.selectedOptionIds, optionId],
      testResult: null,
      completedLevelIds: current.completedLevelIds.filter((id) => id !== current.currentLevelId),
      moduleComplete: false,
    }))
  }

  function resetCurrentLevel() {
    setProgress((current) => ({
      ...current,
      started: true,
      selectedOptionIds: [],
      testResult: null,
      completedLevelIds: current.completedLevelIds.filter((id) => id !== current.currentLevelId),
      moduleComplete: false,
    }))
  }

  function runCheck() {
    setProgress((current) => {
      const activeLevel = diLevels.find(({ id }) => id === current.currentLevelId) ?? diLevels[0]
      const passed =
        current.selectedOptionIds.length === activeLevel.correctChoiceIds.length &&
        activeLevel.correctChoiceIds.every((id) => current.selectedOptionIds.includes(id))
      const completedLevelIds = passed && !current.completedLevelIds.includes(activeLevel.id)
        ? [...current.completedLevelIds, activeLevel.id]
        : current.completedLevelIds

      return {
        ...current,
        started: true,
        testResult: passed ? 'passed' : 'incomplete',
        completedLevelIds,
        moduleComplete: completedLevelIds.length === diLevels.length,
      }
    })
  }

  function advanceLevel() {
    const nextLevel = diLevels[levelIndex + 1]
    if (!nextLevel) return

    setProgress((current) => ({
      ...current,
      currentLevelId: nextLevel.id,
      selectedOptionIds: [],
      testResult: null,
      started: true,
    }))
  }

  return (
    <div className={styles.app}>
      <AppHeader
        copy={copy.header}
        language={language}
        onHome={() => setView('landing')}
        onLanguageChange={setLanguage}
        onReset={resetCurrentLevel}
        onThemeToggle={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
        showReset={view === 'challenge'}
        theme={theme}
      />

      {view === 'landing' ? (
        <LandingPage
          copy={copy.landing}
          hasStarted={progress.started}
          moduleComplete={progress.moduleComplete}
          onStart={startOrReviewModule}
        />
      ) : (
        <ChallengePage
          key={level.id}
          copy={copy}
          level={level}
          levelCopy={copy.levels[level.id]}
          levelNumber={levelIndex + 1}
          onFinishModule={() => setView('landing')}
          onNextLevel={advanceLevel}
          onRunTest={runCheck}
          onToggleOption={toggleOption}
          selectedOptionIds={progress.selectedOptionIds}
          testResult={progress.testResult}
          totalLevels={diLevels.length}
        />
      )}
    </div>
  )
}

export default App
