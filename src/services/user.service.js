import ajax from './ajax';

export const getUser = userEmailNum => ajax.get(`/api/users/${userEmailNum}`);
export const getInspectorByEmailNum = userEmailNum => ajax.get(`/api/users/user-contacts/${userEmailNum}`);

export const addUser = ({
  organizationId, userEmailNum, roles, materialCodes, hasAllMaterials,
}) =>
  ajax.post('/api/users', {
    organizationId, userEmailNum, roles, materialCodes, hasAllMaterials,
  });

export const editUser = ({
  userId, userEmailNum, roles, materialCodes, hasAllMaterials,
}) =>
  ajax.put(`/api/users/${userId}`, {
    userEmailNum, roles, materialCodes, hasAllMaterials,
  });

export const deleteUser = userId => ajax.delete(`/api/users/${userId}`);

export const getUserAuthority = () => ajax.get('/api/users/authority');
