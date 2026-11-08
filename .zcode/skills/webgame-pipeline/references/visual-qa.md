# Visual QA — 可视化验收闭环

**不信任代码，只信任截图。** 代码看起来对 ≠ 画面对。每个任务实现后走本流程。

## 前置

```bash
# 1. 探活服务器（后台进程会挂，必做）
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8124/   # 非200 → 重启 node serve.js
```

浏览器用 browser-use:control-browser 技能（mcp__node_repl__js）。每次调用要重新 bootstrap，tab 用 `browser.tabs.list()` 找回。

## 第一道：程序化验证（快，先跑）

```js
// 模式：读状态断言（不依赖画面）
const r = await tab.playwright.evaluate(async () => {
  const G = window.__game;
  if (!G) return { err: 'module failed', bootErrors: window.__bootErrors };
  // ...操作 + 断言：G.state.score、G.inventory、G.mode、document.querySelector('...')
  return { ...数值结果, stats: G.stats() };
});
```

- 新系统必须扩展 `window.__game` 暴露只读视图（getter），测试才有抓手。
- 输入驱动：`window.dispatchEvent(new KeyboardEvent('keydown', {key:'w'}))`。
- 传送：直接设 `G.boat.position`，但注意联动状态（鱼深度层、mode），见 quirks。

## 第二道：截图 + 视觉模型验收（每个任务至少 1 张）

```js
nodeRepl.emitImage(await tab.screenshot());
```

截图后用 analyze_image 视觉工具验收。**提示词要素**（缺一项就漏检）：
1. **本次改动的预期**——"应显示 X / X 应为 Y 色"
2. **通用质量清单**——渲染伪影（黑块/破面/闪烁/穿模）、UI 完整无重叠溢出、构图合理性
3. **要求具体可答**——让模型逐项回答，别问"好看吗"

例：
> "这是加了 X 功能的截图。请检查：1. X 是否正常显示（描述预期形态）？2. 左上 HUD/右下小地图/底部按钮是否完整无遮挡？3. 有无黑块、破面、穿模、UI 重叠？逐项回答。"

### 三种模式（对应 Godogen）

| 模式 | 场景 | 做法 |
|------|------|------|
| 静态 | UI/场景/装饰 | 1 张代表帧（避开刚加载首帧） |
| 动态 | 行为/动画/物理 | 布置场景→执行操作→中段截图（或多帧） |
| 问答 | 调查类 | 直接对截图提问（"水面是否有色带？"） |

## fail 循环

- 视觉模型报 **major/minor 问题** → 修复 → 重截图复验。
- **≤3 轮**：不收敛时判断——参数问题继续修；架构问题（改法本身错了）回 PLAN.md 重规划；都找不到原因 → 连证据截图一起上报用户。
- **疑似误报**（模型描述与实际矛盾）→ 用第二张不同角度截图复核，仍矛盾则向用户说明，不静默通过。

## 移动端验收（涉及 UI 改动时）

```js
await tab.setViewportSize({ width: 390, height: 844 });
// 触屏 UI 手动开启：document.body.classList.add('touch')
```

检查：虚拟键不重叠、HUD 紧凑、无溢出、FPS 可接受。

## 上线复验

push 后等 Pages 部署（`curl 线上地址 | grep 新特征串`），线上跑一遍程序化验证 + 1 张截图。线上行为与本地不一致时优先怀疑 SW 缓存（quirks）。
