# Release Notes

## v1.0.0

**极简 DSH 用量监控 · 首发**

DSH 插件首发：在对话里查看你的 Kimi（月之暗面）Coding Plan 订阅配额。

**功能**

- `/usage-kimi-cn` 命令：完整配额报告（Plan 等级 + Rolling/Weekly + 各窗口已用/剩余/重置时间）
- 输入框右下角常驻读条：`Rolling x% (倒计时) · Weekly x% (倒计时)`，每分钟自动刷新，格式与五插件家族统一
- 读条只在当前会话选中 **Kimi** provider（`kimi-coding`）时显示，切到其他模型自动隐藏
- 读条可点击，打开 [Kimi Code 平台](https://www.kimi.com/code)
- 密钥只在 DSH 主机端解析，不进浏览器；密钥名 `KIMI_CODING_API_KEY` 与 `dsh-llm-kimi-cn` 共用

> **注意**：使用 Kimi Code 控制台创建的 API Key（格式 `sk-kimi-xxx`），不是 Moonshot
> 开放平台的 Key（格式 `sk-xxx`）。两种 Key 不互通。

**安装**

```bash
cd ~/.dsh/profiles
npm install dsh-usage-kimi-cn --save --registry=https://registry.npmjs.org
```

然后在 `cordis.patch.yml` 里 insert `kimi-cn-usage` 条目（见 README）。
