<template>
  <div>
    <Menu ref="RiskWarningDateSelected" mode="horizontal"
          :active-name="filterFormDate">
      <MenuItem
        v-for="menuItem in currentSummary"
        :key="menuItem.key"
        :name="menuItem.key"
        :to="menuItem.router">
        {{menuItem.label}}
      </MenuItem>
      <div class="export-span-icon">
        <Button :disabled="isLoading" icon="skynet-link" type="text" @click="exportData">导出Excel</Button>
        <Button icon="skynet-config" type="text" @click="navigateToStrategies">风险预警策略</Button>
      </div>
    </Menu>
    <router-view/>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { isEmpty } from 'lodash';
import moment from 'moment';
import {
  buildBaseOption,
  mapToRiskWarningSummary,
  getWarningDateRange,
  parseRequestParms,
  buildCondition,
} from '@/utils/util';
import { WARNING_DATE_OFFSET_MAP } from '@/utils/constant';
import {
  GET_RISK_WARNING_DATA,
  GET_RISK_WARNING_SUMMARY,
  UPDATE_RISK_WARNING_DATA,
  UPDATE_RISK_WARNING_CURRENT_PAGE,
} from '@/store/risk-warning-report.module';
import { getToken } from '@/utils/auth';

export default {
  watch: {
    currentBaseCode() {
      this.loadSummary();
      this.updateCurrentPage(({ pageNum: 1 }));
      const dateRange = getWarningDateRange(this.filterFormDate);
      const conditions = buildCondition(this.currentBaseCode, dateRange);
      this.loadData(conditions);
    },
    currentPage(newPage) {
      const dateRange = getWarningDateRange(this.filterFormDate);
      const conditions = buildCondition(this.currentBaseCode, dateRange, newPage);
      this.loadData(conditions);
    },
  },
  data() {
    return {
      warningDateOffsetMap: WARNING_DATE_OFFSET_MAP,
    };
  },
  computed: {
    ...mapState({
      currentPage: state => state.riskWarning.filterForm.currentPage,
      summaryData: state => state.riskWarning.summary.list,
      summaryIsLoading: state => state.riskWarning.summary.isLoading,
      isLoading: state => state.riskWarning.table.isLoading,
      filterForm: state => state.riskWarning.filterForm,
      currentBaseCode: state => state.auth.currentBaseCode,
      baseMapping: state => state.organizations.mappings,
      filterFormDate: state => state.riskWarning.filterForm.date,
    }),
    ...mapGetters({
      filterParams: 'filterRiskWarningParams',
    }),
    currentSummary() {
      if (isEmpty(this.summaryData) || this.summaryIsLoading) {
        return ['-', '-', '-'].map(mapToRiskWarningSummary);
      }
      return this.summaryData;
    },
  },
  methods: {
    ...mapMutations({
      updateCurrentPage: UPDATE_RISK_WARNING_CURRENT_PAGE,
      updateRiskWarningFilter: UPDATE_RISK_WARNING_DATA,
    }),
    ...mapActions({
      getRiskWarningData: GET_RISK_WARNING_DATA,
      getRiskWarningSummary: GET_RISK_WARNING_SUMMARY,
    }),
    loadSummary() {
      const summaryDateRange = getWarningDateRange(WARNING_DATE_OFFSET_MAP.TODAY.key);
      this.getRiskWarningSummary(buildCondition(this.currentBaseCode, summaryDateRange));
    },
    exportData() {
      const token = getToken();
      const dateRange = getWarningDateRange(this.filterFormDate);
      const sampleFilterData = {
        startDate: moment(dateRange[0]).toISOString(),
        endDate: moment(dateRange[1]).toISOString(),
        baseCode: this.currentBaseCode,
        baseName: buildBaseOption(this.currentBaseCode, this.baseMapping).text,
      };
      const queryString = parseRequestParms(sampleFilterData);
      window.location.href =
        `/api/risk-warnings/export-data?token=${token}&${queryString}`;
    },
    loadData(conditions) {
      this.getRiskWarningData(conditions);
    },
    navigateToStrategies() {
      this.$router.push({ name: 'risk-entrance-strategies' });
    },
    handleRouteEnterOrUpdate(newRoute) {
      let dataType;
      if (newRoute.params.date === WARNING_DATE_OFFSET_MAP.TODAY.router.params.date) {
        dataType = WARNING_DATE_OFFSET_MAP.TODAY.key;
      } else if (newRoute.params.date === WARNING_DATE_OFFSET_MAP.YESTERDAY.router.params.date) {
        dataType = WARNING_DATE_OFFSET_MAP.YESTERDAY.key;
      } else if (newRoute.params.date === WARNING_DATE_OFFSET_MAP.THE_DAY_BEFORE_YESTERDAY.router.params.date) {
        dataType = WARNING_DATE_OFFSET_MAP.THE_DAY_BEFORE_YESTERDAY.key;
      }
      this.updateRiskWarningFilter({
        filterForm: {
          ...this.filterForm,
          date: dataType,
          currentPage: (dataType === this.filterFormDate) ? this.currentPage : 1,
        },
      });
      this.loadSummary();
      this.loadData(buildCondition(
        this.currentBaseCode,
        getWarningDateRange(dataType),
        (dataType === this.filterFormDate) ? this.currentPage : 1,
      ));
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.handleRouteEnterOrUpdate(to);
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.handleRouteEnterOrUpdate(to);
    next();
  },
};
</script>

<style lang="scss" scoped>
  @import "@/styles/var.scss";
  .export-span-icon {
    float: right;
    margin-right: 13px;
  }
  .ivu-btn-text {
    letter-spacing: 2px;
    font-size: 14px;
  }
  .summary-container {
    padding: 35px 0;
    background: $--color-secondary;
  }
  .summary-content {
    margin-left: 45px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 2px;
    color: #4a4f5d;
  }
</style>

<style lang="scss">
.ivu-icon-skynet-config {
  vertical-align: sub;
  font-size: 24px;
  color: #3977fc;
}
</style>
