/**
 * 二次元装饰配置类型。
 *
 * 只覆盖**两个装饰落点**，与既有能力刻意不重叠：
 * - 文章头部贴纸（`postSticker`）——静态小图，落在文章标题区的右上角；
 * - 番剧页横幅（`animeBanner`）——页面级装饰横幅，带极缓的环境动效。
 *
 * Hero 横幅与页脚装饰**不在这里**：前者是 `siteConfig.banner`，后者是
 * `footerConfig` + `FooterConfig.html`（见 `docs/anime-decoration.md` §3）。
 *
 * 「零额外负担」的落点：`enable` 关闭、或某个落点的 `src` 为空字符串时，
 * 该落点**不产出任何 DOM**——因此本模块默认可以「开着但什么都不渲染」。
 */

/** 文章头部贴纸。 */
export interface DecorStickerConfig {
	/**
	 * 图片路径。空字符串 = 不渲染（零 DOM）。
	 * - 相对 `src/` 的路径（如 `assets/images/deco/sticker.webp`）走构建期优化；
	 * - 以 `/` 开头（如 `/assets/anime-deco/sticker.webp`）走 public，原样输出且**不进仓库**；
	 * - `http(s)://` 远程地址原样输出，不优化（不推荐，见 docs/anime-decoration.md §1）。
	 */
	src: string;
	/** 渲染宽度（px）；越界时收敛到 `DECOR_STICKER_MIN_SIZE` ~ `DECOR_STICKER_MAX_SIZE`。 */
	width: number;
	/** 渲染高度（px）；越界时同样收敛。 */
	height: number;
}

/** 番剧页装饰横幅。 */
export interface DecorBannerConfig {
	/** 图片路径。空字符串 = 不渲染（零 DOM）。路径规则同 `DecorStickerConfig.src`。 */
	src: string;
	/**
	 * 容器宽高比（CSS `aspect-ratio` 语法，如 `"21 / 9"`）。
	 * 只接受 `<数字> / <数字>`；非法值回落默认，避免任意字符串进入内联样式。
	 * 容器恒定高度是消除 CLS 的前提（`rules/project-rules.md` §11）。
	 */
	ratio: string;
	/** 是否启用环境动效（`--m3e-duration-ambient-long` = 13s 极缓呼吸）；降级规则见组件。 */
	motion: boolean;
}

export interface DecorConfig {
	/**
	 * 总开关。关闭时两个落点都不渲染，消费方在解析阶段直接短路。
	 * 主题默认关闭；开启后仍需为每个落点填入 `src` 才会产出 DOM。
	 */
	enable: boolean;
	postSticker: DecorStickerConfig;
	animeBanner: DecorBannerConfig;
}

/** 解析后的贴纸配置。 */
export interface ResolvedDecorSticker {
	src: string;
	width: number;
	height: number;
}

/** 解析后的横幅配置。 */
export interface ResolvedDecorBanner {
	src: string;
	ratio: string;
	motion: boolean;
}

/**
 * 解析后的装饰配置。
 * `postSticker` / `animeBanner` 为 `null` 表示该落点没有可渲染的内容。
 */
export interface ResolvedDecorOptions {
	postSticker: ResolvedDecorSticker | null;
	animeBanner: ResolvedDecorBanner | null;
}
