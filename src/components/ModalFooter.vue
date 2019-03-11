<template>
  <div>
    <i-button type="text" size="large" @click.native="handleCancel">
      {{ cancelText }}
    </i-button>
    <i-button type="primary" size="large" :loading="buttonLoading" @click.native="handleOk">
      {{ okText }}
    </i-button>
  </div>
</template>

<script>
export default {
  name: 'SkynetModalFooter',
  props: {
    cancelText: {
      type: String,
      default: '取消',
    },
    okText: {
      type: String,
      default: '确定',
    },
    cancel: {
      type: Function,
    },
    ok: {
      type: Function,
    },
    modalVisible: {
      type: Boolean,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      buttonLoading: false,
    };
  },
  watch: {
    modalVisible(value) {
      if (value === false) {
        this.buttonLoading = false;
      }
    },
    loading(value) {
      if (!value) {
        this.buttonLoading = false;
      }
    },
  },
  methods: {
    toggleModalVisible(visible) {
      this.$emit('update:modalVisible', visible);
    },
    handleCancel() {
      if (this.cancel) {
        this.cancel();
      } else {
        this.toggleModalVisible(false);
      }
    },
    handleOk() {
      if (this.loading) {
        this.buttonLoading = true;
      }
      if (this.ok) {
        this.ok();
      } else {
        this.toggleModalVisible(false);
      }
    },
  },
};
</script>

<style lang="scss" scoped>

</style>

