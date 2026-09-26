import styles from './MissionPanel.module.css'
import type { AppCopy } from '../i18n/translations'

export function MissionPanel({ copy }: { copy: AppCopy['mission'] }) {
  return (
    <aside className={styles.panel} aria-labelledby="mission-title">
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <h1 id="mission-title">{copy.title}</h1>
      <p className={styles.intro}>{copy.introduction}</p>

      <section className={styles.objective}>
        <p className={styles.label}>{copy.objectiveLabel}</p>
        <p>{copy.objective}</p>
      </section>

      <section className={styles.concepts} aria-labelledby="concepts-title">
        <p className={styles.label} id="concepts-title">{copy.conceptsLabel}</p>
        <div className={styles.concept}>
          <span className={styles.dip}>DIP</span>
          <p>{copy.dip}</p>
        </div>
        <div className={styles.concept}>
          <span className={styles.di}>DI</span>
          <p>{copy.di}</p>
        </div>
      </section>

      <details className={styles.hint}>
        <summary>{copy.hintLabel}</summary>
        <p>{copy.hint}</p>
      </details>
    </aside>
  )
}
