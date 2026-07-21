// ==========================================
// LIMPEZA DE CACHE E TRADUÇÃO 
// ==========================================
var ghostPet = document.getElementById("meu-pet-flutuante");
if (ghostPet) ghostPet.remove();

window.WBM_LANG = {
    pt: { egg: "Ovo", unknown: "Desconhecido", max: "Máx!" },
    en: { egg: "Egg", unknown: "Unknown", max: "Max!" }
};
window.globalAppLang = 'pt';
window.dopamineMode = true; 

window.t_c = function(key) { return window.WBM_LANG[window.globalAppLang][key] || key; };

chrome.storage.local.get(['idioma', 'dopamineMode'], res => {
    if (res.idioma) window.globalAppLang = res.idioma;
    if (res.dopamineMode !== undefined) window.dopamineMode = res.dopamineMode;
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.idioma) {
        window.globalAppLang = changes.idioma.newValue;
        if(typeof window.updateUI === "function") window.updateUI();
    }
    if (changes.dopamineMode !== undefined) {
        window.dopamineMode = changes.dopamineMode.newValue;
    }
});

// ==========================================
// FUNÇÕES GLOBAIS DE CÁLCULO DE EXPERIÊNCIA
// ==========================================
window.MAX_LEVEL = 100;
window.MAX_EXP = 1000000;
window.isDataLoaded = false; 

window.getTotalExpForLevel = function(level) { return Math.pow(level, 3); };
window.getLevelFromTotalExp = function(totalExp) { return Math.min(Math.floor(Math.cbrt(totalExp)), window.MAX_LEVEL); };

window.addExperience = function(amount) {
  if (!window.isDataLoaded) return; 
  
  if (window.gameState.currentXp >= window.MAX_EXP) return;
  window.gameState.currentXp += amount;
  if (window.gameState.currentXp > window.MAX_EXP) window.gameState.currentXp = window.MAX_EXP;
  
  if (!window.gameState.isEgg && window.gameState.pokemonId) {
      if(!window.gameState.xpMap) window.gameState.xpMap = {};
      window.gameState.xpMap[window.gameState.pokemonId] = window.gameState.currentXp;
  }
};

// ==========================================
// FUNÇÃO DE BUSCA LOCAL DAS IMAGENS E DADOS
// ==========================================
window.generationsData = {
  1: { start: 1, end: 151, folder: "Generation 1 Pokemon" }, 2: { start: 152, end: 251, folder: "Generation 2 Pokemon" }, 3: { start: 252, end: 386, folder: "Generation 3 Pokemon" }, 4: { start: 387, end: 493, folder: "Generation 4 Pokemon" }, 5: { start: 494, end: 649, folder: "Generation 5 Pokemon" }, 6: { start: 650, end: 721, folder: "Generation 6 Pokemon" }, 7: { start: 722, end: 809, folder: "Generation 7 Pokemon" }, 8: { start: 810, end: 905, folder: "Generation 8 Pokemon" }, 9: { start: 906, end: 1025, folder: "Generation 9 Pokemon" }
};

window.legendaryNames = [
  "Articuno", "Zapdos", "Moltres", "Mewtwo", "Mew", "Raikou", "Entei", "Suicune", "Lugia", "Ho-Oh", "Celebi", "Regirock", "Regice", "Registeel", "Latias", "Latios", "Kyogre", "Groudon", "Rayquaza", "Jirachi", "Deoxys", "Uxie", "Mesprit", "Azelf", "Dialga", "Palkia", "Heatran", "Regigigas", "Giratina", "Cresselia", "Phione", "Manaphy", "Darkrai", "Shaymin", "Arceus", "Cobalion", "Terrakion", "Virizion", "Tornadus", "Thundurus", "Reshiram", "Zekrom", "Landorus", "Kyurem", "Keldeo", "Meloetta", "Genesect", "Xerneas", "Yveltal", "Zygarde", "Diancie", "Hoopa", "Volcanion", "Tapu Koko", "Tapu Lele", "Tapu Bulu", "Tapu Fini", "Cosmog", "Cosmoem", "Solgaleo", "Lunala", "Nihilego", "Buzzwole", "Pheromosa", "Xurkitree", "Celesteela", "Kartana", "Guzzlord", "Necrozma", "Magearna", "Marshadow", "Zeraora", "Meltan", "Melmetal", "Zacian", "Zamazenta", "Eternatus", "Kubfu", "Urshifu", "Regieleki", "Regidrago", "Glastrier", "Spectrier", "Calyrex", "Enamorus", "Zarude", "Wo-Chien", "Chien-Pao", "Ting-Lu", "Chi-Yu", "Koraidon", "Miraidon", "Walking Wake", "Iron Leaves", "Okidogi", "Munkidori", "Fezandipiti", "Ogerpon", "Gouging Fire", "Raging Bolt", "Iron Boulder", "Iron Crown", "Terapagos", "Pecharunt"
];

window.getPokemonImagePath = function(id, name) {
  var folderName = "Generation 1 Pokémon"; 
  for (const gen in window.generationsData) {
    if (id >= window.generationsData[gen].start && id <= window.generationsData[gen].end) {
      folderName = window.generationsData[gen].folder; break;
    }
  }
  
  // BLINDAGEM DE CARACTERES
  var safeName = name ? name : 'Unknown';
  safeName = safeName.replace("Mime Jr.", "Mime-Jr").replace("Mime-jr", "Mime-Jr");
  
  var paddedId = id.toString().padStart(4, '0');
  return chrome.runtime.getURL(encodeURI(`assets/${folderName}/${paddedId} ${safeName}.png`));
};

// ==========================================
// BLINDAGEM DE ACESSO AO BANCO DE DADOS
// ==========================================
window.pokemonDB = window.pokemonDB || (typeof pokemonDB !== 'undefined' ? pokemonDB : []);

if (!window.pokemonDB || window.pokemonDB.length === 0) {
    console.error("ERRO WBM: O arquivo pokemon_db.js não foi lido! Lembre-se de usar window.pokemonDB = [...] no arquivo do banco de dados.");
}

window.pokemonNames = window.pokemonDB.map(poke => poke.Name);

window.evolutions = {};
window.pokemonDB.forEach(poke => {
    let id = parseInt(poke["#"], 10);
    if (poke.Evolves_To_ID) {
        window.evolutions[id] = [parseInt(poke.Evolves_To_ID, 10)];
    }
});
window.evolvedIds = Object.values(window.evolutions).flat();

window.monsterDatabase = window.pokemonDB.map((poke) => {
    let id = parseInt(poke["#"], 10);
    let evolvesTo = poke.Evolves_To_ID ? [parseInt(poke.Evolves_To_ID, 10)] : null;
    
    let evolveLvl = poke.Evolution_Level;
    if (typeof evolveLvl === "string") {
        evolveLvl = 36; 
    }

    return {
        id: id,
        name: poke.Name,
        imageUrl: window.getPokemonImagePath(id, poke.Name),
        evolveLevel: evolveLvl,
        evolvesTo: evolvesTo,
        isBaseStage: poke.Stage === "Base",
        isLegendary: window.legendaryNames.includes(poke.Name),
        types: poke["Type 2"] ? [poke["Type 1"], poke["Type 2"]] : [poke["Type 1"]],
        stats: { 
            hp: poke.HP, atk: poke.Attack, def: poke.Defense, 
            spAtk: poke["Sp. Atk"], spDef: poke["Sp. Def"], speed: poke.Speed 
        }
    };
});
window.gameState = { isEgg: true, currentXp: 0, pokemonId: null, unlockedIds: [], xpMap: {}, adoptionCount: 0, activeEgg: null };

// ==========================================
// ESTADO GLOBAL DE LATERALIDADE E POSIÇÃO
// ==========================================
window.globalLat = 'destro';

window.applyLatPosition = function() {
    if (!window.hasDragged && window.petContainer) {
        if (window.globalLat === 'canhoto') {
            window.petContainer.style.right = 'auto';
            window.petContainer.style.left = '20px';
        } else {
            window.petContainer.style.left = 'auto';
            window.petContainer.style.right = '20px';
        }
    }
};

chrome.storage.local.get(['lateralidade'], res => { 
    window.globalLat = res.lateralidade || 'destro'; 
    window.applyLatPosition();
});
chrome.storage.onChanged.addListener(changes => { 
    if (changes.lateralidade) {
        window.globalLat = changes.lateralidade.newValue; 
        window.applyLatPosition();
    }
});

// ==========================================
// UI DO CONTENT
// ==========================================
window.petContainer = document.createElement("div");
window.petContainer.id = "meu-pet-flutuante";
window.petContainer.style.cssText = "position: fixed; z-index: 999999; bottom: 20px; right: 20px; pointer-events: auto; display: flex; flex-direction: column; align-items: center; cursor: grab;";

window.walkingContainer = document.createElement("div");
window.walkingContainer.id = "pet-walking-container";
window.walkingContainer.style.cssText = "position: relative; display: flex; flex-direction: column; align-items: center;";

window.reactionBalloon = document.createElement("div");
window.reactionBalloon.style.cssText = "position: absolute; top: -30px; font-size: 24px; opacity: 0; transition: opacity 0.2s ease, transform 0.2s ease; pointer-events: none; z-index: 100001;";

window.tooltip = document.createElement("div");
window.tooltip.style.cssText = "position: absolute; top: -40px; background: rgba(0,0,0,0.8); color: white; padding: 5px 10px; border-radius: 5px; font-family: Arial; font-size: 12px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; z-index: 100000;";

window.petVisual = document.createElement("div");
window.petVisual.id = "pet-visual-container";
window.petVisual.style.cssText = "width: 80px; height: 80px; display: flex; justify-content: center; align-items: center; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3)); transition: transform 0.1s ease-out;";

window.walkingContainer.appendChild(window.reactionBalloon);
window.walkingContainer.appendChild(window.tooltip);
window.walkingContainer.appendChild(window.petVisual);
window.petContainer.appendChild(window.walkingContainer);

function safeInject() {
  if (document.body) document.body.appendChild(window.petContainer);
  else requestAnimationFrame(safeInject);
}
safeInject();

// ==========================================
// FÍSICA, MOVIMENTO E SISTEMA DE ODÔMETRO (XP)
// ==========================================
window.isDragging = false; 
window.hasDragged = false;
window.dragStartX = 0; window.dragStartY = 0; 
window.startLeft = 0; window.startTop = 0;
window.isEvolving = false;

window.lastMouseX = null;
window.lastMouseY = null;
window.accumulatedDistance = 0;
window.lastMouseXpTime = 0;

window.DISTANCE_THRESHOLD = 300; 
window.MOUSE_XP_COOLDOWN = 500;  

window.petContainer.addEventListener('mousedown', (e) => {
  if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('#evolution-dialog')) return; 
  e.preventDefault(); window.isDragging = true; window.hasDragged = false; window.petContainer.style.cursor = 'grabbing';
  var rect = window.petContainer.getBoundingClientRect(); window.startLeft = rect.left; window.startTop = rect.top; window.dragStartX = e.clientX; window.dragStartY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
  const currentX = e.clientX;
  const currentY = e.clientY;

  if (window.isDragging) {
    var dx = currentX - window.dragStartX, dy = currentY - window.dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) window.hasDragged = true;
    
    var newLeft = window.startLeft + dx;
    var newTop = window.startTop + dy;
    
    if (newLeft < 20) newLeft = 20;
    if (newTop < 100) newTop = 100;
    if (newLeft > window.innerWidth - 80) newLeft = window.innerWidth - 80;
    if (newTop > window.innerHeight - 80) newTop = window.innerHeight - 80;
    
    window.petContainer.style.bottom = 'auto'; 
    window.petContainer.style.right = 'auto';
    window.petContainer.style.left = newLeft + 'px'; 
    window.petContainer.style.top = newTop + 'px';
    return;
  }

  if (!window.isDataLoaded || window.isEvolving) return;

  if (window.lastMouseX === null || window.lastMouseY === null) {
    window.lastMouseX = currentX;
    window.lastMouseY = currentY;
    return;
  }

  const deltaX = currentX - window.lastMouseX;
  const deltaY = currentY - window.lastMouseY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  if (distance > 2) window.accumulatedDistance += distance;

  window.lastMouseX = currentX;
  window.lastMouseY = currentY;

  const now = Date.now();
  if (window.accumulatedDistance >= window.DISTANCE_THRESHOLD) {
    if (now - window.lastMouseXpTime >= window.MOUSE_XP_COOLDOWN) {
      window.handleInteraction(); 
      window.lastMouseXpTime = now;
      window.accumulatedDistance -= window.DISTANCE_THRESHOLD; 
    } else {
      window.accumulatedDistance = window.DISTANCE_THRESHOLD;
    }
  }
}, { passive: true }); 

window.addEventListener('mouseup', () => { 
  if (window.isDragging) { window.isDragging = false; window.petContainer.style.cursor = 'grab'; } 
});

window.walkOffset = 0; window.walkDirection = -1; window.currentScaleX = 1;
window.walkSpeed = 0.2; window.baseScale = 1; 

window.walkLoop = function() {
  if (!window.isDragging && !window.gameState.isEgg && !window.isEvolving) {
    var isMenuOpen = document.getElementById("explore-menu-box")?.style.display === "flex" || document.getElementById("evolution-dialog");
    var inCombat = typeof window.ExploreEngine !== "undefined" && window.ExploreEngine.isRunning;
    
    if (isMenuOpen || inCombat) {
        var enemyEl = document.getElementById("active-enemy-container");
        if (inCombat && enemyEl) {
            var petRect = window.petVisual.getBoundingClientRect();
            var enemyRect = enemyEl.getBoundingClientRect();
            var dist = (petRect.left + 40) - (enemyRect.left + 40);
            window.currentScaleX = dist > 0 ? 1 : -1; 
        } else if (isMenuOpen) {
            window.currentScaleX = (window.globalLat === 'canhoto') ? -1 : 1;
        }

        window.walkingContainer.style.transform = `translateX(${window.walkOffset}px)`;
        var imgEl = window.petVisual.querySelector("img");
        if (imgEl) imgEl.style.transform = `scaleX(${window.currentScaleX})`;
        
    } else {
        var minWalk = window.globalLat === 'canhoto' ? 30 : -100;
        var maxWalk = window.globalLat === 'canhoto' ? 100 : -30;

        if (window.walkOffset < minWalk) window.walkDirection = 1;
        else if (window.walkOffset > maxWalk) window.walkDirection = -1;

        window.walkOffset += window.walkSpeed * window.walkDirection;
        window.currentScaleX = window.walkDirection === 1 ? -1 : 1;
        
        window.walkingContainer.style.transform = `translateX(${window.walkOffset}px)`;
        var imgEl = window.petVisual.querySelector("img");
        if (imgEl) imgEl.style.transform = `scaleX(${window.currentScaleX})`;
    }
  } else if (window.gameState.isEgg) {
    window.walkOffset = window.globalLat === 'canhoto' ? 65 : -65;
    window.walkingContainer.style.transform = `translateX(${window.walkOffset}px)`;
  }
  requestAnimationFrame(window.walkLoop);
};
window.walkLoop();

// ==========================================
// ANIMAÇÃO DE CONFETES E ESTRELAS
// ==========================================
window.triggerConfetti = function() {
    if (!window.dopamineMode) return;

    var walkingNode = document.getElementById("pet-walking-container");
    if (!walkingNode) return;
    
    var colors = ['#ffae3c', '#4CAF50', '#2196F3', '#ff4d4d', '#FFD700', '#ffffff'];
    var shapes = ['★', '✨', '🎊', '🎉', '✦'];
    
    for (let i = 0; i < 30; i++) {
        let particle = document.createElement('div');
        particle.innerText = shapes[Math.floor(Math.random() * shapes.length)];
        particle.style.position = 'absolute';
        particle.style.left = '50%';
        particle.style.top = '10%'; 
        particle.style.transform = 'translate(-50%, -50%)';
        particle.style.color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.fontSize = (Math.random() * 15 + 10) + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '100010';
        particle.style.transition = 'transform 1s cubic-bezier(0.25, 1, 0.5, 1), opacity 1s linear';
        walkingNode.appendChild(particle);

        let angle = Math.random() * Math.PI * 2;
        let radius = Math.random() * 100 + 40;
        let dx = Math.cos(angle) * radius;
        let dy = Math.sin(angle) * radius - 60; 

        setTimeout(() => {
            particle.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random()*360}deg) scale(1.5)`;
            particle.style.opacity = '0';
        }, 10);

        setTimeout(() => particle.remove(), 1050);
    }
};

window.triggerSpawnStars = function() {
    if (!window.dopamineMode) return;

    var walkingNode = document.getElementById("pet-walking-container");
    if (!walkingNode) return;
    
    var shapes = ['★', '✨', '✦', '❇'];
    
    for (let i = 0; i < 25; i++) {
        let particle = document.createElement('div');
        particle.innerText = shapes[Math.floor(Math.random() * shapes.length)];
        particle.style.position = 'absolute';
        particle.style.left = '50%';
        particle.style.top = '10%'; 
        particle.style.transform = 'translate(-50%, -50%) scale(0.1)';
        particle.style.color = '#FFF'; 
        particle.style.textShadow = '0 0 8px #FFD700, 0 0 15px #FFA500';
        particle.style.fontSize = (Math.random() * 25 + 15) + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '100010';
        particle.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease-out';
        walkingNode.appendChild(particle);

        let angle = Math.random() * Math.PI * 2;
        let radius = Math.random() * 140 + 60;
        let dx = Math.cos(angle) * radius;
        let dy = Math.sin(angle) * radius - 60; 

        setTimeout(() => {
            particle.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random()*720}deg) scale(1.5)`;
            particle.style.opacity = '0';
        }, 10);

        setTimeout(() => particle.remove(), 850);
    }
};

// ==========================================
// ANIMAÇÕES DE SPAWN (POKEBOLA E OVO CHOCANDO)
// ==========================================
window.playPokeballSpawnAnimation = function(pokemonId) {
    if (!window.isDataLoaded) return;
    
    if (window.isSpawnAnimating) return;
    window.isSpawnAnimating = true;

    var currentMon = window.monsterDatabase.find(m => m.id === pokemonId);
    if (!currentMon) {
        window.isSpawnAnimating = false;
        window.updateUI();
        return;
    }

    window.isEvolving = true;

    window.petVisual.innerHTML = "";
    window.tooltip.style.opacity = "0";
    
    var pokeballUrl = chrome.runtime.getURL("assets/Icons/Pokeball_Launch.png");
    var pbImg = document.createElement("img");
    pbImg.src = pokeballUrl;
    pbImg.style.cssText = "width: 40px; height: 40px; object-fit: contain; position: absolute; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.5));";
    window.petVisual.appendChild(pbImg);

    var startX = window.globalLat === 'canhoto' ? -350 : 350;

    var throwAnim = pbImg.animate([
        { transform: `translate(${startX}px, -250px) rotate(1080deg)`, opacity: 0 },
        { transform: `translate(${startX / 2}px, -150px) rotate(540deg)`, opacity: 1, offset: 0.5 },
        { transform: `translate(0px, 0px) rotate(0deg)`, opacity: 1 }
    ], { duration: 600, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' });

    throwAnim.onfinish = () => {
        if (!window.dopamineMode) {
            pbImg.remove();
            
            var monImg = document.createElement("img");
            monImg.src = currentMon.imageUrl;
            monImg.draggable = false;
            monImg.style.cssText = `width: 100%; height: 100%; object-fit: contain; transform: scaleX(${window.currentScaleX});`;
            window.petVisual.appendChild(monImg);

            var simpleSpawnAnim = monImg.animate([
                { transform: `scaleX(${window.currentScaleX}) scale(0.1)`, filter: 'opacity(0)' },
                { transform: `scaleX(${window.currentScaleX}) scale(1)`, filter: 'opacity(1)' }
            ], { duration: 400, easing: 'ease-out' });

            simpleSpawnAnim.onfinish = () => {
                window.isSpawnAnimating = false;
                window.isEvolving = false;
                window.updateUI(); 
            };
            return;
        }

        var burstAnim = pbImg.animate([
            { transform: 'scale(1)', filter: 'brightness(1) drop-shadow(0 0 5px white)' },
            { transform: 'scale(1.3)', filter: 'brightness(5) drop-shadow(0 0 20px white)', offset: 0.7 },
            { transform: 'scale(1.8)', filter: 'brightness(10) opacity(0)' }
        ], { duration: 350, easing: 'ease-out' });

        burstAnim.onfinish = () => {
            pbImg.remove();
            
            window.triggerSpawnStars();
            
            var monImg = document.createElement("img");
            monImg.src = currentMon.imageUrl;
            monImg.draggable = false;
            monImg.style.cssText = `width: 100%; height: 100%; object-fit: contain; transform: scaleX(${window.currentScaleX});`;
            window.petVisual.appendChild(monImg);

            var spawnAnim = monImg.animate([
                { transform: `scaleX(${window.currentScaleX}) scale(0.1)`, filter: 'brightness(20) drop-shadow(0 0 50px white)' },
                { transform: `scaleX(${window.currentScaleX}) scale(1.3)`, filter: 'brightness(10) drop-shadow(0 0 30px white)', offset: 0.4 },
                { transform: `scaleX(${window.currentScaleX}) scale(1.1)`, filter: 'brightness(2) drop-shadow(0 0 10px white)', offset: 0.7 },
                { transform: `scaleX(${window.currentScaleX}) scale(1)`, filter: 'brightness(1) drop-shadow(2px 4px 6px rgba(0,0,0,0.3))' }
            ], { duration: 1200, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' });

            spawnAnim.onfinish = () => {
                window.isSpawnAnimating = false;
                window.isEvolving = false;
                window.updateUI(); 
            };
        };
    };
};

window.playEggHatchAnimation = function(hatchedId) {
    if (!window.isDataLoaded) return;
    
    if (window.isSpawnAnimating) return; 
    window.isSpawnAnimating = true;
    window.isEvolving = true;

    var currentMon = window.monsterDatabase.find(m => m.id === hatchedId);
    if (!currentMon) {
        window.isSpawnAnimating = false;
        window.isEvolving = false;
        window.updateUI();
        return;
    }

    var imgEl = window.petVisual.querySelector("img");
    if (!imgEl) {
        window.isSpawnAnimating = false;
        window.isEvolving = false;
        window.gameState.isEgg = false;
        window.triggerConfetti();
        window.commitEvolution(hatchedId);
        return;
    }

    window.tooltip.style.opacity = "0";

    if (!window.dopamineMode) {
        var simpleHatch = imgEl.animate([
            { transform: `scaleX(${window.currentScaleX}) scale(1)` },
            { transform: `scaleX(${window.currentScaleX}) scale(1.2)`, offset: 0.5 },
            { transform: `scaleX(${window.currentScaleX}) scale(1)` }
        ], { duration: 800, easing: 'ease-in-out' });

        simpleHatch.onfinish = () => {
            imgEl.src = currentMon.imageUrl;
            
            var simpleSpawn = imgEl.animate([
                { transform: `scaleX(${window.currentScaleX}) scale(0.5)`, filter: 'opacity(0)' },
                { transform: `scaleX(${window.currentScaleX}) scale(1)`, filter: 'opacity(1)' }
            ], { duration: 400, easing: 'ease-out' });

            simpleSpawn.onfinish = () => {
                window.isSpawnAnimating = false;
                window.isEvolving = false;
                window.gameState.isEgg = false;
                window.commitEvolution(hatchedId);
            };
        };
        return;
    }

    var hatchAnim = imgEl.animate([
        { transform: `scaleX(${window.currentScaleX}) scale(1) rotate(0deg)`, filter: 'brightness(1) drop-shadow(2px 4px 6px rgba(0,0,0,0.3))' },
        { transform: `scaleX(${window.currentScaleX}) scale(1.1) rotate(-15deg)`, filter: 'brightness(2) drop-shadow(0 0 10px white)', offset: 0.2 },
        { transform: `scaleX(${window.currentScaleX}) scale(1.2) rotate(15deg)`, filter: 'brightness(4) drop-shadow(0 0 20px white)', offset: 0.4 },
        { transform: `scaleX(${window.currentScaleX}) scale(1.3) rotate(-20deg)`, filter: 'brightness(6) drop-shadow(0 0 30px white)', offset: 0.6 },
        { transform: `scaleX(${window.currentScaleX}) scale(1.4) rotate(20deg)`, filter: 'brightness(8) drop-shadow(0 0 40px white)', offset: 0.8 },
        { transform: `scaleX(${window.currentScaleX}) scale(1.5) rotate(0deg)`, filter: 'brightness(10) drop-shadow(0 0 50px white)' }
    ], { duration: 1500, easing: 'ease-in-out' });

    hatchAnim.onfinish = () => {
        imgEl.src = currentMon.imageUrl;

        window.triggerConfetti();
        window.triggerSpawnStars();

        var spawnAnim = imgEl.animate([
            { transform: `scaleX(${window.currentScaleX}) scale(0.5)`, filter: 'brightness(10) drop-shadow(0 0 50px white)' },
            { transform: `scaleX(${window.currentScaleX}) scale(1.2)`, filter: 'brightness(3) drop-shadow(0 0 20px white)', offset: 0.5 },
            { transform: `scaleX(${window.currentScaleX}) scale(1)`, filter: 'brightness(1) drop-shadow(2px 4px 6px rgba(0,0,0,0.3))' }
        ], { duration: 1000, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' });

        spawnAnim.onfinish = () => {
            window.isSpawnAnimating = false;
            window.isEvolving = false;
            window.gameState.isEgg = false;
            window.commitEvolution(hatchedId);
        };
    };
};

// ==========================================
// CAIXA DE DIÁLOGO E LÓGICA DE EVOLUÇÃO
// ==========================================
window.commitEvolution = function(newId) {
    window.gameState.pokemonId = newId;
    window.gameState.currentXp = window.gameState.xpMap[newId] || window.gameState.currentXp;
    window.gameState.xpMap[newId] = window.gameState.currentXp;
    if (!window.gameState.unlockedIds.includes(newId)) window.gameState.unlockedIds.push(newId);
    window.saveData();
    window.updateUI();
};

window.startEvolution = function(oldId, newId) {
    if (window.isEvolving) return;
    window.isEvolving = true;
    
    var oldMon = window.monsterDatabase.find(m => m.id === oldId);
    var newMon = window.monsterDatabase.find(m => m.id === newId);
    var imgEl = window.petVisual.querySelector("img");
    
    if (!imgEl) {
        window.commitEvolution(newId);
        window.isEvolving = false;
        return;
    }

    if (!window.dopamineMode) {
        imgEl.src = newMon.imageUrl;
        window.isEvolving = false;
        window.commitEvolution(newId);
        return;
    }
    
    var flashes = 0;
    var maxFlashes = 14; 
    var currentInterval = 400; 

    function flash() {
        if (flashes >= maxFlashes) {
            window.isEvolving = false;
            imgEl.style.filter = ""; 
            imgEl.src = newMon.imageUrl;
            window.triggerConfetti();
            window.commitEvolution(newId);
            return;
        }
        
        var showNew = flashes % 2 !== 0;
        imgEl.src = showNew ? newMon.imageUrl : oldMon.imageUrl;
        imgEl.style.filter = "brightness(0) invert(1) drop-shadow(0 0 10px rgba(255,255,255,0.8))";
        
        flashes++;
        currentInterval = Math.max(50, currentInterval * 0.75);
        setTimeout(flash, currentInterval);
    }
    flash();
};

window.showEvolutionDialog = function(evolutionOptions) {
    var walkingNode = document.getElementById("pet-walking-container");
    if (!walkingNode || document.getElementById("evolution-dialog")) return;

    var dialog = document.createElement("div");
    dialog.id = "evolution-dialog";
    dialog.style.cssText = `
        position: absolute; bottom: 85px; left: 50%; transform: translateX(-50%);
        border-radius: 12px; padding: 12px; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 10px; 
        z-index: 100005; min-width: 180px; text-align: center; font-family: Arial, sans-serif;
    `;

    var title = document.createElement("strong");
    title.innerText = typeof t_ui === 'function' ? t_ui("evo_title") : "Evolução Múltipla! Escolha:";
    title.className = "evo-title";
    dialog.appendChild(title);

    var optionsGrid = document.createElement("div");
    optionsGrid.style.cssText = "display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; max-width: 300px; background: transparent !important; border: none !important;";

    evolutionOptions.forEach(id => {
        var evoData = window.monsterDatabase.find(m => m.id === id);
        if (!evoData) return;

        var btn = document.createElement("div");
        btn.style.cssText = `
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            border-radius: 8px; padding: 8px; border: 1px solid transparent;
            cursor: pointer; transition: all 0.2s; width: 60px;
        `;
        btn.onmouseenter = () => { btn.style.transform = "scale(1.05)"; };
        btn.onmouseleave = () => { btn.style.transform = "scale(1)"; };

        btn.onclick = (e) => {
            e.stopPropagation();
            dialog.remove();
            window.startEvolution(window.gameState.pokemonId, id);
        };

        var img = document.createElement("img");
        img.src = evoData.imageUrl;
        img.style.cssText = "width: 45px; height: 45px; object-fit: contain; margin-bottom: 5px;";
        
        var name = document.createElement("span");
        name.innerText = evoData.name;
        name.style.cssText = "font-size: 10px; font-weight: bold; text-align: center; line-height: 1.1;";

        btn.appendChild(img);
        btn.appendChild(name);
        optionsGrid.appendChild(btn);
    });

    dialog.appendChild(optionsGrid);
    walkingNode.appendChild(dialog);
};

// ==========================================
// PROGRESSÃO DE STATUS
// ==========================================
window.updateUI = function() {
  if (window.isEvolving) return; 

  var currentLevel = window.getLevelFromTotalExp(window.gameState.currentXp);
  var eggImgUrl = chrome.runtime.getURL("assets/Icons/Egg.png");
  var t_egg = window.t_c("egg");
  var t_max = window.t_c("max");
  var t_unknown = window.t_c("unknown");

  if (window.gameState.isEgg) {
    window.petVisual.innerHTML = `<img draggable="false" src="${eggImgUrl}" style="width: 100%; height: 100%; object-fit: contain; transform: scaleX(${window.currentScaleX});">`;
    window.tooltip.innerText = `${t_egg} (Lv. ${currentLevel}) - XP: ${window.gameState.currentXp}/${window.getTotalExpForLevel(5)}`;
  } else {
    var currentMon = window.monsterDatabase.find(m => m.id === window.gameState.pokemonId);
    if (currentMon) {
      window.petVisual.innerHTML = `<img draggable="false" src="${currentMon.imageUrl}" style="width: 100%; height: 100%; object-fit: contain; transform: scaleX(${window.currentScaleX});">`;
      window.tooltip.innerText = currentLevel >= window.MAX_LEVEL ? `${currentMon.name} (Lv. 100) - ${t_max}` : `${currentMon.name} (Lv. ${currentLevel}) - XP: ${window.gameState.currentXp}/${window.getTotalExpForLevel(currentLevel + 1)}`;
    } else {
      window.gameState.isEgg = true; window.gameState.pokemonId = null; 
      window.petVisual.innerHTML = `<img draggable="false" src="${eggImgUrl}" style="width: 100%; height: 100%; object-fit: contain; transform: scaleX(${window.currentScaleX});">`; 
      window.tooltip.innerText = `${t_egg} ${t_unknown}`; 
      if (window.isDataLoaded) window.saveData();
    }
  }
};

window.petContainer.addEventListener("mouseenter", () => { window.updateUI(); window.tooltip.style.opacity = "1"; });
window.petContainer.addEventListener("mouseleave", () => { window.tooltip.style.opacity = "0"; });

window.checkProgression = function() {
  if (!window.isDataLoaded || !window.monsterDatabase || window.monsterDatabase.length === 0) return;
  var currentLevel = window.getLevelFromTotalExp(window.gameState.currentXp);
  if(!window.gameState.xpMap) window.gameState.xpMap = {};

  if (window.gameState.isEgg) {
    if (currentLevel >= 5) {
      var pool = window.monsterDatabase;
      if (window.gameState.activeEgg && window.gameState.activeEgg.source && typeof window.DatabaseHelper !== 'undefined') {
        var city = window.DatabaseHelper.getCityByName(window.gameState.activeEgg.source);
        if (city && city.encounters) {
            var cityPokemonIds = city.encounters.map(e => e.pokemonId);
            pool = window.monsterDatabase.filter(m => cityPokemonIds.includes(m.id));
        }
      }
      
      var baseStages = pool.filter(m => m.isBaseStage);
      if(baseStages.length === 0) baseStages = window.monsterDatabase.filter(m => m.isBaseStage);
      
      var normalPool = baseStages.filter(m => !m.isLegendary);
      var legendPool = baseStages.filter(m => m.isLegendary);

      var hatchedPokemon;
      if (legendPool.length > 0 && Math.random() < 0.05) {
          hatchedPokemon = legendPool[Math.floor(Math.random() * legendPool.length)];
      } else if (normalPool.length > 0) {
          hatchedPokemon = normalPool[Math.floor(Math.random() * normalPool.length)];
      } else {
          hatchedPokemon = legendPool[Math.floor(Math.random() * legendPool.length)];
      }
      
      window.playEggHatchAnimation(hatchedPokemon.id); 
    }
  } else {
    var currentMon = window.monsterDatabase.find(m => m.id === window.gameState.pokemonId);
    
    if (currentMon && currentMon.evolveLevel && currentLevel >= currentMon.evolveLevel) {
      
      if (document.getElementById("evolution-dialog") || window.isEvolving) return;

      if (Array.isArray(currentMon.evolvesTo) && currentMon.evolvesTo.length > 0) {
          
          // NOVA LÓGICA: Filtra as evoluções para mostrar apenas as que você AINDA NÃO TEM
          let availableEvolutions = currentMon.evolvesTo.filter(id => !window.gameState.unlockedIds.includes(id));

          if (availableEvolutions.length > 0) {
              if (availableEvolutions.length > 1) {
                  window.showEvolutionDialog(availableEvolutions);
              } else if (availableEvolutions.length === 1) {
                  window.startEvolution(window.gameState.pokemonId, availableEvolutions[0]);
              }
          }
      }
    }
  }
};
window.handleInteraction = function() {
  if (!window.isDataLoaded || window.isEvolving) return; 
  
  window.addExperience(1); window.checkProgression(); window.saveData();
  if (window.gameState.isEgg) { 
    window.petVisual.style.transform = `rotate(15deg) scale(${window.baseScale})`; 
    setTimeout(() => window.petVisual.style.transform = `rotate(-15deg) scale(${window.baseScale})`, 50); 
    setTimeout(() => window.petVisual.style.transform = `rotate(0deg) scale(${window.baseScale})`, 100); 
  } else { 
    window.petVisual.style.transform = `translateY(-10px) scale(${window.baseScale + 0.05})`; 
    setTimeout(() => window.petVisual.style.transform = `translateY(0) scale(${window.baseScale})`, 100); 
  }
  
  if (window.tooltip.style.opacity === "1") window.updateUI(); 
  else if (window.gameState.isEgg) {
      var eggImgUrl = chrome.runtime.getURL("assets/Icons/Egg.png");
      window.petVisual.innerHTML = `<img draggable="false" src="${eggImgUrl}" style="width: 100%; height: 100%; object-fit: contain; transform: scaleX(${window.currentScaleX});">`; 
  }
  else window.updateUI();
};

// ==========================================
// EMOJIS E INTERAÇÕES
// ==========================================
window.keyBuffer = "";
window.reactionTimeout = null;

window.showReaction = function(emoji, jump = false) {
  if (!window.dopamineMode) return; 

  window.reactionBalloon.innerText = emoji;
  window.reactionBalloon.style.opacity = "1";
  window.reactionBalloon.style.transform = "translateY(-15px) scale(1.2)";
  
  if (jump && !window.gameState.isEgg && !window.isEvolving) {
    window.petVisual.style.transform = `translateY(-20px) scale(${window.baseScale + 0.1})`;
    setTimeout(() => { window.petVisual.style.transform = `translateY(0) scale(${window.baseScale})`; }, 200);
  }

  if (window.reactionTimeout) clearTimeout(window.reactionTimeout);
  window.reactionTimeout = setTimeout(() => { 
    window.reactionBalloon.style.opacity = "0"; 
    window.reactionBalloon.style.transform = "translateY(0) scale(1)"; 
  }, 2000);
};

document.addEventListener("click", () => { 
  if (window.hasDragged || !window.isDataLoaded) return; 
  window.handleInteraction(); 
});

window.lastScrollTime = 0;
window.handleScrollInteraction = function() {
  if (!window.isDataLoaded) return;
  var now = Date.now();
  if (now - window.lastScrollTime > 200) {
    window.lastScrollTime = now;
    window.handleInteraction();
  }
};
window.addEventListener("scroll", window.handleScrollInteraction, { passive: true });
document.addEventListener("wheel", window.handleScrollInteraction, { passive: true });

document.addEventListener("keydown", (e) => { 
  if (e.repeat || !window.isDataLoaded) return; 

  var isCapsOn = e.getModifierState("CapsLock");
  var newBaseScale = isCapsOn ? 1.5 : 1;
  if (window.baseScale !== newBaseScale && !window.isEvolving) {
      window.baseScale = newBaseScale;
      window.petVisual.style.transform = `translateY(0) scale(${window.baseScale})`;
  }

  window.handleInteraction(); 
  if (e.key.length === 1) {
    window.keyBuffer += e.key;
    if (window.keyBuffer.length > 2) window.keyBuffer = window.keyBuffer.slice(-2);
  }
  var lowerBuffer = window.keyBuffer.toLowerCase();
  
  if (e.key === "?") window.showReaction("❓");
  else if (e.key === "!") window.showReaction("❗", true); 
  else if (e.key === "AudioVolumeUp" || e.key === "VolumeUp") window.showReaction("🔊", true);
  else if (e.key === "AudioVolumeDown" || e.key === "VolumeDown") window.showReaction("🔈", true);
  else if (e.key === "AudioVolumeMute" || e.key === "VolumeMute") window.showReaction("🔇", true);
  else if (lowerBuffer === "<3") window.showReaction("❤️");
  else if (lowerBuffer === ":)") window.showReaction("😊");
  else if (lowerBuffer === ":(") window.showReaction("😢");
  else if (lowerBuffer === ":d") window.showReaction("😄");
  else if (lowerBuffer === ":p") window.showReaction("😝");
  else if (lowerBuffer === ":o" || lowerBuffer === ":0") window.showReaction("😲");
  else if (lowerBuffer === "zz") window.showReaction("💤");
  else if (lowerBuffer === "xd") window.showReaction("😆");
});

window.saveData = function() { 
    if (!window.isDataLoaded) return; 
    chrome.storage.local.set({ pokemonGameState: window.gameState }); 
};

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.pokemonGameState) {
    var oldId = window.gameState.pokemonId;
    window.gameState = changes.pokemonGameState.newValue || { isEgg: true, currentXp: 0, pokemonId: null, unlockedIds: [], xpMap: {}, adoptionCount: 0, activeEgg: null };
    
    if (!window.gameState.isEgg && window.gameState.pokemonId && window.gameState.pokemonId !== oldId) {
        if (!window.isSpawnAnimating) {
            window.playPokeballSpawnAnimation(window.gameState.pokemonId);
        }
    } else {
        window.updateUI();
    }
  }
});

window.loadData = function() {
  chrome.storage.local.get(["pokemonGameState"], (result) => {
    if (result.pokemonGameState) window.gameState = result.pokemonGameState;
    
    if (!window.gameState.unlockedIds) window.gameState.unlockedIds = [];
    if (!window.gameState.xpMap) window.gameState.xpMap = {};
    
    window.isDataLoaded = true; 
    
    if (!window.gameState.isEgg && window.gameState.pokemonId) {
        setTimeout(() => {
            if (!window.isSpawnAnimating) {
                window.playPokeballSpawnAnimation(window.gameState.pokemonId);
            }
        }, 300); 
    } else {
        window.updateUI();
    }
  });
};

window.loadData();

setTimeout(() => {
  if (typeof window.ExploreUI !== "undefined") window.ExploreUI.init();
  if (typeof window.ExploreEngine !== "undefined") window.ExploreEngine.init();
}, 500);