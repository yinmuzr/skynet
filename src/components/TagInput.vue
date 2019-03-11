<template>
  <div :class="tagContainerClasses"
       ref="container"
       @scroll="handleScroll"
       @focus="focus()"
       @click="focus()">
    <span class="description" v-if="disabled">{{ description }}</span>
    <div class="tags" v-else>
      <template v-for="tag in tags">
        <Button :key="tag.id" class="loading-tag" v-if="tag.promise" size="small" :loading="true">{{tag.code}}</Button>
        <Tag v-else
             :key="tag.id"
             :name="tag.id"
             :class="tagClassName(tag)"
             checkable
             @on-close="handleClose"
             :closable="!disabled"
        >
          {{ tag.name ? `${tag.name} (${tag.code})` : tag.code }}
        </Tag>
      </template>
      <Input
        v-if="!disabled"
        ref="input"
        class="add-new"
        :placeholder="placeholder"
        @on-enter="handleCodeInputted"
        @on-blur="handleCodeInputted"
        :disabled="disabled"
        v-model="currentInput"/>
    </div>
    <div v-if="!disabled" class="icon-remove-all" ref="deleteAllIcon" @click="deleteAll">
      <div class="line"/>
      <Icon type="skynet-delete"/>
    </div>
  </div>
</template>

<script type='text/jsx'>
import jQuery from 'jquery';
import { find, findIndex, some, trim } from 'lodash';
import { ERROR } from '@/utils/constant';

export default {
  name: 'SkynetTagInput',
  props: {
    placeholder: {
      type: String,
      default: '',
    },
    validateInput: {
      type: Function,
      required: true,
    },
    errorMap: Object,
    disabled: {
      type: Boolean,
      default: false,
    },
    description: String,
    value: Array[{
      code: {
        type: String,
        default: [],
      },
      name: String,
    }],
  },
  data() {
    return {
      currentInput: '',
      tags: this.buildTags(this.value),
    };
  },
  computed: {
    tagContainerClasses() {
      return {
        'tag-input-container': true,
        'ivu-input': true,
        'tag-input-container-error': this.hasError,
        disabled: this.disabled,
      };
    },
    hasError() {
      return some(this.tags, tag => tag.error);
    },
  },
  watch: {
    value(newValue) {
      this.tags = this.buildTags(newValue);
    },
  },
  methods: {
    adjustDeleteIconPos(scrollHeight) {
      jQuery(this.$refs.deleteAllIcon).css('bottom', `${-scrollHeight}px`);
    },
    handleScroll(e) {
      this.adjustDeleteIconPos(e.target.scrollTop);
    },
    deleteAll() {
      this.value.splice(0, this.value.length);
      this.$nextTick(() => {
        this.adjustDeleteIconPos(0);
      });
    },
    buildTags(value) {
      if (!value) {
        return [];
      }
      return value.map((tag, index) => ({
        ...tag,
        id: `${tag.code}-${index}`,
      }));
    },
    tagClassName(tag) {
      return tag.error && 'error';
    },
    emitTagsInput() {
      this.$emit('input', this.tags);
    },
    refreshAndFocus() {
      this.emitTagsInput();
      this.$nextTick(() => {
        this.focus();
      });
    },
    refreshTag(tag) {
      const foundIndex = findIndex(this.tags, item => item.id === tag.id);
      if (foundIndex !== -1) {
        this.tags[foundIndex] = tag;
        this.emitTagsInput();
      }
    },
    handleClose(event, id) {
      const currentCloseTag = find(this.tags, tag => tag.id === id);
      if (!currentCloseTag.isDuplicated) {
        this.setFirstDuplicatedTag(currentCloseTag);
      }
      this.tags = this.tags.filter(t => t.id !== id);
      this.refreshAndFocus();
    },
    isDuplicatedTag(tagCode) {
      return !!find(this.tags, item => item.code === tagCode);
    },
    setFirstDuplicatedTag(tag) {
      const firstDuplicatedTag = find(
        this.tags,
        item => item.code === tag.code && item.id !== tag.id && item.isDuplicated,
      );

      if (!firstDuplicatedTag) {
        return;
      }

      if (tag.name) {
        firstDuplicatedTag.error = null;
        firstDuplicatedTag.isDuplicated = false;
        firstDuplicatedTag.name = tag.name;
      } else {
        firstDuplicatedTag.error = tag.error;
        firstDuplicatedTag.isWrongCode = tag.isWrongCode;
        firstDuplicatedTag.isDuplicated = tag.isDuplicated;
      }
    },
    setWrongCodeErrorTag(tag, tagError = {}) {
      // eslint-disable-next-line no-param-reassign
      tag.isWrongCode = true;
      // eslint-disable-next-line no-param-reassign
      tag.error = tagError.message || (this.errorMap && this.errorMap.wrongCode) || ERROR.INPUT;
    },
    setTagPromise(newTag) {
      this.$nextTick(() => {
        // eslint-disable-next-line no-param-reassign
        newTag.promise = this.validateInput(newTag.code).then((tag) => {
          // eslint-disable-next-line no-param-reassign
          newTag.name = tag.name;
        }).catch((tagError) => {
          this.setWrongCodeErrorTag(newTag, tagError);
        }).finally(() => {
          // eslint-disable-next-line no-param-reassign
          newTag.promise = null;
          this.refreshTag(newTag);
        });
      });
    },
    handleCodeInputted() {
      const value = trim(this.currentInput);
      if (value) {
        this.currentInput = '';
        const newTag = {
          code: value,
          id: `${value}-${this.tags.length}`,
        };

        if (this.isDuplicatedTag(value)) {
          newTag.isDuplicated = true;
          newTag.error = (this.errorMap && this.errorMap.duplicated) || ERROR.INPUT_DUPLICATED;
        } else {
          this.setTagPromise(newTag);
        }

        this.tags.push(newTag);
        this.emitTagsInput();
      }
    },
    focus() {
      if (this.$refs.input) this.$refs.input.focus();
    },
    markTagIsWrong(code) {
      this.tags = this.tags.map(tag => ({ ...tag, isWrongCode: tag.isWrongCode || tag.code === code }));
    },
  },
};
</script>
<style lang='scss'>
  @import '@/styles/var.scss';

  .description {
    color: rgba(74, 79, 93, .4);
  }

  .tag-input-container-error {
    border: 1px solid #e82222;
    &:hover {
      border: 1px solid #e82222;
    }
    &:focus {
      border-color: #e82222;
      box-shadow: 0 0 0 2px rgba(232, 34, 34, .2);
    }
  }

  .tag-input-container {
    position: relative;
    font-size: 14px;
    user-select: none;
    height: auto;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 0;
    padding-bottom: 0;

    .icon-remove-all {
      cursor: pointer;
      width: 7%;
      display: inline-block;
      text-align: center;
      position: absolute;
      font-size: 24px;
      bottom: 0;
      right: 0;
      color: $--color-text-placeholder;

      .line {
        position: absolute;
        top: 14px;
        right: -7px;
        border: 0.5px solid $--border-color-base;
        width: 200%;
        transform: rotate(135deg);
      }

      .ivu-icon-skynet-delete:before {
        position: absolute;
        top: 12px;
        right: 2px;
      }
    }

    .tags {
      width: 93%;
      display: inline-block;
      .add-new {
        display: inline-block;
        width: 200px;
        input {
          border: none;
          outline: none;
          padding-right: 0;
        }
        .ivu-input:focus {
          border: none;
          outline: none;
          box-shadow: none;
        }
        .ivu-input-disabled {
          background-color: #f9f9f9;
        }
      }

      .ivu-tag {
        .ivu-tag-text {
          vertical-align: middle;
        }
        .ivu-icon {
          font-size: 18px;
          vertical-align: middle;
        }
      }

      &.disabled {
        background-color: #f9f9f9;
        &.ivu-input:hover {
          border-color: #f9f9f9;
        }

        &:hover {
          cursor: not-allowed;
        }
      }

      .error {
        background-color: $--color-danger;
        color: white;
      }
    }
  }

  .loading-tag {
    margin-right: 4px;
  }
</style>
