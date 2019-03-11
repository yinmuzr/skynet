<template>
  <div>
    <Menu v-if="!hideSubMenu" mode="horizontal" :active-name="activeMenu" @on-select="handleOnChange">
      <MenuItem
        v-for="menuItem in menuItems"
        :key="menuItem.name"
        :name="menuItem.name"
        :to="menuItem.to">
        {{ menuItem.label }}
      </MenuItem>
    </Menu>
    <router-view/>
  </div>
</template>

<script>
import { DATA_ENTRANCE_MENU_NAME, DATA_ENTRANCE_MENUS } from '@/utils/constant';
import { mapMutations, mapState } from 'vuex';
import { UPDATE_INSPECTION_TYPE } from '@/store/report.module';

export default {
  name: 'SkynetDataEntrance',
  data() {
    return {
      activeMenu: DATA_ENTRANCE_MENU_NAME.SAMPLE,
      menuItems: DATA_ENTRANCE_MENUS,
    };
  },
  methods: {
    ...mapMutations({
      updateInspectionType: UPDATE_INSPECTION_TYPE,
    }),
    handleOnChange(name) {
      this.updateInspectionType(({ type: name }));
    },
    handleRouteEnterOrUpdate(newRoute) {
      let inspectionType;
      if (newRoute.name.indexOf('sample') >= 0) {
        inspectionType = DATA_ENTRANCE_MENU_NAME.SAMPLE;
      } else if (newRoute.name.indexOf('full') >= 0) {
        inspectionType = DATA_ENTRANCE_MENU_NAME.FULL;
      }
      this.updateInspectionType(({ type: inspectionType }));
      this.activeMenu = inspectionType;
    },
  },
  computed: {
    ...mapState({
      hideSubMenu: state => state.menus.hideSubMenu,
    }),
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.handleRouteEnterOrUpdate(to);
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.handleRouteEnterOrUpdate(to);
    next();
  },
};
</script>
