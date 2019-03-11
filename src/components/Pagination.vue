<template>
  <div class="page-wrap">
    <Page show-total :total="total" :current="current" :page-size="pageSize" @on-change="onChange">
      <div class="total">
        <span>共计 </span>
        <span class="number">{{ total}}</span>
        <span> 条数据</span>
      </div>
    </Page>
  </div>
</template>

<script>
export default {
  name: 'SkynetPagination',
  props: {
    total: {
      type: Number,
      default: 1,
    },
    current: {
      type: Number,
      default: 0,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    onChange: {
      type: Function,
      default: () => {},
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/var.scss";

.page-wrap {
  margin-top: 36px;
  margin-bottom: 10px;
  overflow: hidden;

  .total {
    font-size: 16px;
    margin-right: 10px;
    .number {
      color: $--color-primary;
    }
  }
}

</style>
