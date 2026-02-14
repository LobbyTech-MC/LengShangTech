function onUse(event) { 
    var player = event.getPlayer();
    var inv = player.getInventory();
    var itemInMainHand = inv.getItemInMainHand();
    var offHandItem = inv.getItemInOffHand();
    
    // 副手不能有 Slimefun 物品
    if (offHandItem != null && SlimefunItem.getByItem(offHandItem) != null) {
        player.sendMessage("您必须使用主手使用且副手不能有粘液物品！");
        return;
    }

    // 主手必须有物品
    if (itemInMainHand != null && itemInMainHand.getAmount() > 0) {
        // 消耗 1 个
        itemInMainHand.setAmount(itemInMainHand.getAmount() - 1);

        // 由控制台执行，绕过权限
        var console = player.getServer().getConsoleSender();
        player.getServer().dispatchCommand(console, "sf research " + player.getName() + " all");

        player.sendMessage("成功使用！已为您解锁全部 Slimefun 研究。");

        // 播放吃食音效
        var soundName = "entity.strider.eat";
        player.getLocation().getWorld().playSound(player.getLocation(), soundName, 1.0, 1.0);
    }
}