import { defineEventHandler } from "h3";

export default defineEventHandler((event) => {
  // 获取请求方法
  const method = event.req.method;

  // 获取请求头
  const headers = event.req.headers;

  // 获取查询参数
  const query = event.context.query;

  // 获取路由参数
  const params = event.context.params;

  // 获取用户代理
  const userAgent = headers["user-agent"];

  // 返回一些客户端信息
  return {
    method,
    query,
    params,
    userAgent,
  };
});
