const DISPLAY_NAME = '§a消§b耗§9卡 §d- §a瞬间治疗 I';

const SKILL_NAMES = [
    '§a消耗卡 - 瞬间治疗 I'
];

const COOLDOWN_MS = 1000; //时间
const RANGE = 1;           // 技能影响范围（格数）
const HEAL_AMOUNT = 20;     // 治疗量（10颗心）

const cdMap = new Map();
const skillMap = new Map();

/* ===== 技能分发 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const uuid = player.getUniqueId().toString();
    const now = Date.now();

    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        player.sendActionBar('§7冷却中...');
        return;
    }
    cdMap.set(uuid, now);

    const skillIndex = skillMap.has(uuid) ? (skillMap.get(uuid) + 1) % 1 : 0;
    skillMap.set(uuid, skillIndex);

    switch (skillIndex) {
        case 0: skillHeal(player); break;
    }

    player.sendMessage(`§a[${SKILL_NAMES[skillIndex]}] §a已使用！`);
    
    // 添加物品消耗逻辑
    const invs = player.getInventory();
    const itemInMainHand = invs.getItemInMainHand();
    
    if (itemInMainHand.getAmount() > 1) {
        itemInMainHand.setAmount(itemInMainHand.getAmount() - 1);
    } else {
        invs.setItemInMainHand(null); // 如果只剩下一个，则移除物品
    }
}

/* ===== 群体治疗 ===== */
function skillHeal(player) {
    const world = player.getWorld();
    const LivingEntity = Packages.org.bukkit.entity.LivingEntity;

    // 立即治疗范围内的所有生物
    world.getNearbyEntities(player.getLocation(), RANGE, RANGE, RANGE).forEach(function (ent) {
        if (ent instanceof LivingEntity) {
            const maxHealth = ent.getMaxHealth();
            const currentHealth = ent.getHealth();
            const newHealth = Math.min(maxHealth, currentHealth + HEAL_AMOUNT);
            ent.setHealth(newHealth);
        }
    });
    
    // 治疗自己
    const maxHealth = player.getMaxHealth();
    const currentHealth = player.getHealth();
    const newHealth = Math.min(maxHealth, currentHealth + HEAL_AMOUNT);
    player.setHealth(newHealth);
    
    world.playSound(player.getLocation(), 'item.totem.use', 1, 1.2);
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