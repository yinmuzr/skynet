<template>
  <div class="content-layout" v-if="currentFilterType">
    <SkynetFilterIcon :disabled="isLoading" @click="handleClickFilterIcon"/>
    <SkynetDropdownSelect
      v-model="currentFilterType.value"
      :options="filterOptions"
      @update="updateFilterType"
    />
    <span class="export-span-icon">
      <Button :disabled="shouldDisabledExportButton" icon="skynet-link" type="text" @click="exportData">导出Excel</Button>
      <Button icon="skynet-right" type="text" @click="navigateToDetails">查看详表</Button>
    </span>
    <SkynetLoadable :showLoading="isLoading">
      <SkynetInspectionTable :shouldSpanRow="isInspector"
                       :noBorderColumns="noBorderColumns"
                       :rowSpanArr="rowSpanArr"
                       :colSpan="1"
                       :columns="currentColumns"
                       :data="tableData"
                       :clickRow="navigateToDetailsByClickRow"/>
      <SkynetPagination v-if="total" :total="total" :current="currentPage"
                        :pageSize="pageSize" :onChange="changePage" />
    </SkynetLoadable>
    <SkynetFilterModal
      :modalTitle="title"
      :shouldShow.sync="showFilterModal"
      :type="currentFilterType"
      :inspectionType="currentInspectionType"
      :form="currentFilterForm"
      :submit="onSubmitModal"
      @ok="updateFilterForm"
    />
  </div>
</template>

<script>
  import {find, map} from 'lodash';
  import {mapActions, mapGetters, mapMutations, mapState} from 'vuex';
  import SkynetInspectionTable from '@/components/InspectionTable.vue';
  import SkynetDropdownSelect from '@/components/DropdownSelect.vue';
  import SkynetLoadable from '@/components/Loadable.vue';
  import SkynetFilterIcon from '@/components/FilterIcon.vue';
  import SkynetPagination from '@/components/Pagination';
  import SkynetFilterModal from '@/components/FilterModal.vue';
  import {
    GET_DATA_FULL_DATA,
    GET_DATA_SAMPLE_DATA,
    UPDATE_CURRENT_PAGE,
    UPDATE_INSPECTION_FILTER_TYPE,
    UPDATE_SAMPLE_FILTER_FORM,
  } from '@/store/report.module';
  import {UPDATE_FULL_DETAIL_FILTER_FORM, UPDATE_SAMPLE_DETAIL_FILTER_FORM,} from '@/store/report-details.module';
  import moment from 'moment';
  import {getToken} from '@/utils/auth';
  import {COLUMN_NAME_MAP, FILTER_MODAL_TITLE, NAVIGATE_PARAMETER_MAP, REPORT_FILTER_TYPE,} from '@/utils/constant';
  import {
    calRowSpanArray,
    getDefaultUnqualifiedReasons,
    getDefaultUnqualifiedTypeFilterConditions,
    getFullFilterList,
    getSampleFilterList,
    isFullInspectionType,
    isSampleInspectionType,
    parseRequestParms,
  } from '@/utils/util';

  const INSPECTOR_AND_MATERIAL_GROUP_DEMENSION_INDEX = 2;

export default {
  name: 'SkynetInspectionPanel',
  props: {
    inspectionType: {
      type: String,
    },
  },
  components: {
    SkynetInspectionTable,
    SkynetDropdownSelect,
    SkynetLoadable,
    SkynetFilterIcon,
    SkynetFilterModal,
    SkynetPagination,
  },
  computed: {
    ...mapState({
      currentPage: state => state.report.inspection.currentPage,
      pageSize: state => state.report.inspection.pageSize,
      cacheKey: state => state.report.inspection.cacheKey,
      currentInspectionType: state => state.report.inspection.currentInspectionType,
      shouldDisabledExportButton: state => state.report.inspection.shouldDisabledExportButton,
      currentColumns() {
        this.columns[0].title = this.columnNameMap.get(this.currentFilterType.dimension).title;
        this.columns[0].key = this.columnNameMap.get(this.currentFilterType.dimension).key;
        this.columns[3].title = isSampleInspectionType(this.currentInspectionType) ? '总批数' : '总数量';
        this.columns[4].title = isSampleInspectionType(this.currentInspectionType) ? '不合格批数' : '不合格数量';
        return this.currentFilterType.value === REPORT_FILTER_TYPE[INSPECTOR_AND_MATERIAL_GROUP_DEMENSION_INDEX].value ?
          this.columns.filter(item => item.forInspector) :
          this.columns.filter(item => item.forOther);
      },
    }),
    ...mapGetters({
      currentFilterDate: 'currentInspectionFilterDate',
      currentFilterForm: 'currentSampleFilterForm',
      filterParams: 'filterInspectionParams',
      tableData: 'statisticData',
      total: 'statisticTotal',
      isLoading: 'statisticIsLoading',
      currentFilterType: 'currentInspectionFilterType',
    }),
    rowSpanArr() {
      return calRowSpanArray(this.tableData, i =>
        this.tableData[i].materialGroupCode === this.tableData[i - 1].materialGroupCode);
    },
    filterOptions() {
      if (isSampleInspectionType(this.currentInspectionType)) {
        return getSampleFilterList();
      }
      if (isFullInspectionType(this.currentInspectionType)) {
        return getFullFilterList();
      }
      return [];
    },
    title() {
      if (isSampleInspectionType(this.currentInspectionType)) {
        return FILTER_MODAL_TITLE.SAMPLE;
      }
      if (isFullInspectionType(this.currentInspectionType)) {
        return FILTER_MODAL_TITLE.FULL;
      }
      return '';
    },
    isInspector() {
      return this.currentFilterType.value === REPORT_FILTER_TYPE[INSPECTOR_AND_MATERIAL_GROUP_DEMENSION_INDEX].value;
    },
  },
  data() {
    return {
      navigateParamMap: NAVIGATE_PARAMETER_MAP,
      showFilterModal: false,
      columnNameMap: COLUMN_NAME_MAP,
      noBorderColumns: ['A', 'B', 'C', 'D', 'E'],
      columns: [
        {
          title: '供应商',
          key: 'vendor',
          width: '20%',
          forInspector: true,
          forOther: true,
        },
        {
          title: '检验员',
          key: 'inspector',
          width: '20%',
          forInspector: true,
        },
        {
          title: '合格率',
          key: 'qualificationRate',
          width: '20%',
          forInspector: true,
          forOther: true,
        },
        {
          title: '总批数',
          key: 'totalBatches',
          width: '8%',
          forInspector: true,
          forOther: true,
        },
        {
          title: '不合格批数',
          key: 'unqualifiedBatches',
          width: '9%',
          forInspector: true,
          forOther: true,
        },
        {
          title: '不合格类别',
          align: 'right',
          width: '9%',
          forInspector: true,
          forOther: true,
        },
        {
          title: 'A',
          width: '6%',
          key: 'unqualifiedBatchesA',
          forInspector: true,
          forOther: true,
        },
        {
          title: 'B',
          width: '6%',
          key: 'unqualifiedBatchesB',
          forInspector: true,
          forOther: true,
        },
        {
          title: 'C',
          width: '6%',
          key: 'unqualifiedBatchesC',
          forInspector: true,
          forOther: true,
        },
        {
          title: 'D',
          width: '6%',
          key: 'unqualifiedBatchesD',
          forInspector: true,
          forOther: true,
        },
        {
          title: 'E',
          width: '6%',
          key: 'unqualifiedBatchesE',
          forInspector: true,
          forOther: true,
        },
      ],
    };
  },
  methods: {
    ...mapActions({
      getSampleData: GET_DATA_SAMPLE_DATA,
      getFullData: GET_DATA_FULL_DATA,
    }),
    ...mapMutations({
      updateCurrentFilterType: UPDATE_INSPECTION_FILTER_TYPE,
      updateFilterForm: UPDATE_SAMPLE_FILTER_FORM,
      updateDetailFilterForm: UPDATE_SAMPLE_DETAIL_FILTER_FORM,
      updateFullFilterForm: UPDATE_FULL_DETAIL_FILTER_FORM,
      updateCurrentPage: UPDATE_CURRENT_PAGE,
    }),
    recentUpdateFilterForm() {
      if (isFullInspectionType(this.currentInspectionType)) {
        return this.updateFullFilterForm;
      }
      return this.updateDetailFilterForm;
    },
    changePage(pageNumber) {
      this.updateCurrentPage(({ pageNum: pageNumber }));
      this.loadData();
    },
    handleClickFilterIcon() {
      this.showFilterModal = true;
    },
    updateFilterType(value) {
      if (this.currentFilterType.value === value || this.isLoading) {
        return;
      }
      const foundFilterType = find(
        REPORT_FILTER_TYPE,
        item => item.value === value,
      );
      this.updateCurrentFilterType({ type: foundFilterType });
    },
    onSubmitModal() {
      this.updateCurrentPage(({ pageNum: 1 }));
    },
    getData(conditions) {
      if (isSampleInspectionType(this.currentInspectionType)) {
        this.getSampleData(conditions);
      }
      if (isFullInspectionType(this.currentInspectionType)) {
        this.getFullData(conditions);
      }
    },
    loadData() {
      const conditions = {
        ...this.filterParams,
        pagination: {
          limit: this.pageSize,
          offset: (this.currentPage - 1) * this.pageSize,
        },
      };
      this.getData(conditions);
    },
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD');
    },
    exportData() {
      const token = getToken();
      const sampleFilterData = {
        ...this.filterParams,
        inspectionType: this.currentFilterType.inspectionType,
        cacheKey: this.cacheKey,
      };
      const queryString = parseRequestParms(sampleFilterData);

      window.location.href =
        `/api/reports/export-data?token=${token}&${queryString}`;
    },
    navigateToDetails() {
      this.recentUpdateFilterForm()({
        filterForm: {
          date: this.currentFilterForm.date,
          vendors: this.currentFilterForm.vendors,
          materialGroups: this.currentFilterForm.materialGroups,
          inspectors: this.currentFilterForm.inspectors,
          materials: [],
          unqualifiedReasons: isFullInspectionType(this.currentInspectionType) ?
            getDefaultUnqualifiedReasons() : [],
          unqualifiedTypes: isFullInspectionType(this.currentInspectionType) ?
            getDefaultUnqualifiedTypeFilterConditions() : [],
        },
      });
      if ((isSampleInspectionType(this.currentInspectionType))) {
        this.$router.push({ name: 'data-sample-inspection-details' });
      } else if (isFullInspectionType(this.currentInspectionType)) {
        this.$router.push({ name: 'data-full-inspection-details' });
      }
    },
    // eslint-disable-next-line
    spanMaterialGroup({row, column, rowIndex, columnIndex}) {
      if (columnIndex === 0) {
        const rowSpan = this.spanArr[rowIndex];
        const colSpan = rowSpan > 0 ? 1 : 0;
        return [rowSpan, colSpan];
      }
    },
    navigateToDetailsByClickRow(row) {
      this.recentUpdateFilterForm()({
        filterForm: {
          date: this.currentFilterDate,
          vendors: this.getNavigateParam(row, this.navigateParamMap.vendor),
          materialGroups: this.getNavigateParam(row, this.navigateParamMap.materialGroup),
          inspectors: this.getNavigateParam(row, this.navigateParamMap.inspector),
          materials: [],
          unqualifiedReasons: isFullInspectionType(this.currentInspectionType) ?
            getDefaultUnqualifiedReasons() : [],
          unqualifiedTypes: isFullInspectionType(this.currentInspectionType) ?
            getDefaultUnqualifiedTypeFilterConditions() : [],
        },
      });
      if (isFullInspectionType(this.currentInspectionType)) {
        this.$router.push({ name: 'data-full-inspection-details' });
        return;
      }
      this.$router.push({ name: 'data-sample-inspection-details' });
    },
    getNavigateParam(row, obj) {
      if (row[obj.code]) {
        return [{ name: row[obj.name], code: row[obj.code] }];
      }
      return map(this.currentFilterForm[obj.plural], item => ({ ...item }));
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/var.scss';

.export-span-icon {
  float: right;
  font-size: 14px;
  margin-right: 13px;
}

.ivu-btn-text {
  letter-spacing: 2px;
  font-size: 14px;
}
</style>
<style lang="scss">
.ivu-btn {
  .ivu-icon-skynet-link,
  .ivu-icon-skynet-right {
    vertical-align: bottom;
    font-size: 22px;
    color: #3977fc;
  }
}
</style>
