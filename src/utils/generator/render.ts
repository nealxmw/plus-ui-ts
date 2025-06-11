import { defineComponent, h } from 'vue';
import { makeMap } from '@/utils/generator/index';

// 参考 https://github.com/vuejs/vue/blob/v2.6.10/src/platforms/web/server/util.js
const isAttr = makeMap(
  'accept,accept-charset,accesskey,action,align,alt,async,autocomplete,' +
    'autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,' +
    'checked,cite,class,code,codebase,color,cols,colspan,content,http-equiv,' +
    'name,contenteditable,contextmenu,controls,coords,data,datetime,default,' +
    'defer,dir,dirname,disabled,download,draggable,dropzone,enctype,method,for,' +
    'form,formaction,headers,height,hidden,high,href,hreflang,http-equiv,' +
    'icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,' +
    'manifest,max,maxlength,media,method,GET,POST,min,multiple,email,file,' +
    'muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,' +
    'preload,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,' +
    'scope,scoped,seamless,selected,shape,size,type,text,password,sizes,span,' +
    'spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,' +
    'target,title,type,usemap,value,width,wrap'
);

interface Option {
  label: string;
  value: any;
  disabled?: boolean;
}

interface ComponentConfig {
  tag: string;
  [key: string]: any;
  vModel?: boolean;
  defaultValue?: any;
  options?: Option[];
  optionType?: string;
  border?: boolean;
  'list-type'?: string;
  buttonText?: string;
  showTip?: boolean;
  fileSize?: number;
  sizeUnit?: string;
  accept?: string;
}

function vModel(dataObject: Record<string, any>, defaultValue: any) {
  dataObject['modelValue'] = defaultValue;

  dataObject['onUpdate:modelValue'] = (val: any) => {
    return val;
  };
}

const componentChild = {
  'el-button': {
    default: (conf: ComponentConfig, key: string) => {
      return conf[key];
    }
  },
  'el-input': {
    prepend: (conf: ComponentConfig, key: string) => {
      return h('template', { slot: 'prepend' }, conf[key]);
    },
    append: (conf: ComponentConfig, key: string) => {
      return h('template', { slot: 'append' }, conf[key]);
    }
  },
  'el-select': {
    options: (conf: ComponentConfig) => {
      if (!conf.options) return [];
      return conf.options.map((item) =>
        h('el-option', {
          label: item.label,
          value: item.value,
          disabled: item.disabled
        })
      );
    }
  },
  'el-radio-group': {
    options: (conf: ComponentConfig) => {
      if (!conf.options) return [];
      return conf.options.map((item) => {
        if (conf.optionType === 'button') {
          return h('el-radio-button', { label: item.value }, item.label);
        } else {
          return h(
            'el-radio',
            {
              label: item.value,
              border: conf.border
            },
            item.label
          );
        }
      });
    }
  },
  'el-checkbox-group': {
    options: (conf: ComponentConfig) => {
      if (!conf.options) return [];
      return conf.options.map((item) => {
        if (conf.optionType === 'button') {
          return h('el-checkbox-button', { label: item.value }, item.label);
        } else {
          return h(
            'el-checkbox',
            {
              label: item.value,
              border: conf.border
            },
            item.label
          );
        }
      });
    }
  },
  'el-upload': {
    'list-type': (conf: ComponentConfig) => {
      const list = [];

      if (conf['list-type'] === 'picture-card') {
        list.push(h('i', { class: 'el-icon-plus' }));
      } else {
        list.push(
          h(
            'el-button',
            {
              size: 'small',
              type: 'primary',
              icon: 'el-icon-upload'
            },
            conf.buttonText || '上传'
          )
        );
      }

      if (conf.showTip) {
        list.push(
          h('div', { slot: 'tip', class: 'el-upload__tip' }, `只能上传不超过 ${conf.fileSize || ''}${conf.sizeUnit || ''} 的${conf.accept || ''}文件`)
        );
      }

      return list;
    }
  }
};

export default defineComponent({
  name: 'DynamicRender',

  props: {
    conf: {
      type: Object as () => ComponentConfig,
      required: true
    }
  },

  setup(props, { emit }) {
    return () => {
      const dataObject: Record<string, any> = {
        attrs: {},
        props: {},
        on: {},
        style: {}
      };

      const confClone = JSON.parse(JSON.stringify(props.conf)) as ComponentConfig;
      const children: any[] = [];

      // 处理特定组件的子元素
      const childObjs = componentChild[confClone.tag as keyof typeof componentChild];
      if (childObjs) {
        Object.keys(childObjs).forEach((key) => {
          const childFunc = childObjs[key as keyof typeof childObjs];
          if (confClone[key]) {
            children.push(childFunc(confClone, key));
          }
        });
      }

      // 处理组件属性
      Object.keys(confClone).forEach((key) => {
        const val = confClone[key];

        if (key === 'vModel') {
          vModel(dataObject, confClone.defaultValue);
        } else if (key === 'on') {
          // 合并事件处理
          Object.assign(dataObject.on, val);
        } else if (dataObject[key]) {
          dataObject[key] = val;
        } else if (!isAttr(key)) {
          dataObject.props[key] = val;
        } else {
          dataObject.attrs[key] = val;
        }
      });

      return h(confClone.tag, dataObject, children);
    };
  }
});
