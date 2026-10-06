# 二次元装饰素材指南

> 适用：Hero 横幅、页脚、侧栏的装饰图。
> 相关配置：`src/config/siteConfig.ts`（banner）、`src/config/footerConfig.ts` + `FooterConfig.html`、`src/config/sidebarConfig.ts`。

## 0. 为什么素材不进仓库

本站（`LondonMoon/Shirone`）是**公开仓库**。把第三方壁纸提交进来等于向全世界再分发，
而且会留在 git 历史里，事后删除也无法真正撤回。因此：

- 素材放在 `public/assets/anime-deco/`，该目录**已在 `.gitignore` 中排除**（只保留 `.gitkeep`）；
- 部署时把图片单独同步到服务器/对象存储的同一路径；
- 仓库里只保留「引用路径」的配置。

```gitignore
# 二次元装饰素材（版权原因不进仓库；部署时单独同步）
public/assets/anime-deco/*
!public/assets/anime-deco/.gitkeep
```

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

## 2. 尺寸与体积预算

| 位置 | 建议源尺寸 | 体积目标 | 格式 |
|---|---|---|---|
| Hero 横幅（全幅） | 1920–2560 宽（16:9） | **100–200 KB**，硬上限 ~300 KB | AVIF → WebP |
| 侧栏/页脚贴纸 | 长边 ≤512 | ≤40 KB（矢量优先） | SVG 或 AVIF |

- 主题的 `BannerStage` 会自动从源图生成 AVIF(q55)/WebP(q68) 与 1280/1600/1920 的 srcset，
  所以**源图给到 1920–2560 宽就够**；塞 4K 原图只会让仓库与构建变慢，输出并不会更清晰。
- 装饰性全幅图通常**不是** LCP 元素（Chromium 的 LCP 启发式会排除满屏元素），
  但字节仍算在流量与 LCP 预算里，别放几 MB 的图。

## 3. 三个位置怎么接

### 3.1 Hero 横幅（零代码）

图片放进 `public/assets/anime-deco/` 后，把 `src/config/siteConfig.ts` 的 `banner.src`
指过去即可（数组顺序就是轮播顺序）：

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
相对 `src` 的路径（如 `assets/images/banner/desktop/hero-1.webp`）——注意那会**进仓库**，
版权素材不要这么做。

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
| B. 不做侧栏装饰 | 0 | Hero 与页脚已经承担了装饰职责，侧栏叠加装饰也容易与 TOC/音乐等 widget 抢视觉 |

当前采用 **B**（未新增 widget）。需要 A 时按 `docs/sidebar-system.md` §6 的步骤加即可。

## 4. 尚未完成的一件事：站点域名

`src/config/siteConfig.ts` 的 `url` 仍是主题示例站 `https://shirone.mysqil.com`，
构建产物里的 canonical / OG / 重定向都指向它。**上线前必须改成你自己的域名**，
否则搜索引擎会把权重归给示例站。

## 5. 验收

- Hero/页脚改动属配置层：`pnpm.cmd build` 后确认 `dist/index.html` 里出现预期路径的图片
  引用、且体积在预算内；
- 素材目录不进仓库：`git status` 不应出现 `public/assets/anime-deco/` 下的图片文件。
