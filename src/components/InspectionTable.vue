<template>
  <SkynetEmptyData v-if="isEmptyTable" :tips="emptyTips"/>
  <el-table v-else :data="data"
            :span-method="spanMaterialGroup"
            :cell-style="cellStyle"
            :cell-class-name="cellClassName"
            :header-cell-class-name="headerCellClassName"
            :row-key="generateRowKey"
            @row-click="clickRow"
            @cell-mouse-enter="handleCellMouseEnter"
            @cell-mouse-leave="handleCellMouseLeave">
    <el-table-column v-for="column in columns"
                     :key="column.key"
                     :prop="column.key"
                     :label="column.title"
                     :min-width="column.width">
      <template slot-scope="scope">
        <div v-if="showProgress(column.key)">
          <SkynetColumnTip class="progress-number" :title="`${(scope.row.qualificationRate*100).toFixed(3)}%`" />
          <Progress class="progress-bar" :percent="scope.row.qualificationRate*100" hide-info />
        </div>
        <div v-else-if="showPoint(column.key)">
          <SkynetColumnTip
            :class="['padding-column', {'unread-column': !scope.row.read}]"
            :title="scope.row.warningReason"
          />
        </div>
        <SkynetColumnTip v-else-if="column.key" :title="scope.row[column.key]" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { isEmpty } from 'lodash';
import jQuery from 'jquery';
import SkynetEmptyData from '@/components/EmptyData.vue';
import SkynetColumnTip from '@/components/ColumnTip.vue';
import { Progress } from 'iview';

const STRIPE_CELL_CLASS = 'stripe-cell';

export default {
  name: 'SkynetInspectionTable',
  props: {
    emptyTips: {
      type: String,
      default: '可以点击左上角“筛选”中更换筛选条件查看更多数据',
    },
    shouldSpanRow: {
      type: Boolean,
      default: false,
    },
    columns: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
    noBorderColumns: {
      type: Array,
      default: () => [],
    },
    rowSpanArr: {
      type: Array,
      default: () => [],
    },
    colSpan: {
      type: Number,
      default: 0,
    },
    clickRow: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      backgroundColor: '',
    };
  },
  computed: {
    isEmptyTable() {
      return isEmpty(this.data);
    },
    rowColors() {
      const rowColors = [];
      rowColors.push(false);
      this.rowSpanArr.slice(1).forEach((rowSpan, i) => {
        rowColors.push(rowSpan === 0 ? rowColors[i] : !rowColors[i]);
      });
      return rowColors;
    },
  },
  components: {
    SkynetEmptyData,
    SkynetColumnTip,
    Progress,
  },
  methods: {
    // eslint-disable-next-line
    spanMaterialGroup({row, column, rowIndex, columnIndex}) {
      if (this.shouldSpanRow && columnIndex < this.colSpan) {
        const rowSpan = this.rowSpanArr[rowIndex];
        const colSpan = rowSpan > 0 ? 1 : 0;
        return [rowSpan, colSpan];
      }
    },
    generateRowKey(row) {
      return JSON.stringify(row);
    },
    showProgress(key) {
      return key === 'qualificationRate';
    },
    showPoint(key) {
      return key === 'warningReason';
    },
    // eslint-disable-next-line
    headerCellClassName({ row, column, rowIndex, columnIndex }) {
      if (this.noBorderColumns.indexOf(column.label) > -1) {
        return 'table-cell-no-border';
      }
    },
    // eslint-disable-next-line
    cellStyle({ rowIndex, columnIndex }) {
      const cellStyleList = [];
      if (this.shouldSpanRow) {
        // 子表内加border
        if (columnIndex >= this.colSpan && this.rowSpanArr[rowIndex] === 0) {
          cellStyleList.push('border-top: 1px #f5f7f9 solid;');
        }
      }
      return cellStyleList.toString().replace(',', '');
    },
    cellClassName({ rowIndex }) {
      if (this.shouldSpanRow) {
        if (this.rowColors[rowIndex] === true) {
          return STRIPE_CELL_CLASS;
        }
      } else if (rowIndex % 2 === 1) {
        return STRIPE_CELL_CLASS;
      }
      return '';
    },
    isSpanColumn(el) {
      return el.attr('rowspan') !== '1';
    },
    handleCellMouseEnter(row, column, cell) {
      const $cell = jQuery(cell);
      if (this.isSpanColumn($cell)) {
        $cell.parent('tr').addClass('disable-hover');
      }
    },
    handleCellMouseLeave(row, column, cell) {
      const $cell = jQuery(cell);
      if (this.isSpanColumn($cell)) {
        $cell.parent('tr').removeClass('disable-hover');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.table-wrap {
  min-height: 240px;
}

.progress-number {
  width: 32%;
  display: inline-block;
  text-align: right;
}

.progress-bar {
  width: 68%;
  padding-left: 10px;
}
.padding-column {
  padding-left: 20px;

  &.unread-column {
    position: relative;
    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 3px;
      position: absolute;
      left: 0;
      top: 7px;
      background: #e82222;
    }
  }
}
// #e82222
</style>

