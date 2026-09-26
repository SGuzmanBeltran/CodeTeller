import styles from './MissionPanel.module.css'

export function MissionPanel() {
  return (
    <aside className={styles.panel} aria-labelledby="mission-title">
      <p className={styles.eyebrow}>RETO 01 <span>/</span> DEPENDENCIAS</p>
      <h1 id="mission-title">Prueba el servicio sin Redis</h1>
      <p className={styles.intro}>
        Cada prueba de pedidos necesita conectarse a Redis. El equipo quiere comprobar
        la lógica sin levantar un servicio externo.
      </p>

      <section className={styles.objective}>
        <p className={styles.label}>OBJETIVO</p>
        <p>
          Haz que <code>OrderService</code> pueda usar una alternativa de prueba sin cambiar
          su lógica.
        </p>
      </section>

      <section className={styles.concepts} aria-labelledby="concepts-title">
        <p className={styles.label} id="concepts-title">CONCEPTOS EN ESTE RETO</p>
        <div className={styles.concept}>
          <span className={styles.dip}>DIP</span>
          <p>El servicio depende de un contrato, no de Redis.</p>
        </div>
        <div className={styles.concept}>
          <span className={styles.di}>DI</span>
          <p>El almacenamiento se entrega desde afuera.</p>
        </div>
      </section>

      <details className={styles.hint}>
        <summary>Necesito una pista</summary>
        <p>
          Empieza por expresar qué necesita <code>OrderService</code>. Luego deja que
          producción y las pruebas elijan su implementación.
        </p>
      </details>
    </aside>
  )
}
