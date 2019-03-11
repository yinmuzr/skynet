import { EARLY_WARNING_TYPE, INSPECTION_TYPES } from '@/utils/constant';
import ajax from './ajax';

const transferStrategyFormToParameterItems = (originalItems, inspectionType, form) => {
  if (form.qualificationRate) {
    originalItems.push({
      warningType: EARLY_WARNING_TYPE.QUALIFIED_RATE,
      inspectionType,
      threshold: form.qualificationRate / 100,
      period: form.qualificationRatePeriod,
    });
  }
  if (form.unqualifiedBatches) {
    originalItems.push({
      warningType: EARLY_WARNING_TYPE.UNQUALIFIED_BATCHES,
      inspectionType,
      threshold: form.unqualifiedBatches,
      period: form.unqualifiedBatchesPeriod,
    });
  }
  if (form.unqualifiedTypes) {
    form.unqualifiedTypes.forEach((unqualifiedType) => {
      if (unqualifiedType.value > 0) {
        originalItems.push({
          warningType: EARLY_WARNING_TYPE.UNQUALIFIED_TYPE,
          inspectionType,
          itemCode: unqualifiedType.selected,
          threshold: unqualifiedType.value,
          period: form.unqualifiedTypesPeriod,
        });
      }
    });
  }
  if (form.unqualifiedReasons) {
    form.unqualifiedReasons.forEach((unqualifiedReason) => {
      if (unqualifiedReason.value > 0) {
        originalItems.push({
          warningType: EARLY_WARNING_TYPE.UNQUALIFIED_REASON,
          inspectionType,
          itemCode: unqualifiedReason.code,
          threshold: unqualifiedReason.value,
          period: form.unqualifiedReasonsPeriod,
        });
      }
    });
  }
};

const transferStrategyFormToParameter = (form, baseCode) => {
  const items = [];

  transferStrategyFormToParameterItems(items, INSPECTION_TYPES.SAMPLE.inspectionType, form.sampleStrategyForm);
  transferStrategyFormToParameterItems(items, INSPECTION_TYPES.FULL.inspectionType, form.fullStrategyForm);

  return {
    materialGroupCode: form.materialGroupCode,
    baseCode,
    items,
  };
};

export const getStrategies = baseCode => ajax.get(`/api/early-warning-strategies/?baseCode=${baseCode}`);
export const deleteStrategy = id => ajax.delete(`/api/early-warning-strategies/${id}`);

export const getStrategyByBaseCodeAndMaterialGroupCode = (baseCode, materialGroupCode) =>
  ajax.get(`/api/early-warning-strategies?baseCode=${baseCode}&materialGroupCode=${materialGroupCode}`);


export const addStrategy = (form, baseCode) => {
  const parameter = transferStrategyFormToParameter(form, baseCode);
  return ajax.post('/api/early-warning-strategies', parameter);
};

export const editStrategy = (id, form, baseCode) => {
  const parameter = transferStrategyFormToParameter(form, baseCode);
  parameter.id = id;
  return ajax.put(`/api/early-warning-strategies/${id}`, parameter);
};

export const setEarlyWarningReadStatus = params => (
  ajax.post('/api/risk-warnings/read', params)
);
