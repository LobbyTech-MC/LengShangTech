const DISPLAY_NAME = '§c§l修罗神剑';

const RANGE = 15;          // 击杀范围半径
const COOLDOWN_MS = 1000;  // 冷却时间1秒

const cdMap = new Map();

/* ===== 范围击杀功能（已排除隐身盔甲架） ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    // 冷却检查
    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§c修罗之力尚未恢复...');
        return;
    }
    cdMap.set(uuid, now);

    const world = player.getWorld();
    const location = player.getLocation();

    // 播放特效音效
    world.playSound(location, 'entity.wither.death', 1, 0.7);
    world.playSound(location, 'entity.ender_dragon.death', 1, 1.2);

    // 范围击杀效果
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;
    const ArmorStand     = Packages.org.bukkit.entity.ArmorStand;
    let killCount = 0;

    world.getNearbyEntities(location, RANGE, RANGE, RANGE).forEach(function(ent) {
        // 排除隐身盔甲架
        if (ent instanceof ArmorStand) return;

        if (ent instanceof LivingEntity && ent !== player) {
            ent.setHealth(0);
            killCount++;

            // 单体特效
            world.playSound(ent.getLocation(), 'entity.generic.explode', 0.8, 1.5);
        }
    });

    // 反馈信息
    if (killCount > 0) {
        player.sendMessage(`§8[修罗领域] §4死亡波纹扩散，${killCount}个生灵归于虚无...`);
        player.sendTitle('§4审判', `§8${killCount}个目标已终结`, 10, 40, 10);
    } else {
        player.sendMessage('§8[修罗领域] §7半径15格内未发现可终结的目标...');
    }

    // 视觉反馈
    player.addPotionEffect(
        new Packages.org.bukkit.potion.PotionEffect(
            Packages.org.bukkit.potion.PotionEffectType.BLINDNESS, 20, 0
        )
    );
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