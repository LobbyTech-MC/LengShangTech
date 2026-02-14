/* 紫电·青霜·三形态 —— 右键循环切换技能 */
const DISPLAY_NAME = '§5§l紫电§b§l·§3§l青霜';

const SKILL_NAMES = [
    '§5紫电·惊雷',
    '§b青霜·寒冰',
    '§c赤炎·焚天'
];

const COOLDOWN_MS = 1000;
const RANGE = 8;
const SLOW_TICKS = 40;           // 2s
const SLOW_LEVEL = 2;            // Slowness III
const BLIND_TICKS = 40;          // 2s
const WEAK_TICKS = 60;           // 3s
const FIRE_TICKS = 60;           // 3s

const cdMap = new Map();         // 玩家冷却
const skillMap = new Map();      // 玩家当前技能索引

/* ===== 安全获取药水效果类型 ===== */
function getPotionEffectType(name) {
    try {
        return Packages.org.bukkit.potion.PotionEffectType.getByName(name);
    } catch (e) {
        return null;
    }
}

/* ===== 安全获取粒子效果 ===== */
function getParticle(name) {
    try {
        return Packages.org.bukkit.Particle[name];
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

        // 冷却
        if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
            player.sendActionBar('§7元素能量充能中...');
            return;
        }
        cdMap.set(uuid, now);

        // 切换技能（循环 0→1→2→0）
        const skillIndex = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
        skillMap.set(uuid, skillIndex);

        // 释放当前技能
        switch (skillIndex) {
            case 0: skillThunder(player); break;
            case 1: skillIce(player);  break;
            case 2: skillFire(player); break;
        }

        // 提示
        player.sendMessage(`§d[${SKILL_NAMES[skillIndex]}] §b元素之力已释放！`);
    } catch (error) {
        console.log("紫电青霜脚本错误: " + error);
    }
}

/* ===== 技能0 紫电·惊雷 - 雷电+麻痹 ===== */
function skillThunder(player) {
    try {
        const start = player.getEyeLocation();
        const world = player.getWorld();
        const dir = start.getDirection().normalize();
        const LivingEntity = Packages.org.bukkit.entity.LivingEntity;
        const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
        
        // 安全获取药水效果类型
        const slowEffect = getPotionEffectType("SLOWNESS") || Packages.org.bukkit.potion.PotionEffectType.SLOW;
        const blindEffect = getPotionEffectType("BLINDNESS") || Packages.org.bukkit.potion.PotionEffectType.BLINDNESS;
        
        // 安全获取粒子效果
        const electricParticle = getParticle("ELECTRIC_SPARK") || getParticle("FIREWORKS_SPARK");

        world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
            if (ent instanceof LivingEntity && ent !== player) {
                const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
                if (dir.angle(toTarget) < Math.PI / 4) {
                    // 伤害和效果
                    ent.damage(8, player);
                    
                    // 只添加存在的药水效果
                    if (slowEffect) {
                        ent.addPotionEffect(new PotionEffect(slowEffect, SLOW_TICKS, SLOW_LEVEL));
                    }
                    if (blindEffect) {
                        ent.addPotionEffect(new PotionEffect(blindEffect, BLIND_TICKS, 0));
                    }
                    
                    // 雷电粒子和音效
                    if (electricParticle) {
                        world.spawnParticle(electricParticle, ent.getLocation(), 8, 0.5, 1, 0.5, 0.1);
                    }
                }
            }
        });
        world.playSound(start, 'entity.lightning_bolt.thunder', 1, 1.5);
        world.playSound(start, 'block.conduit.ambient', 1, 1.2);
    } catch (error) {
        console.log("紫电青霜-雷电技能错误: " + error);
    }
}

/* ===== 技能1 青霜·寒冰 - 冰霜+减速虚弱 ===== */
function skillIce(player) {
    try {
        const start = player.getEyeLocation();
        const world = player.getWorld();
        const dir = start.getDirection().normalize();
        const LivingEntity = Packages.org.bukkit.entity.LivingEntity;
        const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
        
        // 安全获取药水效果类型
        const slowEffect = getPotionEffectType("SLOWNESS") || Packages.org.bukkit.potion.PotionEffectType.SLOW;
        const weakEffect = getPotionEffectType("WEAKNESS") || Packages.org.bukkit.potion.PotionEffectType.WEAKNESS;
        
        // 安全获取粒子效果
        const snowParticle = getParticle("SNOWFLAKE") || getParticle("SNOW_SHOVEL");

        world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
            if (ent instanceof LivingEntity && ent !== player) {
                const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
                if (dir.angle(toTarget) < Math.PI / 4) {
                    // 伤害和效果
                    ent.damage(6, player);
                    
                    // 只添加存在的药水效果
                    if (slowEffect) {
                        ent.addPotionEffect(new PotionEffect(slowEffect, SLOW_TICKS, SLOW_LEVEL + 1)); // Slowness IV
                    }
                    if (weakEffect) {
                        ent.addPotionEffect(new PotionEffect(weakEffect, WEAK_TICKS, 0));
                    }
                    
                    // 冰霜粒子和音效
                    if (snowParticle) {
                        world.spawnParticle(snowParticle, ent.getLocation(), 12, 0.5, 1, 0.5, 0.1);
                    }
                }
            }
        });
        world.playSound(start, 'block.glass.break', 1, 0.8);
        world.playSound(start, 'block.snow.break', 1, 1.0);
    } catch (error) {
        console.log("紫电青霜-冰技能错误: " + error);
    }
}

/* ===== 技能2 赤炎·焚天 - 火焰+点燃 ===== */
function skillFire(player) {
    try {
        const start = player.getEyeLocation();
        const world = player.getWorld();
        const dir = start.getDirection().normalize();
        const LivingEntity = Packages.org.bukkit.entity.LivingEntity;
        const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
        
        // 安全获取药水效果类型
        const slowEffect = getPotionEffectType("SLOWNESS") || Packages.org.bukkit.potion.PotionEffectType.SLOW;
        
        // 安全获取粒子效果
        const flameParticle = getParticle("FLAME");
        const smokeParticle = getParticle("SMOKE_NORMAL") || getParticle("SMOKE");

        world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
            if (ent instanceof LivingEntity && ent !== player) {
                const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
                if (dir.angle(toTarget) < Math.PI / 4) {
                    // 伤害和效果
                    ent.damage(5, player);
                    ent.setFireTicks(FIRE_TICKS);
                    
                    // 只添加存在的药水效果
                    if (slowEffect) {
                        ent.addPotionEffect(new PotionEffect(slowEffect, SLOW_TICKS, 0)); // 轻微减速
                    }
                    
                    // 火焰粒子和音效
                    if (flameParticle) {
                        world.spawnParticle(flameParticle, ent.getLocation(), 10, 0.5, 1, 0.5, 0.1);
                    }
                    if (smokeParticle) {
                        world.spawnParticle(smokeParticle, ent.getLocation(), 5, 0.5, 1, 0.5, 0.05);
                    }
                }
            }
        });
        world.playSound(start, 'item.flintandsteel.use', 1, 1.0);
        world.playSound(start, 'block.fire.ambient', 1, 1.2);
    } catch (error) {
        console.log("紫电青霜-火技能错误: " + error);
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
                console.log("紫电青霜-事件绑定错误: " + error);
            }
        }
    };
}
onLoad();