<template>
  <Form class="organization-form"
    :label-width="100"
    ref="organizationForm"
    :model="organizationForm"
    :rules="ruleValidate">
    <FormItem label="所属组织" prop="name">
      <Input  placeholder="输入组织名称" v-model="organizationForm.organizationName" disabled/>
    </FormItem>
    <FormItem label="物料组权限">
      <Select
        :transfer="true"
        @on-change="handleAllMaterialGroupsSelectorChange"
        v-model="organizationForm.hasAllMaterialGroupsFlag">
        <Option :value=material_group_options.part>部分物料组</Option>
        <Option :value=material_group_options.all>全部物料组</Option>
      </Select>
    </FormItem>
    <FormItem class="form-item-menu">
      <SkynetTagInput
          ref="materialGroupsInput"
          v-model="organizationForm.materialGroups"
          :disabled="organizationForm.hasAllMaterialGroups"
          :placeholder="placeholder"
          :description="description"
          :validateInput="validateTagsInput"/>
    </FormItem>
    <FormItem ref="materialGroups" prop="materialGroups">
      <Input :value="materialGroupsForInput" style="display: none;"/>
    </FormItem>
    <FormItem class="form-item-menu" prop="privilegedOrganizationIds">
      <span slot="label" class="organization-label">
        组织权限
        <Tooltip :content="privilegedOrganizationTip" max-width="200" :transfer="true">
          <Icon class="tips-icon" type="skynet-exclamation-mark"/>
        </Tooltip>
      </span>
      <SkynetCheckboxTree
        allText="选择全部组织"
        emptyText="暂无可选组织节点，请先标记顶层基地和底层数据源"
        :data="privilegedOrganizationTree"
        :checkedNodeIds.sync="organizationForm.privilegedOrganizationIds"
      />
    </FormItem>
  </Form>
</template>

<script type="text/jsx">
import { cloneDeep, map, trim } from 'lodash';
import formValidation from '@/mixins/formValidation';
import SkynetTagInput from '@/components/TagInput.vue';
import SkynetCheckboxTree from '@/components/CheckboxTree';
import { getMaterialGroup } from '@/services/material.service';
import { ERROR, MATERIAL_OPTIONS } from '@/utils/constant';

export default {
  name: 'SkynetOrganizationEditForm',
  components: {
    SkynetTagInput,
    SkynetCheckboxTree,
  },
  props: {
    organization: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    authoritiesInfo: {
      data: {
        hasAllMaterialGroups: Boolean,
        materialGroups: Array,
      },
    },
    privilegedOrganizationTree: {
      type: Array,
      required: true,
    },
  },
  mixins: [formValidation],
  data() {
    return {
      organizationForm: {
        organizationId: this.organization.id,
        organizationName: this.organization.name,
        ...cloneDeep(this.authoritiesInfo.data),
        cachedMaterialGroups: cloneDeep(this.authoritiesInfo.data.materialGroups),
        hasAllMaterialGroupsFlag: this.authoritiesInfo.data.hasAllMaterialGroups
          ? MATERIAL_OPTIONS.ALL : MATERIAL_OPTIONS.PART,
        privilegedOrganizationIds: map(this.authoritiesInfo.data.privilegedOrganizations, item => item.id) || [],
      },
      ruleValidate: {
        materialGroups: [
          { validator: this.validateMaterialGroups, trigger: 'change' },
        ],
      },
      material_group_options: {
        all: MATERIAL_OPTIONS.ALL,
        part: MATERIAL_OPTIONS.PART,
      },
      privilegedOrganizationTip: '组织权限可选择从顶层基地到底层数据源的各组织。为保证选择到有效的数据，没有底层数据源组织的父层组织将不显示。',
    };
  },
  computed: {
    materialGroupsForInput() {
      return this.organizationForm.hasAllMaterialGroups ? MATERIAL_OPTIONS.ALL
        : JSON.stringify(this.organizationForm.materialGroups);
    },
    placeholder() {
      return this.organizationForm.hasAllMaterialGroups ? '' : '输入物料组ID，回车进行匹配';
    },
    description() {
      return this.organizationForm.hasAllMaterialGroups ? '数据库中的全部物料组，与数据库同步更新' : '';
    },
  },

  methods: {
    submit(action) {
      this.$refs.organizationForm.validate((valid) => {
        if (valid) {
          action({
            ...this.organizationForm,
            materialGroupCodes: this.$refs.materialGroupsInput.tags.map(materialGroup => materialGroup.code),
          })
            .then(() => {
              this.$emit('submitSuccess');
            })
            .catch((error) => {
              const errorData = error.data;
              if (errorData && errorData.notExistMaterialGroup) {
                const errorMaterGroupCode = errorData.notExistMaterialGroup;
                this.$refs.materialGroupsInput.markTagIsWrong(errorMaterGroupCode);
              } else if (errorData && errorData.missedMaterialGroups) {
                this.markInvalidField('materialGroups', '物料组权限没有包含全部人员物料权限');
              } else if (errorData && errorData.materialGroups) {
                this.markInvalidField('materialGroups', errorData.materialGroups);
              } else {
                this.showGlobalError();
              }
              this.$emit('submitFailed');
            });
        } else {
          this.$emit('submitFailed');
        }
      });
    },
    validateMaterialGroups(rule, value, callback) {
      if (!this.organizationForm.hasAllMaterialGroups) {
        if (value.length === 0) {
          return callback(new Error(ERROR.REQUIRED));
        }
        return this.validateTags(rule, value, callback, this.organizationForm);
      }
      return callback();
    },
    validateTagsInput(tagCode) {
      return getMaterialGroup(trim(tagCode)).catch((error) => {
        if (error.status === 500) {
          return Promise.reject(new Error(ERROR.NETWORK));
        }

        return Promise.reject(error);
      });
    },
    handleAllMaterialGroupsSelectorChange(value) {
      this.organizationForm.hasAllMaterialGroups = value === MATERIAL_OPTIONS.ALL;
      if (this.organizationForm.hasAllMaterialGroups) {
        this.organizationForm.cachedMaterialGroups = this.organizationForm.materialGroups;
        this.organizationForm.materialGroups = [];
      } else {
        this.organizationForm.materialGroups = this.organizationForm.cachedMaterialGroups;
      }
    },
  },
  mounted() {
    this.focusInput(this.$refs.materialGroupsInput);
  },
};
</script>
<style lang="scss" scoped>
  .organization-form {
    max-height: 500px;
    overflow: auto;

    .organization-label {
      line-height: 24px;
    }

    .form-item-menu {
      margin-bottom: 0;
    }

    .tag-input-container {
      height: 220px;
    }
  }
</style>
