<p align="center">
  <img src="https://img.shields.io/npm/v/dsh-usage-kimi-cn" alt="npm version" />
  <img src="https://img.shields.io/npm/dw/dsh-usage-kimi-cn" alt="npm downloads" />
  <img src="https://img.shields.io/npm/l/dsh-usage-kimi-cn" alt="license" />
</p>

<h1 align="center">dsh-usage-kimi-cn</h1>

<p align="center">
  <strong>极简 DSH 用量监控 · Minimal DSH usage monitor</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-usage-kimi-cn">npm</a>
  · <a href="https://github.com/jooey/dsh-usage-kimi-cn">GitHub</a>
  · <a href="#install-install">Install</a>
</p>

---

**中文** · [English](#english)

把 Kimi（Moonshot AI）Coding Plan 订阅配额放进 DSH 对话界面：输入 `/usage-kimi-cn` 查看完整报告；选中 Kimi 模型时，输入框右下角常驻读条，每分钟自动刷新。切到其他模型自动隐藏。

- **右下角读条**：`Rolling x% (倒计时) · Weekly x% (倒计时)`，订阅档位悬停可见
- **`/usage-kimi-cn` 命令**：5 小时滚动窗口 + 周配额的百分比与重置时间
- **密钥安全**：只在 DSH 主机端解析，绝不进浏览器

## 系列插件 / Family

同一套极简监控，覆盖五家服务商，格式统一（`Rolling x% (倒计时) · Weekly …`）：

| 插件 | 服务商 | 监控内容 |
|---|---|---|
| `dsh-usage-opencode-go` | OpenCode Go | Rolling / Weekly / Monthly 配额 |
| `dsh-usage-deepseek` | DeepSeek | 账户余额 + 波峰/波谷 |
| `dsh-usage-minimax-cn` | MiniMax Coding Plan | coding / video 分服务配额 |
| `dsh-usage-kimi-cn` | Kimi Coding Plan | Rolling / Weekly 配额 |
| `dsh-usage-glm-cn` | Z.ai GLM Coding Plan | Rolling / Weekly / MCP 配额 |

## 先决条件 / Prerequisites

- 已安装 **DSH**（Node.js >= 20）：`npm install -g @deepseek-ai/dsh`
- **Kimi Code API Key**（注意是 Kimi Code 控制台的 `sk-kimi-xxx` 格式，不是 Moonshot 开放平台的 `sk-xxx`），写入 `~/.dsh/.credentials.yaml`：

```yaml
KIMI_CODING_API_KEY: sk-kimi-你的key
```

（或 `export KIMI_CODING_API_KEY=<key>`）

## Install 安装

```bash
cd ~/.dsh/profiles
npm install dsh-usage-kimi-cn --save --registry=https://registry.npmjs.org
```

> ⚠️ **从旧版本（< 1.1.1）升级请注意**：旧版的 peerDependencies 会让 npm 自动把旧版 `@deepseek-ai/*` 核心包装进 profile 的 node_modules 根部，遮蔽宿主新版导致启动崩溃（`registerFileReceiptResolver` 报错）。1.1.1 起已修复（全部标记为 optional peer）。如已中招：删掉 profile 下 `node_modules/@deepseek-ai` 和 `package-lock.json`，再用 pnpm 重装；或改用下方 `dsh plugin --profile web add dsh-usage-kimi-cn` 一键安装（推荐）。

然后在 `~/.dsh/profiles/web/cordis.patch.yml` 追加：

```yaml
- insert:
    - id: kimi-cn-usage
      name: 'dsh-usage-kimi-cn'
```

重启 / 刷新 web GUI 生效。

<details>
<summary>其他安装方式（一键 / git / 脚本）</summary>

```bash
# 一条命令装到 DSH（自动写 patch，幂等）
dsh plugin --profile web add dsh-usage-kimi-cn

# git 安装
dsh plugin --profile web add github:jooey/dsh-usage-kimi-cn

# 一键脚本
./install.sh        # Linux / macOS
.\install.ps1       # Windows
```

</details>

## Usage 使用

- 对话里输入 **`/usage-kimi-cn`** → 完整配额报告
- 选中 **Kimi** 模型 → 右下角读条出现

```text
右下角读条：

Rolling 33.0% (1h 5m) · Weekly 22.0% (4d 3h)
```

## Troubleshooting

- `KIMI_CODING_API_KEY is not configured` —— 检查 `~/.dsh/.credentials.yaml`
- 401 / 鉴权失败 —— 确认用的是 **Kimi Code 控制台**的 key（`sk-kimi-` 前缀），不是 Moonshot 开放平台的 key
- 读条不显示 —— 确认当前选中的是 Kimi 模型，再硬刷新（`Ctrl+Shift+R`）

---

## English

Put your Kimi (Moonshot AI) Coding Plan quota right inside the DSH conversation UI: type `/usage-kimi-cn` for a full report, and while a Kimi model is selected, a live chip sits in the bottom-right of the composer — auto-refreshed every minute. Hides itself automatically on other models.

- **Composer chip**: `Rolling x% (countdown) · Weekly x% (countdown)`; membership tier shown on hover
- **`/usage-kimi-cn` command**: 5-hour rolling window + weekly quota percentages with reset times
- **Key safety**: resolved host-side only, never inlined into the browser

## Prerequisites

- **DSH** installed (Node.js >= 20): `npm install -g @deepseek-ai/dsh`
- A **Kimi Code API key** (from the Kimi Code console, `sk-kimi-xxx` format — not the Moonshot open-platform `sk-xxx` key) in `~/.dsh/.credentials.yaml`:

```yaml
KIMI_CODING_API_KEY: sk-kimi-your-key
```

## Install

```bash
cd ~/.dsh/profiles
npm install dsh-usage-kimi-cn --save --registry=https://registry.npmjs.org
```

> ⚠️ **Upgrading from < 1.1.1?** Older versions declared peer dependencies that made npm auto-install outdated `@deepseek-ai/*` core packages into the profile's node_modules root, shadowing the newer host packages and crashing startup (`registerFileReceiptResolver` error). Fixed since 1.1.1 (all marked optional peers). If affected: delete `node_modules/@deepseek-ai` and `package-lock.json` in the profile, reinstall with pnpm — or use `dsh plugin --profile web add dsh-usage-kimi-cn` below instead (recommended).

Then append to `~/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: kimi-cn-usage
      name: 'dsh-usage-kimi-cn'
```

Restart / refresh the web GUI to activate.

MIT License · Welcome a ⭐ Star!
