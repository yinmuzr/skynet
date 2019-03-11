<template>
  <div>
    <SkynetLoading v-if="showLoading" class="loading"/>
    <transition name="fade">
      <div v-show="!showLoading">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script>
import SkynetLoading from '@/components/Loading.vue';

export default {
  name: 'SkynetLoadable',
  components: {
    SkynetLoading,
  },
  props: {
    showLoading: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.loading {
  padding: 30px 20px;
}
.fade-enter-active {
  transition: opacity .8s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
