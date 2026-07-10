import {
  buildWidgetSnapshot,
  createDayCountEntry,
  createDayCounterState,
  getCurrentDayCountEntry,
  migrateDayCounterState,
  resolveDayCountFromState
} from '../shared/dayCount'

export const DAYCOUNTER_STORAGE_KEYS = {
  canonicalState: 'daycounterState',
  widgetSnapshot: 'daycounterWidgetSnapshot',
  legacySelections: 'daycounterSelections',
  legacyDayCount: 'daycounterDayCount'
}

function getLocalStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage
    }
  } catch (e) {
    // ignore unavailable storage
  }
  return null
}

function readJson(key) {
  try {
    const storage = getLocalStorage()
    if (!storage) return null

    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

function writeJson(key, value) {
  try {
    const storage = getLocalStorage()
    if (!storage) return false

    storage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    return false
  }
}

function stateToLegacySelections(state) {
  const currentDayCount = getCurrentDayCountEntry(state)
  if (!currentDayCount || !currentDayCount.selectedDate) return null

  return {
    reason: String(currentDayCount.reason ?? ''),
    otherReason: String(currentDayCount.otherReason ?? ''),
    selectedMonth: String(currentDayCount.selectedDate.month ?? ''),
    selectedDay: String(currentDayCount.selectedDate.day ?? ''),
    selectedYear: String(currentDayCount.selectedDate.year ?? '')
  }
}

function persistWidgetSnapshotForState(state) {
  const snapshot = buildWidgetSnapshot(state)
  if (!snapshot) return null

  writeJson(DAYCOUNTER_STORAGE_KEYS.widgetSnapshot, snapshot)
  return snapshot
}

export function persistDayCounterState(input) {
  const state = createDayCounterState(input)
  if (!state) return null

  writeJson(DAYCOUNTER_STORAGE_KEYS.canonicalState, state)
  const legacySelections = stateToLegacySelections(state)
  if (legacySelections) {
    writeJson(DAYCOUNTER_STORAGE_KEYS.legacySelections, legacySelections)
  }
  persistWidgetSnapshotForState(state)
  return state
}

export function readDayCounterState() {
  const rawCanonicalState = readJson(DAYCOUNTER_STORAGE_KEYS.canonicalState)
  const canonicalState = migrateDayCounterState(
    rawCanonicalState
  )
  if (canonicalState) {
    if (
      !rawCanonicalState ||
      rawCanonicalState.schemaVersion !== canonicalState.schemaVersion ||
      !Array.isArray(rawCanonicalState.dayCounts)
    ) {
      writeJson(DAYCOUNTER_STORAGE_KEYS.canonicalState, canonicalState)
    }
    return canonicalState
  }

  const legacyState = migrateDayCounterState(
    readJson(DAYCOUNTER_STORAGE_KEYS.legacySelections)
  )
  if (legacyState) {
    persistDayCounterState(legacyState)
    return legacyState
  }

  return null
}

export function persistSelections({ reason, otherReason, month, day, year, skinId } = {}) {
  const legacyPayload = {
    reason: String(reason ?? ''),
    otherReason: String(otherReason ?? ''),
    selectedMonth: String(month ?? ''),
    selectedDay: String(day ?? ''),
    selectedYear: String(year ?? '')
  }

  writeJson(DAYCOUNTER_STORAGE_KEYS.legacySelections, legacyPayload)

  const currentState = readDayCounterState()
  if (currentState) {
    const currentDayCount = getCurrentDayCountEntry(currentState) || {}
    const nextDayCount = createDayCountEntry({
      ...currentDayCount,
      reason,
      otherReason,
      selectedDate: { year, month, day },
      skinId
    })
    if (!nextDayCount) return null

    const nextDayCounts = currentState.dayCounts.slice()
    nextDayCounts[currentState.currentIndex] = nextDayCount
    return persistDayCounterState({
      ...currentState,
      dayCounts: nextDayCounts,
      updatedAt: new Date().toISOString()
    })
  }

  return persistDayCounterState({
    reason,
    otherReason,
    selectedDate: { year, month, day },
    skinId
  })
}

export function readSelections() {
  const state = readDayCounterState()
  const selections = stateToLegacySelections(state)
  if (selections) return selections

  const legacySelections = readJson(DAYCOUNTER_STORAGE_KEYS.legacySelections)
  if (legacySelections && typeof legacySelections === 'object') {
    return legacySelections
  }

  return null
}

export function persistDayCount({ days, why } = {}) {
  const dayCount = {
    days: Number(days),
    why: String(why ?? '')
  }

  if (!Number.isFinite(dayCount.days) || dayCount.days < 0 || !dayCount.why) {
    return null
  }

  writeJson(DAYCOUNTER_STORAGE_KEYS.legacyDayCount, dayCount)

  const state = readDayCounterState()
  if (state) {
    persistWidgetSnapshotForState(state)
  }

  return dayCount
}

export function readDayCount() {
  const resolved = resolveDayCountFromStorage()
  if (resolved) return resolved

  const legacyDayCount = readJson(DAYCOUNTER_STORAGE_KEYS.legacyDayCount)
  if (
    legacyDayCount &&
    typeof legacyDayCount === 'object' &&
    typeof legacyDayCount.days === 'number' &&
    legacyDayCount.days >= 0 &&
    typeof legacyDayCount.why === 'string'
  ) {
    return legacyDayCount
  }

  return null
}

export function resolveDayCountFromStorage() {
  return resolveDayCountFromState(readDayCounterState())
}

export function readWidgetSnapshot() {
  const storedSnapshot = readJson(DAYCOUNTER_STORAGE_KEYS.widgetSnapshot)
  if (
    storedSnapshot &&
    typeof storedSnapshot === 'object' &&
    typeof storedSnapshot.days === 'number' &&
    typeof storedSnapshot.skinId === 'string'
  ) {
    return storedSnapshot
  }

  const state = readDayCounterState()
  return state ? persistWidgetSnapshotForState(state) : null
}
