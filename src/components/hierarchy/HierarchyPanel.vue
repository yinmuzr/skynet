<template>
  <div>
    <SkynetNavigatorTree
      ref="tree"
      title="层级架构"
      :data="hierarchy"
      :loadData="getHierarchy"
      :defaultId="hierarchyId"
      @selectNode="onNodeSelected"
      @loadDataCompleted="onLoadDataCompleted"
      @operateNode="operateHierarchy"
      :should-render-operation-menu="hasHierarchyOperateAuthority"
      :operationMenuTitle="hierarchyMenuTitle"/>
    <SkynetHierarchyOperationModal
      :operationName="operationName"
      :hierarchy="currentOperationHierarchy"
      :success="this.getHierarchy"
      @resetOperation="this.resetOperationName"/>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import SkynetNavigatorTree from '@/components/NavigatorTree.vue';
import SkynetHierarchyOperationModal from '@/components/hierarchy/HierarchyOperationModal.vue';
import { GET_HIERARCHY } from '@/store/hierarchy.module';
import { OPERATION_MENU_OPTIONS, HIERARCHY_MODAL_TITLE } from '@/utils/constant';
import { deleteHierarchy } from '@/services/hierarchy.service';
import formValidation from '@/mixins/formValidation';
import { SYS_AUTHORITIES } from '@/utils/auth';

export default {
  name: 'SkynetHierarchyPanel',
  components: {
    SkynetNavigatorTree,
    SkynetHierarchyOperationModal,
  },
  mixins: [formValidation],
  props: ['hierarchyId'],
  data() {
    return {
      currentOperationHierarchy: {},
      operationName: '',
      hierarchyMenuTitle: HIERARCHY_MODAL_TITLE,
    };
  },
  computed: {
    ...mapState({
      hierarchy: state => state.hierarchy.hierarchy,
    }),
    ...mapGetters([
      'userHasAuthority',
    ]),
    hasHierarchyOperateAuthority() {
      return this.userHasAuthority(SYS_AUTHORITIES.AUTHORITY_HIERARCHY_AND_ROLE_CONFIGURABLE);
    },
  },
  methods: {
    ...mapActions({
      getHierarchy: GET_HIERARCHY,
    }),
    onNodeSelected(node) {
      this.$emit('selectNode', node);
    },
    onLoadDataCompleted() {
      this.$emit('loadDataCompleted');
    },
    operateHierarchy({ type, node }) {
      if (type === OPERATION_MENU_OPTIONS.DELETE) {
        this.showDeleteConfirm(node);
      } else {
        this.operationName = type;
        this.currentOperationHierarchy = node;
      }
    },
    resetOperationName() {
      this.operationName = '';
    },
    showDeleteConfirm(hierarchy) {
      this.$confirmModal.show({
        title: '确认删除',
        content: '你确定删除本层级吗？',
        action: () => deleteHierarchy(hierarchy.id),
        onSuccess: () => {
          this.getHierarchy();
          if (hierarchy.id === this.hierarchyId) {
            this.$refs.tree.onClickTreeNode(this.hierarchy[0]);
          }
        },
        onFail: (error) => {
          if (error.success !== undefined && error.errorMessage) {
            this.showGlobalError(error.errorMessage);
          } else {
            this.showGlobalError();
          }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
