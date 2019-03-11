<template>
  <Modal
    v-model="showModal"
    :loading="modalLoading"
    :title="modalTitle"
    :mask-closable="false"
    @on-visible-change="handleModalVisibleChange"
    @on-ok="handleSubmit">
    <Form ref="organizationForm" inline
      class="single-line-form"
      :model="organizationForm"
      :rules="ruleValidate"
      @submit.native.prevent="preventDefault">
      <FormItem ref="code" class="form-item-code" label="组织名称" prop="code" :label-width="80">
        <SkynetCustomInput
          ref="input"
          placeholder="输入组织ID按回车进行匹配"
          v-model="organizationForm.code"
          :nameToShow="organizationName"
          @showName="showOrganizationName"
          :disabled="isLoadingOrganizationMapping"
          @resetName="resetOrganizationName"/>
      </FormItem>
      <FormItem ref="hierarchyId" class="form-item-select organization-hierarchy-select">
        <Select :class="selectedIconTypeClass"  v-model="organizationForm.hierarchyId"
        :transfer="true"
        :disabled="isEdit">
          <Option v-for="item in hierarchyOptions" :value="item.id" :key="item.id">
            {{ item.name }}<Icon class="icon" :type="getIconType(item.hierarchyType)"/>
          </Option>
        </Select>
      </FormItem>
    </Form>
  </Modal>
</template>

<script>
import { trim, find } from 'lodash';
import { addOrganization, editOrganization, getGreeOrganizationByCode } from '@/services/organization.service';
import { ERROR, ORGANIZATION_MENU_TITLE, HIERARCHY_TYPE_OPTIONS, HIERARCHY_TYPE_CLASS } from '@/utils/constant';
import { isAdd, isEdit } from '@/utils/util';
import formValidation from '@/mixins/formValidation';
import modalExtension from '@/mixins/modalExtension';
import SkynetCustomInput from '@/components/CustomInput.vue';

export default {
  name: 'SkynetOrganizationOperationModal',
  components: {
    SkynetCustomInput,
  },
  props: {
    operationName: {
      type: String,
      required: true,
    },
    organization: {
      type: Object,
      required: true,
    },
    success: {
      type: Function,
      required: true,
    },
    hierarchyOptions: {
      type: Array,
      required: true,
    },
  },
  mixins: [formValidation, modalExtension],
  data() {
    const validateOrganizationCode = (rule, value, callback) => {
      if (value && !this.organizationName && !this.isLoadingOrganizationMapping) {
        this.isLoadingOrganizationMapping = true;
        getGreeOrganizationByCode(value)
          .then((organizationMapping) => {
            this.organizationName = `${organizationMapping.name} (${organizationMapping.code})`;
            callback();
          })
          .catch((error) => {
            this.organizationName = '';
            if (error.status === 500) {
              callback(new Error(ERROR.NETWORK));
            } else {
              callback(new Error(ERROR.INPUT));
            }
          }).finally(() => {
            this.isLoadingOrganizationMapping = false;
          });
      } else {
        callback();
      }
    };
    return {
      organizationForm: {
        code: '',
        hierarchyId: 0,
      },
      isLoadingOrganizationMapping: false,
      organizationName: '',
      ruleValidate: {
        code: [
          { required: true, message: ERROR.REQUIRED, trigger: 'change' },
          { required: true, message: ERROR.REQUIRED, trigger: 'blur' },
          { validator: validateOrganizationCode, trigger: 'blur' },
        ],
      },
    };
  },
  computed: {
    modalTitle() {
      return this.operationName ? ORGANIZATION_MENU_TITLE[this.operationName] : '';
    },
    isEdit() {
      return isEdit(this.operationName);
    },
    showModal: {
      get() {
        return !!this.operationName;
      },
      set(showModal) {
        if (!showModal) {
          this.$emit('resetOperation');
        }
      },
    },
    selectedIconTypeClass() {
      const selectedHierarchy = find(this.hierarchyOptions, option =>
        option.id === this.organizationForm.hierarchyId);
      return selectedHierarchy ? HIERARCHY_TYPE_CLASS[selectedHierarchy.hierarchyType] : '';
    },
  },
  methods: {
    handleOperationClick(currentDropdownItemName) {
      if (currentDropdownItemName) {
        this[currentDropdownItemName]();
      }
    },
    showOrganizationName() {
      this.$refs.organizationForm.validateField('code');
    },
    resetOrganizationName() {
      this.organizationName = '';
    },
    operateOrganization() {
      if (this.isEdit) {
        return editOrganization(this.organization.id, trim(this.organizationForm.code));
      }

      return addOrganization(this.organization.id, this.organizationForm.hierarchyId, trim(this.organizationForm.code));
    },
    submit() {
      this.$refs.organizationForm.validate((valid) => {
        if (valid) {
          this.operateOrganization()
            .then(() => {
              this.showModal = false;
              this.success();
            })
            .catch((error) => {
              this.submitErrorHandler(error, this.organizationForm);
              this.preventModalClose();
            });
        } else {
          this.preventModalClose();
        }
      });
    },
    handleModalVisibleChange(modalVisible) {
      if (modalVisible === false) {
        this.$refs.organizationForm.resetFields();
        this.organizationName = '';
        this.$refs.input.currentValue = '';
      } else {
        if (isAdd(this.operationName)) {
          this.focusInput(this.$refs.input);
        }
        if (this.isEdit) {
          this.organizationForm.code = this.organization.code;
          this.showOrganizationName();
        }
        this.$nextTick(() => {
          this.organizationForm.hierarchyId = this.hierarchyOptions[0] && this.hierarchyOptions[0].id;
        });
      }
    },
    getIconType(hierarchyType) {
      const currentHierarchyType = find(HIERARCHY_TYPE_OPTIONS, option => option.value === hierarchyType);
      return currentHierarchyType ? currentHierarchyType.iconType : '';
    },
  },
};
</script>
