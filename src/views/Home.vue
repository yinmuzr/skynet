<template>
  <Layout>
    <SkynetHeader/>
    <Content class="main-container">
      <div class="layout main-content">
        <SkynetLoadable :show-loading="isLoading">
          <router-view/>
       </SkynetLoadable>
      </div>
    </Content>
  </Layout>
</template>

<script>
// @ is an alias to /src
import { mapActions, mapState } from 'vuex';
import { isEmpty } from 'lodash';
import SkynetHeader from '@/layout/Header.vue';
import SkynetLoadable from '@/components/Loadable.vue';
import { GET_ORGANIZATON_MAPPINGS } from '@/store/organization.module';

export default {
  name: 'home',
  components: {
    SkynetHeader,
    SkynetLoadable,
  },
  computed: {
    ...mapState({
      organizationMappings: state => state.organizations.mappings,
    }),
  },
  data() {
    return {
      isLoading: true,
    };
  },
  methods: {
    ...mapActions({
      getOrganizationMappings: GET_ORGANIZATON_MAPPINGS,
    }),
  },
  created() {
    if (isEmpty(this.organizationMappings)) {
      this.getOrganizationMappings().finally(() => { this.isLoading = false; });
    } else {
      this.isLoading = false;
    }
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/var.scss';
.main-container {
  padding-top: 20px;
  padding-bottom: 190px;
  background: $--background-color-base url('../assets/footer-logo@3x.png') no-repeat;
  background-size: 216px 28px;
  background-position: center bottom 106px;
}
.main-content {
  background: #fff;
  min-height: 600px;
}
</style>

