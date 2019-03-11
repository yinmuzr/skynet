import {
  onRequest,
  onSuccess,
  onFailed,
  createAsyncAction,
} from '@/store/helper';
import { map } from 'lodash';
import moment from 'moment';
import { formatNameWithCode, getWarningDateRange, mapToRiskWarningSummary, isNullOrEmpty } from '@/utils/util';
import { INSPECTION_TYPE_MAP, WARNING_DATE_OFFSET_MAP, PAGE_SIZE } from '@/utils/constant';

export const GET_RISK_WARNING_DATA = 'GET_RISK_WARNING_DATA';

export const UPDATE_RISK_WARNING_CURRENT_PAGE = 'UPDATE_RISK_WARNING_CURRENT_PAGE';

export const UPDATE_RISK_WARNING_DATA = 'UPDATE_RISK_WARNING_DATA';

export const GET_RISK_WARNING_SUMMARY = 'GET_RISK_WARNING_SUMMARY';

const buildInspectionDataList = dataList => dataList.map(item => ({
  ...item,
  vendor: formatNameWithCode({
    code: item.vendorCode,
    name: item.vendorName,
  }),
  materialGroup: formatNameWithCode({
    code: item.materialGroupCode,
    name: item.materialGroupName,
  }),
  inspectionType: INSPECTION_TYPE_MAP[item.inspectionType],
  warningTime: moment(item.warningTime).format('YYYY-MM-DD HH:mm:ss'),
}));

export default {
  state: {
    filterForm: {
      date: WARNING_DATE_OFFSET_MAP.TODAY.key,
      currentPage: 1,
      pageSize: PAGE_SIZE,
    },
    summary: {
      list: [],
      isLoading: true,
    },
    table: {
      list: [],
      isLoading: true,
    },
  },
  getters: {
    filterRiskWarningParams: (state) => {
      const currentDate = getWarningDateRange(state.filterForm.date);
      return {
        startDate: moment(currentDate[0]).toISOString(),
        endDate: moment(currentDate[1]).toISOString(),
        pagination: {
          limit: state.filterForm.pageSize,
          offset: (state.filterForm.currentPage - 1) * state.filterForm.pageSize,
        },
      };
    },
  },
  mutations: {
    [onRequest(GET_RISK_WARNING_DATA)]: (state) => {
      state.table.isLoading = true;
    },
    [onSuccess(GET_RISK_WARNING_DATA)]: (state, { data }) => {
      state.table.isLoading = false;
      state.table.list = isNullOrEmpty(data) ? [] : buildInspectionDataList(data);
    },
    [onFailed(GET_RISK_WARNING_DATA)]: (state) => {
      state.table.isLoading = true;
      state.table.list = [];
    },
    [onRequest(GET_RISK_WARNING_SUMMARY)]: (state) => {
      state.summary.isLoading = true;
    },
    [onSuccess(GET_RISK_WARNING_SUMMARY)]: (state, { data }) => {
      state.summary.isLoading = false;
      state.summary.list = map(data, mapToRiskWarningSummary);
    },
    [onFailed(GET_RISK_WARNING_SUMMARY)]: (state) => {
      state.summary.isLoading = true;
    },
    [UPDATE_RISK_WARNING_DATA]: (state, { filterForm }) => {
      state.filterForm = filterForm;
    },
    [UPDATE_RISK_WARNING_CURRENT_PAGE]: (state, { pageNum }) => {
      state.filterForm.currentPage = pageNum;
    },
  },
  actions: {
    [GET_RISK_WARNING_DATA]: (store, payload) =>
      createAsyncAction(store, GET_RISK_WARNING_DATA, {
        method: 'POST',
        url: '/api/risk-warnings',
        data: payload,
      }),
    [GET_RISK_WARNING_SUMMARY]: (store, payload) =>
      createAsyncAction(store, GET_RISK_WARNING_SUMMARY, {
        method: 'POST',
        url: '/api/risk-warnings/summary',
        data: payload,
      }),
  },
};
