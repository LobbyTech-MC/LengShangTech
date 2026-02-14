const DISPLAY_NAME = '§a卸甲令';

/* ===== 将所有护甲移到背包 ===== */
function onUse(evt) {
    const player = evt.getPlayer();
    const inventory = player.getInventory();
    
    // 获取玩家当前装备
    const equipment = player.getEquipment();
    let movedToInventory = 0;  // 成功放入背包的数量
    let droppedToGround = 0;   // 掉落到地上的数量
    
    // 定义护甲槽位顺序：头盔、胸甲、护腿、靴子
    const armorSlots = [
        org.bukkit.inventory.EquipmentSlot.HEAD,
        org.bukkit.inventory.EquipmentSlot.CHEST,
        org.bukkit.inventory.EquipmentSlot.LEGS,
        org.bukkit.inventory.EquipmentSlot.FEET
    ];
    
    // 遍历所有护甲槽位
    for (let i = 0; i < armorSlots.length; i++) {
        const slot = armorSlots[i];
        const armorItem = equipment.getItem(slot);
        
        // 如果该槽位有装备
        if (armorItem && armorItem.getType() !== org.bukkit.Material.AIR) {
            // 尝试添加到背包
            const leftover = inventory.addItem(armorItem);
            let hasLeftover = false;
            
            // 如果背包满了， leftover 会有剩余物品
            if (leftover && leftover.size() > 0) {
                hasLeftover = true;
                // 背包满了，把剩余物品掉落在玩家位置
                const world = player.getWorld();
                const location = player.getLocation();
                const keys = leftover.keySet().toArray();
                for (let j = 0; j < keys.length; j++) {
                    const item = leftover.get(keys[j]);
                    if (item && item.getType() !== org.bukkit.Material.AIR) {
                        world.dropItemNaturally(location, item);
                    }
                }
            }
            
            // 清空装备槽
            equipment.setItem(slot, null);
            
            // 统计去向
            if (hasLeftover) {
                droppedToGround++;
            } else {
                movedToInventory++;
            }
        }
    }
    
    // 反馈信息
    const total = movedToInventory + droppedToGround;
    if (total === 0) {
        player.sendMessage('§7你没有穿戴任何护甲');
        return;
    }
    
    // 构建提示消息
    let message = '';
    if (movedToInventory > 0) {
        message += `§a已将 ${movedToInventory} 件护甲移至背包`;
    }
    if (droppedToGround > 0) {
        if (message.length > 0) message += '\n';
        message += `§c背包已满，${droppedToGround} 件护甲掉落在地上！`;
    }
    player.sendMessage(message);
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