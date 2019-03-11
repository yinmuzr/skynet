<template>
  <Form :label-width="80" ref="userForm" :model="userForm" :rules="ruleValidate">
    <FormItem label="所属组织" prop="organization.name" ref="organizationId">
      <Input  placeholder="输入组织名称" v-model="userForm.organization.name" disabled/>
    </FormItem>
    <FormItem ref="userEmailNum" label="人员名称" prop="userEmailNum">
      <SkynetCustomInput
        ref="userInput"
        placeholder="输入人员ID进行匹配"
        :disabled="isEdit || isLoadingUserByEmailNum"
        v-model="userForm.userEmailNum"
        :nameToShow="userNameAndEmail"
        @showName="validateUserField"
        @resetName="resetUserNameAndEmail"/>
    </FormItem>
    <FormItem label="物料权限">
      <Select
        :transfer="true"
        @on-change="handleAllMaterialsSelectorChange"
        v-model="userForm.hasAllMaterialsFlag">
        <Option :value=material_options.part>所管辖的部分物料</Option>
        <Option :value=material_options.all>所管辖的全部物料</Option>
      </Select>
    </FormItem>
    <FormItem class="form-item-materials">
      <SkynetTagInput
          class="materials-tag-input"
          v-model="userForm.materials"
          :disabled="userForm.hasAllMaterials"
          :placeholder="placeholder"
          :description="description"
          :validateInput="validateTagsInput"/>
    </FormItem>
    <FormItem ref="materials" prop="materials">
      <Input :value="materialsForInput" style="display: none;"/>
    </FormItem>
    <FormItem ref="roles" label="角色" prop="roles">
      <Select ref="rolesSelect" multiple placeholder="选择人员对应的角色，可多选"
        v-model="userForm.roles"
        :transfer="true"
        @on-change="handleChangeRoleSelect">
        <Option v-for="role in rolesOptions" :value="role.id" :key="role.id">{{ role.name }}</Option>
    </Select>
    </FormItem>
  </Form>
</template>

<script type="text/jsx">
import { cloneDeep, trim } from 'lodash';
import formValidation from '@/mixins/formValidation';
import SkynetCustomInput from '@/components/CustomInput.vue';
import SkynetTagInput from '@/components/TagInput.vue';
import { getUser } from '@/services/user.service';
import { getMaterialByOrgIdAndCode } from '@/services/organization.service';
import { ERROR, MATERIAL_OPTIONS } from '@/utils/constant';

export default {
  name: 'SkynetUserEditForm',
  components: {
    SkynetCustomInput,
    SkynetTagInput,
  },
  props: {
    userInfo: {
      userId: Number,
      userEmailNum: String,
      userNameAndEmail: {
        type: String,
        default: '',
      },
      organization: {
        id: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
      roles: Array,
      materials: Array,
      hasAllMaterials: Boolean,
    },
    rolesOptions: Array,
    isEdit: Boolean,
  },
  mixins: [formValidation],
  data() {
    return {
      userForm: {
        ...cloneDeep(this.userInfo),
        roles: this.userInfo.roles.map(role => role.id),
        cachedMaterials: cloneDeep(this.userInfo.materials),
        hasAllMaterialsFlag: this.userInfo.hasAllMaterials ? MATERIAL_OPTIONS.ALL : MATERIAL_OPTIONS.PART,
      },
      isLoadingUserByEmailNum: false,
      userNameAndEmail: this.userInfo.userNameAndEmail || '',
      originalUserEmailNum: this.userInfo.userEmailNum,
      ruleValidate: {
        userEmailNum: [
          { required: true, message: ERROR.REQUIRED, trigger: 'change' },
          { validator: this.validateUser, trigger: 'enter' },
        ],
        roles: [
          {
            required: true, type: 'array', min: 1, message: ERROR.REQUIRED, trigger: 'change',
          },
        ],
        materials: [
          { validator: this.validateMaterials, trigger: 'change' },
        ],
      },
      material_options: {
        all: MATERIAL_OPTIONS.ALL,
        part: MATERIAL_OPTIONS.PART,
      },
      placeholder: '输入物料ID，回车进行匹配',
      description: '本组织所管辖的全部物料，与组织权限同步更新',
    };
  },
  computed: {
    materialsForInput() {
      return this.userForm.hasAllMaterials ? MATERIAL_OPTIONS.ALL : JSON.stringify(this.userForm.materials);
    },
  },
  methods: {
    submit(action) {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          action({
            ...this.userForm,
            organizationId: this.userForm.organization.id,
          })
            .then(() => {
              this.$emit('submitSuccess');
            })
            .catch((error) => {
              this.submitErrorHandler(error, this.userForm);
              this.$emit('submitFailed');
            });
        } else {
          this.$emit('submitFailed');
        }
      });
    },
    resetUserNameAndEmail() {
      this.userNameAndEmail = '';
    },
    validateUserField() {
      this.$refs.userForm.validateField('userEmailNum');
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
            if (value !== this.originalUserEmailNum && data.skynetUser) {
              return callback(new Error(ERROR.USER_DUPLICATED));
            }
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
      } else {
        return callback();
      }
    },
    validateMaterials(rule, value, callback) {
      if (this.userForm.hasAllMaterials) {
        return callback();
      }
      if (value.length === 0) {
        return callback(new Error(ERROR.REQUIRED));
      }
      return this.validateTags(rule, value, callback, this.userForm);
    },
    validateTagsInput(tagCode) {
      return getMaterialByOrgIdAndCode(this.userForm.organization.id, trim(tagCode))
        .catch((error) => {
          if ((error.status === 404 || error.status === 400)) {
            return Promise.reject(new Error(error.data.code));
          }
          return Promise.reject(new Error(ERROR.NETWORK));
        });
    },
    input(tagUpdated) {
      this.userForm.materials = tagUpdated;
    },
    handleAllMaterialsSelectorChange(value) {
      this.userForm.hasAllMaterials = value === MATERIAL_OPTIONS.ALL;
      if (this.userForm.hasAllMaterials) {
        this.userForm.cachedMaterials = this.userForm.materials;
        this.userForm.materials = [];
      } else {
        this.userForm.materials = this.userForm.cachedMaterials;
      }
    },
    handleChangeRoleSelect(item) {
      if (item.length) {
        this.$refs.rolesSelect.hideMenu();
      }
    },
  },
  mounted() {
    this.focusInput(this.$refs.userInput);
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/var.scss";
.materials-tag-input {
  height: 220px;
}
.form-item-materials {
  margin-bottom: -10px;
}
</style>
