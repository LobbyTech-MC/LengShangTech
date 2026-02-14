/* 霜烬·战锤 —— 冰火双形态巨锤（右键循环） */
const DISPLAY_NAME = '§b§l霜烬§6§l·§c§l战锤';

const SKILL_NAMES = [
    '§b霜锤·极寒',
    '§6烬锤·地裂',
    '§d霜烬·爆发'
];

const COOLDOWN_MS = 700;
const FREEZE_TICKS = 60; // 3s
const FIRE_TICKS = 80;   // 4s

const cdMap = new Map();
const skillMap = new Map();

// ===== Java 类型 =====
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');
const PotionEffect = Java.type('org.bukkit.potion.PotionEffect');
const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
const Vector = Java.type('org.bukkit.util.Vector');
const Particle = Java.type('org.bukkit.Particle');
const Bukkit = Java.type('org.bukkit.Bukkit');
const BukkitRunnable = Java.type('org.bukkit.scheduler.BukkitRunnable');

/* ===== 主入口 ===== */
function onUse(evt) {
    const p = evt.getPlayer();
    const uuid = p.getUniqueId().toString();
    const now = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        p.sendActionBar('§7战锤冷却中...');
        return;
    }
    cdMap.set(uuid, now);

    const idx = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
    skillMap.set(uuid, idx);

    switch (idx) {
        case 0: skillFreeze(p); break;
        case 1: skillQuake(p); break;
        case 2: skillBurst(p); break;
    }
    p.sendMessage(`§e[${SKILL_NAMES[idx]}] §a技能已释放！`);
}

/* ---------- 1 霜锤·极寒 ---------- */
function skillFreeze(p) {
    const w = p.getWorld();
    const loc = p.getLocation();
    const dir = loc.getDirection().setY(0).normalize();

    w.getNearbyEntities(loc, 5, 3, 5).forEach(e => {
        if (e instanceof LivingEntity && e !== p) {
            const to = e.getLocation().toVector().subtract(loc.toVector()).normalize();
            if (dir.dot(to) > 0.4) {
                e.setFreezeTicks(FREEZE_TICKS);
                e.addPotionEffect(new PotionEffect(PotionEffectType.SLOW, FREEZE_TICKS, 2));
                e.damage(10, p);
            }
        }
    });

    w.playSound(loc, 'block.glass.break', 1, 1.2);
    w.spawnParticle(Particle.SNOWFLAKE, loc, 80, 0.5, 0.5, 0.5, 0.1);
}

/* ---------- 2 烬锤·地裂 ---------- */
function skillQuake(p) {
    const w = p.getWorld();
    const loc = p.getLocation().subtract(0, 1, 0);

    w.getNearbyEntities(loc, 4, 3, 4).forEach(e => {
        if (e instanceof LivingEntity && e !== p) {
            e.setFireTicks(FIRE_TICKS);
            e.setVelocity(new Vector(0, 0.6, 0));
            e.damage(14, p);
        }
    });

    w.playSound(loc, 'block.anvil.land', 1, 1.3);
    w.spawnParticle(Particle.LAVA, loc, 100, 0.5, 0.2, 0.5, 0);
}

/* ---------- 3 霜烬爆发（替换） ---------- */
function skillBurst(p) {
    const w = p.getWorld();
    const loc = p.getLocation();

    w.getNearbyEntities(loc, 4, 3, 4).forEach(e => {
        if (e instanceof LivingEntity && e !== p) {
            e.setFreezeTicks(FREEZE_TICKS);
            e.setFireTicks(FIRE_TICKS);
            e.setVelocity(new Vector(0, 0.8, 0));
            e.damage(12, p);
        }
    });

    w.playSound(loc, 'entity.generic.explode', 1, 1.5);
    w.spawnParticle(Particle.SNOWFLAKE, loc, 60, 0.5, 0.5, 0.5, 0.1);
    w.spawnParticle(Particle.FLAME, loc, 60, 0.5, 0.5, 0.5, 0.1);
}

/* ========== 绑定右键 ========== */
function onLoad() {
    return {
        PlayerInteractEvent: evt => {
            const a = evt.getAction().name();
            if (a !== 'RIGHT_CLICK_AIR' && a !== 'RIGHT_CLICK_BLOCK') return;
            if (evt.getHand() !== org.bukkit.inventory.EquipmentSlot.HAND) return;
            const item = evt.getPlayer().getInventory().getItemInMainHand();
            if (!item || !item.hasItemMeta()) return;
            if (item.getItemMeta().getDisplayName() !== DISPLAY_NAME) return;
            onUse(evt);
        }
    };
}
onLoad();