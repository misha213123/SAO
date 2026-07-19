from fastapi import APIRouter

from app.domain.game import Gender
from app.schemas.game import (
    CreatePlayerRequest,
    EventResolutionResponse,
    ExpeditionResponse,
    PlayerResponse,
    ResolveEventRequest,
    StartExpeditionRequest,
)
from app.services.game_service import game_service

router = APIRouter(prefix="/game", tags=["game"])


def player_response(player) -> PlayerResponse:
    return PlayerResponse.model_validate(player, from_attributes=True)


def expedition_response(expedition) -> ExpeditionResponse:
    return ExpeditionResponse.model_validate(expedition, from_attributes=True)


@router.post("/players", response_model=PlayerResponse)
def create_player(payload: CreatePlayerRequest) -> PlayerResponse:
    player = game_service.create_player(
        telegram_id=payload.telegram_id,
        name=payload.name,
        gender=Gender(payload.gender),
    )
    return player_response(player)


@router.get("/players/{player_id}", response_model=PlayerResponse)
def get_player(player_id: str) -> PlayerResponse:
    return player_response(game_service.get_player(player_id))


@router.post("/expeditions", response_model=ExpeditionResponse)
def start_expedition(payload: StartExpeditionRequest) -> ExpeditionResponse:
    expedition = game_service.start_expedition(payload.player_id, payload.floor)
    return expedition_response(expedition)


@router.get("/expeditions/{expedition_id}", response_model=ExpeditionResponse)
def get_expedition(expedition_id: str) -> ExpeditionResponse:
    return expedition_response(game_service.get_expedition(expedition_id))


@router.post("/expeditions/{expedition_id}/resolve", response_model=EventResolutionResponse)
def resolve_event(expedition_id: str, payload: ResolveEventRequest) -> EventResolutionResponse:
    outcome, message, player, expedition = game_service.resolve_event(
        expedition_id=expedition_id,
        player_id=payload.player_id,
        action=payload.action,
    )
    return EventResolutionResponse(
        outcome=outcome,
        message=message,
        player=player_response(player),
        expedition=expedition_response(expedition),
    )
