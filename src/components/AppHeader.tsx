import styles from './AppHeader.module.css'

type AppHeaderProps = {
  onReset: () => void
}

export function AppHeader({ onReset }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden="true">CT</span>
        <span className={styles.name}>CodeTeller</span>
        <span className={styles.description}>Laboratorio de arquitectura</span>
      </div>

      <div className={styles.actions}>
        <span className={styles.unit}>Unidad 01 <span>·</span> Diseño de dependencias</span>
        <button className={styles.reset} onClick={onReset} type="button">
          Reiniciar reto
        </button>
      </div>
    </header>
  )
}
