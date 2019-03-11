import confirmModalVue from './index.vue';

const confirmModal = {};

confirmModal.install = (Vue) => {
  const ConfirmModalInstance = Vue.extend(confirmModalVue);
  let currentModal;
  const initInstance = () => {
    currentModal = new ConfirmModalInstance();
    const confirmModalEl = currentModal.$mount().$el;
    document.body.appendChild(confirmModalEl);
  };
  // eslint-disable-next-line
  Vue.prototype.$confirmModal = {
    show(options) {
      if (!currentModal) {
        initInstance();
      }
      if (typeof options === 'string') {
        currentModal.content = options;
      } else if (typeof options === 'object') {
        Object.assign(currentModal, options);
      }
      return currentModal.showConfirmModal();
    },
  };
};
export default confirmModal;
