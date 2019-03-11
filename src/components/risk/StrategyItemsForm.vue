<template>
<Form inline
  ref="form"
  :model="strategyForm"
  :rules="ruleValidate"
  :label-width="100"
  @submit.native.prevent="preventDefault">
  <Row class='title-container'>
    <span class="section-title">{{title}}</span>
  </Row>
  <FormItem label="合格率<=" prop="qualificationRate"  class="strategy-form-item inline-form-item">
    <Input v-model="strategyForm.qualificationRate"
      class="qualify-condition-value-input">
      <span slot="suffix">%</span>
    </Input>
  </FormItem>
  <FormItem class="period-form-item inline-form-item">
    <Select class="strategy-period"
            :transfer="true"
            v-model="strategyForm.qualificationRatePeriod">
      <Option v-for="key in Object.keys(EARLY_WARNING_PERIOD)"
              :value="key"
              :key="key">{{ EARLY_WARNING_PERIOD[key]}}
      </Option>
    </Select>
  </FormItem>
  <FormItem label="不合格批数>="  class="strategy-form-item inline-form-item" v-show="shouldShowUnqualifiedBatchesInput">
      <InputNumber :min="1" v-model="strategyForm.unqualifiedBatches"
                   class="qualify-condition-value-input"
                   :parser="value => value.replace('.', '')"/>
  </FormItem>
  <FormItem class="period-form-item inline-form-item" v-show="shouldShowUnqualifiedBatchesInput">
    <Select class="strategy-period"
            :transfer="true"
            v-model="strategyForm.unqualifiedBatchesPeriod">
      <Option v-for="key in Object.keys(EARLY_WARNING_PERIOD)"
              :value="key"
              :key="key">{{ EARLY_WARNING_PERIOD[key]}}
      </Option>
    </Select>
  </FormItem>
  <FormItem label="不合格类别" class="type-or-reason strategy-form-item inline-form-item">
    <SkynetUnqualifiedTypeFilter ref="skynetUnqualifiedTypeFilter"
                                 :unqualifiedTypes="strategyForm.unqualifiedTypes"
                                 :shouldReceiveDouble="shouldReceiveDouble"/>
  </FormItem>
  <FormItem class="period-form-item inline-form-item">
    <Select class="strategy-period"
            :transfer="true"
            v-model="strategyForm.unqualifiedTypesPeriod">
      <Option v-for="key in Object.keys(EARLY_WARNING_PERIOD)"
              :value="key"
              :key="key">{{ EARLY_WARNING_PERIOD[key]}}
      </Option>
    </Select>
  </FormItem>
  <FormItem prop="unqualifiedTypes" :show-message="false" class="hidden-form-item">
    <Input style="display: none;"/>
  </FormItem>
  <FormItem label="不合格原因" class="type-or-reason strategy-form-item inline-form-item">
    <SkynetUnqualifiedReasonFilter ref="skynetUnqualifiedReasonFilter"
                                   :unqualifiedReasons="strategyForm.unqualifiedReasons"
                                   :shouldReceiveDouble="shouldReceiveDouble"/>
  </FormItem>
  <FormItem class="period-form-item inline-form-item">
    <Select class="strategy-period"
            :transfer="true"
            v-model="strategyForm.unqualifiedReasonsPeriod">
      <Option v-for="key in Object.keys(EARLY_WARNING_PERIOD)"
              :value="key"
              :key="key">{{ EARLY_WARNING_PERIOD[key]}}
      </Option>
    </Select>
  </FormItem>
  <FormItem prop="unqualifiedReasons" :show-message="false" class="hidden-form-item">
    <Input style="display: none;"/>
  </FormItem>
</Form>
</template>

<script>
import { EARLY_WARNING_PERIOD } from '@/utils/constant';
import formValidation from '@/mixins/formValidation';
import SkynetUnqualifiedTypeFilter from '@/components/UnqualifiedTypeFilter.vue';
import SkynetUnqualifiedReasonFilter from '@/components/UnqualifiedReasonFilter.vue';

export default {
  name: 'SkynetStrategyItemsForm',
  components: {
    SkynetUnqualifiedTypeFilter,
    SkynetUnqualifiedReasonFilter,
  },
  props: {
    strategyForm: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    shouldReceiveDouble: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      EARLY_WARNING_PERIOD,
      ruleValidate: {
        qualificationRate: [
          { validator: this.validateQualificationRate, trigger: 'blur' },
        ],
        unqualifiedTypes: [
          { validator: this.validateUnqualifiedTypes, trigger: 'change' },
        ],
        unqualifiedReasons: [
          { validator: this.validateUnqualifiedReasons, trigger: 'change' },
        ],
      },
    };
  },
  mixins: [formValidation],
  computed: {
    shouldShowUnqualifiedBatchesInput() {
      return this.strategyForm.unqualifiedBatches !== undefined;
    },
  },
  methods: {
    validateInnerForm(rule, value, callback, refName) {
      this.$refs[refName].$refs.filterConditionForm.validate((filterConditionValid) => {
        if (filterConditionValid) {
          callback();
        }

        callback(new Error(''));
      });
    },
    validateQualificationRate(rule, value, callback) {
      this.validateRate(rule, value, callback, this.strategyForm);
    },
    validateUnqualifiedTypes(rule, value, callback) {
      this.validateInnerForm(rule, value, callback, 'skynetUnqualifiedTypeFilter');
    },
    validateUnqualifiedReasons(rule, value, callback) {
      this.validateInnerForm(rule, value, callback, 'skynetUnqualifiedReasonFilter');
    },
  },


};
</script>

