# Canton Wallet API - Local Setup

## Prerequisites

- Node.js 18+
- PostgreSQL 14+（或使用 Supabase 等托管 PostgreSQL）
- （可选）Redis，用于后续缓存/会话

---

## 1. 安装依赖

在项目根目录下，后端位于 `api/`：

```bash
cd api
npm install
```

---

## 2. 环境变量

### 2.1 复制示例文件为 .env

```bash
cd api
cp .env.example .env
```

### 2.2 在 .env 中填写必填项

用编辑器打开 `api/.env`，至少填写：

| 变量 | 必填 | 说明 |
|------|------|------|
| **DATABASE_URL** | 是 | PostgreSQL 连接串，例如 Supabase：`postgresql://postgres:你的密码@db.xxx.supabase.co:5432/postgres` |
| **JWT_SECRET** | 是 | 至少 16 个字符，用于 JWT 签名，生产环境请使用强随机串 |

可选（Redis 暂未使用时可留空）：

| 变量 | 说明 |
|------|------|
| REDIS_HOST | Redis 主机，默认 localhost |
| REDIS_PORT | Redis 端口，默认 6379 |
| REDIS_PASSWORD | Redis 密码，无则留空 |

**注意**：不要把真实密钥提交到仓库，`.env` 已在 `.gitignore` 中。

---

## 3. 数据库：Prisma 迁移与生成

### 3.1 执行迁移（建表）

在 `api/` 目录下执行，会连接 `DATABASE_URL` 并在数据库中创建/更新表：

```bash
cd api
npx prisma migrate dev --name init
```

- 首次会生成 `prisma/migrations/` 下的迁移文件并应用到数据库。
- 若已有迁移记录，只会应用未执行的迁移。

### 3.2 生成 Prisma Client

每次修改 `prisma/schema.prisma` 或首次拉代码后建议执行：

```bash
cd api
npx prisma generate
```

---

## 4. 验证数据库连接成功

任选其一或都做：

### 方式一：Prisma 直接连接

```bash
cd api
npx prisma db execute --stdin <<< "SELECT 1"
```

无报错即表示连接正常。

### 方式二：启动 API 后访问健康检查

```bash
cd api
npm run start:dev
```

浏览器或 curl 访问（端口以 `api/.env` 中 `PORT` 为准，当前为 **3001**）：

- **存活**：http://localhost:3001/health  
  应返回：`{"status":"ok","timestamp":"..."}`
- **数据库**：http://localhost:3001/health/db  
  应返回：`{"status":"ok","db":"connected"}`

若 `health/db` 返回 `"db":"disconnected"` 或 500，说明 `DATABASE_URL` 有误或网络/权限问题。

### 方式三：Prisma Studio 查看表

```bash
cd api
npx prisma studio
```

会打开浏览器，可看到 `users`、`wallets` 等表，即表示连接与建表均正常。

---

## 5. 启动 API

开发模式（热重载）：

```bash
cd api
npm run start:dev
```

默认端口 **3001**（可在 `api/.env` 中设置 `PORT`）。

- Swagger：http://localhost:3001/api/docs

---

## 6. 常用脚本（均在 `api/` 下执行）

| 命令 | 说明 |
|------|------|
| `npm run start:dev` | 开发模式启动 |
| `npm run build` | 构建生产包 |
| `npm run start:prod` | 运行生产包 |
| `npx prisma generate` | 生成 Prisma Client |
| `npx prisma migrate dev --name <名称>` | 开发环境执行迁移 |
| `npx prisma studio` | 打开数据库可视化 |

---

## 7. 故障排查

- **启动报错 “DATABASE_URL is required” 或 JWT 校验失败**  
  确认 `api/.env` 存在且包含 `DATABASE_URL`、`JWT_SECRET`（≥16 字符）。

- **Prisma migrate 失败**  
  检查 `DATABASE_URL` 是否正确、数据库是否可访问（Supabase 需允许外网连接）、用户是否有建表权限。

- **health/db 返回 disconnected**  
  检查防火墙、Supabase 是否开启 5432、连接串中的密码是否含特殊字符并正确编码。

- **端口被占用**  
  在 `api/.env` 中修改 `PORT` 为其他未占用端口（如 3002）。
