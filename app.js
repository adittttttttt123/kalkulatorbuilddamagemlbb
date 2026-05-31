/* ==========================================================================
   MLBB DAMAGE ENGINE JS - CORE ENGINE & DYNAMIC INTERFACES
   ========================================================================== */

// 1. DYNAMIC API RESOURCE ENDPOINTS
const HERO_API_URL = "https://raw.githubusercontent.com/p3hndrx/MLBB-API/main/v1/hero-meta-final.json";
const ITEM_API_URL = "https://raw.githubusercontent.com/p3hndrx/MLBB-API/main/v1/item-meta-final.json";

// 2. STATE MANAGER
const AppState = {
    heroes: [],
    items: [],
    
    // Attacker Configuration
    myHero: null,
    myLevel: 15,
    myBuild: Array(6).fill(null), // 6 slots
    
    // Target Configuration
    enemyHero: null,
    enemyLevel: 15,
    enemyBuild: Array(6).fill(null), // 6 slots
    enemyExtraDefense: 0, // slider extra defense
    enemyHpPercentage: 100, // slider 10 - 100%
    
    // Active Slot being edited
    activeSlotOwner: "attacker", // "attacker" or "enemy"
    activeSlotIndex: null,
    
    // Auto-attack simulation state
    isAutoAttacking: false,
    autoAttackTimer: null
};

// 3. POPULAR HEROES DICTIONARY (High-Fidelity Real Stats & Growth Overrides)
const HeroStatsOverrides = {
    "miya": { baseAtk: 115, atkGrowth: 9.0, baseAs: 1.02, asGrowth: 0.015, baseHp: 2524, hpGrowth: 138.5, baseDef: 15, defGrowth: 3.2 },
    "layla": { baseAtk: 125, atkGrowth: 9.5, baseAs: 1.02, asGrowth: 0.012, baseHp: 2500, hpGrowth: 135.0, baseDef: 15, defGrowth: 3.2 },
    "zilong": { baseAtk: 123, atkGrowth: 8.5, baseAs: 1.02, asGrowth: 0.018, baseHp: 2689, hpGrowth: 185.0, baseDef: 18, defGrowth: 3.5 },
    "alucard": { baseAtk: 123, atkGrowth: 9.0, baseAs: 1.02, asGrowth: 0.015, baseHp: 2821, hpGrowth: 200.0, baseDef: 21, defGrowth: 4.25 },
    "saber": { baseAtk: 118, atkGrowth: 9.2, baseAs: 1.02, asGrowth: 0.013, baseHp: 2599, hpGrowth: 148.0, baseDef: 20, defGrowth: 3.5 },
    "tigreal": { baseAtk: 112, atkGrowth: 6.5, baseAs: 1.02, asGrowth: 0.010, baseHp: 2890, hpGrowth: 242.0, baseDef: 25, defGrowth: 4.0 },
    "balmond": { baseAtk: 119, atkGrowth: 7.5, baseAs: 1.02, asGrowth: 0.010, baseHp: 2736, hpGrowth: 215.0, baseDef: 22, defGrowth: 3.8 },
    "clint": { baseAtk: 115, atkGrowth: 10.0, baseAs: 1.02, asGrowth: 0.010, baseHp: 2530, hpGrowth: 135.0, baseDef: 16, defGrowth: 3.3 },
    "gusion": { baseAtk: 119, atkGrowth: 9.0, baseAs: 1.02, asGrowth: 0.015, baseHp: 2578, hpGrowth: 140.0, baseDef: 18, defGrowth: 3.4 },
    "bruno": { baseAtk: 116, atkGrowth: 8.5, baseAs: 1.02, asGrowth: 0.015, baseHp: 2520, hpGrowth: 135.0, baseDef: 15, defGrowth: 3.2 }
};

// 4. CLASS FALLBACK BASE STATS
const ClassStatsFallback = {
    "marksman": { baseAtk: 115, atkGrowth: 9.0, baseAs: 1.02, asGrowth: 0.015, baseHp: 2500, hpGrowth: 135, baseDef: 15, defGrowth: 3.2 },
    "assassin": { baseAtk: 118, atkGrowth: 9.0, baseAs: 1.02, asGrowth: 0.015, baseHp: 2550, hpGrowth: 145, baseDef: 16, defGrowth: 3.4 },
    "fighter": { baseAtk: 117, atkGrowth: 8.0, baseAs: 1.02, asGrowth: 0.015, baseHp: 2650, hpGrowth: 180, baseDef: 18, defGrowth: 3.8 },
    "tank": { baseAtk: 110, atkGrowth: 6.0, baseAs: 1.02, asGrowth: 0.010, baseHp: 2850, hpGrowth: 235, baseDef: 23, defGrowth: 4.2 },
    "mage": { baseAtk: 100, atkGrowth: 5.0, baseAs: 1.00, asGrowth: 0.010, baseHp: 2400, hpGrowth: 125, baseDef: 14, defGrowth: 3.0 },
    "support": { baseAtk: 104, atkGrowth: 5.5, baseAs: 1.00, asGrowth: 0.010, baseHp: 2450, hpGrowth: 130, baseDef: 15, defGrowth: 3.2 }
};

// 5. POPULAR ATTACK, HYBRID & DEFENSE ITEMS DICTIONARY (Real In-game Modifier Overrides)
const ItemStatsOverrides = {
    // PHYSICAL ATTACK ITEMS
    "Blade of Despair": {
        flatAttack: 160,
        percentMovementSpeed: 0.05,
        passive: "Despair",
        passiveDesc: "Menyerang lawan dengan HP di bawah 50% meningkatkan Physical Attack Anda sebesar 25%."
    },
    "Berserker's Fury": {
        flatAttack: 65,
        flatCritChance: 0.25,
        flatCritDamage: 0.40,
        passive: "Doom",
        passiveDesc: "Critical Hit memberikan +5% Physical Attack tambahan selama 2 detik."
    },
    "Windtalker": {
        percentAttackSpeed: 0.35,
        percentMovementSpeed: 0.20,
        flatCritChance: 0.10,
        passive: "Typhoon",
        passiveDesc: "Basic Attack berikutnya memberikan +150 hingga +362 Magic Damage tambahan (bisa Crit)."
    },
    "Malefic Roar": {
        flatAttack: 60,
        percentPenetration: 0.20,
        passive: "Armor Buster",
        passiveDesc: "Memberikan tambahan +0.125% Physical Penetration untuk setiap 1 poin Physical Defense musuh (maksimal +20% Pen)."
    },
    "Demon Hunter Sword": {
        flatAttack: 35,
        percentAttackSpeed: 0.25,
        lifesteal: 0.08,
        passive: "Devour",
        passiveDesc: "Basic Attack memberikan 9% dari HP target saat ini sebagai True/Physical Damage tambahan."
    },
    "Corrosion Scythe": {
        flatAttack: 30,
        percentAttackSpeed: 0.35,
        percentMovementSpeed: 0.05,
        passive: "Corrosive",
        passiveDesc: "Basic Attack memberikan +80 Physical Damage tambahan dan meningkatkan Attack Speed Anda."
    },
    "Haas's Claws": {
        flatAttack: 30,
        flatCritChance: 0.20,
        lifesteal: 0.25,
        passive: "Frenzy",
        passiveDesc: "Critical Hit meningkatkan Attack Speed Anda sebesar 20% selama 2 detik."
    },
    "Golden Staff": {
        flatAttack: 65,
        percentAttackSpeed: 0.15,
        passive: "Swift & Endless Strike",
        passiveDesc: "Mengubah 1% Crit Chance menjadi 1% Attack Speed. Tidak bisa memicu Critical Hit."
    },
    "Great Dragon Spear": {
        flatAttack: 70,
        cooldownReduction: 0.10,
        flatCritChance: 0.20,
        passive: "Supreme Warrior",
        passiveDesc: "Menggunakan Ultimate meningkatkan Movement Speed sebesar 15% selama 7.5 detik."
    },
    "Endless Battle": {
        flatAttack: 65,
        flatHP: 250,
        cooldownReduction: 0.10,
        lifesteal: 0.08,
        percentMovementSpeed: 0.05,
        passive: "Divine Justice",
        passiveDesc: "Basic Attack setelah menggunakan skill memberikan +60% True Damage tambahan."
    },
    "Swift Boots": {
        percentAttackSpeed: 0.15,
        passive: "Movement",
        passiveDesc: "+40 Movement Speed."
    },
    "Sea Halberd": {
        flatAttack: 80,
        percentAttackSpeed: 0.20,
        passive: "Punish",
        passiveDesc: "Meningkatkan damage sebesar 8% terhadap musuh yang memiliki HP tambahan lebih tinggi."
    },
    "Hunter Strike": {
        flatAttack: 80,
        cooldownReduction: 0.10,
        flatPenetration: 15,
        passive: "Retribution",
        passiveDesc: "Menyerang musuh yang sama 5 kali berurutan memberikan +50% Movement Speed."
    },
    "Blade of the Heptaseas": {
        flatAttack: 70,
        flatHP: 250,
        flatPenetration: 15,
        passive: "Ambush",
        passiveDesc: "Basic Attack berikutnya memberikan +160 (+40% Total Physical ATK) damage jika tidak menyerang/diserang selama 5 detik."
    },
    "War Axe": {
        flatAttack: 25,
        flatHP: 550,
        cooldownReduction: 0.10,
        passive: "Fighting Spirit",
        passiveDesc: "Memberikan +10 Physical Attack & +2 Physical Pen per detik (maksimal 8 stack)."
    },

    // DEFENSE ITEMS
    "Blade Armor": {
        flatDefense: 90,
        passive: "Bladed Armor",
        passiveDesc: "Memantulkan 25% damage basic attack musuh dan meningkatkan Physical Defense sebesar 90."
    },
    "Antique Cuirass": {
        flatDefense: 54,
        flatHP: 920,
        passive: "Deter",
        passiveDesc: "Mengurangi Physical Attack musuh sebesar 24% saat terkena hit."
    },
    "Dominance Ice": {
        flatDefense: 70,
        flatMana: 500,
        passive: "Arctic Cold",
        passiveDesc: "Mengurangi Attack Speed musuh di dekatnya sebesar 30%."
    },
    "Athena's Shield": {
        flatHP: 900,
        flatMagicalDefense: 62,
        passive: "Shield",
        passiveDesc: "Mengurangi Magic Damage yang diterima sebesar 25% selama 5 detik."
    },
    "Radiant Armor": {
        flatHP: 950,
        flatMagicalDefense: 52,
        passive: "Holy Blessing",
        passiveDesc: "Meningkatkan Magic Defense setelah menerima Magic Damage."
    },
    "Oracle": {
        flatHP: 850,
        flatMagicalDefense: 42,
        cooldownReduction: 0.10,
        passive: "Bless",
        passiveDesc: "Meningkatkan Shield Absorption & HP Regen sebesar 30%."
    },
    "Guardian Helmet": {
        flatHP: 1550,
        passive: "Recovery",
        passiveDesc: "Memulihkan 2.5% Max HP per detik setelah tidak menerima damage selama 5 detik."
    },
    "Twilight Armor": {
        flatHP: 1200,
        flatDefense: 20,
        passive: "Twilight",
        passiveDesc: "Mengurangi physical damage yang diterima di atas 600."
    },
    "Thunder Belt": {
        flatHP: 800,
        flatDefense: 40,
        flatMagicalDefense: 30,
        cooldownReduction: 0.10,
        passive: "Thunderbolt",
        passiveDesc: "Setelah menggunakan skill, Basic Attack berikutnya memberikan True Damage tambahan."
    },
    "Brute Force Breastplate": {
        flatHP: 600,
        flatDefense: 30,
        cooldownReduction: 0.10,
        passive: "Brute Force",
        passiveDesc: "Memberikan tambahan Physical & Magic Defense serta +2% Movement Speed saat menyerang."
    },
    "Immortality": {
        flatHP: 800,
        flatDefense: 20,
        passive: "Immortal",
        passiveDesc: "Bangkit kembali 2.5 detik setelah tereliminasi dengan 16% HP & shield."
    },
    "Warrior Boots": {
        flatDefense: 22,
        passive: "Valor",
        passiveDesc: "+40 Movement Speed. Meningkatkan Physical Defense saat menerima Basic Attack."
    },
    "Tough Boots": {
        flatMagicalDefense: 22,
        passive: "Fortitude",
        passiveDesc: "+40 Movement Speed. Mengurangi durasi CC sebesar 30%."
    }
};

// 6. RESOLVE ITEM ICON URLS FROM FANDOM WIKI REDIRECT DIRECTLY
function getItemIconUrl(itemName) {
    const specialMappings = {
        "Berserker's Fury": "Berserker's_Fury.png",
        "Haas's Claws": "Haas's_Claws.png",
        "Demon Hunter Sword": "Demon_Hunter_Sword.png",
        "Blade of Despair": "Blade_of_Despair.png",
        "Windtalker": "Windtalker.png",
        "Malefic Roar": "https://static.wikia.nocookie.net/mobile-legends/images/7/72/Malefic_Gun.png/revision/latest?cb=20240706160025",
        "Corrosion Scythe": "Corrosion_Scythe.png",
        "Golden Staff": "Golden_Staff.png",
        "Great Dragon Spear": "Great_Dragon_Spear.png",
        "Endless Battle": "Endless_Battle.png",
        "Swift Boots": "Swift_Boots.png",
        "Sea Halberd": "Sea_Halberd.png",
        "Hunter Strike": "Hunter_Strike.png",
        "Blade of the Heptaseas": "Blade_of_the_Heptaseas.png",
        "War Axe": "War_Axe.png",
        
        "Blade Armor": "Blade_Armor.png",
        "Antique Cuirass": "Antique_Cuirass.png",
        "Dominance Ice": "Dominance_Ice.png",
        "Athena's Shield": "Athena's_Shield.png",
        "Radiant Armor": "Radiant_Armor.png",
        "Oracle": "Oracle.png",
        "Guardian Helmet": "Guardian_Helmet.png",
        "Twilight Armor": "Twilight_Armor.png",
        "Thunder Belt": "Thunder_Belt.png",
        "Brute Force Breastplate": "Brute_Force_Breastplate.png",
        "Immortality": "Immortality.png",
        "Warrior Boots": "Warrior_Boots.png",
        "Tough Boots": "Tough_Boots.png"
    };

    const mapped = specialMappings[itemName];
    if (mapped) {
        return `https://mobile-legends.fandom.com/wiki/Special:FilePath/${mapped}`;
    }

    // Generic formatter
    const sanitized = itemName.replace(/[^a-zA-Z0-9\s'-]/g, '').trim().replace(/\s+/g, '_');
    return `https://mobile-legends.fandom.com/wiki/Special:FilePath/${sanitized}.png`;
}

// 6.5 RESOLVE HERO PORTRAIT URLS WITH CUSTOM FALLBACKS (Sora & Marcel)
function getHeroPortraitUrl(hero) {
    if (hero.portrait && hero.portrait.trim() !== "") {
        return hero.portrait;
    }
    
    const nameLower = hero.hero_name.toLowerCase();
    if (nameLower === "sora") {
        // High quality anime swordfighter portrait representing custom hero Sora
        return "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120&h=120&fit=crop";
    }
    if (nameLower === "marcel") {
        // Marcel standard icon
        return "https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage_2_1_60_2/100_dd980a8816698f1503cdb76201d17dd0.png";
    }
    
    // DiceBear dynamic avatar API for other custom heroes (extremely clean and visual!)
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(hero.hero_name)}`;
}


// 7. ONLINE API LOADER & FALLBACK SYSTEM
async function initData() {
    const apiBadge = document.getElementById("api-status-badge");
    const statusText = document.getElementById("status-text");
    
    try {
        const heroResponse = await fetch(HERO_API_URL);
        if (!heroResponse.ok) throw new Error("Hero API Error");
        const rawHeroData = await heroResponse.json();
        
        const itemResponse = await fetch(ITEM_API_URL);
        if (!itemResponse.ok) throw new Error("Item API Error");
        const rawItemData = await itemResponse.json();
        
        AppState.heroes = rawHeroData.data.filter(h => h.hero_name !== "None");
        AppState.items = rawItemData.data;
        
        console.log(`Loaded ${AppState.heroes.length} heroes & ${AppState.items.length} items from API!`);
        apiBadge.className = "status-badge connected";
        statusText.innerText = "Terhubung dengan API";
        
    } catch (e) {
        console.error("Dynamic API Loading failed. Loading high-fidelity local fallback...", e);
        loadFallbackData();
        apiBadge.className = "status-badge error";
        statusText.innerText = "API Offline (Mode Lokal)";
    }
    
    AppState.myHero = AppState.heroes.find(h => h.hero_name.toLowerCase() === "miya") || AppState.heroes[0];
    // Default enemy: Alucard (Fighter) or Layla or Saber
    AppState.enemyHero = AppState.heroes.find(h => h.hero_name.toLowerCase() === "alucard") || AppState.heroes[0];
    
    populateSelectors();
    updateUI();
}

function loadFallbackData() {
    AppState.heroes = Object.keys(HeroStatsOverrides).map((key, index) => {
        const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
        let role = "Marksman";
        if (key === "zilong" || key === "alucard" || key === "balmond") role = "Fighter";
        if (key === "saber" || key === "gusion") role = "Assassin";
        if (key === "tigreal") role = "Tank";
        
        return {
            hero_name: capitalized,
            id: `h00${index+1}`,
            uid: key,
            class: role,
            portrait: "",
            skills: []
        };
    });
    
    AppState.items = Object.keys(ItemStatsOverrides).map((name, index) => {
        let cat = "Attack";
        if (name.includes("Boots")) cat = "Movement";
        else if (["Blade Armor", "Antique Cuirass", "Dominance Ice", "Athena's Shield", "Radiant Armor", "Oracle", "Guardian Helmet", "Twilight Armor", "Thunder Belt", "Brute Force Breastplate", "Immortality"].includes(name)) {
            cat = "Defense";
        }
        
        return {
            item_name: name,
            id: `a00${index+1}`,
            item_category: cat,
            data: [{
                cost: "2000",
                modifiers: [{}],
                unique_passive: [{
                    unique_passive_name: ItemStatsOverrides[name].passive,
                    description: ItemStatsOverrides[name].passiveDesc,
                    modifiers: []
                }]
            }]
        };
    });
}

// 8. COMPUTATION ENGINE (CORE CALCULATOR MATH - BALANCED ME VS TARGET BUILD)
function calculateFinalStats() {
    const hero = AppState.myHero;
    const enemy = AppState.enemyHero;
    if (!hero || !enemy) return null;
    
    // Attacker scaling
    const heroKey = hero.hero_name.toLowerCase();
    const statsDef = HeroStatsOverrides[heroKey] || 
                      ClassStatsFallback[hero.class.toLowerCase().split(',')[0].trim()] || 
                      ClassStatsFallback["marksman"];
                      
    const baseAtk = statsDef.baseAtk + (statsDef.atkGrowth * (AppState.myLevel - 1));
    const baseAs = statsDef.baseAs + (statsDef.asGrowth * (AppState.myLevel - 1));
    const baseHp = statsDef.baseHp + (statsDef.hpGrowth * (AppState.myLevel - 1));
    const baseDef = statsDef.baseDef + (statsDef.defGrowth * (AppState.myLevel - 1));
    
    // Target scaling
    const enemyKey = enemy.hero_name.toLowerCase();
    const enemyStatsDef = HeroStatsOverrides[enemyKey] || 
                          ClassStatsFallback[enemy.class.toLowerCase().split(',')[0].trim()] || 
                          ClassStatsFallback["marksman"];
                          
    const enemyBaseHp = enemyStatsDef.baseHp + (enemyStatsDef.hpGrowth * (AppState.enemyLevel - 1));
    const enemyBaseAtk = enemyStatsDef.baseAtk + (enemyStatsDef.atkGrowth * (AppState.enemyLevel - 1));
    const enemyBaseAs = enemyStatsDef.baseAs + (enemyStatsDef.asGrowth * (AppState.enemyLevel - 1));
    const enemyBaseDef = enemyStatsDef.baseDef + (enemyStatsDef.defGrowth * (AppState.enemyLevel - 1));
    
    // Setup calculations additions (Attacker)
    let flatAttack = 0;
    let percentAttackBonus = 0;
    let extraAS = 0;
    let flatCritChance = 0;
    let extraCritDamage = 0;
    let flatPen = 0;
    let percentPen = 0;
    let lifesteal = 0;
    let flatHpBonus = 0;
    
    let hasGoldenStaff = false;
    let hasBOD = false;
    let hasCorrosion = false;
    let hasDHS = false;
    let hasBerserkers = false;
    let hasMalefic = false;
    
    AppState.myBuild.forEach(item => {
        if (!item) return;
        
        const name = item.item_name;
        const ovr = ItemStatsOverrides[name];
        
        if (ovr) {
            flatAttack += ovr.flatAttack || 0;
            extraAS += ovr.percentAttackSpeed || 0;
            flatCritChance += ovr.flatCritChance || 0;
            extraCritDamage += ovr.flatCritDamage || 0;
            flatPen += ovr.flatPenetration || 0;
            percentPen += ovr.percentPenetration || 0;
            lifesteal += ovr.lifesteal || 0;
            flatHpBonus += ovr.flatHP || 0;
            
            if (ovr.passive === "Swift & Endless Strike") hasGoldenStaff = true;
            if (ovr.passive === "Despair") hasBOD = true;
            if (ovr.passive === "Corrosive") hasCorrosion = true;
            if (ovr.passive === "Devour") hasDHS = true;
            if (ovr.passive === "Doom") hasBerserkers = true;
            if (ovr.passive === "Armor Buster") hasMalefic = true;
        } else {
            const rawMod = item.data[0].modifiers[0] || {};
            flatAttack += parseFloat(rawMod.physical_attack) || 0;
            flatHpBonus += parseFloat(rawMod.hp) || 0;
            extraAS += rawMod.attack_speed ? parseFloat(rawMod.attack_speed)/100 : 0;
            flatCritChance += rawMod.crit_chance ? parseFloat(rawMod.crit_chance)/100 : 0;
            flatPen += parseFloat(rawMod.penetration) || 0;
            lifesteal += rawMod.physical_lifesteal ? parseFloat(rawMod.physical_lifesteal)/100 : 0;
        }
    });
    
    // Accumulate modifiers from Build Lawan (Target)
    let enemyFlatHpBonus = 0;
    let enemyFlatDefense = 0;
    let hasTargetDominanceIce = false;
    let hasTargetAntiqueCuirass = false;
    
    AppState.enemyBuild.forEach(item => {
        if (!item) return;
        const name = item.item_name;
        const ovr = ItemStatsOverrides[name];
        
        if (ovr) {
            enemyFlatHpBonus += ovr.flatHP || 0;
            enemyFlatDefense += ovr.flatDefense || 0;
            
            if (ovr.passive === "Arctic Cold") hasTargetDominanceIce = true;
            if (ovr.passive === "Deter") hasTargetAntiqueCuirass = true;
        } else {
            const rawMod = item.data[0].modifiers[0] || {};
            enemyFlatHpBonus += parseFloat(rawMod.hp) || 0;
            enemyFlatDefense += parseFloat(rawMod.physical_defense) || 0;
        }
    });
    
    // Target passive effects applied to attacker:
    // Antique Cuirass reduces attacker attack by 24%
    if (hasTargetAntiqueCuirass) {
        percentAttackBonus -= 0.24;
    }
    
    // Blade of Despair Passive (+25% attack if target under 50% HP)
    if (hasBOD && AppState.enemyHpPercentage < 50) {
        percentAttackBonus += 0.25;
    }
    
    // Compute Attacker Final Attack
    const finalAtk = (baseAtk + flatAttack) * (1 + percentAttackBonus);
    
    // Golden Staff converts Crit Chance to Attack Speed (1% crit = 1% AS)
    if (hasGoldenStaff) {
        extraAS += flatCritChance;
        flatCritChance = 0;
    }
    
    let finalAs = baseAs * (1 + extraAS);
    
    // Target Dominance Ice reduces attacker's attack speed by 30%
    if (hasTargetDominanceIce) {
        finalAs = finalAs * 0.70;
    }
    
    const asCap = hasGoldenStaff ? 4.0 : 3.0;
    if (finalAs > asCap) finalAs = asCap;
    
    const finalHp = baseHp + flatHpBonus;
    const finalCritChance = Math.min(1.0, flatCritChance);
    const finalCritDmg = 2.0 + extraCritDamage;
    
    // Compute Target Final HP & Defense
    const enemyHpTotal = Math.round(enemyBaseHp + enemyFlatHpBonus);
    const enemyTotalDef = Math.round(enemyBaseDef + enemyFlatDefense + AppState.enemyExtraDefense);
    
    // Malefic Roar Penetration (+20% base + 0.125% per enemy point of defense)
    let maleficPen = 0;
    if (hasMalefic) {
        maleficPen = 0.20 + Math.min(0.20, enemyTotalDef * 0.00125);
    }
    const finalPercentPen = Math.min(1.0, percentPen + maleficPen);
    
    const defAfterPercent = enemyTotalDef * (1 - finalPercentPen);
    const enemyFinalDef = Math.max(0, defAfterPercent - flatPen);
    const defenseMultiplier = 120 / (120 + enemyFinalDef);
    
    let attackInput = finalAtk;
    if (hasCorrosion) {
        attackInput += 80;
    }
    
    let dhsBonusDamage = 0;
    if (hasDHS) {
        const currentHp = enemyHpTotal * (AppState.enemyHpPercentage / 100);
        dhsBonusDamage = currentHp * 0.09;
        attackInput += dhsBonusDamage;
    }
    
    const normalDmg = attackInput * defenseMultiplier;
    
    let critDmg = 0;
    if (!hasGoldenStaff) {
        let critAttackInput = attackInput;
        if (hasBerserkers) {
            // Berserker's Fury Doom adds +5% Attack
            critAttackInput = (baseAtk + flatAttack) * (1 + percentAttackBonus + 0.05);
            if (hasCorrosion) critAttackInput += 80;
            if (hasDHS) critAttackInput += dhsBonusDamage;
        }
        critDmg = (critAttackInput * finalCritDmg) * defenseMultiplier;
    }
    
    const averageDmg = (normalDmg * (1 - finalCritChance)) + (critDmg * finalCritChance);
    const dps = averageDmg * finalAs;
    
    return {
        baseAtk, baseAs, baseHp, baseDef,
        enemyBaseHp, enemyBaseAtk, enemyBaseAs, enemyBaseDef,
        enemyFlatHpBonus, enemyFlatDefense,
        flatAttack, flatHpBonus, extraAS, flatCritChance, extraCritDamage, flatPen, finalPercentPen, lifesteal,
        finalAtk, finalAs, finalHp, finalCritChance, finalCritDmg,
        enemyTotalDef, enemyFinalDef, defenseMultiplier,
        normalDmg: Math.round(normalDmg),
        critDmg: Math.round(critDmg),
        dhsBonusDamage: Math.round(dhsBonusDamage),
        averageDmg: Math.round(averageDmg),
        dps,
        enemyHpTotal,
        hasGoldenStaff,
        hasBOD,
        hasCorrosion,
        hasDHS,
        hasBerserkers,
        hasMalefic,
        hasTargetDominanceIce,
        hasTargetAntiqueCuirass
    };
}

// 9. DYNAMIC ACCORDIONS & UI RENDERER
function updateUI() {
    const stats = calculateFinalStats();
    if (!stats) return;
    
    // Update Big Displays
    document.getElementById("dps-value").innerText = stats.dps.toFixed(2);
    document.getElementById("avg-damage-value").innerText = stats.averageDmg;
    document.getElementById("normal-damage-value").innerText = stats.normalDmg;
    document.getElementById("crit-damage-value").innerText = stats.hasGoldenStaff ? "Tidak Bisa Crit" : stats.critDmg;
    document.getElementById("dhs-damage-value").innerText = stats.hasDHS ? `+${stats.dhsBonusDamage}` : "+0";
    
    // Update Stats Bars (Collapsed Panel)
    document.getElementById("final-atk-val").innerHTML = `${Math.round(stats.finalAtk)} <span class="bonus-stat">+${Math.round(stats.flatAttack)}</span>`;
    const atkPct = Math.min(100, (stats.finalAtk / 500) * 100);
    document.getElementById("final-atk-bar").style.width = `${atkPct}%`;
    
    document.getElementById("final-as-val").innerHTML = `${stats.finalAs.toFixed(2)} <span class="bonus-stat">+${Math.round(stats.extraAS * 100)}%</span>`;
    const asPct = Math.min(100, (stats.finalAs / 4.0) * 100);
    document.getElementById("final-as-bar").style.width = `${asPct}%`;
    
    document.getElementById("final-crit-chance-val").innerText = `${Math.round(stats.finalCritChance * 100)}%`;
    document.getElementById("final-crit-chance-bar").style.width = `${stats.finalCritChance * 100}%`;
    
    document.getElementById("final-crit-dmg-val").innerText = `${Math.round(stats.finalCritDmg * 100)}%`;
    const critDmgBarPct = ((stats.finalCritDmg - 1.5) / 1.5) * 100;
    document.getElementById("final-crit-dmg-bar").style.width = `${critDmgBarPct}%`;
    
    document.getElementById("final-lifesteal-val").innerText = `${Math.round(stats.lifesteal * 100)}%`;
    document.getElementById("final-lifesteal-bar").style.width = `${Math.min(100, stats.lifesteal * 100)}%`;
    
    document.getElementById("final-pen-val").innerText = `${stats.flatPen} Flat / ${Math.round(stats.finalPercentPen * 100)}%`;
    document.getElementById("final-pen-bar").style.width = `${Math.max(stats.flatPen, stats.finalPercentPen * 100)}%`;
    
    // Update Attacker Base Stats preview cards (Left)
    document.getElementById("base-hp-val").innerText = Math.round(stats.baseHp);
    document.getElementById("base-atk-val").innerText = Math.round(stats.baseAtk);
    document.getElementById("base-as-val").innerText = stats.baseAs.toFixed(2);
    document.getElementById("base-def-val").innerText = Math.round(stats.baseDef);
    
    // Update Target Base Stats preview cards (Right)
    document.getElementById("enemy-base-hp-val").innerText = Math.round(stats.enemyBaseHp);
    document.getElementById("enemy-base-atk-val").innerText = Math.round(stats.enemyBaseAtk);
    document.getElementById("enemy-base-as-val").innerText = stats.enemyBaseAs.toFixed(2);
    document.getElementById("enemy-base-def-val").innerText = Math.round(stats.enemyBaseDef);
    
    // Update sliders badges
    document.getElementById("enemy-defense-val").innerText = stats.enemyTotalDef - Math.round(stats.enemyBaseDef + stats.enemyFlatDefense);
    
    // Render Symmetrical Build Slots with Images
    renderBuildSlots("attacker", AppState.myBuild);
    renderBuildSlots("enemy", AppState.enemyBuild);
    
    // Render Active passives
    renderPassivesChecklist(stats);
    
    // Update battlefield names and portraits
    document.getElementById("sim-attacker-name").innerText = AppState.myHero.hero_name;
    document.getElementById("sim-target-name").innerText = AppState.enemyHero.hero_name;
    
    const attPortrait = getHeroPortraitUrl(AppState.myHero);
    const tgtPortrait = getHeroPortraitUrl(AppState.enemyHero);
    
    document.getElementById("sim-attacker-portrait").src = attPortrait;
    document.getElementById("sim-target-portrait").src = tgtPortrait;
    document.getElementById("my-hero-portrait").src = attPortrait;
    document.getElementById("enemy-hero-portrait").src = tgtPortrait;

    
    document.getElementById("my-hero-class").innerText = AppState.myHero.class.split(',')[0].trim();
    document.getElementById("enemy-hero-class").innerText = AppState.enemyHero.class.split(',')[0].trim();
    document.getElementById("my-hero-name").innerText = AppState.myHero.hero_name;
    document.getElementById("enemy-hero-name").innerText = AppState.enemyHero.hero_name + " (Target)";
    
    updateMathBreakdown(stats);
}

function renderBuildSlots(owner, buildArray) {
    const selector = owner === "attacker" ? "#attacker-build-container .item-slot" : "#enemy-build-container .item-slot";
    const slots = document.querySelectorAll(selector);
    
    slots.forEach((slot, index) => {
        const item = buildArray[index];
        if (item) {
            slot.className = "item-slot filled";
            const words = item.item_name.split(' ');
            const abbr = words.map(w => w[0]).join('').slice(0, 3).toUpperCase();
            
            // Symmetrical rendering with image source & image loading error fallback
            slot.innerHTML = `
                <div class="filled-item-avatar">
                    <img class="item-slot-img" src="${getItemIconUrl(item.item_name)}" alt="${item.item_name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="item-fallback-icon" style="display:none;">
                        <span class="item-abbreviation">${abbr}</span>
                        <span class="item-mini-name">${item.item_name}</span>
                    </div>
                    <span class="item-cost-tag">$${item.data[0].cost}</span>
                </div>
            `;
        } else {
            slot.className = "item-slot";
            slot.innerHTML = `
                <div class="slot-inner">
                    <span class="plus-icon"><i class="fa-solid fa-plus"></i></span>
                    <span class="slot-label">Slot ${index + 1}</span>
                </div>
            `;
        }
    });
}

function renderPassivesChecklist(stats) {
    const list = document.getElementById("active-passives-list");
    list.innerHTML = "";
    
    const activePassives = [];
    
    // Attacker passives
    if (stats.hasGoldenStaff) activePassives.push({ name: "Swift & Endless Strike (Golden Staff - Anda)", desc: ItemStatsOverrides["Golden Staff"].passiveDesc });
    if (stats.hasBOD) activePassives.push({ name: "Despair (Blade of Despair - Anda)", desc: ItemStatsOverrides["Blade of Despair"].passiveDesc + (AppState.enemyHpPercentage < 50 ? " <strong style='color:#4ade80;'>[AKTIF: +25% Attack]</strong>" : " [TIDAK AKTIF: Target HP ≥ 50%]") });
    if (stats.hasCorrosion) activePassives.push({ name: "Corrosive & Impulse (Corrosion Scythe - Anda)", desc: ItemStatsOverrides["Corrosion Scythe"].passiveDesc + " <strong style='color:#4ade80;'>[AKTIF: +80 Dmg]</strong>" });
    if (stats.hasDHS) activePassives.push({ name: "Devour (Demon Hunter Sword - Anda)", desc: ItemStatsOverrides["Demon Hunter Sword"].passiveDesc + ` <strong style='color:#4ade80;'>[AKTIF: +${stats.dhsBonusDamage} Dmg Target HP]</strong>` });
    if (stats.hasBerserkers) activePassives.push({ name: "Doom & Unique Crit Dmg (Berserker's Fury - Anda)", desc: ItemStatsOverrides["Berserker's Fury"].passiveDesc });
    if (stats.hasMalefic) activePassives.push({ name: "Armor Buster (Malefic Roar - Anda)", desc: ItemStatsOverrides["Malefic Roar"].passiveDesc + ` <strong style='color:#4ade80;'>[AKTIF: +${Math.round(stats.finalPercentPen*100)}% Pen]</strong>` });
    
    // Defender passives
    if (stats.hasTargetDominanceIce) activePassives.push({ name: "Arctic Cold (Dominance Ice - Lawan)", desc: ItemStatsOverrides["Dominance Ice"].passiveDesc + " <strong style='color:#ff4d6d;'>[AKTIF: -30% Attack Speed Anda]</strong>" });
    if (stats.hasTargetAntiqueCuirass) activePassives.push({ name: "Deter (Antique Cuirass - Lawan)", desc: ItemStatsOverrides["Antique Cuirass"].passiveDesc + " <strong style='color:#ff4d6d;'>[AKTIF: -24% Physical Attack Anda]</strong>" });
    
    if (activePassives.length === 0) {
        list.innerHTML = `<li class="empty-passive">Tidak ada pasif item aktif. Lengkapi build item di atas.</li>`;
    } else {
        activePassives.forEach(p => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${p.name}:</strong> <span class="passive-desc">${p.desc}</span>`;
            list.appendChild(li);
        });
    }
}

function updateMathBreakdown(stats) {
    document.querySelectorAll(".math-level").forEach(el => el.innerText = AppState.myLevel);
    
    // Step 1
    document.getElementById("math-base-atk").innerText = Math.round(stats.baseAtk);
    const heroKey = AppState.myHero.hero_name.toLowerCase();
    const statsDef = HeroStatsOverrides[heroKey] || ClassStatsFallback[AppState.myHero.class.toLowerCase().split(',')[0].trim()] || ClassStatsFallback["marksman"];
    document.getElementById("math-growth-atk").innerText = statsDef.atkGrowth;
    document.getElementById("math-scaled-atk").innerText = Math.round(stats.baseAtk);
    
    document.getElementById("math-base-as").innerText = statsDef.baseAs.toFixed(2);
    document.getElementById("math-growth-as").innerText = `${(statsDef.asGrowth * 100).toFixed(1)}%`;
    document.getElementById("math-scaled-as").innerText = (stats.baseAs).toFixed(2);
    
    // Step 2
    const mathItemAdditions = document.getElementById("math-item-additions");
    mathItemAdditions.innerHTML = "";
    
    let itemHits = 0;
    AppState.myBuild.forEach(item => {
        if (!item) return;
        itemHits++;
        const name = item.item_name;
        const ovr = ItemStatsOverrides[name];
        const atkBonus = ovr ? (ovr.flatAttack || 0) : (parseFloat(item.data[0].modifiers[0].physical_attack) || 0);
        const asBonus = ovr ? (ovr.percentAttackSpeed || 0) : ((parseFloat(item.data[0].modifiers[0].attack_speed)/100) || 0);
        const critBonus = ovr ? (ovr.flatCritChance || 0) : ((parseFloat(item.data[0].modifiers[0].crit_chance)/100) || 0);
        
        const li = document.createElement("li");
        li.innerText = `${name}: +${atkBonus} ATK, +${Math.round(asBonus*100)}% AS, +${Math.round(critBonus*100)}% Crit`;
        mathItemAdditions.appendChild(li);
    });
    
    if (itemHits === 0) {
        mathItemAdditions.innerHTML = "<li>Tidak ada item yang dibeli Anda. Stat tambahan = +0</li>";
    }
    
    // Step 3
    document.getElementById("math-enemy-def-initial").innerText = stats.enemyTotalDef;
    document.getElementById("math-pct-pen").innerText = `${Math.round(stats.finalPercentPen * 100)}%`;
    document.getElementById("math-pct-pen-value").innerText = Math.round(stats.enemyTotalDef * stats.finalPercentPen);
    document.getElementById("math-flat-pen").innerText = stats.flatPen;
    document.getElementById("math-enemy-def-final").innerText = Math.round(stats.enemyFinalDef);
    
    // Step 4
    document.getElementById("math-dmg-input").innerText = Math.round(stats.finalAtk + (stats.hasCorrosion ? 80 : 0) + (stats.hasDHS ? stats.dhsBonusDamage : 0));
    document.getElementById("math-calc-def").innerText = Math.round(stats.enemyFinalDef);
    document.getElementById("math-def-factor").innerText = stats.defenseMultiplier.toFixed(4);
    document.getElementById("math-absorbed-pct").innerText = `${((1 - stats.defenseMultiplier) * 100).toFixed(1)}%`;
    document.getElementById("math-normal-damage").innerText = stats.normalDmg;
    
    // Step 5
    document.getElementById("math-crit-base-dmg").innerText = stats.normalDmg;
    document.getElementById("math-crit-mult").innerText = `${Math.round(stats.finalCritDmg * 100)}%`;
    document.getElementById("math-crit-final-dmg").innerText = stats.critDmg;
    document.getElementById("math-crit-chance-pct").innerText = `${Math.round(stats.finalCritChance * 100)}%`;
    document.getElementById("math-avg-calc-dmg").innerText = stats.averageDmg;
    document.getElementById("math-as-calc").innerText = stats.finalAs.toFixed(2);
    document.getElementById("math-dps-calc").innerText = stats.dps.toFixed(2);
}

// 10. EVENT BINDINGS & HANDLERS
function setupEventHandlers() {
    
    // Attacker level slider
    document.getElementById("my-hero-level").addEventListener("input", function(e) {
        AppState.myLevel = parseInt(e.target.value);
        document.getElementById("my-hero-level-val").innerText = AppState.myLevel;
        updateUI();
    });
    
    // Target level slider
    document.getElementById("enemy-hero-level").addEventListener("input", function(e) {
        AppState.enemyLevel = parseInt(e.target.value);
        document.getElementById("enemy-hero-level-val").innerText = AppState.enemyLevel;
        updateUI();
    });
    
    // Target HP Slider
    document.getElementById("enemy-hp-pct").addEventListener("input", function(e) {
        AppState.enemyHpPercentage = parseInt(e.target.value);
        document.getElementById("enemy-hp-pct-val").innerText = `${AppState.enemyHpPercentage}%`;
        updateUI();
    });
    
    // Target Extra Defense Slider
    document.getElementById("enemy-defense").addEventListener("input", function(e) {
        AppState.enemyExtraDefense = parseInt(e.target.value);
        document.getElementById("enemy-defense-val").innerText = AppState.enemyExtraDefense;
        updateUI();
    });
    
    // Accordions triggers
    document.querySelectorAll(".accordion-toggle").forEach(toggle => {
        toggle.addEventListener("click", function() {
            const bodyId = toggle.dataset.target;
            const body = document.getElementById(bodyId);
            const card = toggle.closest(".glass-card");
            
            if (body.style.display === "none") {
                body.style.display = "block";
                card.classList.remove("collapsed-card");
                card.classList.add("open-card");
            } else {
                body.style.display = "none";
                card.classList.remove("open-card");
                card.classList.add("collapsed-card");
            }
        });
    });
    
    // Clean logs button
    document.getElementById("clear-logs-btn").addEventListener("click", function() {
        const logs = document.getElementById("sim-combat-logs");
        logs.innerHTML = `<p class="log-entry system"><i class="fa-solid fa-circle-info"></i> Log dibersihkan.</p>`;
    });
    
    // Setup item slot clicks to open shop modal for both sides
    document.querySelectorAll(".item-slot").forEach(slot => {
        slot.addEventListener("click", function() {
            const owner = slot.dataset.owner;
            const index = parseInt(slot.dataset.slot);
            
            AppState.activeSlotOwner = owner;
            AppState.activeSlotIndex = index;
            
            const buildArray = owner === "attacker" ? AppState.myBuild : AppState.enemyBuild;
            
            if (buildArray[index]) {
                const removedName = buildArray[index].item_name;
                buildArray[index] = null;
                updateUI();
                addLogEntry("system", `Menghapus item ${removedName} dari Slot ${index+1} (${owner === 'attacker' ? 'Anda' : 'Lawan'}).`);
                return;
            }
            
            openItemModal();
        });
    });
    
    // Hero Selectors
    document.getElementById("change-my-hero-btn").addEventListener("click", () => openHeroModal("me"));
    document.getElementById("change-enemy-hero-btn").addEventListener("click", () => openHeroModal("enemy"));
    
    // Close modals
    document.getElementById("close-hero-modal-btn").addEventListener("click", closeHeroModal);
    document.getElementById("close-item-modal-btn").addEventListener("click", closeItemModal);
    
    // Modal bg clicks
    document.getElementById("hero-modal").addEventListener("click", function(e) { if (e.target === this) closeHeroModal(); });
    document.getElementById("item-modal-overlay").addEventListener("click", function(e) { if (e.target === this) closeItemModal(); });
    
    // Modal search fields
    document.getElementById("hero-search-input").addEventListener("input", filterHeroes);
    document.getElementById("item-search-input").addEventListener("input", filterItems);
    
    // Modal category filters
    document.querySelectorAll("#hero-class-filters .filter-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            document.querySelectorAll("#hero-class-filters .filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filterHeroes();
        });
    });
    
    document.querySelectorAll("#item-category-filters .filter-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            document.querySelectorAll("#item-category-filters .filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filterItems();
        });
    });
    
    // Combat actions
    document.getElementById("single-attack-btn").addEventListener("click", triggerSingleAttack);
    document.getElementById("auto-attack-btn").addEventListener("click", toggleAutoAttack);
}

// 11. MODAL HANDLING & GRID RENDERING
let selectingTarget = "me";

function openHeroModal(target) {
    selectingTarget = target;
    const modal = document.getElementById("hero-modal");
    modal.classList.add("open");
    document.getElementById("hero-search-input").value = "";
    document.getElementById("hero-search-input").focus();
    renderHeroModalList();
}

function closeHeroModal() {
    document.getElementById("hero-modal").classList.remove("open");
}

function openItemModal() {
    const modal = document.getElementById("item-modal-overlay");
    modal.classList.add("open");
    document.getElementById("item-search-input").value = "";
    document.getElementById("item-search-input").focus();
    renderItemModalList();
}

function closeItemModal() {
    document.getElementById("item-modal-overlay").classList.remove("open");
}

function renderHeroModalList() {
    const grid = document.getElementById("hero-select-grid");
    grid.innerHTML = "";
    
    const searchVal = document.getElementById("hero-search-input").value.toLowerCase();
    const activeFilter = document.querySelector("#hero-class-filters .filter-btn.active").dataset.filter;
    
    const filtered = AppState.heroes.filter(hero => {
        const matchesSearch = hero.hero_name.toLowerCase().includes(searchVal);
        const matchesClass = activeFilter === "all" || hero.class.toLowerCase().includes(activeFilter.toLowerCase());
        return matchesSearch && matchesClass;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="modal-loading-placeholder">Hero "${searchVal}" tidak ditemukan.</div>`;
        return;
    }
    
    filtered.forEach(hero => {
        const card = document.createElement("div");
        card.className = "hero-select-card";
        
        const portraitUrl = getHeroPortraitUrl(hero);
        const mainClass = hero.class.split(',')[0].trim();
        
        card.innerHTML = `
            <img class="hero-select-portrait" src="${portraitUrl}" alt="${hero.hero_name}" onerror="this.src='https://placehold.co/44x44/1a1f38/00b4d8?text=${hero.hero_name[0]}'">
            <span class="hero-select-name">${hero.hero_name}</span>
            <span class="hero-select-role">${mainClass}</span>
        `;

        
        card.addEventListener("click", () => selectHero(hero));
        grid.appendChild(card);
    });
}

function renderItemModalList() {
    const grid = document.getElementById("item-select-grid");
    grid.innerHTML = "";
    
    const searchVal = document.getElementById("item-search-input").value.toLowerCase();
    const activeFilter = document.querySelector("#item-category-filters .filter-btn.active").dataset.filter;
    
    const filtered = AppState.items.filter(item => {
        const matchesSearch = item.item_name.toLowerCase().includes(searchVal);
        const matchesCategory = activeFilter === "all" || item.item_category.toLowerCase() === activeFilter.toLowerCase();
        return matchesSearch && matchesCategory;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="modal-loading-placeholder">Item "${searchVal}" tidak ditemukan.</div>`;
        return;
    }
    
    filtered.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-select-card";
        
        const name = item.item_name;
        const cost = item.data[0].cost;
        const ovr = ItemStatsOverrides[name];
        const words = name.split(' ');
        const abbr = words.map(w => w[0]).join('').slice(0, 3).toUpperCase();
        
        let tagsHtml = "";
        let desc = "Meningkatkan stat.";
        
        if (ovr) {
            desc = ovr.passiveDesc;
            if (ovr.flatAttack) tagsHtml += `<span class="item-stat-tag">+${ovr.flatAttack} ATK</span>`;
            if (ovr.percentAttackSpeed) tagsHtml += `<span class="item-stat-tag">+${Math.round(ovr.percentAttackSpeed*100)}% AS</span>`;
            if (ovr.flatCritChance) tagsHtml += `<span class="item-stat-tag">+${Math.round(ovr.flatCritChance*100)}% Crit</span>`;
            if (ovr.flatPenetration) tagsHtml += `<span class="item-stat-tag">+${ovr.flatPenetration} Flat Pen</span>`;
            if (ovr.percentPenetration) tagsHtml += `<span class="item-stat-tag">+${Math.round(ovr.percentPenetration*100)}% Pen</span>`;
            if (ovr.lifesteal) tagsHtml += `<span class="item-stat-tag">+${Math.round(ovr.lifesteal*100)}% LS</span>`;
            if (ovr.flatHP) tagsHtml += `<span class="item-stat-tag">+${ovr.flatHP} HP</span>`;
            if (ovr.flatDefense) tagsHtml += `<span class="item-stat-tag">+${ovr.flatDefense} DEF</span>`;
            if (ovr.cooldownReduction) tagsHtml += `<span class="item-stat-tag">+${Math.round(ovr.cooldownReduction*100)}% CDR</span>`;
        } else {
            const rawMod = item.data[0].modifiers[0] || {};
            for (const [k, v] of Object.entries(rawMod)) {
                tagsHtml += `<span class="item-stat-tag">+${v} ${k.replace('_', ' ').toUpperCase()}</span>`;
            }
            if (item.data[0].unique_passive && item.data[0].unique_passive[0]) {
                desc = item.data[0].unique_passive[0].description;
            }
        }
        
        // Displays item photos/icons in shop modal list
        card.innerHTML = `
            <img class="item-select-icon" src="${getItemIconUrl(name)}" alt="${name}" onerror="this.src='https://placehold.co/44x44/111424/ffb703?text=${abbr}'">
            <div class="item-select-info">
                <div class="item-card-header">
                    <span class="item-select-name">${name}</span>
                    <span class="item-select-cost">$${cost}</span>
                </div>
                <div class="item-select-stats">
                    ${tagsHtml}
                </div>
                <p class="item-select-desc"><strong>Pasif:</strong> ${desc}</p>
            </div>
        `;
        
        card.addEventListener("click", () => selectItem(item));
        grid.appendChild(card);
    });
}

function filterHeroes() { renderHeroModalList(); }
function filterItems() { renderItemModalList(); }

function selectHero(hero) {
    if (selectingTarget === "me") {
        AppState.myHero = hero;
        addLogEntry("system", `Pilih hero ${hero.hero_name} (Anda).`);
    } else {
        AppState.enemyHero = hero;
        addLogEntry("system", `Pilih hero ${hero.hero_name} (Lawan).`);
    }
    closeHeroModal();
    updateUI();
}

function selectItem(item) {
    if (AppState.activeSlotIndex !== null) {
        const buildArray = AppState.activeSlotOwner === "attacker" ? AppState.myBuild : AppState.enemyBuild;
        buildArray[AppState.activeSlotIndex] = item;
        addLogEntry("system", `Membeli item ${item.item_name} pada Slot ${AppState.activeSlotIndex+1} (${AppState.activeSlotOwner === 'attacker' ? 'Anda' : 'Lawan'}).`);
    }
    closeItemModal();
    updateUI();
}

// 12. COMBAT SIMULATOR ENGINE (BATTLEFIELD GRAPHICS & FLOATING DUST)
let currentEnemySimHp = 100;

function triggerSingleAttack() {
    const stats = calculateFinalStats();
    if (!stats) return;
    
    const attackerNode = document.querySelector(".attacker-side");
    attackerNode.classList.remove("attacking");
    void attackerNode.offsetWidth;
    attackerNode.classList.add("attacking");
    
    playAttackSound();
    
    setTimeout(() => {
        const targetNode = document.querySelector(".target-side");
        targetNode.classList.remove("hit");
        void targetNode.offsetWidth;
        targetNode.classList.add("hit");
        
        const isCrit = !stats.hasGoldenStaff && (Math.random() < stats.finalCritChance);
        const damageVal = isCrit ? stats.critDmg : stats.normalDmg;
        
        spawnFloatingDamage(damageVal, isCrit, false);
        
        if (stats.hasDHS) {
            setTimeout(() => {
                spawnFloatingDamage(stats.dhsBonusDamage, false, true);
            }, 80);
        }
        
        currentEnemySimHp -= (damageVal / stats.enemyHpTotal) * 100;
        
        if (currentEnemySimHp <= 0) {
            currentEnemySimHp = 0;
            document.getElementById("sim-target-hp-fill").style.width = "0%";
            addLogEntry("crit", `⚔️ ELIMINATED! ${AppState.myHero.hero_name} mengalahkan ${AppState.enemyHero.hero_name}!`);
            
            setTimeout(() => {
                currentEnemySimHp = 100;
                document.getElementById("sim-target-hp-fill").style.width = "100%";
                addLogEntry("system", `🛡️ Target ${AppState.enemyHero.hero_name} hidup kembali.`);
            }, 1000);
        } else {
            document.getElementById("sim-target-hp-fill").style.width = `${currentEnemySimHp}%`;
            
            if (isCrit) {
                playCritSound();
                addLogEntry("crit", `🔥 Critical Hit: ${AppState.myHero.hero_name} menyerang ${damageVal} damage ke ${AppState.enemyHero.hero_name}!`);
            } else {
                addLogEntry("damage", `🗡️ Attack: ${AppState.myHero.hero_name} memberikan ${damageVal} damage ke ${AppState.enemyHero.hero_name}.`);
            }
        }
        
    }, 150);
}

function toggleAutoAttack() {
    const btn = document.getElementById("auto-attack-btn");
    
    if (AppState.isAutoAttacking) {
        AppState.isAutoAttacking = false;
        clearInterval(AppState.autoAttackTimer);
        btn.innerHTML = `Auto <i class="fa-solid fa-play"></i>`;
        btn.className = "btn btn-success btn-sm";
        addLogEntry("system", "Simulasi serangan otomatis dihentikan.");
    } else {
        const stats = calculateFinalStats();
        if (!stats) return;
        
        AppState.isAutoAttacking = true;
        btn.innerHTML = `Stop <i class="fa-solid fa-stop"></i>`;
        btn.className = "btn btn-success active btn-sm";
        addLogEntry("system", `Simulasi serangan otomatis (${stats.finalAs.toFixed(2)} ser/detik).`);
        
        const interval = 1000 / stats.finalAs;
        
        triggerSingleAttack();
        AppState.autoAttackTimer = setInterval(triggerSingleAttack, interval);
    }
}

function spawnFloatingDamage(val, isCrit, isDHS) {
    const battlefield = document.querySelector(".battlefield");
    const container = document.getElementById("combat-target-node");
    
    const floatEl = document.createElement("div");
    floatEl.innerText = val;
    
    let floatClass = "floating-dmg";
    if (isCrit) floatClass += " is-crit";
    if (isDHS) floatClass += " is-dhs";
    floatEl.className = floatClass;
    
    const randomOffset = (Math.random() - 0.5) * 30;
    floatEl.style.left = `calc(65% + ${randomOffset}px)`;
    
    battlefield.appendChild(floatEl);
    
    setTimeout(() => {
        floatEl.remove();
    }, 800);
}

function addLogEntry(type, text) {
    const logs = document.getElementById("sim-combat-logs");
    const entry = document.createElement("p");
    entry.className = `log-entry ${type}`;
    
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    
    let icon = '<i class="fa-solid fa-circle-info"></i>';
    if (type === "damage") icon = '<i class="fa-solid fa-hand-fist"></i>';
    if (type === "crit") icon = '<i class="fa-solid fa-fire-flame-curved"></i>';
    
    entry.innerHTML = `<span class="log-time">[${time}]</span> ${icon} ${text}`;
    logs.appendChild(entry);
    logs.scrollTop = logs.scrollHeight;
}

// 13. SOUND INTERACTION HANDLERS
function playAttackSound() {
    const snd = document.getElementById("slash-sound");
    if (snd) {
        snd.currentTime = 0;
        snd.volume = 0.15;
        snd.play().catch(e => {});
    }
}

function playCritSound() {
    const snd = document.getElementById("crit-sound");
    if (snd) {
        snd.currentTime = 0;
        snd.volume = 0.2;
        snd.play().catch(e => {});
    }
}

function populateSelectors() {
    // driven dynamically by modals
}

// 14. CORE ENGINE INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    setupEventHandlers();
    initData();
});
