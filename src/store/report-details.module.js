import { onRequest, onSuccess, onFailed, createAsyncAction } from '@/store/helper';
import {
  getDefaultDateRange,
  getDefaultUnqualifiedTypeFilterConditions,
  getDefaultUnqualifiedReasons,
  buildSampleDetailList,
  buildFullDetailList,
} from '@/utils/util';
import { map } from 'lodash';
import moment from 'moment';

export const RESET_FULL_DETAILS_STATE = 'RESET_FULL_DETAILS_STATE';
export const GET_SAMPLE_DETAILS = 'GET_SAMPLE_DETAILS';
export const GET_FULL_DETAILS = 'GET_FULL_DETAILS';
export const RESET_SAMPLE_DETAILS_STATE = 'RESET_SAMPLE_DETAILS_STATE';
export const UPDATE_SAMPLE_DETAIL_FILTER_FORM = 'UPDATE_SAMPLE_DETAIL_FILTER_FORM';
export const UPDATE_FULL_DETAIL_FILTER_FORM = 'UPDATE_FULL_DETAIL_FILTER_FORM';
export const UPDATE_DISABLED_STATUS = 'UPDATE_DISABLED_STATUS';

const getSampleInspectionDefaultFilterForm = () => ({
  date: getDefaultDateRange(),
  materials: [],
  vendors: [],
  materialGroups: [],
  inspectors: [],
  unqualifiedReasons: [],
  unqualifiedTypes: [],
});

const getFullInspectionDefaultFilterForm = () => ({
  ...getSampleInspectionDefaultFilterForm(),
  qualificationRate: null,
  unqualifiedTypes: getDefaultUnqualifiedTypeFilterConditions(),
  unqualifiedReasons: getDefaultUnqualifiedReasons(),
});

const DEFAULT_SAMPLE_INSPECTION_DETAIL_STATE = {
  isLoading: true,
  list: [],
  total: 0,
  filterForm: getSampleInspectionDefaultFilterForm(),
};

const DEFAULT_FULL_INSPECTION_DETAIL_STATE = {
  ...DEFAULT_SAMPLE_INSPECTION_DETAIL_STATE,
  filterForm: getFullInspectionDefaultFilterForm(),
};

export default {
  state: {
    sample: {
      ...DEFAULT_SAMPLE_INSPECTION_DETAIL_STATE,
    },
    full: {
      ...DEFAULT_FULL_INSPECTION_DETAIL_STATE,
    },
    shouldDisabledExportButton: false,
  },
  getters: {
    filterSampleDetailParams: (state, getters, rootState) => ({
      startDate: moment(state.sample.filterForm.date[0]).toISOString(),
      endDate: moment(state.sample.filterForm.date[1]).toISOString(),
      materialCodes: map(state.sample.filterForm.materials, item => item.code),
      vendorCodes: map(state.sample.filterForm.vendors, item => item.code),
      privilegedBaseCodes: [rootState.auth.currentBaseCode],
      inspectorCodes: map(state.sample.filterForm.inspectors, item => item.code),
      materialGroupCodes: map(state.sample.filterForm.materialGroups, item => item.code),
      inspectionConclusion: state.sample.filterForm.inspectionConclusion,
      /* eslint-disable no-param-reassign */
      unqualifiedTypes: state.sample.filterForm.unqualifiedTypes.reduce(
        (unqualifiedTypeMap, obj) => {
          unqualifiedTypeMap[obj] = null;
          return unqualifiedTypeMap;
        },
        {},
      ),
      unqualifiedReasons: state.sample.filterForm.unqualifiedReasons.reduce(
        (unqualifiedReasonMap, obj) => {
          unqualifiedReasonMap[obj.code] = null;
          return unqualifiedReasonMap;
        },
        {},
      ),
      /* eslint-disable no-param-reassign */
    }),
    filterFullDetailParams: (state, getters, rootState) => ({
      startDate: moment(state.full.filterForm.date[0])
        .toISOString(),
      endDate: moment(state.full.filterForm.date[1])
        .toISOString(),
      materialCodes: map(state.full.filterForm.materials, item => item.code),
      materialGroupCodes: map(state.full.filterForm.materialGroups, item => item.code),
      vendorCodes: map(state.full.filterForm.vendors, item => item.code),
      privilegedBaseCodes: [rootState.auth.currentBaseCode],
      qualificationRate: state.full.filterForm.qualificationRate
        ? state.full.filterForm.qualificationRate / 100
        : null,
      /* eslint-disable no-param-reassign */
      unqualifiedTypes: state.full.filterForm.unqualifiedTypes.reduce(
        (unqualifiedTypeMap, obj) => {
          if (obj.selected) {
            unqualifiedTypeMap[obj.selected] = obj.value;
          }
          return unqualifiedTypeMap;
        },
        {},
      ),
      unqualifiedReasons: state.full.filterForm.unqualifiedReasons.reduce(
        (unqualifiedReasonMap, obj) => {
          if (obj.code) {
            unqualifiedReasonMap[obj.code] = obj.value;
          }
          return unqualifiedReasonMap;
        },
        {},
      ),
    }),
  },
  mutations: {
    [RESET_SAMPLE_DETAILS_STATE]: (state) => {
      state.sample = { ...DEFAULT_SAMPLE_INSPECTION_DETAIL_STATE };
    },
    [RESET_FULL_DETAILS_STATE]: (state) => {
      state.full = { ...DEFAULT_FULL_INSPECTION_DETAIL_STATE };
    },
    [onRequest(GET_SAMPLE_DETAILS)]: (state) => {
      state.sample.isLoading = true;
    },
    [onSuccess(GET_SAMPLE_DETAILS)]: (state, { data }) => {
      state.sample.isLoading = false;
      state.sample.list = buildSampleDetailList(data.sampleDetailList);
      state.sample.total = data.totalCount;
    },
    [onFailed(GET_SAMPLE_DETAILS)]: (state) => {
      state.sample.isLoading = true;
      state.sample.list = [];
      state.sample.total = 0;
    },
    [onRequest(GET_FULL_DETAILS)]: (state) => {
      state.full.isLoading = true;
    },
    [onSuccess(GET_FULL_DETAILS)]: (state, { data }) => {
      state.full.isLoading = false;
      state.full.list = buildFullDetailList(data.fullDetailList);
      state.full.total = data.totalCount;
    },
    [onFailed(GET_FULL_DETAILS)]: (state) => {
      state.full.isLoading = true;
      state.full.list = [];
      state.full.total = 0;
    },
    [UPDATE_SAMPLE_DETAIL_FILTER_FORM]: (state, { filterForm }) => {
      state.sample.filterForm = filterForm;
    },
    [UPDATE_FULL_DETAIL_FILTER_FORM]: (state, { filterForm }) => {
      state.full.filterForm = filterForm;
    },
    [UPDATE_DISABLED_STATUS]: (state, { status }) => {
      state.shouldDisabledExportButton = status;
    },
  },
  actions: {
    [GET_SAMPLE_DETAILS]: (store, payload) =>
      createAsyncAction(store, GET_SAMPLE_DETAILS, {
        method: 'POST',
        url: '/api/reports/sample-inspection/details',
        data: payload,
      }),
    [GET_FULL_DETAILS]: (store, payload) =>
      createAsyncAction(store, GET_FULL_DETAILS, {
        method: 'POST',
        url: '/api/reports/full-inspection/details',
        data: payload,
      }),
  },
};
