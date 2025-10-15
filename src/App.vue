<template>  
  <VApp>
    <DrawerComponent v-model="drawer" @navigate="handleNavigation" />
    <VMain>
      <div id="container" :class="{ night: !daysSince }">
        <FireworksDisplay v-if="todaysDay" />
        <PageHeader :buttonDisplay="daysSince" @buttonClicked="daysSince = null" @openDrawer="openDrawer" />
        <div class="interactable">
          <div class="readout" :class="mobile ? '' : 'mt-6'" v-if="daysSince">
            <h3 v-if="!mobile" style="margin-bottom:0px;">It's {{today}} </h3>
            <h3 v-else style="line-height:1.5;margin-bottom:16px;">It's {{today}} </h3>
            <h1 v-if="!mobile" style="margin-top:0px;">you&#8217;ve been {{reason}} for </h1>
            <h1 v-else style="margin-top:0px;margin-bottom:16px;">you&#8217;ve been {{reason}} for </h1>
            <flip-clock :options="flipOptions" />
            <h1 v-if="!mobile">days</h1>
            <h1 v-else style="margin-top:16px;">days</h1>
          </div>
          <KeepAlive>
            <PickerGroup :is="currentComponent" v-if="!daysSince" @dayCount="updateDays" />
          </KeepAlive>
        </div>
        <PageScenery :rayDisplay="daysSince" />
      </div>
    </VMain>
  </VApp>
</template>
<script>
import { FlipClock } from '@mvpleung/flipclock';
import PageScenery from './components/Scenery'
import FireworksDisplay from './components/Fireworks'
import PageHeader from './components/PageHeader'
import PickerGroup from './components/PickerGroup'  
import DrawerComponent from './components/Drawer'


export default {
  components: {
    FlipClock,
    PageScenery,
    FireworksDisplay,
    DrawerComponent,
    PageHeader,
    PickerGroup
  },
  computed: {
    flipOptions() {
      return {
        clockFace: 'Counter',
        autoStart: false,
        digit: this.daysSince
      }
    },
    mobile() {
      return this.$vuetify.display.mobile;
    }
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
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
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

#container {
  position: relative;
  z-index:10;
  overflow: hidden;
  top:0px;
  clear:both;
  height: 100vh; 
  height: 100svh;  /* small viewport height (iOS) */
  height: 100dvh;
  width: 100vw;
  background: linear-gradient(var(--myColor1), var(--myColor2));
  transition: --myColor1 3s, --myColor2 3s;
}


#container.night {
  --myColor1: #111936;
  --myColor2: #285A7B;
}

.interactable {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.readout {
  text-align: center;
  align-content: center;
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

@media (max-width: 599px) and (orientation: portrait) {
  
  .readout {
    margin-top: 100px !important;
  }
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