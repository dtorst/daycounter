export const DAYCOUNTER_SCHEMA_VERSION = 2
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

export function createDayCountId() {
  return `daycount-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createDayCountEntry(input = {}) {
  const source = input && typeof input === 'object' ? input : {}
  const selectedDate = normalizeSelectedDate(source.selectedDate || source)
  if (!selectedDate) return null

  const rawReason = typeof source.reason === 'string' ? source.reason.trim() : ''
  const reason = rawReason === 'other...' ? 'other' : rawReason
  const otherReason = typeof source.otherReason === 'string' ? source.otherReason.trim() : ''
  const skinId = typeof source.skinId === 'string' && source.skinId.trim()
    ? source.skinId.trim()
    : DEFAULT_SKIN_ID
  const updatedAt = typeof source.updatedAt === 'string' && source.updatedAt
    ? source.updatedAt
    : new Date().toISOString()
  const id = typeof source.id === 'string' && source.id.trim()
    ? source.id.trim()
    : createDayCountId()

  return {
    id,
    reason,
    otherReason,
    selectedDate,
    skinId,
    updatedAt
  }
}

export function clampDayCountIndex(index, dayCounts = []) {
  if (!Array.isArray(dayCounts) || dayCounts.length === 0) return 0

  const normalizedIndex = Number(index)
  if (!Number.isInteger(normalizedIndex)) return 0

  return Math.min(Math.max(normalizedIndex, 0), dayCounts.length - 1)
}

export function createDayCounterState(input = {}) {
  const source = input && typeof input === 'object' ? input : {}
  const rawDayCounts = Array.isArray(source.dayCounts) ? source.dayCounts : [source]
  const dayCounts = rawDayCounts
    .map((dayCount) => createDayCountEntry(dayCount))
    .filter(Boolean)

  if (dayCounts.length === 0) return null

  const updatedAt = typeof source.updatedAt === 'string' && source.updatedAt
    ? source.updatedAt
    : new Date().toISOString()
  const currentIndex = clampDayCountIndex(source.currentIndex, dayCounts)

  return {
    schemaVersion: DAYCOUNTER_SCHEMA_VERSION,
    dayCounts,
    currentIndex,
    updatedAt
  }
}

export function migrateDayCounterState(payload) {
  if (!payload || typeof payload !== 'object') return null

  if (payload.schemaVersion === DAYCOUNTER_SCHEMA_VERSION || Array.isArray(payload.dayCounts)) {
    return createDayCounterState(payload)
  }

  return createDayCounterState(payload)
}

export function getCurrentDayCountEntry(state) {
  const canonicalState = migrateDayCounterState(state)
  if (!canonicalState) return null

  return canonicalState.dayCounts[canonicalState.currentIndex] || canonicalState.dayCounts[0] || null
}

export function resolveDayCountEntry(entry, today = new Date()) {
  const dayCount = createDayCountEntry(entry)
  if (!dayCount) return null

  const days = computeDaysSinceSelectedDate(dayCount.selectedDate, today)
  const why = resolveReason(dayCount.reason, dayCount.otherReason)
  if (!Number.isFinite(days) || days < 0 || !why) return null

  return {
    id: dayCount.id,
    days,
    why,
    skinId: dayCount.skinId,
    selectedDate: dayCount.selectedDate,
    reason: dayCount.reason,
    otherReason: dayCount.otherReason
  }
}

export function resolveDayCountsFromState(state, today = new Date()) {
  const canonicalState = migrateDayCounterState(state)
  if (!canonicalState) return []

  return canonicalState.dayCounts
    .map((dayCount) => resolveDayCountEntry(dayCount, today))
    .filter(Boolean)
}

export function resolveDayCountFromState(state, today = new Date()) {
  return resolveDayCountEntry(getCurrentDayCountEntry(state), today)
}

export function isAnniversaryToday(state, today = new Date()) {
  const currentDayCount = getCurrentDayCountEntry(state)
  if (!currentDayCount) return false

  const currentDate = today instanceof Date ? today : new Date(today)
  if (Number.isNaN(currentDate.getTime())) return false

  return (
    currentDayCount.selectedDate.month === currentDate.getMonth() + 1 &&
    currentDayCount.selectedDate.day === currentDate.getDate()
  )
}

export function buildWidgetSnapshot(state, today = new Date()) {
  const canonicalState = migrateDayCounterState(state)
  const resolved = resolveDayCountFromState(canonicalState, today)
  if (!canonicalState || !resolved) return null

  return {
    days: resolved.days,
    skinId: resolved.skinId
  }
}
