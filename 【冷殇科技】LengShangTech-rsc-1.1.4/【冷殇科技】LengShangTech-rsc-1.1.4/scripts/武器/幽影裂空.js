/* 幽影·裂空 —— 刺客三连镰刀 */
const DISPLAY_NAME = '§8§l幽影§5§l·§d§l裂空';

const SKILL_NAMES = [
    '§7影闪',
    '§5裂背',
    '§d处决'
];

const COOLDOWN_MS = 1000; // 1s 高频率
const RANGE = 8;
const BACKstab_MULTIPLIER = 2.2; // 背刺倍伤
const HP_EXECUTE = 0.25; // ≤25% 血量直接斩杀

const cdMap = new Map();
const skillMap = new Map();

/* ===== 技能分发 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§7§o技能冷却中...');
        return;
    }
    cdMap.set(uuid, now);

    const skillIndex = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
    skillMap.set(uuid, skillIndex);

    switch (skillIndex) {
        case 0: skillBlink(player); break;
        case 1: skillBackstab(player); break;
        case 2: skillExecute(player); break;
    }
    player.sendMessage(`§e[${SKILL_NAMES[skillIndex]}] §a技能已释放！`);
}

/* ===== 0 影闪 ===== */
function skillBlink(player) {
    const loc = player.getLocation();
    const dir = loc.getDirection().normalize();
    const target = loc.clone().add(dir.multiply(10));
    target.setYaw(loc.getYaw());
    target.setPitch(loc.getPitch());
    player.teleport(target);
    player.getWorld().playSound(target, 'entity.enderman.teleport', 1, 1.3);
}

/* ===== 1 裂背 ===== */
function skillBackstab(player) {
    const start = player.getEyeLocation();
    const world = player.getWorld();
    const dir = start.getDirection().normalize();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity && ent !== player) {
            const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
            if (dir.angle(toTarget) < Math.PI / 6) { // 30°锥形
                let dmg = 12;
                // 背后判定
                if (ent.getLocation().getDirection().angle(toTarget) > Math.PI / 2) {
                    dmg *= BACKstab_MULTIPLIER;
                }
                ent.damage(dmg, player);
            }
        }
    });
    world.playSound(start, 'item.trident.hit', 1, 1.5);
}

/* ===== 2 处决 ===== */
function skillExecute(player) {
    const start = player.getEyeLocation();
    const world = player.getWorld();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity && ent !== player) {
            if (ent.getHealth() / ent.getMaxHealth() <= HP_EXECUTE) {
                ent.damage(999, player); // 直接斩杀
                world.strikeLightning(ent.getLocation());
            } else {
                ent.damage(16, player); // 不足血量则重斩
            }
        }
    });
    world.playSound(start, 'entity.wither.spawn', 1, 1.2);
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