// ==========================================
// INTERFACE DE USUÁRIO: EXPLORAÇÃO E INVENTÁRIO
// ==========================================

window.WBM_LANG_UI = {
    pt: {
       journey: "Jornada", bag: "Bolsa", actions: "Ações", regions: "Regiões", eggs: "Ovos",
       source: "Origem", unknown: "Desconhecido", discard: "Descartar",
       evo_title: "Evolução Múltipla! Escolha:", egg_collected: "Ovo coletado!",
       inv_full: "Inventário cheio!", menu: "Menu de Exploração",
       repeat: "Repetir Fase", speed: "Ajustar Velocidade", flee: "Fugir da Exploração",
       rep_on: "∞ Repetição ativada!", rep_off: "Repetição desativada",
       spd: "⚡ Velocidade", fled: "Fugiu da Jornada!", no_enemy: "Sem inimigos aqui.", 
       fainted: "Seu Pokémon desmaiou!", cleared: "concluída!", rep_stage: "Repetindo fase...", 
       advancing: "Avançando para: ", end: "Fim da Jornada!", block_egg: "Ação bloqueada! Cancele a jornada."
    },
    en: {
       journey: "Journey", bag: "Bag", actions: "Actions", regions: "Regions", eggs: "Eggs",
       source: "Source", unknown: "Unknown", discard: "Discard",
       evo_title: "Multiple Evolution! Choose:", egg_collected: "Egg Collected!",
       inv_full: "Inventory Full!", menu: "Exploration Menu",
       repeat: "Repeat Stage", speed: "Adjust Speed", flee: "Flee Exploration",
       rep_on: "∞ Repeat Enabled!", rep_off: "Repeat Disabled",
       spd: "⚡ Speed", fled: "Fled the Journey!", no_enemy: "No Enemies Here.", 
       fainted: "Your Pokémon Fainted!", cleared: "Cleared!", rep_stage: "Repeating Stage...", 
       advancing: "Advancing to: ", end: "End of Journey!", block_egg: "Action Blocked! Cancel the Journey."
    }
};

window.globalAppLang = 'pt';
window.t_ui = function(key) { return window.WBM_LANG_UI[window.globalAppLang][key] || key; };

window.ExploreUI = {
    isInitialized: false,
    menuElement: null,
    inventoryElement: null,
    runButtonsContainer: null,
    selectedEggs: [],

    init: function () {
        if(this.isInitialized) return;
        this.isInitialized = true;
        this.injectGlobalStyles();
        
        chrome.storage.local.get(["darkMode", "glassLevel", "lateralidade", "idioma"], (result) => {
            if (result.idioma) window.globalAppLang = result.idioma;
            this.createMenu();
            
            var petNode = document.getElementById("meu-pet-flutuante");
            if (petNode) {
                if (result.darkMode) petNode.classList.add("dark-mode");
                if (result.lateralidade === 'canhoto') petNode.classList.add("canhoto");
            }
            
            let val = result.glassLevel !== undefined ? result.glassLevel : 0;
            let opacity = 1 - (val / 100 * 0.35); 
            let blur = (val / 100 * 4) + 'px';
            document.documentElement.style.setProperty('--wbm-glass-opacity', opacity);
            document.documentElement.style.setProperty('--wbm-glass-blur', blur);
            
            if(window.ExploreUI) window.ExploreUI.updateRunButtons();
        });

        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local') {
                var petNode = document.getElementById("meu-pet-flutuante");
                
                if (changes.exploreRunState) {
                    if (window.ExploreEngine && changes.exploreRunState.newValue) {
                        window.ExploreEngine.state = changes.exploreRunState.newValue;
                    }
                    if (document.getElementById("eggs-grid")) {
                        this.renderInventory();
                    }
                }

                if (changes.idioma) {
                    window.globalAppLang = changes.idioma.newValue;
                    if (this.menuElement.style.display !== "none" && !document.getElementById("eggs-grid")) this.renderMainMenu();
                    if (document.getElementById("eggs-grid")) this.renderInventory();
                    window.ExploreUI.updateRunButtons();
                }

                if (changes.darkMode !== undefined) {
                    var isDark = changes.darkMode.newValue;
                    if (petNode) {
                        if (isDark) petNode.classList.add("dark-mode");
                        else petNode.classList.remove("dark-mode");
                    }
                    document.querySelectorAll(".wbm-hp-bar").forEach(el => {
                        if (isDark) el.classList.add("dark-mode");
                        else el.classList.remove("dark-mode");
                    });
                    window.ExploreUI.updateRunButtons();
                }

                if (changes.lateralidade !== undefined) {
                    if (petNode) {
                        if (changes.lateralidade.newValue === 'canhoto') petNode.classList.add("canhoto");
                        else petNode.classList.remove("canhoto");
                    }
                }

                if (changes.glassLevel !== undefined) {
                    let val = changes.glassLevel.newValue;
                    let opacity = 1 - (val / 100 * 0.35);
                    let blur = (val / 100 * 4) + 'px';
                    document.documentElement.style.setProperty('--wbm-glass-opacity', opacity);
                    document.documentElement.style.setProperty('--wbm-glass-blur', blur);
                }
            }
        });
    },

    injectGlobalStyles: function() {
        var style = document.createElement("style");
        style.innerHTML = `
            :root { --wbm-glass-opacity: 1; --wbm-glass-blur: 0px; }
            #explore-menu-box, #explore-menu-box * { box-sizing: border-box !important; margin: 0; }
            .pet-btn-hover:hover { filter: brightness(0.9); transform: scale(1.05); }
            .pet-btn-hover:active { transform: scale(0.95); }
            .select-radial { transition: all 0.2s ease; }
            .select-radial:hover { transform: scale(1.2); }

            .wbm-hp-bar, .wbm-floating-text, .tab-btn, #btn-menu-trigger, 
            #run-buttons-container button, #explore-menu-box, #evolution-dialog, .discard-btn {
                backdrop-filter: blur(var(--wbm-glass-blur)) !important; -webkit-backdrop-filter: blur(var(--wbm-glass-blur)) !important;
            }
            
            #meu-pet-flutuante *::-webkit-scrollbar { width: 6px; height: 6px; }
            #meu-pet-flutuante *::-webkit-scrollbar-track { background: transparent; }
            #meu-pet-flutuante *::-webkit-scrollbar-thumb { background: rgba(85, 85, 85, var(--wbm-glass-opacity)); border-radius: 4px; }
            #meu-pet-flutuante *::-webkit-scrollbar-thumb:hover { background: rgba(51, 51, 51, 1); }
            #meu-pet-flutuante.dark-mode *::-webkit-scrollbar-thumb { background: rgba(255, 174, 60, var(--wbm-glass-opacity)); }
            #meu-pet-flutuante.dark-mode *::-webkit-scrollbar-thumb:hover { background: rgba(230, 156, 53, 1); }
            
            .wbm-hp-bar { background-color: rgba(255, 255, 255, var(--wbm-glass-opacity)) !important; color: #333 !important; border: 1px solid rgba(221, 221, 221, var(--wbm-glass-opacity)) !important; }
            .wbm-hp-bar span { color: #333 !important; }
            .wbm-hp-bar.dark-mode { background-color: rgba(26, 26, 26, var(--wbm-glass-opacity)) !important; color: #ffae3c !important; border: 1px solid rgba(68, 68, 68, var(--wbm-glass-opacity)) !important; }
            .wbm-hp-bar.dark-mode span { color: #ffae3c !important; }

            .wbm-floating-text { background-color: rgba(255, 255, 255, var(--wbm-glass-opacity)) !important; color: #333 !important; border: 1px solid transparent !important; border-radius: 10px; padding: 4px 8px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap; transition: opacity 0.3s ease; }
            #meu-pet-flutuante.dark-mode .wbm-floating-text { background-color: rgba(26, 26, 26, var(--wbm-glass-opacity)) !important; color: #ffae3c !important; border: 1px solid rgba(68, 68, 68, var(--wbm-glass-opacity)) !important; }

            #explore-menu-box, #evolution-dialog { background-color: rgba(244, 244, 244, var(--wbm-glass-opacity)) !important; }
            #meu-pet-flutuante.dark-mode #explore-menu-box, #meu-pet-flutuante.dark-mode #evolution-dialog { background-color: rgba(26, 26, 26, var(--wbm-glass-opacity)) !important; border: 1px solid rgba(68, 68, 68, var(--wbm-glass-opacity)) !important; }

            #explore-menu-box strong, #explore-menu-box div, .evo-title, .wbm-back-btn { color: #333 !important; }
            #meu-pet-flutuante.dark-mode #explore-menu-box strong, #meu-pet-flutuante.dark-mode #explore-menu-box div, #meu-pet-flutuante.dark-mode .evo-title, #meu-pet-flutuante.dark-mode .wbm-back-btn { color: #ffae3c !important; }

            .tab-btn, #btn-menu-trigger { background-color: rgba(224, 224, 224, var(--wbm-glass-opacity)) !important; color: #333 !important; }
            #meu-pet-flutuante.dark-mode .tab-btn:not(.btn-unlocked):not(.btn-current):not(.btn-locked), #meu-pet-flutuante.dark-mode #btn-menu-trigger { background-color: rgba(51, 51, 51, var(--wbm-glass-opacity)) !important; color: #ffae3c !important; }
            #meu-pet-flutuante.dark-mode .tab-btn:not(.btn-unlocked):not(.btn-current):not(.btn-locked):hover { background-color: rgba(68, 68, 68, var(--wbm-glass-opacity)) !important; }

            .btn-unlocked { background-color: rgba(76, 175, 80, var(--wbm-glass-opacity)) !important; color: white !important; border: none !important; }
            .btn-current { background-color: rgba(255, 193, 7, var(--wbm-glass-opacity)) !important; color: #333 !important; border: none !important; }
            .btn-locked { background-color: rgba(224, 224, 224, var(--wbm-glass-opacity)) !important; color: #555 !important; cursor: not-allowed !important; border: none !important; }
            #meu-pet-flutuante.dark-mode .btn-unlocked { background-color: rgba(76, 175, 80, var(--wbm-glass-opacity)) !important; color: white !important; }
            #meu-pet-flutuante.dark-mode .btn-current { background-color: rgba(255, 193, 7, var(--wbm-glass-opacity)) !important; color: #333 !important; }
            #meu-pet-flutuante.dark-mode .btn-locked { background-color: rgba(68, 68, 68, var(--wbm-glass-opacity)) !important; color: #888888 !important; }
            
            #eggs-grid div { background: rgba(224, 224, 224, var(--wbm-glass-opacity)) !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important; }
            #eggs-grid div[style*="background: white"] { background: rgba(255, 255, 255, var(--wbm-glass-opacity)) !important; }
            #meu-pet-flutuante.dark-mode #eggs-grid div { background: rgba(51, 51, 51, var(--wbm-glass-opacity)) !important; box-shadow: inset 0 0 0 1px #555 !important; }
            #meu-pet-flutuante.dark-mode #eggs-grid div[style*="background: white"] { background: rgba(68, 68, 68, var(--wbm-glass-opacity)) !important; }
            
            .discard-btn { background-color: rgba(255, 77, 77, var(--wbm-glass-opacity)) !important; color: white !important; }
            #meu-pet-flutuante.dark-mode .discard-btn { background-color: rgba(26, 26, 26, var(--wbm-glass-opacity)) !important; color: #ff4d4d !important; border: 1px solid #444 !important; }
            
            #run-buttons-container button:not(.btn-active-state):not(#btn-close) { background-color: rgba(0, 0, 0, var(--wbm-glass-opacity)) !important; color: white !important; }
            #meu-pet-flutuante.dark-mode #run-buttons-container button:not(.btn-active-state):not(#btn-close) { background-color: rgba(0, 0, 0, var(--wbm-glass-opacity)) !important; color: #ffae3c !important; border: 1px solid rgba(68, 68, 68, var(--wbm-glass-opacity)) !important; }

            .btn-inf-active-light { background-color: rgba(61, 137, 64, var(--wbm-glass-opacity)) !important; color: white !important; border: none !important; } 
            .btn-speed-active-light { background-color: rgba(33, 150, 243, var(--wbm-glass-opacity)) !important; color: white !important; border: none !important; }
            #meu-pet-flutuante.dark-mode .btn-inf-active-dark { background-color: rgba(76, 175, 80, var(--wbm-glass-opacity)) !important; color: white !important; border: none !important; }
            #meu-pet-flutuante.dark-mode .btn-speed-active-dark { background-color: rgba(33, 150, 243, var(--wbm-glass-opacity)) !important; color: white !important; border: none !important; }
            
            #run-buttons-container button#btn-close { background-color: rgba(255, 77, 77, var(--wbm-glass-opacity)) !important; color: white !important; border: none !important; }
            #meu-pet-flutuante.dark-mode #run-buttons-container button#btn-close { background-color: rgba(255, 77, 77, var(--wbm-glass-opacity)) !important; color: white !important; border: none !important; }

            #meu-pet-flutuante.dark-mode #evolution-dialog div { background: rgba(51, 51, 51, var(--wbm-glass-opacity)) !important; border-color: rgba(85, 85, 85, var(--wbm-glass-opacity)) !important; }
            #meu-pet-flutuante.dark-mode #floating-egg-icon { filter: drop-shadow(0 4px 4px rgba(255, 174, 60, 0.4)) !important; }

            #meu-pet-flutuante.canhoto #btn-menu-trigger, #meu-pet-flutuante.canhoto #run-buttons-container, #meu-pet-flutuante.canhoto #explore-menu-box { right: auto !important; left: -15px !important; }
        `;
        document.head.appendChild(style);
    },

    createMenu: function () {
        var triggerBtn = document.createElement("button");
        triggerBtn.innerHTML = "☰";
        triggerBtn.id = "btn-menu-trigger";
        triggerBtn.className = "pet-btn-hover";
        triggerBtn.title = window.t_ui("menu");

        triggerBtn.style.cssText = `position: absolute; top: -15px; right: -15px; width: 30px; height: 30px; border: none; border-radius: 50%; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index: 100001; font-weight: bold; transition: all 0.2s;`;
        triggerBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); this.toggleMenu(); });

        this.createRunButtons();

        this.menuElement = document.createElement("div");
        this.menuElement.id = "explore-menu-box";
        this.menuElement.style.cssText = `position: absolute; bottom: 100px; right: -15px; width: 195px; border-radius: 8px; padding: 10px; font-family: Arial, sans-serif; font-size: 13px; display: none; flex-direction: column; gap: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 100000;`;

        var injectMenu = () => {
            var petNode = document.getElementById("meu-pet-flutuante");
            if (!petNode) return;
            if (!document.getElementById("btn-menu-trigger")) petNode.appendChild(triggerBtn);
            if (!document.getElementById("run-buttons-container")) { petNode.appendChild(this.runButtonsContainer); this.updateRunButtons(); }
            if (!document.getElementById("explore-menu-box")) petNode.appendChild(this.menuElement);
        };

        injectMenu();
        if (document.body) {
            var observer = new MutationObserver(injectMenu);
            observer.observe(document.body, { childList: true, subtree: true });
        }
    },

    createRunButtons: function () {
        this.runButtonsContainer = document.createElement("div");
        this.runButtonsContainer.id = "run-buttons-container";
        this.runButtonsContainer.style.cssText = `position: absolute; top: 20px; right: -15px; display: none; flex-direction: column; gap: 5px; z-index: 100001;`;

        var btnStyle = `width: 30px; height: 30px; border: none; border-radius: 50%; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-weight: bold; transition: all 0.2s;`;

        var infBtn = document.createElement("button");
        infBtn.innerHTML = "∞"; infBtn.id = "btn-inf"; infBtn.className = "pet-btn-hover";
        infBtn.style.cssText = btnStyle + "font-size: 18px;"; infBtn.title = window.t_ui("repeat");
        infBtn.onclick = (e) => { e.stopPropagation(); window.ExploreEngine.toggleRepeatMode(); };

        var speedBtn = document.createElement("button");
        speedBtn.innerHTML = "1X"; speedBtn.id = "btn-speed"; speedBtn.className = "pet-btn-hover";
        speedBtn.style.cssText = btnStyle + "font-size: 11px;"; speedBtn.title = window.t_ui("speed");
        speedBtn.onclick = (e) => { e.stopPropagation(); window.ExploreEngine.toggleSpeedMode(); };

        var closeBtn = document.createElement("button");
        closeBtn.innerHTML = "✖"; closeBtn.id = "btn-close"; closeBtn.className = "pet-btn-hover";
        closeBtn.style.cssText = btnStyle + "font-size: 12px;"; closeBtn.title = window.t_ui("flee");
        closeBtn.onclick = (e) => { e.stopPropagation(); window.ExploreEngine.cancelRun(); };

        this.runButtonsContainer.appendChild(infBtn);
        this.runButtonsContainer.appendChild(speedBtn);
        this.runButtonsContainer.appendChild(closeBtn);
    },

    updateRunButtons: function () {
        if (!this.runButtonsContainer || !window.ExploreEngine) return;

        var isVisible = window.ExploreEngine.isRunning;
        this.runButtonsContainer.style.display = isVisible ? "flex" : "none";

        var petNode = document.getElementById("meu-pet-flutuante");
        var isDark = petNode && petNode.classList.contains("dark-mode");

        var infBtn = document.getElementById("btn-inf");
        if (infBtn) {
            infBtn.title = window.t_ui("repeat");
            infBtn.classList.remove("btn-active-state", "btn-inf-active-light", "btn-inf-active-dark");
            if (window.ExploreEngine.isRepeatMode) {
                infBtn.classList.add("btn-active-state");
                if (isDark) infBtn.classList.add("btn-inf-active-dark");
                else infBtn.classList.add("btn-inf-active-light");
            }
        }

        var speedBtn = document.getElementById("btn-speed");
        if (speedBtn) {
            speedBtn.title = window.t_ui("speed");
            var mult = window.ExploreEngine.speedMultiplier || 1;
            speedBtn.innerHTML = mult + "X";
            
            speedBtn.classList.remove("btn-active-state", "btn-speed-active-light", "btn-speed-active-dark");
            if (mult > 1) {
                speedBtn.classList.add("btn-active-state");
                if (isDark) speedBtn.classList.add("btn-speed-active-dark");
                else speedBtn.classList.add("btn-speed-active-light");
            }
        }
        
        var triggerBtn = document.getElementById("btn-menu-trigger");
        if(triggerBtn) triggerBtn.title = window.t_ui("menu");
        var closeBtn = document.getElementById("btn-close");
        if(closeBtn) closeBtn.title = window.t_ui("flee");
    },

    renderMainMenu: function () {
        this.menuElement.innerHTML = `<div style="text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 5px;">${window.t_ui("actions")}</div>`;
        
        var btnExplore = document.createElement("button");
        btnExplore.innerText = window.t_ui("journey");
        this.applyTabBtnStyle(btnExplore);
        btnExplore.addEventListener("click", (e) => { e.stopPropagation(); this.renderRegionMenu(); });

        var btnInventory = document.createElement("button");
        btnInventory.innerText = window.t_ui("bag");
        this.applyTabBtnStyle(btnInventory);
        btnInventory.addEventListener("click", (e) => { e.stopPropagation(); this.renderInventory(); });

        this.menuElement.appendChild(btnExplore);
        this.menuElement.appendChild(btnInventory);
    },

    renderRegionMenu: function () {
        this.menuElement.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"><strong>${window.t_ui("regions")}</strong><button id="back-to-main" class="wbm-back-btn" style="border: none; background: none; cursor: pointer; font-size: 16px;">←</button></div><div id="region-list" style="display: flex; flex-direction: column; gap: 5px; max-height: 250px; overflow-y: auto; padding-right: 5px;"></div>`;
        document.getElementById("back-to-main").onclick = (e) => { e.stopPropagation(); this.renderMainMenu(); };

        var list = document.getElementById("region-list");
        window.gameDatabase.regions.forEach((region, index) => {
            var firstCityOrder = region.cities[0].order;
            var btn = document.createElement("button");
            btn.innerText = region.name;
            this.applyTabBtnStyle(btn);

            if (firstCityOrder <= window.ExploreEngine.state.maxCityOrderCleared + 1) {
                btn.classList.add("btn-unlocked");
                btn.onclick = (e) => { e.stopPropagation(); this.renderCityMenu(index); };
            } else {
                btn.classList.add("btn-locked");
                btn.disabled = true;
            }
            list.appendChild(btn);
        });
    },

    renderCityMenu: function (regionIndex) {
        var region = window.gameDatabase.regions[regionIndex];
        this.menuElement.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"><strong style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${region.name}</strong><button id="back-to-regions" class="wbm-back-btn" style="border: none; background: none; cursor: pointer; font-size: 16px;">←</button></div><div id="city-list" style="display: flex; flex-direction: column; gap: 5px; max-height: 250px; overflow-y: auto; padding-right: 5px;"></div>`;
        document.getElementById("back-to-regions").onclick = (e) => { e.stopPropagation(); this.renderRegionMenu(); };

        var list = document.getElementById("city-list");
        region.cities.forEach((city) => {
            var btn = document.createElement("button");
            btn.innerText = `${city.order}. ${city.name}`;
            this.applyTabBtnStyle(btn);

            if (city.order <= window.ExploreEngine.state.maxCityOrderCleared) {
                btn.classList.add("btn-unlocked");
            } else if (city.order === window.ExploreEngine.state.maxCityOrderCleared + 1) {
                btn.classList.add("btn-current");
            } else {
                btn.classList.add("btn-locked");
                btn.disabled = true;
            }

            if (city.order <= window.ExploreEngine.state.maxCityOrderCleared + 1) {
                btn.onclick = (e) => { e.stopPropagation(); this.menuElement.style.display = "none"; window.ExploreEngine.startRun(city.order); };
            }
            list.appendChild(btn);
        });
    },

    renderInventory: function () {
        var eggs = window.ExploreEngine.state.inventoryEggs || [];
        var totalEggs = eggs.length;
        
        this.selectedEggs = (this.selectedEggs || []).filter(idx => idx < totalEggs);
        
        this.menuElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong>${window.t_ui("eggs")} (${totalEggs}/40)</strong>
                <button id="back-to-main" class="wbm-back-btn" style="border: none; background: none; cursor: pointer; font-size: 16px;">←</button>
            </div>
            <div id="eggs-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; max-height: 210px; overflow-y: auto; overflow-x: hidden; padding-right: 5px; margin-top: 10px;"></div>
        `;
        document.getElementById("back-to-main").onclick = (e) => { e.stopPropagation(); this.selectedEggs = []; this.renderMainMenu(); };

        var grid = document.getElementById("eggs-grid");

        for (let i = 0; i < 40; i++) {
            var slot = document.createElement("div");
            var isSelected = this.selectedEggs.includes(i);
            
            slot.className = eggs[i] ? "egg-filled" : "egg-empty";
            var borderStyle = isSelected ? "border: 2px solid #ef4444;" : "border: 2px solid transparent;";
            
            slot.style.cssText = `position: relative; width: 35px; height: 35px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: ${eggs[i] ? "pointer" : "default"}; transition: transform 0.1s; box-sizing: border-box; ${borderStyle}`;
            
            if (eggs[i]) slot.style.background = "rgba(255, 255, 255, var(--wbm-glass-opacity))";
            else slot.style.background = "rgba(224, 224, 224, var(--wbm-glass-opacity))";

            if (eggs[i]) {
                var eggImgUrl = chrome.runtime.getURL("assets/Icons/Egg.png");
                slot.title = `${window.t_ui("source")}: ${eggs[i].source || window.t_ui("unknown")}`;
                
                var radialBg = isSelected ? "#ef4444" : "rgba(0,0,0,0.3)";
                var checkMark = isSelected ? "✓" : "";

                slot.innerHTML = `
                    <img src="${eggImgUrl}" style="width: 28px; height: 28px; pointer-events: none; object-fit: contain; opacity: ${isSelected ? 0.7 : 1};">
                    <div class="select-radial" data-index="${i}" style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; border-radius: 50%; border: 1px solid #fff; background: ${radialBg}; box-shadow: 0 1px 2px rgba(0,0,0,0.5); z-index: 10; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px; font-weight: bold;">${checkMark}</div>
                `;
                
                slot.onmouseenter = () => { slot.style.transform = "scale(1.1)"; };
                slot.onmouseleave = () => { slot.style.transform = "scale(1)"; };
                
                slot.onclick = (e) => {
                    e.stopPropagation();
                    var clickedRadial = e.target.closest('.select-radial');
                    if (clickedRadial || this.selectedEggs.length > 0) {
                        if (this.selectedEggs.includes(i)) this.selectedEggs = this.selectedEggs.filter(idx => idx !== i);
                        else this.selectedEggs.push(i);
                        this.renderInventory();
                    } else {
                        window.ExploreEngine.equipEgg(i);
                        this.renderInventory();
                    }
                };
            }
            grid.appendChild(slot);
        }

        if (this.selectedEggs.length > 0) {
            var actionContainer = document.createElement("div");
            actionContainer.style.cssText = "margin-top: 10px; display: flex; justify-content: center;";
            
            var delBtn = document.createElement("button");
            delBtn.className = "discard-btn pet-btn-hover";
            delBtn.style.cssText = "width: 100%; padding: 8px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center;";
            delBtn.innerText = `${window.t_ui("discard")} (${this.selectedEggs.length})`;
            
            delBtn.onclick = (e) => {
                e.stopPropagation();
                var sortedIndices = [...this.selectedEggs].sort((a,b) => b - a);
                sortedIndices.forEach(idx => window.ExploreEngine.state.inventoryEggs.splice(idx, 1));
                window.ExploreEngine.saveState();
                this.selectedEggs = [];
                this.renderInventory();
            };
            actionContainer.appendChild(delBtn);
            this.menuElement.appendChild(actionContainer);
        }
    },

    toggleMenu: function () {
        if (this.menuElement.style.display === "none") {
            this.selectedEggs = []; 
            this.renderMainMenu();
            this.menuElement.style.display = "flex";
        } else {
            this.menuElement.style.display = "none";
        }
    },

    applyTabBtnStyle: function (btn) {
        btn.className = "tab-btn";
        btn.style.cssText = `width: 100%; padding: 6px 10px; border: none; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: bold; transition: background 0.2s; text-align: center;`;
        btn.onmouseenter = () => { if (btn.style.cursor !== "not-allowed") btn.style.filter = "brightness(0.9)"; };
        btn.onmouseleave = () => { btn.style.filter = "none"; };
    },

    showFloatingText: function (text) {
        var petNode = document.getElementById("meu-pet-flutuante");
        if (!petNode) return;
        var walkingNode = document.getElementById("pet-walking-container") || petNode;
        
        var notifContainer = document.getElementById("wbm-notification-container");
        if (!notifContainer) {
            notifContainer = document.createElement("div");
            notifContainer.id = "wbm-notification-container";
            notifContainer.style.cssText = "position: absolute; top: 100px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; gap: 5px; align-items: center; z-index: 100002; pointer-events: none; width: max-content;";
            walkingNode.appendChild(notifContainer);
        }

        var el = document.createElement("div");
        el.className = "wbm-floating-text";
        el.innerText = text;
        notifContainer.appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2500);
    },

    showEggIcon: function (eggData) {
        var walkingNode = document.getElementById("pet-walking-container");
        if (!walkingNode) return;
        if (document.getElementById("floating-egg-icon")) return;

        if (!document.getElementById("egg-anim-style")) {
            var style = document.createElement("style");
            style.id = "egg-anim-style";
            style.innerHTML = `@keyframes jump { from { transform: translateX(-50%) translateY(0); } to { transform: translateX(-50%) translateY(-10px); } }`;
            document.head.appendChild(style);
        }

        var eggImgUrl = chrome.runtime.getURL("assets/Icons/Egg.png");
        var icon = document.createElement("div");
        icon.id = "floating-egg-icon"; 
        icon.innerHTML = `<img src="${eggImgUrl}" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;">`;
        icon.style.cssText = `position: absolute; top: -65px; left: 50%; transform: translateX(-50%); width: 32px; height: 32px; cursor: pointer; z-index: 100003; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.3)); animation: jump 0.5s infinite alternate;`;
        
        icon.onclick = (e) => {
            e.stopPropagation();
            if (window.ExploreEngine.state.inventoryEggs.length < 40) {
                window.ExploreEngine.state.inventoryEggs.push(eggData);
                window.ExploreEngine.saveState();
                this.showFloatingText(window.t_ui("egg_collected"));
            } else {
                this.showFloatingText(window.t_ui("inv_full"));
            }
            icon.remove();
        };
        walkingNode.appendChild(icon);
    },

    createHPBar: function (id, name, level, isPlayer) {
        var isDark = false;
        var petNode = document.getElementById("meu-pet-flutuante");
        if (petNode && petNode.classList.contains("dark-mode")) isDark = true;

        var bar = document.createElement("div");
        bar.id = id;
        bar.className = "wbm-hp-bar" + (isDark ? " dark-mode" : "");
        bar.style.cssText = `position: absolute; ${isPlayer ? "top: -40px;" : "top: -25px;"} left: 50%; transform: translateX(-50%); min-width: 80px; width: max-content; font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; border-radius: 4px; padding: 4px 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); pointer-events: none; z-index: 10000;`;

        bar.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; gap: 12px;"><span class="hp-name" style="white-space: nowrap; text-align: left;">${name}</span><span class="hp-level" style="white-space: nowrap; flex-shrink: 0; font-size: 9px;">Lv.${level}</span></div><div style="width: 100%; height: 4px; background: rgba(224, 224, 224, var(--wbm-glass-opacity)); border-radius: 2px; overflow: hidden; backdrop-filter: blur(var(--wbm-glass-blur)); -webkit-backdrop-filter: blur(var(--wbm-glass-blur));"><div class="hp-fill" style="width: 100%; height: 100%; background: #4CAF50; transition: width 0.2s;"></div></div>`;
        return bar;
    },

    updateHPBar: function (id, current, max, newLevel, newName) {
        var el = document.getElementById(id);
        if (!el) return;

        var pct = Math.max(0, (current / max) * 100);
        var fill = el.querySelector(".hp-fill");
        if (fill) {
            fill.style.width = `${pct}%`;
            if (pct <= 20) fill.style.background = "#ff4d4d";
            else if (pct <= 50) fill.style.background = "#FFC107";
            else fill.style.background = "#4CAF50";
        }

        if (newLevel !== undefined) {
            var lvlEl = el.querySelector(".hp-level");
            if (lvlEl && lvlEl.innerText !== `Lv.${newLevel}`) lvlEl.innerText = `Lv.${newLevel}`;
        }
        if (newName !== undefined) {
            var nameEl = el.querySelector(".hp-name");
            if (nameEl && nameEl.innerText !== newName) nameEl.innerText = newName;
        }
    },

    removeElement: function (id) {
        var el = document.getElementById(id);
        if (el) el.remove();
    },

    // NOVO: Função minimalista para renderizar a janela de escolhas de evolução
    abrirJanelaDeEscolhaDeEvolucao: function(evoArray) {
        var petNode = document.getElementById("meu-pet-flutuante");
        if (!petNode) return;

        // Busca a lista de Pokémon que o jogador já tem
        let unlockedIds = window.ExploreEngine && typeof window.ExploreEngine.getUnlockedIdsArray === 'function' 
            ? window.ExploreEngine.getUnlockedIdsArray() 
            : [];

        // Filtra APENAS as evoluções que faltam
        let missingEvos = evoArray.filter(evoIdString => !unlockedIds.includes(parseInt(evoIdString, 10)));
        
        // Se não houver evolução faltando, retoma o jogo 
        if (missingEvos.length === 0) {
            if (window.ExploreEngine) {
                window.ExploreEngine.isRunning = true;
                window.ExploreEngine.spawnEnemy();
            }
            return;
        }

// ... (código anterior da função) ...

        var modal = document.createElement("div");
        modal.id = "evolution-dialog";
        
        // Ajuste o "top: 35%" aqui para a altura desejada:
        modal.style.cssText = `position: absolute; top: -80%; left: 50%; transform: translate(-50%, -50%); width: max-content; background: rgba(244, 244, 244, var(--wbm-glass-opacity)); backdrop-filter: blur(var(--wbm-glass-blur)); border-radius: 30px; border: 1px solid #ccc; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 100005; display: flex; flex-direction: row; gap: 8px; padding: 6px 36px 6px 6px; align-items: center; flex-wrap: nowrap;`;
        
        var isDark = petNode.classList.contains("dark-mode");
        if (isDark) {
            modal.style.background = `rgba(26, 26, 26, var(--wbm-glass-opacity))`;
            modal.style.borderColor = `#555`;
        }

        // Botão de fechar integrado na direita
        var closeBtn = document.createElement("button");
        closeBtn.innerHTML = "✖";
        closeBtn.title = window.globalAppLang === 'pt' ? "Não evoluir agora" : "Cancel";
        closeBtn.className = "pet-btn-hover";
        closeBtn.style.cssText = `position: absolute; right: 12px; background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 100%; top: 0;`;
        
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            modal.remove();
            if (window.ExploreEngine) {
                window.ExploreEngine.isRunning = true; 
                if (window.ExploreUI) window.ExploreUI.updateRunButtons(); 
                window.ExploreEngine.spawnEnemy(); 
            }
        };
        
        modal.appendChild(closeBtn);

        missingEvos.forEach(evoIdString => {
            let numId = parseInt(evoIdString, 10);
            let pokeDb = window.pokemonDB ? window.pokemonDB.find(p => parseInt(p["#"], 10) === numId) : null;
            if (!pokeDb) return;

            var btn = document.createElement("button");
            btn.title = pokeDb.Name;
            btn.className = "pet-btn-hover";
            
            // Botão redondo perfeito para os ícones
            btn.style.cssText = `display: flex; align-items: center; justify-content: center; background: ${isDark ? 'rgba(51,51,51,0.8)' : 'rgba(224,224,224,0.8)'}; border: 1px solid ${isDark ? '#444' : '#ccc'}; border-radius: 50%; padding: 6px; cursor: pointer; transition: all 0.2s; width: 44px; height: 44px; flex-shrink: 0;`;
            
            btn.onclick = (e) => {
                e.stopPropagation();
                modal.remove();
                if (window.ExploreEngine) window.ExploreEngine.evoluirDiretoPara(evoIdString);
            };
            
            var img = document.createElement("img");
            img.src = typeof window.getPokemonImagePath === "function" ? window.getPokemonImagePath(numId, pokeDb.Name) : chrome.runtime.getURL(`assets/Pokemon/${numId}.png`);
            img.style.cssText = `width: 32px; height: 32px; object-fit: contain; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3)); image-rendering: pixelated; pointer-events: none;`;
            
            btn.appendChild(img);
            modal.appendChild(btn);
        });

        petNode.appendChild(modal);
    }
};