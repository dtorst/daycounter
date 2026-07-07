export const DAYCOUNTER_SCHEMA_VERSION = 1
export const DEFAULT_SKIN_ID = 'classic-sunrise'
export const MS_PER_DAY = 86400000

export function coerceNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function resolveReason(reason, otherReason) {
  const normalizedReason = typeof reason === 'string' ? reason.trim() : ''
  const normalizedOtherReason = typeof otherReason === 'string' ? otherReason.trim() : ''
  return normalizedReason === 'other'
    ? (normalizedOtherReason || 'other')
    : normalizedReason
}

export function normalizeSelectedDate(input = {}) {
  const source = input && typeof input === 'object' ? input : {}
  const year = coerceNumber(source.selectedYear ?? source.year)
  const month = coerceNumber(source.selectedMonth ?? source.month)
  const day = coerceNumber(source.selectedDay ?? source.day)

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  if (year < 1900 || year > 3000 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return { year, month, day }
}

export function computeDaysSince(year, month, day, today = new Date()) {
  const selectedDate = normalizeSelectedDate({ year, month, day })
  if (!selectedDate) return NaN

  const currentDate = today instanceof Date ? today : new Date(today)
  if (Number.isNaN(currentDate.getTime())) return NaN

  const todayUtcMidnight = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  )
  const selectedUtcMidnight = Date.UTC(
    selectedDate.year,
    selectedDate.month - 1,
    selectedDate.day
  )

  return Math.floor((todayUtcMidnight - selectedUtcMidnight) / MS_PER_DAY)
}

export function computeDaysSinceSelectedDate(selectedDate, today = new Date()) {
  if (!selectedDate) return NaN
  return computeDaysSince(selectedDate.year, selectedDate.month, selectedDate.day, today)
}

export function createDayCounterState(input = {}) {
  const selectedDate = normalizeSelectedDate(input.selectedDate || input)
  if (!selectedDate) return null

  const rawReason = typeof input.reason === 'string' ? input.reason.trim() : ''
  const reason = rawReason === 'other...' ? 'other' : rawReason
  const otherReason = typeof input.otherReason === 'string' ? input.otherReason.trim() : ''
  const skinId = typeof input.skinId === 'string' && input.skinId.trim()
    ? input.skinId.trim()
    : DEFAULT_SKIN_ID
  const updatedAt = typeof input.updatedAt === 'string' && input.updatedAt
    ? input.updatedAt
    : new Date().toISOString()

  return {
    schemaVersion: DAYCOUNTER_SCHEMA_VERSION,
    reason,
    otherReason,
    selectedDate,
    skinId,
    updatedAt
  }
}

export function migrateDayCounterState(payload) {
  if (!payload || typeof payload !== 'object') return null

  if (payload.schemaVersion === DAYCOUNTER_SCHEMA_VERSION) {
    return createDayCounterState(payload)
  }

  return createDayCounterState(payload)
}

export function resolveDayCountFromState(state, today = new Date()) {
  const canonicalState = migrateDayCounterState(state)
  if (!canonicalState) return null

  const days = computeDaysSinceSelectedDate(canonicalState.selectedDate, today)
  const why = resolveReason(canonicalState.reason, canonicalState.otherReason)
  if (!Number.isFinite(days) || days < 0 || !why) return null

  return {
    days,
    why,
    skinId: canonicalState.skinId
  }
}

export function isAnniversaryToday(state, today = new Date()) {
  const canonicalState = migrateDayCounterState(state)
  if (!canonicalState) return false

  const currentDate = today instanceof Date ? today : new Date(today)
  if (Number.isNaN(currentDate.getTime())) return false

  return (
    canonicalState.selectedDate.month === currentDate.getMonth() + 1 &&
    canonicalState.selectedDate.day === currentDate.getDate()
  )
}

export function buildWidgetSnapshot(state, today = new Date()) {
  const canonicalState = migrateDayCounterState(state)
  const resolved = resolveDayCountFromState(canonicalState, today)
  if (!canonicalState || !resolved) return null

  return {
    days: resolved.days,
    skinId: canonicalState.skinId
  }
}
