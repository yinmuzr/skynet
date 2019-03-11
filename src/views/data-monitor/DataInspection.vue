<template>
  <div>
    <SkynetLoadable :showLoading="inspectionSummary.isLoading">
      <SkynetInspectionSummary
        :totalBatches="inspectionSummary.totalBatches"
        :unqualifiedBatches="inspectionSummary.unqualifiedBatches"
        :unqualifiedTypeBatches="inspectionSummary.unqualifiedTypeBatches"
        :spanTitle="spanTitle"
      />
    </SkynetLoadable>
    <SkynetInspectionPanel />
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters, mapMutations } from 'vuex';
import uuid from 'uuid/v4';
import SkynetInspectionSummary from '@/components/InspectionSummary.vue';
import SkynetInspectionPanel from '@/components/data/InspectionPanel.vue';
import SkynetLoadable from '@/components/Loadable.vue';
import {
  GET_DATA_SAMPLE_SUMMARY,
  GET_DATA_FULL_SUMMARY,
  GET_DATA_SAMPLE_DATA,
  GET_DATA_FULL_DATA,
  UPDATE_INSPECTION_CACHE_KEY,
  UPDATE_EXPORT_BUTTON_DISABLED_STATUS,
  UPDATE_CURRENT_PAGE,
} from '@/store/report.module';
import { DATA_ENTRANCE_MENU_NAME } from '@/utils/constant';
import { isSampleInspectionType, isFullInspectionType } from '@/utils/util';

export default {
  name: 'SkynetDataInspection',
  components: {
    SkynetInspectionSummary,
    SkynetInspectionPanel,
    SkynetLoadable,
  },
  computed: {
    ...mapState({
      currentInspectionType: state => state.report.inspection.currentInspectionType,
      currentPage: state => state.report.inspection.currentPage,
      pageSize: state => state.report.inspection.pageSize,
    }),
    ...mapGetters({
      filterParams: 'filterInspectionParams',
      inspectionSummary: 'inspectionSummary',
    }),
    spanTitle() {
      return DATA_ENTRANCE_MENU_NAME.SAMPLE === this.currentInspectionType ? '批数' : '数量';
    },
  },
  watch: {
    filterParams() {
      this.updateCurrentPage(({ pageNum: 1 }));
      this.loadData();
    },
  },
  methods: {
    ...mapActions({
      getSampleSummary: GET_DATA_SAMPLE_SUMMARY,
      getFullSummary: GET_DATA_FULL_SUMMARY,
      getSampleData: GET_DATA_SAMPLE_DATA,
      getFullData: GET_DATA_FULL_DATA,
    }),
    ...mapMutations({
      updateCacheKey: UPDATE_INSPECTION_CACHE_KEY,
      updateDisableStatus: UPDATE_EXPORT_BUTTON_DISABLED_STATUS,
      updateCurrentPage: UPDATE_CURRENT_PAGE,
    }),
    getData(conditions) {
      if (isSampleInspectionType(this.currentInspectionType)) {
        this.updateDisableStatus(({ status: true }));
        return this.getSampleData(conditions);
      }
      if (isFullInspectionType(this.currentInspectionType)) {
        this.updateDisableStatus(({ status: true }));
        return this.getFullData(conditions);
      }
      return null;
    },
    getSummary() {
      if (isSampleInspectionType(this.currentInspectionType)) {
        this.updateDisableStatus(({ status: false }));
        this.getSampleSummary(this.filterParams);
      }
      if (isFullInspectionType(this.currentInspectionType)) {
        this.updateDisableStatus(({ status: false }));
        this.getFullSummary(this.filterParams);
      }
    },
    loadData() {
      this.updateCacheKey(({ cacheKey: uuid() }));
      const conditions = {
        ...this.filterParams,
        pagination: {
          limit: this.pageSize,
          offset: (this.currentPage - 1) * this.pageSize,
        },
      };
      this.getData(conditions).then(() => {
        this.getSummary();
      });
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (from.name === 'data-sample-inspection-details' ||
          from.name === 'data-full-inspection-details') {
        vm.loadData();
      }
    });
  },
};
</script>
