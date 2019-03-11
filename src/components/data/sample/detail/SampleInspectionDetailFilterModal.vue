<template>
  <Modal
    width="520"
    :value="shouldShow"
    class-name="filter-modal-wrap"
    :mask-closable="false"
    :loading="modalLoading"
    :title="modalTitle"
    @on-visible-change="handleModalVisibleChange">
    <Form ref="filterForm" :model="filterForm" :rules="ruleValidate" :label-width="100">
      <SkynetFilterTitleTip :title="titleTip.title" :content="titleTip.content"/>
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
      <FormItem label="物料" class="tag-input-form-item">
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
      <FormItem label="检验员" class="tag-input-form-item">
        <SkynetTagInput
          class="filter-tag-input"
          ref="inspectorsInput"
          v-model="filterForm.inspectors"
          placeholder="输入检验员ID，按回车匹配"
          :validateInput="validateInspectorsInput"/>
      </FormItem>
      <FormItem ref="inspectors" prop="inspectors">
        <Input :value="inspectorsForInput" class="hidden-form-input"/>
      </FormItem>
      <FormItem ref="inspectedConclusions" prop="inspectedConclusions" label="检验结论">
        <Select v-model="filterForm.inspectionConclusion" clearable
                ref="inspectedConclusionsSelect"
                :transfer="true"
                @on-change="handleInspectedConclusionChange"
                placeholder="选择检验结论" >
          <Option v-for="item in inspectedConclusionList"
                  :value="item"
                  :key="item">{{ item }}
          </Option>
        </Select>
      </FormItem>
      <FormItem ref="unqualifiedTypes" prop="unqualifiedTypes" label="不合格类别"
                v-if="shouldShowUnqualifedReasonsAndType">
        <Select v-model="filterForm.unqualifiedTypes" clearable placeholder="选择不合格类别"
                :transfer="true"
                ref="unqualifiedTypesSelect"
                @on-change="handleUnqualifiedTypesSelectChange"
                multiple>
          <Option v-for="item in unqualifiedTypeList"
                  :value="item"
                  :key="item">{{ item}}
          </Option>
        </Select>
      </FormItem>
      <FormItem label="不合格原因" class="tag-input-form-item" v-if="shouldShowUnqualifedReasonsAndType">
        <SkynetTagInput
          class="filter-tag-input"
          ref="unqualifiedReasonsInput"
          v-model="filterForm.unqualifiedReasons"
          placeholder="输入原因ID，按回车匹配"
          :validateInput="validateUnqualifiedReasonsInput"/>
      </FormItem>
      <FormItem ref="unqualifiedReasons" prop="unqualifiedReasons" v-if="shouldShowUnqualifedReasonsAndType">
        <Input :value="unqualifiedReasonsForInput" class="hidden-form-input"/>
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
import {
  SAMPLE_DETAIL_FILTER_TIP,
  DEFAULT_UNQUALIFIED_REASONS_AND_TYPE,
  DEFAULT_FILTER_FORM,
  UNQUALIFIED_CATEGORY,
} from '@/utils/constant';
import formValidation from '@/mixins/formValidation';
import modalExtension from '@/mixins/modalExtension';
import filterModalExtension from '@/mixins/filterModalExtension';
import SkynetFilterTitleTip from '@/components/FilterTitleTip.vue';
import SkynetModalFooter from '@/components/ModalFooter.vue';
import SkynetTagInput from '@/components/TagInput.vue';
import { getDefaultDateRange } from '@/utils/util';
import { isEmpty, cloneDeep } from 'lodash';
import { getMaterialByCode } from '@/services/report.service';

export default {
  name: 'SkynetSampleInspectionDetailFilterModal',
  components: {
    SkynetFilterTitleTip,
    SkynetModalFooter,
    SkynetTagInput,
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
    form: {
      type: Object,
    },
    submit: {
      type: Function,
    },
  },
  computed: {
    materialsForInput() {
      return JSON.stringify(this.filterForm.materials);
    },
  },
  mixins: [formValidation, modalExtension, filterModalExtension],
  data() {
    return {
      unqualifiedReasonsAndTypesCache: DEFAULT_UNQUALIFIED_REASONS_AND_TYPE,
      shouldShowUnqualifedReasonsAndType: false,
      titleTip: SAMPLE_DETAIL_FILTER_TIP,
      filterForm: DEFAULT_FILTER_FORM,
      ruleValidate: {
        vendors: [
          {
            validator: this.validateTagInputs,
            trigger: 'change',
          },
        ],
        materials: [
          {
            validator: this.validateTagInputs,
            trigger: 'change',
          },
        ],
        inspectors: [
          {
            validator: this.validateTagInputs,
            trigger: 'change',
          },
        ],
        unqualifiedReasons: [
          {
            validator: this.validateTagInputs,
            trigger: 'change',
          },
        ],
        materialGroups: [
          {
            validator: this.validateTagInputs,
            trigger: 'change',
          },
        ],
      },
      unqualifiedTypeList: UNQUALIFIED_CATEGORY,
      inspectedConclusionList: {
        qualified: '合格',
        unqualified: '不合格',
      },
    };
  },
  methods: {
    handleInspectedConclusionChange(item) {
      this.shouldShowUnqualifedReasonsAndType = (item === this.inspectedConclusionList.unqualified);
      if (isEmpty(item)) {
        this.unqualifiedReasonsAndTypesCache = DEFAULT_UNQUALIFIED_REASONS_AND_TYPE;
        this.filterForm = {
          ...this.filterForm,
          ...this.unqualifiedReasonsAndTypesCache,
        };
        return;
      }
      if (!this.shouldShowUnqualifedReasonsAndType) {
        this.unqualifiedReasonsAndTypesCache = {
          unqualifiedReasons: this.filterForm.unqualifiedReasons,
          unqualifiedTypes: this.filterForm.unqualifiedTypes,
        };
        this.filterForm = {
          ...this.filterForm,
          ...DEFAULT_UNQUALIFIED_REASONS_AND_TYPE,
        };
      }
      if (this.shouldShowUnqualifedReasonsAndType) {
        this.filterForm = {
          ...this.filterForm,
          ...this.unqualifiedReasonsAndTypesCache,
        };
      }
    },
    handleUnqualifiedTypesSelectChange(item) {
      if (item.length) {
        this.$refs.unqualifiedTypesSelect.hideMenu();
      }
    },
    handleReset() {
      this.$refs.filterForm.resetFields();
      this.initDefaultData();
    },
    handleOk() {
      this.$refs.filterForm.validate((valid) => {
        if (valid) {
          this.$emit('ok', {
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
    handleModalVisibleChange(modalVisible) {
      this.toggleShowModal(modalVisible);
      if (modalVisible) {
        this.filterForm = { ...this.form };
      }
    },
    validateMaterialsInput(tagCode) {
      return this.validateInput(getMaterialByCode, tagCode);
    },
    initDefaultData() {
      this.filterForm.date = getDefaultDateRange();
      this.$refs.inspectedConclusionsSelect.clearSingleSelect();
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '@/components/data/filter-modal.scss';
</style>

