# 全站访问统计（Vercount）指南

> 配置真源：`src/config/vercountConfig.ts`；类型：`src/types/vercountConfig.ts`。
> 零额外负担的通用规范见 [`on-demand-loading.md`](./on-demand-loading.md)。

## 1. 它做什么、不做什么

| 需求 | 由谁负责 |
|---|---|
| 页脚「总访问量 / 总访客数」 | **本模块**（Vercount） |
| 文章底部的「本页阅读」 | **评论系统**（Twikoo 的 `<span id="twikoo_visitors">`，见 `commentConfig`） |
| 后台分析（来源、设备、事件） | Umami（`umamiConfig`） |

三者刻意不重叠：同一篇文章上出现两个来源不同的「阅读量」时，数值必然互相矛盾，因此本模块**只输出全站口径**，不含单篇计数。

## 2. 启用

```ts
// src/config/vercountConfig.ts
export const vercountConfig: VercountConfig = withUserConfig("vercount", {
	enable: true, // ← 打开
	scriptUrl: "https://events.vercount.one/js",
});
```

关闭时（默认）不渲染页脚统计 DOM、不注入任何脚本、不产生任何外部请求。

## 3. 为什么不是不蒜子（busuanzi）

不蒜子是最常见的选择，但 2026-10 的实测结果不支持继续用它：

- 静态脚本仍在服务：`//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js` 返回 200，
  `Last-Modified` 停在 **2020-11-23**（文件约 6 年未更新）；
- 但**计数接口** `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=…` 连续多次
  无响应（12s / 20s / 30s / 35s 均无回调）；
- 它的容器默认隐藏、**只在回调成功后才 `display:inline`** —— 接口不恢复时页脚会
  **静默地什么都不显示**（不是显示 0）。因此本项目不提供「硬编码 0 兜底」，那只会把故障伪装成真实数据；
- 它的访客去重依赖第三方 cookie，现代浏览器分区/拦截后同一访客可能被反复计为新访客；
- 它的 id 是 `busuanzi_value_*`，与 Vercount 的 `vercount_value_*` **不通用**
  （「Vercount 兼容不蒜子 id」的说法已被实测否掉）。

## 4. DOM 契约

统计脚本按**固定 id** 回填数值，站点侧只需提供同名元素：

| id | 含义 |
|---|---|
| `vercount_value_site_pv` | 全站总访问量 |
| `vercount_value_site_uv` | 全站总访客数 |

容器需带 `data-vercount-root`（运行时据此判断「页面是否有统计目标」），初始内容为 `—`；
脚本加载结束（含失败）后容器会带上 `data-vercount-ready="true"` 并解除 `aria-busy`。
失败时保留占位符——不假装有数据。

## 5. Swup 下的计数行为（关键）

Vercount 以**脚本执行**计一次浏览，因此：

- 运行时**每次导航注入一个新的 `<script>`**，并移除上一次的；
  **不能**用 `utils/script-loader.ts` 的 `loadScriptOnce()`——复用缓存脚本会让站内导航后不再计数；
- 反过来，Swup 的 `content:replace` 与 `page:view` 都会触发调度，重复注入会**双倍计数**，
  因此运行时以「路径」为令牌，保证同一次导航只注入一次；
- 这是 `on-demand-loading.md` §3 L4 记录的「一次性脚本例外」，与 giscus 同类。

## 6. 验证

### 6.1 关闭态（零负担）

```bash
pnpm.cmd build
```

确认 `dist/` 所有页面中：无 `data-vercount-root`、无 `id="shirone-vercount-script"`、
无指向计数服务的 `<script>`。

### 6.2 开启态（机制正确性，离线可跑）

```bash
npx.cmd playwright test tests/site/vercount.spec.ts
```

该用例**伪造**计数脚本（`page.route` 拦截脚本地址），因此不依赖第三方服务是否可用，
断言的是本站自己的机制：

1. 页脚出现两个固定 id 的容器；
2. 首次加载后脚本恰好执行 **1** 次；
3. 站内导航到另一个页面后恰好执行 **2** 次（每次导航一次，不多不少）；
4. 页面上始终只有 **1** 个运行时注入的 `<script>` 元素。

### 6.3 开启态（真实服务，人工确认）

自动化无法判断第三方是否真的记账，需要人工看一眼：

1. 打开首页 → 页脚数值应从 `—` 变为真实数字；
2. 站内点进任意文章再返回首页 → 刷新后总访问量应增加（Vercount 面板或再次加载均可核对）；
3. 若第 2 步数值不变，说明该服务对「同一文档内重复执行」有内部去重，
   此时应改为在每次导航后整页刷新，或换用自建计数（见 §7）。

## 7. 已知边界与替代方案

- Vercount 是**单一维护者的公益项目**（GPL-3.0、可自托管），可用性不由本站控制；
  一旦停摆，页脚会停在占位符 `—`（不会显示错误数字）；
- 「客户端导航后第三方是否继续计数」**尚未实测确认**（§6.3 第 2 步就是为它准备的）；
- 若要完全自主，可自建计数：Cloudflare Workers + KV / Upstash Redis + 一个函数，
  公开读数由一个只读端点提供。代价是要自己维护服务与防刷；
- 不要同时启用两个**公开**计数器：两个来源的数字迟早会互相矛盾。
