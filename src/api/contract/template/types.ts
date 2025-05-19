// 列表数据
export interface Record extends BaseEntity {
  id: number | string | undefined;
  templateCode: string;
  templateName: string;
  description: string;
}

// 分页查询参数
export interface Query extends PageQuery {
  templateCode: string;
  templateName: string;
}

// 表单数据
export interface Form extends Record {
  platform: Array<any>; // 平台勾选
  contractConfig: any; // 合同配置
  signatoryConfig: Array<any>; // 签署方
  paramConfig: Array<any>; // 参数
}
