import type { AppCopy } from '../i18n/translations'
import styles from './LandingHero.module.css'

type LandingHeroProps = {
  copy: AppCopy['landing']
  hasStarted: boolean
  onStart: () => void
}

export function LandingHero({ copy, hasStarted, onStart }: LandingHeroProps) {
  return (
    <div className={styles.intro}>
      <p className={styles.eyebrow}><span />{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p className={styles.description}>{copy.description}</p>

      <button className={styles.startButton} onClick={onStart} type="button">
        {hasStarted ? copy.continueCta : copy.startCta}
        <span aria-hidden="true">→</span>
      </button>

      <p className={styles.promise}>{copy.promise}</p>
    </div>
  )
}
