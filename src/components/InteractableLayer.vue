<template>
  <div class="interactable-layer">
    <div class="interactable">
      <div v-if="daysSince" class="readout" :class="mobile ? '' : 'mt-6'">
        <h3 v-if="!mobile" style="margin-bottom:0px;">It's {{ today }} </h3>
        <h3 v-else style="line-height:1.5;margin-bottom:16px;">It's {{ today }} </h3>
        <h1 v-if="!mobile" style="margin-top:0px;">you&#8217;ve been {{ reason }} for </h1>
        <h1 v-else style="margin-top:0px;margin-bottom:16px;text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);">you&#8217;ve been {{ reason }} for </h1>
        <flip-clock :options="flipOptions" />
        <h1 v-if="!mobile">days</h1>
        <h1 v-else style="margin-top:16px;text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);">days</h1>
      </div>
      <KeepAlive>
        <PickerGroup :is="currentComponent" v-if="!daysSince" @dayCount="onDayCount" />
      </KeepAlive>
    </div>
  </div>
</template>

<script>
import { FlipClock } from '@mvpleung/flipclock';
import PickerGroup from './PickerGroup';

export default {
  name: 'InteractableLayer',
  components: {
    FlipClock,
    PickerGroup,
  },
  props: {
    daysSince: {
      type: Number,
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
    today: {
      type: String,
      required: true,
    },
    currentComponent: {
      type: String,
      default: null,
    },
  },
  emits: ['dayCount'],
  computed: {
    mobile() {
      return this.$vuetify.display.mobile;
    },
    flipOptions() {
      return {
        clockFace: 'Counter',
        autoStart: false,
        digit: this.daysSince,
      };
    },
  },
  methods: {
    onDayCount(payload) {
      this.$emit('dayCount', payload);
    },
  },
};
</script>

<style scoped>
.interactable-layer {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: start;
  margin-top:60px;
  justify-content: center;
  pointer-events: none;
}

.interactable {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  pointer-events: auto;
}

.readout {
  text-align: center;
  align-content: center;
}

@media (max-width: 599px) and (orientation: portrait) {
  .readout {
    margin-top: 100px !important;
  }
}
</style>
