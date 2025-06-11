<template>
  <div class="container">
    <div class="left-board">
      <div class="logo-wrapper">
        <div class="logo"><img :src="logo" alt="logo" /> Form Generator</div>
      </div>

      <el-scrollbar class="left-scrollbar">
        <div class="components-list">
          <div class="components-title"><svg-icon icon-class="component" />输入型组件</div>
          <draggable
            class="components-draggable"
            :list="inputComponents"
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
            :clone="cloneComponent"
            draggable=".components-item"
            :sort="false"
            @end="onEnd"
            itemKey="formId"
          >
            <template #item="{ element, index }">
              <div class="components-item" @click="() => addComponent(element)" :key="index">
                <div class="components-body">
                  <svg-icon :icon-class="element.tagIcon" />
                  {{ element.label }}
                </div>
              </div>
            </template>
          </draggable>

          <div class="components-title"><svg-icon icon-class="component" />选择型组件</div>
          <draggable
            class="components-draggable"
            :list="selectComponents"
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
            :clone="cloneComponent"
            draggable=".components-item"
            :sort="false"
            @end="onEnd"
            itemKey="formId"
          >
            <template #item="{ element, index }">
              <div class="components-item" @click="() => addComponent(element)" :key="index">
                <div class="components-body">
                  <svg-icon :icon-class="element.tagIcon" />
                  {{ element.label }}
                </div>
              </div>
            </template>
          </draggable>

          <div class="components-title"><svg-icon icon-class="component" />布局型组件</div>
          <draggable
            class="components-draggable"
            :list="layoutComponents"
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
            :clone="cloneComponent"
            draggable=".components-item"
            :sort="false"
            @end="onEnd"
            itemKey="formId"
          >
            <template #item="{ element, index }">
              <div class="components-item" @click="() => addComponent(element)" :key="index">
                <div class="components-body">
                  <svg-icon :icon-class="element.tagIcon" />
                  {{ element.label }}
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </el-scrollbar>
    </div>

    <div class="center-board">
      <div class="action-bar">
        <el-button link type="primary" icon="Download" @click="download"> 导出vue文件 </el-button>
        <el-button link type="primary" icon="Copy" @click="copy"> 复制代码 </el-button>
        <el-button class="delete-btn" link type="danger" icon="Delete" @click="empty"> 清空 </el-button>
      </div>

      <el-scrollbar class="center-scrollbar">
        <el-row class="center-board-row" :gutter="formConf.gutter">
          <el-form
            :size="formConf.size"
            :label-position="formConf.labelPosition"
            :disabled="formConf.disabled"
            :label-width="formConf.labelWidth + 'px'"
          >
            <draggable class="drawing-board" :list="drawingList" :animation="340" group="componentsGroup" itemKey="formId">
              <template #item="{ element, index }">
                <draggable-item
                  :drawing-list="drawingList"
                  :element="element"
                  :index="index"
                  :active-id="activeId"
                  :form-conf="formConf"
                  @activeItem="activeFormItem"
                  @copyItem="drawingItemCopy"
                  @deleteItem="drawingItemDelete"
                  :key="element.renderKey"
                />
              </template>
            </draggable>

            <div v-show="!drawingList.length" class="empty-info">从左侧拖入或点选组件进行表单设计</div>
          </el-form>
        </el-row>
      </el-scrollbar>
    </div>

    <right-panel :active-data="activeData" :form-conf="formConf" :show-field="!!drawingList.length" @tag-change="tagChange" />

    <code-type-dialog v-model:visible="dialogVisible" title="选择生成类型" :show-file-name="showFileName" @confirm="generate" />
    <input id="copyNode" type="hidden" />
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick } from 'vue';
import draggable from 'vuedraggable';
import beautifier from 'js-beautify';
import ClipboardJS from 'clipboard';
import render from '@/utils/generator/render';
import RightPanel from './RightPanel.vue';
import CodeTypeDialog from './CodeTypeDialog.vue';
import DraggableItem from './DraggableItem.vue';

import { inputComponents, selectComponents, layoutComponents, formConf } from '@/utils/generator/config';
import { beautifierConf, titleCase } from '@/utils/generator/index';
import { makeUpHtml, vueTemplate, vueScript, cssStyle } from '@/utils/generator/html';
import { makeUpJs } from '@/utils/generator/js';
import { makeUpCss } from '@/utils/generator/css';
import drawingDefault from '@/utils/generator/drawingDefault';
import logo from '@/assets/logo/logo.png';

let oldActiveId = null;
let tempActiveData = null;

// 响应式状态
const idGlobal = ref(100);
const formConfRef = reactive(formConf);
const inputComponentsRef = reactive(inputComponents);
const selectComponentsRef = reactive(selectComponents);
const layoutComponentsRef = reactive(layoutComponents);
const labelWidth = ref(100);
const drawingList = ref([...drawingDefault]);
const drawingData = reactive({});
const activeId = ref(drawingDefault[0].formId);
const formData = reactive({});
const dialogVisible = ref(false);
const generateConf = ref(null);
const showFileName = ref(false);
const activeData = reactive({ ...drawingDefault[0] });

// 监听 activeData.label 变化，做 placeholder 相关处理
watch(
  () => activeData.label,
  (val, oldVal) => {
    if (activeData.placeholder === undefined || !activeData.tag || oldActiveId !== activeId.value) {
      return;
    }
    activeData.placeholder = activeData.placeholder.replace(oldVal, '') + val;
  }
);

// 监听 activeId 变化
watch(
  activeId,
  (val) => {
    oldActiveId = val;
  },
  { immediate: true }
);

// 防止 firefox 下拖拽打开新标签
document.body.ondrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

function activeFormItem(element) {
  Object.assign(activeData, element);
  activeId.value = element.formId;
}

function onEnd(obj) {
  if (obj.from !== obj.to) {
    Object.assign(activeData, tempActiveData);
    activeId.value = idGlobal.value;
  }
}

function cloneComponent(origin) {
  const clone = JSON.parse(JSON.stringify(origin));
  clone.formId = ++idGlobal.value;
  clone.span = formConfRef.span;
  clone.renderKey = +new Date(); // 改变renderKey后可以实现强制更新组件
  if (!clone.layout) clone.layout = 'colFormItem';
  if (clone.layout === 'colFormItem') {
    clone.vModel = `field${idGlobal.value}`;
    if (clone.placeholder !== undefined) clone.placeholder += clone.label;
    tempActiveData = clone;
  } else if (clone.layout === 'rowFormItem') {
    delete clone.label;
    clone.componentName = `row${idGlobal.value}`;
    clone.gutter = formConfRef.gutter;
    tempActiveData = clone;
  }
  return tempActiveData;
}

function addComponent(item) {
  const clone = cloneComponent(item);
  drawingList.value.push(clone);
  activeFormItem(clone);
}

function AssembleFormData() {
  formData.fields = JSON.parse(JSON.stringify(drawingList.value));
  Object.assign(formData, formConfRef);
}

function generate(data) {
  const func = execMethods[`exec${titleCase(data.type)}`];
  generateConf.value = data;
  if (func) func(data);
}

const execMethods = {
  execDownload(data) {
    const codeStr = generateCode();
    const blob = new Blob([codeStr], { type: 'text/plain;charset=utf-8' });
    // 这里假设有全局下载方法 $download
    // 如果没有，需要自行实现下载功能
    window.$download?.saveAs(blob, data.fileName);
  },
  execCopy() {
    document.getElementById('copyNode').click();
  },
  execRun() {
    // 你之前没写这个，按需补充
  }
};

function empty() {
  if (confirm('确定要清空所有组件吗？')) {
    drawingList.value = [];
  }
}

function drawingItemCopy(item, parent) {
  let clone = JSON.parse(JSON.stringify(item));
  clone = createIdAndKey(clone);
  parent.push(clone);
  activeFormItem(clone);
}

function createIdAndKey(item) {
  item.formId = ++idGlobal.value;
  item.renderKey = +new Date();
  if (item.layout === 'colFormItem') {
    item.vModel = `field${idGlobal.value}`;
  } else if (item.layout === 'rowFormItem') {
    item.componentName = `row${idGlobal.value}`;
  }
  if (Array.isArray(item.children)) {
    item.children = item.children.map((childItem) => createIdAndKey(childItem));
  }
  return item;
}

function drawingItemDelete(index, parent) {
  parent.splice(index, 1);
  nextTick(() => {
    const len = drawingList.value.length;
    if (len) {
      activeFormItem(drawingList.value[len - 1]);
    }
  });
}

function generateCode() {
  const { type } = generateConf.value || {};
  AssembleFormData();
  const script = vueScript(makeUpJs(formData, type));
  const html = vueTemplate(makeUpHtml(formData, type));
  const css = cssStyle(makeUpCss(formData));
  return beautifier.html(html + script + css, beautifierConf.html);
}

function download() {
  dialogVisible.value = true;
  showFileName.value = true;
  operationType.value = 'download';
}

function run() {
  dialogVisible.value = true;
  showFileName.value = false;
  operationType.value = 'run';
}

function copy() {
  dialogVisible.value = true;
  showFileName.value = false;
  operationType.value = 'copy';
}

function tagChange(newTag) {
  newTag = cloneComponent(newTag);
  newTag.vModel = activeData.vModel;
  newTag.formId = activeId.value;
  newTag.span = activeData.span;

  delete activeData.tag;
  delete activeData.tagIcon;
  delete activeData.document;

  Object.keys(newTag).forEach((key) => {
    if (activeData[key] !== undefined && typeof activeData[key] === typeof newTag[key]) {
      newTag[key] = activeData[key];
    }
  });
  Object.assign(activeData, newTag);
  updateDrawingList(newTag, drawingList.value);
}

function updateDrawingList(newTag, list) {
  const index = list.findIndex((item) => item.formId === activeId.value);
  if (index > -1) {
    list.splice(index, 1, newTag);
  } else {
    list.forEach((item) => {
      if (Array.isArray(item.children)) updateDrawingList(newTag, item.children);
    });
  }
}

onMounted(() => {
  const clipboard = new ClipboardJS('#copyNode', {
    text: () => {
      const codeStr = generateCode();
      // Vue3 没有 this.$notify，建议用你项目的通知组件或第三方
      alert('代码已复制到剪切板，可粘贴。');
      return codeStr;
    }
  });

  clipboard.on('error', () => {
    alert('代码复制失败');
  });
});

// 额外的响应式变量
const operationType = ref('');
</script>

<style lang="scss">
.container {
  position: relative;
  width: 100%;
  height: 100%;
}
.left-board {
  width: 260px;
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
}
.logo-wrapper {
  position: relative;
  height: 42px;
  background: #fff;
  border-bottom: 1px solid #f1e8e8;
  box-sizing: border-box;
}
.logo {
  position: absolute;
  left: 12px;
  top: 6px;
  line-height: 30px;
  color: #00afff;
  font-weight: 600;
  font-size: 17px;
  white-space: nowrap;
  > img {
    width: 30px;
    height: 30px;
    vertical-align: top;
  }
  .github {
    display: inline-block;
    vertical-align: sub;
    margin-left: 15px;
    > img {
      height: 22px;
    }
  }
}

.left-scrollbar {
  height: calc(100vh - 42px);
  overflow: hidden;
}
.left-scrollbar .el-scrollbar__wrap {
  box-sizing: border-box;
  overflow-x: hidden !important;
  margin-bottom: 0 !important;
}
.left-scrollbar .el-scrollbar__view {
  overflow-x: hidden;
}

.editor-tabs {
  background: #121315;
  .el-tabs__header {
    margin: 0;
    border-bottom-color: #121315;
    .el-tabs__nav {
      border-color: #121315;
    }
  }
  .el-tabs__item {
    height: 32px;
    line-height: 32px;
    color: #888a8e;
    border-left: 1px solid #121315 !important;
    background: #363636;
    margin-right: 5px;
    user-select: none;
  }
  .el-tabs__item.is-active {
    background: #1e1e1e;
    border-bottom-color: #1e1e1e !important;
    color: #fff;
  }
  .el-icon-edit {
    color: #f1fa8c;
  }
  .el-icon-document {
    color: #a95812;
  }
}

// home
.right-scrollbar {
  .el-scrollbar__view {
    padding: 12px 18px 15px 15px;
  }
}

.center-tabs {
  .el-tabs__header {
    margin-bottom: 0 !important;
  }
  .el-tabs__item {
    width: 50%;
    text-align: center;
  }
  .el-tabs__nav {
    width: 100%;
  }
}
.reg-item {
  padding: 12px 6px;
  background: #f8f8f8;
  position: relative;
  border-radius: 4px;
  .close-btn {
    position: absolute;
    right: -6px;
    top: -6px;
    display: block;
    width: 16px;
    height: 16px;
    line-height: 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    color: #fff;
    text-align: center;
    z-index: 1;
    cursor: pointer;
    font-size: 12px;
    &:hover {
      background: rgba(210, 23, 23, 0.5);
    }
  }
  & + .reg-item {
    margin-top: 18px;
  }
}
.action-bar {
  & .el-button {
    margin-top: 12px;
  }
  & .el-button + .el-button {
    margin-left: 15px;
  }
  & i {
    font-size: 20px;
    vertical-align: middle;
    position: relative;
    top: -1px;
  }
}

.custom-tree-node {
  width: 100%;
  font-size: 14px;
  .node-operation {
    float: right;
  }
  i[class*='el-icon'] + i[class*='el-icon'] {
    margin-left: 6px;
  }
  .el-icon-plus {
    color: #409eff;
  }
  .el-icon-delete {
    color: #157a0c;
  }
}

.el-rate {
  display: inline-block;
  vertical-align: text-top;
}
.el-upload__tip {
  line-height: 1.2;
}

$selectedColor: #f6f7ff;
$lighterBlue: #409eff;

.components-list {
  padding: 8px;
  box-sizing: border-box;
  height: 100%;
  .components-item {
    display: inline-block;
    width: 48%;
    margin: 1%;
    transition: transform 0ms !important;
  }
}
.components-draggable {
  padding-bottom: 20px;
}
.components-title {
  font-size: 14px;
  color: #222;
  margin: 6px 2px;
  .svg-icon {
    color: #666;
    font-size: 18px;
  }
}

.components-body {
  padding: 8px 10px;
  background: $selectedColor;
  font-size: 12px;
  cursor: move;
  border: 1px dashed $selectedColor;
  border-radius: 3px;
  .svg-icon {
    color: #777;
    font-size: 15px;
  }
  &:hover {
    border: 1px dashed #787be8;
    color: #787be8;
    .svg-icon {
      color: #787be8;
    }
  }
}

.center-scrollbar {
  height: calc(100vh - 42px);
  overflow: hidden;
  border-left: 1px solid #f1e8e8;
  border-right: 1px solid #f1e8e8;
  box-sizing: border-box;
}
.center-board {
  height: 100vh;
  width: auto;
  margin: 0 350px 0 260px;
  box-sizing: border-box;
}
.empty-info {
  position: absolute;
  top: 46%;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 18px;
  color: #ccb1ea;
  letter-spacing: 4px;
}
.action-bar {
  position: relative;
  height: 42px;
  text-align: right;
  padding: 0 15px;
  box-sizing: border-box;
  border: 1px solid #f1e8e8;
  border-top: none;
  border-left: none;
  color: $lighterBlue;
}

.center-board-row {
  padding: 12px 12px 15px 12px;
  box-sizing: border-box;
  & > .el-form {
    // 69 = 12+15+42
    height: calc(100vh - 69px);
  }
}
.drawing-board {
  height: 100%;
  position: relative;
  .components-body {
    padding: 0;
    margin: 0;
    font-size: 0;
  }
  .sortable-ghost {
    position: relative;
    display: block;
    overflow: hidden;
    &::before {
      content: ' ';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 3px;
      background: rgb(89, 89, 223);
      z-index: 2;
    }
  }
  .components-item.sortable-ghost {
    width: 100%;
    height: 60px;
    background-color: $selectedColor;
  }
  .active-from-item {
    & > .el-form-item {
      background: $selectedColor;
      border-radius: 6px;
    }
    & > .drawing-item-copy,
    & > .drawing-item-delete {
      display: initial;
    }
    & > .component-name {
      color: $lighterBlue;
    }
  }
  .el-form-item {
    margin-bottom: 15px;
  }
}
.drawing-item {
  position: relative;
  cursor: move;
  &.unfocus-bordered:not(.activeFromItem) > div:first-child {
    border: 1px dashed #ccc;
  }
  .el-form-item {
    padding: 12px 10px;
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
  }
  &.active-from-item {
    border: 1px dashed $lighterBlue;
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
}
.drawing-item,
.drawing-row-item {
  &:hover {
    & > .el-form-item {
      background: $selectedColor;
      border-radius: 6px;
    }
    & > .drawing-item-copy,
    & > .drawing-item-delete {
      display: initial;
    }
  }
  & > .drawing-item-copy,
  & > .drawing-item-delete {
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
  & > .drawing-item-copy {
    right: 56px;
    border-color: $lighterBlue;
    color: $lighterBlue;
    background: #fff;
    &:hover {
      background: $lighterBlue;
      color: #fff;
    }
  }
  & > .drawing-item-delete {
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
</style>
