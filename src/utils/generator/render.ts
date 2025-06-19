import { defineComponent, h, SetupContext, VNode } from 'vue';
import { makeMap } from '@/utils/generator/index';

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

// 预定义特殊子插槽渲染函数
const componentChild: Record<string, Record<string, (h: typeof import('vue').h, conf: any, key: string) => VNode | VNode[]>> = {
  'el-button': {
    default(h, conf, key) {
      return conf[key];
    }
  },
  'el-input': {
    prepend(h, conf, key) {
      return h('template', { slot: 'prepend' }, () => conf[key]);
    },
    append(h, conf, key) {
      return h('template', { slot: 'append' }, () => conf[key]);
    }
  },
  'el-select': {
    options(h, conf, key) {
      if (!conf.options || !Array.isArray(conf.options)) return [];
      return conf.options.map((item: any) =>
        h('el-option', {
          label: item.label,
          value: item.value,
          disabled: item.disabled
        })
      );
    }
  },
  'el-radio-group': {
    options(h, conf, key) {
      if (!conf.options || !Array.isArray(conf.options)) return [];
      return conf.options.map((item: any) =>
        conf.optionType === 'button'
          ? h('el-radio-button', { label: item.value }, () => item.label)
          : h('el-radio', { label: item.value, border: conf.border }, () => item.label)
      );
    }
  },
  'el-checkbox-group': {
    options(h, conf, key) {
      if (!conf.options || !Array.isArray(conf.options)) return [];
      return conf.options.map((item: any) =>
        conf.optionType === 'button'
          ? h('el-checkbox-button', { label: item.value }, () => item.label)
          : h('el-checkbox', { label: item.value, border: conf.border }, () => item.label)
      );
    }
  },
  'el-upload': {
    'list-type': (h, conf, key) => {
      const children = [];
      if (conf['list-type'] === 'picture-card') {
        children.push(h('i', { class: 'el-icon-plus' }));
      } else {
        children.push(
          h(
            'el-button',
            {
              size: 'small',
              type: 'primary',
              icon: 'el-icon-upload'
            },
            () => conf.buttonText
          )
        );
      }
      if (conf.showTip) {
        children.push(
          h(
            'div',
            { class: 'el-upload__tip', slot: 'tip' },
            `只能上传不超过 ${conf.fileSize}${conf.sizeUnit} 的${conf.accept}文件`
          )
        );
      }
      return children;
    }
  }
};

export default defineComponent({
  name: 'RenderComponent',
  props: {
    conf: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, ctx: SetupContext) {
    return () => {
      const conf = props.conf;
      const children: VNode[] = [];

      // 渲染子插槽或子节点
      const childFuncs = componentChild[conf.tag];
      if (childFuncs) {
        Object.keys(childFuncs).forEach((slotName) => {
          if (conf[slotName]) {
            const child = childFuncs[slotName](h, conf, slotName);
            if (Array.isArray(child)) {
              children.push(...child);
            } else {
              children.push(child);
            }
          }
        });
      }

      // 整合所有属性和事件（class/style/modelValue/onUpdate:modelValue等）
      const dataObject: Record<string, any> = {};

      Object.keys(conf).forEach((key) => {
        const val = conf[key];
        if (key === 'vModel') {
          // v-model 处理
          dataObject.modelValue = conf.defaultValue;
          dataObject['onUpdate:modelValue'] = (value: any) => {
            ctx.emit('update:modelValue', value);
          };
        } else if (isAttr(key)) {
          // 作为 DOM 属性直接设置
          dataObject[key] = val;
        } else if (key === 'tag' || key === 'options') {
          // 忽略这些内部控制字段，不传给组件
        } else {
          // 其他作为 props
          dataObject[key] = val;
        }
      });

      // 返回渲染节点
      return h(conf.tag, dataObject, children.length ? children : conf.children || []);
    };
  }
});
