const DISPLAY_NAME = '§6掉落物清除器';

const RANGE = 100;         // 清除半径
const COOLDOWN_MS = 1000;  // 冷却1秒

const cdMap = new Map();

/* ===== 范围清除掉落物 ===== */
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

    // 清除掉落物
    const Item = Packages.org.bukkit.entity.Item;
    let clearCount = 0;

    world.getNearbyEntities(location, RANGE, RANGE, RANGE).forEach(function(ent) {
        if (ent instanceof Item) {
            ent.remove();
            clearCount++;
        }
    });

    // 反馈信息
    if (clearCount > 0) {
        player.sendMessage(`§6已清除${clearCount}个掉落物`);
    } else {
        player.sendMessage('§7半径100格内未发现可清除的掉落物');
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