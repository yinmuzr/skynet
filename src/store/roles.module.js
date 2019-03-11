import { createAsyncAction, onRequest, onSuccess, onFailed } from '@/store/helper';
import { isEmpty } from 'lodash';
import { getAuthorityMenuName } from '@/utils/authority';

export const GET_ROLES = 'GET_ROLES';

const getAuthorities = (rawRoleData) => {
  let auths = [];
  if (isEmpty(rawRoleData)) return [];
  rawRoleData.forEach((roleData) => {
    auths = auths.concat(roleData.authorities, getAuthorities(roleData.children));
  });
  return auths;
};

const convertRoleToTableData = role => ({
  hierarchyName: role.hierarchyName,
  roleName: role.name,
  roleId: role.id,
  systemRole: role.systemRole,
  menuName: getAuthorityMenuName(role.hasAllAuthorities, role.menuAuthorities),
  authorities: getAuthorities(role.menuAuthorities),
});

export default {
  state: {
    roles: [],
  },
  getters: {
    roles: ({ roles }) => roles.map(convertRoleToTableData),
  },
  mutations: {
    [onRequest(GET_ROLES)]: () => {},
    [onSuccess(GET_ROLES)]: (state, { data }) => {
      state.roles = data;
    },
    [onFailed(GET_ROLES)]: () => {},
  },
  actions: {
    [GET_ROLES]: (store, hierarchyId) =>
      createAsyncAction(store, GET_ROLES, { url: `/api/roles?hierarchyId=${hierarchyId}` }),
  },
};
