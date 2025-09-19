<template>
<header>
<div class="logo">
<a href="#"><img src="../assets/daycounter-icon.svg" alt="Daycounter" height="44px" /></a>
</div>
<div class="options">
<button class="update-button" v-if="buttonDisplay" @click='clickUpdate()'>update</button>
</div>
</header>
</template>

<script>
export default {
  name: 'PageHeader',
  props: ["buttonDisplay"],
  data() {
    return {
    }
  },
  methods: {
		clickUpdate() {
			this.$emit('buttonClicked')
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

.options {
  float:right;
  padding-right:16px;
  width:200px;
}
</style>