<template>
  <div>
    <Icon type="skynet-delete" class="user-operation-button delete-icon" @click.native="onDeleteClick"/>
    <Icon type="skynet-edit" class="user-operation-button edit-icon" @click.native="onEditClick"/>
  </div>
</template>

<script>
import { OPERATION_USER_OPTIONS } from '@/utils/constant';

export default {
  name: 'UserOperationColumn',
  methods: {
    onDeleteClick() {
      this.$emit('deleteUser');
    },
    onEditClick() {
      this.$emit('operateUser', { type: OPERATION_USER_OPTIONS.EDIT });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/var.scss';

  .user-operation-button {
    cursor: pointer;
    color: $--color-primary;
  }

  .edit-icon {
    margin-left: 25px;
    font-size: 22px;
  }

  .delete-icon {
    font-size: 22px;
  }
</style>
