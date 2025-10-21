/* 极昼·耀斑 —— 爆发链锯（右键三连） */
const DISPLAY_NAME = '§e§l极昼§6§l·§c§l耀斑';

const SKILL_NAMES = [
    '§e裂阳斩',
    '§6灼日斩',
    '§c耀斑斩'
];

const COOLDOWN_MS = 800; // 0.8 s 链式冷却
const BASE_DMG = 10;     // 第一击基础伤害
const DMG_STEP = 4;      // 每击递增伤害
const TRUE_DMG_PERCENT = 0.15; // 最后一击 15% 真实伤害
const FIRE_TICKS = 100;  // 5 秒点燃

const cdMap = new Map();
const skillMap = new Map();

/* ===== 主入口 ===== */
function onUse(evt) {
    const p = evt.getPlayer();
    const uuid = p.getUniqueId().toString();
    const now = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        p.sendActionBar('§7技能冷却中...');
        return;
    }
    cdMap.set(uuid, now);

    const idx = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
    skillMap.set(uuid, idx);

    switch (idx) {
        case 0: skillSunSplit(p); break;
        case 1: skillSunScorch(p); break;
        case 2: skillSunFlare(p); break;
    }
    p.sendMessage(`§e[${SKILL_NAMES[idx]}] §a技能已释放！`);
}

/* ---------- 1 裂阳斩 ---------- */
function skillSunSplit(p) {
    const dmg = BASE_DMG;
    sweepDamage(p, dmg, 3);
    p.getWorld().playSound(p.getLocation(), 'entity.player.attack.sweep', 1, 1.2);
}

/* ---------- 2 灼日斩 ---------- */
function skillSunScorch(p) {
    const dmg = BASE_DMG + DMG_STEP;
    sweepDamage(p, dmg, 3.5);
    p.getWorld().playSound(p.getLocation(), 'item.flintandsteel.use', 1, 1.4);
}

/* ---------- 3 耀斑斩（真实伤害+点燃） ---------- */
function skillSunFlare(p) {
    const normal = BASE_DMG + 2 * DMG_STEP;
    const trueDmg = normal * TRUE_DMG_PERCENT;

    sweepDamage(p, normal, 4);
    // 额外真实伤害圈
    p.getWorld().getNearbyEntities(p.getLocation(), 4, 4, 4).forEach(e => {
        if (e instanceof Java.type('org.bukkit.entity.LivingEntity') && e !== p) {
            // 真实伤害（绕过护甲）
            e.damage(trueDmg, p);
            e.setFireTicks(FIRE_TICKS);
        }
    });
    p.getWorld().spawnParticle(Java.type('org.bukkit.Particle').FLAME, p.getLocation(), 100, 0.5, 0.5, 0.5, 0.1);
    p.getWorld().playSound(p.getLocation(), 'entity.blaze.shoot', 1, 1.5);
}

/* ========== 通用半月形伤害 ========== */
function sweepDamage(p, dmg, radius) {
    const loc = p.getLocation();
    const dir = loc.getDirection().setY(0).normalize();
    loc.getWorld().getNearbyEntities(loc, radius, radius, radius).forEach(e => {
        if (e instanceof Java.type('org.bukkit.entity.LivingEntity') && e !== p) {
            const to = e.getLocation().toVector().subtract(loc.toVector()).normalize();
            if (dir.dot(to) > 0.3) { // 前方 120°
                e.damage(dmg, p);
            }
        }
    });
}

/* ========== 右键触发 ========== */
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