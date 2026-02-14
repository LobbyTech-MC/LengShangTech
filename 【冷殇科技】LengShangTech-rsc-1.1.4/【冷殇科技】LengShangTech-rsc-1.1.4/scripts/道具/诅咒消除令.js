const DISPLAY_NAME = '§d§l诅咒消除令';

/* ===== 负面诅咒附魔列表 ===== */
const CURSE_ENCHANTMENTS = [
    'minecraft:binding_curse',   // 绑定诅咒
    'minecraft:vanishing_curse'  // 消失诅咒
];

/* ===== 检查并清除物品上的诅咒附魔 ===== */
function removeCursesFromItem(item) {
    if (!item || item.getType() === org.bukkit.Material.AIR) {
        return { hasCurse: false, removedCount: 0 };
    }
    
    const meta = item.getItemMeta();
    if (!meta || !meta.hasEnchants()) {
        return { hasCurse: false, removedCount: 0 };
    }
    
    let removedCount = 0;
    let hasCurse = false;
    
    // 获取所有附魔
    const enchants = meta.getEnchants();
    const keys = enchants.keySet().toArray();
    
    // 检查每个附魔是否是诅咒
    for (let i = 0; i < keys.length; i++) {
        const enchantment = keys[i];
        const enchantKey = enchantment.getKey().toString();
        
        // 检查是否是诅咒附魔
        if (CURSE_ENCHANTMENTS.indexOf(enchantKey) !== -1) {
            hasCurse = true;
            // 移除该诅咒附魔
            meta.removeEnchant(enchantment);
            removedCount++;
        }
    }
    
    // 如果有移除诅咒，更新物品的 Meta
    if (removedCount > 0) {
        item.setItemMeta(meta);
    }
    
    return { hasCurse: hasCurse, removedCount: removedCount };
}

/* ===== 处理玩家所有物品（装备栏+物品栏） ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const inventory = player.getInventory();
    const equipment = player.getEquipment();
    
    let totalRemoved = 0;      // 总共移除的诅咒数量
    let cursedItemCount = 0;   // 被处理的物品数量
    const processedItems = []; // 记录被处理的物品名称
    
    // ===== 1. 检查装备栏（盔甲） =====
    const armorSlots = [
        org.bukkit.inventory.EquipmentSlot.HEAD,
        org.bukkit.inventory.EquipmentSlot.CHEST,
        org.bukkit.inventory.EquipmentSlot.LEGS,
        org.bukkit.inventory.EquipmentSlot.FEET,
        org.bukkit.inventory.EquipmentSlot.OFF_HAND  // 副手
    ];
    
    for (let i = 0; i < armorSlots.length; i++) {
        const slot = armorSlots[i];
        const item = equipment.getItem(slot);
        
        if (item && item.getType() !== org.bukkit.Material.AIR) {
            const result = removeCursesFromItem(item);
            if (result.hasCurse) {
                cursedItemCount++;
                totalRemoved += result.removedCount;
                processedItems.push(item.getItemMeta().getDisplayName() || item.getType().name());
                // 更新装备槽（因为物品可能被修改）
                equipment.setItem(slot, item);
            }
        }
    }
    
    // 检查主手武器（在物品栏中处理，但装备栏的主手单独检查）
    const mainHandItem = equipment.getItem(org.bukkit.inventory.EquipmentSlot.HAND);
    if (mainHandItem && mainHandItem.getType() !== org.bukkit.Material.AIR) {
        const result = removeCursesFromItem(mainHandItem);
        if (result.hasCurse) {
            cursedItemCount++;
            totalRemoved += result.removedCount;
            processedItems.push(mainHandItem.getItemMeta().getDisplayName() || mainHandItem.getType().name());
            equipment.setItem(org.bukkit.inventory.EquipmentSlot.HAND, mainHandItem);
        }
    }
    
    // ===== 2. 检查物品栏（背包） =====
    const contents = inventory.getContents();
    for (let i = 0; i < contents.length; i++) {
        const item = contents[i];
        if (item && item.getType() !== org.bukkit.Material.AIR) {
            const result = removeCursesFromItem(item);
            if (result.hasCurse) {
                cursedItemCount++;
                totalRemoved += result.removedCount;
                processedItems.push(item.getItemMeta().getDisplayName() || item.getType().name());
                // 更新物品栏对应位置
                inventory.setItem(i, item);
            }
        }
    }
    
    // ===== 反馈信息 =====
    if (totalRemoved === 0) {
        player.sendMessage('§7未发现任何诅咒附魔，你的装备很干净！');
        // 播放失败音效（使用字符串名称）
        try {
            player.playSound(player.getLocation(), 'block.note_block.bass', 1.0, 0.5);
        } catch (e) {
            // 如果音效也报错，忽略
        }
        return;
    }
    
    // 播放成功音效（使用字符串名称）
    try {
        player.playSound(player.getLocation(), 'entity.player.levelup', 1.0, 1.2);
        player.playSound(player.getLocation(), 'block.enchantment_table.use', 0.5, 1.0);
    } catch (e) {
        // 如果音效报错，忽略
    }
    
    // 发送成功消息
    player.sendMessage('');
    player.sendMessage('§d§l✦ §d§l诅咒净化完成 §d§l✦');
    player.sendMessage(`§7检查了装备栏和物品栏的所有物品`);
    player.sendMessage(`§a✓ §f共处理 §e${cursedItemCount} §f件被诅咒的物品`);
    player.sendMessage(`§a✓ §f成功移除 §e${totalRemoved} §f个诅咒附魔`);
    
    // 如果处理的物品不多，显示具体物品名称
    if (processedItems.length <= 5) {
        player.sendMessage('');
        player.sendMessage('§7§o被净化的物品：');
        for (let i = 0; i < processedItems.length; i++) {
            player.sendMessage(`  §8- §f${processedItems[i]}`);
        }
    }
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
onLoad();