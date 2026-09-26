import { useState } from 'react'
import { ArchitectureDiagram } from './ArchitectureDiagram'
import { CodeOption, type OptionVerdict } from './CodeOption'
import { MissionPanel } from './MissionPanel'
import { getDiagramState, shuffleChoices, type DILevel, type TestResult } from '../data/diModule'
import type { AppCopy, LevelCopy } from '../i18n/translations'
import styles from './ChallengePage.module.css'

type ChallengePageProps = {
  level: DILevel
  levelCopy: LevelCopy
  levelNumber: number
  totalLevels: number
  selectedOptionIds: string[]
  testResult: TestResult
  copy: AppCopy
  onToggleOption: (optionId: string) => void
  onRunTest: () => void
  onNextLevel: () => void
  onFinishModule: () => void
}

export function ChallengePage({
  level,
  levelCopy,
  levelNumber,
  totalLevels,
  selectedOptionIds,
  testResult,
  copy,
  onToggleOption,
  onRunTest,
  onNextLevel,
  onFinishModule,
}: ChallengePageProps) {
  // Choices are shuffled once per level mount (App passes key={level.id}).
  const [choices] = useState(() => shuffleChoices(level.choices))
  const diagramState = getDiagramState(level, selectedOptionIds)
  const lastSelectedId = selectedOptionIds[selectedOptionIds.length - 1]
  const lastSelectedChoice = choices.find((choice) => choice.id === lastSelectedId)
  const currentCode = lastSelectedChoice?.code ?? level.diagram.initialCode

  function optionState(choiceId: string): { revealed: boolean; verdict: OptionVerdict } {
    const isSelected = selectedOptionIds.includes(choiceId)
    const isCorrect = level.correctChoiceIds.includes(choiceId)
    const revealed = testResult === 'passed' || (testResult === 'incomplete' && isSelected)
    const verdict: OptionVerdict = !revealed ? null : isCorrect ? 'correct' : isSelected ? 'incorrect' : null
    return { revealed, verdict }
  }

  return (
    <main className={styles.layout}>
      <MissionPanel copy={levelCopy} />

      <section className={styles.workspace} aria-labelledby="challenge-title">
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>
              {copy.module.levelPrefix} {levelNumber} <span>{copy.module.progressOf}</span> {totalLevels}
            </p>
            <h1 id="challenge-title">{levelCopy.taskTitle}</h1>
            <p className={styles.subtitle}>{levelCopy.taskSubtitle}</p>
          </div>
        </div>

        <ArchitectureDiagram
          copy={copy.architecture}
          currentCode={currentCode}
          diagram={level.diagram}
          isComplete={testResult === 'passed'}
          state={diagramState}
        />

        <section className={styles.solution} aria-labelledby="solution-title">
          <div className={styles.solutionHeading}>
            <div>
              <p className={styles.eyebrow}>{copy.module.solutionEyebrow}</p>
              <h2 id="solution-title">{copy.module.solutionTitle}</h2>
            </div>
          </div>

          <div className={styles.options}>
            {choices.map((choice, index) => (
              <CodeOption
                key={choice.id}
                change={levelCopy.options[choice.id]}
                code={choice.code}
                selected={selectedOptionIds.includes(choice.id)}
                step={String(index + 1).padStart(2, '0')}
                onSelect={() => onToggleOption(choice.id)}
                {...optionState(choice.id)}
              />
            ))}
          </div>

          <div className={styles.actions}>
            <div className={styles.feedback} aria-live="polite">
              {testResult === 'passed' ? (
                <p className={styles.success} role="status">
                  <strong>{copy.module.passedTitle}</strong> {levelCopy.successDescription}
                </p>
              ) : testResult === 'incomplete' ? (
                <p className={styles.incomplete} role="status">
                  <strong>{copy.module.incompleteTitle}</strong> {levelCopy.failureDescription}
                </p>
              ) : (
                <p>{copy.module.checkHint}</p>
              )}
            </div>

            {testResult === 'passed' ? (
              <button
                className={styles.run}
                onClick={levelNumber === totalLevels ? onFinishModule : onNextLevel}
                type="button"
              >
                {levelNumber === totalLevels ? copy.module.finishModule : copy.module.nextLevel}
              </button>
            ) : (
              <button className={styles.run} onClick={onRunTest} type="button">
                {copy.module.runCheck}
              </button>
            )}
          </div>
        </section>
      </section>
    </main>
  )
}
