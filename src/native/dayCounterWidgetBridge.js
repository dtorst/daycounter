import { Capacitor, registerPlugin } from '@capacitor/core'

const DayCounterWidgetBridge = registerPlugin('DayCounterWidgetBridge')

function normalizeSelectedDate(input) {
  const selectedDate = input && input.selectedDate ? input.selectedDate : input
  if (!selectedDate || typeof selectedDate !== 'object') return null

  const year = Number(selectedDate.year)
  const month = Number(selectedDate.month)
  const day = Number(selectedDate.day)

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null
  }

  return { year, month, day }
}

export function syncWidgetDayCount(days, selectedDate) {
  const normalizedDays = Number(days)

  if (Capacitor.getPlatform() !== 'ios') {
    return Promise.resolve(false)
  }

  if (!Number.isFinite(normalizedDays) || normalizedDays < 0) {
    return Promise.resolve(false)
  }

  const payload = { days: normalizedDays }
  const normalizedSelectedDate = normalizeSelectedDate(selectedDate)

  if (normalizedSelectedDate) {
    payload.selectedYear = normalizedSelectedDate.year
    payload.selectedMonth = normalizedSelectedDate.month
    payload.selectedDay = normalizedSelectedDate.day
  }

  return DayCounterWidgetBridge.update(payload)
    .then(() => true)
    .catch((error) => {
      console.warn('Unable to sync Daycounter widget', error)
      return false
    })
}
