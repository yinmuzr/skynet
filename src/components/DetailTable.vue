<template>
  <SkynetInspectionTable class="detail-table"
                         :emptyTips="emptyTips"
                         :columns="columns"
                         :data="tableData"
                         :rowSpanArr="rowSpanArr"
                         :shouldSpanRow="shouldSpanRow"
                         :colSpan="11"/>
</template>

<script>
import SkynetInspectionTable from '@/components/InspectionTable.vue';
import {
  isSampleInspectionType,
  isFullInspectionType,
  calRowSpanArray,
} from '@/utils/util';
import { INSPECTION_TYPES } from '@/utils/constant';

export default {
  name: 'SkynetDetailTable',
  components: {
    SkynetInspectionTable,
  },
  props: {
    emptyTips: {
      type: String,
      default: '可以点击左上角“筛选”中更换筛选条件查看更多数据',
    },
    tableData: Array,
    inspectionType: String,
  },
  data() {
    return {
      sampleDetailColumns: [
        {
          title: '供应商',
          key: 'vendor',
          width: '290',
        },
        {
          title: '物料',
          key: 'material',
          width: '315',
        },
        {
          title: '检验结论',
          key: 'inspectionConclusion',
          width: '100',
        },
        {
          title: '状态',
          key: 'status',
          width: '88',
        },
        {
          title: '检验员',
          key: 'inspector',
          width: '187',
        },
        {
          title: '不合格原因',
          key: 'unqualifiedReason',
          width: '177',
        },
        {
          title: '不合格类别',
          key: 'originalUnqualifiedType',
          width: '109',
        },
        {
          // eslint-disable-next-line vue/no-parsing-error
          title: '是否改判',
          key: 'isCommute',
          width: '100',
        },
        {
          title: '检验数量',
          key: 'inspectionAmount',
          width: '100',
        },
        {
          title: '不合格数量',
          key: 'unqualifiedAmount',
          width: '110',
        },
        {
          title: '批准数量',
          key: 'approvalAmount',
          width: '100',
        },
        {
          title: '收货数量',
          key: 'receivingAmount',
          width: '100',
        },
        {
          title: '物料批号',
          key: 'materialBatchNo',
          width: '173',
        },
        {
          title: '检验日期',
          key: 'inspectionDateTime',
          width: '208',
        },
        {
          title: '收货日期',
          key: 'receivingDateTime',
          width: '208',
        },
        {
          title: '检验种类',
          key: 'inspectionType',
          width: '100',
        },
        {
          title: '送货单号',
          key: 'sendingNo',
          width: '135',
        },
        {
          title: '散件批号',
          key: 'partsBatchNo',
          width: '135',
        },
        {
          title: '责任单位',
          key: 'dutyCompany',
          width: '100',
        },
        {
          title: '业务员',
          key: 'businessUser',
          width: '100',
        },
        {
          title: '所属物料组',
          key: 'materialGroup',
          width: '260',
        },
        {
          title: '所属基地',
          key: 'base',
          width: '160',
        },
        {
          title: '所属科室',
          key: 'department',
          width: '210',
        },
        {
          title: '备注',
          key: 'remark',
          width: '135',
        },
        {
          // eslint-disable-next-line vue/no-parsing-error
          title: '改判时间',
          key: 'commuteDateTime',
          width: '150',
        },
      ],
      fullDetailColumns: [
        {
          title: '供应商',
          key: 'vendor',
          width: '280',
        },
        {
          title: '物料',
          key: 'material',
          width: '275',
        },
        {
          title: '全检总数',
          key: 'totalAmount',
          width: '100',
        },
        {
          title: '合格总数',
          key: 'totalQualifiedAmount',
          width: '100',
        },
        {
          title: '不合格总数',
          key: 'totalUnqualifiedAmount',
          width: '110',
        },
        {
          title: '总合格率',
          key: 'qualifiedRate',
          width: '110',
        },
        {
          title: '批号',
          key: 'materialBatchNo',
          width: '109',
        },
        {
          title: '检验时间',
          key: 'inspectionTime',
          width: '202',
        },
        {
          title: '检验结论',
          key: 'inspectionConclusion',
          width: '100',
        },
        {
          title: '状态',
          key: 'status',
          width: '88',
        },
        {
          title: '检验员',
          key: 'inspector',
          width: '187',
        },
        {
          title: '所属物料组',
          key: 'materialGroup',
          width: '275',
        },
        {
          title: '所属科室',
          key: 'department',
          width: '157',
        },
        {
          title: '所属基地',
          key: 'base',
          width: '210',
        },
        {
          title: '不合格原因',
          key: 'unqualifiedReason',
          width: '300',
        },
        {
          title: '不合格类别',
          key: 'originalUnqualifiedType',
          width: '110',
        },
        {
          title: '不合格数量',
          key: 'unqualifiedAmount',
          width: '110',
        },
        {
          title: '所占不合格比率',
          key: 'unqualifiedRate',
          width: '166',
        },
      ],
    };
  },
  computed: {
    columns() {
      if (this.isSample) {
        return this.sampleDetailColumns;
      }
      if (this.isFull) {
        return this.fullDetailColumns;
      }
      return [];
    },
    rowSpanArr() {
      if (this.isFull) {
        return calRowSpanArray(this.tableData, i =>
          this.tableData[i].materialBatchNo === this.tableData[i - 1].materialBatchNo);
      }
      return [];
    },
    shouldSpanRow() {
      return this.isFull;
    },
    isSample() {
      return isSampleInspectionType(this.inspectionType) ||
        this.inspectionType === INSPECTION_TYPES.SAMPLE.inspectionType;
    },
    isFull() {
      return isFullInspectionType(this.inspectionType) ||
        this.inspectionType === INSPECTION_TYPES.FULL.inspectionType;
    },
  },
};
</script>

<style scoped>
.detail-table {
  min-height: 460px;
}
</style>
