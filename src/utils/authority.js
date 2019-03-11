import { isEmpty, groupBy, reduce, forEach, map, isEqual } from 'lodash';
import { getNodes, isBottomHierarchyType } from '@/utils/util';

const getAuthorityName = (authorities) => {
  let reduceName = '';
  if (authorities.length === 1) {
    reduceName = authorities[0].name;
  } else {
    reduceName = reduce(authorities.map(auth => auth.name), (x, y) => `${x}&${y}`);
  }
  return reduceName;
};

const getAuthoritiesAndSubMenuName = (menus) => {
  let authorityAndSubMenuName = '';
  forEach(menus, (value) => {
    value.forEach((v) => {
      if (!isEmpty(v.authorities)) {
        const reduceName = getAuthorityName(v.authorities);
        if (authorityAndSubMenuName) {
          authorityAndSubMenuName += '、';
        }
        authorityAndSubMenuName += `${v.name} (${reduceName}) `;
      }
    });
  });
  return authorityAndSubMenuName;
};

const getAuthoritiesAndAllMenuName = (firstMenus) => {
  let authorityAndAllMenuName = '';
  firstMenus.forEach((element) => {
    const parentMenuName = element.name;
    const subMenus = element.children;
    const menus = groupBy(subMenus, (menu => menu.parentId));
    const authorityAndSubMenuName = getAuthoritiesAndSubMenuName(menus);

    if (authorityAndSubMenuName) {
      if (authorityAndAllMenuName) {
        authorityAndAllMenuName += '; ';
      }
      authorityAndAllMenuName += `${parentMenuName}: ${authorityAndSubMenuName}`;
    }
  });

  return authorityAndAllMenuName;
};

export const getAuthorityMenuName = (hasAllAuthorities, menuAuthorities) => (
  hasAllAuthorities ? '全部菜单权限' : getAuthoritiesAndAllMenuName(menuAuthorities)
);

export const buildPrivilegedOrganizationsText = (privilegedOrganizations, organizations) => {
  if (isEmpty(privilegedOrganizations)) {
    return '无组织权限';
  }

  const allBottomOrganizationIds = map(
    getNodes(organizations, organization => isBottomHierarchyType(organization.hierarchyType)),
    item => item.id,
  ).sort();
  const privilegedOrganizationIds = map(privilegedOrganizations, item => item.id).sort();

  if (isEqual(allBottomOrganizationIds, privilegedOrganizationIds)) {
    return '全部组织权限';
  }
  return privilegedOrganizations.map(node => node.name).join('、');
};
