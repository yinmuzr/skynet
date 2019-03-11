<template>
  <div class="strategy-edit">
    <SkynetNavigatorBar :title="title" :hasBack="false">
      <div class="navigator-extension">
        <Button
          size="large"
          type="primary"
          class="add-button"
          @click="handleConfirmStrategy"
        >确定</Button>
        <Button
          size="large"
          type="text"
          class="add-button"
          @click="handleCancelStrategy"
        >取消</Button>
      </div>
    </SkynetNavigatorBar>
    <div>
      <Form
        inline
        ref="form"
        :model="strategyForm"
        class="edit-strategy-form"
        :rules="ruleValidate"
        @submit.native.prevent="preventDefault"
      >
        <FormItem ref="materialGroup" label="预警物料组" prop="materialGroupCode" :label-width="100">
          <SkynetCustomInput
            class="material-group-input"
            placeholder="输入物料组ID，按回车进行匹配"
            v-model="strategyForm.materialGroupCode"
            :nameToShow="strategyForm.materialGroupName"
            @showName="showMaterialGroupName"
            @resetName="resetMaterialGroupName"
          />
        </FormItem>
        <Row class="tip-container">
          <Col class="icon-container">
          <Icon type="skynet-exclamation-mark" class="tip-icon"></Icon>
          </Col>
          <Col>
          <span class="tip-content">预警物料组满足以下任意一项时，将会推送风险预警</span>
          </Col>
        </Row>
        <FormItem label="" prop="" class="strategy-item-container-form">
          <SkynetStrategyItemsForm
          title="抽检策略"
          ref="sampleStrategyForm"
          :strategyForm="strategyForm.sampleStrategyForm"
          :shouldReceiveDouble="false"/>
        </FormItem>
        <FormItem prop="sampleStrategyForm" :show-message="false" class="hidden-form-item">
          <Input style="display: none;"/>
        </FormItem>
        <FormItem label="" prop="" class="strategy-item-container-form">
          <SkynetStrategyItemsForm
          ref="fullStrategyForm"
          title="全检策略"
          :strategyForm="strategyForm.fullStrategyForm"
          :shouldReceiveDouble="true"/>
        </FormItem>
        <FormItem prop="fullStrategyForm" :show-message="false">
          <Input style="display: none;"/>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script>
import { isEmpty, filter, find, isEqual, cloneDeep } from 'lodash';
import SkynetNavigatorBar from '@/components/NavigatorBar.vue';
import SkynetStrategyItemsForm from '@/components/risk/StrategyItemsForm.vue';
import { ERROR, EARLY_WARNING_PERIOD, INSPECTION_TYPES, EARLY_WARNING_TYPE } from '@/utils/constant';
import formValidation from '@/mixins/formValidation';
import { getMaterialGroup } from '@/services/material.service';
import SkynetCustomInput from '@/components/CustomInput.vue';
import { mapGetters, mapState } from 'vuex';
import {
  getStrategyByBaseCodeAndMaterialGroupCode,
  addStrategy,
  editStrategy,
} from '@/services/early-warning.service';
import {
  getDefaultUnqualifiedReasons,
  getDefaultUnqualifiedTypeFilterConditions,
  formatNameWithCode,
} from '@/utils/util';

const defaultPeriod = 'WEEK';
const defaultSampleStrategyForm = {
  qualificationRate: null,
  qualificationRatePeriod: defaultPeriod,
  unqualifiedBatches: null,
  unqualifiedBatchesPeriod: defaultPeriod,
  unqualifiedTypes: getDefaultUnqualifiedTypeFilterConditions(),
  unqualifiedTypesPeriod: defaultPeriod,
  unqualifiedReasons: getDefaultUnqualifiedReasons(),
  unqualifiedReasonsPeriod: defaultPeriod,
};
const defaultFullStrategyForm = {
  qualificationRate: null,
  qualificationRatePeriod: defaultPeriod,
  unqualifiedTypes: getDefaultUnqualifiedTypeFilterConditions(),
  unqualifiedTypesPeriod: defaultPeriod,
  unqualifiedReasons: getDefaultUnqualifiedReasons(),
  unqualifiedReasonsPeriod: defaultPeriod,
};
export default {
  name: 'SkynetEarlyWarningStrategyEdit',
  components: {
    SkynetNavigatorBar,
    SkynetCustomInput,
    SkynetStrategyItemsForm,
  },
  props: {
    currentStrategy: {
      type: Object,
    },
  },
  data() {
    const validateMaterialGroupCode = (rule, value, callback) => {
      if (!this.userHasMaterialGroupConfigAuth(value)) {
        callback(new Error('不能添加权限外物料组'));
        return;
      }
      if (value && !this.strategyForm.materialGroupName) {
        getMaterialGroup(value)
          .then((materialGroup) => {
            this.strategyForm.materialGroupName = formatNameWithCode(materialGroup);
            return getStrategyByBaseCodeAndMaterialGroupCode(this.currentBaseCode, value);
          })
          .then(() => {
            if (this.currentStrategy.materialGroupCode !== value) {
              callback(new Error('不能与已有物料组重复'));
            }
          })
          .catch((error) => {
            if (error.status === 404 && this.strategyForm.materialGroupName) {
              callback();
              return;
            }

            this.strategyForm.materialGroupName = '';
            if (error.status === 500) {
              callback(new Error(ERROR.NETWORK));
            } else {
              callback(new Error(ERROR.INPUT));
            }
          });
      } else {
        callback();
      }
    };
    return {
      title: isEmpty(this.currentStrategy) ? '新增入厂检验风险策略' : '编辑入厂检验风险策略',
      strategyForm: {
        materialGroupCode: '',
        materialGroupName: '',
        sampleStrategyForm: cloneDeep(defaultSampleStrategyForm),
        fullStrategyForm: cloneDeep(defaultFullStrategyForm),
      },
      EARLY_WARNING_PERIOD,
      ruleValidate: {
        materialGroupCode: [
          { required: true, message: ERROR.REQUIRED, trigger: 'change' },
          { required: true, message: ERROR.REQUIRED, trigger: 'blur' },
          { validator: validateMaterialGroupCode, trigger: 'blur' },
        ],
        sampleStrategyForm: [
          { validator: this.validateSampleStrategyForm, trigger: '' },
        ],
        fullStrategyForm: [
          { validator: this.validateFullStrategyForm, trigger: '' },
        ],
      },
    };
  },
  computed: {
    ...mapState({
      currentBaseCode: state => state.auth.currentBaseCode,
    }),
    ...mapGetters(['userHasMaterialGroupConfigAuth']),
  },
  watch: {
    currentStrategy: {
      handler() {
        this.initData();
      },
      deep: true,
    },
  },
  mixins: [formValidation],
  methods: {
    initData() {
      if (!isEmpty(this.currentStrategy)) {
        this.strategyForm.materialGroupCode = this.currentStrategy.materialGroupCode;
        this.strategyForm.materialGroupName = formatNameWithCode({
          code: this.currentStrategy.materialGroupCode,
          name: this.currentStrategy.materialGroupName,
        });

        this.initQualificationRate(this.strategyForm.sampleStrategyForm, INSPECTION_TYPES.SAMPLE.inspectionType);
        this.initUnqualifiedBatches(this.strategyForm.sampleStrategyForm);
        this.initUnqualifiedTypes(this.strategyForm.sampleStrategyForm, INSPECTION_TYPES.SAMPLE.inspectionType);
        this.initUnqualifiedReasons(this.strategyForm.sampleStrategyForm, INSPECTION_TYPES.SAMPLE.inspectionType);

        this.initQualificationRate(this.strategyForm.fullStrategyForm, INSPECTION_TYPES.FULL.inspectionType);
        this.initUnqualifiedTypes(this.strategyForm.fullStrategyForm, INSPECTION_TYPES.FULL.inspectionType);
        this.initUnqualifiedReasons(this.strategyForm.fullStrategyForm, INSPECTION_TYPES.FULL.inspectionType);
      }
    },
    validateInnerForm(rule, value, callback, refName) {
      this.$refs[refName].$refs.form.validate((filterConditionValid) => {
        if (filterConditionValid) {
          callback();
        }

        callback(new Error(''));
      });
    },
    validateSampleStrategyForm(rule, value, callback) {
      this.validateInnerForm(rule, value, callback, 'sampleStrategyForm');
    },
    validateFullStrategyForm(rule, value, callback) {
      this.validateInnerForm(rule, value, callback, 'fullStrategyForm');
    },
    handleCancelStrategy() {
      this.$emit('onCancel');
    },
    handleConfirmStrategy() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (isEqual(this.strategyForm.sampleStrategyForm, defaultSampleStrategyForm) &&
            isEqual(this.strategyForm.fullStrategyForm, defaultFullStrategyForm)) {
            this.$Modal.error({
              title: '不能提交',
              content: '您至少需要为该物料组配置一项风险策略',
              okText: '好的',
            });
            return;
          }
          if (isEmpty(this.currentStrategy)) {
            addStrategy(this.strategyForm, this.currentBaseCode)
              .then(() => {
                this.$emit('onOK');
              }).catch((e) => {
                if (e.data.materialGroupCode) {
                  this.setMaterialGroupValidateMessage(e.data.materialGroupCode);
                  return;
                }
                this.showGlobalError();
              });
          } else {
            editStrategy(this.currentStrategy.id, this.strategyForm, this.currentBaseCode)
              .then(() => {
                this.$emit('onOK');
              }).catch((e) => {
                if (e.data.materialGroupCode) {
                  this.setMaterialGroupValidateMessage(e.data.materialGroupCode);
                  return;
                }
                this.showGlobalError();
              });
          }
        }
      });
    },
    setMaterialGroupValidateMessage(message) {
      this.$refs.materialGroup.validateState = 'error';
      this.$refs.materialGroup.validateMessage = message;
    },
    showMaterialGroupName() {
      this.$refs.form.validateField('materialGroupCode');
    },
    resetMaterialGroupName() {
      this.strategyForm.materialGroupName = '';
    },
    /* eslint-disable */
    initQualificationRate(form, inspectionType) {
      const qualificationRateItem = find(
        this.currentStrategy.items,
        item => item.inspectionType === inspectionType && item.warningType === EARLY_WARNING_TYPE.QUALIFIED_RATE,
      );
      if (qualificationRateItem !== undefined) {
        form.qualificationRate = qualificationRateItem.threshold * 100;
        form.qualificationRatePeriod = qualificationRateItem.period;
      }
    },
    initUnqualifiedBatches(form) {
      const unqualifiedBatchesItem = find(
        this.currentStrategy.items,
        item => item.inspectionType === INSPECTION_TYPES.SAMPLE.inspectionType &&
          item.warningType === EARLY_WARNING_TYPE.UNQUALIFIED_BATCHES,
      );
      if (unqualifiedBatchesItem !== undefined) {
        form.unqualifiedBatches = unqualifiedBatchesItem.threshold;
        form.unqualifiedBatchesPeriod = unqualifiedBatchesItem.period;
      }
    },
    initUnqualifiedTypes(form, inspectionType) {
      const selectedTypes = [];
      const unqualifiedTypes = filter(
        this.currentStrategy.items,
        item => item.inspectionType === inspectionType && item.warningType === EARLY_WARNING_TYPE.UNQUALIFIED_TYPE,
      ).reduce((unqualifiedTypes, item, index) => {
        const unqualifiedType = getDefaultUnqualifiedTypeFilterConditions()[0];
        unqualifiedType.id = index;
        unqualifiedType.selected = item.itemCode;
        unqualifiedType.value = item.threshold;
        unqualifiedType.period = item.period;
        selectedTypes.push(item.itemCode);
        unqualifiedTypes.push(unqualifiedType);
        return unqualifiedTypes;
      }, []);
      unqualifiedTypes.forEach((unqualifiedType) => {
        unqualifiedType.options.map((option) => {
          option.disabled = selectedTypes.includes(option.type);
          return option;
        });
      });
      if (!isEmpty(unqualifiedTypes)) {
        form.unqualifiedTypes = unqualifiedTypes;
        form.unqualifiedTypesPeriod = unqualifiedTypes[0].period;
      }
    },
    initUnqualifiedReasons(form, inspectionType) {
      const unqualifiedReasons = filter(
        this.currentStrategy.items,
        item => item.inspectionType === inspectionType && item.warningType === EARLY_WARNING_TYPE.UNQUALIFIED_REASON,
      ).reduce((unqualifiedReasons, item, index) => {
        const unqualifiedReason = getDefaultUnqualifiedReasons()[0];
        unqualifiedReason.id = index;
        unqualifiedReason.code = item.itemCode;
        unqualifiedReason.name = formatNameWithCode({
          code: item.itemCode,
          name: item.itemName,
        });
        unqualifiedReason.value = item.threshold;
        unqualifiedReason.period = item.period;
        unqualifiedReasons.push(unqualifiedReason);
        return unqualifiedReasons;
      }, []);
      if (!isEmpty(unqualifiedReasons)) {
        form.unqualifiedReasons = unqualifiedReasons;
        form.unqualifiedReasonsPeriod = unqualifiedReasons[0].period;
      }
    },
    /* eslint-disable */
  },
  created() {
    this.initData();
  },
};
</script>


<style scoped lang="scss">
  @import '@/styles/var.scss';
  .strategy-edit {
    .navigator-extension {
      display: inline-block;
      margin-right: 40px;
      float: right;
      padding-top: 12px;
    }

    .edit-strategy-form {
      margin: 40px 210px 40px 210px;
    }
    .material-group-input {
      width: 330px;
    }
    .tip-container{
      height: 50px;
      border-top: solid 2px #d2dce9;
      // opacity: 0.21;
      background-color: rgba(216,216,216,0.21);
      margin-top:6px;
      .tip-content{
        color: #4a4f5d;
        font-size: 14px;
        line-height: 48px;
      }
      .tip-icon{
        padding-left: 20px;
        padding-right:10px;
        font-size: 24px;
        color: $--color-primary;
      }
      .icon-container{
        float:left;
        line-height: 59px;
      }
    }
    .strategy-item-container-form{
      width:100%;
    }
    .hidden-form-item{
      display: none;
    }
  }
</style>
