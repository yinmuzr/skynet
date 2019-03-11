<template>
  <Spin>
    <Icon type="ios-sync" size=18 class="spin-icon-load"></Icon>
    <div>Loading</div>
  </Spin>
</template>
<style lang="scss" scoped>
.spin-icon-load {
  animation: ani-spin 1s linear infinite;
}
@keyframes ani-spin {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

