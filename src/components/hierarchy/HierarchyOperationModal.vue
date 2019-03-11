<template>
  <Modal
    v-model="showModal"
    :loading="modalLoading"
    :title="modalTitle"
    :mask-closable="false"
    @on-visible-change="handleModalVisibleChange"
    @on-ok="handleSubmit">
    <Form ref="hierarchyForm" inline
      class="single-line-form"
      :model="hierarchyForm"
      :rules="ruleValidate"
      @submit.native.prevent="preventDefault">
      <FormItem class="form-item-code" ref="name" label="层级名称" prop="name" :label-width="80">
        <Input ref="input" autofocus v-model="hierarchyForm.name" placeholder="输入层级名称，不超过6个字"/>
      </FormItem>
      <FormItem ref="hierarchyType" class="form-item-select">
        <Icon class="select-icon" :type="selectedHierarchyTypeIcon"/>
        <Select class="select hierarchy-type-select"
          :transfer="true"
          @on-change="clearValidationError"
          v-model="hierarchyForm.type"
          :disabled="isEdit">
          <Option v-for="item in hierarchyTypeOptions" :value="item.value" :key="item.value">
            <div v-if="!item.iconType" class="icon_place_holder" />
            <Icon class="icon" :type="item.iconType"/>{{ item.label }}
          </Option>
        </Select>
      </FormItem>
    </Form>
  </Modal>
</template>

<script>
import { trim } from 'lodash';
import { addHierarchy, updateHierarchyName } from '@/services/hierarchy.service';
import { OPERATION_MENU_OPTIONS, HIERARCHY_MODAL_TITLE, ERROR, HIERARCHY_TYPE_OPTIONS } from '@/utils/constant';
import { isEdit, getHierarchyTypeOption } from '@/utils/util';
import formValidation from '@/mixins/formValidation';
import modalExtension from '@/mixins/modalExtension';

export default {
  name: 'SkynetHierarchyOperationModal',
  props: {
    operationName: {
      type: String,
      required: true,
    },
    hierarchy: {
      type: Object,
      required: true,
    },
    success: {
      type: Function,
      required: true,
    },
  },
  mixins: [formValidation, modalExtension],
  data() {
    return {
      hierarchyForm: {
        name: '',
        type: HIERARCHY_TYPE_OPTIONS[0].value,
      },
      hierarchyTypeOptions: HIERARCHY_TYPE_OPTIONS,
      ruleValidate: {
        name: [
          { required: true, message: ERROR.REQUIRED, trigger: 'change' },
          {
            type: 'string', max: 6, message: ERROR.HIERARCHY_NAME_MAX_LIMIT, trigger: 'change',
          },
          {
            type: 'string', pattern: /^.*\S.*$/, message: ERROR.REQUIRED, trigger: 'change',
          },
          {
            type: 'string', pattern: /^.*\S.*$/, message: ERROR.REQUIRED, trigger: 'blur',
          },
        ],
      },
    };
  },
  computed: {
    modalTitle() {
      return this.operationName ? HIERARCHY_MODAL_TITLE[this.operationName] : '';
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
    isEdit() {
      return isEdit(this.operationName);
    },
    selectedHierarchyTypeIcon() {
      return getHierarchyTypeOption(this.hierarchyForm.type).iconType;
    },
  },
  methods: {
    handleOperationClick(currentDropdownItemName) {
      if (currentDropdownItemName) {
        this[currentDropdownItemName]();
      }
    },
    getOperationRequest() {
      if (this.operationName === OPERATION_MENU_OPTIONS.ADD) {
        return addHierarchy;
      } else if (this.operationName === OPERATION_MENU_OPTIONS.EDIT) {
        return updateHierarchyName;
      }
      return null;
    },
    submit() {
      this.$refs.hierarchyForm.validate((valid) => {
        if (valid) {
          const operation = this.getOperationRequest();
          if (!operation) { return; }
          operation(this.hierarchy.id, trim(this.hierarchyForm.name), this.hierarchyForm.type)
            .then(() => {
              this.showModal = false;
              this.success();
            })
            .catch((error) => {
              this.submitErrorHandler(error, this.hierarchyForm);
              this.preventModalClose();
            });
        } else {
          this.preventModalClose();
        }
      });
    },
    clearValidationError() {
      this.$refs.name.validateMessage = '';
      this.$refs.name.validateState = 'success';
    },
    handleModalVisibleChange(modalVisible) {
      if (modalVisible === false) {
        this.$refs.hierarchyForm.resetFields();
        this.hierarchyForm.type = HIERARCHY_TYPE_OPTIONS[0].value;
      } else {
        this.focusInput(this.$refs.input);
        if (this.isEdit) {
          this.hierarchyForm.name = this.hierarchy.name;
          this.hierarchyForm.type = this.hierarchy.type;
        }
      }
    },
  },
};
</script>

<style lang="scss">
.form-item-select {
  .select-icon {
    position: absolute;
    z-index: 1000;
    top: 6px;
  }
}
.hierarchy-type-select {
  .ivu-select-selected-value {
    padding-left: 30px !important;
  }
  .icon {
    position: absolute;
    left: 10px;
    margin-top: -3px;
  }
  .ivu-select-item {
    padding-left: 40px;
  }
}

.icon_place_holder {
  width: 30px;
  display: inline-block;
}
</style>
