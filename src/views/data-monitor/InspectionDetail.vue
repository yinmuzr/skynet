<template>
  <div>
    <SkynetNavigatorBar :title="title" :backRouter="backRouter">
      <div class="export-span-icon">
        <Button :disabled="shouldDisabledExportButton" icon="skynet-link"
          type="text" @click="exportData">导出Excel</Button>
      </div>
    </SkynetNavigatorBar>
    <div class="content-layout">
      <SkynetLoadable :showLoading="isLoading">
        <SkynetFilterIcon :disabled="isLoading" @click="handleClickFilterIcon" class="detail-filter-icon"/>
        <SkynetDetailTable :tableData="tableData"
                           :inspectionType="currentInspectionType"/>
        <SkynetPagination v-if="total" :total="total" :current="currentPage"
                          :pageSize="pageSize" :onChange="changePage" />
      </SkynetLoadable>
      <SkynetSampleInspectionDetailFilterModal
        v-if="shouldShowSampleInspectionFilterComponent"
        modalTitle="抽检详表筛选条件"
        :shouldShow.sync="showFilterModal"
        :form="filterForm"
        :submit="onModalSubmit"
        @ok="recentUpdateFilterForm"
    />
      <SkynetFilterModal
        v-if="shouldShowFullInspectionFilterComponent"
        modalTitle="全检详表筛选条件"
        :shouldShow.sync="showFilterModal"
        :type="filterType"
        :inspectionType="currentInspectionType"
        :form="filterForm"
        :submit="onModalSubmit"
        @ok="recentUpdateFilterForm"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
import SkynetFilterModal from '@/components/FilterModal.vue';
import SkynetNavigatorBar from '@/components/NavigatorBar.vue';
import SkynetLoadable from '@/components/Loadable.vue';
import SkynetDetailTable from '@/components/DetailTable.vue';
import SkynetPagination from '@/components/Pagination';
import tableExtension from '@/mixins/tableExtension';
import {
  GET_SAMPLE_DETAILS,
  GET_FULL_DETAILS,
  RESET_SAMPLE_DETAILS_STATE,
  UPDATE_FULL_DETAIL_FILTER_FORM,
  UPDATE_SAMPLE_DETAIL_FILTER_FORM,
  RESET_FULL_DETAILS_STATE,
  UPDATE_DISABLED_STATUS,
} from '@/store/report-details.module';
import {
  PAGE_SIZE, DATA_ENTRANCE_MENU_NAME, FULL_DETAIL_FILTER_TIP,
  INSPECTION_TYPES,
} from '@/utils/constant';
import SkynetFilterIcon from '@/components/FilterIcon.vue';
import SkynetSampleInspectionDetailFilterModal
  from '@/components/data/sample/detail/SampleInspectionDetailFilterModal.vue';
import { getToken } from '@/utils/auth';
import {
  buildBaseOption,
  isSampleInspectionType,
  isFullInspectionType,
  parseRequestParms,
} from '@/utils/util';
import { UPDATE_INSPECTION_TYPE } from '@/store/report.module';

export default {
  name: 'SkynetInspectionDetail',
  components: {
    SkynetNavigatorBar,
    SkynetLoadable,
    SkynetDetailTable,
    SkynetFilterIcon,
    SkynetSampleInspectionDetailFilterModal,
    SkynetFilterModal,
    SkynetPagination,
  },
  mixins: [tableExtension],
  data() {
    return {
      filterType: FULL_DETAIL_FILTER_TIP,
      currentPage: 1,
      pageSize: PAGE_SIZE,
      showFilterModal: false,
    };
  },
  computed: {
    ...mapState({
      shouldDisabledExportButton: state => state.reportDetails.shouldDisabledExportButton,
      sampleTableData: state => state.reportDetails.sample.list,
      fullTableData: state => state.reportDetails.full.list,
      sampleIsLoading: state => state.reportDetails.sample.isLoading,
      fullIsLoading: state => state.reportDetails.full.isLoading,
      sampleTotal: state => state.reportDetails.sample.total,
      fullTotal: state => state.reportDetails.full.total,
      filterForm: state => (isSampleInspectionType(state.report.inspection.currentInspectionType) ?
        state.reportDetails.sample.filterForm : state.reportDetails.full.filterForm),
      currentInspectionType: state => state.report.inspection.currentInspectionType,
      currentBaseCode: state => state.auth.currentBaseCode,
      baseMapping: state => state.organizations.mappings,
    }),
    ...mapGetters({
      filterParams: 'filterSampleDetailParams',
      fullFilterParams: 'filterFullDetailParams',
    }),
    shouldShowSampleInspectionFilterComponent() {
      return isSampleInspectionType(this.currentInspectionType);
    },
    shouldShowFullInspectionFilterComponent() {
      return isFullInspectionType(this.currentInspectionType);
    },
    recentUpdateFilterForm() {
      if (isFullInspectionType(this.currentInspectionType)) {
        return this.updateFullFilterForm;
      }
      return this.updateFilterForm;
    },
    title() {
      return `${this.chooseValueByInspectionType('入厂检验数据抽检详表', '入厂检验数据全检详表', '')
      }-${buildBaseOption(this.currentBaseCode, this.baseMapping).text}`;
    },
    isLoading() {
      return this.chooseValueByInspectionType(this.sampleIsLoading, this.fullIsLoading, false);
    },
    tableData() {
      return this.chooseValueByInspectionType(this.sampleTableData, this.fullTableData, []);
    },
    backRouter() {
      return { name: this.chooseValueByInspectionType('data-sample-inspection', 'data-full-inspection', '') };
    },
    total() {
      return this.chooseValueByInspectionType(this.sampleTotal, this.fullTotal, null);
    },
  },
  watch: {
    currentInspectionType() {
      this.currentPage = 1;
      this.loadData();
    },
  },
  methods: {
    ...mapActions({
      getSampleDetails: GET_SAMPLE_DETAILS,
      getFullDetails: GET_FULL_DETAILS,
    }),
    ...mapMutations({
      resetSampleDetailsState: RESET_SAMPLE_DETAILS_STATE,
      resetFullDetailsState: RESET_FULL_DETAILS_STATE,
      updateFilterForm: UPDATE_SAMPLE_DETAIL_FILTER_FORM,
      updateFullFilterForm: UPDATE_FULL_DETAIL_FILTER_FORM,
      updateInspectionType: UPDATE_INSPECTION_TYPE,
      updateDisabledStatus: UPDATE_DISABLED_STATUS,
    }),
    chooseValueByInspectionType(sampleVal, fullVal, defaultVal) {
      if (isSampleInspectionType(this.currentInspectionType)) {
        return sampleVal;
      }
      if (isFullInspectionType(this.currentInspectionType)) {
        return fullVal;
      }
      return defaultVal;
    },
    handleClickFilterIcon() {
      this.showFilterModal = true;
    },
    onModalSubmit() {
      this.currentPage = 1;
      this.loadData();
    },
    loadData() {
      if (isSampleInspectionType(this.currentInspectionType)) {
        this.updateDisabledStatus(({ status: true }));
        this.getSampleDetails({
          ...this.filterParams,
          pagination: {
            limit: this.pageSize,
            offset: (this.currentPage - 1) * this.pageSize,
          },
        }).then(() => {
          this.updateDisabledStatus(({ status: false }));
        });
      }
      if (isFullInspectionType(this.currentInspectionType)) {
        this.updateDisabledStatus(({ status: true }));
        this.getFullDetails({
          ...this.fullFilterParams,
          pagination: {
            limit: this.pageSize,
            offset: (this.currentPage - 1) * this.pageSize,
          },
        }).then(() => {
          this.updateDisabledStatus(({ status: false }));
        });
      }
    },
    changePage(pageNumber) {
      this.currentPage = pageNumber;
      this.loadData();
    },
    exportData() {
      const token = getToken();
      const sampleFilterData = {
        ...(isSampleInspectionType(this.currentInspectionType) ?
          this.filterParams : this.fullFilterParams),
        inspectionType: this.getInspectionType(),
      };

      const queryString = parseRequestParms(sampleFilterData);
      window.location.href =
        `/api/reports/export-data?token=${token}&${queryString}`;
    },
    getInspectionType() {
      if (isFullInspectionType(this.currentInspectionType)) {
        return INSPECTION_TYPES.FULL.inspectionType;
      }
      if (isSampleInspectionType(this.currentInspectionType)) {
        return INSPECTION_TYPES.SAMPLE.inspectionType;
      }
      return null;
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (to.name.indexOf('sample') >= 0) {
        vm.updateInspectionType(({ type: DATA_ENTRANCE_MENU_NAME.SAMPLE }));
      } else if (to.name.indexOf('full') >= 0) {
        vm.updateInspectionType(({ type: DATA_ENTRANCE_MENU_NAME.FULL }));
      }
    });
  },
  created() {
    this.loadData();
  },
  destroyed() {
    this.resetSampleDetailsState();
    this.resetFullDetailsState();
  },
};
</script>

<style lang="scss" scoped>
.detail-filter-icon {
  top: 110px;
}

.export-span-icon {
  display: inline-block;
  float: right;
  margin-right: 60px;
  margin-top: 12px;
}
</style>

