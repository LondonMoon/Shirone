import { expect, type Page, test } from "@playwright/test";
import {
	resolveVercountOptions,
	vercountConfig,
} from "../../src/config/vercountConfig";

/**
 * 页脚全站统计（Vercount）的机制契约。
 *
 * 关键取舍：**不依赖第三方服务的真实可用性**。用例用 `page.route` 伪造计数脚本，
 * 断言的是本站自己的行为——「每次导航恰好注入并执行一次」。这样即使 Vercount
 * 哪天挂了，这组测试仍然能证明我们的接线是对的；
 * 第三方是否真的记账属于站外事实，只能人工核对（见 docs/vercount-guide.md §6.3）。
 */
const options = resolveVercountOptions(vercountConfig);

/** 伪造脚本挂在 window 上的执行计数；用具名类型避免 `any` */
type VercountProbe = Window & { __vercountRuns?: number };
const vercountRuns = (page: Page) =>
	page.evaluate(() => (window as VercountProbe).__vercountRuns);

/** 伪造脚本：记录执行次数并按契约 id 回填数值 */
const FAKE_SCRIPT = `
window.__vercountRuns = (window.__vercountRuns || 0) + 1;
(function () {
	var set = function (id, value) {
		var el = document.getElementById(id);
		if (el) el.textContent = String(value);
	};
	set("vercount_value_site_pv", 1234);
	set("vercount_value_site_uv", 56);
})();
`;

test.describe("Vercount footer stats", () => {
	test("stays completely absent while disabled", async ({ page }) => {
		test.skip(Boolean(options), "站点已启用 Vercount，关闭态用例不适用");

		const requests: string[] = [];
		page.on("request", (request) => {
			if (/vercount/i.test(request.url())) requests.push(request.url());
		});

		await page.goto("/", { waitUntil: "networkidle" });

		await expect(page.locator("[data-vercount-root]")).toHaveCount(0);
		await expect(page.locator("#shirone-vercount-script")).toHaveCount(0);
		expect(requests).toEqual([]);
	});

	test.describe("enabled", () => {
		test.beforeEach(async ({ page }) => {
			test.skip(
				!options,
				"站点未启用 Vercount（vercountConfig.enable 为 false）",
			);
			const origin = new URL(options?.scriptUrl ?? "https://example.com")
				.origin;
			await page.route(`${origin}/**`, (route) =>
				route.fulfill({
					status: 200,
					contentType: "application/javascript",
					body: FAKE_SCRIPT,
				}),
			);
		});

		test("renders both counters and executes the script exactly once per page view", async ({
			page,
		}) => {
			await page.goto("/", { waitUntil: "networkidle" });

			const root = page.locator("[data-vercount-root]").first();
			await expect(root).toBeVisible();
			await expect(page.locator("#vercount_value_site_pv")).toHaveText("1234");
			await expect(page.locator("#vercount_value_site_uv")).toHaveText("56");
			await expect(root).toHaveAttribute("data-vercount-ready", "true");

			// 恰好一次：重复注入会双倍计数
			await expect.poll(() => vercountRuns(page)).toBe(1);
			await expect(page.locator("#shirone-vercount-script")).toHaveCount(1);
		});

		test("counts exactly once more after in-site navigation", async ({
			page,
		}) => {
			await page.goto("/", { waitUntil: "networkidle" });
			await expect.poll(() => vercountRuns(page)).toBe(1);

			const archiveLink = page.locator('#navbar a[href="/archive/"]').first();
			test.skip((await archiveLink.count()) === 0, "导航中无归档入口");
			await archiveLink.click();
			await expect(page).toHaveURL(/\/archive\/?$/);

			// 每次导航注入一次新脚本（旧的被移除），且页面上始终只有一个
			await expect.poll(() => vercountRuns(page)).toBe(2);
			await expect(page.locator("#shirone-vercount-script")).toHaveCount(1);
		});
	});
});
