import ajax from './ajax';

// eslint-disable-next-line
export const getMaterialGroup = materialGroupCode => ajax.get(`/api/material-groups/${materialGroupCode}`);
