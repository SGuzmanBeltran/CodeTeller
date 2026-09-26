import { useState } from 'react'
import { ArchitectureDiagram } from './components/ArchitectureDiagram'
import { AppHeader } from './components/AppHeader'
import { CodeOption } from './components/CodeOption'
import { MissionPanel } from './components/MissionPanel'
import { challengeChanges, type ChangeId } from './data/challenge'
import styles from './App.module.css'

type TestResult = 'passed' | 'incomplete' | null

function App() {
  const [selectedChanges, setSelectedChanges] = useState<ChangeId[]>([])
  const [testResult, setTestResult] = useState<TestResult>(null)

  const hasContract = selectedChanges.includes('contract')
  const hasInjection = selectedChanges.includes('injection')
  const hasTestDouble = selectedChanges.includes('test-double')
  const isComplete = challengeChanges.every(({ id }) => selectedChanges.includes(id))
  const missingChanges = challengeChanges.filter(({ id }) => !selectedChanges.includes(id))

  function toggleChange(changeId: ChangeId) {
    setTestResult(null)
    setSelectedChanges((current) =>
      current.includes(changeId)
        ? current.filter((selected) => selected !== changeId)
        : [...current, changeId],
    )
  }

  function resetChallenge() {
    setSelectedChanges([])
    setTestResult(null)
  }

  function runTest() {
    setTestResult(isComplete ? 'passed' : 'incomplete')
  }

  return (
    <div className={styles.app}>
      <AppHeader onReset={resetChallenge} />

      <main className={styles.layout}>
        <MissionPanel />

        <section className={styles.workspace} aria-labelledby="challenge-title">
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>LABORATORIO <span>/</span> RETO 01</p>
              <h2 id="challenge-title">Desacoplar el almacenamiento</h2>
              <p className={styles.subtitle}>Cambia la dependencia sin cambiar lo que hace el servicio.</p>
            </div>
            <span className={styles.progress}>
              {selectedChanges.length}<span> / </span>3 cambios
            </span>
          </div>

          <ArchitectureDiagram
            hasContract={hasContract}
            hasInjection={hasInjection}
            hasTestDouble={hasTestDouble}
            isComplete={isComplete}
          />

          <section className={styles.solution} aria-labelledby="solution-title">
            <div className={styles.solutionHeading}>
              <div>
                <p className={styles.eyebrow}>CONSTRUYE UNA SOLUCIÓN</p>
                <h2 id="solution-title">Elige cambios de código</h2>
              </div>
              <p>Selecciona una opción para aplicarla al diagrama.</p>
            </div>

            <div className={styles.options}>
              {challengeChanges.map((change) => (
                <CodeOption
                  key={change.id}
                  change={change}
                  selected={selectedChanges.includes(change.id)}
                  onSelect={() => toggleChange(change.id)}
                />
              ))}
            </div>

            <div className={styles.actions}>
              <div className={styles.feedback} aria-live="polite">
                {testResult === 'passed' ? (
                  <p className={styles.success} role="status">
                    <strong>Prueba superada.</strong> OrderService funciona sin Redis.
                  </p>
                ) : testResult === 'incomplete' ? (
                  <p className={styles.incomplete} role="status">
                    <strong>Solución incompleta.</strong> Pendiente: {missingChanges.map(({ title }) => title.toLowerCase()).join(' · ')}.
                  </p>
                ) : (
                  <p>La comprobación verifica que el servicio pueda probarse sin Redis.</p>
                )}
              </div>
              <button className={styles.run} onClick={runTest} type="button">
                Ejecutar prueba
              </button>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}

export default App
