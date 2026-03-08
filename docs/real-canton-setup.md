# 接入真实 Canton 网络

本文说明如何将本项目从 **Mock 模式** 切换为 **真实 Canton 网络**（创建钱包、查余额、转账均走链上），以及需要客户/运维提供的内容。

---

## 零、有没有官方或公开可连的公共节点？

**结论：没有「填个 URL 就能完整用」的官方公共节点；要跑完整流程（创建钱包 + 转账），必须自建或通过第三方/NaaS 获取 Ledger API。**

| 来源 | 是否公共/免申请 | 能做什么 | 说明 |
|------|------------------|----------|------|
| **Canton 官方（sync.global / DA）** | ❌ 否 | DevNet/TestNet/MainNet 都有，但需**申请 + 赞助 + 白名单**（固定出口 IP、OIDC 等），不是开放公共节点。 | 见 [canton.network/connect](https://www.canton.network/connect)、[Validator Onboarding](https://docs.dev.global.canton.network.sync.global/validator_operator/validator_onboarding.html)。 |
| **第三方 cantonnodes.com** | ✅ 有免费入口 | 提供 **Scan API**（只读）：`https://api.cantonnodes.com`，可查 rounds、holdings、state 等，**不能**创建 party、不能提交转账。 | 适合查链上数据、做只读验证；完整钱包/转账需其付费端或其它 Ledger API。 |
| **其它 NaaS / 自建** | 视供应商 | 提供 **Ledger API（gRPC）** 时，才能创建钱包、提交交易。 | 要么自建 LocalNet/节点，要么向 NaaS 或客户要 Ledger API 基址 + 认证。 |

**为什么没有「像以太坊公共 RPC」那样的东西？**  
Canton 的模型是「按 party 连到托管该 party 的 Participant」，没有单一点可查全链；且创建 external party、提交交易都需要连到**你方有权使用的 Participant 的 Ledger API**，官方不会对全网开放免审的写入端点。所以：

- **只做只读验证/查数据**：可用 cantonnodes.com 等提供的 **Scan/只读 API**（无需自建，但无法创建钱包和转账）。
- **要完整「创建钱包 + 转账」**：必须 **自建（如 LocalNet）** 或 **从 NaaS/客户处获取 Ledger API**，没有官方或网上随便可连的、免申请的公共写入节点。

---

## 一、当前实现说明

- **Mock 模式**（默认）：后端通过 `NODE_API_BASE_URL` 连接本仓库自带的 Mock Node（内存账户），无需真实 Canton。
- **真实 Canton 模式**：设置 `CANTON_USE_SDK=true` 并配置 `KEY_ENCRYPTION_KEY` 后，钱包的创建、余额、转账全部通过 **Canton Wallet SDK** 连接真实 Ledger API 与 Token Standard 完成。

实现要点：

- 创建钱包：在 Canton 上分配 external party，私钥经加密后存入 DB（WalletKeystore），不落盘明文。
- 余额：通过 SDK Token Standard `listHoldingUtxos` 按 party 汇总。
- 转账：通过 Token Standard `createTransfer` 构建指令，再经 Ledger `prepareSignAndExecuteTransaction` 用该钱包私钥签名并提交。

---

## 二、环境变量（真实 Canton 必读）

在 `api/.env` 中配置：

| 变量 | 必填 | 说明 |
|------|------|------|
| `CANTON_USE_SDK` | 否 | 设为 `true` 时启用真实 Canton；默认 `false`（Mock）。 |
| `KEY_ENCRYPTION_KEY` | 条件 | **当 `CANTON_USE_SDK=true` 时必填**。32 字节密钥的十六进制（64 个 hex 字符），用于加密存储钱包私钥。生成示例：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CANTON_DEFAULT_INSTRUMENT` | 否 | 默认代币 instrument（如 LocalNet 常用 `Amulet`）。不填时默认 `Amulet`。 |

当前 SDK 连接逻辑使用 **LocalNet 默认**（localhost Ledger API + Scan Proxy）。若使用 **NaaS 或自建远程节点**，需在代码中替换为对应 Ledger URL、Topology URL 及认证方式（见下文「与客户/运维确认」）。

---

## 三、方式 A：本地 LocalNet（开发/自测）

1. **运行 Canton LocalNet**  
   按 Canton/Splice 官方文档用 Docker Compose 启动 LocalNet，并确认 Ledger API（如 App User 端口 `2901`）和 Scan Proxy 可访问。  
   参考：[Docker-Compose Based Deployment of a Local Network](https://docs.dev.sync.global/app_dev/testing/localnet.html)（或当前官方最新链接）。

2. **确认端口**  
   本仓库当前 Canton 配置使用 SDK 自带的 LocalNet 默认 URL（如 `http://localhost:2901` 等）。若你的 LocalNet 端口不同，需要修改 `api/src/canton/canton.service.ts` 中的 `doConnect()`，或通过环境变量注入 Ledger/Topology 基址（若后续扩展支持）。

3. **启动本应用**  
   - 在 `api/.env` 中设置：
     - `CANTON_USE_SDK=true`
     - `KEY_ENCRYPTION_KEY=<64 位 hex>`
   - 启动 API：`cd api && npm run start`（或 `start:dev`）。
   - 启动前端：在项目根目录 `npm run dev`。

4. **自测流程**  
   从页面注册 → 邮箱验证 → 登录 → 进入钱包页 → 创建钱包 1 → 创建钱包 2 → 钱包 1 向钱包 2 转账 → 刷新列表查看余额。若 LocalNet 已部署 Amulet 等 instrument，余额与转账应反映在链上。

---

## 四、方式 B：NaaS 或客户提供的节点（上线）

不跑 LocalNet、改用 **NaaS 或客户/运维提供的 Canton 节点** 时，需要对方提供以下信息，并在本项目中配置（或改代码接入）：

| 需要客户/运维提供 | 用途 |
|-------------------|------|
| **Ledger API 基址** | SDK 连接 Participant，提交命令、查询状态与事件。 |
| **Scan Proxy API / Topology 基址** | SDK 拓扑发现与部分查询。 |
| **认证方式** | 如 OAuth2 client credentials、JWT、API key 等，以及对应的 client_id / secret、audience、scope（若适用）。 |
| **网络标识** | 当前为 DevNet / TestNet / MainNet，便于选用对应 DAR、合约版本与文档。 |
| **默认 Instrument** | 该环境使用的默认代币 instrument id（若不用 Amulet），用于余额与转账。 |

当前 `api/src/canton/canton.service.ts` 中写死为 **LocalNet 默认**（`localNetAuthDefault`、`localNetLedgerDefault`、`localNetTokenStandardDefault`、`localNetStaticConfig.LOCALNET_SCAN_PROXY_API_URL`）。  
要接入 NaaS/客户节点，需要：

- 用环境变量（如 `CANTON_LEDGER_URL`、`CANTON_TOPOLOGY_URL`）或配置表提供 Ledger 与 Topology 基址；
- 将 `authFactory` / `ledgerFactory` / `tokenStandardFactory` 等改为使用上述 URL 及客户提供的认证（例如 SDK 的 `ClientCredentialOAuthController` 或等价方式）。

这部分属于「环境与认证配置」扩展，在拿到客户提供的 URL 与认证方式后即可在现有 Canton 服务中替换连接逻辑。

---

## 五、与客户/运维沟通清单（可直接转发）

以下可直接发给客户或运维，用于索取上线所需信息：

1. **Ledger API 基址**（例如 `https://...`）  
2. **Scan Proxy / Topology API 基址**（若有独立 Topology 服务）  
3. **认证方式**：OAuth2 / JWT / API Key？若为 OAuth2，请提供 client_id、client_secret、token URL、scope/audience（如适用）  
4. **当前网络**：DevNet / TestNet / MainNet  
5. **默认代币 instrument id**（若与 Amulet 不同）  
6. **是否允许本应用在该节点上创建 external party（钱包）**，以及是否有 IP/速率限制  

---

## 六、自测结果与你的测试方式

- **Mock 模式**：已通过 E2E（注册 → 验证邮箱 → 登录 → 创建两个钱包 → 转账 → 刷新余额），无需真实 Canton。
- **真实 Canton 模式**：需要你先按「方式 A」在本地起好 LocalNet，或按「方式 B」拿到 NaaS/客户提供的 URL 与认证并完成配置后，再在同一前端流程下自测一轮。

建议你本地：

1. 用 **Mock 模式** 再跑一遍：从页面注册开始，走完注册 → 验证邮箱 → 登录 → 创建钱包 → 转账 → 看余额，确认与当前 E2E 一致。  
2. 若已部署 **LocalNet**：在 `api/.env` 打开 `CANTON_USE_SDK=true` 并设置 `KEY_ENCRYPTION_KEY`，重启 API 与前端，同一流程再测一遍，确认创建/余额/转账均走链上。

若你提供客户给的 Ledger/Topology URL 与认证方式，我可以按你项目结构写出具体改 `canton.service.ts` 的示例（环境变量名、如何接 OAuth2/JWT 等）。
