import { useEffect, useState } from 'react'
import { ArchitectureDiagram } from './components/ArchitectureDiagram'
import { AppHeader } from './components/AppHeader'
import { CodeOption } from './components/CodeOption'
import { MissionPanel } from './components/MissionPanel'
import { changeIds, codeSamples, type ChangeId } from './data/challenge'
import { translations, type Language } from './i18n/translations'
import styles from './App.module.css'

type TestResult = 'passed' | 'incomplete' | null

function getInitialLanguage(): Language {
  try {
    return window.localStorage.getItem('codeteller-language') === 'en' ? 'en' : 'es'
  } catch {
    return 'es'
  }
}

function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage)
  const [selectedChanges, setSelectedChanges] = useState<ChangeId[]>([])
  const [testResult, setTestResult] = useState<TestResult>(null)
  const copy = translations[language]

  const hasContract = selectedChanges.includes('contract')
  const hasInjection = selectedChanges.includes('injection')
  const hasTestDouble = selectedChanges.includes('test-double')
  const isComplete = changeIds.every((id) => selectedChanges.includes(id))
  const missingChanges = changeIds.filter((id) => !selectedChanges.includes(id))

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

  function toggleChange(changeId: ChangeId) {
    setTestResult(null)
    setSelectedChanges((current) =>
      current.includes(changeId)
        ? current.filter((selected) => selected !== changeId)
        : [...current, changeId],
    )
  }

  function resetChallenge() {
    setSelectedChanges([])
    setTestResult(null)
  }

  function runTest() {
    setTestResult(isComplete ? 'passed' : 'incomplete')
  }

  return (
    <div className={styles.app}>
      <AppHeader
        copy={copy.header}
        language={language}
        onLanguageChange={setLanguage}
        onReset={resetChallenge}
      />

      <main className={styles.layout}>
        <MissionPanel copy={copy.mission} />

        <section className={styles.workspace} aria-labelledby="challenge-title">
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>{copy.workbench.eyebrow}</p>
              <h2 id="challenge-title">{copy.workbench.title}</h2>
              <p className={styles.subtitle}>{copy.workbench.subtitle}</p>
            </div>
            <span className={styles.progress}>
              {selectedChanges.length} <span>{copy.workbench.progressOf}</span> {changeIds.length}{' '}
              {copy.workbench.changesSelected}
            </span>
          </div>

          <ArchitectureDiagram
            copy={copy.architecture}
            hasContract={hasContract}
            hasInjection={hasInjection}
            hasTestDouble={hasTestDouble}
            isComplete={isComplete}
          />

          <section className={styles.solution} aria-labelledby="solution-title">
            <div className={styles.solutionHeading}>
              <div>
                <p className={styles.eyebrow}>{copy.workbench.solutionEyebrow}</p>
                <h2 id="solution-title">{copy.workbench.solutionTitle}</h2>
              </div>
              <p>{copy.workbench.selectionHint}</p>
            </div>

            <div className={styles.options}>
              {changeIds.map((id) => (
                <CodeOption
                  key={id}
                  change={copy.options[id]}
                  code={codeSamples[id]}
                  selected={selectedChanges.includes(id)}
                  onSelect={() => toggleChange(id)}
                />
              ))}
            </div>

            <div className={styles.actions}>
              <div className={styles.feedback} aria-live="polite">
                {testResult === 'passed' ? (
                  <p className={styles.success} role="status">
                    <strong>{copy.feedback.passedTitle}</strong> {copy.feedback.passedDescription}
                  </p>
                ) : testResult === 'incomplete' ? (
                  <p className={styles.incomplete} role="status">
                    <strong>{copy.feedback.incompleteTitle}</strong> {copy.feedback.missingPrefix}{' '}
                    {missingChanges.map((id) => copy.options[id].title.toLowerCase()).join(' · ')}.
                  </p>
                ) : (
                  <p>{copy.workbench.checkHint}</p>
                )}
              </div>
              <button className={styles.run} onClick={runTest} type="button">
                {copy.workbench.runCheck}
              </button>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}

export default App
