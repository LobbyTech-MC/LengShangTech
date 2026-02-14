function onWeaponHit(event, player, item) {
    const entity = event.getEntity();
    if (entity instanceof org.bukkit.entity.Player) {
        entity.setHealth(0);

        const invs = player.getInventory();
        const itemInMainHand = invs.getItemInMainHand();

    } 


}
