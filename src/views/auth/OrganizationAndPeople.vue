<template>
  <SkynetAuthLayout>
    <SkynetOrganizationPanel
      slot="navigator"
      :organizationId="organizationId"
      @selectNode="handleSelectNode"/>
    <SkynetOrganizationDetailPanel
      :organizationNode="organization"
    />
  </SkynetAuthLayout>
</template>

<script>
import { mapGetters } from 'vuex';
import SkynetAuthLayout from '@/layout/AuthLayout.vue';
import SkynetOrganizationPanel from '@/components/organization/OrganizationPanel.vue';
import SkynetOrganizationDetailPanel from '@/components/organization/OrganizationDetailPanel.vue';

export default {
  name: 'SkynetOrganizationAndPeople',
  props: {
    organizationId: {
      default: 1,
    },
  },
  data() {
    return {
      organization: undefined,
    };
  },
  methods: {
    handleSelectNode(node) {
      this.organization = node;
      this.$router.push({ name: 'iam-organization', params: { organizationId: node.id } });
    },
  },
  components: {
    SkynetOrganizationDetailPanel,
    SkynetAuthLayout,
    SkynetOrganizationPanel,
  },
  computed: {
    ...mapGetters([
      'organizations',
    ]),
  },
};
</script>

<style lang="scss">
  @import "@/styles/var.scss";

  .horizontal-section {
    height: $--horizontal-section-height;
  }

  .organization-section {
    background-color: #f9fbfd;
  }
</style>
