<template>
  <Modal
    width="560"
    :value="shouldShow"
    class-name="filter-modal-wrap"
    :loading="modalLoading"
    :mask-closable="false"
    :title="modalTitle"
    @on-visible-change="handleModalVisibleChange">
    <Form ref="filterForm" :model="filterForm" :rules="ruleValidate" :label-width="105"
          class="filter-form">
      <SkynetFilterTitleTip :title="type.title" :content="type.content"/>
      <FormItem ref="date" label="日期" prop="date">
        <el-date-picker type="datetimerange"
                        ref="datePicker"
                        v-model="filterForm.date"
                        :editable="false"
                        :picker-options="datePickerOptions"
                        :default-time="['00:00:00', '23:59:59']"/>
      </FormItem>
      <FormItem label="供应商" class="tag-input-form-item">
        <SkynetTagInput
          class="filter-tag-input"
          ref="vendorsInput"
          v-model="filterForm.vendors"
          placeholder="输入供应商ID，按回车匹配"
          :validateInput="validateVendorsInput"/>
      </FormItem>
      <FormItem ref="vendors" prop="vendors">
        <Input :value="vendorsForInput" class="hidden-form-input"/>
      </FormItem>
      <FormItem label="物料组" class="tag-input-form-item">
        <SkynetTagInput
          class="filter-tag-input"
          ref="materialGroupsInput"
          v-model="filterForm.materialGroups"
          placeholder="输入物料组ID，按回车匹配"
          :validateInput="validateMaterialGroupsInput"/>
      </FormItem>
      <FormItem ref="materialGroups" prop="materialGroups">
        <Input :value="materialGroupsForInput" class="hidden-form-input" />
      </FormItem>
      <FormItem label="物料" class="tag-input-form-item" v-show="shouldShowMaterialsInput">
        <SkynetTagInput
          class="filter-tag-input"
          ref="materialsInput"
          v-model="filterForm.materials"
          placeholder="输入物料ID，按回车匹配"
          :validateInput="validateMaterialsInput"/>
      </FormItem>
      <FormItem ref="materials" prop="materials">
        <Input :value="materialsForInput" class="hidden-form-input"/>
      </FormItem>
      <FormItem label="检验员" class="tag-input-form-item" v-show="shouldShowInspectorsInput">
        <SkynetTagInput
          class="filter-tag-input"
          ref="inspectorsInput"
          v-model="filterForm.inspectors"
          placeholder="输入检验员ID，按回车匹配"
          :validateInput="validateInspectorsInput"/>
      </FormItem>
      <FormItem ref="inspectors" prop="inspectors" v-show="shouldShowInspectorsInput">
        <Input :value="inspectorsForInput" class="hidden-form-input"/>
      </FormItem>
      <FormItem label="合格率<=" prop="qualificationRate"
                ref="qualificationRateInput">
        <Input v-model="filterForm.qualificationRate"
               class="qualify-condition-value-input">
          <span slot="suffix">%</span>
        </Input>
      </FormItem>
      <FormItem label="不合格批数>=" v-show="shouldShowUnqualifiedBatchesInput">
        <InputNumber :min="1" v-model="filterForm.unqualifiedBatches"
                     class="qualify-condition-value-input"
                     :parser="value => value.replace('.', '')"/>
      </FormItem>
      <FormItem class="form-wrapper" label="不合格类别">
        <SkynetUnqualifiedTypeFilter ref="skynetUnqualifiedTypeFilter"
                                     :unqualifiedTypes="filterForm.unqualifiedTypes"
                                     :shouldReceiveDouble="shouldReceiveDouble"/>
      </FormItem>
      <FormItem prop="unqualifiedTypes" :show-message="false">
        <Input :value="unqualifiedTypesForInput" class="hidden-form-input"/>
      </FormItem>
      <FormItem class="form-wrapper" label="不合格原因">
        <SkynetUnqualifiedReasonFilter ref="skynetUnqualifiedReasonFilter"
                                       :unqualifiedReasons="filterForm.unqualifiedReasons"
                                       @addReason="onAddReason"
                                       :shouldReceiveDouble="shouldReceiveDouble"/>
      </FormItem>
      <FormItem prop="unqualifiedReasons" :show-message="false" class="hidden-form-item">
        <Input class="hidden-form-input"/>
      </FormItem>
    </Form>
    <SkynetModalFooter slot="footer"
                       :modalVisible.sync="shouldShow"
                       :loading="modalLoading"
                       okText="筛选"
                       cancelText="重置"
                       :cancel="handleReset"
                       :ok="handleOk"/>
  </Modal>
</template>

<script>
import { cloneDeep } from 'lodash';
import SkynetFilterTitleTip from '@/components/FilterTitleTip.vue';
import SkynetTagInput from '@/components/TagInput.vue';
import SkynetModalFooter from '@/components/ModalFooter.vue';
import SkynetUnqualifiedTypeFilter from '@/components/UnqualifiedTypeFilter.vue';
import SkynetUnqualifiedReasonFilter from '@/components/UnqualifiedReasonFilter.vue';
import formValidation from '@/mixins/formValidation';
import modalExtension from '@/mixins/modalExtension';
import filterModalExtension from '@/mixins/filterModalExtension';
import { getMaterialByCode } from '@/services/report.service';
import {
  REPORT_FILTER_TYPE,
  DATA_ENTRANCE_MENU_NAME,
  FULL_DETAIL_FILTER_TIP,
} from '@/utils/constant';
import {
  getDefaultDateRange,
  getDefaultUnqualifiedReasons,
  getDefaultUnqualifiedTypeFilterConditions,
} from '@/utils/util';

export default {
  name: 'SkynetFilterModal',
  components: {
    SkynetFilterTitleTip,
    SkynetTagInput,
    SkynetModalFooter,
    SkynetUnqualifiedTypeFilter,
    SkynetUnqualifiedReasonFilter,
  },
  props: {
    shouldShow: {
      type: Boolean,
      default: false,
    },
    modalTitle: {
      type: String,
      default: '抽检筛选条件',
    },
    type: {
      type: Object,
    },
    form: {
      type: Object,
    },
    submit: {
      type: Function,
    },
    inspectionType: {
      type: String,
    },
  },
  mixins: [formValidation, modalExtension, filterModalExtension],
  computed: {
    shouldShowInspectorsInput() {
      return this.type.value === REPORT_FILTER_TYPE[2].value;
    },
    shouldShowMaterialsInput() {
      return this.type.value === FULL_DETAIL_FILTER_TIP.value;
    },
    shouldShowUnqualifiedBatchesInput() {
      return this.inspectionType === DATA_ENTRANCE_MENU_NAME.SAMPLE;
    },
    materialsForInput() {
      return JSON.stringify(this.filterForm.materials);
    },
    shouldReceiveDouble() {
      return this.inspectionType === DATA_ENTRANCE_MENU_NAME.FULL;
    },
  },
  data() {
    return {
      filterForm: {
        date: [],
        materialGroups: [],
        materials: [],
        vendors: [],
        inspectors: [],
        qualificationRate: null,
        unqualifiedBatches: null,
        unqualifiedTypes: [],
        unqualifiedReasons: [],
      },
      ruleValidate: {
        materialGroups: [
          { validator: this.validateTagInputs, trigger: 'change' },
        ],
        vendors: [
          { validator: this.validateTagInputs, trigger: 'change' },
        ],
        inspectors: [
          { validator: this.validateTagInputs, trigger: 'change' },
        ],
        materials: [
          { validator: this.validateTagInputs, trigger: 'change' },
        ],
        unqualifiedTypes: [
          { validator: this.validateUnqualifiedTypes, trigger: 'change' },
        ],
        unqualifiedReasons: [
          { validator: this.validateUnqualifiedReasons, trigger: 'change' },
        ],
        qualificationRate: [
          { validator: this.validateQualificationRate, trigger: 'blur' },
        ],
      },
    };
  },
  methods: {
    validateQualificationRate(rule, value, callback) {
      this.validateRate(rule, value, callback, this.filterForm);
    },
    onAddReason() {
      this.$nextTick(() => {
        document.querySelector('.filter-form').scrollTop = document.querySelector('.filter-form').scrollHeight;
      });
    },
    initDefaultData() {
      this.filterForm.date = getDefaultDateRange();
      this.filterForm.unqualifiedReasons = getDefaultUnqualifiedReasons();
      this.filterForm.unqualifiedTypes = getDefaultUnqualifiedTypeFilterConditions();
      this.filterForm.unqualifiedBatches = null;
    },
    validateUnqualifiedTypes(rule, value, callback) {
      this.validateInnerForm(rule, value, callback, 'skynetUnqualifiedTypeFilter');
    },
    validateUnqualifiedReasons(rule, value, callback) {
      this.validateInnerForm(rule, value, callback, 'skynetUnqualifiedReasonFilter');
    },
    validateInnerForm(rule, value, callback, refName) {
      this.$refs[refName].$refs.filterConditionForm.validate((filterConditionValid) => {
        if (filterConditionValid) {
          callback();
        }

        callback(new Error(''));
      });
    },
    handleModalVisibleChange(modalVisible) {
      this.toggleShowModal(modalVisible);
      if (modalVisible) {
        this.filterForm = cloneDeep(this.form);
        this.clearValidateError();
      }
    },
    clearValidateError() {
      this.$refs.qualificationRateInput.validateState = '';
      this.$refs.qualificationRateInput.validateMessage = '';
      this.$refs.skynetUnqualifiedTypeFilter.clearValidateError();
      this.$refs.skynetUnqualifiedReasonFilter.clearValidateError();
    },
    handleReset() {
      this.$refs.filterForm.resetFields();
      this.initDefaultData();
      this.$refs.skynetUnqualifiedTypeFilter.resetForm();
      this.$refs.skynetUnqualifiedReasonFilter.resetForm();
    },
    removeAllEmptyUnqualifiedReasons() {
      this.removeAllEmptyItem(
        this.filterForm.unqualifiedReasons,
        item => !item.code && !item.value,
      );
    },
    removeAllEmptyUnqualifiedTypes() {
      this.removeAllEmptyItem(
        this.filterForm.unqualifiedTypes,
        item => (!item.selected) && !item.value,
      );
    },
    removeAllEmptyItem(array, isEmptyFunc) {
      const toRemoveIndexs = [];
      array.forEach((item, index) => {
        if (isEmptyFunc(item)) {
          toRemoveIndexs.push(index);
        }
      });

      let i = toRemoveIndexs.length - 1;
      const minIndex = toRemoveIndexs.length === array.length ? 1 : 0;
      for (; i >= minIndex; i -= 1) {
        array.splice(toRemoveIndexs[i], 1);
      }
    },
    validateMaterialsInput(tagCode) {
      return this.validateInput(getMaterialByCode, tagCode);
    },
    handleOk() {
      this.$refs.filterForm.validate((valid) => {
        if (valid) {
          this.removeAllEmptyUnqualifiedReasons();
          this.removeAllEmptyUnqualifiedTypes();

          this.$emit('ok', {
            filterTypeValue: this.type.value,
            filterForm: cloneDeep(this.filterForm),
          });
          if (this.submit) {
            this.submit();
          }
          this.$nextTick(() => this.toggleShowModal(false));
        } else {
          this.preventModalClose();
        }
      });
    },
  },
};
</script>

<style lang="scss">
  @import '@/components/data/filter-modal.scss';
.filter-form{
  height: 570px;
  overflow-y: auto;
  padding-right: 15px;
}
.tag-input-form-item {
  margin-bottom: -8px;
}
.hidden-form-item {
  margin-bottom: 0;
}
.qualify-condition-value-input {
  width: 180px;
}
.ivu-select-dropdown {
  max-height: 300px;
}
</style>
