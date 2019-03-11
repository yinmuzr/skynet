import ajax from './ajax';

export const addRole = (hierarchyId, roleName, authorityIds) =>
  ajax.post('/api/roles', { hierarchyId, roleName, authorityIds });
export const editRole = (roleId, roleName, authorityIds) =>
  ajax.put(`/api/roles/${roleId}`, { roleName, authorityIds });
export const deleteRole = roleId => ajax.delete(`/api/roles/${roleId}`);
