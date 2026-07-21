// battle.js
// Motor centralizado de cálculos e interface de batalha Idle

window.BATTLE_TYPE_COLORS = window.BATTLE_TYPE_COLORS || {
    Normal: '#A8A77A', Fire: '#EE8130', Water: '#6390F0', Electric: '#F7D02C',
    Grass: '#7AC74C', Ice: '#66CCFF', Fighting: '#C22E28', Poison: '#A33EA1',
    Ground: '#E2BF65', Flying: '#A98FF3', Psychic: '#F95587', Bug: '#A6B91A',
    Rock: '#B6A136', Ghost: '#6666BB', Dragon: '#7766EE', Dark: '#775544',
    Steel: '#B7B7CE', Fairy: '#D685AD'
};

window.BattleSystem = {
    // DICIONÁRIO OFICIAL DE EFEITOS DE GOLPES
    MOVE_EFFECTS: {
        drains: ["Absorb", "Mega Drain", "Giga Drain", "Leech Life", "Drain Punch", "Draining Kiss", "Horn Leech", "Parabolic Charge", "Bitter Malice", "Dream Eater"],
        
        buffs: {
            "Swords Dance": { atk: 2 }, "Dragon Dance": { atk: 1, spd: 1 }, "Calm Mind": { spAtk: 1, spDef: 1 },
            "Bulk Up": { atk: 1, def: 1 }, "Nasty Plot": { spAtk: 2 }, "Agility": { spd: 2 },
            "Iron Defense": { def: 2 }, "Amnesia": { spDef: 2 }, "Growth": { atk: 1, spAtk: 1 },
            "Quiver Dance": { spAtk: 1, spDef: 1, spd: 1 }, "Shell Smash": { atk: 2, spAtk: 2, spd: 2, def: -1, spDef: -1 },
            "Cosmic Power": { def: 1, spDef: 1 }, "Harden": { def: 1 }, "Withdraw": { def: 1 },
            "Defense Curl": { def: 1 }, "Tailwind": { spd: 2 }, "Focus Energy": { crit: 1 },
            "Belly Drum": { atk: 6, hpCost: 0.5 }, "Howl": { atk: 1 }, "Meditate": { atk: 1 }
        },

        debuffs: {
            "Growl": { atk: -1 }, "Tail Whip": { def: -1 }, "Leer": { def: -1 },
            "String Shot": { spd: -1 }, "Scary Face": { spd: -2 }, "Screech": { def: -2 },
            "Fake Tears": { spDef: -2 }, "Metal Sound": { spDef: -2 }, "Charm": { atk: -2 },
            "Feather Dance": { atk: -2 }, "Cotton Spore": { spd: -2 }, "Tickle": { atk: -1, def: -1 }
        },

        status: {
            "Thunder Wave": "PAR", "Glare": "PAR", "Stun Spore": "PAR", "Nuzzle": "PAR",
            "Will-O-Wisp": "BRN", 
            "Toxic": "TOX", "Poison Gas": "PSN", "Poison Powder": "PSN", "Toxic Spikes": "PSN",
            "Sleep Powder": "SLP", "Hypnosis": "SLP", "Spore": "SLP", "Sing": "SLP", "Yawn": "SLP", "Grass Whistle": "SLP",
            "Confuse Ray": "CONFUSION", "Supersonic": "CONFUSION", "Sweet Kiss": "CONFUSION", "Teeter Dance": "CONFUSION", "Swagger": "CONFUSION_BUFF",
            "Leech Seed": "LEECH_SEED"
        }
    },

    calculateDamage(attacker, defender, move) {
        if (move.Category === "Status" || !move.Power || move.Power === "-") {
            return { damage: 0, effectiveness: 1, isCrit: false, msg: "Status" };
        }

        let level = attacker.level || 1;
        let power = parseInt(move.Power);

        // APLICAÇÃO DOS STAGES (Buffs e Debuffs)
        let atkStage = attacker.modifiers[move.Category === "Physical" ? 'atk' : 'spAtk'];
        let defStage = defender.modifiers[move.Category === "Physical" ? 'def' : 'spDef'];
        
        let attackStat = move.Category === "Physical" ? attacker.stats.Attack : attacker.stats["Sp. Atk"];
        let defenseStat = move.Category === "Physical" ? defender.stats.Defense : defender.stats["Sp. Def"];

        attackStat = Math.floor(attackStat * this.getStageMultiplier(atkStage));
        defenseStat = Math.floor(defenseStat * this.getStageMultiplier(defStage));

        // EFEITO DO BURN NO ATAQUE FÍSICO (Corta o dano pela metade)
        if (attacker.status === 'BRN' && move.Category === "Physical") {
            attackStat = Math.floor(attackStat / 2);
        }

        let baseDamage = Math.floor(Math.floor(Math.floor(2 * level / 5 + 2) * power * attackStat / defenseStat) / 50) + 2;

        let stab = 1;
        let t1 = attacker.dbData["Type 1"];
        let t2 = attacker.dbData["Type 2"];
        if (move.Type === t1 || move.Type === t2) stab = 1.5;

        let typeEffectiveness = this.getTypeMultiplier(move.Type, defender.dbData);

        let critChance = attacker.modifiers.crit > 0 ? 0.25 : 0.0625;
        let isCrit = (Math.random() < critChance); 
        let critMultiplier = isCrit ? 1.5 : 1;

        let randomFactor = Math.floor(Math.random() * (100 - 85 + 1) + 85) / 100;
        let finalDamage = Math.floor(baseDamage * stab * typeEffectiveness * critMultiplier * randomFactor);

        if (finalDamage === 0 && typeEffectiveness > 0) finalDamage = 1;

        return {
            damage: finalDamage,
            effectiveness: typeEffectiveness,
            isCrit: isCrit,
            stab: stab
        };
    },

    getStageMultiplier(stage) {
        if (stage > 6) stage = 6;
        if (stage < -6) stage = -6;
        if (stage >= 0) return (2 + stage) / 2;
        return 2 / (2 - Math.abs(stage));
    },

    getTypeMultiplier(moveType, defenderDB) {
        if (!defenderDB) return 1;
        let mult = 1;
        if (defenderDB.Weaknesses && defenderDB.Weaknesses[moveType]) mult *= parseFloat(defenderDB.Weaknesses[moveType]);
        if (defenderDB.Resistances && defenderDB.Resistances[moveType] !== undefined) mult *= parseFloat(defenderDB.Resistances[moveType]);
        return mult;
    }
};

window.BattleManager = {
    loopAnimation: null,
    lastTime: 0,
    player: null,
    enemy: null,
    isRunning: false,
    callbacks: {},
    speedMultiplier: 1,

    start(playerData, enemyData, callbacks = {}) {
        this.callbacks = callbacks;
        this.player = this.setupCombatant(playerData, 'player');
        this.enemy = this.setupCombatant(enemyData, 'enemy');
        
        this.buildHUD(this.player);
        this.buildHUD(this.enemy);

        // Inicializa as insígnias vazias
        this.renderStatusUI(this.player);
        this.renderStatusUI(this.enemy);

        this.isRunning = true;
        this.lastTime = performance.now();
        if (this.loopAnimation) cancelAnimationFrame(this.loopAnimation);
        this.loopAnimation = requestAnimationFrame((t) => this.tick(t));
    },

    stop() {
        this.isRunning = false;
        if (this.loopAnimation) cancelAnimationFrame(this.loopAnimation);
    },

    setupCombatant(data, type) {
        let combatant = {
            type: type,
            dbData: data.dbData,
            stats: data.stats,
            level: data.level,
            currentHp: data.stats.HP,
            maxHp: data.stats.HP,
            hudElementId: data.hudElementId,
            spriteElementId: data.spriteElementId,
            moves: [],
            // NOVOS DADOS DE ESTADO PARA O MOTOR
            modifiers: { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0, crit: 0 },
            status: null, // BRN, PAR, PSN, TOX, SLP, FRZ
            statusTurns: 0,
            confusionTurns: 0,
            isSeeded: false
        };

        let moveList = data.equippedMoves && data.equippedMoves.length > 0 ? data.equippedMoves : ["Tackle"];

        moveList.forEach((moveName) => {
            let db = window.movesEN || window.movesPT;
            if (!db) return;
            let moveData = db.find(m => m.Name === moveName);
            if (!moveData) return;
            
            let power = parseInt(moveData.Power) || 50;
            let maxCd = 3000 + (power * 10);
            if (maxCd < 1500) maxCd = 1500;
            if (maxCd > 5500) maxCd = 5500;

            combatant.moves.push({
                data: moveData,
                cooldown: Math.random() * (maxCd * 0.4), 
                maxCooldown: maxCd,
                uiSlot: null,
                uiFill: null
            });
        });

        return combatant;
    },

    buildHUD(combatant) {
        let container = document.getElementById(combatant.hudElementId);
        if (!container) return;
        container.innerHTML = '';
        
        let hudWrapper = document.createElement('div');
        hudWrapper.className = 'wbm-moves-hud'; 

        combatant.moves.forEach((moveObj) => {
            let slot = document.createElement('div');
            slot.className = 'wbm-move-slot';
            slot.setAttribute('data-move-name', moveObj.data.Name); // NOVO: Atributo para o Tooltip instantâneo
            
          // Evento de clique / tecla
            slot.addEventListener('click', () => {
                if (window.ExploreEngine && window.ExploreEngine.activeMode && combatant.type === 'player') {
                    // Se a barra estiver 100%, ele atira!
                    if (moveObj.cooldown >= moveObj.maxCooldown) {
                        moveObj.cooldown = 0;
                        let defender = window.BattleManager.enemy;
                        window.BattleManager.fireAttack(combatant, defender, moveObj);
                        slot.style.boxShadow = "0 2px 4px rgba(0,0,0,0.5)"; // Remove o brilho
                    } else {
                        // PUNIÇÃO: Clicou antes da hora? A barra volta a zero!
                        moveObj.cooldown = 0;
                        
                        // Feedback visual de erro (o quadrado encolhe e pisca em vermelho)
                        slot.style.transform = "scale(0.7)";
                        slot.style.borderColor = "#ff4d4d";
                        setTimeout(() => {
                            slot.style.transform = "scale(1)";
                            slot.style.borderColor = "rgba(255,255,255,0.4)";
                        }, 150);
                    }
                }
            });            
            let fill = document.createElement('div');
            fill.className = 'wbm-move-fill';
            
            let typeColor = window.BATTLE_TYPE_COLORS[moveObj.data.Type] || '#ffffff';
            fill.style.backgroundColor = typeColor; 

            slot.appendChild(fill);
            hudWrapper.appendChild(slot);

            moveObj.uiSlot = slot;
            moveObj.uiFill = fill;
        });

        container.appendChild(hudWrapper);

        // ==========================================
        // CONTAINER PARA OS ÍCONES DE STATUS
        // ==========================================
        let oldBoard = document.getElementById(combatant.type + '-status-board');
        if (oldBoard) oldBoard.remove();

        let statusWrapper = document.createElement('div');
        statusWrapper.id = combatant.type + '-status-board';
        statusWrapper.style.cssText = "position: absolute; top: -25px; left: 50%; transform: translateX(-50%); display: flex; flex-wrap: wrap-reverse; justify-content: center; gap: 4px; width: 180px; pointer-events: none; z-index: 10001;";
        
        // Adiciona logo acima das barrinhas de golpes
        if (container.parentElement) {
            container.parentElement.appendChild(statusWrapper);
        }
    },

    // FUNÇÃO QUE DESENHA AS INSÍGNIAS DE STATUS DINAMICAMENTE
    renderStatusUI(combatant) {
        let board = document.getElementById(combatant.type + '-status-board');
        if (!board) return;
        board.innerHTML = ''; // Limpa

        const addBadge = (text, bg, color='white') => {
            let b = document.createElement('div');
            b.innerText = text;
            b.style.cssText = `background: ${bg}; color: ${color}; font-size: 9px; font-family: Arial, sans-serif; font-weight: bold; padding: 2px 5px; border-radius: 6px; text-shadow: 1px 1px 0 rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 1px 3px rgba(0,0,0,0.4); transition: all 0.2s ease;`;
            board.appendChild(b);
        };

        // Status Negativos Fixos
        if (combatant.status) {
            let cMap = { 'BRN': '#EE8130', 'PAR': '#F7D02C', 'PSN': '#A33EA1', 'TOX': '#800080', 'SLP': '#A8A77A', 'FRZ': '#66CCFF' };
            addBadge(combatant.status, cMap[combatant.status] || '#777');
        }
        
        // Status Voláteis (Some com o tempo)
        if (combatant.confusionTurns > 0) addBadge('🌀', '#E91E63');
        if (combatant.isSeeded) addBadge('🌱', '#7AC74C');

        // Modificadores de Status (Buffs e Debuffs de Stages)
        let statLabels = { atk: 'ATK', def: 'DEF', spAtk: 'SPA', spDef: 'SPD', spd: 'SPE', crit: 'CRT' };
        for (let stat in combatant.modifiers) {
            let val = combatant.modifiers[stat];
            if (val !== 0) {
                let sign = val > 0 ? '+' : '';
                let bg = val > 0 ? '#4CAF50' : '#ef4444';
                addBadge(`${statLabels[stat]} ${sign}${val}`, bg);
            }
        }
    },

    tick(currentTime) {
        if (!this.isRunning) return;

        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.updateMoves(this.player, this.enemy, deltaTime);
        if (!this.isRunning) return; 

        this.updateMoves(this.enemy, this.player, deltaTime);

        if (this.isRunning) {
            this.loopAnimation = requestAnimationFrame((t) => this.tick(t));
        }
    },

    updateMoves(attacker, defender, deltaTime) {
        let speedMult = this.speedMultiplier || 1;
        
        // CALCULA A VELOCIDADE DINÂMICA (Stages + Paralysis)
        let dynSpdMult = window.BattleSystem.getStageMultiplier(attacker.modifiers.spd);
        if (attacker.status === 'PAR') dynSpdMult *= 0.5; 
        
        let speedFactor = Math.max(10, (attacker.stats.Speed * dynSpdMult)) / 60;
        if (speedFactor > 3) speedFactor = 3; 

        for (let i = 0; i < attacker.moves.length; i++) {
            if (!this.isRunning) return;
            
            let moveObj = attacker.moves[i];
            moveObj.cooldown += (deltaTime * speedMult * speedFactor); 
            
            let pct = (moveObj.cooldown / moveObj.maxCooldown) * 100;
            if (pct > 100) pct = 100;
            
            if (moveObj.uiFill) moveObj.uiFill.style.height = `${pct}%`; 

// MODIFICADO: Sistema de trava do auto-ataque e brilho visual
            if (moveObj.cooldown >= moveObj.maxCooldown) {
                
                // Se for o Player E o Modo Ativo estiver ligado...
                if (attacker.type === 'player' && window.ExploreEngine && window.ExploreEngine.activeMode) {
                    moveObj.cooldown = moveObj.maxCooldown; // Fica travado no máximo
                    if (moveObj.uiSlot) moveObj.uiSlot.style.boxShadow = "0 0 8px 3px white"; // Acende um brilho para avisar que está pronto!
                } else {
                    // Se o Modo Ativo estiver desligado (ou for o Inimigo atuando), atira sozinho
                    moveObj.cooldown = 0; 
                    this.fireAttack(attacker, defender, moveObj);
                    if (moveObj.uiSlot) moveObj.uiSlot.style.boxShadow = "0 2px 4px rgba(0,0,0,0.5)";
                }
                
            } else {
                // Garante que o slot fique sem brilho enquanto está enchendo
                if (moveObj.uiSlot) moveObj.uiSlot.style.boxShadow = "0 2px 4px rgba(0,0,0,0.5)";
            }
        }
    },

    fireAttack(attacker, defender, moveObj) {
        if (!this.isRunning) return;

        // ==========================================
        // 1. CHECAGEM DE STATUS QUE IMPEDEM O ATAQUE
        // ==========================================
        if (attacker.status === 'FRZ') {
            if (Math.random() < 0.20) {
                attacker.status = null;
                this.showCustomText(attacker.spriteElementId, "Descongelou!", "#66CCFF");
                this.renderStatusUI(attacker);
            } else {
                this.showCustomText(attacker.spriteElementId, "Congelado!", "#66CCFF");
                return;
            }
        }

        if (attacker.status === 'SLP') {
            attacker.statusTurns--;
            if (attacker.statusTurns <= 0) {
                attacker.status = null;
                this.showCustomText(attacker.spriteElementId, "Acordou!", "#A8A77A");
                this.renderStatusUI(attacker);
            } else {
                this.showCustomText(attacker.spriteElementId, "Dormindo zZz", "#A8A77A");
                return;
            }
        }

        if (attacker.status === 'PAR' && Math.random() < 0.25) {
            this.showCustomText(attacker.spriteElementId, "Paralisado!", "#F7D02C");
            return;
        }

        if (attacker.confusionTurns > 0) {
            attacker.confusionTurns--;
            this.renderStatusUI(attacker);
            if (Math.random() < 0.33) {
                this.showCustomText(attacker.spriteElementId, "Confuso!", "#E91E63");
                let selfDmg = Math.max(1, Math.floor(attacker.maxHp * 0.05)); 
                this.applyDamageTo(attacker, selfDmg);
                return; // Perde o turno se bater na confusão
            } else if (attacker.confusionTurns === 0) {
                this.showCustomText(attacker.spriteElementId, "Lúcido!", "#A8A77A");
            }
        }

        // ==========================================
        // 2. INVESTIDA DO ATACANTE
        // ==========================================
        if (moveObj.uiSlot) {
            moveObj.uiSlot.classList.remove('wbm-firing');
            void moveObj.uiSlot.offsetWidth; 
            moveObj.uiSlot.classList.add('wbm-firing');
        }

        let attackerEl = document.getElementById(attacker.spriteElementId);
        let defenderEl = document.getElementById(defender.spriteElementId);

        let dir = 1;
        if (attackerEl && defenderEl) {
            let aRect = attackerEl.getBoundingClientRect();
            let dRect = defenderEl.getBoundingClientRect();
            dir = aRect.left < dRect.left ? 1 : -1;
        }

        let isPlayerAtk = attacker.type === 'player';
        let bScaleAtk = (isPlayerAtk && window.baseScale) ? window.baseScale : 1;
        let isPlayerDef = defender.type === 'player';
        let bScaleDef = (isPlayerDef && window.baseScale) ? window.baseScale : 1;

        if (attackerEl) {
            attackerEl.style.transition = "transform 0.1s ease-in, filter 0.1s";
            attackerEl.style.transform = `translateX(${30 * dir}px) scale(${bScaleAtk})`;
            attackerEl.style.filter = "brightness(120%) drop-shadow(2px 4px 6px rgba(0,0,0,0.5))";
            setTimeout(() => {
                if (attackerEl) {
                    attackerEl.style.transition = "transform 0.2s ease-out, filter 0.2s";
                    attackerEl.style.transform = `translateX(0px) scale(${bScaleAtk})`;
                    attackerEl.style.filter = "drop-shadow(2px 4px 6px rgba(0,0,0,0.3))";
                }
            }, 150);
        }

        // ==========================================
        // 3. ANÁLISE DE GOLPES DE STATUS E DANO
        // ==========================================
        let moveName = moveObj.data.Name;
        let isStatusMove = moveObj.data.Category === "Status" || !moveObj.data.Power || moveObj.data.Power === "-";
        let result = { damage: 0, effectiveness: 1, isCrit: false, msg: "Status" };

        if (isStatusMove) {
            let dict = window.BattleSystem.MOVE_EFFECTS;
            let appliedSomething = false;

            if (dict.buffs[moveName]) {
                let b = dict.buffs[moveName];
                if (b.hpCost && attacker.currentHp > (attacker.maxHp * b.hpCost)) {
                    this.applyDamageTo(attacker, Math.floor(attacker.maxHp * b.hpCost));
                }
                for (let stat in b) {
                    if (stat !== 'hpCost') {
                        attacker.modifiers[stat] += b[stat];
                        if(attacker.modifiers[stat] > 6) attacker.modifiers[stat] = 6;
                    }
                }
                this.showCustomText(attacker.spriteElementId, "Buffed!", "#4CAF50");
                appliedSomething = true;
            } 
            else if (dict.debuffs[moveName]) {
                let d = dict.debuffs[moveName];
                for (let stat in d) {
                    defender.modifiers[stat] += d[stat];
                    if(defender.modifiers[stat] < -6) defender.modifiers[stat] = -6;
                }
                this.showCustomText(defender.spriteElementId, "Debuffed!", "#E91E63");
                appliedSomething = true;
            } 
            else if (dict.status[moveName]) {
                let s = dict.status[moveName];
                if (s.includes("CONFUSION") && defender.confusionTurns === 0) {
                    defender.confusionTurns = Math.floor(Math.random() * 3) + 2;
                    this.showCustomText(defender.spriteElementId, "Confuso!", "#E91E63");
                    if (s === "CONFUSION_BUFF") defender.modifiers.atk = Math.min(6, defender.modifiers.atk + 2);
                    appliedSomething = true;
                } else if (s === "LEECH_SEED" && !defender.isSeeded) {
                    defender.isSeeded = true;
                    this.showCustomText(defender.spriteElementId, "Seeded!", "#7AC74C");
                    appliedSomething = true;
                } else if (!defender.status && !s.includes("CONFUSION") && s !== "LEECH_SEED") {
                    defender.status = s;
                    if (s === 'SLP') defender.statusTurns = Math.floor(Math.random() * 3) + 2;
                    let colorMap = { 'BRN': '#EE8130', 'PAR': '#F7D02C', 'PSN': '#A33EA1', 'TOX': '#A33EA1', 'SLP': '#A8A77A', 'FRZ': '#66CCFF' };
                    this.showCustomText(defender.spriteElementId, s, colorMap[s]);
                    appliedSomething = true;
                }
            }
            
            if (!appliedSomething) {
                this.showFloatingText(defender.spriteElementId, result); 
            } else {
                // Atualiza o HUD visual após aplicar o efeito
                this.renderStatusUI(attacker);
                this.renderStatusUI(defender);
            }

        } else {
            result = window.BattleSystem.calculateDamage(attacker, defender, moveObj.data);
            
            setTimeout(() => {
                if (!this.isRunning) return;

                if (result.effectiveness === 0) {
                    if (defenderEl) {
                        defenderEl.style.transition = "transform 0.1s ease-out";
                        defenderEl.style.transform = `translateX(${30 * dir}px) scale(${bScaleDef})`; 
                        setTimeout(() => { if (defenderEl) { defenderEl.style.transition = "transform 0.2s ease-in"; defenderEl.style.transform = `translateX(0px) scale(${bScaleDef})`; } }, 150);
                    }
                } else if (result.isCrit) {
                    if (defenderEl) {
                        defenderEl.style.transition = "transform 0.05s ease-out";
                        defenderEl.style.transform = `translateX(${-45 * dir}px) scale(${bScaleDef})`;
                        let img = defenderEl.tagName === 'IMG' ? defenderEl : defenderEl.querySelector('img');
                        if (!img) img = defenderEl;
                        if (img) { img.style.transition = "filter 0.05s"; img.style.filter = "brightness(250%) drop-shadow(0 0 15px #FF9800)"; }
                        setTimeout(() => {
                            if (defenderEl) { defenderEl.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"; defenderEl.style.transform = `translateX(0px) scale(${bScaleDef})`; }
                            if (img) { img.style.transition = "filter 0.3s"; img.style.filter = "drop-shadow(2px 4px 6px rgba(0,0,0,0.3))"; }
                        }, 150);
                    }
                } else {
                    if (defenderEl) {
                        defenderEl.style.transition = "transform 0.05s ease-in";
                        defenderEl.style.transform = `translateX(${10 * dir}px) scale(${bScaleDef})`;
                        let img = defenderEl.tagName === 'IMG' ? defenderEl : defenderEl.querySelector('img');
                        if (!img) img = defenderEl;
                        if (img) { img.style.transition = "filter 0.1s"; img.style.filter = "brightness(200%) drop-shadow(0 0 10px red)"; }
                        setTimeout(() => { if (defenderEl) defenderEl.style.transform = `translateX(${-5 * dir}px) scale(${bScaleDef})`; }, 50);
                        setTimeout(() => {
                            if (defenderEl) { defenderEl.style.transition = "transform 0.1s ease-out"; defenderEl.style.transform = `translateX(0px) scale(${bScaleDef})`; }
                            if (img) { img.style.transition = "filter 0.2s"; img.style.filter = "drop-shadow(2px 4px 6px rgba(0,0,0,0.3))"; }
                        }, 150);
                    }
                }

                this.applyDamageTo(defender, result.damage);
                this.showFloatingText(defender.spriteElementId, result);

                // Lógica de Dreno
                if (result.damage > 0 && window.BattleSystem.MOVE_EFFECTS.drains.includes(moveName)) {
                    let healAmount = Math.max(1, Math.floor(result.damage / 2));
                    this.applyHealTo(attacker, healAmount);
                }
            }, 100); 
        }

        // ==========================================
        // 4. PROCESSAMENTO DE DoT (Damage over Time)
        // ==========================================
        setTimeout(() => {
            if (!this.isRunning) return;

            if (attacker.status === 'BRN' || attacker.status === 'PSN' || attacker.status === 'TOX') {
                let divisor = attacker.status === 'BRN' ? 16 : 8; 
                let dotDmg = Math.max(1, Math.floor(attacker.maxHp / divisor));
                let cMap = { 'BRN': '#EE8130', 'PSN': '#A33EA1', 'TOX': '#800080' };
                this.showCustomText(attacker.spriteElementId, `-${dotDmg} ${attacker.status}`, cMap[attacker.status]);
                this.applyDamageTo(attacker, dotDmg);
            }

            if (attacker.isSeeded) {
                let seedDmg = Math.max(1, Math.floor(attacker.maxHp / 16));
                this.showCustomText(attacker.spriteElementId, `-${seedDmg} Seed`, "#7AC74C");
                this.applyDamageTo(attacker, seedDmg);
                this.applyHealTo(defender, seedDmg);
            }

            this.checkDeaths();
        }, 150); 
    },

    applyDamageTo(combatant, amount) {
        if (!this.isRunning || amount <= 0) return;
        combatant.currentHp -= amount;
        if (combatant.currentHp < 0) combatant.currentHp = 0;
        
        if (combatant.type === 'player' && this.callbacks.onPlayerHpChange) {
            this.callbacks.onPlayerHpChange(combatant.currentHp, combatant.maxHp);
        } else if (combatant.type === 'enemy' && this.callbacks.onEnemyHpChange) {
            this.callbacks.onEnemyHpChange(combatant.currentHp, combatant.maxHp);
        }
    },

    applyHealTo(combatant, amount) {
        if (!this.isRunning || amount <= 0 || combatant.currentHp <= 0) return;
        combatant.currentHp += amount;
        if (combatant.currentHp > combatant.maxHp) combatant.currentHp = combatant.maxHp;
        
        if (combatant.type === 'player' && this.callbacks.onPlayerHpChange) {
            this.callbacks.onPlayerHpChange(combatant.currentHp, combatant.maxHp);
        } else if (combatant.type === 'enemy' && this.callbacks.onEnemyHpChange) {
            this.callbacks.onEnemyHpChange(combatant.currentHp, combatant.maxHp);
        }
        this.showCustomText(combatant.spriteElementId, `+${amount}`, "#4CAF50");
    },

    checkDeaths() {
        if (!this.isRunning) return;
        if (this.enemy && this.enemy.currentHp <= 0) {
            this.stop();
            if (this.callbacks.onWin) this.callbacks.onWin();
        } else if (this.player && this.player.currentHp <= 0) {
            this.stop();
            if (this.callbacks.onLose) this.callbacks.onLose();
        }
    },

    showFloatingText(targetSpriteId, battleResult) {
        // BLOQUEIO DO MODO DOPAMINA
        if (window.dopamineMode === false) return;
        
        let targetEl = document.getElementById(targetSpriteId);
        if (!targetEl) return;
        let rect = targetEl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return; 
        
        let floatEl = document.createElement('div');
        floatEl.className = 'wbm-dmg-text';
        
        let text = `-${battleResult.damage}`;
        if (battleResult.msg === "Status" || battleResult.effectiveness === 0) {
            text = battleResult.effectiveness === 0 ? "Imune!" : "Miss!";
            floatEl.classList.add(battleResult.effectiveness === 0 ? 'wbm-dmg-immune' : 'wbm-dmg-miss');
        } else if (battleResult.isCrit) {
            text += " (Crit!)"; floatEl.classList.add('wbm-dmg-crit');
        } else if (battleResult.effectiveness > 1) {
            text += " (Super!)"; floatEl.classList.add('wbm-dmg-super');
        } else if (battleResult.effectiveness < 1) {
            floatEl.classList.add('wbm-dmg-weak');
        } else {
            floatEl.classList.add('wbm-dmg-normal');
        }

        floatEl.innerText = text;
        let offsetX = (Math.random() * 30) - 15;
        floatEl.style.left = (rect.left + (rect.width / 2) + offsetX) + 'px';
        floatEl.style.top = (rect.top + 10) + 'px';
        document.body.appendChild(floatEl);

        setTimeout(() => { if (document.body.contains(floatEl)) document.body.removeChild(floatEl); }, 1000);
    },

    showCustomText(targetSpriteId, text, colorCode) {
        // BLOQUEIO DO MODO DOPAMINA
        if (window.dopamineMode === false) return;
        
        let targetEl = document.getElementById(targetSpriteId);
        if (!targetEl) return;
        let rect = targetEl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return; 
        
        let floatEl = document.createElement('div');
        floatEl.className = 'wbm-dmg-text'; 
        floatEl.style.color = colorCode;
        floatEl.innerText = text;
        
        let offsetX = (Math.random() * 40) - 20;
        floatEl.style.left = (rect.left + (rect.width / 2) + offsetX) + 'px';
        floatEl.style.top = (rect.top - 15) + 'px'; 

        document.body.appendChild(floatEl);
        setTimeout(() => { if (document.body.contains(floatEl)) document.body.removeChild(floatEl); }, 1200);
    }
};