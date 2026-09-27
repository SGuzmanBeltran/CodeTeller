import { en } from './en'
import { es } from './es'

export type Language = 'es' | 'en'

export type LevelOptionCopy = {
  category: string
  title: string
  explanation: string
}

export type LevelCopy = {
  conceptTitle: string
  conceptIntroduction: string
  conceptWhy: string
  conceptExample: string
  eyebrow: string
  title: string
  introduction: string
  supportingCode?: string
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
  missingChoiceFeedback?: Record<string, string>
  options: Record<string, LevelOptionCopy>
}

export type ModuleCopy = {
  conceptViewLabel: string
  conceptWhyLabel: string
  conceptExampleLabel: string
  startExercise: string
  backToExercise: string
  reviewConcept: string
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
  migrationNotice: {
    v2: string
    v3: string
    dismiss: string
  }
}

export const translations = { es, en } as const

export type AppCopy = (typeof translations)[Language]
