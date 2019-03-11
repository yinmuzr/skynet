<template>
  <Card class="strategy-card">
    <div class="material-group" :title="title">
      {{ title }}</div>
    <div class="operation-buttons">
      <Icon v-if="this.hasEditAuthority"
            type="skynet-delete" class="operation-button icon"
            @click.native="onDeleteClick"/>
      <Icon v-if="this.hasEditAuthority"
            type="skynet-edit" class="operation-button icon"
            @click.native="onEditClick"/>
    </div>
    <Menu mode="horizontal" :active-name="currentType.menu" @on-select="handleOnChange">
      <MenuItem
        v-for="type in menuItems"
        :key="type.menu"
        :name="type.menu">
        {{ type.menu }}
      </MenuItem>
    </Menu>
    <div class="qualified-rate item">
      <p class="item-title">合格率&lt;=</p>
      <span class="item-desc">{{ qualifiedRateDesc }}</span>
    </div>
    <div v-if="!isFullInspection" class="unqualified-batches item">
      <p class="item-title">不合格批数&gt;=</p>
      <span class="item-desc">{{ unqualifiedBatchesDesc }}</span>
    </div>
    <div class="unqualified-type item">
      <p class="item-title">不合格类别</p>
      <span class="item-desc">{{ unqualifiedTypeDesc }}</span>
    </div>
    <div v-if="!isFullInspection" class="unqualified-reason item" :key="'nonFullInspection'">
      <p class="item-title">不合格原因项</p>
      <SkynetMultipleLineWithEllipsis class="item-desc" :text="unqualifiedReasonDesc" />
    </div>
    <div v-if="isFullInspection" class="unqualified-reason item" :key="'fullInspection'">
      <p class="item-title">不合格原因项</p>
      <SkynetMultipleLineWithEllipsis class="item-desc more-line" :text="unqualifiedReasonDesc" />
    </div>
  </Card>
</template>

<script>
import { isEmpty, find, filter } from 'lodash';
import { EARLY_WARNING_PERIOD, EARLY_WARNING_TYPE, INSPECTION_TYPES } from '@/utils/constant';
import SkynetMultipleLineWithEllipsis from '@/components/MultipleLineWithEllipsis';
import { SYS_AUTHORITIES } from '@/utils/auth';
import { mapGetters } from 'vuex';

export default {
  name: 'SkynetEarlyWarningStrategyCard',
  components: {
    SkynetMultipleLineWithEllipsis,
  },
  props: {
    strategy: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      menuItems: Object.values(INSPECTION_TYPES),
      currentType: INSPECTION_TYPES.SAMPLE,
      handleOnChange: (selectedMenu) => {
        this.currentType = this.menuItems.find(item => item.menu === selectedMenu);
      },
    };
  },
  computed: {
    title() {
      return `${this.strategy.materialGroupName}(${this.strategy.materialGroupCode})`;
    },
    ...mapGetters(['userHasAuthority', 'userHasMaterialGroupConfigAuth']),
    hasEditAuthority() {
      return this.userHasAuthority(SYS_AUTHORITIES.RISK_ENTRANCE_INSPECTION_CONFIGURABLE) &&
        this.userHasMaterialGroupConfigAuth(this.strategy.materialGroupCode);
    },
    currentItems() {
      return this.strategy.items.filter(item => item.inspectionType === this.currentType.inspectionType);
    },
    isFullInspection() {
      return this.currentType.inspectionType === INSPECTION_TYPES.FULL.inspectionType;
    },
    qualifiedRateDesc() {
      const qualifiedRateCriteria = find(this.currentItems, { warningType: EARLY_WARNING_TYPE.QUALIFIED_RATE });
      return qualifiedRateCriteria ?
        `${(qualifiedRateCriteria.threshold * 100).toFixed(2)}% ；${EARLY_WARNING_PERIOD[qualifiedRateCriteria.period]}`
        : '';
    },
    unqualifiedBatchesDesc() {
      const criteriaList = find(this.currentItems, { warningType: EARLY_WARNING_TYPE.UNQUALIFIED_BATCHES });
      return criteriaList ?
        `${criteriaList.threshold} ；${EARLY_WARNING_PERIOD[criteriaList.period]}`
        : '';
    },
    unqualifiedTypeDesc() {
      const criteriaList = filter(this.currentItems, { warningType: EARLY_WARNING_TYPE.UNQUALIFIED_TYPE });
      if (isEmpty(criteriaList)) {
        return '';
      }

      const unqualifiedTypeDesc = criteriaList
        .map(criteria => `${criteria.itemCode}>=${criteria.threshold}`)
        .join('、');

      return `${unqualifiedTypeDesc} ；${EARLY_WARNING_PERIOD[criteriaList[0].period]}`;
    },
    unqualifiedReasonDesc() {
      const criteriaList = filter(this.currentItems, { warningType: EARLY_WARNING_TYPE.UNQUALIFIED_REASON });
      if (isEmpty(criteriaList)) {
        return '';
      }

      const unqualifiedTypeDesc = criteriaList
        .map(criteria => `${criteria.itemName}(${criteria.itemCode})>=${criteria.threshold}`)
        .join('、');

      return `${unqualifiedTypeDesc} ；${EARLY_WARNING_PERIOD[criteriaList[0].period]}`;
    },
  },
  methods: {
    onDeleteClick() {
      this.$emit('handleDeleteStrategy', this.strategy);
    },
    onEditClick() {
      this.$emit('handleEditStrategy', this.strategy);
    },
  },
};
</script>

<style scoped lang="scss">
  @import '@/styles/var.scss';
  .strategy-card {
    width: 30%;
    margin: 20px 1.5%;
    display: inline-block;
    vertical-align: top;
    height: 340px;

    .ivu-menu-horizontal {
      height: 40px;
      line-height: 40px;
      padding-left: 10px;
      margin-bottom: 20px;
    }

    .ivu-menu-item {
      font-size: $--common-font-size;
      margin-right: 38px;
      letter-spacing: 0;
    }

    .material-group {
      font-size: $--common-font-size;
      font-weight: bold;
      margin: 14px 10px;
      letter-spacing: 1px;
      display: inline-block;
      max-width: 70%;
      text-overflow:ellipsis;
      white-space:nowrap;
      overflow: hidden;
    }

    .ivu-menu-horizontal.ivu-menu-light:after {
      height: 2px;
    }

    .item {
      margin: 10px 0;
      font-size: $--common-font-size;
      display: block;
      margin-left: -20px;
    }

    .item-title {
      width: 30%;
      color: $--color-text-secondary;
      text-align: right;
      display: inline-block;
      vertical-align: top;
    }

    .item-desc {
      display: inline-block;
      width: 70%;
      padding-left: 16px;
      max-height: 84px;
      overflow: hidden
    }

    .more-line {
      max-height: 105px;
    }

    .operation-buttons {
      display: inline-block;
      float: right;
      margin: 10px 0 10px 10px;
    }

    .operation-button {
      cursor: pointer;
      font-size: 22px;
      color: $--color-primary;
      margin-left: 14px;
    }

    .icon {
      font-size: 22px;
    }
  }

</style>
