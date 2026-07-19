export type EnemyKind = 'normal' | 'elite' | 'boss';
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
};

export type FloorDefinition = {
  id: number;
  name: string;
  subtitle: string;
  bossName: string;
  encountersToBoss: number;
  enemies: Omit<Enemy, 'id' | 'hp'>[];
  boss: Omit<Enemy, 'id' | 'hp'>;
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
  defeatedBosses: number[];
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

export const FLOORS: FloorDefinition[] = [
  {
    id: 1, name: 'Луга Начала', subtitle: 'Зелёные равнины у подножия башни', bossName: 'Вожак клыков', encountersToBoss: 4,
    enemies: [
      { name: 'Дикий кабан', kind: 'normal', level: 1, maxHp: 34, attack: 7, defense: 1, xp: 22, col: 25, description: 'Агрессивный зверь, защищающий пастбища.' },
      { name: 'Луговой волк', kind: 'normal', level: 2, maxHp: 42, attack: 9, defense: 2, xp: 28, col: 32, description: 'Быстрый хищник, атакующий сериями.' },
      { name: 'Клыкастый вепрь', kind: 'elite', level: 3, maxHp: 58, attack: 12, defense: 3, xp: 45, col: 55, description: 'Элитный зверь с усиленной шкурой.' },
      { name: 'Кабан-разоритель', kind: 'elite', level: 3, maxHp: 66, attack: 13, defense: 4, xp: 52, col: 64, description: 'Старый зверь, переживший десятки охот.' },
    ],
    boss: { name: 'Вожак клыков', kind: 'boss', level: 4, maxHp: 118, attack: 16, defense: 4, xp: 130, col: 170, description: 'Хозяин первого этажа. В ярости наносит больше урона.' },
  },
  {
    id: 2, name: 'Туманный лес', subtitle: 'Лес, где враги скрываются в густом тумане', bossName: 'Серый хищник', encountersToBoss: 5,
    enemies: [
      { name: 'Туманный волк', kind: 'normal', level: 5, maxHp: 76, attack: 16, defense: 5, xp: 65, col: 78, description: 'Появляется из тумана и быстро отступает.' },
      { name: 'Ядовитая паучиха', kind: 'normal', level: 6, maxHp: 68, attack: 18, defense: 4, xp: 72, col: 84, description: 'Её укусы ослабляют защиту.' },
      { name: 'Лесной страж', kind: 'elite', level: 7, maxHp: 105, attack: 21, defense: 7, xp: 105, col: 125, description: 'Древнее существо с крепкой корой.' },
    ],
    boss: { name: 'Серый хищник', kind: 'boss', level: 8, maxHp: 190, attack: 26, defense: 8, xp: 250, col: 320, description: 'Огромный волк, повелевающий туманом.' },
  },
  {
    id: 3, name: 'Каменный каньон', subtitle: 'Расколотые скалы и древние шахты', bossName: 'Каменный страж', encountersToBoss: 5,
    enemies: [
      { name: 'Пещерный гоблин', kind: 'normal', level: 9, maxHp: 125, attack: 28, defense: 9, xp: 120, col: 145, description: 'Вооружён ржавым клинком и ловушками.' },
      { name: 'Каменный жук', kind: 'normal', level: 10, maxHp: 145, attack: 27, defense: 13, xp: 135, col: 155, description: 'Медленный, но хорошо защищённый враг.' },
      { name: 'Малый голем', kind: 'elite', level: 11, maxHp: 195, attack: 34, defense: 16, xp: 190, col: 230, description: 'Ожившая каменная конструкция.' },
    ],
    boss: { name: 'Каменный страж', kind: 'boss', level: 12, maxHp: 330, attack: 42, defense: 18, xp: 430, col: 560, description: 'Страж древних ворот каньона.' },
  },
  {
    id: 4, name: 'Озёрный край', subtitle: 'Затопленные руины под холодным небом', bossName: 'Хозяйка глубин', encountersToBoss: 6,
    enemies: [
      { name: 'Водный дух', kind: 'normal', level: 13, maxHp: 210, attack: 43, defense: 17, xp: 210, col: 260, description: 'Меняет форму и избегает прямых ударов.' },
      { name: 'Озёрный страж', kind: 'normal', level: 14, maxHp: 235, attack: 47, defense: 20, xp: 235, col: 285, description: 'Защищает руины под водой.' },
      { name: 'Сирена руин', kind: 'elite', level: 15, maxHp: 290, attack: 54, defense: 21, xp: 310, col: 380, description: 'Её голос сбивает ритм атак.' },
    ],
    boss: { name: 'Хозяйка глубин', kind: 'boss', level: 16, maxHp: 480, attack: 62, defense: 25, xp: 690, col: 900, description: 'Повелительница затопленного храма.' },
  },
  {
    id: 5, name: 'Город фонарей', subtitle: 'Ночной город на границе света и тени', bossName: 'Алый дуэлянт', encountersToBoss: 6,
    enemies: [
      { name: 'Теневой разбойник', kind: 'normal', level: 17, maxHp: 320, attack: 65, defense: 25, xp: 340, col: 420, description: 'Нападает из переулков и исчезает.' },
      { name: 'Охотник фонарей', kind: 'normal', level: 18, maxHp: 355, attack: 71, defense: 28, xp: 380, col: 460, description: 'Использует огненные ловушки.' },
      { name: 'Ночной клинок', kind: 'elite', level: 19, maxHp: 430, attack: 82, defense: 31, xp: 490, col: 610, description: 'Опытный убийца с двойными клинками.' },
    ],
    boss: { name: 'Алый дуэлянт', kind: 'boss', level: 20, maxHp: 720, attack: 94, defense: 36, xp: 1050, col: 1450, description: 'Непобеждённый чемпион города фонарей.' },
  },
];

export const INITIAL_PLAYER: PlayerState = {
  level: 1, xp: 0, hp: 100, maxHp: 100, stamina: 100, maxStamina: 100,
  power: 14, defense: 3, critChance: 0.08, col: 0, crowns: 0,
  highestFloor: 1, selectedFloor: 1, floorWins: { 1: 0 }, defeatedBosses: [],
  weaponDurability: 40, maxWeaponDurability: 40,
  armorDurability: 55, maxArmorDurability: 55,
  potions: 1, inventory: [], equippedWeapon: null, equippedArmor: null,
};

export function xpRequired(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.35));
}

export function createEnemy(floorId: number, wins: number): Enemy {
  const floor = FLOORS.find((item) => item.id === floorId) ?? FLOORS[0];
  const useBoss = wins >= floor.encountersToBoss;
  const template = useBoss ? floor.boss : floor.enemies[wins % floor.enemies.length];
  return { ...template, id: `${floorId}-${wins}-${Date.now()}`, hp: template.maxHp };
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
  const bossRage = enemy.kind === 'boss' && enemy.hp <= enemy.maxHp * 0.35 ? 1.45 : 1;
  const variance = 0.88 + Math.random() * 0.24;
  const armorValue = player.armorDurability <= 0 ? 0 : totalDefense(player);
  return Math.max(1, Math.floor(enemy.attack * bossRage * variance - armorValue));
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
    defeatedBosses: value?.defeatedBosses ?? [],
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
      return {
        player,
        enemy: parsed.enemy ?? createEnemy(player.selectedFloor, player.floorWins[player.selectedFloor] ?? 0),
        log: parsed.log ?? 'Продолжай восхождение.',
        battleWon: parsed.battleWon ?? false,
        gameOver: parsed.gameOver ?? false,
      };
    }
  } catch {
    // Ignore corrupted local saves.
  }
  const enemy = createEnemy(1, 0);
  return { player: INITIAL_PLAYER, enemy, log: 'Первый враг заметил тебя. Проведи пальцем по экрану, чтобы атаковать.', battleWon: false, gameOver: false };
}

export function saveGame(game: SavedGame): void {
  localStorage.setItem('aether-tower-save-v1', JSON.stringify(game));
}
