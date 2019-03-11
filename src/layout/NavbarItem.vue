<template>
  <li :class="classes">
    <router-link v-if="to" class="link" :to="to">
      <slot/>
    </router-link>
    <slot v-else />
  </li>
</template>

<script>
export default {
  name: 'GreeNavbarItem',
  props: {
    type: {
      type: String,
      default: 'primary',
      validator(value) {
        return ['primary', 'secondary'].indexOf(value) !== -1;
      },
    },
    to: {
      type: String,
    },
  },
  computed: {
    classes() {
      return ['navbar-item', { '-secondary': this.type === 'secondary' }];
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/var.scss";
.navbar-item {
  float: left;
  text-align: center;
  font-size: 14px;
  > .link {
    display: block;
    width: 150px;
    padding: 0 15px;
    line-height: $--header-row-height;
    text-decoration: none;
    color: rgba($color: #fff, $alpha: 0.7);
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }

  > .router-link-active {
    color: #fff;
    background: #3b414d;
  }

  &.-secondary {
    > .link {
      color: rgba($color: #fff, $alpha: 0.7);
      line-height: $--header-subrow-height;
    }

    > .router-link-active {
      position: relative;
      color: #fff;
      &:after {
        content: '';
        position: absolute;
        height: 3px;
        width: 80px;
        bottom: 0;
        right: 35px;
        background: $--color-primary;
      }
    }
  }
}
</style>
