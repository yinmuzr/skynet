<template>
  <div class="login-bg">
    <Card v-if="status" class="login-modal">
      <Row class="logo-container">
        <img class="logo" src="../../assets/logo-login.png"/>
        <div class="line"></div>
      </Row>
      <Row class="login-info">
        <Col class="icon-container">
          <Icon v-if="isFailed" class="icon" type="skynet-login-warning"/>
          <Icon v-else class="icon" type="skynet-login-waiting"/>
        </Col>
        <Col class="login-text-container">
          <div class="text-main">{{mainText}}</div>
          <div class="text-sub">{{subText}}</div>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { getToken, redirectToSSOLogin, LOGIN_REDIRECT_URL } from '@/utils/auth';
import { GET_TOKEN_REQUEST } from '@/store/auth.module';
import { isFailed } from '@/utils/util';


export default {
  name: 'SkynetLogin',
  data() {
    return {
      mainText: '正在登录格力天网系统',
      subText: '请稍候...',
    };
  },
  computed: {
    ...mapState({
      status: state => state.auth.status,
    }),
    isFailed() {
      return isFailed(this.status);
    },
  },
  methods: {
    ...mapActions({
      getTokenRequest: GET_TOKEN_REQUEST,
    }),
  },
  created() {
    if (getToken()) {
      this.$router.push('/');
      return;
    }
    if (this.$route.query.callback) {
      this.getTokenRequest(this.$route.query.callback).then(() => {
        this.$router.push(localStorage.getItem(LOGIN_REDIRECT_URL) || '/');
        localStorage.removeItem(LOGIN_REDIRECT_URL);
      }).catch((error) => {
        // TODO: 文字移到别的地方
        if (error.status === 401) {
          this.mainText = '抱歉，您没有权限进入天网系统';
          this.subText = '请联系管理员加入';
        } else {
          this.mainText = '抱歉，系统错误';
          this.subText = '请稍候重试';
        }
      });
    } else {
      redirectToSSOLogin();
    }
  },
};
</script>


<style lang="scss" scoped>
@import '@/styles/var.scss';
.login-bg {
  background: url("../../assets/bg@2x.png") center center no-repeat, linear-gradient(129deg, #729dfb, #3977fc);
  background-size: 1082px 616px, cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.login-modal {
  width: 656px;
  height: 285px;
  padding: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

}
.logo-container {
  position: relative;
  text-align: center;
  padding-bottom: 25px;
  > .logo {
    width: 335px;
  }
  > .line {
    width: 357px;
    height: 1px;
    background-color: #afbfe2;
    position: absolute;
    left: 124px;
    bottom: 0;
  }
}
.login-info {
  margin-top: 50px;
  margin-left: 100px;
  > .icon-container {
    float: left;
    > .icon {
      vertical-align: top;
      font-size: 80px;
      color: $--color-primary;
    }
  }
}
.login-text-container {
  float: left;
  margin-left: 40px;
  color: $--color-text-primary;
  .text-main {
    font-size: 22px;
    font-weight: bold;
    padding-bottom: 20px;
  }
  .text-sub {
    font-size: 18px;
  }
}
</style>

