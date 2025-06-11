// 定义表单配置接口
export interface FormConfig {
  formRef: string;
  formModel: string;
  size: 'large' | 'default' | 'small';
  labelPosition: 'left' | 'right' | 'top';
  labelWidth: number;
  formRules: string;
  gutter: number;
  disabled: boolean;
  span: number;
  formBtns: boolean;
}

// 定义基础组件接口
export interface BaseComponent {
  label: string;
  tag: string;
  tagIcon: string;
  placeholder?: string;
  defaultValue?: any;
  span: number;
  labelWidth: number | null;
  style: Record<string, string | number>;
  disabled?: boolean;
  required?: boolean;
  regList: any[];
  changeTag: boolean;
  document: string;
}

// 定义输入组件扩展接口
export interface InputComponent extends BaseComponent {
  clearable?: boolean;
  prepend?: string;
  append?: string;
  'prefix-icon'?: string;
  'suffix-icon'?: string;
  maxlength?: number | null;
  'show-word-limit'?: boolean;
  readonly?: boolean;
}

export interface TextareaComponent extends BaseComponent {
  type: 'textarea';
  autosize: { minRows: number; maxRows: number };
  maxlength?: number | null;
  'show-word-limit'?: boolean;
  readonly?: boolean;
}

export interface PasswordComponent extends BaseComponent {
  'show-password': boolean;
  clearable?: boolean;
  prepend?: string;
  append?: string;
  'prefix-icon'?: string;
  'suffix-icon'?: string;
  maxlength?: number | null;
  'show-word-limit'?: boolean;
  readonly?: boolean;
}

export interface InputNumberComponent extends BaseComponent {
  min?: number;
  max?: number;
  step?: number;
  'step-strictly'?: boolean;
  precision?: number;
  'controls-position'?: string;
}

// 定义选择组件扩展接口
export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface SelectComponent extends BaseComponent {
  clearable: boolean;
  filterable: boolean;
  multiple: boolean;
  options: SelectOption[];
}

export interface CascaderOption {
  id: number;
  value: any;
  label: string;
  children?: CascaderOption[];
}

export interface CascaderComponent extends BaseComponent {
  props: {
    props: {
      multiple: boolean;
    };
  };
  'show-all-levels': boolean;
  clearable: boolean;
  filterable: boolean;
  options: CascaderOption[];
  dataType: string;
  labelKey: string;
  valueKey: string;
  childrenKey: string;
  separator: string;
}

export interface RadioGroupComponent extends BaseComponent {
  optionType: string;
  border: boolean;
  size: 'large' | 'default' | 'small';
  options: SelectOption[];
}

export interface CheckboxGroupComponent extends BaseComponent {
  optionType: string;
  border: boolean;
  size: 'large' | 'default' | 'small';
  options: SelectOption[];
}

export interface SwitchComponent extends BaseComponent {
  'active-text': string;
  'inactive-text': string;
  'active-color': string | null;
  'inactive-color': string | null;
  'active-value': any;
  'inactive-value': any;
}

export interface SliderComponent extends BaseComponent {
  min: number;
  max: number;
  step: number;
  'show-stops': boolean;
  range: boolean;
}

export interface TimePickerComponent extends BaseComponent {
  'picker-options': {
    selectableRange: string;
  };
  format: string;
  'value-format': string;
  readonly?: boolean;
}

export interface TimeRangeComponent extends BaseComponent {
  'is-range': true;
  'range-separator': string;
  'start-placeholder': string;
  'end-placeholder': string;
  format: string;
  'value-format': string;
  readonly?: boolean;
}

export interface DatePickerComponent extends BaseComponent {
  type: string;
  format: string;
  'value-format': string;
  readonly?: boolean;
}

export interface DateRangeComponent extends BaseComponent {
  type: 'daterange';
  'range-separator': string;
  'start-placeholder': string;
  'end-placeholder': string;
  format: string;
  'value-format': string;
  readonly?: boolean;
}

export interface RateComponent extends BaseComponent {
  max: number;
  'allow-half': boolean;
  'show-text': boolean;
  'show-score': boolean;
}

export interface ColorPickerComponent extends BaseComponent {
  'show-alpha': boolean;
  'color-format': string;
  size: 'large' | 'default' | 'small';
}

export interface UploadComponent extends BaseComponent {
  action: string;
  accept: string;
  name: string;
  'auto-upload': boolean;
  showTip: boolean;
  buttonText: string;
  fileSize: number;
  sizeUnit: string;
  'list-type': string;
  multiple: boolean;
}

// 定义布局组件接口
export interface LayoutComponent {
  layout: string;
  tagIcon: string;
  type?: string;
  justify?: string;
  align?: string;
  label: string;
  layoutTree: boolean;
  children?: FormComponent[];
  document: string;

  // 按钮特有属性
  tag?: string;
  changeTag?: boolean;
  span?: number;
  default?: string;
  icon?: string;
  size?: 'large' | 'default' | 'small';
}

// 定义所有组件类型
export type FormComponent =
  | InputComponent
  | TextareaComponent
  | PasswordComponent
  | InputNumberComponent
  | SelectComponent
  | CascaderComponent
  | RadioGroupComponent
  | CheckboxGroupComponent
  | SwitchComponent
  | SliderComponent
  | TimePickerComponent
  | TimeRangeComponent
  | DatePickerComponent
  | DateRangeComponent
  | RateComponent
  | ColorPickerComponent
  | UploadComponent
  | LayoutComponent;

// 定义触发器配置
export interface TriggerConfig {
  [key: string]: 'blur' | 'change' | 'input';
}

// 表单配置
export const formConf: FormConfig = {
  formRef: 'elForm',
  formModel: 'formData',
  size: 'default',
  labelPosition: 'right',
  labelWidth: 100,
  formRules: 'rules',
  gutter: 15,
  disabled: false,
  span: 24,
  formBtns: true
};

// 输入型组件
export const inputComponents: FormComponent[] = [
  {
    label: '单行文本',
    tag: 'el-input',
    tagIcon: 'input',
    placeholder: '请输入',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    clearable: true,
    prepend: '',
    append: '',
    'prefix-icon': '',
    'suffix-icon': '',
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/input'
  },
  {
    label: '多行文本',
    tag: 'el-input',
    tagIcon: 'textarea',
    type: 'textarea',
    placeholder: '请输入',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    autosize: { minRows: 4, maxRows: 4 },
    style: { width: '100%' },
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/input'
  },
  {
    label: '密码',
    tag: 'el-input',
    tagIcon: 'password',
    placeholder: '请输入',
    defaultValue: undefined,
    span: 24,
    'show-password': true,
    labelWidth: null,
    style: { width: '100%' },
    clearable: true,
    prepend: '',
    append: '',
    'prefix-icon': '',
    'suffix-icon': '',
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/input'
  },
  {
    label: '计数器',
    tag: 'el-input-number',
    tagIcon: 'number',
    placeholder: '',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    min: undefined,
    max: undefined,
    step: undefined,
    'step-strictly': false,
    precision: undefined,
    'controls-position': '',
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/input-number'
  }
];

// 选择型组件
export const selectComponents: FormComponent[] = [
  {
    label: '下拉选择',
    tag: 'el-select',
    tagIcon: 'select',
    placeholder: '请选择',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    clearable: true,
    disabled: false,
    required: true,
    filterable: false,
    multiple: false,
    options: [
      {
        label: '选项一',
        value: 1
      },
      {
        label: '选项二',
        value: 2
      }
    ],
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/select'
  },
  {
    label: '级联选择',
    tag: 'el-cascader',
    tagIcon: 'cascader',
    placeholder: '请选择',
    defaultValue: [],
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    props: {
      props: {
        multiple: false
      }
    },
    'show-all-levels': true,
    disabled: false,
    clearable: true,
    filterable: false,
    required: true,
    options: [
      {
        id: 1,
        value: 1,
        label: '选项1',
        children: [
          {
            id: 2,
            value: 2,
            label: '选项1-1'
          }
        ]
      }
    ],
    dataType: 'dynamic',
    labelKey: 'label',
    valueKey: 'value',
    childrenKey: 'children',
    separator: '/',
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/cascader'
  },
  {
    label: '单选框组',
    tag: 'el-radio-group',
    tagIcon: 'radio',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    style: {},
    optionType: 'default',
    border: false,
    size: 'default',
    disabled: false,
    required: true,
    options: [
      {
        label: '选项一',
        value: 1
      },
      {
        label: '选项二',
        value: 2
      }
    ],
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/radio'
  },
  {
    label: '多选框组',
    tag: 'el-checkbox-group',
    tagIcon: 'checkbox',
    defaultValue: [],
    span: 24,
    labelWidth: null,
    style: {},
    optionType: 'default',
    border: false,
    size: 'default',
    disabled: false,
    required: true,
    options: [
      {
        label: '选项一',
        value: 1
      },
      {
        label: '选项二',
        value: 2
      }
    ],
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/checkbox'
  },
  {
    label: '开关',
    tag: 'el-switch',
    tagIcon: 'switch',
    defaultValue: false,
    span: 24,
    labelWidth: null,
    style: {},
    disabled: false,
    required: true,
    'active-text': '',
    'inactive-text': '',
    'active-color': null,
    'inactive-color': null,
    'active-value': true,
    'inactive-value': false,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/switch'
  },
  {
    label: '滑块',
    tag: 'el-slider',
    tagIcon: 'slider',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    disabled: false,
    required: true,
    min: 0,
    max: 100,
    step: 1,
    'show-stops': false,
    range: false,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/slider'
  },
  {
    label: '时间选择',
    tag: 'el-time-picker',
    tagIcon: 'time',
    placeholder: '请选择',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    required: true,
    'picker-options': {
      selectableRange: '00:00:00-23:59:59'
    },
    format: 'HH:mm:ss',
    'value-format': 'HH:mm:ss',
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/time-picker'
  },
  {
    label: '时间范围',
    tag: 'el-time-picker',
    tagIcon: 'time-range',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    required: true,
    'is-range': true,
    'range-separator': '至',
    'start-placeholder': '开始时间',
    'end-placeholder': '结束时间',
    format: 'HH:mm:ss',
    'value-format': 'HH:mm:ss',
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/time-picker'
  },
  {
    label: '日期选择',
    tag: 'el-date-picker',
    tagIcon: 'date',
    placeholder: '请选择',
    defaultValue: null,
    type: 'date',
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    required: true,
    format: 'yyyy-MM-dd',
    'value-format': 'yyyy-MM-dd',
    readonly: false,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/date-picker'
  },
  {
    label: '日期范围',
    tag: 'el-date-picker',
    tagIcon: 'date-range',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    type: 'daterange',
    'range-separator': '至',
    'start-placeholder': '开始日期',
    'end-placeholder': '结束日期',
    disabled: false,
    clearable: true,
    required: true,
    format: 'yyyy-MM-dd',
    'value-format': 'yyyy-MM-dd',
    readonly: false,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/date-picker'
  },
  {
    label: '评分',
    tag: 'el-rate',
    tagIcon: 'rate',
    defaultValue: 0,
    span: 24,
    labelWidth: null,
    style: {},
    max: 5,
    'allow-half': false,
    'show-text': false,
    'show-score': false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/rate'
  },
  {
    label: '颜色选择',
    tag: 'el-color-picker',
    tagIcon: 'color',
    defaultValue: null,
    labelWidth: null,
    span: 24,
    style: { width: '100%' },
    'show-alpha': false,
    'color-format': '',
    disabled: false,
    required: true,
    size: 'default',
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/color-picker'
  },
  {
    label: '上传',
    tag: 'el-upload',
    tagIcon: 'upload',
    action: 'https://jsonplaceholder.typicode.com/posts/',
    defaultValue: null,
    labelWidth: null,
    span: 24,
    style: { width: '100%' },
    disabled: false,
    required: true,
    accept: '',
    name: 'file',
    'auto-upload': true,
    showTip: false,
    buttonText: '点击上传',
    fileSize: 2,
    sizeUnit: 'MB',
    'list-type': 'text',
    multiple: false,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/upload'
  }
];

// 布局型组件
export const layoutComponents: FormComponent[] = [
  {
    layout: 'rowFormItem',
    tagIcon: 'row',
    type: 'default',
    justify: 'start',
    align: 'top',
    label: '行容器',
    layoutTree: true,
    children: [],
    document: 'https://element.eleme.cn/#/zh-CN/component/layout'
  },
  {
    layout: 'colFormItem',
    label: '按钮',
    changeTag: true,
    labelWidth: null,
    layoutTree: true,
    tag: 'el-button',
    tagIcon: 'button',
    span: 24,
    default: '主要按钮',
    type: 'primary',
    icon: 'el-icon-search',
    size: 'default',
    disabled: false,
    document: 'https://element.eleme.cn/#/zh-CN/component/button'
  }
];

// 组件规则触发方式
export const trigger: TriggerConfig = {
  'el-input': 'blur',
  'el-input-number': 'blur',
  'el-select': 'change',
  'el-radio-group': 'change',
  'el-checkbox-group': 'change',
  'el-cascader': 'change',
  'el-time-picker': 'change',
  'el-date-picker': 'change',
  'el-rate': 'change'
};
