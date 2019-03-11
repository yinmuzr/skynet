<template>
  <SkynetAuthLayout>
    <SkynetHierarchyPanel
      slot="navigator"
      :hierarchyId="hierarchyId"
      @loadDataCompleted="hierarchyLoadComplete"
      @selectNode="getHierarchy"/>
    <SkynetRoleList :hierarchy="hierarchy"/>
  </SkynetAuthLayout>
</template>

<script>
import SkynetAuthLayout from '@/layout/AuthLayout.vue';
import SkynetHierarchyPanel from '@/components/hierarchy/HierarchyPanel.vue';
import SkynetRoleList from '@/components/role/RoleList.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'SkynetHierarchyAndRole',
  props: {
    hierarchyId: {
      default: 1,
    },
  },
  data() {
    return {
      hierarchy: {
        id: null,
        name: '',
      },
    };
  },
  methods: {
    hierarchyLoadComplete() {
      this.hierarchy.id = this.topHierarchy.id;
      this.hierarchy.name = this.topHierarchy.name;
    },
    getHierarchy(node) {
      this.hierarchy.id = node.id;
      this.hierarchy.name = node.name;
      this.$router.push({ name: 'iam-role', params: { hierarchyId: node.id } });
    },
  },
  components: {
    SkynetAuthLayout,
    SkynetHierarchyPanel,
    SkynetRoleList,
  },
  computed: {
    ...mapGetters([
      'topHierarchy',
    ]),
  },
};
</script>

<style lang="scss">
@import "@/styles/var.scss";
.horizontal-section {
  height: $--horizontal-section-height;
}
.hierarchy-section {
  background-color: #f9fbfd;
}

</style>
