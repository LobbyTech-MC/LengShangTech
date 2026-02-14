/*******************************************************************
 * 触发：右键主手使用
 * 行为：强制掉落 + 20 tick 不可拾取 + 惩罚/刷怪/事件/物品
 *******************************************************************/
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const Material = Java.type('org.bukkit.Material');
const ChatColor = Java.type('org.bukkit.ChatColor');

/* 1.21 药水 API */
const Registry = Java.type('org.bukkit.Registry');
const NamespacedKey = Java.type('org.bukkit.NamespacedKey');
const PotionEffect = Java.type('org.bukkit.potion.PotionEffect');
const DurationTicks = 20 * 15;

/* 掉落物控制 */
const PickupDelay = 20; // 1 秒不可拾取

/* 随机整数 [min, max] */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* 1. 配置组 ====================================================== */
const SlimyGroup = [
    /* 普通单抽组 40% */
    {
        groupWeight: 50,
        allDrop: false,
        items: [
            { type: 'vanilla', id: 'OAK_LOG', amount: {min:1, max:64} },//橡木原木
            { type: 'vanilla', id: 'SPRUCE_LOG', amount: {min:1, max:64} },//云杉原木
            { type: 'vanilla', id: 'OAK_LOG', amount: {min:1, max:64} },//橡木原木
            { type: 'vanilla', id: 'SPRUCE_LOG', amount: {min:1, max:64} },//云杉原木
            { type: 'vanilla', id: 'BIRCH_LOG', amount: {min:1, max:64} },//白桦原木
            { type: 'vanilla', id: 'JUNGLE_LOG', amount: {min:1, max:64} },//丛林原木
            { type: 'vanilla', id: 'ACACIA_LOG', amount: {min:1, max:64} },//金合欢原木
            { type: 'vanilla', id: 'DARK_OAK_LOG', amount: {min:1, max:64} },//深色橡木原木
            { type: 'vanilla', id: 'CRIMSON_STEM', amount: {min:1, max:64} },//绯红菌柄
            { type: 'vanilla', id: 'WARPED_STEM', amount: {min:1, max:64} },//诡异菌柄
            { type: 'vanilla', id: 'MANGROVE_LOG', amount: {min:1, max:64} },//红树原木
            { type: 'vanilla', id: 'CHERRY_LOG', amount: {min:1, max:64} },//樱花原木
            { type: 'vanilla', id: 'BAMBOO_BLOCK', amount: {min:1, max:64} },//竹块

            { type: 'vanilla', id: 'OAK_LEAVES', amount: {min:1, max:64} },//橡树树叶
            { type: 'vanilla', id: 'SPRUCE_LEAVES', amount: {min:1, max:64} },//云杉树叶
            { type: 'vanilla', id: 'BIRCH_LEAVES', amount: {min:1, max:64} },//白桦树叶
            { type: 'vanilla', id: 'JUNGLE_LEAVES', amount: {min:1, max:64} },//丛林树叶
            { type: 'vanilla', id: 'ACACIA_LEAVES', amount: {min:1, max:64} },//金合欢树叶
            { type: 'vanilla', id: 'DARK_OAK_LEAVES', amount: {min:1, max:64} },//深色橡树树叶
            { type: 'vanilla', id: 'CRIMSON_NYLIUM', amount: {min:1, max:64} },//绯红菌岩
            { type: 'vanilla', id: 'WARPED_NYLIUM', amount: {min:1, max:64} },//诡异菌岩
            { type: 'vanilla', id: 'MANGROVE_LEAVES', amount: {min:1, max:64} },//红树树叶
            { type: 'vanilla', id: 'CHERRY_LEAVES', amount: {min:1, max:64} },//樱花树叶
            { type: 'vanilla', id: 'AZALEA_LEAVES', amount: {min:1, max:64} },//杜鹃树叶
            { type: 'vanilla', id: 'FLOWERING_AZALEA_LEAVES', amount: {min:1, max:64} },//开花杜鹃树叶

            { type: 'vanilla', id: 'OAK_SAPLING', amount: {min:1, max:64} },//橡树树苗
            { type: 'vanilla', id: 'SPRUCE_SAPLING', amount: {min:1, max:64} },//云杉树苗
            { type: 'vanilla', id: 'BIRCH_SAPLING', amount: {min:1, max:64} },//白桦树苗
            { type: 'vanilla', id: 'JUNGLE_SAPLING', amount: {min:1, max:64} },//丛林树苗
            { type: 'vanilla', id: 'ACACIA_SAPLING', amount: {min:1, max:64} },//金合欢树苗
            { type: 'vanilla', id: 'DARK_OAK_SAPLING', amount: {min:1, max:64} },//深色橡树树苗
            { type: 'vanilla', id: 'MANGROVE_PROPAGULE', amount: {min:1, max:64} },//红树胎生苗
            { type: 'vanilla', id: 'CHERRY_SAPLING', amount: {min:1, max:64} },//樱花树苗
            { type: 'vanilla', id: 'BAMBOO', amount: {min:1, max:64} },//竹子

            { type: 'vanilla', id: 'OAK_PLANKS', amount: {min:1, max:64} },//橡木木板
            { type: 'vanilla', id: 'SPRUCE_PLANKS', amount: {min:1, max:64} },//云杉木板
            { type: 'vanilla', id: 'BIRCH_PLANKS', amount: {min:1, max:64} },//白桦木板
            { type: 'vanilla', id: 'JUNGLE_PLANKS', amount: {min:1, max:64} },//丛林木板
            { type: 'vanilla', id: 'ACACIA_PLANKS', amount: {min:1, max:64} },//金合欢木板
            { type: 'vanilla', id: 'DARK_OAK_PLANKS', amount: {min:1, max:64} },//深色橡木木板
            { type: 'vanilla', id: 'CRIMSON_PLANKS', amount: {min:1, max:64} },//绯红木板
            { type: 'vanilla', id: 'WARPED_PLANKS', amount: {min:1, max:64} },//诡异木板
            { type: 'vanilla', id: 'MANGROVE_PLANKS', amount: {min:1, max:64} },//红树木板
            { type: 'vanilla', id: 'CHERRY_PLANKS', amount: {min:1, max:64} },//樱花木板
            { type: 'vanilla', id: 'BAMBOO_PLANKS', amount: {min:1, max:64} },//竹板

            { type: 'vanilla', id: 'OAK_PRESSURE_PLATE', amount: {min:1, max:64} },//橡木压力板
            { type: 'vanilla', id: 'SPRUCE_PRESSURE_PLATE', amount: {min:1, max:64} },//云杉压力板
            { type: 'vanilla', id: 'BIRCH_PRESSURE_PLATE', amount: {min:1, max:64} },//白桦压力板
            { type: 'vanilla', id: 'JUNGLE_PRESSURE_PLATE', amount: {min:1, max:64} },//丛林压力板
            { type: 'vanilla', id: 'ACACIA_PRESSURE_PLATE', amount: {min:1, max:64} },//金合欢压力板
            { type: 'vanilla', id: 'DARK_OAK_PRESSURE_PLATE', amount: {min:1, max:64} },//深色橡木压力板
            { type: 'vanilla', id: 'MANGROVE_PRESSURE_PLATE', amount: {min:1, max:64} },//红树压力板
            { type: 'vanilla', id: 'CHERRY_PRESSURE_PLATE', amount: {min:1, max:64} },//樱花压力板
            { type: 'vanilla', id: 'BAMBOO_PRESSURE_PLATE', amount: {min:1, max:64} },//竹压力板
            { type: 'vanilla', id: 'CRIMSON_PRESSURE_PLATE', amount: {min:1, max:64} },//绯木压力板
            { type: 'vanilla', id: 'WARPED_PRESSURE_PLATE', amount: {min:1, max:64} },//诡木压力板

            { type: 'vanilla', id: 'OAK_BUTTON', amount: {min:1, max:64} },//橡木按钮
            { type: 'vanilla', id: 'SPRUCE_BUTTON', amount: {min:1, max:64} },//云杉按钮
            { type: 'vanilla', id: 'BIRCH_BUTTON', amount: {min:1, max:64} },//白桦按钮
            { type: 'vanilla', id: 'JUNGLE_BUTTON', amount: {min:1, max:64} },//丛林按钮
            { type: 'vanilla', id: 'ACACIA_BUTTON', amount: {min:1, max:64} },//金合欢按钮
            { type: 'vanilla', id: 'DARK_OAK_BUTTON', amount: {min:1, max:64} },//深色橡木按钮
            { type: 'vanilla', id: 'MANGROVE_BUTTON', amount: {min:1, max:64} },//红树按钮
            { type: 'vanilla', id: 'CHERRY_BUTTON', amount: {min:1, max:64} },//樱花按钮
            { type: 'vanilla', id: 'BAMBOO_BUTTON', amount: {min:1, max:64} },//竹按钮
            { type: 'vanilla', id: 'CRIMSON_BUTTON', amount: {min:1, max:64} },//绯木按钮
            { type: 'vanilla', id: 'WARPED_BUTTON', amount: {min:1, max:64} },//诡木按钮

            { type: 'vanilla', id: 'OAK_STAIRS', amount: {min:1, max:64} },//橡木楼梯
            { type: 'vanilla', id: 'SPRUCE_STAIRS', amount: {min:1, max:64} },//云杉楼梯
            { type: 'vanilla', id: 'BIRCH_STAIRS', amount: {min:1, max:64} },//白桦楼梯
            { type: 'vanilla', id: 'JUNGLE_STAIRS', amount: {min:1, max:64} },//丛林楼梯
            { type: 'vanilla', id: 'ACACIA_STAIRS', amount: {min:1, max:64} },//金合欢楼梯
            { type: 'vanilla', id: 'DARK_OAK_STAIRS', amount: {min:1, max:64} },//深色橡木楼梯
            { type: 'vanilla', id: 'MANGROVE_STAIRS', amount: {min:1, max:64} },//红树楼梯
            { type: 'vanilla', id: 'CHERRY_STAIRS', amount: {min:1, max:64} },//樱花楼梯
            { type: 'vanilla', id: 'BAMBOO_STAIRS', amount: {min:1, max:64} },//竹楼梯
            { type: 'vanilla', id: 'CRIMSON_STAIRS', amount: {min:1, max:64} },//绯木楼梯
            { type: 'vanilla', id: 'WARPED_STAIRS', amount: {min:1, max:64} },//诡木楼梯

            { type: 'vanilla', id: 'OAK_SLAB', amount: {min:1, max:64} },//橡木台阶
            { type: 'vanilla', id: 'SPRUCE_SLAB', amount: {min:1, max:64} },//云杉台阶
            { type: 'vanilla', id: 'BIRCH_SLAB', amount: {min:1, max:64} },//白桦台阶
            { type: 'vanilla', id: 'JUNGLE_SLAB', amount: {min:1, max:64} },//丛林台阶
            { type: 'vanilla', id: 'ACACIA_SLAB', amount: {min:1, max:64} },//金合欢台阶
            { type: 'vanilla', id: 'DARK_OAK_SLAB', amount: {min:1, max:64} },//深色橡木台阶
            { type: 'vanilla', id: 'MANGROVE_SLAB', amount: {min:1, max:64} },//红树台阶
            { type: 'vanilla', id: 'CHERRY_SLAB', amount: {min:1, max:64} },//樱花台阶
            { type: 'vanilla', id: 'BAMBOO_SLAB', amount: {min:1, max:64} },//竹台阶
            { type: 'vanilla', id: 'CRIMSON_SLAB', amount: {min:1, max:64} },//绯木台阶
            { type: 'vanilla', id: 'WARPED_SLAB', amount: {min:1, max:64} },//诡木台阶

            { type: 'vanilla', id: 'OAK_FENCE', amount: {min:1, max:64} },//橡木栅栏
            { type: 'vanilla', id: 'SPRUCE_FENCE', amount: {min:1, max:64} },//云杉栅栏
            { type: 'vanilla', id: 'BIRCH_FENCE', amount: {min:1, max:64} },//白桦栅栏
            { type: 'vanilla', id: 'JUNGLE_FENCE', amount: {min:1, max:64} },//丛林栅栏
            { type: 'vanilla', id: 'ACACIA_FENCE', amount: {min:1, max:64} },//金合欢栅栏
            { type: 'vanilla', id: 'DARK_OAK_FENCE', amount: {min:1, max:64} },//深色橡木栅栏
            { type: 'vanilla', id: 'MANGROVE_FENCE', amount: {min:1, max:64} },//红树栅栏
            { type: 'vanilla', id: 'CHERRY_FENCE', amount: {min:1, max:64} },//樱花栅栏
            { type: 'vanilla', id: 'BAMBOO_FENCE', amount: {min:1, max:64} },//竹栅栏
            { type: 'vanilla', id: 'CRIMSON_FENCE', amount: {min:1, max:64} },//绯木栅栏
            { type: 'vanilla', id: 'WARPED_FENCE', amount: {min:1, max:64} },//诡木栅栏

            { type: 'vanilla', id: 'OAK_FENCE_GATE', amount: {min:1, max:64} },//橡木栅栏门
            { type: 'vanilla', id: 'SPRUCE_FENCE_GATE', amount: {min:1, max:64} },//云杉栅栏门
            { type: 'vanilla', id: 'BIRCH_FENCE_GATE', amount: {min:1, max:64} },//白桦栅栏门
            { type: 'vanilla', id: 'JUNGLE_FENCE_GATE', amount: {min:1, max:64} },//丛林栅栏门
            { type: 'vanilla', id: 'ACACIA_FENCE_GATE', amount: {min:1, max:64} },//金合欢栅栏门
            { type: 'vanilla', id: 'DARK_OAK_FENCE_GATE', amount: {min:1, max:64} },//深色橡木栅栏门
            { type: 'vanilla', id: 'MANGROVE_FENCE_GATE', amount: {min:1, max:64} },//红树栅栏门
            { type: 'vanilla', id: 'CHERRY_FENCE_GATE', amount: {min:1, max:64} },//樱花栅栏门
            { type: 'vanilla', id: 'BAMBOO_FENCE_GATE', amount: {min:1, max:64} },//竹栅栏门
            { type: 'vanilla', id: 'CRIMSON_FENCE_GATE', amount: {min:1, max:64} },//绯木栅栏门
            { type: 'vanilla', id: 'WARPED_FENCE_GATE', amount: {min:1, max:64} },//诡木栅栏门

            { type: 'vanilla', id: 'OAK_DOOR', amount: {min:1, max:64} },//橡木门
            { type: 'vanilla', id: 'SPRUCE_DOOR', amount: {min:1, max:64} },//云杉门
            { type: 'vanilla', id: 'BIRCH_DOOR', amount: {min:1, max:64} },//白桦门
            { type: 'vanilla', id: 'JUNGLE_DOOR', amount: {min:1, max:64} },//丛林门
            { type: 'vanilla', id: 'ACACIA_DOOR', amount: {min:1, max:64} },//金合欢门
            { type: 'vanilla', id: 'DARK_OAK_DOOR', amount: {min:1, max:64} },//深色橡木门
            { type: 'vanilla', id: 'MANGROVE_DOOR', amount: {min:1, max:64} },//红树门
            { type: 'vanilla', id: 'CHERRY_DOOR', amount: {min:1, max:64} },//樱花门
            { type: 'vanilla', id: 'BAMBOO_DOOR', amount: {min:1, max:64} },//竹门
            { type: 'vanilla', id: 'CRIMSON_DOOR', amount: {min:1, max:64} },//绯木门
            { type: 'vanilla', id: 'WARPED_DOOR', amount: {min:1, max:64} },//诡木门

            { type: 'vanilla', id: 'OAK_TRAPDOOR', amount: {min:1, max:64} },//橡木活板门
            { type: 'vanilla', id: 'SPRUCE_TRAPDOOR', amount: {min:1, max:64} },//云杉活板门
            { type: 'vanilla', id: 'BIRCH_TRAPDOOR', amount: {min:1, max:64} },//白桦活板门
            { type: 'vanilla', id: 'JUNGLE_TRAPDOOR', amount: {min:1, max:64} },//丛林活板门
            { type: 'vanilla', id: 'ACACIA_TRAPDOOR', amount: {min:1, max:64} },//金合欢活板门
            { type: 'vanilla', id: 'DARK_OAK_TRAPDOOR', amount: {min:1, max:64} },//深色橡木活板门
            { type: 'vanilla', id: 'MANGROVE_TRAPDOOR', amount: {min:1, max:64} },//红树活板门
            { type: 'vanilla', id: 'CHERRY_TRAPDOOR', amount: {min:1, max:64} },//樱花活板门
            { type: 'vanilla', id: 'BAMBOO_TRAPDOOR', amount: {min:1, max:64} },//竹活板门
            { type: 'vanilla', id: 'CRIMSON_TRAPDOOR', amount: {min:1, max:64} },//绯木活板门
            { type: 'vanilla', id: 'WARPED_TRAPDOOR', amount: {min:1, max:64} }//诡木活板门
        ]
    },
    /* 幸运套装 */
    {
        groupWeight: 10,
        allDrop: false,
        items: [
            { type: 'sf', id: 'LENGSHANG_幸运头盔', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_幸运胸甲', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_幸运护腿', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_幸运靴子', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_幸运剑', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_幸运镐', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_幸运斧', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_幸运铲', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_黄金切尔西', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_万能附魔书', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_击退棒', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_矮人鞋', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_泰坦胸甲', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_诸葛连弩', amount: 1 },
            { type: 'sf', id: 'LENGSHANG_秒人斧', amount: 1 }
        ]
    },
    /* 原木 */
    {
        groupWeight: 30,
        allDrop: true,
        items: [
            { type: 'vanilla', id: 'OAK_LOG', amount: 1 },//橡木原木
            { type: 'vanilla', id: 'SPRUCE_LOG', amount: 1 },//云杉原木
            { type: 'vanilla', id: 'OAK_LOG', amount: 1 },//橡木原木
            { type: 'vanilla', id: 'SPRUCE_LOG', amount: 1 },//云杉原木
            { type: 'vanilla', id: 'BIRCH_LOG', amount: 1 },//白桦原木
            { type: 'vanilla', id: 'JUNGLE_LOG', amount: 1 },//丛林原木
            { type: 'vanilla', id: 'ACACIA_LOG', amount: 1 },//金合欢原木
            { type: 'vanilla', id: 'DARK_OAK_LOG', amount: 1 },//深色橡木原木
            { type: 'vanilla', id: 'CRIMSON_STEM', amount: 1 },//绯红菌柄
            { type: 'vanilla', id: 'WARPED_STEM', amount: 1 },//诡异菌柄
            { type: 'vanilla', id: 'MANGROVE_LOG', amount: 1 },//红树原木
            { type: 'vanilla', id: 'CHERRY_LOG', amount: 1 },//樱花原木
            { type: 'vanilla', id: 'BAMBOO_BLOCK', amount: 1 }//竹块
        ]
    },
    /* 事件触发组 5% */
    {
        groupWeight: 5,
        eventType: 'punish',
        strikeLightning: true,
        effects: [
            { type: 'POISON', amplifier: 2 },
            { type: 'SLOWNESS', amplifier: 1 },
            { type: 'WEAKNESS', amplifier: 1 }
        ]
    },
    /* 附魔之瓶投掷组 */
    {
        groupWeight: 5,
        eventType: 'xp_bottle'
    },
    /* 烟花表演组 */
    {
        groupWeight: 3,
        eventType: 'firework'
    },
    /* 金币雨组 */
    {
        groupWeight: 4,
        eventType: 'coin_rain'
    },
    /* 经验爆发组 */
    {
        groupWeight: 5,
        eventType: 'xp_burst',
        amount: { min: 200, max: 1000 }
    },
    /* 瞬间治疗组 */
    {
        groupWeight: 4,
        eventType: 'heal',
        healAmount: 20,
        effects: [
            { type: 'REGENERATION', amplifier: 2, duration: 200 },
            { type: 'ABSORPTION', amplifier: 1, duration: 600 }
        ]
    },
    /* 随机变色羊组 */
    {
        groupWeight: 3,
        eventType: 'rainbow_sheep',
        count: 3
    },
    /* 随机附魔书组 */
    {
        groupWeight: 3,
        eventType: 'random_enchanted_book',
        level: 15
    },
    /* 背包混乱组 */
    {
        groupWeight: 2,
        eventType: 'inventory_shuffle'
    },
    /* 反向控制组 */
    {
        groupWeight: 1,
        eventType: 'reverse_control',
        duration: 400 // 20秒
    },
    /* 饥饿诅咒组 */
    {
        groupWeight: 2,
        eventType: 'hunger_curse',
        level: 100
    },
    /* 刷怪总组 - 30%概率进入刷怪事件 */
    {
        groupWeight: 30,
        eventType: 'spawn_category',
        subGroups: [
            /* 敌对生物 - 40%概率 */
            {
                subWeight: 40,
                category: 'hostile',
                count: 2,
                radius: 3,
                mobs: [
                    'CREEPER',      // 苦力怕
                    'ZOMBIE',       // 僵尸
                    'SKELETON',     // 骷髅
                    'SPIDER',       // 蜘蛛
                    'CAVE_SPIDER',  // 洞穴蜘蛛
                    'ENDERMAN',     // 末影人
                    'WITCH',        // 女巫
                    'VINDICATOR',   // 卫道士
                    'EVOKER',       // 唤魔者
                    'ILLUSIONER',   // 幻术师
                    'PILLAGER',     // 掠夺者
                    'RAVAGER',      // 劫掠兽
                    'VEX',          // 恼鬼
                    'BLAZE',        // 烈焰人
                    'WITHER_SKELETON', // 凋零骷髅
                    'HUSK',         // 尸壳
                    'STRAY',        // 流浪者
                    'DROWNED',      // 溺尸
                    'GUARDIAN',     // 守卫者
                    'SHULKER',      // 潜影贝
                    'PHANTOM',      // 幻翼
                    'BOGGED',       // 沼骸
                    'BREEZE'        // 旋风人
                ]
            },
            /* 中立生物 - 30%概率 */
            {
                subWeight: 30,
                category: 'neutral',
                count: 1,
                radius: 3,
                mobs: [
                    'ZOMBIFIED_PIGLIN', // 僵尸猪人
                    'PIGLIN',           // 猪灵
                    'PIGLIN_BRUTE'      // 猪灵蛮兵
                ]
            },
            /* 友好生物 - 20%概率 */
            {
                subWeight: 20,
                category: 'friendly',
                count: 2,
                radius: 3,
                mobs: [
                    'SHEEP',        // 羊
                    'COW',          // 牛
                    'PIG',          // 猪
                    'CHICKEN',      // 鸡
                    'RABBIT',       // 兔子
                    'HORSE',        // 马
                    'DONKEY',       // 驴
                    'MULE',         // 骡子
                    'LLAMA',        // 羊驼
                    'WOLF',         // 狼
                    'OCELOT',       // 豹猫
                    'CAT',          // 猫
                    'FOX',          // 狐狸
                    'PANDA',        // 熊猫
                    'POLAR_BEAR',   // 北极熊
                    'TURTLE',       // 海龟
                    'DOLPHIN',      // 海豚
                    'SQUID',        // 鱿鱼
                    'GLOW_SQUID',   // 发光鱿鱼
                    'COD',          // 鳕鱼
                    'SALMON',       // 鲑鱼
                    'TROPICAL_FISH', // 热带鱼
                    'PUFFERFISH',   // 河豚
                    'AXOLOTL',      // 美西螈
                    'TADPOLE',      // 蝌蚪
                    'FROG',         // 青蛙
                    'GOAT',         // 山羊
                    'CAMEL',        // 骆驼
                    'SNIFFER',      // 嗅探兽
                    'PARROT',       // 鹦鹉
                    'MOOSHROOM',    // 蘑菇牛
                    'STRIDER',      // 炽足兽
                    'ALLAY'         // 悦灵
                ]
            },
            /* 特殊生物 - 10%概率 */
            {
                subWeight: 10,
                category: 'special',
                count: 1,
                radius: 3,
                mobs: [
                    'IRON_GOLEM',       // 铁傀儡
                    'SNOW_GOLEM',       // 雪傀儡
                    'VILLAGER',         // 村民
                    'WANDERING_TRADER', // 流浪商人
                    'TRADER_LLAMA',     // 行商羊驼
                    'GIANT',            // 巨人僵尸
                    'ELDER_GUARDIAN'    // 远古守卫者
                ]
            },
            /* BOSS - 1%概率 */
            {
                subWeight: 1,
                category: 'boss',
                count: 1,
                radius: 3,
                mobs: [
                    'WITHER',           // 凋灵（Boss）
                    'ENDER_DRAGON'     // 末影龙（Boss）
                ]
            }
        ]
    }
];

/* 2. 核心抽奖 ================================================ */
function pickSlimyItem() {
    const total = SlimyGroup.reduce((sum, g) => sum + g.groupWeight, 0);
    let r = Math.random() * total;
    let pickedGroup = null;
    for (const g of SlimyGroup) {
        if (r < g.groupWeight) { pickedGroup = g; break; }
        r -= g.groupWeight;
    }
    if (!pickedGroup) pickedGroup = SlimyGroup[SlimyGroup.length - 1];

    if (pickedGroup.eventType === 'punish') {
        return { eventType: 'punish', punish: pickedGroup };
    }
    if (pickedGroup.eventType === 'spawn') {
        return { eventType: 'spawn', spawn: pickedGroup };
    }
    if (pickedGroup.eventType === 'xp_bottle') {
        return { eventType: 'xp_bottle' };
    }
    if (pickedGroup.eventType === 'firework') {
        return { eventType: 'firework' };
    }
    if (pickedGroup.eventType === 'coin_rain') {
        return { eventType: 'coin_rain' };
    }
    if (pickedGroup.eventType === 'xp_burst') {
        return { eventType: 'xp_burst', xpGroup: pickedGroup };
    }
    if (pickedGroup.eventType === 'heal') {
        return { eventType: 'heal', healGroup: pickedGroup };
    }
    if (pickedGroup.eventType === 'rainbow_sheep') {
        return { eventType: 'rainbow_sheep', sheepGroup: pickedGroup };
    }
    if (pickedGroup.eventType === 'random_enchanted_book') {
        return { eventType: 'random_enchanted_book', bookGroup: pickedGroup };
    }
    if (pickedGroup.eventType === 'inventory_shuffle') {
        return { eventType: 'inventory_shuffle' };
    }
    if (pickedGroup.eventType === 'reverse_control') {
        return { eventType: 'reverse_control', reverseGroup: pickedGroup };
    }
    if (pickedGroup.eventType === 'hunger_curse') {
        return { eventType: 'hunger_curse', hungerGroup: pickedGroup };
    }
    if (pickedGroup.eventType === 'spawn_category') {
        return { eventType: 'spawn_category', spawnCategory: pickedGroup };
    }

    /* 物品组（单抽） */
    if (!pickedGroup.allDrop) {
        const entry = pickedGroup.items[Math.floor(Math.random() * pickedGroup.items.length)];
        const amt = (typeof entry.amount === 'object')
            ? randInt(entry.amount.min, entry.amount.max)
            : (entry.amount || 1);
        if (entry.type === 'vanilla') {
            const item = new ItemStack(Material.valueOf(entry.id), amt);
            /* 不设置 DisplayName，保持原版名称 */
            return { eventType: 'item', stacks: [item] };
        } else {
            const sfItem = getSfItemById(entry.id);
            if (sfItem == null) throw new Error('[逻辑幸运方块] 错误的Slimefun ID: ' + entry.id);
            const item = sfItem.getItem().clone();
            item.setAmount(amt);
            return { eventType: 'item', stacks: [item] };
        }
    }

    /* 物品组（全掉） */
    const list = [];
    for (const entry of pickedGroup.items) {
        const amt = (typeof entry.amount === 'object')
            ? randInt(entry.amount.min, entry.amount.max)
            : (entry.amount || 1);
        if (entry.type === 'vanilla') {
            const item = new ItemStack(Material.valueOf(entry.id), amt);
            /* 不设置 DisplayName，保持原版名称 */
            list.push(item);
        } else {
            const sfItem = getSfItemById(entry.id);
            if (sfItem == null) throw new Error('[逻辑幸运方块] 错误的Slimefun ID: ' + entry.id);
            const item = sfItem.getItem().clone();
            item.setAmount(amt);
            list.push(item);
        }
    }
    return { eventType: 'item', allDrop: true, stacks: list };
}

/* 3. 负面事件 ================================================ */
function applyPunish(player, group) {
    if (group.strikeLightning) {
        player.getWorld().strikeLightning(player.getLocation());
    }
    const keyMap = {
        'POISON': 'poison',
        'SLOW': 'slowness',
        'SLOWNESS': 'slowness',
        'WEAKNESS': 'weakness',
        'BLINDNESS': 'blindness',
        'WITHER': 'wither',
        'NAUSEA': 'nausea',
        'HUNGER': 'hunger',
        'MINING_FATIGUE': 'mining_fatigue'
    };
    if (group.effects) {
        for (const ef of group.effects) {
            const key = keyMap[ef.type] || ef.type.toLowerCase();
            const type = Registry.EFFECT.get(NamespacedKey.minecraft(key));
            if (type == null) {
                throw new Error('[逻辑幸运方块] 无效药水类型: ' + ef.type + ' (key=' + key + ')');
            }
            player.addPotionEffect(new PotionEffect(type, DurationTicks, ef.amplifier, false, true));
        }
    }
}

/* 4. 刷怪逻辑 ================================================ */
function applySpawn(player, group) {
    const loc = player.getLocation();
    const world = player.getWorld();
    const count = group.count || 1;
    const radius = group.radius || 3;
    const mobType = Java.type('org.bukkit.entity.EntityType').valueOf(group.mobType || 'CREEPER');

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const r = Math.random() * radius;
        const x = loc.getX() + r * Math.cos(angle);
        const z = loc.getZ() + r * Math.sin(angle);
        const y = loc.getY();
        world.spawnEntity(new org.bukkit.Location(world, x, y, z), mobType);
    }
}

/* 冷却时间存储（玩家UUID -> 上次使用时间戳，毫秒） */
const cdMap = new Map();
const CooldownMillis = 1500; // 1.5秒 = 1500毫秒

/* 6. 开箱事件 – 强制掉落 + 1 秒不可拾取 ===================== */
function onUse(event) {
    // 获取触发事件的玩家对象
    const player = event.getPlayer();

    // 检查是否为主手使用（防止副手触发）
    if (event.getHand() !== org.bukkit.inventory.EquipmentSlot.HAND) return;

    // 检查冷却时间
    const now = Date.now();
    const playerId = player.getUniqueId().toString();
    const lastUseTime = cdMap.get(playerId);

    if (lastUseTime && now - lastUseTime < CooldownMillis) {
        // 使用 Action Bar 显示精确秒数（带小数点）
        const remaining = (CooldownMillis - (now - lastUseTime)) / 1000;
        player.sendActionBar(ChatColor.RED + '冷却中... ' + ChatColor.GRAY + '(' + remaining.toFixed(1) + 's)');
        return; // 取消本次使用
    }

    // 获取玩家主手中的物品（幸运方块）
    const itemInMain = player.getInventory().getItemInMainHand();

    // 调用抽奖函数，获取随机事件结果
    const result = pickSlimyItem();

    /* ========== 惩罚事件 ========== */
    // 触发惩罚：雷击 + 药水效果
    if (result.eventType === 'punish') {
        applyPunish(player, result.punish);
    }

    /* ========== 刷怪事件 ========== */
    // 在玩家周围生成指定生物
    else if (result.eventType === 'spawn') {
        applySpawn(player, result.spawn);
    }

    /* ========== 刷怪分类事件 ========== */
    else if (result.eventType === 'spawn_category') {
        const categoryGroup = result.spawnCategory;

        // 计算子组总权重
        const subTotal = categoryGroup.subGroups.reduce((sum, sg) => sum + sg.subWeight, 0);
        let sr = Math.random() * subTotal;
        let pickedSub = null;

        for (const sg of categoryGroup.subGroups) {
            if (sr < sg.subWeight) { pickedSub = sg; break; }
            sr -= sg.subWeight;
        }
        if (!pickedSub) pickedSub = categoryGroup.subGroups[categoryGroup.subGroups.length - 1];

        // 从选中的子组中随机选择一个生物
        const mobType = pickedSub.mobs[Math.floor(Math.random() * pickedSub.mobs.length)];

        // 生成生物
        const EntityType = Java.type('org.bukkit.entity.EntityType');
        const loc = player.getLocation();
        const world = player.getWorld();
        const count = pickedSub.count || 3;
        const radius = pickedSub.radius || 3;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const r = Math.random() * radius;
            const x = loc.getX() + r * Math.cos(angle);
            const z = loc.getZ() + r * Math.sin(angle);
            const y = loc.getY();
            world.spawnEntity(new org.bukkit.Location(world, x, y, z), EntityType.valueOf(mobType));
        }
    }

    /* ========== 物品掉落事件 ========== */
    // 掉落普通物品/SF物品到玩家位置
    else if (result.eventType === 'item') {
        const stacks = result.stacks;
        for (const item of stacks) {
            const drop = player.getWorld().dropItem(player.getLocation(), item);
            drop.setPickupDelay(PickupDelay); // 设置1秒不可拾取
        }
    }

    /* ========== 附魔之瓶投掷事件 ========== */
    // 向天空投掷附魔之瓶，砸地后碎开给予经验
    else if (result.eventType === 'xp_bottle') {
        // 获取投掷物实体类
        const ThrownExpBottle = Java.type('org.bukkit.entity.ThrownExpBottle');
        // 获取向量类用于设置速度
        const Vector = Java.type('org.bukkit.util.Vector');

        // 投掷15-45个附魔之瓶
        for (let i = 0; i < randInt(15, 45); i++) {
            // 在玩家头顶3格生成投掷物实体
            const bottle = player.getWorld().spawn(player.getLocation().add(0, 3, 0), ThrownExpBottle.class);
            // 设置投掷速度：向上为主，带随机水平偏移
            const velocity = new Vector(
                (Math.random() - 0.5) * 0.3,  // X轴随机偏移 -0.15 ~ 0.15
                0.8 + Math.random() * 0.4,     // Y轴向上速度 0.8 ~ 1.2
                (Math.random() - 0.5) * 0.3   // Z轴随机偏移 -0.15 ~ 0.15
            );
            bottle.setVelocity(velocity);
            bottle.setShooter(player); // 设置投掷者为玩家
        }
    }

    /* ========== 烟花表演事件 ========== */
    // 在玩家周围天空燃放随机烟花
    else if (result.eventType === 'firework') {
        // 获取烟花实体类
        const Firework = Java.type('org.bukkit.entity.Firework');
        // 获取烟花元数据类
        const FireworkMeta = Java.type('org.bukkit.inventory.meta.FireworkMeta');
        // 获取烟花效果构建器
        const FireworkEffect = Java.type('org.bukkit.FireworkEffect');
        // 获取颜色类
        const Color = Java.type('org.bukkit.Color');

        // 定义可用颜色数组
        const colors = [Color.RED, Color.BLUE, Color.GREEN, Color.YELLOW, Color.PURPLE, Color.ORANGE, Color.AQUA, Color.FUCHSIA, Color.LIME, Color.MAROON, Color.NAVY, Color.OLIVE, Color.SILVER, Color.TEAL, Color.WHITE, Color.BLACK];

        // 燃放5-10个烟花
        for (let i = 0; i < randInt(5, 10); i++) {
            // 随机角度和半径（圆形分布）
            const angle = Math.random() * 2 * Math.PI;  // 0 ~ 360度
            const r = Math.random() * 8;                 // 半径0-8格
            // 计算烟花生成位置（玩家周围水平随机，高度5-15格上方）
            const x = player.getLocation().getX() + r * Math.cos(angle);
            const z = player.getLocation().getZ() + r * Math.sin(angle);
            const y = player.getLocation().getY() + 5 + Math.random() * 10;

            // 创建位置对象
            const loc = new org.bukkit.Location(player.getWorld(), x, y, z);
            // 生成烟花实体
            const firework = player.getWorld().spawn(loc, Firework.class);

            // 获取烟花元数据
            const meta = firework.getFireworkMeta();
            // 构建烟花效果
            const effect = FireworkEffect.builder()
                .withColor(colors[randInt(0, colors.length - 1)])      // 随机主颜色
                .withFade(colors[randInt(0, colors.length - 1)])       // 随机渐变色
                .with(FireworkEffect.Type.values()[randInt(0, FireworkEffect.Type.values().length - 1)]) // 随机形状
                .flicker(Math.random() > 0.5)  // 50%概率闪烁
                .trail(Math.random() > 0.5)    // 50%概率拖尾
                .build();
            meta.addEffect(effect);
            meta.setPower(randInt(1, 3)); // 飞行时间1-3秒（但会立即引爆）
            firework.setFireworkMeta(meta);

            // 立即引爆烟花（设置生命周期为0，最大为1）
            firework.setLife(0);
            firework.setMaxLife(1);
        }
    }

    /* ========== 金币雨事件 ========== */
    // 从天空掉落金粒/金锭
    else if (result.eventType === 'coin_rain') {
        // 掉落20-50个金币
        const count = randInt(20, 50);
        for (let i = 0; i < count; i++) {
            // 30%概率是金锭，70%概率是金粒
            const isGoldIngot = Math.random() > 0.7;
            // 创建物品堆：金锭1-3个，金粒1-8个
            const coin = new ItemStack(
                isGoldIngot ? Material.GOLD_INGOT : Material.GOLD_NUGGET,
                isGoldIngot ? randInt(1, 3) : randInt(1, 8)
            );
            // 随机水平位置（玩家周围5格内圆形分布）
            const angle = Math.random() * 2 * Math.PI;
            const r = Math.random() * 5;
            const x = player.getLocation().getX() + r * Math.cos(angle);
            const z = player.getLocation().getZ() + r * Math.sin(angle);
            // 从头顶15格高度掉落
            const drop = player.getWorld().dropItem(
                new org.bukkit.Location(player.getWorld(), x, player.getLocation().getY() + 15, z),
                coin
            );
            drop.setPickupDelay(PickupDelay); // 1秒不可拾取
        }
    }

    /* ========== 经验爆发事件 ========== */
    // 直接给予玩家大量经验值
    else if (result.eventType === 'xp_burst') {
        // 计算经验值：如果配置是范围则随机，否则使用固定值
        const xpAmount = (typeof result.xpGroup.amount === 'object')
            ? randInt(result.xpGroup.amount.min, result.xpGroup.amount.max)
            : result.xpGroup.amount;
        // 给予经验
        player.giveExp(xpAmount);
        // 发送提示消息
        player.sendMessage(ChatColor.GREEN + '幸运爆发！获得 ' + xpAmount + ' 点经验值！');
    }

    /* ========== 瞬间治疗事件 ========== */
    // 恢复生命、饱食度，并给予正面效果
    else if (result.eventType === 'heal') {
        // 恢复20点生命值（不超过上限）
        player.setHealth(Math.min(player.getHealth() + result.healGroup.healAmount, player.getMaxHealth()));
        // 设置饱食度满值
        player.setFoodLevel(20);
        // 设置饱和度满值
        player.setSaturation(20);

        // 如果有配置药水效果则应用
        if (result.healGroup.effects) {
            // 药水效果名称映射表（MC代码名 -> 注册表键名）
            const keyMap = {
                'POISON': 'poison',
                'SLOW': 'slowness',
                'SLOWNESS': 'slowness',
                'WEAKNESS': 'weakness',
                'BLINDNESS': 'blindness',
                'WITHER': 'wither',
                'NAUSEA': 'nausea',
                'HUNGER': 'hunger',
                'MINING_FATIGUE': 'mining_fatigue',
                'REGENERATION': 'regeneration',
                'ABSORPTION': 'absorption',
                'RESISTANCE': 'resistance',
                'FIRE_RESISTANCE': 'fire_resistance',
                'WATER_BREATHING': 'water_breathing',
                'INVISIBILITY': 'invisibility',
                'GLOWING': 'glowing',
                'LUCK': 'luck',
                'BAD_LUCK': 'unluck',
                'HEALTH_BOOST': 'health_boost'
            };
            // 遍历应用每个效果
            for (const ef of result.healGroup.effects) {
                // 获取效果类型键名
                const key = keyMap[ef.type] || ef.type.toLowerCase();
                // 从注册表获取效果类型
                const type = Registry.EFFECT.get(NamespacedKey.minecraft(key));
                if (type == null) {
                    throw new Error('[逻辑幸运方块] 无效药水类型: ' + ef.type + ' (key=' + key + ')');
                }
                // 使用配置持续时间或默认200tick(10秒)
                const duration = ef.duration || 200;
                // 添加效果：类型、持续时间、等级、环境效果、显示粒子
                player.addPotionEffect(new PotionEffect(type, duration, ef.amplifier, false, true));
            }
        }
        // 发送提示消息
        player.sendMessage(ChatColor.GREEN + '瞬间治疗！生命值恢复，获得再生和吸收效果！');
    }

    /* ========== 随机变色羊事件 ========== */
    // 在玩家周围生成随机颜色的羊
    else if (result.eventType === 'rainbow_sheep') {
        // 获取实体类型类
        const EntityType = Java.type('org.bukkit.entity.EntityType');
        // 获取染料颜色类
        const DyeColor = Java.type('org.bukkit.DyeColor');
        // 获取所有颜色
        const colors = DyeColor.values();
        // 获取生成数量
        const count = result.sheepGroup.count || 5;

        // 循环生成羊
        for (let i = 0; i < count; i++) {
            // 随机角度和半径（圆形分布）
            const angle = Math.random() * 2 * Math.PI;
            const r = Math.random() * 5;
            // 计算生成位置
            const x = player.getLocation().getX() + r * Math.cos(angle);
            const z = player.getLocation().getZ() + r * Math.sin(angle);
            const y = player.getLocation().getY();

            // 创建位置对象
            const loc = new org.bukkit.Location(player.getWorld(), x, y, z);
            // 生成羊实体
            const sheep = player.getWorld().spawnEntity(loc, EntityType.SHEEP);
            // 设置随机颜色
            sheep.setColor(colors[randInt(0, colors.length - 1)]);
        }
    }

    /* ========== 随机附魔书事件 ========== */
    // 给予玩家随机附魔的附魔书
    else if (result.eventType === 'random_enchanted_book') {
        // 获取附魔类
        const Enchantment = Java.type('org.bukkit.enchantments.Enchantment');
        // 获取附魔书元数据类
        const EnchantmentStorageMeta = Java.type('org.bukkit.inventory.meta.EnchantmentStorageMeta');

        // 创建附魔书物品
        const book = new ItemStack(Material.ENCHANTED_BOOK, 1);
        // 获取物品元数据
        const meta = book.getItemMeta();
        // 获取所有附魔
        const enchantments = Enchantment.values();
        // 获取附魔等级上限
        const level = result.bookGroup.level || 10;

        // 随机添加1-3个附魔
        const enchantCount = randInt(1, 3);
        for (let i = 0; i < enchantCount; i++) {
            // 随机选择附魔
            const ench = enchantments[randInt(0, enchantments.length - 1)];
            // 计算附魔等级
            const maxLevel = ench.getMaxLevel();
            const enchantLevel = randInt(1, Math.min(maxLevel, Math.floor(level / 10) + 1));
            // 添加存储附魔（附魔书用）
            if (meta instanceof EnchantmentStorageMeta) {
                meta.addStoredEnchant(ench, enchantLevel, true);
            } else {
                meta.addEnchant(ench, enchantLevel, true);
            }
        }
        // 应用元数据
        book.setItemMeta(meta);

        // 掉落附魔书
        const drop = player.getWorld().dropItem(player.getLocation(), book);
        drop.setPickupDelay(PickupDelay); // 1秒不可拾取
    }

    /* ========== 背包混乱事件 ========== */
    // 随机打乱玩家背包物品位置
    else if (result.eventType === 'inventory_shuffle') {
        // 获取玩家背包
        const inventory = player.getInventory();
        // 存储物品的数组
        const contents = [];

        // 收集所有物品（0-35是主背包，36-39是护甲，40是副手）
        for (let i = 0; i < 36; i++) {
            const item = inventory.getItem(i);
            if (item != null) {
                contents.push(item.clone()); // 克隆物品
                inventory.setItem(i, null);  // 清空原位置
            }
        }

        // Fisher-Yates 洗牌算法
        for (let i = contents.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [contents[i], contents[j]] = [contents[j], contents[i]];
        }

        // 随机放回物品
        let slot = 0;
        for (const item of contents) {
            // 找到下一个空槽位
            while (slot < 36 && inventory.getItem(slot) != null) {
                slot++;
            }
            if (slot < 36) {
                inventory.setItem(slot, item);
                slot++;
            }
        }

        // 发送提示消息
        player.sendMessage(ChatColor.RED + '背包混乱！你的物品被随机打乱了！');
    }

    /* ========== 反向控制事件 ========== */
    // 给予玩家混乱效果，模拟反向控制
    else if (result.eventType === 'reverse_control') {
        // 获取持续时间（tick）
        const duration = result.reverseGroup.duration || 100;

        // 缓慢效果（大幅降低移动速度）
        const slowType = Registry.EFFECT.get(NamespacedKey.minecraft('slowness'));
        player.addPotionEffect(new PotionEffect(slowType, duration, 3, false, true));

        // 漂浮效果（难以控制跳跃）
        const levitationType = Registry.EFFECT.get(NamespacedKey.minecraft('levitation'));
        player.addPotionEffect(new PotionEffect(levitationType, Math.floor(duration / 2), 1, false, true));

        // 反胃效果（视觉混乱）
        const nauseaType = Registry.EFFECT.get(NamespacedKey.minecraft('nausea'));
        player.addPotionEffect(new PotionEffect(nauseaType, duration, 0, false, true));

        // 发送提示消息
        player.sendMessage(ChatColor.DARK_RED + '反向控制！你感到头晕目眩，难以控制身体！');
    }

    /* ========== 饥饿诅咒事件 ========== */
    // 清空饱食度并给予饥饿效果
    else if (result.eventType === 'hunger_curse') {
        // 清空饱食度
        player.setFoodLevel(0);
        // 清空饱和度
        player.setSaturation(0);

        // 给予饥饿效果
        const hungerType = Registry.EFFECT.get(NamespacedKey.minecraft('hunger'));
        const duration = (result.hungerGroup.level || 100) * 20; // 转换为tick
        player.addPotionEffect(new PotionEffect(hungerType, duration, 2, false, true));

        // 额外给予虚弱效果
        const weaknessType = Registry.EFFECT.get(NamespacedKey.minecraft('weakness'));
        player.addPotionEffect(new PotionEffect(weaknessType, Math.floor(duration / 2), 1, false, true));

        // 发送提示消息
        player.sendMessage(ChatColor.DARK_RED + '饥饿诅咒！你感到极度饥饿和虚弱！');
    }

    // 消耗幸运方块：数量大于1则减1，否则清空
    if (itemInMain.getAmount() > 1) {
        itemInMain.setAmount(itemInMain.getAmount() - 1);
    } else {
        itemInMain.setAmount(0);
    }

    // ✅ 设置冷却时间（记录本次使用时间）
    cdMap.set(playerId, Date.now());
}