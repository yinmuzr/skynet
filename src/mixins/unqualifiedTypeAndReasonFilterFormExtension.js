export default {
  methods: {
    showAddButton(currentItem, formItemList, maxNum) {
      const totalLen = formItemList.length;
      return totalLen < maxNum &&
      currentItem.id === formItemList[totalLen - 1].id;
    },
  },
};
