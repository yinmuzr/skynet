<template>
  <div class="summary-container">
    <ul class="summary-content">
      <li class="summary-item">
        <span class="label">总{{spanTitle}}</span>
        <span class="value" v-undefinedLabel="getLabel(totalBatches)"/>
      </li>
      <li class="summary-item">
        <span class="label">不合格{{spanTitle}}</span>
        <span class="value" v-undefinedLabel="getLabel(unqualifiedBatches)"/>
      </li>
      <li class="summary-item -no-value">
        <span class="label">不合格类别</span>
      </li>
      <li class="summary-item -sub" v-for="batch in unqualifiedTypeBatches" :key="batch.type">
        <span class="label">{{ batch.type }}</span>
        <span class="value" v-undefinedLabel="getLabel(batch.value)"/>
      </li>
    </ul>
  </div>
</template>

<script>
import undefinedLabel from '@/directives/undefined-label';

export default {
  name: 'SkynetInspectionSummary',
  directives: {
    undefinedLabel,
  },
  props: {
    totalBatches: {
      type: [Number, String],
    },
    unqualifiedBatches: {
      type: [Number, String],
    },
    unqualifiedTypeBatches: {
      type: Array,
      default: () => [],
    },
    spanTitle: {
      type: String,
    },
  },
  computed: {
    showUndefinedLabel() {
      return !this.totalBatches;
    },
  },
  methods: {
    getLabel(value) {
      return this.showUndefinedLabel === true ? undefined : value;
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/styles/var.scss";
.summary-container {
  padding: 44px 0;
  background: $--color-secondary;
}
.summary-content {
  width: 90%;
  margin: 0 auto;
  overflow: hidden;
}
.summary-item {
  float: left;
  padding-right: 4%;

  &.-no-value {
    padding-right: 0;
  }

  &.-sub {
    padding-right: 50px;
    &:last-child {
      padding-right: 0;
    }
  }

  > .label {
    padding-right: 20px;
    font-size: 14px;
    color: $--color-text-secondary;
    line-height: 42px;
    vertical-align: top;
  }

  > .value {
    color: #000;
    font-size: 26px;
    font-weight: 600;
    letter-spacing: 2px;
    line-height: 42px;

    &.-empty {
      display: inline-block;
      margin-top: -3px;
      color: $--color-text-secondary;
    }
  }
}
</style>
