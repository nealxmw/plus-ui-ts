<template>
  <div class="p-2">
    <!-- 搜索 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="searchRef" :model="queryParams" :inline="true">
            <el-form-item label="合同名称" prop="templateName">
              <el-input v-model="queryParams.templateName" placeholder="请输入合同名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="合同标识" prop="templateCode">
              <el-input v-model="queryParams.templateCode" placeholder="请输入合同标识" clearable @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['contract:template:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>
      <!-- 列表 -->
      <el-table v-loading="loading" :data="typeList">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="编号" align="center" prop="id" />
        <el-table-column label="合同Code" align="center" prop="templateCode" :show-overflow-tooltip="true" />
        <el-table-column label="合同名称" align="center" prop="templateName" :show-overflow-tooltip="true" />
        <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看" placement="left">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="编辑" placement="right">
              <el-button v-hasPermi="['contract:template:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 新增模板 -->
    <el-dialog v-if="isShowDialog" v-model="dialog.visible" :title="dialog.title" width="80%" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" :disabled="dialogType === 'view'">
        <el-form-item label="合同标识" prop="templateCode">
          <el-input v-model="form.templateCode" placeholder="请输入合同标识" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="合同名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="请输入合同名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入描述" />
        </el-form-item>
        <!-- 合同配置 -->
        <el-form-item label="合同配置" prop="contractConfig">
          <el-select v-model="form.platform" filterable :multiple="true" placeholder="请选择平台" style="width: 100%" @change="platformChange">
            <el-option v-for="item in platforms" :key="item.value" :label="item.label" :value="item.value"></el-option>
            <template #prefix><svg-icon icon-class="company" class="el-input__icon input-icon" /></template>
          </el-select>
          <div v-if="form.contractConfig?.templateIdConfig.length > 0" style="width: 100%">
            <div>模版id配置:</div>
            <el-table :data="form.contractConfig.templateIdConfig" border>
              <el-table-column label="平台" align="center" prop="channel" :show-overflow-tooltip="true">
                <template #default="scope">
                  {{ platformName(scope.row.channel) }}
                </template>
              </el-table-column>
              <el-table-column label="模板ID" align="center" prop="templateId" :show-overflow-tooltip="true">
                <template #default="scope">
                  <el-input v-model="scope.row.templateId"></el-input>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
        <!-- 合同签署方 -->
        <el-form-item label="合同签署方" prop="signatoryConfig">
          <div>
            <el-button type="primary" size="small" v-if="dialogType !== 'view'" @click="signatoryAdd">添加合同签署方</el-button>
          </div>
          <!-- 个人/企业 -->
          <div v-for="(config, index) in form.signatoryConfig" :key="index" style="margin: 12px 0 12px; width: 100%">
            <el-form :model="config" label-width="120px" :disabled="dialogType === 'view'" border>
              <el-form-item label="签署类型" prop="signType">
                <el-select v-model="config.signType" filterable placeholder="请选择签署类型" disabled style="width: 100%">
                  <el-option v-for="item in ['个人', '企业']" :key="item" :label="item" :value="item"></el-option>
                </el-select>
              </el-form-item>

              <!-- 签署人配置 -->
              <el-form-item v-if="config.signType === '个人'" prop="personConfigType">
                <template #label>
                  <span>
                    签署人类型
                    <el-tooltip placement="top">
                      <template #content>
                        <div>
                          固定: 使用填写的值<br />
                          动态: 填写key, 后续会根据key去请求参数中获取对应的值
                        </div>
                      </template>
                      <span
                        style="
                          text-align: center;
                          line-height: 16px;
                          display: inline-block;
                          width: 16px;
                          height: 16px;
                          border-radius: 50%;
                          font-size: 14px;
                          background: #e6a23c;
                          color: #fff;
                        "
                      >
                        ?
                      </span>
                    </el-tooltip>
                  </span>
                </template>
                <el-select v-model="config.personConfigType" filterable placeholder="请选择签署人类型" style="width: 100%">
                  <el-option v-for="item in ['固定', '动态']" :key="item" :label="item" :value="item"></el-option>
                </el-select>
                <div>签署人配置:</div>
                <el-form :model="config.personConfig" label-width="120px" :disabled="dialogType === 'view'" border style="width: 100%">
                  <el-form-item label="姓名" prop="name">
                    <el-input v-model="config.personConfig.name" placeholder="请输入姓名" style="width: 100%"></el-input>
                  </el-form-item>
                  <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="config.personConfig.mobile" placeholder="请输入手机号" style="width: 100%"></el-input>
                  </el-form-item>
                  <el-form-item label="身份证号" prop="idNo">
                    <el-input v-model="config.personConfig.idNo" placeholder="请输入身份证号" style="width: 100%"></el-input>
                  </el-form-item>
                </el-form>
              </el-form-item>

              <el-form-item label="签署顺序" prop="signOrder">
                <el-input v-model="config.signOrder" placeholder="请输入签署顺序" style="width: 100%"></el-input>
              </el-form-item>
              <el-form-item label="签署位置" prop="signPosType">
                <el-select v-model="config.signPosType" filterable placeholder="请选择签署位置" style="width: 100%">
                  <el-option v-for="item in ['关键字', '页码']" :key="item" :label="item" :value="item"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="页码" v-if="config.signPosType === '页码'" prop="keywordPos">
                <el-input v-model="config.keywordPos" placeholder="请输入页码" style="width: 100%"></el-input>
              </el-form-item>
              <el-form-item label="关键字" v-else prop="keywordPos">
                <el-input v-model="config.keywordPos" placeholder="请输入关键字" style="width: 100%"></el-input>
              </el-form-item>
              <el-form-item label="X偏移量" prop="posX">
                <el-input v-model="config.posX" placeholder="请输入X偏移量" style="width: 100%"></el-input>
              </el-form-item>
              <el-form-item label="Y偏移量" prop="posY">
                <el-input v-model="config.posY" placeholder="请输入Y偏移量" style="width: 100%"></el-input>
              </el-form-item>
              <el-form-item v-if="config.signType === '个人'" label="签名方式" prop="signMethod">
                <el-select v-model="config.signMethod" filterable placeholder="请选择签名方式" style="width: 100%">
                  <el-option v-for="item in ['手绘签名', '模板印章签名']" :key="item" :label="item" :value="item"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-if="config.signType === '企业'" label="是否骑缝章" prop="across">
                <el-select v-model="config.across" filterable placeholder="请选择是否骑缝章" style="width: 100%">
                  <el-option
                    v-for="item in [
                      { label: '是', value: true },
                      { label: '否', value: false }
                    ]"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-if="config.signType === '企业' && config.across" label="骑缝章偏移量" prop="acrossPosY">
                <el-input v-model="config.acrossPosY" placeholder="请输入骑缝章偏移量" style="width: 100%"></el-input>
              </el-form-item>

              <!-- 公章配置 -->
              <el-form-item v-if="config.signType === '企业'" prop="sealConfigType">
                <template #label>
                  <span>
                    公章类型
                    <el-tooltip placement="top">
                      <template #content>
                        <div>
                          指定: 使用填写的章ID<br />
                          项目公司: 填写key, 后续会根据key去请求参数中获取对应的值
                        </div>
                      </template>
                      <span
                        style="
                          text-align: center;
                          line-height: 16px;
                          display: inline-block;
                          width: 16px;
                          height: 16px;
                          border-radius: 50%;
                          font-size: 14px;
                          background: #e6a23c;
                          color: #fff;
                        "
                      >
                        ?
                      </span>
                    </el-tooltip>
                  </span>
                </template>
                <el-select v-model="config.sealConfigType" filterable placeholder="请选择公章类型" style="width: 100%">
                  <el-option v-for="item in ['指定', '项目公司']" :key="item" :label="item" :value="item"></el-option>
                </el-select>
                <div>公章配置:</div>
                <el-form :model="config.sealConfig" label-width="120px" :disabled="dialogType === 'view'" border style="width: 100%">
                  <el-form-item v-if="config.sealConfigType === '指定'" label="章ID" prop="sealId">
                    <el-input v-model="config.sealConfig.sealId" placeholder="请输入章ID" style="width: 100%"></el-input>
                  </el-form-item>
                  <el-form-item v-if="config.sealConfigType === '项目公司'" label="项目公司配置" prop="projectCompany">
                    <el-input v-model="config.sealConfig.projectCompany" placeholder="请输入项目公司配置" style="width: 100%"></el-input>
                  </el-form-item>
                </el-form>
              </el-form-item>

              <el-form-item v-if="config.signType === '企业'" label="是否自动签署" prop="autoExecute">
                <el-select v-model="config.autoExecute" filterable placeholder="请选择是否自动签署" style="width: 100%">
                  <el-option
                    v-for="item in [
                      { label: '是', value: true },
                      { label: '否', value: false }
                    ]"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <!-- 不自动签署 企业签署配置 -->
              <el-form-item v-if="config.signType === '企业' && config.autoExecute === false" label="企业签署类型" prop="companySignType">
                <el-select v-model="config.companySignType" filterable placeholder="请选择企业签署类型" style="width: 100%">
                  <el-option v-for="item in ['企业名称']" :key="item" :label="item" :value="item"></el-option>
                </el-select>
                <div v-if="config.companySignType === '企业名称'" style="width: 100%">
                  <div>企业签署配置:</div>
                  <el-form :model="config.companySignConfig" label-width="120px" :disabled="dialogType === 'view'" border style="width: 100%">
                    <el-form-item label="企业名称" prop="companyName">
                      <el-input v-model="config.companySignConfig.companyName" placeholder="请输入企业名称" style="width: 100%"></el-input>
                    </el-form-item>
                  </el-form>
                </div>
              </el-form-item>

              <!-- 不自动签署 是否经办人签署 -->
              <el-form-item v-if="config.signType === '企业' && config.autoExecute === false" label="是否经办人签署" prop="isTransactor">
                <el-select v-model="config.isTransactor" filterable placeholder="请选择是否经办人签署" style="width: 100%">
                  <el-option
                    v-for="item in [
                      { label: '是', value: true },
                      { label: '否', value: false }
                    ]"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="config.signType === '企业' && config.autoExecute === false && config.isTransactor === true"
                label="经办人配置"
                prop="transactorConfigType"
              >
                <el-select v-model="config.transactorConfigType" filterable placeholder="请选择经办人配置类型" style="width: 100%">
                  <el-option v-for="item in ['手机号']" :key="item" :label="item" :value="item"></el-option>
                </el-select>
                <div v-if="config.transactorConfigType === '手机号'" style="width: 100%">
                  <div>经办人配置:</div>
                  <el-form :model="config.transactorConfig" label-width="120px" :disabled="dialogType === 'view'" border style="width: 100%">
                    <el-form-item label="手机号" prop="mobile">
                      <el-input v-model="config.transactorConfig.mobile" placeholder="请输入手机号" style="width: 100%"></el-input>
                    </el-form-item>
                  </el-form>
                </div>
              </el-form-item>

              <!-- 法人章 -->
              <el-form-item v-if="config.signType === '企业'" label="是否盖法人章" prop="frSeal">
                <el-select v-model="config.frSeal" filterable placeholder="请选择是否盖法人章" style="width: 100%">
                  <el-option
                    v-for="item in [
                      { label: '是', value: true },
                      { label: '否', value: false }
                    ]"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <!-- 是法人章 法人盖章配置 -->
              <el-form-item v-if="config.signType === '企业' && config.frSeal === true" prop="frSealConfigType">
                <template #label>
                  <span>
                    法人盖章类型
                    <el-tooltip placement="top">
                      <template #content>
                        <div>
                          指定: 使用填写的章ID<br />
                          项目公司: 填写key, 后续会根据key去请求参数中获取对应的值
                        </div>
                      </template>
                      <span
                        style="
                          text-align: center;
                          line-height: 16px;
                          display: inline-block;
                          width: 16px;
                          height: 16px;
                          border-radius: 50%;
                          font-size: 14px;
                          background: #e6a23c;
                          color: #fff;
                        "
                      >
                        ?
                      </span>
                    </el-tooltip>
                  </span>
                </template>
                <el-select v-model="config.frSealConfigType" filterable placeholder="请选择法人盖章类型" style="width: 100%">
                  <el-option v-for="item in ['指定', '项目公司']" :key="item" :label="item" :value="item"></el-option>
                </el-select>
                <div>法人盖章配置:</div>
                <el-form :model="config.frSealConfig" label-width="120px" :disabled="dialogType === 'view'" border style="width: 100%">
                  <el-form-item v-if="config.frSealConfigType === '指定'" label="章ID" prop="sealId">
                    <el-input v-model="config.frSealConfig.sealId" placeholder="请输入章ID" style="width: 100%"></el-input>
                  </el-form-item>
                  <el-form-item v-if="config.frSealConfigType === '项目公司'" label="项目公司配置" prop="projectCompany">
                    <el-input v-model="config.frSealConfig.projectCompany" placeholder="请输入项目公司配置" style="width: 100%"></el-input>
                  </el-form-item>
                  <el-form-item label="签署位置" prop="signPosType">
                    <el-select v-model="config.frSealConfig.signPosType" filterable placeholder="请选择签署位置" style="width: 100%">
                      <el-option v-for="item in ['关键字', '页码']" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="页码" v-if="config.frSealConfig.signPosType === '页码'" prop="keywordPos">
                    <el-input v-model="config.frSealConfig.keywordPos" placeholder="请输入页码" style="width: 100%"></el-input>
                  </el-form-item>
                  <el-form-item label="关键字" v-else prop="keywordPos">
                    <el-input v-model="config.frSealConfig.keywordPos" placeholder="请输入关键字" style="width: 100%"></el-input>
                  </el-form-item>
                  <el-form-item label="X偏移量" prop="posX">
                    <el-input v-model="config.frSealConfig.posX" placeholder="请输入X偏移量" style="width: 100%"></el-input>
                  </el-form-item>
                  <el-form-item label="Y偏移量" prop="posY">
                    <el-input v-model="config.frSealConfig.posY" placeholder="请输入Y偏移量" style="width: 100%"></el-input>
                  </el-form-item>
                </el-form>
              </el-form-item>
              <!-- 删除配置 -->
              <el-form-item>
                <el-button type="danger" size="small" v-if="dialogType !== 'view'" @click="signatoryDelete(index)">删除该合同签署方</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-form-item>
        <!-- 合同参数 -->
        <el-form-item label="合同参数" prop="paramConfig">
          <div>
            <el-button type="primary" size="small" v-if="dialogType !== 'view'" @click="paramVisible = true">添加合同参数</el-button>
          </div>
          <div v-if="form.paramConfig?.length > 0" style="width: 100%">
            <div>合同参数配置:</div>
            <el-table :data="form.paramConfig" border>
              <el-table-column label="Key" align="center" prop="key" :show-overflow-tooltip="true" min-width="160">
                <template #default="scope">
                  <el-input v-model="scope.row.key"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="Name" align="center" prop="name" :show-overflow-tooltip="true" min-width="120">
                <template #default="scope">
                  <el-input v-model.number="scope.row.name"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" min-width="60">
                <template #default="scope">
                  <el-tooltip content="删除" placement="right">
                    <el-button link type="danger" icon="Delete" @click="paramConfigDelete(scope.row)"></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
      </el-form>
      <template #footer v-if="dialogType !== 'view'">
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 新增合同参数 -->
    <el-dialog v-model="paramVisible" title="新增合同参数" width="50%" append-to-body>
      <el-form ref="addRef" :model="paramForm" label-width="100px">
        <el-form-item label="Key" prop="Key">
          <el-input v-model="paramForm.key" placeholder="请输入Key" />
        </el-form-item>
        <el-form-item label="Name" prop="Name">
          <el-input v-model="paramForm.name" placeholder="请输入Name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAddForm">确 定</el-button>
          <el-button @click="cancelAdd">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Template" lang="ts">
import { pageList, detail, add, update } from '@/api/contract/template/index';
import { Form, Query, Record } from '@/api/contract/template/types';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const showSearch = ref(true);
const typeList = ref<Record[]>([]);
const loading = ref(true);
const total = ref(0);

// 合同配置 平台
const platforms = ref([
  { label: 'E签宝', value: 'eqb' },
  { label: '契约锁', value: 'qys' },
  { label: '法大大', value: 'fdd' }
]);
// 合同参数
const paramVisible = ref(false);
const paramForm = ref({
  key: '',
  name: ''
});

const searchRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();
const addRef = ref<ElFormInstance>();

// 新增/查看/编辑
const dialogType = ref('view');
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const isShowDialog = ref(true);

// 表单结构
const initFormData: Form = {
  id: null,
  templateName: '',
  templateCode: '',
  description: '',
  platform: [], // 平台 勾选同步数据
  contractConfig: {
    // 模版id配置
    templateIdConfig: []
  }, // 合同配置
  signatoryConfig: [], // 签署方
  paramConfig: [] // 合同参数
};
const data = reactive<PageData<Form, Query>>({
  form: { ...initFormData },
  // 搜索参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    templateName: '',
    templateCode: ''
  },
  // 表单检验
  rules: {
    templateCode: [{ required: true, message: '合同Code不能为空', trigger: 'blur' }],
    templateName: [{ required: true, message: '合同名称不能为空', trigger: 'blur' }]
    // version: [{ required: true, message: '版本号不能为空', trigger: 'blur' }]
  }
});
const { queryParams, form, rules } = toRefs(data);

/** 查询合同列表 */
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
  dialog.title = '添加模板';
};

// 获取平台名称
const platformName = (value) => {
  let name = '';
  platforms.value.forEach((item) => {
    if (value === item.value) {
      name = item.label;
    }
  });
  return name;
};
// 选择平台
const platformChange = (value) => {
  // 渲染
  let list = [];
  value.forEach((platform) => {
    let temp = {
      channel: platform,
      templateId: null
    };
    list.push(temp);
  });
  // 赋值
  list.forEach((item) => {
    form.value.contractConfig?.templateIdConfig?.forEach((_item) => {
      if (item.channel === _item.channel) {
        item.templateId = _item.templateId;
      }
    });
  });
  form.value.contractConfig.templateIdConfig = list;
};
// 添加签署方
const signatoryAdd = () => {
  ElMessageBox.confirm(`请选择添加签署方签署类型！`, '提示', {
    confirmButtonText: '企业',
    cancelButtonClass: '',
    cancelButtonText: '个人',
    confirmButtonClass: '',
    type: 'warning'
  })
    .then(() => {
      let newSignatory = {
        signType: '企业',
        signOrder: '',
        signPosType: null,
        keywordPos: '',
        posX: '',
        posY: '',
        // 是否骑缝章
        across: false,
        acrossPosY: '', // 骑缝章偏移量
        // 公章配置
        sealConfigType: null,
        sealConfig: {
          sealId: '',
          projectCompany: ''
        }, // 指定：使用填写的章ID；项目公司：填写key，后续会根据key去请求参数中获取对应的值
        autoExecute: false, // 自动签署
        // 不自动签署 企业签署
        companySignType: null,
        companySignConfig: {
          companyName: ''
        },
        // 不自动签署 经办人签署
        isTransactor: false,
        transactorConfigType: null,
        transactorConfig: {
          mobile: ''
        },
        // 法人章
        frSeal: false,
        // 法人盖章配置
        frSealConfigType: null,
        frSealConfig: {
          sealId: '',
          projectCompany: '',
          signPosType: '',
          keywordPos: '',
          posX: '',
          posY: '' // 指定：使用填写的章ID；项目公司：填写key，后续会根据key去请求参数中获取对应的值
        }
      };
      form.value.signatoryConfig.push(newSignatory);
    })
    .catch(() => {
      let newSignatory = {
        signType: '个人',
        // 签署人配置
        personConfigType: null,
        personConfig: {
          name: '',
          mobile: '',
          idNo: ''
        }, // 固定：使用填写的值，动态：填写key，后续会根据key去请求参数中获取对应的值
        signOrder: '',
        signPosType: null,
        keywordPos: '',
        posX: '',
        posY: '',
        signMethod: null
      };
      form.value.signatoryConfig.push(newSignatory);
    });
};
// 删除签署方
const signatoryDelete = (index) => {
  form.value.signatoryConfig.splice(index, 1);
};

// 添加合同参数
const submitAddForm = () => {
  let formParams = JSON.parse(JSON.stringify(paramForm.value));
  form.value.paramConfig.push(formParams);
  paramVisible.value = false;
};
const cancelAdd = () => {
  addRef.value?.resetFields();
  paramForm.value = {
    key: '',
    name: ''
  };
  paramVisible.value = false;
};
// 删除合同参数
const paramConfigDelete = (row) => {
  form.value.paramConfig.forEach((item, index) => {
    if (row.key === item.key) {
      form.value.paramConfig.splice(index, 1);
    }
  });
};

/** 查看操作 */
const handleView = async (row?: Record) => {
  top();
  reset();
  const dictId = row?.id;
  const res = await detail(dictId);
  Object.assign(form.value, res.data);
  // 合同配置 平台
  const platform = [];
  form.value.contractConfig.templateIdConfig.forEach((item) => {
    platform.push(item.channel);
  });
  form.value.platform = platform;
  dialogType.value = 'view';
  dialog.visible = true;
  dialog.title = '模板详情';
};
/** 修改操作 */
const handleUpdate = async (row?: Record) => {
  top();
  reset();
  const dictId = row?.id;
  const res = await detail(dictId);
  Object.assign(form.value, res.data);
  // 合同配置 平台
  const platform = [];
  form.value.contractConfig.templateIdConfig.forEach((item) => {
    platform.push(item.channel);
  });
  form.value.platform = platform;
  dialogType.value = 'edit';
  dialog.visible = true;
  dialog.title = '模板信息修改';
};

/** 表单提交 */
const submitForm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      let formParams = JSON.parse(JSON.stringify(form.value));
      // 合同配置 平台
      delete formParams.platform;
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
  form.value = { ...initFormData };
};
// 视窗返回顶部
const top = () => {
  // dom重构 位置重置
  isShowDialog.value = false;
  setTimeout(() => {
    isShowDialog.value = true;
  }, 200);
};

onMounted(() => {
  getList();
});
</script>
