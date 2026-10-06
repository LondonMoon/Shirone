/**
 * 站点语言码 → Twikoo 评论语言码。
 *
 * 为什么必须有这一层：Twikoo 2.0 起只把 `zh-CN` 与 `en` 打进 bundle，
 * 其余语言改成从 `<scriptDir>/locales/<lang>.js` 懒加载，且语言码是**带地区**的
 * （`zh-TW` / `ja-JP` / `ko-KR` / `vi-VN` / `id-ID`）。而 Shirone 传进来的是
 * 自己的 locale 名（`zh_CN` / `ja` / …，见 `src/i18n/languages/`），原样透传会让
 * 除英文外的全部语言**静默回落英文**——Twikoo 在本地化失败时只 `console.warn`，
 * 不抛错，所以这类问题不会被构建或测试自动发现，必须在这里显式映射。
 *
 * Shirone 的 `es` / `th` / `tr` 在 Twikoo 没有对应语言，统一回落 `en`：
 * 与其让 Twikoo 去请求一个 404 的 locale chunk 再回落，不如直接给出可用语言。
 */

/** 归一化后的站点语言码 → Twikoo 语言码。键均为小写、连字符形式。 */
const TWIKOO_LOCALE_MAP: Readonly<Record<string, string>> = {
	"zh-cn": "zh-CN",
	"zh-tw": "zh-TW",
	"zh-hk": "zh-HK",
	en: "en",
	ja: "ja-JP",
	ko: "ko-KR",
	vi: "vi-VN",
	id: "id-ID",
	uz: "uz-UZ",
};

/** Twikoo 内置语言（打进 bundle，无需懒加载）——其余语言需要对应的 locale chunk。 */
export const TWIKOO_BUNDLED_LOCALES: readonly string[] = ["zh-CN", "en"];

/** 无匹配时的回落语言（Twikoo 内置，必定可用）。 */
export const TWIKOO_FALLBACK_LOCALE = "en";

/**
 * 把下划线写法归一为连字符写法并小写：`zh_CN` → `zh-cn`、`ja_JP` → `ja-jp`。
 * Shirone 的 locale 名用下划线（`zh_CN`），Twikoo 用连字符（`zh-CN`），这里对齐两者。
 */
function normalize(code: string): string {
	return code.trim().toLowerCase().replace(/_/g, "-");
}

/**
 * 解析最终传给 `twikoo.init({ lang })` 的语言码。
 *
 * @param siteLanguage 站点/文章语言（`siteConfig.lang` 或文章 `lang`，如 `zh_CN`、`ja`）。
 * @param override     配置里的显式覆盖（`commentConfig.twikoo.lang`）；`"auto"` 或空 = 跟随站点。
 * @returns Twikoo 可识别的语言码；无法识别时回落 {@link TWIKOO_FALLBACK_LOCALE}。
 */
export function resolveTwikooLocale(
	siteLanguage: string | undefined,
	override?: string,
): string {
	const source = override?.trim();
	const candidate =
		source && source.toLowerCase() !== "auto" ? source : (siteLanguage ?? "");
	const normalized = normalize(candidate);
	if (!normalized) {
		return TWIKOO_FALLBACK_LOCALE;
	}

	// 1. 完整码匹配（zh-cn / ja-jp / en-us…）
	const exact = TWIKOO_LOCALE_MAP[normalized];
	if (exact) {
		return exact;
	}

	// 2. 主子标签匹配（en-us → en、ja-jp → ja-JP）
	const primary = normalized.split("-")[0] ?? "";
	return TWIKOO_LOCALE_MAP[primary] ?? TWIKOO_FALLBACK_LOCALE;
}
