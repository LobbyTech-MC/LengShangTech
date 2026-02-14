/* 幽荧·三形态 —— 右键循环切换技能 */
const DISPLAY_NAME = '§5§l幽荧§8§l·§d§l噬界';

const SKILL_NAMES = [
    '§5幽荧·噬界',
    '§7幽荧·冥爆',
    '§d幽荧·裂魂'
];

const COOLDOWN_MS = 1000;       //冷却时间
const RANGE = 8;
const WITHER_TICKS = 100;        // 5s
const BLIND_TICKS = 60;          // 3s
const BLIND_LEVEL = 1;           // Blindness II

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
        case 0: skillWither(player); break;
        case 1: skillBlind(player);  break;
        case 2: skillStrike(player); break;
    }

    player.sendMessage(`§d[${SKILL_NAMES[skillIndex]}] §a技能已释放！`);
}

/* ===== 技能0 扇形凋零 ===== */
function skillWither(player) {
    const start = player.getEyeLocation();
    const world = player.getWorld();
    const dir = start.getDirection().normalize();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity && ent !== player) {
            const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
            if (dir.angle(toTarget) < Math.PI / 4) {
                ent.addPotionEffect(new Packages.org.bukkit.potion.PotionEffect(
                    Packages.org.bukkit.potion.PotionEffectType.WITHER, WITHER_TICKS, 1));
                ent.damage(6, player);
            }
        }
    });
    world.playSound(start, 'entity.wither.shoot', 1, 1.5);
}

/* ===== 技能1 扇形失明 ===== */
function skillBlind(player) {
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
                ent.addPotionEffect(new PotionEffect(PotionEffectType.BLINDNESS, BLIND_TICKS, BLIND_LEVEL));
                ent.damage(5, player);
            }
        }
    });
    world.playSound(start, 'entity.illusioner.prepare_blindness', 1, 1.2);
}

/* ===== 技能2 扇形雷击 ===== */
function skillStrike(player) {
    const start = player.getEyeLocation();
    const world = player.getWorld();
    const dir = start.getDirection().normalize();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity && ent !== player) {
            const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
            if (dir.angle(toTarget) < Math.PI / 4) {
                world.strikeLightning(ent.getLocation());
                ent.damage(20, player);
            }
        }
    });
    world.playSound(start, 'entity.lightning_bolt.impact', 1, 1.0);
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
onLoad();