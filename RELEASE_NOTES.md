# Release Notes

## v1.0.2

**兼容 dsh 0.1.2-alpha.2**

- 客户端 `inject` 显式声明 `remote.session`：新版 Cordis 守卫会把 `directoryFor()` 内部的 session 远端访问归属到插件，不声明则在服务重启后首次创建会话目录时被拒，用量读条全部消失
- 读条宽度计算加 14px 安全边距：新版输入框工具行把 slot 容器改为 `display: contents`，旧的剩余空间算法差几个像素会把整行挤成两行
- `peerDependencies` 的 dsh-* 范围放宽为 `>=`，与实际兼容的 dsh 版本一致

**English**: declare `remote.session` in the client inject (dsh 0.1.2 guard rejects transitive session-remote access, killing all readouts after a restart); add a 14px safety margin to the chip width fit (the new display:contents composer row wrapped to two lines); relax stale peer ranges.


## v1.0.1

**修复：窄窗口下输入框读条覆盖左侧 Full access 下拉框**

- 读条宽度不再使用固定 `max-width` 上限，改为**实测适配**：测量输入框工具行的真实剩余空间（行内宽 − 行间隔 − 左侧工具组 − 右侧模型选择/上下文计量/发送按钮），把读条精确限制在剩余宽度内
- 空间足够时完整显示；空间紧张时平滑截断；剩余不足 80px 时收起为仅图标——任何窗口宽度下都不再向左溢出
- 通过 `ResizeObserver` 监听行与右侧组：窗口缩放、模型切换、发送按钮出现/消失时自动重算（`useLayoutEffect` 首测在绘制前完成，无闪烁）

**English**: chip width is now measured to fit the composer row's actual leftover space instead of a fixed max-width cap — full text when it fits, smooth truncation when tight, icon-only below 80px, so it never overlaps the left "Full access" dropdown at any width; refit is driven by ResizeObserver on the row and the trailing group.

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
