<template>
  <el-dialog
    v-bind="attrs"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    @open="onOpen"
    @close="onClose"
  >
    <template #header>
      <slot name="title">编辑节点</slot>
    </template>

    <el-row :gutter="0">
      <el-form ref="formRef" :model="formData" :rules="rules" size="small" label-width="100px">
        <el-col :span="24">
          <el-form-item label="选项名" prop="label">
            <el-input v-model="formData.label" placeholder="请输入选项名" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="选项值" prop="value">
            <el-input v-model="formData.value" placeholder="请输入选项值" clearable @keyup.enter="handleConfirm">
              <template #append>
                <el-select v-model="dataType" :style="{ width: '100px' }">
                  <el-option v-for="(item, index) in dataTypeOptions" :key="index" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-form>
    </el-row>

    <template #footer>
      <el-button type="primary" @click="handleConfirm"> 确定 </el-button>
      <el-button @click="closeDialog"> 取消 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, useAttrs } from 'vue';
import { isNumberStr } from '@/utils/generator/index';
import type { FormInstance, FormRules } from 'element-plus';

// 定义属性
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'commit', 'close']);

// 获取非属性特性
const attrs = useAttrs();

// 表单引用
const formRef = ref<FormInstance | null>(null);

// 表单数据
const formData = reactive({
  label: '',
  value: ''
});

// 表单验证规则
const rules = reactive<FormRules>({
  label: [{ required: true, message: '请输入选项名', trigger: 'blur' }],
  value: [{ required: true, message: '请输入选项值', trigger: 'blur' }]
});

// 数据类型选项
const dataType = ref('string');
const dataTypeOptions = ref([
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' }
]);

// ID 计数器
const idCounter = ref(100);

// 监听选项值变化
watch(
  () => formData.value,
  (newVal) => {
    dataType.value = isNumberStr(newVal) ? 'number' : 'string';
  }
);

// 打开对话框时的处理
const onOpen = () => {
  resetForm();
};

// 关闭对话框时的处理
const onClose = () => {
  // 可以添加清理逻辑
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

// 重置表单
const resetForm = () => {
  formData.label = '';
  formData.value = '';
  dataType.value = 'string';
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 确认操作
const handleConfirm = async () => {
  if (!formRef.value) return;

  try {
    const valid = await formRef.value.validate();
    if (!valid) return;

    const data = {
      ...formData,
      id: idCounter.value++
    };

    if (dataType.value === 'number') {
      data.value = parseFloat(data.value);
    }

    emit('commit', data);
    closeDialog();
  } catch (error) {
    // 验证失败
  }
};

// 暴露方法供父组件调用
defineExpose({
  resetForm
});
</script>

<style scoped>
.el-input-group__append {
  padding: 0;
}
</style>
