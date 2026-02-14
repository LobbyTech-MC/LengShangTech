const DISPLAY_NAME = '§8§l【终章】§c§lⅣ §8§l灵锹';
const WALL_W = 5;
const WALL_H = 3;
const WALL_T = 1;
const COOLDOWN_MS = 300;

const cdMap = new Map();
const wallMap = new Map(); // <玩家UUID, Block[]>
const Material = Java.type('org.bukkit.Material');

function onUse(evt) {
    const player = evt.getPlayer();
    const uuid   = player.getUniqueId().toString();
    const now    = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) return;

    const world = player.getWorld();
    const loc   = player.getLocation();
    const yaw   = (loc.getYaw() + 90) * Math.PI / 180;
    const dirX  = Math.cos(yaw);
    const dirZ  = Math.sin(yaw);
    const rightX = -dirZ;
    const rightZ = dirX;
    const base  = loc.clone().add(0, -1, 0);

    // 再次右键：先清除旧墙
    if (wallMap.has(uuid)) {
        for (const b of wallMap.get(uuid)) b.setType(Material.AIR, false);
        wallMap.delete(uuid);
        player.sendMessage('§8[瞬壁] §7旧墙已清除。');
        cdMap.set(uuid, now);
        return;
    }

    // 瞬间立墙
    const blocks = [];
    for (let w = -Math.floor(WALL_W / 2); w <= Math.floor(WALL_W / 2); w++) {
        for (let h = 0; h < WALL_H; h++) {
            for (let t = 1; t <= WALL_T; t++) {
                const x = Math.floor(base.getX() + rightX * w + dirX * t);
                const y = Math.floor(base.getY() + h);
                const z = Math.floor(base.getZ() + rightZ * w + dirZ * t);
                const b = world.getBlockAt(x, y, z);
                if (b.isEmpty()) {
                    b.setType(Material.NETHERRACK, false);
                    blocks.push(b);
                }
            }
        }
    }

    wallMap.set(uuid, blocks);
    cdMap.set(uuid, now);
    player.sendMessage(`§8[瞬壁] §7${blocks.length} 块下界岩墙已瞬成！`);
    player.sendTitle('§8瞬壁', '§7尘盾升起', 5, 25, 10);
}

function onLoad() {
    return {
        PlayerInteractEvent: function (evt) {
            const action = evt.getAction().name();
            if (action !== 'RIGHT_CLICK_AIR' && action !== 'RIGHT_CLICK_BLOCK') return;
            if (evt.getHand() !== org.bukkit.inventory.EquipmentSlot.HAND) return;
            const item = evt.getPlayer().getInventory().getItemInMainHand();
            if (!item || !item.hasItemMeta() || item.getItemMeta().getDisplayName() !== DISPLAY_NAME) return;
            onUse(evt);
            evt.setCancelled(true);
        }
    };
}
onLoad();