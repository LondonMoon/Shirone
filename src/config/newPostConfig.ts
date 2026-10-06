import type {
	NewPostConfig,
	ResolvedNewPostOptions,
} from "@/types/newPostConfig";
import { withUserConfig } from "../utils/config-overlay.ts";
import { isValidRepo, normalizeContentDir } from "../utils/new-post-url.ts";
import { siteConfig } from "./siteConfig";

/**
 * 「快捷发文」配置单一真源。
 *
 * 遵循「零额外负担」原则：`enable: false` 时导航栏与 Hero 都不渲染按钮、
 * 不注入任何脚本、不产生任何请求；主题默认关闭。
 *
 * 【启用步骤】
 * 1. 把 `repo` 填成你的仓库 `owner/repo`（**不是**主题仓库），`enable` 置 true；
 * 2. 确认 `branch` 已存在、`contentDir` 是仓库内真实存在的文章目录；
 * 3. 需要的话调整 `template`（占位符 `{date}` = 站点时区当天）。
 *
 * ⚠️ 两个已知边界，写在这里以免日后误判为 bug：
 * - 按钮对所有访客可见（本站的显式选择）。**非仓库协作者**点进去会看到 GitHub 的
 *   登录页或 404——这是 GitHub 的权限模型，不是站点故障；
 * - GitHub 的 URL 预填只覆盖**文件内容**（`?filename=` + `?value=`），
 *   提交信息与提交描述无法通过 URL 预填。
 */
export const newPostConfig: NewPostConfig = withUserConfig("newPost", {
	/**
	 * 本站（LondonMoon/Shirone fork）显式启用，因此默认值与主题上游不同。
	 * 若要回馈上游，这里必须还原为 `enable: false` + `repo: ""`。
	 */
	enable: true,
	repo: "LondonMoon/Shirone",
	branch: "main",
	contentDir: "src/content/posts",
	filename: "untitled.md",
	/**
	 * 预填骨架 = 完整文件内容。字段取值对齐 `src/content.config.ts` 的 zod schema：
	 * `title` 与 `published` 必填（因此两者都预填，避免新文件直接让构建失败）。
	 * `draft: true` 是刻意选择：半成品不会被发布，写完改成 false 或删除该行即可。
	 */
	template: [
		"---",
		"title: ",
		"published: {date}",
		"draft: true",
		"description: ",
		"tags: []",
		'category: ""',
		"---",
		"",
		"",
	].join("\n"),
});

/**
 * 解析发文入口：未启用、仓库缺失或形状非法时返回 `null`，消费方据此短路。
 * 时区取自 `siteConfig.timeZone`，与文章日期口径保持一致。
 */
export function resolveNewPostOptions(
	config: NewPostConfig,
	timeZone: string = siteConfig.timeZone,
): ResolvedNewPostOptions | null {
	if (!config.enable) return null;
	const repo = config.repo?.trim() ?? "";
	if (!isValidRepo(repo)) return null;
	return {
		parts: {
			repo,
			branch: config.branch?.trim() || "main",
			contentDir: normalizeContentDir(config.contentDir),
			filename: config.filename?.trim() || "untitled.md",
			template: config.template ?? "",
		},
		timeZone: timeZone || "UTC",
	};
}
