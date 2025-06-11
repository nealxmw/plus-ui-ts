<script setup lang="ts">
import draggable from 'vuedraggable';
import DynamicRender from '@/utils/generator/render';

// 定义组件属性类型
interface Props {
  element: any;
  index: number;
  drawingList: any[];
  activeId: string | number;
  formConf: any;
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits(['copy-item', 'delete-item', 'active-item']);

// 操作按钮组件
const ItemBtns = (element: any, index: number, parent: any) => {
  return [
    h(
      'span',
      {
        class: 'drawing-item-copy',
        title: '复制',
        onClick: (event: Event) => {
          emit('copy-item', element, parent);
          event.stopPropagation();
        }
      },
      h('i', { class: 'el-icon-copy-document' })
    ),

    h(
      'span',
      {
        class: 'drawing-item-delete',
        title: '删除',
        onClick: (event: Event) => {
          emit('delete-item', index, parent);
          event.stopPropagation();
        }
      },
      h('i', { class: 'el-icon-delete' })
    )
  ];
};

// 布局组件
const ColFormItem = (element: any, index: number, parent: any) => {
  const className = computed(() => {
    let cls = props.activeId === element.formId ? 'drawing-item active-from-item' : 'drawing-item';

    if (props.formConf.unFocusedComponentBorder) {
      cls += ' unfocus-bordered';
    }

    return cls;
  });

  return h(
    'el-col',
    {
      span: element.span,
      class: className.value,
      onClick: (event: Event) => {
        emit('active-item', element);
        event.stopPropagation();
      }
    },
    [
      h(
        'el-form-item',
        {
          labelWidth: element.labelWidth ? `${element.labelWidth}px` : null,
          label: element.label,
          required: element.required
        },
        [
          h(DynamicRender, {
            key: element.renderKey,
            conf: element,
            'onUpdate:modelValue': (value: any) => {
              element.defaultValue = value;
            }
          })
        ]
      ),
      ...ItemBtns(element, index, parent)
    ]
  );
};

const RowFormItem = (element: any, index: number, parent: any) => {
  const className = computed(() => {
    return props.activeId === element.formId ? 'drawing-row-item active-from-item' : 'drawing-row-item';
  });

  const children = RenderChildren(element, element.children);

  let content;
  if (element.type === 'flex') {
    content = h(
      'el-row',
      {
        type: element.type,
        justify: element.justify,
        align: element.align
      },
      children
    );
  } else {
    content = children;
  }

  return h('el-col', { span: element.span }, [
    h(
      'el-row',
      {
        gutter: element.gutter,
        class: className.value,
        onClick: (event: Event) => {
          emit('active-item', element);
          event.stopPropagation();
        }
      },
      [
        h('span', { class: 'component-name' }, element.componentName),
        h(
          draggable,
          {
            list: element.children,
            animation: 340,
            group: 'componentsGroup',
            class: 'drag-wrapper',
            itemKey: 'formId'
          },
          { default: () => content }
        ),
        ...ItemBtns(element, index, parent)
      ]
    )
  ]);
};

// 渲染子组件
const RenderChildren = (parent: any, childrenList: any[]) => {
  if (!Array.isArray(childrenList)) return null;

  return childrenList.map((el, i) => {
    if (el.layout === 'colFormItem') {
      return ColFormItem(el, i, childrenList);
    } else if (el.layout === 'rowFormItem') {
      return RowFormItem(el, i, childrenList);
    }
    return h('div', `没有与${el.layout}匹配的layout`);
  });
};

// 主渲染函数
const renderLayout = () => {
  if (props.element.layout === 'colFormItem') {
    return ColFormItem(props.element, props.index, props.drawingList);
  } else if (props.element.layout === 'rowFormItem') {
    return RowFormItem(props.element, props.index, props.drawingList);
  }
  return h('div', `没有与${props.element.layout}匹配的layout`);
};
</script>

<template>
  <component :is="renderLayout" />
</template>

<style lang="scss" scoped>
.drawing-item {
  position: relative;
  cursor: move;
  margin-bottom: 15px;

  &.unfocus-bordered:not(.active-from-item) {
    border: 1px dashed #ccc;
  }

  &:hover {
    & > .el-form-item {
      background: #f6f7ff;
      border-radius: 6px;
    }

    .drawing-item-copy,
    .drawing-item-delete {
      display: initial;
    }
  }

  .drawing-item-copy,
  .drawing-item-delete {
    display: none;
    position: absolute;
    top: -10px;
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border-radius: 50%;
    font-size: 12px;
    border: 1px solid;
    cursor: pointer;
    z-index: 1;
  }

  .drawing-item-copy {
    right: 56px;
    border-color: #409eff;
    color: #409eff;
    background: #fff;

    &:hover {
      background: #409eff;
      color: #fff;
    }
  }

  .drawing-item-delete {
    right: 24px;
    border-color: #f56c6c;
    color: #f56c6c;
    background: #fff;

    &:hover {
      background: #f56c6c;
      color: #fff;
    }
  }
}

.drawing-row-item {
  position: relative;
  cursor: move;
  box-sizing: border-box;
  border: 1px dashed #ccc;
  border-radius: 3px;
  padding: 0 2px;
  margin-bottom: 15px;

  .drawing-row-item {
    margin-bottom: 2px;
  }

  .el-col {
    margin-top: 22px;
  }

  .el-form-item {
    margin-bottom: 0;
  }

  .drag-wrapper {
    min-height: 80px;
    padding: 5px;
  }

  &.active-from-item {
    border: 1px dashed #409eff;
  }

  .component-name {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 12px;
    color: #bbb;
    display: inline-block;
    padding: 0 6px;
  }

  &:hover {
    border: 1px dashed #787be8;

    .drawing-item-copy,
    .drawing-item-delete {
      display: initial;
    }
  }
}
</style>
