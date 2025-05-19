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
  username: string;
  idNo: string;
  mobile: string;
  objectNo: string;
}
