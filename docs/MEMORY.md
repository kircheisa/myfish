# MEMORY — 项目过程记忆（新条目写顶部）

## 2026-11-08 — 修复全域下潜失效 + BGM（第二次全管线）

- "下潜不了"双重根因：①岛屿 falloff `(-1.2)(1-k)` 把全域海床垫平到 1.2m——除海沟外整个海洋是片浅滩，潜水版的地基 bug 从初版就存在，水面玩法掩盖了它；②旧垂直逻辑 wade 禁 Q + 站立 floor 把人顶出水面。修复=falloff 改 -8.5 + 垂直逻辑重写（floor=gh+0.62 俯卧贴底，mode 按 y<-0.75 划分）。
- startBGM 笔误（bgmBus.Q→bgmBus.filter.Q）在 btnStart 回调抛异常，阻断 state.started=true——教训：**按钮回调里的新功能抛错会静默杀死整个启动链**，bootErrors 捕获立功。
- BGM 用 WebAudio 程序化（pad 和弦轮换+五声琶音+水下/夜晚状态映射），零素材守住离线红线。
- SW 更新的完整时序坑再次实证：v5→v6 期间，首次导航被旧 SW+HTTP 缓存(600s)双重发旧版；`clients.claim()` 接管后需**再导航一次**才拿新页。用户侧表现=更新后第一次打开可能还是旧版，刷新即好——已在 quirks。
- serve.js 加 `Cache-Control: no-store` 根治本地调试的缓存干扰（quirks 升格）。


## 2026-11-08 — webgame-pipeline 技能 + 帮助面板（首次全管线实测）

- 用 skill-creator 把 Godogen（Claude Code + Godot）方法论改造成 ZCode 技能 `.zcode/skills/webgame-pipeline/`：SKILL.md 编排 + quirks/visual-qa/pipeline-stages 三参考件。
- 首测任务"帮助面板"全管线跑通：PLAN → 实现 → 程序化+视觉双验收 → push。技能流程无需修正即可用。
- 再次确认 quirks 价值：测试遇 `#help` null，按 quirks"SW 旧缓存污染"条目排查——curl 确认服务器已是新版 → 清 registrations/caches 后恢复，5 分钟定位（首次踩此坑时耗了约 40 分钟）。
- Godogen 不适合本 agent 的部分：Godot API 文档/场景构建器（我们是 three.js）、Tripo3D/302.ai 资产生成（无 key）、Telegram 通道（用 GitHub+Pages 代替）、1M 上下文分支（用技能渐进加载+文档协议代替）。
- 可移植核心：可视化 QA 闭环（截图+视觉模型 fail 循环）、文档协议（PLAN/MEMORY 断点续做）、风险优先分解、quirks 机构知识、≤3 轮修复循环。
