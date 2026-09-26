import type { CodeChange } from '../data/challenge'
import styles from './CodeOption.module.css'

type CodeOptionProps = {
  change: CodeChange
  selected: boolean
  onSelect: () => void
}

export function CodeOption({ change, selected, onSelect }: CodeOptionProps) {
  return (
    <button
      aria-pressed={selected}
      className={`${styles.option} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
      type="button"
    >
      <span className={styles.meta}>
        <span>{change.step}</span>
        <span>{change.category}</span>
        <span className={styles.toggle} aria-hidden="true">{selected ? '✓' : '+'}</span>
      </span>
      <span className={styles.title}>{change.title}</span>
      <span className={styles.code}><code>{change.code}</code></span>
      <span className={styles.explanation}>{change.explanation}</span>
    </button>
  )
}
