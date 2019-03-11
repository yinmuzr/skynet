import { map, isNull } from 'lodash';
import {
  onRequest,
  onSuccess,
  onFailed,
  createAsyncAction,
} from '@/store/helper';
import { REPORT_FILTER_TYPE, PAGE_SIZE, INSPECTION_TYPES } from '@/utils/constant';
import {
  getDefaultDateRange,
  getDefaultUnqualifiedTypeFilterConditions,
  getDefaultUnqualifiedReasons,
  formatNameWithCode,
  isSampleInspectionType,
  isFullInspectionType,
  isSampleFilterType,
  isFullFilterType,
  limitTwoDecimal,
} from '@/utils/util';
import moment from 'moment';

export const GET_DATA_SAMPLE_SUMMARY = 'GET_DATA_SAMPLE_SUMMARY';
export const GET_DATA_SAMPLE_DATA = 'GET_DATA_SAMPLE_DATA';
export const GET_DATA_FULL_SUMMARY = 'GET_DATA_FULL_SUMMARY';
export const GET_DATA_FULL_DATA = 'GET_DATA_FULL_DATA';
export const UPDATE_INSPECTION_FILTER_TYPE = 'UPDATE_INSPECTION_FILTER_TYPE';
export const UPDATE_INSPECTION_TYPE = 'UPDATE_INSPECTION_TYPE';
export const UPDATE_SAMPLE_FILTER_FORM = 'UPDATE_SAMPLE_FILTER_FORM';
export const UPDATE_INSPECTION_CACHE_KEY = 'UPDATE_INSPECTION_CACHE_KEY';
export const UPDATE_EXPORT_BUTTON_DISABLED_STATUS = 'UPDATE_EXPORT_BUTTON_DISABLED_STATUS';
export const UPDATE_CURRENT_PAGE = 'UPDATE_CURRENT_PAGE';

const DEFAULT_DATA_SUMMARY = {
  totalBatches: undefined,
  unqualifiedBatches: undefined,
  unqualifiedTypeBatches: [
    { type: 'A', value: undefined },
    { type: 'B', value: undefined },
    { type: 'C', value: undefined },
    { type: 'D', value: undefined },
    { type: 'E', value: undefined },
  ],
};

const getSampleInspectionDefaultFilterForm = () => {
  const singleFilterForm = {
    date: getDefaultDateRange(),
    materialGroups: [],
    materials: [],
    vendors: [],
    inspectors: [],
    qualificationRate: null,
    unqualifiedBatches: null,
    unqualifiedTypes: getDefaultUnqualifiedTypeFilterConditions(),
    unqualifiedReasons: getDefaultUnqualifiedReasons(),
    inspectionConclusion: null,
  };
  return {
    [REPORT_FILTER_TYPE[0].value]: { ...singleFilterForm },
    [REPORT_FILTER_TYPE[1].value]: { ...singleFilterForm },
    [REPORT_FILTER_TYPE[2].value]: { ...singleFilterForm },
    [REPORT_FILTER_TYPE[3].value]: { ...singleFilterForm },
    [REPORT_FILTER_TYPE[4].value]: { ...singleFilterForm },
  };
};

const buildInspectionDataList = (dataList, type) =>
  dataList.map((item) => {
    const newItem = {
      ...item,
      vendor: formatNameWithCode({
        code: item.vendorCode,
        name: item.vendorName,
      }),
      materialGroup: formatNameWithCode({
        code: item.materialGroupCode,
        name: item.materialGroupName,
      }),
      inspector: formatNameWithCode({
        code: item.inspectorCode,
        name: item.inspectorName,
      }),
    };
    if (type === INSPECTION_TYPES.FULL.inspectionType) {
      newItem.totalBatches = limitTwoDecimal(item.totalBatches);
      newItem.unqualifiedBatches = limitTwoDecimal(item.unqualifiedBatches);
      newItem.unqualifiedBatchesA = limitTwoDecimal(item.unqualifiedBatchesA);
      newItem.unqualifiedBatchesB = limitTwoDecimal(item.unqualifiedBatchesB);
      newItem.unqualifiedBatchesC = limitTwoDecimal(item.unqualifiedBatchesC);
      newItem.unqualifiedBatchesD = limitTwoDecimal(item.unqualifiedBatchesD);
      newItem.unqualifiedBatchesE = limitTwoDecimal(item.unqualifiedBatchesE);
    }
    return newItem;
  });

export default {
  state: {
    inspection: {
      sample: {
        summary: {
          ...DEFAULT_DATA_SUMMARY,
          isLoading: true,
        },
        isLoading: true,
        list: [],
        total: 0,
      },
      full: {
        summary: {
          ...DEFAULT_DATA_SUMMARY,
          isLoading: true,
        },
        isLoading: true,
        list: [],
        total: 0,
      },
      currentFilterType: null,
      currentInspectionType: null,
      filterForm: getSampleInspectionDefaultFilterForm(),
      cacheKey: null,
      shouldDisabledExportButton: false,
      currentPage: 1,
      pageSize: PAGE_SIZE,
    },
  },
  getters: {
    currentInspectionFilterDate: (state, getters) => {
      const currentFilterForm = getters.currentSampleFilterForm;
      return [
        currentFilterForm.date[0],
        currentFilterForm.date[1],
      ];
    },
    currentInspectionFilterType: (state) => {
      const inspectionType = state.inspection.currentInspectionType;
      if (isNull(inspectionType)) { return null; }
      if (isNull(state.inspection.currentFilterType)) {
        const currentType = isSampleInspectionType(inspectionType) ? REPORT_FILTER_TYPE[0] : REPORT_FILTER_TYPE[3];
        state.inspection.currentFilterType = currentType;
        return currentType;
      }
      return state.inspection.currentFilterType;
    },
    currentSampleFilterForm: (state, getters) => {
      if (getters.currentInspectionFilterType == null) { return null; }
      return state.inspection.filterForm[getters.currentInspectionFilterType.value];
    },
    filterInspectionParams: (state, getters, rootState) => {
      const currentFilterForm = getters.currentSampleFilterForm;
      if (currentFilterForm == null) { return null; }
      return {
        dimension: getters.currentInspectionFilterType.dimension,
        startDate: moment(currentFilterForm.date[0]).toISOString(),
        endDate: moment(currentFilterForm.date[1]).toISOString(),
        materialGroupCodes: map(
          currentFilterForm.materialGroups,
          item => item.code,
        ),
        vendorCodes: map(currentFilterForm.vendors, item => item.code),
        privilegedBaseCodes: [rootState.auth.currentBaseCode],
        qualificationRate: currentFilterForm.qualificationRate
          ? currentFilterForm.qualificationRate / 100
          : null,
        inspectorCodes: map(currentFilterForm.inspectors, item => item.code),
        unqualifiedBatches: currentFilterForm.unqualifiedBatches,
        /* eslint-disable no-param-reassign */
        unqualifiedTypes: currentFilterForm.unqualifiedTypes.reduce(
          (unqualifiedTypeMap, obj) => {
            if (obj.selected) {
              unqualifiedTypeMap[obj.selected] = obj.value;
            }
            return unqualifiedTypeMap;
          },
          {},
        ),
        unqualifiedReasons: currentFilterForm.unqualifiedReasons.reduce(
          (unqualifiedReasonMap, obj) => {
            if (obj.code) {
              unqualifiedReasonMap[obj.code] = obj.value;
            }
            return unqualifiedReasonMap;
          },
          {},
        ),
        /* eslint-enable no-param-reassign */
      };
    },
    statisticIsLoading: (state) => {
      if (isSampleInspectionType(state.inspection.currentInspectionType)) {
        return state.inspection.sample.isLoading;
      }
      if (isFullInspectionType(state.inspection.currentInspectionType)) {
        return state.inspection.full.isLoading;
      }
      return false;
    },
    statisticTotal: (state) => {
      if (isSampleInspectionType(state.inspection.currentInspectionType)) {
        return state.inspection.sample.total;
      }
      if (isFullInspectionType(state.inspection.currentInspectionType)) {
        return state.inspection.full.total;
      }
      return 0;
    },
    statisticData: (state) => {
      if (isSampleInspectionType(state.inspection.currentInspectionType)) {
        return state.inspection.sample.list;
      }
      if (isFullInspectionType(state.inspection.currentInspectionType)) {
        return state.inspection.full.list;
      }
      return null;
    },
    inspectionSummary: (state) => {
      if (isSampleInspectionType(state.inspection.currentInspectionType)) {
        return {
          ...state.inspection.sample.summary,
        };
      }
      if (isFullInspectionType(state.inspection.currentInspectionType)) {
        return {
          ...state.inspection.full.summary,
        };
      }
      return {
        ...DEFAULT_DATA_SUMMARY,
        isLoading: false,
      };
    },
  },
  mutations: {
    [onRequest(GET_DATA_SAMPLE_SUMMARY)]: (state) => {
      state.inspection.sample.summary = {
        ...DEFAULT_DATA_SUMMARY,
        isLoading: true,
      };
    },
    [onSuccess(GET_DATA_SAMPLE_SUMMARY)]: (state, { data }) => {
      if (data.totalBatches) {
        state.inspection.sample.summary = {
          ...data,
          isLoading: false,
        };
      } else {
        state.inspection.sample.summary = {
          ...DEFAULT_DATA_SUMMARY,
          isLoading: false,
        };
      }
    },
    [onFailed(GET_DATA_SAMPLE_SUMMARY)]: (state) => {
      state.inspection.sample.summary = {
        ...DEFAULT_DATA_SUMMARY,
        isLoading: true,
      };
    },
    [onRequest(GET_DATA_SAMPLE_DATA)]: (state) => {
      state.inspection.sample.isLoading = true;
    },
    [onSuccess(GET_DATA_SAMPLE_DATA)]: (state, { data }) => {
      state.inspection.sample.isLoading = false;
      state.inspection.sample.list = buildInspectionDataList(
        data.sampleDataList,
        INSPECTION_TYPES.SAMPLE.inspectionType,
      );
      state.inspection.sample.total = data.totalCount;
    },
    [onFailed(GET_DATA_SAMPLE_DATA)]: (state) => {
      state.inspection.sample.isLoading = true;
      state.inspection.sample.list = [];
      state.inspection.sample.total = 0;
    },
    [onRequest(GET_DATA_FULL_SUMMARY)]: (state) => {
      state.inspection.full.summary.isLoading = true;
      state.inspection.full.summary = {
        ...DEFAULT_DATA_SUMMARY,
        isLoading: true,
      };
    },
    [onSuccess(GET_DATA_FULL_SUMMARY)]: (state, { data }) => {
      if (data.totalBatches) {
        state.inspection.full.summary = {
          ...data,
          totalBatches: limitTwoDecimal(data.totalBatches),
          unqualifiedBatches: limitTwoDecimal(data.unqualifiedBatches),
          unqualifiedTypeBatches: data.unqualifiedTypeBatches.map(type => ({
            ...type,
            value: limitTwoDecimal(type.value),
          })),
          isLoading: false,
        };
      } else {
        state.inspection.full.summary = {
          ...DEFAULT_DATA_SUMMARY,
          isLoading: false,
        };
      }
    },
    [onFailed(GET_DATA_FULL_SUMMARY)]: (state) => {
      state.inspection.full.summary = {
        ...DEFAULT_DATA_SUMMARY,
        isLoading: true,
      };
    },
    [onRequest(GET_DATA_FULL_DATA)]: (state) => {
      state.inspection.full.isLoading = true;
    },
    [onSuccess(GET_DATA_FULL_DATA)]: (state, { data }) => {
      state.inspection.full.isLoading = false;
      state.inspection.full.list = buildInspectionDataList(
        data.fullDataList,
        INSPECTION_TYPES.FULL.inspectionType,
      );
      state.inspection.full.total = data.totalCount;
    },
    [onFailed(GET_DATA_FULL_DATA)]: (state) => {
      state.inspection.full.isLoading = true;
      state.inspection.full.list = [];
      state.inspection.full.total = 0;
    },
    [UPDATE_INSPECTION_FILTER_TYPE]: (state, { type }) => {
      state.inspection.currentFilterType = type;
    },
    [UPDATE_INSPECTION_TYPE]: (state, { type }) => {
      state.inspection.currentInspectionType = type;
      if (isSampleInspectionType(state.inspection.currentInspectionType)) {
        state.inspection = {
          ...state.inspection,
          currentFilterType: isNull(state.inspection.currentFilterType) ||
          !isSampleFilterType(state.inspection.currentFilterType)
            ? REPORT_FILTER_TYPE[0]
            : state.inspection.currentFilterType,
        };
      } else {
        state.inspection = {
          ...state.inspection,
          currentFilterType: isNull(state.inspection.currentFilterType) ||
          !isFullFilterType(state.inspection.currentFilterType)
            ? REPORT_FILTER_TYPE[3]
            : state.inspection.currentFilterType,
        };
      }
    },
    [UPDATE_SAMPLE_FILTER_FORM]: (state, { filterTypeValue, filterForm }) => {
      state.inspection.filterForm = {
        ...state.inspection.filterForm,
        [filterTypeValue]: filterForm,
      };
    },
    [UPDATE_INSPECTION_CACHE_KEY]: (state, { cacheKey }) => {
      state.inspection.cacheKey = cacheKey;
    },
    [UPDATE_EXPORT_BUTTON_DISABLED_STATUS]: (state, { status, isLoading = true }) => {
      state.inspection.shouldDisabledExportButton = status;
      if (isSampleInspectionType(state.inspection.currentInspectionType)) {
        state.inspection.sample.summary.isLoading = isLoading;
      }
      if (isFullInspectionType(state.inspection.currentInspectionType)) {
        state.inspection.full.summary.isLoading = isLoading;
      }
    },
    [UPDATE_CURRENT_PAGE]: (state, { pageNum }) => {
      state.inspection.currentPage = pageNum;
    },
  },
  actions: {
    [GET_DATA_SAMPLE_SUMMARY]: (store, payload) =>
      createAsyncAction(store, GET_DATA_SAMPLE_SUMMARY, {
        method: 'POST',
        url: '/api/reports/sample-inspection/summary',
        data: {
          ...payload,
          cacheKey: store.state.inspection.cacheKey,
        },
      }),
    [GET_DATA_SAMPLE_DATA]: (store, payload) =>
      createAsyncAction(store, GET_DATA_SAMPLE_DATA, {
        method: 'POST',
        url: '/api/reports/sample-inspection',
        data: {
          ...payload,
          cacheKey: store.state.inspection.cacheKey,
        },
      }),
    [GET_DATA_FULL_SUMMARY]: (store, payload) =>
      createAsyncAction(store, GET_DATA_FULL_SUMMARY, {
        method: 'POST',
        url: '/api/reports/full-inspection/summary',
        data: {
          ...payload,
          cacheKey: store.state.inspection.cacheKey,
        },
      }),
    [GET_DATA_FULL_DATA]: (store, payload) =>
      createAsyncAction(store, GET_DATA_FULL_DATA, {
        method: 'POST',
        url: '/api/reports/full-inspection',
        data: {
          ...payload,
          cacheKey: store.state.inspection.cacheKey,
        },
      }),
  },
};
