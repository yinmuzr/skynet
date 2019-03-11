<template>
  <div class="role-item-tree-container">
    <div class="role-item-tree">
      <Tree ref="tree"
            :data="treeData"
            :render="renderContent"
            show-checkbox
            :empty-text="emptyText"
            @on-check-change="onNodeCheckChange"/>
    </div>
    <Checkbox v-model="isAllChecked" @on-change="checkAllNode" class="check-all-item" :disabled="isAllDisabled">
      {{ allText }}
    </Checkbox>
  </div>
</template>

<script>
import { isEmpty, xorWith, some, filter, reduce, includes } from 'lodash';
import { getNodes } from '@/utils/util';
import SkynetHierarchyTypeTip from '@/components/hierarchy/HierarchyTypeTip.vue';

export default {
  name: 'SkynetCheckboxTree',
  components: {
    SkynetHierarchyTypeTip,
  },
  props: {
    checkedNodeIds: Array,
    data: {
      type: Array,
      required: true,
    },
    allText: {
      type: String,
      default: '选择全部菜单',
    },
    emptyText: {
      type: String,
      default: '暂无数据',
    },
  },
  data() {
    return {
      currentCheckedLeafNodes: [],
      lastIndeterminateNodes: [],
    };
  },
  computed: {
    allLeafNodes() {
      return getNodes(this.treeData, node => node.isLeafNode);
    },
    treeData() {
      return this.buildTree(this.data);
    },
    isAllDisabled() {
      return isEmpty(this.treeData);
    },
    isAllChecked: {
      get() {
        if (isEmpty(this.treeData)) {
          return false;
        }
        return (this.allLeafNodes.length === this.currentCheckedLeafNodes.length);
      },
      set(checked) {
        this.treeData.forEach((node) => {
          const el = node;
          if (node.checked !== checked) {
            el.checked = checked;
            this.$refs.tree.handleCheck(el);
          }
        });
      },
    },
  },
  methods: {
    renderContent(h, { data }) {
      return (
        <span>
          {data.title}
          {data.hierarchyType && <SkynetHierarchyTypeTip hierarchyType={data.hierarchyType}/>}
        </span>
      );
    },
    buildTree(data, parentNode) {
      if (!data) return undefined;
      return data.map((item) => {
        const node = {
          ...item,
          title: item.name,
          dependAuthorities: item.dependAuthorities,
          expand: true,
          checked: false,
          indeterminate: false,
          getParentNode: () => parentNode,
        };
        node.children = this.buildTree(isEmpty(item.children) ? item.authorities : item.children, node);
        node.isLeafNode = isEmpty(node.children);
        return node;
      });
    },
    checkAllNode(checked) {
      this.isAllChecked = checked;
    },
    isNodeDependOnOther(node, dependNode) {
      return some(node.dependAuthorities, item => item === dependNode.id);
    },
    fixIndeterminateNodeCheckForIE(node) {
      // 同时判断id和name（因为id对应的层级是不一样的，有可能相同，所以需要加上name的限制）
      if (some(this.lastIndeterminateNodes, { id: node.id, name: node.name }) && !node.checked) {
        this.$nextTick(() => {
          this.$set(node, 'checked', true);
          this.$nextTick(() => {
            this.$refs.tree.handleCheck({
              ...node,
              checked: false,
            });
          });
        });
      }
    },
    onNodeCheckChange(checkedNodes, currentNode) {
      this.fixIndeterminateNodeCheckForIE(currentNode);

      const nextCheckedNodes = checkedNodes.filter(node => node.isLeafNode);
      const diffCheckedNodes = xorWith(
        nextCheckedNodes, this.currentCheckedLeafNodes,
        (node1, node2) => node1.nodeKey === node2.nodeKey,
      );
      if (!isEmpty(diffCheckedNodes)) {
        this.currentCheckedLeafNodes = nextCheckedNodes;
        this.handleDependAuthorities(nextCheckedNodes);

        this.$emit('update:checkedNodeIds', this.currentCheckedLeafNodes.map(authority => authority.id));
        this.$emit('on-checked-change', this.currentCheckedLeafNodes);
      }
      this.lastIndeterminateNodes = filter(
        this.$refs.tree.getCheckedAndIndeterminateNodes(),
        item => item.indeterminate,
      );
    },
    handleDependAuthorities(nextCheckedNodes) {
      const shouldDisabledDependNodeIds = reduce(
        nextCheckedNodes
          .filter(node => !isEmpty(node.dependAuthorities))
          .map(node => node.dependAuthorities),
        (acc, nodeIds) => acc.concat(nodeIds),
        [],
      );

      this.allLeafNodes.forEach((node) => {
        if (includes(shouldDisabledDependNodeIds, node.id)) {
          this.$set(node, 'disabled', true);

          if (!node.checked) {
            this.$nextTick(() => this.$refs.tree.handleCheck({
              ...node,
              checked: true,
            }));
          }
        } else {
          this.$set(node, 'disabled', false);
        }
      });
    },
  },
  mounted() {
    this.allLeafNodes
      .filter(node => this.checkedNodeIds.indexOf(node.id) >= 0)
      .forEach(node => this.$refs.tree.handleCheck({
        ...node,
        checked: true,
      }));
  },
};
</script>
<style lang="scss">
.role-item-tree-container {
  font-size: 14px;
  .role-item-tree {
    user-select: none;
    width: 100%;
    height: 300px;
    border-radius: 3px;
    background-color: #ffffff;
    border: solid 1px #d2dce9;
    overflow-y: scroll;
    padding-left: 26px;
    .ivu-tree {
      .ivu-tree-title-selected {
        background: none;
      }
      ul {
        font-size: 14px;
      }
    }
  }
  .ivu-checkbox-wrapper {
    font-size: 14px;
  }
  .check-all-item {
    margin-top: 10px;
  }
}
</style>
