export const generationsData = {
    1: { start: 1, end: 151, folder: "Generation 1 Pokemon" }, 
    2: { start: 152, end: 251, folder: "Generation 2 Pokemon" }, 
    3: { start: 252, end: 386, folder: "Generation 3 Pokemon" }, 
    4: { start: 387, end: 493, folder: "Generation 4 Pokemon" }, 
    5: { start: 494, end: 649, folder: "Generation 5 Pokemon" }, 
    6: { start: 650, end: 721, folder: "Generation 6 Pokemon" }, 
    7: { start: 722, end: 809, folder: "Generation 7 Pokemon" }, 
    8: { start: 810, end: 905, folder: "Generation 8 Pokemon" }, 
    9: { start: 906, end: 1025, folder: "Generation 9 Pokemon" }
};
  
export const pokemonNames = window.pokemonDB ? window.pokemonDB.map(p => p.Name) : [];
  
export const I18N = {
    pt: {
        catched: "Capturado", back: "← Voltar",
        pokedex: "Pokédex", settings: "Configurações", search: "Pesquise um pokemon", adopt: "Adotar Novo Ovo",
        adopt_limit: "Limite de Adoções Atingido", a11y: "Acessibilidade", glass: "Aparência de vidro",
        dopamine: "Modo Dopamina", handedness: "Lateralidade", language: "Idioma", disclaimer_title: "Disclaimer",
        disclaimer_text: "Este aplicativo é um projeto independente feito por fãs e não é afiliado, endossado, patrocinado ou aprovado de forma alguma pela The Pokémon Company, Creatures Inc., Nintendo Co., Ltd. ou qualquer uma de suas subsidiárias.<br><br>Imagens, nomes de personagens, sons e marcas registradas de Pokémon são propriedade de seus respectivos donos. Nenhuma violação de direitos autorais é intencional. Todo o conteúdo é utilizado exclusivamente para fins informativos e de entretenimento.",
        stats: "Estatísticas e Dados", export_save: "Exportar Save", import_save: "Importar Save", ram: "Uso de memória ram", cache: "Uso de memória em cache", delete: "Deletar Progresso",
        created_by: "Criado por", warning: "Aviso", warning_text: "Isso irá apagar tudo conquistado até agora (pokedex, pokemons, bolsa, e jornada). Deseja continuar?",
        no: "Não", yes: "Sim", right: "Destro", left: "Canhoto", lang_pt: "Português", lang_en: "English", calc: "Calculando...",
        blocked_run: "Ação bloqueada! Termine ou fuja da exploração primeiro antes de gerar novos ovos.",
        blocked_lat: "Ação bloqueada! Termine ou fuja da exploração primeiro para alterar a lateralidade.",
        blocked_city: "Ação bloqueada! Você não pode trocar de Pokémon enquanto explora uma cidade.",
        bag_full: "O seu inventário de ovos está cheio (40/40). Se você trocar agora, o ovo equipado será perdido. Deseja continuar?",
        bag_full_new: "O seu inventário de ovos está cheio (40/40). Se você gerar um novo agora, o ovo atualmente equipado será perdido. Deseja continuar?",
        fps: "Taxa de Atualização (FPS)", cpu: "Uso de CPU", gpu: "Uso de GPU", nature: "Natureza",
        glass_tooltip: "Ajusta a transparência para simular um efeito de vidro líquido. Funciona melhor no navegador Safari.",
        dopamine_tooltip: "Ativa ou desativa todas as animações de batalha e efeitos visuais do jogo.",
        egg_battle_block: "Ovos não podem batalhar!", 
        active_mode: "Modo Ativo", active_mode_tooltip: "Desativa os ataques automáticos. Use Q, W, E, R para disparar os golpes manualmente."
    },
    en: {
        catched: "Catched", back: "← Back",
        pokedex: "Pokédex", settings: "Settings", search: "Search for a Pokémon", adopt: "Adopt New Egg",
        adopt_limit: "Adoption Limit Reached", a11y: "Accessibility", glass: "Glass Appearance",
        dopamine: "Dopamine Mode", handedness: "Handedness", language: "Language", disclaimer_title: "Disclaimer",
        disclaimer_text: "This application is an independent fan-made project and is not affiliated, endorsed, sponsored, or approved in any way by The Pokémon Company, Creatures Inc., Nintendo Co., Ltd., or any of their subsidiaries.<br><br>Pokémon images, character names, sounds, and trademarks are the property of their respective owners. No copyright infringement is intended. All content is used exclusively for informational and entertainment purposes.",
        stats: "Statistics and Data", export_save: "Export Save", import_save: "Import Save", ram: "RAM Memory Usage", cache: "Cache Memory Usage", delete: "Delete Progress",
        created_by: "Created By", warning: "Warning", warning_text: "This will delete everything achieved so far (Pokédex, Pokémon, Bag, and Journey). Do you want to continue?",
        no: "No", yes: "Yes", right: "Right-Handed", left: "Left-Handed", lang_pt: "Português", lang_en: "English", calc: "Calculating...",
        blocked_run: "Action Blocked! Finish or flee the exploration first before generating new eggs.",
        blocked_lat: "Action Blocked! Finish or flee the exploration first to change handedness.",
        blocked_city: "Action Blocked! You cannot change Pokémon while exploring a city.",
        bag_full: "Your egg inventory is full (40/40). If you switch now, the equipped egg will be lost. Do you wish to continue?",
        bag_full_new: "Your egg inventory is full (40/40). If you generate a new one now, the currently equipped egg will be lost. Do you wish to continue?",
        fps: "Refresh Rate (FPS)", cpu: "CPU Usage", gpu: "GPU Usage", nature: "Nature",
        glass_tooltip: "Adjusts transparency to simulate a liquid glass effect. Works best on the Safari browser.",
        dopamine_tooltip: "Enables or disables all battle animations and visual effects in the game.",
        egg_battle_block: "Eggs can't battle!",
        active_mode: "Active Mode", active_mode_tooltip: "Disables auto-attacks. Press Q, W, E, R to fire moves manually."
    }
};
  
export const TYPE_COLORS = {
    Normal: '#A8A77A', Fire: '#EE8130', Water: '#6390F0', Electric: '#F7D02C',
    Grass: '#7AC74C', Ice: '#66CCFF', Fighting: '#C22E28', Poison: '#A33EA1',
    Ground: '#E2BF65', Flying: '#A98FF3', Psychic: '#F95587', Bug: '#A6B91A',
    Rock: '#B6A136', Ghost: '#6666BB', Dragon: '#7766EE', Dark: '#775544',
    Steel: '#B7B7CE', Fairy: '#D685AD'
};
  
export const TYPES_ROW_1 = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground"];
export const TYPES_ROW_2 = ["Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];
export const STAT_KEYS = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
export const SECRET_SALT = "wbm_elemental_pet";

export const NATURES = {
    Hardy: { plus: null, minus: null, pt: "Hardy (Neutra)", en: "Hardy (Neutral)" },
    Lonely: { plus: "Attack", minus: "Defense", pt: "Sozinho (+Atk, -Def)", en: "Lonely (+Atk, -Def)" },
    Brave: { plus: "Attack", minus: "Speed", pt: "Corajoso (+Atk, -Spd)", en: "Brave (+Atk, -Spd)" },
    Adamant: { plus: "Attack", minus: "Sp. Atk", pt: "Inflexível (+Atk, -SpA)", en: "Adamant (+Atk, -SpA)" },
    Naughty: { plus: "Attack", minus: "Sp. Def", pt: "Travesso (+Atk, -SpD)", en: "Naughty (+Atk, -SpD)" },
    Bold: { plus: "Defense", minus: "Attack", pt: "Audacioso (+Def, -Atk)", en: "Bold (+Def, -Atk)" },
    Docile: { plus: null, minus: null, pt: "Dócil (Neutra)", en: "Docile (Neutral)" },
    Relaxed: { plus: "Defense", minus: "Speed", pt: "Relaxado (+Def, -Spd)", en: "Relaxed (+Def, -Spd)" },
    Impish: { plus: "Defense", minus: "Sp. Atk", pt: "Maroto (+Def, -SpA)", en: "Impish (+Def, -SpA)" },
    Lax: { plus: "Defense", minus: "Sp. Def", pt: "Lax (+Def, -SpD)", en: "Lax (+Def, -SpD)" },
    Timid: { plus: "Speed", minus: "Attack", pt: "Tímido (+Spd, -Atk)", en: "Timid (+Spd, -Atk)" },
    Hasty: { plus: "Speed", minus: "Defense", pt: "Apressado (+Spd, -Def)", en: "Hasty (+Spd, -Def)" },
    Serious: { plus: null, minus: null, pt: "Sério (Neutra)", en: "Serious (Neutral)" },
    Jolly: { plus: "Speed", minus: "Sp. Atk", pt: "Alegre (+Spd, -SpA)", en: "Jolly (+Spd, -SpA)" },
    Naive: { plus: "Speed", minus: "Sp. Def", pt: "Ingênuo (+Spd, -SpD)", en: "Naive (+Spd, -SpD)" },
    Modest: { plus: "Sp. Atk", minus: "Attack", pt: "Modesto (+SpA, -Atk)", en: "Modest (+SpA, -Atk)" },
    Mild: { plus: "Sp. Atk", minus: "Defense", pt: "Leve (+SpA, -Def)", en: "Mild (+SpA, -Def)" },
    Quiet: { plus: "Sp. Atk", minus: "Speed", pt: "Quieto (+SpA, -Spd)", en: "Quiet (+SpA, -Spd)" },
    Bashful: { plus: null, minus: null, pt: "Peculiar (Neutra)", en: "Bashful (Neutral)" },
    Rash: { plus: "Sp. Atk", minus: "Sp. Def", pt: "Irritadiço (+SpA, -SpD)", en: "Rash (+SpA, -SpD)" },
    Calm: { plus: "Sp. Def", minus: "Attack", pt: "Calmo (+SpD, -Atk)", en: "Calm (+SpD, -Atk)" },
    Gentle: { plus: "Sp. Def", minus: "Defense", pt: "Gentil (+SpD, -Def)", en: "Gentle (+SpD, -Def)" },
    Sassy: { plus: "Sp. Def", minus: "Speed", pt: "Irreverente (+SpD, -Spd)", en: "Sassy (+SpD, -Spd)" },
    Careful: { plus: "Sp. Def", minus: "Sp. Atk", pt: "Cuidadoso (+SpD, -SpA)", en: "Careful (+SpD, -SpA)" },
    Quirky: { plus: null, minus: null, pt: "Excêntrico (Neutra)", en: "Quirky (Neutral)" }
};