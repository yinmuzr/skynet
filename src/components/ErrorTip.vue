<template>
  <div class="error-tip" v-if="shouldShow">
          {{ errorMessage || '发生错误，提交失败' }}
  </div>
</template>

<script>
export default {
  name: 'SkynetErrorTip',
  data() {
    return {
      shouldShow: true,
      errorMessage: '',
    };
  },
  created() {
    setTimeout(() => {
      this.shouldShow = false;
    }, 2000);
  },
};
</script>


<style lang="scss" scoped>
  @import "@/styles/var.scss";
.error-tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 10px;
  border-radius: 4px;
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  font-size: $--common-font-size;
  height: 40px;
  line-height: 40px;
}
</style>
