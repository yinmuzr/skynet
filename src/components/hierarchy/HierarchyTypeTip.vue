<template>
  <Tooltip v-if="icon.type" :transfer="transfer" :content="icon.content">
    <Icon :type="icon.type" />
  </Tooltip>
  <span v-else/>
</template>

<script>
import { getHierarchyTypeOption } from '@/utils/util';

export default {
  name: 'SkynetHierarchyTypeTip',
  props: {
    hierarchyType: {
      type: String,
      required: true,
    },
    transfer: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    icon() {
      const hierarchyTypeOption = getHierarchyTypeOption(this.hierarchyType);
      return {
        type: hierarchyTypeOption.iconType,
        content: hierarchyTypeOption.label,
      };
    },
  },
};
</script>

<style lang="scss" scoped>

</style>

