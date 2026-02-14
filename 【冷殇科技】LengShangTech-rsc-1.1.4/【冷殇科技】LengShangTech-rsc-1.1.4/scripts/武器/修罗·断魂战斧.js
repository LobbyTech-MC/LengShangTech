const DISPLAY_NAME = '§8§l【终章】§c§lⅢ §8§l战斧'; // 套装名，按需改
const RANGE = 5;          // 直线5格
const DAMAGE = 10000;        // 真实伤害

const cdMap = new Map();
const COOLDOWN_MS = 600;

/* ========== 断魂斩 ========== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid   = player.getUniqueId().toString();
    const now    = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§c断魂斩尚未冷却...');
        return;
    }
    cdMap.set(uuid, now);

    const world = player.getWorld();
    const loc   = player.getLocation();
    const dir   = loc.getDirection().normalize();

    // 音效：斧刃破空
    world.playSound(loc, 'entity.player.attack.sweep', 1, 0.9);
    world.playSound(loc, 'entity.wither.hurt', 0.8, 1.2);

    let count = 0;

    // 前方直线 5 格
    for (let i = 1; i <= RANGE; i++) {
        const hitLoc = loc.clone().add(dir.clone().multiply(i));
        const entities = world.getNearbyEntities(hitLoc, 0.5, 0.5, 0.5);
        for (const ent of entities) {
            if (ent === player) continue;
            if (!(ent instanceof Packages.org.bukkit.entity.LivingEntity)) continue;

            const hp = ent.getHealth();
            if (hp <= DAMAGE) {
                // 低血处决
                ent.setHealth(0);
                world.playSound(ent.getLocation(), 'entity.wither.death', 1, 1);
            } else {
                // 真实伤害
                ent.damage(DAMAGE, player);
            }
            count++;
            break; // 每格只命中第一个目标
        }
    }

    // 反馈
    if (count > 0) {
        player.sendMessage(`§8[断魂斩] §c${count}§7个目标被斩于斧下。`);
        player.sendTitle('§4断魂', `§8${count} 目标被斩`, 5, 25, 10);
    } else {
        player.sendMessage('§8[断魂斩] §7前方无可斩生灵。');
    }
}

/* ========== 事件绑定 ========== */
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