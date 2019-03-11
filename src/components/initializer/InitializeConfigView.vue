<template>
  <div class="config-panel">
    <p class="info">初始化系统管理员会经过如下两个步骤，配置完成后可使用配置成功的账号登录进入天网系统</p>
    <p class="info">第一步：请同步系统所需的基础数据</p>
    <div class="sync-operation">
      <Button :disabled="syncSucceed" size="large" type="primary" class="sync-button"
              @click="syncBasicData">同步基础数据
      </Button>
      <div class="sync-message-panel">
        <Icon v-if="syncSucceed" class="success-icon" type="md-checkmark"/>
        <p class="info sync-message">{{syncMessage}}</p>
      </div>
    </div>
    <p class="info">第二步：请输入员工ID进行超级管理员的初始化</p>
    <Form :label-width="0" ref="userForm" :model="userForm" :rules="ruleValidate"
          @submit.native.prevent="preventDefault">
      <FormItem size="large" ref="userEmailNum" prop="userEmailNum">
        <SkynetCustomInput
          ref="userInput"
          class="user-input"
          placeholder="输入人员ID进行匹配"
          :disabled="isLoadingUserByEmailNum || !syncSucceed"
          v-model="userForm.userEmailNum"
          :nameToShow="userNameAndEmail"
          @showName="validateUserField"
          @resetName="resetUserNameAndEmail"/>
      </FormItem>
      <Button :disabled="!syncSucceed"
              @click="configSuperUser"
              class="confirm-button"
              size="large"
              type="primary">确定
      </Button>
    </Form>
  </div>
</template>

<script>

import { ERROR } from '@/utils/constant';
import SkynetCustomInput from '@/components/CustomInput.vue';
import { createSuperUser, getUser, syncBasicData } from '@/services/initializer.service';
import formValidation from '@/mixins/formValidation';

export default {
  name: 'SkynetInitializeConfigView',
  components: {
    SkynetCustomInput,
  },
  mixins: [formValidation],
  data() {
    return {
      isLoadingUserByEmailNum: false,
      userNameAndEmail: '',
      userForm: {
        userEmailNum: '',
      },
      ruleValidate: {
        userEmailNum: [
          { required: true, message: ERROR.REQUIRED, trigger: 'change' },
          { validator: this.validateUser, trigger: 'enter' },
        ],
      },
      syncMessage: '',
      syncSucceed: false,
    };
  },
  methods: {
    validateUserField() {
      this.$refs.userForm.validateField('userEmailNum');
    },
    resetUserNameAndEmail() {
      this.userNameAndEmail = '';
    },
    configSuperUser() {
      createSuperUser(this.userForm.userEmailNum).then(() => {
        this.$emit('on-set-superuser-succeed', this.userNameAndEmail);
      }).catch(() => {
        this.showGlobalError();
      });
    },
    syncBasicData() {
      this.syncMessage = '同步中';
      this.syncSucceed = false;
      syncBasicData()
        .then(() => {
          this.syncMessage = '同步成功';
          this.syncSucceed = true;
        })
        .catch(() => {
          this.syncMessage = '同步失败，请重试';
          this.syncSucceed = false;
        });
    },
    // eslint-disable-next-line
    validateUser(rule, value, callback) {
      if (!value) {
        return callback(new Error(ERROR.REQUIRED));
      }
      if (!this.userNameAndEmail && !this.isLoadingUserByEmailNum) {
        this.isLoadingUserByEmailNum = true;
        getUser(value)
          .then((data) => {
            this.userNameAndEmail = `${data.userName} (${value})`;
            return callback();
          })
          .catch((error) => {
            this.userNameAndEmail = '';
            if ((error.status === 404 || error.status === 400)) {
              return callback(new Error(ERROR.INPUT));
            }
            return callback(new Error(ERROR.NETWORK));
          }).finally(() => {
            this.isLoadingUserByEmailNum = false;
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '@/styles/publicPageLayout.scss';

  .config-panel {
    width: 50%;
    height: 100vh;
    margin-left: 30%;
    margin-top: 20vh;
    min-height: 400px;
  }

  .success-icon {
    font-size: 20px;
    color: #7fd320;
    display: inline-block;
    font-weight: bold;
    margin-top: -5px;
    vertical-align: middle;
  }

  .sync-button {
    margin-top: 10px;
  }

  .user-input {
    width: 400px;
    display: inline-block;
  }

  .sync-message {
    display: inline-block;
    margin-top: 0;
  }

  .sync-message-panel {
    display: inline-block;
    margin-top: 10px;
    vertical-align: middle;
    margin-left: 24px;
  }

  .ivu-form-item {
    display: inline-block;
    margin-right: 50px;
    margin-top: 10px;
  }

  .confirm-button {
    width: 78px;
    margin-top: 10px;
  }
</style>

<style lang="scss">
  .config-panel {
    .ivu-input-default {
      height: 36px;
    }
  }
</style>
