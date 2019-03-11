import store, { GET_TOKEN_REQUEST } from '@/store/auth.module';
import { onRequest, onSuccess, onFailed } from '@/store/helper';

const { mutations } = store;

describe('auth.mutations', () => {
  it('should set status to loading when the request start', () => {
    const state = {
      user: {},
      status: '',
    };
    mutations[onRequest(GET_TOKEN_REQUEST)](state);
    expect(state.status).toBe('LOADING');
  });

  it('should set the user when the request is successful', () => {
    const state = {
      user: {},
      status: '',
    };
    // eslint-disable-next-line
    const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhIiwidXNlck5hbWUiOiLnlKjmiLdhIiwiYXBwQWNjb3VudCI6ImEiLCJvcmdhbml6YXRpb25JZCI6MiwiaWF0IjoxNTQzNTYwODEzLCJleHAiOjE1NDM1NjQ0MTN9._3JtrSjTKXDmL1y2OfpIpcesWcqrJxCAWe-AM5t3rRo';
    const expectedUser = {
      sub: 'a',
      userName: '用户a',
      appAccount: 'a',
      organizationId: 2,
      iat: 1543560813,
      exp: 1543564413,
    };
    mutations[onSuccess(GET_TOKEN_REQUEST)](state, { data: TOKEN });
    expect(state.status).toBe('SUCCESS');
    expect(state.user).toEqual(expectedUser);
  });

  it('should set status to failed when the request is failed', () => {
    const state = {
      user: {},
      status: '',
    };
    mutations[onFailed(GET_TOKEN_REQUEST)](state);
    expect(state.status).toBe('FAILED');
  });
});
