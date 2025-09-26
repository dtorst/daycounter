<template>
    <VNavigationDrawer 
      v-model="drawer" 
      temporary
      location="right"
      width="360"
      style="background:rgba(0,0,0,0.2);backdrop-filter: blur(10px);"
    >    
      <!-- Header -->
      <div class="pa-5 d-flex justify-center">
          <h6 class="text-h6 text-white text-center">
            Welcome to Daycounter!
          </h6>
      </div>

      <VDivider />
      <!-- Content -->
      <VCard variant="flat" class="bg-transparent color-white text-white">
        <v-expansion-panels class="bg-transparent color-white text-white" variant="accordion">
          <v-expansion-panel
            class="bg-transparent"
          >
            <VExpansionPanelTitle collapse-icon="mdi-moon-waxing-crescent" expand-icon="mdi-white-balance-sunny" style="font-size:15px;"><VIcon color="white" style="color:#fff !important;" size="small" class="me-2 text-white">mdi-help-circle</VIcon> What is this?</VExpansionPanelTitle>
            <VExpansionPanelText style="font-size:14px;">
              In the Book of Psalms, the psalmist writes, "teach us to number our days, that we may gain a heart of wisdom."
              <br /><br />
              Daycounter is here to help you do that. It's a humble little count-<span class="font-italic">up</span> app in a world filled with countdown apps.
              <br/><br/>
              Which makes sense, honestly. We tend to invest way more mental and emotional energy towards reaching the next big mile marker, don't we?
              <br/><br/>
              This is meant as a bit of a counterweight to that mentality. We can (and should!) look forward with anticipation. But we should also look back with gratitude for how far we've come.
              <br /><br />
              Our time on Earth is short. Every single day is a gift. Let's make each one count.
              <br /><br />
              ===<br /><br/>
              <span class="font-weight-bold">Credits</span><br />
              Built by <a class="text-white" href="https://davidtorstenson.com" target="_blank">David Torstenson</a> using <a class="text-white" href="https://vuetifyjs.com/" target="_blank">Vuetify</a> (and lots of CSS).<br/>FlipClock component by <a class="text-white" href="https://github.com/mvpleung/vue-flipclock" target="_blank">mvpleung</a>.
            </VExpansionPanelText>
          </v-expansion-panel>
          <v-expansion-panel
            class="bg-transparent"
          >
            <VExpansionPanelTitle collapse-icon="mdi-moon-waxing-crescent" expand-icon="mdi-white-balance-sunny" style="font-size:15px;"><VIcon color="white" style="color:#fff !important;" size="small" class="me-2 text-white">mdi-lightbulb-variant-outline</VIcon> Feedback, questions, etc</VExpansionPanelTitle>
            <VExpansionPanelText style="font-size:14px;">
              Ideas, feedback, questions, collabs? I'm open to any and all of it! <br/><br/>Email me at davidtorstenson @ gmail.com to get in touch.
            </VExpansionPanelText>
          </v-expansion-panel>
          <v-expansion-panel
            class="bg-transparent"
          >
            <VExpansionPanelTitle collapse-icon="mdi-moon-waxing-crescent" expand-icon="mdi-white-balance-sunny" style="font-size:15px;"><VIcon color="white" style="color:#fff !important;" size="small" class="me-2 text-white">mdi-heart</VIcon> Support</VExpansionPanelTitle>
            <VExpansionPanelText style="font-size:14px;">
              <p class="mb-6">This site is totally free - nothing to sell you (at least at the moment).<br/><br/>But if you receive any value from stopping by, and would like to buy me a <span style="font-size:20px;line-height:16px;">☕️</span> (or a <span style="font-size:18px;line-height:16px;">🍺</span>), I certainly won't say no!</p>
              <VBtn class="text-lowercase" color="success" block href="https://buymeacoffee.com/dtorst" target="_blank"><span class="text-capitalize">S</span>how some&nbsp;<VIcon color="white" style="color:#fff !important;" size="small" class="me-2 text-white">mdi-heart</VIcon></VBtn>
            </VExpansionPanelText>
          </v-expansion-panel>
        </v-expansion-panels>
      </VCard>

    <template #append>
      <!-- 👉 Submit and Cancel -->

      <VDivider class="my-3" />
      <VRow class="d-flex mb-4 mx-4 justify-space-between">
        <a href="https://github.com/dtorst/daycounter" target="_blank"><VIcon color="white" style="color:#fff !important;" size="small" class="me-2 text-white">mdi-github</VIcon></a>
        <p class="text-grey-lighten-1 text-center text-subtitle-2">2025 © Daycounter</p>
      </VRow>
      </template>
    </VNavigationDrawer>
</template>

<script>
export default {
  name: 'DrawerComponent',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  computed: {
    drawer: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>
<style scoped>
/* Custom styling to match your app's theme */

* {
  font-family: 'Montserrat', sans-serif !important;
}

:deep(.v-navigation-drawer) {
  background: rgba(17, 25, 54, 0.95) !important;
  backdrop-filter: blur(10px);
}

:deep(.v-list-item-title) {
  color: #F2EF88 !important;
  font-family: 'Montserrat', sans-serif !important;
}

:deep(.v-list-item) {
  color: #E9E9E9 !important;
}

:deep(.v-list-item:hover) {
  background: rgba(242, 239, 136, 0.1) !important;
}

:deep(.v-divider) {
  border-color: rgba(242, 239, 136, 0.3) !important;
}

:deep(.v-icon) {
  color: #F2EF88 !important;
}

:deep(.v-expansion-panel__shadow) {
  box-shadow: none !important;
}
</style>