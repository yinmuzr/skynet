<template>
  <div class="role-list">
    <Row class='title-container'>
      <span class="section-title">
        角色配置
      </span>
      <Button v-if="hasRoleOperateAuthority" size="large" type="primary" class="add-button" @click="handleAddRole">
        <Icon type="ios-add" class="add-button-icon"></Icon>
        新增角色
      </Button>
    </Row>
    <SkynetLoadable :show-loading="isLoading">
      <Table
          stripe
          size="large"
          no-data-text=""
          :columns="columns"
          :data="roles"
      />
    </SkynetLoadable>
    <Modal
        v-model="showAddRoleModal"
        :loading="modalLoading"
        :title="modalTitle"
        :mask-closable="false"
        @on-ok="handleSubmit">
      <SkynetRoleEditForm
          v-if="showAddRoleModal"
          ref="roleEditForm"
          :role-info="roleInfoForModalForm"
          :menuData="menuData"
          @submitSuccess="handleUpdateRoleSuccess"
          @submitFailed="handleUpdateRoleFailed"
      />
    </Modal>
  </div>
</template>

<script type="text/jsx">
import { mapActions, mapState, mapGetters } from 'vuex';
import { GET_ROLES } from '@/store/roles.module';
import SkynetLoadable from '@/components/Loadable.vue';
import SkynetRoleOperationColumn from '@/components/role/RoleOperationColumn.vue';
import { addRole, editRole, deleteRole } from '@/services/role.service';
import SkynetRoleEditForm from '@/components/role/RoleEditForm.vue';
import SkynetColumnTip from '@/components/ColumnTip.vue';
import { OPERATION_ROLE_OPTIONS, OPERATION_ROLE_MODAL_TITLE } from '@/utils/constant';
import formValidation from '@/mixins/formValidation';
import tableExtension from '@/mixins/tableExtension';
import modalExtension from '@/mixins/modalExtension';
import { SYS_AUTHORITIES } from '@/utils/auth';
import { trim } from 'lodash';

export default {
  name: 'SkynetRoleList',
  props: {
    hierarchy: Object,
  },
  data() {
    return {
      roleInfoForModalForm: {
        hierarchy: {
          id: 1,
          name: '',
        },
        roleName: '',
        authorityIds: [],
      },
      isLoading: true,
      showAddRoleModal: false,
      modalLoading: true,
      operateType: '',
    };
  },
  mixins: [formValidation, tableExtension, modalExtension],
  computed: {
    modalTitle() {
      return OPERATION_ROLE_MODAL_TITLE[this.operateType];
    },
    ...mapState({
      menuData: state => state.menus.menus,
    }),
    ...mapGetters(['roles', 'userHasAuthority']),
    hasRoleOperateAuthority() {
      return this.userHasAuthority(SYS_AUTHORITIES.AUTHORITY_HIERARCHY_AND_ROLE_CONFIGURABLE);
    },
    columns() {
      const allColumns = [
        {
          title: '所属层级',
          key: 'hierarchyName',
          width: '11%',
          render: this.renderColumn,
        },
        {
          title: '角色名称',
          key: 'roleName',
          width: '11%',
          render: this.renderColumn,
        },
        {
          title: '菜单权限',
          key: 'menuName',
          width: '65%',
          render: this.renderColumn,
        },
        {
          title: '操作',
          key: 'action',
          width: '13%',
          render: this.renderOperateRole,
        },
      ];

      return this.hasRoleOperateAuthority ? allColumns : allColumns.slice(0, allColumns.length - 1);
    },
  },
  watch: {
    // eslint-disable-next-line
    "hierarchy.id": function(newValue) {
      if (newValue) {
        this.isLoading = true;
        this.getRoleList(newValue);
      }
    },
  },
  methods: {
    ...mapActions({
      getRoles: GET_ROLES,
    }),
    getRoleList(hierarchyId) {
      this.getRoles(hierarchyId).then(() => {
        this.isLoading = false;
      });
    },
    submit() {
      const submitAction = {
        [OPERATION_ROLE_OPTIONS.ADD]: roleForm => (addRole(
          roleForm.hierarchy.id,
          trim(roleForm.roleName),
          roleForm.authorityIds,
        )),
        [OPERATION_ROLE_OPTIONS.EDIT]: roleForm => (editRole(
          roleForm.id,
          trim(roleForm.roleName),
          roleForm.authorityIds,
        )),
      };
      this.$refs.roleEditForm.submit(submitAction[this.operateType]);
    },
    preventModalClose() {
      this.modalLoading = false;
      setTimeout(() => {
        this.modalLoading = true;
      }, 0);
    },
    handleUpdateRoleSuccess() {
      this.showAddRoleModal = false;
      this.getRoleList(this.hierarchy.id);
    },
    handleUpdateRoleFailed() {
      this.preventModalClose();
    },
    handleAddRole() {
      this.resetRoleInfoForForm();
      this.operateType = OPERATION_ROLE_OPTIONS.ADD;
      this.showAddRoleModal = true;
    },
    handleOperateRole(type, role) {
      if (type === OPERATION_ROLE_OPTIONS.DELETE) {
        this.showDeleteConfirm(role);
        return;
      }

      this.resetRoleInfoForForm();
      this.roleInfoForModalForm = {
        ...this.roleInfoForModalForm,
        id: role.roleId,
        roleName: role.roleName,
        authorityIds: role.authorities.map(auth => auth.id),
      };
      this.operateType = type;
      this.showAddRoleModal = true;
    },
    showDeleteConfirm(role) {
      this.$confirmModal.show({
        title: '确认删除',
        content: '确定删除本角色吗？',
        action: () => deleteRole(role.roleId),
        onSuccess: () => this.getRoleList(this.hierarchy.id),
        onFail: (error) => {
          if (error.success === false && error.errorMessage) {
            this.showGlobalError(error.errorMessage);
          } else {
            this.showGlobalError();
          }
        },
      });
    },
    renderOperateRole(h, { row }) {
      return <SkynetRoleOperationColumn
        deletable={!row.systemRole}
        onOperateRole={({ type }) => {
          this.handleOperateRole(type, row);
        }}
      />;
    },
    resetRoleInfoForForm() {
      this.roleInfoForModalForm = {
        hierarchy: {
          id: this.hierarchy.id,
          name: this.hierarchy.name,
        },
        id: 0,
        roleName: '',
        authorityIds: [],
      };
    },
  },
  components: {
    SkynetRoleEditForm,
    SkynetLoadable,
    SkynetRoleOperationColumn,
    SkynetColumnTip,
  },
  created() {
    if (this.hierarchy.id) {
      this.getRoleList(this.hierarchy.id);
    }
  },
};
</script>
<style lang="scss" >
.ivu-table-header,
.ivu-table-body {
  & > table {
    width: 100% !important;
  }
}

tr.ivu-table-row-hover td {
  background-color: #ebf7ff !important;
}
.ivu-table-large th {
  height: 62px;
}
.ivu-table-large th:not(:first-child):before {
  content: '';
  display: inline-block;
  height: 1em;
  vertical-align: middle;
  border: solid 0.7px #c3ccd8;
}
.ivu-table-body {
  height: calc(100% - 62px);
}

</style>

<style lang="scss" scoped>
@import "@/styles/var.scss";

.role-list{
  height: 100%;
}

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
.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
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
