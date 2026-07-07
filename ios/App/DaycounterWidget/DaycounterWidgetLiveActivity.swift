//
//  DaycounterWidgetLiveActivity.swift
//  DaycounterWidget
//
//  Created by David Torstenson on 7/6/26.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct DaycounterWidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct DaycounterWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DaycounterWidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension DaycounterWidgetAttributes {
    fileprivate static var preview: DaycounterWidgetAttributes {
        DaycounterWidgetAttributes(name: "World")
    }
}

extension DaycounterWidgetAttributes.ContentState {
    fileprivate static var smiley: DaycounterWidgetAttributes.ContentState {
        DaycounterWidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: DaycounterWidgetAttributes.ContentState {
         DaycounterWidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: DaycounterWidgetAttributes.preview) {
   DaycounterWidgetLiveActivity()
} contentStates: {
    DaycounterWidgetAttributes.ContentState.smiley
    DaycounterWidgetAttributes.ContentState.starEyes
}
