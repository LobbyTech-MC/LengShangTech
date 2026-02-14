/* 赤霄·三形态 —— 右键循环切换技能 */
const DISPLAY_NAME = '§c§l赤霄§6§l·§e§l焚天';

const SKILL_NAMES = [
    '§c赤霄·焚天',
    '§b赤霄·霜狱',
    '§e赤霄·雷噬'
];

const COOLDOWN_MS = 1000;
const RANGE = 8;
const FIRE_TICKS = 100;          // 5s
const SLOW_TICKS = 20;           // 1s
const SLOW_LEVEL = 2;            // Slowness III

const cdMap = new Map();         // 玩家冷却
const skillMap = new Map();      // 玩家当前技能索引

/* ===== 技能分发 ===== */
function onUse(evt) {
    try {
        const player = evt.getPlayer();
        const uuid = player.getUniqueId().toString();
        const now = Date.now();

        // 冷却
        if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
            player.sendActionBar('§7技能冷却中...');
            return;
        }
        cdMap.set(uuid, now);

        // 切换技能（循环 0→1→2→0）
        const skillIndex = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
        skillMap.set(uuid, skillIndex);

        // 释放当前技能
        switch (skillIndex) {
            case 0: skillFire(player); break;
            case 1: skillIce(player);  break;
            case 2: skillThunder(player); break;
        }

        // 提示
        player.sendMessage(`§e[${SKILL_NAMES[skillIndex]}] §a技能已释放！`);
    } catch (error) {
        console.log("赤霄焚天脚本错误: " + error);
    }
}

/* ===== 技能0 扇形火 ===== */
function skillFire(player) {
    try {
        const start = player.getEyeLocation();
        const world = player.getWorld();
        const dir = start.getDirection().normalize();
        const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

        world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
            if (ent instanceof LivingEntity && ent !== player) {
                const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
                if (dir.angle(toTarget) < Math.PI / 4) {
                    ent.setFireTicks(FIRE_TICKS);
                    ent.damage(6, player);
                }
            }
        });
        world.playSound(start, 'item.flintandsteel.use', 1, 1.5);
    } catch (error) {
        console.log("赤霄焚天-火技能错误: " + error);
    }
}

/* ===== 技能1 扇形减速 ===== */
function skillIce(player) {
    try {
        const start = player.getEyeLocation();
        const world = player.getWorld();
        const dir = start.getDirection().normalize();
        const LivingEntity = Packages.org.bukkit.entity.LivingEntity;
        const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
        const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;

        // 安全获取药水效果类型
        const slowEffect = PotionEffectType.getByName("SLOWNESS") || PotionEffectType.SLOW;

        world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
            if (ent instanceof LivingEntity && ent !== player) {
                const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
                if (dir.angle(toTarget) < Math.PI / 4) {
                    ent.addPotionEffect(new PotionEffect(slowEffect, SLOW_TICKS, SLOW_LEVEL));
                    ent.damage(5, player);
                }
            }
        });
        world.playSound(start, 'block.glass.break', 1, 1.2);
    } catch (error) {
        console.log("赤霄焚天-冰技能错误: " + error);
    }
}

/* ===== 技能2 扇形雷击 ===== */
function skillThunder(player) {
    try {
        const start = player.getEyeLocation();
        const world = player.getWorld();
        const dir = start.getDirection().normalize();
        const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

        world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
            if (ent instanceof LivingEntity && ent !== player) {
                const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
                if (dir.angle(toTarget) < Math.PI / 4) {
                    // 使用安全的闪电方法
                    const loc = ent.getLocation();
                    world.strikeLightningEffect(loc); // 只产生视觉效果，不造成伤害
                    ent.damage(20, player);
                }
            }
        });
        world.playSound(start, 'entity.lightning_bolt.thunder', 1, 1.0);
    } catch (error) {
        console.log("赤霄焚天-雷技能错误: " + error);
    }
}

/* ===== 事件绑定 ===== */
function onLoad() {
    return {
        PlayerInteractEvent: function (evt) {
            try {
                const action = evt.getAction().name();
                if (action !== 'RIGHT_CLICK_AIR' && action !== 'RIGHT_CLICK_BLOCK') return;
                if (evt.getHand() !== org.bukkit.inventory.EquipmentSlot.HAND) return;

                const item = evt.getPlayer().getInventory().getItemInMainHand();
                if (!item || !item.hasItemMeta()) return;
                if (item.getItemMeta().getDisplayName() !== DISPLAY_NAME) return;

                onUse(evt);
                evt.setCancelled(true);
            } catch (error) {
                console.log("赤霄焚天-事件绑定错误: " + error);
            }
        }
    };
}
onLoad();