/* 瑶光·祝福 —— 增益辅助三形态（仅对玩家生效） */
const DISPLAY_NAME = '§e§l瑶光§6§l·§a§l祝福';

const SKILL_NAMES = [
    '§e瑶光·光辉',
    '§6瑶光·勇气', 
    '§a瑶光·智慧'
];

const COOLDOWN_MS = 1000;
const RANGE = 10;
const BUFF_TICKS = 1200;         // 60s增益
const STRENGTH_LEVEL = 1;        // 力量II
const RESISTANCE_LEVEL = 1;      // 抗性II

const cdMap = new Map();
const skillMap = new Map();

/* ===== 粒子效果安全获取 ===== */
function getParticle(name) {
    try {
        return Packages.org.bukkit.Particle[name];
    } catch (e) {
        return null;
    }
}

/* ===== 技能分发 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§e祝福之力凝聚中...');
        return;
    }
    cdMap.set(uuid, now);

    const skillIndex = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
    skillMap.set(uuid, skillIndex);

    switch (skillIndex) {
        case 0: skillLight(player); break;
        case 1: skillCourage(player); break;
        case 2: skillWisdom(player); break;
    }

    player.sendMessage(`§e[${SKILL_NAMES[skillIndex]}] §a祝福已降临！`);
}

/* ===== 0 光辉 - 光明+夜视+水下呼吸 ===== */
function skillLight(player) {
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const Player = Packages.org.bukkit.entity.Player;   // 关键：只选玩家

    const glowParticle = getParticle("GLOW_SQUID_INK") || getParticle("GLOW");
    const endRodParticle = getParticle("END_ROD") || getParticle("CRIT_MAGIC");

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof Player) {                       // ← 仅玩家
            const nightVisionType = PotionEffectType.getByName("NIGHT_VISION") || PotionEffectType.NIGHT_VISION;
            const waterBreathingType = PotionEffectType.getByName("WATER_BREATHING") || PotionEffectType.WATER_BREATHING;
            const glowingType = PotionEffectType.getByName("GLOWING");

            if (nightVisionType) ent.addPotionEffect(new PotionEffect(nightVisionType, BUFF_TICKS, 0));
            if (waterBreathingType) ent.addPotionEffect(new PotionEffect(waterBreathingType, BUFF_TICKS, 0));
            if (glowingType) ent.addPotionEffect(new PotionEffect(glowingType, 200, 0));

            if (glowParticle) world.spawnParticle(glowParticle, ent.getLocation(), 10, 1, 2, 1, 0.1);
        }
    });

    if (endRodParticle) {
        for (let i = 0; i < 360; i += 20) {
            const rad = i * Math.PI / 180;
            const x = Math.cos(rad) * RANGE;
            const z = Math.sin(rad) * RANGE;
            const loc = player.getLocation().clone().add(x, 0, z);
            world.spawnParticle(endRodParticle, loc, 2, 0, 0, 0, 0.05);
        }
    }

    world.playSound(player.getLocation(), 'block.beacon.activate', 1, 1.5);
    world.playSound(player.getLocation(), 'block.note_block.chime', 1, 1.2);
}

/* ===== 1 勇气 - 力量+抗性+生命提升 ===== */
function skillCourage(player) {
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const Player = Packages.org.bukkit.entity.Player;

    const critParticle = getParticle("CRIT") || getParticle("CRIT_MAGIC");

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof Player) {                       // ← 仅玩家
            const strengthType = PotionEffectType.getByName("STRENGTH") || PotionEffectType.INCREASE_DAMAGE;
            const resistanceType = PotionEffectType.getByName("RESISTANCE") || PotionEffectType.DAMAGE_RESISTANCE;
            const healthBoostType = PotionEffectType.getByName("HEALTH_BOOST") || PotionEffectType.HEALTH_BOOST;

            if (strengthType) ent.addPotionEffect(new PotionEffect(strengthType, BUFF_TICKS, STRENGTH_LEVEL));
            if (resistanceType) ent.addPotionEffect(new PotionEffect(resistanceType, BUFF_TICKS, RESISTANCE_LEVEL));
            if (healthBoostType) ent.addPotionEffect(new PotionEffect(healthBoostType, BUFF_TICKS, 1));

            if (critParticle) world.spawnParticle(critParticle, ent.getLocation(), 8, 1, 2, 1, 0.1);
        }
    });

    world.playSound(player.getLocation(), 'entity.player.levelup', 1, 1.0);
    world.playSound(player.getLocation(), 'entity.ender_dragon.growl', 1, 0.8);
}

/* ===== 2 智慧 - 幸运+挖掘加速+饱食 ===== */
function skillWisdom(player) {
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const Player = Packages.org.bukkit.entity.Player;

    const enchantParticle = getParticle("ENCHANT") || getParticle("ENCHANTMENT_TABLE");
    const electricSparkParticle = getParticle("ELECTRIC_SPARK") || getParticle("FIREWORKS_SPARK");

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof Player) {                       // ← 仅玩家
            const luckType = PotionEffectType.getByName("LUCK") || PotionEffectType.LUCK;
            const hasteType = PotionEffectType.getByName("HASTE") || PotionEffectType.FAST_DIGGING;
            const saturationType = PotionEffectType.getByName("SATURATION") || PotionEffectType.SATURATION;

            if (luckType) ent.addPotionEffect(new PotionEffect(luckType, BUFF_TICKS, 1));
            if (hasteType) ent.addPotionEffect(new PotionEffect(hasteType, BUFF_TICKS, 1));
            if (saturationType) ent.addPotionEffect(new PotionEffect(saturationType, 100, 0));

            if (enchantParticle) world.spawnParticle(enchantParticle, ent.getLocation(), 15, 1, 2, 1, 0.2);
        }
    });

    if (electricSparkParticle) {
        for (let i = 0; i < 360; i += 30) {
            const rad = i * Math.PI / 180;
            const x = Math.cos(rad) * RANGE;
            const z = Math.sin(rad) * RANGE;
            const loc = player.getLocation().clone().add(x, 1, z);
            world.spawnParticle(electricSparkParticle, loc, 1, 0, 0, 0, 0);
        }
    }

    world.playSound(player.getLocation(), 'block.enchantment_table.use', 1, 1.0);
    world.playSound(player.getLocation(), 'entity.experience_orb.pickup', 1, 1.5);
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