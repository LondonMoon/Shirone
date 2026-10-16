# 二次元装饰素材指南

> 适用：Hero 横幅、页脚、文章头部贴纸、番剧页横幅的装饰图。
> 相关配置：`src/config/siteConfig.ts`（banner）、`src/config/footerConfig.ts` + `FooterConfig.html`、
> `src/config/decorConfig.ts`（文章头部贴纸 + 番剧页横幅）、`src/config/sidebarConfig.ts`。

## 0. 素材放哪：两条路径，按落点选

本仓库提供两条互斥的素材路径，**能力不同**，先选路线再放图：

| 路径 | 进 git | 图片管线 | 适用 |
|---|---|---|---|
| **`src/assets/images/deco/`**（推荐） | ✅ 提交 | **AVIF(q55)/WebP(q68) + 1280/1600/1920 srcset**（`ImageWrapper` / `getImage`） | 授权干净的素材；想要优化与响应式 |
| `public/assets/anime-deco/`（`.gitignore:59`） | ❌ 不进 | 原样输出的普通 `<img>`：**无 AVIF、无 srcset、无重编码** | 版权不明、不愿进公开仓库的素材；需自行预压缩 |

引用方式：

```ts
// 路线一：相对 src/ 的路径，走构建期优化
postSticker: { src: "assets/images/deco/sticker.webp", width: 56, height: 56 },
// 路线二：以 / 开头的 public 路径，原样输出且不进仓库
postSticker: { src: "/assets/anime-deco/sticker.webp", width: 56, height: 56 },
```

**本 fork 的当前决策（2026-10，覆盖此前选择）**：装饰素材走**路线一**（提交进
`src/assets/images/deco/`），以获得 AVIF/WebP + srcset。

> ⚠️ **这条决策反转了提交 `5c18c70`**（`docs(config): document anime decoration and keep
> licensed art out of the repo`）。当时的选择是「授权素材一律不进仓库」；现在为了让
> Netlify 构建能拿到素材（gitignore 的文件在干净 clone 里不存在，部署后必然裂图），
> 改为提交。**后果必须知情**：素材一旦提交就永久留在 git 历史里，事后删除无法真正撤回；
> `LondonMoon/Shirone` 是公开仓库，被 fork 后还会继续流传。想回到旧策略就用路线二，
> 并接受「无优化 + 需要额外的部署同步手段」。

## 1. 素材从哪来（已核实的授权现状）

⚠️ 先说结论：**主流动画作品的壁纸站几乎都不授权再分发**，而且部分版权方**明文禁止**
把角色加工成壁纸/头像。下表是 2026-10 核实的结果：

| 作品 | 官方指引现状 | 能否用作装饰 |
|---|---|---|
| 幸运星 | 京都动画**没有**二次创作指引，官网仅声明禁止擅自复制/加工/转载 | ❌ 无可援引的书面许可 |
| 凉宫春日 | 无指引、无免费素材页 | ❌ |
| 孤独摇滚 | 芳文社明文**禁止**把角色加工成壁纸等刊登，且「不论营利或非营利目的」 | ❌ 明确禁止 |
| BanG Dream!（MyGO / Ave Mujica / 梦限大） | 官方利用指引允许**个人非营利**二次创作（含网络发布），但禁止「未加任何创作性地复制/描摹/取用」官方图 | ✅ 仅限**自绘**，官方图不可 |
| 别当欧尼酱了 / FX 战士久留美 | 无指引 | ❌ |
| 败犬女主太多了 | 小学馆禁止制作头像/壁纸，且不对个人发放使用许可 | ❌ 明确禁止 |
| 尼古喵喵 | 实为 **ヤニねこ**（讲谈社/Bibury，**不是**ニコニコ）；讲谈社个人向 FAQ 禁止用其角色制作/发布插画或戏仿 | ❌ 明确禁止 |
| 初音未来 | [piapro 角色许可（PCL）](https://piapro.jp/license/pcl/summary) 明确含图像，博客/SNS 发布可用，非商用免费；NG 用途含宣传·广告 | ✅ 需按 PCL 署名 |
| 重音 Teto | TWINDRIL 规约準用 PCL 并删除了无偿条款；另有**官方免费配布素材**（イラスト・ロゴ） | ✅ 最佳选择，官方素材无需署名 |
| GUMI | INTERNET 指引：个人非商用可发布角色及其二次创作 | ✅ |

**另外两条硬事实：**

1. **不要热链**（直接引用壁纸站的图片 URL）。除条款问题外，本项目的图片管线对 `http(s)`
   开头的 src **直接原样输出**（跳过 Astro 的 AVIF/WebP 与 srcset 优化），
   热链一张 4K 图会原封不动变成页面的 LCP 图；对方加了防盗链还会直接裂图。
2. **"个人非商用"不覆盖公开博客**。公开可访问的页面属于向公众传播，
   壁纸站（如壁纸次元）的授权范围通常只到「个人使用」。这不是本站能替你决定的事，
   请自行判断并保留出处署名。

**✅ 安全选项**：重音 Teto 官方配布素材、PCL 覆盖下的初音图、GUMI 自家二次创作、
BanG Dream 系自绘、以及真·免费图库（[いらすとや](https://www.irasutoya.com/p/terms.html)
免费含商用且无需署名；Kenney / Openclipart 为 CC0；Unsplash 仅照片）。

> **站点所有者的选择（2026-10）**：本站素材由所有者自行收集并提供，
> 上表 ❌ 项目的再分发风险由所有者承担，不隐藏、不推给工具。
> 素材来源与授权记录模板见 `docs/decor-integrations-rollout.md` §4。

## 2. 尺寸与体积预算

| 位置 | 建议源尺寸 | 体积目标 | 格式 |
|---|---|---|---|
| Hero 横幅（全幅） | 1920–2560 宽（16:9） | **100–200 KB**，硬上限 ~300 KB | AVIF → WebP |
| 番剧页横幅 | 1920–2560 宽（21:9，即 1920×823 起） | **100–200 KB** | AVIF → WebP |
| 文章头部贴纸 | 长边 112–256（渲染 56px 的 2x） | ≤40 KB | WebP / PNG |
| 侧栏/页脚贴纸 | 长边 ≤512 | ≤40 KB（矢量优先） | SVG 或 AVIF |

- 主题的 `BannerStage` 会自动从源图生成 AVIF(q55)/WebP(q68) 与 1280/1600/1920 的 srcset，
  所以**源图给到 1920–2560 宽就够**；塞 4K 原图只会让仓库与构建变慢，输出并不会更清晰。
- 装饰性全幅图通常**不是** LCP 元素（Chromium 的 LCP 启发式会排除满屏元素），
  但字节仍算在流量与 LCP 预算里，别放几 MB 的图。
- 贴纸渲染尺寸由 `decorConfig.postSticker.width/height` 决定，可用范围被收敛到
  `DECOR_STICKER_MIN_SIZE`(16) ~ `DECOR_STICKER_MAX_SIZE`(512)；
  源图给到**渲染宽度的 2 倍**即可（组件只生成 1x/2x 候选，且不放大）。

## 3. 五个位置怎么接

### 3.1 Hero 横幅（零代码）

图片放进 `public/assets/anime-deco/` 后（或 `src/assets/images/banner/desktop/`），
把 `src/config/siteConfig.ts` 的 `banner.src` 指过去即可（数组顺序就是轮播顺序）：

```ts
src: {
	desktop: [
		"/assets/anime-deco/hero-1.webp",
		"/assets/anime-deco/hero-2.webp",
	],
	mobile: ["/assets/anime-deco/hero-mobile.webp"],
},
```

想继续享受构建期 AVIF/WebP 优化，则把图放进 `src/assets/images/banner/desktop/` 并写
相对 `src` 的路径（如 `assets/images/banner/desktop/hero-1.webp`）。

### 3.2 页脚（零代码）

1. `src/config/footerConfig.ts` → `enable: true`；
2. 在 `src/config/FooterConfig.html` 写片段（HTML 注释会被剥掉，留空则零 DOM）：

```html
<div class="anime-deco-footer">
  <img src="/assets/anime-deco/footer-sticker.webp" alt="" width="120" height="120" loading="lazy" />
</div>
```

### 3.3 侧栏（需要新增 widget）

**评估结论（2026-10）**：`src/components/molecules/Announcement.astro` **不支持自定义 HTML** ——
`contentText` 走文本渲染（`white-space: pre-line`），写 `<img>` 只会看到标签源码本身。
因此侧栏装饰**无法**靠公告 widget 零代码实现，只有两条路：

| 选项 | 代价 | 说明 |
|---|---|---|
| A. 新增装饰 widget | 文档规定的 5 步：扩展 `SidebarWidget` 联合类型 → molecule 组件 → `SideBar.astro` 的 `componentMap` → `sidebarConfig` 默认 `enable: false` → 更新 `docs/sidebar-system.md` / `docs/sidebar-widgets.md` | 一等公民，可做页面过滤/分栏/懒加载 |
| B. 不做侧栏装饰 | 0 | Hero、页脚、文章头部与番剧页已经承担了装饰职责，侧栏叠加装饰也容易与 TOC/音乐等 widget 抢视觉 |

当前采用 **B**（未新增 widget）。需要 A 时按 `docs/sidebar-system.md` §6 的步骤加即可。

### 3.4 文章头部贴纸（配置层，`decorConfig.postSticker`）

落点在文章标题区**右上角**——具体实现是字数/阅读时长那一行的右端
（`src/pages/posts/[...slug].astro`），刻意避开文章顶部的横幅位：那个位置已经被
frontmatter 的 `image` 占用（同时兼作 `ogImage`），叠加会语义重复。

```ts
// src/config/decorConfig.ts
postSticker: {
	src: "assets/images/deco/sticker.webp",
	width: 56,
	height: 56,
},
```

- 静态、无动效；`alt=""` + `aria-hidden="true"`（纯装饰，因此不需要 i18n 键）；
- 用 `object-contain` 渲染——贴纸是角色立绘，`object-cover` 会切掉人物；
- `src` 为空时组件 `return null`：零 DOM、零请求，字数行布局与改动前完全一致。

### 3.5 番剧页横幅（配置层，`decorConfig.animeBanner`）

落在 `/anime/` 页面上、`<AnimeSection>` **之外**（`src/pages/anime.astro`），
是纯 SSR 输出，不增加 hydration 成本。

```ts
animeBanner: {
	src: "assets/images/deco/anime-banner.webp",
	ratio: "21 / 9",   // 容器恒定宽高比，消除 CLS
	motion: true,      // --m3e-duration-ambient-long（13s）极缓呼吸
},
```

- 动效走 `--m3e-duration-ambient-long`，该令牌的语义即「仅持续环境装饰，不用于交互反馈」；
- **降级两条路径都覆盖**：系统 `prefers-reduced-motion` 与站点手动 `html.motion-reduced`
  （注意 `DecorBanner.astro` 里那两条规则必须重复完整选择器，否则会被动画规则的特异性压掉）；
- `ratio` 只接受 `<数字> / <数字>`，非法值回落 `21 / 9`，避免任意字符串进入内联样式。

## 4. 站点域名（已完成）

`src/config/siteConfig.ts` 的 `site` 原为主题示例站 `https://shirone.mysqil.com/`，
构建产物里的 canonical / OG / JSON-LD / sitemap / robots 都从它派生。

**2026-10 已改为本站域名 `https://londonmoon.dpdns.org/`。**

仍留在代码仓里的示例域名（有意保留，不要跟着改）：

- `package.json` 的 `homepage`、四个 `README*.md` 的演示站与文档站链接 —— 它们是**主题**的
  元数据与上游链接，不是本站身份；
- `src/pages/llms.txt.ts` / `llms-full.txt.ts` 里的字符串兜底 —— 仅在
  `context.site` 与 `siteConfig.site` **同时缺失**时才会命中。

## 5. 验收

- Hero / 页脚改动属配置层：`pnpm.cmd build` 后确认 `dist/index.html` 里出现预期路径的图片
  引用、且体积在预算内；
- 装饰两个落点：`npx.cmd playwright test tests/site/decor.spec.ts`
  （未配素材时断言零 DOM / 零请求；配了素材后自动启用 DOM 与动效降级用例）；
- 路线一（`src/assets/images/deco/`）：素材应出现在 `git status` 中——**这是预期行为**；
- 路线二（`public/assets/anime-deco/`）：`git status` **不应**出现该目录下的图片文件。
