export {};
declare module 'axios' {
  interface AxiosResponse<T = any> {
    code: number;
    msg: string;
    rows: T;
    records: T;
    total: number;
  }
}
