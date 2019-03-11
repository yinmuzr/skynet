import { isEmpty } from 'lodash';
import {
  createAsyncAction,
  onRequest,
  onSuccess,
  onFailed,
} from '@/store/helper';

/* eslint no-param-reassign: ["error", { "props": false }] */
const buildHierarchyNode = (data) => {
  data.expand = true;
  data.hierarchyType = data.type;
  if (!isEmpty(data.children)) {
    data.children.map(buildHierarchyNode);
  }
  return data;
};

export const GET_HIERARCHY = 'GET_HIERARCHY';

export default {
  state: {
    hierarchy: [],
  },
  getters: {
    topHierarchy: ({ hierarchy }) => hierarchy.map(h => ({ id: h.id, name: h.name }))[0],
  },
  mutations: {
    [onRequest(GET_HIERARCHY)]: () => {},
    [onSuccess(GET_HIERARCHY)]: (state, { data }) => {
      data.map(buildHierarchyNode);
      state.hierarchy = data;
    },
    [onFailed(GET_HIERARCHY)]: () => {},
  },
  actions: {
    [GET_HIERARCHY]: store =>
      createAsyncAction(store, GET_HIERARCHY, { url: '/api/hierarchies' }),
  },
};
