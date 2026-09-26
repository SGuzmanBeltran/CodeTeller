import { en } from './en'
import { es } from './es'

export type Language = 'es' | 'en'

export type LevelOptionCopy = {
  category: string
  title: string
  explanation: string
}

export type LevelCopy = {
  eyebrow: string
  title: string
  introduction: string
  objectiveLabel: string
  objective: string
  conceptLabel: string
  conceptTag: string
  concept: string
  hintLabel: string
  hint: string
  taskTitle: string
  taskSubtitle: string
  successDescription: string
  failureDescription: string
  options: Record<string, LevelOptionCopy>
}

export type ModuleCopy = {
  levelPrefix: string
  progressOf: string
  solutionEyebrow: string
  solutionTitle: string
  checkHint: string
  runCheck: string
  passedTitle: string
  incompleteTitle: string
  nextLevel: string
  finishModule: string
}

export const translations = { es, en } as const

export type AppCopy = (typeof translations)[Language]
