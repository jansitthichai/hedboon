export type CeremonyId =
  | 'housewarming'
  | 'ordination'
  | 'wedding'
  | 'riceHeap'
  | 'suKwan'
  | 'ageMerit'
  | 'puTa'
  | 'athi'
  | 'taHaek'

export type MonkMode = 'required' | 'optional' | 'none'
export type RitualStyleId = 'buddhist' | 'brahmin' | 'folk'

export interface CeremonyStep {
  order: number
  title: string
  detail: string
}

export interface ChecklistItem {
  id: string
  name: string
  note?: string
  required: boolean
}

export interface ScheduleSlot {
  time: string
  title: string
  detail?: string
}

export interface RitualStyle {
  id: RitualStyleId
  nameTh: string
  requiresMonks: boolean
  summaryNote?: string
  steps: CeremonyStep[]
  checklist: ChecklistItem[]
  scheduleTemplate: ScheduleSlot[]
}

export interface Ceremony {
  id: CeremonyId
  nameTh: string
  nameIsan: string
  summary: string
  monkMode: MonkMode
  steps: CeremonyStep[]
  checklist: ChecklistItem[]
  scheduleTemplate: ScheduleSlot[]
  taboos: string[]
  relatedItemIds: string[]
  sources: string[]
  ritualStyles?: RitualStyle[]
}

export interface RitualItem {
  id: string
  name: string
  nameIsan?: string
  meaning: string
  components: string[]
  usedIn: CeremonyId[]
  uses?: string[]
  tips?: string
  sources?: string[]
}

export interface HeetMonth {
  month: number
  nameTh: string
  nameIsan: string
  gregorianHint?: string
  summary: string
  highlights: string[]
  planCeremonyId?: CeremonyId
}

export interface GuestFormula {
  riceKgPerGuest: number
  waterBottlesPerGuest: number
  seatsPerTable: number
  dessertSetsPerGuest: number
  monkMealSetsDefault: number
}

export interface PlanInput {
  ceremonyId: CeremonyId
  guests: number
  budget?: number
  monks?: number
  ritualStyleId?: RitualStyleId
}

export interface PlanResult {
  ceremony: Ceremony
  ritualStyleName?: string
  requiresMonks: boolean
  steps: CeremonyStep[]
  checklist: ChecklistItem[]
  quantities: {
    riceKg: number
    waterBottles: number
    tables: number
    chairs: number
    dessertSets: number
    monkMeals: number
  }
  schedule: ScheduleSlot[]
  estimatedBudget?: {
    food: number
    ritual: number
    total: number
    note: string
  }
  taboos: string[]
}

export interface GraphNodeData {
  id: string
  label: string
  kind: 'item' | 'ceremony' | 'belief' | 'component' | 'taboo'
  detail?: string
}

export interface GraphEdgeData {
  id: string
  source: string
  target: string
  label?: string
}
