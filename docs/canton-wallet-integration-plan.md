# Canton 钱包集成设计文档

本文档基于 Canton 官方文档、Wallet SDK 与 Ledger API 说明整理，用于指导 Canton Web Wallet 与 Canton 网络的集成，**不涉及具体实现代码**。当前阶段不实现钱包创建/导入逻辑，仅做方案设计。

参考产品： [Canton Loop](https://cantonloop.com) | 浏览器： [CantonScan](https://www.cantonscan.com/)

---

## 一、Canton 地址 / Party 模型说明

### 1.1 Party 即链上身份

在 Canton 中，**Party** 是链上唯一身份，相当于其他链的「地址」或 EOA：

- **全局唯一**：同一 Canton 网络内 Party ID 唯一。
- **必须先分配**：Party 必须通过 **Party Allocation** 在网络上注册后才能用于登录、签名、提交交易。
- **不解析、不硬编码**：官方建议将 Party ID 视为不透明字符串，不要解析格式或自行拼接。

### 1.2 Party ID 格式

分配后得到的 Party ID 形如：

```text
<partyHint>::<fingerprint>
```

- **partyHint**：分配时指定的可读前缀（如 `alice`、`my-wallet-1`），可选；不指定则多为 `party-<uuid>`。
- **fingerprint**：与该 Party 绑定的**公钥的指纹**（如 SHA-256 等），由 Canton 根据公钥计算得出。

因此：**同一把公钥（及对应私钥）在分配时会产生确定的 fingerprint，进而得到确定的 Party ID**。即「地址」在数学上可由公钥推导，但**链上生效必须完成分配**。

### 1.3 Internal Party vs External Party

| 类型 | 说明 |
|------|------|
| **Internal Party** | 由 Participant 节点创建并托管密钥，节点运营商控制签名。 |
| **External Party** | 密钥由用户自己持有（如钱包），链上操作需**外部签名**后提交，适合钱包/交易所集成。 |

Canton Web Wallet 应使用 **External Party** 模型：密钥在用户侧（或加密存于我方 keystore），通过 Wallet SDK 完成「生成拓扑 → 签名 → 分配」和后续「准备交易 → 签名 → 提交」。

### 1.4 身份与拓扑

- Party 与密钥、Participant 的绑定通过 **拓扑事务（Topology Transactions）** 管理。
- 外部 Party 分配通常涉及：`PartyToParticipant`、`ParticipantToParty`、`KeyToParty` 等。
- 分配流程需与 **Participant 节点**（或通过其暴露的 Ledger API / Wallet API）交互，不能完全离线完成。

---

## 二、钱包创建方式建议（助记词 vs 私钥）

### 2.1 Canton 官方支持的密钥方式

- **Ed25519**：默认推荐，Wallet SDK 示例中普遍使用。
- **BIP-0039 助记词**：官方文档明确支持用 BIP-39 生成助记词 → 种子 → 导出 32 字节私钥 → 再生成 Ed25519 密钥对，用于 Canton 导入。
- **私钥**：密钥对可在本地生成或从助记词/备份恢复；私钥**仅用于签名**，不写入 Canton 链上；公钥指纹进入 Party ID。

### 2.2 建议

| 方式 | 建议 | 说明 |
|------|------|------|
| **助记词（BIP-39）** | 推荐支持 | 与官方示例一致，便于备份与跨端恢复；需约定派生路径（如取种子前 32 字节 + Ed25519）。 |
| **私钥导入** | 推荐支持 | 官方有「Canton Import」等表述，导入私钥后用于签名并分配 External Party 是可行路径。 |
| **仅随机生成新密钥** | 可选 | 可由 Wallet SDK 的 `createKeyPair()` 或等价方式在本地生成，再走分配流程。 |

结论：**可同时支持「助记词创建/恢复」与「私钥导入」**，密钥格式与 Canton 默认（Ed25519）保持一致即可。

---

## 三、是否可以先本地生成钱包地址（Party ID）

- **可以本地「预计算」Party ID**：  
  在已知公钥的前提下，可用 Wallet SDK 的 `TopologyController.createFingerprintFromPublicKey(publicKey)` 得到 fingerprint，再与自选 `partyHint` 拼成 `partyHint::fingerprint`，即未来 Party ID。  
  因此**从私钥/助记词 → 公钥 → Party ID 的推导可以在本地完成**，无需先连网。

- **但链上「生效」必须经过分配**：  
  该 Party ID 只有在完成 **generateExternalParty → 签名 → allocateExternalParty** 之后，才会在 Canton 网络上存在，才能用于查询、转账、合约交互等。  

因此：**可以先在本地生成密钥并算出「将要使用的 Party ID」，但真正作为钱包使用前，必须通过 Canton 节点完成一次 Party 分配**。

---

## 四、服务端与前端各自职责

| 层级 | 建议职责 | 说明 |
|------|----------|------|
| **前端** | 创建/导入密钥（助记词或私钥）、派生公钥、调用 Wallet SDK 发起分配与交易、本地暂存 session、展示 Party ID/余额/交易 | 密钥可仅在内存或安全存储（如安全区），不发给后端。 |
| **后端（当前架构）** | 用户与账号、会话、**加密后的 keystore 备份**、审计日志、通知、配置 | **不接触明文私钥**；若需「服务端助签」，仅处理加密材料或 HSM 输出，不落地明文。 |
| **Canton 参与方** | Party 分配、拓扑、Ledger API（提交命令、查询状态、事件流） | 通过 Wallet SDK / Ledger API 与 Canton 网络通信。 |

建议：**签名与 Party 分配均在前端或受控客户端完成**；后端只做账户、权限、加密备份与审计，与「Canton 是否支持私钥导入/助记词」解耦。

---

## 五、钱包 Keystore 是否适合当前架构

当前设计（仅存储 **encrypted_payload**、不落明文）与 Canton 的 External Party 模型兼容：

- **适合保留**：  
  - 一个 Wallet 对应一个 Canton Party（一个密钥对）。  
  - `wallet_keystores` 存加密后的密钥材料（或仅存加密的私钥备份），由前端或安全模块解密后用于签名。  
  - 后端不解析、不签名，只做存取与访问控制。

- **需要与 Canton 对齐的字段**：  
  - `keyId`：建议用于存 **Canton Party ID**（或 fingerprint），便于与链上身份一一对应。  
  - 若支持多网络/多 Participant，可考虑 `participant_id` 或 `network_id` 等（见下节 DB 建议）。

结论：**当前 keystore 架构适合作为 Canton 密钥的加密备份与索引层**，只需在字段语义上明确对应 Canton Party/密钥，并坚持「后端零明文私钥」。

---

## 六、后续链上功能实现方式

### 6.1 接口与 SDK

| 能力 | 方式 | 说明 |
|------|------|------|
| **RPC / API** | 主要使用 **gRPC Ledger API**（Command / State / Update / Party 等）；部分环境提供 **REST/JSON 封装**（如 Ledger JSON API、Validator API） | 无统一「REST-only」标准，以实际接入的 Canton 环境为准。 |
| **SDK** | **@canton-network/wallet-sdk**（TypeScript，Node/浏览器）：External Party 分配、签名、提交、订阅事件 | 面向钱包/交易所直接对接 Canton。 |
| **其他** | @canton-network/dapp-sdk、各节点/托管方的自定义 API（如 Validator API 查余额） | 按所选网络与节点文档对接。 |

### 6.2 查询余额

- **Ledger API**：通过 **State Service** 或 **Update Service** 查询该 Party 名下的**有效合约**（如 Token 合约），在应用层汇总为「余额」。  
- **Validator API**（若可用）：部分部署提供 `getWalletBalance()` 等封装，直接返回 `total_unlocked_coin` 等。  
- 具体合约模型依赖 Canton 上部署的 **Token Standard**（如 Splice Token Standard）及合约模板。

### 6.3 查询交易

- 使用 **Update Service** 或 **Event Query Service** 按 Party 订阅/查询**已提交交易与事件**。  
- 交易与合约创建/归档/选择对应，需按业务解析为「转账」「批量」「Swap」等。

### 6.4 转账

- 使用 **Command Service**（或 Command Submission + Command Completion）：构造「Exercise 某 Transfer 选择」等命令，由前端（或带签名的客户端）用该 Party 的私钥签名后提交。  
- External Party：通常流程为 **prepareSubmission → 本地签名 → executeSubmissionAndWaitFor**（Wallet SDK 有类似封装）。

### 6.5 批量转账

- 在 Daml/Canton 上通常对应**一笔交易中多个命令**或**批量 Exercise**。  
- Ledger API 支持一次提交多条命令；具体是否支持「批量转账」及额度限制取决于**智能合约与节点配置**，需按实际合约设计实现。

### 6.6 Swap

- 取决于 Canton 上是否部署 **Swap 合约** 或 DEX 模板；若存在，则通过 **Command Service** Exercise 相应选择完成兑换。  
- 与「转账」「批量」一样，需先确认链上合约与 Token Standard，再在应用层拼装命令并签名提交。

---

## 七、推荐开发顺序

1. **确定接入环境**：主网/测试网、Participant 节点或托管服务、Ledger API / Wallet API 端点与认证方式。  
2. **集成 Wallet SDK**：在前端或 Node 侧接入 `@canton-network/wallet-sdk`，完成「密钥生成 → generateExternalParty → 签名 → allocateExternalParty」的**单次 External Party 分配**（暂不落库、不持久化 keystore）。  
3. **查询与展示**：用 Ledger API（State/Update）查询该 Party 的合约/余额，在 UI 展示 Party ID 与余额。  
4. **转账**：实现单笔转账（构造命令 → 签名 → 提交），并与现有「发送」流程对接。  
5. **钱包与 Keystore 持久化**：将「一个用户一个 Party」与现有 `wallets` / `wallet_keystores` 表对齐；密钥仅以加密形式存 `wallet_keystores`，`keyId` 存 Party ID 或 fingerprint。  
6. **助记词/私钥导入与恢复**：在密钥层支持 BIP-39 与私钥导入，再复用同一套分配与签名流程。  
7. **批量转账、Swap**：在合约与 API 支持的前提下，按业务需求实现。

---

## 八、当前数据库设计检查与建议

### 8.1 表：`wallets`

| 字段 | 当前 | 建议 |
|------|------|------|
| id | uuid | 保留。 |
| user_id | 有 | 保留。 |
| label | 可选 | 保留，用户可读名称。 |
| created_at / updated_at | 有 | 保留。 |
| **canton_party_id** | 无 | **建议新增**（或等 Canton 方案确定后加）。一个 Wallet 对应一个 Canton Party，用于链上标识与查询。 |
| **network / participant_hint** | 无 | 若支持多网络/多 Participant，可后续增加。 |

**结论**：现有字段可保留；**必须等 Canton 确认后再实现的**：`canton_party_id` 的写入时机（是否在首次分配成功后由前端回传写入）。可选：网络/参与者标识。

### 8.2 表：`wallet_keystores`

| 字段 | 当前 | 建议 |
|------|------|------|
| id | uuid | 保留。 |
| wallet_id | 有 | 保留。 |
| key_id | 有 | **保留**：建议语义定为 Canton Party ID 或公钥 fingerprint，用于与链上身份一一对应。 |
| encrypted_payload | 有 | 保留，仅存加密后的密钥材料，后端不解密。 |
| key_version | 有 | 保留，便于轮换与迁移。 |
| created_at / updated_at | 有 | 保留。 |
| **key_type / algorithm** | 无 | 可选新增：如 `ed25519`，便于将来多算法。 |
| **participant_id / synchronizer_id** | 无 | 若多 Participant 托管同一 Party，可后续增加。 |

**结论**：当前结构可保留；**必须等 Canton 确认后再实现的**：`key_id` 与 Canton Party ID / fingerprint 的对应规则（是否严格一对一）。可选：算法、Participant 标识。

### 8.3 汇总

- **可保留**：`wallets`（id, user_id, label, 时间戳），`wallet_keystores`（id, wallet_id, key_id, encrypted_payload, key_version, 时间戳）。  
- **建议 Canton 确认后再定**：`wallets.canton_party_id` 的写入时机与唯一性；`wallet_keystores.key_id` 与 Party ID/fingerprint 的约定；多网络/多 Participant 时的扩展字段。  
- **可选新增**：`wallets.canton_party_id`、`wallet_keystores.key_type`（或 algorithm）、多网络时的 network/participant 字段。

---

## 九、参考链接（供后续实现时查阅）

- [Create an External Party (Wallet)](https://docs.digitalasset.com/integrate/devnet/party-management/index.html)  
- [Parties and users on a Canton ledger](https://docs.digitalasset.com/build/3.5/explanations/parties-users.html)  
- [The gRPC Ledger API Services](https://docs.digitalasset.com/build/3.5/explanations/ledger-api-services.html)  
- [Generating Keys from a Mnemonic Phrase (BIP-0039)](https://docs.digitalasset.com/integrate/devnet/party-management/index.html)（同页内）  
- Canton Loop：<https://cantonloop.com>  
- CantonScan：<https://www.cantonscan.com/>

---

---

## 十、结论摘要（直接回答）

1. **Canton 地址是否可以通过私钥生成？**  
   **可以。** Party ID 的后缀是公钥的 fingerprint，公钥由私钥推导，因此从私钥（或助记词→私钥）可在本地推导出公钥 → fingerprint → 未来的 Party ID（`partyHint::fingerprint`）。但该身份要在链上可用，必须再通过 Canton 完成 **Party 分配**。

2. **钱包是否需要通过 Canton Party 创建？**  
   **需要。** 外部钱包 = 本地密钥 + 在 Canton 上分配的 External Party。必须通过参与者节点完成「generateExternalParty → 签名 → allocateExternalParty」，链上才会有该 Party，才能用于查询与转账。

3. **是否可以支持私钥导入？**  
   **可以。** 官方文档有「Canton Import」及从 BIP39 助记词导出私钥的示例；Canton Loop 提供「Import Wallet」。支持助记词/私钥导入，导入后用该密钥参与分配与签名即可。

4. **下一步应该先实现什么？**  
   先完成并评审本文档（七节 + DB 建议）；然后**确定接入的 Canton 环境**（主网/测试网、Participant/API 端点），再按推荐顺序：集成 Wallet SDK → 实现单次 External Party 分配与余额查询 → 单笔转账 → 再接入现有 wallets/wallet_keystores 与助记词/私钥导入。

---

*文档版本：1.0 | 仅作集成设计，不包含实现代码。*
