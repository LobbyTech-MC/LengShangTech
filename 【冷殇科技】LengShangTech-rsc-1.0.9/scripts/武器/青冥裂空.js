/* 青冥·三形态 —— 右键循环切换技能 */
const DISPLAY_NAME = '§3§l青冥§b§l·§d§l裂空';

const SKILL_NAMES = [
    '§3青冥·裂空',
    '§9青冥·寒域',
    '§5青冥·星坠'
];

const COOLDOWN_MS = 1000;        //冷却时间
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
        case 0: skillRift(player);   break;
        case 1: skillFrost(player);  break;
        case 2: skillStar(player);   break;
    }

    player.sendMessage(`§b[${SKILL_NAMES[skillIndex]}] §a技能已释放！`);
}

/* ===== 技能0 扇形凋零 ===== */
function skillRift(player) {
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
    world.playSound(start, 'item.trident.return', 1, 1.5);
}

/* ===== 技能1 扇形失明 ===== */
function skillFrost(player) {
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
    world.playSound(start, 'block.amethyst_block.break', 1, 1.2);
}

/* ===== 技能2 扇形星落 ===== */
function skillStar(player) {
    const start = player.getEyeLocation();
    const world = player.getWorld();
    const dir = start.getDirection().normalize();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity && ent !== player) {
            const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
            if (dir.angle(toTarget) < Math.PI / 4) {
                world.spawnEntity(ent.getLocation(), Packages.org.bukkit.entity.EntityType.LIGHTNING);
                ent.damage(20, player);
            }
        }
    });
    world.playSound(start, 'entity.elder_guardian.curio', 1, 0.8);
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