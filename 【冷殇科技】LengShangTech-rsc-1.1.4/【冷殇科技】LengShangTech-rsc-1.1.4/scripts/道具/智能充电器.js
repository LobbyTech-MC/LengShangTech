function onUse(event, itemStack) {
    var player = event.getPlayer();

    if (event.getHand() !== org.bukkit.inventory.EquipmentSlot.HAND) {
        sendMessage(player, "&d请把智能充电器放在主手");
        return;
    }

    var onUseItem = event.getItem();
    var itemCharge = itemStack.getItemCharge(onUseItem);
    var itemMaxCharge = itemStack.getMaxItemCharge(onUseItem);

    if (itemCharge < itemMaxCharge * 0.01) {
        sendMessage(player, "§d充电宝电量不足§c1%§d，无法进行充电！");
        sendMessage(player, "§d当前电量剩余：§c" + itemCharge + "J§a/" + itemMaxCharge + "J §d。");
        return;
    }

    var inventory = player.getInventory();
    var targetItem = null;
    var targetSlimefunItem = null;

    for (var i = 0; i < inventory.getSize(); i++) {
        var item = inventory.getItem(i);
        if (item === null || item.getType() === org.bukkit.Material.AIR) continue;

        // ✅ 跳过充电宝自身
        if (item.equals(onUseItem)) continue;

        var sfItem = getSfItemByItem(item);
        if (sfItem == null) continue;

        if (typeof sfItem.getMaxItemCharge !== 'function' || typeof sfItem.getItemCharge !== 'function') continue;

        var max = sfItem.getMaxItemCharge(item);
        var now = sfItem.getItemCharge(item);

        if (max > 0 && now < max) {
            targetItem = item;
            targetSlimefunItem = sfItem;
            break;
        }
    }

    if (targetItem === null) {
        sendMessage(player, "§d背包中没有需要充电的物品。");
        return;
    }

    var MAX_Charge = targetSlimefunItem.getMaxItemCharge(targetItem);
    var RemoveCharge = MAX_Charge - targetSlimefunItem.getItemCharge(targetItem);

    itemStack.removeItemCharge(onUseItem, RemoveCharge);
    targetSlimefunItem.setItemCharge(targetItem, MAX_Charge);

    sendMessage(player, "§d物品已经充满电啦~");
    sendMessage(player, "§d本次充电总共消耗§e " + RemoveCharge + "J §d电量~");
}function onUse(event, itemStack) {
    var player = event.getPlayer();

    if (event.getHand() !== org.bukkit.inventory.EquipmentSlot.HAND) {
        sendMessage(player, "&d请把智能充电器放在主手");
        return;
    }

    var onUseItem = event.getItem();
    var itemCharge = itemStack.getItemCharge(onUseItem);
    var itemMaxCharge = itemStack.getMaxItemCharge(onUseItem);

    if (itemCharge < itemMaxCharge * 0.01) {
        sendMessage(player, "§d充电宝电量不足§c1%§d，无法进行充电！");
        sendMessage(player, "§d当前电量剩余：§c" + itemCharge + "J§a/" + itemMaxCharge + "J §b。");
        return;
    }

    var inventory = player.getInventory();
    var targetItem = null;
    var targetSlimefunItem = null;

    for (var i = 0; i < inventory.getSize(); i++) {
        var item = inventory.getItem(i);
        if (item === null || item.getType() === org.bukkit.Material.AIR) continue;

        // ✅ 跳过充电宝自身
        if (item.equals(onUseItem)) continue;

        var sfItem = getSfItemByItem(item);
        if (sfItem == null) continue;

        if (typeof sfItem.getMaxItemCharge !== 'function' || typeof sfItem.getItemCharge !== 'function') continue;

        var max = sfItem.getMaxItemCharge(item);
        var now = sfItem.getItemCharge(item);

        if (max > 0 && now < max) {
            targetItem = item;
            targetSlimefunItem = sfItem;
            break;
        }
    }

    if (targetItem === null) {
        sendMessage(player, "§d背包中没有需要充电的物品。");
        return;
    }

    var MAX_Charge = targetSlimefunItem.getMaxItemCharge(targetItem);
    var RemoveCharge = MAX_Charge - targetSlimefunItem.getItemCharge(targetItem);

    itemStack.removeItemCharge(onUseItem, RemoveCharge);
    targetSlimefunItem.setItemCharge(targetItem, MAX_Charge);

    sendMessage(player, "§d物品已经充满电啦~");
    sendMessage(player, "§d本次充电总共消耗§e " + RemoveCharge + "J §d电量~");
}