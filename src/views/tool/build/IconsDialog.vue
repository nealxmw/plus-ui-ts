<template>
  <div class="icon-dialog">
    <el-dialog v-bind="$attrs" width="980px" :modal-append-to-body="false" @open="onOpen" @close="onClose">
      <template #header>
        选择图标
        <el-input v-model="key" size="mini" :style="{ width: '260px' }" placeholder="请输入图标名称" prefix-icon="el-icon-search" clearable />
      </template>

      <ul class="icon-ul">
        <li v-for="icon in iconList" :key="icon" :class="active === icon ? 'active-item' : ''" @click="onSelect(icon)">
          <i :class="icon" />
          <div>{{ icon }}</div>
        </li>
      </ul>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import iconListJson from '@/utils/generator/icon.json';

const originList = iconListJson.map((name: string) => `el-icon-${name}`);

const props = defineProps<{ current?: string | null }>();

const emit = defineEmits(['select', 'update:visible']);

const active = ref<string | null>(null);
const key = ref('');
const iconList = ref<string[]>(originList);

watch(key, (val) => {
  if (val) {
    iconList.value = originList.filter((name) => name.includes(val));
  } else {
    iconList.value = originList;
  }
});

function onOpen() {
  active.value = props.current ?? null;
  key.value = '';
}

function onClose() {
  // 这里你可以根据需求处理关闭逻辑
}

function onSelect(icon: string) {
  active.value = icon;
  emit('select', icon);
  emit('update:visible', false);
}
</script>

<style lang="scss" scoped>
.icon-ul {
  margin: 0;
  padding: 0;
  font-size: 0;
  li {
    list-style-type: none;
    text-align: center;
    font-size: 14px;
    display: inline-block;
    width: 16.66%;
    box-sizing: border-box;
    height: 108px;
    padding: 15px 6px 6px 6px;
    cursor: pointer;
    overflow: hidden;
    &:hover {
      background: #f2f2f2;
    }
    &.active-item {
      background: #e1f3fb;
      color: #7a6df0;
    }
    > i {
      font-size: 30px;
      line-height: 50px;
    }
  }
}
.icon-dialog {
  ::v-deep .el-dialog {
    border-radius: 8px;
    margin-bottom: 0;
    margin-top: 4vh !important;
    display: flex;
    flex-direction: column;
    max-height: 92vh;
    overflow: hidden;
    box-sizing: border-box;
    .el-dialog__header {
      padding-top: 14px;
    }
    .el-dialog__body {
      margin: 0 20px 20px 20px;
      padding: 0;
      overflow: auto;
    }
  }
}
</style>
