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
    power: int = 25
    crowns: int = 2500
    col: int = 1000
    floor: int = 1
    equipment: list[EquipmentItem] = field(default_factory=list)


@dataclass(slots=True)
class ExpeditionEvent:
    id: str
    type: EventType
    title: str
    description: str
    options: list[str]
    enemy_power: int | None = None
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
