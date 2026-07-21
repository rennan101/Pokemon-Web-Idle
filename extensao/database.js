// ==========================================
// BANCO DE DADOS GLOBAL DE NOMES (Para conversão)
// ==========================================
window.globalPokemonNames = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot", "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran-f", "Nidorina", "Nidoqueen", "Nidoran-m", "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag", "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop", "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool", "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash", "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetchd", "Doduo", "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder", "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb", "Electrode", "Exeggcute", "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie", "Mr-mime", "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Snorlax", "Articuno", "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew",
  "Chikorita", "Bayleef", "Meganium", "Cyndaquil", "Quilava", "Typhlosion", "Totodile", "Croconaw", "Feraligatr", "Sentret", "Furret", "Hoothoot", "Noctowl", "Ledyba", "Ledian", "Spinarak", "Ariados", "Crobat", "Chinchou", "Lanturn", "Pichu", "Cleffa", "Igglybuff", "Togepi", "Togetic", "Natu", "Xatu", "Mareep", "Flaaffy", "Ampharos", "Bellossom", "Marill", "Azumarill", "Sudowoodo", "Politoed", "Hoppip", "Skiploom", "Jumpluff", "Aipom", "Sunkern", "Sunflora", "Yanma", "Wooper", "Quagsire", "Espeon", "Umbreon", "Murkrow", "Slowking", "Misdreavus", "Unown", "Wobbuffet", "Girafarig", "Pineco", "Forretress", "Dunsparce", "Gligar", "Steelix", "Snubbull", "Granbull", "Qwilfish", "Scizor", "Shuckle", "Heracross", "Sneasel", "Teddiursa", "Ursaring", "Slugma", "Magcargo", "Swinub", "Piloswine", "Corsola", "Remoraid", "Octillery", "Delibird", "Mantine", "Skarmory", "Houndour", "Houndoom", "Kingdra", "Phanpy", "Donphan", "Porygon2", "Stantler", "Smeargle", "Tyrogue", "Hitmontop", "Smoochum", "Elekid", "Magby", "Miltank", "Blissey", "Raikou", "Entei", "Suicune", "Larvitar", "Pupitar", "Tyranitar", "Lugia", "Ho-Oh", "Celebi",
  "Treecko", "Grovyle", "Sceptile", "Torchic", "Combusken", "Blaziken", "Mudkip", "Marshtomp", "Swampert", "Poochyena", "Mightyena", "Zigzagoon", "Linoone", "Wurmple", "Silcoon", "Beautifly", "Cascoon", "Dustox", "Lotad", "Lombre", "Ludicolo", "Seedot", "Nuzleaf", "Shiftry", "Taillow", "Swellow", "Wingull", "Pelipper", "Ralts", "Kirlia", "Gardevoir", "Surskit", "Masquerain", "Shroomish", "Breloom", "Slakoth", "Vigoroth", "Slaking", "Nincada", "Ninjask", "Shedinja", "Whismur", "Loudred", "Exploud", "Makuhita", "Hariyama", "Azurill", "Nosepass", "Skitty", "Delcatty", "Sableye", "Mawile", "Aron", "Lairon", "Aggron", "Meditite", "Medicham", "Electrike", "Manectric", "Plusle", "Minun", "Volbeat", "Illumise", "Roselia", "Gulpin", "Swalot", "Carvanha", "Sharpedo", "Wailmer", "Wailord", "Numel", "Camerupt", "Torkoal", "Spoink", "Grumpig", "Spinda", "Trapinch", "Vibrava", "Flygon", "Cacnea", "Cacturne", "Swablu", "Altaria", "Zangoose", "Seviper", "Lunatone", "Solrock", "Barboach", "Whiscash", "Corphish", "Crawdaunt", "Baltoy", "Claydol", "Lileep", "Cradily", "Anorith", "Armaldo", "Feebas", "Milotic", "Castform", "Kecleon", "Shuppet", "Banette", "Duskull", "Dusclops", "Tropius", "Chimecho", "Absol", "Wynaut", "Snorunt", "Glalie", "Spheal", "Sealeo", "Walrein", "Clamperl", "Huntail", "Gorebyss", "Relicanth", "Luvdisc", "Bagon", "Shelgon", "Salamence", "Beldum", "Metang", "Metagross", "Regirock", "Regice", "Registeel", "Latias", "Latios", "Kyogre", "Groudon", "Rayquaza", "Jirachi", "Deoxys",
  "Turtwig", "Grotle", "Torterra", "Chimchar", "Monferno", "Infernape", "Piplup", "Prinplup", "Empoleon", "Starly", "Staravia", "Staraptor", "Bidoof", "Bibarel", "Kricketot", "Kricketune", "Shinx", "Luxio", "Luxray", "Budew", "Roserade", "Cranidos", "Rampardos", "Shieldon", "Bastiodon", "Burmy", "Wormadam", "Mothim", "Combee", "Vespiquen", "Pachirisu", "Buizel", "Floatzel", "Cherubi", "Cherrim", "Shellos", "Gastrodon", "Ambipom", "Drifloon", "Drifblim", "Buneary", "Lopunny", "Mismagius", "Honchkrow", "Glameow", "Purugly", "Chingling", "Stunky", "Skuntank", "Bronzor", "Bronzong", "Bonsly", "Mime-jr", "Happiny", "Chatot", "Spiritomb", "Gible", "Gabite", "Garchomp", "Munchlax", "Riolu", "Lucario", "Hippopotas", "Hippowdon", "Skorupi", "Drapion", "Croagunk", "Toxicroak", "Carnivine", "Finneon", "Lumineon", "Mantyke", "Snover", "Abomasnow", "Weavile", "Magnezone", "Lickilicky", "Rhyperior", "Tangrowth", "Electivire", "Magmortar", "Togekiss", "Yanmega", "Leafeon", "Glaceon", "Gliscor", "Mamoswine", "Porygon-Z", "Gallade", "Probopass", "Dusknoir", "Froslass", "Rotom", "Uxie", "Mesprit", "Azelf", "Dialga", "Palkia", "Heatran", "Regigigas", "Giratina", "Cresselia", "Phione", "Manaphy", "Darkrai", "Shaymin", "Arceus",
  "Victini", "Snivy", "Servine", "Serperior", "Tepig", "Pignite", "Emboar", "Oshawott", "Dewott", "Samurott", "Patrat", "Watchog", "Lillipup", "Herdier", "Stoutland", "Purrloin", "Liepard", "Pansage", "Simisage", "Pansear", "Simisear", "Panpour", "Simipour", "Munna", "Musharna", "Pidove", "Tranquill", "Unfezant", "Blitzle", "Zebstrika", "Roggenrola", "Boldore", "Gigalith", "Woobat", "Swoobat", "Drilbur", "Excadrill", "Audino", "Timburr", "Gurdurr", "Conkeldurr", "Tympole", "Palpitoad", "Seismitoad", "Throh", "Sawk", "Sewaddle", "Swadloon", "Leavanny", "Venipede", "Whirlipede", "Scolipede", "Cottonee", "Whimsicott", "Petilil", "Lilligant", "Basculin", "Sandile", "Krokorok", "Krookodile", "Darumaka", "Darmanitan", "Maractus", "Dwebble", "Crustle", "Scraggy", "Scrafty", "Sigilyph", "Yamask", "Cofagrigus", "Tirtouga", "Carracosta", "Archen", "Archeops", "Trubbish", "Garbodor", "Zorua", "Zoroark", "Minccino", "Cinccino", "Gothita", "Gothorita", "Gothitelle", "Solosis", "Duosion", "Reuniclus", "Ducklett", "Swanna", "Vanillite", "Vanillish", "Vanilluxe", "Deerling", "Sawsbuck", "Emolga", "Karrablast", "Escavalier", "Foongus", "Amoonguss", "Frillish", "Jellicent", "Alomomola", "Joltik", "Galvantula", "Ferroseed", "Ferrothorn", "Klink", "Klang", "Klinklang", "Tynamo", "Eelektrik", "Eelektross", "Elgyem", "Beheeyem", "Litwick", "Lampent", "Chandelure", "Axew", "Fraxure", "Haxorus", "Cubchoo", "Beartic", "Cryogonal", "Shelmet", "Accelgor", "Stunfisk", "Mienfoo", "Mienshao", "Druddigon", "Golett", "Golurk", "Pawniard", "Bisharp", "Bouffalant", "Rufflet", "Braviary", "Vullaby", "Mandibuzz", "Heatmor", "Durant", "Deino", "Zweilous", "Hydreigon", "Larvesta", "Volcarona", "Cobalion", "Terrakion", "Virizion", "Tornadus", "Thundurus", "Reshiram", "Zekrom", "Landorus", "Kyurem", "Keldeo", "Meloetta", "Genesect",
  "Chespin", "Quilladin", "Chesnaught", "Fennekin", "Braixen", "Delphox", "Froakie", "Frogadier", "Greninja", "Bunnelby", "Diggersby", "Fletchling", "Fletchinder", "Talonflame", "Scatterbug", "Spewpa", "Vivillon", "Litleo", "Pyroar", "Flabebe", "Floette", "Florges", "Skiddo", "Gogoat", "Pancham", "Pangoro", "Furfrou", "Espurr", "Meowstic", "Honedge", "Doublade", "Aegislash", "Spritzee", "Aromatisse", "Swirlix", "Slurpuff", "Inkay", "Malamar", "Binacle", "Barbaracle", "Skrelp", "Dragalge", "Clauncher", "Clawitzer", "Helioptile", "Heliolisk", "Tyrunt", "Tyrantrum", "Amaura", "Aurorus", "Sylveon", "Hawlucha", "Dedenne", "Carbink", "Goomy", "Sliggoo", "Goodra", "Klefki", "Phantump", "Trevenant", "Pumpkaboo", "Gourgeist", "Bergmite", "Avalugg", "Noibat", "Noivern", "Xerneas", "Yveltal", "Zygarde", "Diancie", "Hoopa", "Volcanion",
  "Rowlet", "Dartrix", "Decidueye", "Litten", "Torracat", "Incineroar", "Popplio", "Brionne", "Primarina", "Pikipek", "Trumbeak", "Toucannon", "Yungoos", "Gumshoos", "Grubbin", "Charjabug", "Vikavolt", "Crabrawler", "Crabominable", "Oricorio", "Cutiefly", "Ribombee", "Rockruff", "Lycanroc", "Wishiwashi", "Mareanie", "Toxapex", "Mudbray", "Mudsdale", "Dewpider", "Araquanid", "Fomantis", "Lurantis", "Morelull", "Shiinotic", "Salandit", "Salazzle", "Stufful", "Bewear", "Bounsweet", "Steenee", "Tsareena", "Comfey", "Oranguru", "Passimian", "Wimpod", "Golisopod", "Sandygast", "Palossand", "Pyukumuku", "Type-null", "Silvally", "Minior", "Komala", "Turtonator", "Togedemaru", "Mimikyu", "Bruxish", "Drampa", "Dhelmise", "Jangmo-o", "Hakamo-o", "Kommo-o", "Tapu Koko", "Tapu Lele", "Tapu Bulu", "Tapu Fini", "Cosmog", "Cosmoem", "Solgaleo", "Lunala", "Nihilego", "Buzzwole", "Pheromosa", "Xurkitree", "Celesteela", "Kartana", "Guzzlord", "Necrozma", "Magearna", "Marshadow", "Poipole", "Naganadel", "Stakataka", "Blacephalon", "Zeraora", "Meltan", "Melmetal",
  "Grookey", "Thwackey", "Rillaboom", "Scorbunny", "Raboot", "Cinderace", "Sobble", "Drizzile", "Inteleon", "Skwovet", "Greedent", "Rookidee", "Corvisquire", "Corviknight", "Blipbug", "Dottler", "Orbeetle", "Nickit", "Thievul", "Gossifleur", "Eldegoss", "Wooloo", "Dubwool", "Chewtle", "Drednaw", "Yamper", "Boltund", "Rolycoly", "Carkol", "Coalossal", "Applin", "Flapple", "Appletun", "Silicobra", "Sandaconda", "Cramorant", "Arrokuda", "Barraskewda", "Toxel", "Toxtricity", "Sizzlipede", "Centiskorch", "Clobbopus", "Grapploct", "Sinistea", "Polteageist", "Hatenna", "Hattrem", "Hatterene", "Impidimp", "Morgrem", "Grimmsnarl", "Obstagoon", "Perrserker", "Cursola", "Sirfetchd", "Mr-rime", "Runerigus", "Milcery", "Alcremie", "Falinks", "Pincurchin", "Snom", "Frosmoth", "Stonjourner", "Eiscue", "Indeedee", "Morpeko", "Cufant", "Copperajah", "Dracozolt", "Arctozolt", "Dracovish", "Arctovish", "Duraludon", "Dreepy", "Drakloak", "Dragapult", "Zacian", "Zamazenta", "Eternatus", "Kubfu", "Urshifu", "Zarude", "Regieleki", "Regidrago", "Glastrier", "Spectrier", "Calyrex", "Wyrdeer", "Kleavor", "Ursaluna", "Basculegion", "Sneasler", "Overqwil", "Enamorus",
  "Sprigatito", "Floragato", "Meowscarada", "Fuecoco", "Crocalor", "Skeledirge", "Quaxly", "Quaxwell", "Quaquaval", "Lechonk", "Oinkologne", "Tarountula", "Spidops", "Nymble", "Lokix", "Pawmi", "Pawmo", "Pawmot", "Tandemaus", "Maushold", "Fidough", "Dachsbun", "Smoliv", "Dolliv", "Arboliva", "Squawkabilly", "Nacli", "Naclstack", "Garganacl", "Charcadet", "Armarouge", "Ceruledge", "Tadbulb", "Bellibolt", "Wattrel", "Kilowattrel", "Maschiff", "Mabosstiff", "Shroodle", "Grafaiai", "Bramblin", "Brambleghast", "Toedscool", "Toedscruel", "Klawf", "Capsakid", "Scovillain", "Rellor", "Rabsca", "Flittle", "Espathra", "Tinkatink", "Tinkatuff", "Tinkaton", "Wiglett", "Wugtrio", "Bombirdier", "Finizen", "Palafin", "Varoom", "Revavroom", "Cyclizar", "Orthworm", "Glimmet", "Glimmora", "Greavard", "Houndstone", "Flamigo", "Cetoddle", "Cetitan", "Veluza", "Dondozo", "Tatsugiri", "Annihilape", "Clodsire", "Farigiraf", "Dudunsparce", "Kingambit", "Great Tusk", "Scream Tail", "Brute Bonnet", "Flutter Mane", "Slither Wing", "Sandy Shocks", "Iron Treads", "Iron Bundle", "Iron Hands", "Iron Jugulis", "Iron Moth", "Iron Thorns", "Frigibax", "Arctibax", "Baxcalibur", "Gimmighoul", "Gholdengo", "Wo-Chien", "Chien-Pao", "Ting-Lu", "Chi-Yu", "Roaring Moon", "Iron Valiant", "Koraidon", "Miraidon", "Walking Wake", "Iron Leaves", "Dipplin", "Poltchageist", "Sinistcha", "Okidogi", "Munkidori", "Fezandipiti", "Ogerpon", "Archaludon", "Hydrapple", "Gouging Fire", "Raging Bolt", "Iron Boulder", "Iron Crown", "Terapagos", "Pecharunt"
];

// ==========================================
// BANCO DE DADOS: MUNDO E REGIÕES
// ==========================================
var gameDatabase = {
  regions: [
    {
      id: "gen1_kanto", name: "Kanto (Gen 1)",
      cities: [
        { name: "Pallet Town" }, { name: "Viridian City" }, { name: "Pewter City" }, { name: "Cerulean City" }, { name: "Vermilion City" }, { name: "Lavender Town" }, { name: "Celadon City" }, { name: "Fuchsia City" }, { name: "Saffron City" }, { name: "Cinnabar Island" }, { name: "Indigo Plateau" }
      ]
    },
    {
      id: "gen2_johto", name: "Johto (Gen 2)",
      cities: [
        { name: "New Bark Town" }, { name: "Cherrygrove City" }, { name: "Violet City" }, { name: "Azalea Town" }, { name: "Goldenrod City" }, { name: "Ecruteak City" }, { name: "Olivine City" }, { name: "Cianwood City" }, { name: "Mahogany Town" }, { name: "Blackthorn City" }, { name: "Mt. Silver" }
      ]
    },
    {
      id: "gen3_hoenn", name: "Hoenn (Gen 3)",
      cities: [
        { name: "Littleroot Town" }, { name: "Oldale Town" }, { name: "Petalburg City" }, { name: "Rustboro City" }, { name: "Dewford Town" }, { name: "Slateport City" }, { name: "Mauville City" }, { name: "Verdanturf Town" }, { name: "Fallarbor Town" }, { name: "Lavaridge Town" }, { name: "Fortree City" }, { name: "Lilycove City" }, { name: "Mossdeep City" }, { name: "Sootopolis City" }, { name: "Pacifidlog Town" }, { name: "Ever Grande City" }
      ]
    },
    {
      id: "gen4_sinnoh", name: "Sinnoh (Gen 4)",
      cities: [
        { name: "Twinleaf Town" }, { name: "Sandgem Town" }, { name: "Jubilife City" }, { name: "Oreburgh City" }, { name: "Floaroma Town" }, { name: "Eterna City" }, { name: "Hearthome City" }, { name: "Solaceon Town" }, { name: "Veilstone City" }, { name: "Pastoria City" }, { name: "Celestic Town" }, { name: "Canalave City" }, { name: "Snowpoint City" }, { name: "Sunyshore City" }, { name: "Pokémon League" }
      ]
    },
    {
      id: "gen5_unova", name: "Unova (Gen 5)",
      cities: [
        { name: "Nuvema Town" }, { name: "Accumula Town" }, { name: "Striaton City" }, { name: "Nacrene City" }, { name: "Castelia City" }, { name: "Nimbasa City" }, { name: "Driftveil City" }, { name: "Mistralton City" }, { name: "Icirrus City" }, { name: "Opelucid City" }, { name: "Lacunosa Town" }, { name: "Undella Town" }, { name: "Unova Pokémon League" }
      ]
    },
    {
      id: "gen6_kalos", name: "Kalos (Gen 6)",
      cities: [
        { name: "Vaniville Town" }, { name: "Aquacorde Town" }, { name: "Santalune City" }, { name: "Lumiose City" }, { name: "Camphrier Town" }, { name: "Cyllage City" }, { name: "Ambrette Town" }, { name: "Geosenge Town" }, { name: "Shalour City" }, { name: "Coumarine City" }, { name: "Laverre City" }, { name: "Dendemille Town" }, { name: "Anistar City" }, { name: "Kiloude City" }
      ]
    },
    {
      id: "gen7_alola", name: "Alola (Gen 7)",
      cities: [
        { name: "Iki Town" }, { name: "Hau'oli City" }, { name: "Heahea City" }, { name: "Paniola Town" }, { name: "Konikoni City" }, { name: "Malie City" }, { name: "Tapu Village" }, { name: "Seafolk Village" }, { name: "Altar of the Sunne" }, { name: "Alola Pokémon League" }
      ]
    },
    {
      id: "gen8_galar", name: "Galar & Hisui (Gen 8)",
      cities: [
        { name: "Postwick" }, { name: "Wedgehurst" }, { name: "Motostoke" }, { name: "Turffield" }, { name: "Hulbury" }, { name: "Hammerlocke" }, { name: "Stow-on-Side" }, { name: "Ballonlea" }, { name: "Circhester" }, { name: "Spikemuth" }, { name: "Wyndon" }, { name: "Jubilife Village" }
      ]
    },
    {
      id: "gen9_paldea", name: "Paldea (Gen 9)",
      cities: [
        { name: "Cabo Poco" }, { name: "Los Platos" }, { name: "Mesagoza" }, { name: "Cortondo" }, { name: "Artazon" }, { name: "Levincia" }, { name: "Zapapico" }, { name: "Cascarrafa" }, { name: "Medali" }, { name: "Porto Marinada" }, { name: "Montenevera" }, { name: "Alfornada" }, { name: "Mossui Town" }, { name: "Blueberry Academy" }
      ]
    }
  ]
};

// ==========================================
// LISTA DE ENCONTROS (Extraídos do Documento do Usuário)
// ==========================================
var rawEncounters = {
  "Pallet Town": "Bulbasaur, Charmander, Squirtle, Pidgey, Rattata",
  "Viridian City": "Caterpie, Metapod, Butterfree, Weedle, Kakuna, Beedrill, Pidgey, Pidgeotto, Pidgeot, Rattata, Raticate, Spearow, Fearow, Pikachu",
  "Pewter City": "Sandshrew, Sandslash, Nidoran-f, Nidorina, Nidoqueen, Nidoran-m, Nidorino, Nidoking, Clefairy, Clefable, Geodude, Graveler, Golem, Onix, Zubat, Golbat",
  "Cerulean City": "Oddish, Gloom, Vileplume, Bellsprout, Weepinbell, Victreebel, Psyduck, Golduck, Poliwag, Poliwhirl, Poliwrath, Goldeen, Seaking, Staryu, Starmie, Horsea, Seadra",
  "Vermilion City": "Magnemite, Magneton, Voltorb, Electrode, Raichu, Krabby, Kingler, Shellder, Cloyster, Tentacool, Tentacruel, Magikarp, Gyarados, Charmeleon ",
  "Lavender Town": "Gastly, Haunter, Gengar, Cubone, Marowak, Drowzee, Hypno",
  "Celadon City": "Meowth, Persian, Eevee, Vaporeon, Jolteon, Flareon, Porygon, Grimer, Muk, Ivysaur",
  "Fuchsia City": "Paras, Parasect, Venonat, Venomoth, Exeggcute, Exeggutor, Koffing, Weezing, Tangela, Kangaskhan, Tauros, Ditto, Chansey, Scyther, Pinsir",
  "Saffron City": "Abra, Kadabra, Alakazam, Machop, Machoke, Machamp, Hitmonlee, Hitmonchan, Mr-mime, Jynx",
  "Cinnabar Island": "Growlithe, Arcanine, Vulpix, Ninetales, Ponyta, Rapidash, Omanyte, Omastar, Kabuto, Kabutops, Aerodactyl, Magmar, Wartortle",
  "Indigo Plateau": "Venusaur, Charizard, Blastoise, Mankey, Primeape, Diglett, Dugtrio, Farfetchd, Doduo, Dodrio, Lickitung, Rhyhorn, Rhydon, Slowpoke, Slowbro, Dewgong, Seel, Dragonair, Dragonite, Dratini, Snorlax, Lapras, Electabuzz, Articuno, Zapdos, Moltres, Mewtwo, Mew",
  
  "New Bark Town": "Chikorita, Bayleef, Meganium, Cyndaquil, Quilava, Typhlosion, Totodile, Croconaw, Feraligatr",
  "Cherrygrove City": "Sentret, Furret, Hoothoot, Noctowl, Ledyba, Ledian, Spinarak, Ariados",
  "Violet City": "Mareep, Flaaffy, Ampharos, Hoppip, Skiploom, Jumpluff, Aipom, Sunkern, Sunflora",
  "Azalea Town": "Yanma, Wooper, Quagsire, Pineco, Forretress, Heracross",
  "Goldenrod City": "Snubbull, Granbull, Dunsparce, Girafarig, Miltank, Smeargle, Porygon2",
  "Ecruteak City": "Misdreavus, Murkrow, Natu, Xatu, Sneasel, Stantler, Eevee, Espeon, Umbreon, Unown",
  "Olivine City": "Chinchou, Lanturn, Remoraid, Octillery, Mantine, Corsola, Delibird",
  "Cianwood City": "Marill, Azumarill, Politoed, Qwilfish, Shuckle",
  "Mahogany Town": "Swinub, Piloswine, Teddiursa, Ursaring, Slugma, Magcargo",
  "Blackthorn City": "Gligar, Skarmory, Phanpy, Donphan, Tyrogue, Hitmontop",
  "Mt. Silver": "Raikou, Entei, Suicune, Lugia, Ho-Oh, Celebi, Larvitar, Pupitar, Tyranitar",
  
  "Littleroot Town": "Treecko, Grovyle, Sceptile, Torchic, Combusken, Blaziken, Mudkip, Marshtomp, Swampert",
  "Oldale Town": "Poochyena, Mightyena, Zigzagoon, Linoone, Wurmple, Silcoon, Beautifly, Cascoon, Dustox, Wingull, Pelipper",
  "Petalburg City": "Ralts, Kirlia, Gardevoir, Slakoth, Vigoroth, Slaking, Seedot, Nuzleaf, Shiftry, Taillow, Swellow",
  "Rustboro City": "Nincada, Ninjask, Shedinja, Whismur, Loudred, Exploud, Aron, Lairon, Aggron, Nosepass, Skitty, Delcatty",
  "Dewford Town": "Makuhita, Hariyama, Sableye, Mawile, Meditite, Medicham",
  "Slateport City": "Electrike, Manectric, Plusle, Minun, Volbeat, Illumise, Gulpin, Swalot",
  "Mauville City": "Roselia, Oddish, Bellsprout, Numel, Camerupt, Torkoal, Spoink, Grumpig",
  "Verdanturf Town": "Shroomish, Breloom, Slugma, Magcargo, Spinda",
  "Fallarbor Town": "Trapinch, Vibrava, Flygon, Cacnea, Cacturne, Swablu, Altaria",
  "Lavaridge Town": "Baltoy, Claydol, Koffing, Grimer, Solrock",
  "Fortree City": "Tropius, Kecleon, Absol, Castform",
  "Lilycove City": "Carvanha, Sharpedo, Wailmer, Wailord, Luvdisc",
  "Mossdeep City": "Lunatone, Solrock, Chimecho, Beldum, Metang, Metagross",
  "Sootopolis City": "Corphish, Crawdaunt, Feebas, Milotic, Clamperl, Huntail, Gorebyss, Relicanth",
  "Pacifidlog Town": "Barboach, Whiscash, Lileep, Cradily, Anorith, Armaldo",
  "Ever Grande City": "Seviper, Zangoose, Banette, Shuppet, Duskull, Dusclops, Snorunt, Glalie, Spheal, Sealeo, Walrein, Regirock, Regice, Registeel, Latias, Latios, Kyogre, Groudon, Rayquaza, Jirachi, Deoxys, Bagon, Shelgon, Salamence",
  
  "Twinleaf Town": "Turtwig, Grotle, Torterra, Chimchar, Monferno, Infernape, Piplup, Prinplup, Empoleon",
  "Sandgem Town": "Starly, Staravia, Staraptor, Bidoof, Bibarel, Kricketot, Kricketune, Shinx, Luxio, Luxray",
  "Jubilife City": "Buizel, Floatzel, Pachirisu, Ambipom, Chatot",
  "Oreburgh City": "Cranidos, Rampardos, Shieldon, Bastiodon, Burmy, Wormadam, Mothim",
  "Floaroma Town": "Budew, Roserade, Cherubi, Cherrim, Combee, Vespiquen",
  "Eterna City": "Bonsly, Mime-jr, Happiny, Spiritomb, Bronzor, Bronzong",
  "Hearthome City": "Glameow, Purugly, Buneary, Lopunny, Munchlax",
  "Solaceon Town": "Riolu, Lucario, Hippopotas, Hippowdon",
  "Veilstone City": "Croagunk, Toxicroak, Stunky, Skuntank",
  "Pastoria City": "Shellos, Gastrodon, Finneon, Lumineon",
  "Celestic Town": "Chingling, Carnivine, Yanmega, Tangrowth",
  "Canalave City": "Mantyke, Phione, Manaphy",
  "Snowpoint City": "Snover, Abomasnow, Weavile, Glaceon, Froslass",
  "Sunyshore City": "Magnezone, Electivire, Leafeon, Probopass, Dusknoir, Porygon-Z, Gallade",
  "Pokémon League": "Gible, Gabite, Garchomp, Uxie, Mesprit, Azelf, Dialga, Palkia, Giratina, Heatran, Regigigas, Cresselia, Darkrai, Shaymin, Arceus, Rotom",
  
  "Nuvema Town": "Snivy, Servine, Serperior, Tepig, Pignite, Emboar, Oshawott, Dewott, Samurott",
  "Accumula Town": "Patrat, Watchog, Lillipup, Herdier, Stoutland, Purrloin, Liepard",
  "Striaton City": "Pansage, Simisage, Pansear, Simisear, Panpour, Simipour, Munna, Musharna",
  "Nacrene City": "Pidove, Tranquill, Unfezant, Roggenrola, Boldore, Gigalith, Woobat, Swoobat, Timburr, Gurdurr, Conkeldurr, Audino",
  "Castelia City": "Sewaddle, Swadloon, Leavanny, Venipede, Whirlipede, Scolipede, Basculin, Sandile, Krokorok, Krookodile, Darumaka, Darmanitan",
  "Nimbasa City": "Blitzle, Zebstrika, Scraggy, Scrafty, Trubbish, Garbodor, Minccino, Cinccino, Gothita, Gothorita, Gothitelle, Solosis, Duosion, Reuniclus",
  "Driftveil City": "Ducklett, Swanna, Vanillite, Vanillish, Vanilluxe, Deerling, Sawsbuck, Emolga, Foongus, Amoonguss",
  "Mistralton City": "Joltik, Galvantula, Ferroseed, Ferrothorn, Klink, Klang, Klinklang, Elgyem, Beheeyem, Litwick, Lampent, Chandelure",
  "Icirrus City": "Cubchoo, Beartic, Cryogonal, Frillish, Jellicent, Alomomola",
  "Opelucid City": "Axew, Fraxure, Haxorus, Druddigon, Golett, Golurk, Bouffalant, Rufflet, Braviary, Vullaby, Mandibuzz",
  "Lacunosa Town": "Tynamo, Eelektrik, Eelektross, Shelmet, Accelgor, Karrablast, Escavalier, Stunfisk, Durant, Heatmor",
  "Undella Town": "Tirtouga, Carracosta, Archen, Archeops, Maractus, Sigilyph",
  "Unova Pokémon League": "Larvesta, Volcarona, Deino, Zweilous, Hydreigon, Cobalion, Terrakion, Virizion, Tornadus, Thundurus, Landorus, Reshiram, Zekrom, Kyurem, Victini, Keldeo, Meloetta, Genesect",
  
  "Vaniville Town": "Chespin, Quilladin, Chesnaught, Fennekin, Braixen, Delphox, Froakie, Frogadier, Greninja",
  "Aquacorde Town": "Bunnelby, Diggersby, Fletchling, Fletchinder, Talonflame",
  "Santalune City": "Scatterbug, Spewpa, Vivillon, Litleo, Pyroar",
  "Lumiose City": "Flabebe, Floette, Florges, Espurr, Meowstic, Honedge, Doublade, Aegislash, Spritzee, Aromatisse, Swirlix, Slurpuff",
  "Camphrier Town": "Skiddo, Gogoat, Pancham, Pangoro",
  "Cyllage City": "Binacle, Barbaracle, Helioptile, Heliolisk",
  "Ambrette Town": "Tyrunt, Tyrantrum, Amaura, Aurorus",
  "Geosenge Town": "Inkay, Malamar, Carbink",
  "Shalour City": "Hawlucha, Clauncher, Clawitzer, Skrelp, Dragalge",
  "Coumarine City": "Goomy, Sliggoo, Goodra, Dedenne",
  "Laverre City": "Klefki, Phantump, Trevenant, Pumpkaboo, Gourgeist",
  "Dendemille Town": "Bergmite, Avalugg, Noibat, Noivern",
  "Anistar City": "Xerneas, Yveltal, Zygarde",
  "Kiloude City": "Diancie, Hoopa, Volcanion",
  
  "Iki Town": "Rowlet, Dartrix, Decidueye, Litten, Torracat, Incineroar, Popplio, Brionne, Primarina",
  "Hau'oli City": "Pikipek, Trumbeak, Toucannon, Yungoos, Gumshoos, Grubbin, Charjabug, Vikavolt, Crabrawler",
  "Heahea City": "Cutiefly, Ribombee, Rockruff, Lycanroc, Wishiwashi, Mareanie, Toxapex",
  "Paniola Town": "Mudbray, Mudsdale, Fomantis, Lurantis, Morelull, Shiinotic, Salandit, Salazzle",
  "Konikoni City": "Stufful, Bewear, Bounsweet, Steenee, Tsareena, Comfey, Oranguru, Passimian",
  "Malie City": "Wimpod, Golisopod, Sandygast, Palossand, Pyukumuku, Type-null, Silvally",
  "Tapu Village": "Minior, Komala, Turtonator, Togedemaru, Bruxish, Drampa",
  "Seafolk Village": "Jangmo-o, Hakamo-o, Kommo-o, Dhelmise, Mimikyu, Bruxish, Pyukumuku",
  "Altar of the Sunne": "Cosmog, Cosmoem, Solgaleo, Lunala, Necrozma",
  "Alola Pokémon League": "Tapu Koko, Tapu Lele, Tapu Bulu, Tapu Fini, Nihilego, Buzzwole, Pheromosa, Xurkitree, Celesteela, Kartana, Guzzlord, Poipole, Naganadel, Stakataka, Blacephalon, Magearna, Marshadow, Zeraora, Meltan, Melmetal",
  
  "Postwick": "Grookey, Thwackey, Rillaboom, Scorbunny, Raboot, Cinderace, Sobble, Drizzile, Inteleon",
  "Wedgehurst": "Skwovet, Greedent, Rookidee, Corvisquire, Corviknight, Blipbug, Dottler, Orbeetle, Nickit, Thievul",
  "Motostoke": "Gossifleur, Eldegoss, Wooloo, Dubwool, Yamper, Boltund, Chewtle, Drednaw",
  "Turffield": "Rolycoly, Carkol, Coalossal, Applin, Flapple, Appletun, Silicobra, Sandaconda",
  "Hulbury": "Arrokuda, Barraskewda, Cramorant, Toxel, Toxtricity",
  "Hammerlocke": "Sizzlipede, Centiskorch, Clobbopus, Grapploct, Sinistea, Polteageist, Hatenna, Hattrem, Hatterene",
  "Stow-on-Side": "Impidimp, Morgrem, Grimmsnarl, Milcery, Alcremie, Falinks",
  "Ballonlea": "Pincurchin, Snom, Frosmoth, Indeedee, Morpeko",
  "Circhester": "Cufant, Copperajah, Eiscue, Stonjourner",
  "Spikemuth": "Duraludon, Dreepy, Drakloak, Dragapult, Obstagoon, Perrserker",
  "Wyndon": "Zacian, Zamazenta, Eternatus, Kubfu, Urshifu, Regieleki, Regidrago, Glastrier, Spectrier, Calyrex, Zarude",
  "Jubilife Village": "Wyrdeer, Kleavor, Ursaluna, Basculegion, Sneasler, Overqwil, Enamorus",
  
  "Cabo Poco": "Sprigatito, Floragato, Meowscarada, Fuecoco, Crocalor, Skeledirge, Quaxly, Quaxwell, Quaquaval",
  "Los Platos": "Lechonk, Oinkologne, Tarountula, Spidops, Nymble, Lokix, Pawmi, Pawmo, Pawmot",
  "Mesagoza": "Tandemaus, Maushold, Fidough, Dachsbun, Smoliv, Dolliv, Arboliva, Squawkabilly, Bramblin, Brambleghast, Toedscool, Toedscruel, Great Tusk, Scream Tail, Brute Bonnet, Flutter Mane, Slither Wing, Sandy Shocks, Iron Treads, Iron Bundle, Iron Hands, Iron Jugulis, Iron Moth, Iron Thorns, Roaring Moon, Iron Valiant",
  "Cortondo": "Nacli, Naclstack, Garganacl, Capsakid, Scovillain",
  "Artazon": "Rellor, Rabsca, Flittle, Espathra, Wiglett, Wugtrio",
  "Levincia": "Bellibolt, Wattrel, Kilowattrel, Varoom, Revavroom",
  "Zapapico": "Charcadet, Armarouge, Ceruledge, Tadbulb",
  "Cascarrafa": "Finizen, Palafin, Veluza, Dondozo, Tatsugiri",
  "Medali": "Greavard, Houndstone, Flamigo, Orthworm, Glimmet, Glimmora",
  "Porto Marinada": "Bombirdier, Klawf, Shroodle, Grafaiai",
  "Montenevera": "Cetoddle, Cetitan, Frigibax, Arctibax, Baxcalibur",
  "Alfornada": "Kingambit, Annihilape, Farigiraf, Dudunsparce, Clodsire",
  "Mossui Town": "Poltchageist, Sinistcha, Dipplin, Hydrapple, Okidogi, Munkidori, Fezandipiti, Ogerpon",
  "Blueberry Academy": "Archaludon, Gouging Fire, Raging Bolt, Iron Boulder, Iron Crown, Terapagos, Pecharunt"
};

var globalOrderCount = 1;

// GERADOR DINÂMICO DE DIFICULDADE E MAPPING
gameDatabase.regions.forEach((region) => {
  region.cities.forEach(city => {
    city.id = city.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    city.order = globalOrderCount++;
    city.enemiesPerWave = 4 + Math.floor(city.order / 4);

    // Mapeamento automático dos encontros com base no texto rawEncounters
    if (rawEncounters[city.name]) {
      city.encounters = [];
      var pokeNames = rawEncounters[city.name].split(",");
      pokeNames.forEach(p => {
        var cleanName = p.trim().replace(/ \(.*?\)/g, "").replace("♀", "-f").replace("♂", "-m").replace("Mr. Mime", "Mr-mime").replace("Mime Jr.", "Mime-jr").replace("Type: Null", "Type-null").replace("Farfetch'd", "Farfetchd").replace("Flabébé", "Flabebe").replace("Pinchurchin", "Pincurchin");
        var pokeId = globalPokemonNames.findIndex(n => n.toLowerCase() === cleanName.toLowerCase()) + 1;
        if (pokeId > 0) {
          city.encounters.push({ pokemonId: pokeId, minLevel: Math.max(2, city.order * 2), maxLevel: Math.max(4, city.order * 2 + 5), weight: 10, isBoss: false });
        }
      });
    }

    // Fallback: Se a cidade falhar em mapear por algum motivo, ele sorteia Pokémon da Região I
    if (!city.encounters || city.encounters.length === 0) {
      city.encounters = [{ pokemonId: 1, minLevel: Math.max(2, city.order * 2), maxLevel: Math.max(4, city.order * 2 + 5), weight: 10, isBoss: false }];
    }
  });
});

// ==========================================
// FUNÇÕES AUXILIARES DO BANCO DE DADOS
// ==========================================
var DatabaseHelper = {
  getCityById: function(cityId) {
    for (const region of gameDatabase.regions) {
      const city = region.cities.find(c => c.id === cityId);
      if (city) return city;
    }
    return null;
  },
  getCityByOrder: function(orderNum) {
    for (const region of gameDatabase.regions) {
      const city = region.cities.find(c => c.order === orderNum);
      if (city) return city;
    }
    return null;
  },
  getCityByName: function(cityName) {
    for (const region of gameDatabase.regions) {
      const city = region.cities.find(c => c.name === cityName);
      if (city) return city;
    }
    return null;
  },
  rollEncounter: function(cityId) {
    const city = this.getCityById(cityId);
    if (!city || !city.encounters) return null;
    const totalWeight = city.encounters.reduce((sum, encounter) => sum + encounter.weight, 0);
    let randomNum = Math.random() * totalWeight;
    for (const encounter of city.encounters) {
      if (randomNum < encounter.weight) {
        const rolledLevel = Math.floor(Math.random() * (encounter.maxLevel - encounter.minLevel + 1)) + encounter.minLevel;
        return { pokemonId: encounter.pokemonId, level: rolledLevel, isBoss: encounter.isBoss };
      }
      randomNum -= encounter.weight;
    }
    return { pokemonId: city.encounters[0].pokemonId, level: city.encounters[0].minLevel, isBoss: false };
  }
};