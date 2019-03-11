<template>
  <div>
    <Row class="title-container">
      <span class="section-title">人员权限</span>
      <Button
        v-if="operable"
        size="large"
        type="primary"
        class="add-button"
        @click="handleAddUser"
      >
        <Icon type="ios-add" class="add-button-icon"></Icon>新增人员
      </Button>
    </Row>
    <SkynetLoadable :show-loading="isLoading">
      <Table stripe size="large" no-data-text :columns="columns" :data="users"/>
    </SkynetLoadable>
    <Modal
      v-model="showAddUserModal"
      :mask-closable="false"
      :loading="modalLoading"
      :title="modalTitle"
      @on-ok="handleSubmit">
      <SkynetUserEditForm
        v-if="showAddUserModal"
        ref="userEditForm"
        :user-info="userInfoForModalForm"
        :rolesOptions="roles"
        :isEdit="isEdit"
        @submitSuccess="handleUpdateUserSuccess"
        @submitFailed="handleUpdateUserFailed"
      />
    </Modal>
  </div>
</template>

<script type="text/jsx">
import { isEmpty, pick } from 'lodash';
import { mapActions, mapState, mapGetters } from 'vuex';
import { GET_USERS } from '@/store/users.module';
import { GET_ROLES } from '@/store/roles.module';
import SkynetLoadable from '@/components/Loadable.vue';
import SkynetUserOperationColumn from '@/components/organization/UserOperationColumn.vue';
import { addUser, editUser, deleteUser } from '@/services/user.service';
import SkynetUserEditForm from '@/components/organization/UserEditForm.vue';
import {
  OPERATION_USER_OPTIONS,
  OPERATION_USER_MODAL_TITLE,
} from '@/utils/constant';
import modalExtension from '@/mixins/modalExtension';
import formValidation from '@/mixins/formValidation';
import tableExtension from '@/mixins/tableExtension';

export default {
  name: 'SkynetUserList',
  props: {
    organization: {
      id: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      hierarchyId: {
        type: Number,
        required: true,
      },
    },
    operable: Boolean,
  },
  mixins: [modalExtension, formValidation, tableExtension],
  data() {
    return {
      userInfoForModalForm: {
        userId: 0,
        organization: {
          id: 1,
          name: '',
        },
        userEmailNum: '',
        userNameAndEmail: '',
        roles: [],
        materials: [],
        hasAllMaterials: false,
      },
      isLoading: true,
      showAddUserModal: false,
      operateType: '',
    };
  },
  computed: {
    modalTitle() {
      return OPERATION_USER_MODAL_TITLE[this.operateType];
    },
    isEdit() {
      return this.operateType === OPERATION_USER_OPTIONS.EDIT;
    },
    ...mapState({
      users: state => state.users,
      roles: state => state.roles.roles,
    }),
    ...mapGetters(['users']),
    columns() {
      const columns = [
        {
          title: '所属组织',
          key: 'organizationName',
          width: '11%',
          render: this.renderColumn,
        },
        {
          title: '人员名称',
          key: 'userNameAndEmail',
          width: '11%',
          render: this.renderColumn,
        },
        {
          title: '物料权限',
          key: 'materialNames',
          width: '54%',
          render: this.renderColumn,
        },
        {
          title: '角色',
          key: 'roleNames',
          width: '11%',
          render: this.renderColumn,
        },
      ];
      if (this.operable) {
        columns.push({
          title: '操作',
          key: 'action',
          width: '13%',
          render: this.renderOperateUser,
        });
      }
      return columns;
    },
    ...mapState({
      roles: state => state.roles.roles,
      isOrganizationAuthorityConfigured: state =>
        !isEmpty(state.organizations.authoritiesInfo.data.materialGroups) ||
        state.organizations.authoritiesInfo.data.hasAllMaterialGroups,
    }),
    ...mapGetters(['users']),
  },
  watch: {
    // eslint-disable-next-line
    "organization.id": function(newValue) {
      if (newValue) {
        this.isLoading = true;
        this.loadUsersData();
      }
    },
  },
  methods: {
    ...mapActions({
      getUsers: GET_USERS,
      getRoles: GET_ROLES,
    }),
    loadUsersData() {
      Promise.all([
        this.getUsers(this.organization.id),
        this.getRoles(this.organization.hierarchyId),
      ]).then(() => {
        this.isLoading = false;
      });
    },
    submit() {
      const submitAction = {
        [OPERATION_USER_OPTIONS.ADD]: (userForm) => {
          const user = {
            ...pick(userForm, ['organizationId', 'userEmailNum', 'roles', 'hasAllMaterials']),
            materialCodes: userForm.materials.map(material => material.code),
          };
          return addUser(user);
        },
        [OPERATION_USER_OPTIONS.EDIT]: (userForm) => {
          const user = {
            ...pick(userForm, ['userId', 'organizationId', 'userEmailNum', 'roles', 'hasAllMaterials']),
            materialCodes: userForm.materials.map(material => material.code),
          };
          return editUser(user);
        },
      };
      this.$refs.userEditForm.submit(submitAction[this.operateType]);
    },
    handleUpdateUserSuccess() {
      this.showAddUserModal = false;
      this.loadUsersData();
    },
    handleUpdateUserFailed() {
      this.preventModalClose();
    },
    handleAddUser() {
      if (!this.isOrganizationAuthorityConfigured) {
        this.$Modal.error({
          title: '不能新增人员',
          content: '还未配置组织权限，无法新增人员',
          okText: '好的',
        });
      } else {
        this.resetUserInfoForForm();
        this.operateType = OPERATION_USER_OPTIONS.ADD;
        this.showAddUserModal = true;
      }
    },
    handleDeleteUser(userId) {
      this.$confirmModal.show({
        title: '确认删除',
        content: '确认删除该人员权限吗？',
        action: () => deleteUser(userId),
        onSuccess: () => this.loadUsersData(),
        onFail: (error) => {
          this.showGlobalError(error.errorMessage);
        },
      });
    },
    handleOperateUser(type, user) {
      this.resetUserInfoForForm();
      this.userInfoForModalForm = {
        ...this.userInfoForModalForm,
        userId: user.id,
        userEmailNum: user.userEmailNum,
        userNameAndEmail: user.userNameAndEmail,
        roles: user.roles,
        materials: user.materials,
        hasAllMaterials: user.hasAllMaterials,
      };
      this.operateType = type;
      this.showAddUserModal = true;
    },
    renderOperateUser(h, { row }) {
      return (
        <SkynetUserOperationColumn
          onDeleteUser={() => {
            this.handleDeleteUser(row.id);
          }}
          onOperateUser={({ type }) => {
            this.handleOperateUser(type, row);
          }}
        />
      );
    },
    resetUserInfoForForm() {
      this.userInfoForModalForm = {
        organization: {
          id: this.organization.id,
          name: this.organization.name,
        },
        userId: 0,
        userNameAndEmail: '',
        roles: [],
        materials: [],
      };
    },
  },
  components: {
    SkynetUserEditForm,
    SkynetLoadable,
    SkynetUserOperationColumn,
  },
  created() {
    if (this.organization && this.organization.id) {
      this.loadUsersData();
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/var.scss";

.ivu-table-wrapper {
  height: calc(100% - 80px);
  margin: 0 29px 0 29px;
  position: relative;
  border-bottom: 0;
  border-right: 0;
}
.form-item-menu {
  margin-bottom: 0;
}
.ivu-table-large th {
  height: 62px;
}

.loading {
  width: 100%;
  top: 50%;
  margin: 0 auto;
  position: absolute;
}
</style>
