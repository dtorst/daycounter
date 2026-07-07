import { Capacitor, registerPlugin } from '@capacitor/core'

const DayCounterWidgetBridge = registerPlugin('DayCounterWidgetBridge')

export function syncWidgetDayCount(days) {
  const normalizedDays = Number(days)

  if (Capacitor.getPlatform() !== 'ios') {
    return Promise.resolve(false)
  }

  if (!Number.isFinite(normalizedDays) || normalizedDays < 0) {
    return Promise.resolve(false)
  }

  return DayCounterWidgetBridge.update({ days: normalizedDays })
    .then(() => true)
    .catch((error) => {
      console.warn('Unable to sync Daycounter widget', error)
      return false
    })
}
