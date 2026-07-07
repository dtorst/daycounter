//
//  DaycounterWidget.swift
//  DaycounterWidget
//

import WidgetKit
import SwiftUI

private enum DaycounterWidgetStorage {
    static let suiteName = "group.com.davidtorstenson.daycounter"
    static let daysKey = "daycounter.days"

    static func readDays() -> Int {
        let defaults = UserDefaults(suiteName: suiteName)
        return defaults?.integer(forKey: daysKey) ?? 0
    }
}

struct DaycounterEntry: TimelineEntry {
    let date: Date
    let days: Int
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> DaycounterEntry {
        DaycounterEntry(date: Date(), days: 123)
    }

    func getSnapshot(in context: Context, completion: @escaping (DaycounterEntry) -> Void) {
        completion(DaycounterEntry(date: Date(), days: DaycounterWidgetStorage.readDays()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DaycounterEntry>) -> Void) {
        let entry = DaycounterEntry(date: Date(), days: DaycounterWidgetStorage.readDays())
        completion(Timeline(entries: [entry], policy: .never))
    }
}

struct DaycounterWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family

    var entry: DaycounterEntry

    var body: some View {
        content
            .containerBackground(for: .widget) {
                DaycounterSunriseBackground()
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
            let height = proxy.size.height

            ZStack {
                DaycounterSunriseForeground()

                VStack(spacing: 8) {
                    Spacer(minLength: 0)

                    FlipDayCountView(days: days)
                        .frame(maxWidth: proxy.size.width * 0.84)

                    Text("days")
                        .font(.system(size: max(16, height * 0.15), weight: .black, design: .rounded))
                        .foregroundStyle(Color.daycounterCream)
                        .shadow(color: .black.opacity(0.18), radius: 2, x: 0, y: 2)
                        .offset(y: -2)
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 14)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}

struct AccessoryDayCountView: View {
    let days: Int

    var body: some View {
        HStack(spacing: 8) {
            Text("\(days)")
                .font(.system(size: 28, weight: .black, design: .rounded))
                .monospacedDigit()

            Text("days")
                .font(.system(size: 15, weight: .semibold, design: .rounded))
                .textCase(.uppercase)
                .opacity(0.86)
        }
        .foregroundStyle(.white)
        .lineLimit(1)
        .minimumScaleFactor(0.58)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
        .padding(.horizontal, 8)
    }
}

struct FlipDayCountView: View {
    let days: Int

    private var digits: [String] {
        String(max(0, days)).map { String($0) }
    }

    var body: some View {
        HStack(spacing: 5) {
            ForEach(Array(digits.enumerated()), id: \.offset) { _, digit in
                FlipDigitCard(digit: digit)
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
                    .fill(
                        LinearGradient(
                            colors: [
                                Color(red: 0.15, green: 0.15, blue: 0.15),
                                Color(red: 0.06, green: 0.06, blue: 0.06)
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )

                Rectangle()
                    .fill(Color.black.opacity(0.34))
                    .frame(height: 1)

                Text(digit)
                    .font(.system(size: min(width * 1.55, height * 0.76), weight: .heavy, design: .rounded))
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
            let raySize = max(size.width, size.height) * 1.9

            ZStack {
                LinearGradient(
                    colors: [
                        Color.daycounterSkyTop,
                        Color.daycounterSkyBottom
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )

                SunRaysShape(rayCount: 28)
                    .fill(Color.daycounterSun.opacity(0.34))
                    .frame(width: raySize, height: raySize)
                    .rotationEffect(.degrees(-8))
                    .position(x: size.width * 0.5, y: size.height * 0.8)
                    .blendMode(.screen)
            }
        }
    }
}

struct DaycounterSunriseForeground: View {
    var body: some View {
        GeometryReader { proxy in
            let size = proxy.size
            let sunSize = min(size.width * 0.34, size.height * 0.64)
            let baseY = size.height * 0.94

            ZStack {
                Circle()
                    .fill(Color.daycounterSun)
                    .frame(width: sunSize, height: sunSize)
                    .position(x: size.width * 0.5, y: baseY - sunSize * 0.36)

                Ellipse()
                    .fill(Color(red: 0.05, green: 0.34, blue: 0.05))
                    .frame(width: size.width * 1.08, height: size.height * 0.92)
                    .position(x: size.width * 0.16, y: size.height * 1.2)

                Ellipse()
                    .fill(Color(red: 0.22, green: 0.51, blue: 0.22))
                    .frame(width: size.width * 1.1, height: size.height * 0.76)
                    .position(x: size.width * 0.78, y: size.height * 1.14)

                LinearGradient(
                    colors: [
                        Color(red: 0.96, green: 0.76, blue: 0.06),
                        Color(red: 0.32, green: 0.56, blue: 0.67)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: size.height * 0.2)
                .frame(maxHeight: .infinity, alignment: .bottom)
            }
            .allowsHitTesting(false)
        }
    }
}

struct SunRaysShape: Shape {
    let rayCount: Int

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let innerRadius = min(rect.width, rect.height) * 0.12
        let outerRadius = min(rect.width, rect.height) * 0.5
        let step = (CGFloat.pi * 2) / CGFloat(rayCount)

        for index in 0..<rayCount {
            let baseAngle = CGFloat(index) * step
            let startAngle = baseAngle - step * 0.26
            let endAngle = baseAngle + step * 0.26

            path.move(to: point(from: center, radius: innerRadius, angle: baseAngle))
            path.addLine(to: point(from: center, radius: outerRadius, angle: startAngle))
            path.addLine(to: point(from: center, radius: outerRadius, angle: endAngle))
            path.closeSubpath()
        }

        return path
    }

    private func point(from center: CGPoint, radius: CGFloat, angle: CGFloat) -> CGPoint {
        CGPoint(
            x: center.x + cos(angle) * radius,
            y: center.y + sin(angle) * radius
        )
    }
}

private extension Color {
    static let daycounterSkyTop = Color(red: 0.75, green: 0.27, blue: 0.02)
    static let daycounterSkyBottom = Color(red: 0.96, green: 0.78, blue: 0.05)
    static let daycounterSun = Color(red: 0.95, green: 0.94, blue: 0.53)
    static let daycounterCream = Color(red: 0.91, green: 0.91, blue: 0.91)
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
