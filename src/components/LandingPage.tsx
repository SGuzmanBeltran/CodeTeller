import type { AppCopy } from '../i18n/translations'
import { ArchitecturePreview } from './ArchitecturePreview'
import { LandingHero } from './LandingHero'
import styles from './LandingPage.module.css'

type LandingPageProps = {
  copy: AppCopy['landing']
  hasStarted: boolean
  onStart: () => void
}

export function LandingPage({ copy, hasStarted, onStart }: LandingPageProps) {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="landing-title">
        <LandingHero copy={copy} hasStarted={hasStarted} onStart={onStart} />
        <ArchitecturePreview copy={copy} />
      </section>
    </main>
  )
}
