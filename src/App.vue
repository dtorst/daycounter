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
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@100..900&display=swap');

@font-face {
  font-family: 'Sugar Peachy';
  src: url('assets/sugar-peachy.otf') format('opentype');
  font-style: normal;
  font-display: block;
}

/* override browser default */
html,
body {
  margin: 0;
  padding: 0;
  font-size: 16px;
}

/* use viewport-relative units to cover page fully */
body {
  height: 100vh;
  width: 100vw;
}


/* include border and padding in element width and height */
* {
  box-sizing: border-box;
}


h1 {
  color: #E9E9E9;
  text-align: center;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  font-family: 'Sugar Peachy';
  font-size: 60px;
  font-style: normal;
  font-weight: 900;
  line-height: 60px; /* 100% */
  margin:8px;
}
h3 {
  color: rgba(255, 255, 255, 0.75);
  text-align: center;
  font-family: 'Montserrat',sans-serif;
  font-size: 26px;
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.readout {
  text-align: center;
  align-content: center;
} 
.calculate-days, .update-button {
  height:36px;
  width:96px;
  border:2px solid #F2EF88;
  color:#F2EF88;
  background: rgba(242,239,136,0);
  cursor: pointer;
  border-radius:20px;
  transition-duration: 2s;
  line-height:30px;
}

.update-button {
  float:right;
}


</style>