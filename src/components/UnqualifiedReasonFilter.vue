<template>
  <Form ref="filterConditionForm" :model="filterConditionForm" :rules="ruleValidate">
    <div
      v-for="(unqualifiedReason, unqualifiedReasonIndex) in filterConditionForm.unqualifiedReasons"
      :key="unqualifiedReason.id">
      <FormItem
      class="inline-form-item"
      :prop="'unqualifiedReasons.' + unqualifiedReasonIndex"
      :rules="{validator: validateReasonCode, trigger: 'blur'}"
      :ref="'unqualifiedReasons_'+unqualifiedReason.id">
        <SkynetCustomInput
            class="reason-name-input"
            ref="input"
            placeholder="输入原因ID，回车匹配"
            v-model="unqualifiedReason.code"
            :nameToShow="unqualifiedReason.name"
            :overflowEllipsis="true"
            @showName="showReasonName(unqualifiedReasonIndex)"
            @resetName="resetReasonName(unqualifiedReason)"/>
        <span class="greater-than-signal">>=</span>
      </FormItem>
      <FormItem
        class="inline-form-item"
        :prop="'unqualifiedReasons.' + unqualifiedReasonIndex"
        :rules="[{validator: validateUnqualifiedReasonValue, trigger: ''},
        {validator: validateUnqualifiedReasonValue, trigger: 'change'}]"
        :ref="'unqualifiedReasonsValue_'+unqualifiedReason.id">
      <InputNumber :min="min"
                   class="condition-value-input"
                   v-model="unqualifiedReason.value"
                   @on-blur="handleBlur(unqualifiedReasonIndex)"
                   :parser="parser">
      </InputNumber>
      </FormItem>
      <Icon type="skynet-delete" class="operate-icon"
      v-if="filterConditionForm.unqualifiedReasons.length > 1"
      @click.native="onDeleteUnqualifiedReason(unqualifiedReason, unqualifiedReasonIndex)"/>
      <Icon type="ios-add" class="operate-icon"
      v-if="showAddButton(unqualifiedReason, filterConditionForm.unqualifiedReasons, 10)"
      @click.native="onClickAddUnqualifiedReason"/>
    </div>
  </Form>
</template>

<script>
/* eslint-disable no-param-reassign */

import SkynetCustomInput from '@/components/CustomInput.vue';
import { getDefaultUnqualifiedReasons } from '@/utils/util';
import { getReasonByCode } from '@/services/report.service';
import { ERROR } from '@/utils/constant';
import unqualifiedTypeAndReasonFilterFormExtension from '@/mixins/unqualifiedTypeAndReasonFilterFormExtension';
import { groupBy, map } from 'lodash';

export default {
  name: 'SkynetUnqualifiedReasonFilter',
  props: {
    unqualifiedReasons: {
      type: Array,
    },
    shouldReceiveDouble: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    SkynetCustomInput,
  },
  data() {
    return {
      filterConditionForm: {
        unqualifiedReasons: [],
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
      this.filterConditionForm.unqualifiedReasons.forEach((unqualifiedReason) => {
        this.$refs[`unqualifiedReasons_${unqualifiedReason.id}`][0].validateState = '';
        this.$refs[`unqualifiedReasons_${unqualifiedReason.id}`][0].validateMessage = '';
        this.$refs[`unqualifiedReasonsValue_${unqualifiedReason.id}`][0].validateState = '';
        this.$refs[`unqualifiedReasonsValue_${unqualifiedReason.id}`][0].validateMessage = '';
      });
    },
    onClickAddUnqualifiedReason() {
      const defaultUnqualifiedFilterCondition = getDefaultUnqualifiedReasons()[0];
      defaultUnqualifiedFilterCondition.id = this.filterConditionForm.unqualifiedReasons[
        this.filterConditionForm.unqualifiedReasons.length - 1
      ].id + 1;
      this.filterConditionForm.unqualifiedReasons.push(defaultUnqualifiedFilterCondition);
      this.$emit('addReason');
    },
    onDeleteUnqualifiedReason(unqualifiedReason, unqualifiedReasonIndex) {
      const deletedItemErrorMessage = this.$refs[`unqualifiedReasons_${unqualifiedReason.id}`][0].validateMessage;
      this.filterConditionForm.unqualifiedReasons.splice(unqualifiedReasonIndex, 1);

      const firstDupCodeIndex = this.filterConditionForm.unqualifiedReasons
        .findIndex(reason => reason.code === unqualifiedReason.code);
      if (firstDupCodeIndex < 0) return;

      const firstDupItem = this.filterConditionForm.unqualifiedReasons[firstDupCodeIndex];
      if (!firstDupItem.code || firstDupItem.id <= unqualifiedReason.id) return;

      const refItem = this.$refs[`unqualifiedReasons_${firstDupItem.id}`][0];
      if (unqualifiedReason.name) {
        firstDupItem.name = unqualifiedReason.name;
        refItem.validateState = 'success';
        refItem.validateMessage = '';
      } else {
        refItem.validateState = 'error';
        refItem.validateMessage = deletedItemErrorMessage;
      }
    },
    showReasonName(unqualifiedReasonIndex) {
      this.$refs.filterConditionForm.validateField(`unqualifiedReasons.${unqualifiedReasonIndex}`);
      this.$refs[`unqualifiedReasonsValue_${this.filterConditionForm.unqualifiedReasons[unqualifiedReasonIndex].id}`][0]
        .validate();
      this.validateAllDuplicateReason(this.filterConditionForm.unqualifiedReasons[unqualifiedReasonIndex]);
    },
    validateAllDuplicateReason(excludeReason) {
      map(
        groupBy(this.filterConditionForm.unqualifiedReasons, 'code'),
        (reasons) => {
          if (reasons[0] !== excludeReason) { this.$refs[`unqualifiedReasons_${reasons[0].id}`][0].validate('blur'); }
          if (reasons.length > 1 && reasons[1] !== excludeReason) {
            this.$refs[`unqualifiedReasons_${reasons[1].id}`][0].validate('blur');
          }
          return reasons;
        },
      );
    },
    resetReasonName(unqualifiedReason) {
      unqualifiedReason.name = '';
      this.$refs[`unqualifiedReasons_${unqualifiedReason.id}`][0].resetField();
    },
    validateUnqualifiedReasonValue(rule, value, callback) {
      if (!value.code) {
        this.$refs[`unqualifiedReasons_${value.id}`][0].validate('enter');
      }

      if ((value.code) && value.value === null) {
        callback(new Error('信息不能为空'));
      } else {
        callback();
      }
    },
    validateReasonCode(rule, value, callback) {
      const currentValIndex = this.filterConditionForm.unqualifiedReasons.findIndex(item => item.id === value.id);

      if (!value.code && !value.value) {
        callback();
        return;
      }

      if (!value.code) {
        callback(new Error('信息不能为空'));
        return;
      }

      if (this.filterConditionForm.unqualifiedReasons.find(r => r.code === value.code).id !== value.id) {
        callback(new Error('不能与已有不合格原因重复'));
        return;
      }

      getReasonByCode(value.code)
        .then((data) => {
          value.name = `${data.name} (${value.code})`;
          callback();
        })
        .catch((error) => {
          // if imput reason code, not blur, then click reset,we'll go into below if, in this case, can't show error
          if (this.resetValidationError(currentValIndex, callback)) {
            return;
          }
          if ((error.status === 404 || error.status === 400)) {
            callback(new Error(ERROR.INPUT));
          }
          callback(new Error(ERROR.NETWORK));
        });
    },
    resetValidationError(currentValIndex, callback) {
      if (!this.filterConditionForm.unqualifiedReasons[currentValIndex].code) {
        callback();
        return true;
      }

      return false;
    },
    setUnqualifiedReasons() {
      this.filterConditionForm.unqualifiedReasons = this.unqualifiedReasons;
    },
    handleBlur(index) {
      if (this.shouldReceiveDouble && this.filterConditionForm.unqualifiedReasons[index].value) {
        const currentUnqualifiedReason = this.filterConditionForm.unqualifiedReasons[index];
        this.$nextTick(() => {
          this.$set(currentUnqualifiedReason, 'value', Math.round(currentUnqualifiedReason.value * 10) / 10);
        });
      }
    },
  },
  watch: {
    unqualifiedReasons() {
      this.setUnqualifiedReasons();
    },
  },
  created() {
    this.setUnqualifiedReasons();
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/var.scss';
.greater-than-signal{
  padding: 0 10px;
}
.reason-name-input {
  width: 180px;
  float: left;
}
.condition-value-input {
  width: 100px;
}
.operate-icon {
  cursor: pointer;
  color: $--color-primary;
  font-size: 24px;
  padding-left: 10px;
  padding-top: 4px;
}
</style>
