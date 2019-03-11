<template>
  <div class="strategy-list">
    <SkynetNavigatorBar :title="title" :backRouter="backRouter">
      <SkynetBaseDropdown class="dropdown-container"/>
      <div class="navigator-extension">
        <Input v-model="searchWord" @on-enter="search" class="search-input" placeholder="输入物料组ID搜索"/>
        <Button v-if="hasStrategyEditAuthority"
                size="large" type="primary"
                class="add-button add-strategy-button"
                @click="handleAddStrategy">
          <Icon type="ios-add" class="add-button-icon"></Icon>
          新增策略
        </Button>
        <Button size="large" type="primary"
                class="add-button search-button"
                @click="search">
          <Icon type="ios-search" class="search-button-icon"></Icon>
          搜索
        </Button>
      </div>
    </SkynetNavigatorBar>
    <SkynetLoadable :show-loading="isLoading">
      <SkynetEmptyData v-if="shouldShowEmptyList" :tips="emptyTips"/>
      <div class="strategy-card-list">
        <SkynetEarlyWarningStrategyCard v-for="strategy in strategiesToShow"
                                    :key="strategy.id"
                                    :strategy="strategy"
                                    @handleDeleteStrategy="handleDeleteStrategy"
                                    @handleEditStrategy="handleEditStrategy"/>
      </div>
    </SkynetLoadable>
  </div>
</template>

<script>
import { isEmpty, filter, trim } from 'lodash';
import SkynetNavigatorBar from '@/components/NavigatorBar.vue';
import SkynetEarlyWarningStrategyCard from '@/components/risk/EarlyWarningStrategyCard.vue';
import SkynetLoadable from '@/components/Loadable.vue';
import SkynetBaseDropdown from '@/components/BaseDropdown.vue';
import formValidation from '@/mixins/formValidation';
import { getStrategies, deleteStrategy } from '@/services/early-warning.service';
import SkynetEmptyData from '@/components/EmptyData.vue';
import { mapGetters, mapState } from 'vuex';
import { SYS_AUTHORITIES } from '@/utils/auth';
import { WARNING_DATE_OFFSET_MAP } from '@/utils/constant';

export default {
  name: 'SkynetEarlyWarningStrategyList',
  components: {
    SkynetNavigatorBar,
    SkynetEarlyWarningStrategyCard,
    SkynetLoadable,
    SkynetEmptyData,
    SkynetBaseDropdown,
  },
  props: {
    date: {
      type: String,
      default: '',
    },
  },
  mixins: [formValidation],
  data() {
    return {
      title: '入厂检验风险策略',
      backRouter: WARNING_DATE_OFFSET_MAP.TODAY.router,
      strategies: [],
      isLoading: false,
      searchWord: null,
      filterMaterialGroupCode: null,
    };
  },
  computed: {
    ...mapState({
      currentBaseCode: state => state.auth.currentBaseCode,
    }),
    ...mapGetters(['userHasAuthority']),
    hasStrategyEditAuthority() {
      return this.userHasAuthority(SYS_AUTHORITIES.RISK_ENTRANCE_INSPECTION_CONFIGURABLE);
    },
    shouldShowEmptyList() {
      return isEmpty(this.strategiesToShow);
    },
    emptyTips() {
      if (!isEmpty(this.strategies) && this.shouldShowEmptyList) {
        return '没有找到与ID匹配的物料组策略，请准确输入物料组ID后重试';
      }

      return '';
    },
    strategiesToShow() {
      return isEmpty(this.filterMaterialGroupCode) ?
        this.strategies : filter(this.strategies, { materialGroupCode: this.filterMaterialGroupCode });
    },
  },
  watch: {
    currentBaseCode() {
      this.backRouter = WARNING_DATE_OFFSET_MAP.TODAY.router;
      this.loadStrategies();
    },
  },
  methods: {
    handleAddStrategy() {
      this.$emit('onEditStrategy');
    },
    handleEditStrategy(currentStrategy) {
      this.$emit('onEditStrategy', currentStrategy);
    },
    handleDeleteStrategy(currentStrategy) {
      this.$confirmModal.show({
        title: '确认删除',
        content: '确定删除本物料组的风险策略吗？',
        action: () => deleteStrategy(currentStrategy.id),
        onSuccess: () => {
          this.strategies = this.strategies.filter(i => i.id !== currentStrategy.id);
        },
        onFail: () => {
          this.showGlobalError();
        },
      });
    },
    search() {
      this.filterMaterialGroupCode = trim(this.searchWord);
    },
    loadStrategies() {
      this.isLoading = true;
      getStrategies(this.currentBaseCode).then((data) => {
        this.isLoading = false;
        this.strategies = data;
      }).catch(() => {
        this.strategies = [];
      }).finally(() => {
        this.isLoading = false;
      });
    },
  },
  created() {
    this.backRouter = {
      name: 'risk-early-warning',
      params: { date: this.date },
    };
    this.loadStrategies();
  },
};
</script>

<style lang="scss" scoped>
  @import '@/styles/common.scss';

  .navigator-extension {
    display: inline-block;
    margin-right: 30px;
    float: right;
    padding-top: 12px;

    .add-strategy-button {
      margin-right: 0;
    }

    .search-input {
      width: 220px;
      margin-right: -1px;
      height: 36px;
    }

    .search-button {
      width: 90px;
      margin: 0 20px 0 0;
      border-radius: 0 5px 5px 0;
      background-color: $--background-color-base;
      color: $--color-text-primary;
      border-color: $--navigator-border-color;
    }

    .search-button-icon {
      font-size: 16px;
      font-weight: 600;
    }
  }
</style>

<style lang="scss">
  @import "@/styles/var.scss";

  .search-input {
    .ivu-input {
      height: 36px;
      border-radius: 5px 0 0 5px;
    }
  }

  .navigator-extension {
    .add-strategy-button {
      margin-right: 0;
    }
  }

  .search-button-icon,.ivu-icon-ios-search:before {
    position: relative;
    top: -1px;
  }

  %dropdown-button-text {
    color: $--color-text-primary;
    font-size: $--common-font-size;
    letter-spacing: 2px;
  }

  .dropdown-container {
    display: inline-block;

    &.dropdown-button,
    .dropdown-button {
      @extend %dropdown-button-text;
    }
  }

</style>
