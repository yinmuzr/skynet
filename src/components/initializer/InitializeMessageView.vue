<template>
  <div class="container">
    <img class="icon" src="../../assets/artboard@2x.png"/>
    <div class="info">{{ message }}</div>
  </div>
</template>

<script>
export default {
  name: 'SkynetInitializeMessageView',
  props: {
    message: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '@/styles/publicPageLayout.scss';
</style>
