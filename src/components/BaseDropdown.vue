<template>
  <Dropdown
    class="navbar-dropdown"
    trigger="click"
    @on-click="handleClick"
    v-if="hasBase">
    <a class="dropdown-button" href="javascript:void(0)">
        {{ currentBaseOption.text }}
        <Icon type="md-arrow-dropdown"/>
    </a>
    <DropdownMenu slot="list">
      <DropdownItem
        v-for="baseOption in baseOptions"
        :key="baseOption.value"
        :selected="baseOption.value === currentBaseOption.value"
        :name="baseOption.value">
        {{ baseOption.text }}
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>
  <span v-else class="dropdown-button">无基地权限</span>
</template>

<script>
import { map, isEmpty } from 'lodash';
import { mapMutations, mapState } from 'vuex';
import { UPDATE_CURRENT_BASE } from '@/store/auth.module';
import { storeBase } from '@/utils/auth';
import { buildBaseOption } from '@/utils/util';


export default {
  name: 'SkynetBaseDropdown',
  computed: {
    ...mapState({
      organizationMappings: state => state.organizations.mappings,
      baseCodes: state => state.auth.user.privilegedBaseCodes,
      currentBaseCode: state => state.auth.currentBaseCode,
    }),
    baseOptions() {
      return map(this.baseCodes, code => buildBaseOption(code, this.organizationMappings));
    },
    currentBaseOption() {
      return buildBaseOption(this.currentBaseCode, this.organizationMappings);
    },
    hasBase() {
      return !isEmpty(this.baseCodes);
    },
  },
  methods: {
    ...mapMutations({
      updateCurrentBase: UPDATE_CURRENT_BASE,
    }),
    handleClick(baseCode) {
      storeBase(baseCode);
      this.updateCurrentBase(baseCode);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/var.scss";

.navbar-dropdown {
  margin-left: 30px;
}
.dropdown-button {
  display: inline-block;
  width: 120px;
  line-height: $--header-subrow-height;
  text-align: center;
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  letter-spacing: 1px;
}
</style>

