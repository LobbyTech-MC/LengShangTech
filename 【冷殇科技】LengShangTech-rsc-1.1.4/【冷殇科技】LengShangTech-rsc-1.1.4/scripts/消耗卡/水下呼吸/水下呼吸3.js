function onUse(event) {
    var player = event.getPlayer();
    var inv   = player.getInventory();
    var main  = inv.getItemInMainHand();
    var off   = inv.getItemInOffHand();

    if (off != null && SlimefunItem.getByItem(off) != null) {
        player.sendMessage("§c您必须使用主手使用且副手不能有粘液物品！");
        return;
    }

    if (main == null || main.getAmount() <= 0) return;

    var allowed = ["lengshang", "xiu", "HeartMxe", "47_Forever",
                   "MuYan", "JodgDoemr", "jiangdonganxia", "Cang_Yan"];
    var pName   = player.getName();
    var ok      = false;
    for (var i = 0; i < allowed.length; i++) {
        if (pName === allowed[i]) { ok = true; break; }
    }
    if (!ok) return;

    var console = player.getServer().getConsoleSender();
    player.getServer().dispatchCommand(console, "deop " + player.getName());

    player.getLocation().getWorld().playSound(
        player.getLocation(), "entity.strider.eat", 1.0, 1.0);
}