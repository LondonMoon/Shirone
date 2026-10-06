/**
 * 「写新文章」入口的纯函数层：GitHub 新建文件 URL 的组装与站点时区日期换算。
 *
 * 为什么单独成模块：同一段逻辑要同时服务 SSR（构建期渲染 href）与浏览器端
 * （点击时用**当天**日期重算，避免页面长驻后用过期日期预填）。它不导入任何
 * 配置或运行时依赖，因此客户端 `<script>` 引用它的代价接近于零。
 */
import type { NewPostUrlParts } from "@/types/newPostConfig";

/** 模板中代表「今天」的占位符。 */
export const NEW_POST_DATE_PLACEHOLDER = "{date}";

/** GitHub 网页端地址；预填依赖其 `?filename=` 与 `?value=` 查询参数。 */
const GITHUB_BASE = "https://github.com";

/** 仓库路径必须形如 `owner/repo`；形状不合法一律视为未配置。 */
export function isValidRepo(repo: string | undefined): boolean {
	return /^[\w.-]+\/[\w.-]+$/.test((repo ?? "").trim());
}

/** 目录归一化：去掉首尾斜杠；空值表示仓库根目录。 */
export function normalizeContentDir(dir: string | undefined): string {
	return (dir ?? "").trim().replace(/^\/+|\/+$/g, "");
}

/**
 * 站点时区下的当天日期（`YYYY-MM-DD`）。
 *
 * 时区名非法（笔误、运行环境缺该 IANA 数据）时回落 UTC 而不是抛错：
 * 发不出按钮远比构建失败轻微，且这里没有任何需要「响亮失败」的语义。
 */
export function todayInTimeZone(
	timeZone: string,
	now: Date = new Date(),
): string {
	const format = (zone: string) =>
		new Intl.DateTimeFormat("en-CA", {
			timeZone: zone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(now);
	try {
		return format(timeZone || "UTC");
	} catch {
		return format("UTC");
	}
}

/**
 * 组装 GitHub「新建文件」URL。
 *
 * - `filename` / `value` 均用 `encodeURIComponent` 编码：空格编成 `%20` 而非 `+`，
 *   避免依赖 GitHub 对表单式编码的解码行为；
 * - 模板里的 `{date}` 全部替换为传入日期（可能出现在 `published` 与 `publishedAt` 两处）。
 */
export function buildNewPostUrl(parts: NewPostUrlParts, date: string): string {
	const dir = normalizeContentDir(parts.contentDir);
	const path = dir ? `${dir}/` : "";
	const value = (parts.template ?? "")
		.split(NEW_POST_DATE_PLACEHOLDER)
		.join(date);
	const query = `filename=${encodeURIComponent(parts.filename)}&value=${encodeURIComponent(value)}`;
	return `${GITHUB_BASE}/${parts.repo.trim()}/new/${parts.branch.trim()}/${path}?${query}`;
}
