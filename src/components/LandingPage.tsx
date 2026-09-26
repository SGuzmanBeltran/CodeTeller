import type { AppCopy } from '../i18n/translations'
import { ArchitecturePreview } from './ArchitecturePreview'
import { LandingHero } from './LandingHero'
import styles from './LandingPage.module.css'

type LandingPageProps = {
  copy: AppCopy['landing']
  hasStarted: boolean
  moduleComplete: boolean
  onStart: () => void
}

export function LandingPage({ copy, hasStarted, moduleComplete, onStart }: LandingPageProps) {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="landing-title">
        <LandingHero copy={copy} hasStarted={hasStarted} moduleComplete={moduleComplete} onStart={onStart} />
        <ArchitecturePreview copy={copy} />
      </section>
      {moduleComplete && (
        <section className={styles.reflection} aria-labelledby="reflection-title">
          <p>{copy.reflectionEyebrow}</p>
          <h2 id="reflection-title">{copy.reflectionTitle}</h2>
          <label htmlFor="reflection-answer">{copy.reflectionPrompt}</label>
          <textarea id="reflection-answer" placeholder={copy.reflectionPlaceholder} rows={4} />
          <span>{copy.reflectionNote}</span>
        </section>
      )}
    </main>
  )
}
