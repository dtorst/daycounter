<template>  
  <VApp>
    <DrawerComponent v-if="!isExtensionBuild" v-model="drawer" />
    <VMain>
      <div id="app-shell" :class="{ night: !daysSince }">
        <div class="scenery-layer">
          <PageScenery :rayDisplay="daysSince" />
        </div>
        <div class="content-layer">
          <InteractableLayer
            :daysSince="daysSince"
            :reason="reason"
            :today="today"
            :currentComponent="currentComponent"
            :showPicker="isPickerVisible"
            :pickerDayCount="pickerDayCount"
            :pickerKey="pickerKey"
            :useStoredPickerSelections="useStoredPickerSelections"
            :showCancelRemove="showCancelRemove"
            :canNavigatePrevious="canNavigatePrevious"
            :canNavigateNext="canNavigateNext"
            @dayCount="saveDayCount"
            @cancelDayCount="handlePickerCancel"
            @navigateDayCount="navigateDayCount"
          />
        </div>
        <div class="overlay-layer">
          <PageHeader
            :buttonDisplay="buttonDisplay"
            :showInfoMenu="!isExtensionBuild"
            :showAddButton="buttonDisplay"
            :dayCountCount="dayCounts.length"
            :currentDayCountIndex="currentDayCountIndex"
            :showDayCountDots="dayCounts.length > 1 && !isPickerVisible"
            @buttonClicked="startEditDayCount"
            @addDayCounter="startAddDayCount"
            @selectDayCount="selectDayCount"
            @openDrawer="openDrawer"
          />
        </div>
        <div class="fx-layer" v-if="todaysDay">
          <FireworksDisplay />
        </div>
      </div>
    </VMain>
  </VApp>
</template>
<script>
import PageScenery from './components/Scenery'
import FireworksDisplay from './components/Fireworks'
import PageHeader from './components/PageHeader'
import DrawerComponent from '@/components/Drawer'
import InteractableLayer from './components/InteractableLayer'
import {
  formatLongDate,
  parseQueryParams
} from './utils/params.js'
import {
  computeDaysSince,
  createDayCountEntry,
  isAnniversaryToday,
  resolveDayCountEntry,
  resolveReason
} from './shared/dayCount'
import {
  persistDayCount,
  persistDayCounterState,
  readDayCount,
  readDayCounterState
} from './storage/browserStorage'
import { syncWidgetDayCount as syncNativeWidgetDayCount } from './native/dayCounterWidgetBridge'

const RESUME_SYNC_DELAY_MS = 120
const IS_EXTENSION_BUILD = process.env.VUE_APP_BUILD_TARGET === 'extension'

export default {
  components: {
    PageScenery,
    FireworksDisplay,
    DrawerComponent,
    PageHeader,
    InteractableLayer
  },
  beforeUnmount() {
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    window.removeEventListener('focus', this.onWindowFocus)
    window.removeEventListener('pageshow', this.onPageShow)
    if (this.resumeSyncTimer) {
      clearTimeout(this.resumeSyncTimer)
      this.resumeSyncTimer = null
    }
  },
  data() {
    return {
      dayCounts: [],
      currentDayCountIndex: 0,
      legacyDayCount: null,
      mode: 'create',
      todaysDay: false,
      currentComponent: 'PickerGroup',
      today: formatLongDate(),
      drawer: false,
      isExtensionBuild: IS_EXTENSION_BUILD,
      resumeSyncTimer: null
    }
  },
  computed: {
    currentDayCount() {
      return this.dayCounts[this.currentDayCountIndex] || this.dayCounts[0] || null
    },
    resolvedCurrentDayCount() {
      return resolveDayCountEntry(this.currentDayCount) || this.legacyDayCount
    },
    daysSince() {
      return this.isPickerVisible || !this.resolvedCurrentDayCount
        ? null
        : this.resolvedCurrentDayCount.days
    },
    reason() {
      return this.resolvedCurrentDayCount ? this.resolvedCurrentDayCount.why : null
    },
    hasDayCount() {
      return Boolean(this.resolvedCurrentDayCount)
    },
    isPickerVisible() {
      return this.mode !== 'view'
    },
    buttonDisplay() {
      return this.hasDayCount && !this.isPickerVisible
    },
    pickerDayCount() {
      return this.mode === 'edit' ? this.currentDayCount : null
    },
    pickerKey() {
      const currentId = this.currentDayCount && this.currentDayCount.id
        ? this.currentDayCount.id
        : 'new'
      return `${this.mode}-${currentId}-${this.dayCounts.length}`
    },
    useStoredPickerSelections() {
      return this.mode === 'create'
    },
    showCancelRemove() {
      return this.mode === 'add' || this.dayCounts.length > 1
    },
    canNavigatePrevious() {
      return !this.isPickerVisible && this.currentDayCountIndex > 0
    },
    canNavigateNext() {
      return !this.isPickerVisible && this.currentDayCountIndex < this.dayCounts.length - 1
    }
  },
  mounted() {
    const applied = this.applyDayCountFromUrl()
    if (!applied) {
      this.refreshDayCountFromStorage()
    }
    if (!this.hasDayCount) {
      this.mode = 'create'
    }
    this.refreshTodayLabel()
    this.updateTodaysDayFromSelections()
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    window.addEventListener('focus', this.onWindowFocus)
    window.addEventListener('pageshow', this.onPageShow)
  },
  methods: {
    applyDayCountFromUrl() {
      try {
        const parsed = parseQueryParams(window.location.search, { strict: true })
        if (!parsed || !parsed.isComplete) return false

        const hasSelectedDate = (
          typeof parsed.year === 'number' &&
          typeof parsed.month === 'number' &&
          typeof parsed.day === 'number'
        )
        const days = hasSelectedDate
          ? computeDaysSince(parsed.year, parsed.month, parsed.day)
          : parsed.days
        const computedReason = resolveReason(parsed.reason, parsed.otherReason)
        if (!Number.isFinite(days) || days < 0 || !computedReason) return false

        if (!hasSelectedDate) {
          persistDayCount({ days, why: computedReason })
          this.dayCounts = []
          this.currentDayCountIndex = 0
          this.legacyDayCount = { days, why: computedReason }
          this.mode = 'view'
          this.syncNativeWidgetDayCount(days)
          return true
        }

        const nextDayCount = createDayCountEntry({
          reason: parsed.reason,
          otherReason: parsed.otherReason,
          selectedDate: {
            year: parsed.year,
            month: parsed.month,
            day: parsed.day
          }
        })
        if (!nextDayCount) return false

        const state = persistDayCounterState({
          dayCounts: [nextDayCount],
          currentIndex: 0
        })
        if (!this.hydrateDayCounterState(state)) return false
        persistDayCount({ days, why: computedReason })
        this.syncNativeWidgetDayCount(days)
        return true
      } catch (e) {
        return false
      }
    },
    hydrateDayCounterState(state) {
      if (!state || !Array.isArray(state.dayCounts) || state.dayCounts.length === 0) {
        return false
      }

      this.dayCounts = state.dayCounts
      this.currentDayCountIndex = state.currentIndex || 0
      this.legacyDayCount = null
      this.currentComponent = 'PickerGroup'
      this.mode = resolveDayCountEntry(this.currentDayCount) ? 'view' : 'create'
      return true
    },
    persistActiveDayCounterState() {
      if (this.dayCounts.length === 0) return null

      const state = persistDayCounterState({
        dayCounts: this.dayCounts,
        currentIndex: this.currentDayCountIndex
      })
      if (!state) return null

      this.hydrateDayCounterState(state)
      const resolved = this.resolvedCurrentDayCount
      if (resolved) {
        persistDayCount({ days: resolved.days, why: resolved.why })
        this.syncNativeWidgetDayCount(resolved.days)
      }
      this.updateTodaysDayFromSelections()
      return state
    },
    saveDayCount(payload) {
      const existingDayCount = this.mode === 'edit' ? this.currentDayCount : null
      const nextDayCount = createDayCountEntry({
        ...existingDayCount,
        reason: payload.reason,
        otherReason: payload.otherReason,
        selectedDate: payload.selectedDate
      })
      const resolved = resolveDayCountEntry(nextDayCount)
      if (!nextDayCount || !resolved) return

      let nextDayCounts = this.dayCounts.slice()
      let nextIndex = this.currentDayCountIndex

      if (this.mode === 'add') {
        nextDayCounts.push(nextDayCount)
        nextIndex = nextDayCounts.length - 1
      } else if (this.mode === 'edit' && this.currentDayCount) {
        nextDayCounts[nextIndex] = nextDayCount
      } else {
        nextDayCounts = [nextDayCount]
        nextIndex = 0
      }

      const state = persistDayCounterState({
        dayCounts: nextDayCounts,
        currentIndex: nextIndex
      })
      if (!this.hydrateDayCounterState(state)) return

      this.mode = 'view'
      persistDayCount({ days: resolved.days, why: resolved.why })
      this.updateTodaysDayFromSelections()
      this.syncNativeWidgetDayCount(resolved.days)
    },
    startEditDayCount() {
      if (!this.hasDayCount) return

      this.mode = 'edit'
    },
    startAddDayCount() {
      if (!this.hasDayCount) return

      this.mode = 'add'
    },
    handlePickerCancel() {
      if (this.mode === 'add') {
        this.mode = 'view'
        return
      }

      if (this.dayCounts.length > 1) {
        this.removeCurrentDayCount()
        return
      }

      this.mode = this.hasDayCount ? 'view' : 'create'
    },
    removeCurrentDayCount() {
      if (this.dayCounts.length <= 1) return

      const removedIndex = this.currentDayCountIndex
      const nextDayCounts = this.dayCounts.filter((_, index) => index !== removedIndex)
      this.dayCounts = nextDayCounts
      this.currentDayCountIndex = Math.min(removedIndex, nextDayCounts.length - 1)
      this.mode = 'view'
      this.persistActiveDayCounterState()
    },
    selectDayCount(index) {
      const nextIndex = Number(index)
      if (
        this.isPickerVisible ||
        !Number.isInteger(nextIndex) ||
        nextIndex < 0 ||
        nextIndex >= this.dayCounts.length ||
        nextIndex === this.currentDayCountIndex
      ) {
        return
      }

      this.currentDayCountIndex = nextIndex
      this.persistActiveDayCounterState()
    },
    navigateDayCount(delta) {
      const direction = Number(delta)
      if (!Number.isInteger(direction) || direction === 0) return

      this.selectDayCount(this.currentDayCountIndex + direction)
    },
    openDrawer() {
      if (this.isExtensionBuild) return
      this.drawer = true
    },
    refreshTodayLabel() {
      this.today = formatLongDate()
    },
    refreshDayCountFromStorage() {
      const state = readDayCounterState()
      if (state && this.hydrateDayCounterState(state)) {
        const resolved = this.resolvedCurrentDayCount
        if (resolved) {
          persistDayCount({ days: resolved.days, why: resolved.why })
          this.syncNativeWidgetDayCount(resolved.days)
        }
        return
      }

      const cached = readDayCount()
      if (cached) {
        this.legacyDayCount = cached
        this.mode = 'view'
        this.syncNativeWidgetDayCount(cached.days)
      }
    },
    syncNativeWidgetDayCount(days) {
      syncNativeWidgetDayCount(days, readDayCounterState())
    },
    onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        this.scheduleHandleAppResumed()
      }
    },
    onWindowFocus() {
      this.scheduleHandleAppResumed()
    },
    onPageShow() {
      this.scheduleHandleAppResumed()
    },
    scheduleHandleAppResumed() {
      if (this.resumeSyncTimer) {
        clearTimeout(this.resumeSyncTimer)
      }
      this.resumeSyncTimer = setTimeout(() => {
        this.resumeSyncTimer = null
        this.handleAppResumed()
      }, RESUME_SYNC_DELAY_MS)
    },
    handleAppResumed() {
      this.refreshTodayLabel()
      if (!this.isPickerVisible) {
        this.refreshDayCountFromStorage()
      }
      this.updateTodaysDayFromSelections()
    },
    updateTodaysDayFromSelections() {
      try {
        this.todaysDay = isAnniversaryToday(readDayCounterState())
      } catch (e) {
        this.todaysDay = false
      }
    }
  }
}
</script>
<style>

@font-face {
  font-family: 'Bebas Neue';
  src: url('./assets/fonts/BebasNeue-Regular.ttf') format('truetype');
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Montserrat';
  src: url('./assets/fonts/Montserrat-VariableFont_wght.ttf') format('truetype-variations');
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}

@font-face {
  font-family: 'Sugar Peachy';
  src: url('./assets/fonts/sugar-peachy.otf') format('opentype');
  font-style: normal;
  font-display: block;
}

/* Override Vuetify's default styles for our custom app */
#app {
  --z-scenery: 10;
  --z-scenery-base: 10;
  --z-scenery-rays: 5;
  --z-scenery-scene: 10;
  --z-scenery-astro-1: 30;
  --z-scenery-astro-2: 20;
  --z-content: 30;
  --z-header: 60;
  --z-fx: 120;
  --z-drawer: 2000;
  --scenery-hill-1-day: #0e580e;
  --scenery-hill-2-day: #398239;
  --scenery-hill-3-day: #299029;
  --scenery-hill-4-day: #196419;
  --scenery-hill-1-night: #202020;
  --scenery-hill-2-night: #262525;
  --scenery-hill-3-night: #262525;
  --scenery-hill-4-night: #1e1d1d;
  --scenery-water-top-day: #f5c30e;
  --scenery-water-bottom-day: #518eac;
  --scenery-water-top-night: #7fa1bb;
  --scenery-water-bottom-night: #1d425a;
  --scenery-sun-color: #f2ef88;
  --scenery-sun-x: 50%;
  --scenery-sun-size: 16.5rem;
  --scenery-sun-bottom: 0px;
  --scenery-sun-size-mobile: 10rem;
  --scenery-sun-bottom-mobile: 6rem;
  --scenery-moon-color: #d9d8d0;
  --scenery-moon-shadow: #899098;
  --scenery-rays-top-desktop: 65dvh;
  --scenery-rays-top-mobile: 40svh;
  --scenery-scene-bottom-mobile: -80px;
  --theme-sky-top-day: #BE4405;
  --theme-sky-bottom-day: #F6C60C;
  --theme-sky-top-night: #111936;
  --theme-sky-bottom-night: #285A7B;
  margin: 0;
  padding: 0;
  font-size: 16px;
  height: 100%;
  overflow: hidden;
  width: 100vw;
  box-sizing: border-box;
}

/* Reset Vuetify's default styles that might interfere */
#app * {
  box-sizing: border-box;
}

/* Ensure our custom styles take precedence over Vuetify */
#app .v-application {
  font-family: inherit !important;
  background: transparent !important;
}


#app h1 {
  color: #E9E9E9 !important;
  text-align: center;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.15);
  font-family: 'Sugar Peachy' !important;
  font-size: 3.75rem !important;
  font-style: normal;
  font-weight: 900;
  line-height: 3.75rem;
  margin:8px;
}
#app h3 {
  color: rgba(255, 255, 255, 0.75) !important;
  text-align: center;
  font-family: 'Montserrat',sans-serif !important;
  font-size: 26px !important;
  font-style: normal;
  font-weight: 400;
  line-height: 49px; /* 188.462% */
  letter-spacing: 0.25px;
}

#app-shell {
  position: fixed;
  inset: 0;
  overflow: hidden;
  clear: both;
  height: 100dvh;
  width: 100vw;
  background: linear-gradient(var(--theme-sky-top-day), var(--theme-sky-bottom-day));
  isolation: isolate;
}

#app-shell::before,
#app-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: opacity 3s ease 0.9s;
  z-index: 0;
}

#app-shell::before {
  background: linear-gradient(var(--theme-sky-top-day), var(--theme-sky-bottom-day));
  opacity: 1;
}

#app-shell::after {
  background: linear-gradient(var(--theme-sky-top-night), var(--theme-sky-bottom-night));
  opacity: 0;
}

#app-shell.night::before {
  opacity: 0;
  transition-delay: 0s;
}

#app-shell.night::after {
  opacity: 1;
  transition-delay: 0s;
}

.scenery-layer,
.content-layer,
.overlay-layer,
.fx-layer {
  position: fixed;
  inset: 0;
}

.scenery-layer {
  z-index: var(--z-scenery);
  pointer-events: none;
}

.content-layer {
  z-index: var(--z-content);
  pointer-events: none;
}

.overlay-layer {
  z-index: var(--z-header);
  pointer-events: none;
}

.overlay-layer > * {
  pointer-events: auto;
}

.fx-layer {
  z-index: var(--z-fx);
  pointer-events: none;
}

#app .calculate-days, #app .update-button {
  height:36px !important;
  width:96px !important;
  border:2px solid #F2EF88 !important;
  color:#F2EF88 !important;
  background: rgba(242,239,136,0) !important;
  cursor: pointer;
  border-radius:20px !important;
  transition-duration: 2s;
  line-height:16px !important;
  font-family: inherit !important;
  font-size: inherit !important;
  text-transform: none !important;
  box-shadow: none !important;
}

#app .update-button {
  float:right;
}


/* Force FlipClock digit background to #333 in all environments */
.flip-clock-wrapper ul li a div div.inn {
  background: #333 !important;
}

.flip-clock-wrapper .flip {
  box-shadow: rgba(0, 0, 0, 0.5) 0px 2px 5px !important;
}

@media (max-width: 599px) and (orientation: portrait) {
  #app h1 {
    font-size: 2.25rem !important;
    line-height: 2rem;
  }
  #app h3 {
    font-size: 1.25rem !important;
    line-height: 1.25rem;
    margin-bottom: 0.75rem;
    margin-left: 12px;
    margin-right: 12px;
  }
}

</style>