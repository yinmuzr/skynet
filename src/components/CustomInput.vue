<template>
  <div>
    <Input ref="input"
      v-show="!nameToShow"
      :disabled="disabled"
      @on-enter="showName"
      @on-blur="showName"
      :value="currentValue"
      :placeholder="placeholder"
      @input="handleInput"/>
      <div>
      <!-- <Poptip trigger="hover" :content="nameToShow"> -->
        <span :class="spanClasses" v-show="nameToShow" @click="resetName">
          {{nameToShow}}
        </span>
      <!-- </Poptip> -->
      </div>
  </div>
</template>

<script>
import { trim } from 'lodash';
import { setCaretPosition } from '@/utils/util';

export default {
  name: 'SkynetCustomInput',
  props: {
    placeholder: String,
    nameToShow: {
      type: String,
      required: true,
    },
    value: {
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    overflowEllipsis: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      lastValue: null,
      currentValue: this.value,
    };
  },
  methods: {
    showName() {
      if (this.currentValue !== this.lastValue) {
        this.$emit('showName');
      }
    },
    resetName() {
      if (this.disabled) {
        return;
      }
      this.$emit('resetName');
      this.focus();
      this.$nextTick(() => {
        setCaretPosition(this.$refs.input);
      });
    },
    handleInput(value) {
      this.$emit('input', trim(value));
      this.lastValue = this.currentValue;
      this.currentValue = value;
      this.$emit('change', trim(value));
    },
    focus() {
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
  },
  computed: {
    spanClasses() {
      return {
        'ivu-input': true,
        'ivu-input-default': true,
        'name-span': this.overflowEllipsis,
        'ivu-input-disabled': this.disabled,
      };
    },
  },
  watch: {
    value() {
      if (this.currentValue !== this.value) {
        this.lastValue = this.currentValue;
        this.currentValue = this.value;
        this.focus();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.name-span{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>

