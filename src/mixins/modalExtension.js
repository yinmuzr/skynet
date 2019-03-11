export default {
  data() {
    return {
      modalLoading: true,
    };
  },
  methods: {
    preventModalClose() {
      // modalLoading to not close the modal immediately
      this.modalLoading = false;
      setTimeout(() => {
        this.modalLoading = true;
      }, 0);
    },

    handleSubmit() {
      this.$nextTick(this.submit);
    },
  },
};
