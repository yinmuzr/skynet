import { isNullOrEmpty } from '@/utils/util';

/* eslint-disable no-param-reassign */
const handleLabel = (el, binding) => {
  if (isNullOrEmpty(binding.value)) {
    el.innerHTML = '-';
    el.className = `${el.initClassName} -empty`;
  } else {
    el.innerHTML = binding.value;
    el.className = el.initClassName;
  }
};
export default {
  params: [
    'undefinedLabel',
  ],
  bind(el, binding) {
    el.initClassName = el.className;

    handleLabel(el, binding);
  },
  update: handleLabel,
};
