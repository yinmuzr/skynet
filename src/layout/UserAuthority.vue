<template>
  <SkynetLoadable :showLoading="isLoading">
    <div class="user-authority-container">
      <h4 class="user-info-item">{{ userInfo.name }}</h4>
      <ul>
        <li v-for="item in userInfo.items" :key="item.title" class="user-info-item">
          <h4 class="user-info-title">{{ item.title }}</h4>
          <p v-html="item.content"></p>
        </li>
      </ul>
    </div>
  </SkynetLoadable>
</template>

<script>
import { isEmpty } from 'lodash';
import { mapGetters } from 'vuex';
import SkynetLoadable from '@/components/Loadable.vue';
import { getUserAuthority } from '@/services/user.service';
import { getAuthorityMenuName, buildPrivilegedOrganizationsText } from '@/utils/authority';

const getMaterialsText = (user, organizationAuthorities) => {
  if (!isEmpty(user.materials)) {
    return user.materials.map(material => `${material.name}(${material.code})`).join('、');
  }

  if (organizationAuthorities.hasAllMaterialGroups && user.hasAllMaterials) {
    return '具有全部物料组所包含的全部物料权限';
  }

  if (user.hasAllMaterials) {
    return `具有以下物料组所包含的全部物料权限：<br/>
      ${organizationAuthorities.materialGroups.map(materialGroup =>
    `${materialGroup.name}(${materialGroup.code})`).join('、')}
    `;
  }

  return '未知错误';
};

export default {
  name: 'SkynetUserAuthority',
  components: {
    SkynetLoadable,
  },
  data() {
    return {
      isLoading: true,
      userInfo: {
        name: '',
        items: [],
      },
    };
  },
  computed: {
    ...mapGetters(['organizations']),
  },
  methods: {
    buildUserInfo({
      user, hasAllAuthorities, menuAuthorities, organizationAuthorities,
    }) {
      this.userInfo = {
        name: user.userEmailNum,
        items: [
          {
            title: '角色',
            content: user.roles.map(role => role.name).join('、'),
          },
          {
            title: '菜单权限',
            content: getAuthorityMenuName(hasAllAuthorities, menuAuthorities),
          },
          {
            title: '物料权限',
            content: getMaterialsText(user, organizationAuthorities),
          },
          {
            title: '组织权限',
            content: buildPrivilegedOrganizationsText(
              organizationAuthorities.privilegedOrganizations,
              this.organizations,
            ),
          },
        ],
      };
    },
  },
  created() {
    getUserAuthority().then((data) => {
      this.isLoading = false;
      this.buildUserInfo(data);
    }).catch(() => {
      this.isLoading = true;
      this.userInfo = {
        name: '',
        items: [],
      };
    });
  },
};
</script>

<style lang="scss" scoped>
.user-authority-container {
  max-height: 400px;
  overflow-y: auto;
}
.user-info-item {
  margin-bottom: 12px;
}
</style>

