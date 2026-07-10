<template>
  <div class="interactable-layer">
    <div class="interactable">
      <div
        v-if="!showPicker && daysSince"
        class="readout"
        :class="mobile ? '' : 'mt-6'"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
        @pointerdown="onPointerStart"
        @pointerup="onPointerEnd"
      >
        <h3 v-if="!mobile" style="margin-bottom:0px;">It's {{ today }} </h3>
        <h3 v-else style="line-height:1.5;margin-bottom:16px;">It's {{ today }} </h3>
        <h1 v-if="!mobile" style="margin-top:0px;">you&#8217;ve been {{ reason }} for </h1>
        <h1 v-else style="margin-top:0px;margin-bottom:16px;text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);">you&#8217;ve been {{ reason }} for </h1>
        <button
          v-if="!mobile"
          class="daycount-chevron daycount-chevron-left"
          :class="{ visible: canNavigatePrevious }"
          :disabled="!canNavigatePrevious"
          type="button"
          aria-label="Previous daycount"
          @click.stop="navigatePrevious"
        >
          <VIcon size="44">mdi-chevron-left</VIcon>
        </button>
        <flip-clock :options="flipOptions" />
        <button
          v-if="!mobile"
          class="daycount-chevron daycount-chevron-right"
          :class="{ visible: canNavigateNext }"
          :disabled="!canNavigateNext"
          type="button"
          aria-label="Next daycount"
          @click.stop="navigateNext"
        >
          <VIcon size="44">mdi-chevron-right</VIcon>
        </button>
        <h1 v-if="!mobile">days</h1>
        <h1 v-else style="margin-top:16px;text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);">days</h1>
      </div>
      <KeepAlive>
        <PickerGroup
          :is="currentComponent"
          v-if="showPicker"
          :key="pickerKey"
          :initialDayCount="pickerDayCount"
          :showCancelRemove="showCancelRemove"
          :useStoredSelections="useStoredPickerSelections"
          @dayCount="onDayCount"
          @cancelDayCount="onCancelDayCount"
        />
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
    showPicker: {
      type: Boolean,
      default: false,
    },
    pickerDayCount: {
      type: Object,
      default: null,
    },
    pickerKey: {
      type: String,
      default: 'picker',
    },
    useStoredPickerSelections: {
      type: Boolean,
      default: true,
    },
    showCancelRemove: {
      type: Boolean,
      default: false,
    },
    canNavigatePrevious: {
      type: Boolean,
      default: false,
    },
    canNavigateNext: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['dayCount', 'cancelDayCount', 'navigateDayCount'],
  data() {
    return {
      swipeStartX: null,
      swipeStartY: null,
    };
  },
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
    onCancelDayCount() {
      this.$emit('cancelDayCount');
    },
    navigatePrevious() {
      if (this.canNavigatePrevious) {
        this.$emit('navigateDayCount', -1);
      }
    },
    navigateNext() {
      if (this.canNavigateNext) {
        this.$emit('navigateDayCount', 1);
      }
    },
    onTouchStart(event) {
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch) return;

      this.startSwipe(touch.clientX, touch.clientY);
    },
    onTouchEnd(event) {
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch || this.swipeStartX == null || this.swipeStartY == null) return;

      this.finishSwipe(touch.clientX, touch.clientY);
    },
    onPointerStart(event) {
      if (event.pointerType === 'touch') return;

      this.startSwipe(event.clientX, event.clientY);
    },
    onPointerEnd(event) {
      if (event.pointerType === 'touch') return;

      this.finishSwipe(event.clientX, event.clientY);
    },
    startSwipe(clientX, clientY) {
      this.swipeStartX = clientX;
      this.swipeStartY = clientY;
    },
    finishSwipe(clientX, clientY) {
      if (this.swipeStartX == null || this.swipeStartY == null) return;

      const deltaX = clientX - this.swipeStartX;
      const deltaY = clientY - this.swipeStartY;
      this.swipeStartX = null;
      this.swipeStartY = null;

      if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;

      if (deltaX < 0 && this.canNavigateNext) {
        this.$emit('navigateDayCount', 1);
      } else if (deltaX > 0 && this.canNavigatePrevious) {
        this.$emit('navigateDayCount', -1);
      }
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
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
}

.daycount-chevron {
  position: fixed;
  top: 40%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 0;
  color: #fff;
  background: transparent;
  cursor: default;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-50%);
  transition: opacity 150ms ease;
}

.daycount-chevron-left {
  left: 40px;
}

.daycount-chevron-right {
  right: 40px;
}

.daycount-chevron.visible {
  cursor: pointer;
  opacity: 0.5;
  pointer-events: auto;
}

.daycount-chevron.visible:hover {
  opacity: 0.8;
}

.daycount-chevron .v-icon {
  color: inherit;
}

@media (max-width: 599px) and (orientation: portrait) {
  .readout {
    margin-top: 100px !important;
  }
}
</style>
