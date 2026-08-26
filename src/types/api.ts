export type ApiResult<T> = { res: true; data: T } | { res: false; message: string };
