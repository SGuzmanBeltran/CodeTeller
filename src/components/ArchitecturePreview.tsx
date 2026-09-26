import type { AppCopy } from '../i18n/translations'
import styles from './ArchitecturePreview.module.css'

export function ArchitecturePreview({ copy }: { copy: AppCopy['landing'] }) {
  return (
    <figure className={styles.preview}>
      <figcaption className={styles.heading}>
        <span>{copy.previewLabel}</span>
        <strong>{copy.previewTitle}</strong>
      </figcaption>

      <div className={styles.diagram}>
        <article className={`${styles.node} ${styles.core}`}>
          <span>{copy.coreLabel}</span>
          <strong>OrderService</strong>
        </article>

        <div className={styles.relation}>
          <span>{copy.dependsLabel}</span>
          <i className={styles.forwardLine} />
        </div>

        <article className={`${styles.node} ${styles.client}`}>
          <span>{copy.clientLabel}</span>
          <strong>pymongo.MongoClient</strong>
        </article>
      </div>
    </figure>
  )
}
