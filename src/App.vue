<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import jwtDecode from 'jwt-decode';
import { mapState } from 'vuex';
import { isEmpty, get } from 'lodash';
import ajax from '@/services/ajax';
import { ERROR } from '@/utils/constant';
import { redirectToSSOLogin, isTokenInvalidError, removeToken, getToken } from '@/utils/auth';
import { UPDATE_USER_AUTH } from '@/store/auth.module';
import { handleUserInteractive } from '@/services/auth.service';

export default {
  computed: {
    ...mapState({
      userAuthHasBeenUpdated: state => state.auth.userAuthHasBeenUpdated,
      user: state => state.auth.user,
    }),
  },
  watch: {
    userAuthHasBeenUpdated(newValue, oldValue) {
      if (!oldValue && newValue) {
        removeToken();
        this.$Modal.error({
          title: '登录已过期',
          content: '您的用户权限已更新，请重新登录，获取更新后的用户权限。',
          okText: '好的',
          onOk: () => {
            redirectToSSOLogin(this.$route.path);
          },
        });
      }
    },
  },
  methods: {
    responseHandler(response) {
      const responseData = response.data;
      if (isEmpty(responseData)) {
        return {};
      }
      if (responseData.success) {
        return responseData.data;
      }
      return Promise.reject(response);
    },
    responseErrorHandler(error) {
      const errorResponse = error.response;
      if (!errorResponse) {
        // eslint-disable-next-line
        return Promise.reject({errorMessage: ERROR.UNKNOWN_ERROR, status: 500});
      }

      if (errorResponse.status === 403) {
        if (isTokenInvalidError(get(errorResponse, 'data.data'))) {
          this.$store.commit(UPDATE_USER_AUTH);
        } else {
          return redirectToSSOLogin();
        }
      }
      // eslint-disable-next-line
      return Promise.reject({ ...errorResponse.data, status: errorResponse.status });
    },
    handleTokenUpdated(token) {
      const tokenUser = jwtDecode(token);
      if (tokenUser.appAccount !== this.user.appAccount || tokenUser.userName !== this.user.userName) {
        this.$router.go(0);
      }
    },
  },
  created() {
    ajax.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          // eslint-disable-next-line
          config.headers.Authorization = `Bearer ${token}`;

          handleUserInteractive(config.url);
          this.handleTokenUpdated(token);
        }

        return config;
      },
      error => Promise.reject(error),
    );

    ajax.interceptors.response.use(
      this.responseHandler,
      this.responseErrorHandler,
    );
  },
};
</script>

<style lang="scss">
@import './styles/iview/custom-iview';
@import './styles/element-ui/tableEx.scss';
@import './styles/element-ui/date-pickerEx.scss';
@import './styles/common.scss';
</style>

