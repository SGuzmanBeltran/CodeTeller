import { ArchitectureDiagram } from './ArchitectureDiagram'
import { CodeOption } from './CodeOption'
import { MissionPanel } from './MissionPanel'
import { changeIds, codeSamples, type ChangeId, type TestResult } from '../data/challenge'
import type { AppCopy } from '../i18n/translations'
import styles from './ChallengePage.module.css'

type ChallengePageProps = {
  copy: AppCopy
  selectedChanges: ChangeId[]
  testResult: TestResult
  onToggleChange: (changeId: ChangeId) => void
  onRunTest: () => void
}

export function ChallengePage({
  copy,
  selectedChanges,
  testResult,
  onToggleChange,
  onRunTest,
}: ChallengePageProps) {
  const hasContract = selectedChanges.includes('contract')
  const hasInjection = selectedChanges.includes('injection')
  const hasTestDouble = selectedChanges.includes('test-double')
  const isComplete = changeIds.every((id) => selectedChanges.includes(id))
  const missingChanges = changeIds.filter((id) => !selectedChanges.includes(id))

  return (
    <main className={styles.layout}>
      <MissionPanel copy={copy.mission} />

      <section className={styles.workspace} aria-labelledby="challenge-title">
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>{copy.workbench.eyebrow}</p>
            <h1 id="challenge-title">{copy.workbench.title}</h1>
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
                onSelect={() => onToggleChange(id)}
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
            <button className={styles.run} onClick={onRunTest} type="button">
              {copy.workbench.runCheck}
            </button>
          </div>
        </section>
      </section>
    </main>
  )
}
