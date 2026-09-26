import { diLevels, type LevelId, type TestResult } from './data/diModule'

export type ModuleProgress = {
  started: boolean
  currentLevelId: LevelId
  selectedOptionIds: string[]
  testResult: TestResult
  completedLevelIds: LevelId[]
  moduleComplete: boolean
  migrationNotice: 'v2' | 'v3' | null
}

export const progressKey = 'codeteller-di-intro-module-v4'

const legacyProgressKeys = [
  { key: 'codeteller-di-intro-module-v3', version: 'v3' as const },
  { key: 'codeteller-di-intro-module-v2', version: 'v2' as const },
]

const legacyChoiceIds: Record<string, string> = {
  'fakeredis-client': 'mongomock-client',
  'monkeypatch-redis': 'monkeypatch-mongo',
  'skip-without-redis': 'skip-without-mongo',
}

export function createProgress(started = false): ModuleProgress {
  return {
    started,
    currentLevelId: diLevels[0].id,
    selectedOptionIds: [],
    testResult: null,
    completedLevelIds: [],
    moduleComplete: false,
    migrationNotice: null,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isLevelId(value: unknown): value is LevelId {
  return typeof value === 'string' && diLevels.some((level) => level.id === value)
}

export function getInitialProgress(): ModuleProgress {
  try {
    const current = window.localStorage.getItem(progressKey)
    if (current) return parseStoredProgress(current, null)

    for (const legacy of legacyProgressKeys) {
      const stored = window.localStorage.getItem(legacy.key)
      if (stored) return parseStoredProgress(stored, legacy.version)
    }
    return createProgress()
  } catch {
    return createProgress()
  }
}

function parseStoredProgress(stored: string, sourceVersion: 'v2' | 'v3' | null): ModuleProgress {
  try {
    const value: unknown = JSON.parse(stored)
    if (!isRecord(value)) return createProgress()

    const rawCompleted: unknown[] = Array.isArray(value.completedLevelIds)
      ? value.completedLevelIds
      : []
    // In v2, 'constructor-injection' meant the storage-adapter goal. Preserve
    // that completion under its new ID instead of passing the new challenge 1.
    const completedLevelIds = [...new Set(rawCompleted
      .filter((id): id is string => typeof id === 'string')
      .map((id) => legacyChoiceIds[id] ?? id)
      .map((id) => sourceVersion === 'v2' && id === 'constructor-injection' ? 'storage-adapter' : id))]
      .filter((id): id is LevelId => isLevelId(id) &&
        (sourceVersion === null || (id !== 'test-double' && id !== 'capstone')))

    const storedLevelId = typeof value.currentLevelId === 'string' ? value.currentLevelId : ''
    const currentLevelId = isLevelId(storedLevelId) ? storedLevelId :
      sourceVersion ? 'capstone' : diLevels[0].id
    const currentLevel = diLevels.find((level) => level.id === currentLevelId) ?? diLevels[0]
    const savedOptionIds = Array.isArray(value.selectedOptionIds)
      ? [...new Set(value.selectedOptionIds
          .filter((id): id is string => typeof id === 'string')
          .map((id) => legacyChoiceIds[id] ?? id)
          .filter((id) => currentLevel.choices.some((choice) => choice.id === id)))]
      : []
    const selectedOptionIds = currentLevel.correctChoiceIds.length === 1 && savedOptionIds.length > 1
      ? savedOptionIds.slice(-1)
      : savedOptionIds
    const selectionWasNormalized = selectedOptionIds.length !== savedOptionIds.length
    const resultNeedsReview = sourceVersion !== null && (
      (sourceVersion === 'v2' && currentLevelId === 'constructor-injection') ||
      currentLevelId === 'test-double' || currentLevelId === 'capstone'
    )
    const storedResult: TestResult = !resultNeedsReview &&
      (value.testResult === 'passed' || value.testResult === 'incomplete')
      ? value.testResult
      : null
    const testResult: TestResult = selectedOptionIds.length > 0 && !selectionWasNormalized ? storedResult : null

    // Do not let migration skip a newly changed challenge. The test and
    // capstone objectives changed, so their old passes are intentionally reset.
    const firstIncomplete = diLevels.find((level) => !completedLevelIds.includes(level.id))
    const currentIndex = diLevels.findIndex((level) => level.id === currentLevelId)
    const firstIncompleteIndex = firstIncomplete
      ? diLevels.findIndex((level) => level.id === firstIncomplete.id)
      : currentIndex
    const safeCurrentLevelId = sourceVersion && currentIndex > firstIncompleteIndex
      ? firstIncomplete?.id ?? currentLevelId
      : currentLevelId

    return {
      started: value.started === true || completedLevelIds.length > 0 || selectedOptionIds.length > 0,
      currentLevelId: safeCurrentLevelId,
      selectedOptionIds: safeCurrentLevelId === currentLevelId ? selectedOptionIds : [],
      testResult: safeCurrentLevelId === currentLevelId ? testResult : null,
      completedLevelIds,
      moduleComplete: diLevels.every((level) => completedLevelIds.includes(level.id)),
      migrationNotice: sourceVersion ?? (value.migrationNotice === 'v2' || value.migrationNotice === 'v3'
        ? value.migrationNotice
        : null),
    }
  } catch {
    return createProgress()
  }
}
