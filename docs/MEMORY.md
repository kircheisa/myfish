# MEMORY — 项目过程记忆（新条目写顶部）

## 2026-11-08 — webgame-pipeline 技能 + 帮助面板（首次全管线实测）

- 用 skill-creator 把 Godogen（Claude Code + Godot）方法论改造成 ZCode 技能 `.zcode/skills/webgame-pipeline/`：SKILL.md 编排 + quirks/visual-qa/pipeline-stages 三参考件。
- 首测任务"帮助面板"全管线跑通：PLAN → 实现 → 程序化+视觉双验收 → push。技能流程无需修正即可用。
- 再次确认 quirks 价值：测试遇 `#help` null，按 quirks"SW 旧缓存污染"条目排查——curl 确认服务器已是新版 → 清 registrations/caches 后恢复，5 分钟定位（首次踩此坑时耗了约 40 分钟）。
- Godogen 不适合本 agent 的部分：Godot API 文档/场景构建器（我们是 three.js）、Tripo3D/302.ai 资产生成（无 key）、Telegram 通道（用 GitHub+Pages 代替）、1M 上下文分支（用技能渐进加载+文档协议代替）。
- 可移植核心：可视化 QA 闭环（截图+视觉模型 fail 循环）、文档协议（PLAN/MEMORY 断点续做）、风险优先分解、quirks 机构知识、≤3 轮修复循环。
