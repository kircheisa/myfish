---
name: webgame-pipeline
description: >
  网页游戏（three.js/单文件 HTML）全流程开发管线：规划（风险分解）→ 实现 →
  可视化 QA 闭环（浏览器实测截图 + 视觉模型验收）→ 提交推送。改编自 Godogen
  方法论，适配 ZCode。当用户要求"给游戏加功能"、"做个游戏"、"优化游戏"、
  "修游戏 bug"、"验证游戏效果"、"继续做游戏"时使用——任何涉及本仓库
  index.html 游戏的开发、调试、验收、迭代工作都应触发本技能。
---

# Webgame Pipeline — 网页游戏开发管线（Godogen 改造版）

把"一句话需求"变成"已验证上线的小游戏功能"。核心信条：**不信任代码，只信任截图**。

## 项目现状（先读）

- 游戏本体：`index.html` 单文件（three.js 已内联为 Blob，双击可玩、PWA 离线）
- 本地服务器：`node serve.js` → http://127.0.0.1:8124（**测试前必须 curl 探活**，后台进程会挂）
- 线上：https://kircheisa.github.io/myfish/（push 后 ~1 分钟部署完成）
- 测试钩子：`window.__game` 暴露 boat/fishes/state/inventory/stats 等（加新系统时同步扩展）

## Pipeline

```
用户需求
  │
  ├─ 1. 断点续做：docs/PLAN.md 存在且有未完成任务？→ 读 PLAN+MEMORY 直接跳到执行
  │
  ├─ 2. 规划：风险分解 → 写/更新 docs/PLAN.md（模板见 references/pipeline-stages.md）
  │     · 常规功能（UI/数值/动画/采集类）批量一份任务
  │     · 高风险项（地形/着色器/物理/架构改动）单独隔离任务，先做先验证
  │
  ├─ 3. 执行：高风险任务先行 → 每任务 = 实现 → 程序化验证 → 可视化 QA → git commit
  │     · 改 JS 前必读 references/quirks.md（本项目全部已踩坑，能省数小时）
  │     · 语法检查：node -e 提取 module 脚本 → node --check（详见 quirks）
  │
  ├─ 4. 可视化 QA：按 references/visual-qa.md 走（截图 + 视觉模型 + fail 修复循环）
  │
  ├─ 5. 收尾：更新 docs/MEMORY.md（新发现/新坑）→ push → 等 Pages 部署 → 线上复验
  │
  └─ 6. 向用户汇报：贴线上地址 + 实测数据（FPS/验证项），失败项如实说
```

## 三个子文件，按阶段读

| 文件 | 何时读 |
|------|--------|
| `references/quirks.md` | 动手改代码前——本项目技术坑全录（file://、SW、纹理、地形、测试基建） |
| `references/visual-qa.md` | 每个任务实现后——截图验收与 fail 循环的标准流程 |
| `references/pipeline-stages.md` | 规划阶段——风险分解原则 + PLAN/MEMORY 文档模板 + 平衡校准法 |

## 铁律

1. **视觉 QA 的 fail 判定必须处理**：修复，或确属误报时向用户说明，绝不静默跳过。
2. **上下文卫生**：状态写进 docs/PLAN.md 与 docs/MEMORY.md，会话被压缩也能续做；每任务完成即 commit。
3. **修复循环 ≤3 轮**：同一问题 3 轮不收敛 → 判断根因在架构则重规划，否则上报用户。
4. **测试先探活**：`curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8124/` 非 200 先重启 serve.js，再继续调试。
5. **汇报带证据**：FPS/draw calls/验证清单，不说"应该可以了"。
