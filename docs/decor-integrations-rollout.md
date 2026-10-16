# 四项集成落地变更说明（2026-10）

> 对应诉求：① 二次元装饰 ② Twikoo 匿名评论 ③ 不蒜子访问统计 ④ 快捷发文按钮。
> 相关文档：[`anime-decoration.md`](./anime-decoration.md)（装饰素材与授权）、
> [`vercount-guide.md`](./vercount-guide.md)（全站统计）。

## 0. 结论速览

核实源码后发现：**四项里三项已经在本仓库实现**，真正的新开发只有装饰的两个落点。

| 诉求 | 核实结论 | 本次动作 |
|---|---|---|
| ② Twikoo 匿名评论 | 已实现（Swup 兼容、懒加载、i18n、含单篇阅读量），默认 `enable: false` 所以看不到 | **接线**：打开开关 + 中文 placeholder；后端仍需你部署 |
| ③ 不蒜子统计 | 已实现为 **Vercount**；不蒜子被实测否掉（`vercount-guide.md` §3） | **启用**（`enable: true`）+ 修掉领域漏登记缺陷 |
| ④ 快捷发文按钮 | **已实现且已启用**（顶栏 + Hero 双落点） | 仅核实，未改代码 |
| ① 二次元装饰 | 已有素材指南与 Hero/页脚接法；文章头部与番剧页**未覆盖** | **新开发**两个落点 + 配置域 + 测试 |

另外修正了两处与站点身份有关的错误：`siteConfig.site` 仍指向主题示例站；
`vercount` / `newPost` 两个配置领域**没登记**，内容仓 YAML 覆盖对它们是死路径。

## 1. 改动文件清单

### 新增

| 文件 | 作用 |
|---|---|
| `src/types/decorConfig.ts` | 装饰配置类型（含解析后类型） |
| `src/config/decorConfig.ts` | 装饰配置真源 + `resolveDecorOptions()` + 尺寸/宽高比边界常量 |
| `src/components/molecules/DecorSticker.astro` | 文章头部贴纸（`object-contain`、装饰语义） |
| `src/components/molecules/DecorBanner.astro` | 番剧页横幅（`ImageWrapper` 管线 + 环境动效 + 双路径降级） |
| `tests/site/decor.spec.ts` | 装饰的解析边界与零负担 DOM 契约 |
| `docs/decor-integrations-rollout.md` | 本文件 |

### 修改

| 文件 | 改动 |
|---|---|
| `src/config/index.ts` | barrel 导出 `decorConfig` / `resolveDecorOptions` / 常量与类型 |
| `src/config/commentConfig.ts` | `enable: true`、`provider: "twikoo"`、`placeholder: "说点什么吧…"` |
| `src/config/vercountConfig.ts` | `enable: true` |
| `src/config/siteConfig.ts` | `site` → `https://londonmoon.dpdns.org/` |
| `src/pages/posts/[...slug].astro` | 引入 `DecorSticker`，放在字数/阅读时长行的右端 |
| `src/pages/anime.astro` | 引入 `DecorBanner`，放在 `<AnimeSection>` 之前 |
| `scripts/content/config-domains.mjs` | 补登记 `vercount`、`decor`、`newPost` 三个领域 |
| `tests/content/content-config.test.mjs` | 新增「调用点必须已登记」交叉核对用例 |
| `src/config/README.md` | 补 `decorConfig.ts` 行 |
| `docs/anime-decoration.md` | 重写 §0 决策、扩 §2 预算、新增 §3.4/3.5、§4 域名、§5 验收 |

### 仅核实、未改动

- 评论链路：`src/components/organisms/comment/{CommentSection,Twikoo,Giscus}.astro`、`src/pages/guestbook.astro`
- 统计数据链路：`src/components/organisms/VercountStats.astro`、`src/components/system/VercountRuntime.astro`
- 快捷发文：`src/config/newPostConfig.ts`、`src/components/molecules/NewPostAction.astro`
  （已核实 `repo: "LondonMoon/Shirone"` 与 `git remote origin` 一致、`contentDir: "src/content/posts"` 真实存在）

## 2. Twikoo 后端部署（唯一还需要你动手的一项）

前端已经接好。因为 `twikoo.envId` 为空，`resolveCommentOptions()` 返回 `null`，
评论区、`/guestbook`、评论 FAB 全部静默关闭——**在填 envId 之前站点行为与现在完全一致**。

### 2.1 方案 A：Cloudflare Workers + D1（你已选定）

依据 [Twikoo 官方云函数部署文档](https://twikoo.js.org/backend.html) 的 Cloudflare 一节：

```sh
# 1. 克隆官方仓库并构建（⚠️ 官方要求 Node.js 26 与 pnpm；你本机是 Node v24.21.0）
git clone https://github.com/twikoojs/twikoo.git
cd twikoo
pnpm install
pnpm -r --filter '@twikoojs/cloudflare...' build

# 2. 进入适配器目录并登录 Cloudflare
cd packages/server-cloudflare
npx wrangler login
```

3. 在当前包目录创建 `wrangler.toml`：

```toml
name = "twikoo"
main = "dist/index.js"
compatibility_date = "2026-09-01"
compatibility_flags = ["nodejs_compat"]
```

必须启用 `nodejs_compat`；不要直接部署未构建的 `src/`。

```sh
# 4. 创建 D1 数据库
npx wrangler d1 create twikoo
```

把输出的 `database_id` 写进 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "twikoo"
database_id = "<上一步输出的 id>"
```

```sh
# 5. 建表（首次请求也会自动建，可跳过）
npx wrangler d1 execute twikoo --remote --file=./schema.sql

# 6. 部署
npx wrangler deploy
```

7. 命令行输出 `https://twikoo.<你的用户名>.workers.dev`；浏览器访问应看到
   「Twikoo 云函数运行正常」。该地址（**含 `https://`**）就是 `envId`。
8. 绑定自定义域名（推荐 `twikoo.londonmoon.dpdns.org`）：`*.workers.dev` 在中国大陆
   存在 DNS 污染，直连会超时。
9. 回填 `envId`：

```ts
// src/config/commentConfig.ts
twikoo: {
	envId: "https://twikoo.londonmoon.dpdns.org", // ← 必须带 https:// 前缀
	scriptUrl: "https://cdn.jsdelivr.net/npm/twikoo@2.0.12/dist/twikoo.min.js",
	lang: "auto",
	placeholder: "说点什么吧…",
},
```

**Cloudflare 平台限制（官方明列）**：不支持 Akismet 与腾讯云内容审核；图片上传需
S3 兼容图床（R2 支持 S3）；**邮件通知只能走 HTTP 通道**（SendGrid / MailChannels / Resend），
直连 SMTP 不可用（端口 25 被拦、587 STARTTLS 握手失败、465 连不上）。

### 2.2 方案 B：Netlify + MongoDB Atlas（**证据更新，建议重新考虑**）

抓取官方文档时发现一条与先前判断相反的证据：官方推荐度表里
**Netlify 是 ★★★★☆（"有充足的免费额度，中国大陆访问速度不错"），
Cloudflare workers 只有 ★★☆☆☆（"部署需使用命令行"）**；而方案 A 还额外要求 Node 26。

你**已经有 Netlify 账号**，因此这条路可能更省事：

1. 申请 [MongoDB Atlas](https://twikoo.js.org/mongodb-atlas.html) 免费 M0，取连接字符串；
2. fork [twikoojs/twikoo-netlify](https://github.com/twikoojs/twikoo-netlify)；
3. Netlify → Add new site → Import an existing project → 选该 fork；
4. 环境变量 `MONGODB_URI` = 连接字符串 → Deploy；
5. `envId` = `https://<站点名>.netlify.app/.netlify/functions/twikoo`（**注意带
   `/.netlify/functions/twikoo` 后缀**，与方案 A 的纯域名不同）；
6. 同样回填到 `commentConfig.ts`。

两条路的**前端配置完全相同**，只有 `envId` 取值不同——所以这个选择不阻塞任何已完成的代码。

### 2.3 首次评论后

1. 访问任意文章，发一条评论；
2. Twikoo 会让你设置**管理员密码**（第一个评论者即管理员）；
3. 之后可在管理面板配置邮件通知、垃圾评论检测等。

## 3. Vercount 全站统计

已 `enable: true`，无需其他操作。页脚出现「总访问量 / 总访客数」两个数字。

- 单篇阅读量**不在这里**：由 Twikoo 的 `<span id="twikoo_visitors">` 提供，因此
  填好 `envId` 之后文章底部会自动出现「本页阅读」。
- Swup 下的计数语义（每次导航恰好注入并执行一次脚本）见 `docs/vercount-guide.md` §5。
- 若第三方服务停摆，页脚停在占位符 `—`，**不会**显示错误数字。

## 4. 装饰：放素材即生效

```ts
// src/config/decorConfig.ts（已 enable: true，只差素材路径）
postSticker: { src: "assets/images/deco/sticker.webp", width: 56, height: 56 },
animeBanner: { src: "assets/images/deco/anime-banner.webp", ratio: "21 / 9", motion: true },
```

1. 把图放进 `src/assets/images/deco/`（目录需新建）；
2. 填入上面两个 `src`（相对 `src/` 的路径，不带前导 `/`）；
3. `src` 留空时组件 `return null`——零 DOM、零请求、零布局偏移。

尺寸预算与授权现状见 `docs/anime-decoration.md` §1/§2。

## 5. 素材来源与授权记录模板

`docs/anime-decoration.md` §1 的核实结论是：你的本命中**幸运星**（京都动画）、
**孤独摇滚**（芳文社）、**败犬女主太多了**（小学馆）、**尼古喵喵**（讲谈社）
都属于**版权方明文禁止**做成壁纸/头像的作品；✅ 可用的只有重音 Teto（官方免费配布）、
初音未来（piapro PCL，需署名）、GUMI（个人非商用）与 BanG Dream 系（**仅限自绘**）。

站点所有者已选择自行承担素材来源风险。**建议逐张登记**，将来被追问时有据可查：

| 文件名 | 作品 / 角色 | 来源页面 | 授权依据 | 是否需署名 | 放置日期 |
|---|---|---|---|---|---|
| `sticker.webp` | 重音 Teto | （官方免费配布素材页面 URL） | 官方配布，无需署名 | 否 | 2026-10-__ |
| `anime-banner.webp` | 初音未来 | （piapro 作品 URL） | piapro PCL | 是，署名「© Crypton Future Media」 | 2026-10-__ |

## 6. 校验命令与结果

命令与 CI（`.github/workflows/ci.yml`）一致。

| 门禁 | 命令 | 结果 |
|---|---|---|
| Astro 诊断 | `pnpm.cmd exec astro check` | **0 errors / 0 warnings / 0 hints**（293 文件） |
| 原子清单 | `pnpm.cmd check:manifest` | ✓ atoms 65/65、Markdown 语法 23、skills 13（169 处路径引用一致） |
| 单元测试 | `node --test "tests/**/*.test.mjs"` | **420 / 420 通过**（修复前为 419 通过 / 1 失败，见 §8） |
| 代码风格 | `pnpm.cmd exec biome ci ./src` | 新增/改动的文件 **0 报告**；仓库既有 60 errors / 2 warnings / 5 infos（CI 对该步 `continue-on-error: true`） |
| 装饰·解析层 | `pnpm.cmd exec playwright test tests/site/decor.spec.ts` | **7 / 7 通过**（关闭态、空素材态、尺寸收敛、宽高比白名单） |
| 装饰·浏览器层 | 同上 | 3 个用例**无法在本机执行**：未安装 Chrome（见下） |
| 回归片段 | `playwright test tests/site/{decor,a11y,comments,vercount,new-post-button}.spec.ts` | 12 通过；其余均为浏览器级用例，同因受阻 |
| 生产构建 | `pnpm.cmd build` | **[build] 48 page(s) built · Complete!**、Pagefind 索引 22 页 / 6764 词、`fonts:check` ✓；`DecorBanner` 的 Stylus 编译通过 |
| 产物核验（零负担） | `grep data-decor dist/**/*.html` | **0 命中** —— 开关开着、素材为空时构建产物里没有任何装饰 DOM |
| 产物核验（域名） | `grep londonmoon.dpdns.org dist/**/*.html` | **118 处命中**：`og:url`、canonical、JSON-LD `author.url`、RSS/Atom alternate、许可卡片链接全部指向新域名 |

**浏览器级用例受阻的原因（环境问题，与本次改动无关）**：
`playwright.config.ts` 用 `channel: "chrome"`，而本机未安装 Chrome——
`C:\Users\Administrator\AppData\Local\Google\Chrome\Application\chrome.exe`、
`C:\Program Files\Google\Chrome\Application\chrome.exe`、
`C:\Program Files (x86)\Google\Chrome\Application\chrome.exe` **三个路径均不存在**，
报错为 `browserType.launch: Chromium distribution 'chrome' is not found`。

补跑方式（需要联网下载浏览器，约 150 MB）：

```sh
pnpm.cmd exec playwright install chrome
pnpm.cmd exec playwright test tests/site/decor.spec.ts tests/site/a11y.spec.ts
```

装饰的 3 个浏览器用例都带 `test.skip` 守卫：**填入素材后会自动生效**，
不需要改测试。当前它们即使能跑也只会「跳过 2 个、通过 1 个（关闭态零 DOM 契约）」。

## 7. 顺带修复的既有缺陷（超出四项范围，单独说明）

验证时发现 `node --test` 有 1 个失败，追查后确认**与本次改动无关**，是一个
**Windows 专有的既有 bug**，已顺手修掉：

- **现象**：`tests/registry.test.mjs` ›「barrel files stay owned by the package at any depth」
  断言失败（`nested barrel must not be overridable`）。CI 跑在 ubuntu 上，因此从未复现。
- **根因**：`src/integration/registry.ts:179` 用 `BARREL_RE.test(rel)` 判断 barrel 文件，
  而 `rel` 来自 `path.relative()`——Windows 上返回反斜杠（`atoms\index.ts`），
  而 `BARREL_RE` 只接受 `/`，于是嵌套 `index.ts` 被误注册为可覆盖，
  破坏了「barrel 归包所有」的命名导出契约。
- **修法**：`BARREL_RE.test(normalisePath(rel))`——与同文件 `overrideKey()` 早已采用的
  归一化保持一致。
- **验证**：`node --test tests/registry.test.mjs` → **7 / 7 通过**；
  全量单元测试 → **420 / 420 通过**。

另外注意到工作区出现了一个**未被 `.gitignore` 覆盖**的未跟踪目录 `.tmp-store/`
（`v3/files/<hash>` 结构，来自开发服务器/内容缓存的运行产物，仓库内无任何代码引用它）。
本次未删除也未加入忽略规则，仅在此提示：提交前请确认它不会被误提交。

## 8. 已知边界与未做的事

1. **我没有替你去壁纸站下载素材。** 这是明确的执行边界：在无法核实授权的前提下，
   由我完成「抓取第三方作品 + 放进公开仓库」这个动作，我不做。接入代码、目录约定、
   尺寸预算、来源核实与授权登记模板都已备好，你放文件即生效。
2. **装饰素材进仓库反转了提交 `5c18c70` 的决策。** 后果已在
   `docs/anime-decoration.md` §0 写明：素材一旦提交就永久留在 git 历史里，
   事后删除无法真正撤回，而 `LondonMoon/Shirone` 是公开仓库。
3. **侧栏装饰仍未做**，沿用 `docs/anime-decoration.md` §3.3 的 B 决策
   （`Announcement` 不支持自定义 HTML；新增 widget 需要 5 步且容易与 TOC/音乐抢视觉）。
4. **番剧页横幅是单一宽高比 `21 / 9`**，没有做桌面/移动双比例：`ImageWrapper` 把
   `aspect-ratio` 写成内联样式，媒体查询无法覆盖它，做双比例只能靠 `!important`
   （`rules/css-important.md` 不鼓励）或重写图片组件。移动端表现为一条窄装饰带；
   需要的话改 `decorConfig.animeBanner.ratio` 即可。
5. **`llms.txt.ts` / `llms-full.txt.ts` 里的示例域名兜底有意未改**：它只在
   `context.site` 与 `siteConfig.site` 同时缺失时才命中，属于主题上游代码；
   `package.json` 的 `homepage` 与各 README 的演示站/文档站链接同理。
6. **不蒜子没有引入**，且按 `docs/vercount-guide.md` §7 的建议，**不要**同时启用
   两个公开计数器（两个来源的数字迟早互相矛盾）。
