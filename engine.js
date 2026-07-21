// ==========================================
// MOTOR DO JOGO: EXPLORAÇÃO, COMBATE E REPETIÇÃO
// ==========================================

// DICIONÁRIO DE NATUREZAS (Acessível pelo Content Script)
window.WBM_NATURES = {
    Hardy: { plus: null, minus: null },
    Lonely: { plus: "Attack", minus: "Defense" },
    Brave: { plus: "Attack", minus: "Speed" },
    Adamant: { plus: "Attack", minus: "Sp. Atk" },
    Naughty: { plus: "Attack", minus: "Sp. Def" },
    Bold: { plus: "Defense", minus: "Attack" },
    Docile: { plus: null, minus: null },
    Relaxed: { plus: "Defense", minus: "Speed" },
    Impish: { plus: "Defense", minus: "Sp. Atk" },
    Lax: { plus: "Defense", minus: "Sp. Def" },
    Timid: { plus: "Speed", minus: "Attack" },
    Hasty: { plus: "Speed", minus: "Defense" },
    Serious: { plus: null, minus: null },
    Jolly: { plus: "Speed", minus: "Sp. Atk" },
    Naive: { plus: "Speed", minus: "Sp. Def" },
    Modest: { plus: "Sp. Atk", minus: "Attack" },
    Mild: { plus: "Sp. Atk", minus: "Defense" },
    Quiet: { plus: "Sp. Atk", minus: "Speed" },
    Bashful: { plus: null, minus: null },
    Rash: { plus: "Sp. Atk", minus: "Sp. Def" },
    Calm: { plus: "Sp. Def", minus: "Attack" },
    Gentle: { plus: "Sp. Def", minus: "Defense" },
    Sassy: { plus: "Sp. Def", minus: "Speed" },
    Careful: { plus: "Sp. Def", minus: "Sp. Atk" },
    Quirky: { plus: null, minus: null }
};

window.ExploreEngine = {
    isInitialized: false,
    activeMode: false,
    state: { maxCityOrderCleared: 0, inventoryEggs: [], isRepeatMode: false, isRunning: false },
    isRepeatMode: false,
    speedMultiplier: 1,
    isRunning: false,
    isTransitioningWave: false, 
    eggFoundInRun: false,
    currentCity: null,
    enemiesDefeatedInCity: 0,
    
    playerCombatData: null,
    enemyCombatData: null,

    combatLoopId: null,
    lateralidade: 'destro',

    init: function () {
        if(this.isInitialized) return;
        this.isInitialized = true;
        
        this.injectBattleStyles(); 

        document.addEventListener('keydown', this.handleKeyboardInput.bind(this));

        chrome.storage.local.get(["exploreRunState", "lateralidade", "activeMode"], (result) => {
            if (result.exploreRunState) this.state = result.exploreRunState;
            if (!this.state.inventoryEggs) this.state.inventoryEggs = [];
            this.isRepeatMode = Boolean(this.state.isRepeatMode);
            this.lateralidade = result.lateralidade || 'destro';
            this.activeMode = result.activeMode || false;
            
            this.state.isRunning = false;
            this.saveState();

            if (window.ExploreUI) window.ExploreUI.updateRunButtons();
        });
        
        chrome.storage.onChanged.addListener((changes) => {
            if (changes.lateralidade) {
                this.lateralidade = changes.lateralidade.newValue;
                this.updateFloatingIconsPosition(); 
            }
            if (changes.activeMode) {
                this.activeMode = changes.activeMode.newValue;
            }
        });
    },

    injectBattleStyles: function() {
        if (document.getElementById('wbm-battle-styles')) return;
        const style = document.createElement('style');
        style.id = 'wbm-battle-styles';
        style.innerHTML = `
            .wbm-moves-hud { display: flex; gap: 4px; justify-content: center; pointer-events: auto; }
            .wbm-move-slot { width: 14px; height: 14px; background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.4); border-radius: 3px; position: relative; box-shadow: 0 2px 4px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.1s, border-color 0.1s; }
            .wbm-move-fill { position: absolute; bottom: 0; left: 0; width: 100%; height: 0%; transition: height 0.1s linear; border-radius: 0 0 2px 2px; }
            .wbm-move-slot::after { content: attr(data-move-name); position: absolute; bottom: 150%; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.9); color: white; padding: 4px 6px; border-radius: 4px; font-size: 10px; font-family: Arial, sans-serif; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.15s ease-in; z-index: 100000; box-shadow: 0 2px 4px rgba(0,0,0,0.5); }
            .wbm-move-slot:hover::after { opacity: 1; }
            .wbm-move-slot.wbm-firing { animation: wbmMoveFire 0.3s ease-out; border-color: #FFF; background: white; }
            @keyframes wbmMoveFire { 0% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.5); filter: brightness(2); } 100% { transform: scale(1); filter: brightness(1); } }
            .wbm-dmg-text { position: fixed; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; z-index: 1000000; pointer-events: none; animation: wbmDmgFloat 1s ease-out forwards; text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 2px 0 #000; }
            .wbm-dmg-normal { color: #ffffff; font-size: 16px; }
            .wbm-dmg-super { color: #4CAF50; font-size: 18px; }
            .wbm-dmg-weak { color: #9E9E9E; font-size: 14px; }
            .wbm-dmg-crit { color: #FF9800; font-size: 20px; font-style: italic; }
            .wbm-dmg-immune { color: #607D8B; font-size: 14px; }
            .wbm-dmg-miss { color: #E91E63; font-size: 14px; }
            @keyframes wbmDmgFloat { 0% { opacity: 1; transform: translate(-50%, 0) scale(1); } 100% { opacity: 0; transform: translate(-50%, -40px) scale(1.2); } }
            @keyframes wbmAttackFlash { 0% { filter: brightness(1); } 50% { filter: brightness(2) drop-shadow(0 0 10px white); transform: scale(1.1); } 100% { filter: brightness(1); transform: scale(1); } }
            .wbm-attacking { animation: wbmAttackFlash 0.2s ease-out; }
            .wbm-idle-stance-right img { position: relative; animation: wbmStanceRight 0.35s infinite alternate cubic-bezier(0.25, 0.46, 0.45, 0.94); }
            .wbm-idle-stance-left img { position: relative; animation: wbmStanceLeft 0.35s infinite alternate cubic-bezier(0.25, 0.46, 0.45, 0.94); }
            @keyframes wbmStanceRight { 0% { left: 0px; top: 0px; } 100% { left: 6px; top: -4px; } }
            @keyframes wbmStanceLeft { 0% { left: 0px; top: 0px; } 100% { left: -6px; top: -4px; } }
        `;
        document.head.appendChild(style);
    },

    saveState: function () {
        this.state.isRepeatMode = this.isRepeatMode;
        this.state.isRunning = this.isRunning;
        chrome.storage.local.set({ exploreRunState: this.state });
    },

    toggleRepeatMode: function () {
        this.isRepeatMode = !this.isRepeatMode;
        this.saveState();
        if (window.ExploreUI) {
            window.ExploreUI.updateRunButtons();
            window.ExploreUI.showFloatingText(this.isRepeatMode ? window.t_ui("rep_on") : window.t_ui("rep_off"));
        }
    },

    toggleSpeedMode: function () {
        if (this.speedMultiplier === 1) this.speedMultiplier = 2;
        else if (this.speedMultiplier === 2) this.speedMultiplier = 4;
        else this.speedMultiplier = 1;
        if (window.ExploreUI) {
            window.ExploreUI.updateRunButtons();
            window.ExploreUI.showFloatingText(`${window.t_ui("spd")} ${this.speedMultiplier}X!`);
        }
    },

    cancelRun: function () {
        this.isRunning = false;
        this.isTransitioningWave = false;
        this.saveState();
        
        let petVis = document.getElementById("pet-visual-container");
        if(petVis) petVis.classList.remove('wbm-idle-stance-right', 'wbm-idle-stance-left');

        if (window.BattleManager) window.BattleManager.stop();
        if (this.combatLoopId) cancelAnimationFrame(this.combatLoopId);
        
        document.querySelectorAll("#active-enemy-container").forEach(el => el.remove());
        if (window.ExploreUI) {
            window.ExploreUI.removeElement("player-hp-bar");
            window.ExploreUI.removeElement("player-moves-hud-container");
            window.ExploreUI.removeElement("player-status-board");
            window.ExploreUI.showFloatingText(window.t_ui("fled"));
            window.ExploreUI.updateRunButtons();
        }
    },

    handleKeyboardInput: function(e) {
        if (!this.activeMode || !this.isRunning) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const keyMap = { 'q': 0, 'w': 1, 'e': 2, 'r': 3 };
        const key = e.key.toLowerCase();
        
        if (keyMap[key] !== undefined) {
            const hud = document.getElementById("player-moves-hud");
            if (hud) {
                const slots = hud.querySelectorAll(".wbm-move-slot");
                if (slots && slots[keyMap[key]]) {
                    slots[keyMap[key]].click();
                }
            }
        }
    },
    
    getStatsWithEVs: function(baseStats, evMap, level, natureName) {
        let finalStats = {};
        let nature = window.WBM_NATURES[natureName] || window.WBM_NATURES["Hardy"];

        const calcStat = (base, ev, lvl, isHP, statName) => {
            if (isHP) {
                return Math.floor(((2 * base + 31 + Math.floor((ev||0) / 4)) * lvl) / 100) + lvl + 10;
            } else {
                let val = Math.floor(((2 * base + 31 + Math.floor((ev||0) / 4)) * lvl) / 100) + 5;
                if (nature.plus === statName) val = Math.round(val * 1.1);
                if (nature.minus === statName) val = Math.round(val * 0.9);
                return val;
            }
        };
        
        finalStats.HP = calcStat(baseStats.HP, evMap?.HP, level, true, "HP");
        finalStats.Attack = calcStat(baseStats.Attack, evMap?.Attack, level, false, "Attack");
        finalStats.Defense = calcStat(baseStats.Defense, evMap?.Defense, level, false, "Defense");
        finalStats["Sp. Atk"] = calcStat(baseStats["Sp. Atk"], evMap?.["Sp. Atk"], level, false, "Sp. Atk");
        finalStats["Sp. Def"] = calcStat(baseStats["Sp. Def"], evMap?.["Sp. Def"], level, false, "Sp. Def");
        finalStats.Speed = calcStat(baseStats.Speed, evMap?.Speed, level, false, "Speed");
        return finalStats;
    },
    
    startRun: function (selectedCityOrder) {
        if (this.isRunning || window.gameState.isEgg) return;
        var targetOrder = selectedCityOrder || (this.state.maxCityOrderCleared + 1);
        this.currentCity = window.DatabaseHelper.getCityByOrder(targetOrder);
        if (!this.currentCity) return;

        this.isRunning = true;
        this.isTransitioningWave = false;
        this.saveState(); 

        this.enemiesDefeatedInCity = 0;
        this.eggFoundInRun = false;

        var oldEgg = document.getElementById("floating-egg-icon");
        if (oldEgg) { clearTimeout(oldEgg.despawnTimeout); oldEgg.remove(); }
        var oldBulb = document.getElementById("floating-bulb-icon");
        if (oldBulb) { clearTimeout(oldBulb.despawnTimeout); oldBulb.remove(); }

        if (window.ExploreUI) {
            var menuBox = document.getElementById("explore-menu-box");
            if (menuBox) menuBox.style.display = "none";
            window.ExploreUI.updateRunButtons(); 
        }

        var playerLvl = window.getLevelFromTotalExp(window.gameState.currentXp);
        var currentMonDb = window.monsterDatabase.find(m => m.id === window.gameState.pokemonId);
        if(!currentMonDb) return;
        
        let pokeDBData = window.pokemonDB.find(p => parseInt(p["#"], 10) === currentMonDb.id);
        if(!pokeDBData) pokeDBData = window.pokemonDB[0];

        let evs = window.gameState.evMap ? window.gameState.evMap[window.gameState.pokemonId] : null;
        let nat = window.gameState.natureMap ? window.gameState.natureMap[window.gameState.pokemonId] : "Hardy";
        let stats = this.getStatsWithEVs(pokeDBData, evs, playerLvl, nat);
        let moves = window.gameState.movesMap ? window.gameState.movesMap[window.gameState.pokemonId] : ["Tackle"];

        this.playerCombatData = {
            dbData: pokeDBData,
            stats: stats,
            level: playerLvl,
            equippedMoves: moves,
            hudElementId: "player-moves-hud",
            spriteElementId: "pet-visual-container"
        };

        var walkingContainer = document.getElementById("pet-walking-container");
        if (walkingContainer && window.ExploreUI) {
            let hudWrap = document.getElementById('player-moves-hud-container');
            if (!hudWrap) {
                hudWrap = document.createElement('div');
                hudWrap.id = "player-moves-hud-container";
                walkingContainer.appendChild(hudWrap);
            }
            hudWrap.style.cssText = "position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 100%; display: flex; justify-content: center; z-index: 1000;";
            hudWrap.innerHTML = '<div id="player-moves-hud"></div>';
            
            let existingHp = document.getElementById("player-hp-bar");
            if(existingHp) existingHp.remove();
            walkingContainer.appendChild(window.ExploreUI.createHPBar("player-hp-bar", currentMonDb.name, playerLvl, true));
        }

        this.spawnEnemy();
    },

    spawnEnemy: function () {
        if (!this.isRunning) return;

        if (window.gameState && window.gameState.isEgg) {
           this.runOver(window.t_ui("egg_battle_block"));
            return;
        }

        document.querySelectorAll("#active-enemy-container").forEach(el => el.remove());
        
        var encounter = window.DatabaseHelper.rollEncounter(this.currentCity.id);
        if (!encounter) { this.runOver(window.t_ui("no_enemy")); return; }
        
        let pokeDBData = window.pokemonDB.find(p => parseInt(p["#"], 10) === encounter.pokemonId);
        if(!pokeDBData) pokeDBData = window.pokemonDB[0];

        let stats = this.getStatsWithEVs(pokeDBData, null, encounter.level, "Hardy");
        
        let enemyMoves = [];
        if (pokeDBData.Level_Moves) {
            for (let m in pokeDBData.Level_Moves) {
                if (pokeDBData.Level_Moves[m] <= encounter.level) enemyMoves.push({name: m, lvl: pokeDBData.Level_Moves[m]});
            }
        }
        enemyMoves.sort((a,b) => b.lvl - a.lvl);
        let selectedMoves = enemyMoves.slice(0, 4).map(m => m.name);
        if (selectedMoves.length === 0) selectedMoves = ["Tackle"];

        this.enemyCombatData = {
            dbData: pokeDBData,
            stats: stats,
            level: encounter.level,
            equippedMoves: selectedMoves,
            hudElementId: "enemy-moves-hud",
            spriteElementId: "active-enemy-sprite"
        };
        
        var realName = pokeDBData.Name;
        
        let enemyEl = document.createElement("div");
        enemyEl.id = "active-enemy-container";
        enemyEl.style.cssText = `position: fixed; top: ${window.innerHeight-100}px; width: 80px; height: 80px; z-index: 999998; pointer-events: none; display: flex; flex-direction: column; align-items: center;`;
        
        let enemyX = (this.lateralidade === 'canhoto') ? window.innerWidth + 100 : -100;
        enemyEl.style.left = enemyX + "px";

        let hudWrap = document.createElement('div');
        hudWrap.style.cssText = "position: absolute; top: -55px; left: 50%; transform: translateX(-50%); width: 100%; display: flex; justify-content: center; z-index: 1000;";
        hudWrap.innerHTML = '<div id="enemy-moves-hud"></div>';
        enemyEl.appendChild(hudWrap);

        if (window.ExploreUI) enemyEl.appendChild(window.ExploreUI.createHPBar("enemy-hp-bar", realName, encounter.level, false));
        
        var img = document.createElement("img");
        img.id = "active-enemy-sprite";
        img.className = "enemy-sprite";
        img.src = window.getPokemonImagePath(encounter.pokemonId, realName);
        img.style.cssText = "width:100%; height:100%; object-fit:contain;";
        enemyEl.appendChild(img);
        
        document.body.appendChild(enemyEl);

        let playerImg = document.getElementById("pet-visual-container");
        if(playerImg) playerImg.classList.add("pokemon-sprite");

        this.startCombatLoop(enemyEl, enemyX);
    },

    startCombatLoop: function (enemyElement, startX) {
        if (this.combatLoopId) cancelAnimationFrame(this.combatLoopId);
        var lastFrameTime = 0;
        var enemyX = startX;
        var isEngaged = false;
        
        var loop = (timestamp) => {
            if (window.gameState && window.gameState.isEgg) {
                this.runOver(window.t_ui("egg_battle_block"));
                return; 
            }
            if (!lastFrameTime) lastFrameTime = timestamp;
            var deltaTime = timestamp - lastFrameTime;
            lastFrameTime = timestamp;
            
            if (deltaTime > 100) deltaTime = 16; 

            if (!this.isRunning || !enemyElement) return;
            var pet = document.getElementById("meu-pet-flutuante");
            var petVisual = document.getElementById("pet-visual-container");
            
            if (!pet || !petVisual) { this.combatLoopId = requestAnimationFrame(loop); return; }
            
            var petRect = pet.getBoundingClientRect();
            var petVisRect = petVisual.getBoundingClientRect();
            enemyElement.style.top = (petRect.top) + "px";
            
            var speedPerSec = 90 * this.speedMultiplier;
            var moveStep = speedPerSec * (deltaTime / 1000);
            
            var enemyCenter = enemyX + 40; 
            var petCenter = petVisRect.left + 40; 
            var dist = petCenter - enemyCenter;

            if (typeof window.walkDirection !== 'undefined') window.walkDirection = dist > 0 ? 1 : -1;
            
            var stopDistance = 130; 

            if (Math.abs(dist) > stopDistance) {
                var actualStep = Math.min(moveStep, Math.abs(dist) - stopDistance);
                enemyX += (dist > 0 ? actualStep : -actualStep);
                enemyElement.style.left = enemyX + "px";
                var enemyImg = enemyElement.querySelector("img");
                if (enemyImg) enemyImg.style.transform = dist > 0 ? "scaleX(-1)" : "scaleX(1)";
            } else {
                var enemyImg = enemyElement.querySelector("img");
                if (enemyImg) enemyImg.style.transform = dist > 0 ? "scaleX(-1)" : "scaleX(1)";

                if (!isEngaged) {
                    isEngaged = true;
                    let petStance = dist > 0 ? 'left' : 'right';
                    let enemyStance = dist > 0 ? 'right' : 'left';
                    petVisual.classList.add(`wbm-idle-stance-${petStance}`);
                    enemyElement.classList.add(`wbm-idle-stance-${enemyStance}`);
                    this.startAutoBattler();
                }
            }
            this.combatLoopId = requestAnimationFrame(loop);
        };
        this.combatLoopId = requestAnimationFrame(loop);
    },

    startAutoBattler: function() {
        if (window.BattleManager) {
            window.BattleManager.speedMultiplier = this.speedMultiplier;
            
            window.BattleManager.start(this.playerCombatData, this.enemyCombatData, {
                onPlayerHpChange: (hp, maxHp) => {
                    if (window.ExploreUI) window.ExploreUI.updateHPBar("player-hp-bar", hp, maxHp);
                },
                onEnemyHpChange: (hp, maxHp) => {
                    if (window.ExploreUI) window.ExploreUI.updateHPBar("enemy-hp-bar", hp, maxHp);
                },
                onWin: () => {
                    this.enemyDefeated();
                },
                onLose: () => {
                    this.runOver(window.t_ui("fainted"));
                }
            });
        }
    },

    updateFloatingIconsPosition: function() {
        let walkingContainer = document.getElementById("pet-walking-container");
        let egg = document.getElementById("floating-egg-icon");
        let bulb = document.getElementById("floating-bulb-icon");
        
        let isCanhoto = (this.lateralidade === 'canhoto');
        
        let eggIsIdle = egg && egg.parentNode === walkingContainer;
        let bulbIsIdle = bulb && bulb.parentNode === walkingContainer;
        
        if (eggIsIdle && bulbIsIdle) {
            egg.style.transition = "left 0.3s ease";
            bulb.style.transition = "left 0.3s ease";
            if (isCanhoto) {
                egg.style.left = "calc(50% - 28px)";
                bulb.style.left = "calc(50% + 28px)";
            } else {
                bulb.style.left = "calc(50% - 28px)";
                egg.style.left = "calc(50% + 28px)";
            }
        } else {
            if (eggIsIdle) { egg.style.transition = "left 0.3s ease"; egg.style.left = "50%"; }
            if (bulbIsIdle) { bulb.style.transition = "left 0.3s ease"; bulb.style.left = "50%"; }
        }
    },

    spawnEggIcon: function(eggData) {
        var oldEgg = document.getElementById("floating-egg-icon");
        if (oldEgg) { clearTimeout(oldEgg.despawnTimeout); oldEgg.remove(); }

        var walkingContainer = document.getElementById("pet-walking-container");
        if (!walkingContainer) return;

        var egg = document.createElement("div");
        egg.id = "floating-egg-icon";
        egg.style.cssText = "position: absolute; top: -120px; left: 50%; transform: translateX(-50%); width: 45px; height: 45px; cursor: pointer; z-index: 100005; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));";
        
        var img = document.createElement("img");
        img.src = chrome.runtime.getURL("assets/Icons/Egg.png");
        img.style.cssText = "width: 100%; height: 100%; object-fit: contain; animation: wbmEggFloat 2s ease-in-out infinite;";
        egg.appendChild(img);

        if (!document.getElementById("wbm-egg-anim-style")) {
            let s = document.createElement("style");
            s.id = "wbm-egg-anim-style";
            s.innerHTML = "@keyframes wbmEggFloat { 0% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-10px); } 100% { transform: translateX(-50%) translateY(0); } }";
            document.head.appendChild(s);
        }

        egg.onmouseenter = () => { egg.style.filter = "drop-shadow(0 4px 10px rgba(255,255,255,0.8))"; };
        egg.onmouseleave = () => { egg.style.filter = "drop-shadow(0 4px 6px rgba(0,0,0,0.4))"; };

        egg.despawnTimeout = setTimeout(() => {
            if (egg && egg.parentNode) {
                egg.style.transition = "opacity 1s ease, transform 1s ease";
                egg.style.opacity = "0";
                egg.style.transform = "translateX(-50%) translateY(-40px) scale(0.5)"; 
                setTimeout(() => { 
                    if (egg.parentNode) egg.remove(); 
                    window.ExploreEngine.updateFloatingIconsPosition();
                }, 1000);
            }
        }, 20000);

        egg.onclick = (e) => {
            e.stopPropagation();
            egg.onclick = null; 
            clearTimeout(egg.despawnTimeout);

            let startRect = egg.getBoundingClientRect();
            document.body.appendChild(egg);
            egg.style.position = "fixed";
            egg.style.left = startRect.left + "px";
            egg.style.top = startRect.top + "px";
            egg.style.transform = "none";
            egg.style.animation = "none"; 

            window.ExploreEngine.updateFloatingIconsPosition(); 

            let startX = startRect.left;
            let startY = startRect.top;
            let startTime = performance.now();
            let duration = 1200;

            const getTargetRect = () => {
                let btns = Array.from(document.querySelectorAll('button, .wbm-float-btn'));
                let menuBtn = btns.find(b => {
                    let r = b.getBoundingClientRect();
                    return r.width > 0 && r.width < 100 && (b.innerText.includes('≡') || b.innerHTML.includes('fa-bars') || b.innerHTML.includes('line-horizontal') || (b.id && b.id.includes('menu')) || (b.id && b.id.includes('explore')));
                });
                if (menuBtn) { egg.finalTargetElement = menuBtn; return menuBtn.getBoundingClientRect(); }
                let pet = document.getElementById('meu-pet-flutuante');
                if (pet) { egg.finalTargetElement = pet; return { left: pet.getBoundingClientRect().right + 10, top: pet.getBoundingClientRect().top, width: 50, height: 50 }; }
                return { left: window.innerWidth - 80, top: window.innerHeight / 2, width: 50, height: 50 };
            };
            
            let flyEgg = (time) => {
                let elapsed = time - startTime;
                let t = Math.min(elapsed / duration, 1);
                let easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                
                let destRect = getTargetRect();
                let endX = destRect.left + (destRect.width / 2) - 22; 
                let endY = destRect.top + (destRect.height / 2) - 22;
                
                let currentX = startX + (endX - startX) * easeT;
                let currentY = startY + (endY - startY) * easeT - Math.sin(easeT * Math.PI) * 150; 
                
                let scale = 1 - (easeT * 0.9); 
                let rotation = easeT * 720;    
                
                egg.style.left = currentX + 'px';
                egg.style.top = currentY + 'px';
                egg.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
                egg.style.opacity = 1 - (easeT * 0.5); 
                
                if (t < 1) {
                    requestAnimationFrame(flyEgg);
                } else {
                    egg.remove();
                    window.ExploreEngine.state.inventoryEggs.push(eggData);
                    window.ExploreEngine.saveState();
                    if (window.ExploreUI) {
                        let testString = window.t_ui("cleared") || "";
                        let finalEggMsg = testString.includes("Cleared") || testString.includes("cleared") ? "+1 Egg!" : "+1 Ovo!";
                        window.ExploreUI.showFloatingText(finalEggMsg);

                        if (egg.finalTargetElement && egg.finalTargetElement.animate) {
                            egg.finalTargetElement.animate([
                                { transform: 'scale(1)', filter: 'brightness(1)' },
                                { transform: 'scale(1.3)', filter: 'brightness(1.5)' },
                                { transform: 'scale(1)', filter: 'brightness(1)' }
                            ], { duration: 300 });
                        }
                    }
                }
            };
            requestAnimationFrame(flyEgg);
        };

        walkingContainer.appendChild(egg);
        this.updateFloatingIconsPosition();
    },

    spawnMoveLearnedIcon: function() {
        var oldBulb = document.getElementById("floating-bulb-icon");
        if (oldBulb) { clearTimeout(oldBulb.despawnTimeout); oldBulb.remove(); }

        var walkingContainer = document.getElementById("pet-walking-container");
        if (!walkingContainer) return;

        var bulb = document.createElement("div");
        bulb.id = "floating-bulb-icon";
        bulb.style.cssText = "position: absolute; top: -120px; left: 50%; transform: translateX(-50%); width: 45px; height: 45px; cursor: pointer; z-index: 100005; display: flex; justify-content: center; align-items: center; font-size: 32px; filter: drop-shadow(0 0 10px rgba(255, 235, 59, 0.9)) drop-shadow(0 0 2px #ff9800); animation: wbmEggFloat 2s ease-in-out infinite;";
        bulb.innerHTML = "💡";

        bulb.onmouseenter = () => { bulb.style.filter = "drop-shadow(0 0 15px rgba(255, 255, 255, 1)) drop-shadow(0 0 5px #ff9800)"; };
        bulb.onmouseleave = () => { bulb.style.filter = "drop-shadow(0 0 10px rgba(255, 235, 59, 0.9)) drop-shadow(0 0 2px #ff9800)"; };

        bulb.despawnTimeout = setTimeout(() => {
            if (bulb && bulb.parentNode) {
                bulb.style.transition = "opacity 1s ease, transform 1s ease";
                bulb.style.opacity = "0";
                bulb.style.transform = "translateX(-50%) translateY(-40px) scale(0.5)"; 
                setTimeout(() => { 
                    if (bulb.parentNode) bulb.remove(); 
                    window.ExploreEngine.updateFloatingIconsPosition();
                }, 1000);
            }
        }, 20000);

        bulb.onclick = (e) => {
            e.stopPropagation();
            bulb.onclick = null; 
            clearTimeout(bulb.despawnTimeout);

            let startRect = bulb.getBoundingClientRect();
            document.body.appendChild(bulb);
            bulb.style.position = "fixed";
            bulb.style.left = startRect.left + "px";
            bulb.style.top = startRect.top + "px";
            bulb.style.transform = "none";
            bulb.style.animation = "none"; 

            window.ExploreEngine.updateFloatingIconsPosition(); 

            let startX = startRect.left;
            let startY = startRect.top;
            let startTime = performance.now();
            let duration = 1200;

            const getTargetRect = () => {
                let btns = Array.from(document.querySelectorAll('button, .wbm-float-btn'));
                let menuBtn = btns.find(b => {
                    let r = b.getBoundingClientRect();
                    return r.width > 0 && r.width < 100 && (b.innerText.includes('≡') || b.innerHTML.includes('fa-bars') || b.innerHTML.includes('line-horizontal') || (b.id && b.id.includes('menu')) || (b.id && b.id.includes('explore')));
                });
                if (menuBtn) { bulb.finalTargetElement = menuBtn; return menuBtn.getBoundingClientRect(); }
                let pet = document.getElementById('meu-pet-flutuante');
                if (pet) { bulb.finalTargetElement = pet; return { left: pet.getBoundingClientRect().right + 10, top: pet.getBoundingClientRect().top, width: 50, height: 50 }; }
                return { left: window.innerWidth - 80, top: window.innerHeight / 2, width: 50, height: 50 };
            };
            
            let flyBulb = (time) => {
                let elapsed = time - startTime;
                let t = Math.min(elapsed / duration, 1);
                let easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                
                let destRect = getTargetRect();
                let endX = destRect.left + (destRect.width / 2) - 22; 
                let endY = destRect.top + (destRect.height / 2) - 22;
                
                let currentX = startX + (endX - startX) * easeT;
                let currentY = startY + (endY - startY) * easeT - Math.sin(easeT * Math.PI) * 150; 
                
                let scale = 1 - (easeT * 0.9); 
                let rotation = easeT * 720;    
                
                bulb.style.left = currentX + 'px';
                bulb.style.top = currentY + 'px';
                bulb.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
                bulb.style.opacity = 1 - (easeT * 0.5); 
                
                if (t < 1) {
                    requestAnimationFrame(flyBulb);
                } else {
                    bulb.remove();
                    if (window.ExploreUI) {
                        let testString = window.t_ui("cleared") || "";
                        let finalMsg = testString.includes("Cleared") || testString.includes("cleared") ? "New Move!" : "Novo Golpe!";
                        window.ExploreUI.showFloatingText(finalMsg);

                        if (bulb.finalTargetElement && bulb.finalTargetElement.animate) {
                            bulb.finalTargetElement.animate([
                                { transform: 'scale(1)', filter: 'brightness(1)' },
                                { transform: 'scale(1.3)', filter: 'brightness(1.5)' },
                                { transform: 'scale(1)', filter: 'brightness(1)' }
                            ], { duration: 300 });
                        }
                    }
                }
            };
            requestAnimationFrame(flyBulb);
        };

        walkingContainer.appendChild(bulb);
        this.updateFloatingIconsPosition();
    },

    enemyDefeated: function () {
        if (!this.isRunning) return; 
        if (this.isTransitioningWave) return; 
        this.isTransitioningWave = true;
        
        let petVis = document.getElementById("pet-visual-container");
        if(petVis) petVis.classList.remove('wbm-idle-stance-right', 'wbm-idle-stance-left');

        if (this.combatLoopId) cancelAnimationFrame(this.combatLoopId);
        document.querySelectorAll("#active-enemy-container").forEach(el => el.remove());
        
        if (window.ExploreUI) window.ExploreUI.removeElement('enemy-status-board');
        
        let monId = window.gameState.pokemonId;
        let oldXp = window.gameState.currentXp;
        let oldLevel = window.getLevelFromTotalExp(oldXp);

        if (typeof window.addExperience === "function") {
            window.addExperience(10 + (this.enemyCombatData.level * 2));
            if (typeof window.checkProgression === "function") window.checkProgression();
            if (typeof window.saveData === "function") window.saveData();
            if (typeof window.updateUI === "function") window.updateUI(); 
        }

        let newXp = window.gameState.currentXp;
        let newLevel = window.getLevelFromTotalExp(newXp);
        
        if (newLevel > oldLevel) {
            let pokeDBData = window.pokemonDB.find(p => parseInt(p["#"], 10) === monId);
            
            if (pokeDBData && pokeDBData.Level_Moves) {
                let learnedNewMove = false;
                for (let moveName in pokeDBData.Level_Moves) {
                    let reqLvl = pokeDBData.Level_Moves[moveName];
                    if (reqLvl > oldLevel && reqLvl <= newLevel) {
                        learnedNewMove = true;
                        break;
                    }
                }
                if (learnedNewMove) {
                    this.spawnMoveLearnedIcon();
                }
            }

            if (pokeDBData && pokeDBData.Evolution_Level) {
                let evoLvl = parseInt(pokeDBData.Evolution_Level, 10);
                if (!isNaN(evoLvl) && newLevel >= evoLvl) {
                    this.isRunning = false; 
                    this.processarEvolucao(pokeDBData);
                }
            }
        }

        let evs = window.gameState.evMap ? window.gameState.evMap[window.gameState.pokemonId] : null;
        let nat = window.gameState.natureMap ? window.gameState.natureMap[window.gameState.pokemonId] : "Hardy";
        let stats = this.getStatsWithEVs(this.playerCombatData.dbData, evs, newLevel, nat);
        
        if (stats.HP > this.playerCombatData.stats.HP && window.BattleManager && window.BattleManager.player) {
            let diff = stats.HP - this.playerCombatData.stats.HP;
            window.BattleManager.player.currentHp += diff; 
        }
        this.playerCombatData.stats = stats;
        
        if (window.BattleManager && window.BattleManager.player) {
            window.BattleManager.player.maxHp = stats.HP;
        }
        
        var currentMon = window.monsterDatabase.find(m => m.id === window.gameState.pokemonId);
        if (window.ExploreUI && window.BattleManager && window.BattleManager.player) {
             window.ExploreUI.updateHPBar("player-hp-bar", window.BattleManager.player.currentHp, window.BattleManager.player.maxHp, newLevel, currentMon ? currentMon.name : "Pet");
        }
        
        this.enemiesDefeatedInCity++;

        if (this.enemiesDefeatedInCity < this.currentCity.enemiesPerWave) {
            setTimeout(() => { 
                this.isTransitioningWave = false; 
                this.spawnEnemy(); 
            }, 1000 / this.speedMultiplier);
        } else {
            if (this.currentCity.order === this.state.maxCityOrderCleared + 1) {
                this.state.maxCityOrderCleared = this.currentCity.order;
            }
            this.saveState();
            
            if (window.ExploreUI) window.ExploreUI.showFloatingText(`${this.currentCity.name} ${window.t_ui("cleared")}`);
            
            var dropChance = 0.50; 
            if (!this.eggFoundInRun && this.state.inventoryEggs.length < 40) {
                if (Math.random() <= dropChance) {
                    this.spawnEggIcon({ source: this.currentCity.name });
                    this.eggFoundInRun = true;
                }
            }

            if (this.isRepeatMode) {
                setTimeout(() => {
                    this.isTransitioningWave = false; 
                    if (!window.ExploreEngine.isRunning) return;
                    window.ExploreEngine.enemiesDefeatedInCity = 0;
                    window.ExploreEngine.eggFoundInRun = false;
                    
                    if (window.BattleManager && window.BattleManager.player) {
                        window.BattleManager.player.currentHp = window.BattleManager.player.maxHp;
                    }
                    
                    var pLvl = window.getLevelFromTotalExp(window.gameState.currentXp);
                    if (window.ExploreUI && window.BattleManager && window.BattleManager.player) {
                        window.ExploreUI.updateHPBar("player-hp-bar", window.BattleManager.player.currentHp, window.BattleManager.player.maxHp, pLvl);
                        window.ExploreUI.showFloatingText(window.t_ui("rep_stage"));
                    }
                    window.ExploreEngine.spawnEnemy();
                }, 2000 / window.ExploreEngine.speedMultiplier);
            } else {
                setTimeout(() => {
                    this.isTransitioningWave = false; 
                    if (!window.ExploreEngine.isRunning) return;
                    var nextCity = window.DatabaseHelper.getCityByOrder(window.ExploreEngine.currentCity.order + 1);
                    if (nextCity) {
                        window.ExploreEngine.currentCity = nextCity;
                        window.ExploreEngine.enemiesDefeatedInCity = 0;
                        window.ExploreEngine.eggFoundInRun = false;
                        
                        if (window.BattleManager && window.BattleManager.player) {
                            window.BattleManager.player.currentHp = window.BattleManager.player.maxHp;
                        }

                        var pLvl = window.getLevelFromTotalExp(window.gameState.currentXp);
                        if (window.ExploreUI && window.BattleManager && window.BattleManager.player) {
                            window.ExploreUI.updateHPBar("player-hp-bar", window.BattleManager.player.currentHp, window.BattleManager.player.maxHp, pLvl);
                            window.ExploreUI.showFloatingText(`${window.t_ui("advancing")}${window.ExploreEngine.currentCity.name}`);
                        }
                        window.ExploreEngine.spawnEnemy();
                    } else {
                        window.ExploreEngine.runOver(window.t_ui("end"));
                    }
                }, 2000 / window.ExploreEngine.speedMultiplier);
            }
        }
    },
// NOVO: Função para o motor saber quais Pokémon o jogador já possui
    getUnlockedIdsArray: function() {
        let state = window.gameState || {};
        let ids = new Set();
        if (state.unlockedIds) state.unlockedIds.forEach(id => ids.add(Number(id)));
        if (state.xpMap) Object.keys(state.xpMap).forEach(id => ids.add(Number(id)));
        if (state.pokemonId) ids.add(Number(state.pokemonId));
        return Array.from(ids);
    },
   processarEvolucao: function(pokemonDbData) {
        let evolucoes = pokemonDbData.Evolves_To_ID;
        
        // Se não tiver evolução, encerra aqui e retoma a corrida
        if (!evolucoes) {
            this.isRunning = true;
            return;
        }

        // Normaliza a leitura: transforma sempre em array (lista)
        let evoArray = Array.isArray(evolucoes) ? evolucoes : [evolucoes];
        
        // TRAVA INTELIGENTE: Verifica quantas evoluções estão faltando
        let idsDesbloqueados = this.getUnlockedIdsArray();
        let evolucoesFaltando = evoArray.filter(evoId => !idsDesbloqueados.includes(parseInt(evoId, 10)));

        // Se o jogador JÁ TEM todas as evoluções possíveis, ele para de incomodar e curte a forma base
        if (evolucoesFaltando.length === 0) {
            this.isRunning = true;
            return;
        }

        // Se tem evolução faltando, processa:
        if (evoArray.length > 1) {
            // Múltiplas evoluções (Scyther, Eevee): Mostra a janela!
            if (window.ExploreUI && typeof window.ExploreUI.abrirJanelaDeEscolhaDeEvolucao === "function") {
                window.ExploreUI.abrirJanelaDeEscolhaDeEvolucao(evoArray);
            }
        } else {
            // Evolução única (Charmander, Bulbasaur): Vai direto!
            this.evoluirDiretoPara(evoArray[0]);
        }
    },
evoluirDiretoPara: function(novoIdString) {
        let novoIdNumero = parseInt(novoIdString, 10);
        window.gameState.pokemonId = novoIdNumero;
        
        // Limpa o inimigo atual da tela
        document.querySelectorAll("#active-enemy-container").forEach(el => el.remove());
        
        // 1. PRIMEIRO: Avisa o sistema que a corrida voltou a ficar ativa!
        this.isRunning = true;
        
        // 2. DEPOIS: Atualiza a interface (agora os botões vão ler o isRunning como true e reaparecer)
        if (window.ExploreUI) {
            let nomeFinal = window.t_ui("cleared") && window.t_ui("cleared").includes("Cleared") ? "Evolved!" : "Evoluiu!";
            window.ExploreUI.showFloatingText(nomeFinal);
            window.ExploreUI.updateRunButtons();
        }

        // 3. Retoma a batalha chamando um novo inimigo
        this.spawnEnemy(); 
    },
    
    runOver: function (msg) {
        if (this.combatLoopId) cancelAnimationFrame(this.combatLoopId);
        if (window.BattleManager) window.BattleManager.stop();
        
        let petVis = document.getElementById("pet-visual-container");
        if(petVis) petVis.classList.remove('wbm-idle-stance-right', 'wbm-idle-stance-left');

        document.querySelectorAll("#active-enemy-container").forEach(el => el.remove());
        
        let isEgg = window.gameState && window.gameState.isEgg;
        
        if (this.isRepeatMode && this.isRunning && !isEgg) {
            this.enemiesDefeatedInCity = 0;
            this.eggFoundInRun = false;
            
            if (window.BattleManager && window.BattleManager.player) {
                 window.BattleManager.player.currentHp = window.BattleManager.player.maxHp;
            }

            var playerLvl = window.getLevelFromTotalExp(window.gameState.currentXp);
            var currentMon = window.monsterDatabase.find(m => m.id === window.gameState.pokemonId);
            if (window.ExploreUI && window.BattleManager && window.BattleManager.player) {
                window.ExploreUI.updateHPBar("player-hp-bar", window.BattleManager.player.currentHp, window.BattleManager.player.maxHp, playerLvl, currentMon ? currentMon.name : "Pet");
                window.ExploreUI.showFloatingText(window.t_ui("rep_stage"));
            }
            setTimeout(() => { 
                this.isTransitioningWave = false;
                if (window.ExploreEngine.isRunning) window.ExploreEngine.spawnEnemy(); 
            }, 2000 / this.speedMultiplier);
            return;
        }
        
        this.isRunning = false;
        this.isTransitioningWave = false;
        this.saveState(); 

        this.enemiesDefeatedInCity = 0;
        this.eggFoundInRun = false;
        
        if (window.ExploreUI) {
            window.ExploreUI.removeElement("player-hp-bar");
            window.ExploreUI.removeElement("player-moves-hud-container");
            window.ExploreUI.removeElement("player-status-board");
            window.ExploreUI.removeElement("enemy-status-board");
            window.ExploreUI.showFloatingText(msg);
            window.ExploreUI.updateRunButtons();
        }
    },

    equipEgg: function (index) {
        if (this.isRunning) {
            if (window.ExploreUI) window.ExploreUI.showFloatingText(window.t_ui("block_egg"));
            return;
        }

        var eggToEquip = this.state.inventoryEggs.splice(index, 1)[0];
        if (!eggToEquip) return;

        chrome.storage.local.get(["pokemonGameState"], (result) => {
            var state = result.pokemonGameState || {};
            if (state.isEgg && state.activeEgg) {
                this.state.inventoryEggs.push(state.activeEgg);
            }
            this.saveState(); 
            state.currentXp = 0; 
            state.isEgg = true;
            state.pokemonId = null;
            state.activeEgg = eggToEquip;
            chrome.storage.local.set({ pokemonGameState: state });
        });
    },

    discardEgg: function (index) {
        this.state.inventoryEggs.splice(index, 1);
        this.saveState();
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "check_if_battling") {
        let running = window.ExploreEngine ? window.ExploreEngine.isRunning : false;
        sendResponse({ isRunning: running });
    }
});