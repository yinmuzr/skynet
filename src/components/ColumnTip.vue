<template>
  <div class="table-column" :title="title" v-undefinedLabel="$options.filters.formatBool(title)" />
</template>

<script>
import { isBoolean } from 'lodash';
import undefinedLabel from '@/directives/undefined-label';

export default {
  name: 'SkynetColumnTip',
  directives: {
    undefinedLabel,
  },
  filters: {
    formatBool(value) {
      if (!isBoolean(value)) { return value; }
      return value ? '是' : '否';
    },
  },
  props: {
    title: [String, Number, Boolean],
  },
};
</script>

<style lang="scss" >
.table-column{
  white-space: nowrap;
  display: inline-block;

  &.-empty {
    font-size: 30px;
    opacity: 0.7;
    font-weight: 200;
  }
}
</style>
