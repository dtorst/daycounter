//
//  DaycounterWidgetBundle.swift
//  DaycounterWidget
//
//  Created by David Torstenson on 7/6/26.
//

import WidgetKit
import SwiftUI

@main
struct DaycounterWidgetBundle: WidgetBundle {
    var body: some Widget {
        DaycounterWidget()
        DaycounterWidgetLiveActivity()
    }
}
