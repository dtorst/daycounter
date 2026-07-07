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

    private let suiteName = "group.com.davidtorstenson.daycounter"
    private let daysKey = "daycounter.days"

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

        defaults.set(days, forKey: daysKey)
        defaults.synchronize()
        NSLog("DayCounterWidgetBridge wrote daycounter.days=%d", days)

        WidgetCenter.shared.reloadAllTimelines()

        call.resolve([
            "days": days
        ])
    }
}
