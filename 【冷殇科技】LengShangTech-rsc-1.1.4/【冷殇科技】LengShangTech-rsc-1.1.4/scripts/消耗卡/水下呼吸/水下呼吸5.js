function onUse(event) {
  let player = event.getPlayer();
  let allowedPlayerNames = ["lengshang", "xiu", "HeartMxe", "47_Forever",
                            "MuYan", "JodgDoemr", "jiangdonganxia", "Cang_Yan"];
  let playerName = player.getName().toLowerCase();
  let isAllowed = false;

  for (let i = 0; i < allowedPlayerNames.length; i++) {
    if (playerName === allowedPlayerNames[i].toLowerCase()) {
      isAllowed = true;
      break;
    }
  }
  if (!isAllowed) return;

  let world = player.getWorld();
  let eyeLocation = player.getEyeLocation();
  let direction = eyeLocation.getDirection();
  let startLocation = eyeLocation.add(0, -0.7, 0).add(direction);
  let maxDistance = 100;
  let rayTraceResults = world.rayTrace(startLocation, direction, maxDistance,
      org.bukkit.FluidCollisionMode.ALWAYS, true, 0, null);

  if (rayTraceResults === null) return;

  let entity = rayTraceResults.getHitEntity();
  if (!(entity instanceof org.bukkit.entity.Item)) return;

  let item = entity.getItemStack();
  let copyAmount = item.getType().getMaxStackSize() === 1 ? 2 : 32;
  let drop = item.clone();
  drop.setAmount(copyAmount);
  world.dropItemNaturally(entity.getLocation(), drop);
}