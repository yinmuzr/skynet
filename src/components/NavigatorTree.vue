<template>
  <div>
    <Row class='title-container'>
      <span class="section-title">{{ title }}</span>
    </Row>
    <Row class="navigator-container">
      <SkynetLoadable :show-loading="isLoading">
        <div class="tree-container">
          <Tree :data="data" :render="renderContent" empty-text=""></Tree>
        </div>
      </SkynetLoadable>
    </Row>
  </div>
</template>

<script type="text/jsx">
import { isEmpty } from 'lodash';
import SkynetNodeOperationMenu from '@/components/NodeOperationMenu.vue';
import SkynetLoadable from '@/components/Loadable.vue';
import SkynetHierarchyTypeTip from '@/components/hierarchy/HierarchyTypeTip.vue';
import { getNodeById } from '@/utils/util';

export default {
  name: 'SkynetNavigatorTree',
  components: {
    SkynetNodeOperationMenu,
    SkynetLoadable,
    SkynetHierarchyTypeTip,
  },
  props: {
    defaultId: {},
    title: {
      type: String,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    operationMenuTitle: {
      type: Object,
      required: true,
    },
    loadData: {
      type: Function,
      required: true,
    },
    hideAddMenu: {
      type: Function,
    },
    shouldRenderOperationMenu: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      currentSelectedNode: {},
      isLoading: true,
    };
  },
  methods: {
    rebuildTree(children, parentNode) {
      if (!children) return;
      children.forEach((node) => {
        const child = node;
        child.getParentNode = () => parentNode;
        this.rebuildTree(child.children, child);
        child.isLeafNode = () => isEmpty(child.children);
        child.getPath = () => this.getNodePath(child);
      });
    },
    getNodePath(node) {
      const nodePaths = [];
      let parent = node.getParentNode();
      while (parent) {
        nodePaths.unshift(parent);
        parent = parent.getParentNode();
      }
      return nodePaths.map(nodePath => nodePath.name).join('>');
    },
    onClickTreeNode(nodeData) {
      this.currentSelectedNode = nodeData;
      this.$emit('selectNode', nodeData);
    },
    operateNode({ type, data }) {
      this.$emit('operateNode', { type, node: data });
    },
    renderContent(h, { data }) {
      const nodeClassName = 'tree-node ivu-tree-title';
      const selectedClassName =
        this.currentSelectedNode.id === data.id
          ? 'ivue-tree-node-selected'
          : '';

      return (<div class={nodeClassName}>
          <div class={`ivu-tree-node ${selectedClassName}`} onClick={ () => this.onClickTreeNode(data) }>
            {data.name}
          </div>
          {data.hierarchyType && <SkynetHierarchyTypeTip transfer={true} hierarchyType={data.hierarchyType}/>}
          {
            this.shouldRenderOperationMenu && <SkynetNodeOperationMenu
              hideAddMenu={this.hideAddMenu}
              onOperateNode={this.operateNode}
              node={data}
              operationMenuTitle={this.operationMenuTitle}/>
          }
          </div>

      );
    },
  },
  created() {
    this.loadData()
      .then(() => {
        if (!isEmpty(this.data)) {
          const defaultNode = this.defaultId && getNodeById(this.data, this.defaultId);
          this.currentSelectedNode = isEmpty(defaultNode) ? this.data[0] : defaultNode;
          this.$emit('selectNode', this.currentSelectedNode);
        }
        this.isLoading = false;
        this.$emit('loadDataCompleted');
      })
      .catch(() => {
        this.$emit('loadDataFailed');
      });
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/var.scss";
.tree-container {
  padding: 0 0 22px 29px;
  max-height: 100%;
}
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) !important;
}
.navigator-container {
  overflow: auto;
  height: $--horizontal-section-height - 100px;
}
</style>

