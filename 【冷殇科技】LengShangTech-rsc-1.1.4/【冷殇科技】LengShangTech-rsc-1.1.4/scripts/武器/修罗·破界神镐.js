const DISPLAY_NAME = '§c§l修罗·破界神镐';

const CHARGE_DURATION = 60;     // 3秒引导 (20ticks/秒)
const DETECTION_RADIUS = 25;    // 固定探测半径25格
const HIGHLIGHT_DURATION = 200; // 10秒高亮
const COOLDOWN_MS = 20000;      // 20秒冷却

const cdMap = new Map();
const activeMap = new Map();    // 正在引导的玩家

/* ===== 矿物配置 ===== */
const TARGET_MATERIALS = [
    'DIAMOND_ORE', 'DEEPSLATE_DIAMOND_ORE',
    'IRON_ORE', 'DEEPSLATE_IRON_ORE',
    'GOLD_ORE', 'DEEPSLATE_GOLD_ORE', 'NETHER_GOLD_ORE',
    'ANCIENT_DEBRIS',
    'EMERALD_ORE', 'DEEPSLATE_EMERALD_ORE',
    'REDSTONE_ORE', 'DEEPSLATE_REDSTONE_ORE',
    'LAPIS_ORE', 'DEEPSLATE_LAPIS_ORE',
    'COAL_ORE', 'DEEPSLATE_COAL_ORE',
    'COPPER_ORE', 'DEEPSLATE_COPPER_ORE',
    'NETHER_QUARTZ_ORE'
];

const MATERIAL_COLORS = {
    'DIAMOND_ORE': '§b', 'DEEPSLATE_DIAMOND_ORE': '§b',
    'IRON_ORE': '§f', 'DEEPSLATE_IRON_ORE': '§f',
    'GOLD_ORE': '§e', 'DEEPSLATE_GOLD_ORE': '§e', 'NETHER_GOLD_ORE': '§e',
    'ANCIENT_DEBRIS': '§8',
    'EMERALD_ORE': '§a', 'DEEPSLATE_EMERALD_ORE': '§a',
    'REDSTONE_ORE': '§c', 'DEEPSLATE_REDSTONE_ORE': '§c',
    'LAPIS_ORE': '§9', 'DEEPSLATE_LAPIS_ORE': '§9',
    'COAL_ORE': '§8', 'DEEPSLATE_COAL_ORE': '§8',
    'COPPER_ORE': '§6', 'DEEPSLATE_COPPER_ORE': '§6',
    'NETHER_QUARTZ_ORE': '§f'
};

const MATERIAL_NAMES = {
    'DIAMOND_ORE': '钻石', 'DEEPSLATE_DIAMOND_ORE': '深层钻石',
    'IRON_ORE': '铁矿', 'DEEPSLATE_IRON_ORE': '深层铁矿',
    'GOLD_ORE': '金矿', 'DEEPSLATE_GOLD_ORE': '深层金矿', 'NETHER_GOLD_ORE': '下界金矿',
    'ANCIENT_DEBRIS': '远古残骸',
    'EMERALD_ORE': '绿宝石', 'DEEPSLATE_EMERALD_ORE': '深层绿宝石',
    'REDSTONE_ORE': '红石', 'DEEPSLATE_REDSTONE_ORE': '深层红石',
    'LAPIS_ORE': '青金石', 'DEEPSLATE_LAPIS_ORE': '深层青金石',
    'COAL_ORE': '煤矿', 'DEEPSLATE_COAL_ORE': '深层煤矿',
    'COPPER_ORE': '铜矿', 'DEEPSLATE_COPPER_ORE': '深层铜矿',
    'NETHER_QUARTZ_ORE': '下界石英'
};

/* ===== 开始引导 ===== */
function startChanneling(player) {
    const uuid = player.getUniqueId().toString();
    const now = Date.now();
    
    // 检查冷却
    if (cdMap.has(uuid) && now - cdMap.get(uuid) < COOLDOWN_MS) {
        const remain = Math.ceil((COOLDOWN_MS - (now - cdMap.get(uuid))) / 1000);
        player.sendActionBar('§c感知能力冷却中... §7(' + remain + '秒)');
        player.playSound(player.getLocation(), 'block.note_block_bass', 0.5, 0.5);
        return;
    }
    
    // 检查是否已在引导中
    if (activeMap.has(uuid)) return;
    
    activeMap.set(uuid, { ticks: 0, task: null });
    player.sendMessage('§8[矿物感知] §e开始引导... §7请保持3秒');
    
    const task = Java.type('org.bukkit.Bukkit').getScheduler().runTaskTimer(
        Java.type('org.bukkit.plugin.java.JavaPlugin').getProvidingPlugin(Java.type('java.lang.Object').class),
        function() {
            const data = activeMap.get(uuid);
            if (!data || !player.isOnline()) {
                if (data && data.task) data.task.cancel();
                activeMap.delete(uuid);
                return;
            }
            
            data.ticks++;
            const progress = data.ticks / CHARGE_DURATION;
            
            // 强制玩家静止（移动会中断）
            if (data.ticks > 5 && (player.getVelocity().getX() > 0.1 || player.getVelocity().getZ() > 0.1)) {
                cancelChanneling(player, '移动导致引导中断');
                return;
            }
            
            // 音效（心跳加速）
            if (data.ticks % Math.max(3, 10 - Math.floor(data.ticks / 8)) === 0) {
                player.playSound(player.getLocation(), 'block.note_block_basedrum', 0.6, 0.7 + progress * 0.5);
            }
            
            // 进度显示
            const bars = Math.floor(progress * 10);
            const barStr = '§a' + '█'.repeat(bars) + '§7' + '░'.repeat(10 - bars);
            player.sendActionBar('§8[矿物感知] §7引导中 ' + barStr + ' §e' + Math.floor(progress * 100) + '% §8(请勿移动)');
            
            // 粒子效果（从玩家向外扩散的波纹）
            const loc = player.getLocation();
            const world = player.getWorld();
            const ringRadius = progress * 5;
            const particles = 20;
            for (let i = 0; i < particles; i++) {
                const angle = (i / particles) * Math.PI * 2 + data.ticks * 0.1;
                world.spawnParticle(
                    Java.type('org.bukkit.Particle').REDSTONE,
                    loc.getX() + Math.cos(angle) * ringRadius,
                    loc.getY() + 0.5,
                    loc.getZ() + Math.sin(angle) * ringRadius,
                    1, 0, 0, 0, 0,
                    new Java.type('org.bukkit.Color').fromRGB(255, 100 + progress * 155, 50)
                );
            }
            // 头顶聚集能量
            world.spawnParticle(
                Java.type('org.bukkit.Particle').REDSTONE,
                loc.getX(), loc.getY() + 2.5, loc.getZ(),
                3, 0.3, 0.3, 0.3, 0,
                new Java.type('org.bukkit.Color').fromRGB(255, 200, 50)
            );
            
            // 完成引导
            if (data.ticks >= CHARGE_DURATION) {
                finishChanneling(player);
            }
        }, 1, 1
    );
    
    activeMap.get(uuid).task = task;
}

/* ===== 取消引导 ===== */
function cancelChanneling(player, reason) {
    const uuid = player.getUniqueId().toString();
    const data = activeMap.get(uuid);
    if (!data) return;
    
    if (data.task) data.task.cancel();
    activeMap.delete(uuid);
    
    player.sendActionBar('§c' + reason);
    player.playSound(player.getLocation(), 'block.note_block_bass', 0.5, 0.5);
}

/* ===== 完成引导 - 执行扫描 ===== */
function finishChanneling(player) {
    const uuid = player.getUniqueId().toString();
    const data = activeMap.get(uuid);
    if (data && data.task) data.task.cancel();
    activeMap.delete(uuid);
    
    // 设置冷却
    cdMap.set(uuid, Date.now());
    
    const world = player.getWorld();
    const center = player.getLocation();
    const foundOres = new Map();
    const glowingBlocks = [];
    const cx = center.getBlockX(), cy = center.getBlockY(), cz = center.getBlockZ();
    
    // 球形扫描
    for (let x = -DETECTION_RADIUS; x <= DETECTION_RADIUS; x++) {
        for (let y = -DETECTION_RADIUS; y <= DETECTION_RADIUS; y++) {
            for (let z = -DETECTION_RADIUS; z <= DETECTION_RADIUS; z++) {
                if (x*x + y*y + z*z > DETECTION_RADIUS*DETECTION_RADIUS) continue;
                const block = world.getBlockAt(cx + x, cy + y, cz + z);
                const mat = block.getType().name();
                if (TARGET_MATERIALS.includes(mat)) {
                    foundOres.set(mat, (foundOres.get(mat) || 0) + 1);
                    if (isExposed(block)) {
                        glowingBlocks.push({loc: block.getLocation().add(0.5, 0.5, 0.5), mat: mat});
                    }
                }
            }
        }
    }
    
    // 成功音效
    world.playSound(center, 'block.beacon.power_select', 1, 1);
    world.playSound(center, 'entity.elder_guardian.curse', 0.6, 1.5);
    world.playSound(center, 'block.amethyst_block.chime', 1, 1);
    
    const total = Array.from(foundOres.values()).reduce((a, b) => a + b, 0);
    
    if (total === 0) {
        player.sendMessage('§8[矿物感知] §7范围内未探测到任何矿物。');
        player.sendTitle('', '§8未发现矿物', 10, 40, 10);
        return;
    }
    
    // 结果报告
    let msg = '§8[矿物感知] §e' + DETECTION_RADIUS + '§7格范围发现矿物：\n';
    const sorted = Array.from(foundOres.entries()).sort((a, b) => b[1] - a[1]);
    for (const [m, c] of sorted.slice(0, 8)) {
        msg += '  ' + MATERIAL_COLORS[m] + MATERIAL_NAMES[m] + ' §7×' + c + '\n';
    }
    if (sorted.length > 8) msg += '  §7...还有' + (sorted.length - 8) + '种';
    player.sendMessage(msg);
    player.sendTitle('§e矿物感知', '§8发现 ' + total + ' 个矿物', 10, 60, 10);
    
    // 高亮显示
    highlightBlocks(player, glowingBlocks);
}

/* ===== 检查方块是否暴露 ===== */
function isExposed(block) {
    const dirs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    for (const [dx,dy,dz] of dirs) {
        const b = block.getRelative(dx, dy, dz);
        if (b.isEmpty() || !b.getType().isOccluding()) return true;
    }
    return false;
}

/* ===== 高亮矿物 ===== */
function highlightBlocks(player, blocks) {
    if (blocks.length === 0) return;
    
    let idx = 0;
    const task = Java.type('org.bukkit.Bukkit').getScheduler().runTaskTimer(
        Java.type('org.bukkit.plugin.java.JavaPlugin').getProvidingPlugin(Java.type('java.lang.Object').class),
        function() {
            if (!player.isOnline()) { task.cancel(); return; }
            
            for (let i = 0; i < 8 && idx < blocks.length; i++, idx++) {
                const b = blocks[idx];
                createGlowEffect(player, b.loc, getColor(MATERIAL_COLORS[b.mat]));
            }
            if (idx >= blocks.length) task.cancel();
        }, 1, 1
    );
}

/* ===== 创建光柱效果 ===== */
function createGlowEffect(player, loc, color) {
    const world = player.getWorld();
    let t = 0;
    const task = Java.type('org.bukkit.Bukkit').getScheduler().runTaskTimer(
        Java.type('org.bukkit.plugin.java.JavaPlugin').getProvidingPlugin(Java.type('java.lang.Object').class),
        function() {
            if (!player.isOnline() || t++ >= HIGHLIGHT_DURATION) {
                task.cancel();
                return;
            }
            if (player.getLocation().distance(loc) > 60) return;
            
            // 旋转边框
            for (let i = 0; i < 4; i++) {
                const a = t * 0.15 + i * Math.PI / 2;
                world.spawnParticle(
                    Java.type('org.bukkit.Particle').REDSTONE,
                    loc.getX() + Math.cos(a) * 0.55,
                    loc.getY(),
                    loc.getZ() + Math.sin(a) * 0.55,
                    1, 0, 0, 0, 0, color
                );
            }
            // 垂直光束
            if (t % 4 === 0) {
                for (let y = -3; y <= 3; y += 0.4) {
                    world.spawnParticle(
                        Java.type('org.bukkit.Particle').REDSTONE,
                        loc.getX(), loc.getY() + y, loc.getZ(),
                        1, 0.08, 0, 0.08, 0, color
                    );
                }
            }
        }, 1, 1
    );
}

/* ===== 颜色转换 ===== */
function getColor(code) {
    const map = {
        '§0':[0,0,0],'§1':[0,0,170],'§2':[0,170,0],'§3':[0,170,170],
        '§4':[170,0,0],'§5':[170,0,170],'§6':[255,170,0],'§7':[170,170,170],
        '§8':[85,85,85],'§9':[85,85,255],'§a':[85,255,85],'§b':[85,255,255],
        '§c':[255,85,85],'§d':[255,85,255],'§e':[255,255,85],'§f':[255,255,255]
    };
    const rgb = map[code] || [255,255,255];
    return new Java.type('org.bukkit.Color').fromRGB(rgb[0], rgb[1], rgb[2]);
}

/* ===== 事件绑定 ===== */
function onLoad() {
    return {
        // 右键直接开始引导
        PlayerInteractEvent: function(evt) {
            const a = evt.getAction().name();
            if (a !== 'RIGHT_CLICK_AIR' && a !== 'RIGHT_CLICK_BLOCK') return;
            if (evt.getHand() !== org.bukkit.inventory.EquipmentSlot.HAND) return;
            
            const p = evt.getPlayer();
            const item = p.getInventory().getItemInMainHand();
            if (!item || !item.hasItemMeta() || item.getItemMeta().getDisplayName() !== DISPLAY_NAME) return;
            
            startChanneling(p);
            evt.setCancelled(true);
        },
        
        // 玩家移动检测（在引导中移动会取消）
        PlayerMoveEvent: function(evt) {
            const p = evt.getPlayer();
            if (activeMap.has(p.getUniqueId().toString())) {
                const from = evt.getFrom();
                const to = evt.getTo();
                // 只检测水平移动
                if (from.getX() !== to.getX() || from.getZ() !== to.getZ()) {
                    // 速度检测在task里处理，这里只做备用
                }
            }
        },
        
        // 切换物品取消
        PlayerItemHeldEvent: function(evt) {
            const p = evt.getPlayer();
            if (activeMap.has(p.getUniqueId().toString())) {
                cancelChanneling(p, '切换物品导致引导中断');
            }
        },
        
        // 受伤取消
        EntityDamageEvent: function(evt) {
            if (evt.getEntity().getType().name() === 'PLAYER') {
                const p = evt.getEntity();
                if (activeMap.has(p.getUniqueId().toString())) {
                    cancelChanneling(p, '受到伤害导致引导中断');
                }
            }
        },
        
        // 离开清理
        PlayerQuitEvent: function(evt) {
            const uuid = evt.getPlayer().getUniqueId().toString();
            if (activeMap.has(uuid)) {
                activeMap.get(uuid).task.cancel();
                activeMap.delete(uuid);
            }
            cdMap.delete(uuid);
        }
    };
}
onLoad();