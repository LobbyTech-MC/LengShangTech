// 全息文字清除器（二次确认版）- 最终修正
function onUse(event) {
    /* ---------- 0. 拿到插件实例（唯一改动） ---------- */
    var pluginClass = Java.type("org.lins.mmmjjkx.rykenslimefuncustomizer.RykenSlimefunCustomizer");
    var plugin = pluginClass.getPlugin(pluginClass);

    var p   = event.getPlayer();
    var loc = p.getLocation();

    /* ---------- 1. 找最近的全息盔甲架 ---------- */
    var entities = loc.getNearbyEntities(3, 3, 3);
    var nearestHologram = null;
    var nearestDistance = 999;

    for (var i = 0; i < entities.size(); i++) {
        var e = entities.get(i);
        if (e.getType().name() === "ARMOR_STAND") {
            var as = e;
            if (as.isInvisible() && !as.hasGravity() && as.isMarker()) {
                var distance = loc.distance(as.getLocation());
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestHologram = as;
                }
            }
        }
    }

    if (!nearestHologram) {
        p.sendMessage("§b3 格范围内未找到全息文字！");
        p.playSound(loc, "block.note_block.bass", 1, 0.5);
        p.removeMetadata("hologramToRemove", plugin);
        return;
    }

    /* ---------- 2. 是否已有待确认标记 ---------- */
    var meta = p.getMetadata("hologramToRemove");
    var pending = meta && meta.length > 0 ? meta[0].value() : null;

    if (pending && pending.equals(nearestHologram)) {
        /* ---------- 3. 二次右键 -> 正式删除 ---------- */
        nearestHologram.remove();
        p.sendMessage("§6成功清除全息文字！");
        p.playSound(loc, "entity.experience_orb.pickup", 1, 1.5);
        p.removeMetadata("hologramToRemove", plugin);
    } else {
        /* ---------- 4. 第一次右键 -> 仅标记 ---------- */
        p.setMetadata("hologramToRemove",
                new org.bukkit.metadata.FixedMetadataValue(plugin, nearestHologram));
        p.sendMessage("§a在§7(距离: " +
                Math.round(nearestDistance * 10) / 10 + " 格)§a处发现全息文字,再次右键确认清除！");
        p.playSound(loc, "block.note_block.pling", 1, 1);
    }
}