<template>
  <div class="p-2">
    <!-- 搜索 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="searchRef" :model="queryParams" :inline="true">
            <el-form-item label="姓名" prop="username">
              <el-input v-model="queryParams.username" placeholder="请输入姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="身份证号" prop="idNo">
              <el-input v-model="queryParams.idNo" placeholder="请输入身份证号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="queryParams.mobile" placeholder="请输入手机号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="业务编号" prop="objectNo">
              <el-input v-model="queryParams.objectNo" placeholder="请输入业务编号" clearable @keyup.enter="handleQuery" />
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
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>
      <!-- 列表 -->
      <el-table v-loading="loading" :data="typeList">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="编号" align="center" prop="id" />
        <el-table-column label="姓名" align="center" prop="username" :show-overflow-tooltip="true" min-width="80" />
        <el-table-column label="手机号" align="center" prop="mobile" :show-overflow-tooltip="true" min-width="120" />
        <el-table-column label="身份证号" align="center" prop="idNo" :show-overflow-tooltip="true" min-width="180" />
        <el-table-column label="业务编号" align="center" prop="objectNo" :show-overflow-tooltip="true" min-width="170" />
        <el-table-column label="渠道" align="center" prop="channel" :show-overflow-tooltip="true" min-width="170" />
        <el-table-column label="场景编码" align="center" prop="sceneCode" :show-overflow-tooltip="true" min-width="100" />
        <el-table-column label="场景名称" align="center" prop="sceneName" :show-overflow-tooltip="true" min-width="100" />
        <el-table-column label="状态" align="center" prop="status" :show-overflow-tooltip="true" min-width="100" />
        <el-table-column label="签约平台唯一标识" align="center" prop="thirdFlowId" :show-overflow-tooltip="true" min-width="100" />
        <el-table-column label="流程开始时间" align="center" prop="flowStartTime" :show-overflow-tooltip="true" min-width="160" />
        <el-table-column label="流程结束时间" align="center" prop="flowEndTime" :show-overflow-tooltip="true" min-width="160" />
        <el-table-column label="版本" align="center" prop="sceneVersion" :show-overflow-tooltip="true" min-width="80" />
        <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看" placement="left">
              <el-button
                v-hasPermi="['contract:signatureDocument:query']"
                link
                type="primary"
                icon="View"
                @click="handleDetail(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="日志" placement="right">
              <el-button v-hasPermi="['contract:createLog:query']" link type="primary" icon="List" @click="handleLog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="80%" append-to-body>
      <!-- 签约详情 -->
      <el-table v-if="dialogType === 'detail'" :data="detailList" border>
        <el-table-column v-if="false" label="编号" align="center" prop="id" />
        <el-table-column label="模板ID" align="center" prop="templateId" :show-overflow-tooltip="true" min-width="180" />
        <el-table-column label="文档ID" align="center" prop="fileId" :show-overflow-tooltip="true" min-width="180" />
        <el-table-column label="模板编码" align="center" prop="templateCode" :show-overflow-tooltip="true" min-width="100" />
        <el-table-column label="模板名称" align="center" prop="templateName" :show-overflow-tooltip="true" min-width="100" />
        <el-table-column label="状态" align="center" prop="status" :show-overflow-tooltip="true" min-width="150" />
        <el-table-column label="合同文件" align="center" prop="objectId" :show-overflow-tooltip="true" min-width="100" />
      </el-table>

      <!-- 签约日志 -->
      <el-table v-if="dialogType === 'log'" :data="logList" border>
        <el-table-column v-if="false" label="编号" align="center" prop="id" />
        <el-table-column label="旧状态" align="center" prop="originalStatus" :show-overflow-tooltip="true" />
        <el-table-column label="新状态" align="center" prop="targetStatus" :show-overflow-tooltip="true" />
        <el-table-column label="签约时间" align="center" prop="signTime" :show-overflow-tooltip="true" />
        <el-table-column label="请求参数" align="center" prop="reqParam" min-width="180">
          <template #default="scope">
            {{ JSON.stringify(scope.row.reqParam) }}
          </template>
        </el-table-column>
        <el-table-column label="合同配置" align="center" prop="contractConfig" min-width="150">
          <template #default="scope">
            {{ JSON.stringify(scope.row.contractConfig) }}
          </template>
        </el-table-column>
        <el-table-column label="合同签署方配置" align="center" prop="signatoryConfig" min-width="240">
          <template #default="scope">
            {{ JSON.stringify(scope.row.signatoryConfig) }}
          </template>
        </el-table-column>
        <el-table-column label="签约流程配置" align="center" prop="flowConfig" min-width="150">
          <template #default="scope">
            {{ JSON.stringify(scope.row.flowConfig) }}
          </template>
        </el-table-column>
        <el-table-column label="合同参数配置" align="center" prop="paramConfig" min-width="150">
          <template #default="scope">
            {{ JSON.stringify(scope.row.paramConfig) }}
          </template>
        </el-table-column>
      </el-table>
      <!-- <el-form ref="formRef" :model="log" label-width="100px" v-if="dialogType === 'log'">
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
      </el-form> -->
    </el-dialog>
  </div>
</template>

<script setup name="Scene" lang="ts">
import { pageList, detail, log } from '@/api/contract/signature/index';
import { Record } from '@/api/contract/signature/types';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const showSearch = ref(true);
const typeList = ref<Record[]>([]);
const loading = ref(true);
const total = ref(0);

const searchRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();

// 新增/查看/编辑
const dialogType = ref('detail');
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const detailList = ref([]); // 详情
const logList = ref([]); // 日志

const data = reactive({
  // 搜索参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    username: '',
    idNo: '',
    mobile: '',
    objectNo: ''
  }
});
const { queryParams } = toRefs(data);

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

/** 详情操作 */
const handleDetail = async (row) => {
  const signId = row?.id;
  const res = await detail(signId);
  Object.assign(detailList.value, res.data);

  dialogType.value = 'detail';
  dialog.visible = true;
  dialog.title = '签约详情';
};
/** 修改操作 */
const handleLog = async (row) => {
  const signId = row?.id;
  const res = await log(signId);
  Object.assign(logList.value, res.data.records);
  dialogType.value = 'log';
  dialog.visible = true;
  dialog.title = '签约日志';
};

onMounted(() => {
  getList();
});
</script>
