/* 紫电·青霜·三形态 —— 右键循环切换技能 */
const DISPLAY_NAME = '§5§l紫电§b§l·§3§l青霜';

const SKILL_NAMES = [
    '§5紫电·惊雷',
    '§b青霜·寒冰',
    '§c赤炎·焚天'
];

const COOLDOWN_MS = 1000;
const RANGE = 8;
const SLOW_TICKS = 40;           // 2s
const SLOW_LEVEL = 2;            // Slowness III
const BLIND_TICKS = 40;          // 2s
const WEAK_TICKS = 60;           // 3s
const FIRE_TICKS = 60;           // 3s

const cdMap = new Map();         // 玩家冷却
const skillMap = new Map();      // 玩家当前技能索引

/* ===== 技能分发 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    // 冷却
    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§7元素能量充能中...');
        return;
    }
    cdMap.set(uuid, now);

    // 切换技能（循环 0→1→2→0）
    const skillIndex = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
    skillMap.set(uuid, skillIndex);

    // 释放当前技能
    switch (skillIndex) {
        case 0: skillThunder(player); break;
        case 1: skillIce(player);  break;
        case 2: skillFire(player); break;
    }

    // 提示
    player.sendMessage(`§d[${SKILL_NAMES[skillIndex]}] §b元素之力已释放！`);
}

/* ===== 技能0 紫电·惊雷 - 雷电+麻痹 ===== */
function skillThunder(player) {
    const start = player.getEyeLocation();
    const world = player.getWorld();
    const dir = start.getDirection().normalize();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;

    world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity && ent !== player) {
            const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
            if (dir.angle(toTarget) < Math.PI / 4) {
                // 伤害和效果
                ent.damage(8, player);
                ent.addPotionEffect(new PotionEffect(PotionEffectType.SLOW, SLOW_TICKS, SLOW_LEVEL));
                ent.addPotionEffect(new PotionEffect(PotionEffectType.BLINDNESS, BLIND_TICKS, 0));
                
                // 雷电粒子和音效
                world.spawnParticle(Packages.org.bukkit.Particle.ELECTRIC_SPARK, ent.getLocation(), 8, 0.5, 1, 0.5, 0.1);
            }
        }
    });
    world.playSound(start, 'entity.lightning_bolt.thunder', 1, 1.5);
    world.playSound(start, 'block.conduit.ambient', 1, 1.2);
}

/* ===== 技能1 青霜·寒冰 - 冰霜+减速虚弱 ===== */
function skillIce(player) {
    const start = player.getEyeLocation();
    const world = player.getWorld();
    const dir = start.getDirection().normalize();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;

    world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity && ent !== player) {
            const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
            if (dir.angle(toTarget) < Math.PI / 4) {
                // 伤害和效果
                ent.damage(6, player);
                ent.addPotionEffect(new PotionEffect(PotionEffectType.SLOW, SLOW_TICKS, SLOW_LEVEL + 1)); // Slowness IV
                ent.addPotionEffect(new PotionEffect(PotionEffectType.WEAKNESS, WEAK_TICKS, 0));
                
                // 冰霜粒子和音效
                world.spawnParticle(Packages.org.bukkit.Particle.SNOWFLAKE, ent.getLocation(), 12, 0.5, 1, 0.5, 0.1);
            }
        }
    });
    world.playSound(start, 'block.glass.break', 1, 0.8);
    world.playSound(start, 'block.snow.break', 1, 1.0);
}

/* ===== 技能2 赤炎·焚天 - 火焰+点燃 ===== */
function skillFire(player) {
    const start = player.getEyeLocation();
    const world = player.getWorld();
    const dir = start.getDirection().normalize();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;

    world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity && ent !== player) {
            const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
            if (dir.angle(toTarget) < Math.PI / 4) {
                // 伤害和效果
                ent.damage(5, player);
                ent.setFireTicks(FIRE_TICKS);
                ent.addPotionEffect(new PotionEffect(PotionEffectType.SLOW, SLOW_TICKS, 0)); // 轻微减速
                
                // 火焰粒子和音效
                world.spawnParticle(Packages.org.bukkit.Particle.FLAME, ent.getLocation(), 10, 0.5, 1, 0.5, 0.1);
                world.spawnParticle(Packages.org.bukkit.Particle.SMOKE_NORMAL, ent.getLocation(), 5, 0.5, 1, 0.5, 0.05);
            }
        }
    });
    world.playSound(start, 'item.flintandsteel.use', 1, 1.0);
    world.playSound(start, 'block.fire.ambient', 1, 1.2);
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