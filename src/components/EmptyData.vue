<template>
  <div class="empty-table">
    <div class="icon-wrap">
      <img src="../assets/empty.png" />
    </div>
    <h3 class="title">数据为空</h3>
    <p v-if="tips" class="description">{{tips}}</p>
  </div>
</template>

<script>
export default {
  name: 'SkynetEmptyData',
  props: {
    tips: String,
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/var.scss";

.empty-table {
  padding-top: 70px;
  padding-bottom: 130px;
  text-align: center;

  > .icon-wrap {
    display: inline-block;
    width: 194px;
    height: 194px;
    margin-bottom: 35px;
    > img {
      width: 100%;
      height: 100%;
    }
  }
  > .title {
    font-size: 16px;
    letter-spacing: 2px;
    margin-bottom: 20px;
  }
  > .description {
    font-size: 14px;
    letter-spacing: 1px;
  }
}
</style>

