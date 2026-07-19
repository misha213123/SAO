from typing import Literal

from pydantic import BaseModel, Field


class CreatePlayerRequest(BaseModel):
    telegram_id: int = Field(gt=0)
    name: str = Field(min_length=2, max_length=32)
    gender: Literal["male", "female"]


class EquipmentItemResponse(BaseModel):
    id: str
    name: str
    slot: str
    rarity: str
    stars: int
    durability: int
    max_durability: int
    power: int


class PlayerResponse(BaseModel):
    id: str
    telegram_id: int
    name: str
    gender: str
    level: int
    experience: int
    hp: int
    max_hp: int
    stamina: int
    max_stamina: int
    life_force: int
    max_life_force: int
    power: int
    crowns: int
    col: int
    floor: int
    equipment: list[EquipmentItemResponse]


class FloorResponse(BaseModel):
    number: int
    name: str
    description: str
    recommended_power: int
    enemy_names: tuple[str, ...]
    boss_name: str


class StartExpeditionRequest(BaseModel):
    player_id: str
    floor: int = Field(ge=1, le=100)


class ResolveEventRequest(BaseModel):
    player_id: str
    action: Literal["attack", "rob", "run", "pass", "open", "pray", "continue"]


class ExpeditionEventResponse(BaseModel):
    id: str
    type: str
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


class ExpeditionResponse(BaseModel):
    id: str
    player_id: str
    floor: int
    step: int
    active: bool
    current_event: ExpeditionEventResponse | None


class EventResolutionResponse(BaseModel):
    outcome: str
    message: str
    player: PlayerResponse
    expedition: ExpeditionResponse
