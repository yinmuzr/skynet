import ajax from './ajax';

export const hasUser = () => ajax.get('/api/initializer/_hasUser');
export const getUser = userEmailNum => ajax.get(`/api/initializer/users/${userEmailNum}`);
export const syncBasicData = () => ajax.get('/api/initializer/sync-basic-data');
export const createSuperUser = userEmailNum => ajax.post('/api/initializer/super-users', { userEmailNum });

