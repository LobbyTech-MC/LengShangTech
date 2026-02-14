/* 瑶光·祝福 —— 增益辅助三形态 */
const DISPLAY_NAME = '§e§l瑶光§6§l·§a§l祝福';

const SKILL_NAMES = [
    '§e瑶光·光辉',
    '§6瑶光·勇气', 
    '§a瑶光·智慧'
];

const COOLDOWN_MS = 1000;
const RANGE = 10;
const BUFF_TICKS = 1200;         // 60s增益
const STRENGTH_LEVEL = 1;        // 力量II
const RESISTANCE_LEVEL = 1;      // 抗性II

const cdMap = new Map();
const skillMap = new Map();

/* ===== 技能分发 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§e祝福之力凝聚中...');
        return;
    }
    cdMap.set(uuid, now);

    const skillIndex = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
    skillMap.set(uuid, skillIndex);

    switch (skillIndex) {
        case 0: skillLight(player); break;
        case 1: skillCourage(player); break;
        case 2: skillWisdom(player); break;
    }

    player.sendMessage(`§e[${SKILL_NAMES[skillIndex]}] §a祝福已降临！`);
}

/* ===== 0 光辉 - 光明+夜视+水下呼吸 ===== */
function skillLight(player) {
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity) {
            // 夜视效果
            if (PotionEffectType.NIGHT_VISION) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.NIGHT_VISION, BUFF_TICKS, 0));
            }
            // 水下呼吸
            if (PotionEffectType.WATER_BREATHING) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.WATER_BREATHING, BUFF_TICKS, 0));
            }
            // 发光效果
            if (PotionEffectType.GLOWING) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.GLOWING, 200, 0)); // 10秒发光
            }
            
            // 光明粒子效果
            world.spawnParticle(Packages.org.bukkit.Particle.GLOW, ent.getLocation(), 10, 1, 2, 1, 0.1);
        }
    });
    
    // 范围光效
    for (let i = 0; i < 360; i += 20) {
        const rad = i * Math.PI / 180;
        const x = Math.cos(rad) * RANGE;
        const z = Math.sin(rad) * RANGE;
        const loc = player.getLocation().clone().add(x, 0, z);
        world.spawnParticle(Packages.org.bukkit.Particle.END_ROD, loc, 2, 0, 0, 0, 0.05);
    }
    
    world.playSound(player.getLocation(), 'block.beacon.activate', 1, 1.5);
    world.playSound(player.getLocation(), 'block.note_block.chime', 1, 1.2);
}

/* ===== 1 勇气 - 力量+抗性+生命提升 ===== */
function skillCourage(player) {
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity) {
            // 力量提升
            if (PotionEffectType.INCREASE_DAMAGE) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.INCREASE_DAMAGE, BUFF_TICKS, STRENGTH_LEVEL));
            }
            // 伤害抗性
            if (PotionEffectType.DAMAGE_RESISTANCE) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.DAMAGE_RESISTANCE, BUFF_TICKS, RESISTANCE_LEVEL));
            }
            // 生命提升
            if (PotionEffectType.HEALTH_BOOST) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.HEALTH_BOOST, BUFF_TICKS, 1));
            }
            
            // 勇气粒子效果
            world.spawnParticle(Packages.org.bukkit.Particle.CRIT, ent.getLocation(), 8, 1, 2, 1, 0.1);
        }
    });
    
    world.playSound(player.getLocation(), 'entity.player.levelup', 1, 1.0);
    world.playSound(player.getLocation(), 'entity.ender_dragon.growl', 1, 0.8);
}

/* ===== 2 智慧 - 幸运+挖掘加速+饱食 ===== */
function skillWisdom(player) {
    const PotionEffect = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity) {
            // 幸运效果
            if (PotionEffectType.LUCK) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.LUCK, BUFF_TICKS, 1));
            }
            // 急迫（挖掘加速）
            if (PotionEffectType.FAST_DIGGING) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.FAST_DIGGING, BUFF_TICKS, 1));
            }
            // 饱和
            if (PotionEffectType.SATURATION) {
                ent.addPotionEffect(new PotionEffect(PotionEffectType.SATURATION, 100, 0)); // 5秒饱和
            }
            
            // 智慧粒子效果
            world.spawnParticle(Packages.org.bukkit.Particle.ENCHANTMENT_TABLE, ent.getLocation(), 15, 1, 2, 1, 0.2);
        }
    });
    
    // 智慧光环效果
    for (let i = 0; i < 360; i += 30) {
        const rad = i * Math.PI / 180;
        const x = Math.cos(rad) * RANGE;
        const z = Math.sin(rad) * RANGE;
        const loc = player.getLocation().clone().add(x, 1, z);
        world.spawnParticle(Packages.org.bukkit.Particle.ELECTRIC_SPARK, loc, 1, 0, 0, 0, 0);
    }
    
    world.playSound(player.getLocation(), 'block.enchantment_table.use', 1, 1.0);
    world.playSound(player.getLocation(), 'entity.experience_orb.pickup', 1, 1.5);
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