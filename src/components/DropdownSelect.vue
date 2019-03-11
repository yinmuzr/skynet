<template>
  <Dropdown class="dropdown-wrap" @on-click="handleClick" trigger="click">
    <a href="javascript:void(0)" class="dropdown-label">
      {{ currentOption.label }}
      <Icon type="ios-arrow-down"></Icon>
    </a>
    <DropdownMenu slot="list">
      <DropdownItem
        v-for="item in options"
        :key="item.value"
        :selected="item.value === currentOption.value"
        :name="item.value">
        {{ item.label }}
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>
</template>

<script>
import { find } from 'lodash';

export default {
  name: 'SkynetDropdownSelect',
  props: {
    options: {
      type: Array,
      required: true,
    },
    value: {},
  },
  computed: {
    currentOption() {
      const currentOption = find(this.options, option => option.value === this.value);
      return currentOption || {};
    },
  },
  methods: {
    handleClick(name) {
      this.$emit('update', name);
    },
  },
};
</script>

<style lang="scss">
.dropdown-wrap {
  .ivu-select-dropdown {
    min-width: 100%;
  }
}
</style>


<style lang="scss" scoped>
@import "@/styles/var.scss";
.dropdown-wrap {
  position: relative;
  margin: 0 auto 25px 16px;
}
.dropdown-label {
  color: $--color-text-primary;
  font-size: 14px;
  letter-spacing: 2px;
}
</style>

