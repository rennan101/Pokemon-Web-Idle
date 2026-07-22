import { I18N } from './constants.js';
import { StorageManager } from './storage.js';
import { RenderManager } from './render.js';

let currentGameState = { unlockedIds: [], xpMap: {}, evMap: {}, movesMap: {}, favorites: [], adoptionCount: 0 };
let currentLang = 'pt';
let isSettingsOpen = false;
let isEquipLocked = false;
let searchTimeout = null;

function t(key) { return I18N[currentLang][key] || key; }

document.addEventListener('DOMContentLoaded', () => {
  RenderManager.init(t, currentGameState, currentLang);

  const grid = document.getElementById('grid');
  const resetBtn = document.getElementById('reset-btn');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const searchInput = document.getElementById('search-input');
  
  const darkModeBtn = document.getElementById('dark-mode-btn');
  const toggleIcon = document.getElementById('toggle-icon');
  const settingsBtn = document.getElementById('settings-btn');
  
  const pokedexView = document.getElementById('pokedex-view');
  const settingsView = document.getElementById('settings-view');
  const detailView = document.getElementById('pokemon-detail-view');
  const pageTitle = document.getElementById('page-title');
  const appWrapper = document.getElementById('app-wrapper');

  function updateAllTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[currentLang][key]) el.innerHTML = I18N[currentLang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (I18N[currentLang][key]) el.placeholder = I18N[currentLang][key];
    });
    document.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
        const key = el.getAttribute('data-i18n-tooltip');
        if (I18N[currentLang][key]) el.setAttribute('data-tooltip-text', I18N[currentLang][key]);
    });
    updateResetButton(currentGameState);
    if (pageTitle) pageTitle.innerText = isSettingsOpen ? t("settings") : t("pokedex");
  }

  function applyGlassEffect(val) {
    const opacity = 1 - (val / 100 * 0.35);
    const blur = (val / 100 * 4) + 'px';
    document.documentElement.style.setProperty('--glass-opacity', opacity);
    document.documentElement.style.setProperty('--glass-blur', blur);
    const glassSlider = document.getElementById('glass-slider');
    if (glassSlider) glassSlider.style.setProperty('--slider-pct', val + '%');
  }

  function updateLatUI(val) {
    const latText = document.getElementById('lat-text');
    const latLeftBtn = document.getElementById('lat-left-btn');
    const latRightBtn = document.getElementById('lat-right-btn');
    if(!latText || !latLeftBtn || !latRightBtn) return;
    
    latText.innerText = val === 'destro' ? t("right") : t("left");
    latLeftBtn.classList.remove('inactive');
    latRightBtn.classList.remove('inactive');
    if (val === 'canhoto') latLeftBtn.classList.add('inactive');
    else if (val === 'destro') latRightBtn.classList.add('inactive');
  }

  function updateLangUI(val) {
    const langText = document.getElementById('lang-text');
    const langLeftBtn = document.getElementById('lang-left-btn');
    const langRightBtn = document.getElementById('lang-right-btn');
    if(!langText || !langLeftBtn || !langRightBtn) return;

    langText.innerText = val === 'pt' ? t("lang_pt") : t("lang_en");
    langLeftBtn.classList.remove('inactive');
    langRightBtn.classList.remove('inactive');
    if (val === 'pt') langLeftBtn.classList.add('inactive');
    else if (val === 'en') langRightBtn.classList.add('inactive');
  }

  function updateResetButton(state) {
    if (!resetBtn) return;
    var count = state.adoptionCount || 0;
    if (count >= 5) {
      resetBtn.disabled = true;
      resetBtn.innerText = t("adopt_limit");
    } else {
      resetBtn.disabled = false;
      resetBtn.innerText = `${t("adopt")} (${count}/5)`;
    }
  }

  function checkAllTabsAndExecute(callback) {
      chrome.tabs.query({}, (tabs) => {
          let isBattlingAnywhere = false;
          let responsesReceived = 0;

          if (!tabs || tabs.length === 0) {
              callback(false);
              return;
          }

          tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { action: "check_if_battling" }, (response) => {
                  responsesReceived++;
                  if (chrome.runtime.lastError) { 
                  } else if (response && response.isRunning) {
                      isBattlingAnywhere = true;
                  }
                  if (responsesReceived === tabs.length) {
                      callback(isBattlingAnywhere);
                  }
              });
          });
      });
  }
 function handleEquip(id, btnElement) {
      if (isEquipLocked) return;
      
      checkAllTabsAndExecute((isBattling) => {
          if (isBattling) { 
              alert(t("blocked_city")); 
              return; 
          }
          
          chrome.storage.local.get(["pokemonGameState", "exploreRunState", "dopamineMode"], (result) => {
              var exploreState = result.exploreRunState || { inventoryEggs: [] };
              var currentState = result.pokemonGameState;
              if (typeof currentState === 'string') try { currentState = JSON.parse(currentState); } catch(err){}
              currentState = currentState || { unlockedIds: [], xpMap: {}, evMap: {}, movesMap: {}, favorites: [], adoptionCount: 0 };

              if (currentState.isEgg && currentState.activeEgg) {
                  if (!exploreState.inventoryEggs) exploreState.inventoryEggs = [];
                  if (exploreState.inventoryEggs.length < 40) {
                      exploreState.inventoryEggs.push(currentState.activeEgg);
                      chrome.storage.local.set({ exploreRunState: exploreState });
                  } else {
                      if (!confirm(t("bag_full"))) return;
                  }
              }

              currentState.pokemonId = id;
              currentState.isEgg = false;
              currentState.activeEgg = null;
              if (!currentState.xpMap) currentState.xpMap = {};
              currentState.currentXp = currentState.xpMap[id] || 0;
              
              let lockTime = result.dopamineMode !== false ? 2200 : 1100;
              isEquipLocked = true;
              
              chrome.storage.local.set({ pokemonGameState: currentState }, () => {
                  btnElement.classList.add('click-pulse');
                  setTimeout(() => btnElement.classList.remove('click-pulse'), 200);
                  setTimeout(() => { isEquipLocked = false; }, lockTime);
              });
          });
      });
  }
  if (grid) {
      grid.addEventListener('click', (e) => {
          const equipBtn = e.target.closest('.equip-btn');
          if (equipBtn) {
              e.stopPropagation();
              handleEquip(parseInt(equipBtn.getAttribute('data-id')), equipBtn);
              return;
          }
          
          const favBtn = e.target.closest('.fav-btn');
          if (favBtn) {
              e.stopPropagation();
              RenderManager.toggleFavorite(parseInt(favBtn.getAttribute('data-id')), favBtn);
              return;
          }
          
          const card = e.target.closest('.unlocked-card');
          if (card) {
              RenderManager.openPokemonDetail(parseInt(card.getAttribute('data-id')));
          }
      });
  }

  if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => RenderManager.applySearchFilter(searchInput.value.toLowerCase().trim()), 200);
      });
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.tab-btn');
      if (!targetBtn) return;
      tabButtons.forEach(btn => btn.classList.remove('active'));
      targetBtn.classList.add('active');
      if (searchInput) searchInput.value = ''; 
      RenderManager.renderGrid(grid, targetBtn.getAttribute('data-gen'));
    });
  });

  const detailTabs = document.querySelectorAll('.det-tab');
  detailTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        detailTabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.det-tab-content').forEach(c => c.style.display = 'none');
        tab.classList.add('active');
        const targetId = tab.getAttribute('data-target');
        if(document.getElementById(targetId)) document.getElementById(targetId).style.display = 'block';
    });
  });

  const subTabs = document.querySelectorAll('.sub-tab');
  subTabs.forEach(tab => {
      tab.addEventListener('click', () => {
          const parent = tab.closest('.det-tab-content');
          if (!parent) return;
          parent.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
          parent.querySelectorAll('.sub-tab-content').forEach(c => c.classList.remove('active'));
          tab.classList.add('active');
          const targetId = tab.getAttribute('data-target');
          if(document.getElementById(targetId)) document.getElementById(targetId).classList.add('active');
      });
  });

    function forceLoadStateAndRender(isInitialLoad = false) {
      chrome.storage.local.get(["pokemonGameState", 'glassLevel', 'dopamineMode', 'lateralidade', 'idioma', 'darkMode', 'activeMode', 'showUI'], (res) => {
        if (isInitialLoad) {
            let initialGlassLevel = res.glassLevel !== undefined ? res.glassLevel : 50; 
            const gs = document.getElementById('glass-slider');
            if (gs) gs.value = initialGlassLevel; 
            applyGlassEffect(initialGlassLevel); 
            
            const dt = document.getElementById('dopamine-toggle');
            if (dt) dt.checked = res.dopamineMode !== undefined ? res.dopamineMode : true;

            const am = document.getElementById('active-mode-toggle');
            if (am) am.checked = res.activeMode !== undefined ? res.activeMode : false;
            
            // NOVO: Lê a preferência Show UI
            const showUiToggle = document.getElementById('show-ui-toggle');
            if (showUiToggle) showUiToggle.checked = res.showUI !== false; 
            
            currentLang = res.idioma || 'pt';
            RenderManager.setLang(currentLang);

            updateAllTexts();
            updateLangUI(currentLang);
            updateLatUI(res.lateralidade || 'destro');
            if (res.darkMode) { document.body.classList.add('dark-mode'); if (toggleIcon) toggleIcon.innerText = '☀️'; } 
            else { if (toggleIcon) toggleIcon.innerText = '🌙'; }
        }

        let state = res.pokemonGameState;
        if (typeof state === 'string') { try { state = JSON.parse(state); } catch(e) {} }
        currentGameState = state || { unlockedIds: [], xpMap: {}, evMap: {}, movesMap: {}, favorites: [], adoptionCount: 0 };
        if (!currentGameState.evMap) currentGameState.evMap = {};
        if (!currentGameState.favorites) currentGameState.favorites = [];
        
        RenderManager.updateGameState(currentGameState);
        updateResetButton(currentGameState);
        
        const activeTab = document.querySelector('.tab-btn.active');
        RenderManager.renderGrid(grid, activeTab ? activeTab.getAttribute('data-gen') : 1);
      });
  }

  forceLoadStateAndRender(true);

  chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.pokemonGameState) {
          let state = changes.pokemonGameState.newValue;
          if (typeof state === 'string') { try { state = JSON.parse(state); } catch(e) {} }
          currentGameState = state || { unlockedIds: [], xpMap: {}, evMap: {}, movesMap: {}, favorites: [], adoptionCount: 0 };
          if (!currentGameState.evMap) currentGameState.evMap = {};
          if (!currentGameState.favorites) currentGameState.favorites = [];
          
          RenderManager.updateGameState(currentGameState);
          updateResetButton(currentGameState);
          
          const activeTab = document.querySelector('.tab-btn.active');
          if (activeTab) RenderManager.renderGrid(grid, activeTab.getAttribute('data-gen'));
      }
  });

  if (darkModeBtn) darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    if (toggleIcon) toggleIcon.innerText = isDark ? '☀️' : '🌙';
    chrome.storage.local.set({ darkMode: isDark });
  });

  const glassSlider = document.getElementById('glass-slider');
  if (glassSlider) glassSlider.addEventListener('input', (e) => {
      applyGlassEffect(e.target.value);
      chrome.storage.local.set({ glassLevel: e.target.value });
  });

  const dopamineToggle = document.getElementById('dopamine-toggle');
  if (dopamineToggle) dopamineToggle.addEventListener('change', (e) => chrome.storage.local.set({ dopamineMode: e.target.checked }));
  
  const activeModeToggle = document.getElementById('active-mode-toggle');
  if (activeModeToggle) activeModeToggle.addEventListener('change', (e) => chrome.storage.local.set({ activeMode: e.target.checked }));

  // NOVO: Evento do Botão Show UI
  const showUiToggle = document.getElementById('show-ui-toggle');
  if (showUiToggle) showUiToggle.addEventListener('change', (e) => chrome.storage.local.set({ showUI: e.target.checked }));

  document.getElementById('lat-left-btn')?.addEventListener('click', () => chrome.storage.local.get(["exploreRunState"], (res) => { res.exploreRunState?.isRunning ? alert(t("blocked_lat")) : (updateLatUI('canhoto'), chrome.storage.local.set({ lateralidade: 'canhoto' })); }));
  document.getElementById('lat-right-btn')?.addEventListener('click', () => chrome.storage.local.get(["exploreRunState"], (res) => { res.exploreRunState?.isRunning ? alert(t("blocked_lat")) : (updateLatUI('destro'), chrome.storage.local.set({ lateralidade: 'destro' })); }));
  
  document.getElementById('lang-left-btn')?.addEventListener('click', () => { 
      currentLang = 'pt'; 
      RenderManager.setLang(currentLang); 
      updateLangUI('pt'); 
      chrome.storage.local.set({ idioma: 'pt' }); 
      updateAllTexts(); 
  });
  document.getElementById('lang-right-btn')?.addEventListener('click', () => { 
      currentLang = 'en'; 
      RenderManager.setLang(currentLang); 
      updateLangUI('en'); 
      chrome.storage.local.set({ idioma: 'en' }); 
      updateAllTexts(); 
  });

  if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        isSettingsOpen = !isSettingsOpen;
        if (isSettingsOpen) {
          if (pokedexView) pokedexView.style.display = 'none'; 
          if (detailView) detailView.style.display = 'none';
          if (settingsView) settingsView.style.display = 'flex';
          if (pageTitle) pageTitle.innerText = t("settings"); 
          StorageManager.updateMemoryStats();
          StorageManager.startFPSMonitor();
        } else {
          if (pokedexView) pokedexView.style.display = 'flex'; 
          if (detailView) detailView.style.display = 'none';
          if (settingsView) settingsView.style.display = 'none';
          if (pageTitle) pageTitle.innerText = t("pokedex");
          StorageManager.stopFPSMonitor();
        }
      });
  }

  const modalOverlay = document.getElementById('confirm-modal');
  const btnDeleteProgress = document.getElementById('btn-delete-progress');
  if (btnDeleteProgress) btnDeleteProgress.addEventListener('click', () => { if(modalOverlay) modalOverlay.style.display = 'flex'; if(appWrapper) appWrapper.style.filter = 'blur(4px)'; });
  document.getElementById('modal-btn-close')?.addEventListener('click', () => { if(modalOverlay) modalOverlay.style.display = 'none'; if(appWrapper) appWrapper.style.filter = 'none'; });
  document.getElementById('modal-btn-nao')?.addEventListener('click', () => { if(modalOverlay) modalOverlay.style.display = 'none'; if(appWrapper) appWrapper.style.filter = 'none'; });
  document.getElementById('modal-btn-sim')?.addEventListener('click', () => chrome.storage.local.clear(() => window.location.reload()));

  document.getElementById('btn-export')?.addEventListener('click', () => StorageManager.exportSave());
  document.getElementById('btn-import')?.addEventListener('click', () => document.getElementById('input-import')?.click());
  document.getElementById('input-import')?.addEventListener('change', (e) => StorageManager.importSave(e.target.files[0], I18N[currentLang].import_success || "Sucesso!", I18N[currentLang].import_error || "Erro!"));
  document.getElementById('btn-back-pokedex')?.addEventListener('click', () => { if (detailView) detailView.style.display = 'none'; if (pokedexView) pokedexView.style.display = 'flex'; });
  
  const detEquipBtn = document.getElementById('det-equip-btn');
  if (detEquipBtn) detEquipBtn.addEventListener('click', (e) => { e.stopPropagation(); handleEquip(RenderManager.currentDetailedPokemonId, detEquipBtn); });

  if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        checkAllTabsAndExecute((isBattling) => {
            if (isBattling) { 
                alert(t("blocked_run")); 
                return; 
            }
            
            chrome.storage.local.get(["pokemonGameState", "exploreRunState"], (result) => {
              var exploreState = result.exploreRunState || { inventoryEggs: [] };
              var state = result.pokemonGameState || { unlockedIds: [], xpMap: {}, evMap: {}, movesMap: {}, favorites: [], adoptionCount: 0 };
              if (typeof state === 'string') try { state = JSON.parse(state); } catch(err){}
              
              if ((state.adoptionCount || 0) < 5) {
                if (!exploreState.inventoryEggs) exploreState.inventoryEggs = [];

                if (state.isEgg) {
                    if (exploreState.inventoryEggs.length >= 40) {
                        alert(currentLang === 'pt' ? "A bolsa de ovos está cheia (40/40). Libere espaço antes de adotar um novo ovo." : "Egg bag is full (40/40). Clear some space before adopting a new egg.");
                        return; 
                    }
                    
                    exploreState.inventoryEggs.push({ isEgg: true, isNew: true });
                    chrome.storage.local.set({ exploreRunState: exploreState });
                    
                    state.adoptionCount = (state.adoptionCount || 0) + 1;
                    chrome.storage.local.set({ pokemonGameState: state }, () => setTimeout(() => window.location.reload(), 600));
                    
                } else {
                    state.adoptionCount = (state.adoptionCount || 0) + 1;
                    state.isEgg = true; 
                    state.pokemonId = null; 
                    state.currentXp = 0; 
                    state.activeEgg = null; 
                    
                    chrome.storage.local.set({ pokemonGameState: state }, () => setTimeout(() => window.location.reload(), 600));
                }
              }
            });
        });
      });
  }
    document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', function() {
      const content = this.nextElementSibling;
      const arrow = this.querySelector('.accordion-arrow');
      const isCurrentlyOpen = content.classList.contains('open');
      document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));
      document.querySelectorAll('.accordion-arrow').forEach(a => a.innerText = '▼');
      if (!isCurrentlyOpen) { content.classList.add('open'); arrow.innerText = '▲'; }
    });
  });
});