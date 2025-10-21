/* 玄冥·庇护 —— 辅助三形态 */
const DISPLAY_NAME = '§5§l玄冥§9§l·§b§l庇护';

const SKILL_NAMES = [
    '§a玄冥·治疗之雨',
    '§9玄冥·护盾领域', 
    '§b玄冥·迅捷之风'
];

const COOLDOWN_MS = 1000;
const RANGE = 12;
const HEAL_TICKS = 100;          // 5s治疗
const HEAL_LEVEL = 1;            // 再生II
const SHIELD_TICKS = 1200;       // 60s护盾
const SPEED_TICKS = 600;         // 30s速度
const SPEED_LEVEL = 2;           // 速度III
const JUMP_TICKS = 600;          // 30s跳跃
const JUMP_LEVEL = 1;            // 跳跃II

const cdMap = new Map();
const skillMap = new Map();

/* ===== 粒子效果安全获取 ===== */
function getParticle(name) {
    try {
        return Packages.org.bukkit.Particle[name];
    } catch (e) {
        return null;
    }
}

/* ===== 技能分发 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§5玄冥之力凝聚中...');
        return;
    }
    cdMap.set(uuid, now);

    const skillIndex = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
    skillMap.set(uuid, skillIndex);

    switch (skillIndex) {
        case 0: skillHealRain(player); break;
        case 1: skillShieldZone(player); break;
        case 2: skillSwiftWind(player); break;
    }

    player.sendMessage(`§5[${SKILL_NAMES[skillIndex]}] §b庇护之力已释放！`);
}

/* ===== 0 治疗之雨 - 持续回复 ===== */
function skillHealRain(player) {
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    // 获取粒子效果
    const heartParticle = getParticle("HEART") || getParticle("VILLAGER_HAPPY");
    const waterParticle = getParticle("DRIPPING_WATER") || getParticle("WATER_DROP") || getParticle("DRIP_WATER");

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity) {
            // 持续回复效果 - 确保使用存在的效果类型
            const regenType = PotionEffectType.getByName("REGENERATION") || PotionEffectType.REGENERATION;
            if (regenType) {
                ent.addPotionEffect(new PotionEffect(regenType, HEAL_TICKS, HEAL_LEVEL));
            }
            // 瞬间治疗
            ent.setHealth(Math.min(ent.getHealth() + 6, ent.getMaxHealth()));
            
            // 治疗粒子效果（安全生成）
            if (heartParticle) {
                world.spawnParticle(heartParticle, ent.getLocation(), 5, 1, 2, 1, 0.1);
            }
        }
    });
    
    // 范围效果粒子（安全生成）
    if (waterParticle) {
        for (let i = 0; i < 360; i += 30) {
            const rad = i * Math.PI / 180;
            const x = Math.cos(rad) * RANGE;
            const z = Math.sin(rad) * RANGE;
            const loc = player.getLocation().clone().add(x, 3, z);
            world.spawnParticle(waterParticle, loc, 3, 0, 0, 0, 0.1);
        }
    }
    
    world.playSound(player.getLocation(), 'weather.rain.above', 1, 1.0);
    world.playSound(player.getLocation(), 'entity.experience_orb.pickup', 1, 1.2);
}

/* ===== 1 护盾领域 - 吸收护盾+抗性 ===== */
function skillShieldZone(player) {
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    // 获取粒子效果
    const endRodParticle = getParticle("END_ROD") || getParticle("CRIT_MAGIC");

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity) {
            // 使用安全的药水效果获取方式
            const absorptionType = PotionEffectType.getByName("ABSORPTION") || PotionEffectType.ABSORPTION;
            const resistanceType = PotionEffectType.getByName("RESISTANCE") || PotionEffectType.DAMAGE_RESISTANCE;
            const fireResistanceType = PotionEffectType.getByName("FIRE_RESISTANCE") || PotionEffectType.FIRE_RESISTANCE;
            
            if (absorptionType) {
                ent.addPotionEffect(new PotionEffect(absorptionType, SHIELD_TICKS, 2));
            }
            if (resistanceType) {
                ent.addPotionEffect(new PotionEffect(resistanceType, SHIELD_TICKS, 1));
            }
            if (fireResistanceType) {
                ent.addPotionEffect(new PotionEffect(fireResistanceType, SHIELD_TICKS, 0));
            }
            
            // 护盾粒子效果（安全生成）
            if (endRodParticle) {
                world.spawnParticle(endRodParticle, ent.getLocation(), 8, 1, 2, 1, 0.1);
            }
        }
    });
    
    world.playSound(player.getLocation(), 'block.beacon.activate', 1, 0.9);
    world.playSound(player.getLocation(), 'entity.illusioner.prepare_mirror', 1, 1.1);
}

/* ===== 2 迅捷之风 - 速度+跳跃 ===== */
function skillSwiftWind(player) {
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    // 获取粒子效果
    const cloudParticle = getParticle("CLOUD");
    const sweepParticle = getParticle("SWEEP_ATTACK");

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity) {
            // 使用安全的药水效果获取方式
            const speedType = PotionEffectType.getByName("SPEED") || PotionEffectType.SPEED;
            const jumpType = PotionEffectType.getByName("JUMP_BOOST") || PotionEffectType.JUMP;
            
            if (speedType) {
                ent.addPotionEffect(new PotionEffect(speedType, SPEED_TICKS, SPEED_LEVEL));
            }
            if (jumpType) {
                ent.addPotionEffect(new PotionEffect(jumpType, JUMP_TICKS, JUMP_LEVEL));
            }
            
            // 速度粒子效果（安全生成）
            if (cloudParticle) {
                world.spawnParticle(cloudParticle, ent.getLocation(), 15, 0.5, 1, 0.5, 0.05);
            }
        }
    });
    
    // 风效果粒子（安全生成）
    if (sweepParticle) {
        for (let i = 0; i < 3; i++) {
            const loc = player.getLocation().clone().add(
                (Math.random() - 0.5) * RANGE,
                2,
                (Math.random() - 0.5) * RANGE
            );
            world.spawnParticle(sweepParticle, loc, 3, 1, 1, 1, 0);
        }
    }
    
    world.playSound(player.getLocation(), 'entity.parrot.fly', 1, 1.5);
    world.playSound(player.getLocation(), 'block.bamboo.break', 1, 0.8);
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