import {
  buildWidgetSnapshot,
  createDayCounterState,
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
  if (!state || !state.selectedDate) return null

  return {
    reason: String(state.reason ?? ''),
    otherReason: String(state.otherReason ?? ''),
    selectedMonth: String(state.selectedDate.month ?? ''),
    selectedDay: String(state.selectedDate.day ?? ''),
    selectedYear: String(state.selectedDate.year ?? '')
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
  persistWidgetSnapshotForState(state)
  return state
}

export function readDayCounterState() {
  const canonicalState = migrateDayCounterState(
    readJson(DAYCOUNTER_STORAGE_KEYS.canonicalState)
  )
  if (canonicalState) return canonicalState

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

  return persistDayCounterState({
    reason,
    otherReason,
    selectedDate: { year, month, day },
    skinId
  })
}

export function readSelections() {
  const legacySelections = readJson(DAYCOUNTER_STORAGE_KEYS.legacySelections)
  if (legacySelections && typeof legacySelections === 'object') {
    return legacySelections
  }

  const state = readDayCounterState()
  return stateToLegacySelections(state)
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

  return resolveDayCountFromStorage()
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
