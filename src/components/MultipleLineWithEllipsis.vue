<template>
  <div :ref="containerRef">
    <p :ref="textRef" :title="text">{{text}}</p>
  </div>
</template>

<script>
import jQuery from 'jquery';
import uuid from 'uuid/v4';

export default {
  name: 'SkynetMultipleLineWithEllipsis',
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      containerRef: uuid(),
      textRef: uuid(),
    };
  },
  mounted() {
    setTimeout(() => {
      const containerEle = jQuery(this.$refs[this.containerRef]);
      const textEle = jQuery(this.$refs[this.textRef]);
      const height = containerEle.height();
      while (textEle.outerHeight() > height) {
        textEle.text((index, text) => `${text.slice(0, text.length - 5)}...`);
      }
    }, 0);
  },
};
</script>
