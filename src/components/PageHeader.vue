<template>
  <header>
    <div class="logo">
      <a href="#">
        <img src="../assets/daycounter-icon.svg" alt="Daycounter" height="44px" />
      </a>
    </div>
    <div v-if="!mobile" class="d-flex justify-end">
      <VBtn class="text-capitalize" color="primary" variant="outlined" rounded v-if="buttonDisplay" @click='clickUpdate()' type="button" prepend-icon="mdi-calendar-edit">Update</VBtn>
      <VTooltip v-model="isCopied" :open-on-hover="false" :open-on-click="false" :open-on-focus="false" location="bottom" text="Link copied!">
        <template #activator="{ props }">
          <VBtn prepend-icon="mdi-link-variant" class="text-capitalize ms-4" variant="outlined" rounded v-bind="props" @click='copyUrlSelections()' color="primary" type="button">Share</VBtn>
        </template>
      </VTooltip>
      <VBtn @click='clickOpenDrawer()' color="primary" class="ms-2 me-4" size="small" variant="text" icon="mdi-menu" type="button"/>
    </div>    
    <div v-else class="d-flex justify-end">
      <VBtn color="primary" variant="text" size="small" icon="mdi-calendar-edit" v-if="buttonDisplay" @click='clickUpdate()' />
      <VTooltip v-model="isCopied" :open-on-hover="false" :open-on-click="false" :open-on-focus="false" location="bottom" text="Link copied!">
        <template #activator="{ props }">
          <VBtn v-bind="props" @click='copyUrlSelections()' v-if="buttonDisplay" color="primary" class="ms-1" size="small" variant="text" icon="mdi-link-variant" type="button" />
        </template>
      </VTooltip>
      <VBtn @click='clickOpenDrawer()' color="primary" class="ms-1 me-2" size="small" variant="text" icon="mdi-menu" type="button"/>
    </div>
  </header>
</template>

<script>
export default {
  name: 'PageHeader',
  props: ["buttonDisplay"],
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
    }
  },
  methods: {
		clickUpdate() {
			this.$emit('buttonClicked')
		},
		clickOpenDrawer() {
			this.$emit('openDrawer')
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
  display:block;
  height:60px;
  padding-top:16px;
  position: relative;
  z-index:20;
}

.logo {
  float:left;
  padding-left:16px;
  width:200px;
  height:44px;
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