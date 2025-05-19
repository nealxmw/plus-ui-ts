<template>
  <div class="p-2">
    <!-- 搜索 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="searchRef" :model="queryParams" :inline="true">
            <el-form-item label="场景名称" prop="sceneName">
              <el-input v-model="queryParams.sceneName" placeholder="请输入场景名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="场景标识" prop="sceneCode">
              <el-input v-model="queryParams.sceneCode" placeholder="请输入场景标识" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>
    <el-card shadow="hover">
      <!-- 操作 -->
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['contract:scene:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>
      <!-- 列表 -->
      <el-table v-loading="loading" :data="typeList">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="编号" align="center" prop="id" />
        <el-table-column label="场景标识" align="center" prop="sceneCode" :show-overflow-tooltip="true" />
        <el-table-column label="场景名称" align="center" prop="sceneName" :show-overflow-tooltip="true" />
        <el-table-column label="版本号" align="center" prop="sceneVersion" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center" prop="isEnable" :show-overflow-tooltip="true">
          <template #default="scope">
            <el-switch v-model="scope.row.isEnable" :active-value="true" :inactive-value="false" disabled></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看" placement="left">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="编辑" placement="right">
              <el-button v-hasPermi="['contract:scene:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 新增 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="80%" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" :disabled="dialogType === 'view'">
        <el-form-item label="场景标识" prop="sceneCode">
          <el-input v-model="form.sceneCode" placeholder="请输入场景标识" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="场景名称" prop="sceneName">
          <el-input v-model.number="form.sceneName" placeholder="请输入场景名称" />
        </el-form-item>
        <el-form-item label="版本号" prop="sceneVersion">
          <el-input v-model.number="form.sceneVersion" placeholder="请输入版本号" />
        </el-form-item>
        <el-form-item label="状态" prop="isEnable">
          <el-switch v-model="form.isEnable" :active-value="true" :inactive-value="false"></el-switch>
        </el-form-item>

        <el-form-item label="关联模板" prop="templateInfoList">
          <el-select
            v-model="form.template"
            filterable
            :multiple="true"
            placeholder="请选择关联模版"
            style="width: 100%"
            @visible-change="updateTemplates"
            @change="templateChange"
          >
            <el-option v-for="item in templates" :key="item.id" :label="item.templateName" :value="item.id"></el-option>
            <template #prefix><svg-icon icon-class="dict" class="el-input__icon input-icon" /></template>
          </el-select>
          <div v-if="form.templateInfoList?.length > 0" style="width: 100%">
            <div>关联模板配置:</div>
            <el-table :data="form.templateInfoList" border>
              <el-table-column v-if="false" label="编号" align="center" prop="id" />
              <el-table-column label="合同标识" align="center" prop="templateCode" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column label="合同名称" align="center" prop="templateName" :show-overflow-tooltip="true">
                <template #default="scope">
                  <el-input v-model="scope.row.templateName"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="排序" align="center" prop="sortOrder" :show-overflow-tooltip="true">
                <template #default="scope">
                  <el-input v-model.number="scope.row.sortOrder"></el-input>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <el-form-item label="签约流程配置" prop="flowConfig">
          <el-form ref="configRef" :model="form.flowConfig" label-width="100px" :disabled="dialogType === 'view'" style="width: 100%">
            <el-form-item label="重定向地址" prop="redirectUrl">
              <el-input v-model="form.flowConfig.redirectUrl" placeholder="请输入重定向地址" />
            </el-form-item>
            <el-form-item label="意愿认证方式" prop="willTypes">
              <el-select v-model="form.flowConfig.willTypes" filterable :multiple="true" placeholder="请选择意愿认证方式" style="width: 100%">
                <el-option v-for="item in willTypes" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="个人实名认证方式" prop="psnAvailableAuthModes">
              <el-select
                v-model="form.flowConfig.psnAvailableAuthModes"
                filterable
                :multiple="true"
                placeholder="请选择个人实名认证方式"
                style="width: 100%"
              >
                <el-option v-for="item in psnAvailableAuthModes" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="机构实名认证方式" prop="orgAvailableAuthModes">
              <el-select
                v-model="form.flowConfig.orgAvailableAuthModes"
                filterable
                :multiple="true"
                placeholder="请选择机构实名认证方式"
                style="width: 100%"
              >
                <el-option v-for="item in orgAvailableAuthModes" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="签约回调地址" prop="noticeDeveloperUrl">
              <el-input v-model="form.flowConfig.noticeDeveloperUrl" placeholder="请输入签约完成回调地址" />
            </el-form-item>
          </el-form>
        </el-form-item>
      </el-form>
      <template #footer v-if="dialogType !== 'view'">
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Scene" lang="ts">
import { pageList, detail, add, update } from '@/api/contract/scene/index';
import { Form, Query, Record } from '@/api/contract/scene/types';
import { templateList } from '@/api/contract/template/index';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const showSearch = ref(true);
const typeList = ref<Record[]>([]);
const loading = ref(true);
const total = ref(0);
const templates = ref([]); // 关联模板 所有列表
const willTypes = ref([
  { label: '短信验证码', value: 'CODE_SMS' },
  { label: '支付宝刷脸', value: 'PSN_FACE_ALIPAY' },
  { label: '快捷刷脸', value: 'PSN_FACE_ESIGN' },
  { label: '微信小程序刷脸（仅限微信小程序中使用）', value: 'PSN_FACE_WECHAT' },
  { label: '签署密码', value: 'SIGN_PWD' }
]);
const psnAvailableAuthModes = ref([
  { label: '个人运营商三要素认证', value: 'PSN_MOBILE3' },
  { label: '刷脸认证', value: 'PSN_FACE' },
  { label: '个人银行卡四要素认证', value: 'PSN_BANKCARD4' }
]);
const orgAvailableAuthModes = ref([
  { label: '对公打款认证', value: 'ORG_BANK_TRANSFER' },
  { label: '法人快捷认证', value: 'ORG_ALIPAY_CREDIT' },
  { label: '法人授权认证', value: 'ORG_LEGALREP_AUTHORIZATION' },
  { label: '法定代表人认证', value: 'ORG_LEGALREP' }
]);

const searchRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();
const configRef = ref<ElFormInstance>();

// 新增/查看/编辑
const dialogType = ref('view');
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 表单结构
const initFormData: Form = {
  id: null,
  sceneName: '',
  sceneCode: '',
  sceneVersion: null,
  isEnable: false,
  template: [],
  templateInfoList: [], // 关联模版
  flowConfig: {
    redirectUrl: '',
    willTypes: [],
    psnAvailableAuthModes: [],
    orgAvailableAuthModes: [],
    noticeDeveloperUrl: ''
  } // 签约流程配置
};
const data = reactive<PageData<Form, Query>>({
  form: { ...initFormData },
  // 搜索参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sceneName: '',
    sceneCode: ''
  },
  // 表单检验
  rules: {
    sceneCode: [{ required: true, message: '场景标识不能为空', trigger: 'blur' }],
    sceneName: [{ required: true, message: '场景名称不能为空', trigger: 'blur' }],
    sceneVersion: [{ required: true, message: '版本号不能为空', trigger: 'blur' }]
  }
});
const { queryParams, form, rules } = toRefs(data);

/** 查询模板列表 */
const getTemplateList = () => {
  templateList({}).then((res) => {
    templates.value = res.data;
  });
};
/** 查询场景列表 */
const getList = () => {
  loading.value = true;
  pageList(queryParams.value).then((res) => {
    typeList.value = res.data.records;
    total.value = res.data.total;
    loading.value = false;
  });
};
/** 搜索按钮 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮 */
const resetQuery = () => {
  searchRef.value?.resetFields();
  handleQuery();
};

/** 新增按钮 */
const handleAdd = () => {
  reset();
  dialogType.value = 'add';
  dialog.visible = true;
  dialog.title = '添加场景';
};

// 关联模板
// 模板数据更新
const updateTemplates = (value) => {
  value && getTemplateList();
};
// 模板选择
const templateChange = (value) => {
  // 渲染
  let list = [];
  value.forEach((id) => {
    templates.value.forEach((item) => {
      if (id === item.id) {
        let temp = {
          id: item.id,
          templateCode: item.templateCode,
          templateName: item.templateName,
          sortOrder: null
        };
        list.push(temp);
      }
    });
  });
  // 赋值
  form.value.templateInfoList &&
    form.value.templateInfoList.length > 0 &&
    list.forEach((item) => {
      form.value.templateInfoList.forEach((_item) => {
        if (item.id === _item.id) {
          item.templateCode = _item.templateCode || '';
          item.templateName = _item.templateName || '';
          item.sortOrder = _item.sortOrder || null;
        }
      });
    });
  form.value.templateInfoList = list;
};

/** 查看操作 */
const handleView = async (row?: Record) => {
  reset();
  const dictId = row?.id;
  const res = await detail(dictId);
  Object.assign(form.value, res.data);
  // 关联模版 信息转化
  const templates = [];
  form.value.templateInfoList &&
    form.value.templateInfoList.length > 0 &&
    form.value.templateInfoList.forEach((item) => {
      templates.push(item.id);
    });
  form.value.template = templates;

  dialogType.value = 'view';
  dialog.visible = true;
  dialog.title = '场景详情';
};
/** 修改操作 */
const handleUpdate = async (row?: Record) => {
  reset();
  const dictId = row?.id;
  const res = await detail(dictId);
  Object.assign(form.value, res.data);
  // 关联模版 信息转化
  const templates = [];
  form.value.templateInfoList &&
    form.value.templateInfoList.length > 0 &&
    form.value.templateInfoList.forEach((item) => {
      templates.push(item.id);
    });
  form.value.template = templates;

  dialogType.value = 'edit';
  dialog.visible = true;
  dialog.title = '场景信息修改';
};

/** 表单提交 */
const submitForm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      let formParams = JSON.parse(JSON.stringify(form.value));
      // 关联模版
      delete formParams.template;
      formParams.id ? await update(formParams) : await add(formParams);
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      getList();
    }
  });
};
/** 表单取消 */
const cancel = () => {
  reset();
  dialog.visible = false;
};
/** 表单重置 */
const reset = () => {
  formRef.value?.resetFields();
  configRef.value?.resetFields();
  form.value = { ...initFormData };
};

onMounted(() => {
  getList();
  getTemplateList();
});
</script>
