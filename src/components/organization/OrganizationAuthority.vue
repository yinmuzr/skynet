<template>
  <div class="organization-authority-detail">
      <div class='title-container'>
        <span class="section-title">
          组织权限
        </span>
      </div>
    <SkynetLoadable :show-loading="authoritiesInfo.isLoading">
       <div class="organization-authority-container">
        <div class="organization-information">
          <span v-if="organization" class="organization-name">{{ organization.name }}</span>
          <span v-if="organizationPathText" class="organization-path" :title="organizationPathText">
            {{ organizationPathText }}
          </span>
        </div>
        <div class="organization-authority" v-if="!authoritiesInfo.isLoading && materialGroupsText">
          <div class="material-groups-authority">
            <div class="authority-content" :title="materialGroupsText">{{ materialGroupsText }}</div>
            <div v-if="operable" class="material-groups-authority-operation">
              <Icon v-if="!isRootOrganization" type="skynet-delete" class="material-group-operation-button delete-icon"
                    @click.native="onDeleteClick"/>
              <Icon type="skynet-edit" class="material-group-operation-button edit-icon"
                    @click.native="onEditClick"/>
            </div>
          </div>
          <div class="base-authority">
            <div class="authority-content" :title="privilegedOrganizationsText">
              {{ privilegedOrganizationsText }}
            </div>
          </div>
        </div>
        <div v-if="operable && !authoritiesInfo.isLoading && !materialGroupsText" class="add-authority-container">
          <div class="add-authority-button" @click="onEditClick">
            <Icon type="ios-add" class="add-authority-button-icon"></Icon>
            配置本组织权限
          </div>
        </div>
      </div>
    </SkynetLoadable>
    <Modal
      v-model="showOrganizationEditModal"
      :mask-closable="false"
      :loading="modalLoading"
      :title="modalTitle"
      @on-ok="handleSubmit">
      <SkynetOrganizationEditForm
        v-if="showOrganizationEditModal"
        ref="organizationEditForm"
        :privilegedOrganizationTree="privilegedOrganizationTree"
        :organization="organization"
        :authoritiesInfo="authoritiesInfo"
        @submitSuccess="handleUpdateOrganizationSuccess"
        @submitFailed="handleUpdateOrganizationFailed"
      />
    </Modal>
  </div>
</template>

<script type="text/jsx">
import { mapActions, mapGetters } from 'vuex';
import SkynetLoadable from '@/components/Loadable.vue';
import SkynetOrganizationEditForm from '@/components/organization/OrganizationEditForm.vue';
import modalExtension from '@/mixins/modalExtension';
import formValidation from '@/mixins/formValidation';
import { GET_AUTHORITIES_BY_ORGANIZATION_ID } from '@/store/organization.module';
import { updateOrganizationAuthorities, deleteAuthority } from '@/services/organization.service';
import { OPERATION_ORGANIZATION_MODAL_TITLE, PARENT_ID_OF_ROOT } from '@/utils/constant';

export default {
  name: 'SkynetOrganizationAuthority',
  components: {
    SkynetLoadable,
    SkynetOrganizationEditForm,
  },
  props: {
    organization: {
      getPath: Function,
    },
    operable: {
      type: Boolean,
      default: true,
    },
  },
  mixins: [modalExtension, formValidation],
  data() {
    return {
      showOrganizationEditModal: false,
      modalTitle: OPERATION_ORGANIZATION_MODAL_TITLE,
    };
  },
  watch: {
    'organization.id': function getMaterialGroups(newValue) {
      if (newValue) {
        this.getAuthoritiesByOrganizationId(newValue);
      }
    },
  },
  computed: {
    isRootOrganization() {
      return this.organization && this.organization.parentId === PARENT_ID_OF_ROOT;
    },
    ...mapGetters({
      authoritiesInfo: 'authoritiesInfo',
      privilegedOrganizationTree: 'privilegedOrganizationTree',
    }),
    materialGroupsText() {
      return this.authoritiesInfo.materialGroupText ? `物料组权限：${this.authoritiesInfo.materialGroupText}` : '';
    },
    privilegedOrganizationsText() {
      const text = this.authoritiesInfo.privilegedOrganizationsText;
      return text && `组织权限：${text}`;
    },
    organizationPathText() {
      if (this.organization && this.organization.getPath()) {
        return `所属组织：${this.organization.getPath()}`;
      }
      return '';
    },
  },
  methods: {
    ...mapActions({
      getAuthoritiesByOrganizationId: GET_AUTHORITIES_BY_ORGANIZATION_ID,
    }),
    submit() {
      this.$refs.organizationEditForm.submit(organizationForm => (updateOrganizationAuthorities(organizationForm)));
    },
    handleUpdateOrganizationSuccess() {
      this.showOrganizationEditModal = false;
      this.getAuthoritiesByOrganizationId(this.organization.id);
    },
    handleUpdateOrganizationFailed() {
      this.preventModalClose();
    },
    onDeleteClick() {
      this.$confirmModal.show({
        title: '确认删除',
        content: '确定删除本组织权限吗？',
        action: () => deleteAuthority(this.organization.id),
        onSuccess: () => this.getAuthoritiesByOrganizationId(this.organization.id),
        onFail: (error) => {
          if (error.success === false && error.errorMessage) {
            this.showGlobalError(error.errorMessage);
          } else {
            this.showGlobalError();
          }
        },
      });
    },
    onEditClick() {
      this.showOrganizationEditModal = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/var.scss";
.organization-authority-detail {
  height: 27%;
}
.loading {
  width: 100%;
  top: 50%;
  margin: 0 auto;
  position: absolute;
}

.organization-authority-container{
  background-color: #dbebff;
  padding: 28px 51px 16px 40px;
  font-size: 14px;
  min-height: 122px;
  .organization-information{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .organization-name{
      font-size: 16px;
      font-weight: 500;
    }
    .organization-path{
      margin-left: 22px;
    }
  }
  .authority-content {
    display: inline-block;
    width: calc(100% - 115px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .organization-authority{
    margin-top: 20px;
    .material-groups-authority{
      .material-groups-authority-operation {
        margin-left: 25px;
        display: inline-block;
        .material-group-operation-button {
          cursor: pointer;
          font-size: 22px;
          color: $--color-primary;
        }
        .edit-icon {
          margin-left: 25px;
        }
      }
    }
  }
  .base-authority{
    margin-top: 6px;
  }
  .add-authority-container{
    font-size: 16px;
    margin: 20px 0 10px 0;
    color: $--color-primary;
    cursor: pointer;
    .add-authority-button {
      letter-spacing: 2px;
      font-weight: 500;
      .add-authority-button-icon {
        font-size: 20px;
        font-weight: 800;
        vertical-align: sub;
      }
    }
  }
}
</style>
