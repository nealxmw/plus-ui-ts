import { trigger } from './config';

// 定义类型接口
interface FormConfig {
  formRef: string;
  formModel: string;
  formRules: string;
  size: string;
  disabled?: boolean;
  labelWidth: number;
  labelPosition?: string;
  gutter?: number;
  formBtns?: boolean;
  fields: FormField[];
}

interface FormField {
  layout: string;
  tag: string;
  label?: string;
  vModel: string;
  span: number;
  required?: boolean;
  disabled?: boolean;
  labelWidth?: number;
  type?: string;
  justify?: string;
  align?: string;
  gutter?: number;
  children?: FormField[];
  options?: any[];
  optionType?: string;
  border?: boolean;
  clearable?: boolean;
  placeholder?: string;
  style?: { width?: string };
  maxlength?: number;
  'show-word-limit'?: boolean;
  readonly?: boolean;
  prepend?: string;
  append?: string;
  'prefix-icon'?: string;
  'suffix-icon'?: string;
  'show-password'?: boolean;
  autosize?: { minRows?: number; maxRows?: number };
  'controls-position'?: string;
  min?: number;
  max?: number;
  step?: number;
  'step-strictly'?: boolean;
  precision?: number;
  filterable?: boolean;
  multiple?: boolean;
  'active-text'?: string;
  'inactive-text'?: string;
  'active-color'?: string;
  'inactive-color'?: string;
  'active-value'?: any;
  'inactive-value'?: any;
  props?: any;
  'show-all-levels'?: boolean;
  separator?: string;
  range?: boolean;
  'show-stops'?: boolean;
  'start-placeholder'?: string;
  'end-placeholder'?: string;
  'range-separator'?: string;
  'is-range'?: boolean;
  format?: string;
  'value-format'?: string;
  'picker-options'?: any;
  'allow-half'?: boolean;
  'show-text'?: boolean;
  'show-score'?: boolean;
  'show-alpha'?: boolean;
  'color-format'?: string;
  action?: string;
  'list-type'?: string;
  accept?: string;
  name?: string;
  'auto-upload'?: boolean;
  default?: string;
  buttonText?: string;
  showTip?: boolean;
  fileSize?: number;
  sizeUnit?: string;
}

interface AttrBuilderResult {
  vModel: string;
  clearable?: string;
  placeholder?: string;
  width?: string;
  disabled?: string;
}

// 全局变量
let confGlobal: FormConfig | null = null;
let someSpanIsNot24: boolean = false;

// 辅助函数
export function dialogWrapper(str: string): string {
  return `<el-dialog v-bind="$attrs" v-on="$listeners" @open="onOpen" @close="onClose" title="Dialog Title">
    ${str}
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </div>
  </el-dialog>`;
}

export function vueTemplate(str: string): string {
  return `<template>
    <div>
      ${str}
    </div>
  </template>`;
}

export function vueScript(str: string): string {
  return `<script>
    ${str}
  </script>`;
}

export function cssStyle(cssStr: string): string {
  return `<style>
    ${cssStr}
  </style>`;
}

function buildFormTemplate(conf: FormConfig, child: string, type: string): string {
  let labelPosition = '';
  if (conf.labelPosition !== 'right') {
    labelPosition = `label-position="${conf.labelPosition}"`;
  }
  const disabled = conf.disabled ? `:disabled="${conf.disabled}"` : '';
  let str = `<el-form ref="${conf.formRef}" :model="${conf.formModel}" :rules="${conf.formRules}" size="${conf.size}" ${disabled} label-width="${conf.labelWidth}px" ${labelPosition}>
      ${child}
      ${buildFromBtns(conf, type)}
    </el-form>`;
  if (someSpanIsNot24) {
    str = `<el-row :gutter="${conf.gutter || 20}">
        ${str}
      </el-row>`;
  }
  return str;
}

function buildFromBtns(conf: FormConfig, type: string): string {
  let str = '';
  if (conf.formBtns && type === 'file') {
    str = `<el-form-item size="large">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>`;
    if (someSpanIsNot24) {
      str = `<el-col :span="24">
          ${str}
        </el-col>`;
    }
  }
  return str;
}

function colWrapper(element: FormField, str: string): string {
  if (someSpanIsNot24 || element.span !== 24) {
    return `<el-col :span="${element.span}">
      ${str}
    </el-col>`;
  }
  return str;
}

// 布局构建器
const layouts: Record<string, (element: FormField) => string> = {
  colFormItem(element: FormField): string {
    let labelWidth = '';
    if (element.labelWidth && element.labelWidth !== confGlobal?.labelWidth) {
      labelWidth = `label-width="${element.labelWidth}px"`;
    }
    const required = !trigger[element.tag] && element.required ? 'required' : '';
    const tagDom = tags[element.tag] ? tags[element.tag](element) : '';
    let str = `<el-form-item ${labelWidth} label="${element.label}" prop="${element.vModel}" ${required}>
        ${tagDom}
      </el-form-item>`;
    str = colWrapper(element, str);
    return str;
  },
  rowFormItem(element: FormField): string {
    const type = element.type === 'default' ? '' : `type="${element.type}"`;
    const justify = element.type === 'default' ? '' : `justify="${element.justify}"`;
    const align = element.type === 'default' ? '' : `align="${element.align}"`;
    const gutter = element.gutter ? `gutter="${element.gutter}"` : '';
    const children = element.children?.map((el) => layouts[el.layout](el)).join('\n') || '';
    let str = `<el-row ${type} ${justify} ${align} ${gutter}>
      ${children}
    </el-row>`;
    str = colWrapper(element, str);
    return str;
  }
};

// 标签构建器
const tags: Record<string, (el: FormField) => string> = {
  'el-button': (el: FormField): string => {
    const { tag, disabled } = attrBuilder(el);
    const type = el.type ? `type="${el.type}"` : '';
    const icon = el.icon ? `icon="${el.icon}"` : '';
    const size = el.size ? `size="${el.size}"` : '';
    let child = buildElButtonChild(el);

    if (child) child = `\n${child}\n`;
    return `<${el.tag} ${type} ${icon} ${size} ${disabled}>${child}</${el.tag}>`;
  },
  'el-input': (el: FormField): string => {
    const { disabled, vModel, clearable, placeholder, width } = attrBuilder(el);
    const maxlength = el.maxlength ? `:maxlength="${el.maxlength}"` : '';
    const showWordLimit = el['show-word-limit'] ? 'show-word-limit' : '';
    const readonly = el.readonly ? 'readonly' : '';
    const prefixIcon = el['prefix-icon'] ? `prefix-icon='${el['prefix-icon']}'` : '';
    const suffixIcon = el['suffix-icon'] ? `suffix-icon='${el['suffix-icon']}'` : '';
    const showPassword = el['show-password'] ? 'show-password' : '';
    const type = el.type ? `type="${el.type}"` : '';
    const autosize = el.autosize && el.autosize.minRows ? `:autosize="{minRows: ${el.autosize.minRows}, maxRows: ${el.autosize.maxRows}}"` : '';
    let child = buildElInputChild(el);

    if (child) child = `\n${child}\n`;
    return `<${el.tag} ${vModel} ${type} ${placeholder} ${maxlength} ${showWordLimit} ${readonly} ${disabled} ${clearable} ${prefixIcon} ${suffixIcon} ${showPassword} ${autosize} ${width}>${child}</${el.tag}>`;
  },
  'el-input-number': (el: FormField): string => {
    const { disabled, vModel, placeholder } = attrBuilder(el);
    const controlsPosition = el['controls-position'] ? `controls-position=${el['controls-position']}` : '';
    const min = el.min ? `:min='${el.min}'` : '';
    const max = el.max ? `:max='${el.max}'` : '';
    const step = el.step ? `:step='${el.step}'` : '';
    const stepStrictly = el['step-strictly'] ? 'step-strictly' : '';
    const precision = el.precision ? `:precision='${el.precision}'` : '';

    return `<${el.tag} ${vModel} ${placeholder} ${step} ${stepStrictly} ${precision} ${controlsPosition} ${min} ${max} ${disabled}></${el.tag}>`;
  },
  'el-select': (el: FormField): string => {
    const { disabled, vModel, clearable, placeholder, width } = attrBuilder(el);
    const filterable = el.filterable ? 'filterable' : '';
    const multiple = el.multiple ? 'multiple' : '';
    let child = buildElSelectChild(el);

    if (child) child = `\n${child}\n`;
    return `<${el.tag} ${vModel} ${placeholder} ${disabled} ${multiple} ${filterable} ${clearable} ${width}>${child}</${el.tag}>`;
  },
  'el-radio-group': (el: FormField): string => {
    const { disabled, vModel } = attrBuilder(el);
    const size = `size="${el.size}"`;
    let child = buildElRadioGroupChild(el);

    if (child) child = `\n${child}\n`;
    return `<${el.tag} ${vModel} ${size} ${disabled}>${child}</${el.tag}>`;
  },
  'el-checkbox-group': (el: FormField): string => {
    const { disabled, vModel } = attrBuilder(el);
    const size = `size="${el.size}"`;
    const min = el.min ? `:min="${el.min}"` : '';
    const max = el.max ? `:max="${el.max}"` : '';
    let child = buildElCheckboxGroupChild(el);

    if (child) child = `\n${child}\n`;
    return `<${el.tag} ${vModel} ${min} ${max} ${size} ${disabled}>${child}</${el.tag}>`;
  },
  'el-switch': (el: FormField): string => {
    const { disabled, vModel } = attrBuilder(el);
    const activeText = el['active-text'] ? `active-text="${el['active-text']}"` : '';
    const inactiveText = el['inactive-text'] ? `inactive-text="${el['inactive-text']}"` : '';
    const activeColor = el['active-color'] ? `active-color="${el['active-color']}"` : '';
    const inactiveColor = el['inactive-color'] ? `inactive-color="${el['inactive-color']}"` : '';
    const activeValue = el['active-value'] !== true ? `:active-value='${JSON.stringify(el['active-value'])}'` : '';
    const inactiveValue = el['inactive-value'] !== false ? `:inactive-value='${JSON.stringify(el['inactive-value'])}'` : '';

    return `<${el.tag} ${vModel} ${activeText} ${inactiveText} ${activeColor} ${inactiveColor} ${activeValue} ${inactiveValue} ${disabled}></${el.tag}>`;
  },
  'el-cascader': (el: FormField): string => {
    const { disabled, vModel, clearable, placeholder, width } = attrBuilder(el);
    const options = el.options ? `:options="${el.vModel}Options"` : '';
    const props = el.props ? `:props="${el.vModel}Props"` : '';
    const showAllLevels = el['show-all-levels'] ? '' : ':show-all-levels="false"';
    const filterable = el.filterable ? 'filterable' : '';
    const separator = el.separator === '/' ? '' : `separator="${el.separator}"`;

    return `<${el.tag} ${vModel} ${options} ${props} ${width} ${showAllLevels} ${placeholder} ${separator} ${filterable} ${clearable} ${disabled}></${el.tag}>`;
  },
  'el-slider': (el: FormField): string => {
    const { disabled, vModel } = attrBuilder(el);
    const min = el.min ? `:min='${el.min}'` : '';
    const max = el.max ? `:max='${el.max}'` : '';
    const step = el.step ? `:step='${el.step}'` : '';
    const range = el.range ? 'range' : '';
    const showStops = el['show-stops'] ? `:show-stops="${el['show-stops']}"` : '';

    return `<${el.tag} ${min} ${max} ${step} ${vModel} ${range} ${showStops} ${disabled}></${el.tag}>`;
  },
  'el-time-picker': (el: FormField): string => {
    const { disabled, vModel, clearable, placeholder, width } = attrBuilder(el);
    const startPlaceholder = el['start-placeholder'] ? `start-placeholder="${el['start-placeholder']}"` : '';
    const endPlaceholder = el['end-placeholder'] ? `end-placeholder="${el['end-placeholder']}"` : '';
    const rangeSeparator = el['range-separator'] ? `range-separator="${el['range-separator']}"` : '';
    const isRange = el['is-range'] ? 'is-range' : '';
    const format = el.format ? `format="${el.format}"` : '';
    const valueFormat = el['value-format'] ? `value-format="${el['value-format']}"` : '';
    const pickerOptions = el['picker-options'] ? `:picker-options='${JSON.stringify(el['picker-options'])}'` : '';

    return `<${el.tag} ${vModel} ${isRange} ${format} ${valueFormat} ${pickerOptions} ${width} ${placeholder} ${startPlaceholder} ${endPlaceholder} ${rangeSeparator} ${clearable} ${disabled}></${el.tag}>`;
  },
  'el-date-picker': (el: FormField): string => {
    const { disabled, vModel, clearable, placeholder, width } = attrBuilder(el);
    const startPlaceholder = el['start-placeholder'] ? `start-placeholder="${el['start-placeholder']}"` : '';
    const endPlaceholder = el['end-placeholder'] ? `end-placeholder="${el['end-placeholder']}"` : '';
    const rangeSeparator = el['range-separator'] ? `range-separator="${el['range-separator']}"` : '';
    const format = el.format ? `format="${el.format}"` : '';
    const valueFormat = el['value-format'] ? `value-format="${el['value-format']}"` : '';
    const type = el.type === 'date' ? '' : `type="${el.type}"`;
    const readonly = el.readonly ? 'readonly' : '';

    return `<${el.tag} ${type} ${vModel} ${format} ${valueFormat} ${width} ${placeholder} ${startPlaceholder} ${endPlaceholder} ${rangeSeparator} ${clearable} ${readonly} ${disabled}></${el.tag}>`;
  },
  'el-rate': (el: FormField): string => {
    const { disabled, vModel } = attrBuilder(el);
    const max = el.max ? `:max='${el.max}'` : '';
    const allowHalf = el['allow-half'] ? 'allow-half' : '';
    const showText = el['show-text'] ? 'show-text' : '';
    const showScore = el['show-score'] ? 'show-score' : '';

    return `<${el.tag} ${vModel} ${allowHalf} ${showText} ${showScore} ${disabled}></${el.tag}>`;
  },
  'el-color-picker': (el: FormField): string => {
    const { disabled, vModel } = attrBuilder(el);
    const size = `size="${el.size}"`;
    const showAlpha = el['show-alpha'] ? 'show-alpha' : '';
    const colorFormat = el['color-format'] ? `color-format="${el['color-format']}"` : '';

    return `<${el.tag} ${vModel} ${size} ${showAlpha} ${colorFormat} ${disabled}></${el.tag}>`;
  },
  'el-upload': (el: FormField): string => {
    const disabled = el.disabled ? ":disabled='true'" : '';
    const action = el.action ? `:action="${el.vModel}Action"` : '';
    const multiple = el.multiple ? 'multiple' : '';
    const listType = el['list-type'] !== 'text' ? `list-type="${el['list-type']}"` : '';
    const accept = el.accept ? `accept="${el.accept}"` : '';
    const name = el.name !== 'file' ? `name="${el.name}"` : '';
    const autoUpload = el['auto-upload'] === false ? ':auto-upload="false"' : '';
    const beforeUpload = `:before-upload="${el.vModel}BeforeUpload"`;
    const fileList = `:file-list="${el.vModel}fileList"`;
    const ref = `ref="${el.vModel}"`;
    let child = buildElUploadChild(el);

    if (child) child = `\n${child}\n`;
    return `<${el.tag} ${ref} ${fileList} ${action} ${autoUpload} ${multiple} ${beforeUpload} ${listType} ${accept} ${name} ${disabled}>${child}</${el.tag}>`;
  }
};

// 属性构建器
function attrBuilder(el: FormField): AttrBuilderResult {
  const result: AttrBuilderResult = {
    vModel: `v-model="${confGlobal?.formModel}.${el.vModel}"`
  };

  if (el.clearable) result.clearable = 'clearable';
  if (el.placeholder) result.placeholder = `placeholder="${el.placeholder}"`;
  if (el.style?.width) result.width = ':style="{width: \'100%\'}"';
  if (el.disabled) result.disabled = ":disabled='true'";

  return result;
}

// 构建子元素
function buildElButtonChild(conf: FormField): string {
  return conf.default ? conf.default : '';
}

function buildElInputChild(conf: FormField): string {
  const children = [];
  if (conf.prepend) {
    children.push(`<template slot="prepend">${conf.prepend}</template>`);
  }
  if (conf.append) {
    children.push(`<template slot="append">${conf.append}</template>`);
  }
  return children.join('\n');
}

function buildElSelectChild(conf: FormField): string {
  if (conf.options?.length) {
    return `<el-option v-for="(item, index) in ${conf.vModel}Options" :key="index" :label="item.label" :value="item.value" :disabled="item.disabled"></el-option>`;
  }
  return '';
}

function buildElRadioGroupChild(conf: FormField): string {
  if (conf.options?.length) {
    const tag = conf.optionType === 'button' ? 'el-radio-button' : 'el-radio';
    const border = conf.border ? 'border' : '';
    return `<${tag} v-for="(item, index) in ${conf.vModel}Options" :key="index" :label="item.value" :disabled="item.disabled" ${border}>{{item.label}}</${tag}>`;
  }
  return '';
}

function buildElCheckboxGroupChild(conf: FormField): string {
  if (conf.options?.length) {
    const tag = conf.optionType === 'button' ? 'el-checkbox-button' : 'el-checkbox';
    const border = conf.border ? 'border' : '';
    return `<${tag} v-for="(item, index) in ${conf.vModel}Options" :key="index" :label="item.value" :disabled="item.disabled" ${border}>{{item.label}}</${tag}>`;
  }
  return '';
}

function buildElUploadChild(conf: FormField): string {
  const list = [];
  if (conf['list-type'] === 'picture-card') {
    list.push('<i class="el-icon-plus"></i>');
  } else {
    list.push(`<el-button size="small" type="primary" icon="el-icon-upload">${conf.buttonText || '上传'}</el-button>`);
  }
  if (conf.showTip) {
    list.push(`<div slot="tip" class="el-upload__tip">只能上传不超过 ${conf.fileSize}${conf.sizeUnit} 的${conf.accept}文件</div>`);
  }
  return list.join('\n');
}

// 主函数
export function makeUpHtml(conf: FormConfig, type: string): string {
  const htmlList: string[] = [];
  confGlobal = conf;
  someSpanIsNot24 = conf.fields.some((item) => item.span !== 24);

  conf.fields.forEach((el) => {
    htmlList.push(layouts[el.layout](el));
  });

  const htmlStr = htmlList.join('\n');
  let temp = buildFormTemplate(conf, htmlStr, type);

  if (type === 'dialog') {
    temp = dialogWrapper(temp);
  }

  confGlobal = null;
  return temp;
}
