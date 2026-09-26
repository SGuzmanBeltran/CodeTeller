import styles from './AppHeader.module.css'
import type { AppCopy, Language } from '../i18n/translations'

type AppHeaderProps = {
  copy: AppCopy['header']
  language: Language
  onLanguageChange: (language: Language) => void
  onReset: () => void
}

export function AppHeader({ copy, language, onLanguageChange, onReset }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden="true">CT</span>
        <span className={styles.name}>CodeTeller</span>
        <span className={styles.description}>{copy.description}</span>
      </div>

      <div className={styles.actions}>
        <span className={styles.unit}>{copy.unit}</span>
        <div className={styles.languagePicker} role="group" aria-label={copy.languageLabel}>
          {(['es', 'en'] as const).map((option) => (
            <button
              key={option}
              aria-pressed={language === option}
              className={`${styles.languageButton} ${language === option ? styles.activeLanguage : ''}`}
              onClick={() => onLanguageChange(option)}
              type="button"
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
        <button aria-label={copy.reset} className={styles.reset} onClick={onReset} type="button">
          <span className={styles.resetText}>{copy.reset}</span>
          <span aria-hidden="true" className={styles.resetIcon}>↻</span>
        </button>
      </div>
    </header>
  )
}
