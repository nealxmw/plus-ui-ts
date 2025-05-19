import request from '@/utils/request';
import { Query } from './types';

// 签约列表
export function pageList(query: Query) {
  return request({
    url: '/contract/signature/pageList',
    method: 'post',
    data: query
  });
}

// 签约文档信息
export function detail(signId: number | string) {
  return request({
    url: '/contract/signatureDocument/list',
    method: 'post',
    data: { signId }
  });
}

// 日志列表
export function log(signId: number | string) {
  return request({
    url: '/contract/createLog/pageList',
    method: 'post',
    data: { signId }
  });
}
