export type EnemyKind = 'normal' | 'elite' | 'miniboss' | 'boss';
export type ItemSlot = 'weapon' | 'armor' | 'consumable';

export type ShopItem = {
  id: string;
  name: string;
  icon: string;
  slot: ItemSlot;
  price: number;
  powerBonus?: number;
  defenseBonus?: number;
  description: string;
  tone: string;
};

export type Enemy = {
  id: string;
  name: string;
  kind: EnemyKind;
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  xp: number;
  col: number;
  description: string;
  wave: number;
  cycle: number;
};

type EnemyTemplate = Omit<Enemy, 'id' | 'hp' | 'wave' | 'cycle'>;

export type FloorDefinition = {
  id: number;
  name: string;
  subtitle: string;
  bossName: string;
  encountersToBoss: number;
  minibossAt: number;
  enemies: EnemyTemplate[];
  minibosses: EnemyTemplate[];
  boss: EnemyTemplate;
};

export type PlayerState = {
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  power: number;
  defense: number;
  critChance: number;
  col: number;
  crowns: number;
  highestFloor: number;
  selectedFloor: number;
  floorWins: Record<number, number>;
  floorCycles: Record<number, number>;
  defeatedBosses: number[];
  totalKills: number;
  weaponDurability: number;
  maxWeaponDurability: number;
  armorDurability: number;
  maxArmorDurability: number;
  potions: number;
  inventory: string[];
  equippedWeapon: string | null;
  equippedArmor: string | null;
};

export type SavedGame = {
  player: PlayerState;
  enemy: Enemy;
  log: string;
  battleWon: boolean;
  gameOver: boolean;
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'starter-blade', name: 'Клинок рассвета', icon: '🗡️', slot: 'weapon', price: 180, powerBonus: 5, description: 'Лёгкий клинок для быстрых серий ударов.', tone: 'cyan' },
  { id: 'mist-saber', name: 'Сабля тумана', icon: '⚔️', slot: 'weapon', price: 520, powerBonus: 12, description: 'Усиливает урон свайп-комбо.', tone: 'violet' },
  { id: 'scarlet-edge', name: 'Алый клинок', icon: '🔪', slot: 'weapon', price: 1250, powerBonus: 24, description: 'Тяжёлое оружие охотника на боссов.', tone: 'red' },
  { id: 'scout-coat', name: 'Плащ разведчика', icon: '🧥', slot: 'armor', price: 240, defenseBonus: 4, description: 'Базовая защита для первых этажей.', tone: 'blue' },
  { id: 'forest-guard', name: 'Доспех лесного стража', icon: '🛡️', slot: 'armor', price: 690, defenseBonus: 10, description: 'Крепкая броня с зелёными вставками.', tone: 'green' },
  { id: 'void-armor', name: 'Доспех бездны', icon: '🥋', slot: 'armor', price: 1600, defenseBonus: 20, description: 'Редкий комплект для высоких этажей.', tone: 'black' },
  { id: 'small-potion', name: 'Малое зелье', icon: '🧪', slot: 'consumable', price: 35, description: 'Восстанавливает 45 HP в бою.', tone: 'pink' },
];

const floor = (
  id: number,
  name: string,
  subtitle: string,
  enemies: EnemyTemplate[],
  minibosses: EnemyTemplate[],
  boss: EnemyTemplate,
  encountersToBoss = 10,
): FloorDefinition => ({ id, name, subtitle, bossName: boss.name, encountersToBoss, minibossAt: Math.floor(encountersToBoss / 2), enemies, minibosses, boss });

export const FLOORS: FloorDefinition[] = [
  floor(1, 'Луга Начала', 'Зелёные равнины у подножия башни', [
    { name: 'Дикий кабан', kind: 'normal', level: 1, maxHp: 34, attack: 7, defense: 1, xp: 22, col: 25, description: 'Агрессивный зверь, защищающий пастбища.' },
    { name: 'Луговой волк', kind: 'normal', level: 2, maxHp: 42, attack: 9, defense: 2, xp: 28, col: 32, description: 'Быстрый хищник, атакующий сериями.' },
    { name: 'Колючий слизень', kind: 'normal', level: 2, maxHp: 38, attack: 8, defense: 3, xp: 25, col: 29, description: 'Медленный моб с плотной оболочкой.' },
    { name: 'Полевой гоблин', kind: 'normal', level: 3, maxHp: 50, attack: 11, defense: 3, xp: 34, col: 39, description: 'Вооружён коротким копьём.' },
    { name: 'Клыкастый вепрь', kind: 'elite', level: 3, maxHp: 68, attack: 13, defense: 4, xp: 52, col: 64, description: 'Элитный зверь с усиленной шкурой.' },
  ], [
    { name: 'Разоритель лугов', kind: 'miniboss', level: 4, maxHp: 115, attack: 17, defense: 5, xp: 105, col: 135, description: 'Мини-босс, собравший вокруг себя стаю.' },
    { name: 'Белый клык', kind: 'miniboss', level: 4, maxHp: 108, attack: 19, defense: 4, xp: 112, col: 140, description: 'Редкий вожак волков.' },
  ], { name: 'Вожак клыков', kind: 'boss', level: 5, maxHp: 185, attack: 23, defense: 7, xp: 190, col: 240, description: 'Хозяин первого этажа.' }),

  floor(2, 'Туманный лес', 'Лес, где враги скрываются в густом тумане', [
    { name: 'Туманный волк', kind: 'normal', level: 5, maxHp: 76, attack: 16, defense: 5, xp: 65, col: 78, description: 'Появляется из тумана и быстро отступает.' },
    { name: 'Ядовитая паучиха', kind: 'normal', level: 6, maxHp: 68, attack: 18, defense: 4, xp: 72, col: 84, description: 'Её укусы ослабляют защиту.' },
    { name: 'Лесной бес', kind: 'normal', level: 6, maxHp: 82, attack: 17, defense: 6, xp: 76, col: 90, description: 'Прячется среди старых деревьев.' },
    { name: 'Моховой медведь', kind: 'elite', level: 7, maxHp: 122, attack: 23, defense: 8, xp: 118, col: 138, description: 'Тяжёлый элитный противник.' },
    { name: 'Лесной страж', kind: 'elite', level: 7, maxHp: 105, attack: 21, defense: 9, xp: 105, col: 125, description: 'Древнее существо с крепкой корой.' },
  ], [
    { name: 'Мать пауков', kind: 'miniboss', level: 8, maxHp: 210, attack: 29, defense: 9, xp: 230, col: 285, description: 'Мини-босс глубокой чащи.' },
    { name: 'Хранитель тумана', kind: 'miniboss', level: 8, maxHp: 225, attack: 27, defense: 11, xp: 240, col: 300, description: 'Управляет плотностью тумана.' },
  ], { name: 'Серый хищник', kind: 'boss', level: 9, maxHp: 350, attack: 36, defense: 12, xp: 410, col: 520, description: 'Огромный волк, повелевающий туманом.' }),

  floor(3, 'Каменный каньон', 'Расколотые скалы и древние шахты', [
    { name: 'Пещерный гоблин', kind: 'normal', level: 9, maxHp: 125, attack: 28, defense: 9, xp: 120, col: 145, description: 'Вооружён ржавым клинком и ловушками.' },
    { name: 'Каменный жук', kind: 'normal', level: 10, maxHp: 145, attack: 27, defense: 13, xp: 135, col: 155, description: 'Медленный, но хорошо защищённый враг.' },
    { name: 'Шахтный кобольд', kind: 'normal', level: 10, maxHp: 132, attack: 31, defense: 10, xp: 142, col: 168, description: 'Атакует киркой из темноты.' },
    { name: 'Кристальный скорпион', kind: 'elite', level: 11, maxHp: 205, attack: 36, defense: 15, xp: 205, col: 245, description: 'Его панцирь отражает слабые удары.' },
    { name: 'Малый голем', kind: 'elite', level: 11, maxHp: 195, attack: 34, defense: 16, xp: 190, col: 230, description: 'Ожившая каменная конструкция.' },
  ], [
    { name: 'Горный тролль', kind: 'miniboss', level: 12, maxHp: 355, attack: 47, defense: 19, xp: 410, col: 510, description: 'Мини-босс, перекрывший проход.' },
    { name: 'Кристальный голем', kind: 'miniboss', level: 12, maxHp: 380, attack: 44, defense: 23, xp: 430, col: 535, description: 'Собирает энергию из стен каньона.' },
  ], { name: 'Каменный страж', kind: 'boss', level: 13, maxHp: 620, attack: 58, defense: 25, xp: 760, col: 980, description: 'Страж древних ворот каньона.' }),

  floor(4, 'Озёрный край', 'Затопленные руины под холодным небом', [
    { name: 'Водный дух', kind: 'normal', level: 13, maxHp: 210, attack: 43, defense: 17, xp: 210, col: 260, description: 'Меняет форму и избегает прямых ударов.' },
    { name: 'Озёрный страж', kind: 'normal', level: 14, maxHp: 235, attack: 47, defense: 20, xp: 235, col: 285, description: 'Защищает руины под водой.' },
    { name: 'Болотный ящер', kind: 'normal', level: 14, maxHp: 245, attack: 45, defense: 22, xp: 248, col: 300, description: 'Прячется в мелководье.' },
    { name: 'Сирена руин', kind: 'elite', level: 15, maxHp: 290, attack: 54, defense: 21, xp: 310, col: 380, description: 'Её голос сбивает ритм атак.' },
    { name: 'Ледяной краб', kind: 'elite', level: 15, maxHp: 320, attack: 51, defense: 27, xp: 325, col: 400, description: 'Тяжёлая бронированная тварь.' },
  ], [
    { name: 'Глубинный змей', kind: 'miniboss', level: 16, maxHp: 520, attack: 67, defense: 27, xp: 610, col: 760, description: 'Мини-босс затопленных руин.' },
    { name: 'Страж водоворота', kind: 'miniboss', level: 16, maxHp: 545, attack: 64, defense: 30, xp: 635, col: 790, description: 'Создаёт защитные водные кольца.' },
  ], { name: 'Хозяйка глубин', kind: 'boss', level: 17, maxHp: 900, attack: 80, defense: 34, xp: 1150, col: 1500, description: 'Повелительница затопленного храма.' }),

  floor(5, 'Город фонарей', 'Ночной город на границе света и тени', [
    { name: 'Теневой разбойник', kind: 'normal', level: 17, maxHp: 320, attack: 65, defense: 25, xp: 340, col: 420, description: 'Нападает из переулков и исчезает.' },
    { name: 'Охотник фонарей', kind: 'normal', level: 18, maxHp: 355, attack: 71, defense: 28, xp: 380, col: 460, description: 'Использует огненные ловушки.' },
    { name: 'Городской культист', kind: 'normal', level: 18, maxHp: 345, attack: 74, defense: 26, xp: 390, col: 475, description: 'Атакует проклятыми цепями.' },
    { name: 'Ночной клинок', kind: 'elite', level: 19, maxHp: 430, attack: 82, defense: 31, xp: 490, col: 610, description: 'Опытный убийца с двойными клинками.' },
    { name: 'Страж алых ворот', kind: 'elite', level: 19, maxHp: 470, attack: 78, defense: 37, xp: 510, col: 640, description: 'Тяжёлый городской страж.' },
  ], [
    { name: 'Палач фонарей', kind: 'miniboss', level: 20, maxHp: 760, attack: 98, defense: 39, xp: 920, col: 1150, description: 'Мини-босс центральной площади.' },
    { name: 'Теневая жрица', kind: 'miniboss', level: 20, maxHp: 700, attack: 105, defense: 35, xp: 950, col: 1200, description: 'Призывает тени павших.' },
  ], { name: 'Алый дуэлянт', kind: 'boss', level: 21, maxHp: 1250, attack: 120, defense: 45, xp: 1750, col: 2400, description: 'Непобеждённый чемпион города фонарей.' }),
];

export const INITIAL_PLAYER: PlayerState = {
  level: 1, xp: 0, hp: 100, maxHp: 100, stamina: 100, maxStamina: 100,
  power: 14, defense: 3, critChance: 0.08, col: 0, crowns: 0,
  highestFloor: 1, selectedFloor: 1, floorWins: { 1: 0 }, floorCycles: { 1: 0 }, defeatedBosses: [], totalKills: 0,
  weaponDurability: 40, maxWeaponDurability: 40,
  armorDurability: 55, maxArmorDurability: 55,
  potions: 1, inventory: [], equippedWeapon: null, equippedArmor: null,
};

export function xpRequired(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.35));
}

export function createEnemy(floorId: number, wins: number, cycle = 0): Enemy {
  const currentFloor = FLOORS.find((item) => item.id === floorId) ?? FLOORS[0];
  const wave = wins + 1;
  const useBoss = wins >= currentFloor.encountersToBoss;
  const useMiniboss = !useBoss && wins === currentFloor.minibossAt;
  let template: EnemyTemplate;
  if (useBoss) template = currentFloor.boss;
  else if (useMiniboss) template = currentFloor.minibosses[cycle % currentFloor.minibosses.length];
  else {
    const pool = currentFloor.enemies;
    const index = (wins + cycle * 3 + Math.floor(Math.random() * pool.length)) % pool.length;
    template = pool[index];
  }

  const endlessScale = 1 + cycle * 0.28;
  const waveScale = 1 + Math.max(0, wins - 1) * 0.025;
  const hp = Math.floor(template.maxHp * endlessScale * waveScale);
  return {
    ...template,
    id: `${floorId}-${cycle}-${wins}-${Date.now()}-${Math.random()}`,
    level: template.level + cycle * 2,
    maxHp: hp,
    hp,
    attack: Math.floor(template.attack * (1 + cycle * 0.2) * waveScale),
    defense: Math.floor(template.defense * (1 + cycle * 0.16)),
    xp: Math.floor(template.xp * (1 + cycle * 0.22)),
    col: Math.floor(template.col * (1 + cycle * 0.25)),
    wave,
    cycle,
  };
}

export function getItem(id: string | null): ShopItem | undefined {
  return id ? SHOP_ITEMS.find((item) => item.id === id) : undefined;
}

export function totalPower(player: PlayerState): number {
  return player.power + (getItem(player.equippedWeapon)?.powerBonus ?? 0);
}

export function totalDefense(player: PlayerState): number {
  return player.defense + (getItem(player.equippedArmor)?.defenseBonus ?? 0);
}

export function applyExperience(player: PlayerState, gainedXp: number): { player: PlayerState; levelsGained: number } {
  const next = { ...player, xp: player.xp + gainedXp };
  let levelsGained = 0;
  while (next.xp >= xpRequired(next.level)) {
    next.xp -= xpRequired(next.level);
    next.level += 1;
    next.maxHp += 14;
    next.maxStamina += 5;
    next.power += 4;
    next.defense += 2;
    next.hp = next.maxHp;
    next.stamina = next.maxStamina;
    levelsGained += 1;
  }
  return { player: next, levelsGained };
}

export function calculatePlayerDamage(player: PlayerState, enemy: Enemy, skillMultiplier = 1): { damage: number; critical: boolean } {
  const critical = Math.random() < player.critChance;
  const variance = 0.9 + Math.random() * 0.22;
  const brokenPenalty = player.weaponDurability <= 0 ? 0.55 : 1;
  const raw = totalPower(player) * skillMultiplier * variance * brokenPenalty * (critical ? 1.65 : 1);
  return { damage: Math.max(1, Math.floor(raw - enemy.defense)), critical };
}

export function calculateEnemyDamage(player: PlayerState, enemy: Enemy): number {
  const rage = (enemy.kind === 'boss' || enemy.kind === 'miniboss') && enemy.hp <= enemy.maxHp * 0.35 ? 1.45 : 1;
  const variance = 0.88 + Math.random() * 0.24;
  const armorValue = player.armorDurability <= 0 ? 0 : totalDefense(player);
  return Math.max(1, Math.floor(enemy.attack * rage * variance - armorValue));
}

export function repairCost(player: PlayerState): number {
  return Math.max(0, Math.ceil(((player.maxWeaponDurability - player.weaponDurability) + (player.maxArmorDurability - player.armorDurability)) * 1.2));
}

export function tavernRestCost(player: PlayerState): number {
  return Math.max(0, Math.ceil(((player.maxHp - player.hp) + (player.maxStamina - player.stamina)) * 0.12));
}

function migratePlayer(value: Partial<PlayerState> | undefined): PlayerState {
  return {
    ...INITIAL_PLAYER,
    ...(value ?? {}),
    floorWins: { ...INITIAL_PLAYER.floorWins, ...(value?.floorWins ?? {}) },
    floorCycles: { ...INITIAL_PLAYER.floorCycles, ...(value?.floorCycles ?? {}) },
    defeatedBosses: value?.defeatedBosses ?? [],
    totalKills: value?.totalKills ?? 0,
    inventory: value?.inventory ?? [],
    equippedWeapon: value?.equippedWeapon ?? null,
    equippedArmor: value?.equippedArmor ?? null,
  };
}

export function loadGame(): SavedGame {
  try {
    const raw = localStorage.getItem('aether-tower-save-v1');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SavedGame>;
      const player = migratePlayer(parsed.player);
      const wins = player.floorWins[player.selectedFloor] ?? 0;
      const cycle = player.floorCycles[player.selectedFloor] ?? 0;
      const enemy = parsed.enemy && parsed.enemy.hp > 0 ? { ...parsed.enemy, wave: parsed.enemy.wave ?? wins + 1, cycle: parsed.enemy.cycle ?? cycle } : createEnemy(player.selectedFloor, wins, cycle);
      return { player, enemy, log: parsed.log ?? 'Продолжай бесконечный поход.', battleWon: false, gameOver: parsed.gameOver ?? false };
    }
  } catch {
    // Ignore corrupted local saves.
  }
  const enemy = createEnemy(1, 0, 0);
  return { player: INITIAL_PLAYER, enemy, log: 'Первый враг заметил тебя. Проведи пальцем по экрану, чтобы атаковать.', battleWon: false, gameOver: false };
}

export function saveGame(game: SavedGame): void {
  localStorage.setItem('aether-tower-save-v1', JSON.stringify(game));
}
