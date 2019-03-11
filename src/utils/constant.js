export const PARENT_ID_OF_ROOT = 0;

export const OPERATION_MENU_OPTIONS = {
  ADD: 'ADD_NODE_CHILD',
  EDIT: 'EDIT_NODE',
  DELETE: 'DELETE_NODE',
};
export const OPERATION_ROLE_OPTIONS = {
  ADD: 'ADD_ROLE',
  EDIT: 'EDIT_ROLE',
  DELETE: 'DELETE_ROLE',
};

export const OPERATION_USER_OPTIONS = {
  ADD: 'ADD_USER',
  EDIT: 'EDIT_USER',
  DELETE: 'DELETE_USER',
};

export const HIERARCHY_MODAL_TITLE = {
  [OPERATION_MENU_OPTIONS.ADD]: '新增下一层级',
  [OPERATION_MENU_OPTIONS.EDIT]: '编辑本层级',
  [OPERATION_MENU_OPTIONS.DELETE]: '删除本层级',
};

export const OPERATION_ROLE_MODAL_TITLE = {
  [OPERATION_ROLE_OPTIONS.ADD]: '新增角色',
  [OPERATION_ROLE_OPTIONS.EDIT]: '编辑角色',
  [OPERATION_ROLE_OPTIONS.DELETE]: '删除角色',
};

export const OPERATION_USER_MODAL_TITLE = {
  [OPERATION_USER_OPTIONS.ADD]: '新增人员及权限',
  [OPERATION_USER_OPTIONS.EDIT]: '编辑人员及权限',
  [OPERATION_USER_OPTIONS.DELETE]: '删除用户',
};

export const ORGANIZATION_MENU_TITLE = {
  [OPERATION_MENU_OPTIONS.ADD]: '新增下一层组织',
  [OPERATION_MENU_OPTIONS.EDIT]: '编辑本层组织',
  [OPERATION_MENU_OPTIONS.DELETE]: '删除本层组织',
};
export const LOADING_STATUS = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

export const OPERATION_ORGANIZATION_MODAL_TITLE = '配置本组织权限';

export const ERROR = {
  REQUIRED: '信息不能为空',
  INPUT: '信息填写错误',
  USER_DUPLICATED: '不能与已有人员重复',
  HIERARCHY_NAME_MAX_LIMIT: '层级名称不能超过6个字',
  NETWORK: '服务器出错，请稍后重试',
  INPUT_DUPLICATED: '不能与输入框已有信息重复',
  UNKNOWN_ERROR: '未知错误！',
};

export const DATA_ENTRANCE_MENU_NAME = {
  SAMPLE: 'data-sample-inspection',
  FULL: 'data-full-inspection',
};

export const EARLY_WARNING_TYPE = {
  QUALIFIED_RATE: 'QUALIFIED_RATE',
  UNQUALIFIED_BATCHES: 'UNQUALIFIED_BATCHES',
  UNQUALIFIED_TYPE: 'UNQUALIFIED_TYPE',
  UNQUALIFIED_REASON: 'UNQUALIFIED_REASON',
};

export const INSPECTION_TYPES = {
  SAMPLE: {
    menu: '抽检策略',
    inspectionType: 'SAMPLE',
  },
  FULL: {
    menu: '全检策略',
    inspectionType: 'FULL',
  },
};

export const EARLY_WARNING_PERIOD = {
  DAY: '按天计算',
  WEEK: '按周计算',
  MONTH: '按月计算',
};

export const START_DATE_OFFSET = {
  DAY: 'days',
  WEEK: 'weeks',
  MONTH: 'months',
};

export const DATA_ENTRANCE_MENUS = [
  {
    name: DATA_ENTRANCE_MENU_NAME.SAMPLE,
    to: { name: DATA_ENTRANCE_MENU_NAME.SAMPLE },
    label: '抽检',
  },
  {
    name: DATA_ENTRANCE_MENU_NAME.FULL,
    to: { name: DATA_ENTRANCE_MENU_NAME.FULL },
    label: '全检',
  },
];

export const UNQUALIFIED_CATEGORY = ['A', 'B', 'C', 'D', 'E'];

export const REPORT_FILTER_TYPE = [
  {
    value: 'SAMPLE_VENDOR',
    inspectionType: 'SAMPLE',
    dimension: 'VENDOR',
    label: '按供应商合格率查看',
    title: '按供应商合格率来筛选',
    content: [
      '1. 筛选计算：筛选满足“时间”“供应商”“物料组”的抽检数据，按照供应商维度进行聚类。',
      '2. 数据过滤：计算结果符合“合格率”、“不合格批数”、“不合格类别”、“不合格原因”中任一条件的数据过滤并展示出来。',
    ],
  },
  {
    value: 'SAMPLE_MATERIAL_GROUP',
    inspectionType: 'SAMPLE',
    dimension: 'MATERIAL_GROUP',
    label: '按物料组合格率查看',
    title: '按物料组合格率来筛选',
    content: [
      '1. 筛选计算：筛选满足“时间”“供应商”“物料组”的抽检数据，按照物料组维度进行聚类。',
      '2. 数据过滤：计算结果符合“合格率”、“不合格批数”、“不合格类别”、“不合格原因”中任一条件的数据过滤并展示出来。”',
    ],
  },
  {
    value: 'SAMPLE_MATERIAL_GROUP_AND_INSPECTOR',
    inspectionType: 'SAMPLE',
    dimension: 'MATERIAL_GROUP_AND_INSPECTOR',
    label: '按物料组+检验员合格率查看',
    title: '按物料组+检验员合格率来筛选',
    content: [
      '1. 筛选计算：筛选满足“时间”“供应商”“物料组”“检验员”的抽检数据，按照物料组+检验员维度进行聚类。',
      '2. 数据过滤：计算结果符合“合格率”、“不合格批数”、“不合格类别”、“不合格原因”中任一条件的数据过滤并展示出来。”',
    ],
  },
  {
    value: 'FULL_VENDOR',
    label: '按供应商合格率查看',
    inspectionType: 'FULL',
    dimension: 'VENDOR',
    title: '按供应商合格率来筛选',
    content: [
      '1. 筛选计算：筛选满足“时间”“供应商”“物料组”的全检数据，按照供应商维度进行聚类。',
      '2. 数据过滤：计算结果符合“合格率”、“不合格类别”、“不合格原因”中任一条件的数据过滤并展示出来。',
    ],
  },
  {
    value: 'FULL_MATERIAL_GROUP',
    label: '按物料组合格率查看',
    inspectionType: 'FULL',
    dimension: 'MATERIAL_GROUP',
    title: '按物料组合格率来筛选',
    content: [
      '1. 筛选计算：筛选满足“时间”“供应商”“物料组”的全检数据，按照物料组维度进行聚类。',
      '2. 数据过滤：计算结果符合“合格率”、“不合格类别”、“不合格原因”中任一条件的数据过滤并展示出来。”',
    ],
  },
];

export const SAMPLE_DETAIL_FILTER_TIP =
  {
    title: '按单批中各细项来筛选',
    content: [
      '筛选满足“日期”“供应商”“物料组”“物料”“检验员”“检验结论”“不合格类别”“不合格原因”中的抽检明细数据并展示出来。',
    ],
  };

export const FULL_DETAIL_FILTER_TIP = {
  value: 'FULL_DETAILS',
  title: '按单批中各细项来筛选',
  content: [
    '筛选满足“日期”“供应商”“物料组”“物料”“合格率”“不合格类别”“不合格原因”中的全检明细数据并展示出来。',
  ],
};

export const COLUMN_NAME_MAP = new Map([
  [
    'VENDOR',
    {
      title: '供应商',
      key: 'vendor',
    }],
  [
    'MATERIAL_GROUP',
    {
      title: '物料组',
      key: 'materialGroup',
    }],
  [
    'MATERIAL_GROUP_AND_INSPECTOR',
    {
      title: '物料组',
      key: 'materialGroup',
    }],
]);
export const FILTER_MODAL_TITLE = {
  SAMPLE: '抽检筛选条件',
  FULL: '全检筛选条件',
};

export const MATERIAL_OPTIONS = {
  ALL: 'all',
  PART: 'part',
};

export const PAGE_SIZE = 10;

export const HIERARCHY_TYPE = {
  NORMAL: 'NORMAL_LEVEL',
  TOP: 'TOP_BASE',
  BOTTOM: 'BOTTOM_DATA_SOURCE',
};

export const HIERARCHY_TYPE_OPTIONS = [
  {
    value: HIERARCHY_TYPE.NORMAL,
    label: '普通层级',
  },
  {
    value: HIERARCHY_TYPE.TOP,
    label: '顶层基地',
    iconType: 'skynet-top-level',
  },
  {
    value: HIERARCHY_TYPE.BOTTOM,
    label: '底层数据源',
    iconType: 'skynet-bottom-level',
  },
];

export const HIERARCHY_TYPE_CLASS = {
  NORMAL_LEVEL: '',
  TOP_BASE: 'organization-hierarchy-select-top',
  BOTTOM_DATA_SOURCE: 'organization-hierarchy-select-bottom',
};

export const DEFAULT_UNQUALIFIED_REASONS_AND_TYPE = {
  unqualifiedReasons: [],
  unqualifiedTypes: [],
};

export const DEFAULT_FILTER_FORM = {
  date: [],
  vendors: [],
  materials: [],
  inspectors: [],
  inspectionConclusion: null,
  ...DEFAULT_UNQUALIFIED_REASONS_AND_TYPE,
};

export const NAVIGATE_PARAMETER_MAP = {
  vendor: {
    plural: 'vendors',
    code: 'vendorCode',
    name: 'vendorName',
  },
  materialGroup: {
    plural: 'materialGroups',
    code: 'materialGroupCode',
    name: 'materialGroupName',
  },
  inspector: {
    plural: 'inspectors',
    code: 'inspectorCode',
    name: 'inspectorName',
  },
};

export const LOADING_DATA_SOURCE_TYPE = {
  INIT: 'INIT',
  FROM_PAGE: 'FROM_PAGE',
  FROM_FILTER: 'FROM_FILTER',
};

export const WARNING_DATE_OFFSET_MAP = {
  TODAY: {
    key: 'TODAY',
    offset: 0,
    word: '今天',
    router: { name: 'risk-early-warning', params: { date: 'today' } },
  },
  YESTERDAY: {
    key: 'YESTERDAY',
    offset: -1,
    word: '昨天',
    router: { name: 'risk-early-warning', params: { date: 'yesterday' } },
  },
  THE_DAY_BEFORE_YESTERDAY: {
    key: 'THE_DAY_BEFORE_YESTERDAY',
    offset: -2,
    word: '前天',
    router: { name: 'risk-early-warning', params: { date: 'the-day-before-yesterday' } },
  },
};

export const INSPECTION_TYPE_MAP = {
  SAMPLE: '抽检',
  FULL: '全检',
};

export const INSPECTION_TYPE_MAP_REVERSE = {
  抽检: 'SAMPLE',
  全检: 'FULL',
};

export const ALL_BASE = 'ALL';
export const ALL_BASE_TEXT = '全部基地';
export const NO_BASE_TEXT = '无对应基地名';
