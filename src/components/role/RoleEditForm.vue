<template>
  <Form :label-width="80" ref="roleForm" :model="roleForm" :rules="ruleValidate">
    <FormItem label="对应层级" prop="hierarchy.name">
      <Input  placeholder="输入层级名称" v-model="roleForm.hierarchy.name" disabled/>
    </FormItem>
    <FormItem label="角色名称" ref= "roleName" prop="roleName">
      <Input ref="roleInput" placeholder="输入角色名称" v-model="roleForm.roleName" />
    </FormItem>
    <FormItem label="菜单权限" prop="authorityIdForInput" class="form-item-menu ivu-form-item-required">
      <Input name="authorityIdForInput" v-model="roleForm.authorityIdForInput" style="display: none"/>
      <SkynetCheckboxTree
        :data="menuData"
        :checkedNodeIds.sync="roleForm.authorityIds"
        ref="skynetRoleMenuTree"
        @on-checked-change="onRoleMenuTreeCheckedChange"
      />
    </FormItem>
  </Form>
</template>

<script type="text/jsx">
import SkynetCheckboxTree from '@/components/CheckboxTree';
import formValidation from '@/mixins/formValidation';
import { ERROR } from '@/utils/constant';

export default {
  name: 'SkynetRoleEditForm',
  components: {
    SkynetCheckboxTree,
  },
  props: {
    roleInfo: {
      id: Number,
      roleName: {
        type: String,
        required: true,
      },
      hierarchy: {
        id: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
      authorityIds: Array,
    },
    menuData: {
      type: Array,
      required: true,
    },
  },
  mixins: [formValidation],
  data() {
    return {
      roleForm: {
        ...this.roleInfo,
        authorityIdForInput: '',
      },
      ruleValidate: {
        roleName: [
          { required: true, message: ERROR.REQUIRED, trigger: 'change' },
        ],
        authorityIdForInput: [
          {
            required: true,
            message: ERROR.REQUIRED,
            trigger: 'change',
          },
        ],
      },
    };
  },

  methods: {
    onRoleMenuTreeCheckedChange() {
      this.roleForm.authorityIdForInput = this.roleForm.authorityIds.join(',');
    },
    submit(action) {
      this.$refs.roleForm.validate((valid) => {
        if (valid) {
          action(this.roleForm)
            .then(() => {
              this.$emit('submitSuccess');
            })
            .catch((error) => {
              this.submitErrorHandler(error, this.roleForm);
              this.$emit('submitFailed');
            });
        } else {
          this.$emit('submitFailed');
        }
      });
    },
  },
  mounted() {
    this.focusInput(this.$refs.roleInput);
  },
};
</script>

<style lang="scss" scoped>
  @import "@/styles/var.scss";
  .form-item-menu {
    margin-bottom: 0;
  }
</style>
