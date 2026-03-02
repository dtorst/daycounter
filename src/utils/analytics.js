// src/utils/analytics.js
import { getApp } from 'firebase/app';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';

let analytics = null;
const analyticsEnabled = process.env.VUE_APP_ENABLE_ANALYTICS !== 'false'
  && process.env.VUE_APP_BUILD_TARGET !== 'extension';

if (analyticsEnabled) {
  // Initialize Analytics if supported and Firebase app exists
  isSupported()
    .then((yes) => {
      if (!yes) return;
      try {
        analytics = getAnalytics(getApp());
      } catch (e) {
        // ignore init errors
      }
    })
    .catch(() => {});
}

export function track(eventName, params = {}) {
  try {
    if (analyticsEnabled && analytics) {
      logEvent(analytics, eventName, params);
    }
  } catch (e) {
    // ignore track errors
  }
}