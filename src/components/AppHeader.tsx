import styles from './AppHeader.module.css'
import type { AppCopy, Language } from '../i18n/translations'
import type { Theme } from '../theme'

type AppHeaderProps = {
  copy: AppCopy['header']
  language: Language
  onLanguageChange: (language: Language) => void
  onReset: () => void
  onThemeToggle: () => void
  theme: Theme
}

export function AppHeader({
  copy,
  language,
  onLanguageChange,
  onReset,
  onThemeToggle,
  theme,
}: AppHeaderProps) {
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
        <button
          aria-label={theme === 'light' ? copy.switchToDark : copy.switchToLight}
          aria-pressed={theme === 'dark'}
          className={styles.themeToggle}
          onClick={onThemeToggle}
          title={theme === 'light' ? copy.switchToDark : copy.switchToLight}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            {theme === 'light' ? (
              <path d="M20.2 15.3A8.5 8.5 0 0 1 8.7 3.8 8.5 8.5 0 1 0 20.2 15.3Z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </>
            )}
          </svg>
        </button>
        <button aria-label={copy.reset} className={styles.reset} onClick={onReset} type="button">
          <span className={styles.resetText}>{copy.reset}</span>
          <span aria-hidden="true" className={styles.resetIcon}>↻</span>
        </button>
      </div>
    </header>
  )
}
