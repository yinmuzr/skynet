import jwtDecode from 'jwt-decode';
import { isEmpty, some } from 'lodash';
import { KEEP_ALIVE_MILLISECONDS, TOKEN_REFRESH_INTERVAL_MILLISECONDS } from '@/services/auth.service';
import { getToken, removeToken, setToken, storeBase, getBaseFromStorage } from '@/utils/auth';
import { createAsyncAction, createBasicAsyncMutation, onFailed, onRequest, onSuccess } from '@/store/helper';
import { LOADING_STATUS } from '@/utils/constant';

export const GET_TOKEN_REQUEST = 'GET_TOKEN';
export const REFRESH_TOKEN_REQUEST = 'REFRESH_TOKEN';
export const SCHEDULE_TOKEN_REFRESH = 'SCHEDULE_TOKEN_REFRESH';
export const UPDATE_CURRENT_BASE = 'UPDATE_CURRENT_BASE';
export const UPDATE_USER_AUTH = 'UPDATE_USER_AUTH';

const getTimeoutToRefreshToken = (token) => {
  const jwtUser = jwtDecode(token);
  const millisecondToExp = (jwtUser.exp * 1000) - Date.now();
  const millisecondToRefresh = millisecondToExp - (KEEP_ALIVE_MILLISECONDS - TOKEN_REFRESH_INTERVAL_MILLISECONDS);
  return millisecondToRefresh <= 0 ? 0 : millisecondToRefresh;
};

const scheduleTokenRefresh = store => (token) => {
  setToken(token);
  store.dispatch(SCHEDULE_TOKEN_REFRESH, TOKEN_REFRESH_INTERVAL_MILLISECONDS);
};

const getDefaultUser = () => (getToken() ? jwtDecode(getToken()) : {});

const getDefaultBaseCode = (user, currentBaseCode = getBaseFromStorage()) => {
  if (isEmpty(user) || isEmpty(user.privilegedBaseCodes)) {
    return '';
  }

  const currentBaseNotInUser = !some(user.privilegedBaseCodes, baseCode => baseCode === currentBaseCode);
  if (isEmpty(currentBaseCode) || currentBaseNotInUser) {
    const defaultBaseCode = user.privilegedBaseCodes[0];
    storeBase(defaultBaseCode);
    return defaultBaseCode;
  }
  return currentBaseCode;
};

const authStore = {
  state: {
    user: getDefaultUser(),
    status: '',
    currentBaseCode: getDefaultBaseCode(getDefaultUser()),
    userAuthHasBeenUpdated: false,
  },
  getters: {
    userCurrentBaseCode: state => state.currentBaseCode,
    userHasMaterialGroupConfigAuth: state => (materialGroupCode =>
      state.user.hasAllMaterialGroups ||
        state.user.configurableMaterialGroupCodes.findIndex(i => i === materialGroupCode) > -1
    ),
    userHasAuthority: state => (authority => state.user.authorities.findIndex(i => i === authority) > -1),
    userHasAuthoritiesIn: state => (authorities =>
      state.user.authorities.findIndex(userAuthority => authorities.findIndex(i => i === userAuthority) > -1) > -1),
  },
  mutations: {
    [onRequest(GET_TOKEN_REQUEST)]: (state) => {
      state.status = LOADING_STATUS.LOADING;
    },
    [onSuccess(GET_TOKEN_REQUEST)]: (state, { data }) => {
      const user = jwtDecode(data);
      state.user = user;
      state.currentBaseCode = getDefaultBaseCode(user, state.currentBaseCode);
      state.status = LOADING_STATUS.SUCCESS;
    },
    [onFailed(GET_TOKEN_REQUEST)]: (state) => {
      state.status = LOADING_STATUS.FAILED;
    },
    [onSuccess(REFRESH_TOKEN_REQUEST)]: (state, { data }) => {
      state.user = jwtDecode(data);
    },
    ...createBasicAsyncMutation(REFRESH_TOKEN_REQUEST),
    [UPDATE_CURRENT_BASE]: (state, payload) => {
      state.currentBaseCode = payload;
    },
    [UPDATE_USER_AUTH]: (state) => {
      state.userAuthHasBeenUpdated = true;
    },
  },
  actions: {
    [GET_TOKEN_REQUEST]: (store, payload) => createAsyncAction(store, GET_TOKEN_REQUEST, {
      method: 'post',
      url: '/api/auth/tokens',
      data: { callback: payload },
    }, {
      success: scheduleTokenRefresh(store),
      failed: removeToken,
    }),
    [REFRESH_TOKEN_REQUEST]: store => createAsyncAction(store, REFRESH_TOKEN_REQUEST, {
      method: 'post',
      url: '/api/auth/tokens/_refresh',
    }, {
      success: scheduleTokenRefresh(store),
      failed: removeToken,
    }),
    [SCHEDULE_TOKEN_REFRESH]: (store, timeout) => {
      const token = getToken();
      if (token) {
        setTimeout(() => store.dispatch(REFRESH_TOKEN_REQUEST), timeout || getTimeoutToRefreshToken(token));
      }
    },
  },
};

export default authStore;
