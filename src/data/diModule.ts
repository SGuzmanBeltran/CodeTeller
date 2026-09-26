export type LevelId =
  | 'constructor-injection'
  | 'composition-root'
  | 'test-double'
  | 'service-locator'
  | 'di-vs-dip'
  | 'capstone'

export type TestResult = 'passed' | 'incomplete' | null
export type DiagramEffect = 'injection' | 'test-double' | 'abstraction' | 'composition'

export type CodeChoice = {
  id: string
  code: string
  effect?: DiagramEffect
}

export type LevelDiagram = {
  coreName: string
  coreDescription: string
  portName: string
  portDescription: string
  productionAdapter: string
  testAdapter: string
  startsInjected: boolean
  startsAbstract: boolean
  startsWithTestDouble: boolean
  initialCode: string
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
  portName: 'Storage',
  portDescription: 'Storage contract',
  productionAdapter: 'RedisStorage',
  testAdapter: 'FakeStorage',
  startsInjected: false,
  startsAbstract: true,
  startsWithTestDouble: false,
  initialCode: 'OrderService() creates RedisStorage()',
}

function storageLevel(
  id: LevelId,
  correctChoiceIds: string[],
  choices: CodeChoice[],
  diagram: Partial<LevelDiagram> = {},
): DILevel {
  return { id, correctChoiceIds, choices, diagram: { ...storageDiagram, ...diagram } }
}

export const diLevels: DILevel[] = [
  storageLevel(
    'constructor-injection',
    ['inject-storage'],
    [
      {
        id: 'inject-storage',
        code: `def __init__(self, storage: Storage):
    self.storage = storage`,
        effect: 'injection',
      },
      { id: 'construct-redis', code: 'self.storage = RedisStorage()' },
      { id: 'lookup-container', code: 'self.storage = container.resolve(Storage)' },
    ],
  ),
  storageLevel(
    'composition-root',
    ['wire-at-root'],
    [
      {
        id: 'wire-at-root',
        code: `storage = RedisStorage()
service = OrderService(storage)`,
        effect: 'composition',
      },
      { id: 'construct-in-service', code: 'self.storage = RedisStorage()' },
      { id: 'branch-in-service', code: 'self.storage = FakeStorage() if testing else RedisStorage()' },
    ],
    {
      startsInjected: true,
      initialCode: 'main.py creates RedisStorage()',
    },
  ),
  storageLevel(
    'test-double',
    ['fake-in-test'],
    [
      {
        id: 'fake-in-test',
        code: 'service = OrderService(FakeStorage())',
        effect: 'test-double',
      },
      { id: 'redis-in-test', code: 'service = OrderService(RedisStorage())' },
      { id: 'fake-in-service', code: 'self.storage = FakeStorage()' },
    ],
    {
      startsInjected: true,
      initialCode: 'service = OrderService(RedisStorage())',
    },
  ),
  storageLevel(
    'service-locator',
    ['pass-explicitly'],
    [
      {
        id: 'pass-explicitly',
        code: 'service = OrderService(storage)',
        effect: 'injection',
      },
      { id: 'resolve-from-service', code: 'self.storage = container.resolve(Storage)' },
      { id: 'read-global', code: 'self.storage = GLOBAL_STORAGE' },
    ],
    {
      startsInjected: false,
      initialCode: 'self.storage = container.resolve(Storage)',
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
      { id: 'inject-concrete-type', code: 'def __init__(self, storage: RedisStorage): ...' },
      { id: 'add-di-container', code: 'container.register(Storage, RedisStorage)' },
    ],
    {
      startsInjected: true,
      startsAbstract: false,
      initialCode: 'OrderService(storage: RedisStorage)',
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
        code: 'service = NotificationService(FakeMailer())',
        effect: 'test-double',
      },
      { id: 'resolve-mailer', code: 'self.mailer = container.resolve(Mailer)' },
      { id: 'create-smtp', code: 'self.mailer = SmtpMailer()' },
    ],
    diagram: {
      coreName: 'NotificationService',
      coreDescription: 'Sends order notifications.',
      portName: 'Mailer',
      portDescription: 'Mail delivery contract',
      productionAdapter: 'SmtpMailer',
      testAdapter: 'FakeMailer',
      startsInjected: false,
      startsAbstract: true,
      startsWithTestDouble: false,
      initialCode: 'NotificationService() creates SmtpMailer()',
    },
  },
]
