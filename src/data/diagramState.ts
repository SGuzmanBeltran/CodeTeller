import type { DILevel, LevelDiagram } from './diModule'

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
