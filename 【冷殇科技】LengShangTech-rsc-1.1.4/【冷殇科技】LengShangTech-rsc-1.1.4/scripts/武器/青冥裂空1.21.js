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

/* ===== 安全获取实体类型 ===== */
function getEntityType(name) {
    try {
        return Packages.org.bukkit.entity.EntityType[name];
    } catch (e) {
        return null;
    }
}

/* ===== 安全获取药水效果类型 ===== */
function getPotionEffectType(name) {
    try {
        return Packages.org.bukkit.potion.PotionEffectType.getByName(name);
    } catch (e) {
        return null;
    }
}

/* ===== 技能分发 ===== */
function onUse(evt) {
    try {
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
    } catch (error) {
        console.log("青冥裂空脚本错误: " + error);
    }
}

/* ===== 技能0 扇形凋零 ===== */
function skillRift(player) {
    try {
        const start = player.getEyeLocation();
        const world = player.getWorld();
        const dir = start.getDirection().normalize();
        const LivingEntity = Packages.org.bukkit.entity.LivingEntity;
        
        // 安全获取药水效果类型
        const witherEffect = getPotionEffectType("WITHER") || Packages.org.bukkit.potion.PotionEffectType.WITHER;

        world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
            if (ent instanceof LivingEntity && ent !== player) {
                const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
                if (dir.angle(toTarget) < Math.PI / 4) {
                    // 只添加存在的药水效果
                    if (witherEffect) {
                        ent.addPotionEffect(new Packages.org.bukkit.potion.PotionEffect(
                            witherEffect, WITHER_TICKS, 1));
                    }
                    ent.damage(6, player);
                }
            }
        });
        world.playSound(start, 'item.trident.return', 1, 1.5);
    } catch (error) {
        console.log("青冥裂空-凋零技能错误: " + error);
    }
}

/* ===== 技能1 扇形失明 ===== */
function skillFrost(player) {
    try {
        const start = player.getEyeLocation();
        const world = player.getWorld();
        const dir = start.getDirection().normalize();
        const LivingEntity = Packages.org.bukkit.entity.LivingEntity;
        
        // 安全获取药水效果类型
        const blindEffect = getPotionEffectType("BLINDNESS") || Packages.org.bukkit.potion.PotionEffectType.BLINDNESS;

        world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
            if (ent instanceof LivingEntity && ent !== player) {
                const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
                if (dir.angle(toTarget) < Math.PI / 4) {
                    // 只添加存在的药水效果
                    if (blindEffect) {
                        ent.addPotionEffect(new Packages.org.bukkit.potion.PotionEffect(blindEffect, BLIND_TICKS, BLIND_LEVEL));
                    }
                    ent.damage(5, player);
                }
            }
        });
        world.playSound(start, 'block.amethyst_block.break', 1, 1.2);
    } catch (error) {
        console.log("青冥裂空-失明技能错误: " + error);
    }
}

/* ===== 技能2 扇形星落 ===== */
function skillStar(player) {
    try {
        const start = player.getEyeLocation();
        const world = player.getWorld();
        const dir = start.getDirection().normalize();
        const LivingEntity = Packages.org.bukkit.entity.LivingEntity;
        
        // 尝试多种可能的闪电实体类型名称
        let lightningType = null;
        const possibleNames = ["LIGHTNING_BOLT", "LIGHTNING", "THUNDERBOLT"];
        
        for (let i = 0; i < possibleNames.length; i++) {
            lightningType = getEntityType(possibleNames[i]);
            if (lightningType !== null) break;
        }

        world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
            if (ent instanceof LivingEntity && ent !== player) {
                const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
                if (dir.angle(toTarget) < Math.PI / 4) {
                    // 使用安全的闪电生成方法
                    if (lightningType) {
                        try {
                            world.spawnEntity(ent.getLocation(), lightningType);
                        } catch (e) {
                            // 如果生成实体失败，使用闪电效果替代
                            world.strikeLightningEffect(ent.getLocation());
                        }
                    } else {
                        // 如果无法找到任何闪电实体类型，使用闪电效果
                        world.strikeLightningEffect(ent.getLocation());
                    }
                    ent.damage(20, player);
                }
            }
        });
        world.playSound(start, 'entity.elder_guardian.curio', 1, 0.8);
    } catch (error) {
        console.log("青冥裂空-星落技能错误: " + error);
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
                console.log("青冥裂空-事件绑定错误: " + error);
            }
        }
    };
}
onLoad();