import styles from './ArchitectureDiagram.module.css'
import type { AppCopy } from '../i18n/translations'

type ArchitectureDiagramProps = {
  hasContract: boolean
  hasInjection: boolean
  hasTestDouble: boolean
  isComplete: boolean
  copy: AppCopy['architecture']
}

export function ArchitectureDiagram({
  hasContract,
  hasInjection,
  hasTestDouble,
  isComplete,
  copy,
}: ArchitectureDiagramProps) {
  const isInjected = hasContract && hasInjection

  return (
    <section className={styles.panel} aria-labelledby="architecture-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{copy.viewLabel}</p>
          <h2 id="architecture-title">{copy.title}</h2>
        </div>
        <span className={`${styles.status} ${isInjected ? styles.ready : ''}`}>
          {isComplete
            ? copy.statusReady
            : isInjected
              ? copy.statusInjected
              : hasContract
                ? copy.statusContract
                : hasInjection
                  ? copy.statusMissing
                  : copy.statusCoupled}
        </span>
      </div>

      <div className={styles.diagram}>
        <article className={`${styles.node} ${styles.core}`}>
          <span className={styles.kind}>{copy.coreLabel}</span>
          <h3>OrderService</h3>
          <p>{copy.coreDescription}</p>
          <code className={hasInjection ? styles.injected : styles.coupled}>
            {hasInjection ? 'storage: Storage' : 'RedisStorage()'}
          </code>
        </article>

        <div className={styles.link}>
          <span>{copy.dependsLabel}</span>
          <i className={`${styles.line} ${isInjected ? styles.connected : styles.broken}`} />
        </div>

        <article className={`${styles.node} ${styles.port} ${hasContract ? styles.defined : ''}`}>
          <span className={styles.kind}>{hasContract ? copy.portLabel : copy.missingPortLabel}</span>
          <h3>Storage</h3>
          <p>{copy.portDescription}</p>
        </article>

        <div className={`${styles.link} ${styles.reverse}`}>
          <span>{copy.implementsLabel}</span>
          <i className={`${styles.line} ${hasContract ? styles.connected : styles.broken}`} />
        </div>

        <div className={styles.adapters}>
          <p className={styles.kind}>{copy.adaptersLabel}</p>
          <article className={`${styles.adapter} ${styles.redis}`}>
            <strong>RedisStorage</strong>
            <span>{hasContract ? copy.production : copy.directDependency}</span>
          </article>
          <article className={`${styles.adapter} ${hasTestDouble ? styles.selected : ''}`}>
            <strong>FakeStorage</strong>
            <span>{hasTestDouble ? copy.testAdapter : copy.testAlternative}</span>
          </article>
        </div>
      </div>

      <div className={styles.codeSummary}>
        <span>{copy.currentCode}</span>
        <code>{hasInjection ? copy.injectedCode : copy.coupledCode}</code>
      </div>
    </section>
  )
}
