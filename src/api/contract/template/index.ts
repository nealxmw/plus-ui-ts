import request from '@/utils/request';
import { Query } from './types';

// 模版列表 分页
export function pageList(query: Query) {
  return request({
    url: '/contract/template/pageList',
    method: 'post',
    data: query
  });
}

// 模版列表 所有
export function templateList(data: any) {
  return request({
    url: '/contract/template/list',
    method: 'post',
    data
  });
}

// 场景详情
export function detail(id: number | string) {
  return request({
    url: '/contract/template/detail',
    method: 'post',
    data: { id }
  });
}

// 添加场景
export function add(data: any) {
  return request({
    url: '/contract/template/add',
    method: 'post',
    data
  });
}

// 更新场景
export function update(data: any) {
  return request({
    url: '/contract/template/update',
    method: 'post',
    data
  });
}
