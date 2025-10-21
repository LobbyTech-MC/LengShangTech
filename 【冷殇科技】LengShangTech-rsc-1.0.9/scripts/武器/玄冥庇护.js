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

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity) {
            // 持续回复效果 - 确保使用存在的效果类型
            if (PotionEffectType.REGENERATION) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.REGENERATION, HEAL_TICKS, HEAL_LEVEL));
            }
            // 瞬间治疗
            ent.setHealth(Math.min(ent.getHealth() + 6, ent.getMaxHealth()));
            
            // 治疗粒子效果
            world.spawnParticle(Packages.org.bukkit.Particle.HEART, ent.getLocation(), 5, 1, 2, 1, 0.1);
        }
    });
    
    // 范围效果粒子
    for (let i = 0; i < 360; i += 30) {
        const rad = i * Math.PI / 180;
        const x = Math.cos(rad) * RANGE;
        const z = Math.sin(rad) * RANGE;
        const loc = player.getLocation().clone().add(x, 3, z);
        world.spawnParticle(Packages.org.bukkit.Particle.DRIP_WATER, loc, 3, 0, 0, 0, 0.1);
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

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity) {
            // 只使用确定存在的效果类型
            if (PotionEffectType.ABSORPTION) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.ABSORPTION, SHIELD_TICKS, 2));
            }
            if (PotionEffectType.DAMAGE_RESISTANCE) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.DAMAGE_RESISTANCE, SHIELD_TICKS, 1));
            }
            if (PotionEffectType.FIRE_RESISTANCE) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.FIRE_RESISTANCE, SHIELD_TICKS, 0));
            }
            
            // 护盾粒子效果
            world.spawnParticle(Packages.org.bukkit.Particle.END_ROD, ent.getLocation(), 8, 1, 2, 1, 0.1);
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

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity) {
            // 只使用确定存在的效果类型
            if (PotionEffectType.SPEED) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.SPEED, SPEED_TICKS, SPEED_LEVEL));
            }
            if (PotionEffectType.JUMP) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.JUMP, JUMP_TICKS, JUMP_LEVEL));
            }
            
            // 速度粒子效果
            world.spawnParticle(Packages.org.bukkit.Particle.CLOUD, ent.getLocation(), 15, 0.5, 1, 0.5, 0.05);
        }
    });
    
    // 风效果粒子
    for (let i = 0; i < 3; i++) {
        const loc = player.getLocation().clone().add(
            (Math.random() - 0.5) * RANGE,
            2,
            (Math.random() - 0.5) * RANGE
        );
        world.spawnParticle(Packages.org.bukkit.Particle.SWEEP_ATTACK, loc, 3, 1, 1, 1, 0);
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