<template>
  <div class="content-layout">
    <SkynetLoadable :show-loading="loadingStatus">
      <Upload ref="uploader"
              :before-upload="handleUpload"
              action="">
        <Button :disabled="loadingStatus" icon="ios-cloud-upload-outline">选择文件</Button>
        <span v-if="file">{{file.name}}</span>
      </Upload>
      <div>
        <div class="title">数据类型：</div>
        <RadioGroup v-model="inspectionType">
          <Radio label="抽检">
          </Radio>
          <Radio label="全检">
          </Radio>
        </RadioGroup>
      </div>
      <div>
        <div class="title">是否清除已有数据：</div>
        <RadioGroup v-model="clearDataFirst">
          <Radio label="是"></Radio>
          <Radio label="否"></Radio>
        </RadioGroup>
      </div>
      <Button class="submit-button" @click="upload" :disabled="!file || loadingStatus"><p>{{ loadingStatus ? '上传中' :
        '上传' }}</p></Button>
    </SkynetLoadable>
  </div>
</template>
<script>
import { uploadData } from '@/services/report.service';
import SkynetLoadable from '@/components/Loadable.vue';
import formValidation from '@/mixins/formValidation';
import { ERROR } from '@/utils/constant';

export default {
  components: {
    SkynetLoadable,
  },
  mixins: [formValidation],
  data() {
    return {
      file: null,
      inspectionType: '抽检',
      clearDataFirst: '是',
      loadingStatus: false,
    };
  },
  methods: {
    handleUpload(file) {
      this.file = file;
      return false;
    },
    upload() {
      this.loadingStatus = true;
      const formData = new FormData();
      formData.append('file', this.file);
      formData.append('inspectionType', this.inspectionType === '抽检' ? 'SAMPLE' : 'FULL');
      formData.append('clearDataFirst', this.clearDataFirst === '是' ? 'true' : 'false');
      uploadData(formData)
        .then(() => {
          if (this.inspectionType === '抽检') {
            window.location = 'data/entrance/sample-inspection/details';
          } else {
            window.location = 'data/entrance/full-inspection/details';
          }
        })
        .catch(() => this.showGlobalError(ERROR.UNKNOWN_ERROR))
        .finally(() => {
          this.loadingStatus = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
  .title {
    display: inline-block;
    width: 40%;
  }

  .submit-button {
    width: 20%;
    float: right;
  }

  .content-layout {
    width: 30%;
    margin: 50px auto;
  }

  .loading {
  }
</style>
