import { createAsyncAction, onRequest, onSuccess, onFailed } from '@/store/helper';

export const GET_USERS = 'GET_USERS';

const convertUserToTableData = (user) => {
  const result = {
    ...user,
    userNameAndEmail: `${user.userName}(${user.userEmailNum})`,
    roleNames: user.roles.map(role => role.name).join('、'),
    materialNames: user.hasAllMaterials ? '所管辖的全部物料' :
      user.materials.map(material => `${material.name}(${material.code})`).join('、'),
  };
  return result;
};

export default {
  state: {
    data: [],
  },
  getters: {
    users: ({ data }) => data.map(convertUserToTableData),
  },
  mutations: {
    [onRequest(GET_USERS)]: () => {},
    [onSuccess(GET_USERS)]: (state, { data }) => {
      state.data = data;
    },
    [onFailed(GET_USERS)]: () => {},
  },
  actions: {
    [GET_USERS]: (store, organizationId) =>
      createAsyncAction(store, GET_USERS, { url: `/api/users?organizationId=${organizationId}` }),
  },
};
