import { exportDefault, titleCase } from '@/utils/generator/index';
import { trigger } from './config';

interface FieldOption {
  pattern?: string;
  message: string;
}

interface FieldProps {
  props: {
    value?: string;
    label?: string;
    children?: string;
    [key: string]: any;
  };
}

interface Field {
  vModel?: string;
  defaultValue?: any;
  placeholder?: string;
  label?: string;
  required?: boolean;
  multiple?: boolean;
  options?: any[];
  dataType?: 'dynamic' | 'static';
  tag?: string;
  props?: FieldProps;
  regList?: FieldOption[];
  action?: string;
  'auto-upload'?: boolean;
  accept?: string;
  fileSize?: number;
  sizeUnit?: keyof typeof units;
  children?: Field[];
}

interface FormConfig {
  formModel: string;
  formRules: string;
  formRef: string;
  fields: Field[];
  formBtns?: boolean;
}

const units = {
  KB: '1024',
  MB: '1024 / 1024',
  GB: '1024 / 1024 / 1024'
};

let confGlobal: FormConfig;
const inheritAttrs: Record<string, string> = {
  file: '',
  dialog: 'inheritAttrs: false,'
};

export function makeUpJs(conf: FormConfig, type: string): string {
  confGlobal = conf = JSON.parse(JSON.stringify(conf));
  const dataList: string[] = [];
  const ruleList: string[] = [];
  const optionsList: string[] = [];
  const propsList: string[] = [];
  const methodList: string[] = mixinMethod(type);
  const uploadVarList: string[] = [];

  conf.fields.forEach((el) => {
    buildAttributes(el, dataList, ruleList, optionsList, methodList, propsList, uploadVarList);
  });

  const script = buildexport(
    conf,
    type,
    dataList.join('\n'),
    ruleList.join('\n'),
    optionsList.join('\n'),
    uploadVarList.join('\n'),
    propsList.join('\n'),
    methodList.join('\n')
  );
  confGlobal = null!;
  return script;
}

function buildAttributes(
  el: Field,
  dataList: string[],
  ruleList: string[],
  optionsList: string[],
  methodList: string[],
  propsList: string[],
  uploadVarList: string[]
): void {
  buildData(el, dataList);
  buildRules(el, ruleList);

  if (el.options && el.options.length) {
    buildOptions(el, optionsList);
    if (el.dataType === 'dynamic') {
      const model = `${el.vModel}Options`;
      const options = titleCase(model);
      buildOptionMethod(`get${options}`, model, methodList);
    }
  }

  if (el.props?.props) {
    buildProps(el, propsList);
  }

  if (el.action && el.tag === 'el-upload') {
    uploadVarList.push(
      `${el.vModel}Action: '${el.action}',
      ${el.vModel}fileList: [],`
    );
    methodList.push(buildBeforeUpload(el));
    if (!el['auto-upload']) {
      methodList.push(buildSubmitUpload(el));
    }
  }

  if (el.children) {
    el.children.forEach((child) => buildAttributes(child, dataList, ruleList, optionsList, methodList, propsList, uploadVarList));
  }
}

function mixinMethod(type: string): string[] {
  const list: string[] = [];
  const minxins: Record<string, Record<string, string> | null> = {
    file: confGlobal.formBtns
      ? {
          submitForm: `submitForm() {
        this.$refs['${confGlobal.formRef}'].validate(valid => {
          if(!valid) return
          // TODO 提交表单
        })
      },`,
          resetForm: `resetForm() {
        this.$refs['${confGlobal.formRef}'].resetFields()
      },`
        }
      : null,
    dialog: {
      onOpen: 'onOpen() {},',
      onClose: `onClose() {
        this.$refs['${confGlobal.formRef}'].resetFields()
      },`,
      close: `close() {
        this.$emit('update:visible', false)
      },`,
      handleConfirm: `handleConfirm() {
        this.$refs['${confGlobal.formRef}'].validate(valid => {
          if(!valid) return
          this.close()
        })
      },`
    }
  };

  const methods = minxins[type];
  if (methods) {
    Object.keys(methods).forEach((key) => {
      list.push(methods[key]!);
    });
  }

  return list;
}

function buildData(conf: Field, dataList: string[]): void {
  if (conf.vModel === undefined) return;
  let defaultValue: string;
  if (typeof conf.defaultValue === 'string' && !conf.multiple) {
    defaultValue = `'${conf.defaultValue}'`;
  } else {
    defaultValue = JSON.stringify(conf.defaultValue);
  }
  dataList.push(`${conf.vModel}: ${defaultValue},`);
}

function buildRules(conf: Field, ruleList: string[]): void {
  if (conf.vModel === undefined) return;
  const rules: string[] = [];

  if (trigger[conf.tag!]) {
    if (conf.required) {
      const type = Array.isArray(conf.defaultValue) ? "type: 'array'," : '';
      const message = Array.isArray(conf.defaultValue) ? `请至少选择一个${conf.vModel}` : conf.placeholder || `${conf.label}不能为空`;
      rules.push(`{ required: true, ${type} message: '${message}', trigger: '${trigger[conf.tag!]}' }`);
    }

    if (Array.isArray(conf.regList)) {
      conf.regList.forEach((item) => {
        if (item.pattern) {
          rules.push(`{ pattern: ${eval(item.pattern)}, message: '${item.message}', trigger: '${trigger[conf.tag!]}' }`);
        }
      });
    }

    ruleList.push(`${conf.vModel}: [${rules.join(',')}],`);
  }
}

function buildOptions(conf: Field, optionsList: string[]): void {
  if (conf.vModel === undefined) return;
  if (conf.dataType === 'dynamic') conf.options = [];
  optionsList.push(`${conf.vModel}Options: ${JSON.stringify(conf.options)},`);
}

function buildProps(conf: Field, propsList: string[]): void {
  if (!conf.props) return;
  if (conf.dataType === 'dynamic') {
    conf.valueKey !== 'value' && (conf.props.props.value = conf.valueKey);
    conf.labelKey !== 'label' && (conf.props.props.label = conf.labelKey);
    conf.childrenKey !== 'children' && (conf.props.props.children = conf.childrenKey);
  }
  propsList.push(`${conf.vModel}Props: ${JSON.stringify(conf.props.props)},`);
}

function buildBeforeUpload(conf: Field): string {
  const unitNum = units[conf.sizeUnit!];
  const returnList: string[] = [];
  let rightSizeCode = '';
  let acceptCode = '';

  if (conf.fileSize) {
    rightSizeCode = `let isRightSize = file.size / ${unitNum} < ${conf.fileSize}
    if(!isRightSize){
      this.$message.error('文件大小超过 ${conf.fileSize}${conf.sizeUnit}')
    }`;
    returnList.push('isRightSize');
  }

  if (conf.accept) {
    acceptCode = `let isAccept = new RegExp('${conf.accept}').test(file.type)
    if(!isAccept){
      this.$message.error('应该选择${conf.accept}类型的文件')
    }`;
    returnList.push('isAccept');
  }

  const str = `${conf.vModel}BeforeUpload(file: File) {
    ${rightSizeCode}
    ${acceptCode}
    return ${returnList.join(' && ')}
  },`;
  return returnList.length ? str : '';
}

function buildSubmitUpload(conf: Field): string {
  return `submitUpload() {
    this.$refs['${conf.vModel}'].submit()
  },`;
}

function buildOptionMethod(methodName: string, model: string, methodList: string[]): void {
  const str = `${methodName}() {
    // TODO 发起请求获取数据
    this.${model}
  },`;
  methodList.push(str);
}

function buildexport(
  conf: FormConfig,
  type: string,
  data: string,
  rules: string,
  selectOptions: string,
  uploadVar: string,
  props: string,
  methods: string
): string {
  return `${exportDefault}{
  ${inheritAttrs[type] || ''}
  components: {},
  props: [],
  data () {
    return {
      ${conf.formModel}: {
        ${data}
      },
      ${conf.formRules}: {
        ${rules}
      },
      ${uploadVar}
      ${selectOptions}
      ${props}
    }
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {},
  methods: {
    ${methods}
  }
}`;
}
