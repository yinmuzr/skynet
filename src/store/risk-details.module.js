import { onRequest, onSuccess, onFailed, createAsyncAction } from '@/store/helper';
import { buildSampleDetailList, buildFullDetailList, isSample } from '@/utils/util';

export const GET_RISK_DETAILS = 'GET_RISK_DETAILS';
export const RESET_RISK_DETAILS_STATE = 'RESET_RISK_SAMPLE_DETAILS_STATE';

export default {
  state: {
    isLoading: true,
    list: [],
    total: 0,
    statistics: '',
  },
  mutations: {
    [RESET_RISK_DETAILS_STATE]: (state) => {
      state.isLoading = true;
      state.list = [];
      state.total = 0;
      state.statistics = '';
    },
    [onRequest(GET_RISK_DETAILS)]: (state) => {
      state.isLoading = true;
    },
    [onSuccess(GET_RISK_DETAILS)]: (state, { data }) => {
      state.isLoading = false;
      state.list = data.isSample ?
        buildSampleDetailList(data.sampleDetailList) :
        buildFullDetailList(data.fullDetailList);
      state.total = data.totalCount;
      state.statistics = data.statistics;
    },
    [onFailed(GET_RISK_DETAILS)]: (state) => {
      state.isLoading = true;
      state.list = [];
      state.total = 0;
      state.statistics = '';
    },
  },
  actions: {
    [GET_RISK_DETAILS]: (store, payload) =>
      createAsyncAction(store, GET_RISK_DETAILS, {
        method: 'POST',
        url: `/api/risk-warnings/${isSample(payload.inspectionType) ? 'sample-details' : 'full-details'}`,
        data: payload,
      }, {
        success: (response) => {
          response.isSample = isSample(payload.inspectionType);
        },
      }),
  },
};
