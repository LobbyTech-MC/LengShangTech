/* 影闪之镰 —— 定向闪现武器 */
const DISPLAY_NAME = '§b闪现之刃';

const COOLDOWN_MS = 10000; // 10s 冷却
const TELEPORT_DISTANCE = 10; // 闪现距离

const cdMap = new Map();

/* ===== 闪现技能 ===== */
function skillBlink(player) {
    const loc = player.getLocation();
    const dir = loc.getDirection().normalize();
    const target = loc.clone().add(dir.multiply(TELEPORT_DISTANCE));
    target.setYaw(loc.getYaw());
    target.setPitch(loc.getPitch());
    player.teleport(target);
    player.getWorld().playSound(target, 'entity.enderman.teleport', 1, 1.3);
}

/* ===== 技能使用 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        const remaining = (COOLDOWN_MS - (now - cdMap.get(uuid))) / 1000;
        player.sendActionBar(`§c技能冷却中... §7(${remaining.toFixed(1)}s)`);
        return;
    }
    cdMap.set(uuid, now);

    skillBlink(player);
    player.sendMessage('§b[影闪] §a已向前方闪现！');
    player.sendActionBar('§b影闪 §e| §7冷却: 10s');
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