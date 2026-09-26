import { diLevels, type LevelId, type TestResult } from './data/diModule'

export type ModuleProgress = {
  started: boolean
  currentLevelId: LevelId
  selectedOptionIds: string[]
  testResult: TestResult
  completedLevelIds: LevelId[]
  moduleComplete: boolean
}

export const progressKey = 'codeteller-di-intro-module-v3'

// Previous key: the old level 1 ('constructor-injection' = extract + inject
// storage) now lives as 'storage-adapter', and the id 'constructor-injection'
// is a new challenge (receive MongoClient). An old pass must not count as the
// new goal, so v2 completions of that id are remapped on first load.
const legacyProgressKey = 'codeteller-di-intro-module-v2'

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
    if (current) return parseStoredProgress(current, false)

    const legacy = window.localStorage.getItem(legacyProgressKey)
    if (!legacy) return createProgress()
    return parseStoredProgress(legacy, true)
  } catch {
    return createProgress()
  }
}

function parseStoredProgress(stored: string, migrateV2: boolean): ModuleProgress {
  try {
    const value: unknown = JSON.parse(stored)
    if (!isRecord(value)) return createProgress()

    const rawCompleted: unknown[] = Array.isArray(value.completedLevelIds)
      ? value.completedLevelIds
      : []
    // One-time v2 -> v3 migration: old 'constructor-injection' meant the
    // storage-adapter goal, so it maps there instead of passing the new reto 1.
    const completedLevelIds = [...new Set(rawCompleted
      .filter((id): id is string => typeof id === 'string')
      .map((id) => legacyChoiceIds[id] ?? id)
      .map((id) => migrateV2 && id === 'constructor-injection' ? 'storage-adapter' : id))]
      .filter(isLevelId)

    const currentLevelId = isLevelId(value.currentLevelId) ? value.currentLevelId : diLevels[0].id
    const currentLevel = diLevels.find((level) => level.id === currentLevelId) ?? diLevels[0]
    const selectedOptionIds = Array.isArray(value.selectedOptionIds)
      ? [...new Set(value.selectedOptionIds
          .filter((id): id is string => typeof id === 'string')
          .map((id) => legacyChoiceIds[id] ?? id)
          .filter((id) => currentLevel.choices.some((choice) => choice.id === id)))]
      : []
    const storedResult: TestResult = value.testResult === 'passed' || value.testResult === 'incomplete'
      ? value.testResult
      : null
    const testResult: TestResult = selectedOptionIds.length > 0 ? storedResult : null

    return {
      started: value.started === true || completedLevelIds.length > 0 || selectedOptionIds.length > 0,
      currentLevelId,
      selectedOptionIds,
      testResult,
      completedLevelIds,
      moduleComplete: value.moduleComplete === true && completedLevelIds.length === diLevels.length,
    }
  } catch {
    return createProgress()
  }
}
