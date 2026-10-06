import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	buildNewPostUrl,
	isValidRepo,
	normalizeContentDir,
	todayInTimeZone,
} from "../src/utils/new-post-url.ts";

/**
 * 「写新文章」URL 组装的纯函数层。
 *
 * 为什么值得钉住：这段逻辑同时服务 SSR 与浏览器端（点击前用当天日期重算），
 * 一旦拼错，表现是「按钮点开是 404 或空文件」——不会有人因此在构建期收到报错，
 * 只有真正去发文时才会发现。因此边界（编码、目录归一化、仓库形状、时区回退）
 * 全部用断言固定住。
 */
const parts = {
	repo: "LondonMoon/Shirone",
	branch: "main",
	contentDir: "src/content/posts",
	filename: "untitled.md",
	template: "---\ntitle: \npublished: {date}\ndraft: true\n---\n",
};

describe("new post url builder", () => {
	it("builds a GitHub new-file URL with the prefill query", () => {
		const href = buildNewPostUrl(parts, "2026-10-05");
		assert.ok(
			href.startsWith(
				"https://github.com/LondonMoon/Shirone/new/main/src/content/posts/?",
			),
			`路径形状不符：${href}`,
		);
		const parsed = new URL(href);
		assert.equal(parsed.searchParams.get("filename"), "untitled.md");
		assert.equal(
			parsed.searchParams.get("value"),
			"---\ntitle: \npublished: 2026-10-05\ndraft: true\n---\n",
		);
	});

	it("replaces every {date} placeholder", () => {
		const template = "published: {date}\npublishedAt: {date}T09:00:00+08:00\n";
		const parsed = new URL(
			buildNewPostUrl({ ...parts, template }, "2026-10-05"),
		);
		assert.equal(
			parsed.searchParams.get("value"),
			"published: 2026-10-05\npublishedAt: 2026-10-05T09:00:00+08:00\n",
		);
	});

	it("encodes spaces as %20 instead of +", () => {
		const href = buildNewPostUrl(
			{ ...parts, filename: "my new post.md" },
			"2026-10-05",
		);
		assert.ok(href.includes("filename=my%20new%20post.md"), href);
		// `+` 在查询串里是否等价于空格取决于服务端解码实现，不依赖它
		assert.ok(!href.includes("+"), href);
	});

	it("normalizes the content dir and tolerates the repo root", () => {
		assert.equal(normalizeContentDir("/posts/"), "posts");
		assert.equal(
			normalizeContentDir("  src/content/posts  "),
			"src/content/posts",
		);
		const rootHref = buildNewPostUrl(
			{ ...parts, contentDir: "" },
			"2026-10-05",
		);
		assert.ok(rootHref.includes("/new/main/?filename="), rootHref);
	});

	it("treats a malformed owner/repo as unconfigured", () => {
		assert.equal(isValidRepo("LondonMoon/Shirone"), true);
		assert.equal(isValidRepo("a/b"), true);
		assert.equal(isValidRepo("no-slash"), false);
		assert.equal(isValidRepo(""), false);
		assert.equal(isValidRepo("a/b/c"), false);
		assert.equal(isValidRepo("a/ b"), false);
	});

	it("formats the date in the site time zone and falls back to UTC", () => {
		// 同一时刻：UTC 还是 10-05，Asia/Shanghai 已经跨到 10-06
		const instant = new Date("2026-10-05T18:30:00Z");
		assert.equal(todayInTimeZone("Asia/Shanghai", instant), "2026-10-06");
		assert.equal(todayInTimeZone("UTC", instant), "2026-10-05");
		assert.equal(todayInTimeZone("America/New_York", instant), "2026-10-05");
		// 时区名非法（配置笔误）不得让构建/渲染失败
		assert.equal(todayInTimeZone("Not/AZone", instant), "2026-10-05");
		assert.equal(todayInTimeZone("", instant), "2026-10-05");
	});
});
