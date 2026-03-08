# Auth API 测试说明

## 前提

- 后端已启动：`cd api && npm run start:dev`
- **当前后端端口为 3001**（由 `api/.env` 中 `PORT` 决定）
- 以下示例均使用 `http://localhost:3001`。

## 1. 注册 POST /auth/register

```bash
curl -X POST "http://localhost:3001/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"12345678"}'
```

成功返回示例：`{"id":"...","email":"user@example.com"}`

## 2. 登录 POST /auth/login

```bash
curl -X POST "http://localhost:3001/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"12345678"}'
```

成功返回示例：`{"access_token":"eyJ...","user":{"id":"...","email":"user@example.com"}}`

## 3. 登出 POST /auth/logout

```bash
curl -X POST "http://localhost:3001/auth/logout"
```

成功返回：`{"success":true}`（客户端丢弃 token；后续可接 Redis/会话失效）。

## 4. 获取当前用户 GET /users/me（需 JWT）

先登录取得 `access_token`，再在请求头中携带：

```bash
TOKEN="<上一步返回的 access_token>"
curl -X GET "http://localhost:3001/users/me" \
  -H "Authorization: Bearer $TOKEN"
```

成功返回示例：`{"id":"...","email":"user@example.com","emailVerified":false,"createdAt":"...","updatedAt":"..."}`

## Swagger

浏览器打开：**http://localhost:3001/api/docs**

- 可调试：POST /auth/register、POST /auth/login、POST /auth/logout、GET /users/me
- GET /users/me 需先执行 login 取得 `access_token`，再在页面顶部点击 “Authorize”，输入 `Bearer <access_token>` 后调用。
