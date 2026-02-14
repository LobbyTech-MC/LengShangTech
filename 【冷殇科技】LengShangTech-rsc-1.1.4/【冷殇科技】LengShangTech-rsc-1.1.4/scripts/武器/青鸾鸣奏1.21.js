/* 青鸾·鸣奏 —— 三形态辅助（仅玩家） */
const DISPLAY_NAME = '§a§l青鸾§b§l·§e§l鸣奏';

const SKILL_NAMES = [
    '§a青鸾·治愈音符',
    '§b青鸾·风行旋律',
    '§e青鸾·晨曦和弦'
];

const COOLDOWN_MS   = 1000;
const RANGE         = 12;        // 作用半径
const HEAL_TICKS    = 600;       // 30s 再生
const HEAL_LEVEL    = 1;         // 再生 II
const BUFF_TICKS    = 1200;       // 60s 通用
const SPEED_LEVEL   = 2;         // 速度 III
const JUMP_LEVEL    = 1;         // 跳跃 II
const LUCK_LEVEL    = 1;         // 幸运 II
const HASTE_LEVEL   = 1;         // 挖掘加速 II

const cdMap = new Map();
const skillMap = new Map();

/* ===== 安全获取粒子 ===== */
function getParticle(name) {
    try { return Packages.org.bukkit.Particle[name]; } catch (e) { return null; }
}

/* ===== 技能分发 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid  = player.getUniqueId().toString();
    const now   = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§a青鸾之力凝聚中...');
        return;
    }
    cdMap.set(uuid, now);

    const idx = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 3 : 0;
    skillMap.set(uuid, idx);

    switch (idx) {
        case 0: healNote(player);   break;
        case 1: windMelody(player); break;
        case 2: dawnChord(player);  break;
    }

    player.sendMessage(`§a[${SKILL_NAMES[idx]}] §e鸣奏已响起！`);
}

/* ===== 1. 治愈音符 ===== */
function healNote(player) {
    const PotionEffect     = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const Player = Packages.org.bukkit.entity.Player;

    const heart = getParticle("HEART") || getParticle("VILLAGER_HAPPY");
    const note  = getParticle("NOTE");

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(ent => {
        if (!(ent instanceof Player)) return;

        // 瞬间治疗 3 心
        ent.setHealth(Math.min(ent.getHealth() + 6, ent.getMaxHealth()));

        const regen = PotionEffectType.getByName("REGENERATION") || PotionEffectType.REGENERATION;
        if (regen) ent.addPotionEffect(new PotionEffect(regen, HEAL_TICKS, HEAL_LEVEL));

        if (heart) world.spawnParticle(heart, ent.getLocation(), 8, 0.5, 1, 0.5, 0.1);
        if (note)  world.spawnParticle(note,  ent.getLocation(), 12, 0.5, 1, 0.5, 0.1);
    });

    world.playSound(player.getLocation(), "block.note_block.chime", 1, 1.2);
    world.playSound(player.getLocation(), "entity.experience_orb.pickup", 1, 1.5);
}

/* ===== 2. 风行旋律 ===== */
function windMelody(player) {
    const PotionEffect     = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const Player = Packages.org.bukkit.entity.Player;

    const cloud = getParticle("CLOUD");
    const sweep = getParticle("SWEEP_ATTACK");

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(ent => {
        if (!(ent instanceof Player)) return;

        const speed = PotionEffectType.getByName("SPEED") || PotionEffectType.SPEED;
        const jump  = PotionEffectType.getByName("JUMP_BOOST") || PotionEffectType.JUMP;
        const slow  = PotionEffectType.getByName("SLOW_FALLING") || PotionEffectType.SLOW_FALLING;

        if (speed) ent.addPotionEffect(new PotionEffect(speed, BUFF_TICKS, SPEED_LEVEL));
        if (jump)  ent.addPotionEffect(new PotionEffect(jump,  BUFF_TICKS, JUMP_LEVEL));
        if (slow)  ent.addPotionEffect(new PotionEffect(slow,  BUFF_TICKS, 0));

        if (cloud) world.spawnParticle(cloud, ent.getLocation(), 15, 0.5, 1, 0.5, 0.05);
    });

    if (sweep) {
        for (let i = 0; i < 4; i++) {
            const loc = player.getLocation().clone().add(
                (Math.random() - 0.5) * RANGE, 2, (Math.random() - 0.5) * RANGE);
            world.spawnParticle(sweep, loc, 4, 1, 1, 1, 0);
        }
    }

    world.playSound(player.getLocation(), "entity.parrot.fly", 1, 1.5);
    world.playSound(player.getLocation(), "block.bamboo.break", 1, 0.8);
}

/* ===== 3. 晨曦和弦 ===== */
function dawnChord(player) {
    const PotionEffect     = Packages.org.bukkit.potion.PotionEffect;
    const PotionEffectType = Packages.org.bukkit.potion.PotionEffectType;
    const world = player.getWorld();
    const Player = Packages.org.bukkit.entity.Player;

    const enchant = getParticle("ENCHANT") || getParticle("ENCHANTMENT_TABLE");
    const sun     = getParticle("END_ROD") || getParticle("CRIT_MAGIC");

    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(ent => {
        if (!(ent instanceof Player)) return;

        const luck = PotionEffectType.getByName("LUCK") || PotionEffectType.LUCK;
        const haste= PotionEffectType.getByName("HASTE") || PotionEffectType.FAST_DIGGING;
        const sat  = PotionEffectType.getByName("SATURATION") || PotionEffectType.SATURATION;

        if (luck)  ent.addPotionEffect(new PotionEffect(luck,  BUFF_TICKS, LUCK_LEVEL));
        if (haste) ent.addPotionEffect(new PotionEffect(haste, BUFF_TICKS, HASTE_LEVEL));
        if (sat)   ent.addPotionEffect(new PotionEffect(sat,   100, 0)); // 5s 饱和

        if (enchant) world.spawnParticle(enchant, ent.getLocation(), 15, 1, 2, 1, 0.2);
    });

    if (sun) {
        for (let i = 0; i < 360; i += 30) {
            const rad = i * Math.PI / 180;
            const x = Math.cos(rad) * RANGE;
            const z = Math.sin(rad) * RANGE;
            world.spawnParticle(sun, player.getLocation().clone().add(x, 1, z), 2, 0, 0, 0, 0.05);
        }
    }

    world.playSound(player.getLocation(), "block.enchantment_table.use", 1, 1.0);
    world.playSound(player.getLocation(), "entity.experience_orb.pickup", 1, 1.5);
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