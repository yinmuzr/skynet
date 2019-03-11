import jQuery from 'jquery';
import { find, isEmpty, pickBy, some } from 'lodash';
import moment from 'moment';
import {
  ALL_BASE,
  ALL_BASE_TEXT,
  DATA_ENTRANCE_MENU_NAME,
  HIERARCHY_TYPE,
  HIERARCHY_TYPE_OPTIONS,
  LOADING_STATUS,
  NO_BASE_TEXT,
  OPERATION_MENU_OPTIONS,
  REPORT_FILTER_TYPE,
  WARNING_DATE_OFFSET_MAP,
  INSPECTION_TYPES,
  PAGE_SIZE,
} from '@/utils/constant';

export const isFailed = status => status === LOADING_STATUS.FAILED;
export const isSucceed = status => status === LOADING_STATUS.SUCCESS;
export const isEdit = currentOperate => currentOperate === OPERATION_MENU_OPTIONS.EDIT;
export const isAdd = currentOperate => currentOperate === OPERATION_MENU_OPTIONS.ADD;
export const getNodePath = (node) => {
  const nodePaths = [];
  let parent = node.getParentNode();
  while (parent) {
    nodePaths.unshift(parent);
    parent = parent.getParentNode();
  }
  return nodePaths.map(nodePath => nodePath.name).join('>');
};
export const rebuildTree = (children, parentNode) => {
  if (!children) return undefined;
  return children.map((node) => {
    const child = node;
    child.getParentNode = () => parentNode;
    child.isLeafNode = () => isEmpty(child.children);
    child.getPath = () => getNodePath(child);
    child.children = rebuildTree(child.children, child);
    return child;
  });
};

export const getNodeByPredict = (tree, func) => {
  let foundNode = {};

  const findNode = (nodeTree, callback) => {
    if (isEmpty(nodeTree)) {
      return;
    }

    // eslint-disable-next-line consistent-return
    nodeTree.forEach((node) => {
      if (callback(node)) {
        foundNode = node;
        return false;
      } else if (!isEmpty(node.children)) {
        findNode(node.children, callback);
      }
    });
  };

  findNode(tree, func);

  return foundNode;
};

// eslint-disable-next-line eqeqeq
export const getNodeById = (tree, id) => getNodeByPredict(tree, node => node.id == id);

export const formatDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
};

export const formatDateTime = date => moment(date).format('YYYY-MM-DD HH:mm:ss');

export const getDefaultDateRange = () => {
  const todayEndTime = moment(new Date()).hours(23).minutes(59).seconds(59)
    .toDate();
  const yesterday = moment().add(-1, 'days').hours(0).minutes(0)
    .seconds(0)
    .toDate();

  return [yesterday, todayEndTime];
};

export const getWarningDateRange = (tag) => {
  const startTime = moment().add(WARNING_DATE_OFFSET_MAP[tag].offset, 'days').hours(0).minutes(0)
    .seconds(0)
    .toDate();
  const endTime = moment().add(WARNING_DATE_OFFSET_MAP[tag].offset, 'days').hours(23).minutes(59)
    .seconds(59)
    .toDate();

  return [formatDateTime(startTime), formatDateTime(endTime)];
};

export const getDefaultUnqualifiedTypeFilterConditions = () => [
  {
    id: 0,
    options: [
      {
        type: 'A',
        disabled: false,
      },
      {
        type: 'B',
        disabled: false,
      },
      {
        type: 'C',
        disabled: false,
      },
      {
        type: 'D',
        disabled: false,
      },
      {
        type: 'E',
        disabled: false,
      },
    ],
    selected: '',
    value: null,
  },
];

export const getDefaultUnqualifiedReasons = () => [
  {
    id: 0,
    code: '',
    name: '',
    value: null,
  },
];

export const isNullOrEmpty = value => (value === undefined || value === null || value === '');

export const formatNameWithCode = ({ code, name }) => (
  isNullOrEmpty(code) ? '' : `${name} (${code})`
);

export const getHierarchyTypeOption = (hierarchyType) => {
  const hierarchyTypeOption = find(HIERARCHY_TYPE_OPTIONS, option => option.value === hierarchyType);
  return hierarchyTypeOption || {};
};

export const isSampleInspectionType = inspectionType => DATA_ENTRANCE_MENU_NAME.SAMPLE === inspectionType;

export const isFullInspectionType = inspectionType => DATA_ENTRANCE_MENU_NAME.FULL === inspectionType;

export const isSample = inspectionType => INSPECTION_TYPES.SAMPLE.inspectionType === inspectionType;
export const isFull = inspectionType => INSPECTION_TYPES.FULL.inspectionType === inspectionType;
export const isInspectionType = inspectionType => isSample(inspectionType) || isFull(inspectionType);

export const getSampleFilterList = () => REPORT_FILTER_TYPE.slice(0, 3);

export const getFullFilterList = () => REPORT_FILTER_TYPE.slice(3);

export const isSampleFilterType = currentFilterType => some(getSampleFilterList(), currentFilterType);

export const isFullFilterType = currentFilterType => some(getFullFilterList(), currentFilterType);

export const getNodes = (tree, func) => {
  const foundNodes = [];

  const findNodes = (nodeTree) => {
    if (isEmpty(nodeTree)) {
      return;
    }
    nodeTree.forEach((node) => {
      if (func(node)) {
        foundNodes.push(node);
      }
      if (!isEmpty(node.children)) {
        findNodes(node.children);
      }
    });
  };
  findNodes(tree);

  return foundNodes;
};

export const isTopHierarchyType = hierarchyType => (hierarchyType === HIERARCHY_TYPE.TOP);
export const isBottomHierarchyType = hierarchyType => (hierarchyType === HIERARCHY_TYPE.BOTTOM);

export const calRowSpanArray = (dataList, shouldSpanPredictor) => {
  const rowSpanArr = [];
  let pos = 0;
  if (dataList) {
    dataList.forEach((item, i) => {
      if (i === 0) {
        rowSpanArr[i] = 1;
        pos = 0;
      } else if (shouldSpanPredictor(i)) {
        rowSpanArr[pos] += 1;
        rowSpanArr[i] = 0;
      } else {
        rowSpanArr[i] = 1;
        pos = i;
      }
    });
  }
  return rowSpanArr;
};

export const parseRequestParms = (params) => {
  const queryString = jQuery.param(pickBy(params, v => !isEmpty(v)));
  return queryString.replace(/%5B%5D=/g, '=');
};

export const mapToRiskWarningSummary = (value, index) => {
  const indexKey = Object.keys(WARNING_DATE_OFFSET_MAP)[index];
  return {
    key: indexKey,
    count: value,
    label: `${WARNING_DATE_OFFSET_MAP[indexKey].word}（${value}）`,
    router: WARNING_DATE_OFFSET_MAP[indexKey].router,
  };
};

export const limitTwoDecimal = (number) => {
  if (typeof number === 'string') {
    // eslint-disable-next-line
    number = parseFloat(number);
  }
  return Math.round(number * 100) / 100;
};

export const buildBaseOption = (code, organizationMappings) => {
  let text = '';
  if (code === ALL_BASE) {
    text = ALL_BASE_TEXT;
  } else {
    const baseOrganization = find(organizationMappings, item => item.code === code);
    text = isEmpty(baseOrganization) ? NO_BASE_TEXT : baseOrganization.name;
  }

  return { value: code, text };
};

export const buildSampleDetailList = detailList => detailList.map(item => ({
  ...item,
  vendor: formatNameWithCode({ code: item.vendorCode, name: item.vendorName }),
  material: formatNameWithCode({ code: item.materialCode, name: item.materialName }),
  materialGroup: formatNameWithCode({ code: item.materialGroupCode, name: item.materialGroupName }),
  unqualifiedReason: formatNameWithCode({ code: item.unqualifiedReasonCode, name: item.unqualifiedReasonName }),
  inspector: formatNameWithCode({ code: item.inspectorCode, name: item.inspectorName }),
  base: formatNameWithCode({ code: item.baseCode, name: item.baseName }),
  department: formatNameWithCode({ code: item.departmentCode, name: item.departmentName }),
  inspectionDateTime: formatDateTime(item.inspectionTime),
  receivingDateTime: formatDateTime(item.receivingTime),
  commuteDateTime: formatDateTime(item.commuteTime),
  inspectionAmount: limitTwoDecimal(item.inspectionAmount),
  unqualifiedAmount: limitTwoDecimal(item.unqualifiedAmount),
  approvalAmount: limitTwoDecimal(item.approvalAmount),
  receivingAmount: limitTwoDecimal(item.receivingAmount),
}));

export const buildFullDetailList = detailList => detailList.map(item => ({
  ...item,
  inspector: formatNameWithCode({ code: item.inspectorCode, name: item.inspectorName }),
  vendor: formatNameWithCode({ code: item.vendorCode, name: item.vendorName }),
  material: formatNameWithCode({ code: item.materialCode, name: item.materialName }),
  materialGroup: formatNameWithCode({ code: item.materialGroupCode, name: item.materialGroupName }),
  department: formatNameWithCode({ code: item.departmentCode, name: item.departmentName }),
  base: formatNameWithCode({ code: item.baseCode, name: item.baseName }),
  unqualifiedReason: formatNameWithCode({ code: item.unqualifiedReasonCode, name: item.unqualifiedReasonName }),
  inspectionTime: formatDateTime(item.inspectionTime),
  qualifiedRate: `${(item.qualifiedRate * 100).toFixed(3)}%`,
  unqualifiedRate: `${(item.unqualifiedRate * 100).toFixed(3)}%`,
  totalAmount: limitTwoDecimal(item.totalAmount),
  totalQualifiedAmount: limitTwoDecimal(item.totalQualifiedAmount),
  totalUnqualifiedAmount: limitTwoDecimal(item.totalUnqualifiedAmount),
  unqualifiedAmount: limitTwoDecimal(item.unqualifiedAmount),
}));


export const setCaretPosition = (input) => {
  const textDom = input.$el.getElementsByTagName('input')[0];
  const pos = input.value && input.value.length;
  if (textDom.setSelectionRange) {
    // IE Support
    textDom.focus();
    textDom.setSelectionRange(pos, pos);
  } else if (textDom.createTextRange) {
    // Other support
    const range = textDom.createTextRange();
    range.collapse(true);
    range.moveEnd('character', pos);
    range.moveStart('character', pos);
    range.select();
  }
};

export const buildCondition = (currentBaseCode, dateRange, pageNumber = 1) => ({
  baseCode: currentBaseCode,
  startDate: moment(dateRange[0]).toISOString(),
  endDate: moment(dateRange[1]).toISOString(),
  pagination: {
    limit: PAGE_SIZE,
    offset: (pageNumber - 1) * PAGE_SIZE,
  },
});
