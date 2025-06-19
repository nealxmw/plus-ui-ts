<script setup lang="tsx">
import { computed } from 'vue';
import { useAttrs, defineProps, defineEmits } from 'vue';
import draggable from 'vuedraggable';
import Render from '@/utils/generator/render';

interface Element {
  layout: string;
  formId: number;
  span: number;
  label?: string;
  required?: boolean;
  labelWidth?: number;
  componentName?: string;
  children?: Element[];
  renderKey?: string;
  [key: string]: any;
}

const props = defineProps<{
  element: Element;
  index: number;
  drawingList: Element[];
  activeId: number | string;
  formConf: Record<string, any>;
}>();

const emits = defineEmits<{
  (e: 'copyItem', element: Element, parent: Element[]): void;
  (e: 'deleteItem', index: number, parent: Element[]): void;
  (e: 'activeItem', element: Element): void;
}>();

const itemBtns = (element: Element, index: number, parent: Element[]) => [
  <span
    class="drawing-item-copy"
    title="复制"
    onClick={(event: MouseEvent) => {
      emits('copyItem', element, parent);
      event.stopPropagation();
    }}
  >
    <i class="el-icon-copy-document" />
  </span>,
  <span
    class="drawing-item-delete"
    title="删除"
    onClick={(event: MouseEvent) => {
      emits('deleteItem', index, parent);
      event.stopPropagation();
    }}
  >
    <i class="el-icon-delete" />
  </span>
];

const renderChildren = (element: Element, index: number, parent: Element[]) => {
  if (!Array.isArray(element.children)) return null;
  return element.children.map((el, i) => {
    const layout = layouts[el.layout];
    if (layout) return layout(el, i, element.children!);
    throw new Error(`没有与${el.layout}匹配的layout`);
  });
};

const layouts: Record<string, (element: Element, index: number, parent: Element[]) => JSX.Element> =
  {
    colFormItem(element, index, parent) {
      let className =
        props.activeId === element.formId ? 'drawing-item active-from-item' : 'drawing-item';
      if (props.formConf.unFocusedComponentBorder) className += ' unfocus-bordered';
      return (
        <el-col
          span={element.span}
          class={className}
          onClick={(event: MouseEvent) => {
            emits('activeItem', element);
            event.stopPropagation();
          }}
        >
          <el-form-item
            label-width={element.labelWidth ? `${element.labelWidth}px` : undefined}
            label={element.label}
            required={element.required}
          >
            <Render
              key={element.renderKey}
              conf={element}
              onUpdate:modelValue={(val: any) => {
                element.defaultValue = val;
              }}
            />
          </el-form-item>
          {itemBtns(element, index, parent)}
        </el-col>
      );
    },

    rowFormItem(element, index, parent) {
      const className =
        props.activeId === element.formId
          ? 'drawing-row-item active-from-item'
          : 'drawing-row-item';
      let child = renderChildren(element, index, parent);
      if (element.type === 'flex') {
        child = (
          <el-row type={element.type} justify={element.justify} align={element.align}>
            {child}
          </el-row>
        );
      }
      return (
        <el-col span={element.span}>
          <el-row
            gutter={element.gutter}
            class={className}
            onClick={(event: MouseEvent) => {
              emits('activeItem', element);
              event.stopPropagation();
            }}
          >
            <span class="component-name">{element.componentName}</span>
            <draggable
              list={element.children!}
              animation={340}
              group="componentsGroup"
              class="drag-wrapper"
            >
              {child}
            </draggable>
            {itemBtns(element, index, parent)}
          </el-row>
        </el-col>
      );
    }
  };
</script>

<template>
  <component
    :is="layouts[element.layout] ? layouts[element.layout](element, index, drawingList) : null"
  />
</template>
