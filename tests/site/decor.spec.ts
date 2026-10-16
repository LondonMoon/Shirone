import { expect, test } from "@playwright/test";
import {
	DECOR_BANNER_DEFAULT_RATIO,
	DECOR_STICKER_MAX_SIZE,
	DECOR_STICKER_MIN_SIZE,
	decorConfig,
	resolveDecorOptions,
} from "../../src/config/decorConfig";
import type { DecorConfig } from "../../src/types/decorConfig";

/**
 * 二次元装饰（`decorConfig`）的机制契约。
 *
 * 两条主线：
 * 1. **零额外负担**：未配置素材时零 DOM、零请求、零布局偏移——「开关是开的、
 *    产物是空的」也走这条路径，因此默认站点不会因为 `enable: true` 而多出任何东西；
 * 2. **解析边界**：尺寸收敛与宽高比白名单，保证配置里的脏值进不了内联样式。
 *
 * 配置了素材的用例一律 `test.skip` 守卫：它们在用户填入 `src` 之后自动生效，
 * 不需要改测试。
 */
const POST_PATH = "/posts/admonitions/";
const ANIME_PATH = "/anime/";

const options = resolveDecorOptions(decorConfig);
const stickerEnabled = Boolean(options?.postSticker);
const bannerEnabled = Boolean(options?.animeBanner);

/** 造一份最小合法配置，避免每个用例重复写全字段。 */
function createConfig(overrides: {
	enable?: boolean;
	sticker?: Partial<DecorConfig["postSticker"]>;
	banner?: Partial<DecorConfig["animeBanner"]>;
}): DecorConfig {
	return {
		enable: overrides.enable ?? true,
		postSticker: { src: "", width: 56, height: 56, ...overrides.sticker },
		animeBanner: {
			src: "",
			ratio: DECOR_BANNER_DEFAULT_RATIO,
			motion: true,
			...overrides.banner,
		},
	};
}

test.describe("装饰配置解析", () => {
	test("关闭时整体返回 null", () => {
		const resolved = resolveDecorOptions(
			createConfig({ enable: false, sticker: { src: "/deco/a.webp" } }),
		);
		expect(resolved).toBeNull();
	});

	test("开着但两个落点都没素材时返回 null", () => {
		expect(resolveDecorOptions(createConfig({}))).toBeNull();
	});

	test("只有贴纸时横幅落点为 null，反之亦然", () => {
		const stickerOnly = resolveDecorOptions(
			createConfig({ sticker: { src: "/deco/a.webp" } }),
		);
		expect(stickerOnly?.postSticker?.src).toBe("/deco/a.webp");
		expect(stickerOnly?.animeBanner).toBeNull();

		const bannerOnly = resolveDecorOptions(
			createConfig({ banner: { src: "/deco/b.webp" } }),
		);
		expect(bannerOnly?.animeBanner?.src).toBe("/deco/b.webp");
		expect(bannerOnly?.postSticker).toBeNull();
	});

	test("只有空白的 src 视为未配置", () => {
		expect(
			resolveDecorOptions(createConfig({ sticker: { src: "   " } })),
		).toBeNull();
	});

	test("贴纸尺寸越界时收敛到边界值", () => {
		const tooSmall = resolveDecorOptions(
			createConfig({ sticker: { src: "/deco/a.webp", width: 1, height: 4 } }),
		);
		expect(tooSmall?.postSticker?.width).toBe(DECOR_STICKER_MIN_SIZE);
		expect(tooSmall?.postSticker?.height).toBe(DECOR_STICKER_MIN_SIZE);

		const tooLarge = resolveDecorOptions(
			createConfig({
				sticker: { src: "/deco/a.webp", width: 4096, height: 99_999 },
			}),
		);
		expect(tooLarge?.postSticker?.width).toBe(DECOR_STICKER_MAX_SIZE);
		expect(tooLarge?.postSticker?.height).toBe(DECOR_STICKER_MAX_SIZE);
	});

	test("非数字尺寸回落默认值", () => {
		const resolved = resolveDecorOptions(
			createConfig({
				sticker: {
					src: "/deco/a.webp",
					width: Number.NaN,
					height: Number.POSITIVE_INFINITY,
				},
			}),
		);
		expect(resolved?.postSticker?.width).toBe(56);
		expect(resolved?.postSticker?.height).toBe(56);
	});

	test("非法宽高比回落默认值，合法值原样保留", () => {
		const invalid = resolveDecorOptions(
			createConfig({ banner: { src: "/deco/b.webp", ratio: "red; }" } }),
		);
		expect(invalid?.animeBanner?.ratio).toBe(DECOR_BANNER_DEFAULT_RATIO);

		const valid = resolveDecorOptions(
			createConfig({ banner: { src: "/deco/b.webp", ratio: "16 / 9" } }),
		);
		expect(valid?.animeBanner?.ratio).toBe("16 / 9");
	});
});

test.describe("装饰 DOM 契约", () => {
	test("未配置素材：首页零装饰 DOM、零装饰请求、无布局偏移", async ({
		page,
	}) => {
		test.skip(
			stickerEnabled || bannerEnabled,
			"站点已配置装饰素材，关闭态用例不适用",
		);

		const decorRequests: string[] = [];
		page.on("request", (request) => {
			if (/anime-deco|images\/deco/.test(request.url())) {
				decorRequests.push(request.url());
			}
		});

		await page.goto("/", { waitUntil: "networkidle" });

		await expect(page.locator("[data-decor-sticker]")).toHaveCount(0);
		await expect(page.locator("[data-decor-banner]")).toHaveCount(0);

		// 番剧页是横幅的唯一落点，单独确认它没有产出
		await page.goto(ANIME_PATH, { waitUntil: "networkidle" });
		await expect(page.locator("[data-decor-banner]")).toHaveCount(0);

		expect(decorRequests).toEqual([]);
	});

	test("文章头部贴纸：装饰语义 + 不裁切 + Swup 导航后仍存在", async ({
		page,
	}) => {
		test.skip(!stickerEnabled, "未配置 decorConfig.postSticker.src");

		// ① 直达
		await page.goto(POST_PATH, { waitUntil: "networkidle" });
		const sticker = page.locator("[data-decor-sticker]").first();
		await expect(sticker).toBeVisible();
		await expect(sticker).toHaveAttribute("alt", "");
		await expect(sticker).toHaveAttribute("aria-hidden", "true");
		// 贴纸是角色立绘，必须 contain——裁切会切掉人物
		await expect(sticker).toHaveCSS("object-fit", "contain");

		// ② 站内导航（Swup 替换 #swup-container 后重新渲染）。
		//    入口取归档页的文章链接——导航栏里没有单篇文章的入口。
		await page.goto("/archive/", { waitUntil: "networkidle" });
		const entry = page.locator(`a[href="${POST_PATH}"]`).first();
		await expect(entry).toBeVisible();
		await entry.click();
		await expect(page).toHaveURL(new RegExp(`${POST_PATH}$`));
		await expect(page.locator("[data-decor-sticker]")).toHaveCount(1);
	});

	test("番剧页横幅：环境动效 + 两条 reduced-motion 降级路径", async ({
		page,
	}) => {
		test.skip(!bannerEnabled, "未配置 decorConfig.animeBanner.src");

		const banner = page.locator("[data-decor-banner]").first();
		const animated = page.locator(
			'[data-decor-banner][data-decor-motion="true"] .decor-banner__frame',
		);

		await page.goto(ANIME_PATH, { waitUntil: "networkidle" });
		await expect(banner).toBeVisible();
		await expect(banner).toHaveAttribute("aria-hidden", "true");

		// 稳定的宽高比是消除 CLS 的前提
		const ratio = await banner
			.locator(".decor-banner__frame > div")
			.first()
			.evaluate((el) => getComputedStyle(el).aspectRatio);
		expect(ratio).not.toBe("auto");

		if ((await animated.count()) === 0) {
			// motion: false —— 不应存在动画规则
			return;
		}

		await expect
			.poll(() =>
				animated.evaluate((el) => getComputedStyle(el).animationName),
			)
			.toBe("decor-banner-breathe");

		// ① 站点手动开关
		await page.evaluate(() =>
			document.documentElement.classList.add("motion-reduced"),
		);
		await expect
			.poll(() =>
				animated.evaluate((el) => getComputedStyle(el).animationName),
			)
			.toBe("none");

		// ② 系统偏好
		await page.evaluate(() =>
			document.documentElement.classList.remove("motion-reduced"),
		);
		await page.emulateMedia({ reducedMotion: "reduce" });
		await expect
			.poll(() =>
				animated.evaluate((el) => getComputedStyle(el).animationName),
			)
			.toBe("none");
	});
});
