<template>  
  <VApp>
    <DrawerComponent v-model="drawer" @navigate="handleNavigation" />
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
            @dayCount="updateDays"
          />
        </div>
        <div class="overlay-layer">
          <PageHeader :buttonDisplay="daysSince" @buttonClicked="daysSince = null" @openDrawer="openDrawer" />
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
import DrawerComponent from './components/Drawer'
import InteractableLayer from './components/InteractableLayer'


export default {
  components: {
    PageScenery,
    FireworksDisplay,
    DrawerComponent,
    PageHeader,
    InteractableLayer
  },

  data() {
    return {
      daysSince: null,
      todaysDay: false,
      currentComponent: null,
      reason: null,
      today: new Date().toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"long", day:"numeric"}),
      drawer: false
    }
  },
  mounted() {
    const applied = this.applyDayCountFromUrl();
    if (!applied) {
      this.restoreDayCount();
    }
    this.updateTodaysDayFromSelections();
  },
  methods: {
   applyDayCountFromUrl() {
     try {
      const { parseQueryParams, computeDaysSince, persistSelections, persistDayCount } = require('./utils/params.js');
      const parsed = parseQueryParams(window.location.search, { strict: true });
      if (!parsed || !parsed.isComplete) return false;

      const days = (typeof parsed.days === 'number')
        ? parsed.days
        : computeDaysSince(parsed.year, parsed.month, parsed.day);
       const computedReason = parsed.reason === 'other'
         ? ((parsed.otherReason && parsed.otherReason.trim().length > 0) ? parsed.otherReason.trim() : 'other')
         : parsed.reason;

       persistSelections({
         reason: parsed.reason,
         otherReason: parsed.otherReason,
         month: parsed.month,
         day: parsed.day,
         year: parsed.year,
       });

      persistDayCount({ days, why: computedReason });

       this.daysSince = days;
       this.reason = computedReason;
       this.currentComponent = 'PickerGroup';
       return true;
     } catch (e) {
       return false;
     }
   },
   updateDays({days,why}) {
     this.daysSince = days;
     this.reason = why;
     this.currentComponent = 'PickerGroup';
     this.updateTodaysDayFromSelections();
   },
   isDateToday() {
    if (this.today) {
      return true;
    }
    return false;
   },
   openDrawer() {
    this.drawer = true;
   },
   updateTodaysDayFromSelections() {
     try {
       const now = new Date();
       const todayMonth = now.getMonth() + 1; // 1-12
       const todayDay = now.getDate(); // 1-31

       const raw = localStorage.getItem('daycounterSelections');
       if (!raw) {
         this.todaysDay = false;
         return;
       }

       const data = JSON.parse(raw);
       const selectedMonth = Number(
         data && (data.selectedMonth !== undefined ? data.selectedMonth : data.month)
       );
       const selectedDay = Number(
         data && (data.selectedDay !== undefined ? data.selectedDay : data.day)
       );

       this.todaysDay = (
         Number.isFinite(selectedMonth) &&
         Number.isFinite(selectedDay) &&
         selectedMonth === todayMonth &&
         selectedDay === todayDay
       );
     } catch (e) {
       this.todaysDay = false;
     }
   },
   restoreDayCount() {
     try {
       const raw = localStorage.getItem('daycounterDayCount');
       if (!raw) return;
       const data = JSON.parse(raw);
       if (data && typeof data === 'object' && typeof data.days === 'number' && typeof data.why === 'string') {
         this.daysSince = data.days;
         this.reason = data.why;
       }
     } catch (e) {
       // ignore corrupt payloads
     }
   },
   handleNavigation(route) {
    this.drawer = false;
    this.$router.push(route);
   }
 }

}

</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@100..900&display=swap');

@font-face {
  font-family: 'Sugar Peachy';
  src: url('assets/sugar-peachy.otf') format('opentype');
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

@property --myColor1 {
  syntax: '<color>';
  initial-value: #BE4405;
  inherits: false;
}

@property --myColor2 {
  syntax: '<color>';
  initial-value: #F6C60C;
  inherits: false;
}

#app-shell {
  position: fixed;
  inset: 0;
  overflow: hidden;
  clear: both;
  height: 100dvh;
  width: 100vw;
  --myColor1: var(--theme-sky-top-day);
  --myColor2: var(--theme-sky-bottom-day);
  background: linear-gradient(var(--myColor1), var(--myColor2));
  transition: --myColor1 3s, --myColor2 3s;
}

#app-shell.night {
  --myColor1: var(--theme-sky-top-night);
  --myColor2: var(--theme-sky-bottom-night);
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
  line-height:30px !important;
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