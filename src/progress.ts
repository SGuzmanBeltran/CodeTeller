import { diLevels, type LevelId, type TestResult } from './data/diModule'

export type ModuleProgress = {
  started: boolean
  currentLevelId: LevelId
  selectedOptionIds: string[]
  testResult: TestResult
  completedLevelIds: LevelId[]
  moduleComplete: boolean
}

export const progressKey = 'codeteller-di-intro-module-v2'

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
    const stored = window.localStorage.getItem(progressKey)
    if (!stored) return createProgress()

    const value: unknown = JSON.parse(stored)
    if (!isRecord(value)) return createProgress()

    const currentLevelId = isLevelId(value.currentLevelId) ? value.currentLevelId : diLevels[0].id
    const currentLevel = diLevels.find((level) => level.id === currentLevelId) ?? diLevels[0]
    const selectedOptionIds = Array.isArray(value.selectedOptionIds)
      ? [...new Set(value.selectedOptionIds
          .filter((id): id is string => typeof id === 'string')
          .map((id) => legacyChoiceIds[id] ?? id)
          .filter((id) => currentLevel.choices.some((choice) => choice.id === id)))]
      : []
    const completedLevelIds = Array.isArray(value.completedLevelIds)
      ? value.completedLevelIds.filter(isLevelId)
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
