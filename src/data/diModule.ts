export type LevelId =
  | 'constructor-injection'
  | 'composition-root'
  | 'test-double'
  | 'service-locator'
  | 'di-vs-dip'
  | 'capstone'

export type TestResult = 'passed' | 'incomplete' | null
export type DiagramEffect = 'injection' | 'extraction' | 'test-double' | 'abstraction' | 'composition'

export type CodeChoice = {
  id: string
  code: string
  effect?: DiagramEffect
}

export type LevelDiagram = {
  coreName: string
  coreDescription: string
  contractName: string
  contractDescription: string
  // What the core points at before anything is injected (e.g. a third-party library).
  coupledNode: string
  productionImplementation: string
  testImplementation: string
  startsInjected: boolean
  startsAbstract: boolean
  startsWithTestDouble: boolean
  // When true, the contract stays out of the diagram until the core depends on it.
  hidesContractInitially: boolean
}

export type DILevel = {
  id: LevelId
  correctChoiceIds: string[]
  choices: CodeChoice[]
  diagram: LevelDiagram
}

const storageDiagram: LevelDiagram = {
  coreName: 'OrderService',
  coreDescription: 'Validates and saves orders.',
  contractName: 'Storage',
  contractDescription: 'Storage contract',
  coupledNode: 'RedisStorage',
  productionImplementation: 'RedisStorage',
  testImplementation: 'FakeStorage',
  startsInjected: false,
  startsAbstract: true,
  startsWithTestDouble: false,
  hidesContractInitially: true,
}

function storageLevel(
  id: LevelId,
  correctChoiceIds: string[],
  choices: CodeChoice[],
  diagram: Partial<LevelDiagram> = {},
): DILevel {
  return { id, correctChoiceIds, choices, diagram: { ...storageDiagram, ...diagram } }
}

export function shuffleChoices(choices: CodeChoice[]): CodeChoice[] {
  const result = [...choices]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export type DiagramState = {
  hasInjection: boolean
  hasExtraction: boolean
  hasAbstraction: boolean
  hasTestDouble: boolean
  // The contract only shows up once the core actually depends on it, so early
  // challenges start from the coupled system instead of a finished design.
  contractVisible: boolean
  // The piece was created but is not handed over: it sits in the system unused
  // while the core keeps talking to whatever it used before.
  hasDetachedPiece: boolean
  // A selected change that is not part of the answer: the diff still contains
  // the original problem (a leftover global, a lazy new, a skip...), so the
  // diagram must not celebrate even if the right changes are also selected.
  hasResidue: boolean
  connected: boolean
}

export function isTainted(state: DiagramState): boolean {
  return state.hasResidue && (state.hasInjection || state.hasExtraction)
}

export type CoreSummaryCopy = {
  coreDirect: string
  coreDetached: string
  coreInjectedConcrete: string
  coreInjectedContract: string
  coreLookup: string
  coreTestUses: string
  coreStillThere: string
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match)
}

// Plain-language version of what the core does with its dependencies, so the
// diagram node never has to dump raw code to be understood.
export function buildCoreSummary(
  diagram: LevelDiagram,
  state: DiagramState,
  copy: CoreSummaryCopy,
): string {
  const names = {
    core: diagram.coreName,
    contract: diagram.contractName,
    impl: diagram.productionImplementation,
    coupled: diagram.coupledNode,
    piece: diagram.productionImplementation,
    test: diagram.testImplementation,
  }
  const base = state.hasInjection && state.contractVisible
    ? copy.coreInjectedContract
    : state.hasInjection
      ? copy.coreInjectedConcrete
      : state.hasExtraction
        ? copy.coreDetached
        : state.contractVisible
          ? copy.coreLookup
          : copy.coreDirect
  const parts = [base]
  if (state.hasTestDouble) parts.push(copy.coreTestUses)
  if (isTainted(state)) parts.push(copy.coreStillThere)
  return parts.map((part) => fill(part, names)).join(' ')
}

export function getDiagramState(level: DILevel, selectedOptionIds: string[]): DiagramState {
  const { diagram } = level
  const effects = level.choices
    .filter((choice) => selectedOptionIds.includes(choice.id))
    .map((choice) => choice.effect)
  const hasInjection = diagram.startsInjected || effects.includes('injection')
  const hasExtraction = effects.includes('extraction')
  const hasAbstraction = diagram.startsAbstract || effects.includes('abstraction')
  const hasTestDouble = diagram.startsWithTestDouble || effects.includes('test-double')
  const contractVisible = hasAbstraction && (hasInjection || !diagram.hidesContractInitially)

  return {
    hasInjection,
    hasExtraction,
    hasAbstraction,
    hasTestDouble,
    contractVisible,
    hasDetachedPiece: hasExtraction && !hasInjection && !hasAbstraction,
    hasResidue: selectedOptionIds.some((id) => !level.correctChoiceIds.includes(id)),
    // The link is solid as soon as the dependency is explicit, even when it
    // still points at a concrete type: that is the state challenge 1 ends in.
    connected: hasInjection,
  }
}

export const diLevels: DILevel[] = [
  storageLevel(
    'constructor-injection',
    ['extract-storage', 'inject-storage'],
    [
      {
        id: 'extract-storage',
        code: `class RedisOrderStorage:
    def __init__(self):
        self.client = redis.Redis(host="localhost")

    def save(self, order: dict) -> None: ...`,
        effect: 'extraction',
      },
      {
        id: 'inject-storage',
        code: `def __init__(self, storage: RedisOrderStorage):
    self.storage = storage`,
        effect: 'injection',
      },
      {
        id: 'inject-client',
        code: `def __init__(self, client: redis.Redis):
    self.client = client`,
      },
      {
        id: 'lazy-client',
        code: `def place(self, order):
    if self._redis is None:
        self._redis = redis.Redis(host="localhost")
    self._redis.hset(...)`,
      },
      {
        id: 'module-singleton',
        code: `# storage.py
client = redis.Redis(host="localhost")`,
      },
    ],
    {
      coreDescription: 'Places orders.',
      startsAbstract: false,
      hidesContractInitially: true,
      coupledNode: 'redis.Redis',
      productionImplementation: 'RedisOrderStorage',
    },
  ),
  storageLevel(
    'composition-root',
    ['wire-at-root'],
    [
      {
        id: 'wire-at-root',
        code: `# main.py
storage = RedisStorage()
service = OrderService(storage)`,
        effect: 'composition',
      },
      {
        id: 'inject-settings',
        code: `def __init__(self, settings: Settings):
    self.storage = build_storage(settings)`,
      },
      {
        id: 'factory-in-core',
        code: `# order_service.py
def create_service() -> OrderService:
    return OrderService(RedisStorage())`,
      },
      {
        id: 'lazy-init',
        code: `@property
def storage(self):
    if self._storage is None:
        self._storage = RedisStorage()
    return self._storage`,
      },
    ],
    {
      startsInjected: true,
      hidesContractInitially: false,
    },
  ),
  storageLevel(
    'test-double',
    ['fake-in-test'],
    [
      {
        id: 'fake-in-test',
        code: `def test_place_order():
    service = OrderService(FakeStorage())`,
        effect: 'test-double',
      },
      {
        id: 'fakeredis-client',
        code: `client = fakeredis.FakeStrictRedis()
service = OrderService(RedisStorage(client))`,
      },
      {
        id: 'monkeypatch-redis',
        code: `def test_place_order(monkeypatch):
    monkeypatch.setattr(app, 'RedisStorage', FakeStorage)`,
      },
      {
        id: 'skip-without-redis',
        code: `@pytest.mark.skipif(not redis_up(), reason='no Redis')
def test_place_order():
    ...`,
      },
    ],
    {
      startsInjected: true,
      hidesContractInitially: false,
    },
  ),
  storageLevel(
    'service-locator',
    ['pass-explicitly'],
    [
      {
        id: 'pass-explicitly',
        code: `def __init__(self, storage: Storage):
    self.storage = storage`,
        effect: 'injection',
      },
      {
        id: 'inject-container',
        code: `def __init__(self, container: Container):
    self.storage = container.resolve(Storage)`,
      },
      {
        id: 'inject-locator',
        code: `def __init__(self, locator: StorageLocator):
    self.storage = locator.get()`,
      },
      {
        id: 'register-fake',
        code: `# conftest.py
container.register(Storage, FakeStorage)`,
      },
    ],
    {
      startsInjected: false,
      hidesContractInitially: false,
    },
  ),
  storageLevel(
    'di-vs-dip',
    ['depend-on-contract'],
    [
      {
        id: 'depend-on-contract',
        code: `def __init__(self, storage: Storage):
    self.storage = storage`,
        effect: 'abstraction',
      },
      {
        id: 'union-concretes',
        code: `def __init__(self, storage: RedisStorage | FakeStorage):
    self.storage = storage`,
      },
      {
        id: 'drop-annotation',
        code: `def __init__(self, storage):  # duck typing
    self.storage = storage`,
      },
      {
        id: 'autowire',
        code: `container.register(OrderService)
# resolves dependencies by type`,
      },
    ],
    {
      startsInjected: true,
      startsAbstract: false,
      hidesContractInitially: false,
    },
  ),
  {
    id: 'capstone',
    correctChoiceIds: ['inject-mailer', 'fake-mailer-test'],
    choices: [
      {
        id: 'inject-mailer',
        code: `def __init__(self, mailer: Mailer):
    self.mailer = mailer`,
        effect: 'injection',
      },
      {
        id: 'fake-mailer-test',
        code: `def test_welcome_email():
    service = NotificationService(FakeMailer())`,
        effect: 'test-double',
      },
      {
        id: 'optional-mailer',
        code: `def __init__(self, mailer: Mailer | None = None):
    self.mailer = mailer or SmtpMailer()`,
      },
      {
        id: 'patch-smtplib',
        code: `@mock.patch('smtplib.SMTP')
def test_welcome_email(smtp_mock):
    ...`,
      },
      {
        id: 'env-mailer',
        code: `self.mailer = (FakeMailer() if os.getenv('APP_ENV') == 'test'
               else SmtpMailer())`,
      },
    ],
    diagram: {
      coreName: 'NotificationService',
      coreDescription: 'Sends order notifications.',
      contractName: 'Mailer',
      contractDescription: 'Mail delivery contract',
      coupledNode: 'SmtpMailer',
      productionImplementation: 'SmtpMailer',
      testImplementation: 'FakeMailer',
      startsInjected: false,
      startsAbstract: true,
      startsWithTestDouble: false,
      hidesContractInitially: true,
    },
  },
]
