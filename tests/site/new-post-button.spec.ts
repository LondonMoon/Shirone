import { expect, test } from "@playwright/test";
import {
	newPostConfig,
	resolveNewPostOptions,
} from "../../src/config/newPostConfig";

/**
 * 「写新文章」入口的 DOM 契约。
 *
 * 两处入口（顶栏图标按钮 + 首页 Hero 次级按钮）由同一份配置驱动，因此断言
 * 比的是**路径前缀一致**与**属性完整**，而不是写死某个仓库或分支。
 * 未配置时（主题默认 `enable: false`）整个特性必须零 DOM，用 skip 反向覆盖。
 */
const options = resolveNewPostOptions(newPostConfig);

function todayIn(zone: string): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: zone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

test.describe("New post shortcut", () => {
	test.beforeEach(() => {
		test.skip(!options, "未启用快捷发文（newPostConfig.enable/repo 未配置）");
	});

	test("renders a nav entry and a hero entry, both pointing at the same path", async ({
		page,
	}) => {
		await page.goto("/", { waitUntil: "networkidle" });

		const nav = page.locator("#new-post-button");
		const cta = page.locator("#new-post-cta");
		await expect(nav).toHaveAttribute("target", "_blank");
		await expect(nav).toHaveAttribute("rel", /noopener/);
		await expect(cta).toHaveAttribute("target", "_blank");

		const navHref = await nav.getAttribute("href");
		const ctaHref = await cta.getAttribute("href");
		expect(navHref).toBeTruthy();
		expect(ctaHref).toBeTruthy();

		const navUrl = new URL(navHref as string);
		const ctaUrl = new URL(ctaHref as string);
		expect(navUrl.pathname).toBe(ctaUrl.pathname);
		expect(navUrl.pathname).toContain(
			`/${options?.parts.repo}/new/${options?.parts.branch}/`,
		);
		expect(navUrl.searchParams.get("filename")).toBe(options?.parts.filename);
	});

	test("prefills today's date in the site time zone, not a stale build date", async ({
		page,
	}) => {
		await page.goto("/", { waitUntil: "networkidle" });

		const href = await page.locator("#new-post-cta").getAttribute("href");
		const value = new URL(href as string).searchParams.get("value") ?? "";
		expect(value).toContain(todayIn(options?.timeZone ?? "UTC"));
	});
});
