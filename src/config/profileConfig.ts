import type { ProfileConfig } from "@/types/config";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 博主资料：头像 / 名称 / 简介 / 社交链接（侧栏 Profile 卡片、页脚、RSS 作者等消费）。
 * 类型见 src/types/config.ts。
 */
export const profileConfig: ProfileConfig = withUserConfig("profile", {
	avatar: "assets/images/demo-avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "LondonMoon",
	bio: "月が綺麗ねと言われたい",
	links: [
		{
			name: "X",
			icon: "fa7-brands:x-twitter", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://x.com",
		},
		{
			name: "Steam",
			icon: "fa7-brands:steam",
			url: "https://store.steampowered.com",
		},
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/LyraVoid/Shirone",
		},
		{
			name : "QQ",
			icon : "fa7-brands:qq",
			url : "https://user.qzone.qq.com/3791128087"
		},
		{
		name: "Bilibili",                     // 显示名称
		icon: "fa7-brands:bilibili",          // iconify 图标编码
		url: "https://space.bilibili.com/3546622464100652",  // 跳转地址
		},
	],
});
