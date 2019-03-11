import { isFunction } from 'lodash';
import ajax from '@/services/ajax';

export const onRequest = actionType => (`${actionType}_REQUEST`);
export const onSuccess = actionType => (`${actionType}_SUCCESS`);
export const onFailed = actionType => (`${actionType}_FAILED`);

// TODO: reduce state pass => curry 化
export const createAsyncAction = ({ commit }, actionType, axiosConfig, callback) => (
  new Promise((resolve, reject) => {
    commit(onRequest(actionType));

    return ajax({ ...axiosConfig, method: axiosConfig.method || 'get' })
      .then((response) => {
        if (callback && isFunction(callback.success)) {
          callback.success(response);
        }
        commit(onSuccess(actionType), { data: response });
        resolve(response);
      })
      .catch((error) => {
        if (callback && isFunction(callback.failed)) {
          callback.failed(error);
        }
        commit(onFailed(actionType), { payload: error });
        reject(error);
      });
  })
);

export const createBasicAsyncMutation = actionType => ({
  [onRequest(actionType)]: () => {},
  [onFailed(actionType)]: () => {},
});
