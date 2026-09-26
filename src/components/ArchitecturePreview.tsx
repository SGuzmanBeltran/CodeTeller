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

        <article className={`${styles.node} ${styles.port}`}>
          <span>{copy.portLabel}</span>
          <strong>Storage</strong>
        </article>

        <div className={`${styles.relation} ${styles.reverse}`}>
          <span>{copy.implementsLabel}</span>
          <i className={styles.reverseLine} />
        </div>

        <div className={styles.adapters}>
          <span className={styles.adapterLabel}>{copy.adapterLabel}</span>
          <article className={styles.adapter}>
            <strong>RedisStorage</strong>
            <span>{copy.production}</span>
          </article>
          <article className={`${styles.adapter} ${styles.fakeAdapter}`}>
            <strong>FakeStorage</strong>
            <span>{copy.tests}</span>
          </article>
        </div>
      </div>
    </figure>
  )
}
