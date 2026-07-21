import { generationsData, pokemonNames, TYPE_COLORS, TYPES_ROW_1, TYPES_ROW_2, STAT_KEYS, NATURES } from './constants.js';

export const RenderManager = {
  t: null, 
  currentSearchIndex: [],
  renderId: 0,
  currentLang: 'pt', 
  
  currentDetailedPokemon: null,
  currentDetailedPokemonId: null,
  currentDetailedPokemonLevel: 1,
  currentEVs: { HP: 0, Attack: 0, Defense: 0, "Sp. Atk": 0, "Sp. Def": 0, Speed: 0 },
  currentGameState: null,
  
  holdTimeout: null,
  holdInterval: null,

  init(tFunc, gameState, lang) {
    this.t = tFunc;
    this.currentGameState = gameState;
    this.currentLang = lang;
  },

  setLang(lang) {
    this.currentLang = lang;
  },

  updateGameState(newState) {
    this.currentGameState = newState;
  },

  getPokemonImagePath(id, name) {
    let folderName = "Generation 1 Pokémon"; 
    for (const gen in generationsData) {
      if (id >= generationsData[gen].start && id <= generationsData[gen].end) {
        folderName = generationsData[gen].folder; break;
      }
    }
    let paddedId = id.toString().padStart(4, '0');
    return `assets/${folderName}/${paddedId} ${name}.png`;
  },

  getLevelFromExp(exp) {
      return Math.max(1, Math.min(Math.floor(Math.cbrt(exp)), 100));
  },

  applySearchFilter(term) {
    const searchTerms = term.trim().split(/\s+/).filter(t => t.length > 0);
    
    this.currentSearchIndex.forEach(item => {
      const match = searchTerms.every(t => item.text.includes(t));
      const targetDisplay = match ? 'block' : 'none';
      if (item.element.style.display !== targetDisplay) {
        item.element.style.display = targetDisplay;
      }
    });
  },

  getUnlockedIdsArray() {
      let allKnownIdsSet = new Set();
      if (this.currentGameState) {
          if (Array.isArray(this.currentGameState.unlockedIds)) {
              this.currentGameState.unlockedIds.forEach(id => allKnownIdsSet.add(Number(id)));
          } else if (typeof this.currentGameState.unlockedIds === 'object' && this.currentGameState.unlockedIds !== null) {
              Object.values(this.currentGameState.unlockedIds).forEach(id => allKnownIdsSet.add(Number(id)));
          }
          if (typeof this.currentGameState.xpMap === 'object' && this.currentGameState.xpMap !== null) {
              Object.keys(this.currentGameState.xpMap).forEach(id => allKnownIdsSet.add(Number(id)));
          }
          if (this.currentGameState.pokemonId) {
              allKnownIdsSet.add(Number(this.currentGameState.pokemonId));
          }
      }
      return Array.from(allKnownIdsSet).filter(id => !isNaN(id) && id > 0);
  },

  renderGrid(gridElement, genNumber) {
    if (!gridElement) return;
    gridElement.innerHTML = ""; 
    this.currentSearchIndex = []; 
    this.renderId++;
    const currentRender = this.renderId; 
    
    const allKnownIds = this.getUnlockedIdsArray();
    let idsToRender = [];

    if (genNumber === 'favorites') {
      idsToRender = [...(this.currentGameState.favorites || [])].sort((a, b) => a - b);
      if (idsToRender.length === 0) {
        gridElement.innerHTML = `<div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100px; color: var(--text-color); opacity: 0.7; font-weight: bold; font-size: 14px; text-align: center;">${this.currentLang === 'pt' ? 'Nenhum Pokémon favoritado.' : 'No favorite Pokémon yet.'}</div>`;
        return; 
      }
    } else if (genNumber === 'catched') {
      idsToRender = [...allKnownIds].sort((a, b) => a - b);
      if (idsToRender.length === 0) {
        gridElement.innerHTML = `<div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100px; color: var(--text-color); opacity: 0.7; font-weight: bold; font-size: 14px; text-align: center;">Nenhum Pokémon capturado ainda. Continue explorando!</div>`;
        return; 
      }
    } else {
      let startId = 1;
      let endId = pokemonNames && pokemonNames.length > 1000 ? 1025 : (pokemonNames.length || 1025); 
      if (genNumber !== 'all') {
        const genData = generationsData[genNumber];
        if(genData) { startId = genData.start; endId = genData.end; }
      }
      for (let i = startId; i <= endId; i++) { idsToRender.push(i); }
    }

    let currentIndex = 0;
    const batchSize = 150; 
    const self = this;
    
    function renderBatch() {
      if (currentRender !== self.renderId) return; 
      const fragment = document.createDocumentFragment();
      const endBatch = Math.min(currentIndex + batchSize, idsToRender.length);
      
      for (; currentIndex < endBatch; currentIndex++) {
        const id = idsToRender[currentIndex];
        const isUnlocked = allKnownIds.includes(id);
        
        let realName = "Unknown";
        let type1 = "";
        let type2 = "";

        if (window.pokemonDB) {
            let pokeData = window.pokemonDB.find(p => parseInt(p["#"]) === id);
            if (pokeData) {
                if (pokeData.Name) realName = pokeData.Name;
                if (pokeData["Type 1"]) type1 = pokeData["Type 1"].toLowerCase();
                if (pokeData["Type 2"]) type2 = pokeData["Type 2"].toLowerCase();
            } else if (pokemonNames && pokemonNames[id - 1]) {
                realName = pokemonNames[id - 1]; 
            }
        } else if (pokemonNames && pokemonNames[id - 1]) {
            realName = pokemonNames[id - 1]; 
        }

        const imageUrl = self.getPokemonImagePath(id, realName);
        
        const card = document.createElement('div');
        card.className = 'card';
        if (isUnlocked) card.classList.add('unlocked-card');
        else card.classList.add('locked');
        card.dataset.id = id;

        const displayName = isUnlocked ? realName : '???';
        const displayId = id.toString().padStart(3, '0');
        
        const isFav = (self.currentGameState.favorites || []).includes(id);
        const favHtml = isUnlocked ? `<div class="fav-btn ${isFav ? 'active' : ''}" data-id="${id}" title="Favoritar">★</div>` : '';
        const pokeballHtml = isUnlocked ? `<img src="assets/Icons/Pokeball.png" class="equip-btn" data-id="${id}" title="Equipar Pokémon">` : '';

        card.innerHTML = `
          ${favHtml}
          ${pokeballHtml}
          <div class="id-label">#${displayId}</div>
          <img src="${imageUrl}" alt="ID ${id}" onerror="this.src='https://via.placeholder.com/60?text=?';">
          <div class="name">${displayName}</div>
        `;
        
        const numericId = id.toString();
        const searchStr = `${numericId} #${displayId} ${realName.toLowerCase()} ${type1} ${type2}`;
        self.currentSearchIndex.push({ element: card, text: searchStr });
        fragment.appendChild(card);
      }
      gridElement.appendChild(fragment);
      
      const searchInput = document.getElementById('search-input');
      if (searchInput) self.applySearchFilter(searchInput.value.toLowerCase().trim());
      
      if (currentIndex < idsToRender.length) requestAnimationFrame(renderBatch);
    }
    renderBatch(); 
  },

  toggleFavorite(id, btnElement) {
      if (!this.currentGameState.favorites) this.currentGameState.favorites = [];
      const index = this.currentGameState.favorites.indexOf(id);
      
      if (index > -1) {
          this.currentGameState.favorites.splice(index, 1);
          btnElement.classList.remove('active');
          
          const activeTab = document.querySelector('.tab-btn.active');
          if (activeTab && activeTab.getAttribute('data-gen') === 'favorites') {
              const card = btnElement.closest('.card');
              if (card) {
                  card.style.transition = "opacity 0.3s, transform 0.3s";
                  card.style.opacity = "0";
                  card.style.transform = "scale(0.8)";
                  setTimeout(() => card.remove(), 300);
              }
          }
      } else {
          this.currentGameState.favorites.push(id);
          btnElement.classList.add('active');
      }
      
      chrome.storage.local.set({ pokemonGameState: this.currentGameState });
  },

  calculateStat(base, iv, ev, level, isHP) {
      if (isHP) return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
      else return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  },

  getTotalEVs() { return Object.values(this.currentEVs).reduce((sum, val) => sum + val, 0); },

  modifyEV(stat, isPlus) {
      const currentTotal = this.getTotalEVs();
      const step = 4;
      if (isPlus) {
          if (this.currentEVs[stat] >= 252 || currentTotal >= 508) return;
          let availableTotal = 508 - currentTotal;
          let availableStat = 252 - this.currentEVs[stat];
          let increment = Math.min(step, availableTotal, availableStat);
          this.currentEVs[stat] += increment;
      } else {
          if (this.currentEVs[stat] <= 0) return;
          let decrement = Math.min(step, this.currentEVs[stat]);
          this.currentEVs[stat] -= decrement;
      }
      this.updateStatsUI();
  },

  handleHold(stat, isPlus) {
      this.modifyEV(stat, isPlus); 
      this.holdTimeout = setTimeout(() => {
          this.holdInterval = setInterval(() => { this.modifyEV(stat, isPlus); }, 50); 
      }, 400); 
  },

  stopHold() {
      if (this.holdTimeout) clearTimeout(this.holdTimeout);
      if (this.holdInterval) clearInterval(this.holdInterval);
      if (this.currentDetailedPokemonId) {
          if (!this.currentGameState.evMap) this.currentGameState.evMap = {};
          this.currentGameState.evMap[this.currentDetailedPokemonId] = this.currentEVs;
          chrome.storage.local.set({ pokemonGameState: this.currentGameState });
      }
  },

  initStatRows() {
      const listEl = document.getElementById('det-stats-list');
      if (!listEl) return;
      listEl.innerHTML = '';
      const self = this;

      STAT_KEYS.forEach(statName => {
          let row = document.createElement('div');
          row.className = 'stat-row';
          row.setAttribute('data-stat', statName);
          row.innerHTML = `
              <span class="stat-name">${statName.replace('Sp. Atk', 'Sp.Atk').replace('Sp. Def', 'Sp.Def')}</span>
              <span class="stat-val">0</span>
              <div class="stat-bar-container"><div class="stat-fill" style="width: 0%;"></div></div>
              <div class="ev-controls">
                  <button class="ev-btn minus">-</button>
                  <input type="number" class="ev-amount-input" min="0" max="252" value="0">
                  <button class="ev-btn plus">+</button>
              </div>
          `;
          
          const btnMinus = row.querySelector('.minus');
          const btnPlus = row.querySelector('.plus');
          const inputField = row.querySelector('.ev-amount-input');

          btnMinus.addEventListener('mousedown', () => self.handleHold(statName, false));
          btnPlus.addEventListener('mousedown', () => self.handleHold(statName, true));

          ['mouseup', 'mouseleave'].forEach(evt => {
              btnMinus.addEventListener(evt, () => self.stopHold());
              btnPlus.addEventListener(evt, () => self.stopHold());
          });

          inputField.addEventListener('change', (e) => {
              let val = parseInt(e.target.value, 10);
              if (isNaN(val) || val < 0) val = 0;
              const totalWithoutCurrent = self.getTotalEVs() - self.currentEVs[statName];
              const maxAllowed = Math.min(252, 508 - totalWithoutCurrent);
              if (val > maxAllowed) val = maxAllowed;
              self.currentEVs[statName] = val;
              
              if (!self.currentGameState.evMap) self.currentGameState.evMap = {};
              self.currentGameState.evMap[self.currentDetailedPokemonId] = self.currentEVs;
              chrome.storage.local.set({ pokemonGameState: self.currentGameState });
              self.updateStatsUI();
          });
          listEl.appendChild(row);
      });
  },

 updateStatsUI() {
      const totalEvEl = document.getElementById('det-total-evs');
      if (totalEvEl) totalEvEl.innerText = `${this.getTotalEVs()}/508 EVs`;
      if (!this.currentDetailedPokemon) return;
      let type1 = this.currentDetailedPokemon["Type 1"];
      let barColor = TYPE_COLORS[type1] || '#FF5722';

      let currentNatKey = this.currentGameState.natureMap?.[this.currentDetailedPokemonId] || "Hardy";
      let nature = NATURES[currentNatKey];

      STAT_KEYS.forEach(statName => {
          let baseStat = this.currentDetailedPokemon[statName];
          let isHP = statName === "HP";
          
          let calcValue = this.calculateStat(baseStat, 31, this.currentEVs[statName], this.currentDetailedPokemonLevel, isHP);
          let maxPossibleAtCurrentLevel = this.calculateStat(255, 31, 252, this.currentDetailedPokemonLevel, isHP);
          
          if (!isHP) {
              if (nature.plus === statName) { 
                  calcValue = Math.round(calcValue * 1.1); 
                  maxPossibleAtCurrentLevel = Math.round(maxPossibleAtCurrentLevel * 1.1); 
              }
              if (nature.minus === statName) { 
                  calcValue = Math.round(calcValue * 0.9); 
                  maxPossibleAtCurrentLevel = Math.round(maxPossibleAtCurrentLevel * 0.9); 
              }
          }

          let pct = Math.min(100, Math.max(0, (calcValue / maxPossibleAtCurrentLevel) * 100));

          const row = document.querySelector(`.stat-row[data-stat="${statName}"]`);
          if (row) {
              let valEl = row.querySelector('.stat-val');
              valEl.innerText = calcValue;
              
              valEl.classList.remove('buffed', 'debuffed');
              if (!isHP) {
                  if (nature.plus === statName) valEl.classList.add('buffed');
                  if (nature.minus === statName) valEl.classList.add('debuffed');
              }

              row.querySelector('.ev-amount-input').value = this.currentEVs[statName];
              let fillEl = row.querySelector('.stat-fill');
              fillEl.style.width = `${pct}%`;
              fillEl.style.backgroundColor = barColor;
          }
      });
  },
  
  getMoveData(moveName) {
      let db = this.currentLang === 'pt' ? window.movesPT : window.movesEN;
      if (!db) db = window.movesEN; 
      if (!db) return null;
      return db.find(m => m.Name === moveName) || null;
  },

  getMoveType(moveName) {
      if (window.movesEN) {
          let moveInfo = window.movesEN.find(x => x.Name === moveName);
          if (moveInfo && moveInfo.Type) return moveInfo.Type;
      }
      return this.currentDetailedPokemon ? this.currentDetailedPokemon["Type 1"] : "Normal";
  },

  createMoveDetailsHTML(moveData) {
      if (!moveData) return `<p class="move-effect">Detalhes não encontrados no banco de dados.</p>`;
      
      let power = moveData.Power || '-';
      let accuracy = moveData.Accuracy || '-';
      let catLabel = this.currentLang === 'pt' ? 'Categoria' : 'Category';
      let powLabel = this.currentLang === 'pt' ? 'Poder' : 'Power';
      let accLabel = this.currentLang === 'pt' ? 'Precisão' : 'Accuracy';

      return `
          <p class="move-effect">${moveData.Effect}</p>
          <div class="move-stats-grid">
              <div><div class="move-stat-title">${catLabel}</div><div class="move-stat-value">${moveData.Category}</div></div>
              <div><div class="move-stat-title">${powLabel}</div><div class="move-stat-value">${power}</div></div>
              <div><div class="move-stat-title">${accLabel}</div><div class="move-stat-value">${accuracy}</div></div>
          </div>
      `;
  },

  toggleEquipMove(moveName) {
      if (!this.currentGameState.movesMap) this.currentGameState.movesMap = {};
      let currentMoves = this.currentGameState.movesMap[this.currentDetailedPokemonId] || [];
      
      if (currentMoves.includes(moveName)) {
          currentMoves = currentMoves.filter(m => m !== moveName);
      } else {
          if (currentMoves.length >= 4) {
              alert(this.currentLang === 'pt' ? 
                  "Você só pode equipar 4 movimentos! Remova um clicando nele na seção 'Moves Build' no topo da tela." : 
                  "You can only equip 4 moves! Remove one by clicking it in the 'Moves Build' section at the top.");
              return;
          }
          currentMoves.push(moveName);
      }
      
      this.currentGameState.movesMap[this.currentDetailedPokemonId] = currentMoves;
      chrome.storage.local.set({ pokemonGameState: this.currentGameState });
      
      this.renderMovesBuild();
      this.renderLevelMovesList();
      this.renderEggMovesList();
      this.renderTmHmMovesList();
  },

  renderMovesBuild() {
      const movesList = document.getElementById('det-moves-list');
      if (!movesList) return;
      movesList.innerHTML = '';
      
      let selectedMoves = this.currentGameState.movesMap?.[this.currentDetailedPokemonId] || [];

      if (selectedMoves.length === 0) {
          movesList.innerHTML = `<div style="text-align: center; font-size: 11px; opacity: 0.6; padding: 10px;">${this.currentLang === 'pt' ? 'Nenhum movimento equipado.' : 'No moves equipped.'}</div>`;
          return;
      }

      selectedMoves.forEach(move => {
          let type = this.getMoveType(move);
          let row = document.createElement('div');
          
          row.className = 'move-row equipped-row';
          row.style.borderColor = TYPE_COLORS[type] || '#777';
          row.title = this.currentLang === 'pt' ? "Clique para remover" : "Click to unequip";
          
          row.setAttribute('data-hover-text', this.currentLang === 'pt' ? 'Remover' : 'Unequip');
          
          row.innerHTML = `
            <span class="move-name">${move}</span>
            <span class="move-type" style="background-color: ${TYPE_COLORS[type] || '#777'}">${type.substring(0, 3).toUpperCase()}</span>
          `;
          
          row.addEventListener('click', () => {
              this.toggleEquipMove(move);
          });

          movesList.appendChild(row);
      });
  },
  
  renderLevelMovesList() {
      const container = document.getElementById('det-level-moves-list');
      if (!container) return;
      container.innerHTML = '';
      if (!this.currentDetailedPokemon || !this.currentDetailedPokemon.Level_Moves) return;

      let movesArray = [];
      for (let moveName in this.currentDetailedPokemon.Level_Moves) {
          movesArray.push({ name: moveName, level: this.currentDetailedPokemon.Level_Moves[moveName] });
      }
      movesArray.sort((a, b) => a.level - b.level);

      let currentMoves = this.currentGameState.movesMap?.[this.currentDetailedPokemonId] || [];

      movesArray.forEach(move => {
          let type = this.getMoveType(move.name);
          let typeColor = TYPE_COLORS[type] || '#A8A77A'; 
          let typeTag = type.substring(0, 3).toUpperCase(); 
          let moveData = this.getMoveData(move.name);

          let isLearned = move.level <= this.currentDetailedPokemonLevel;
          let isEquipped = currentMoves.includes(move.name);

          let wrapper = document.createElement('div');
          wrapper.className = 'move-wrapper';

          let moveBtn = document.createElement('div');
          moveBtn.className = 'level-move-btn' + (isLearned ? '' : ' disabled-move') + (isEquipped ? ' is-equipped' : '');
          moveBtn.style.borderColor = typeColor;
          moveBtn.innerHTML = `<span class="move-lvl">Lv. ${move.level}</span><span class="move-name">${move.name}</span><span class="move-type" style="background-color: ${typeColor}">${typeTag}</span>`;

          let detailsDiv = document.createElement('div');
          detailsDiv.className = 'move-details';
          detailsDiv.style.borderColor = typeColor;
          detailsDiv.innerHTML = this.createMoveDetailsHTML(moveData);

          if (isLearned) {
              let equipBtn = document.createElement('button');
              equipBtn.className = 'btn-equip-move ' + (isEquipped ? 'unequip' : 'equip');
              equipBtn.innerText = isEquipped ? (this.currentLang === 'pt' ? 'Remover da Build' : 'Unequip') : (this.currentLang === 'pt' ? 'Equipar' : 'Equip');
              
              equipBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  this.toggleEquipMove(move.name);
              });
              
              detailsDiv.appendChild(equipBtn);
          }

          moveBtn.addEventListener('click', () => {
              if (!isLearned) return;

              const isActive = moveBtn.classList.contains('active');
              document.querySelectorAll('.level-move-btn, .tmhm-move-btn').forEach(btn => btn.classList.remove('active'));
              document.querySelectorAll('.move-details').forEach(det => det.classList.remove('active'));

              if (!isActive) {
                  moveBtn.classList.add('active');
                  detailsDiv.classList.add('active');
              }
          });

          wrapper.appendChild(moveBtn);
          wrapper.appendChild(detailsDiv);
          container.appendChild(wrapper);
      });
  },

  renderEggMovesList() {
      const container = document.getElementById('det-egg-moves-list');
      if (!container) return;
      container.innerHTML = '';
      
      let hasEggMoves = this.currentDetailedPokemon && 
                        this.currentDetailedPokemon.Egg_Moves && 
                        Object.keys(this.currentDetailedPokemon.Egg_Moves).length > 0;

      if (!hasEggMoves) {
          container.innerHTML = `<div style="text-align: center; font-size: 11px; opacity: 0.6; padding: 10px;">${this.currentLang === 'pt' ? 'Nenhum Egg Move disponível para esta espécie.' : 'No Egg Moves available for this species.'}</div>`;
          return;
      }

      let eggMovesObj = this.currentDetailedPokemon.Egg_Moves;
      let movesArray = [];
      
      if (Array.isArray(eggMovesObj)) {
          eggMovesObj.forEach(m => movesArray.push({ name: m, level: 5 }));
      } else {
          for (let moveName in eggMovesObj) {
              movesArray.push({ name: moveName, level: eggMovesObj[moveName] });
          }
      }
      
      movesArray.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

      let currentMoves = this.currentGameState.movesMap?.[this.currentDetailedPokemonId] || [];

      movesArray.forEach(move => {
          let type = this.getMoveType(move.name);
          let typeColor = TYPE_COLORS[type] || '#A8A77A'; 
          let typeTag = type.substring(0, 3).toUpperCase(); 
          let moveData = this.getMoveData(move.name);

          let isLearned = move.level <= this.currentDetailedPokemonLevel;
          let isEquipped = currentMoves.includes(move.name);

          let wrapper = document.createElement('div');
          wrapper.className = 'move-wrapper';

          let moveBtn = document.createElement('div');
          moveBtn.className = 'level-move-btn' + (isLearned ? '' : ' disabled-move') + (isEquipped ? ' is-equipped' : ''); 
          moveBtn.style.borderColor = typeColor;
          
          moveBtn.innerHTML = `<span class="move-lvl">🥚 Lv. ${move.level}</span><span class="move-name">${move.name}</span><span class="move-type" style="background-color: ${typeColor}">${typeTag}</span>`;

          let detailsDiv = document.createElement('div');
          detailsDiv.className = 'move-details';
          detailsDiv.style.borderColor = typeColor;
          detailsDiv.innerHTML = this.createMoveDetailsHTML(moveData);

          if (isLearned) {
              let equipBtn = document.createElement('button');
              equipBtn.className = 'btn-equip-move ' + (isEquipped ? 'unequip' : 'equip');
              equipBtn.innerText = isEquipped ? (this.currentLang === 'pt' ? 'Remover da Build' : 'Unequip') : (this.currentLang === 'pt' ? 'Equipar' : 'Equip');
              
              equipBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  this.toggleEquipMove(move.name);
              });
              detailsDiv.appendChild(equipBtn);
          }

          moveBtn.addEventListener('click', () => {
              if (!isLearned) return;

              const isActive = moveBtn.classList.contains('active');
              document.querySelectorAll('.level-move-btn, .tmhm-move-btn').forEach(btn => btn.classList.remove('active'));
              document.querySelectorAll('.move-details').forEach(det => det.classList.remove('active'));

              if (!isActive) {
                  moveBtn.classList.add('active');
                  detailsDiv.classList.add('active');
              }
          });

          wrapper.appendChild(moveBtn);
          wrapper.appendChild(detailsDiv);
          container.appendChild(wrapper);
      });
  },

  renderTmHmMovesList() {
      const container = document.getElementById('det-tmhm-moves-list');
      if (!container) return;
      container.innerHTML = '';
      if (!this.currentDetailedPokemon || !this.currentDetailedPokemon.TM_HM_Moves) return;

      let currentMoves = this.currentGameState.movesMap?.[this.currentDetailedPokemonId] || [];
      let movesArray = [...this.currentDetailedPokemon.TM_HM_Moves].sort();
      
      movesArray.forEach(moveName => {
          let type = this.getMoveType(moveName);
          let typeColor = TYPE_COLORS[type] || '#A8A77A'; 
          let typeTag = type.substring(0, 3).toUpperCase(); 
          let moveData = this.getMoveData(moveName);
          let isEquipped = currentMoves.includes(moveName);

          let wrapper = document.createElement('div');
          wrapper.className = 'move-wrapper';

          let moveBtn = document.createElement('div');
          moveBtn.className = 'tmhm-move-btn' + (isEquipped ? ' is-equipped' : ''); 
          moveBtn.style.borderColor = typeColor;
          moveBtn.innerHTML = `<span class="move-name" style="text-align: left;">${moveName}</span><span class="move-type" style="background-color: ${typeColor}">${typeTag}</span>`;

          let detailsDiv = document.createElement('div');
          detailsDiv.className = 'move-details';
          detailsDiv.style.borderColor = typeColor;
          detailsDiv.innerHTML = this.createMoveDetailsHTML(moveData);

          let equipBtn = document.createElement('button');
          equipBtn.className = 'btn-equip-move ' + (isEquipped ? 'unequip' : 'equip');
          equipBtn.innerText = isEquipped ? (this.currentLang === 'pt' ? 'Remover da Build' : 'Unequip') : (this.currentLang === 'pt' ? 'Equipar' : 'Equip');
          
          equipBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              this.toggleEquipMove(moveName);
          });
          detailsDiv.appendChild(equipBtn);

          moveBtn.addEventListener('click', () => {
              const isActive = moveBtn.classList.contains('active');
              document.querySelectorAll('.level-move-btn, .tmhm-move-btn').forEach(btn => btn.classList.remove('active'));
              document.querySelectorAll('.move-details').forEach(det => det.classList.remove('active'));

              if (!isActive) {
                  moveBtn.classList.add('active');
                  detailsDiv.classList.add('active');
              }
          });

          wrapper.appendChild(moveBtn);
          wrapper.appendChild(detailsDiv);
          container.appendChild(wrapper);
      });
  },

  getMultiplier(type) {
      if (!this.currentDetailedPokemon) return 1;
      if (this.currentDetailedPokemon.Weaknesses && this.currentDetailedPokemon.Weaknesses[type]) return parseFloat(this.currentDetailedPokemon.Weaknesses[type]);
      if (this.currentDetailedPokemon.Resistances && this.currentDetailedPokemon.Resistances[type] !== undefined) return parseFloat(this.currentDetailedPokemon.Resistances[type]);
      return 1;
  },

  formatMultiplier(mult) {
      if (mult === 1) return "";
      if (mult === 0.5) return "½";
      if (mult === 0.25) return "¼";
      if (mult === 2) return "x2";
      if (mult === 4) return "x4";
      return mult.toString();
  },

  getMultColor(mult) {
      if (mult > 1) return "#22c55e"; 
      if (mult < 1 && mult > 0) return "#ef4444"; 
      if (mult === 0) return "#262626"; 
      return ""; 
  },

  renderTypeDefenses() {
      const grid1 = document.getElementById('type-def-grid-1');
      const grid2 = document.getElementById('type-def-grid-2');
      if (!grid1 || !grid2) return;
      grid1.innerHTML = ''; grid2.innerHTML = '';
      const self = this;

      const buildRow = (typeList, container) => {
          typeList.forEach(t => {
              let col = document.createElement('div');
              col.className = 'type-col';

              let hBox = document.createElement('div');
              hBox.className = 'type-def-box header';
              hBox.innerText = t.substring(0, 3).toUpperCase();
              hBox.style.backgroundColor = TYPE_COLORS[t];

              let mult = self.getMultiplier(t);
              let mBox = document.createElement('div');
              mBox.className = 'type-def-box mult';
              
              if (mult === 1) mBox.classList.add('empty');
              else { mBox.innerText = self.formatMultiplier(mult); mBox.style.backgroundColor = self.getMultColor(mult); }

              col.appendChild(hBox);
              col.appendChild(mBox);
              container.appendChild(col);
          });
      }
      buildRow(TYPES_ROW_1, grid1);
      buildRow(TYPES_ROW_2, grid2);
  },

  getEvoLine(startIdStr) {
    if (!window.pokemonDB) return [];
    
    // 1. Encontrar o Pokémon atual
    let current = window.pokemonDB.find(p => p["#"] === startIdStr);
    if (!current) return [];
    
    // 2. Subir na árvore até a raiz (o estágio base mais baixo)
    let root = current;
    let maxLevelsUp = 5; 
    
    for (let i = 0; i < maxLevelsUp; i++) {
        // Procuramos no banco um Pokémon que possua 'root["#"]' no seu campo Evolves_To_ID
        // A lógica agora varre strings e arrays
        let parent = window.pokemonDB.find(p => {
            let evos = p.Evolves_To_ID;
            if (!evos) return false;
            
            let evoArray = Array.isArray(evos) ? evos : [evos];
            return evoArray.includes(root["#"]);
        });
        
        if (parent) {
            root = parent;
        } else {
            break; // Não encontrou pai, então 'root' já é a base
        }
    }
    
    // 3. Função recursiva para descer da raiz e coletar todos os parentes em uma lista "achatada"
    let line = [];
    const traverseLine = (node) => {
        if (!node) return;
        
        // Evita loops infinitos se houver erro no banco
        if (line.some(p => p["#"] === node["#"])) return;
        
        line.push(node);
        
        let evos = node.Evolves_To_ID;
        if (evos) {
            let evoArray = Array.isArray(evos) ? evos : [evos];
            
            evoArray.forEach(evoId => {
                let child = window.pokemonDB.find(p => p["#"] === evoId);
                if (child) {
                    traverseLine(child);
                }
            });
        }
    };
    
    traverseLine(root);
    return line;
  },

  renderEvoLine(pokeData) {
      const container = document.getElementById('det-evo-list');
      if (!container) return;
      container.innerHTML = '';

      const evoLine = this.getEvoLine(pokeData["#"]);
      const unlockedIds = this.getUnlockedIdsArray();

      evoLine.forEach((p) => {
          const idNum = parseInt(p["#"]);
          const isUnlocked = unlockedIds.includes(idNum);
          const isCurrent = (idNum === this.currentDetailedPokemonId);

          const card = document.createElement('div');
          card.className = `evo-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`;

          const imgPath = this.getPokemonImagePath(idNum, p.Name);
          const displayName = isUnlocked ? p.Name : '???';
          
          let typesHtml = '';
          if (isUnlocked) {
              let t1 = p["Type 1"];
              let t2 = p["Type 2"];
              typesHtml += `<span class="type-tag" style="background-color: ${TYPE_COLORS[t1] || '#777'}">${t1}</span>`;
              if (t2) {
                  typesHtml += `<span class="type-tag" style="background-color: ${TYPE_COLORS[t2] || '#777'}">${t2}</span>`;
              }
          }
          
          let evoReq = p.Evolution_Level;
          let reqText = "Final"; 
          if (evoReq) {
              reqText = (typeof evoReq === 'number') ? `Lv. ${evoReq}` : evoReq;
          }

          card.innerHTML = `
              <div class="evo-img-container">
                  <img src="${imgPath}" alt="${p.Name}" class="evo-img">
              </div>
              <div class="evo-info">
                  <div class="evo-id">#${p["#"]}</div>
                  <div class="evo-name">${displayName}</div>
                  <div class="evo-types">${typesHtml}</div>
              </div>
              <div class="evo-req" title="Requisito de Evolução">${reqText}</div>
          `;

          if (isUnlocked && !isCurrent) {
              card.addEventListener('click', () => {
                  this.openPokemonDetail(idNum);
              });
          }

          container.appendChild(card);
      });
  },

  openPokemonDetail(id) {
      if (!window.pokemonDB) return;
      let pokeData = window.pokemonDB.find(p => parseInt(p["#"]) === id);
      if (!pokeData) return;

      this.currentDetailedPokemon = pokeData;
      this.currentDetailedPokemonId = id;
      
      let xp = this.currentGameState.xpMap[id] || 0;
      this.currentDetailedPokemonLevel = this.getLevelFromExp(xp);
      if (document.getElementById('det-level')) document.getElementById('det-level').innerText = `Lv. ${this.currentDetailedPokemonLevel}`;

      if (this.currentGameState.evMap && this.currentGameState.evMap[id]) this.currentEVs = { ...this.currentGameState.evMap[id] };
      else this.currentEVs = { HP: 0, Attack: 0, Defense: 0, "Sp. Atk": 0, "Sp. Def": 0, Speed: 0 };
      
      if (!this.currentGameState.movesMap) this.currentGameState.movesMap = {};
      if (!this.currentGameState.movesMap[id]) {
          let availableMoves = [];
          if (pokeData.Level_Moves) {
              for (let move in pokeData.Level_Moves) {
                  if (pokeData.Level_Moves[move] <= this.currentDetailedPokemonLevel) {
                      availableMoves.push({ name: move, level: pokeData.Level_Moves[move] });
                  }
              }
          }
          availableMoves.sort((a, b) => b.level - a.level);
          let selectedMoves = availableMoves.slice(0, 4).map(m => m.name);
          if (selectedMoves.length === 0) selectedMoves = ["Tackle"]; 
          
          this.currentGameState.movesMap[id] = selectedMoves;
          chrome.storage.local.set({ pokemonGameState: this.currentGameState });
      }

      if (document.getElementById('det-id')) document.getElementById('det-id').innerText = `#${pokeData["#"]}`;
      if (document.getElementById('det-img')) document.getElementById('det-img').src = this.getPokemonImagePath(id, pokeData.Name);
      if (document.getElementById('det-name')) document.getElementById('det-name').innerText = pokeData.Name;

      let typesDiv = document.getElementById('det-types');
      if (typesDiv) {
          typesDiv.innerHTML = '';
          [pokeData["Type 1"], pokeData["Type 2"]].forEach(type => {
              if (type) {
                  let tag = document.createElement('span');
                  tag.className = 'type-tag';
                  tag.innerText = type;
                  tag.style.backgroundColor = TYPE_COLORS[type] || '#777';
                  typesDiv.appendChild(tag);
              }
          });
      }

      const natureSelect = document.getElementById('det-nature-select');
      if (natureSelect) {
          natureSelect.innerHTML = '';
          Object.keys(NATURES).forEach(key => {
              let opt = document.createElement('option');
              opt.value = key;
              opt.innerText = NATURES[key][this.currentLang];
              natureSelect.appendChild(opt);
          });

          if (!this.currentGameState.natureMap) this.currentGameState.natureMap = {};
          let currentNat = this.currentGameState.natureMap[this.currentDetailedPokemonId] || "Hardy";
          natureSelect.value = currentNat;

          natureSelect.onchange = (e) => {
              this.currentGameState.natureMap[this.currentDetailedPokemonId] = e.target.value;
              chrome.storage.local.set({ pokemonGameState: this.currentGameState });
              this.updateStatsUI();
          };
      }

      this.renderMovesBuild();
      this.renderLevelMovesList(); 
      this.renderEggMovesList(); 
      this.renderTmHmMovesList(); 
      this.initStatRows();
      this.updateStatsUI();
      this.renderTypeDefenses();
      this.renderEvoLine(pokeData); 

      document.querySelectorAll('.det-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.det-tab-content').forEach(c => c.style.display = 'none');
      if (document.querySelector('.det-tab[data-target="tab-stats"]')) {
          document.querySelector('.det-tab[data-target="tab-stats"]').classList.add('active');
          document.getElementById('tab-stats').style.display = 'block';
      }

      document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.sub-tab-content').forEach(c => c.classList.remove('active'));
      if(document.querySelector('.sub-tab[data-target="sub-tab-level"]')) {
          document.querySelector('.sub-tab[data-target="sub-tab-level"]').classList.add('active');
          document.getElementById('sub-tab-level').classList.add('active');
      }

      if (document.getElementById('pokedex-view')) document.getElementById('pokedex-view').style.display = 'none';
      if (document.getElementById('settings-view')) document.getElementById('settings-view').style.display = 'none';
      if (document.getElementById('pokemon-detail-view')) document.getElementById('pokemon-detail-view').style.display = 'flex';
  }
};