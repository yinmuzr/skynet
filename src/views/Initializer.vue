<template>
  <div>
    <SkynetInitializeMessageView v-if="message" :message="message"/>
    <SkynetInitializeConfigView v-if="!message && !superUser" @on-set-superuser-succeed="handleConfigSuperUserSucceed"/>
    <SkynetInitializeSucceedView v-if="superUser" :superUser="superUser"/>
  </div>
</template>

<script>

import { hasUser } from '@/services/initializer.service';
import { ERROR } from '@/utils/constant';
import SkynetInitializeMessageView from '@/components/initializer/InitializeMessageView.vue';
import SkynetInitializeSucceedView from '@/components/initializer/InitializeSucceedView.vue';
import SkynetInitializeConfigView from '@/components/initializer/InitializeConfigView.vue';

export default {
  name: 'SkynetInitializer',
  components: {
    SkynetInitializeMessageView,
    SkynetInitializeConfigView,
    SkynetInitializeSucceedView,
  },
  data() {
    return {
      message: null,
      superUser: null,
    };
  },
  created() {
    hasUser().then((alreadyHasUser) => {
      if (alreadyHasUser) {
        this.message = '天网系统已存在用户，无法进行超级管理员初始化';
      }
    }).catch(() => {
      this.message = ERROR.NETWORK;
    });
  },
  methods: {
    handleConfigSuperUserSucceed(user) {
      this.superUser = user;
    },
  },
};
</script>
