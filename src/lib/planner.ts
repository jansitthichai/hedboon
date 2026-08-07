import { getCeremony, guestFormula } from './knowledge'
import type { CeremonyId, PlanInput, PlanResult, RitualStyleId } from '../types/hedboon'

function ceil(n: number): number {
  return Math.ceil(n)
}

const ritualBaseByCeremony: Partial<Record<CeremonyId, number>> = {
  housewarming: 2000,
  ordination: 3500,
  wedding: 5000,
  riceHeap: 1800,
  suKwan: 1500,
  ageMerit: 2000,
  puTa: 1200,
  athi: 2800,
  taHaek: 1000,
}

function resolveStyle(ceremonyId: CeremonyId, ritualStyleId?: RitualStyleId) {
  const ceremony = getCeremony(ceremonyId)
  const styles = ceremony.ritualStyles ?? []

  if (ritualStyleId) {
    const found = styles.find((s) => s.id === ritualStyleId)
    if (found) return found
  }

  if (ceremony.monkMode === 'none') {
    return (
      styles.find((s) => !s.requiresMonks) ?? {
        id: 'folk' as const,
        nameTh: 'ไม่มีพระ',
        requiresMonks: false,
        steps: ceremony.steps,
        checklist: ceremony.checklist,
        scheduleTemplate: ceremony.scheduleTemplate,
      }
    )
  }

  if (ceremony.monkMode === 'optional') {
    return (
      styles.find((s) => s.id === ritualStyleId) ??
      styles.find((s) => !s.requiresMonks) ??
      styles.find((s) => s.id === 'buddhist') ??
      styles[0] ?? {
        id: 'buddhist' as const,
        nameTh: 'นิมนต์พระ',
        requiresMonks: true,
        steps: ceremony.steps,
        checklist: ceremony.checklist,
        scheduleTemplate: ceremony.scheduleTemplate,
      }
    )
  }

  return (
    styles.find((s) => s.requiresMonks) ?? {
      id: 'buddhist' as const,
      nameTh: 'นิมนต์พระ',
      requiresMonks: true,
      steps: ceremony.steps,
      checklist: ceremony.checklist,
      scheduleTemplate: ceremony.scheduleTemplate,
    }
  )
}

export function buildPlan(input: PlanInput): PlanResult {
  const ceremony = getCeremony(input.ceremonyId)
  const style = resolveStyle(input.ceremonyId, input.ritualStyleId)
  const guests = Math.max(1, Math.floor(input.guests))
  const requiresMonks = style.requiresMonks
  const monks = requiresMonks
    ? Math.max(1, input.monks ?? guestFormula.monkMealSetsDefault)
    : 0

  const riceKg = ceil(guests * guestFormula.riceKgPerGuest)
  const waterBottles = ceil(guests * guestFormula.waterBottlesPerGuest)
  const tables = ceil(guests / guestFormula.seatsPerTable)
  const chairs = guests
  const dessertSets = ceil(guests * guestFormula.dessertSetsPerGuest)
  const monkMeals = monks

  const foodPerGuest = 120
  const ritualBase = ritualBaseByCeremony[input.ceremonyId] ?? 2000
  const food = guests * foodPerGuest + monkMeals * 150
  const ritual = ritualBase
  const total = food + ritual

  return {
    ceremony,
    ritualStyleName: style.nameTh,
    requiresMonks,
    steps: style.steps,
    checklist: style.checklist,
    quantities: {
      riceKg,
      waterBottles,
      tables,
      chairs,
      dessertSets,
      monkMeals,
    },
    schedule: style.scheduleTemplate,
    estimatedBudget: {
      food,
      ritual,
      total,
      note:
        input.budget && input.budget > 0
          ? total <= input.budget
            ? `ประมาณการอยู่ในงบ ${input.budget.toLocaleString('th-TH')} บาท`
            : `ประมาณการเกินงบประมาณราว ${(total - input.budget).toLocaleString('th-TH')} บาท — ลองลดจำนวนแขกหรือปรับเมนู`
          : 'เป็นประมาณการเบื้องต้นสำหรับวางแผน ไม่ใช่ราคาตลาดจริง',
    },
    taboos: ceremony.taboos,
  }
}
