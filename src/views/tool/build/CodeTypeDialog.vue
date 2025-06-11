<template>
  <el-dialog
    v-bind="attrs"
    width="500px"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    @open="onOpen"
  >
    <template #header>
      <slot name="title">{{ title }}</slot>
    </template>

    <el-row :gutter="15">
      <el-form ref="formRef" :model="formData" :rules="rules" size="medium" label-width="100px">
        <el-col :span="24">
          <el-form-item label="生成类型" prop="type">
            <el-radio-group v-model="formData.type">
              <el-radio-button v-for="(item, index) in typeOptions" :key="index" :label="item.value" :disabled="item.disabled">
                {{ item.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="showFileName" label="文件名" prop="fileName">
            <el-input v-model="formData.fileName" placeholder="请输入文件名" clearable @keyup.enter="handleConfirm" />
          </el-form-item>
        </el-col>
      </el-form>
    </el-row>

    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, useAttrs } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

// 定义属性
const props = defineProps({
  modelValue: Boolean,
  showFileName: Boolean,
  title: {
    type: String,
    default: '选择生成类型'
  }
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'confirm', 'close']);

// 获取非属性特性
const attrs = useAttrs();

// 表单引用
const formRef = ref<FormInstance | null>(null);

// 表单数据
const formData = reactive({
  fileName: '',
  type: 'file'
});

// 表单验证规则
const rules = computed<FormRules>(() => ({
  fileName: props.showFileName ? [{ required: true, message: '请输入文件名', trigger: 'blur' }] : [],
  type: [{ required: true, message: '请选择生成类型', trigger: 'change' }]
}));

// 类型选项
const typeOptions = ref([
  { label: '页面', value: 'file' },
  { label: '弹窗', value: 'dialog' }
]);

// 打开对话框时的处理
const onOpen = () => {
  if (props.showFileName) {
    formData.fileName = `${Date.now()}.vue`;
  }
};

// 关闭对话框
const closeDialog = () => {
  emit('update:modelValue', false);
  emit('close');
};

// 更新 modelValue
const updateModelValue = (value: boolean) => {
  emit('update:modelValue', value);
};

// 确认操作
const handleConfirm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    emit('confirm', { ...formData });
    closeDialog();
  } catch (error) {
    // 验证失败
  }
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 当对话框关闭时重置表单
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      resetForm();
    }
  }
);

// 暴露方法供父组件调用
defineExpose({
  resetForm
});
</script>

<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 18px;
}

.el-radio-group {
  width: 100%;
}

.el-radio-button {
  flex: 1;
  text-align: center;

  :deep(.el-radio-button__inner) {
    width: 100%;
  }
}
</style>
