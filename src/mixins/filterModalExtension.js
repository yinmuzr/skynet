import { getVendorByCode } from '@/services/vendor.service';
import { getMaterialGroup } from '@/services/material.service';
import { getInspectorByEmailNum } from '@/services/user.service';
import { getReasonByCode } from '@/services/report.service';
import { ERROR } from '@/utils/constant';
import { trim } from 'lodash';

export default {
  computed: {
    materialGroupsForInput() {
      return JSON.stringify(this.filterForm.materialGroups);
    },
    vendorsForInput() {
      return JSON.stringify(this.filterForm.vendors);
    },
    inspectorsForInput() {
      return JSON.stringify(this.filterForm.inspectors);
    },
    unqualifiedTypesForInput() {
      return JSON.stringify(this.filterForm.unqualifiedTypes);
    },
    unqualifiedReasonsForInput() {
      return JSON.stringify(this.filterForm.unqualifiedReasons);
    },
  },
  data() {
    return {
      datePickerOptions: {
        disabledDate(date) {
          // eslint-disable-next-line
          return date && date.valueOf() > new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1;
        },
      },
    };
  },
  methods: {
    toggleShowModal(visible) {
      this.$emit('update:shouldShow', visible);
    },
    validateInput(validate, tagCode) {
      return validate(trim(tagCode)).catch((error) => {
        if (error.status === 500) {
          return Promise.reject(new Error(ERROR.NETWORK));
        }

        return Promise.reject(error);
      });
    },
    validateInspectorsInput(tagCode) {
      return this.validateInput(getInspectorByEmailNum, tagCode);
    },
    validateUnqualifiedReasonsInput(tagCode) {
      return this.validateInput(getReasonByCode, tagCode);
    },
    validateVendorsInput(tagCode) {
      return this.validateInput(getVendorByCode, tagCode);
    },
    validateTagInputs(rule, value, callback) {
      this.validateTags(rule, value, callback, this.filterForm);
    },
    validateMaterialGroupsInput(tagCode) {
      return this.validateInput(getMaterialGroup, tagCode);
    },
  },
};
