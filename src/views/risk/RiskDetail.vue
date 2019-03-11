<template>
  <div>
    <SkynetNavigatorBar title="风险预警详表" :backRouter="backRouter">
      <div class="export-span-icon">
        <Button :disabled="isLoading" icon="skynet-link"
                type="text" @click="exportData">导出Excel</Button>
      </div>
    </SkynetNavigatorBar>
    <SkynetLoadable :showLoading="isLoading">
      <div class="summary-container">
        <div class="summary-content">
          {{ statistics }}
        </div>
      </div>
    </SkynetLoadable>
    <div class="content-layout">
      <SkynetLoadable :showLoading="isLoading">
        <SkynetDetailTable :tableData="tableData"
                           :inspectionType="currentInspectionType"
                           emptyTips=""/>
        <SkynetPagination v-if="total" :total="total" :current="currentPage"
                          :pageSize="pageSize" :onChange="changePage" />
      </SkynetLoadable>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import SkynetNavigatorBar from '@/components/NavigatorBar.vue';
import SkynetLoadable from '@/components/Loadable.vue';
import SkynetPagination from '@/components/Pagination';
import SkynetDetailTable from '@/components/DetailTable.vue';
import { PAGE_SIZE, WARNING_DATE_OFFSET_MAP } from '@/utils/constant';
import {
  GET_RISK_DETAILS,
  RESET_RISK_DETAILS_STATE,
} from '@/store/risk-details.module';
import { parseRequestParms, isInspectionType } from '@/utils/util';
import { getToken } from '@/utils/auth';

export default {
  name: 'SkynetRiskDetail',
  components: {
    SkynetNavigatorBar,
    SkynetLoadable,
    SkynetDetailTable,
    SkynetPagination,
  },
  props: {
    date: {
      type: String,
      default: '',
    },
    filterParams: {
      type: Object,
      default: () => ({}),
    },
    currentInspectionType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      backRouter: WARNING_DATE_OFFSET_MAP.TODAY.router,
      currentPage: 1,
      pageSize: PAGE_SIZE,
    };
  },
  computed: {
    ...mapState({
      tableData: state => state.riskDetails.list,
      isLoading: state => state.riskDetails.isLoading,
      total: state => state.riskDetails.total,
      statistics: state => state.riskDetails.statistics,
    }),
  },
  methods: {
    ...mapActions({
      getRiskDetails: GET_RISK_DETAILS,
    }),
    ...mapMutations({
      resetRiskDetailsState: RESET_RISK_DETAILS_STATE,
    }),
    loadData() {
      if (isInspectionType(this.currentInspectionType)) {
        this.getRiskDetails({
          ...this.filterParams,
          pagination: {
            limit: this.pageSize,
            offset: (this.currentPage - 1) * this.pageSize,
          },
        });
      }
    },
    exportData() {
      const token = getToken();
      const queryString = parseRequestParms(this.filterParams);
      window.location.href =
        `/api/risk-warnings/export-detail-data?token=${token}&${queryString}`;
    },
    changePage(pageNumber) {
      this.currentPage = pageNumber;
      this.loadData();
    },
  },
  created() {
    if (!this.currentInspectionType) {
      this.$router.push(WARNING_DATE_OFFSET_MAP.TODAY.router);
    }

    this.backRouter = {
      name: 'risk-early-warning',
      params: { date: this.date },
    };

    this.loadData();
  },
  destroyed() {
    this.resetRiskDetailsState();
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/var.scss";
.export-span-icon {
  display: inline-block;
  float: right;
  margin-right: 60px;
  margin-top: 12px;
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
