# Quirks — 本项目技术坑全录（机构知识）

每条都是真实踩过、耗时排查过的坑。改代码前扫一遍，能省数小时。

## 运行与部署

- **file:// 直接双击会被 CORS 拦**——ES module 不允许本地文件加载。已解：three.js 内联为 `<script type="text/plain" id="three-src">` + `await import(URL.createObjectURL(new Blob(...)))`。改动 index.html 时**不要破坏这个结构**，也不要重新引入任何外部 `<script src>` / importmap / 字体 CDN（离线红线）。
- **本地服务器用 node 不用 python**——沙箱里 `python -m http.server` 诡异地失败（exit 49）；`node serve.js` 稳定。后台进程会悄悄挂掉：**每次测试会话开始先 curl 探活** http://127.0.0.1:8124，非 200 就重启。
- **GitHub push 网络抖动**——`Recv failure: Connection was reset` 直接重试即可，commit 本地不会丢。Pages 部署 ~40-70 秒，用 `curl ...?v=$RANDOM` + grep 新特征串确认新版上线。
- **Windows 下 node -e 写多行脚本**——路径反斜杠和引号转义极易出错；复杂补丁写成 `.mjs` 临时文件再执行，或用单引号包裹 + 避免嵌套引号。

## Service Worker / PWA

- **TLA 模块里 SW 注册时序**——模块含 top-level await 时，`load` 事件可能在注册代码执行前已触发，`addEventListener('load')` 永不回调。注册前判断 `document.readyState === 'complete'`。
- **SW 调试会污染判断**——旧 SW 缓存会发旧页面，制造"改了没生效"假象。调试期先 `getRegistrations().unregister()` + `caches.delete()` 再硬刷新（`?v=$RANDOM`）。缓存版本号 `CACHE = 'coralchase-vN'` 要随资源变更递增。
- **index.html 任何变更都必须递增 sw.js 的 CACHE 版本号**——否则老用户浏览器里旧 SW 永远发旧缓存（实测踩过：改完部署线上看不到新功能）。且 SW 更新后**当前已打开的页面仍属旧 SW**，新 SW 接管需再导航一次才生效——线上复验失败时先重载一次页面再下结论。

## three.js 渲染（r160）

- **R32F 浮点 DataTexture 兼容性**——部分环境采样极慢（1FPS）。用 RGBA8 双通道 16 位定点编码高度（`R*256+G / 65535 * range + min`），片元手动双线性，全环境可用。
- **r155+ 物理光照**——DirectionalLight 强度量级 2~3，旧教程的 0.5 会导致全黑。
- **ShaderMaterial 输出**——自定义片元末尾要 `#include <tonemapping_fragment>` + `#include <colorspace_fragment>`，否则颜色发灰。
- **静态几何合并**——`mergeGeometries` 已手写内联（非索引 position/normal 拼接）。注意：合并后网格失去 per-mesh 操作，只合并不再动的装饰物；海草要按组内合并保留组级动画。`geometry.clone().applyMatrix4(matrixWorld)` 进世界空间，`deleteAttribute('uv')` 防属性不齐。
- **性能预算**——draw calls <250、桌面 60+FPS。水面是 GPU 大头（透明大平面全屏片元），优化方向：烘焙纹理采样替代解析噪声、dpr 上限（桌面1.5/触屏1.25）、阴影 2048（触屏1024）。
- **顿帧（hitStop）**——用 `dt = rawDt * 0.06` 时间缩放实现，冷却等真实时间用 rawDt 扣，别混。

## 地形（terrainHeight）

- **Math.min 级联陷阱**——曾用 `t = min(t, -18-16*k2)` 写海沟阶梯，k=0 时仍把基底压到 -18，**全图海床被削平、岛屿消失**。环形衰减场必须"累加式"（`t = base - a*k1 - b*k2`）或场外返回 `Infinity`。
- **JS 与 GLSL 数值必须同源**——高度纹理由 JS terrainHeight 烘焙；改地形函数后高度范围变了要同步改 `H_MIN/H_RANGE`（JS 编码 + GLSL decH 解码两处）。
- **改完地形必做数值回归**——node 里独立复刻 terrainHeight 函数，采样关键点（岛心/沟心/出生点）+ 统计深度带占比，别只看渲染。

## 浏览器自动化（测试基建）

- **合成 KeyboardEvent 可驱动游戏**——`window.dispatchEvent(new KeyboardEvent('keydown', {key:'w'}))` 生效（游戏监听 window keydown 读 e.key）。长按=保持 keydown 不发 keyup；冷却类要按游戏节奏 sleep。
- **传送测试注意状态绑定**——鱼有 `posBaseY` 深度层，直接改 pos.y 会被下一帧覆盖；测试要么对齐深度层，要么走玩家真实下潜。
- **Playwright 点击探针偶发失效**——`pointer probe returned no click point` 时：先 `getBoundingClientRect` + `elementFromPoint` 验证元素可点，再用 `tab.cua.click({x, y})` 坐标点击。
- **截图偶发 `capture failed for guest`**——重试一次即可，属临时性错误。
- **module 加载失败先查启动错误**——页面已埋 `window.__bootErrors`（error + unhandledrejection 捕获），比黑盒猜快得多。

## UI / 移动端

- **视口与安全区**——`viewport-fit=cover` + `env(safe-area-inset-*)`；触屏判定 `'ontouchstart' in window`（桌面模拟器不会自动有），测试时手动 `document.body.classList.add('touch')`。
- **emoji 当图标**在移动端渲染不一致但可接受；图标风格统一用 emoji + 深蓝面板青描边。
- **字体离线**——不引 Google Fonts；`Share Tech Mono, monospace` 栈回退系统等宽。

## 游戏机制（易回归点）

- 改捕获/交互逻辑时联动面很广：连击、订单、成就、教学链、rawFish 库存全挂在 doCatch/interact 上——动这里后全量回归。
- 存档 schema 加字段要向后兼容（`save.xxx || 默认值`），清档按钮行为要覆盖新字段。
- `castNet` 只在 swim 态可用；陆地空格=抓螃蟹/长矛。改空格路由时保持这个优先级。
