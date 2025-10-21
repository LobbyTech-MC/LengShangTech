/* 破军·千刃 —— 攻击型三形态 */
const DISPLAY_NAME = '§4§l破军§c§l·§6§l千刃';

const SKILL_NAMES = [
    '§4千刃·斩魂',
    '§c千刃·血舞', 
    '§6千刃·灭却'
];

const COOLDOWN_MS = 1000;
const RANGE = 6;
const BLIND_TICKS = 60;          // 3s失明
const SLOW_TICKS = 80;           // 4s缓慢
const WITHER_TICKS = 100;        // 5s凋零

const cdMap = new Map();
const skillMap = new Map();

/* ===== 技能分发 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§4杀气未聚...');
        return;
    }
    cdMap.set(uuid, now);

    const skillIndex = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
    skillMap.set(uuid, skillIndex);

    switch (skillIndex) {
        case 0: skillSoulSlash(player); break;
        case 1: skillBloodDance(player); break;
        case 2: skillAnnihilation(player); break;
    }

    player.sendMessage(`§c[${SKILL_NAMES[skillIndex]}] §4杀意已释放！`);
}

/* ===== 0 斩魂 - 高伤+凋零效果替代流血 ===== */
function skillSoulSlash(player) {
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
                // 高额伤害 + 凋零效果替代流血
                ent.damage(25, player);
                ent.addPotionEffect(new PotionEffect(PotionEffectType.WITHER, 60, 1)); // 3秒凋零II
                
                // 粒子效果
                world.spawnParticle(Packages.org.bukkit.Particle.CRIT, ent.getLocation(), 15, 0.5, 1, 0.5, 0.2);
                world.spawnParticle(Packages.org.bukkit.Particle.SWEEP_ATTACK, ent.getLocation(), 5, 1, 1, 1, 0);
                world.spawnParticle(Packages.org.bukkit.Particle.DAMAGE_INDICATOR, ent.getLocation(), 8, 0.5, 1, 0.5, 0.1);
            }
        }
    });
    world.playSound(start, 'entity.player.attack.crit', 1, 0.9);
    world.playSound(start, 'entity.player.attack.sweep', 1, 1.0);
}

/* ===== 1 血舞 - 连击+控制 ===== */
function skillBloodDance(player) {
    const start = player.getEyeLocation();
    const world = player.getWorld();
    const dir = start.getDirection().normalize();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;

    let hitCount = 0;
    
    world.getNearbyEntities(start, RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity && ent !== player) {
            const toTarget = ent.getLocation().toVector().subtract(start.toVector()).normalize();
            if (dir.angle(toTarget) < Math.PI / 4) {
                hitCount++;
                // 连击伤害（第一个15，第二个20，第三个25...）
                const damage = 15 + (hitCount * 5);
                ent.damage(damage, player);
                
                // 控制效果
                if (hitCount === 1) {
                    ent.addPotionEffect(new PotionEffect(PotionEffectType.BLINDNESS, BLIND_TICKS, 0));
                } else if (hitCount === 2) {
                    ent.addPotionEffect(new PotionEffect(PotionEffectType.SLOW, SLOW_TICKS, 2));
                }
                
                // 击退效果
                const knockback = ent.getLocation().toVector().subtract(start.toVector()).normalize().multiply(1.5);
                ent.setVelocity(knockback);
                
                // 粒子效果
                world.spawnParticle(Packages.org.bukkit.Particle.REDSTONE, ent.getLocation(), 10, 0.5, 1, 0.5, 0.1, 
                    new Packages.org.bukkit.Particle.DustOptions(Packages.org.bukkit.Color.RED, 2));
            }
        }
    });
    
    world.playSound(start, 'entity.player.attack.strong', 1, 1.1);
    if (hitCount > 0) {
        world.playSound(start, 'entity.experience_orb.pickup', 1, 1.5);
    }
}

/* ===== 2 灭却 - 凋零+范围 ===== */
function skillAnnihilation(player) {
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
                // 凋零伤害
                ent.addPotionEffect(new PotionEffect(PotionEffectType.WITHER, WITHER_TICKS, 2));
                ent.damage(12, player);
                
                // 范围爆炸效果
                world.getNearbyEntities(ent.getLocation(), 3, 3, 3).forEach(function (nearEnt) {
                    if (nearEnt instanceof LivingEntity && nearEnt !== player && nearEnt !== ent) {
                        nearEnt.damage(8, player);
                        world.spawnParticle(Packages.org.bukkit.Particle.SOUL_FIRE_FLAME, nearEnt.getLocation(), 5, 0.5, 1, 0.5, 0.1);
                    }
                });
                
                // 黑色粒子效果
                world.spawnParticle(Packages.org.bukkit.Particle.SQUID_INK, ent.getLocation(), 20, 1, 2, 1, 0.2);
                world.spawnParticle(Packages.org.bukkit.Particle.ASH, ent.getLocation(), 15, 0.5, 1, 0.5, 0.1);
            }
        }
    });
    
    world.playSound(start, 'entity.wither.ambient', 1, 1.3);
    world.playSound(start, 'entity.generic.explode', 1, 1.8);
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