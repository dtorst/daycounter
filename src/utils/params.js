// Shared utilities for query params, selections persistence, and URL building

function coerceNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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

export function computeDaysSince(year, month, day) {
  const selectedDate = new Date(`${year}-${month}-${day}`);
  const currentDate = new Date();
  const offset = ((currentDate.getTimezoneOffset()) - (selectedDate.getTimezoneOffset())) * 60000;
  return Math.floor((currentDate - selectedDate - offset) / 86400000);
}

export function persistSelections({ reason, otherReason, month, day, year }) {
  try {
    const payload = {
      reason: String(reason ?? ''),
      otherReason: String(otherReason ?? ''),
      selectedMonth: String(month ?? ''),
      selectedDay: String(day ?? ''),
      selectedYear: String(year ?? ''),
    };
    localStorage.setItem('daycounterSelections', JSON.stringify(payload));
  } catch (e) {
    // ignore storage errors
  }
}

export function persistDayCount({ days, why }) {
  try {
    localStorage.setItem('daycounterDayCount', JSON.stringify({ days, why }));
  } catch (e) {
    // ignore storage errors
  }
}

export function readSelections() {
  try {
    const raw = localStorage.getItem('daycounterSelections');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
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
  let days = null;
  try {
    const raw = localStorage.getItem('daycounterDayCount');
    if (raw) {
      const data = JSON.parse(raw);
      if (data && typeof data.days === 'number' && data.days >= 0) {
        days = data.days;
      }
    }
  } catch (e) {
    // ignore storage errors
  }
  const merged = Number.isFinite(days) && days >= 0 ? { ...selections, days } : selections;
  return buildShareUrlFromSelections(merged);
}


