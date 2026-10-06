import type {
	ResolvedVercountOptions,
	VercountConfig,
} from "@/types/vercountConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 全站访问统计配置单一真源（Vercount）。
 *
 * 遵循「零额外负担」原则：默认关闭（`enable: false`）；关闭时不注入脚本、
 * 输出零统计 DOM、零外部请求。
 *
 * 【为什么不是不蒜子（busuanzi）】
 * 不蒜子的静态脚本仍在服务（文件停留在 2020-11-23），但其**计数接口**
 * `busuanzi.ibruce.info/busuanzi?jsonpCallback=…` 在 2026-10 的实测中连续多次
 * 无响应，而它的容器默认隐藏、只在回调成功后才 `display:inline`——也就是说接口不恢复，
 * 页脚会**静默地什么都不显示**。另外它的 DOM id 是 `busuanzi_value_*`，
 * Vercount 用的是 `vercount_value_*`，两者**不通用**（已实测否掉「id 兼容」的说法）。
 *
 * 【已知边界】
 * - Vercount 以「脚本执行」计一次浏览，因此运行时**每次导航注入一个新的 script 元素**
 *   （不能用 `loadScriptOnce()` 复用缓存脚本，否则后续导航不再计数），
 *   并保证同一路径在一次导航内只注入一次，避免双倍计数；
 * - 它的「客户端导航后是否继续计数」尚未实测确认，验证方法写在
 *   `docs/vercount-guide.md`；
 * - 计数与访客去重发生在第三方服务端，站点侧无法校验其准确性。
 */
export const vercountConfig: VercountConfig = withUserConfig("vercount", {
	enable: false,
	/** 官方端点；Vercount 为公益项目，自托管时替换为自有地址。 */
	scriptUrl: "https://events.vercount.one/js",
});

/** Vercount 的 DOM 契约（固定 id，脚本按 id 回填）。 */
export const VERCOUNT_SITE_PV_ID = "vercount_value_site_pv";
export const VERCOUNT_SITE_UV_ID = "vercount_value_site_uv";

export type { ResolvedVercountOptions };

/**
 * 解析统计配置。未启用或脚本地址为空时返回 `null`，消费方据此短路渲染。
 */
export function resolveVercountOptions(
	config: VercountConfig,
): ResolvedVercountOptions | null {
	if (!config.enable) return null;
	const scriptUrl = config.scriptUrl?.trim();
	if (!scriptUrl) return null;
	return { scriptUrl };
}
