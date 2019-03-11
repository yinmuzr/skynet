<template>
  <Dropdown class="operation-dropdown" trigger="click" @on-click="handleOperationClick" :transfer="true">
    <Button type="text" size="small" class="ellipsis-button">
      <Icon class="icon-ellipsis" type="skynet-ellipsis"/>
    </Button>
    <DropdownMenu slot="list" class="operation-menu">
      <DropdownItem v-if="!shouldHideAddMenu" name="addNode">{{operationMenuTitle[treeOperation.ADD]}}</DropdownItem>
      <DropdownItem name="editNode">{{operationMenuTitle[treeOperation.EDIT]}}</DropdownItem>
      <DropdownItem v-if="!shouldHideDeleteMenu" name="deleteNode">
        {{operationMenuTitle[treeOperation.DELETE]}}
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>
</template>

<script>
import { OPERATION_MENU_OPTIONS, PARENT_ID_OF_ROOT } from '@/utils/constant';

export default {
  name: 'SkynetNodeOperationMenu',
  props: {
    node: {
      type: Object,
      required: true,
    },
    operationMenuTitle: {
      type: Object,
      required: true,
    },
    hideAddMenu: {
      type: Function,
    },
  },
  data() {
    return {
      treeOperation: OPERATION_MENU_OPTIONS,
      shouldHideAddMenu: false,
      shouldHideDeleteMenu: false,
    };
  },
  methods: {
    handleOperationClick(currentDropdownItemName) {
      if (currentDropdownItemName) {
        this[currentDropdownItemName]();
      }
    },
    addNode() {
      this.operateNode({ type: OPERATION_MENU_OPTIONS.ADD, data: this.node });
    },
    editNode() {
      this.operateNode({ type: OPERATION_MENU_OPTIONS.EDIT, data: this.node });
    },
    deleteNode() {
      this.operateNode({ type: OPERATION_MENU_OPTIONS.DELETE, data: this.node });
    },
    operateNode(data) {
      this.$emit('operateNode', data);
    },
  },
  created() {
    if (this.hideAddMenu && this.hideAddMenu(this.node)) {
      this.shouldHideAddMenu = true;
    }
    if (this.node.parentId === PARENT_ID_OF_ROOT) {
      this.shouldHideDeleteMenu = true;
    }
  },
};
</script>

<style lang="scss" scoped>
.operation-dropdown {
  display: inline-block;
}
.ellipsis-button {
  padding: 0;
  font-size: 22px;
  &:hover {
    .icon-ellipsis {
      &::before {
        color: #000;
      }
    }
  }
}
.operation-menu {
  width: 110px;
  > li {
    margin: 0;
    padding: 7px 16px;
  }
}
</style>
