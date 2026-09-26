import type { LevelOptionCopy } from '../i18n/translations'
import styles from './CodeOption.module.css'

export type OptionVerdict = 'correct' | 'incorrect' | null

type CodeOptionProps = {
  change: LevelOptionCopy
  step: string
  code: string
  selected: boolean
  revealed: boolean
  verdict: OptionVerdict
  onSelect: () => void
}

export function CodeOption({ change, step, code, selected, revealed, verdict, onSelect }: CodeOptionProps) {
  const verdictClass = verdict === 'correct' ? styles.correct : verdict === 'incorrect' ? styles.incorrect : ''
  const toggleMark = !selected ? '+' : verdict === 'incorrect' ? '✗' : '✓'

  return (
    <button
      aria-pressed={selected}
      className={`${styles.option} ${selected ? styles.selected : ''} ${verdictClass}`}
      onClick={onSelect}
      type="button"
    >
      <span className={styles.meta}>
        <span>{step}</span>
        <span>{change.category}</span>
        <span className={styles.toggle} aria-hidden="true">{toggleMark}</span>
      </span>
      <span className={styles.title}>{change.title}</span>
      <span className={styles.code}><code>{code}</code></span>
      {revealed && <span className={styles.explanation}>{change.explanation}</span>}
    </button>
  )
}
