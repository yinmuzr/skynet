<template>
  <Form ref="filterConditionForm" :model="filterConditionForm" :rules="ruleValidate">
    <div v-for="(unqualifiedType, unqualifiedTypeIndex) in filterConditionForm.unqualifiedTypes"
         :key="unqualifiedType.id">
      <FormItem
        class="inline-form-item"
        :ref="`typeSelect_${unqualifiedType.id}`"
        :prop="'unqualifiedTypes.' + unqualifiedTypeIndex"
        :rules="{validator: validateUnqualifiedTypeSelect, trigger: 'change'}">
        <Select
          :transfer="true"
          class="unqualified-type-input"
          v-model="unqualifiedType.selected"
          @on-change="handleChangeUnqualifiedTypeSelect(unqualifiedType)"
          placeholder="选择类别"
          :clearable="true">
          <Option
            v-for="option in unqualifiedType.options"
            :value="option.type"
            :key="option.type"
            :disabled="option.disabled"
          >{{option.type}}
          </Option>
        </Select>
        <span class="more-than-signal">>=</span>
      </FormItem>
      <FormItem
       :ref="`typeSelectValue_${unqualifiedType.id}`"
        class="inline-form-item"
        :prop="'unqualifiedTypes.' + unqualifiedTypeIndex"
        :rules="[{validator: validateUnqualifiedTypeValue, trigger: 'blur'},
        {validator: validateUnqualifiedTypeValue, trigger: 'change'}]">
        <InputNumber :min="min"
                     class="condition-value-input"
                     v-model="unqualifiedType.value"
                     @on-blur="handleBlur(unqualifiedTypeIndex)"
                     :parser="parser">
        </InputNumber>
      </FormItem>
      <Icon type="skynet-delete" class="operate-icon"
            v-if="filterConditionForm.unqualifiedTypes.length > 1"
            @click.native="onDeleteUnqualifiedType(unqualifiedTypeIndex)"/>
      <Icon type="ios-add" class="operate-icon"
            v-if="showAddButton(unqualifiedType, filterConditionForm.unqualifiedTypes, 5)"
            @click.native="onClickAddUnqualifiedType"/>
    </div>
  </Form>
</template>

<script>
/* eslint-disable no-param-reassign */
import { getDefaultUnqualifiedTypeFilterConditions } from '@/utils/util';
import unqualifiedTypeAndReasonFilterFormExtension from '@/mixins/unqualifiedTypeAndReasonFilterFormExtension';

export default {
  name: 'SkynetUnqualifiedTypeFilter',
  props: {
    unqualifiedTypes: {
      type: Array,
    },
    shouldReceiveDouble: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      filterConditionForm: {
        unqualifiedTypes: [],
      },
      ruleValidate: {},
    };
  },
  mixins: [unqualifiedTypeAndReasonFilterFormExtension],
  computed: {
    min() {
      return this.shouldReceiveDouble ? 0 : 1;
    },
    parser() {
      return this.shouldReceiveDouble ? value => value : value => value.replace('.', '');
    },
  },
  methods: {
    resetForm() {
      this.$refs.filterConditionForm.resetFields();
    },
    clearValidateError() {
      this.filterConditionForm.unqualifiedTypes.forEach((unqualifiedType) => {
        this.$refs[`typeSelect_${unqualifiedType.id}`][0].validateState = '';
        this.$refs[`typeSelect_${unqualifiedType.id}`][0].validateMessage = '';
        this.$refs[`typeSelectValue_${unqualifiedType.id}`][0].validateState = '';
        this.$refs[`typeSelectValue_${unqualifiedType.id}`][0].validateMessage = '';
      });
    },
    validateUnqualifiedTypeSelect(rule, value, callback) {
      if ((!value.selected) && value.value) {
        callback(new Error('信息不能为空'));
      } else {
        callback();
      }
    },
    validateUnqualifiedTypeValue(rule, value, callback) {
      if (!value.selected) {
        this.$refs[`typeSelect_${value.id}`][0].validate('change');
      }

      if ((value.selected) && value.value === null) {
        callback(new Error('信息不能为空'));
      } else {
        callback();
      }
    },
    handleChangeUnqualifiedTypeSelect(unqualifiedType) {
      this.calculateUnqualifiedTypeDisableOptions();
      if (!unqualifiedType.value) {
        this.$refs[`typeSelectValue_${unqualifiedType.id}`][0].validate('blur');
      }
    },
    onDeleteUnqualifiedType(unqualifiedTypeIndex) {
      this.filterConditionForm.unqualifiedTypes.splice(unqualifiedTypeIndex, 1);
      this.calculateUnqualifiedTypeDisableOptions();
    },
    onClickAddUnqualifiedType() {
      const defaultUnqualifiedFilterCondition = getDefaultUnqualifiedTypeFilterConditions()[0];
      defaultUnqualifiedFilterCondition.id = this.filterConditionForm.unqualifiedTypes[
        this.filterConditionForm.unqualifiedTypes.length - 1
      ].id + 1;
      this.filterConditionForm.unqualifiedTypes.push(defaultUnqualifiedFilterCondition);
      this.calculateUnqualifiedTypeDisableOptions();
    },
    calculateUnqualifiedTypeDisableOptions() {
      const selectedTypes = this.filterConditionForm.unqualifiedTypes.map(unqualifiedType => unqualifiedType.selected);
      this.filterConditionForm.unqualifiedTypes.forEach((unqualifiedType) => {
        unqualifiedType.options.forEach((option) => {
          option.disabled = selectedTypes.includes(option.type) &&
            option.type !== unqualifiedType.selected;
        });
      });
    },
    setUnqualifiedTypes() {
      this.filterConditionForm.unqualifiedTypes = this.unqualifiedTypes;
    },
    handleBlur(index) {
      if (this.shouldReceiveDouble && this.filterConditionForm.unqualifiedTypes[index].value) {
        const currentUnqualifiedType = this.filterConditionForm.unqualifiedTypes[index];
        this.$nextTick(() => {
          this.$set(currentUnqualifiedType, 'value', Math.round(currentUnqualifiedType.value * 10) / 10);
        });
      }
    },
  },
  watch: {
    unqualifiedTypes() {
      this.setUnqualifiedTypes();
    },
  },
  created() {
    this.setUnqualifiedTypes();
  },
};
</script>
<style lang="scss" scoped>
  @import '@/styles/var.scss';

  .condition-value-input {
    width: 100px;
  }

  .unqualified-type-input {
    width: 180px;
  }

  .more-than-signal {
    padding: 0 10px;
  }

  .operate-icon {
    cursor: pointer;
    color: $--color-primary;
    font-size: 24px;
    padding-left: 10px;
    padding-top: 4px;
  }
</style>
