<template>
  <div class="icon-dialog">
    <el-dialog
      v-bind="attrs"
      width="980px"
      :modal-append-to-body="false"
      :model-value="modelValue"
      @update:model-value="updateVisible"
      @open="onOpen"
      @close="onClose"
    >
      <template #header>
        <div class="dialog-title">
          选择图标
          <el-input v-model="searchKey" size="small" :style="{ width: '260px' }" placeholder="请输入图标名称" clearable>
            <template #prefix>
              <el-icon><search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>

      <ul class="icon-ul">
        <li v-for="icon in filteredIcons" :key="icon" :class="activeIcon === icon ? 'active-item' : ''" @click="onSelect(icon)">
          <el-icon>
            <component :is="getIconComponent(icon)" />
          </el-icon>
          <div>{{ icon }}</div>
        </li>
      </ul>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useAttrs } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { Search } from '@element-plus/icons-vue';

// 定义属性
const props = defineProps({
  modelValue: Boolean,
  current: String
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'select']);

// 获取非属性特性
const attrs = useAttrs();

// 图标数据
const iconList = Object.keys(ElementPlusIconsVue).map((name) => name);

// 响应式状态
const activeIcon = ref('');
const searchKey = ref('');
const filteredIcons = computed(() => {
  if (!searchKey.value) return iconList;
  return iconList.filter((name) => name.toLowerCase().includes(searchKey.value.toLowerCase()));
});

// 获取图标组件
const getIconComponent = (iconName: string) => {
  return ElementPlusIconsVue[iconName as keyof typeof ElementPlusIconsVue];
};

// 打开对话框时的处理
const onOpen = () => {
  activeIcon.value = props.current || '';
  searchKey.value = '';
};

// 关闭对话框时的处理
const onClose = () => {
  // 可以添加清理逻辑
};

// 选择图标
const onSelect = (icon: string) => {
  activeIcon.value = icon;
  emit('select', icon);
  emit('update:modelValue', false);
};

// 更新可见状态
const updateVisible = (value: boolean) => {
  emit('update:modelValue', value);
};
</script>

<style lang="scss" scoped>
.icon-ul {
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;

  li {
    list-style-type: none;
    text-align: center;
    font-size: 14px;
    padding: 15px 6px 6px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;
    overflow: hidden;

    &:hover {
      background: #f5f7fa;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &.active-item {
      background: #ecf5ff;
      color: #409eff;
      border: 1px solid #409eff;
    }

    .el-icon {
      font-size: 24px;
      margin-bottom: 8px;
      display: block;
    }

    div {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.icon-dialog {
  .dialog-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 20px;
  }

  :deep(.el-dialog) {
    border-radius: 8px;
    margin-top: 5vh !important;
    display: flex;
    flex-direction: column;
    max-height: 85vh;
    overflow: hidden;
    box-sizing: border-box;

    .el-dialog__header {
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
    }

    .el-dialog__body {
      margin: 0 20px 20px;
      padding: 15px 0 0;
      overflow: auto;
    }
  }
}
</style>
