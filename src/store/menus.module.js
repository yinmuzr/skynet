import { isEmpty } from 'lodash';
import menuConfig from '@/routes/menu-config';
import { createAsyncAction, onRequest, onSuccess, onFailed } from '@/store/helper';

export const GET_MENUS = 'GET_MENUS';
export const HIDE_SUMB_MENU = 'HIDE_SUMB_MENU';

const addRouteToMenu = menu => ({
  ...menu,
  route: menuConfig[menu.code] || '/',
  children: isEmpty(menu.children) ? [] : menu.children.map(addRouteToMenu),
});


const isSystemMenu = menu => menu.system;

export default {
  state: {
    menus: [],
    hideSubMenu: false,
  },
  getters: {
    businessMenus: ({ menus }) => menus.filter(menu => !isSystemMenu(menu)),
    systemMenus: ({ menus }) => menus.filter(isSystemMenu),
    mainMenus: ({ menus }) => menus,
  },
  mutations: {
    [HIDE_SUMB_MENU]: (state, payload) => {
      state.hideSubMenu = payload.hideSubMenu;
    },
    [onRequest(GET_MENUS)]: () => {},
    [onSuccess(GET_MENUS)]: (state, { data }) => {
      const menus = data.map(addRouteToMenu);
      state.menus = menus;
    },
    [onFailed(GET_MENUS)]: () => {},
  },
  actions: {
    [GET_MENUS]: store => createAsyncAction(store, GET_MENUS, { url: '/api/menus' }),
  },
};
