import { trigger } from './config';

interface FormElement {
  tag: string;
  vModel: string;
  label?: string;
  span?: number;
  labelWidth?: number;
  required?: boolean;
  layout?: string;
  type?: string;
  justify?: string;
  align?: string;
  gutter?: number;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any; disabled?: boolean }>;
  style?: { width?: string };
  children?: FormElement[];
  [key: string]: any;
}

interface FormConfig {
  formRef: string;
  formModel: string;
  formRules: string;
  size: string;
  labelPosition: string;
  labelWidth: number;
  gutter: number;
  disabled: boolean;
  formBtns: boolean;
  fields: FormElement[];
  unFocusedComponentBorder?: boolean;
  [key: string]: any;
}

let confGlobal: FormConfig | null = null;
let someSpanIsNot24: boolean = false;

export function dialogWrapper(str: string): string {
  return `<el-dialog v-bind="$attrs" @open="onOpen" @close="onClose" title="Dialog Title">
    ${str}
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
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
  return `<script lang="ts">
    ${str}
  </script>`;
}

export function cssStyle(cssStr: string): string {
  return `<style scoped>
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
    str = `<el-row :gutter="${conf.gutter}">
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

function colWrapper(element: FormElement, str: string): string {
  if (someSpanIsNot24 || element.span !== 24) {
    return `<el-col :span="${element.span}">
      ${str}
    </el-col>`;
  }
  return str;
}

const layouts = {
  colFormItem(element: FormElement): string {
    let labelWidth = '';
    if (element.labelWidth && element.labelWidth !== confGlobal?.labelWidth) {
      labelWidth = `label-width="${element.labelWidth}px"`;
    }
    const required = !trigger[element.tag as keyof typeof trigger] && element.required ? 'required' : '';
    const tagDom = tags[element.tag as keyof typeof tags] ? tags[element.tag as keyof typeof tags](element) : null;
    let str = `<el-form-item ${labelWidth} label="${element.label}" prop="${element.vModel}" ${required}>
        ${tagDom}
      </el-form-item>`;
    str = colWrapper(element, str);
    return str;
  },
  rowFormItem(element: FormElement): string {
    const type = element.type === 'default' ? '' : `type="${element.type}"`;
    const justify = element.type === 'default' ? '' : `justify="${element.justify}"`;
    const align = element.type === 'default' ? '' : `align="${element.align}"`;
    const gutter = element.gutter ? `gutter="${element.gutter}"` : '';
    const children = element.children?.map((el) => layouts[el.layout as keyof typeof layouts](el)).join('\n') || '';
    let str = `<el-row ${type} ${justify} ${align} ${gutter}>
      ${children}
    </el-row>`;
    str = colWrapper(element, str);
    return str;
  }
};

const tags = {
  'el-button': (el: FormElement): string => {
    const { tag, disabled } = attrBuilder(el);
    const type = el.type ? `type="${el.type}"` : '';
    const icon = el.icon ? `icon="${el.icon}"` : '';
    const size = el.size ? `size="${el.size}"` : '';
    let child = buildElButtonChild(el);

    if (child) child = `\n${child}\n`;
    return `<${el.tag} ${type} ${icon} ${size} ${disabled}>${child}</${el.tag}>`;
  },
  'el-input': (el: FormElement): string => {
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
  'el-input-number': (el: FormElement): string => {
    const { disabled, vModel, placeholder } = attrBuilder(el);
    const controlsPosition = el['controls-position'] ? `controls-position=${el['controls-position']}` : '';
    const min = el.min ? `:min='${el.min}'` : '';
    const max = el.max ? `:max='${el.max}'` : '';
    const step = el.step ? `:step='${el.step}'` : '';
    const stepStrictly = el['step-strictly'] ? 'step-strictly' : '';
    const precision = el.precision ? `:precision='${el.precision}'` : '';

    return `<${el.tag} ${vModel} ${placeholder} ${step} ${stepStrictly} ${precision} ${controlsPosition} ${min} ${max} ${disabled}></${el.tag}>`;
  },
  'el-select': (el: FormElement): string => {
    const { disabled, vModel, clearable, placeholder, width } = attrBuilder(el);
    const filterable = el.filterable ? 'filterable' : '';
    const multiple = el.multiple ? 'multiple' : '';
    let child = buildElSelectChild(el);

    if (child) child = `\n${child}\n`;
    return `<${el.tag} ${vModel} ${placeholder} ${disabled} ${multiple} ${filterable} ${clearable} ${width}>${child}</${el.tag}>`;
  },
  'el-radio-group': (el: FormElement): string => {
    const { disabled, vModel } = attrBuilder(el);
    const size = `size="${el.size}"`;
    let child = buildElRadioGroupChild(el);

    if (child) child = `\n${child}\n`;
    return `<${el.tag} ${vModel} ${size} ${disabled}>${child}</${el.tag}>`;
  },
  'el-checkbox-group': (el: FormElement): string => {
    const { disabled, vModel } = attrBuilder(el);
    const size = `size="${el.size}"`;
    const min = el.min ? `:min="${el.min}"` : '';
    const max = el.max ? `:max="${el.max}"` : '';
    let child = buildElCheckboxGroupChild(el);

    if (child) child = `\n${child}\n`;
    return `<${el.tag} ${vModel} ${min} ${max} ${size} ${disabled}>${child}</${el.tag}>`;
  },
  'el-switch': (el: FormElement): string => {
    const { disabled, vModel } = attrBuilder(el);
    const activeText = el['active-text'] ? `active-text="${el['active-text']}"` : '';
    const inactiveText = el['inactive-text'] ? `inactive-text="${el['inactive-text']}"` : '';
    const activeColor = el['active-color'] ? `active-color="${el['active-color']}"` : '';
    const inactiveColor = el['inactive-color'] ? `inactive-color="${el['inactive-color']}"` : '';
    const activeValue = el['active-value'] !== true ? `:active-value='${JSON.stringify(el['active-value'])}'` : '';
    const inactiveValue = el['inactive-value'] !== false ? `:inactive-value='${JSON.stringify(el['inactive-value'])}'` : '';

    return `<${el.tag} ${vModel} ${activeText} ${inactiveText} ${activeColor} ${inactiveColor} ${activeValue} ${inactiveValue} ${disabled}></${el.tag}>`;
  },
  'el-cascader': (el: FormElement): string => {
    const { disabled, vModel, clearable, placeholder, width } = attrBuilder(el);
    const options = el.options ? `:options="${el.vModel}Options"` : '';
    const props = el.props ? `:props="${el.vModel}Props"` : '';
    const showAllLevels = el['show-all-levels'] ? '' : ':show-all-levels="false"';
    const filterable = el.filterable ? 'filterable' : '';
    const separator = el.separator === '/' ? '' : `separator="${el.separator}"`;

    return `<${el.tag} ${vModel} ${options} ${props} ${width} ${showAllLevels} ${placeholder} ${separator} ${filterable} ${clearable} ${disabled}></${el.tag}>`;
  },
  'el-slider': (el: FormElement): string => {
    const { disabled, vModel } = attrBuilder(el);
    const min = el.min ? `:min='${el.min}'` : '';
    const max = el.max ? `:max='${el.max}'` : '';
    const step = el.step ? `:step='${el.step}'` : '';
    const range = el.range ? 'range' : '';
    const showStops = el['show-stops'] ? `:show-stops="${el['show-stops']}"` : '';

    return `<${el.tag} ${min} ${max} ${step} ${vModel} ${range} ${showStops} ${disabled}></${el.tag}>`;
  },
  'el-time-picker': (el: FormElement): string => {
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
  'el-date-picker': (el: FormElement): string => {
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
  'el-rate': (el: FormElement): string => {
    const { disabled, vModel } = attrBuilder(el);
    const max = el.max ? `:max='${el.max}'` : '';
    const allowHalf = el['allow-half'] ? 'allow-half' : '';
    const showText = el['show-text'] ? 'show-text' : '';
    const showScore = el['show-score'] ? 'show-score' : '';

    return `<${el.tag} ${vModel} ${allowHalf} ${showText} ${showScore} ${disabled}></${el.tag}>`;
  },
  'el-color-picker': (el: FormElement): string => {
    const { disabled, vModel } = attrBuilder(el);
    const size = `size="${el.size}"`;
    const showAlpha = el['show-alpha'] ? 'show-alpha' : '';
    const colorFormat = el['color-format'] ? `color-format="${el['color-format']}"` : '';

    return `<${el.tag} ${vModel} ${size} ${showAlpha} ${colorFormat} ${disabled}></${el.tag}>`;
  },
  'el-upload': (el: FormElement): string => {
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

function attrBuilder(el: FormElement) {
  return {
    vModel: `v-model="${confGlobal?.formModel}.${el.vModel}"`,
    clearable: el.clearable ? 'clearable' : '',
    placeholder: el.placeholder ? `placeholder="${el.placeholder}"` : '',
    width: el.style && el.style.width ? ':style="{width: \'100%\'}"' : '',
    disabled: el.disabled ? ":disabled='true'" : '',
    tag: el.tag
  };
}

function buildElButtonChild(conf: FormElement): string {
  const children = [];
  if (conf.default) {
    children.push(conf.default);
  }
  return children.join('\n');
}

function buildElInputChild(conf: FormElement): string {
  const children = [];
  if (conf.prepend) {
    children.push(`<template #prepend>${conf.prepend}</template>`);
  }
  if (conf.append) {
    children.push(`<template #append>${conf.append}</template>`);
  }
  return children.join('\n');
}

function buildElSelectChild(conf: FormElement): string {
  const children = [];
  if (conf.options && conf.options.length) {
    children.push(
      `<el-option v-for="(item, index) in ${conf.vModel}Options" :key="index" :label="item.label" :value="item.value" :disabled="item.disabled"></el-option>`
    );
  }
  return children.join('\n');
}

function buildElRadioGroupChild(conf: FormElement): string {
  const children = [];
  if (conf.options && conf.options.length) {
    const tag = conf.optionType === 'button' ? 'el-radio-button' : 'el-radio';
    const border = conf.border ? 'border' : '';
    children.push(
      `<${tag} v-for="(item, index) in ${conf.vModel}Options" :key="index" :label="item.value" :disabled="item.disabled" ${border}>{{item.label}}</${tag}>`
    );
  }
  return children.join('\n');
}

function buildElCheckboxGroupChild(conf: FormElement): string {
  const children = [];
  if (conf.options && conf.options.length) {
    const tag = conf.optionType === 'button' ? 'el-checkbox-button' : 'el-checkbox';
    const border = conf.border ? 'border' : '';
    children.push(
      `<${tag} v-for="(item, index) in ${conf.vModel}Options" :key="index" :label="item.value" :disabled="item.disabled" ${border}>{{item.label}}</${tag}>`
    );
  }
  return children.join('\n');
}

function buildElUploadChild(conf: FormElement): string {
  const list = [];
  if (conf['list-type'] === 'picture-card') list.push('<i class="el-icon-plus"></i>');
  else list.push(`<el-button size="small" type="primary" icon="el-icon-upload">${conf.buttonText}</el-button>`);
  if (conf.showTip) list.push(`<div #tip class="el-upload__tip">只能上传不超过 ${conf.fileSize}${conf.sizeUnit} 的${conf.accept}文件</div>`);
  return list.join('\n');
}

export function makeUpHtml(conf: FormConfig, type: string): string {
  const htmlList: string[] = [];
  confGlobal = conf;
  someSpanIsNot24 = conf.fields.some((item) => item.span !== 24);
  conf.fields.forEach((el) => {
    htmlList.push(layouts[el.layout as keyof typeof layouts](el));
  });
  const htmlStr = htmlList.join('\n');

  let temp = buildFormTemplate(conf, htmlStr, type);
  if (type === 'dialog') {
    temp = dialogWrapper(temp);
  }
  confGlobal = null;
  return temp;
}
