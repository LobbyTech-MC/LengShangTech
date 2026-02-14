const DISPLAY_NAME = '§a消§b耗§9卡 §d- §5伤害吸收 III';

const SKILL_NAMES = [
    '§5消耗卡 - 伤害吸收 III'
];

const COOLDOWN_MS = 1000; //时间
const BUFF_TICKS = 1200000000;    // 6000000s
const RANGE = 1;           // 技能影响范围（格数）

const cdMap = new Map();
const skillMap = new Map();

/* ===== 技能分发 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§7冷却中...');
        return;
    }
    cdMap.set(uuid, now);

    const skillIndex = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 1 : 0;
    skillMap.set(uuid, skillIndex);

    switch (skillIndex) {
        case 0: skillBuff(player); break;
    }

    player.sendMessage(`§5[${SKILL_NAMES[skillIndex]}] §a已使用！`);
    
    // 添加物品消耗逻辑
    const invs = player.getInventory();
    const itemInMainHand = invs.getItemInMainHand();
    
    if (itemInMainHand.getAmount() > 1) {
        itemInMainHand.setAmount(itemInMainHand.getAmount() - 1);
    } else {
        invs.setItemInMainHand(null); // 如果只剩下一个，则移除物品
    }
}

/* ===== 群体增益 ===== */
function skillBuff(player) {
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    //提供伤害吸收效果
    const absorptionEffect = PotionEffectType.getByName("ABSORPTION") || PotionEffectType.ABSORPTION;

    const buffs = [
        new PotionEffect(absorptionEffect, BUFF_TICKS, 2)
    ];

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity && ent !== player) {
            buffs.forEach(buff => {
                if (buff.getType() !== null) {
                    ent.addPotionEffect(buff);
                }
            });
        }
    });
    // 自己也吃
    buffs.forEach(b => {
        if (b.getType() !== null) {
            player.addPotionEffect(b);
        }
    });
    world.playSound(player.getLocation(), 'item.totem.use', 1, 1.2);
}

/* ===== 事件绑定 ===== */
function onLoad() {
    return {
        PlayerInteractEvent: function (evt) {
            const action = evt.getAction().name();
            if (action !== 'RIGHT_CLICK_AIR' && action !== 'RIGHT_CLICK_BLOCK') return;
            if (evt.getHand() !== org.bukkit.inventory.EquipmentSlot.HAND) return;

            const item = evt.getPlayer().getInventory().getItemInMainHand();
            if (!item || !item.hasItemMeta()) return;
            if (item.getItemMeta().getDisplayName() !== DISPLAY_NAME) return;

            onUse(evt);
            evt.setCancelled(true);
        }
    };
}