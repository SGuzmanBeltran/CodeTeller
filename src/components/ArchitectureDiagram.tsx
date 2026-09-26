import styles from './ArchitectureDiagram.module.css'
import type { LevelDiagram } from '../data/diModule'
import type { AppCopy } from '../i18n/translations'

type ArchitectureDiagramProps = {
  diagram: LevelDiagram
  hasInjection: boolean
  hasAbstraction: boolean
  hasTestDouble: boolean
  isComplete: boolean
  currentCode: string
  copy: AppCopy['architecture']
}

export function ArchitectureDiagram({
  diagram,
  hasInjection,
  hasAbstraction,
  hasTestDouble,
  isComplete,
  currentCode,
  copy,
}: ArchitectureDiagramProps) {
  const dependsOnPort = hasInjection && hasAbstraction
  const status = isComplete
    ? copy.statusReady
    : hasInjection
      ? hasAbstraction ? copy.statusInjected : copy.statusConcrete
      : copy.statusCoupled

  return (
    <section className={styles.panel} aria-labelledby="architecture-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{copy.viewLabel}</p>
          <h2 id="architecture-title">{copy.title}</h2>
        </div>
        <span className={`${styles.status} ${dependsOnPort ? styles.ready : ''}`}>{status}</span>
      </div>

      <div className={styles.diagram}>
        <article className={`${styles.node} ${styles.core}`}>
          <span className={styles.kind}>{copy.coreLabel}</span>
          <h3>{diagram.coreName}</h3>
          <p>{diagram.coreDescription}</p>
          <code className={dependsOnPort ? styles.injected : styles.coupled}>{currentCode}</code>
        </article>

        <div className={styles.link}>
          <span>{copy.dependsLabel}</span>
          <i className={`${styles.line} ${dependsOnPort ? styles.connected : styles.broken}`} />
        </div>

        <article className={`${styles.node} ${styles.port} ${hasAbstraction ? styles.defined : styles.concrete}`}>
          <span className={styles.kind}>{hasAbstraction ? copy.portLabel : copy.concreteLabel}</span>
          <h3>{diagram.portName}</h3>
          <p>{diagram.portDescription}</p>
        </article>

        <div className={`${styles.link} ${styles.reverse}`}>
          <span>{copy.implementsLabel}</span>
          <i className={`${styles.line} ${hasAbstraction ? styles.connected : styles.broken}`} />
        </div>

        <div className={styles.adapters}>
          <p className={styles.kind}>{copy.adaptersLabel}</p>
          <article className={`${styles.adapter} ${styles.redis}`}>
            <strong>{diagram.productionAdapter}</strong>
            <span>{copy.production}</span>
          </article>
          <article className={`${styles.adapter} ${hasTestDouble ? styles.selected : ''}`}>
            <strong>{diagram.testAdapter}</strong>
            <span>{hasTestDouble ? copy.testAdapter : copy.testAlternative}</span>
          </article>
        </div>
      </div>

      <div className={styles.codeSummary}>
        <span>{copy.currentCode}</span>
        <code>{currentCode}</code>
      </div>
    </section>
  )
}
