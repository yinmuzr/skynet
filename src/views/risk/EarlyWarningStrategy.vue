<template>
<div class="strategy-page">
  <SkynetEarlyWarningStrategyList
    v-if="!isInEditPage"
    :date="date"
    @onEditStrategy="handleEditStrategy">
  </SkynetEarlyWarningStrategyList>
  <SkynetStrategyEdit v-else :currentStrategy="currentStrategy"
                      @onCancel="handleCancelEditStrategy"
                      @onOK="handleConfirmEditStrategy">
  </SkynetStrategyEdit>
</div>

</template>
<script>
import SkynetStrategyEdit from '@/components/risk/StrategyEdit.vue';
import SkynetEarlyWarningStrategyList from '@/components/risk/EarlyWarningStrategyList.vue';

export default {
  components: {
    SkynetStrategyEdit,
    SkynetEarlyWarningStrategyList,
  },
  props: {
    date: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isInEditPage: false,
      currentStrategy: {},
    };
  },
  methods: {
    handleConfirmEditStrategy() {
      this.isInEditPage = false;
    },
    handleEditStrategy(currentStrategy = {}) {
      this.isInEditPage = true;
      this.currentStrategy = currentStrategy;
    },
    handleCancelEditStrategy() {
      this.isInEditPage = false;
    },
  },
};
</script>

