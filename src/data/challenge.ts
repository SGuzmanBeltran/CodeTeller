export type ChangeId = 'contract' | 'injection' | 'test-double'
export type TestResult = 'passed' | 'incomplete' | null

export const changeIds: ChangeId[] = ['contract', 'injection', 'test-double']

export const codeSamples: Record<ChangeId, string> = {
  contract: `class Storage(Protocol):
    def save(self, order: Order) -> None: ...`,
  injection: `def __init__(self, storage: Storage):
    self.storage = storage`,
  'test-double': 'service = OrderService(FakeStorage())',
}
