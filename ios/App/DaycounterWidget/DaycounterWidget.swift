//
//  DaycounterWidget.swift
//  DaycounterWidget
//

import WidgetKit
import SwiftUI
import UIKit

private enum DaycounterWidgetStorage {
    static let suiteName = "group.com.mapsandlegends.daycounter"
    static let daysKey = "daycounter.days"
    static let selectedYearKey = "daycounter.selectedDate.year"
    static let selectedMonthKey = "daycounter.selectedDate.month"
    static let selectedDayKey = "daycounter.selectedDate.day"

    private static let timelineEntryCount = 31

    static func readDays(on date: Date = Date()) -> Int {
        if
            let selectedDate = readSelectedDate(),
            let computedDays = daysSince(selectedDate, on: date)
        {
            return max(0, computedDays)
        }

        return readCachedDays()
    }

    static func timelineDates(from date: Date) -> [Date] {
        var calendar = Calendar.autoupdatingCurrent
        calendar.timeZone = .autoupdatingCurrent

        var dates = [date]
        let startOfToday = calendar.startOfDay(for: date)

        guard var nextMidnight = calendar.date(byAdding: .day, value: 1, to: startOfToday) else {
            return dates
        }

        for _ in 1..<timelineEntryCount {
            dates.append(nextMidnight)

            guard let followingMidnight = calendar.date(byAdding: .day, value: 1, to: nextMidnight) else {
                break
            }

            nextMidnight = followingMidnight
        }

        return dates
    }

    private static func readCachedDays() -> Int {
        guard let defaults = UserDefaults(suiteName: suiteName) else {
            return 0
        }

        return defaults.integer(forKey: daysKey)
    }

    private static func readSelectedDate() -> DaycounterSelectedDate? {
        guard let defaults = UserDefaults(suiteName: suiteName) else {
            return nil
        }

        guard
            let year = integer(forKey: selectedYearKey, defaults: defaults),
            let month = integer(forKey: selectedMonthKey, defaults: defaults),
            let day = integer(forKey: selectedDayKey, defaults: defaults)
        else {
            return nil
        }

        return DaycounterSelectedDate(year: year, month: month, day: day)
    }

    private static func integer(forKey key: String, defaults: UserDefaults) -> Int? {
        guard let number = defaults.object(forKey: key) as? NSNumber else {
            return nil
        }

        return number.intValue
    }

    private static func daysSince(_ selectedDate: DaycounterSelectedDate, on date: Date) -> Int? {
        var calendar = Calendar.autoupdatingCurrent
        calendar.timeZone = .autoupdatingCurrent

        let selectedDateComponents = DateComponents(
            calendar: calendar,
            timeZone: calendar.timeZone,
            year: selectedDate.year,
            month: selectedDate.month,
            day: selectedDate.day
        )

        guard let selectedDateValue = calendar.date(from: selectedDateComponents) else {
            return nil
        }

        let resolvedComponents = calendar.dateComponents([.year, .month, .day], from: selectedDateValue)
        guard
            resolvedComponents.year == selectedDate.year,
            resolvedComponents.month == selectedDate.month,
            resolvedComponents.day == selectedDate.day
        else {
            return nil
        }

        let selectedStartOfDay = calendar.startOfDay(for: selectedDateValue)
        let currentStartOfDay = calendar.startOfDay(for: date)

        return calendar.dateComponents([.day], from: selectedStartOfDay, to: currentStartOfDay).day
    }
}

private struct DaycounterSelectedDate {
    let year: Int
    let month: Int
    let day: Int
}

struct DaycounterEntry: TimelineEntry {
    let date: Date
    let days: Int
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> DaycounterEntry {
        let date = Date()
        return DaycounterEntry(date: date, days: DaycounterWidgetStorage.readDays(on: date))
    }

    func getSnapshot(in context: Context, completion: @escaping (DaycounterEntry) -> Void) {
        let date = Date()
        completion(DaycounterEntry(date: date, days: DaycounterWidgetStorage.readDays(on: date)))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DaycounterEntry>) -> Void) {
        let now = Date()
        let entries = DaycounterWidgetStorage.timelineDates(from: now).map { date in
            DaycounterEntry(date: date, days: DaycounterWidgetStorage.readDays(on: date))
        }

        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

struct DaycounterWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family

    var entry: DaycounterEntry

    @ViewBuilder
    var body: some View {
        switch family {
        case .accessoryRectangular:
            content
                .unredacted()
                .containerBackground(for: .widget) {
                    EmptyView()
                }
        default:
            content
                .unredacted()
                .containerBackground(for: .widget) {
                    DaycounterSunriseBackground()
                        .unredacted()
                }
        }
    }

    @ViewBuilder
    private var content: some View {
        switch family {
        case .accessoryRectangular:
            AccessoryDayCountView(days: entry.days)
        default:
            MediumDayCountView(days: entry.days)
        }
    }
}

struct MediumDayCountView: View {
    let days: Int

    var body: some View {
        GeometryReader { proxy in
            let counterWidth = proxy.size.width * 0.84

            ZStack {
                DaycounterSunriseForeground()

                FlipDayCountView(days: days, maximumWidth: counterWidth)
                    .padding(.horizontal, 18)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}

struct AccessoryDayCountView: View {
    private static let designSize = CGSize(width: 160, height: 72)

    let days: Int

    var body: some View {
        GeometryReader { proxy in
            let digits = String(max(0, days)).map { String($0) }
            let layout = AccessoryFlipCardLayout.layout(forDigitCount: digits.count)
            let groupWidth = layout.groupWidth(forDigitCount: digits.count)
            let widthScale = proxy.size.width / Self.designSize.width
            let heightScale = proxy.size.height / Self.designSize.height
            let fitScale = max(0, proxy.size.width - 18) / groupWidth
            let scale = min(widthScale, heightScale, fitScale)

            HStack(spacing: layout.spacing * scale) {
                ForEach(Array(digits.enumerated()), id: \.offset) { _, digit in
                    AccessoryFlipDigitCard(digit: digit, layout: layout, scale: scale)
                }
            }
            .frame(width: proxy.size.width, height: proxy.size.height)
        }
        .accessibilityLabel("\(max(0, days)) days")
    }
}

private struct AccessoryFlipCardLayout {
    let cardWidth: CGFloat
    let cardHeight: CGFloat
    let spacing: CGFloat
    let fontSize: CGFloat

    static func layout(forDigitCount digitCount: Int) -> AccessoryFlipCardLayout {
        switch digitCount {
        case ...3:
            return AccessoryFlipCardLayout(cardWidth: 36, cardHeight: 54, spacing: 4, fontSize: 43)
        case 4:
            return AccessoryFlipCardLayout(cardWidth: 32, cardHeight: 48, spacing: 4, fontSize: 38)
        default:
            return AccessoryFlipCardLayout(cardWidth: 25, cardHeight: 37, spacing: 4, fontSize: 34)
        }
    }

    func groupWidth(forDigitCount digitCount: Int) -> CGFloat {
        let cardCount = CGFloat(max(1, digitCount))
        return cardWidth * cardCount + spacing * (cardCount - 1)
    }
}

private struct AccessoryFlipDigitCard: View {
    let digit: String
    let layout: AccessoryFlipCardLayout
    let scale: CGFloat

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 4 * scale, style: .continuous)
                .fill(Color.daycounterLockCard)

            Text(digit)
                .font(.custom("Montserrat-Thin", size: layout.fontSize * scale).weight(.semibold))
                .monospacedDigit()
                .foregroundStyle(Color.white)
                .minimumScaleFactor(0.5)
                .lineLimit(1)
        }
        .overlay {
            Rectangle()
                .fill(Color.daycounterLockDivider)
                .frame(height: max(1, scale))
        }
        .frame(width: layout.cardWidth * scale, height: layout.cardHeight * scale)
    }
}

struct FlipDayCountView: View {
    private static let cardAspectRatio: CGFloat = 0.66
    private static let minimumRegularDigitCount = 4
    private static let spacing: CGFloat = 5

    let days: Int
    let maximumWidth: CGFloat

    private var digits: [String] {
        String(max(0, days)).map { String($0) }
    }

    private var layoutDigitCount: Int {
        max(Self.minimumRegularDigitCount, digits.count)
    }

    var body: some View {
        let cardCount = CGFloat(max(1, layoutDigitCount))
        let cardWidth = max(0, (maximumWidth - Self.spacing * (cardCount - 1)) / cardCount)
        let cardHeight = cardWidth / Self.cardAspectRatio

        HStack(spacing: Self.spacing) {
            ForEach(Array(digits.enumerated()), id: \.offset) { _, digit in
                FlipDigitCard(digit: digit)
                    .frame(width: cardWidth, height: cardHeight)
            }
        }
        .fixedSize(horizontal: false, vertical: true)
    }
}

struct FlipDigitCard: View {
    let digit: String

    var body: some View {
        GeometryReader { proxy in
            let width = proxy.size.width
            let height = proxy.size.height

            ZStack {
                RoundedRectangle(cornerRadius: 7, style: .continuous)
                    .fill(Color(red: 0.2, green: 0.2, blue: 0.2))

                Text(digit)
                    .font(.custom("Montserrat-Thin", size: min(width * 1.55, height * 0.76)).weight(.semibold))
                    .monospacedDigit()
                    .foregroundStyle(Color(red: 0.92, green: 0.92, blue: 0.92))
                    .shadow(color: .black.opacity(0.55), radius: 1, x: 0, y: 1)
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
            }
            .overlay(alignment: .top) {
                RoundedRectangle(cornerRadius: 7, style: .continuous)
                    .fill(Color.white.opacity(0.08))
                    .frame(height: height * 0.48)
            }
            .overlay {
                Rectangle()
                    .fill(Color.black.opacity(0.4))
                    .frame(maxWidth: .infinity)
                    .frame(height: 1)
            }
            .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))
            .shadow(color: .black.opacity(0.45), radius: 3, x: 0, y: 2)
        }
        .aspectRatio(0.66, contentMode: .fit)
    }
}

struct DaycounterSunriseBackground: View {
    var body: some View {
        GeometryReader { proxy in
            let size = proxy.size

            ZStack {
                LinearGradient(
                    colors: [
                        Color.daycounterSkyTop,
                        Color.daycounterSkyBottom
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )

                Image("WidgetRays")
                    .resizable()
                    .widgetFullColorImage()
                    .scaledToFill()
                    .frame(width: size.width, height: size.height)
                    .clipped()
            }
            .frame(width: size.width, height: size.height)
        }
    }
}

struct DaycounterSunriseForeground: View {
    var body: some View {
        GeometryReader { proxy in
            let size = proxy.size
            let sunSize = min(size.width * 0.215, size.height * 0.46)

            ZStack {
                Circle()
                    .fill(Color.daycounterSun)
                    .frame(width: sunSize, height: sunSize)
                    .position(x: size.width * 0.5, y: size.height * 0.93)

                WidgetSceneryImage(
                    name: "lake",
                    designSize: CGSize(width: 257, height: 21),
                    designCenter: CGPoint(x: 301.5, y: 271.5)
                )

                WidgetSceneryImage(
                    name: "hill1",
                    designSize: CGSize(width: 208.5, height: 92.5),
                    designCenter: CGPoint(x: 103, y: 236)
                )

                WidgetSceneryImage(
                    name: "hill2",
                    designSize: CGSize(width: 289, height: 59),
                    designCenter: CGPoint(x: 155, y: 252.5)
                )

                WidgetSceneryImage(
                    name: "hill3",
                    designSize: CGSize(width: 300.5, height: 58),
                    designCenter: CGPoint(x: 455, y: 253)
                )

                WidgetSceneryImage(
                    name: "hill4",
                    designSize: CGSize(width: 166.5, height: 112),
                    designCenter: CGPoint(x: 520, y: 226)
                )
            }
            .allowsHitTesting(false)
        }
    }
}

private extension Color {
    static let daycounterSkyTop = Color(red: 0.75, green: 0.27, blue: 0.02)
    static let daycounterSkyBottom = Color(red: 0.96, green: 0.78, blue: 0.05)
    static let daycounterSun = Color(red: 0.95, green: 0.94, blue: 0.53)
    static let daycounterLockDivider = Color(red: 0.4, green: 0.4, blue: 0.4)
    static let daycounterLockCard = Color(red: 0.6, green: 0.6, blue: 0.6)
}

struct WidgetSceneryImage: View {
    private static let designCanvasSize = CGSize(width: 603, height: 282)

    let name: String
    let designSize: CGSize
    let designCenter: CGPoint
    let rotation: Angle

    init(
        name: String,
        designSize: CGSize,
        designCenter: CGPoint,
        rotation: Angle = .zero
    ) {
        self.name = name
        self.designSize = designSize
        self.designCenter = designCenter
        self.rotation = rotation
    }

    var body: some View {
        GeometryReader { proxy in
            let scaleX = proxy.size.width / Self.designCanvasSize.width
            let scaleY = proxy.size.height / Self.designCanvasSize.height

            if let image = WidgetImageStore.image(named: name) {
                Image(uiImage: image)
                    .resizable()
                    .widgetFullColorImage()
                    .scaledToFit()
                    .frame(
                        width: designSize.width * scaleX,
                        height: designSize.height * scaleY
                    )
                    .rotationEffect(rotation)
                    .position(
                        x: designCenter.x * scaleX,
                        y: designCenter.y * scaleY
                    )
            }
        }
        .allowsHitTesting(false)
    }
}

private enum WidgetImageStore {
    private static let maximumWidgetImageArea: CGFloat = 2_000_000

    static func image(named name: String) -> UIImage? {
        let resourceName = rawResourceName(for: name)

        if let path = Bundle.main.path(forResource: resourceName, ofType: "png") {
            return UIImage(contentsOfFile: path).map(resizedForWidgetArchiving)
        }

        return UIImage(named: name).map(resizedForWidgetArchiving)
    }

    private static func rawResourceName(for name: String) -> String {
        switch name {
        case "lake":
            return "lake@2x"
        default:
            return "\(name)@2x"
        }
    }

    private static func resizedForWidgetArchiving(_ image: UIImage) -> UIImage {
        let pixelSize = CGSize(
            width: image.size.width * image.scale,
            height: image.size.height * image.scale
        )
        let area = pixelSize.width * pixelSize.height

        guard area > maximumWidgetImageArea else {
            return image
        }

        let scaleFactor = sqrt(maximumWidgetImageArea / area)
        let targetPixelSize = CGSize(
            width: floor(pixelSize.width * scaleFactor),
            height: floor(pixelSize.height * scaleFactor)
        )
        let targetPointSize = CGSize(
            width: targetPixelSize.width / image.scale,
            height: targetPixelSize.height / image.scale
        )
        let format = UIGraphicsImageRendererFormat()
        format.scale = image.scale
        format.opaque = false

        return UIGraphicsImageRenderer(size: targetPointSize, format: format).image { _ in
            image.draw(in: CGRect(origin: .zero, size: targetPointSize))
        }
    }
}

private extension Image {
    @ViewBuilder
    func widgetFullColorImage() -> some View {
        if #available(iOS 18.0, *) {
            self.widgetAccentedRenderingMode(.fullColor)
        } else {
            self
        }
    }
}

struct DaycounterWidget: Widget {
    let kind: String = "DaycounterWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            DaycounterWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Daycounter")
        .description("Shows your current day count.")
        .supportedFamilies([.systemMedium, .accessoryRectangular])
        .contentMarginsDisabled()
        .containerBackgroundRemovable(false)
    }
}

#Preview(as: .systemMedium) {
    DaycounterWidget()
} timeline: {
    DaycounterEntry(date: .now, days: 123)
}

#Preview(as: .accessoryRectangular) {
    DaycounterWidget()
} timeline: {
    DaycounterEntry(date: .now, days: 123)
}
