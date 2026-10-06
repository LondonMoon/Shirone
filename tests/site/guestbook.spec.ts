import { expect, test } from "@playwright/test";
import {
	commentConfig,
	resolveCommentOptions,
} from "../../src/config/commentConfig";

/**
 * 留言板页面的路由与「零额外负担」契约。
 *
 * 仓库默认配置下评论是关闭的，此时本页必须**完全不存在**：路由 404、导航无入口、
 * 页面不产生任何 Twikoo 请求。启用评论（真实站点）时才反过来覆盖渲染与高亮，
 * 因此两组用例按 `resolveCommentOptions()` 的真实结果互斥跳过 —— 与
 * `comments.spec.ts` 的 twikoo/giscus 分组保持同一口径。
 *
 * 需要两种进入方式都成立的原因：`#swup-container` 由 Swup 替换，而导航高亮来自
 * 按路由推导的 `resolvePageKey()`，二者在 SSR 直达与站内导航下可能不一致。
 */
const twikooUiEnabled =
	resolveCommentOptions(commentConfig)?.provider === "twikoo";

test.describe("Guestbook page — 评论关闭态", () => {
	test.beforeEach(() => {
		test.skip(twikooUiEnabled, "站点已启用 twikoo，关闭态用例不适用");
	});

	test("路由 404，且不产生任何 Twikoo 请求", async ({ page }) => {
		const twikooRequests: string[] = [];
		page.on("request", (request) => {
			if (/twikoo/i.test(request.url())) {
				twikooRequests.push(request.url());
			}
		});

		await page.goto("/guestbook/", { waitUntil: "networkidle" });

		await expect(page).toHaveURL(/\/404\/?$/);
		await expect(page.locator("#comments")).toHaveCount(0);
		expect(twikooRequests).toEqual([]);
	});

	test("导航中不出现留言板入口（不留死链）", async ({ page }) => {
		await page.goto("/", { waitUntil: "networkidle" });
		await expect(page.locator('a[href="/guestbook/"]')).toHaveCount(0);
	});
});

test.describe("Guestbook page — 评论启用态", () => {
	test.beforeEach(() => {
		test.skip(!twikooUiEnabled, "站点未启用 twikoo，跳过启用态用例");
	});

	test("SSR 直达时渲染评论区，且不写 data-current-page", async ({ page }) => {
		await page.goto("/guestbook/", { waitUntil: "networkidle" });

		await expect(page.locator("#comments")).toBeVisible();
		await expect(page.locator("#comments-title")).toBeVisible();

		// 轻量页设计：不新增 SidebarPage 标识，因此容器上没有 data-current-page，
		// 配置了 pages 的侧栏 widget 在本页按「标识未知」语义隐藏。
		await expect(page.locator("#swup-container")).not.toHaveAttribute(
			"data-current-page",
			/.+/,
		);
		// 单篇阅读量占位元素由 Twikoo 官方方案提供（挂载后回填）
		await expect(page.locator("#twikoo_visitors")).toBeAttached();
	});

	test("站内导航（Swup）进入后导航项高亮且评论区可用", async ({ page }) => {
		await page.goto("/", { waitUntil: "networkidle" });

		const entry = page.locator('a[href="/guestbook/"]').first();
		test.skip((await entry.count()) === 0, "当前导航结构未包含留言板入口");
		await entry.click();

		await expect(page).toHaveURL(/\/guestbook\/?$/);
		await expect(page.locator("#comments")).toBeVisible();
		await expect(page.locator('a[href="/guestbook/"]').first()).toHaveAttribute(
			"aria-current",
			/page|true/,
		);
	});
});
