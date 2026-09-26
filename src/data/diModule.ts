export type LevelId =
  | 'constructor-injection'
  | 'storage-adapter'
  | 'composition-root'
  | 'test-double'
  | 'capstone'

export type TestResult = 'passed' | 'incomplete' | null
export type DiagramEffect = 'injection' | 'extraction' | 'test-double' | 'abstraction' | 'composition'

export type CodeChoice = {
  id: string
  code: string
  effect?: DiagramEffect
}

export type LevelDiagram = {
  mode?: 'client-injection' | 'composition' | 'capstone'
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
  requiresExtraction?: boolean
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
  coupledNode: 'MongoOrderStorage',
  productionImplementation: 'MongoOrderStorage',
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

export const diLevels: DILevel[] = [
  {
    id: 'constructor-injection',
    correctChoiceIds: ['inject-client'],
    choices: [
      {
        id: 'inject-client',
        code: `def __init__(self, client: pymongo.MongoClient):
    self.client = client`,
        effect: 'injection',
      },
      {
        id: 'lazy-client',
        code: `def place(self, order):
    if self._mongo is None:
        self._mongo = pymongo.MongoClient("mongodb://localhost:27017")
    self._mongo["shop"]["orders"].insert_one(order)`,
      },
      {
        id: 'module-singleton',
        code: `# storage.py
client = pymongo.MongoClient("mongodb://localhost:27017")`,
      },
      {
        id: 'inject-settings',
        code: `def __init__(self, settings: Settings):
    self.client = pymongo.MongoClient(settings.mongo_uri)`,
      },
    ],
    diagram: {
      coreName: 'OrderService',
      coreDescription: 'Places orders.',
      contractName: 'Storage',
      contractDescription: 'Storage contract',
      coupledNode: 'pymongo.MongoClient',
      productionImplementation: 'pymongo.MongoClient',
      testImplementation: 'FakeStorage',
      startsInjected: false,
      startsAbstract: false,
      startsWithTestDouble: false,
      hidesContractInitially: true,
      mode: 'client-injection',
    },
  },
  storageLevel(
    'storage-adapter',
    ['extract-storage', 'inject-storage'],
    [
      {
        id: 'extract-storage',
        code: `class MongoOrderStorage:
    def __init__(self, client: pymongo.MongoClient):
        self.collection = client["shop"]["orders"]

    def save(self, order: dict) -> None:
        self.collection.insert_one(order)`,
        effect: 'extraction',
      },
      {
        id: 'inject-storage',
        code: `def __init__(self, storage: MongoOrderStorage):
    self.storage = storage`,
        effect: 'injection',
      },
      {
        id: 'inject-client',
        code: `def __init__(self, client: pymongo.MongoClient):
    self.client = client`,
      },
      {
        id: 'lazy-client',
        code: `def place(self, order):
    if self._mongo is None:
        self._mongo = pymongo.MongoClient("mongodb://localhost:27017")
    self._mongo["shop"]["orders"].insert_one(order)`,
      },
      {
        id: 'module-singleton',
        code: `# storage.py
client = pymongo.MongoClient("mongodb://localhost:27017")`,
      },
    ],
    {
      coreDescription: 'Places orders.',
      startsAbstract: false,
      hidesContractInitially: true,
      requiresExtraction: true,
      coupledNode: 'pymongo.MongoClient',
      productionImplementation: 'MongoOrderStorage',
    },
  ),
  storageLevel(
    'composition-root',
    ['wire-at-root'],
    [
      {
        id: 'wire-at-root',
        code: `# main.py
client = pymongo.MongoClient("mongodb://localhost:27017")
storage = MongoOrderStorage(client)
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
    client = pymongo.MongoClient("mongodb://localhost:27017")
    return OrderService(MongoOrderStorage(client))`,
      },
      {
        id: 'lazy-init',
        code: `@property
def storage(self):
    if self._storage is None:
        client = pymongo.MongoClient("mongodb://localhost:27017")
        self._storage = MongoOrderStorage(client)
    return self._storage`,
      },
    ],
    {
      startsInjected: true,
      startsAbstract: false,
      hidesContractInitially: false,
      mode: 'composition',
    },
  ),
  storageLevel(
    'test-double',
    ['fake-in-test'],
    [
      {
        id: 'fake-in-test',
        code: `def test_place_order():
    fake = FakeStorage()
    service = OrderService(fake)
    service.place({"id": "A-1"})
    assert fake.saved == [{"id": "A-1"}]`,
        effect: 'test-double',
      },
      {
        id: 'mongomock-client',
        code: `client = mongomock.MongoClient()
service = OrderService(MongoOrderStorage(client))`,
      },
      {
        id: 'monkeypatch-mongo',
        code: `def test_place_order(monkeypatch):
    monkeypatch.setattr(app, 'MongoOrderStorage', FakeStorage)`,
      },
      {
        id: 'skip-without-mongo',
        code: `@pytest.mark.skipif(not mongo_up(), reason='no MongoDB')
def test_place_order():
    ...`,
      },
    ],
    {
      startsInjected: true,
      hidesContractInitially: false,
    },
  ),
  {
    id: 'capstone',
    correctChoiceIds: ['inject-mailer', 'wire-mailer-at-root', 'fake-mailer-test'],
    choices: [
      {
        id: 'inject-mailer',
        code: `def __init__(self, mailer: Mailer):
    self.mailer = mailer

def send_welcome(self, to: str) -> None:
    self.mailer.send(to, "Welcome!", "Welcome to the app.")`,
        effect: 'injection',
      },
      {
        id: 'wire-mailer-at-root',
        code: `# main.py
mailer = SmtpMailer()
service = NotificationService(mailer)`,
        effect: 'composition',
      },
      {
        id: 'fake-mailer-test',
        code: `def test_welcome_email():
    fake = FakeMailer()
    service = NotificationService(fake)
    service.send_welcome("ada@example.com")
    assert fake.sent == [{
        "to": "ada@example.com",
        "subject": "Welcome!",
        "body": "Welcome to the app.",
    }]`,
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
      mode: 'capstone',
      startsInjected: false,
      startsAbstract: true,
      startsWithTestDouble: false,
      hidesContractInitially: true,
    },
  },
]
