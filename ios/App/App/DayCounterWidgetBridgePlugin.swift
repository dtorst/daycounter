import Capacitor
import Foundation
import WidgetKit

@objc(DayCounterWidgetBridgePlugin)
public class DayCounterWidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "DayCounterWidgetBridgePlugin"
    public let jsName = "DayCounterWidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise)
    ]

    private let suiteName = "group.com.mapsandlegends.daycounter"
    private let daysKey = "daycounter.days"
    private let selectedYearKey = "daycounter.selectedDate.year"
    private let selectedMonthKey = "daycounter.selectedDate.month"
    private let selectedDayKey = "daycounter.selectedDate.day"

    @objc func update(_ call: CAPPluginCall) {
        guard let days = call.getInt("days") else {
            call.reject("Missing days")
            return
        }

        guard days >= 0 else {
            call.reject("Days must be zero or greater")
            return
        }

        guard let defaults = UserDefaults(suiteName: suiteName) else {
            call.reject("Unable to open App Group storage")
            return
        }

        let selectedYear = call.getInt("selectedYear")
        let selectedMonth = call.getInt("selectedMonth")
        let selectedDay = call.getInt("selectedDay")
        let hasSelectedDatePayload = selectedYear != nil || selectedMonth != nil || selectedDay != nil

        if hasSelectedDatePayload {
            guard let selectedYear, let selectedMonth, let selectedDay else {
                call.reject("Selected date payload is incomplete")
                return
            }

            guard isValidSelectedDate(year: selectedYear, month: selectedMonth, day: selectedDay) else {
                call.reject("Selected date is invalid")
                return
            }

            defaults.set(days, forKey: daysKey)
            defaults.set(selectedYear, forKey: selectedYearKey)
            defaults.set(selectedMonth, forKey: selectedMonthKey)
            defaults.set(selectedDay, forKey: selectedDayKey)
        } else {
            defaults.set(days, forKey: daysKey)
            defaults.removeObject(forKey: selectedYearKey)
            defaults.removeObject(forKey: selectedMonthKey)
            defaults.removeObject(forKey: selectedDayKey)
        }

        defaults.synchronize()
        NSLog("DayCounterWidgetBridge wrote daycounter.days=%d selectedDate=%@-%@-%@", days, selectedYear.map(String.init) ?? "nil", selectedMonth.map(String.init) ?? "nil", selectedDay.map(String.init) ?? "nil")

        WidgetCenter.shared.reloadAllTimelines()

        var response: [String: Any] = ["days": days]
        if let selectedYear, let selectedMonth, let selectedDay {
            response["selectedYear"] = selectedYear
            response["selectedMonth"] = selectedMonth
            response["selectedDay"] = selectedDay
        }
        call.resolve(response)
    }

    private func isValidSelectedDate(year: Int, month: Int, day: Int) -> Bool {
        var components = DateComponents()
        components.calendar = Calendar(identifier: .gregorian)
        components.year = year
        components.month = month
        components.day = day

        guard
            let date = components.calendar?.date(from: components),
            let resolved = components.calendar?.dateComponents([.year, .month, .day], from: date)
        else {
            return false
        }

        return resolved.year == year &&
            resolved.month == month &&
            resolved.day == day
    }
}
