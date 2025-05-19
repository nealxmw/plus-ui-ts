// 列表数据
export interface Record extends BaseEntity {
  id: number | string | undefined;
  sceneCode: string;
  sceneName: string;
  sceneVersion: number;
  isEnable: boolean;
}

// 分页查询参数
export interface Query extends PageQuery {
  sceneCode: string;
  sceneName: string;
}

// 表单数据
export interface Form extends Record {
  template: Array<any>; // 模版勾选
  templateInfoList: any; // 关联模版
  flowConfig: any; // 签约流程配置
}
