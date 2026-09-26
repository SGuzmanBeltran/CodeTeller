import { Fragment, type ReactNode } from 'react'
import styles from './ArchitectureDiagram.module.css'
import type { LevelDiagram, LevelId } from '../data/diModule'
import { buildCoreSummary, isTainted, type DiagramState } from '../data/diagramState'
import type { AppCopy } from '../i18n/translations'

type ArchitectureDiagramProps = {
  diagram: LevelDiagram
  levelId: LevelId
  unmodeledChoiceIds: string[]
  state: DiagramState
  isComplete: boolean
  copy: AppCopy['architecture']
}

export function ArchitectureDiagram({ diagram, levelId, unmodeledChoiceIds, state, isComplete, copy }: ArchitectureDiagramProps) {
  const {
    hasInjection,
    hasExtraction,
    hasAbstraction,
    hasTestDouble,
    hasComposition,
    contractVisible,
  } = state
  const tainted = isTainted(state)
  const coreSummary = buildCoreSummary(diagram, state, copy)
  const completeFlow = hasInjection && hasComposition && hasTestDouble
  const status = isComplete
    ? copy.statusReady
    : tainted
      ? copy.statusTainted
      : diagram.mode === 'client-injection' && state.selectedOptionIds.length > 0 && !hasInjection
        ? copy.statusTainted
      : diagram.mode === 'composition'
        ? hasComposition ? copy.statusWired : copy.statusUnwired
        : diagram.mode === 'capstone'
          ? completeFlow ? copy.statusWired : copy.statusPartial
          : diagram.requiresExtraction && hasInjection && !hasExtraction
            ? copy.statusMissingPiece
            : hasInjection
            ? hasAbstraction ? copy.statusInjected : copy.statusConcrete
            : hasExtraction ? copy.statusExtracted
              : contractVisible ? copy.statusCoupled : copy.statusCreated
  const statusReady = isComplete || (!tainted && (
    (diagram.mode === 'composition' && hasComposition) ||
    (diagram.mode === 'capstone' && completeFlow)
  ))

  return (
    <section className={styles.panel} aria-labelledby="architecture-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{copy.viewLabel}</p>
          <h2 id="architecture-title">{copy.title}</h2>
        </div>
        <span className={`${styles.status} ${statusReady ? styles.ready : ''}`}>{status}</span>
      </div>

      {diagram.mode === 'client-injection' ? (
        <ClientInjectionDiagram state={state} copy={copy} />
      ) : diagram.mode === 'composition' ? (
        <CompositionDiagram diagram={diagram} state={state} copy={copy} />
      ) : diagram.mode === 'capstone' ? (
        <CapstoneDiagram
          diagram={diagram}
          levelId={levelId}
          unmodeledChoiceIds={unmodeledChoiceIds}
          state={state}
          copy={copy}
        />
      ) : (
        <StorageDiagram
          diagram={diagram}
          levelId={levelId}
          unmodeledChoiceIds={unmodeledChoiceIds}
          state={state}
          copy={copy}
          coreSummary={coreSummary}
          tainted={tainted}
        />
      )}
    </section>
  )
}

function ClientInjectionDiagram({ state, copy }: { state: DiagramState; copy: AppCopy['architecture'] }) {
  type PathNode = { kind: string; name: string; description: string; type: 'root' | 'core' | 'concrete' | 'problem' }
  const selectedId = state.selectedOptionIds[0]
  let nodes: PathNode[] = [
    { kind: copy.coreLabel, name: 'OrderService', description: copy.serviceCreatesClientDescription, type: 'core' },
    { kind: copy.concreteLabel, name: 'MongoClient', description: copy.clientDescription, type: 'concrete' },
    { kind: copy.concreteLabel, name: 'shop.orders', description: copy.clientDatabaseUsageDescription, type: 'concrete' },
  ]
  let labels: string[] = [copy.createsLabel, copy.usesMongoLabel]
  let problems = [true, true]

  if (selectedId === 'inject-client') {
    nodes = [
      { kind: copy.callerLabel, name: 'caller', description: copy.callerDescription, type: 'root' },
      { kind: copy.concreteLabel, name: 'MongoClient', description: copy.clientDescription, type: 'concrete' },
      { kind: copy.coreLabel, name: 'OrderService', description: copy.clientReceivedDescription, type: 'core' },
      { kind: copy.concreteLabel, name: 'shop.orders.insert_one', description: copy.clientDatabaseUsageDescription, type: 'concrete' },
    ]
    labels = [copy.buildsLabel, copy.passesToLabel, copy.usesMongoLabel]
    problems = [false, false, true]
  } else if (selectedId === 'lazy-client') {
    nodes = [
      { kind: copy.coreLabel, name: 'OrderService.place()', description: copy.serviceLazyClientDescription, type: 'problem' },
      { kind: copy.concreteLabel, name: 'MongoClient', description: copy.clientDescription, type: 'concrete' },
      { kind: copy.concreteLabel, name: 'shop.orders.insert_one', description: copy.clientDatabaseUsageDescription, type: 'concrete' },
    ]
    labels = [copy.createsLabel, copy.usesMongoLabel]
  } else if (selectedId === 'module-singleton') {
    nodes = [
      { kind: copy.factoryLabel, name: 'storage.py', description: copy.globalClientDescription, type: 'problem' },
      { kind: copy.concreteLabel, name: 'MongoClient (global)', description: copy.clientDescription, type: 'concrete' },
      { kind: copy.coreLabel, name: 'OrderService', description: copy.serviceUsesGlobalDescription, type: 'problem' },
      { kind: copy.concreteLabel, name: 'shop.orders.insert_one', description: copy.clientDatabaseUsageDescription, type: 'concrete' },
    ]
    labels = [copy.buildsLabel, copy.passesToLabel, copy.usesMongoLabel]
  } else if (selectedId === 'inject-settings') {
    nodes = [
      { kind: copy.configLabel, name: 'Settings', description: copy.settingsDescription, type: 'problem' },
      { kind: copy.coreLabel, name: 'OrderService', description: copy.serviceCreatesFromSettingsDescription, type: 'problem' },
      { kind: copy.concreteLabel, name: 'MongoClient(settings.mongo_uri)', description: copy.clientDescription, type: 'concrete' },
      { kind: copy.concreteLabel, name: 'shop.orders.insert_one', description: copy.clientDatabaseUsageDescription, type: 'concrete' },
    ]
    labels = [copy.passesToLabel, copy.createsLabel, copy.usesMongoLabel]
  }

  return (
    <div className={`${styles.diagram} ${styles.compositionDiagram}`}>
      {nodes.map((node, index) => (
        <Fragment key={`${node.name}-${index}`}>
          {index > 0 && (
            <DiagramLink
              label={labels[index - 1]}
              connected
              problem={problems[index - 1] ?? Boolean(selectedId)}
            />
          )}
          <article className={`${styles.node} ${node.type === 'root' ? styles.rootNode : node.type === 'core' ? styles.core : node.type === 'problem' ? styles.problemNode : styles.concrete}`}>
            <span className={styles.kind}>{node.kind}</span>
            <h3>{node.name}</h3>
            <p>{node.description}</p>
          </article>
        </Fragment>
      ))}
    </div>
  )
}

function StorageDiagram({
  diagram,
  levelId,
  unmodeledChoiceIds,
  state,
  copy,
  coreSummary,
  tainted,
}: {
  diagram: LevelDiagram
  levelId: LevelId
  unmodeledChoiceIds: string[]
  state: DiagramState
  copy: AppCopy['architecture']
  coreSummary: string
  tainted: boolean
}) {
  const { hasInjection, hasExtraction, hasAbstraction, hasTestDouble, contractVisible, hasDetachedPiece, connected } = state
  const showContract = contractVisible && !tainted
  const missingPiece = Boolean(diagram.requiresExtraction && hasInjection && !hasExtraction && !tainted)
  const showConnected = connected && !tainted && !missingPiece
  const showSplit = tainted && hasInjection && hasExtraction && diagram.coupledNode !== diagram.productionImplementation
  const mainConnected = showConnected || showSplit
  const middleName = showSplit
    ? diagram.productionImplementation
    : missingPiece
      ? diagram.productionImplementation
    : showContract
      ? diagram.contractName
      : hasInjection && !tainted ? diagram.productionImplementation : diagram.coupledNode

  return (
    <div className={`${styles.diagram} ${showContract ? '' : styles.simple} ${showSplit ? styles.split : ''}`}>
      <article className={`${styles.node} ${styles.core}`}>
        <span className={styles.kind}>{copy.coreLabel}</span>
        <h3>{diagram.coreName}</h3>
        <p>{diagram.coreDescription}</p>
        <p className={`${styles.summary} ${showConnected ? styles.injected : styles.coupled}`}>{coreSummary}</p>
      </article>

      <DiagramLink label={copy.dependsLabel} connected={mainConnected} />

      <article className={`${styles.node} ${missingPiece ? styles.missing : showContract ? styles.contract : styles.concrete}`}>
        <span className={styles.kind}>{missingPiece ? copy.missingPieceLabel : showContract ? copy.contractLabel : copy.concreteLabel}</span>
        <h3>{middleName}</h3>
        <p>{missingPiece ? copy.missingPieceDescription : showContract ? diagram.contractDescription : copy.concreteDescription}</p>
      </article>

      {showSplit && (
        <>
          <DiagramLink label={copy.dependsLabel} connected={false} />
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

      {unmodeledChoiceIds.length > 0 && (
        <SelectedPaths levelId={levelId} choiceIds={unmodeledChoiceIds} copy={copy} />
      )}
    </div>
  )
}

function CompositionDiagram({
  diagram,
  state,
  copy,
}: {
  diagram: LevelDiagram
  state: DiagramState
  copy: AppCopy['architecture']
}) {
  const selectedId = state.selectedOptionIds[0]
  const isCorrectWiring = selectedId === 'wire-at-root'
  const isSelected = Boolean(selectedId)
  type PathNode = { kind: string; name: string; description: string; type: 'root' | 'core' | 'concrete' | 'problem' }
  let nodes: PathNode[] = [
    { kind: copy.rootLabel, name: 'main.py', description: copy.startupTodoDescription, type: 'root' },
    { kind: copy.concreteLabel, name: 'MongoClient', description: copy.clientDescription, type: 'concrete' },
    { kind: copy.concreteLabel, name: 'MongoOrderStorage', description: copy.adapterDescription, type: 'concrete' },
    { kind: copy.coreLabel, name: diagram.coreName, description: copy.serviceDescription, type: 'core' },
  ]
  let labels = [copy.buildsLabel, copy.passesToLabel, copy.passesToLabel]

  if (selectedId === 'inject-settings') {
    nodes = [
      { kind: copy.configLabel, name: 'Settings', description: copy.settingsDescription, type: 'problem' },
      { kind: copy.coreLabel, name: diagram.coreName, description: copy.serviceBuildsStorageDescription, type: 'problem' },
      { kind: copy.factoryLabel, name: 'build_storage(settings)', description: copy.serviceFactoryDescription, type: 'problem' },
      { kind: copy.concreteLabel, name: 'MongoClient', description: copy.clientDescription, type: 'concrete' },
      { kind: copy.concreteLabel, name: 'MongoOrderStorage', description: copy.adapterDescription, type: 'concrete' },
    ]
    labels = [copy.passesToLabel, copy.buildsLabel, copy.buildsLabel, copy.passesToLabel]
  } else if (selectedId === 'factory-in-core') {
    nodes = [
      { kind: copy.factoryLabel, name: 'order_service.py', description: copy.factoryRootDescription, type: 'problem' },
      { kind: copy.concreteLabel, name: 'MongoClient', description: copy.clientDescription, type: 'concrete' },
      { kind: copy.concreteLabel, name: 'MongoOrderStorage', description: copy.adapterDescription, type: 'concrete' },
      { kind: copy.coreLabel, name: diagram.coreName, description: copy.serviceDescription, type: 'core' },
    ]
  } else if (selectedId === 'lazy-init') {
    nodes = [
      { kind: copy.coreLabel, name: 'OrderService.storage', description: copy.lazyStorageDescription, type: 'problem' },
      { kind: copy.concreteLabel, name: 'MongoClient', description: copy.clientDescription, type: 'concrete' },
      { kind: copy.concreteLabel, name: 'MongoOrderStorage', description: copy.adapterDescription, type: 'concrete' },
    ]
    labels = [copy.buildsLabel, copy.passesToLabel]
  } else if (isCorrectWiring) {
    nodes[0] = { kind: copy.rootLabel, name: 'main.py', description: copy.entryPointDescription, type: 'root' }
  }

  return (
    <div className={`${styles.diagram} ${styles.compositionDiagram}`}>
      {nodes.map((node, index) => (
        <Fragment key={`${node.name}-${index}`}>
          {index > 0 && (
            <DiagramLink
              label={labels[index - 1]}
              connected={isSelected}
              problem={!isCorrectWiring && isSelected}
            />
          )}
          <article className={`${styles.node} ${node.type === 'root' ? styles.rootNode : node.type === 'core' ? styles.core : node.type === 'problem' ? styles.problemNode : styles.concrete}`}>
            <span className={styles.kind}>{node.kind}</span>
            <h3>{node.name}</h3>
            <p>{node.description}</p>
          </article>
        </Fragment>
      ))}
    </div>
  )
}

function CapstoneDiagram({
  diagram,
  levelId,
  unmodeledChoiceIds,
  state,
  copy,
}: {
  diagram: LevelDiagram
  levelId: LevelId
  unmodeledChoiceIds: string[]
  state: DiagramState
  copy: AppCopy['architecture']
}) {
  const { hasComposition, hasInjection, hasTestDouble } = state

  return (
    <div className={`${styles.diagram} ${styles.capstoneDiagram}`}>
      <FlowTrack title={copy.productionFlowLabel}>
        <FlowNode label={copy.rootLabel} name="main.py" description={copy.entryPointDescription} />
        <DiagramLink label={copy.buildsLabel} connected={hasComposition} />
        <FlowNode label={copy.concreteLabel} name="SmtpMailer" description={copy.concreteDescription} />
        <DiagramLink label={copy.passesToLabel} connected={hasInjection} />
        <FlowNode
          label={copy.coreLabel}
          name={diagram.coreName}
          description={hasInjection ? copy.notificationServiceDescription : copy.serviceCreatesMailerDescription}
          isCore
        />
      </FlowTrack>

      <FlowTrack title={copy.testFlowLabel}>
        <FlowNode label={copy.tests} name="test" description={copy.testBuildsDescription} />
        <DiagramLink label={copy.buildsLabel} connected={hasTestDouble} />
        <FlowNode
          label={copy.concreteLabel}
          name={hasTestDouble ? diagram.testImplementation : diagram.productionImplementation}
          description={hasTestDouble ? copy.fakeMailerDescription : copy.networkDependency}
        />
        <DiagramLink label={copy.passesToLabel} connected={hasTestDouble && hasInjection} />
        <FlowNode
          label={copy.coreLabel}
          name={diagram.coreName}
          description={hasInjection ? copy.notificationServiceDescription : copy.serviceCreatesMailerDescription}
          isCore
        />
      </FlowTrack>
      {unmodeledChoiceIds.length > 0 && (
        <SelectedPaths levelId={levelId} choiceIds={unmodeledChoiceIds} copy={copy} />
      )}
    </div>
  )
}

const choiceTraces: Partial<Record<LevelId, Record<string, string[]>>> = {
  'constructor-injection': {
    'lazy-client': ['OrderService.place()', 'MongoClient(...)', 'insert_one(order)'],
    'module-singleton': ['storage.py', 'client = MongoClient(...)', 'OrderService'],
    'inject-settings': ['Settings', 'OrderService', 'MongoClient(settings.mongo_uri)'],
  },
  'storage-adapter': {
    'inject-client': ['OrderService', 'MongoClient', 'insert_one(order)'],
    'lazy-client': ['OrderService.place()', 'MongoClient(...)', 'insert_one(order)'],
    'module-singleton': ['storage.py', 'client = MongoClient(...)', 'OrderService'],
  },
  'test-double': {
    'mongomock-client': ['test', 'mongomock.MongoClient()', 'MongoOrderStorage', 'OrderService'],
    'monkeypatch-mongo': ['test', 'patch app.MongoOrderStorage', 'OrderService'],
    'skip-without-mongo': ['test', '@pytest.mark.skipif(...)'],
  },
  capstone: {
    'optional-mailer': ['NotificationService(mailer=None)', 'mailer or SmtpMailer()'],
    'patch-smtplib': ['test', "mock.patch('smtplib.SMTP')", 'SmtpMailer', 'NotificationService'],
    'env-mailer': ['NotificationService', "if APP_ENV == 'test'", 'FakeMailer | SmtpMailer'],
  },
}

function SelectedPaths({
  levelId,
  choiceIds,
  copy,
}: {
  levelId: LevelId
  choiceIds: string[]
  copy: AppCopy['architecture']
}) {
  const traces = choiceIds
    .map((id) => ({ id, steps: choiceTraces[levelId]?.[id] }))
    .filter((trace): trace is { id: string; steps: string[] } => Boolean(trace.steps))

  if (traces.length === 0) return null

  return (
    <div className={styles.selectedPaths}>
      <p className={styles.kind}>{copy.selectionPathLabel}</p>
      {traces.map(({ id, steps }) => (
        <div className={styles.selectedPath} key={id}>
          {steps.map((step, index) => (
            <Fragment key={`${step}-${index}`}>
              {index > 0 && <span aria-hidden="true">→</span>}
              <code>{step}</code>
            </Fragment>
          ))}
        </div>
      ))}
    </div>
  )
}

function FlowTrack({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.flowTrack} aria-label={title}>
      <h3>{title}</h3>
      <div className={styles.flowNodes}>{children}</div>
    </section>
  )
}

function FlowNode({
  label,
  name,
  description,
  isCore = false,
}: {
  label: string
  name: string
  description: string
  isCore?: boolean
}) {
  return (
    <article className={`${styles.node} ${isCore ? styles.core : styles.flowNode}`}>
      <span className={styles.kind}>{label}</span>
      <h3>{name}</h3>
      <p>{description}</p>
    </article>
  )
}

function DiagramLink({ label, connected, problem = false }: { label: string; connected: boolean; problem?: boolean }) {
  return (
    <div className={styles.link}>
      <span>{label}</span>
      <i className={`${styles.line} ${connected ? problem ? styles.problem : styles.connected : styles.broken}`} />
    </div>
  )
}
