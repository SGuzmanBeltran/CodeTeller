import styles from './MissionPanel.module.css'
import type { LevelCopy, ModuleCopy } from '../i18n/translations'

type MissionPanelProps = {
  copy: LevelCopy
  moduleCopy: ModuleCopy
  isConceptView: boolean
  hasEnteredExercise: boolean
  onAdvanceToExercise: () => void
  onReviewConcept: () => void
}

export function MissionPanel({
  copy,
  moduleCopy,
  isConceptView,
  hasEnteredExercise,
  onAdvanceToExercise,
  onReviewConcept,
}: MissionPanelProps) {
  if (isConceptView) {
    return (
      <aside className={styles.panel} aria-labelledby="mission-title">
        <p className={styles.eyebrow}>{copy.eyebrow} <span>·</span> {moduleCopy.conceptViewLabel}</p>
        <h1 id="mission-title">{copy.conceptTitle}</h1>
        <p className={styles.intro}>{copy.conceptIntroduction}</p>

        <section className={styles.objective} aria-label={moduleCopy.conceptWhyLabel}>
          <p className={styles.label}>{moduleCopy.conceptWhyLabel}</p>
          <p>{copy.conceptWhy}</p>
        </section>

        <section className={styles.concepts} aria-label={moduleCopy.conceptExampleLabel}>
          <p className={styles.label}>{moduleCopy.conceptExampleLabel}</p>
          <pre className={styles.supportingCode}><code>{copy.conceptExample}</code></pre>
        </section>

        <button className={styles.advance} onClick={onAdvanceToExercise} type="button">
          {hasEnteredExercise ? moduleCopy.backToExercise : moduleCopy.startExercise}
        </button>
      </aside>
    )
  }

  return (
    <aside className={styles.panel} aria-labelledby="mission-title">
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <h1 id="mission-title">{copy.title}</h1>
      <p className={styles.intro}>{copy.introduction}</p>

      {copy.supportingCode && (
        <pre className={styles.supportingCode}><code>{copy.supportingCode}</code></pre>
      )}

      <section className={styles.objective}>
        <p className={styles.label}>{copy.objectiveLabel}</p>
        <p>{copy.objective}</p>
      </section>

      <section className={styles.concepts} aria-labelledby="concepts-title">
        <p className={styles.label} id="concepts-title">{copy.conceptLabel}</p>
        <div className={styles.concept}>
          <span className={styles.di}>{copy.conceptTag}</span>
          <p>{copy.concept}</p>
        </div>
      </section>

      <details className={styles.hint}>
        <summary>{copy.hintLabel}</summary>
        <p>{copy.hint}</p>
      </details>

      <button className={styles.reviewConcept} onClick={onReviewConcept} type="button">
        {moduleCopy.reviewConcept}
      </button>
    </aside>
  )
}
