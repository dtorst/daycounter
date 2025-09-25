<template>
  <header>
    <div class="logo">
      <a href="#">
        <img src="../assets/daycounter-icon.svg" alt="Daycounter" height="44px" />
      </a>
    </div>
    <div class="d-flex justify-end">
      <VBtn class="text-lowercase" color="primary" variant="outlined" rounded v-if="buttonDisplay" @click='clickUpdate()' type="button">Update</VBtn>
      <VTooltip v-model="isCopied" :open-on-hover="false" :open-on-click="false" :open-on-focus="false" text="URL copied to clipboard!">
        <template #activator="{ props }">
          <VBtn v-bind="props" @click='copyUrlSelections()' color="primary" class="ms-4" size="small" variant="text" icon="mdi-link-variant" type="button" />
        </template>
      </VTooltip>
      <VBtn @click='clickOpenDrawer()' color="primary" class="ms-2 me-4" size="small" variant="text" icon="mdi-menu" type="button"/>
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
  methods: {
		clickUpdate() {
			this.$emit('buttonClicked')
		},
		clickOpenDrawer() {
			this.$emit('openDrawer')
		},
    buildShareUrl() {
      try {
        const raw = localStorage.getItem('daycounterSelections');
        const data = raw ? JSON.parse(raw) : {};
        const reason = data && typeof data.reason === 'string' ? data.reason : '';
        const selectedMonth = data && (data.selectedMonth ?? '');
        const selectedDay = data && (data.selectedDay ?? '');
        const selectedYear = data && (data.selectedYear ?? '');

        const base = window.location.origin + window.location.pathname;
        const params = new URLSearchParams();
        if (reason) params.set('reason', reason);
        if (selectedMonth !== '') params.set('selectedMonth', String(selectedMonth));
        if (selectedDay !== '') params.set('selectedDay', String(selectedDay));
        if (selectedYear !== '') params.set('selectedYear', String(selectedYear));

        const query = params.toString();
        return query ? `${base}?${query}` : base;
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