# Canton 钱包系统技术架构文档

本文档基于当前项目代码与 `docs/canton-wallet-integration-plan.md` 整理，描述 Canton 钱包系统的总体架构、数据模型、接口设计与开发路线，供后续开发使用。

---

## 1. 系统总体架构

### 1.1 分层结构

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (React / Vite)                                         │
│  登录、钱包列表/详情、转账表单、展示余额与 Party 信息               │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend API (NestJS)                                            │
│  认证(JWT)、用户/会话、钱包应用层接口、审计                         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Wallet Service (api/src/wallets)                                │
│  钱包 CRUD、调用 Node API 创建账户/查余额/转账、与 DB 同步          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Node API (Canton Node 提供的账户 API)                            │
│  创建账户、查询账户/余额、提交转账                                  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Canton Node (Participant / Validator)                            │
│  Party 托管、拓扑、Ledger API、共识与账本读写                       │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  DAML Contract (链上合约)                                         │
│  Token、Wallet、Transfer 等合约与 Choice 执行                     │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 各层职责

| 层级 | 职责 |
|------|------|
| **Frontend** | 用户登录/注册、钱包列表与详情展示、创建钱包、转账表单；调用 Backend API，不直接连 Canton；不生成或持有私钥（当前方案由 Node 负责账户与私钥）。 |
| **Backend API** | 用户与会话管理、JWT 认证；暴露钱包应用层接口（POST/GET /wallets/create、GET /wallets、GET /wallets/:id、POST /wallets/transfer）；审计与权限校验。 |
| **Wallet Service** | 将「用户 + 钱包」与 Node 账户绑定：创建钱包时调 Node 创建账户并落库 `nodeAccountId`；列表/详情时从 Node 拉取余额；转账时校验归属并调 Node 转账。 |
| **Node API** | Canton Node 对外提供的账户与转账能力：创建账户（对应链上 Party/账户）、查询账户与余额、提交转账；内部封装 Ledger API 与 DAML 合约调用。 |
| **Canton Node** | 托管 Party、维护拓扑、暴露 Ledger API；执行命令、读写账本、参与共识；Gas/成本由节点侧承担。 |
| **DAML Contract** | 链上业务逻辑：资产表示（Token）、钱包/账户状态（Wallet）、转账（Transfer Choice）等；通过 Create/Exercise/Fetch 与 Ledger 交互。 |

---

## 2. 钱包系统设计

### 2.1 核心概念关系

| 概念 | 含义 | 与它者的关系 |
|------|------|----------------|
| **wallet** | 本系统内的「钱包」实体，对应一条 `wallets` 表记录；归属某用户，可有可读标签；用于展示与权限。 | 一对一绑定 **nodeAccountId**（Node 侧账户 id）；可选绑定 **partyId**（链上身份）；可关联 **keystore**（若本系统存加密密钥）。 |
| **nodeAccountId** | Node API 返回的账户唯一标识，通常对应 Canton 上某 Party 或 Node 内部账户 id。 | 由 Node 在「创建账户」时分配；存在 `wallets.node_account_id`；用于调 Node 查余额、转账。 |
| **partyId** | Canton 链上身份，格式 `partyHint::fingerprint`；由公钥指纹与 hint 决定，需经拓扑分配后才在链上生效。 | 可与 **wallet** 对应（当前方案中 Node 创建账户时一并处理 Party）；链上合约以 Party 为主体。 |
| **keystore** | 加密存储的密钥材料（如私钥或派生材料），存于 `wallet_keystores`；后端仅存密文，不解密、不签名。 | 与 **wallet** 一对一或多版本关联；**keyId** 可存 partyId 或 fingerprint 便于与链上身份对应。 |
| **private key** | 与 partyId 对应的私钥，用于 External Party 签名。 | 当前方案下由 **Canton Node 负责**生成与保管，钱包应用层不生成、不接触明文私钥；若未来支持自托管，则经 **keystore** 加密存储。 |

### 2.2 为什么「钱包地址 ≠ Canton Party」

- **钱包（wallet）** 是**应用层与数据库层**的概念：标识「用户在本产品里的一个账户」，id 为 UUID，用于 API、权限与展示。
- **Canton Party** 是**链上身份**：全局唯一、需拓扑分配、参与合约授权与隐私模型；格式为 `partyHint::fingerprint`。
- 关系是「**一个 wallet 绑定一个链上身份**」：通过 `nodeAccountId`（及可选 `partyId`）与 Node/Canton 对应，而不是用「钱包 id」当链上地址。这样可兼容「由 Node 创建账户并管理密钥」的当前设计，也为将来「自托管 + Party 分配」留出扩展（同一 wallet 可对应一个 partyId，密钥在 keystore 中加密存储）。

---

## 3. 数据库结构

### 3.1 钱包相关表概览

| 表名 | 说明 |
|------|------|
| **users** | 用户账号，登录与归属主体。 |
| **wallets** | 钱包记录，绑定用户与 Node 账户。 |
| **wallet_keystores** | 加密密钥材料（当前方案可选；若 Node 托管则可不落库）。 |
| **wallet_transactions** | 转账/交易记录（**规划中**，当前项目未建表）。 |

### 3.2 各表字段说明

**users**

| 字段 | 类型 | 用途 |
|------|------|------|
| id | uuid | 主键。 |
| email | string | 登录邮箱，唯一。 |
| password_hash | string | 密码哈希。 |
| email_verified | boolean | 邮箱是否已验证。 |
| created_at, updated_at | timestamp | 创建/更新时间。 |

**wallets**

| 字段 | 类型 | 用途 |
|------|------|------|
| id | uuid | 主键，应用层钱包 id。 |
| user_id | uuid | 归属用户。 |
| label | string? | 用户可读标签。 |
| node_account_id | string? | Node API 账户 id（唯一），用于调 Node 查余额/转账。 |
| created_at, updated_at | timestamp | 创建/更新时间。 |

**wallet_keystores**

| 字段 | 类型 | 用途 |
|------|------|------|
| id | uuid | 主键。 |
| wallet_id | uuid | 所属钱包。 |
| key_id | string | 密钥标识（建议存 partyId 或公钥 fingerprint）。 |
| encrypted_payload | text | 加密后的密钥材料，后端不解密。 |
| key_version | int | 密钥版本，便于轮换。 |
| created_at, updated_at | timestamp | 创建/更新时间。 |

**wallet_transactions（规划）**

| 字段 | 类型 | 用途 |
|------|------|------|
| id | uuid | 主键。 |
| wallet_id | uuid | 本端钱包。 |
| from_account_id | string? | 转出方 Node 账户 id。 |
| to_account_id | string? | 转入方 Node 账户 id。 |
| amount | decimal | 金额。 |
| currency | string? | 币种。 |
| status | string | 状态（pending/success/failed）。 |
| transaction_id | string? | Node/Ledger 返回的交易 id。 |
| created_at, updated_at | timestamp | 创建/更新时间。 |

---

## 4. Node API 设计

### 4.1 当前约定的 Node API 列表

| 方法 | 路径 | 说明 |
|------|------|------|
| **POST** | /accounts | 创建账户。Body: `{ label?: string }`。返回: `{ id, partyId }`。 |
| **GET** | /accounts/:id | 查询账户。返回: `{ id, partyId, balance?: string }`。 |
| **POST** | /transfers | 转账。Body: `{ fromAccountId, toAccountId, amount, currency? }`。返回: `{ success, transactionId? }`。 |

以上由 Backend 的 `NodeApiClient` 调用，Base URL 通过 `NODE_API_BASE_URL` 配置；当前联调使用 Mock（`api/scripts/mock-node-api.js`）。

### 4.2 Node API 与 Canton Ledger API 的关系

- **Node API** 是 Canton Node（或托管方）对外提供的**业务封装**：账户创建、余额查询、转账等，面向应用层。
- **Ledger API** 是 Canton 的**标准 gRPC 接口**：Command Service（提交命令）、State/Update Service（查状态与事件）、Party Management 等，面向链上操作。
- 关系：Node 内部使用 **Ledger API** 与 DAML 合约完成「创建 Party、查合约状态、Exercise Transfer」等；钱包应用只调 **Node API**，不直接调 Ledger API，从而简化集成与密钥/拓扑管理（由 Node 负责）。

---

## 5. Ledger API 说明

### 5.1 如何通过 Ledger API 调用 DAML 合约

- **Command Service**：提交 `Create`、`Exercise` 等命令；External Party 需先 `PrepareSubmission`，本地签名后再 `ExecuteSubmission`。
- **State / Active Contracts**：按 Party、Template 等条件查询当前有效合约（如某 Party 的 Token 或 Wallet 合约）。
- **Update / Event 流**：订阅交易与事件，用于余额变更、交易历史等。

### 5.2 典型操作举例

| 操作 | Ledger API 对应 | 说明 |
|------|------------------|------|
| **create** | CreateCommand：指定 templateId、createArguments | 在账本上创建一份合约实例（如 Wallet、Token）。 |
| **exercise** | ExerciseCommand：指定 contractId、choiceId、choiceArgument | 执行合约上的 Choice（如 Transfer），可能归档旧合约、创建新合约。 |
| **fetch** | 通过 State Service 或 GetActiveContracts 按 contractId/Party/templateId 查询 | 读取当前有效合约内容（如余额、所有权）。 |

---

## 6. DAML 合约设计

### 6.1 最基础的钱包相关合约（概念设计）

| 合约 | 职责 |
|------|------|
| **Wallet** | 表示某 Party 在链上的「钱包」状态；可持有对 Token 的引用或余额汇总；创建账户时由 Node 或参与方创建并关联 Party。 |
| **Token** | 表示可转让资产（如同质化代币）；记录 owner（Party）、amount、可能 currency/symbol；Transfer Choice 会归档/创建或更新 Token 合约。 |
| **Transfer** | 通常以 **Choice** 形式存在（如 `Token.Transfer`）：从 A 的 Token 合约 Exercise 转账到 B，校验余额与权限，更新账本状态。 |

以上为最小可运行模型；实际会结合 Canton/Splice 的 Token Standard 与既有模板设计。

---

## 7. 钱包创建流程

### 7.1 当前实现（Node 负责账户与密钥）

```
用户在前端点击「创建钱包」
        ↓
Backend: POST /wallets/create（带 JWT）
        ↓
Wallet Service: 调用 Node API POST /accounts
        ↓
Node: 内部生成 key / 创建 external party（若需要）、在链上完成账户/Party 注册
        ↓
Node 返回 { id, partyId }
        ↓
Backend: 写入 wallets 表（user_id, label, node_account_id = id）
        ↓
返回钱包信息给前端（含 nodeAccountId / partyId，不返回私钥）
```

### 7.2 若未来改为「自托管 + Wallet SDK」的流程（参考集成计划）

```
create wallet（应用层）
        ↓
generate key（本地或前端，Ed25519 / BIP39）
        ↓
create external party（Wallet SDK: generateExternalParty → sign → allocateExternalParty）
        ↓
绑定 wallet → partyId（DB 写入 partyId / nodeAccountId，可选 keystore 存加密私钥）
```

---

## 8. 转账流程

```
用户在前端填写 toWalletId、amount，点击转账
        ↓
Frontend: POST /wallets/transfer（fromWalletId, toWalletId, amount）+ JWT
        ↓
Backend: 校验 from 归属当前用户，解析双方 nodeAccountId
        ↓
Wallet Service: 调用 Node API POST /transfers（fromAccountId, toAccountId, amount）
        ↓
Node: 通过 Ledger API 构造并提交 DAML 命令（如 Exercise Transfer）
        ↓
Ledger API → Canton 共识 → DAML contract 执行
        ↓
账本更新（Token/Wallet 状态变更）
        ↓
Node 返回 success / transactionId
        ↓
Backend 返回成功；前端可刷新余额（GET /wallets/:id 或 list）
```

---

## 9. Gas / 成本模型

### 9.1 为什么 Canton 是节点支付 Gas

- Canton 的共识与执行由 **Participant/Validator 节点**完成；交易提交、拓扑与合约执行消耗节点资源。
- 成本（类似 Gas）通常由**运行节点的运营方**承担：节点付费参与网络、为用户/Party 提交交易，而不是由每个链上「地址」直接持有一笔 Gas 代币。
- 因此对**钱包应用**而言：链上成本由 **Canton Node（或 NaaS 提供商）** 承担，钱包侧不直接与「Gas 扣费」交互。

### 9.2 钱包如何向用户收费

- **不通过链上 Gas 向用户收费**，而是通过**产品层计费**：
  - 转账手续费：按笔或按金额比例，在应用层收取（法币或平台代币）；
  - 账户管理费：创建钱包或月费；
  - 增值服务：合约交互、预测市场、金库等可单独定价。
- 成本转嫁：钱包向用户收取的费用用于覆盖其支付给 Node/NaaS 的费用及运营成本。

---

## 10. 收益模型设计

基于会议与架构，钱包可考虑的收益方式：

| 方式 | 说明 |
|------|------|
| **1）发行代币** | 发行自有代币（如平台积分/治理代币），用于手续费抵扣、激励或治理；需合规与 Token Standard 设计。 |
| **2）合约交互** | 对使用特定 DAML 合约（DeFi、金库、预测市场）的用户收取服务费或分成。 |
| **3）交易手续费** | 对每笔转账或链上操作收取一定比例或固定费用，作为主要收入来源。 |
| **4）预测市场 / 金库合约** | 提供预测市场、金库等合约产品，通过利差、管理费或参与抽成获利。 |

具体需结合合规、产品定位与 Canton 生态能力落地。

---

## 11. 开发路线图

| 阶段 | 内容 | 状态 |
|------|------|------|
| **Phase 1** | 当前完成：Backend 钱包应用层接口（create/list/get/transfer）；Node API 客户端与 Mock；DB 迁移（wallets.node_account_id）；前端钱包列表/详情/转账 UI；联调与自动测试。 | ✅ 已完成 |
| **Phase 2** | 前端钱包 UI 完善：体验优化、错误态、加载态、多语言与无障碍；可选：交易历史占位。 | 进行中 |
| **Phase 3** | 接入真实 Canton Node：替换 Mock，配置 NODE_API_BASE_URL 与认证；可选 NaaS 或自建节点。 | 待开始 |
| **Phase 4** | DAML 合约：设计与部署 Wallet/Token/Transfer 等基础合约；Node 侧对接 Ledger API 与合约。 | 待开始 |
| **Phase 5** | 收益模型：手续费策略、代币或合约相关产品设计与实现。 | 待开始 |

---

## 12. 风险分析

### 12.1 Canton 生态与实现风险

| 风险 | 说明 |
|------|------|
| **SDK 不成熟** | Wallet SDK / dApp SDK 仍在迭代，文档与示例有限；升级可能带来 breaking change，需预留适配与测试时间。 |
| **Gas 成本** | 节点侧成本不透明或波动，若 NaaS 按量涨价，钱包成本控制与定价难度增加。 |
| **节点维护复杂** | 自建节点需运维、升级与合规；多环境（DevNet/TestNet/MainNet）与 allowlist 等增加复杂度。 |
| **账号封禁** | 依赖 Node/托管方策略；若节点或网络对某 Party/账户限制，钱包体验与连续性受影响。 |

### 12.2 缓解方向

- 优先采用 **NaaS** 降低节点运维与准入成本。
- 封装 Node API 与 Ledger 调用，便于后续切换 SDK 或节点实现。
- 保留 **Mock Node** 与自动化测试，保证在无真实网络时仍可开发与回归。

---

## 附录：文档与代码参考

- 集成设计：`docs/canton-wallet-integration-plan.md`
- 环境选型：`docs/canton-environment-options.md`
- 后端钱包模块：`api/src/wallets/`
- 前端钱包页：`src/pages/Wallets.tsx`、`src/pages/WalletDetail.tsx`
- Node API Mock：`api/scripts/mock-node-api.js`

---

## 当前项目开发进度

| 维度 | 完成情况 | 说明 |
|------|----------|------|
| 后端钱包应用层 | ✅ 100% | POST/GET /wallets/create、GET /wallets、GET /wallets/:id、POST /wallets/transfer 已实现并接入 Node API 客户端与 Mock。 |
| 数据库 | ✅ 100% | users、wallets（含 node_account_id）、wallet_keystores 已就绪；wallet_transactions 未建表。 |
| Node API 联调 | ✅ 100% | Mock Node 与自动测试闭环通过；真实 Node 未接入。 |
| 前端钱包 UI | ✅ 90% | 钱包列表、详情、创建、转账表单与余额展示已完成；体验与异常态可继续打磨。 |
| Canton 链上 | ⏳ 0% | 未接真实 Canton Node、Ledger API、DAML 合约。 |
| 收益模型 | ⏳ 0% | 未实现。 |

**整体进度（按路线图 Phase 1–5 估算）：约 38%。**  
Phase 1 已完成，Phase 2 大部分完成；Phase 3（真实 Node）、Phase 4（DAML）、Phase 5（收益）尚未启动。

---

*文档版本：1.0 | 基于当前项目与集成计划整理，供后续开发使用。*
