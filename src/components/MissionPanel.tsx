import styles from './MissionPanel.module.css'
import type { LevelCopy } from '../i18n/translations'

export function MissionPanel({ copy }: { copy: LevelCopy }) {
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
    </aside>
  )
}
