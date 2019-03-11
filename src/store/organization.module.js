import { createAsyncAction, createBasicAsyncMutation, onRequest, onSuccess } from '@/store/helper';
import { isEmpty, compact, reduce, find } from 'lodash';
import { rebuildTree, getNodes, isTopHierarchyType, isBottomHierarchyType } from '@/utils/util';
import { buildPrivilegedOrganizationsText } from '@/utils/authority';

export const GET_ORGANIZATONS = 'GET_ORGANIZATONS';
export const GET_ORGANIZATON_MAPPINGS = 'GET_ORGANIZATON_MAPPINGS';
export const GET_AUTHORITIES_BY_ORGANIZATION_ID = 'GET_AUTHORITIES_BY_ORGANIZATION_ID';

const resetOrganizationChildren = organization => ({ ...organization, children: [] });

const foldAuthorities = (authorities) => {
  const tree = reduce(authorities, (result, nodes) => {
    let rootAuthority = nodes.shift();
    const foundAuthority = find(result, item => item.id === rootAuthority.id);

    if (foundAuthority) {
      rootAuthority = foundAuthority;
    } else {
      result.push(rootAuthority);
    }

    while (!isEmpty(nodes)) {
      const currentNode = nodes.shift();
      const foundChildAuthority = find(rootAuthority.children, item => item.id === currentNode.id);
      if (!foundChildAuthority) {
        rootAuthority.children.push(currentNode);
        rootAuthority = currentNode;
      } else {
        rootAuthority = foundChildAuthority;
      }
    }

    return result;
  }, []);

  return tree;
};

const buildPrivilegedOrganizationTree = (tree) => {
  const bottomOrganizations = getNodes(tree, node => isBottomHierarchyType(node.hierarchyType));

  const authorities = compact(bottomOrganizations.map((organization) => {
    const nodes = [resetOrganizationChildren(organization)];
    let parent = organization.getParentNode();
    while (parent) {
      nodes.unshift(resetOrganizationChildren(parent));
      if (isTopHierarchyType(parent.hierarchyType)) {
        return nodes;
      }
      parent = parent.getParentNode();
    }
    if (isTopHierarchyType(nodes[nodes.length - 1].hierarchyType)) {
      return null;
    }
    return null;
  }));

  return foldAuthorities(authorities);
};


const buildOrganizationNode = nodeData => ({
  ...nodeData,
  expand: true,
  organizationName: nodeData.name,
  name: `${nodeData.name} - ${nodeData.hierarchyName}`,
  children: !isEmpty(nodeData.children) ? nodeData.children.map(buildOrganizationNode) : [],
});

const buildMaterialGroups = (authoritiesInfo) => {
  if (authoritiesInfo.data.hasAllMaterialGroups) {
    return '全部物料组';
  } else if (isEmpty(authoritiesInfo.data.materialGroups)) {
    return '';
  }
  return authoritiesInfo.data.materialGroups.map(group => `${group.name}（${group.code}）`).join('、');
};

export default {
  state: {
    data: [],
    mappings: [],
    authoritiesInfo: {
      data: {},
      isLoading: false,
    },
  },
  getters: {
    organizations: ({ data }) => rebuildTree(data.map(buildOrganizationNode)),
    authoritiesInfo: ({ authoritiesInfo }, { organizations }) => ({
      ...authoritiesInfo,
      materialGroupText: buildMaterialGroups(authoritiesInfo),
      privilegedOrganizationsText:
        buildPrivilegedOrganizationsText(authoritiesInfo.data.privilegedOrganizations, organizations),
    }),
    privilegedOrganizationTree: (state, { organizations }) => buildPrivilegedOrganizationTree(organizations),
  },
  mutations: {
    ...createBasicAsyncMutation(GET_ORGANIZATONS),
    [onSuccess(GET_ORGANIZATONS)]: (state, { data }) => {
      state.data = data;
    },
    ...createBasicAsyncMutation(GET_ORGANIZATON_MAPPINGS),
    [onSuccess(GET_ORGANIZATON_MAPPINGS)]: (state, { data }) => {
      state.mappings = data;
    },
    [onRequest(GET_AUTHORITIES_BY_ORGANIZATION_ID)]: (state) => {
      state.authoritiesInfo = {
        isLoading: true,
        data: {},
      };
    },
    [onSuccess(GET_AUTHORITIES_BY_ORGANIZATION_ID)]: (state, { data }) => {
      state.authoritiesInfo = {
        isLoading: false,
        data,
      };
    },
  },
  actions: {
    [GET_ORGANIZATONS]: store =>
      createAsyncAction(store, GET_ORGANIZATONS, { url: '/api/organizations' }),
    [GET_ORGANIZATON_MAPPINGS]: store =>
      createAsyncAction(store, GET_ORGANIZATON_MAPPINGS, { url: '/api/organizations/organization-mappings' }),
    [GET_AUTHORITIES_BY_ORGANIZATION_ID]: (store, id) =>
      createAsyncAction(
        store, GET_AUTHORITIES_BY_ORGANIZATION_ID,
        { url: `/api/organizations/${id}/authorities` },
      ),
  },
};
