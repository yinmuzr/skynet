<template>
  <div class="filter-wrap" :class="{ '-disabled': disabled }" @click="handleClick">
    <Icon class="filter" type="skynet-filter"/>
    <span class="text">筛选</span>
  </div>
</template>

<script>
export default {
  name: 'SkynetFilterIcon',
  props: {
    disabled: {
      type: Boolean,
      disabled: false,
    },
  },
  methods: {
    handleClick() {
      if (this.disabled) {
        return;
      }
      this.$emit('click');
    },
  },
};
</script>

<style lang="scss" scoped>
$filter-size: 70px;

.filter-wrap {
  position: absolute;
  left: -$filter-size / 2;
  top: -$filter-size / 2;
  background: #f75a54;
  width: $filter-size;
  height: $filter-size;
  border-radius: 50%;
  box-shadow: 0 8px 18px 0 rgba(251, 119, 114, 0.4);
  text-align: center;
  color: #fff;
  cursor: pointer;
  z-index: 1000;

  &.-disabled {
    cursor: default;
    opacity: 0.8;
  }

  > .filter {
    display: block;
    font-size: 22px;
    margin-top: 14px;
  }
  > .text {
    display: block;
  }
}
</style>

