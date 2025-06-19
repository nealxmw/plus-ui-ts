<template>
  <el-dialog v-bind="$attrs" :close-on-click-modal="false" :modal-append-to-body="false" @open="onOpen" @close="onClose">
    <el-row :gutter="0">
      <el-form ref="elForm" :model="formData" :rules="rules" size="small" label-width="100px">
        <el-col :span="24">
          <el-form-item label="选项名" prop="label">
            <el-input v-model="formData.label" placeholder="请输入选项名" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="选项值" prop="value">
            <el-input v-model="formData.value" placeholder="请输入选项值" clearable>
              <template #append>
                <el-select v-model="dataType" style="width: 100px">
                  <el-option v-for="item in dataTypeOptions" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-form>
    </el-row>

    <template #footer>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
      <el-button @click="close">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { isNumberStr } from '@/utils/generator/index';

const emit = defineEmits(['update:visible', 'commit']);

const id = ref(100);

const formData = reactive({
  label: '',
  value: null
});

const rules = {
  label: [
    {
      required: true,
      message: '请输入选项名',
      trigger: 'blur'
    }
  ],
  value: [
    {
      required: true,
      message: '请输入选项值',
      trigger: 'blur'
    }
  ]
};

const dataType = ref<'string' | 'number'>('string');

const dataTypeOptions = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' }
];

const elForm = ref();

watch(
  () => formData.value,
  (val) => {
    dataType.value = isNumberStr(val) ? 'number' : 'string';
  }
);

function onOpen() {
  formData.label = '';
  formData.value = '';
  dataType.value = 'string';
}

function onClose() {}

function close() {
  emit('update:visible', false);
}

function handleConfirm() {
  if (!elForm.value) return;
  elForm.value.validate((valid: boolean) => {
    if (!valid) return;

    if (dataType.value === 'number') {
      formData.value = parseFloat(formData.value);
    }

    const commitData = { ...formData, id: id.value++ };
    emit('commit', commitData);
    close();
  });
}
</script>
