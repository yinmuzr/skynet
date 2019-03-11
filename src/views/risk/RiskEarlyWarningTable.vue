<template>
  <div>
    <SkynetLoadable :showLoading="summaryIsLoading">
      <div class="summary-container">
        <div class="summary-content">
          {{summaryContentText}}
        </div>
      </div>
    </SkynetLoadable>
    <SkynetLoadable :showLoading="isLoading">
      <div class="content-layout">
        <SkynetInspectionTable
          emptyTips=""
          :colSpan="4"
          :shouldSpanRow="true"
          :rowSpanArr="rowSpanArr"
          :columns="riskWarningItemColumn"
          :data="tableData"
          :clickRow="navigateToDetails">
        </SkynetInspectionTable>
        <SkynetPagination v-if="total" :total="total" :current="currentPage"
                          :pageSize="pageSize" :onChange="changePage" />
      </div>
    </SkynetLoadable>
  </div>
</template>

<script>
import SkynetPagination from '@/components/Pagination';
import moment from 'moment';
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex';
import SkynetInspectionTable from '@/components/InspectionTable.vue';
import SkynetLoadable from '@/components/Loadable.vue';
import { isEmpty, pick } from 'lodash';
import { calRowSpanArray } from '@/utils/util';
import {
  WARNING_DATE_OFFSET_MAP,
  INSPECTION_TYPE_MAP_REVERSE,
  EARLY_WARNING_TYPE,
  START_DATE_OFFSET,
  INSPECTION_TYPES,
  INSPECTION_TYPE_MAP,
} from '@/utils/constant';
import { GET_RISK_WARNING_DATA, UPDATE_RISK_WARNING_CURRENT_PAGE } from '@/store/risk-warning-report.module';
import { setEarlyWarningReadStatus } from '@/services/early-warning.service';

export default {
  name: 'RiskEarlyWarningTable',
  components: {
    SkynetPagination,
    SkynetInspectionTable,
    SkynetLoadable,
  },
  data() {
    return {
      warningDateOffsetMap: WARNING_DATE_OFFSET_MAP,
      riskWarningItemColumn: [
        {
          title: '预警时间',
          key: 'warningTime',
          width: '15%',
        },
        {
          title: '检验类型',
          key: 'inspectionType',
          width: '10%',
        },
        {
          title: '物料组',
          key: 'materialGroup',
          width: '15%',
        },
        {
          title: '供应商',
          key: 'vendor',
          width: '15%',
        },
        {
          title: '预警原因',
          key: 'warningReason',
          width: '45%',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      summaryData: state => state.riskWarning.summary.list,
      pageSize: state => state.riskWarning.filterForm.pageSize,
      currentPage: state => state.riskWarning.filterForm.currentPage,
      isLoading: state => state.riskWarning.table.isLoading,
      summaryIsLoading: state => state.riskWarning.summary.isLoading,
      riskWarningDatas: state => state.riskWarning.table.list,
      currentSelectedMenuTag: state => WARNING_DATE_OFFSET_MAP[state.riskWarning.filterForm.date],
      currentBaseCode: state => state.auth.currentBaseCode,
    }),
    ...mapGetters({
      filterParams: 'filterRiskWarningParams',
    }),
    tableData() {
      return this.riskWarningDatas;
    },
    summaryContentText() {
      if (isEmpty(this.tableData)) {
        return `与您相关的物料组${this.currentSelectedMenuTag.word}无风险预警数据`;
      }
      return `以下为您相关物料组${this.currentSelectedMenuTag.word}的风险预警数据，点击某一条原因查看您管辖物料所产生的数据`;
    },
    rowSpanArr() {
      return calRowSpanArray(this.tableData, i =>
        this.tableData[i].warningTime === this.tableData[i - 1].warningTime &&
        this.tableData[i].inspectionType === this.tableData[i - 1].inspectionType &&
        this.tableData[i].vendor === this.tableData[i - 1].vendor &&
        this.tableData[i].materialGroup === this.tableData[i - 1].materialGroup);
    },
    total() {
      return isEmpty(this.summaryData[-this.currentSelectedMenuTag.offset]) ? 0
        : this.summaryData[-this.currentSelectedMenuTag.offset].count;
    },
  },
  methods: {
    ...mapMutations({
      updateCurrentPage: UPDATE_RISK_WARNING_CURRENT_PAGE,
    }),
    ...mapActions({
      getRiskWarningData: GET_RISK_WARNING_DATA,
    }),
    changePage(pageNumber) {
      this.updateCurrentPage(({ pageNum: pageNumber }));
    },
    navigateToDetails(row) {
      const riskDetailFilterParams = {
        privilegedBaseCodes: [row.baseCode],
        startDate: moment(row.warningTime).add(-1, START_DATE_OFFSET[row.period]).toISOString(),
        endDate: moment(row.warningTime).toISOString(),
        inspectionType: INSPECTION_TYPE_MAP_REVERSE[row.inspectionType],
        earlyWarningType: row.warningType,
        materialGroupCode: row.materialGroupCode,
        vendorCode: row.vendorCode,
        inspectionConclusion: this.getInspectionConclusionParam(row),
        unqualifiedTypes: this.getUnqualifiedTypesParam(row),
        unqualifiedReasonCodes: this.getUnqualifiedReasonsParam(row).codes,
        unqualifiedReasonNames: this.getUnqualifiedReasonsParam(row).names,
      };

      this.markReadStatus(row);
      this.$router.push({
        name: 'risk-entrance-details',
        query: riskDetailFilterParams,
      });
    },
    markReadStatus(row) {
      if (!row.read) {
        setEarlyWarningReadStatus({
          ...pick(row, ['baseCode', 'materialGroupCode', 'vendorCode', 'warningType']),
          warningTime: moment(row.warningTime).toISOString(),
          inspectionType: INSPECTION_TYPE_MAP_REVERSE[row.inspectionType],
        });
      }
    },
    getInspectionConclusionParam(row) {
      return row.warningType === EARLY_WARNING_TYPE.QUALIFIED_RATE ||
        row.inspectionType === INSPECTION_TYPE_MAP[INSPECTION_TYPES.FULL.inspectionType] ? '' : '不合格';
    },
    getUnqualifiedTypesParam(row) {
      if (row.warningType === EARLY_WARNING_TYPE.UNQUALIFIED_TYPE) {
        return row.warningReason.match(/[A-Z]/g);
      }
      return [];
    },
    getUnqualifiedReasonsParam(row) {
      if (row.warningType === EARLY_WARNING_TYPE.UNQUALIFIED_REASON) {
        // eslint-disable-next-line
        const tempReasons = row.warningReason.replace(/\(/g, '、').replace(/\)/g, '、').split('、');
        const unqualifiedReasonCodes = [];
        const unqualifiedReasonNames = [];
        tempReasons.forEach((reason, index) => {
          if (index % 5 === 0) {
            unqualifiedReasonNames.push(reason);
          } else if (index % 5 === 1) {
            unqualifiedReasonCodes.push(reason);
          }
        });
        return {
          codes: unqualifiedReasonCodes,
          names: unqualifiedReasonNames,
        };
      }
      return [];
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "@/styles/var.scss";
  .ivu-btn-text {
    letter-spacing: 2px;
    font-size: 14px;
    color: #4a4f5d;
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
