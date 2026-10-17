/**
 * 项目页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/projectsConfig.ts 控制。
 */
import type { ProjectItem } from "@/types/projectsConfig";

export const projectsData: ProjectItem[] = [
	{
		key: "game",
		title: "落井下石",
		summary:
			"一款肉鸽棋类游戏",
		category: "theme",
		phase: "building",
		technologies: ["Godot"],
		icon: "vscode-icons:file-type-gdscript",
		coverAlt: "落井下石",
		featured: true,
		year: "2026",
	},
	{
		key: "tool",
		title: "音乐爬取",
		summary:
			"音乐爬取程序",
		category: "theme",
		phase: "shipped",
		technologies: ["Python"],
		icon: "vscode-icons:file-type-cython",
		coverAlt: "音乐爬取程序",
		featured: true,
		year: "2026",
	},
	{
		key: "tool",
		title: "小说爬取",
		summary:
			"小说爬取程序",
		category: "theme",
		phase: "shipped",
		technologies: ["Python"],
		icon: "vscode-icons:file-type-cython",
		coverAlt: "小说爬取程序",
		featured: true,
		year: "2026",
	}
];

/** 获取所有项目数据列表 */
export function getProjectsList(): ProjectItem[] {
	return projectsData;
}
