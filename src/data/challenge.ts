export type ChangeId = 'contract' | 'injection' | 'test-double'

export type CodeChange = {
  id: ChangeId
  step: string
  category: string
  title: string
  code: string
  explanation: string
}

export const challengeChanges: CodeChange[] = [
  {
    id: 'contract',
    step: '01',
    category: 'CONTRATO',
    title: 'Define un puerto',
    code: `class Storage(Protocol):
    def save(self, order: Order) -> None: ...`,
    explanation: 'El servicio describe lo que necesita, sin conocer Redis.',
  },
  {
    id: 'injection',
    step: '02',
    category: 'INYECCIÓN · DI',
    title: 'Recibe la dependencia',
    code: `def __init__(self, storage: Storage):
    self.storage = storage`,
    explanation: 'La implementación se proporciona desde afuera.',
  },
  {
    id: 'test-double',
    step: '03',
    category: 'PRUEBA',
    title: 'Usa una alternativa',
    code: 'service = OrderService(FakeStorage())',
    explanation: 'Prueba el servicio sin iniciar un Redis real.',
  },
]
