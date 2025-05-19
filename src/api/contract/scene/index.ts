import request from '@/utils/request';
import { Query } from './types';

// 场景列表
export function pageList(query: Query) {
  return request({
    url: '/contract/scene/pageList',
    method: 'post',
    data: query
  });
}

// 场景详情
export function detail(id: number | string) {
  return request({
    url: '/contract/scene/detail',
    method: 'post',
    data: { id }
  });
}

// 添加场景
export function add(data: any) {
  return request({
    url: '/contract/scene/add',
    method: 'post',
    data
  });
}

// 场景更新
export function update(data: any) {
  return request({
    url: '/contract/scene/update',
    method: 'post',
    data
  });
}
