import ajax from '@/services/ajax';
import {
  getLastOperationTime,
  logLastOperationTime,
  redirectToSSOLogin,
} from '@/utils/auth';

const REFRESH_TOKEN_URL = '/api/auth/tokens/_refresh';
const LOGOUT_URL = '/api/auth/tokens/current';
export const KEEP_ALIVE_MILLISECONDS = 3600000;
export const TOKEN_REFRESH_INTERVAL_MILLISECONDS = 3000000;

const isRefreshingToken = url => (url === REFRESH_TOKEN_URL);
const isLogouting = url => (url === LOGOUT_URL);

export const logout = () => ajax.delete(LOGOUT_URL);

export const handleUserInteractive = (url) => {
  if (isLogouting(url)) {
    return;
  }

  const lastOperationTime = getLastOperationTime();
  if (Date.now() - lastOperationTime >= KEEP_ALIVE_MILLISECONDS) {
    redirectToSSOLogin();
    return;
  }

  if (!isRefreshingToken(url)) {
    logLastOperationTime();
  }
};
