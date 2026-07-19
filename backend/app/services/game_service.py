from __future__ import annotations

import random

from fastapi import HTTPException, status

from app.domain.game import FLOORS, EventType, Expedition, ExpeditionEvent, Gender, Player, new_id


class GameService:
    def __init__(self) -> None:
        self.players: dict[str, Player] = {}
        self.players_by_telegram: dict[int, str] = {}
        self.expeditions: dict[str, Expedition] = {}

    def list_floors(self):
        return FLOORS

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
        if floor < 1 or floor > len(FLOORS):
            raise HTTPException(status_code=400, detail="Floor is not available yet")
        if player.stamina < 10:
            raise HTTPException(status_code=400, detail="Not enough stamina")

        player.stamina -= 10
        expedition = Expedition(id=new_id(), player_id=player_id, floor=floor)
        expedition.current_event = self._first_event(floor) if floor == 1 else self._generate_event(player, floor)
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

        outcome, message, event_finished = self._apply_action(player, event, action)

        if player.hp <= 0 or player.life_force <= 0:
            expedition.active = False
            expedition.current_event = None
            return "defeat", "Герой потерпел поражение и вернулся в город.", player, expedition

        if not event_finished:
            return outcome, message, player, expedition

        expedition.step += 1
        if expedition.step >= 5:
            expedition.active = False
            expedition.current_event = None
            player.floor = max(player.floor, min(len(FLOORS), expedition.floor + 1))
            return "completed", message + " Поход завершён, следующий этаж открыт.", player, expedition

        expedition.current_event = self._generate_event(player, expedition.floor)
        return outcome, message, player, expedition

    @staticmethod
    def _first_event(floor: int) -> ExpeditionEvent:
        return ExpeditionEvent(
            id=new_id(),
            type=EventType.ENEMY,
            title="Первый противник",
            description="На тропе появился Дикий кабан. Победи его, чтобы продолжить путь по первому этажу.",
            options=["attack", "run"],
            enemy_name="Дикий кабан",
            enemy_power=8,
            enemy_hp=30,
            enemy_max_hp=30,
            reward_col=25,
            reward_experience=20,
        )

    def _generate_event(self, player: Player, floor: int) -> ExpeditionEvent:
        event_type = random.choices(
            population=[EventType.ENEMY, EventType.TREASURE, EventType.PLAYER, EventType.SHRINE],
            weights=[55, 20, 15, 10],
            k=1,
        )[0]

        floor_data = FLOORS[floor - 1]
        if event_type is EventType.ENEMY:
            enemy_power = max(6, floor_data.recommended_power + random.randint(-3, 5))
            enemy_hp = 24 + floor * 10 + random.randint(0, 12)
            enemy_name = random.choice(floor_data.enemy_names)
            return ExpeditionEvent(
                id=new_id(),
                type=event_type,
                title="Враг на пути",
                description=f"{enemy_name} преградил дорогу на {floor}-м этаже.",
                options=["attack", "run"],
                enemy_name=enemy_name,
                enemy_power=enemy_power,
                enemy_hp=enemy_hp,
                enemy_max_hp=enemy_hp,
                reward_col=20 + floor * 15,
                reward_experience=15 + floor * 10,
            )
        if event_type is EventType.TREASURE:
            return ExpeditionEvent(
                id=new_id(), type=event_type, title="Старый сундук",
                description="В траве спрятан старый сундук с Коллами и материалами.",
                options=["open", "continue"], reward_col=30 + floor * 20,
                reward_crowns=0, reward_experience=10,
            )
        if event_type is EventType.PLAYER:
            other_power = max(8, player.power + random.randint(-4, 8))
            return ExpeditionEvent(
                id=new_id(), type=event_type, title="Встреча с игроком",
                description=f"Незнакомец силой {other_power} исследует этот этаж.",
                options=["attack", "rob", "run", "pass"], enemy_name="Незнакомый игрок",
                enemy_power=other_power, enemy_hp=40, enemy_max_hp=40,
                reward_col=35 + floor * 15, reward_experience=25,
            )
        return ExpeditionEvent(
            id=new_id(), type=event_type, title="Забытое святилище",
            description="Можно помолиться и немного восстановить HP.",
            options=["pray", "continue"], reward_experience=10,
        )

    def _apply_action(self, player: Player, event: ExpeditionEvent, action: str) -> tuple[str, str, bool]:
        if action in {"continue", "pass"}:
            return "peaceful", "Вы продолжили путь без конфликта.", True
        if action == "run":
            player.stamina = max(0, player.stamina - 5)
            return "escaped", "Вы отступили, потратив 5 стамины.", True
        if action == "pray":
            healed = min(20, player.max_hp - player.hp)
            player.hp += healed
            player.experience += event.reward_experience
            return "blessing", f"Святилище восстановило {healed} HP.", True
        if action == "open":
            player.col += event.reward_col
            player.experience += event.reward_experience
            self._apply_level_up(player)
            return "treasure", f"Получено {event.reward_col} Коллов и {event.reward_experience} опыта.", True

        enemy_power = event.enemy_power or player.power
        enemy_hp = event.enemy_hp or 1
        player_damage = max(4, player.power + random.randint(-2, 4))
        if action == "rob":
            player_damage = max(2, int(player_damage * 0.75))

        event.enemy_hp = max(0, enemy_hp - player_damage)
        if event.enemy_hp == 0:
            reward = event.reward_col if action == "attack" else max(1, event.reward_col // 2)
            player.col += reward
            player.experience += event.reward_experience
            self._apply_level_up(player)
            return "victory", f"{event.enemy_name or 'Противник'} побеждён. Получено {reward} Коллов и {event.reward_experience} опыта.", True

        enemy_damage = max(3, enemy_power + random.randint(-3, 3) - max(0, player.level - 1))
        player.hp = max(0, player.hp - enemy_damage)
        player.life_force = max(0, player.life_force - max(1, enemy_damage // 5))
        return (
            "combat",
            f"Вы нанесли {player_damage} урона. {event.enemy_name or 'Противник'} ответил и нанёс {enemy_damage} урона. У врага осталось {event.enemy_hp}/{event.enemy_max_hp} HP.",
            False,
        )

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
