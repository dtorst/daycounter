<template>
	<div v-if="!mobile" class="picker-group">
		<div class="reason-column" :class="{ 'other-active': reason === 'other' }">
			<VueScrollPicker :options="reasons" v-model="reason" />
			<VTextField v-if="reason === 'other'" ref="otherInput" v-model="otherReason" class="other-reason-input" variant="plain" :hide-details="true" :clearable="false" density="comfortable" :autofocus="true" placeholder="other" />
		</div>
    <div class="since-column">
      <span class="since">since</span>
    </div>
    <div class="month-column">
      <VueScrollPicker :options="months" v-model="selectedMonth" class="month-column" />
    </div>
    <div class="day-column">
      <VueScrollPicker :options="days" v-model="selectedDay" class="day-column" />
    </div>
    <div class="year-column">
      <VueScrollPicker :options="years" v-model="selectedYear" class="year-column" />
    </div>
    <div class="btn-container">
      <button class="calculate-days-mobile" @click="calculateDays"><span class="material-symbols-outlined" style="line-height:30px;">sunny</span></button>
    </div>
  </div>
  <div v-else class="picker-group mobile">
    <v-carousel
      v-model="currentIndex"
      style="width:100vw;height:70vh;margin-top:10vh;"
      hide-delimiters
      :continuous="false"
    >
      <template v-slot:prev="{ props }">
        <v-btn
          color="primary"
          variant="outlined"
          icon="mdi-chevron-left"
          @click="props.onClick"
        />
      </template>
      <template v-slot:next="{ props }">
        <v-btn
          v-if="currentIndex < 3"
          color="primary"
          variant="outlined"
          icon="mdi-chevron-right"
          @click="props.onClick"
        />
        <VBtn v-else color="primary" @click="calculateDays" icon="mdi-white-balance-sunny" variant="outlined" />

      </template>
      <v-carousel-item>
        <div :class="{ 'other-active': reason === 'other' }">
          <VueScrollPicker :options="reasons" v-model="reason" class="mobile-picker" />
          <VTextField v-if="reason === 'other'" ref="otherInput" v-model="otherReason" class="other-reason-input" variant="plain" :hide-details="true" :clearable="false" density="comfortable" :autofocus="true" placeholder="other" />
        </div>
        <div class="text-center">
          <span class="since">since</span>
        </div>
      </v-carousel-item>
      <v-carousel-item>
        <div>
          <VueScrollPicker :options="months" v-model="selectedMonth" class="month-column mobile-picker" />
        </div>
      </v-carousel-item>
      <v-carousel-item>
        <div>
          <VueScrollPicker :options="days" v-model="selectedDay" class="day-column mobile-picker" />
        </div>
      </v-carousel-item>
      <v-carousel-item>
        <div>
          <VueScrollPicker :options="years" v-model="selectedYear" class="year-column mobile-picker" />
        </div>
      </v-carousel-item>
      <v-carousel-item></v-carousel-item>
    </v-carousel>
  </div>
</template>
<script>
	import { VueScrollPicker } from 'vue-scroll-picker';
  import { track } from '../utils/analytics';

export default {
  name: 'PickerGroup',
  components: {
    VueScrollPicker, // export VueScrollPicker is component
  },
  data() {
    return {
      selectedYear: 2010,
      selectedMonth: 6,
      selectedDay: 15,
      reason: "alive",
      otherReason: "",
      currentIndex: 0,
    }
  },
  mounted() {
    const appliedFromUrl = this.applySelectionsFromUrl();
    if (!appliedFromUrl) {
      this.restoreSelections();
    }
    if (this.reason === 'other') {
      this.focusOtherInput();
    }
  },
  watch: {
    selectedYear() { this.saveSelections(); },
    selectedMonth() { this.saveSelections(); },
    selectedDay() { this.saveSelections(); },
    reason(newVal) {
      this.saveSelections();
      track('reason_selected', { reason: newVal });
      if (newVal === 'other') {
        this.focusOtherInput();
      }
    },
    otherReason() { this.saveSelections(); },
  },
  computed: {
    mobile() {
      return this.$vuetify.display.mobile;
    },
    years() {
      const currYear = new Date().getFullYear()
      const lastYear = 1900
      return Array.from({ length: currYear - lastYear + 1 }, (_, index) => lastYear + index).reverse()
    },
    months() {
      return Array({ value: '01', name: 'January' },
        { value: '02', name: 'February' },
        { value: '03', name: 'March' },
        { value: '04', name: 'April' },
        { value: '05', name: 'May' },
        { value: '06', name: 'June' },
        { value: '07', name: 'July' },
        { value: '08', name: 'August' },
        { value: '09', name: 'September' },
        { value: '10', name: 'October' },
        { value: '11', name: 'November' },
        { value: '12', name: 'December' })
    },
    days() {
      const lastDay = new Date(this.selectedYear, this.selectedMonth, 0).getDate()
      return Array.from({ length: lastDay }, (_, index) => index + 1)
    },
    reasons() {
      return Array('married','alive','a parent','a grandparent','sober','born again','other')
    },
  },
  methods: {
    focusOtherInput() {
      this.$nextTick(() => {
        const ref = this.$refs.otherInput;
        if (ref && typeof ref.focus === 'function') {
          ref.focus();
          return;
        }
        const el = ref && ref.$el ? ref.$el : null;
        const input = el && el.querySelector ? el.querySelector('input') : null;
        if (input) input.focus();
      });
    },
    saveSelections() {
      try {
        const payload = {
          reason: String(this.reason ?? ''),
          otherReason: String(this.otherReason ?? ''),
          selectedMonth: String(this.selectedMonth ?? ''),
          selectedDay: String(this.selectedDay ?? ''),
          selectedYear: String(this.selectedYear ?? ''),
        };
        localStorage.setItem('daycounterSelections', JSON.stringify(payload));
      } catch (e) {
        // ignore storage errors
      }
    },
    applySelectionsFromUrl() {
      try {
        const { parseQueryParams, persistSelections } = require('../utils/params.js');
        const parsed = parseQueryParams(window.location.search);
        if (!parsed || !parsed.anySet) return false;
        if (parsed.reason) this.reason = parsed.reason;
        if (parsed.otherReason) this.otherReason = parsed.otherReason;
        if (parsed.month != null) this.selectedMonth = parsed.month;
        if (parsed.day != null) this.selectedDay = parsed.day;
        if (parsed.year != null) this.selectedYear = parsed.year;
        // If days are provided via URL, prime localStorage daycounterDayCount
        if (typeof parsed.days === 'number') {
          try {
            const computedReason = this.reason === 'other'
              ? (this.otherReason && this.otherReason.trim().length > 0 ? this.otherReason.trim() : 'other')
              : this.reason;
            localStorage.setItem('daycounterDayCount', JSON.stringify({ days: parsed.days, why: computedReason }));
          } catch (e) {
            // ignore storage errors
          }
        }
        persistSelections({
          reason: this.reason,
          otherReason: this.otherReason,
          month: this.selectedMonth,
          day: this.selectedDay,
          year: this.selectedYear,
        });
        return true;
      } catch (e) {
        return false;
      }
    },
    restoreSelections() {
      try {
        const raw = localStorage.getItem('daycounterSelections');
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          if (typeof data.reason === 'string') this.reason = (data.reason === 'other...' ? 'other' : data.reason);
          if (typeof data.otherReason === 'string') this.otherReason = data.otherReason;
          if (typeof data.selectedMonth === 'string' || typeof data.selectedMonth === 'number') this.selectedMonth = data.selectedMonth;
          if (typeof data.selectedDay === 'string' || typeof data.selectedDay === 'number') this.selectedDay = data.selectedDay;
          if (typeof data.selectedYear === 'string' || typeof data.selectedYear === 'number') this.selectedYear = data.selectedYear;
        }
      } catch (e) {
        // ignore corrupt payloads
      }
    },
    saveDayCount(dayCountData) {
      try {
        localStorage.setItem('daycounterDayCount', JSON.stringify(dayCountData));
      } catch (e) {
        // ignore storage errors
      }
    },
    restoreDayCount() {
      try {
        const raw = localStorage.getItem('daycounterDayCount');
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (data && typeof data === 'object' && typeof data.days === 'number' && typeof data.why === 'string') {
          return data;
        }
      } catch (e) {
        // ignore corrupt payloads
      }
      return null;
    },
    calculateDays() {
      let selectedDate = new Date(`${this.selectedYear}-${this.selectedMonth}-${this.selectedDay}`);
      let currentDate = new Date();
      let offset = ((currentDate.getTimezoneOffset()) - (selectedDate.getTimezoneOffset())) * 60000;
      let days = Math.floor((currentDate - selectedDate - offset) / 86400000);
      
      const computedReason = this.reason === 'other'
        ? (this.otherReason && this.otherReason.trim().length > 0 ? this.otherReason.trim() : 'other')
        : this.reason;

      // Save the dayCount data to localStorage
      this.saveDayCount({ 'days': days, 'why': computedReason });

      // Track finalized reason selection (includes otherReason if provided)
      track('reason_finalized', { reason: computedReason });

      this.$emit('dayCount', { 'days':days, 'why': computedReason });
      this.currentIndex = 0;
    }
  },
}
</script>
<style>



@media (min-width: 320px) and (max-width: 480px) {
  
  /* CSS */
  
}

.since {
  font-family:'Montserrat',sans-serif;
  color:#fff;
  font-size:2rem;
  font-weight:200;
}


.reason-column {
  width:14.25rem;
  margin-right:3.75rem;
  position: relative;
}

.since-column {
  width:6.75rem;
  margin-right:3.75rem;
  display: inline-block;
  text-align: center;
  align-content: center;
}

.month-column {
  width:11.25rem;
  margin-right:3.75rem;
}

.day-column {
  width:3.25rem;
  margin-right:3.75rem;
}

.year-column {
  width:5.75rem;
  margin-right:3.75rem;
}

.vue-scroll-picker {
    position: relative;
    width: 100%;
    height: 15em;
    mask-image:linear-gradient(to bottom, rgba(242,239,136,0) 0%,rgba(242,239,136,0.65) 42%,rgba(242,239,136,1) 43%,rgba(242,239,136,1) 57%,rgba(242,239,136,0.65) 58%,rgba(242,239,136,0) 100%);
}
.mobile-picker {
  height: 25em;
}
.vue-scroll-picker-rotator {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(50% - 1em);
}
.vue-scroll-picker-rotator-transition {
    transition: top ease 0.15s;
}
.vue-scroll-picker-item {
    text-align: center;
    font-size: 2rem;
    font-family:'Montserrat',sans-serif;
    font-weight:200;
    line-height: 1.2em;
    color: #F2EF88;
}
.vue-scroll-picker-item-selected {
    color: #F2EF88;
}
.vue-scroll-picker-item-empty,
.vue-scroll-picker-item-placeholder,
.vue-scroll-picker-item-disabled {
    color: #ccc;
}
.vue-scroll-picker-item-empty.vue-scroll-picker-item-selected,
.vue-scroll-picker-item-placeholder.vue-scroll-picker-item-selected,
.vue-scroll-picker-item-disabled.vue-scroll-picker-item-selected {
    color: #aaa;
}
.vue-scroll-picker-layer {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}
.vue-scroll-picker-layer-top,
.vue-scroll-picker-layer-selection,
.vue-scroll-picker-layer-bottom {
    position: absolute;
    left: 0;
    right: 0;
}
.vue-scroll-picker-layer-top {
    box-sizing: border-box;
    /* border-bottom: 1px solid #c8c7cc;
    background: linear-gradient(0deg, rgba(23,44,73,0.4) 0%, rgba(22,37,67,0.9) 75%, rgba(21,35,65,1) 100%); */
    top: 0;
    height: calc(50% - 1em);
    cursor: pointer;
}
.vue-scroll-picker-layer-selection {
    top: calc(50% - 1em);
    bottom: calc(50% - 1em);
}
.vue-scroll-picker-layer-bottom {
    /*border-top: 1px solid #c8c7cc; 
    background: linear-gradient(180deg, rgba(24,46,76,0.4) 0%, rgba(27,53,83,0.9) 75%, rgba(28,55,85,1) 100%); */
    bottom: 0;
    height: calc(50% - 1em);
    cursor: pointer;
}

.picker-group {

  display: flex;
  margin:0 auto;
  padding-top:60px;
}


.btn-container {
  height:15em;
  align-content: center;
  width:6rem;
}

.calculate-days :hover {
  font-variation-settings:
  'FILL' 1
}

.calculate-days-mobile {
  height:46px !important;
  width:46px !important;
  border-radius:23px !important;
  border:1px solid #F2EF88 !important;
  line-height:44px !important;
  font-size:22px !important;
}

/* When other is active, visually hide the selected picker item so the input appears in its place */
.reason-column.other-active .vue-scroll-picker-item-selected {
  color: transparent;
}

/* Overlay input styled like a picker item and centered on the selection line */
.other-reason-input {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  padding: 0 8px;
}
.other-reason-input .v-field {
  background: transparent !important;
  box-shadow: none !important;
}
.other-reason-input .v-field__overlay,
.other-reason-input .v-field__outline {
  display: none !important;
}
.other-reason-input .v-field__input {
  text-align: center;
  font-size: 2rem;
  font-family:'Montserrat',sans-serif;
  font-weight:200;
  line-height: 1.2em;
  color: #F2EF88;
  height: 1.2em;
  padding: 0;
}
.other-reason-input input::placeholder {
  color: #ccc;
}
</style>