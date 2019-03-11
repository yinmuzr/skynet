<template>
  <div>
    <SkynetNavigatorTree
      ref="tree"
      title="组织架构"
      :data="organizations"
      :loadData="loadData"
      :operationMenuTitle="organizationMenuTitle"
      :hideAddMenu="hideAddMenu"
      :defaultId="organizationId"
      :should-render-operation-menu="hasOrganizationOperateAuthority"
      @selectNode="onNodeSelected"
      @loadDataCompleted="onLoadDataCompleted"
      @operateNode="operateOrganization"/>
    <SkynetOrganizationOperationModal
      :operationName="operationName"
      :organization="currentOperationOrganization"
      :success="loadData"
      :hierarchyOptions="hierarchyOptions"
      @resetOperation="resetOperationName"/>
  </div>
</template>

<script>
import { isEmpty } from 'lodash';
import { mapActions, mapGetters, mapState } from 'vuex';
import SkynetNavigatorTree from '@/components/NavigatorTree.vue';
import SkynetOrganizationOperationModal from '@/components/organization/OrganizationOperationModal.vue';
import { GET_ORGANIZATONS, GET_AUTHORITIES_BY_ORGANIZATION_ID } from '@/store/organization.module';
import { GET_HIERARCHY } from '@/store/hierarchy.module';
import { OPERATION_MENU_OPTIONS, ORGANIZATION_MENU_TITLE } from '@/utils/constant';
import { getNodeById } from '@/utils/util';
import { deleteOrganization } from '@/services/organization.service';
import formValidation from '@/mixins/formValidation';
import { SYS_AUTHORITIES } from '@/utils/auth';

export default {
  name: 'SkynetOrganizationPanel',
  props: ['organizationId'],
  components: {
    SkynetNavigatorTree,
    SkynetOrganizationOperationModal,
  },
  mixins: [formValidation],
  data() {
    return {
      currentOperationOrganization: {},
      operationName: '',
      organizationMenuTitle: ORGANIZATION_MENU_TITLE,
      hierarchyOptions: [],
    };
  },
  computed: {
    ...mapState({
      hierarchy: state => state.hierarchy.hierarchy,
    }),
    ...mapGetters([
      'organizations',
      'userHasAuthority',
    ]),
    hasOrganizationOperateAuthority() {
      return this.userHasAuthority(SYS_AUTHORITIES.AUTHORITY_ORGANIZATION_CONFIGURABLE);
    },
  },
  methods: {
    ...mapActions({
      getOrganizations: GET_ORGANIZATONS,
      getHierarchy: GET_HIERARCHY,
      getAuthoritiesByOrganizationId: GET_AUTHORITIES_BY_ORGANIZATION_ID,
    }),
    onNodeSelected(node) {
      this.$emit('selectNode', node);
    },
    onLoadDataCompleted() {
      this.$emit('loadDataCompleted');
    },
    operateOrganization({ type, node }) {
      if (type === OPERATION_MENU_OPTIONS.ADD) {
        this.hierarchyOptions = getNodeById(this.hierarchy, node.hierarchyId).children || [];
      }
      if (type === OPERATION_MENU_OPTIONS.EDIT) {
        this.hierarchyOptions = [{ id: node.hierarchyId, name: node.hierarchyName, hierarchyType: node.hierarchyType }];
      }
      if (type === OPERATION_MENU_OPTIONS.DELETE) {
        this.showDeleteConfirm(node);
        return;
      }
      this.currentOperationOrganization = node;
      this.operationName = type;
    },
    resetOperationName() {
      this.operationName = '';
      this.hierarchyOptions = [];
    },
    hideAddMenu(node) {
      return isEmpty(getNodeById(this.hierarchy, node.hierarchyId).children);
    },
    loadData() {
      return Promise.all([this.getHierarchy(),
        this.getOrganizations(),
        this.getAuthoritiesByOrganizationId(this.organizationId)]);
    },
    showDeleteConfirm(organization) {
      this.$confirmModal.show({
        title: '确认删除',
        content: '你确定删除本组织吗？',
        action: () => deleteOrganization(organization.id),
        onSuccess: () => {
          this.getOrganizations();
          if (organization.id === this.organizationId) {
            this.$refs.tree.onClickTreeNode(this.organizations[0]);
          } else {
            this.getAuthoritiesByOrganizationId(this.organizationId);
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
