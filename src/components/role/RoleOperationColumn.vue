<template>
  <div>
    <Icon v-if="deletable" type="skynet-delete" class="role-operation-button delete-icon"
          @click.native="onDeleteClick"/>
    <Icon type="skynet-edit" class="role-operation-button edit-icon" @click.native="onEditClick"/>
  </div>
</template>

<script>
import { OPERATION_ROLE_OPTIONS } from '@/utils/constant';

export default {
  name: 'RoleOperationColumn',
  props: {
    deletable: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    onDeleteClick() {
      this.$emit('operateRole', { type: OPERATION_ROLE_OPTIONS.DELETE });
    },
    onEditClick() {
      this.$emit('operateRole', { type: OPERATION_ROLE_OPTIONS.EDIT });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/var.scss';

.role-operation-button {
  cursor: pointer;
  color: $--color-primary;
}

.edit-icon {
  width: 50%;
  font-size: 22px;
}

.delete-icon {
  width: 50%;
  font-size: 22px;
}
</style>
