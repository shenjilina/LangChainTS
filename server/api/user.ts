import { defineEventHandler } from "h3";
import { successResponse } from "~/server/lib/response";

export default defineEventHandler((event) => {
  const userData = {
    id: 1,
    name: "示例用户",
    email: "user@example.com",
    role: "user",
    createdAt: new Date().toISOString()
  };

  return successResponse(userData, "获取用户信息成功");
});
