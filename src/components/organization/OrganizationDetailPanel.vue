<template>
  <div class="organization-detail">
    <SkynetOrganizationAuthority :operable="hasOrganizationOperateAuthority" :organization="organizationNode" />
    <SkynetUserList class="user-list" :operable="hasUserOperationAuthority" :organization="organizationNode"/>
  </div>
</template>

<script type="text/jsx">
import { mapState, mapGetters } from 'vuex';
import SkynetOrganizationAuthority from '@/components/organization/OrganizationAuthority';
import SkynetUserList from '@/components/organization/UserList';
import { SYS_AUTHORITIES } from '@/utils/auth';

export default {
  name: 'SkynetOrganizationDetail',
  components: {
    SkynetUserList,
    SkynetOrganizationAuthority,
  },
  props: {
    organizationNode: {},
  },
  computed: {
    ...mapState({
      currentUserOrgId: state => state.auth.user.organizationId,

    }),
    ...mapGetters([
      'userHasAuthority',
    ]),
    hasOrganizationOperateAuthority() {
      return this.userHasAuthority(SYS_AUTHORITIES.AUTHORITY_ORGANIZATION_CONFIGURABLE);
    },
    hasUserOperationAuthority() {
      if (!this.userHasAuthority(SYS_AUTHORITIES.AUTHORITY_PEOPLE_CONFIGURABLE)) {
        return false;
      }

      let node = this.organizationNode;
      while (node) {
        if (node.id === this.currentUserOrgId) {
          return true;
        }
        node = node.getParentNode();
      }
      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
.organization-detail{
  height: 100%;
}
.user-list {
  height: 70%;
  margin-top: 20px;
}
</style>
