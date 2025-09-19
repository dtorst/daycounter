'use strict';

(function () {
  const STORAGE_KEY = 'daycounterSelections';

  const reasonField = document.getElementById('reason');
  const monthField = document.getElementById('selectedMonth');
  const dayField = document.getElementById('selectedDay');
  const yearField = document.getElementById('selectedYear');

  if (!reasonField && !monthField && !dayField && !yearField) {
    return;
  }

  const fields = [
    { element: reasonField, key: 'reason' },
    { element: monthField, key: 'selectedMonth' },
    { element: dayField, key: 'selectedDay' },
    { element: yearField, key: 'selectedYear' },
  ];

  const storage = createStorageAdapter();

  restoreSelections();
  fields.forEach(({ element }) => {
    if (!element) {
      return;
    }
    element.addEventListener('change', saveSelections, { passive: true });
  });

  function restoreSelections() {
    const saved = storage.get(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const data = JSON.parse(saved);
      fields.forEach(({ element, key }) => {
        if (!element || !(key in data)) {
          return;
        }

        const value = data[key];
        if (typeof value !== 'string') {
          return;
        }

        const hasOption = Array.from(element.options).some(
          (option) => option.value === value
        );

        if (hasOption) {
          element.value = value;
        }
      });
    } catch (error) {
      // Corrupted storage entry. Remove it and exit quietly.
      storage.remove(STORAGE_KEY);
      console.warn('Unable to restore saved selections:', error);
    }
  }

  function saveSelections() {
    const data = fields.reduce((accumulator, { element, key }) => {
      if (!element) {
        return accumulator;
      }

      return {
        ...accumulator,
        [key]: element.value ?? '',
      };
    }, {});

    storage.set(STORAGE_KEY, JSON.stringify(data));
  }

  function createStorageAdapter() {
    try {
      const testKey = '__daycounter_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return {
        get: (key) => window.localStorage.getItem(key),
        set: (key, value) => window.localStorage.setItem(key, value),
        remove: (key) => window.localStorage.removeItem(key),
      };
    } catch (error) {
      return createCookieAdapter();
    }
  }

  function createCookieAdapter() {
    return {
      get(key) {
        const match = document.cookie.match(
          new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)')
        );
        return match ? decodeURIComponent(match[1]) : null;
      },
      set(key, value) {
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = [
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
          `expires=${expires.toUTCString()}`,
          'path=/',
        ].join('; ');
      },
      remove(key) {
        document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      },
    };
  }
})();
