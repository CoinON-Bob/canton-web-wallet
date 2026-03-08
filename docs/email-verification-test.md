# 邮箱验证码接口测试说明

## 说明

- 当前阶段**不会真实发送邮件**，验证码会**打印在后端控制台日志**中，供本地调试。
- 端口以 `api/.env` 中 `PORT` 为准（当前为 **3001**）。

## 1. 发送验证码 POST /email-verifications/send

**前提**：该邮箱已注册（存在对应用户），否则返回 404。

```bash
curl -X POST "http://localhost:3001/email-verifications/send" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

成功返回：`{"success":true,"message":"Verification code generated"}`

**验证码位置**：在后端运行 `npm run start:dev` 的终端里，会看到类似日志：
`[EmailVerificationsService] [Email verification] user@example.com => code: 123456 (expires in 10 min). Dev only: no email sent.`

## 2. 校验验证码 POST /email-verifications/verify

将上一步控制台中的 6 位验证码填入 `code`：

```bash
curl -X POST "http://localhost:3001/email-verifications/verify" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"123456"}'
```

成功返回：`{"success":true,"message":"Email verified"}`

校验成功后：
- 该验证码记录会被标记为已使用
- 对应用户的 `users.emailVerified` 会被更新为 `true`

## Swagger

http://localhost:3001/api/docs — 可在此调试 `POST /email-verifications/send` 与 `POST /email-verifications/verify`。
