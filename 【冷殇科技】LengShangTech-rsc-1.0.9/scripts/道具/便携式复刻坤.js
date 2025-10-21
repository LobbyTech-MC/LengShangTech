function onUse(event) {
  let player = event.getPlayer();
  let copyCount = 1;   
  // let inventory = player.getInventory();

  // // 检查玩家是否有粘液科技lengshang
  // let hasCopperDust = false;
  // let copperDustSlot = -1;
  
  // // 遍历背包查找lengshang
  // for (let i = 0; i < inventory.getSize(); i++) {
  //   let item = inventory.getItem(i);
  //   if (item !== null) {
  //     let sfItem = SlimefunItem.getByItem(item);
  //     // 检查是否为粘液科技lengshang
  //     if (sfItem !== null && sfItem.getId() === "LENGSHANG_LENGSHANG") {
  //       hasCopperDust = true;
  //       copperDustSlot = i;
  //       break;
  //     }
  //   }
  // }

  // // 如果没有lengshang，发送消息并返回
  // if (!hasCopperDust) {
  //   player.sendMessage("§c需要背包拥有留名集§dlengshang§c才能使用此物品！");
  //   return;
  // }

  let world = player.getWorld();
  let eyeLocation = player.getEyeLocation();
  let direction = eyeLocation.getDirection();
  let notplayer = eyeLocation.add(0, -0.7, 0).add(direction);
  let maxDistance = 100;
  let rayTraceResults = world.rayTrace(notplayer, direction, maxDistance,
      org.bukkit.FluidCollisionMode.ALWAYS, true, 0, null);

  // 如果没有击中任何实体，返回
  if (rayTraceResults === null) {
    player.sendMessage;
    return;
  }

  let entity = rayTraceResults.getHitEntity();

  if (entity instanceof org.bukkit.entity.Item) {
    let item = entity.getItemStack();
    
    // 检测是否为潜影盒
    let material = item.getType();
    if (material.name().includes("SHULKER_BOX")) {
      player.sendMessage("§c无法复制潜影盒！§e可恶的神人居然想刷物？");
      return;
    }
    // 检测是否为收纳袋(Bundle)
    if (material === org.bukkit.Material.BUNDLE) {
      player.sendMessage("§c无法复制收纳袋！§e可恶的神人，想都别想！");
      return;
    }

    // 检测粘液物品
    let sfItem = SlimefunItem.getByItem(item);
    if (sfItem !== null) {
      let itemId = sfItem.getId(); // 定义itemId变量
      
      // 检测是否为自身（便携式复刻坤）
      if (itemId === "LENGSHANG_便携式复刻坤") {
        player.sendMessage("§c无法复制自身！§e可恶的神人，你想无限套娃？？");
        return;
      }

      // 检测是否为概念奇点
      if (itemId === "LOGITECH_STORAGE_SINGULARITY") {
        player.sendMessage("§c无法复制概念奇点！§e可恶的神人，这都被你想到了？？");
        return;
      }

      // 检测是否为高级量子存储
      if (itemId === "NTW_EXPANSION_ADVANCED_QUANTUM_STORAGE") {
        player.sendMessage("§c无法复制高级量子存储！§e可恶的神人，居然想到了这个？？");
        return;
      }

      // 检测是否为量子存储 (NTW_QUANTUM_STORAGE_0 到 NTW_QUANTUM_STORAGE_10)
      if (itemId.startsWith("NTW_QUANTUM_STORAGE_")) {
        // 提取数字部分
        let storageNumber = itemId.substring("NTW_QUANTUM_STORAGE_".length);
        // 检测是否是0到10的数字
        let num = parseInt(storageNumber);
        if (!isNaN(num) && num >= 0 && num <= 10) {
          player.sendMessage("§c无法复制量子存储！§e可恶的神人，想复制存储刷物？？");
          return;
        }
      }
    }
    
    let newAmount = item.clone();
    newAmount.setAmount(1);
    let location = entity.getLocation();
    
    // // 消耗一个lengshang
    // let copperDustItem = inventory.getItem(copperDustSlot);
    // if (copperDustItem.getAmount() > 1) {
    //   copperDustItem.setAmount(copperDustItem.getAmount() - 1);
    // } else {
    //   inventory.setItem(copperDustSlot, null);
    // }
    
    // 复制物品
    for (let i = 0; i < copyCount; i++) {
      world.dropItemNaturally(location, newAmount);
    }
    
    player.sendMessage("§a成功复制物品！");
  } else {
    player.sendMessag;
  }
}