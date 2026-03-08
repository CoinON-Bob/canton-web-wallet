# Canton 开发环境方案评估

本文档评估当前项目接入 Canton 的三种方式，面向「尽量不占用本机资源、优先非本地」的诉求，仅作方案说明，不涉及代码修改或业务扩展。

参考：  
- [Canton Network Overview](https://docs.digitalasset.com/integrate/devnet/canton-network-overview/index.html)  
- [Integrating with the Canton Network](https://docs.digitalasset.com/integrate/devnet/integrating-with-canton-network/index.html)  
- [Current Validators / NaaS](https://sync.global/current-validators-offering-nodes/)  
- [Validator Onboarding (DevNet)](https://docs.dev.global.canton.network.sync.global/validator_operator/validator_onboarding.html)

---

## 一、三种接入方式概览

### A. 本地 LocalNet

| 项目 | 说明 |
|------|------|
| **含义** | 在本机用 Docker Compose 等跑 Canton 本地网（LocalNet），Wallet SDK 默认示例即针对此环境。 |
| **优点** | 与官方示例一致、无外部依赖、断网可测、调试方便。 |
| **缺点** | 占用本机 CPU/内存/磁盘和 Docker；需本机长期开容器才能联调。 |
| **适用** | 本地做 PoC、学习、单机联调；不适合「不想本地折腾」的优先诉求。 |

### B. 远程 VPS 部署开发环境

| 项目 | 说明 |
|------|------|
| **含义** | 在云上一台 VPS 上部署 Canton 节点（Docker Compose 或 Kubernetes），本机只跑应用与 Wallet SDK，通过配置连接 VPS 的 Ledger API / Topology 等。 |
| **优点** | 不占本机资源；可 7×24 运行；VPS 通常有固定出口 IP，便于 DevNet 白名单。 |
| **缺点** | 需自行部署、升级、监控节点；需准备 VPS 规格与网络（见下）。 |
| **适用** | 希望环境在「远程」、能接受自己管一台节点的团队。 |

### C. 共享 / 托管 / 公共开发环境

| 项目 | 说明 |
|------|------|
| **含义** | 不自己跑节点，使用 Canton 官方的 **Node-as-a-Service (NaaS)** 或其它托管方提供的 validator/participant 能力，通过其提供的 Ledger API、认证信息等接入。 |
| **优点** | 无需部署和维护节点，官方描述为「immediate access」「minimal setup」；由专业方负责可用性与合规。 |
| **缺点** | 依赖第三方；需联系供应商获取端点、认证、定价与密钥策略。 |
| **适用** | 「尽量不想本地折腾」且希望快速开始时，**优先考虑**。 |

---

## 二、关键结论（基于官方与生态资料）

### 2.1 是否必须有 validator 才能创建/激活 external party？

**必须。**  

- 官方明确：*"To offer services on the Canton Network, you will need a **validator node to host your parties** and your customers' parties."*  
- Party 使用方式：*"To use a party, you must **onboard it** by submitting a topology transaction that **authorizes a node to host it**. The designated **node must then submit a matching transaction** to officially accept the hosting request."*  

因此：**创建并激活 external party 必须经由某一 participant/validator 节点**——要么自建（本地或 VPS），要么使用 NaaS 等托管节点。没有「仅用区块浏览器或公共 RPC」就能完成 party 分配的方式。

### 2.2 是否存在共享 validator / 托管方式可快速开始？

**存在。**  

- 官方提供 **Node-as-a-Service (NaaS)** 列表：  
  https://sync.global/current-validators-offering-nodes/  
- 描述：*"The fastest way to participate in the Canton Network is through a **white-label validator node professionally operated** by an approved Canton Node-as-a-Service provider. This option gives you **immediate access without needing to deploy or maintain your own infrastructure**."*  
- 多家运营商（如 Zodia、Figment、Blockdaemon、Kiln 等）提供托管节点，需**主动联系**获取：接入端点、认证方式、定价、密钥管理策略等。

### 2.3 只有区块浏览器是否足够？

**不够。**  

- Canton 的数据访问模型是「**按 party 到其托管节点**」：*"To access a party's or user's data, you must **specifically connect to the validator that hosts that party**. There is **no single, all-encompassing blockchain RPC endpoint** you can call to retrieve all data."*  
- 区块浏览器（如 CantonScan）仅提供**只读、公开或聚合视图**，不提供：  
  - 创建 / 分配 external party  
  - 提交拓扑事务  
  - 通过 Ledger API 提交、签名交易  
  - 查询你方 party 的私有状态（需连托管该 party 的节点）  
- 因此：**仅用区块浏览器无法完成钱包所需的「创建 party、查余额、转账」等能力**，必须至少具备一个可用的 **Ledger API（及拓扑/认证）** 接入点，即背后必须有一个为你方 party 提供托管的 validator/participant。

### 2.4 空 VPS 还缺哪些条件才能真正跑 Canton 开发环境？

在「空 VPS」之上，要能跑通 Canton 开发环境（含创建 external party、查余额、提交交易），至少需要：

| 类别 | 需要准备的内容 |
|------|----------------|
| **节点与运行时** | 安装并运行 Canton 节点（Docker Compose 或 Kubernetes），按官方 [Validator Compose](https://docs.dev.sync.global/validator_operator/validator_compose.html) / 硬件要求部署。 |
| **硬件与 DB** | 满足 [Validator Hardware Requirements](https://docs.dev.global.canton.network.sync.global/validator_operator/validator_hardware_requirements.html)：如开发/低负载至少 2 CPU、8GB 内存，数据库 2 CPU、4GB、10GB+；生产级需更高。 |
| **网络与准入** | **固定 egress IP**（DevNet 要求该 IP 被 SV 加入 allowlist，通常 2–7 天）；或通过 SV 提供的 VPN 出网。若只跑 LocalNet 可不需要 DevNet 白名单。 |
| **准入与认证** | DevNet：可自生成 onboarding secret（API，1 小时有效）；TestNet/MainNet 由 SV 提供 onboarding secret。部署后需**开启认证**（默认 Docker 配置不安全）。 |
| **应用侧配置** | 将 Wallet SDK / 本项目的 Canton 配置指向该 VPS 的 **Ledger API 基址**、**Topology（Scan Proxy）** 等，并配置认证（如 NaaS 或自建节点提供的 token/credentials）。 |

概括：空 VPS 缺的是「**一整套 Canton 节点部署 + 网络准入 + 认证 + 应用配置**」，不是仅装一个软件就能用。

---

## 三、三种方案的优缺点对比

| 维度 | A. 本地 LocalNet | B. 远程 VPS | C. 共享/托管 NaaS |
|------|------------------|-------------|-------------------|
| 本机资源占用 | 高（Docker + 内存/CPU） | 无 | 无 |
| 部署与运维 | 自己管本地容器 | 自己管 VPS + 节点 | 供应商管节点 |
| 上线速度 | 快（按文档起 LocalNet） | 中（VPS + 部署 + 若用 DevNet 需等白名单） | 快（联系到供应商并拿到配置即可） |
| 成本 | 仅电费/机器 | VPS + 时间成本 | 供应商报价（通常按节点/用量） |
| 可控性 | 完全可控 | 完全可控 | 依赖供应商 SLA/策略 |
| 与官方示例一致性 | 完全一致 | 需改 URL/认证 | 需按供应商文档改 URL/认证 |

---

## 四、针对「尽量不想本地折腾」的推荐

**最推荐：优先尝试 C. 共享/托管（NaaS）方案。**

理由简述：

1. **不占本机、也不占你方运维**：节点由 NaaS 运营商部署和维护，你只需在应用里配置端点与认证。  
2. **与「非本地、少折腾」目标一致**：无需在本机或 VPS 上部署 Canton 节点，无需关心 egress IP、allowlist、onboarding secret 等运维细节。  
3. **官方背书**：NaaS 为 Canton 官方列出的参与方式，适合钱包/托管类产品快速接入。  
4. 若后续有合规或成本考虑，再评估 **B. VPS 自建** 或混合方案。

在**暂时无法获得 NaaS 接入**（例如尚未签约、仅做 PoC）时，退而求其次可选 **B. 单台 VPS + Docker Compose**，把「折腾」放在远程一台机器上，本机只跑应用和 SDK。

---

## 五、若走 VPS 方案，需要提前准备什么

- **VPS**：Linux（推荐），满足 [Validator Hardware Requirements](https://docs.dev.global.canton.network.sync.global/validator_operator/validator_hardware_requirements.html) 中开发/低负载档（如 2 vCPU、8GB RAM、数据库资源）。  
- **固定出口 IP**：若接入 DevNet，需将该 VPS 的 egress IP 提供给 SV 做 allowlist，并预留约 2–7 天。若无固定 IP，需确认是否可通过 SV 提供的 VPN 等方式接入。  
- **软件与配置**：Docker Compose v2.26+（或 Kubernetes）、curl/jq；从官方渠道获取对应网络（DevNet/TestNet）的部署包与配置；部署后启用认证、记录 Ledger API / Scan Proxy 等 URL。  
- **应用侧**：在项目配置中填写该 VPS 的 Ledger API 基址、Topology（Scan Proxy）URL、以及认证信息（token 或 NaaS 提供的 credentials），并关闭或覆盖当前代码里对 LocalNet 默认 URL 的硬编码。

---

## 六、若走共享/托管方案，需要向客户或官方索取什么信息

向 **NaaS 供应商**（或提供托管环境的客户/合作方）索取并确认：

| 信息 | 用途 |
|------|------|
| **Ledger API 基址** | Wallet SDK / 应用连接 participant，提交命令、查询状态与事件。 |
| **Scan Proxy API / Topology 基址** | SDK `connectTopology(...)`、部分查询与拓扑发现。 |
| **认证方式** | 如 OAuth2 client credentials、JWT、API key 等，以及对应的 client_id / secret、audience、scope（若适用）。 |
| **网络标识** | 当前为 DevNet / TestNet / MainNet，以便选用对应 DAR、合约版本与文档。 |
| **外部 party 与用户管理** | 是否由供应商预创建「应用用户」、是否支持你方自行通过 Ledger API 做 external party 分配与 user rights；有无 IP/速率限制。 |
| **SLA 与支持** | 故障联系窗口、升级与重启策略，以便评估可用性。 |

若对方是**客户或合作方**而非标准 NaaS 列表中的运营商，同样按上表索要「Ledger API + Topology + 认证 + 网络」等，并确认其节点已允许你方在该环境下创建/托管 external party。

---

## 七、当前项目下一步最合理的推进方式

1. **先定环境，再加功能**  
   - 当前已有 Canton SDK 接入与 external party 创建流程，但依赖「某个可用的 Canton 节点」。在**没有稳定环境**（LocalNet / VPS / NaaS）前，继续做余额、转账等链上功能，会长期处于「本地无网则 500、有网则依赖未定」的状态。  
   - 建议：**优先落实一种非本地环境**（首选 NaaS，备选 VPS），在配置中切到该环境的 Ledger API + Topology + 认证，并跑通一次「创建 external party + 查询」的 E2E，再推进余额查询、转账等。

2. **具体动作建议**  
   - **若选 NaaS**：从 [Current Validators Offering Nodes](https://sync.global/current-validators-offering-nodes/) 中选 1–2 家联系，索取上述第六节的清单；拿到后在本项目增加环境变量/配置（如 `CANTON_LEDGER_URL`、`CANTON_TOPOLOGY_URL`、认证相关），去掉或覆盖对 LocalNet 默认 URL 的硬编码，验证 create-wallet 与 get-party。  
   - **若选 VPS**：准备一台满足硬件与网络要求的 VPS，按官方 Docker Compose（或 K8s）文档部署对应网络，完成 allowlist（若 DevNet）与认证，再将应用配置指向该节点，同样先验证 party 创建与查询。  
   - **若短期仅 PoC**：可暂时保留 LocalNet 选项，在文档中注明「完整链上功能需配置远程或托管 Canton 环境」，避免误以为「仅区块浏览器或公网 RPC」即可。

3. **不推荐**  
   - 在环境未定、且无可用 Ledger API 的情况下，继续扩展更多链上业务代码（余额、转账、swap 等），会导致联调与验收都依赖尚未就绪的节点，效率低且易返工。

---

*文档版本：1.0 | 仅方案评估，不修改代码与前端。*
