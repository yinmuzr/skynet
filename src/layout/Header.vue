<template>
<Header>
  <div class="header-row">
    <Row class="layout">
      <Col span="4" class="logo-col">
        <img class="logo-img" alt="格力天网系统" src="../assets/logo@3x.png" />
      </Col>
      <Col span="20" class="navbar-wrap">
        <ul class="navbar">
          <li v-for="menu in permittedBusinessMenus"
            is="SkynetNavbarItem"
            :to="menu.route"
            :key="menu.code"
          >
            {{menu.name}}
          </li>
        </ul>
        <ul class="navbar -right">
          <li v-for="systemMenu in permittedSystemMenus"
            is="SkynetNavbarItem"
            :to="systemMenu.route"
            :key="systemMenu.code"
            class="system-menu"
          >
            <Icon type="skynet-setting"/>
            {{systemMenu.name}}
          </li>
          <li is="SkynetNavbarItem">
            <SkynetUserMenuItem></SkynetUserMenuItem>
          </li>
        </ul>
      </Col>
    </Row>
  </div>
  <div class="header-subrow" v-show="!hideSubMenu">
    <Row class="layout">
      <Col span="4">
        <SkynetBaseDropdown :class="{'hide-base-dropdown': hideBaseMenus}"/>
      </Col>
      <Col span="20" class="navbar-wrap">
        <ul class="navbar">
          <li v-for="subMenu in currentSubMenus"
            is="SkynetNavbarItem"
            type="secondary"
            :to="subMenu.route"
            :key="subMenu.code"
          >
            {{subMenu.name}}
          </li>
        </ul>
      </Col>
    </Row>
  </div>
</Header>
</template>

<script>
import { isEmpty } from 'lodash';
import { mapActions, mapGetters, mapState } from 'vuex';
import { GET_MENUS } from '@/store/menus.module';
import SkynetNavbarItem from '@/layout/NavbarItem.vue';
import SkynetUserMenuItem from '@/layout/UserMenuItem.vue';
import SkynetBaseDropdown from '@/components/BaseDropdown.vue';

function findAllLeafAuthorities(menu, authoritiesOfMenu) {
  if (menu.children && menu.children.length > 0) {
    menu.children.map(subMenu => findAllLeafAuthorities(subMenu, authoritiesOfMenu));
  } else if (menu.authorities) {
    menu.authorities.map(authority => authoritiesOfMenu.push(authority.code));
  }
}

function isPermittedMenu(menu, userHasAuthoritiesIn) {
  const authoritiesOfMenu = [];
  findAllLeafAuthorities(menu, authoritiesOfMenu);

  return userHasAuthoritiesIn(authoritiesOfMenu);
}

function rebuildPermittedMenus(menus, userHasAuthoritiesIn) {
  return isEmpty(menus) ? menus : (
    menus
      .filter(subMenu => isPermittedMenu(subMenu, userHasAuthoritiesIn))
      .map(subMenu => ({
        ...subMenu,
        children: rebuildPermittedMenus(subMenu.children, userHasAuthoritiesIn),
      }))
  );
}

export default {
  name: 'SkynetHeader',
  components: {
    SkynetNavbarItem,
    SkynetUserMenuItem,
    SkynetBaseDropdown,
  },
  data() {
    return {
      selectedKey: 'RISK_FOREWARNING',
      getPermittedMenus: menus => rebuildPermittedMenus(menus, this.userHasAuthoritiesIn),
      hideBaseMenus: false,
    };
  },
  computed: {
    ...mapState({
      hideSubMenu: state => state.menus.hideSubMenu,
    }),
    ...mapGetters([
      'businessMenus',
      'systemMenus',
      'mainMenus',
      'userHasAuthoritiesIn',
    ]),
    permittedBusinessMenus() {
      return this.getPermittedMenus(this.businessMenus);
    },
    permittedSystemMenus() {
      return this.getPermittedMenus(this.systemMenus);
    },
    permittedMainMenus() {
      return this.getPermittedMenus(this.mainMenus);
    },
    selectedMenu() {
      return [...this.permittedBusinessMenus, ...this.permittedSystemMenus]
        .filter(menu => menu.code === this.selectedKey)[0];
    },
    currentSubMenus() {
      return isEmpty(this.selectedMenu) ? [] : this.selectedMenu.children;
    },
  },
  methods: {
    ...mapActions({
      getMenus: GET_MENUS,
    }),
    setSelectedKey(path) {
      // TODO: 或者应该改成index===0
      // 只要selectedMenu 不要 selectedKey
      const selectedMenu = this.permittedMainMenus.filter(menu => path.indexOf(menu.route) !== -1)[0];
      if (!isEmpty(selectedMenu)) {
        this.selectedKey = selectedMenu.code;
      }
    },
    toggleBaseMenus(meta) {
      this.hideBaseMenus = meta.hideBaseMenus === true;
    },
    initMenus(route) {
      this.setSelectedKey(route.path);
      this.toggleBaseMenus(route.meta);
    },
  },
  created() {
    this.getMenus().then(() => {
      this.initMenus(this.$route);
    });
  },
  watch: {
    // eslint-disable-next-line
    '$route'(to) {
      this.initMenus(to);
    },
  },
};
</script>


<style lang="scss" scoped>
@import "@/styles/var.scss";
.header-row {
  background-color: #262c36;
  height: $--header-row-height;
}
.header-subrow {
  background-color: #3b414d;
  height: $--header-subrow-height;
}
.logo-col {
  padding-top: 16px;
  > .logo-img {
    max-width: 100%;
    width: 208px;
    height: 26px;
  }
}
.navbar-wrap {
  padding-left: 6%;
}
.navbar {
  height: 100%;
  list-style: none;
  margin: 0;
  padding: 0;
  float: left;
  &.-right {
    float: right;
  }
}
.system-menu {
  font-size: 12px;
  .ivu-icon-skynet-setting {
    margin-right: 2px;
    margin-top: -1px;
    vertical-align: middle;
    font-size: 16px;
  }
}
.hide-base-dropdown {
  visibility: hidden;
}
</style>

