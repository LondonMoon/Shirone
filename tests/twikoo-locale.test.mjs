import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	resolveTwikooLocale,
	TWIKOO_BUNDLED_LOCALES,
	TWIKOO_FALLBACK_LOCALE,
} from "../src/utils/twikoo-locale.ts";

/**
 * 这组断言守的是「站点语言码 → Twikoo 语言码」这一层映射本身。
 *
 * 之所以必须钉住：Twikoo 2.0 只把 `zh-CN` / `en` 打进 bundle，其余语言按**地区码**
 * （`ja-JP`、`zh-TW`…）从 CDN 懒加载，且失败时只 `console.warn`、不抛错。
 * 也就是说映射写错不会让构建或页面报错，只会让站点在除英文外的语言下**静默**变英文
 * —— 这类缺陷不会自己暴露，只能靠断言钉住。
 */
describe("twikoo locale mapping", () => {
	it("resolves every Shirone locale to a Twikoo locale", () => {
		// 与 src/i18n/languages/ 的十个语言模块一一对应
		const shironeLocales = [
			"en",
			"es",
			"id",
			"ja",
			"ko",
			"th",
			"tr",
			"vi",
			"zh_CN",
			"zh_TW",
		];
		for (const locale of shironeLocales) {
			const resolved = resolveTwikooLocale(locale);
			assert.ok(
				resolved.length > 0,
				`${locale} 必须解析出一个非空 Twikoo 语言码`,
			);
		}

		// Twikoo 实际提供的语言码（下划线写法必须被归一成连字符写法）
		assert.equal(resolveTwikooLocale("zh_CN"), "zh-CN");
		assert.equal(resolveTwikooLocale("zh_TW"), "zh-TW");
		assert.equal(resolveTwikooLocale("ja"), "ja-JP");
		assert.equal(resolveTwikooLocale("ko"), "ko-KR");
		assert.equal(resolveTwikooLocale("vi"), "vi-VN");
		assert.equal(resolveTwikooLocale("id"), "id-ID");
		assert.equal(resolveTwikooLocale("en"), "en");
	});

	it("falls back to English for the three locales Twikoo does not ship", () => {
		for (const locale of ["es", "th", "tr"]) {
			assert.equal(resolveTwikooLocale(locale), TWIKOO_FALLBACK_LOCALE);
		}
	});

	it("resolves region variants through the primary subtag", () => {
		assert.equal(resolveTwikooLocale("en_US"), "en");
		assert.equal(resolveTwikooLocale("ja_JP"), "ja-JP");
		assert.equal(resolveTwikooLocale("zh_HK"), "zh-HK");
	});

	it("treats auto/empty override as site language and honours explicit ones", () => {
		assert.equal(resolveTwikooLocale("zh_CN", "auto"), "zh-CN");
		assert.equal(resolveTwikooLocale("zh_CN", ""), "zh-CN");
		assert.equal(resolveTwikooLocale("zh_CN", "  "), "zh-CN");
		assert.equal(resolveTwikooLocale("zh_CN", "ja"), "ja-JP");
		assert.equal(resolveTwikooLocale("en", "zh-CN"), "zh-CN");
	});

	it("always returns a bundled locale for unknown input", () => {
		for (const input of [undefined, "", "xx", "klingon"]) {
			const resolved = resolveTwikooLocale(input);
			assert.ok(
				TWIKOO_BUNDLED_LOCALES.includes(resolved),
				`未知输入 ${String(input)} 应回落内置语言，实际得到 ${resolved}`,
			);
		}
	});
});
