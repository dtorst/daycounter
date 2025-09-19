<template>  
  <div id="container" :class="{ night: !daysSince }">
    <FireworksDisplay v-if="todaysDay" />
    <PageHeader :buttonDisplay="daysSince" @buttonClicked="daysSince = null" />
    <div class="interactable">
      <div class="readout" v-if="daysSince">
        <h3 style="margin-bottom:0px;">It's {{today}} </h3>
        <h1 style="margin-top:0px;">you&#8217;ve been {{reason}} for </h1>
        <flip-clock :options="{clockFace: 'Counter',autoStart: false,digit: daysSince}" />
        <h1>days</h1>
      </div>
      <KeepAlive>
        <PickerGroup :is="currentComponent" v-if="!daysSince" @dayCount="updateDays" />
      </KeepAlive>
    </div>
    <PageScenery :rayDisplay="daysSince" />

  </div>
</template>
<script>
import { FlipClock } from '@mvpleung/flipclock';
import PageScenery from './components/Scenery'
import FireworksDisplay from './components/Fireworks'
import PageHeader from './components/PageHeader'
import PickerGroup from './components/PickerGroup'



export default {
  components: {
    FlipClock,
    PageScenery,
    FireworksDisplay,
    PageHeader,
    PickerGroup
  },

  data() {
    return {
      daysSince: null,
      today: new Date().toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"long", day:"numeric"}),
    }
  },
  methods: {
   updateDays({days,why}) {
     this.daysSince = days;
     this.reason = why;
   }
 }

}

</script>
<style src="./assets/global.css"></style>
