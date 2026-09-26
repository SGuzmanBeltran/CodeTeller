import styles from './ArchitectureDiagram.module.css'

type ArchitectureDiagramProps = {
  hasContract: boolean
  hasInjection: boolean
  hasTestDouble: boolean
  isComplete: boolean
}

export function ArchitectureDiagram({
  hasContract,
  hasInjection,
  hasTestDouble,
  isComplete,
}: ArchitectureDiagramProps) {
  const isInjected = hasContract && hasInjection

  return (
    <section className={styles.panel} aria-labelledby="architecture-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>VISTA DEL SISTEMA</p>
          <h2 id="architecture-title">Arquitectura</h2>
        </div>
        <span className={`${styles.status} ${isInjected ? styles.ready : ''}`}>
          {isComplete
            ? 'Lista para probar'
            : isInjected
              ? 'Puerto inyectado'
              : hasContract
                ? 'Contrato definido'
                : 'Acoplado a Redis'}
        </span>
      </div>

      <div className={styles.diagram}>
        <article className={`${styles.node} ${styles.core}`}>
          <span className={styles.kind}>CORE · APLICACIÓN</span>
          <h3>OrderService</h3>
          <p>Valida y guarda pedidos.</p>
          <code className={hasInjection ? styles.injected : styles.coupled}>
            {hasInjection ? 'storage: Storage' : 'RedisStorage()'}
          </code>
        </article>

        <div className={styles.link}>
          <span>depende de</span>
          <i className={`${styles.line} ${isInjected ? styles.connected : styles.broken}`} />
        </div>

        <article className={`${styles.node} ${styles.port} ${hasContract ? styles.defined : ''}`}>
          <span className={styles.kind}>{hasContract ? 'PUERTO' : 'SIN CONTRATO'}</span>
          <h3>Storage</h3>
          <p>Contrato de almacenamiento</p>
        </article>

        <div className={`${styles.link} ${styles.reverse}`}>
          <span>implementa</span>
          <i className={`${styles.line} ${hasContract ? styles.connected : styles.broken}`} />
        </div>

        <div className={styles.adapters}>
          <p className={styles.kind}>ADAPTADORES</p>
          <article className={`${styles.adapter} ${styles.redis}`}>
            <strong>RedisStorage</strong>
            <span>{hasContract ? 'Producción · implementa Storage' : 'Dependencia actual'}</span>
          </article>
          <article className={`${styles.adapter} ${hasTestDouble ? styles.selected : ''}`}>
            <strong>FakeStorage</strong>
            <span>{hasTestDouble ? 'Prueba · implementa Storage' : 'Alternativa para tests'}</span>
          </article>
        </div>
      </div>

      <div className={styles.codeSummary}>
        <span>CÓDIGO ACTUAL</span>
        <code>{hasInjection ? 'OrderService(storage: Storage)' : 'OrderService() crea RedisStorage()'}</code>
      </div>
    </section>
  )
}
