<template>
  <div class="navigator-bar-wrap">
    <div class="back-container" v-if="hasBack">
      <Button icon="skynet-back" type="text" @click="goBack">返回</Button>
    </div>
    <h3 class="title" :class="hasBack?'title-margin-with-back':'title-margin-without-back'">{{ title }}</h3>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'SkynetNavigatorBar',
  props: {
    title: {
      type: String,
      default: '标题',
    },
    hasBack: {
      type: Boolean,
      default: true,
    },
    backRouter: {
      type: Object,
    },
  },
  methods: {
    goBack() {
      this.$router.replace({ name: this.backRouter.name, params: this.backRouter.params });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/var.scss';

.navigator-bar-wrap {
      min-height: 63px;
  border-bottom: 1px solid $--navigator-border-color;

    > .title {
    display: inline-block;
    font-size: 16px;
    letter-spacing: 4px;
    margin-top: 15px;
  }

  .title-margin-with-back{
    margin-left:28px;
  }
   .title-margin-without-back{
    margin-left:55px;
  }
}

.ivu-btn-text {
  letter-spacing: 2px;
  font-size: 14px;
}

.back-container {
  padding: 12px 14px 12px 22px;
  display: inline-block;
  border-right: 1px solid $--navigator-border-color;
}
</style>

<style lang="scss">
.back-container {
  .ivu-icon-skynet-back {
    vertical-align: bottom;
    font-size: 22px;
    color: #3977fc;
  }
}
</style>
