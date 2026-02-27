<template>
  <div class="scenery-canvas" :class="{ night: isNight }">
    <div class="moon">
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div class="stars">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div class="scene">
      <div class="hills">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div class="sun"></div>
      <div class="water"></div>
    </div>
    <div class="rays-anchor">
      <img src="../assets/rays.svg" loading="eager" alt="" class="rays">
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageScenery',
  props: {
    rayDisplay: {
      type: Number,
      default: null,
    },
  },
  computed: {
    isNight() {
      return !this.rayDisplay;
    },
  },
};
</script>
<style scoped>
.scenery-canvas {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  pointer-events: none;
  z-index: var(--z-scenery-base, 10);
  --scenery-scene-bottom: 0px;
}

.rays {
  opacity: 1;
  object-fit: none;
  flex: none;
  align-self: center;
  max-width: 3000px;
  max-height: 3000px;
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  -webkit-transition: opacity 4s 0s ease;
  transition: opacity 4s 0s ease;
  -webkit-animation: spin 100s linear infinite;
  -moz-animation: spin 100s linear infinite;
  animation: spin 200s linear infinite;
}

.rays-anchor {
  position: absolute;
  left: var(--scenery-sun-x, 50%);
  bottom: calc(
    var(--scenery-scene-bottom, 0px) +
    var(--scenery-sun-bottom, 0px) +
    (var(--scenery-sun-size, 16.5rem) / 2)
  );
  transform: translateX(-50%);
  width: 1px;
  height: 1px;
  overflow: visible;
  z-index: var(--z-scenery-rays, 5);
}

@-moz-keyframes spin {
  100% { -moz-transform: rotate(360deg); }
}

@-webkit-keyframes spin {
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

.scenery-canvas.night .rays {
  opacity: 0;
  -webkit-transition: opacity 0.5s 0s ease;
  transition: opacity 0.5s 0s ease;
}

.scene {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: var(--z-scenery-scene, 10);
  width: 100%;
  height: 340px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* MOON */
.moon {
  position: absolute;
  margin-top: 110px;
  background: var(--scenery-moon-color, #d9d8d0);
  box-shadow: inset -10px 2px 0 0 var(--scenery-moon-shadow, #899098);
  width: 90px;
  height: 90px;
  border-radius: 100%;
  left: 120%;
  margin-left: -190px;
  top: 50%;
  overflow: hidden;
  z-index: var(--z-scenery-astro-1, 30);
  -webkit-transition: all 1.1s 0s ease;
  transition: all 1.1s 0s ease;
}

.scenery-canvas.night .moon {
  left: 90%;
  top: -8%;
  -webkit-transition: all 1.1s 0.4s ease;
  transition: all 1.1s 0.4s ease;
}

.moon div:nth-child(n) {
  position: relative;
  background: #b9b8b0;
  border-radius: 50%;
  box-shadow: inset 4px -2px 0 0 #535457;
}

.moon div:nth-child(1) {
  top: 25%;
  left: 12%;
  width: 27%;
  height: 27%;
}

.moon div:nth-child(2) {
  top: -11%;
  left: 60%;
  width: 16%;
  height: 16%;
}

.moon div:nth-child(3) {
  top: 25%;
  left: 44%;
  width: 16%;
  height: 16%;
}

/* STARS */
.stars {
  opacity: 0;
  margin-left: 100px;
  top: 0;
  left: 0;
  -webkit-transition: all 0.8s 0s ease;
  transition: all 0.8s 0s ease;
  z-index: var(--z-scenery-astro-2, 20);
}

.scenery-canvas.night .stars {
  opacity: 1;
  -webkit-transition: all 3s 0.4s ease;
  transition: all 3s 0.4s ease;
}

.stars div:nth-child(n) {
  position: absolute;
  background: radial-gradient(rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 1);
  overflow: hidden;
  width: 1.6px;
  height: 1.6px;
  margin-left: 20%;
  margin-top: -20%;
  -webkit-transition: all 1s 0s ease;
  transition: all 1s 0s ease;
}

.scenery-canvas.night .stars div:nth-child(n) {
  margin-left: 0;
  margin-top: 0;
  -webkit-transition: all 1s 0.4s ease-out;
  transition: all 1s 0.4s ease-out;
}

.stars div:nth-child(1) { left: 25%; top: 30%; }
.stars div:nth-child(2) { left: 55%; top: 20%; }
.stars div:nth-child(3) { left: 60%; top: 60%; }
.stars div:nth-child(4) { left: 40%; top: 45%; }
.stars div:nth-child(5) { left: 15%; top: 55%; }
.stars div:nth-child(6) { left: 40%; top: 10%; }
.stars div:nth-child(7) { left: 80%; top: 55%; }

.hills div:nth-child(n) {
  position: absolute;
  -webkit-transition: all 1s 0.6s ease;
  transition: all 1s 0.6s ease;
}

.hills div:nth-child(1) {
  z-index: 53;
  bottom: 0;
  left: -183px;
  --r: 4px;
  width: 578px;
  height: 285px;
  -webkit-mask:
    linear-gradient(#0000 calc(3 * var(--r) / 2), #000 0),
    radial-gradient(var(--r) at 50% calc(2 * var(--r)), #000 98%, #0000 101%);
  mask:
    linear-gradient(#0000 calc(3 * var(--r) / 2), #000 0),
    radial-gradient(var(--r) at 50% calc(2 * var(--r)), #000 98%, #0000 101%);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  background: var(--scenery-hill-1-day, #0e580e);
}

.hills div:nth-child(2) {
  z-index: 54;
  bottom: 0;
  left: 128px;
  --r: 32px;
  height: 218px;
  width: 476px;
  -webkit-mask:
    linear-gradient(#0000 calc(var(--r) / sqrt(2)), #000 0),
    radial-gradient(var(--r) at 50% calc(var(--r) * sqrt(2)), #000 98%, #0000 101%);
  mask:
    linear-gradient(#0000 calc(var(--r) / sqrt(2)), #000 0),
    radial-gradient(var(--r) at 50% calc(var(--r) * sqrt(2)), #000 98%, #0000 101%);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  background: var(--scenery-hill-2-day, #398239);
}

.hills div:nth-child(3) {
  z-index: 54;
  bottom: 0;
  right: 152px;
  --r: 36px;
  height: 203px;
  width: 451px;
  -webkit-mask:
    linear-gradient(#0000 calc(var(--r) / sqrt(2)), #000 0),
    radial-gradient(var(--r) at 50% calc(var(--r) * sqrt(2)), #000 98%, #0000 101%);
  mask:
    linear-gradient(#0000 calc(var(--r) / sqrt(2)), #000 0),
    radial-gradient(var(--r) at 50% calc(var(--r) * sqrt(2)), #000 98%, #0000 101%);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  background: var(--scenery-hill-3-day, #299029);
}

.hills div:nth-child(4) {
  z-index: 53;
  bottom: 0;
  right: -110px;
  --r: 64px;
  height: 387px;
  width: 526px;
  -webkit-mask:
    linear-gradient(#0000 calc(1.35 * var(--r)), #000 0),
    radial-gradient(var(--r) at 50% calc(1.8 * var(--r)), #000 98%, #0000 101%);
  mask:
    linear-gradient(#0000 calc(1.35 * var(--r)), #000 0),
    radial-gradient(var(--r) at 50% calc(1.8 * var(--r)), #000 98%, #0000 101%);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  background: var(--scenery-hill-4-day, #196419);
}

.scenery-canvas.night .hills div:nth-child(1) { background: var(--scenery-hill-1-night, #202020); }
.scenery-canvas.night .hills div:nth-child(2) { background: var(--scenery-hill-2-night, #262525); }
.scenery-canvas.night .hills div:nth-child(3) { background: var(--scenery-hill-3-night, #262525); }
.scenery-canvas.night .hills div:nth-child(4) { background: var(--scenery-hill-4-night, #1e1d1d); }

/* WATER */
@property --myColor3 {
  syntax: '<color>';
  initial-value: #f5c30e;
  inherits: false;
}

@property --myColor4 {
  syntax: '<color>';
  initial-value: #518eac;
  inherits: false;
}

.water {
  position: absolute;
  z-index: 40;
  --myColor3: var(--scenery-water-top-day, #f5c30e);
  --myColor4: var(--scenery-water-bottom-day, #518eac);
  background: repeating-radial-gradient(ellipse farthest-corner at center -400%, var(--myColor3) 30%, var(--myColor4) 80%) repeat scroll 0 0 var(--myColor4);
  transition: --myColor3 3s, --myColor4 3s;
  width: 50%;
  left: 25%;
  height: 8.25rem;
  bottom: 0;
}

.scenery-canvas.night .water {
  --myColor3: var(--scenery-water-top-night, #7fa1bb);
  --myColor4: var(--scenery-water-bottom-night, #1d425a);
}

/* SUN */
.sun {
  margin-top: 20px;
  background: var(--scenery-sun-color, #f2ef88);
  box-shadow: 0 0 20px rgba(242, 239, 136, 0.4);
  width: var(--scenery-sun-size, 16.5rem);
  height: var(--scenery-sun-size, 16.5rem);
  border-radius: 50%;
  position: absolute;
  left: var(--scenery-sun-x, 50%);
  z-index: var(--z-scenery-astro-1, 30);
  bottom: var(--scenery-sun-bottom, 0px);
  transform: translateX(-50%);
  -webkit-animation: pulse 5s ease infinite alternate;
  animation: pulse 5s ease infinite alternate;
  -webkit-transition: all 1.1s 0.4s ease;
  transition: all 1.1s 0.4s ease;
}

@keyframes pulse {
  0% { box-shadow: 0 0 20px rgba(242, 239, 136, 0.4); }
  50% { box-shadow: 0 0 40px rgba(242, 239, 136, 1); }
  100% { box-shadow: 0 0 20px rgba(242, 239, 136, 0.4); }
}

@-webkit-keyframes pulse {
  0% { box-shadow: 0 0 20px rgba(242, 239, 136, 0.4); }
  50% { box-shadow: 0 0 40px rgba(242, 239, 136, 1); }
  100% { box-shadow: 0 0 20px rgba(242, 239, 136, 0.4); }
}

.scenery-canvas.night .sun {
  bottom: calc(var(--scenery-sun-bottom, 0px) - 12rem);
  -webkit-transition: all 1.1s 0s ease;
  transition: all 1.1s 0s ease;
}

/* Mobile portrait: nudge individual hills to better match design */
@media (max-width: 599px) and (orientation: portrait) {
  .scenery-canvas {
    --scenery-sun-size: var(--scenery-sun-size-mobile, 10rem);
    --scenery-sun-bottom: var(--scenery-sun-bottom-mobile, 6rem);
  }

  .hills div:nth-child(1) { transform: translate(-138px, 12px); }
  .hills div:nth-child(3) { transform: translate(85px, 42px); }
  .hills div:nth-child(2) { transform: translate(-45px, 10px); }
  .hills div:nth-child(4) { transform: translate(220px, 14px); }

  .water {
    left: 0;
    width: 100%;
    bottom: 50px;
  }

  .moon {
    left: 150%;
  }

  .scenery-canvas.night .moon {
    left: 100%;
    top: -8%;
  }

  .rays {
    max-width: 2000px;
    max-height: 2000px;
  }

  .scene {
    bottom: var(--scenery-scene-bottom, var(--scenery-scene-bottom-mobile, -80px));
  }

  .scenery-canvas {
    --scenery-scene-bottom: var(--scenery-scene-bottom-mobile, -80px);
  }
}
</style>