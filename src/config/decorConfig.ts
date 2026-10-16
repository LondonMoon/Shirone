import type {
	DecorConfig,
	ResolvedDecorBanner,
	ResolvedDecorOptions,
	ResolvedDecorSticker,
} from "@/types/decorConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 二次元装饰配置单一真源。
 *
 * 遵循「零额外负担」原则：默认关闭；**开启后仍以「素材是否到位」为条件**——
 * 任一路径为空字符串时该落点 `return null`，零 DOM、零请求、零布局偏移。
 * 这条设计让「开关是开的、产物是空的」成立：先把功能接线好，素材后补。
 *
 * 【两个落点】
 * - `postSticker`：文章头部右上角贴纸（静态，长边建议 ≤512、≤40 KB）；
 * - `animeBanner`：番剧页装饰横幅（页面级唯一视觉焦点，建议 1920–2560 宽、100–200 KB）。
 *
 * 【素材放哪】推荐 `src/assets/images/deco/`（相对 `src/` 的路径）：
 * 会走 `ImageWrapper` / `getImage` 的 AVIF/WebP 与 srcset 优化。
 * 放 `public/assets/anime-deco/`（已 gitignore）则以 `/` 开头的路径引用，
 * **原样输出、不优化**，需自行预压缩。
 *
 * 【授权】素材来源与授权现状见 `docs/anime-decoration.md` §1——本站为公开仓库，
 * 所选素材的再分发风险由站点所有者自行判断。
 *
 * 【本 fork 的例外】这里 `enable: true` 是本 fork（LondonMoon/Shirone）的显式选择，
 * 与 `newPostConfig.ts` 同一先例；回馈上游时必须还原为 `enable: false`。
 */
export const decorConfig: DecorConfig = withUserConfig("decor", {
	enable: true,
	postSticker: {
		src: "",
		width: 56,
		height: 56,
	},
	animeBanner: {
		src: "",
		ratio: "21 / 9",
		motion: true,
	},
});

/** 贴纸渲染尺寸的收敛边界（下限避免糊成一团，上限对齐 docs/anime-decoration.md §2 的贴纸预算）。 */
export const DECOR_STICKER_MIN_SIZE = 16;
export const DECOR_STICKER_MAX_SIZE = 512;

/** 横幅宽高比的默认值（`ratio` 非法时回落）。 */
export const DECOR_BANNER_DEFAULT_RATIO = "21 / 9";

/** CSS `aspect-ratio` 的合法形态：`<数字> / <数字>`。 */
const RATIO_PATTERN = /^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/;

function normalizeSize(value: number | undefined, fallback: number): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	const rounded = Math.round(value);
	if (rounded < DECOR_STICKER_MIN_SIZE) return DECOR_STICKER_MIN_SIZE;
	if (rounded > DECOR_STICKER_MAX_SIZE) return DECOR_STICKER_MAX_SIZE;
	return rounded;
}

function normalizeRatio(value: string | undefined): string {
	const ratio = value?.trim() ?? "";
	return RATIO_PATTERN.test(ratio) ? ratio : DECOR_BANNER_DEFAULT_RATIO;
}

function resolveSticker(config: DecorConfig): ResolvedDecorSticker | null {
	const src = config.postSticker?.src?.trim() ?? "";
	if (!src) return null;
	return {
		src,
		width: normalizeSize(config.postSticker?.width, 56),
		height: normalizeSize(config.postSticker?.height, 56),
	};
}

function resolveBanner(config: DecorConfig): ResolvedDecorBanner | null {
	const src = config.animeBanner?.src?.trim() ?? "";
	if (!src) return null;
	return {
		src,
		ratio: normalizeRatio(config.animeBanner?.ratio),
		motion: config.animeBanner?.motion ?? true,
	};
}

/**
 * 解析并校验装饰配置。
 *
 * 返回 `null` 的三种情形，消费方据此短路渲染：
 * 1. `enable` 为 false；
 * 2. 两个落点的 `src` 都为空（开着但没素材）；
 * 3. 传入的配置形状非法（缺字段）。
 *
 * 非 `null` 时，各落点仍可能为 `null`——消费方须按落点再次判断。
 */
export function resolveDecorOptions(
	config: DecorConfig,
): ResolvedDecorOptions | null {
	if (!config?.enable) return null;
	const postSticker = resolveSticker(config);
	const animeBanner = resolveBanner(config);
	if (!postSticker && !animeBanner) return null;
	return { postSticker, animeBanner };
}

export type {
	ResolvedDecorBanner,
	ResolvedDecorOptions,
	ResolvedDecorSticker,
} from "@/types/decorConfig";
