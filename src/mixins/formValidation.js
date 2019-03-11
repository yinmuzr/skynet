import Vue from 'vue';
import { keys, isEmpty, compact } from 'lodash';
import SkynetErrorTip from '@/components/ErrorTip.vue';
import { setCaretPosition } from '@/utils/util';

export default {
  methods: {
    markInvalidField(fieldName, errorMessage) {
      this.$refs[fieldName].validateState = 'error';
      this.$refs[fieldName].validateMessage = errorMessage;
    },
    markInvalidForm(formModal, error) {
      let foundMatchedField = false;
      keys(formModal).forEach((fieldName) => {
        if (error[fieldName]) {
          foundMatchedField = true;
          this.markInvalidField(fieldName, error[fieldName]);
        }
      });

      if (!foundMatchedField) {
        this.showGlobalError();
      }
    },
    showGlobalError(errorMessage) {
      // TODO: 加全局唯一显示
      const ErrorTipConstructor = Vue.extend(SkynetErrorTip);
      const instance = new ErrorTipConstructor({
        data: { errorMessage },
      });
      const component = instance.$mount();
      document.body.appendChild(component.$el);
    },
    submitErrorHandler(error, formModal) {
      if (error && error.status === 400 && !isEmpty(error.data)) {
        this.markInvalidForm(formModal, error.data);
      } else {
        this.showGlobalError();
      }
    },
    validateTags(rule, value, callback, formModal) {
      const inValidatingTags = value.filter(item => item.promise);
      if (isEmpty(inValidatingTags)) {
        this.markTagsError(rule, value, callback);
      }
      Promise.all(inValidatingTags.map(tag => tag.promise))
        .finally(() => {
          this.markTagsError(rule, formModal[rule.field], callback);
        });
    },
    markTagsError(rule, value, callback) {
      const errors = compact(value.map(tag => tag.error));
      if (errors.length > 0) {
        callback(new Error(errors[errors.length - 1]));
      }
      callback();
    },
    preventDefault(e) {
      e.preventDefault();
    },
    focusInput(inputInstance) {
      this.$nextTick(() => {
        inputInstance.focus();
        if (inputInstance.$options.name === 'Input') {
          setCaretPosition(inputInstance);
        }
      });
    },
    validateRate(rule, value, callback, formModal) {
      /* eslint-disable no-param-reassign */
      if (!value) {
        callback();
      }

      if (!/^\s*[0-9]+[.]*[0-9]*\s*$/.test(value)) {
        callback(new Error('必须是0-100之间的数值'));
        return;
      }

      const floatVal = parseFloat(value);
      if (floatVal > 100 || floatVal < 0) {
        callback(new Error('必须是0-100之间的数值'));
        return;
      }
      formModal[rule.field] = Math.round(floatVal * 100) / 100;
      // form.qualificationRate = Math.round(floatVal * 100) / 100;
      callback();
      /* eslint-enable no-param-reassign */
    },
  },
};
