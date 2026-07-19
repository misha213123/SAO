from __future__ import annotations

import random

from fastapi import HTTPException, status

from app.domain.game import EventType, Expedition, ExpeditionEvent, Gender, Player, new_id


class GameService:
    def __init__(self) -> None:
        self.players: dict[str, Player] = {}
        self.players_by_telegram: dict[int, str] = {}
        self.expeditions: dict[str, Expedition] = {}

    def create_player(self, telegram_id: int, name: str, gender: Gender) -> Player:
        existing_id = self.players_by_telegram.get(telegram_id)
        if existing_id:
            return self.players[existing_id]

        player = Player(id=new_id(), telegram_id=telegram_id, name=name, gender=gender)
        self.players[player.id] = player
        self.players_by_telegram[telegram_id] = player.id
        return player

    def get_player(self, player_id: str) -> Player:
        player = self.players.get(player_id)
        if player is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
        return player

    def start_expedition(self, player_id: str, floor: int) -> Expedition:
        player = self.get_player(player_id)
        if floor > player.floor:
            raise HTTPException(status_code=400, detail="Floor is not unlocked")
        if player.stamina < 10:
            raise HTTPException(status_code=400, detail="Not enough stamina")

        player.stamina -= 10
        expedition = Expedition(id=new_id(), player_id=player_id, floor=floor)
        expedition.current_event = self._generate_event(player, floor)
        self.expeditions[expedition.id] = expedition
        return expedition

    def get_expedition(self, expedition_id: str) -> Expedition:
        expedition = self.expeditions.get(expedition_id)
        if expedition is None:
            raise HTTPException(status_code=404, detail="Expedition not found")
        return expedition

    def resolve_event(self, expedition_id: str, player_id: str, action: str) -> tuple[str, str, Player, Expedition]:
        expedition = self.get_expedition(expedition_id)
        player = self.get_player(player_id)
        if expedition.player_id != player_id:
            raise HTTPException(status_code=403, detail="This expedition belongs to another player")
        if not expedition.active or expedition.current_event is None:
            raise HTTPException(status_code=400, detail="Expedition is already finished")

        event = expedition.current_event
        if action not in event.options:
            raise HTTPException(status_code=400, detail=f"Action '{action}' is not available")

        outcome, message = self._apply_action(player, event, action)
        expedition.step += 1

        if not expedition.active:
            expedition.current_event = None
        elif player.hp <= 0 or player.life_force <= 0:
            expedition.active = False
            expedition.current_event = None
            outcome = "defeat"
            message = "Герой потерпел поражение и вернулся в город."
        elif expedition.step >= 5:
            expedition.active = False
            expedition.current_event = None
            player.floor = max(player.floor, min(100, expedition.floor + 1))
            outcome = "completed"
            message += " Поход завершён, следующий этаж открыт."
        else:
            expedition.current_event = self._generate_event(player, expedition.floor)

        return outcome, message, player, expedition

    def _generate_event(self, player: Player, floor: int) -> ExpeditionEvent:
        event_type = random.choices(
            population=[EventType.ENEMY, EventType.TREASURE, EventType.PLAYER, EventType.SHRINE],
            weights=[45, 25, 20, 10],
            k=1,
        )[0]

        if event_type is EventType.ENEMY:
            enemy_power = 18 + floor * 7 + random.randint(-4, 8)
            return ExpeditionEvent(
                id=new_id(), type=event_type, title="Засада на тропе",
                description=f"Противник {floor}-го этажа преградил путь.",
                options=["attack", "run"], enemy_power=enemy_power,
                reward_col=80 + floor * 25, reward_experience=35 + floor * 15,
            )
        if event_type is EventType.TREASURE:
            return ExpeditionEvent(
                id=new_id(), type=event_type, title="Сокровищница",
                description="За древней дверью лежат Коллы и редкие материалы.",
                options=["open", "continue"], reward_col=180 + floor * 45,
                reward_crowns=5 if random.random() < 0.2 else 0, reward_experience=20,
            )
        if event_type is EventType.PLAYER:
            other_power = max(10, player.power + random.randint(-12, 25))
            return ExpeditionEvent(
                id=new_id(), type=event_type, title="Встреча с игроком",
                description=f"Незнакомец силой {other_power} тоже исследует этот этаж.",
                options=["attack", "rob", "run", "pass"], enemy_power=other_power,
                reward_col=120 + floor * 30, reward_experience=45,
            )
        return ExpeditionEvent(
            id=new_id(), type=event_type, title="Забытое святилище",
            description="Можно помолиться и получить временное благословение.",
            options=["pray", "continue"], reward_experience=30,
        )

    def _apply_action(self, player: Player, event: ExpeditionEvent, action: str) -> tuple[str, str]:
        if action in {"continue", "pass"}:
            return "peaceful", "Вы продолжили путь без конфликта."
        if action == "run":
            player.stamina = max(0, player.stamina - 5)
            return "escaped", "Вы отступили, потратив дополнительную стамину."
        if action == "pray":
            healed = min(20, player.max_hp - player.hp)
            player.hp += healed
            player.experience += event.reward_experience
            return "blessing", f"Святилище восстановило {healed} HP и даровало опыт."
        if action == "open":
            player.col += event.reward_col
            player.crowns += event.reward_crowns
            player.experience += event.reward_experience
            return "treasure", f"Получено {event.reward_col} Коллов и {event.reward_experience} опыта."

        enemy_power = event.enemy_power or player.power
        roll = random.uniform(0.8, 1.2)
        player_score = player.power * roll
        if action == "rob":
            player_score *= 0.82

        if player_score >= enemy_power:
            reward = event.reward_col if action == "attack" else max(1, event.reward_col // 2)
            player.col += reward
            player.experience += event.reward_experience
            self._apply_level_up(player)
            return "victory", f"Победа. Получено {reward} Коллов и {event.reward_experience} опыта."

        damage = max(8, int((enemy_power - player.power) * 1.5) + random.randint(5, 18))
        player.hp = max(0, player.hp - damage)
        player.life_force = max(0, player.life_force - max(1, damage // 4))
        return "loss", f"Неудача. Потеряно {damage} HP."

    @staticmethod
    def _apply_level_up(player: Player) -> None:
        while player.experience >= player.level * 100:
            player.experience -= player.level * 100
            player.level += 1
            player.max_hp += 12
            player.hp = player.max_hp
            player.max_stamina += 5
            player.stamina = player.max_stamina
            player.power += 4


game_service = GameService()
