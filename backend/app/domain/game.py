from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from uuid import uuid4


class Gender(StrEnum):
    MALE = "male"
    FEMALE = "female"


class EventType(StrEnum):
    ENEMY = "enemy"
    TREASURE = "treasure"
    PLAYER = "player"
    SHRINE = "shrine"


@dataclass(frozen=True, slots=True)
class FloorDefinition:
    number: int
    name: str
    description: str
    recommended_power: int
    enemy_names: tuple[str, ...]
    boss_name: str


FLOORS: tuple[FloorDefinition, ...] = (
    FloorDefinition(1, "Луга Начала", "Зелёные поля, старые тропы и слабые звери.", 10, ("Дикий кабан", "Луговой волк", "Рогатый слизень"), "Страж Древних Врат"),
    FloorDefinition(2, "Туманный лес", "Лес с ограниченной видимостью и ядовитыми существами.", 18, ("Туманный волк", "Лесной паук", "Ядовитая лоза"), "Королева Пауков"),
    FloorDefinition(3, "Каменный каньон", "Узкие проходы, обвалы и бронированные враги.", 28, ("Каменный жук", "Пещерный шакал", "Разбойник каньона"), "Гранитный Голем"),
    FloorDefinition(4, "Озёрный край", "Затопленные руины и быстрые водные монстры.", 40, ("Озёрный хищник", "Водяной дух", "Руинный страж"), "Змей Глубин"),
    FloorDefinition(5, "Город Красных Фонарей", "Первый крупный город с опасными ночными улицами.", 55, ("Ночной охотник", "Теневой вор", "Проклятый страж"), "Багровый Дуэлянт"),
)


@dataclass(slots=True)
class EquipmentItem:
    id: str
    name: str
    slot: str
    rarity: str
    stars: int
    durability: int
    max_durability: int
    power: int


@dataclass(slots=True)
class Player:
    id: str
    telegram_id: int
    name: str
    gender: Gender
    level: int = 1
    experience: int = 0
    hp: int = 100
    max_hp: int = 100
    stamina: int = 100
    max_stamina: int = 100
    life_force: int = 100
    max_life_force: int = 100
    power: int = 12
    crowns: int = 0
    col: int = 0
    floor: int = 1
    equipment: list[EquipmentItem] = field(default_factory=list)


@dataclass(slots=True)
class ExpeditionEvent:
    id: str
    type: EventType
    title: str
    description: str
    options: list[str]
    enemy_name: str | None = None
    enemy_power: int | None = None
    enemy_hp: int | None = None
    enemy_max_hp: int | None = None
    reward_col: int = 0
    reward_crowns: int = 0
    reward_experience: int = 0


@dataclass(slots=True)
class Expedition:
    id: str
    player_id: str
    floor: int
    step: int = 0
    active: bool = True
    current_event: ExpeditionEvent | None = None


def new_id() -> str:
    return str(uuid4())
