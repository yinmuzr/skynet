import ajax from './ajax';

// eslint-disable-next-line
export const getMenus = () => ajax.get('/api/menus');
