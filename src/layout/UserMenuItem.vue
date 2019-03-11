<template>
  <div>
    <Dropdown @on-click="logoutConfirm" trigger="click">
      <a class="dropdown-button logout-button" href="javascript:void(0)">
        <Icon class="icon-profile" type="skynet-profile"/>
        {{user.userName}}
        <Icon type="md-arrow-dropdown"/>
      </a>
      <DropdownMenu slot="list">
        <DropdownItem name="authority">我的权限</DropdownItem>
        <DropdownItem name="logout">退出</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Modal class="authority-modal"
           v-model="showAuthorityModal"
           title="我的权限"
           ok-text="好的"
           cancel-text="">
      <SkynetUserAuthority v-if="showAuthorityModal"/>
    </Modal>
  </div>
</template>

<script>
import { isFunction } from 'lodash';
import { mapState } from 'vuex';
import { logout } from '@/services/auth.service';
import SkynetUserAuthority from '@/layout/UserAuthority.vue';
import { redirectToSSOLogin } from '@/utils/auth';
import formValidation from '@/mixins/formValidation';

export default {
  name: 'SkynetUserMenuItem',
  mixins: [formValidation],
  components: {
    SkynetUserAuthority,
  },
  data() {
    return {
      showLogoutModal: false,
      showAuthorityModal: false,
    };
  },
  computed: {
    ...mapState({
      user: state => state.auth.user,
    }),
  },
  methods: {
    logout() {
      this.$confirmModal.show({
        title: '确认退出',
        content: '确定退出天网系统吗？',
        action: () => logout(),
        onSuccess: () => {
          redirectToSSOLogin();
        },
        onFail: () => {
          this.showGlobalError();
        },
      });
    },
    authority() {
      this.showAuthorityModal = true;
    },
    logoutConfirm(selectedDropmenuItemName) {
      const currentOperationMethod = this[selectedDropmenuItemName];
      if (currentOperationMethod && isFunction(currentOperationMethod)) {
        this[selectedDropmenuItemName]();
      }
    },
  },
};
</script>


<style lang="scss" scoped>
@import "@/styles/var.scss";
.dropdown-button {
  display: inline-block;
  width: 120px;
  line-height: $--header-subrow-height;
  text-align: center;
  font-size: 12px;
  color: rgba($color: #fff, $alpha: 0.7);
}
.logout-button {
  line-height: $--header-row-height;
  > .icon-profile {
    font-size: 18px;
    margin-right: 4px;
    margin-top: -1px;
    vertical-align: middle;
  }
}
</style>
