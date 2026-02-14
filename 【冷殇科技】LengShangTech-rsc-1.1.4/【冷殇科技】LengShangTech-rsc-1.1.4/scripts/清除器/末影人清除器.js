const DISPLAY_NAME = '§6末影人清除器';

const RANGE = 10;         // 清除半径
const COOLDOWN_MS = 1000;  // 冷却1秒

const cdMap = new Map();

/* ===== 范围清除“普通”末影人 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    // 冷却检查
    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§7冷却中...');
        return;
    }
    cdMap.set(uuid, now);

    const world = player.getWorld();
    const location = player.getLocation();

    /* ===== 清除“普通”末影人 ===== */
    const Enderman = Packages.org.bukkit.entity.Enderman;
    let clearCount = 0;

    world.getNearbyEntities(location, RANGE, RANGE, RANGE).forEach(function(ent) {
        if (!(ent instanceof Enderman)) return;          // 只处理末影人

        // 1. 自定义名称
        if (ent.getCustomName() !== null) return;
        // 2. 药水效果
        if (ent.getActivePotionEffects().size() > 0) return;

        // 全部检查通过 -> 纯裸末影人
        ent.remove();
        clearCount++;
    });

    // 反馈信息
    if (clearCount > 0) {
        player.sendMessage(`§6已清除${clearCount}只末影人`);
    } else {
        player.sendMessage('§7半径10格内未发现可清除的末影人');
    }
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