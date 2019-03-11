<template>
  <p class="filter-title-tip">
    <span class="title">{{ title }}</span>
    <Tooltip max-width="210" placement="bottom" :transfer="true">
      <Icon class="tips-icon" type="skynet-exclamation-mark"/>
      <div slot="content">
        <p>筛选逻辑：</p>
        <ol>
          <li v-for="(item, index) in content" :key="index">{{ item }}</li>
        </ol>
      </div>
    </Tooltip>
  </p>
</template>

<script>
export default {
  name: 'SkynetFilterTitleTip',
  props: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/var.scss';

.filter-title-tip {
  padding: 0 13px 20px;

  > .title {
    letter-spacing: 2px;
  }

}
</style>

