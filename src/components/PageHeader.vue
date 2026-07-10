<template>
  <header :class="{ 'ios-header': isIos }">
    <div class="logo">
      <a href="#" @click.prevent="clickLogo">
        <img src="../assets/daycounter-logo.svg" alt="Daycounter" height="34px" />
      </a>
      <div v-if="showDayCountDots" class="daycount-dots" aria-label="Daycounts">
        <button
          v-for="index in dayCountCount"
          :key="index"
          class="daycount-dot"
          :class="{ active: index - 1 === currentDayCountIndex }"
          type="button"
          :aria-label="`Show daycount ${index}`"
          :aria-current="index - 1 === currentDayCountIndex ? 'true' : undefined"
          @click="clickDayCountDot(index - 1)"
        />
      </div>
    </div>
    <div v-if="!mobile" class="d-flex justify-end me-4">
      <VFadeTransition>
        <VBtn v-if="showAddButton" style="width: 36px; height: 36px;" @click="clickAddDayCounter" color="primary" size="small" variant="outlined" icon="mdi-plus" type="button"/>
      </VFadeTransition>
      <VFadeTransition>
        <VBtn class="text-capitalize ms-4" color="primary" variant="outlined" rounded v-if="buttonDisplay" @click='clickUpdate()' type="button" prepend-icon="mdi-calendar-edit">Update</VBtn>
      </VFadeTransition>
      <VTooltip v-model="isCopied" :open-on-hover="false" :open-on-click="false" :open-on-focus="false" location="bottom" text="Link copied!">
        <template #activator="{ props }">
          <VFadeTransition>
            <VBtn v-if="buttonDisplay" prepend-icon="mdi-link-variant" class="text-capitalize ms-4" variant="outlined" rounded v-bind="props" @click='copyUrlSelections()' color="primary" type="button">Share</VBtn>
          </VFadeTransition>
        </template>
      </VTooltip>
    </div>    
    <div v-else class="d-flex justify-end me-2">
      <VFadeTransition>
        <VBtn v-if="showAddButton" @click="clickAddDayCounter" color="primary" class="ms-1" size="small" variant="text" icon="mdi-plus" type="button"/>
      </VFadeTransition>
      <VFadeTransition>
        <VBtn color="primary" variant="text" size="small" icon="mdi-calendar-edit" v-if="buttonDisplay" @click='clickUpdate()' />
      </VFadeTransition>
      <VTooltip v-model="isCopied" :open-on-hover="false" :open-on-click="false" :open-on-focus="false" location="bottom" text="Link copied!">
        <template #activator="{ props }">
          <VFadeTransition>
            <VBtn v-bind="props" @click='copyUrlSelections()' v-if="buttonDisplay" color="primary" class="ms-1" size="small" variant="text" icon="mdi-link-variant" type="button" />
          </VFadeTransition>
        </template>
      </VTooltip>
    </div>
  </header>
  <VBtn
    v-if="showInfoMenu && !mobile"
    class="info-menu-fab"
    color="primary"
    size="x-small"
    variant="outlined"
    icon="mdi-help"
    type="button"
    aria-label="Open Daycounter information"
    style="position: fixed; right: 16px; bottom:16px;"
    @click="clickOpenDrawer"
  />
</template>

<script>
import { Capacitor } from '@capacitor/core'

export default {
  name: 'PageHeader',
  props: {
    buttonDisplay: {
      default: false
    },
    showInfoMenu: {
      type: Boolean,
      default: true
    },
    showAddButton: {
      type: Boolean,
      default: false
    },
    dayCountCount: {
      type: Number,
      default: 0
    },
    currentDayCountIndex: {
      type: Number,
      default: 0
    },
    showDayCountDots: {
      type: Boolean,
      default: false
    }
  },
  emits: ['buttonClicked', 'openDrawer', 'addDayCounter', 'selectDayCount'],
  data() {
    return {
      isCopied: false,
      copyTimer: null,
    }
  },
  beforeUnmount() {
    if (this.copyTimer) {
      clearTimeout(this.copyTimer);
      this.copyTimer = null;
    }
  },
  computed: {
    mobile() {
      return this.$vuetify.display.mobile;
    },
    isIos() {
      return Capacitor.getPlatform() === 'ios';
    }
  },
  methods: {
		clickUpdate() {
			this.$emit('buttonClicked')
		},
    clickLogo() {
      if (this.mobile) {
        this.clickOpenDrawer()
      }
    },
		clickOpenDrawer() {
      if (!this.showInfoMenu) return
			this.$emit('openDrawer')
		},
    clickAddDayCounter() {
      this.$emit('addDayCounter')
    },
    clickDayCountDot(index) {
      this.$emit('selectDayCount', index)
    },
    buildShareUrl() {
      // Delegate to shared util
      try {
        const { buildShareUrlFromLocalStorage } = require('../utils/params.js');
        return buildShareUrlFromLocalStorage();
      } catch (e) {
        return window.location.href;
      }
    },
    async copyUrlSelections() {
      try {
        const url = this.buildShareUrl();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.setAttribute('readonly', '');
          textArea.style.position = 'absolute';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        this.isCopied = true;
        if (this.copyTimer) {
          clearTimeout(this.copyTimer);
          this.copyTimer = null;
        }
        this.copyTimer = setTimeout(() => {
          this.isCopied = false;
          this.copyTimer = null;
        }, 3000);
      } catch (e) {
        this.isCopied = false;
      }
    }
	}
}
</script>
<style scoped>
header {
  position: fixed;
  inset: 0 0 auto 0;
  display: block;
  width: 100%;
  height: 60px;
  padding-top: 16px;
  z-index: var(--z-header, 60);
  pointer-events: auto;
}

header.ios-header {
  margin-top: 40px;
}

.logo {
  float:left;
  padding-left:16px;
  width:200px;
  height:34px;
  margin-top: 8px;
}

.daycount-dots {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 4px;
  padding-left: 2px;
}

.daycount-dot {
  width: 7px;
  height: 7px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  transition: width 150ms ease, background-color 150ms ease;
}

.daycount-dot.active {
  width: 20px;
  background: #fff;
}

.info-menu-fab {
  border: 1px solid #F2EF88 !important;
  border-radius: 999px !important;
  color: #F2EF88 !important;
  background: rgba(242,239,136,0) !important;
  box-shadow: none !important;
  z-index: var(--z-header, 60);
}

/* Ensure buttons maintain custom styling */
:deep(.update-button) {
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
</style>