import jwtDecode from 'jwt-decode';

export const USER_TOKEN = 'USER_TOKEN';
export const CURRENT_BASE_CODE = 'CURRENT_BASE_CODE';
export const LOGIN_REDIRECT_URL = 'LOGIN_REDIRECT_URL';
export const LAST_OPERATION_TIME = 'LAST_OPERATION_TIME';

export const setToken = (token) => {
  if (token) {
    try {
      jwtDecode(token);
      localStorage.setItem(USER_TOKEN, token);
    } catch (e) {
      // do nothing
    }
  }
};

export const getToken = () => localStorage.getItem(USER_TOKEN);

export const removeToken = () => {
  localStorage.removeItem(USER_TOKEN);
  localStorage.removeItem(LAST_OPERATION_TIME);
};

export const redirectToSSOLogin = (path = '/') => {
  localStorage.setItem(LOGIN_REDIRECT_URL, path);
  removeToken();
  window.location = window.VUE_APP_SSO_LOGIN_URL;
};

export const logLastOperationTime = () => {
  localStorage.setItem(LAST_OPERATION_TIME, Date.now());
};

export const getLastOperationTime = () => {
  const lastOperationTime = localStorage.getItem(LAST_OPERATION_TIME) || Date.now().toString();
  return Number(lastOperationTime);
};

export const SYS_AUTHORITIES = {
  RISK_ENTRANCE_INSPECTION_VIEWABLE: 'RISK_ENTRANCE_INSPECTION_VIEWABLE',
  RISK_ENTRANCE_INSPECTION_CONFIGURABLE: 'RISK_ENTRANCE_INSPECTION_CONFIGURABLE',
  RISK_OFF_LINE_VIEWABLE: 'RISK_OFF_LINE_VIEWABLE',
  RISK_OFF_LINE_CONFIGURABLE: 'RISK_OFF_LINE_CONFIGURABLE',
  DATA_ENTRANCE_INSPECTION_VIEWABLE: 'DATA_ENTRANCE_INSPECTION_VIEWABLE',
  DATA_OFF_LINE_VIEWABLE: 'DATA_OFF_LINE_VIEWABLE',
  AUTHORITY_HIERARCHY_AND_ROLE_VIEWABLE: 'AUTHORITY_HIERARCHY_AND_ROLE_VIEWABLE',
  AUTHORITY_HIERARCHY_AND_ROLE_CONFIGURABLE: 'AUTHORITY_HIERARCHY_AND_ROLE_CONFIGURABLE',
  AUTHORITY_ORGANIZATION_AND_PEOPLE_VIEWABLE: 'AUTHORITY_ORGANIZATION_AND_PEOPLE_VIEWABLE',
  AUTHORITY_ORGANIZATION_CONFIGURABLE: 'AUTHORITY_ORGANIZATION_CONFIGURABLE',
  AUTHORITY_PEOPLE_CONFIGURABLE: 'AUTHORITY_PEOPLE_CONFIGURABLE',
};

export const getBaseFromStorage = () => localStorage.getItem(CURRENT_BASE_CODE) || '';
export const storeBase = baseCode => localStorage.setItem(CURRENT_BASE_CODE, baseCode);
export const isTokenInvalidError = error => error && error.status === 403 && error.message === 'INVALID_TOKEN';
