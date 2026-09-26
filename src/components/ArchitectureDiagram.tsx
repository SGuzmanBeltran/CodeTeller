import styles from './ArchitectureDiagram.module.css'
import type { LevelDiagram } from '../data/diModule'
import { buildCoreSummary, isTainted, type DiagramState } from '../data/diagramState'
import type { AppCopy } from '../i18n/translations'

type ArchitectureDiagramProps = {
  diagram: LevelDiagram
  state: DiagramState
  isComplete: boolean
  copy: AppCopy['architecture']
}

export function ArchitectureDiagram({
  diagram,
  state,
  isComplete,
  copy,
}: ArchitectureDiagramProps) {
  const { hasInjection, hasExtraction, hasAbstraction, hasTestDouble, contractVisible, hasDetachedPiece, connected } = state
  const tainted = isTainted(state)
  const coreSummary = buildCoreSummary(diagram, state, copy)
  // Any off-answer pick keeps the old problem alive: the diagram falls back to
  // the original coupling instead of celebrating the partial fix. When the fix
  // points at a different node than the leftover, both are drawn: the achieved
  // connection on top, the coupling that is still standing below.
  const showContract = contractVisible && !tainted
  const showConnected = connected && !tainted
  const showSplit = tainted && hasInjection && diagram.coupledNode !== diagram.productionImplementation
  const mainConnected = showConnected || showSplit
  const middleName = showSplit
    ? diagram.productionImplementation
    : showContract
      ? diagram.contractName
      : hasInjection && !tainted ? diagram.productionImplementation : diagram.coupledNode
  const status = isComplete
    ? copy.statusReady
    : tainted ? copy.statusTainted
      : hasInjection
        ? hasAbstraction ? copy.statusInjected : copy.statusConcrete
        : hasExtraction ? copy.statusExtracted
          : contractVisible ? copy.statusCoupled : copy.statusCreated

  return (
    <section className={styles.panel} aria-labelledby="architecture-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{copy.viewLabel}</p>
          <h2 id="architecture-title">{copy.title}</h2>
        </div>
        <span className={`${styles.status} ${showConnected ? styles.ready : ''}`}>{status}</span>
      </div>

      <div className={`${styles.diagram} ${showContract ? '' : styles.simple} ${showSplit ? styles.split : ''}`}>
        <article className={`${styles.node} ${styles.core}`}>
          <span className={styles.kind}>{copy.coreLabel}</span>
          <h3>{diagram.coreName}</h3>
          <p>{diagram.coreDescription}</p>
          <p className={`${styles.summary} ${showConnected ? styles.injected : styles.coupled}`}>{coreSummary}</p>
        </article>

        <div className={styles.link}>
          <span>{copy.dependsLabel}</span>
          <i className={`${styles.line} ${mainConnected ? styles.connected : styles.broken}`} />
        </div>

        <article className={`${styles.node} ${showContract ? styles.contract : styles.concrete}`}>
          <span className={styles.kind}>{showContract ? copy.contractLabel : copy.concreteLabel}</span>
          <h3>{middleName}</h3>
          <p>{showContract ? diagram.contractDescription : copy.concreteDescription}</p>
        </article>

        {showSplit && (
          <>
            <div className={styles.link}>
              <span>{copy.dependsLabel}</span>
              <i className={`${styles.line} ${styles.broken}`} />
            </div>

            <article className={`${styles.node} ${styles.concrete}`}>
              <span className={styles.kind}>{copy.concreteLabel}</span>
              <h3>{diagram.coupledNode}</h3>
              <p>{copy.concreteDescription}</p>
            </article>
          </>
        )}

        {hasDetachedPiece && (
          <article className={`${styles.node} ${styles.piece}`}>
            <span className={styles.kind}>{copy.pieceLabel}</span>
            <h3>{diagram.productionImplementation}</h3>
            <p>{copy.pieceDescription}</p>
          </article>
        )}

        {showContract && (
          <>
            <div className={`${styles.link} ${styles.reverse}`}>
              <span>{copy.implementsLabel}</span>
              <i className={`${styles.line} ${hasAbstraction ? styles.connected : styles.broken}`} />
            </div>

            <div className={styles.implementations}>
              <p className={styles.kind}>{copy.implementationsLabel}</p>
              <article className={`${styles.implementation} ${styles.production}`}>
                <strong>{diagram.productionImplementation}</strong>
                <span>{copy.production}</span>
              </article>
              {hasTestDouble && (
                <article className={`${styles.implementation} ${styles.selected}`}>
                  <strong>{diagram.testImplementation}</strong>
                  <span>{copy.tests}</span>
                </article>
              )}
            </div>
          </>
        )}

      </div>

    </section>
  )
}
