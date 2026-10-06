/**
 * 全站访问统计（Vercount）配置类型。
 *
 * 只覆盖**页脚的全站总访问量 / 总访客数**这一件事。单篇阅读量由评论系统提供
 * （Twikoo 的 `<span id="twikoo_visitors">`，见 `commentConfig`）——两者刻意不重叠，
 * 避免同一篇文章上出现两个来源不同、数值互相矛盾的「阅读量」。
 */
export interface VercountConfig {
	/**
	 * 总开关。关闭时不渲染页脚统计 DOM、不注入任何脚本、不产生任何请求。
	 * 主题默认关闭。
	 */
	enable: boolean;
	/** 计数脚本地址；自托管时替换为自有地址。 */
	scriptUrl: string;
}

/** 解析后的统计配置；`null` 表示未启用或脚本地址为空（消费方直接短路）。 */
export interface ResolvedVercountOptions {
	scriptUrl: string;
}
