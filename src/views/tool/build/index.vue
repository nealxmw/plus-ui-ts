<template>
  <fc-designer ref="designer" :config="config" />
</template>
<script setup>
// 可以在此处获取设计器实例或进行其他操作
// const designer = ref(null);
const config = {
  formOptions: {
    form: {
      size: 'default' // 设置默认尺寸
    }
  },
  appendConfigData: ['formCreateMark'],
  formRule: {
    prepend: true,
    // append: true, // 添加到底部
    rule() {
      return [
        {
          type: 'input',
          //配置名称, 修改 options.mark
          field: 'formCreateMark',
          title: '表单备注'
        }
      ];
    }
  }
};
</script>

<style lang="scss">
.el-divider__text {
  font-size: 12px;
  padding: 0 12px;
}
.el-badge {
  .fc-icon {
    font-size: 14px;
  }
}
</style>