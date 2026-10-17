import type { TrackDescriptor } from "@/types/musicConfig";

/**
 * 侧栏音乐本地曲目数据源。
 * 遵循「零额外负担」原则：配置与数据解耦，此处专用于管理本地曲目列表。
 *
 * 添加曲目：在 musicTracks 中追加一项即可：
 * - id: 唯一标识
 * - title: 曲目标题
 * - artist: 艺术家（可选）
 * - cover: 封面图地址（可选；推荐相对 /src，亦支持 /public 或绝对 URL）
 * - source: 音频文件地址（相对 /public 或绝对 URL）
 * - duration: 曲目时长（秒，可选）
 */
export const musicTracks: readonly TrackDescriptor[] = [
	{
		id: "dazbee",
		title: "口笛で愛は歌えない",
		artist: "Dazbee",
		cover: "assets/images/music/dazbee.webp",
		source: "/assets/music/url/dazbee.mp3",
		duration: 241,
	},
	{
		id: "hitori",
		title: "ひとり上手",
		artist: "Kaya",
		cover: "assets/images/music/hitori.webp",
		source: "/assets/music/url/hitori.mp3",
		duration: 253,
	},
	{
		id: "xryx",
		title: "眩耀夜行",
		artist: "スリーズブーケ",
		cover: "assets/images/music/xryx.webp",
		source: "/assets/music/url/xryx.mp3",
		duration: 245,
	},
	{
		id: "cl",
		title: "春雷の頃",
		artist: "22/7",
		cover: "assets/images/music/cl.webp",
		source: "/assets/music/url/cl.mp3",
		duration: 242,
	},
	{
		id: "dna",
		title: "DNA",
		artist: "7/22",
		cover : "https://i0.hdslb.com/bfs/archive/fa405ae90296585023f3bd1ee8c0884c5280ce00.jpg",
		source : "/assets/music/url/dna.mp3",
	},
	{
		id: "montagem-pitty",
		title: "MONTAGEM PITTY",
		artist: "见过夏天P",
		cover: "https://i0.hdslb.com/bfs/archive/b432b3fb40482a6fdedae3f44e6cf8746608bd20.jpg",
		source: "/assets/music/url/montagem-pitty.mp3",
	},
	{
		id: "i-cant-wait",
		title: "I Can't Wait",
		artist: "d0tc0mmie",
		cover: "https://i0.hdslb.com/bfs/archive/04e40ffb1696b9d5f22d846c076647f32e327d96.jpg",
		source: "/assets/music/url/i-cant-wait.mp3",
	},
	{
		id: "world-is-mine-live",
		title: "ワールドイズマイン (Live)",
		artist: "ryo (supercell)",
		cover: "https://i0.hdslb.com/bfs/archive/1a4ea1f19bbf32b7d23b74cb9a0180acc508e29b.jpg",
		source: "/assets/music/url/world-is-mine-live.mp3",
	},
	{
		id: "god-ish",
		title: "神っぽいな",
		artist: "ピノキオピー",
		cover: "https://i0.hdslb.com/bfs/archive/27d1479ac09bc0ce6bd1cf1fc981fed509607784.jpg",
		source: "/assets/music/url/god-ish.mp3",
	},
	{
		id: "senbonzakura",
		title: "千本桜",
		artist: "黒うさP",
		cover: "https://i0.hdslb.com/bfs/archive/d2003cf57978aa71231fc6ce2ff9a0b2a1119c89.jpg",
		source: "/assets/music/url/senbonzakura.mp3",
	},
	{
		id: "matchi-uri-no-tenbaiyaa",
		title: "マッチ売りの転売ヤー",
		artist: "謎J",
		cover: "https://i0.hdslb.com/bfs/archive/f8e627edaf0c401dc27978c2180435839157e720.jpg",
		source: "/assets/music/url/matchi-uri-no-tenbaiyaa.mp3",
	},
	{
		id: "fan-wu-tuo-bang",
		title: "反乌托邦",
		artist: "乌托邦P",
		cover: "https://i0.hdslb.com/bfs/archive/21f605ad8763ef8226a5eb50e9ab59cc06c32f02.jpg",
		source: "/assets/music/url/fan-wu-tuo-bang.mp3",
	},
	{
		id: "nee-nee-nee",
		title: "ねぇねぇねぇ。",
		artist: "ピノキオピー",
		cover: "https://i0.hdslb.com/bfs/archive/a4c934ff0228fd78886a61e3bfbbe5d40b8f762a.jpg",
		source: "/assets/music/url/nee-nee-nee.mp3",
	},
	{
		id: "tsuki-ga-kirei-ne-to-iwaretai",
		title: "月が綺麗ねと言われたい！",
		artist: "カササギ",
		cover: "https://i0.hdslb.com/bfs/archive/88be301ff85139c4f493678ee64a83d63ffc6f4b.jpg",
		source: "/assets/music/url/tsuki-ga-kirei-ne-to-iwaretai.mp3",
	},
	{
		id: "mousou-aika",
		title: "妄想哀歌",
		artist: "MIMI",
		cover: "https://i0.hdslb.com/bfs/archive/8f222e4e68992351ac5e2f09fd2b194c8d0b0e66.jpg",
		source: "/assets/music/url/mousou-aika.mp3",
	},
	{
		id: "4nim0sity",
		title: "4nim0sity｜99.999999999%｜",
		artist: "イチ",
		cover: "https://i0.hdslb.com/bfs/archive/ac0d63834905fa424181eb33f87b7a4a45391e07.jpg",
		source: "/assets/music/url/4nim0sity.mp3",
	},
	{
		id: "love-attribute",
		title: "愛属性",
		artist: "ピノキオピー",
		cover: "https://i0.hdslb.com/bfs/archive/56bafa53c974f4c60dc258dd42c8f1e9df278488.jpg",
		source: "/assets/music/url/love-attribute.mp3",
	},
	{
		id: "byoumei-wa-ai-datta",
		title: "病名は愛だった",
		artist: "Neru",
		cover: "https://i0.hdslb.com/bfs/archive/071608381823678245dd29aa78326228233db8f1.jpg",
		source: "/assets/music/url/byoumei-wa-ai-datta.mp3",
	},
	{
		id: "debit-bit",
		title: "デビットビット",
		artist: "アボガド6",
		cover: "https://i0.hdslb.com/bfs/archive/7b9fff1d025832f4b5e0cf2fd05f3352cf346069.jpg",
		source: "/assets/music/url/debit-bit.mp3",
	},
	{
		id: "odochina",
		title: "踊っチャイナ",
		artist: "Atena",
		cover: "https://i0.hdslb.com/bfs/archive/7dcf74f1f9fca144f3fbe939a1785ba72c66f0ba.jpg",
		source: "/assets/music/url/odochina.mp3",
	},
	{
		id: "super-superhero",
		title: "超主人公",
		artist: "ピノキオピー",
		cover: "https://i0.hdslb.com/bfs/archive/a96015ca8705340b1fa9b6ba33ba311f668c8fbc.jpg",
		source: "/assets/music/url/super-superhero.mp3",
	},
	{
		id: "tensei-ringo",
		title: "転生林檎",
		artist: "ピノキオピー",
		cover: "https://i0.hdslb.com/bfs/archive/f663f121d01426c4883f6894ef09006b807e7707.jpg",
		source: "/assets/music/url/tensei-ringo.mp3",
	},

];
