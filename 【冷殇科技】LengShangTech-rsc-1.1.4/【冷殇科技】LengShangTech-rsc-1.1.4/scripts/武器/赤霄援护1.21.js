/* 赤霄·援护 —— 战斗辅助三形态 */
const DISPLAY_NAME = '§d§l赤霄§c§l·§e§l援护';

const SKILL_NAMES = [
    '§c急救回春',
    '§6增益号角',
    '§b净化护盾'
];

const COOLDOWN_MS = 1000; //时间
const RANGE = 50;          // 辅助半径
const HEAL_AMOUNT = 100;     // 技能1 回血量
const BUFF_TICKS = 1200;    // 60s
const SHIELD_TICKS = 1200;  // 60s

const cdMap = new Map();
const skillMap = new Map();

/* ===== 技能分发 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§7技能冷却中...');
        return;
    }
    cdMap.set(uuid, now);

    const skillIndex = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
    skillMap.set(uuid, skillIndex);

    switch (skillIndex) {
        case 0: skillHeal(player); break;
        case 1: skillBuff(player); break;
        case 2: skillShield(player); break;
    }

    player.sendMessage(`§e[${SKILL_NAMES[skillIndex]}] §a技能已释放！`);
}

/* ===== 0 范围回血 ===== */
function skillHeal(player) {
    const world = player.getWorld();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity && ent !== player) {
            ent.setHealth(Math.min(ent.getHealth() + HEAL_AMOUNT, ent.getMaxHealth()));
        }
    });
    // 自己也回
    player.setHealth(Math.min(player.getHealth() + HEAL_AMOUNT, player.getMaxHealth()));
    world.playSound(player.getLocation(), 'entity.experience_orb.pickup', 1, 0.8);
}

/* ===== 1 群体增益 ===== */
function skillBuff(player) {
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    // 使用正确的药水效果类型名称
    const strengthEffect = PotionEffectType.getByName("STRENGTH") || PotionEffectType.INCREASE_DAMAGE;
    const speedEffect = PotionEffectType.getByName("SPEED") || PotionEffectType.SPEED;
    const regenEffect = PotionEffectType.getByName("REGENERATION") || PotionEffectType.REGENERATION;

    const buffs = [
        new PotionEffect(strengthEffect, BUFF_TICKS, 4),
        new PotionEffect(speedEffect, BUFF_TICKS, 4),
        new PotionEffect(regenEffect, BUFF_TICKS, 4)
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

/* ===== 2 净化+护盾 ===== */
function skillShield(player) {
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    // 使用正确的药水效果类型名称
    const resistanceEffect = PotionEffectType.getByName("RESISTANCE") || PotionEffectType.DAMAGE_RESISTANCE;
    const absorptionEffect = PotionEffectType.getByName("ABSORPTION") || PotionEffectType.ABSORPTION;

    // 先净化负面
    const negatives = [
        PotionEffectType.getByName("POISON") || PotionEffectType.POISON,
        PotionEffectType.getByName("WITHER") || PotionEffectType.WITHER,
        PotionEffectType.getByName("WEAKNESS") || PotionEffectType.WEAKNESS,
        PotionEffectType.getByName("BLINDNESS") || PotionEffectType.BLINDNESS,
        PotionEffectType.getByName("SLOWNESS") || PotionEffectType.SLOW
    ];

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity) {
            negatives.forEach(t => {
                if (t !== null) {
                    ent.removePotionEffect(t);
                }
            });
            // 抗性 + 吸收护盾
            if (resistanceEffect !== null) {
                ent.addPotionEffect(new PotionEffect(resistanceEffect, SHIELD_TICKS, 2));
            }
            if (absorptionEffect !== null) {
                ent.addPotionEffect(new PotionEffect(absorptionEffect, SHIELD_TICKS, 10));
            }
        }
    });
    world.playSound(player.getLocation(), 'block.beacon.activate', 1, 1.0);
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