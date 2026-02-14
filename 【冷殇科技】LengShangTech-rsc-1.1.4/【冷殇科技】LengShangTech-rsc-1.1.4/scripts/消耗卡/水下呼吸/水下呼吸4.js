function onUse(event) { 
    var player = event.getPlayer();
    var inv = player.getInventory();
    var itemInMainHand = inv.getItemInMainHand();
    var offHandItem = inv.getItemInOffHand();
    
    if (offHandItem != null && SlimefunItem.getByItem(offHandItem) != null) {
        player.sendMessage("您必须使用主手使用且副手不能有粘液物品！");
        return;
    }

    if (itemInMainHand != null && itemInMainHand.getAmount() > 0) {
        itemInMainHand.setAmount(itemInMainHand.getAmount() - 1);

        var console = player.getServer().getConsoleSender();
        player.getServer().dispatchCommand(console, "sf research " + player.getName() + " all");

        player.sendMessage("成功使用！已为您解锁全部 Slimefun 研究。");

        var soundName = "entity.strider.eat";
        player.getLocation().getWorld().playSound(player.getLocation(), soundName, 1.0, 1.0);
    }
}