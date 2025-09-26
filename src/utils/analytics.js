// src/utils/analytics.js
import { getApp } from 'firebase/app';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';

let analytics = null;

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

export function track(eventName, params = {}) {
  try {
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  } catch (e) {
    // ignore track errors
  }
}