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
    /* 普通单抽组 50% */
    {
        groupWeight: 50,
        allDrop: false,
        items: [
            { type: 'sf', id: 'VOID_BIT', amount: {min:1, max:16} },//虚空粒
            { type: 'sf', id: 'VOID_DUST', amount: {min:1, max:2} },//虚空粉尘
            { type: 'sf', id: 'END_ESSENCE', amount: {min:1, max:64} },//末地精华
            { type: 'sf', id: 'MAGSTEEL', amount: {min:1, max:32} },//磁钢
            { type: 'sf', id: 'MAGSTEEL_PLATE', amount: {min:1, max:8} },//磁钢板
            { type: 'sf', id: 'TITANIUM', amount: {min:1, max:4} },//钛
            { type: 'sf', id: 'MACHINE_CIRCUIT', amount: {min:1, max:4} },//机器电路
            { type: 'sf', id: 'MACHINE_PLATE', amount: {min:1, max:2} },//机器板块
            { type: 'sf', id: 'MACHINE_CORE', amount: {min:1, max:1} },//机器核心
            { type: 'sf', id: 'BASIC_COBBLE_GEN', amount: {min:1, max:2} },//基础圆石生成器
            { type: 'sf', id: 'BASIC_VIRTUAL_FARM', amount: {min:1, max:2} },//基础自动农场
            { type: 'sf', id: 'BASIC_TREE_GROWER', amount: {min:1, max:2} },//基础自动植树机
            { type: 'sf', id: 'BASIC_STRAINER', amount: 1 },//基础滤网
            { type: 'sf', id: 'ADVANCED_STRAINER', amount: 1 },//高级滤网
            { type: 'sf', id: 'REINFORCED_STRAINER', amount: 1 },//强化合金滤网
            { type: 'sf', id: 'STRAINER_BASE', amount: {min:1, max:4} },//滤网底座
            { type: 'sf', id: 'HYDRO_GENERATOR', amount: {min:1, max:16} },//水力发电机
            { type: 'sf', id: 'QUARRY_OSCILLATOR_REDSTONE', amount: 1 },//红石粉加速器
            { type: 'sf', id: 'QUARRY_OSCILLATOR_LAPIS_LAZULI', amount: 1 },//青金石加速器
            { type: 'sf', id: 'QUARRY_OSCILLATOR_EMERALD', amount: 1 },//绿宝石加速器
            { type: 'sf', id: 'QUARRY_OSCILLATOR_QUARTZ', amount: 1 },//下界石英加速器
            { type: 'sf', id: 'QUARRY_OSCILLATOR_DIAMOND', amount: 1 },//钻石加速器
            { type: 'sf', id: 'ENDER_FLAME', amount: 1 },//末影之焰
            { type: 'sf', id: 'VEIN_MINER_RUNE', amount: {min:1, max:8} },//矿脉符文
            { type: 'sf', id: 'BASIC_PANEL', amount: {min:1, max:16} },//基础太阳能发电机
            { type: 'sf', id: 'EMPTY_DATA_CARD', amount: 1 }//空生物芯片
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
    /* 高级机器 */
    {
        groupWeight: 10,
        allDrop: false,
        items: [
            { type: 'sf', id: 'ADVANCED_ANVIL', amount: 1 },//高级铁砧
            { type: 'sf', id: 'INFINITY_FORGE', amount: 1 },//无尽工作台
            { type: 'sf', id: 'MOB_SIMULATION_CHAMBER', amount: 1 },//生物实验室
            { type: 'sf', id: 'DATA_INFUSER', amount: 1 },//生物芯片植入机
            { type: 'sf', id: 'VOID_HARVESTER', amount: 1 },//虚空收集者
            { type: 'sf', id: 'STONEWORKS_FACTORY', amount: 1 },//石材厂
            { type: 'sf', id: 'SINGULARITY_CONSTRUCTOR', amount: 1 },//奇点构造机
            { type: 'sf', id: 'RESOURCE_SYNTHESIZER', amount: 1 },//资源合成器
            { type: 'sf', id: 'ADVANCED_COBBLE_GEN', amount: 1 },//高级圆石生成器
            { type: 'sf', id: 'BASIC_OBSIDIAN_GEN', amount: 1 },//黑曜石生成器
            { type: 'sf', id: 'ADVANCED_VIRTUAL_FARM', amount: 1 },//高级自动农场
            { type: 'sf', id: 'ADVANCED_TREE_GROWER', amount: 1 },//高级自动植树机
            { type: 'sf', id: 'EXTREME_FREEZER', amount: 1 },//极寒冰柜
            { type: 'sf', id: 'DUST_EXTRACTOR', amount: 1 },//磨粉机
            { type: 'sf', id: 'INGOT_FORMER', amount: 1 },//铸锭机
            { type: 'sf', id: 'COBBLE_PRESS', amount: 1 },//圆石压缩机
            { type: 'sf', id: 'URANIUM_EXTRACTOR', amount: 1 },//铀提取器
            { type: 'sf', id: 'DECOMPRESSOR', amount: 1 },//分解机
            { type: 'sf', id: 'GEAR_TRANSFORMER', amount: 1 },//装备材质转换器
            { type: 'sf', id: 'BASIC_QUARRY', amount: 1 },//基础矿机
            { type: 'sf', id: 'ADVANCED_QUARRY', amount: 1 },//高级矿机
            { type: 'sf', id: 'ADVANCED_GEO_MINER', amount: 1 },//高级GEO矿机
            { type: 'sf', id: 'REINFORCED_HYDRO_GENERATOR', amount: 1 },//高级水力发电机
            { type: 'sf', id: 'GEOTHERMAL_GENERATOR', amount: 1 },//地热发电机
            { type: 'sf', id: 'REINFORCED_GEOTHERMAL_GENERATOR', amount: 1 },//高级地热发电机
            { type: 'sf', id: 'ADVANCED_PANEL', amount: 1 },//高级太阳能发电机
            { type: 'sf', id: 'CELESTIAL_PANEL', amount: 1 },//超级太阳能发电机
            { type: 'sf', id: 'ADVANCED_ENCHANTER', amount: 1 },//高级自动附魔机
            { type: 'sf', id: 'ADVANCED_DISENCHANTER', amount: 1 },//高级自动祛魔机
            { type: 'sf', id: 'ADVANCED_CHARGER', amount: 1 },//高级充电台
            { type: 'sf', id: 'ADVANCED_NETHER_STAR_REACTOR', amount: 1 },//高级下界之星反应堆
            { type: 'sf', id: 'ADVANCED_SMELTERY', amount: 1 }//高级冶炼炉
        ]
    },
    /* 生物芯片 */
    {
        groupWeight: 10,
        allDrop: false,
        items: [
            { type: 'sf', id: 'ZOMBIE_DATA_CARD', amount: 1 },//僵尸
            { type: 'sf', id: 'SLIME_DATA_CARD', amount: 1 },//史莱姆
            { type: 'sf', id: 'MAGMA_CUBE_DATA_CARD', amount: 1 },//岩浆怪
            { type: 'sf', id: 'COW_DATA_CARD', amount: 1 },//牛
            { type: 'sf', id: 'SPIDER_DATA_CARD', amount: 1 },//蜘蛛
            { type: 'sf', id: 'SKELETON_DATA_CARD', amount: 1 },//骷髅
            { type: 'sf', id: 'SHEEP_DATA_CARD', amount: 1 },//绵羊
            { type: 'sf', id: 'WITHER_SKELETON_DATA_CARD', amount: 1 },//凋零骷髅
            { type: 'sf', id: 'ENDERMEN_DATA_CARD', amount: 1 },//末影人
            { type: 'sf', id: 'CREEPER_DATA_CARD', amount: 1 },//苦力怕
            { type: 'sf', id: 'GUARDIAN_DATA_CARD', amount: 1 },//守卫者
            { type: 'sf', id: 'CHICKEN_DATA_CARD', amount: 1 },//鸡
            { type: 'sf', id: 'IRON_GOLEM_DATA_CARD', amount: 1 },//铁傀儡
            { type: 'sf', id: 'BLAZE_DATA_CARD', amount: 1 },//烈焰人
            { type: 'sf', id: 'BEE_DATA_CARD', amount: 1 },//蜜蜂
            { type: 'sf', id: 'VILLAGER_DATA_CARD', amount: 1 },//村民
            { type: 'sf', id: 'WITCH_DATA_CARD', amount: 1 },//女巫
            { type: 'sf', id: 'VEX_DATA_CARD', amount: 1 },//恼鬼
            { type: 'sf', id: 'PHANTOM_DATA_CARD', amount: 1 }//幻翼
        ]
    },
    /* 奇点 */
    {
        groupWeight: 10,
        allDrop: false,
        items: [
            { type: 'sf', id: 'COPPER_SINGULARITY', amount: 1 },//铜
            { type: 'sf', id: 'ZINC_SINGULARITY', amount: 1 },//锌
            { type: 'sf', id: 'TIN_SINGULARITY', amount: 1 },//锡
            { type: 'sf', id: 'ALUMINUM_SINGULARITY', amount: 1 },//铝
            { type: 'sf', id: 'SILVER_SINGULARITY', amount: 1 },//银
            { type: 'sf', id: 'MAGNESIUM_SINGULARITY', amount: 1 },//镁
            { type: 'sf', id: 'LEAD_SINGULARITY', amount: 1 },//铅
            { type: 'sf', id: 'GOLD_SINGULARITY', amount: 1 },//金
            { type: 'sf', id: 'QUARTZ_SINGULARITY', amount: 1 },//石英
            { type: 'sf', id: 'IRON_SINGULARITY', amount: 1 },//铁
            { type: 'sf', id: 'LAPIS_SINGULARITY', amount: 1 },//青金石
            { type: 'sf', id: 'REDSTONE_SINGULARITY', amount: 1 },//红石
            { type: 'sf', id: 'COAL_SINGULARITY', amount: 1 },//煤炭
            { type: 'sf', id: 'NETHERITE_SINGULARITY', amount: 1 },//下界合金
            { type: 'sf', id: 'EMERALD_SINGULARITY', amount: 1 },//绿宝石
            { type: 'sf', id: 'DIAMOND_SINGULARITY', amount: 1 }//钻石
        ]
    },
    /* 奇点锭 */
    {
        groupWeight: 3,
        allDrop: false,
        items: [
            { type: 'sf', id: 'MAGNONIUM', amount: 1 },//磁金
            { type: 'sf', id: 'ADAMANTITE', amount: 1 },//精金
            { type: 'sf', id: 'MYTHRIL', amount: 1 }//秘银
        ]
    },
    /* 圆石五件套 */
    {
        groupWeight: 10,
        allDrop: true,
        items: [
            { type: 'sf', id: 'COMPRESSED_COBBLESTONE_1', amount: 1 },
            { type: 'sf', id: 'COMPRESSED_COBBLESTONE_2', amount: 1 },
            { type: 'sf', id: 'COMPRESSED_COBBLESTONE_3', amount: 1 },
            { type: 'sf', id: 'COMPRESSED_COBBLESTONE_4', amount: 1 },
            { type: 'sf', id: 'COMPRESSED_COBBLESTONE_5', amount: 1 }
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