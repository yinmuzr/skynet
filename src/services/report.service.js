import ajax from '@/services/ajax';

// eslint-disable-next-line
export const getReasonByCode = code =>
  ajax.get(`/api/unqualified-reasons/${code}`);

export const getMaterialByCode = code =>
  ajax.get(`/api/materials/${code}`);

export const uploadData = form =>
  ajax.post('api/reports/_upload', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
