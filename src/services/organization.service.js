import ajax from './ajax';

// eslint-disable-next-line
export const addOrganization = (parentId, hierarchyId, code) => ajax.post('/api/organizations', { parentId, hierarchyId, code });
export const editOrganization = (id, code) => ajax.put(`/api/organizations/${id}`, { code });
export const deleteOrganization = id => ajax.delete(`/api/organizations/${id}`);

export const updateOrganizationAuthorities = payload => (
  ajax.put(
    `/api/organizations/${payload.organizationId}/authorities`,
    payload,
  )
);

export const getMaterialByOrgIdAndCode = (organizationId, code) =>
  ajax.get(`/api/organizations/${organizationId}/materials/${code}`);

export const deleteAuthority = organizationId =>
  ajax.delete(`/api/organizations/${organizationId}/authorities`);

export const getGreeOrganizationByCode = code =>
  ajax.get(`/api/organizations/organization-mappings/${code}`);
