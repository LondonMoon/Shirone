/**
 * 「快捷发文」配置类型。
 *
 * 目标：给站点主人一个从站点直达 GitHub「新建文件」页面的入口，并把 Shirone 的
 * frontmatter 骨架一并预填，省掉每次手抄字段。它**不写入任何内容**——真正的提交
 * 仍然发生在 GitHub 上（因此站点侧无需持有任何凭据）。
 *
 * 运行期逻辑（URL 组装、日期计算）在 `src/utils/new-post-url.ts`，本文件只放类型。
 */

export interface NewPostConfig {
	/**
	 * 总开关。关闭时导航栏与 Hero 都不渲染按钮：零 DOM、零请求、零脚本。
	 * 主题默认关闭；站点启用只需置 true 并填好 repo。
	 */
	enable: boolean;
	/** 目标仓库，格式 `owner/repo`。留空或形状非法视为未配置，等同关闭。 */
	repo: string;
	/** 目标分支，必须是已存在的简单分支名（如 `main`）。 */
	branch: string;
	/** 仓库内的文章目录，无首尾斜杠，如 `src/content/posts`。 */
	contentDir: string;
	/** 预填的文件名（可在 GitHub 页面上直接改）。 */
	filename: string;
	/**
	 * 预填的**完整文件内容**（含 frontmatter 的 `---` 围栏）。
	 * 其中 `{date}` 占位符会被替换为站点时区下的当天日期（`YYYY-MM-DD`）。
	 */
	template: string;
}

/** GitHub「新建文件」URL 的组成片段（纯数据，供 `buildNewPostUrl` 消费）。 */
export interface NewPostUrlParts {
	repo: string;
	branch: string;
	contentDir: string;
	filename: string;
	template: string;
}

/** 解析后的发文入口；`null` 表示未启用或配置不完整（消费方直接短路，不渲染任何东西）。 */
export interface ResolvedNewPostOptions {
	parts: NewPostUrlParts;
	/** 站点时区（IANA 名称）；运行期据此重算「今天」，避免长驻页面用到过期日期。 */
	timeZone: string;
}
