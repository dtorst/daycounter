// Shared utilities for query params, date formatting, and URL building
import {
  coerceNumber,
  computeDaysSince,
  resolveReason
} from '../shared/dayCount'
import {
  persistDayCount,
  persistSelections,
  readDayCount,
  readSelections,
  resolveDayCountFromStorage
} from '../storage/browserStorage'

export { computeDaysSince, resolveReason }
export {
  persistDayCount,
  persistSelections,
  readDayCount,
  readSelections,
  resolveDayCountFromStorage as resolveDayCountFromSelections
}

export function formatLongDate(date = new Date()) {
  return date.toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function parseQueryParams(search, { strict = false } = {}) {
  try {
    const params = new URLSearchParams(search || '');
    if (!params || Array.from(params.keys()).length === 0) {
      return { anySet: false, isComplete: false };
    }

    const reasonParam = params.get('reason');
    const otherReasonParam = params.get('otherReason') || params.get('other');
    const sm = params.get('selectedMonth') || params.get('selectedmonth') || params.get('month');
    const sd = params.get('selectedDay') || params.get('selectedday') || params.get('day');
    const sy = params.get('selectedYear') || params.get('selectedyear') || params.get('year');
    const ds = params.get('days') || params.get('daySince') || params.get('daysSince');

    const monthNum = sm != null && sm !== '' ? coerceNumber(sm) : null;
    const dayNum = sd != null && sd !== '' ? coerceNumber(sd) : null;
    const yearNum = sy != null && sy !== '' ? coerceNumber(sy) : null;
    const daysNum = ds != null && ds !== '' ? coerceNumber(ds) : null;

    const normalizedReason = (reasonParam || '').trim() === 'other...' ? 'other' : (reasonParam || '').trim();

    const anySet = Boolean(
      normalizedReason || otherReasonParam || monthNum != null || dayNum != null || yearNum != null || daysNum != null
    );

    const monthValid = monthNum != null && monthNum >= 1 && monthNum <= 12;
    const dayValid = dayNum != null && dayNum >= 1 && dayNum <= 31;
    const yearValid = yearNum != null && yearNum >= 1900 && yearNum <= 3000;
    const daysValid = daysNum != null && Number.isFinite(daysNum) && daysNum >= 0;

    const isComplete = Boolean(
      normalizedReason && (
        (monthValid && dayValid && yearValid) ||
        daysValid
      )
    );

    if (strict && !isComplete) {
      return { anySet, isComplete: false };
    }

    return {
      anySet,
      isComplete,
      reason: normalizedReason || undefined,
      otherReason: normalizedReason === 'other' && typeof otherReasonParam === 'string' ? otherReasonParam.trim() : undefined,
      month: monthNum != null ? monthNum : undefined,
      day: dayNum != null ? dayNum : undefined,
      year: yearNum != null ? yearNum : undefined,
      days: daysValid ? daysNum : undefined,
    };
  } catch (e) {
    return { anySet: false, isComplete: false };
  }
}

export function buildShareUrlFromSelections(selections) {
  try {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    const reason = selections && typeof selections.reason === 'string'
      ? (selections.reason === 'other...' ? 'other' : selections.reason)
      : '';
    const otherReason = selections && typeof selections.otherReason === 'string' ? selections.otherReason : '';
    const selectedMonth = selections && (selections.selectedMonth ?? selections.month ?? '');
    const selectedDay = selections && (selections.selectedDay ?? selections.day ?? '');
    const selectedYear = selections && (selections.selectedYear ?? selections.year ?? '');
    const providedDays = selections && typeof selections.days === 'number' ? selections.days : null;

    if (reason) params.set('reason', reason);
    if (reason === 'other' && otherReason) params.set('otherReason', otherReason);
    if (selectedMonth !== '') params.set('selectedMonth', String(selectedMonth));
    if (selectedDay !== '') params.set('selectedDay', String(selectedDay));
    if (selectedYear !== '') params.set('selectedYear', String(selectedYear));

    // Prefer provided days if present, otherwise compute days from selected Y-M-D
    let daysToInclude = null;
    if (Number.isFinite(providedDays) && providedDays >= 0) {
      daysToInclude = providedDays;
    } else if (selectedYear !== '' && selectedMonth !== '' && selectedDay !== '') {
      try {
        const y = coerceNumber(selectedYear);
        const m = coerceNumber(selectedMonth);
        const d = coerceNumber(selectedDay);
        if (y != null && m != null && d != null) {
          daysToInclude = computeDaysSince(y, m, d);
        }
      } catch (e) {
        // ignore compute errors
      }
    }
    if (Number.isFinite(daysToInclude) && daysToInclude >= 0) {
      params.set('days', String(daysToInclude));
    }

    const query = params.toString();
    return query ? `${base}?${query}` : base;
  } catch (e) {
    return window.location.href;
  }
}

export function buildShareUrlFromLocalStorage() {
  const selections = readSelections() || {};
  const cachedDayCount = readDayCount();
  const days = cachedDayCount && typeof cachedDayCount.days === 'number'
    ? cachedDayCount.days
    : null;
  const merged = Number.isFinite(days) && days >= 0 ? { ...selections, days } : selections;
  return buildShareUrlFromSelections(merged);
}


