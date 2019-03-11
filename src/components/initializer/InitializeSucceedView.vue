<template>
  <div class="container">
    <Icon class="success" type="md-checkmark" />
    <div class="info">{{ `超级管理员"${superUser}"配置成功！` }}</div>
    <div class="info">
      <router-link class="info" to="/">进入天网首页</router-link>
    </div>
  </div>
</template>

<script>

export default {
  name: 'SkynetInitializeSucceedView',
  props: {
    superUser: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '@/styles/publicPageLayout.scss';

  .success {
    font-size: 60px;
    color: white;
    background-color: #7fd320;
    width: 120px;
    height: 120px;
    line-height: 120px;
    border-radius: 60px;
  }
</style>
