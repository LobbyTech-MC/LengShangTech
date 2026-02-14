/* 霜烬·战锤 —— 冰火双形态巨锤（右键循环） */
const DISPLAY_NAME = '§b§l霜烬§6§l·§c§l战锤';

const SKILL_NAMES = [
    '§b霜锤·极寒',
    '§6烬锤·地裂',
    '§d霜烬·爆发'
];

const COOLDOWN_MS = 700;
const FREEZE_TICKS = 60; // 3s
const FIRE_TICKS = 80;   // 4s

const cdMap = new Map();
const skillMap = new Map();

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

/* ===== 主入口 ===== */
function onUse(evt) {
    try {
        const p = evt.getPlayer();
        const uuid = p.getUniqueId().toString();
        const now = Date.now();

        if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
            p.sendActionBar('§7战锤冷却中...');
            return;
        }
        cdMap.set(uuid, now);

        const idx = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
        skillMap.set(uuid, idx);

        switch (idx) {
            case 0: skillFreeze(p); break;
            case 1: skillQuake(p); break;
            case 2: skillBurst(p); break;
        }
        p.sendMessage(`§e[${SKILL_NAMES[idx]}] §a技能已释放！`);
    } catch (error) {
        console.log("霜烬战锤脚本错误: " + error);
    }
}

/* ---------- 1 霜锤·极寒 ---------- */
function skillFreeze(p) {
    try {
        const w = p.getWorld();
        const loc = p.getLocation();
        const dir = loc.getDirection().setY(0).normalize();
        
        // 安全获取药水效果类型
        const slowEffect = getPotionEffectType("SLOWNESS") || Packages.org.bukkit.potion.PotionEffectType.SLOW;
        
        // 安全获取粒子效果
        const snowParticle = getParticle("SNOWFLAKE") || getParticle("SNOW_SHOVEL");

        w.getNearbyEntities(loc, 5, 3, 5).forEach(e => {
            if (e instanceof Packages.org.bukkit.entity.LivingEntity && e !== p) {
                const to = e.getLocation().toVector().subtract(loc.toVector()).normalize();
                if (dir.dot(to) > 0.4) {
                    e.setFreezeTicks(FREEZE_TICKS);
                    
                    // 只添加存在的药水效果
                    if (slowEffect) {
                        e.addPotionEffect(new Packages.org.bukkit.potion.PotionEffect(slowEffect, FREEZE_TICKS, 2));
                    }
                    
                    e.damage(10, p);
                }
            }
        });

        w.playSound(loc, 'block.glass.break', 1, 1.2);
        
        // 安全生成粒子效果
        if (snowParticle) {
            w.spawnParticle(snowParticle, loc, 80, 0.5, 0.5, 0.5, 0.1);
        }
    } catch (error) {
        console.log("霜烬战锤-冰技能错误: " + error);
    }
}

/* ---------- 2 烬锤·地裂 ---------- */
function skillQuake(p) {
    try {
        const w = p.getWorld();
        const loc = p.getLocation().subtract(0, 1, 0);
        
        // 安全获取粒子效果
        const lavaParticle = getParticle("LAVA") || getParticle("DRIP_LAVA");

        w.getNearbyEntities(loc, 4, 3, 4).forEach(e => {
            if (e instanceof Packages.org.bukkit.entity.LivingEntity && e !== p) {
                e.setFireTicks(FIRE_TICKS);
                e.setVelocity(new Packages.org.bukkit.util.Vector(0, 0.6, 0));
                e.damage(14, p);
            }
        });

        w.playSound(loc, 'block.anvil.land', 1, 1.3);
        
        // 安全生成粒子效果
        if (lavaParticle) {
            w.spawnParticle(lavaParticle, loc, 100, 0.5, 0.2, 0.5, 0);
        }
    } catch (error) {
        console.log("霜烬战锤-火技能错误: " + error);
    }
}

/* ---------- 3 霜烬爆发（替换） ---------- */
function skillBurst(p) {
    try {
        const w = p.getWorld();
        const loc = p.getLocation();
        
        // 安全获取粒子效果
        const snowParticle = getParticle("SNOWFLAKE") || getParticle("SNOW_SHOVEL");
        const flameParticle = getParticle("FLAME");

        w.getNearbyEntities(loc, 4, 3, 4).forEach(e => {
            if (e instanceof Packages.org.bukkit.entity.LivingEntity && e !== p) {
                e.setFreezeTicks(FREEZE_TICKS);
                e.setFireTicks(FIRE_TICKS);
                e.setVelocity(new Packages.org.bukkit.util.Vector(0, 0.8, 0));
                e.damage(12, p);
            }
        });

        w.playSound(loc, 'entity.generic.explode', 1, 1.5);
        
        // 安全生成粒子效果
        if (snowParticle) {
            w.spawnParticle(snowParticle, loc, 60, 0.5, 0.5, 0.5, 0.1);
        }
        if (flameParticle) {
            w.spawnParticle(flameParticle, loc, 60, 0.5, 0.5, 0.5, 0.1);
        }
    } catch (error) {
        console.log("霜烬战锤-爆发技能错误: " + error);
    }
}

/* ========== 绑定右键 ========== */
function onLoad() {
    return {
        PlayerInteractEvent: evt => {
            try {
                const a = evt.getAction().name();
                if (a !== 'RIGHT_CLICK_AIR' && a !== 'RIGHT_CLICK_BLOCK') return;
                if (evt.getHand() !== org.bukkit.inventory.EquipmentSlot.HAND) return;
                const item = evt.getPlayer().getInventory().getItemInMainHand();
                if (!item || !item.hasItemMeta()) return;
                if (item.getItemMeta().getDisplayName() !== DISPLAY_NAME) return;
                onUse(evt);
                evt.setCancelled(true);
            } catch (error) {
                console.log("霜烬战锤-事件绑定错误: " + error);
            }
        }
    };
}
onLoad();