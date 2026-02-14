const GiftArray = Array.from({ length: 49 }, function (_, index) {
    return "LENGSHANG_TMMH_" + (index + 1);
});
//这里定义49个天命盲盒物品
// 1. 定义 ID + 权重（共 49 条）
const GiftWeights = [
    /* 普通 1-12   权重 3.75 * 12 = 45 */
    { id: "LENGSHANG_TMMH_1",  weight: 3.75 },
    { id: "LENGSHANG_TMMH_2",  weight: 3.75 },
    { id: "LENGSHANG_TMMH_3",  weight: 3.75 },
    { id: "LENGSHANG_TMMH_4",  weight: 3.75 },
    { id: "LENGSHANG_TMMH_5",  weight: 3.75 },
    { id: "LENGSHANG_TMMH_6",  weight: 3.75 },
    { id: "LENGSHANG_TMMH_7",  weight: 3.75 },
    { id: "LENGSHANG_TMMH_8",  weight: 3.75 },
    { id: "LENGSHANG_TMMH_9",  weight: 3.75 },
    { id: "LENGSHANG_TMMH_10", weight: 3.75 },
    { id: "LENGSHANG_TMMH_11", weight: 3.75 },
    { id: "LENGSHANG_TMMH_12", weight: 3.75 },

    /* 良好 13-24  权重 2.3333 * 12 = 28 */
    { id: "LENGSHANG_TMMH_13", weight: 2.3333 },
    { id: "LENGSHANG_TMMH_14", weight: 2.3333 },
    { id: "LENGSHANG_TMMH_15", weight: 2.3333 },
    { id: "LENGSHANG_TMMH_16", weight: 2.3333 },
    { id: "LENGSHANG_TMMH_17", weight: 2.3333 },
    { id: "LENGSHANG_TMMH_18", weight: 2.3333 },
    { id: "LENGSHANG_TMMH_19", weight: 2.3333 },
    { id: "LENGSHANG_TMMH_20", weight: 2.3333 },
    { id: "LENGSHANG_TMMH_21", weight: 2.3333 },
    { id: "LENGSHANG_TMMH_22", weight: 2.3333 },
    { id: "LENGSHANG_TMMH_23", weight: 2.3333 },
    { id: "LENGSHANG_TMMH_24", weight: 2.3333 },

    /* 史诗 25-36  权重 1.25 * 12 = 15 */
    { id: "LENGSHANG_TMMH_25", weight: 1.25 },
    { id: "LENGSHANG_TMMH_26", weight: 1.25 },
    { id: "LENGSHANG_TMMH_27", weight: 1.25 },
    { id: "LENGSHANG_TMMH_28", weight: 1.25 },
    { id: "LENGSHANG_TMMH_29", weight: 1.25 },
    { id: "LENGSHANG_TMMH_30", weight: 1.25 },
    { id: "LENGSHANG_TMMH_31", weight: 1.25 },
    { id: "LENGSHANG_TMMH_32", weight: 1.25 },
    { id: "LENGSHANG_TMMH_33", weight: 1.25 },
    { id: "LENGSHANG_TMMH_34", weight: 1.25 },
    { id: "LENGSHANG_TMMH_35", weight: 1.25 },
    { id: "LENGSHANG_TMMH_36", weight: 1.25 },

    /* 传奇 37-44  权重 1.25 * 8 = 10 */
    { id: "LENGSHANG_TMMH_37", weight: 1.25 },
    { id: "LENGSHANG_TMMH_38", weight: 1.25 },
    { id: "LENGSHANG_TMMH_39", weight: 1.25 },
    { id: "LENGSHANG_TMMH_40", weight: 1.25 },
    { id: "LENGSHANG_TMMH_41", weight: 1.25 },
    { id: "LENGSHANG_TMMH_42", weight: 1.25 },
    { id: "LENGSHANG_TMMH_43", weight: 1.25 },
    { id: "LENGSHANG_TMMH_44", weight: 1.25 },

    /* 传说 45-49  权重 0.4 * 5 = 2 */
    { id: "LENGSHANG_TMMH_45", weight: 0.4 },
    { id: "LENGSHANG_TMMH_46", weight: 0.4 },
    { id: "LENGSHANG_TMMH_47", weight: 0.4 },
    { id: "LENGSHANG_TMMH_48", weight: 0.4 },
    { id: "LENGSHANG_TMMH_49", weight: 0.4 }
];

// 2. 加权随机选取函数
function getWeightedRandomItem() {
    const totalWeight = GiftWeights.reduce((sum, g) => sum + g.weight, 0);
    let r = Math.random() * totalWeight;
    for (const g of GiftWeights) {
        if (r < g.weight) return g.id;
        r -= g.weight;
    }
    return GiftWeights[GiftWeights.length - 1].id; // 兜底
}


function onUse(event) {
    const player = event.getPlayer();
    //检查主手是否持有物品
    if (event.getHand() !== org.bukkit.inventory.EquipmentSlot.HAND) {
        sendMessage(player, "§b主手请持物品");
        return;
    }

    const invs = player.getInventory();

    const itemInMainHand = invs.getItemInMainHand();
    // 加权随机
    const selectedId = getWeightedRandomItem();
    const sfItem       = getSfItemById(selectedId);
    const itemStack = sfItem.getItem().clone();

    /* ===== 品质判断 ===== */
    const idNum = parseInt(selectedId.split("_").pop()); // 取出数字
    let qualityColor, qualityName;
    if (idNum <= 12)      { qualityColor = "§a"; qualityName = "普通品质"; }
    else if (idNum <= 24) { qualityColor = "§b"; qualityName = "良好品质"; }
    else if (idNum <= 36) { qualityColor = "§d"; qualityName = "史诗品质"; }
    else if (idNum <= 44) { qualityColor = "§6"; qualityName = "传奇品质"; }
    else                  { qualityColor = "§e"; qualityName = "传说品质"; }

    /* ===== 掉落 ===== */
    if (invs.firstEmpty() === -1) {
        player.getWorld().dropItemNaturally(player.getLocation(), itemStack);
        sendMessage(player, "§6背包已满，" + qualityColor + qualityName + "§6物品已掉落在地面上");
    } else {
        invs.addItem(itemStack);
        sendMessage(player, "§b成功打开§6天§c命§d盲§5盒 §9获得 " + qualityColor + qualityName + " §f" + itemStack.getItemMeta().getDisplayName());
    }
    // 减少主手物品的数量
    decrementItemAmount(itemInMainHand);

}


//减少物品
function decrementItemAmount(item) {
    if (item && item.getAmount() > 1) {
      item.setAmount(item.getAmount() - 1);
    } else if (item) {
      item.setAmount(0);
    }
  }
  
