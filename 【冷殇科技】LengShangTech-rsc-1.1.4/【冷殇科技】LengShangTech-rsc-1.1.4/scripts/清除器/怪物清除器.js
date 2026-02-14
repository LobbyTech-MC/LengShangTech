const DISPLAY_NAME = '§6怪物清除器';   // 想换名字只改这里

const RANGE = 10; // 清除半径
const COOLDOWN_MS = 1000;  // 冷却1秒
const cdMap = new Map();

/* 要处理的 8 种怪物类 */
const TARGET_CLASSES = [
    Packages.org.bukkit.entity.Zombie, //僵尸
    Packages.org.bukkit.entity.Skeleton,//骷髅
    Packages.org.bukkit.entity.Creeper,//苦力怕
    Packages.org.bukkit.entity.Spider,//蜘蛛
    Packages.org.bukkit.entity.Enderman, //末影人
    Packages.org.bukkit.entity.PigZombie,   // 僵尸猪灵
    Packages.org.bukkit.entity.Phantom,     // 幻翼
    Packages.org.bukkit.entity.Slime       // 史莱姆
];

/* 快速判断是否在目标列表 */
function isTarget(ent) {
    for (let i = 0; i < TARGET_CLASSES.length; i++) {
        if (TARGET_CLASSES[i].class.isInstance(ent)) return true;
    }
    return false;
}

/* 主逻辑 */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§7冷却中...');
        return;
    }
    cdMap.set(uuid, now);

    const world = player.getWorld();
    const loc = player.getLocation();
    let clearCount = 0;

    const it = world.getNearbyEntities(loc, RANGE, RANGE, RANGE).iterator();
    while (it.hasNext()) {
        const ent = it.next();
        if (!isTarget(ent)) continue;

        // 只检查命名 & 药水
        if (ent.getCustomName() !== null) continue;
        if (ent.getActivePotionEffects().size() > 0) continue;

        ent.remove();
        clearCount++;
    }

    player.sendMessage(clearCount > 0
        ? `§6已清除${clearCount}只怪物`
        : '§7半径10格内未发现可清除的目标怪物');
}

/* 事件绑定 */
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