import ajax from './ajax';

// eslint-disable-next-line
export const getVendorByCode = code =>
  ajax.get(`/api/vendors/${code}`);
